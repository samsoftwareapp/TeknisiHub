(function initializeLogicAnalyzerPage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const connectionPlaceholderLabel = "---- PILIH KONEKSI ----";
  const defaultDeviceType = "";
  const defaultMode = "I2C";
  const defaultSampleRateHz = 500000;
  const defaultSampleCount = 8192;
  const maxDecodeRows = 120;
  const autoPatternDelayMs = 120;
  const minPatternTransitions = 4;
  const deviceProfiles = {
    TEKNISIHUB_FLASH_OSC_USB: {
      label: "TEKNISIHUB_FLASH_OSC",
      transport: "USB",
      icon: "usb"
    },
    TEKNISIHUB_FLASH_OSC_WIFI: {
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

  function normalizeMode(value) {
    return String(value || "").toUpperCase() === "SPI" ? "SPI" : "I2C";
  }

  function createInitialState() {
    return {
      deviceType: defaultDeviceType,
      mode: defaultMode,
      sampleRateHz: defaultSampleRateHz,
      sampleCount: defaultSampleCount,
      triggerEnabled: true,
      device: null,
      capture: null,
      decodedRows: [],
      message: "Pilih koneksi untuk mulai capture.",
      errorMessage: "",
      autoPattern: {
        running: false,
        attempts: 0,
        firstSignature: "",
        firstLabel: "",
        lastLabel: "",
        matched: false
      }
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

  function createWorkbenchMarkup(state, busy) {
    const autoRunning = Boolean(state.autoPattern?.running);
    const controlsLocked = busy || autoRunning;
    const disableAttr = controlsLocked ? " disabled" : "";
    const actionDisableAttr = busy ? " disabled" : "";
    const captureDisableAttr = controlsLocked ? " disabled" : "";
    const selectedProfile = selectedDeviceProfile(state.deviceType);
    const capture = state.capture;
    const sampleCount = Number(capture?.sampleCount || state.sampleCount || 0);
    const actualRate = Number(capture?.actualSampleRateHz || state.sampleRateHz || 0);
    const durationMs = actualRate > 0 ? (sampleCount / actualRate) * 1000 : 0;
    const statusMessage = state.errorMessage || state.message;
    const mode = normalizeMode(state.mode);
    const modeOptions = ["I2C", "SPI"].map((item) => `
      <button type="button" class="logic-analyzer-mode-button${mode === item ? " is-active" : ""}" data-logic-mode="${item}"${disableAttr}>
        <span>${item}</span>
      </button>
    `).join("");
    const autoBadge = autoRunning
      ? `Auto ${formatNumber(state.autoPattern.attempts || 0)}`
      : state.autoPattern?.matched
        ? "Pola match"
        : "Single";

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
              <span>${autoRunning ? "Stop" : "Auto Pattern"}</span>
            </button>
            <button type="button" id="logicAnalyzerCaptureButton" class="is-hero-action"${captureDisableAttr}>
              <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "play_arrow"}</span>
              <span>${busy ? "Capture..." : "Capture"}</span>
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
          <label>
            Sample Rate
            <input id="logicAnalyzerSampleRateInput" type="number" min="1000" max="1000000" step="1000" value="${escapeHtml(state.sampleRateHz)}"${disableAttr}>
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
          <span class="spi-mini-badge">${escapeHtml(formatRate(state.sampleRateHz))}</span>
          <span class="spi-mini-badge">${escapeHtml(formatNumber(state.sampleCount))} samples</span>
          <span class="spi-mini-badge">${escapeHtml(autoBadge)}</span>
        </div>
        <p class="spi-note">${escapeHtml(statusMessage)}</p>
      </section>

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
    let autoAbortController = null;

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

      sampleRateInput?.addEventListener("change", () => {
        const nextValue = Number(sampleRateInput.value || defaultSampleRateHz);
        state.sampleRateHz = Math.min(1000000, Math.max(1000, Number.isFinite(nextValue) ? Math.round(nextValue) : defaultSampleRateHz));
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

    function requireDeviceType() {
      if (!state.deviceType) {
        throw new Error("Pilih koneksi Logic Analyzer dulu.");
      }
      return state.deviceType;
    }

    async function checkDevice() {
      const deviceType = requireDeviceType();
      state.message = "Mengecek device...";
      state.errorMessage = "";
      render();
      const device = await fetchJson(`/tools/logic-analyzer/device?deviceType=${encodeURIComponent(deviceType)}`);
      state.device = device;
      if (!device.success || device.isPresent === false) {
        throw new Error(sanitizePublicMessage(device.message || "Device Logic Analyzer tidak ditemukan."));
      }
      state.message = sanitizePublicMessage(device.message || "Device Logic Analyzer terhubung.");
      notify(state.message, "success");
    }

    async function requestLogicCapture(deviceType, signal) {
      const result = await fetchJson("/tools/logic-analyzer/capture", {
        method: "POST",
        signal,
        body: JSON.stringify({
          deviceType,
          mode: normalizeMode(state.mode),
          sampleRateHz: Number(state.sampleRateHz || defaultSampleRateHz),
          sampleCount: Number(state.sampleCount || defaultSampleCount),
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
      state.sampleRateHz = Number(result.requestedSampleRateHz || state.sampleRateHz || defaultSampleRateHz);
      state.sampleCount = Number(result.sampleCount || state.sampleCount || defaultSampleCount);
      state.decodedRows = decodeCapture(state.capture);
      return state.decodedRows;
    }

    async function captureLogic() {
      const deviceType = requireDeviceType();
      state.message = "Capture berjalan...";
      state.errorMessage = "";
      render();
      const result = await requestLogicCapture(deviceType);
      applyLogicCapture(result);
      state.message = sanitizePublicMessage(result.message || "Capture Logic Analyzer selesai.");
      notify(state.message, "success");
    }

    function stopAutoPattern(message = "Auto Pattern dihentikan.") {
      autoRunId += 1;
      autoAbortController?.abort();
      autoAbortController = null;
      if (state.autoPattern.running) {
        state.autoPattern = {
          ...state.autoPattern,
          running: false
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
        deviceType = requireDeviceType();
      } catch (error) {
        state.errorMessage = sanitizePublicMessage(error?.message || "Pilih koneksi Logic Analyzer dulu.");
        notify(state.errorMessage, "warning");
        render();
        return;
      }

      const runId = autoRunId + 1;
      autoRunId = runId;
      state.autoPattern = {
        running: true,
        attempts: 0,
        firstSignature: "",
        firstLabel: "",
        lastLabel: "",
        matched: false
      };
      state.errorMessage = "";
      state.message = "Auto Pattern aktif. Menunggu pola...";
      render();

      while (state.autoPattern.running && runId === autoRunId) {
        autoAbortController = new AbortController();
        try {
          const result = await requestLogicCapture(deviceType, autoAbortController.signal);
          const rows = applyLogicCapture(result);
          const pattern = buildCapturePattern(state.capture, rows);
          const attempts = (state.autoPattern.attempts || 0) + 1;

          if (!pattern.active) {
            state.autoPattern = {
              ...state.autoPattern,
              attempts,
              lastLabel: pattern.label || "idle"
            };
            state.message = `Auto Pattern aktif. Capture ${formatNumber(attempts)}: idle.`;
            render();
            await delayAutoPattern(runId);
            continue;
          }

          if (!state.autoPattern.firstSignature) {
            state.autoPattern = {
              ...state.autoPattern,
              attempts,
              firstSignature: pattern.signature,
              firstLabel: pattern.label,
              lastLabel: pattern.label
            };
            state.message = `Pola pertama terkunci: ${pattern.label}.`;
            render();
            await delayAutoPattern(runId);
            continue;
          }

          if (pattern.signature === state.autoPattern.firstSignature) {
            state.autoPattern = {
              ...state.autoPattern,
              running: false,
              attempts,
              lastLabel: pattern.label,
              matched: true
            };
            state.message = `Pola sama ditemukan setelah ${formatNumber(attempts)} capture.`;
            notify(state.message, "success");
            render();
            break;
          }

          state.autoPattern = {
            ...state.autoPattern,
            attempts,
            lastLabel: pattern.label
          };
          state.message = `Pola berbeda (${formatNumber(attempts)}). Menunggu pola sama...`;
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
          state.errorMessage = sanitizePublicMessage(error?.message || "Auto Pattern gagal.");
          notify(state.errorMessage, "warning");
          render();
          break;
        } finally {
          autoAbortController = null;
        }
      }
    }

    function delayAutoPattern(runId) {
      return new Promise((resolve) => {
        window.setTimeout(() => {
          resolve(runId === autoRunId);
        }, autoPatternDelayMs);
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
        render();
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }
        mountedContainer.classList.toggle("hidden", !visible);
        if (!visible && state.autoPattern.running) {
          stopAutoPattern("Auto Pattern dihentikan.");
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
