(function initializeOscilloscopePage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const continuousDelayMs = 35;

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

  function formatNumber(value, fractionDigits = 0) {
    const number = Number(value || 0);
    if (!Number.isFinite(number)) {
      return "-";
    }
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(number);
  }

  function formatRate(value) {
    const rate = Number(value || 0);
    if (rate >= 1000000) {
      return `${formatNumber(rate / 1000000, 2)} MSa/s`;
    }
    if (rate >= 1000) {
      return `${formatNumber(rate / 1000, 1)} kSa/s`;
    }
    return `${formatNumber(rate)} Sa/s`;
  }

  function formatVoltage(value) {
    const voltage = Number(value || 0);
    if (!Number.isFinite(voltage)) {
      return "-";
    }
    if (Math.abs(voltage) < 1) {
      return `${formatNumber(voltage * 1000, 1)} mV`;
    }
    return `${formatNumber(voltage, 3)} V`;
  }

  function createRecordSessionId() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return [
      "osc",
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
      "_",
      pad(now.getHours()),
      pad(now.getMinutes()),
      pad(now.getSeconds())
    ].join("");
  }

  function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function adjustedVoltage(value, zeroOffsetVoltage = 0, calibrationGain = 1) {
    const gain = finiteNumber(calibrationGain, 1) || 1;
    return (finiteNumber(value) - finiteNumber(zeroOffsetVoltage)) * gain;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function percentile(sortedValues, ratio) {
    if (!sortedValues.length) {
      return 0;
    }

    const safeRatio = clamp(finiteNumber(ratio, 0.5), 0, 1);
    const index = safeRatio * (sortedValues.length - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    if (lowerIndex === upperIndex) {
      return sortedValues[lowerIndex];
    }

    const weight = index - lowerIndex;
    return sortedValues[lowerIndex] * (1 - weight) + sortedValues[upperIndex] * weight;
  }

  function niceNumber(value) {
    const safeValue = Math.max(Math.abs(finiteNumber(value, 1)), 0.000001);
    const exponent = Math.floor(Math.log10(safeValue));
    const base = 10 ** exponent;
    const fraction = safeValue / base;

    if (fraction <= 1) {
      return base;
    }
    if (fraction <= 2) {
      return 2 * base;
    }
    if (fraction <= 5) {
      return 5 * base;
    }
    return 10 * base;
  }

  function createVoltageScale(values, options = {}) {
    const cleanValues = (Array.isArray(values) ? values : [])
      .map((value) => finiteNumber(value, NaN))
      .filter(Number.isFinite);
    const tickCount = Math.max(2, Math.floor(finiteNumber(options.tickCount, 5)));
    const minSpan = Math.max(0.001, finiteNumber(options.minSpan, 0.2));
    const paddingRatio = clamp(finiteNumber(options.paddingRatio, 0.22), 0.05, 0.6);

    if (!cleanValues.length) {
      return {
        min: -minSpan / 2,
        max: minSpan / 2,
        range: minSpan,
        step: minSpan / tickCount
      };
    }

    const sortedValues = [...cleanValues].sort((left, right) => left - right);
    const center = Number.isFinite(options.center)
      ? Number(options.center)
      : percentile(sortedValues, 0.5);
    let min = percentile(sortedValues, finiteNumber(options.lowPercentile, 0.03));
    let max = percentile(sortedValues, finiteNumber(options.highPercentile, 0.97));

    const includeValues = Array.isArray(options.includeValues) ? options.includeValues : [];
    includeValues.forEach((value) => {
      const safeValue = finiteNumber(value, NaN);
      if (Number.isFinite(safeValue)) {
        min = Math.min(min, safeValue);
        max = Math.max(max, safeValue);
      }
    });

    let span = max - min;
    if (!Number.isFinite(span) || span < minSpan) {
      min = center - minSpan / 2;
      max = center + minSpan / 2;
      span = minSpan;
    } else {
      const padding = Math.max(span * paddingRatio, minSpan * 0.18);
      min -= padding;
      max += padding;
      span = max - min;
    }

    const step = niceNumber(span / tickCount);
    const niceMin = Math.floor(min / step) * step;
    const niceMax = Math.ceil(max / step) * step;
    const range = Math.max(step, niceMax - niceMin);

    return {
      min: niceMin,
      max: niceMin + range,
      range,
      step
    };
  }

  function formatAxisVoltage(value) {
    const voltage = finiteNumber(value);
    if (Math.abs(voltage) < 1) {
      return `${formatNumber(voltage * 1000, 0)}mV`;
    }
    if (Math.abs(voltage) < 10) {
      return `${formatNumber(voltage, 2)}V`;
    }
    return `${formatNumber(voltage, 1)}V`;
  }

  function createInitialState() {
    return {
      sampleRateHz: 100000,
      sampleCount: 4096,
      probeAttenuation: 10,
      zeroOffsetVoltage: 0,
      isZeroed: false,
      calibrationGain: 1,
      device: {
        success: false,
        isPresent: false,
        message: "TEKNISIHUB_STM32_OSC belum dicek.",
        identity: "",
        maxSampleRateHz: 1000000,
        maxSampleCount: 16384,
        bits: 12,
        vrefMv: 3300
      },
      capture: null,
      trendHistory: [],
      isRunning: false,
      isCapturing: false,
      isRecording: false,
      framesCaptured: 0,
      recordFrameCount: 0,
      recordSessionId: "",
      recordFilePath: "",
      tempCapturePath: "",
      message: "Siap capture.",
      errorMessage: ""
    };
  }

  function createWorkbenchMarkup(state, busy) {
    const device = state.device || {};
    const capture = state.capture || {};
    const hasCapture = Array.isArray(capture.samples) && capture.samples.length > 0;
    const zeroOffsetVoltage = Number(state.zeroOffsetVoltage || 0);
    const calibrationGain = Number(state.calibrationGain || 1);
    const zeroReady = Boolean(state.isZeroed);
    const adjustedMinVoltage = hasCapture ? adjustedVoltage(capture.minVoltage, zeroOffsetVoltage, calibrationGain) : 0;
    const adjustedMaxVoltage = hasCapture ? adjustedVoltage(capture.maxVoltage, zeroOffsetVoltage, calibrationGain) : 0;
    const adjustedAverageVoltage = hasCapture ? adjustedVoltage(capture.averageVoltage, zeroOffsetVoltage, calibrationGain) : 0;
    const adjustedTrendHistory = state.trendHistory.map((item) => ({
      min: adjustedVoltage(item.min, zeroOffsetVoltage, calibrationGain),
      max: adjustedVoltage(item.max, zeroOffsetVoltage, calibrationGain),
      avg: adjustedVoltage(item.avg, zeroOffsetVoltage, calibrationGain)
    }));
    const adjustedTrendAverages = adjustedTrendHistory
      .map((item) => item.avg)
      .filter(Number.isFinite);
    const statusClass = device.isPresent ? " is-success" : "";
    const configDisableAttr = busy || state.isRunning ? " disabled" : "";
    const scanDisableAttr = busy || state.isRunning ? " disabled" : "";
    const singleDisableAttr = busy || state.isRunning ? " disabled" : "";
    const runDisableAttr = busy ? " disabled" : "";
    const recordDisableAttr = busy ? " disabled" : "";
    const zeroDisableAttr = busy || !hasCapture ? " disabled" : "";
    const calDisableAttr = busy || !hasCapture || !zeroReady ? " disabled" : "";
    const modeLabel = state.isRecording ? "REC" : state.isRunning ? "RUN" : "STOP";
    const storageLabel = state.isRecording
      ? `${formatNumber(state.recordFrameCount)} frame`
      : state.tempCapturePath
        ? "Temp Roaming"
        : "-";

    return `
      <div class="oscilloscope-layout">
        <section class="spi-card${statusClass}">
          <div class="spi-card-head">
            <div>
              <p class="label">Device</p>
              <h4>STM32 OSC</h4>
            </div>
            <button type="button" id="oscilloscopeScanButton" class="ghost"${scanDisableAttr}>
              <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "usb"}</span>
              <span>Scan</span>
            </button>
          </div>
          <div class="spi-inline-meta oscilloscope-meta">
            <span>Status <strong>${escapeHtml(device.isPresent ? "Terhubung" : "Belum terhubung")}</strong></span>
            <span>Mode <strong>${escapeHtml(modeLabel)}</strong></span>
            <span>Device <strong>${escapeHtml(device.deviceLabel || "TEKNISIHUB_STM32_OSC")}</strong></span>
            <span>ADC <strong>${escapeHtml(`${device.bits || 12}-bit`)}</strong></span>
            <span>Max <strong>${escapeHtml(formatRate(device.maxSampleRateHz || 1000000))}</strong></span>
          </div>
          <p class="spi-note">${escapeHtml(state.errorMessage || state.message || device.message)}</p>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Capture</p>
              <h4>Parameter sampling</h4>
            </div>
            <div class="oscilloscope-actions">
              <button type="button" id="oscilloscopeSingleButton" class="ghost"${singleDisableAttr}>
                <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "show_chart"}</span>
                <span>Single</span>
              </button>
              <button type="button" id="oscilloscopeRunButton" class="ghost oscilloscope-run-button${state.isRunning ? " is-active" : ""}"${runDisableAttr}>
                <span class="material-symbols-outlined${state.isRunning && state.isCapturing ? " is-spinning" : ""}">${state.isRunning && state.isCapturing ? "progress_activity" : state.isRunning ? "pause" : "play_arrow"}</span>
                <span>${state.isRunning ? "Stop" : "Run"}</span>
              </button>
              <button type="button" id="oscilloscopeRecordButton" class="ghost oscilloscope-record-button${state.isRecording ? " is-active" : ""}"${recordDisableAttr}>
                <span class="material-symbols-outlined">fiber_manual_record</span>
                <span>${state.isRecording ? "Stop Rec" : "Record"}</span>
              </button>
              <button type="button" id="oscilloscopeZeroButton" class="ghost"${zeroDisableAttr}>
                <span class="material-symbols-outlined">vertical_align_center</span>
                <span>Zero</span>
              </button>
              <button type="button" id="oscilloscopeCal3vButton" class="ghost"${calDisableAttr}>
                <span class="material-symbols-outlined">speed</span>
                <span>Cal 3V</span>
              </button>
              <button type="button" id="oscilloscopeClearZeroButton" class="ghost"${busy || (!zeroReady && calibrationGain === 1) ? " disabled" : ""}>
                <span class="material-symbols-outlined">restart_alt</span>
                <span>Clear</span>
              </button>
            </div>
          </div>
          <div class="spi-form-grid oscilloscope-form-grid">
            <label>
              Sample Rate
              <select id="oscilloscopeSampleRate"${configDisableAttr}>
                ${[10000, 50000, 100000, 250000, 500000, 1000000].map((rate) => `
                  <option value="${rate}"${Number(state.sampleRateHz) === rate ? " selected" : ""}>${escapeHtml(formatRate(rate))}</option>
                `).join("")}
              </select>
            </label>
            <label>
              Sample Count
              <select id="oscilloscopeSampleCount"${configDisableAttr}>
                ${[1024, 2048, 4096, 8192, 16384].map((count) => `
                  <option value="${count}"${Number(state.sampleCount) === count ? " selected" : ""}>${escapeHtml(formatNumber(count))}</option>
                `).join("")}
              </select>
            </label>
            <label>
              Probe
              <select id="oscilloscopeProbe"${configDisableAttr}>
                <option value="10"${Number(state.probeAttenuation) === 10 ? " selected" : ""}>x10</option>
                <option value="1"${Number(state.probeAttenuation) === 1 ? " selected" : ""}>x1</option>
              </select>
            </label>
            <label>
              Durasi
              <input type="text" value="${escapeHtml(formatNumber(Number(state.sampleCount || 0) / Number(state.sampleRateHz || 1) * 1000, 2))} ms" readonly>
            </label>
          </div>
          <div class="spi-inline-meta oscilloscope-meta">
            <span>Frame <strong>${escapeHtml(formatNumber(state.framesCaptured))}</strong></span>
            <span>Storage <strong>${escapeHtml(storageLabel)}</strong></span>
            <span>Zero <strong>${escapeHtml(zeroReady ? formatVoltage(zeroOffsetVoltage) : "Raw")}</strong></span>
            <span>Gain <strong>${escapeHtml(calibrationGain === 1 ? "1.000x" : `${formatNumber(calibrationGain, 3)}x`)}</strong></span>
            <span>Record ID <strong>${escapeHtml(state.recordSessionId || "-")}</strong></span>
          </div>
          <p class="spi-note">Untuk target 0-30VDC gunakan probe x10. Ground probe tersambung ke ground USB/PC.</p>
        </section>

        <section class="spi-card oscilloscope-waveform-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Waveform</p>
              <h4>${hasCapture ? escapeHtml(`${formatRate(capture.actualSampleRateHz)} / ${formatNumber(capture.sampleCount)} sample`) : "Standby"}</h4>
            </div>
            <span class="spi-mini-badge">${escapeHtml(hasCapture ? `${formatNumber(capture.durationMs, 2)} ms / Auto Y` : "No data")}</span>
          </div>
          <div class="oscilloscope-waveform-wrap">
            <canvas id="oscilloscopeWaveformCanvas" class="oscilloscope-waveform" width="1200" height="420"></canvas>
          </div>
          <div class="spi-inline-meta oscilloscope-meta">
            <span>Min <strong>${escapeHtml(hasCapture ? formatVoltage(adjustedMinVoltage) : "-")}</strong></span>
            <span>Max <strong>${escapeHtml(hasCapture ? formatVoltage(adjustedMaxVoltage) : "-")}</strong></span>
            <span>Avg <strong>${escapeHtml(hasCapture ? formatVoltage(adjustedAverageVoltage) : "-")}</strong></span>
            <span>Raw Avg <strong>${escapeHtml(hasCapture ? formatVoltage(capture.averageVoltage) : "-")}</strong></span>
            <span>Scale <strong>${escapeHtml(hasCapture ? `${formatVoltage(capture.voltsPerCount)} / count` : "-")}</strong></span>
          </div>
        </section>

        <section class="spi-card oscilloscope-waveform-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Voltage Trace</p>
              <h4>${escapeHtml(`${formatNumber(state.trendHistory.length)} frame`)}</h4>
            </div>
            <span class="spi-mini-badge">Avg Auto Y</span>
          </div>
          <div class="oscilloscope-trend-wrap">
            <canvas id="oscilloscopeTrendCanvas" class="oscilloscope-trend" width="1200" height="260"></canvas>
          </div>
          <div class="spi-inline-meta oscilloscope-meta">
            <span>Trace Low <strong>${escapeHtml(adjustedTrendAverages.length ? formatVoltage(Math.min(...adjustedTrendAverages)) : "-")}</strong></span>
            <span>Trace High <strong>${escapeHtml(adjustedTrendAverages.length ? formatVoltage(Math.max(...adjustedTrendAverages)) : "-")}</strong></span>
            <span>Last Avg <strong>${escapeHtml(adjustedTrendHistory.length ? formatVoltage(adjustedTrendHistory[adjustedTrendHistory.length - 1].avg) : "-")}</strong></span>
          </div>
        </section>
      </div>
    `;
  }

  function drawWaveform(container, capture, probeAttenuation, zeroOffsetVoltage = 0, calibrationGain = 1) {
    const canvas = container?.querySelector("#oscilloscopeWaveformCanvas");
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(600, Math.floor((rect.width || 900) * dpr));
    const height = Math.max(300, Math.floor((rect.height || 360) * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#07131d";
    ctx.fillRect(0, 0, width, height);

    const padLeft = 54 * dpr;
    const padRight = 18 * dpr;
    const padTop = 18 * dpr;
    const padBottom = 34 * dpr;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;
    const samples = capture?.samples || [];
    const voltsPerCount = Number(capture?.voltsPerCount || 0);
    const zeroOffset = finiteNumber(zeroOffsetVoltage);
    const gain = finiteNumber(calibrationGain, 1) || 1;
    const probe = finiteNumber(probeAttenuation, 10);
    const averageVoltage = adjustedVoltage(capture?.averageVoltage, zeroOffset, gain);
    const sampleVoltages = voltsPerCount > 0
      ? samples.map((sample) => adjustedVoltage(Number(sample || 0) * voltsPerCount, zeroOffset, gain))
      : [];
    const scaleValues = sampleVoltages.length ? sampleVoltages : [averageVoltage];
    const minSpan = Math.max(probe >= 10 ? 0.15 : 0.03, Math.abs(averageVoltage) * 0.04);
    const voltageScale = createVoltageScale(scaleValues, {
      lowPercentile: 0.15,
      highPercentile: 0.85,
      minSpan,
      paddingRatio: 0.2,
      tickCount: 6,
      includeValues: [averageVoltage]
    });
    const scaleMinVoltage = voltageScale.min;
    const scaleMaxVoltage = voltageScale.max;
    const scaleRangeVoltage = voltageScale.range;
    const valueToY = (value) =>
      padTop + (scaleMaxVoltage - clamp(value, scaleMinVoltage, scaleMaxVoltage)) / scaleRangeVoltage * plotHeight;

    ctx.strokeStyle = "rgba(120, 178, 210, 0.22)";
    ctx.lineWidth = 1 * dpr;
    ctx.font = `${11 * dpr}px Consolas, monospace`;
    ctx.fillStyle = "rgba(220, 240, 250, 0.72)";
    for (let i = 0; i <= 8; i += 1) {
      const x = padLeft + (plotWidth / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotHeight);
      ctx.stroke();
    }
    for (let i = 0; i <= 6; i += 1) {
      const y = padTop + (plotHeight / 6) * i;
      const labelVoltage = scaleMaxVoltage - (scaleRangeVoltage / 6) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotWidth, y);
      ctx.stroke();
      ctx.fillText(formatAxisVoltage(labelVoltage), 8 * dpr, y + 4 * dpr);
    }

    if (scaleMinVoltage < 0 && scaleMaxVoltage > 0) {
      const zeroY = valueToY(0);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.moveTo(padLeft, zeroY);
      ctx.lineTo(padLeft + plotWidth, zeroY);
      ctx.stroke();
    }

    if (!sampleVoltages.length || voltsPerCount <= 0) {
      ctx.fillStyle = "rgba(220, 240, 250, 0.78)";
      ctx.textAlign = "center";
      ctx.fillText("Belum ada capture", width / 2, height / 2);
      ctx.textAlign = "start";
      return;
    }

    ctx.strokeStyle = "#35d0a2";
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    const step = Math.max(1, sampleVoltages.length / Math.max(1, plotWidth));
    let first = true;
    for (let xIndex = 0; xIndex < plotWidth; xIndex += 1) {
      const sampleIndex = Math.min(sampleVoltages.length - 1, Math.floor(xIndex * step));
      const voltage = sampleVoltages[sampleIndex];
      const y = valueToY(voltage);
      const x = padLeft + xIndex;
      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  function drawTrendLine(ctx, points, plot, valueToY, key, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    points.forEach((point, index) => {
      const x = plot.left + (points.length <= 1 ? 0 : (plot.width / (points.length - 1)) * index);
      const y = valueToY(Number(point[key] || 0));
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }

  function drawVoltageTrace(container, points, probeAttenuation, zeroOffsetVoltage = 0, calibrationGain = 1) {
    const canvas = container?.querySelector("#oscilloscopeTrendCanvas");
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(600, Math.floor((rect.width || 900) * dpr));
    const height = Math.max(220, Math.floor((rect.height || 240) * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#07131d";
    ctx.fillRect(0, 0, width, height);

    const plot = {
      left: 54 * dpr,
      right: 18 * dpr,
      top: 16 * dpr,
      bottom: 30 * dpr
    };
    plot.width = width - plot.left - plot.right;
    plot.height = height - plot.top - plot.bottom;

    const zeroOffset = finiteNumber(zeroOffsetVoltage);
    const gain = finiteNumber(calibrationGain, 1) || 1;
    const probe = finiteNumber(probeAttenuation, 10);
    const safePoints = (Array.isArray(points) ? points : []).map((point) => ({
      min: adjustedVoltage(point.min, zeroOffset, gain),
      max: adjustedVoltage(point.max, zeroOffset, gain),
      avg: adjustedVoltage(point.avg, zeroOffset, gain)
    }));
    const averageValues = safePoints
      .map((point) => point.avg)
      .filter(Number.isFinite);
    const averageCenter = averageValues.length
      ? percentile([...averageValues].sort((left, right) => left - right), 0.5)
      : 0;
    const lastAverage = averageValues.length ? averageValues[averageValues.length - 1] : averageCenter;
    const minSpan = Math.max(probe >= 10 ? 0.12 : 0.025, Math.abs(averageCenter) * 0.05);
    const voltageScale = createVoltageScale(averageValues.length ? averageValues : [0], {
      lowPercentile: 0,
      highPercentile: 1,
      minSpan,
      paddingRatio: 0.3,
      tickCount: 4,
      center: averageCenter,
      includeValues: [lastAverage]
    });
    const scaleMinVoltage = voltageScale.min;
    const scaleMaxVoltage = voltageScale.max;
    const scaleRangeVoltage = voltageScale.range;
    const valueToY = (value) =>
      plot.top + (scaleMaxVoltage - clamp(value, scaleMinVoltage, scaleMaxVoltage)) / scaleRangeVoltage * plot.height;

    ctx.strokeStyle = "rgba(120, 178, 210, 0.22)";
    ctx.lineWidth = 1 * dpr;
    ctx.font = `${11 * dpr}px Consolas, monospace`;
    ctx.fillStyle = "rgba(220, 240, 250, 0.72)";
    for (let i = 0; i <= 8; i += 1) {
      const x = plot.left + (plot.width / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, plot.top);
      ctx.lineTo(x, plot.top + plot.height);
      ctx.stroke();
    }
    for (let i = 0; i <= 4; i += 1) {
      const y = plot.top + (plot.height / 4) * i;
      const labelVoltage = scaleMaxVoltage - (scaleRangeVoltage / 4) * i;
      ctx.beginPath();
      ctx.moveTo(plot.left, y);
      ctx.lineTo(plot.left + plot.width, y);
      ctx.stroke();
      ctx.fillText(formatAxisVoltage(labelVoltage), 8 * dpr, y + 4 * dpr);
    }

    if (scaleMinVoltage < 0 && scaleMaxVoltage > 0) {
      const zeroY = valueToY(0);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.moveTo(plot.left, zeroY);
      ctx.lineTo(plot.left + plot.width, zeroY);
      ctx.stroke();
    }

    if (!safePoints.length) {
      ctx.fillStyle = "rgba(220, 240, 250, 0.78)";
      ctx.textAlign = "center";
      ctx.fillText("Belum ada trace", width / 2, height / 2);
      ctx.textAlign = "start";
      return;
    }

    ctx.fillStyle = "rgba(45, 115, 185, 0.08)";
    ctx.beginPath();
    safePoints.forEach((point, index) => {
      const x = plot.left + (safePoints.length <= 1 ? 0 : (plot.width / (safePoints.length - 1)) * index);
      const y = valueToY(Number(point.max || 0));
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    for (let index = safePoints.length - 1; index >= 0; index -= 1) {
      const point = safePoints[index];
      const x = plot.left + (safePoints.length <= 1 ? 0 : (plot.width / (safePoints.length - 1)) * index);
      ctx.lineTo(x, valueToY(Number(point.min || 0)));
    }
    ctx.closePath();
    ctx.fill();

    drawTrendLine(ctx, safePoints, plot, valueToY, "max", "rgba(239, 182, 79, 0.42)", 1 * dpr);
    drawTrendLine(ctx, safePoints, plot, valueToY, "avg", "#35d0a2", 2.2 * dpr);
    drawTrendLine(ctx, safePoints, plot, valueToY, "min", "rgba(125, 183, 255, 0.42)", 1 * dpr);
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let busy = false;
    let notify = () => {};
    let loopTimer = null;
    let loopGeneration = 0;

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy);
      drawWaveform(mountedContainer, state.capture, state.probeAttenuation, state.zeroOffsetVoltage, state.calibrationGain);
      drawVoltageTrace(mountedContainer, state.trendHistory, state.probeAttenuation, state.zeroOffsetVoltage, state.calibrationGain);

      bindActionButton("#oscilloscopeScanButton", () => withBusy(scanDevice));
      bindActionButton("#oscilloscopeSingleButton", () => withBusy(() => captureWaveform({ saveTemporary: true })));
      bindActionButton("#oscilloscopeRunButton", toggleContinuous);
      bindActionButton("#oscilloscopeRecordButton", toggleRecording);
      bindActionButton("#oscilloscopeZeroButton", zeroDisplay);
      bindActionButton("#oscilloscopeCal3vButton", calibrateThreeVolts);
      bindActionButton("#oscilloscopeClearZeroButton", clearZero);
      mountedContainer.querySelector("#oscilloscopeSampleRate")?.addEventListener("change", (event) => {
        state.sampleRateHz = Number(event.target.value || state.sampleRateHz);
        render();
      });
      mountedContainer.querySelector("#oscilloscopeSampleCount")?.addEventListener("change", (event) => {
        state.sampleCount = Number(event.target.value || state.sampleCount);
        render();
      });
      mountedContainer.querySelector("#oscilloscopeProbe")?.addEventListener("change", (event) => {
        state.probeAttenuation = Number(event.target.value || state.probeAttenuation);
        render();
      });
    }

    function bindActionButton(selector, handler) {
      const button = mountedContainer?.querySelector(selector);
      if (!button) {
        return;
      }

      const invoke = (event) => {
        if (button.disabled) {
          return;
        }
        event.preventDefault();
        handler();
      };

      button.addEventListener("pointerdown", invoke);
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          invoke(event);
        }
      });
    }

    async function withBusy(work) {
      if (busy || state.isRunning) {
        return;
      }

      busy = true;
      state.errorMessage = "";
      render();
      try {
        await work();
      } catch (error) {
        state.errorMessage = error?.message || "Operasi oscilloscope gagal.";
        notify(state.errorMessage, "warning");
      } finally {
        busy = false;
        render();
      }
    }

    async function scanDevice() {
      const device = await fetchJson("/tools/oscilloscope/device");
      state.device = { ...state.device, ...device };
      state.message = device.message || "Scan selesai.";
      if (device.isPresent) {
        notify("TEKNISIHUB_STM32_OSC terhubung.", "success");
      }
    }

    async function requestCapture({ saveTemporary = true, recordEnabled = false } = {}) {
      return fetchJson("/tools/oscilloscope/capture", {
        method: "POST",
        body: JSON.stringify({
          sampleRateHz: Number(state.sampleRateHz || 100000),
          sampleCount: Number(state.sampleCount || 4096),
          probeAttenuation: Number(state.probeAttenuation || 10),
          saveTemporary,
          recordEnabled,
          recordSessionId: state.recordSessionId || ""
        })
      });
    }

    async function captureWaveform({ saveTemporary = true, recordEnabled = false } = {}) {
      const result = await requestCapture({ saveTemporary, recordEnabled });
      applyCaptureResult(result);
      state.framesCaptured += 1;
      state.message = result.message || "Capture selesai.";
      notify(state.message, "success");
    }

    function applyCaptureResult(result) {
      state.capture = result;
      appendTrendPoint(result);
      state.device = {
        ...state.device,
        isPresent: true,
        success: true,
        identity: result.identity || state.device.identity
      };
      state.tempCapturePath = result.tempCapturePath || state.tempCapturePath;
      if (result.recordSessionId) {
        state.recordSessionId = result.recordSessionId;
      }
      if (result.recordFilePath) {
        state.recordFilePath = result.recordFilePath;
      }
      if (result.recorded) {
        state.recordFrameCount += 1;
      }
    }

    function zeroDisplay() {
      if (!state.capture || !Number.isFinite(Number(state.capture.averageVoltage))) {
        return;
      }
      state.zeroOffsetVoltage = Number(state.capture.averageVoltage || 0);
      state.isZeroed = true;
      state.calibrationGain = 1;
      state.trendHistory = [];
      state.message = `Zero diset ke ${formatVoltage(state.zeroOffsetVoltage)}.`;
      render();
      notify(state.message, "success");
    }

    function calibrateThreeVolts() {
      if (!state.capture || !Number.isFinite(Number(state.capture.averageVoltage)) || !state.isZeroed) {
        state.message = "Zero dulu saat probe ke GND, lalu sentuh 3V dan klik Cal 3V.";
        render();
        notify(state.message, "warning");
        return;
      }

      const measuredDelta = Number(state.capture.averageVoltage || 0) - Number(state.zeroOffsetVoltage || 0);
      if (Math.abs(measuredDelta) < 0.05) {
        state.message = "Cal 3V gagal: delta terlalu kecil. Pastikan input sedang di 3V.";
        render();
        notify(state.message, "warning");
        return;
      }

      state.calibrationGain = 3 / measuredDelta;
      state.trendHistory = [];
      state.message = `Cal 3V diset, gain ${formatNumber(state.calibrationGain, 3)}x.`;
      render();
      notify(state.message, "success");
    }

    function clearZero() {
      state.zeroOffsetVoltage = 0;
      state.isZeroed = false;
      state.calibrationGain = 1;
      state.trendHistory = [];
      state.message = "Zero dan Cal 3V dibersihkan.";
      render();
      notify(state.message, "info");
    }

    function appendTrendPoint(result) {
      if (!result || !Number.isFinite(Number(result.averageVoltage))) {
        return;
      }
      state.trendHistory = [
        ...state.trendHistory,
        {
          min: Number(result.minVoltage || 0),
          max: Number(result.maxVoltage || 0),
          avg: Number(result.averageVoltage || 0)
        }
      ].slice(-240);
    }

    function toggleContinuous() {
      if (state.isRunning) {
        stopContinuous("Run berhenti.");
        return;
      }

      startContinuous();
    }

    function startContinuous() {
      if (busy || state.isRunning) {
        return;
      }

      state.isRunning = true;
      state.isCapturing = false;
      state.framesCaptured = 0;
      state.trendHistory = [];
      state.errorMessage = "";
      state.message = "Run berjalan.";
      loopGeneration += 1;
      render();
      scheduleNextCapture(0, loopGeneration);
      notify("Oscilloscope run berjalan.", "success");
    }

    function stopContinuous(message, { silent = false } = {}) {
      if (!state.isRunning && !state.isRecording) {
        return;
      }

      loopGeneration += 1;
      if (loopTimer) {
        clearTimeout(loopTimer);
        loopTimer = null;
      }
      state.isRunning = false;
      state.isCapturing = false;
      if (state.isRecording) {
        state.isRecording = false;
        state.message = state.recordFilePath
          ? `Record berhenti. File: ${state.recordFilePath}`
          : message;
      } else {
        state.message = message;
      }
      if (!silent) {
        notify(state.message, "info");
      }
      render();
    }

    function scheduleNextCapture(delayMs, generation) {
      if (loopTimer) {
        clearTimeout(loopTimer);
      }
      loopTimer = setTimeout(() => captureContinuousFrame(generation), delayMs);
    }

    async function captureContinuousFrame(generation) {
      if (!state.isRunning || generation !== loopGeneration) {
        return;
      }

      state.isCapturing = true;
      try {
        const result = await requestCapture({
          saveTemporary: state.isRecording,
          recordEnabled: state.isRecording
        });
        if (!state.isRunning || generation !== loopGeneration) {
          return;
        }

        applyCaptureResult(result);
        state.framesCaptured += 1;
        state.errorMessage = "";
        state.message = state.isRecording
          ? `Record berjalan: ${formatNumber(state.recordFrameCount)} frame.`
          : `Run berjalan: ${formatNumber(state.framesCaptured)} frame.`;
      } catch (error) {
        state.errorMessage = error?.message || "Continuous capture gagal.";
        state.isRunning = false;
        state.isRecording = false;
        notify(state.errorMessage, "warning");
      } finally {
        state.isCapturing = false;
        render();
        if (state.isRunning && generation === loopGeneration) {
          scheduleNextCapture(continuousDelayMs, generation);
        }
      }
    }

    function toggleRecording() {
      if (state.isRecording) {
        state.isRecording = false;
        state.message = state.recordFilePath
          ? `Record berhenti. File: ${state.recordFilePath}`
          : "Record berhenti.";
        render();
        notify(state.message, "info");
        return;
      }

      state.isRecording = true;
      state.recordSessionId = createRecordSessionId();
      state.recordFrameCount = 0;
      state.recordFilePath = "";
      state.errorMessage = "";
      state.message = "Record berjalan.";
      if (!state.isRunning) {
        startContinuous();
      } else {
        render();
      }
      notify("Record mulai.", "success");
    }

    return {
      viewKey: "tool_oscilloscope",
      eyebrow: "Oscilloscope",
      title: "STM32 Oscilloscope",
      subtitle: "Continuous capture single-channel dari TEKNISIHUB_STM32_OSC.",
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
        if (!visible) {
          stopContinuous("Run dihentikan.", { silent: true });
          return;
        }
        requestAnimationFrame(() => {
          drawWaveform(mountedContainer, state.capture, state.probeAttenuation, state.zeroOffsetVoltage, state.calibrationGain);
          drawVoltageTrace(mountedContainer, state.trendHistory, state.probeAttenuation, state.zeroOffsetVoltage, state.calibrationGain);
        });
      },
      async refresh() {
        render();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.oscilloscope = createApi();
})(window);
