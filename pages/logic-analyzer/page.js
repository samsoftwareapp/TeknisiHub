(function initializeLogicAnalyzerPage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const connectionPlaceholderLabel = "---- PILIH KONEKSI ----";
  const defaultDeviceType = "";
  const defaultMode = "I2C";
  const defaultSampleRateHz = 2000000;
  const defaultTargetVoltage = "3.3 V";
  const targetVoltageOptions = ["3.3 V", "1.8 V"];
  const defaultSpiProbeMode = "SNIFF";
  const spiProbeModeOptions = ["SNIFF"];
  const maxSampleRateHz = 10000000;
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
  const defaultSampleCount = 8192;
  const maxDecodeRows = 120;
  const maxRecordedDecodeRows = 1000;
  const autoCaptureDelayMs = 120;
  const minPatternTransitions = 4;
  const usbDeviceType = "TEKNISIHUB_FLASH_OSC_USB";
  const wifiDeviceType = "TEKNISIHUB_FLASH_OSC_WIFI";
  const deviceProfiles = {
    [usbDeviceType]: {
      label: "TEKNISIHUB_FLASH_OSC",
      transport: "USB",
      icon: "usb"
    },
    [wifiDeviceType]: {
      label: "TEKNISIHUB_FLASH_OSC",
      transport: "WIFI",
      icon: "wifi"
    }
  };
  const laneColors = ["#42d392", "#7dd3fc", "#f7b955", "#f87171"];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  function sanitizePublicMessage(value) {
    let message = String(value ?? "").trim();
    if (!message) {
      return "";
    }
    if (
      /\b(protocol|programmer|vcc|endpoint)\s*=/i.test(message) ||
      /\bGP\d+\b|\bGPIO\d+\b/i.test(message) ||
      /\b(libusb|winusb|stack trace|exception)\b/i.test(message) ||
      /[A-Z]:\\|\/Users\/|\/home\//i.test(message)
    ) {
      return message.toLowerCase().includes("terhubung")
        ? "Device Logic Analyzer terhubung."
        : "Operasi Logic Analyzer gagal. Periksa koneksi lalu coba lagi.";
    }
    return message
      .replace(/\bLocalService\b/g, "aplikasi lokal")
      .replace(/\blocal service\b/gi, "aplikasi lokal")
      .replace(/\bbackend\b/gi, "sistem")
      .replace(/\bregistry\b/gi, "data akses")
      .replace(/\bFirebase\b/gi, "sistem akses")
      .replace(/\bTelegram\b/g, "akun");
  }

  async function fetchJson(path, options = {}) {
    const { timeoutMs = 0, ...fetchOptions } = options;
    let timeoutId = null;
    let requestOptions = fetchOptions;
    if (!requestOptions.signal && timeoutMs > 0) {
      const controller = new AbortController();
      timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
      requestOptions = {
        ...requestOptions,
        signal: controller.signal
      };
    }

    const response = await fetch(`${serviceBaseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...requestOptions
    }).catch((error) => {
      if (error?.name === "AbortError") {
        throw new Error("Request Logic Analyzer terlalu lama. Coba lagi setelah proses aktif selesai.");
      }
      throw error;
    }).finally(() => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
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
      throw new Error(sanitizePublicMessage(payload.message || payload.title || `Request gagal (${response.status}).`));
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

  function normalizeMode(value) {
    return String(value || "").toUpperCase() === "SPI" ? "SPI" : "I2C";
  }

  function normalizeTargetVoltage(value) {
    const voltage = String(value || "").trim();
    return voltage.includes("1.8") || voltage.includes("1800") ? "1.8 V" : "3.3 V";
  }

  function compactTargetVoltage(value) {
    return normalizeTargetVoltage(value).replace(" V", "V");
  }

  function normalizeSpiProbeMode(value) {
    return "SNIFF";
  }

  function targetVoltageRoute(value) {
    return normalizeTargetVoltage(value) === "1.8 V" ? "1v8" : "3v3";
  }

  function createAutoState(overrides = {}) {
    return {
      running: false,
      stopping: false,
      finishing: false,
      attempts: 0,
      validCaptures: 0,
      idleCaptures: 0,
      lastLabel: "",
      matched: false,
      ...overrides
    };
  }

  function createInitialState() {
    return {
      deviceType: defaultDeviceType,
      mode: defaultMode,
      sampleRateHz: normalizeSampleRateHz(defaultSampleRateHz),
      sampleCount: defaultSampleCount,
      targetVoltage: defaultTargetVoltage,
      appliedTargetVoltage: "",
      spiProbeMode: defaultSpiProbeMode,
      appliedSpiProbeMode: "",
      triggerEnabled: true,
      device: null,
      capture: null,
      decodedRows: [],
      isPinOrderChecking: false,
      message: "Pilih koneksi untuk mulai capture.",
      errorMessage: "",
      autoPattern: createAutoState()
    };
  }

  function selectedDeviceProfile(deviceType) {
    return deviceProfiles[deviceType] || null;
  }

  function normalizeSamples(samples) {
    if (samples instanceof Uint8Array) {
      return samples;
    }
    if (Array.isArray(samples)) {
      return Uint8Array.from(samples.map((sample) => Number(sample || 0) & 0xFF));
    }
    if (typeof samples === "string" && samples) {
      try {
        const binary = atob(samples);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index) & 0xFF;
        }
        return bytes;
      } catch {
        return new Uint8Array();
      }
    }
    return new Uint8Array();
  }

  function sampleBit(samples, index, bit) {
    return ((samples[index] || 0) & (1 << bit)) ? 1 : 0;
  }

  function findI2cStop(samples, startIndex) {
    for (let index = startIndex + 1; index < samples.length; index += 1) {
      const prevSda = sampleBit(samples, index - 1, 0);
      const sda = sampleBit(samples, index, 0);
      const scl = sampleBit(samples, index, 1);
      if (!prevSda && sda && scl) {
        return index;
      }
    }
    return -1;
  }

  function decodeI2c(capture) {
    const samples = normalizeSamples(capture?.samples);
    const rows = [];
    let started = false;
    let bits = [];
    let byteIndex = 0;

    for (let index = 1; index < samples.length && rows.length < maxDecodeRows; index += 1) {
      const prevSda = sampleBit(samples, index - 1, 0);
      const sda = sampleBit(samples, index, 0);
      const prevScl = sampleBit(samples, index - 1, 1);
      const scl = sampleBit(samples, index, 1);

      if (!started && prevSda && !sda && scl) {
        started = true;
        bits = [];
        byteIndex = 0;
        rows.push({
          timeUs: sampleTimeUs(index, capture),
          event: "START",
          value: "-",
          ack: "-",
          note: "Bus aktif"
        });
        continue;
      }

      if (!started) {
        continue;
      }

      if (!prevSda && sda && scl) {
        rows.push({
          timeUs: sampleTimeUs(index, capture),
          event: "STOP",
          value: "-",
          ack: "-",
          note: "Bus idle"
        });
        started = false;
        bits = [];
        continue;
      }

      if (!prevScl && scl) {
        bits.push(sda);
        if (bits.length === 9) {
          const dataBits = bits.slice(0, 8);
          const value = dataBits.reduce((acc, bit) => (acc << 1) | bit, 0);
          const ack = bits[8] === 0 ? "ACK" : "NACK";
          const isAddress = byteIndex === 0;
          const address = value >> 1;
          const direction = (value & 1) ? "R" : "W";
          rows.push({
            timeUs: sampleTimeUs(index, capture),
            event: isAddress ? "ADDR" : "DATA",
            value: isAddress
              ? `0x${address.toString(16).toUpperCase().padStart(2, "0")} ${direction}`
              : `0x${value.toString(16).toUpperCase().padStart(2, "0")}`,
            ack,
            note: isAddress ? "Address" : `Byte ${byteIndex}`
          });
          byteIndex += 1;
          bits = [];
        }
      }

      const stopIndex = findI2cStop(samples, index);
      if (stopIndex === index) {
        continue;
      }
    }

    return rows;
  }

  function decodeSpi(capture) {
    const samples = normalizeSamples(capture?.samples);
    const rows = [];
    let bitsMosi = [];
    let bitsMiso = [];
    let byteIndex = 0;
    let active = false;

    for (let index = 1; index < samples.length && rows.length < maxDecodeRows; index += 1) {
      const prevCs = sampleBit(samples, index - 1, 0);
      const cs = sampleBit(samples, index, 0);
      const prevClk = sampleBit(samples, index - 1, 1);
      const clk = sampleBit(samples, index, 1);
      const mosi = sampleBit(samples, index, 2);
      const miso = sampleBit(samples, index, 3);

      if (prevCs && !cs) {
        active = true;
        bitsMosi = [];
        bitsMiso = [];
        byteIndex = 0;
        rows.push({
          timeUs: sampleTimeUs(index, capture),
          event: "CS LOW",
          value: "-",
          ack: "-",
          note: "Frame mulai"
        });
      }

      if (!active || cs) {
        if (!prevCs && cs) {
          rows.push({
            timeUs: sampleTimeUs(index, capture),
            event: "CS HIGH",
            value: "-",
            ack: "-",
            note: "Frame selesai"
          });
        }
        active = false;
        continue;
      }

      if (!prevClk && clk) {
        bitsMosi.push(mosi);
        bitsMiso.push(miso);
        if (bitsMosi.length === 8) {
          const mosiValue = bitsMosi.reduce((acc, bit) => (acc << 1) | bit, 0);
          const misoValue = bitsMiso.reduce((acc, bit) => (acc << 1) | bit, 0);
          rows.push({
            timeUs: sampleTimeUs(index, capture),
            event: `BYTE ${byteIndex}`,
            value: `MOSI 0x${mosiValue.toString(16).toUpperCase().padStart(2, "0")}`,
            ack: `MISO 0x${misoValue.toString(16).toUpperCase().padStart(2, "0")}`,
            note: "CLK rising"
          });
          byteIndex += 1;
          bitsMosi = [];
          bitsMiso = [];
        }
      }
    }

    return rows;
  }

  function sampleTimeUs(index, capture) {
    const rate = Number(capture?.actualSampleRateHz || capture?.requestedSampleRateHz || defaultSampleRateHz);
    return rate > 0 ? (index / rate) * 1000000 : 0;
  }

  function decodeCapture(capture) {
    const mode = normalizeMode(capture?.mode);
    return mode === "SPI" ? decodeSpi(capture) : decodeI2c(capture);
  }

  function hashPattern(value) {
    const text = String(value || "");
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
  }

  function meaningfulDecodeRows(rows) {
    return (Array.isArray(rows) ? rows : []).filter((row) => {
      const event = String(row?.event || "").toUpperCase();
      return event && !["START", "STOP", "CS LOW", "CS HIGH"].includes(event);
    });
  }

  function buildDecodePattern(capture, rows) {
    const meaningfulRows = meaningfulDecodeRows(rows);
    if (!meaningfulRows.length) {
      return null;
    }
    const mode = normalizeMode(capture?.mode);
    const body = meaningfulRows
      .map((row) => [
        String(row.event || "").toUpperCase(),
        String(row.value || "").toUpperCase(),
        String(row.ack || "").toUpperCase()
      ].join(":"))
      .join("|");
    return {
      active: true,
      signature: `${mode}:DECODE:${hashPattern(body)}`,
      label: `${meaningfulRows.length} event decode`
    };
  }

  function buildTransitionPattern(capture) {
    const samples = normalizeSamples(capture?.samples);
    const mode = normalizeMode(capture?.mode);
    const mask = mode === "SPI" ? 0x0F : 0x03;
    const runs = [];
    for (let index = 0; index < samples.length; index += 1) {
      const value = samples[index] & mask;
      const lastRun = runs[runs.length - 1];
      if (lastRun && lastRun.value === value) {
        lastRun.length += 1;
      } else {
        runs.push({ value, length: 1 });
      }
    }

    const transitionCount = Math.max(0, runs.length - 1);
    if (transitionCount < minPatternTransitions) {
      return {
        active: false,
        signature: "",
        label: "idle"
      };
    }

    const startRun = Math.max(0, 0);
    const endRun = runs.length;
    const sequence = runs.slice(startRun, endRun).map((run) => run.value.toString(16).toUpperCase()).join("");
    return {
      active: true,
      signature: `${mode}:RAW:${hashPattern(sequence)}`,
      label: `${transitionCount} transisi`
    };
  }

  function buildCapturePattern(capture, rows) {
    return buildDecodePattern(capture, rows) || buildTransitionPattern(capture);
  }

  function tagRecordedRows(rows, pattern, captureIndex) {
    const sourceRows = rows.length
      ? rows
      : [{
          timeUs: 0,
          event: "RAW",
          value: pattern.label || "aktif",
          ack: "-",
          note: "Transisi tanpa decode"
        }];

    return sourceRows.map((row) => ({
      ...row,
      note: `C${captureIndex} ${row.note || ""}`.trim()
    }));
  }

  function createDecodeTable(rows) {
    if (!rows.length) {
      return `
        <div class="logic-analyzer-empty">
          <span class="material-symbols-outlined" aria-hidden="true">data_array</span>
          <span>Belum ada decode.</span>
        </div>
      `;
    }

    return `
      <div class="logic-analyzer-table-wrap">
        <table class="logic-analyzer-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Value</th>
              <th>Status</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td>${escapeHtml(formatNumber(row.timeUs, 1))} us</td>
                <td>${escapeHtml(row.event)}</td>
                <td>${escapeHtml(row.value)}</td>
                <td>${escapeHtml(row.ack)}</td>
                <td>${escapeHtml(row.note)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function resolveI2cPinOrder(capture) {
    const order = String(capture?.i2cPinOrder || "").toLowerCase();
    if (order === "swap" || order === "swapped") {
      return "swap";
    }
    if (order === "normal") {
      return "normal";
    }
    return "unknown";
  }

  function hasLockedI2cPinOrder(capture) {
    return Boolean(capture?.i2cPinOrderLocked && resolveI2cPinOrder(capture) !== "unknown");
  }

  function markI2cPinOrderChecking(capture) {
    return capture
      ? {
          ...capture,
          isPinOrderChecking: true
        }
      : capture;
  }

  function carryLockedI2cPinOrder(capture, fallbackCapture) {
    if (normalizeMode(capture?.mode || fallbackCapture?.mode) !== "I2C") {
      return capture;
    }
    if (hasLockedI2cPinOrder(capture) || !hasLockedI2cPinOrder(fallbackCapture)) {
      return capture;
    }
    return {
      ...capture,
      i2cPinOrder: resolveI2cPinOrder(fallbackCapture),
      i2cPinOrderLocked: true
    };
  }

  function renderSocketPins(pins) {
    return pins.map((pin) => `
      <div class="logic-analyzer-socket-pin${pin.kind ? ` is-${escapeHtml(pin.kind)}` : ""}">
        <span>${escapeHtml(pin.label)}</span>
        <strong>${escapeHtml(pin.value)}</strong>
        <small>${escapeHtml(pin.note)}</small>
      </div>
    `).join("");
  }

  function createSocketMonitor(capture, mode, targetVoltage, spiProbeMode) {
    const normalizedMode = normalizeMode(mode);
    if (normalizedMode === "SPI") {
      const voltage = normalizeTargetVoltage(capture?.targetVoltage || targetVoltage);
      const probeMode = normalizeSpiProbeMode(capture?.spiProbeMode || spiProbeMode);
      const passive = probeMode === "SNIFF";
      const pins = [
        { label: "CS", value: "CS", note: "Select", kind: "cs" },
        { label: "CLK", value: "CLK", note: "Clock", kind: "clk" },
        { label: "MOSI", value: "MOSI", note: "Out", kind: "mosi" },
        { label: "MISO", value: "MISO", note: "In", kind: "miso" },
        { label: "GND", value: "GND", note: "Common", kind: "gnd" }
      ];

      return `
        <section class="spi-card logic-analyzer-pin-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Socket Monitor</p>
              <h4>SPI GND/CS/CLK/MOSI/MISO</h4>
            </div>
            <span class="logic-analyzer-pin-status is-spi${passive ? " is-passive" : ""}">
              <span>${escapeHtml(probeMode)}</span>
              <strong>${escapeHtml(compactTargetVoltage(voltage))}</strong>
            </span>
          </div>
          <div class="logic-analyzer-socket-monitor is-spi${passive ? " is-passive" : ""}">
            <div class="logic-analyzer-socket-pins">
              ${renderSocketPins(pins)}
            </div>
            <div class="logic-analyzer-socket-body">
              <span class="logic-analyzer-socket-dot"></span>
              <small>TEKNISIHUB</small>
              <strong>SPI</strong>
              <em>Passive input, ref ${escapeHtml(voltage)}</em>
            </div>
          </div>
        </section>
      `;
    }

    const pinOrder = resolveI2cPinOrder(capture);
    const locked = hasLockedI2cPinOrder(capture);
    const checking = Boolean(capture?.isPinOrderChecking);
    const statusClass = pinOrder === "swap"
      ? "is-swap"
      : pinOrder === "normal"
        ? "is-normal"
        : "is-unknown";
    const statusLabel = pinOrder === "swap"
      ? "SWAP"
      : pinOrder === "normal"
        ? "NORMAL"
        : "ANALYZE";
    const statusDetail = pinOrder === "swap"
      ? "SDA/SCL dibalik oleh servis"
      : pinOrder === "normal"
        ? "SDA/SCL sesuai label"
        : "Menunggu byte I2C valid";
    const lockLabel = locked
      ? "LOCKED"
      : checking
        ? "CHECKING"
        : "UNLOCKED";
    const pins = [
      { label: "SDA", value: pinOrder === "swap" ? "SCL" : "SDA", note: "Data" },
      { label: "SCL", value: pinOrder === "swap" ? "SDA" : "SCL", note: "Clock" },
      { label: "GND", value: "GND", note: "Common" }
    ];

    return `
      <section class="spi-card logic-analyzer-pin-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Socket Monitor</p>
            <h4>I2C GND/SDA/SCL</h4>
          </div>
          <span class="logic-analyzer-pin-status ${statusClass}">
            <span>${escapeHtml(statusLabel)}</span>
            <strong>${escapeHtml(lockLabel)}</strong>
          </span>
        </div>
        <div class="logic-analyzer-socket-monitor ${statusClass}${checking ? " is-checking" : ""}">
          <div class="logic-analyzer-socket-pins">
            ${renderSocketPins(pins)}
          </div>
          <div class="logic-analyzer-socket-body">
            <span class="logic-analyzer-socket-dot"></span>
            <small>TEKNISIHUB</small>
            <strong>LA</strong>
            <em>${escapeHtml(statusDetail)}</em>
          </div>
        </div>
      </section>
    `;
  }

  function createWorkbenchMarkup(state, busy) {
    const autoRunning = Boolean(state.autoPattern?.running);
    const autoFinishing = Boolean(state.autoPattern?.finishing);
    const controlsLocked = busy || autoRunning || autoFinishing;
    const disableAttr = controlsLocked ? " disabled" : "";
    const selectedProfile = selectedDeviceProfile(state.deviceType);
    const capture = state.capture;
    const targetVoltage = normalizeTargetVoltage(capture?.targetVoltage || state.targetVoltage);
    const spiProbeMode = normalizeSpiProbeMode(capture?.spiProbeMode || state.spiProbeMode);
    const mode = normalizeMode(state.mode);
    const actionDisableAttr = busy || autoFinishing ? " disabled" : "";
    const captureDisableAttr = controlsLocked ? " disabled" : "";
    const sampleCount = Number(capture?.sampleCount || state.sampleCount || 0);
    const actualRate = Number(capture?.actualSampleRateHz || state.sampleRateHz || 0);
    const durationMs = actualRate > 0 ? (sampleCount / actualRate) * 1000 : 0;
    const statusMessage = state.errorMessage || state.message;
    const pinOrder = mode === "I2C" ? resolveI2cPinOrder(capture) : "unknown";
    const pinOrderBadge = mode === "SPI"
      ? `SPI ${spiProbeMode}`
      : pinOrder === "swap"
        ? "SDA/SCL SWAP"
        : pinOrder === "normal"
          ? "SDA/SCL NORMAL"
          : "SDA/SCL ANALYZE";
    const modeOptions = ["I2C", "SPI"].map((item) => `
      <button type="button" class="logic-analyzer-mode-button${mode === item ? " is-active" : ""}" data-logic-mode="${item}"${disableAttr}>
        <span>${item}</span>
      </button>
    `).join("");
    const autoBadge = autoRunning
      ? `Auto ${formatNumber(state.autoPattern.attempts || 0)}`
      : autoFinishing
        ? "Stopping"
      : state.autoPattern?.validCaptures
        ? `Record ${formatNumber(state.autoPattern.validCaptures)}`
        : "Single";
    const selectedSampleRateHz = normalizeSampleRateHz(state.sampleRateHz);
    const sampleRateOptions = sampleRateOptionsHz.map((rate) => `
      <option value="${rate}"${selectedSampleRateHz === rate ? " selected" : ""}>${escapeHtml(formatRate(rate))}</option>
    `).join("");
    const voltageOptions = targetVoltageOptions.map((voltage) => `
      <button type="button" class="logic-analyzer-voltage-button${targetVoltage === voltage ? " is-active" : ""}" data-logic-voltage="${escapeHtml(voltage)}"${disableAttr}>
        <span>${escapeHtml(compactTargetVoltage(voltage))}</span>
      </button>
    `).join("");
    const spiProbeOptions = spiProbeModeOptions.map((probeMode) => `
      <button type="button" class="logic-analyzer-probe-button${spiProbeMode === probeMode ? " is-active" : ""}" data-logic-spi-probe="${escapeHtml(probeMode)}"${disableAttr}>
        <span>${escapeHtml(probeMode)}</span>
      </button>
    `).join("");

    return `
      <section class="spi-card logic-analyzer-control-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Logic Analyzer</p>
            <h4>I2C/SPI Capture</h4>
          </div>
          <div class="logic-analyzer-actions">
            <button type="button" id="logicAnalyzerCheckButton" class="ghost"${disableAttr}>
              <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "sensors"}</span>
              <span>Cek Device</span>
            </button>
            <button type="button" id="logicAnalyzerAutoButton" class="ghost${autoRunning ? " is-active" : ""}"${actionDisableAttr}>
              <span class="material-symbols-outlined${autoRunning ? " is-spinning" : ""}">${autoRunning ? "progress_activity" : "repeat"}</span>
              <span>${autoRunning ? "Stop" : (autoFinishing ? "Stopping..." : "Auto Capture")}</span>
            </button>
            <button type="button" id="logicAnalyzerCaptureButton" class="is-hero-action"${captureDisableAttr}>
              <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "play_arrow"}</span>
              <span>${busy ? "Capture..." : (mode === "SPI" ? "ARM Capture" : "Capture")}</span>
            </button>
          </div>
        </div>
        <div class="spi-form-grid logic-analyzer-form-grid">
          <label>
            Koneksi
            <select id="logicAnalyzerDeviceSelect"${disableAttr}>
              <option value="">${connectionPlaceholderLabel}</option>
              <option value="TEKNISIHUB_FLASH_OSC_USB"${state.deviceType === "TEKNISIHUB_FLASH_OSC_USB" ? " selected" : ""}>TEKNISIHUB_FLASH_OSC USB</option>
              <option value="TEKNISIHUB_FLASH_OSC_WIFI"${state.deviceType === "TEKNISIHUB_FLASH_OSC_WIFI" ? " selected" : ""}>TEKNISIHUB_FLASH_OSC WIFI</option>
            </select>
          </label>
          <label>
            Mode
            <div class="logic-analyzer-mode-switch" role="group" aria-label="Mode Logic Analyzer">
              ${modeOptions}
            </div>
          </label>
          <label class="logic-analyzer-spi-probe-field${mode === "SPI" ? "" : " is-hidden"}">
            SPI Input
            <div class="logic-analyzer-probe-switch" role="group" aria-label="Mode input SPI Logic Analyzer">
              ${spiProbeOptions}
            </div>
          </label>
          <label class="logic-analyzer-spi-level-field${mode === "SPI" ? "" : " is-hidden"}">
            Ref Level
            <div class="logic-analyzer-voltage-switch" role="group" aria-label="Ref level SPI Logic Analyzer">
              ${voltageOptions}
            </div>
          </label>
          <label>
            Sample Rate
            <select id="logicAnalyzerSampleRateInput"${disableAttr}>
              ${sampleRateOptions}
            </select>
          </label>
          <label>
            Sample Count
            <input id="logicAnalyzerSampleCountInput" type="number" min="128" max="16384" step="128" value="${escapeHtml(state.sampleCount)}"${disableAttr}>
          </label>
          <label class="logic-analyzer-checkline">
            Trigger
            <span>
              <input id="logicAnalyzerTriggerInput" type="checkbox"${state.triggerEnabled ? " checked" : ""}${disableAttr}>
              <span>${mode === "SPI" ? "CS" : "START"}</span>
            </span>
          </label>
        </div>
        <div class="logic-analyzer-status-row">
          <span class="spi-mini-badge">${escapeHtml(selectedProfile ? `${selectedProfile.label} ${selectedProfile.transport}` : "Belum pilih koneksi")}</span>
          <span class="spi-mini-badge">${escapeHtml(formatRate(selectedSampleRateHz))}</span>
          <span class="spi-mini-badge">${escapeHtml(formatNumber(state.sampleCount))} samples</span>
          <span class="spi-mini-badge">${escapeHtml(autoBadge)}</span>
          ${mode === "SPI" ? `<span class="spi-mini-badge">${escapeHtml(`SNIFF Ref ${targetVoltage}`)}</span>` : ""}
          <span class="spi-mini-badge">${escapeHtml(pinOrderBadge)}</span>
        </div>
        <p class="spi-note">${escapeHtml(statusMessage)}</p>
      </section>

      ${createSocketMonitor(capture, mode, targetVoltage, spiProbeMode)}

      <section class="spi-card logic-analyzer-display-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Waveform</p>
            <h4>${escapeHtml(mode)} Digital</h4>
          </div>
          <div class="logic-analyzer-readouts">
            <span>${escapeHtml(capture ? formatRate(capture.actualSampleRateHz) : "-")}</span>
            <span>${escapeHtml(capture ? `${formatNumber(durationMs, 2)} ms` : "-")}</span>
            <span>${escapeHtml(capture ? (capture.triggered ? "Triggered" : "Auto") : "-")}</span>
          </div>
        </div>
        <div class="logic-analyzer-canvas-shell">
          <canvas id="logicAnalyzerCanvas" class="logic-analyzer-canvas" width="1200" height="420"></canvas>
        </div>
      </section>

      <section class="spi-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Decode</p>
            <h4>${escapeHtml(mode)} Data</h4>
          </div>
          <span class="spi-mini-badge">${escapeHtml(formatNumber(state.decodedRows.length))} row</span>
        </div>
        ${createDecodeTable(state.decodedRows)}
      </section>
    `;
  }

  function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const nextWidth = Math.max(480, Math.floor(rect.width * dpr));
    const nextHeight = Math.max(260, Math.floor(rect.height * dpr));
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }
    return { width: nextWidth, height: nextHeight, dpr };
  }

  function drawWaveform(canvas, capture, mode) {
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const { width, height, dpr } = resizeCanvas(canvas);
    const samples = normalizeSamples(capture?.samples);
    const labels = capture?.channelLabels?.length
      ? capture.channelLabels
      : (normalizeMode(mode) === "SPI" ? ["CS", "CLK", "MOSI", "MISO"] : ["SDA", "SCL"]);
    const laneCount = Math.max(1, labels.length);
    const leftPad = 74 * dpr;
    const rightPad = 18 * dpr;
    const topPad = 28 * dpr;
    const bottomPad = 24 * dpr;
    const graphWidth = Math.max(1, width - leftPad - rightPad);
    const graphHeight = Math.max(1, height - topPad - bottomPad);
    const laneHeight = graphHeight / laneCount;

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#08111f";
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(148, 163, 184, 0.14)";
    context.lineWidth = 1 * dpr;
    for (let gridIndex = 0; gridIndex <= 10; gridIndex += 1) {
      const x = leftPad + (graphWidth * gridIndex / 10);
      context.beginPath();
      context.moveTo(x, topPad);
      context.lineTo(x, height - bottomPad);
      context.stroke();
    }

    context.font = `${12 * dpr}px Inter, Segoe UI, sans-serif`;
    context.textBaseline = "middle";
    labels.forEach((label, laneIndex) => {
      const yTop = topPad + laneIndex * laneHeight;
      const yMid = yTop + laneHeight / 2;
      const yHigh = yTop + laneHeight * 0.28;
      const yLow = yTop + laneHeight * 0.72;

      context.strokeStyle = "rgba(148, 163, 184, 0.18)";
      context.beginPath();
      context.moveTo(leftPad, yLow);
      context.lineTo(width - rightPad, yLow);
      context.stroke();

      context.fillStyle = "rgba(226, 232, 240, 0.88)";
      context.fillText(label, 16 * dpr, yMid);

      if (!samples.length) {
        return;
      }

      context.strokeStyle = laneColors[laneIndex % laneColors.length];
      context.lineWidth = 2 * dpr;
      context.beginPath();
      const sampleToX = (sampleIndex) => leftPad + (sampleIndex / Math.max(1, samples.length - 1)) * graphWidth;
      const sampleToY = (sampleIndex) => sampleBit(samples, sampleIndex, laneIndex) ? yHigh : yLow;
      context.moveTo(leftPad, sampleToY(0));
      const step = Math.max(1, Math.floor(samples.length / graphWidth));
      let previousY = sampleToY(0);
      for (let sampleIndex = 1; sampleIndex < samples.length; sampleIndex += step) {
        const x = sampleToX(sampleIndex);
        const y = sampleToY(sampleIndex);
        context.lineTo(x, previousY);
        context.lineTo(x, y);
        previousY = y;
      }
      context.lineTo(width - rightPad, previousY);
      context.stroke();
    });

    if (!samples.length) {
      context.fillStyle = "rgba(226, 232, 240, 0.72)";
      context.font = `${15 * dpr}px Inter, Segoe UI, sans-serif`;
      context.textAlign = "center";
      context.fillText("Belum ada capture", width / 2, height / 2);
      context.textAlign = "left";
    }
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let notify = () => {};
    let busy = false;
    let autoRunId = 0;
    let stopPointerContainer = null;

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy);
      bindControls();
      requestAnimationFrame(() => {
        const canvas = mountedContainer?.querySelector("#logicAnalyzerCanvas");
        if (canvas) {
          drawWaveform(canvas, state.capture, state.mode);
        }
      });
    }

    function bindControls() {
      const deviceSelect = mountedContainer.querySelector("#logicAnalyzerDeviceSelect");
      const sampleRateInput = mountedContainer.querySelector("#logicAnalyzerSampleRateInput");
      const sampleCountInput = mountedContainer.querySelector("#logicAnalyzerSampleCountInput");
      const triggerInput = mountedContainer.querySelector("#logicAnalyzerTriggerInput");
      const checkButton = mountedContainer.querySelector("#logicAnalyzerCheckButton");
      const captureButton = mountedContainer.querySelector("#logicAnalyzerCaptureButton");
      const autoButton = mountedContainer.querySelector("#logicAnalyzerAutoButton");

      deviceSelect?.addEventListener("change", () => {
        state.deviceType = deviceSelect.value || "";
        state.device = null;
        state.capture = null;
        state.decodedRows = [];
        state.appliedTargetVoltage = "";
        state.appliedSpiProbeMode = "";
        state.autoPattern = createAutoState();
        state.errorMessage = "";
        state.message = state.deviceType ? "Koneksi dipilih." : "Pilih koneksi untuk mulai capture.";
        render();
      });

      mountedContainer.querySelectorAll("[data-logic-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          state.mode = normalizeMode(button.getAttribute("data-logic-mode"));
          state.errorMessage = "";
          state.decodedRows = state.capture ? decodeCapture({ ...state.capture, mode: state.mode }) : [];
          render();
        });
      });

      mountedContainer.querySelectorAll("[data-logic-voltage]").forEach((button) => {
        button.addEventListener("click", () => {
          const voltage = normalizeTargetVoltage(button.getAttribute("data-logic-voltage"));
          state.targetVoltage = voltage;
          state.errorMessage = "";
          withBusy(() => applySpiSniffMode());
        });
      });

      mountedContainer.querySelectorAll("[data-logic-spi-probe]").forEach((button) => {
        button.addEventListener("click", () => {
          const probeMode = normalizeSpiProbeMode(button.getAttribute("data-logic-spi-probe"));
          withBusy(() => applySpiProbeMode(probeMode));
        });
      });

      sampleRateInput?.addEventListener("change", () => {
        state.sampleRateHz = normalizeSampleRateHz(sampleRateInput.value);
        render();
      });

      sampleCountInput?.addEventListener("change", () => {
        const nextValue = Number(sampleCountInput.value || defaultSampleCount);
        state.sampleCount = Math.min(16384, Math.max(128, Number.isFinite(nextValue) ? Math.round(nextValue) : defaultSampleCount));
        render();
      });

      triggerInput?.addEventListener("change", () => {
        state.triggerEnabled = Boolean(triggerInput.checked);
      });

      checkButton?.addEventListener("click", () => withBusy(checkDevice));
      captureButton?.addEventListener("click", () => withBusy(captureLogic));
      autoButton?.addEventListener("click", () => {
        if (state.autoPattern.running) {
          stopAutoPattern();
        } else {
          startAutoPattern();
        }
      });
    }

    function bindStopPointerHandler() {
      if (!mountedContainer || stopPointerContainer === mountedContainer) {
        return;
      }

      stopPointerContainer?.removeEventListener("pointerdown", handleStopPointerDown, true);
      mountedContainer.addEventListener("pointerdown", handleStopPointerDown, true);
      stopPointerContainer = mountedContainer;
    }

    function handleStopPointerDown(event) {
      const target = event.target;
      const stopButton = target?.closest?.("#logicAnalyzerAutoButton");
      if (!stopButton || !mountedContainer?.contains(stopButton) || !state.autoPattern.running) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      stopAutoPattern();
    }

    function requireDeviceType() {
      if (!state.deviceType) {
        throw new Error("Pilih koneksi Logic Analyzer dulu.");
      }
      return state.deviceType;
    }

    function requireAutoCaptureDeviceType() {
      const deviceType = requireDeviceType();
      if (deviceType === wifiDeviceType) {
        throw new Error("Auto Capture stabil memakai USB. Pilih koneksi USB untuk rekam otomatis.");
      }
      return deviceType;
    }

    async function checkDevice() {
      const deviceType = requireDeviceType();
      state.message = "Mengecek device...";
      state.errorMessage = "";
      render();
      const device = await fetchJson(`/tools/logic-analyzer/device?deviceType=${encodeURIComponent(deviceType)}`, {
        timeoutMs: 5000
      });
      state.device = device;
      if (!device.success || device.isPresent === false) {
        throw new Error(sanitizePublicMessage(device.message || "Device Logic Analyzer tidak ditemukan."));
      }
      state.message = sanitizePublicMessage(device.message || "Device Logic Analyzer terhubung.");
      notify(state.message, "success");
    }

    async function applySpiSniffMode(options = {}) {
      requireDeviceType();
      const previousProbeMode = state.spiProbeMode;
      const previousAppliedProbeMode = state.appliedSpiProbeMode;
      const previousAppliedVoltage = state.appliedTargetVoltage;
      const quiet = Boolean(options.quiet);
      state.spiProbeMode = "SNIFF";
      state.appliedSpiProbeMode = "";
      state.appliedTargetVoltage = "";
      state.errorMessage = "";
      if (!quiet) {
        state.message = `Mengatur SPI SNIFF ${compactTargetVoltage(state.targetVoltage)}...`;
        render();
      }

      const normalizedVoltage = normalizeTargetVoltage(state.targetVoltage);
      const sniffResult = await fetchJson(`/spi-flash/flash-osc/spi-sniff/${targetVoltageRoute(normalizedVoltage)}`, {
        method: "POST",
        timeoutMs: 6000
      });
      if (!sniffResult.success) {
        state.spiProbeMode = previousProbeMode;
        state.appliedSpiProbeMode = previousAppliedProbeMode;
        state.appliedTargetVoltage = previousAppliedVoltage;
        throw new Error(sanitizePublicMessage(sniffResult.message || "SPI SNIFF gagal mengatur input monitor."));
      }

      state.appliedSpiProbeMode = "SNIFF";
      state.appliedTargetVoltage = normalizedVoltage;
      if (!quiet) {
        state.message = `SPI SNIFF aktif. Ref ${compactTargetVoltage(normalizedVoltage)}, input only.`;
        notify(state.message, "success");
        render();
      }
    }

    async function applySpiProbeMode(probeMode, options = {}) {
      state.spiProbeMode = normalizeSpiProbeMode(probeMode);
      await applySpiSniffMode(options);
    }

    async function ensureSpiProbeModeApplied() {
      if (normalizeMode(state.mode) !== "SPI") {
        return;
      }
      const voltage = normalizeTargetVoltage(state.targetVoltage);
      if (state.appliedSpiProbeMode === "SNIFF" && state.appliedTargetVoltage === voltage) {
        return;
      }
      await applySpiSniffMode({ quiet: true });
    }

    async function requestLogicCapture(deviceType, signal) {
      await ensureSpiProbeModeApplied();
      const result = await fetchJson("/tools/logic-analyzer/capture", {
        method: "POST",
        signal,
        body: JSON.stringify({
          deviceType,
          mode: normalizeMode(state.mode),
          sampleRateHz: normalizeSampleRateHz(state.sampleRateHz),
          sampleCount: Number(state.sampleCount || defaultSampleCount),
          targetVoltage: normalizeTargetVoltage(state.targetVoltage),
          spiProbeMode: normalizeMode(state.mode) === "SPI" ? "SNIFF" : normalizeSpiProbeMode(state.spiProbeMode),
          triggerEnabled: Boolean(state.triggerEnabled)
        })
      });
      if (!result.success) {
        throw new Error(sanitizePublicMessage(result.message || "Capture Logic Analyzer gagal."));
      }
      return {
        ...result,
        mode: normalizeMode(result.mode || state.mode),
        samples: normalizeSamples(result.samples),
        channelLabels: Array.isArray(result.channelLabels) && result.channelLabels.length
          ? result.channelLabels
          : (normalizeMode(result.mode || state.mode) === "SPI" ? ["CS", "CLK", "MOSI", "MISO"] : ["SDA", "SCL"])
      };
    }

    function applyLogicCapture(result) {
      state.capture = result;
      state.mode = state.capture.mode;
      state.targetVoltage = normalizeTargetVoltage(result.targetVoltage || state.targetVoltage);
      if (normalizeMode(state.mode) === "SPI") {
        state.spiProbeMode = "SNIFF";
        state.appliedSpiProbeMode = state.spiProbeMode;
        state.appliedTargetVoltage = state.targetVoltage;
      }
      state.sampleRateHz = normalizeSampleRateHz(result.requestedSampleRateHz || state.sampleRateHz);
      state.sampleCount = Number(result.sampleCount || state.sampleCount || defaultSampleCount);
      state.decodedRows = decodeCapture(state.capture);
      return state.decodedRows;
    }

    async function captureLogic() {
      const deviceType = requireDeviceType();
      if (state.capture) {
        state.capture = markI2cPinOrderChecking(state.capture);
      }
      state.message = normalizeMode(state.mode) === "SPI"
        ? `ARM Capture SPI SNIFF Ref ${compactTargetVoltage(state.targetVoltage)}...`
        : "Capture berjalan. Analisa SDA/SCL...";
      state.errorMessage = "";
      render();
      const result = await requestLogicCapture(deviceType);
      applyLogicCapture(result);
      state.message = sanitizePublicMessage(result.message || "Capture Logic Analyzer selesai.");
      notify(state.message, "success");
    }

    function stopAutoPattern(message = "Auto Capture akan berhenti setelah capture aktif selesai.") {
      autoRunId += 1;
      if (state.autoPattern.running || state.autoPattern.finishing) {
        state.autoPattern = {
          ...state.autoPattern,
          running: false,
          stopping: true,
          finishing: true
        };
        state.message = message;
        state.errorMessage = "";
        render();
      }
    }

    async function startAutoPattern() {
      if (busy || state.autoPattern.running) {
        return;
      }

      let deviceType = "";
      try {
        deviceType = requireAutoCaptureDeviceType();
      } catch (error) {
        state.errorMessage = sanitizePublicMessage(error?.message || "Pilih koneksi Logic Analyzer dulu.");
        notify(state.errorMessage, "warning");
        render();
        return;
      }

      const runId = autoRunId + 1;
      autoRunId = runId;
      const previousCapture = state.capture;
      state.autoPattern = createAutoState({ running: true });
      state.capture = hasLockedI2cPinOrder(previousCapture)
        ? markI2cPinOrderChecking(previousCapture)
        : null;
      state.decodedRows = [];
      state.errorMessage = "";
      state.message = "Auto Capture aktif. Menunggu data...";
      render();

      while (state.autoPattern.running && runId === autoRunId) {
        try {
          const result = await requestLogicCapture(deviceType);
          if (runId !== autoRunId || state.autoPattern.stopping) {
            break;
          }

          const rows = decodeCapture(result);
          const pattern = buildCapturePattern(result, rows);
          const attempts = (state.autoPattern.attempts || 0) + 1;

          if (!pattern.active) {
            state.autoPattern = {
              ...state.autoPattern,
              attempts,
              idleCaptures: (state.autoPattern.idleCaptures || 0) + 1,
              lastLabel: pattern.label || "idle"
            };
            state.message = `Auto Capture aktif. Capture ${formatNumber(attempts)} idle. Data valid tetap ditahan.`;
            render();
            await delayAutoPattern(runId);
            continue;
          }

          const validCaptures = (state.autoPattern.validCaptures || 0) + 1;
          const recordedRows = tagRecordedRows(rows, pattern, validCaptures);
          state.capture = carryLockedI2cPinOrder(result, state.capture);
          state.mode = result.mode;
          state.sampleRateHz = normalizeSampleRateHz(result.requestedSampleRateHz || state.sampleRateHz);
          state.sampleCount = Number(result.sampleCount || state.sampleCount || defaultSampleCount);
          state.decodedRows = [...state.decodedRows, ...recordedRows].slice(-maxRecordedDecodeRows);
          state.autoPattern = {
            ...state.autoPattern,
            attempts,
            validCaptures,
            lastLabel: pattern.label,
            matched: true
          };
          state.message = `Auto Capture merekam ${formatNumber(validCaptures)} capture valid. Stop untuk selesai.`;
          render();
          await delayAutoPattern(runId);
        } catch (error) {
          if (error?.name === "AbortError" || runId !== autoRunId) {
            break;
          }
          state.autoPattern = {
            ...state.autoPattern,
            running: false
          };
          state.errorMessage = sanitizePublicMessage(error?.message || "Auto Capture gagal.");
          notify(state.errorMessage, "warning");
          render();
          break;
        }
      }

      if (state.autoPattern.running || state.autoPattern.finishing) {
        state.autoPattern = {
          ...state.autoPattern,
          running: false,
          stopping: false,
          finishing: false
        };
        state.message = state.autoPattern.validCaptures
          ? `Auto Capture selesai. ${formatNumber(state.autoPattern.validCaptures)} capture valid tersimpan.`
          : "Auto Capture dihentikan.";
        render();
      }
    }

    function delayAutoPattern(runId) {
      return new Promise((resolve) => {
        window.setTimeout(() => {
          resolve(runId === autoRunId);
        }, autoCaptureDelayMs);
      });
    }

    async function withBusy(work) {
      if (busy || state.autoPattern.running) {
        return;
      }
      busy = true;
      render();
      try {
        await work();
      } catch (error) {
        state.errorMessage = sanitizePublicMessage(error?.message || "Operasi Logic Analyzer gagal.");
        notify(state.errorMessage, "warning");
      } finally {
        busy = false;
        render();
      }
    }

    return {
      viewKey: "tool_logic_analyzer",
      eyebrow: "Logic Analyzer",
      title: "Logic Analyzer",
      subtitle: "Capture digital I2C/SPI dari TEKNISIHUB_FLASH_OSC.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        notify = typeof options.notify === "function" ? options.notify : notify;
        bindStopPointerHandler();
        render();
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }
        mountedContainer.classList.toggle("hidden", !visible);
        if (!visible && state.autoPattern.running) {
          stopAutoPattern("Auto Capture akan berhenti setelah capture aktif selesai.");
        }
        if (visible) {
          render();
        }
      },
      async refresh() {
        render();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.logicAnalyzer = createApi();
})(window);
