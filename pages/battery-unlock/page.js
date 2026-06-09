(function initializeBatteryUnlockPage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const usbDeviceType = "TEKNISIHUB_DEVICE_USB";
  const wifiDeviceType = "TEKNISIHUB_DEVICE_WIFI";
  const defaultSampleRateHz = 2000000;
  const maxSampleRateHz = 10000000;
  const minimumMonitorDecodeRateHz = 1000000;
  const sampleRateOptionsHz = [
    100000,
    250000,
    500000,
    1000000,
    2000000,
    4000000,
    8000000,
    maxSampleRateHz
  ];
  const defaultState = {
    activeTab: "monitor",
    deviceType: usbDeviceType,
    busy: false,
    database: null,
    selectedProfileId: "bq40z50",
    selectedActionId: "bq40-unseal",
    isolatedConfirmed: false,
    writeConfirmed: false,
    smbusOperation: "read-word",
    smbusAddress: "0x0B",
    smbusCommand: "0x08",
    smbusDataHex: "",
    smbusReadLength: 2,
    monitorSampleRateHz: defaultSampleRateHz,
    monitorMessage: "Monitor pasif siap.",
    apiMessage: "",
    recoveryMessage: "",
    metrics: {},
    captureInfo: {},
    monitorRunning: false,
    transactions: [],
    busFrames: [],
    rawRows: [],
    smbusResult: null,
    recoveryPreview: null
  };
  const monitorPollDelayMs = 160;
  const monitorMetricKeys = ["temperature", "relativeSoc", "voltage", "current", "averageCurrent", "batteryStatus"];

  const commandLabels = {
    0x00: "Manufacturer Access",
    0x08: "Temperature",
    0x09: "Voltage",
    0x0A: "Current",
    0x0B: "Average Current",
    0x0D: "Relative SOC",
    0x0E: "Absolute SOC",
    0x16: "Battery Status",
    0x20: "Manufacturer Name",
    0x21: "Device Name",
    0x22: "Device Chemistry",
    0x23: "Manufacturer Data",
    0x2F: "Manufacturer Input",
    0x3E: "Manufacturer Block"
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${serviceBaseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
    const rawText = await response.text();
    let payload = {};
    if (rawText) {
      try {
        payload = JSON.parse(rawText);
      } catch {
        payload = { message: rawText };
      }
    }
    if (!response.ok) {
      throw new Error(payload.message || payload.title || `Request gagal (${response.status}).`);
    }
    return payload;
  }

  function formatNumber(value, digits = 0) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return "-";
    }
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(number);
  }

  function parseHexByte(value, fallback = 0) {
    const text = String(value ?? "").trim();
    if (!text) {
      return fallback;
    }
    const normalized = text.startsWith("0x") || text.startsWith("0X") ? text.slice(2) : text;
    const parsed = Number.parseInt(normalized, 16);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 0xFF ? parsed : fallback;
  }

  function signed16(value) {
    const word = value & 0xFFFF;
    return word >= 0x8000 ? word - 0x10000 : word;
  }

  function hex(value, digits = 2) {
    return `0x${Number(value || 0).toString(16).toUpperCase().padStart(digits, "0")}`;
  }

  function byteBits(value) {
    return Number(value || 0).toString(2).padStart(8, "0");
  }

  function delay(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function formatRate(value) {
    const rate = Number(value || 0);
    if (!Number.isFinite(rate) || rate <= 0) {
      return "-";
    }
    if (rate >= 1000000) {
      return `${formatNumber(rate / 1000000, rate % 1000000 === 0 ? 0 : 2)} MHz`;
    }
    if (rate >= 1000) {
      return `${formatNumber(rate / 1000, rate % 1000 === 0 ? 0 : 1)} kHz`;
    }
    return `${formatNumber(rate)} Hz`;
  }

  function normalizeSampleRateHz(value) {
    const rate = Number(value);
    if (!Number.isFinite(rate)) {
      return defaultSampleRateHz;
    }
    return sampleRateOptionsHz.reduce((best, candidate) => (
      Math.abs(candidate - rate) < Math.abs(best - rate) ? candidate : best
    ), sampleRateOptionsHz[0]);
  }

  function normalizeMonitorSampleRateHz(value) {
    const rate = normalizeSampleRateHz(value);
    return rate < minimumMonitorDecodeRateHz ? defaultSampleRateHz : rate;
  }

  function formatMonitorSampleRateOption(rate) {
    return rate < minimumMonitorDecodeRateHz
      ? `${formatRate(rate)} (raw only)`
      : formatRate(rate);
  }

  function normalizePinOrder(value) {
    const text = String(value || "").trim().toLowerCase();
    return text === "normal" || text === "swap" ? text : "unknown";
  }

  function formatPinOrder(info = {}) {
    const order = normalizePinOrder(info.pinOrder);
    if (order === "normal") {
      return info.pinOrderLocked ? "SDA/SCL NORMAL" : "NORMAL CHECK";
    }
    if (order === "swap") {
      return info.pinOrderLocked ? "SDA/SCL SWAP" : "SWAP CHECK";
    }
    return "SDA/SCL DETECT";
  }

  function formatDeviceName(deviceType) {
    return deviceType === wifiDeviceType ? "TEKNISIHUB_DEVICE WIFI" : "TEKNISIHUB_DEVICE USB";
  }

  function createInitialMetrics() {
    return {
      temperature: "-",
      voltage: "-",
      current: "-",
      averageCurrent: "-",
      relativeSoc: "-",
      batteryStatus: "-"
    };
  }

  function hasMetricValue(value) {
    return typeof value === "string" && value.trim() !== "" && value.trim() !== "-";
  }

  function mergeMetrics(target, source) {
    const merged = { ...createInitialMetrics(), ...(target || {}) };
    Object.entries(source || {}).forEach(([key, value]) => {
      if (hasMetricValue(value)) {
        merged[key] = value;
      }
    });
    return merged;
  }

  function hasAnyMetric(metrics) {
    return Object.values(metrics || {}).some(hasMetricValue);
  }

  function summarizeMetrics(metrics) {
    const parts = [];
    if (hasMetricValue(metrics.temperature)) {
      parts.push(`Temp ${metrics.temperature}`);
    }
    if (hasMetricValue(metrics.relativeSoc)) {
      parts.push(`SOC ${metrics.relativeSoc}`);
    }
    if (hasMetricValue(metrics.voltage)) {
      parts.push(`Voltage ${metrics.voltage}`);
    }
    if (hasMetricValue(metrics.current)) {
      parts.push(`Current ${metrics.current}`);
    }
    if (hasMetricValue(metrics.averageCurrent)) {
      parts.push(`Avg ${metrics.averageCurrent}`);
    }
    if (hasMetricValue(metrics.batteryStatus)) {
      parts.push(`Status ${metrics.batteryStatus}`);
    }
    return parts.join(", ");
  }

  function countCompleteMetrics(metrics) {
    return monitorMetricKeys.filter((key) => hasMetricValue(metrics?.[key])).length;
  }

  function formatCompleteCount(metrics) {
    return `${countCompleteMetrics(metrics)}/6 data`;
  }

  function decodeI2cRows(samples, sampleRateHz) {
    const rows = [];
    if (!Array.isArray(samples) || samples.length < 4) {
      return rows;
    }

    const safeRate = Math.max(1, Number(sampleRateHz || 0));
    let previous = Number(samples[0] || 0) & 0x03;
    let collecting = false;
    let bits = [];
    let expectAck = false;
    let lastByte = 0;
    let byteIndex = 0;
    let transactionIndex = 0;

    for (let index = 1; index < samples.length; index += 1) {
      const current = Number(samples[index] || 0) & 0x03;
      const previousSda = previous & 0x01;
      const previousScl = (previous >> 1) & 0x01;
      const sda = current & 0x01;
      const scl = (current >> 1) & 0x01;
      const timeUs = (index / safeRate) * 1000000;

      if (previousSda === 1 && sda === 0 && scl === 1) {
        collecting = true;
        bits = [];
        expectAck = false;
        byteIndex = 0;
        transactionIndex += 1;
        previous = current;
        continue;
      }

      if (previousSda === 0 && sda === 1 && scl === 1) {
        collecting = false;
        bits = [];
        expectAck = false;
        previous = current;
        continue;
      }

      if (collecting && previousScl === 0 && scl === 1) {
        if (expectAck) {
          const ack = sda === 0;
          const isAddress = byteIndex === 0;
          rows.push({
            timeUs,
            type: isAddress ? "ADDR" : "DATA",
            value: isAddress ? (lastByte >> 1) : lastByte,
            rawByte: lastByte,
            rw: isAddress ? ((lastByte & 0x01) ? "R" : "W") : "",
            ack,
            bits: byteBits(lastByte),
            transactionIndex
          });
          byteIndex += 1;
          bits = [];
          expectAck = false;
        } else {
          bits.push(sda);
          if (bits.length === 8) {
            lastByte = bits.reduce((acc, bit) => ((acc << 1) | bit), 0);
            expectAck = true;
          }
        }
      }

      previous = current;
    }

    return rows;
  }

  function decodeSmartBattery(rows) {
    const transactions = [];
    const metrics = createInitialMetrics();
    for (let index = 0; index < rows.length; index += 1) {
      const start = rows[index];
      const command = rows[index + 1];
      const repeated = rows[index + 2];
      if (!start || !command || !repeated) {
        continue;
      }

      if (start.type !== "ADDR" || start.value !== 0x0B || start.rw !== "W" || !start.ack) {
        continue;
      }
      if (command.type !== "DATA" || !command.ack) {
        continue;
      }
      if (repeated.type !== "ADDR" || repeated.value !== 0x0B || repeated.rw !== "R" || !repeated.ack) {
        continue;
      }

      const data = [];
      let cursor = index + 3;
      while (cursor < rows.length && rows[cursor].type === "DATA") {
        data.push(rows[cursor].value);
        if (!rows[cursor].ack) {
          cursor += 1;
          break;
        }
        cursor += 1;
      }

      if (data.length === 0) {
        continue;
      }

      const cmd = command.value;
      const word = data.length >= 2 ? (data[0] | (data[1] << 8)) : data[0];
      const label = commandLabels[cmd] || `Command ${hex(cmd)}`;
      let decoded = data.map((item) => hex(item)).join(" ");
      if (cmd === 0x08 && data.length >= 2) {
        decoded = `${formatNumber(word / 10 - 273.15, 2)} C`;
        metrics.temperature = decoded;
      } else if (cmd === 0x09 && data.length >= 2) {
        decoded = `${formatNumber(word)} mV`;
        metrics.voltage = decoded;
      } else if (cmd === 0x0A && data.length >= 2) {
        decoded = `${formatNumber(signed16(word))} mA`;
        metrics.current = decoded;
      } else if (cmd === 0x0B && data.length >= 2) {
        decoded = `${formatNumber(signed16(word))} mA`;
        metrics.averageCurrent = decoded;
      } else if (cmd === 0x0D || cmd === 0x0E) {
        decoded = `${formatNumber(word)} %`;
        if (cmd === 0x0D) {
          metrics.relativeSoc = decoded;
        }
      } else if (cmd === 0x16 && data.length >= 2) {
        decoded = `0x${word.toString(16).toUpperCase().padStart(4, "0")}`;
        metrics.batteryStatus = decoded;
      }

      transactions.push({
        timeUs: start.timeUs,
        command: cmd,
        label,
        data,
        decoded
      });
    }
    return { metrics, transactions };
  }

  function smbusAddressLabel(address) {
    if (address === 0x0B) {
      return "Smart Battery";
    }
    if (address === 0x09) {
      return "Smart Charger";
    }
    return "SMBus Device";
  }

  function decodeSmbusFrames(rows) {
    const frames = [];
    let current = null;
    const pushCurrent = () => {
      if (!current) {
        return;
      }
      const word = current.data.length >= 2
        ? (current.data[0] | (current.data[1] << 8))
        : null;
      let note = `${smbusAddressLabel(current.address)} ${current.rw}`;
      if (current.address === 0x09 && current.rw === "R") {
        note = "Charger read; command tidak ikut tertangkap";
      } else if (current.address === 0x0B && current.rw === "R") {
        note = "Battery read; tunggu command 0x0B W";
      } else if (current.address === 0x0B && current.rw === "W") {
        note = "Battery command";
      }
      frames.push({
        timeUs: current.timeUs,
        captureIndex: current.captureIndex,
        address: current.address,
        rw: current.rw,
        data: current.data,
        word,
        note
      });
      current = null;
    };

    rows.forEach((row) => {
      if (row.type === "ADDR") {
        pushCurrent();
        current = {
          timeUs: row.timeUs,
          captureIndex: row.captureIndex || 1,
          address: row.value,
          rw: row.rw,
          data: []
        };
        return;
      }
      if (row.type === "DATA" && current) {
        current.data.push(row.value);
      }
    });
    pushCurrent();
    return frames;
  }

  function renderTabs(state) {
    return `
      <div class="battery-tabs" role="tablist">
        ${["monitor", "smbus", "recovery"].map((tab) => `
          <button type="button" class="${state.activeTab === tab ? "is-active" : ""}" data-battery-tab="${tab}">
            <span class="material-symbols-outlined">${tab === "monitor" ? "monitor_heart" : tab === "smbus" ? "swap_horiz" : "lock_open"}</span>
            <span>${tab === "monitor" ? "Monitor" : tab === "smbus" ? "SMBus" : "Recovery"}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderDeviceSelect(state, disabled) {
    return `
      <label>
        Koneksi
        <select id="batteryDeviceType"${disabled ? " disabled" : ""}>
          <option value="${usbDeviceType}"${state.deviceType === usbDeviceType ? " selected" : ""}>TEKNISIHUB_DEVICE USB</option>
          <option value="${wifiDeviceType}"${state.deviceType === wifiDeviceType ? " selected" : ""}>TEKNISIHUB_DEVICE WIFI</option>
        </select>
      </label>
    `;
  }

  function renderMonitor(state) {
    const monitorRunning = Boolean(state.monitorRunning);
    const controlsBusy = state.busy || monitorRunning;
    const buttonDisabled = state.busy && !monitorRunning;
    const metrics = { ...createInitialMetrics(), ...state.metrics };
    const captureInfo = {
      deviceName: formatDeviceName(state.deviceType),
      pinOrder: "unknown",
      pinOrderLocked: false,
      rowCount: state.rawRows.length,
      sampleRateHz: normalizeMonitorSampleRateHz(state.monitorSampleRateHz),
      ...state.captureInfo
    };
    const selectedSampleRateHz = normalizeMonitorSampleRateHz(state.monitorSampleRateHz);
    const sampleRateOptions = sampleRateOptionsHz.map((rate) => `
      <option value="${rate}"${selectedSampleRateHz === rate ? " selected" : ""}${rate < minimumMonitorDecodeRateHz ? " disabled" : ""}>${escapeHtml(formatMonitorSampleRateOption(rate))}</option>
    `).join("");
    const batteryFrameCount = state.busFrames.filter((frame) => frame.address === 0x0B).length;
    const metricItems = [
      ["device_thermostat", "Temp", metrics.temperature],
      ["battery_charging_full", "SOC", metrics.relativeSoc],
      ["bolt", "Voltage", metrics.voltage],
      ["electric_meter", "Current", metrics.current],
      ["speed", "Avg Current", metrics.averageCurrent],
      ["fact_check", "Status", metrics.batteryStatus]
    ];

    return `
      <section class="spi-card battery-panel-main battery-monitor-panel">
        <div class="spi-card-head">
          <div>
            <p class="label">Passive SMBus</p>
            <h4>Battery Monitor</h4>
          </div>
          <button id="batteryMonitorCaptureButton" type="button" class="ghost"${buttonDisabled ? " disabled" : ""}>
            <span class="material-symbols-outlined">${monitorRunning ? "stop_circle" : "sensors"}</span>
            <span>${monitorRunning ? "Stop" : "Start Monitor"}</span>
          </button>
        </div>
        <div class="spi-form-grid">
          ${renderDeviceSelect(state, controlsBusy)}
          <label>
            Sample Rate
            <select id="batteryMonitorSampleRate"${controlsBusy ? " disabled" : ""}>
              ${sampleRateOptions}
            </select>
          </label>
          <label>
            Mode
            <input type="text" value="Continuous" readonly>
          </label>
          <label>
            Target
            <input type="text" value="0x0B Smart Battery" readonly>
          </label>
        </div>
        <div class="battery-detect-grid">
          <div class="battery-detect-item">
            <small>Device</small>
            <strong>${escapeHtml(captureInfo.deviceName || formatDeviceName(state.deviceType))}</strong>
            <span>${escapeHtml(captureInfo.identity || "Waiting capture")}</span>
          </div>
          <div class="battery-detect-item">
            <small>SDA/SCL</small>
            <strong>${escapeHtml(formatPinOrder(captureInfo))}</strong>
            <span>${escapeHtml(captureInfo.pinOrderLocked ? "Locked by LA decode" : "Auto detect from traffic")}</span>
          </div>
          <div class="battery-detect-item">
            <small>Capture</small>
            <strong>${escapeHtml(`${formatNumber(captureInfo.rowCount || 0)} row I2C`)}</strong>
            <span>${escapeHtml(`${formatNumber(captureInfo.sampleCount || 0)} samples @ ${formatRate(captureInfo.sampleRateHz)}${captureInfo.attempt ? `, try ${captureInfo.attempt}` : ""}`)}</span>
          </div>
          <div class="battery-detect-item">
            <small>Data</small>
            <strong>${escapeHtml(formatCompleteCount(metrics))}</strong>
            <span>${escapeHtml(countCompleteMetrics(metrics) >= 6 ? "Lengkap, stop manual jika cukup" : `${state.busFrames.length} frame valid, ${batteryFrameCount} battery`)}</span>
          </div>
        </div>
        <div class="battery-metric-grid">
          ${metricItems.map(([icon, label, value]) => `
            <div class="battery-metric">
              <span class="material-symbols-outlined">${icon}</span>
              <small>${escapeHtml(label)}</small>
              <strong>${escapeHtml(value)}</strong>
            </div>
          `).join("")}
        </div>
        <p class="spi-note">${escapeHtml(state.monitorMessage)}</p>
      </section>

      <section class="spi-card battery-table-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Decoded</p>
            <h4>Transaksi terakhir</h4>
          </div>
          <span class="spi-mini-badge">${state.transactions.length} item</span>
        </div>
        <div class="battery-table-wrap">
          <table class="battery-table">
            <thead>
              <tr><th>Time</th><th>Command</th><th>Data</th><th>Decode</th></tr>
            </thead>
            <tbody>
              ${state.transactions.slice(0, 12).map((item) => `
                <tr>
                  <td>C${formatNumber(item.captureIndex || 1)} - ${formatNumber(item.timeUs, 1)} us</td>
                  <td>${escapeHtml(item.label)} <span>${hex(item.command)}</span></td>
                  <td>${escapeHtml(item.data.map((byte) => hex(byte)).join(" "))}</td>
                  <td>${escapeHtml(item.decoded)}</td>
                </tr>
              `).join("") || `<tr><td colspan="4">Belum ada transaksi baterai.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>

      <section class="spi-card battery-table-card">
        <div class="spi-card-head">
          <div>
            <p class="label">SMBus Traffic</p>
            <h4>Frame lain yang tertangkap</h4>
          </div>
          <span class="spi-mini-badge">${state.busFrames.length} frame</span>
        </div>
        <div class="battery-table-wrap">
          <table class="battery-table">
            <thead>
              <tr><th>Time</th><th>Address</th><th>Data</th><th>Word LE</th><th>Note</th></tr>
            </thead>
            <tbody>
              ${state.busFrames.slice(-16).map((frame) => `
                <tr>
                  <td>C${formatNumber(frame.captureIndex || 1)} - ${formatNumber(frame.timeUs, 1)} us</td>
                  <td>${hex(frame.address)} ${escapeHtml(frame.rw)} <span>${escapeHtml(smbusAddressLabel(frame.address))}</span></td>
                  <td>${escapeHtml(frame.data.length ? frame.data.map((byte) => hex(byte)).join(" ") : "-")}</td>
                  <td>${escapeHtml(frame.word === null ? "-" : hex(frame.word, 4))}</td>
                  <td>${escapeHtml(frame.note)}</td>
                </tr>
              `).join("") || `<tr><td colspan="5">Belum ada frame SMBus valid.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>

      <section class="spi-card battery-table-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Raw I2C</p>
            <h4>ADDR / DATA preview</h4>
          </div>
          <span class="spi-mini-badge">${state.rawRows.length} row</span>
        </div>
        <div class="battery-table-wrap">
          <table class="battery-table">
            <thead>
              <tr><th>Time</th><th>Type</th><th>Value</th><th>Bits</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${state.rawRows.slice(0, 24).map((row) => `
                <tr>
                  <td>C${formatNumber(row.captureIndex || 1)} - ${formatNumber(row.timeUs, 1)} us</td>
                  <td>${escapeHtml(row.type)}</td>
                  <td>${escapeHtml(row.type === "ADDR" ? `${hex(row.value)} ${row.rw}` : hex(row.value))}</td>
                  <td>${escapeHtml(row.bits || "-")}</td>
                  <td>${escapeHtml(row.ack ? "ACK" : "NACK")}</td>
                </tr>
              `).join("") || `<tr><td colspan="5">Belum ada ADDR/DATA I2C valid. Jalankan capture saat bus aktif.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderSmbus(state) {
    const busy = state.busy;
    const directDisabled = busy || !state.isolatedConfirmed;
    const writeDisabled = directDisabled || !state.writeConfirmed;
    const isWrite = state.smbusOperation.startsWith("write") || state.smbusOperation === "raw-transfer";
    return `
      <section class="spi-card battery-panel-main">
        <div class="spi-card-head">
          <div>
            <p class="label">Direct SMBus</p>
            <h4>Manual Command Lab</h4>
          </div>
          <button id="batterySmbusSendButton" type="button" class="ghost"${(isWrite ? writeDisabled : directDisabled) ? " disabled" : ""}>
            <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "send"}</span>
            <span>Send</span>
          </button>
        </div>
        <div class="spi-form-grid">
          ${renderDeviceSelect(state, busy)}
          <label>
            Operation
            <select id="batterySmbusOperation"${busy ? " disabled" : ""}>
              ${["read-word", "read-byte", "read-block", "write-word", "write-block", "raw-transfer"].map((item) => `<option value="${item}"${state.smbusOperation === item ? " selected" : ""}>${item}</option>`).join("")}
            </select>
          </label>
          <label>
            Address
            <input id="batterySmbusAddress" type="text" value="${escapeHtml(state.smbusAddress)}"${busy ? " disabled" : ""}>
          </label>
          <label>
            Command
            <input id="batterySmbusCommand" type="text" value="${escapeHtml(state.smbusCommand)}"${busy ? " disabled" : ""}>
          </label>
          <label>
            Data Hex
            <input id="batterySmbusDataHex" type="text" value="${escapeHtml(state.smbusDataHex)}"${busy ? " disabled" : ""}>
          </label>
          <label>
            Read Len
            <input id="batterySmbusReadLength" type="number" min="0" max="64" value="${Number(state.smbusReadLength || 0)}"${busy ? " disabled" : ""}>
          </label>
        </div>
        <div class="battery-confirm-row">
          <label><input id="batteryIsolatedConfirmed" type="checkbox"${state.isolatedConfirmed ? " checked" : ""}${busy ? " disabled" : ""}> <span>Battery isolated</span></label>
          <label><input id="batteryWriteConfirmed" type="checkbox"${state.writeConfirmed ? " checked" : ""}${busy ? " disabled" : ""}> <span>Write enable</span></label>
        </div>
        <p class="spi-note">${escapeHtml(state.apiMessage || "Direct command terkunci sampai isolasi baterai dikonfirmasi.")}</p>
      </section>
      <section class="spi-card battery-result-panel">
        <div class="spi-card-head">
          <div>
            <p class="label">Result</p>
            <h4>SMBus response</h4>
          </div>
          <span class="spi-mini-badge">${state.smbusResult?.success ? "OK" : "WAIT"}</span>
        </div>
        <div class="spi-form-grid">
          <label>
            Write
            <textarea rows="3" readonly>${escapeHtml(state.smbusResult?.writeHex || "-")}</textarea>
          </label>
          <label>
            Read
            <textarea rows="3" readonly>${escapeHtml(state.smbusResult?.readHex || "-")}</textarea>
          </label>
          <label>
            Decode
            <input type="text" value="${escapeHtml(state.smbusResult?.decodedValue || "-")}" readonly>
          </label>
        </div>
      </section>
    `;
  }

  function getProfiles(state) {
    return Array.isArray(state.database?.profiles) ? state.database.profiles : [];
  }

  function selectedProfile(state) {
    const profiles = getProfiles(state);
    return profiles.find((profile) => profile.id === state.selectedProfileId) || profiles[0] || null;
  }

  function selectedAction(state, profile = selectedProfile(state)) {
    return profile?.recoveryActions?.find((action) => action.id === state.selectedActionId) || profile?.recoveryActions?.[0] || null;
  }

  function renderRecovery(state) {
    const busy = state.busy;
    const profiles = getProfiles(state);
    const profile = selectedProfile(state);
    const action = selectedAction(state, profile);
    const executeDisabled = busy || !state.isolatedConfirmed || !state.writeConfirmed || !profile || !action;
    const steps = state.recoveryPreview?.steps || action?.steps || [];
    return `
      <section class="spi-card battery-panel-main">
        <div class="spi-card-head">
          <div>
            <p class="label">Profiles</p>
            <h4>Recovery / Unlock</h4>
          </div>
          <div class="battery-action-row">
            <button id="batteryRecoveryPreviewButton" type="button" class="ghost"${busy || !profile || !action ? " disabled" : ""}>
              <span class="material-symbols-outlined">visibility</span>
              <span>Preview</span>
            </button>
            <button id="batteryRecoveryExecuteButton" type="button"${executeDisabled ? " disabled" : ""}>
              <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "lock_open"}</span>
              <span>Execute</span>
            </button>
          </div>
        </div>
        <div class="spi-form-grid">
          ${renderDeviceSelect(state, busy)}
          <label>
            Profile
            <select id="batteryProfileSelect"${busy ? " disabled" : ""}>
              ${profiles.map((item) => `<option value="${escapeHtml(item.id)}"${profile?.id === item.id ? " selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}
            </select>
          </label>
          <label>
            Action
            <select id="batteryActionSelect"${busy || !profile ? " disabled" : ""}>
              ${(profile?.recoveryActions || []).map((item) => `<option value="${escapeHtml(item.id)}"${action?.id === item.id ? " selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="battery-confirm-row">
          <label><input id="batteryRecoveryIsolatedConfirmed" type="checkbox"${state.isolatedConfirmed ? " checked" : ""}${busy ? " disabled" : ""}> <span>Battery isolated</span></label>
          <label><input id="batteryRecoveryWriteConfirmed" type="checkbox"${state.writeConfirmed ? " checked" : ""}${busy ? " disabled" : ""}> <span>Write enable</span></label>
        </div>
        <div class="battery-profile-strip">
          <span>${escapeHtml(profile?.family || "-")}</span>
          <span>${escapeHtml((profile?.aliases || []).join(", ") || "-")}</span>
          <span>${profile?.standardCommands?.length || 0} cmd</span>
          <span>${profile?.manufacturerAccessCommands?.length || 0} MAC</span>
          <span>${action?.hasSecretMaterial ? escapeHtml(action.secretKind || "secret") : "no key"}</span>
        </div>
        <p class="spi-note">${escapeHtml(state.recoveryMessage || "Recovery database siap dibaca.")}</p>
      </section>
      <section class="spi-card battery-sequence-panel">
        <div class="spi-card-head">
          <div>
            <p class="label">Sequence</p>
            <h4>${escapeHtml(action?.name || "No action")}</h4>
          </div>
          <span class="spi-mini-badge">${steps.length} step</span>
        </div>
        <div class="battery-step-list">
          ${steps.map((step) => `
            <div class="battery-step">
              <strong>${step.order}</strong>
              <span>${escapeHtml(step.type)}</span>
              <code>${escapeHtml([step.command, step.subCommand].filter(Boolean).join(" / ") || "-")}</code>
              <small>${escapeHtml(step.detail)}</small>
            </div>
          `).join("") || `<div class="battery-step"><strong>-</strong><span>No step</span><code>-</code><small>-</small></div>`}
        </div>
      </section>
    `;
  }

  function createWorkbenchMarkup(state) {
    const body = state.activeTab === "smbus"
      ? renderSmbus(state)
      : state.activeTab === "recovery"
        ? renderRecovery(state)
        : renderMonitor(state);
    return `
      <div class="battery-unlock-workbench spi-scope-theme">
        ${renderTabs(state)}
        ${body}
      </div>
    `;
  }

  function createApi() {
    let state = { ...defaultState, metrics: createInitialMetrics() };
    let mountedContainer = null;
    let monitorRunId = 0;

    function setState(patch) {
      state = { ...state, ...patch };
      render();
    }

    async function withBusy(work) {
      if (state.busy) {
        return;
      }
      setState({ busy: true });
      try {
        await work();
      } catch (error) {
        const message = error?.message || "Operasi Battery Unlock gagal.";
        if (state.activeTab === "monitor") {
          setState({ monitorMessage: message });
        } else if (state.activeTab === "smbus") {
          setState({ apiMessage: message });
        } else {
          setState({ recoveryMessage: message });
        }
      } finally {
        setState({ busy: false });
      }
    }

    async function loadDatabase() {
      const database = await fetchJson("/tools/battery-unlock/database");
      const profiles = Array.isArray(database.profiles) ? database.profiles : [];
      const profile = profiles.find((item) => item.id === state.selectedProfileId) || profiles[0] || null;
      const action = profile?.recoveryActions?.find((item) => item.id === state.selectedActionId) || profile?.recoveryActions?.[0] || null;
      state = {
        ...state,
        database,
        selectedProfileId: profile?.id || state.selectedProfileId,
        selectedActionId: action?.id || state.selectedActionId,
        recoveryMessage: database.message || "Database Battery Unlock siap."
      };
    }

    function stopMonitor(message = "") {
      if (!state.monitorRunning && !message) {
        return;
      }
      monitorRunId += 1;
      const summary = summarizeMetrics(state.metrics);
      setState({
        monitorRunning: false,
        monitorMessage: message || (summary
          ? `Monitoring berhenti. ${formatCompleteCount(state.metrics)}: ${summary}`
          : "Monitoring berhenti.")
      });
    }

    function startMonitor() {
      if (state.monitorRunning || state.busy) {
        return;
      }
      const runId = monitorRunId + 1;
      monitorRunId = runId;
      const deviceType = state.deviceType;
      const sampleRateHz = normalizeMonitorSampleRateHz(state.monitorSampleRateHz);
      setState({
        monitorRunning: true,
        monitorMessage: "Monitoring berjalan. Data akan langsung tampil saat terbaca.",
        monitorSampleRateHz: sampleRateHz,
        metrics: createInitialMetrics(),
        captureInfo: {
          deviceName: formatDeviceName(deviceType),
          pinOrder: "unknown",
          pinOrderLocked: false,
          rowCount: 0,
          sampleCount: 0,
          sampleRateHz,
          attempt: 0
        },
        transactions: [],
        busFrames: [],
        rawRows: []
      });
      void runMonitorLoop(runId, deviceType, sampleRateHz);
    }

    function toggleMonitor() {
      if (state.monitorRunning) {
        stopMonitor();
        return;
      }
      startMonitor();
    }

    async function runMonitorLoop(runId, deviceType, sampleRateHz) {
      let attempt = 0;
      while (monitorRunId === runId) {
        attempt += 1;
        let result;
        try {
          result = await fetchJson("/tools/logic-analyzer/capture", {
            method: "POST",
            body: JSON.stringify({
              deviceType,
              mode: "I2C",
              sampleRateHz,
              sampleCount: 16384,
              triggerEnabled: true,
              targetVoltage: "3.3 V",
              spiProbeMode: "SNIFF"
            })
          });
        } catch (error) {
          if (monitorRunId !== runId) {
            return;
          }
          setState({
            monitorMessage: error?.message || "Monitoring gagal. Periksa koneksi lalu coba lagi."
          });
          await delay(800);
          continue;
        }

        if (monitorRunId !== runId) {
          return;
        }

        const actualSampleRateHz = Number(result.actualSampleRateHz || result.requestedSampleRateHz || sampleRateHz);
        if (actualSampleRateHz < minimumMonitorDecodeRateHz) {
          setState({
            captureInfo: {
              deviceName: formatDeviceName(result.deviceType || deviceType),
              identity: result.identity || "",
              pinOrder: "unknown",
              pinOrderLocked: false,
              sampleCount: Number(result.sampleCount || 0),
              sampleRateHz: actualSampleRateHz,
              rowCount: state.rawRows.length,
              triggered: Boolean(result.triggered),
              attempt
            },
            monitorMessage: `C${attempt}: sample rate ${formatRate(actualSampleRateHz)} terlalu rendah untuk decode SMBus. Pakai 1 MHz atau lebih tinggi.`
          });
          await delay(monitorPollDelayMs);
          continue;
        }

        const rows = decodeI2cRows(result.samples || [], result.actualSampleRateHz || result.requestedSampleRateHz || 2000000);
        const decoded = decodeSmartBattery(rows);
        const captureInfo = {
          deviceName: formatDeviceName(result.deviceType || deviceType),
          identity: result.identity || "",
          pinOrder: normalizePinOrder(result.i2cPinOrder),
          pinOrderLocked: Boolean(result.i2cPinOrderLocked),
          sampleCount: Number(result.sampleCount || 0),
          sampleRateHz: Number(result.actualSampleRateHz || result.requestedSampleRateHz || 0),
          rowCount: rows.length,
          triggered: Boolean(result.triggered),
          attempt
        };
        const taggedRows = rows.map((row) => ({ ...row, captureIndex: attempt }));
        const taggedTransactions = decoded.transactions.map((transaction) => ({ ...transaction, captureIndex: attempt }));
        const taggedFrames = decodeSmbusFrames(taggedRows);

        const nextRows = taggedRows.length
          ? [...state.rawRows, ...taggedRows].slice(-240)
          : state.rawRows;
        const nextTransactions = taggedTransactions.length
          ? [...state.transactions, ...taggedTransactions].slice(-80)
          : state.transactions;
        const nextBusFrames = taggedFrames.length
          ? [...state.busFrames, ...taggedFrames].slice(-120)
          : state.busFrames;
        const nextMetrics = mergeMetrics(state.metrics, decoded.metrics);
        const completeCount = countCompleteMetrics(nextMetrics);
        const summary = summarizeMetrics(nextMetrics);
        const frameSummary = taggedFrames
          .map((frame) => `${hex(frame.address)} ${frame.rw}`)
          .filter((value, index, list) => list.indexOf(value) === index)
          .join(", ");
        const hasBatteryFrame = taggedFrames.some((frame) => frame.address === 0x0B);
        setState({
          rawRows: nextRows,
          metrics: nextMetrics,
          captureInfo: {
            ...captureInfo,
            rowCount: nextRows.length
          },
          transactions: nextTransactions,
          busFrames: nextBusFrames,
          monitorMessage: taggedTransactions.length
            ? `C${attempt}: ${taggedTransactions.length} transaksi baru. ${formatCompleteCount(nextMetrics)}${summary ? `: ${summary}` : ""}`
            : taggedFrames.length
              ? `C${attempt}: ${taggedFrames.length} frame SMBus valid (${frameSummary}) disimpan. ${hasBatteryFrame ? "Frame battery 0x0B belum lengkap command+read." : "Yang lewat belum address battery 0x0B."} ${completeCount}/6 data baterai terkumpul.`
            : `C${attempt}: belum ada transaksi 0x0B baru (${formatPinOrder(captureInfo)}). ${completeCount}/6 data terkumpul.`
        });

        await delay(monitorPollDelayMs);
      }
    }

    async function sendSmbus() {
      const result = await fetchJson("/tools/battery-unlock/smbus/command", {
        method: "POST",
        body: JSON.stringify({
          deviceType: state.deviceType,
          operation: state.smbusOperation,
          address: state.smbusAddress,
          command: state.smbusCommand,
          dataHex: state.smbusDataHex,
          readLength: Number(state.smbusReadLength || 0),
          requireBusIdle: true,
          isolatedBatteryConfirmed: state.isolatedConfirmed,
          writeEnableConfirmed: state.writeConfirmed
        })
      });
      setState({
        smbusResult: result,
        apiMessage: result.message || "SMBus command selesai."
      });
    }

    async function previewRecovery() {
      const result = await fetchJson("/tools/battery-unlock/recovery/preview", {
        method: "POST",
        body: JSON.stringify({
          deviceType: state.deviceType,
          profileId: state.selectedProfileId,
          actionId: state.selectedActionId
        })
      });
      setState({
        recoveryPreview: result,
        recoveryMessage: result.message || "Preview recovery siap."
      });
    }

    async function executeRecovery() {
      const result = await fetchJson("/tools/battery-unlock/recovery/execute", {
        method: "POST",
        body: JSON.stringify({
          deviceType: state.deviceType,
          profileId: state.selectedProfileId,
          actionId: state.selectedActionId,
          isolatedBatteryConfirmed: state.isolatedConfirmed,
          writeEnableConfirmed: state.writeConfirmed
        })
      });
      setState({
        recoveryPreview: result,
        recoveryMessage: result.message || "Recovery command selesai."
      });
    }

    function bindCommon(container) {
      container.querySelectorAll("[data-battery-tab]").forEach((button) => {
        button.addEventListener("click", () => {
          const nextTab = button.dataset.batteryTab || "monitor";
          if (state.monitorRunning && nextTab !== "monitor") {
            stopMonitor("Monitoring dihentikan saat pindah tab.");
          }
          setState({ activeTab: nextTab });
        });
      });

      container.querySelectorAll("#batteryDeviceType").forEach((select) => {
        select.addEventListener("change", () => setState({ deviceType: select.value || usbDeviceType }));
      });
    }

    function bindMonitor(container) {
      const sampleRate = container.querySelector("#batteryMonitorSampleRate");
      sampleRate?.addEventListener("change", () => {
        setState({ monitorSampleRateHz: normalizeMonitorSampleRateHz(sampleRate.value) });
      });
      container.querySelector("#batteryMonitorCaptureButton")?.addEventListener("click", toggleMonitor);
    }

    function bindSmbus(container) {
      const operation = container.querySelector("#batterySmbusOperation");
      const address = container.querySelector("#batterySmbusAddress");
      const command = container.querySelector("#batterySmbusCommand");
      const dataHex = container.querySelector("#batterySmbusDataHex");
      const readLength = container.querySelector("#batterySmbusReadLength");
      const isolated = container.querySelector("#batteryIsolatedConfirmed");
      const write = container.querySelector("#batteryWriteConfirmed");
      operation?.addEventListener("change", () => setState({ smbusOperation: operation.value }));
      address?.addEventListener("input", () => { state.smbusAddress = address.value; });
      command?.addEventListener("input", () => { state.smbusCommand = command.value; });
      dataHex?.addEventListener("input", () => { state.smbusDataHex = dataHex.value; });
      readLength?.addEventListener("input", () => { state.smbusReadLength = Number(readLength.value || 0); });
      isolated?.addEventListener("change", () => setState({ isolatedConfirmed: isolated.checked }));
      write?.addEventListener("change", () => setState({ writeConfirmed: write.checked }));
      container.querySelector("#batterySmbusSendButton")?.addEventListener("click", () => withBusy(sendSmbus));
    }

    function bindRecovery(container) {
      const profileSelect = container.querySelector("#batteryProfileSelect");
      const actionSelect = container.querySelector("#batteryActionSelect");
      const isolated = container.querySelector("#batteryRecoveryIsolatedConfirmed");
      const write = container.querySelector("#batteryRecoveryWriteConfirmed");
      profileSelect?.addEventListener("change", () => {
        const profile = getProfiles(state).find((item) => item.id === profileSelect.value);
        setState({
          selectedProfileId: profile?.id || profileSelect.value,
          selectedActionId: profile?.recoveryActions?.[0]?.id || "",
          recoveryPreview: null
        });
      });
      actionSelect?.addEventListener("change", () => setState({ selectedActionId: actionSelect.value, recoveryPreview: null }));
      isolated?.addEventListener("change", () => setState({ isolatedConfirmed: isolated.checked }));
      write?.addEventListener("change", () => setState({ writeConfirmed: write.checked }));
      container.querySelector("#batteryRecoveryPreviewButton")?.addEventListener("click", () => withBusy(previewRecovery));
      container.querySelector("#batteryRecoveryExecuteButton")?.addEventListener("click", () => withBusy(executeRecovery));
    }

    function render() {
      if (!mountedContainer) {
        return;
      }
      mountedContainer.innerHTML = createWorkbenchMarkup(state);
      bindCommon(mountedContainer);
      if (state.activeTab === "monitor") {
        bindMonitor(mountedContainer);
      } else if (state.activeTab === "smbus") {
        bindSmbus(mountedContainer);
      } else {
        bindRecovery(mountedContainer);
      }
    }

    return {
      viewKey: "tool_battery_unlock",
      eyebrow: "Battery Tools",
      title: "Battery Unlock",
      subtitle: "Monitor dan recovery baterai laptop via SMBus/I2C.",
      mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        render();
        if (!state.database) {
          withBusy(loadDatabase);
        }
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }
        if (!visible && state.monitorRunning) {
          stopMonitor("Monitoring dihentikan saat halaman ditutup.");
        }
        mountedContainer.classList.toggle("hidden", !visible);
      },
      refresh() {
        if (!state.database) {
          withBusy(loadDatabase);
        }
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.batteryUnlock = createApi();
})(window);
