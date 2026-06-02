(function initializeOscilloscopePage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const continuousDelayMs = 70;
  const maxRecordSamples = 110000;
  const maxVoltageHistoryFrames = 1200;
  const referenceWarmupFrames = 8;
  const fftAverageDepth = 8;
  const fftMaxSize = 8192;
  const fftLowCutHz = 1;
  const minimumFftPeakMagnitude = 0.002;
  const defaultCalPadFrequencyHz = 1000;
  const defaultCalPadMode = "square_1khz";
  const minimumPulseDetectVpp = 0.25;
  const defaultSampleRateHz = 480000;
  const singleChannelMaxSampleRateHz = 2000000;
  const dualChannelSampleRateHz = 200000;
  const defaultSampleCount = 8192;
  const singleChannelSampleCount = 16384;
  const dualChannelSampleCount = 8192;
  const defaultDisplayMode = "yt";
  const defaultProbeAttenuation = 10;
  const settingsStorageKey = "teknisihub.oscilloscope.settings.v2";
  const connectionPlaceholderLabel = "---- PILIH KONEKSI ----";
  const probeProfiles = {
    1: { value: 1, label: "1X 0-3.3V", min: 0, max: 3.3, minSpan: 0.5 },
    10: { value: 10, label: "10X 0-30V", min: 0, max: 30, minSpan: 5 }
  };
  const channelStyles = [
    {
      label: "CH1",
      line: "#ffd56f",
      shadow: "rgba(255, 213, 111, 0.24)",
      fill: "rgba(255, 213, 111, 0.10)"
    },
    {
      label: "CH2",
      line: "#2de4c1",
      shadow: "rgba(45, 228, 193, 0.24)",
      fill: "rgba(45, 228, 193, 0.10)"
    }
  ];
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
  const defaultDeviceType = "TEKNISIHUB_FLASH_OSC_USB";
  const calPadModes = [
    { key: "dc_low", label: "DC Low", frequencyHz: 0, dutyPercent: 0 },
    { key: "dc_high", label: "DC High", frequencyHz: 0, dutyPercent: 100 },
    { key: "square_10hz", label: "Square 10 Hz", frequencyHz: 10, dutyPercent: 50, lowRate: true },
    { key: "square_100hz", label: "Square 100 Hz", frequencyHz: 100, dutyPercent: 50, lowRate: true },
    { key: "square_1khz", label: "Square 1 kHz", frequencyHz: 1000, dutyPercent: 50 },
    { key: "square_10khz", label: "Square 10 kHz", frequencyHz: 10000, dutyPercent: 50 },
    { key: "duty_10", label: "Duty 10% @ 1 kHz", frequencyHz: 1000, dutyPercent: 10 },
    { key: "duty_25", label: "Duty 25% @ 1 kHz", frequencyHz: 1000, dutyPercent: 25 },
    { key: "duty_50", label: "Duty 50% @ 1 kHz", frequencyHz: 1000, dutyPercent: 50 },
    { key: "duty_75", label: "Duty 75% @ 1 kHz", frequencyHz: 1000, dutyPercent: 75 },
    { key: "duty_90", label: "Duty 90% @ 1 kHz", frequencyHz: 1000, dutyPercent: 90 },
    { key: "pulse_100hz", label: "Pulse 100 Hz", frequencyHz: 100, dutyPercent: 5, lowRate: true },
    { key: "step_10hz_10khz", label: "Step 10 Hz-10 kHz", frequencyHz: 0, dutyPercent: 50, lowRate: true, variable: true },
    { key: "pwm_20khz_25", label: "PWM 20 kHz 25%", frequencyHz: 20000, dutyPercent: 25 },
    { key: "pwm_20khz_50", label: "PWM 20 kHz 50%", frequencyHz: 20000, dutyPercent: 50 },
    { key: "pwm_20khz_75", label: "PWM 20 kHz 75%", frequencyHz: 20000, dutyPercent: 75 }
  ];
  const calPadModeMap = Object.fromEntries(calPadModes.map((mode) => [mode.key, mode]));

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
      /\b(protocol|programmer|spi|vcc|wifi|endpoint)\s*=/i.test(message) ||
      /\bGP\d+\b|\bGPIO\d+\b/i.test(message) ||
      /\b(libusb|winusb|stack trace|exception)\b/i.test(message) ||
      /[A-Z]:\\|\/Users\/|\/home\//i.test(message)
    ) {
      return message.toLowerCase().includes("terhubung")
        ? "Device OSC terhubung."
        : "Operasi OSC gagal. Periksa koneksi lalu coba lagi.";
    }
    return message
      .replace(/\bLocalService\b/g, "aplikasi lokal")
      .replace(/\blocal service\b/gi, "aplikasi lokal")
      .replace(/\bLocal API\b/gi, "aplikasi lokal")
      .replace(/\bbackend\b/gi, "sistem")
      .replace(/\bGoogle\s+Drive\b/gi, "penyimpanan file")
      .replace(/\bRTDB\b/gi, "sistem akses")
      .replace(/\bRTD\b/gi, "sistem akses")
      .replace(/\bregistry\b/gi, "data akses")
      .replace(/\bFirebase\b/gi, "sistem akses")
      .replace(/\bGemini\b/gi, "fitur saran")
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

  function formatNumber(value, fractionDigits = 0) {
    const number = Number(value);
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

  function formatSampleRateOption(value) {
    const rate = Number(value || 0);
    const label = formatRate(rate);
    if (rate === 480000 || rate === 500000) {
      return `${label} (Rekomendasi)`;
    }
    if (rate === 1300000) {
      return `${label} (High Speed)`;
    }
    if (rate === 2000000) {
      return `${label} (Extreme)`;
    }
    return label;
  }

  function formatFrequency(value) {
    const frequency = Math.max(0, Number(value) || 0);
    if (frequency >= 1000000) {
      return `${formatNumber(frequency / 1000000, 2)} MHz`;
    }
    if (frequency >= 1000) {
      return `${formatNumber(frequency / 1000, 2)} kHz`;
    }
    return `${formatNumber(frequency, frequency >= 10 ? 0 : 1)} Hz`;
  }

  function formatVoltage(value) {
    const voltage = Number(value);
    if (!Number.isFinite(voltage)) {
      return "-";
    }
    if (Math.abs(voltage) < 1) {
      return `${formatNumber(voltage * 1000, 1)} mV`;
    }
    return `${formatNumber(voltage, 3)} V`;
  }

  function formatDurationSeconds(value) {
    const seconds = Math.max(0, Number(value) || 0);
    if (seconds >= 1) {
      return `${formatNumber(seconds, 2)} s`;
    }
    if (seconds >= 0.001) {
      return `${formatNumber(seconds * 1000, 2)} ms`;
    }
    if (seconds >= 0.000001) {
      return `${formatNumber(seconds * 1000000, 1)} us`;
    }
    return `${formatNumber(seconds * 1000000000, 0)} ns`;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
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

  function probeProfile(value) {
    return Number(value) === 10 ? probeProfiles[10] : probeProfiles[1];
  }

  function normalizeProbeAttenuation(value) {
    return Number(value) === 10 ? 10 : 1;
  }

  function normalizeChannelVisibility(value, fallback = [true, false]) {
    const source = Array.isArray(value) ? value : fallback;
    const visibility = [
      source[0] !== false,
      source[1] === true
    ];
    if (!visibility[0] && !visibility[1]) {
      visibility[0] = true;
    }
    return visibility;
  }

  function normalizeCalPadMode(value) {
    const key = String(value || defaultCalPadMode).trim().toLowerCase().replaceAll("-", "_");
    return calPadModeMap[key] ? key : defaultCalPadMode;
  }

  function calPadModeProfile(value) {
    return calPadModeMap[normalizeCalPadMode(value)] || calPadModeMap[defaultCalPadMode];
  }

  function storedCalPadMode() {
    const settings = readStoredSettings();
    return normalizeCalPadMode(settings?.calPadMode);
  }

  function saveCalPadMode(mode) {
    const settings = readStoredSettings();
    writeStoredSettings({ ...settings, calPadMode: normalizeCalPadMode(mode) });
  }

  function storedChannelProbeAttenuations() {
    const settings = readStoredSettings();
    const stored = Array.isArray(settings?.channelProbeAttenuations)
      ? settings.channelProbeAttenuations
      : [];
    return [
      normalizeProbeAttenuation(stored[0] ?? defaultProbeAttenuation),
      normalizeProbeAttenuation(stored[1] ?? defaultProbeAttenuation)
    ];
  }

  function saveChannelProbeAttenuation(channelIndex, attenuation) {
    const settings = readStoredSettings();
    const channelProbeAttenuations = storedChannelProbeAttenuations();
    channelProbeAttenuations[channelIndex] = normalizeProbeAttenuation(attenuation);
    writeStoredSettings({ ...settings, channelProbeAttenuations });
  }

  function storedChannelVisibility() {
    const settings = readStoredSettings();
    const hasStored = Array.isArray(settings?.channelVisibility);
    return normalizeChannelVisibility(
      hasStored ? settings.channelVisibility : null,
      [true, false]
    );
  }

  function saveChannelVisibility(channelVisibility) {
    const settings = readStoredSettings();
    const visibility = normalizeChannelVisibility(channelVisibility);
    writeStoredSettings({ ...settings, channelVisibility: visibility });
    return visibility;
  }

  function storedSampleRateCorrection() {
    const settings = readStoredSettings();
    const correction = finiteNumber(settings?.sampleRateCorrection, 1);
    return correction >= 0.05 && correction <= 128 ? correction : 1;
  }

  function saveSampleRateCorrection(correction) {
    const value = finiteNumber(correction, 1);
    if (value < 0.05 || value > 128) {
      return;
    }
    const settings = readStoredSettings();
    writeStoredSettings({ ...settings, sampleRateCorrection: value });
  }

  function readStoredSettings() {
    try {
      const raw = globalScope.localStorage?.getItem(settingsStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function writeStoredSettings(nextSettings) {
    try {
      globalScope.localStorage?.setItem(settingsStorageKey, JSON.stringify(nextSettings));
    } catch {
      // Local storage can be blocked; oscilloscope must keep working without it.
    }
  }

  function storedCorrectionGain(probeAttenuation) {
    const settings = readStoredSettings();
    const gain = finiteNumber(settings?.correctionGains?.[String(probeAttenuation)], 1);
    return gain > 0 ? gain : 1;
  }

  function saveCorrectionGain(probeAttenuation, gain) {
    const settings = readStoredSettings();
    const correctionGains = {
      ...(settings.correctionGains || {}),
      [String(probeAttenuation)]: gain
    };
    writeStoredSettings({ ...settings, correctionGains });
  }

  function channelSettingKey(channelIndex, probeAttenuation) {
    return `ch${channelIndex + 1}_${normalizeProbeAttenuation(probeAttenuation)}`;
  }

  function storedChannelCorrectionGain(channelIndex, probeAttenuation) {
    const settings = readStoredSettings();
    const key = channelSettingKey(channelIndex, probeAttenuation);
    const fallback = channelIndex === 0 ? storedCorrectionGain(probeAttenuation) : 1;
    const gain = finiteNumber(settings?.channelCorrectionGains?.[key], fallback);
    return gain > 0 ? gain : 1;
  }

  function saveChannelCorrectionGain(channelIndex, probeAttenuation, gain) {
    const settings = readStoredSettings();
    const channelCorrectionGains = {
      ...(settings.channelCorrectionGains || {}),
      [channelSettingKey(channelIndex, probeAttenuation)]: gain
    };
    const nextSettings = { ...settings, channelCorrectionGains };
    if (channelIndex === 0) {
      nextSettings.correctionGains = {
        ...(settings.correctionGains || {}),
        [String(normalizeProbeAttenuation(probeAttenuation))]: gain
      };
    }
    writeStoredSettings(nextSettings);
  }

  function storedActualVoltage(probeAttenuation) {
    const settings = readStoredSettings();
    const value = finiteNumber(settings?.actualVoltages?.[String(probeAttenuation)], NaN);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function saveActualVoltage(probeAttenuation, actualVoltage) {
    const settings = readStoredSettings();
    const actualVoltages = {
      ...(settings.actualVoltages || {}),
      [String(probeAttenuation)]: actualVoltage
    };
    writeStoredSettings({ ...settings, actualVoltages });
  }

  function storedChannelActualVoltage(channelIndex, probeAttenuation) {
    const settings = readStoredSettings();
    const key = channelSettingKey(channelIndex, probeAttenuation);
    const fallback = channelIndex === 0 ? storedActualVoltage(probeAttenuation) : null;
    const value = finiteNumber(settings?.channelActualVoltages?.[key], fallback ?? NaN);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function saveChannelActualVoltage(channelIndex, probeAttenuation, actualVoltage) {
    const settings = readStoredSettings();
    const channelActualVoltages = {
      ...(settings.channelActualVoltages || {}),
      [channelSettingKey(channelIndex, probeAttenuation)]: actualVoltage
    };
    const nextSettings = { ...settings, channelActualVoltages };
    if (channelIndex === 0) {
      nextSettings.actualVoltages = {
        ...(settings.actualVoltages || {}),
        [String(normalizeProbeAttenuation(probeAttenuation))]: actualVoltage
      };
    }
    writeStoredSettings(nextSettings);
  }

  function emptySummary() {
    return {
      frequencyHz: 0,
      peakToPeakVoltage: 0,
      rmsVoltage: 0,
      lowestVoltage: 0,
      minVoltage: 0,
      maxVoltage: 0,
      averageVoltage: 0,
      spanSeconds: 0,
      binHz: 0,
      dutyCyclePercent: 0,
      periodSeconds: 0,
      triggerLocked: false,
      triggerLevel: 0,
      periodicConfidence: 0
    };
  }

  function createInitialState() {
    const initialChannelProbeAttenuations = storedChannelProbeAttenuations();
    const initialChannelVisibility = storedChannelVisibility();
    const initialProbeAttenuation = initialChannelProbeAttenuations[0];
    const initialCalPadMode = storedCalPadMode();
    return {
      device: {
        success: false,
        isPresent: false,
        message: "Pilih koneksi USB atau WIFI.",
        deviceLabel: "TEKNISIHUB_FLASH_OSC",
        deviceType: "",
        transport: "",
        maxSampleRateHz: defaultSampleRateHz,
        maxSampleCount: singleChannelSampleCount,
        bits: 12,
        vrefMv: 3300,
        channelCount: 2,
        supportedChannelCount: 2,
        capturedChannelCount: 0
      },
      displayMode: defaultDisplayMode,
      channelVisibility: initialChannelVisibility,
      sampleRateHz: defaultSampleRateHz,
      sampleCount: defaultSampleCount,
      channelProbeAttenuations: initialChannelProbeAttenuations,
      probeAttenuation: initialProbeAttenuation,
      sincInterpolation: true,
      channelVoltsPerDiv: ["auto", "auto"],
      channelVerticalPositions: [0, 0],
      voltsPerDiv: "auto",
      verticalPosition: 0,
      triggerEdge: "rising",
      triggerLevelPercent: 50,
      preTriggerPercent: 50,
      autoReferenceOnRun: false,
      pendingRunReference: false,
      referenceWarmupValues: [],
      referenceWarmupChannelValues: [],
      referenceVoltage: null,
      referenceVoltages: null,
      channelCorrectionGains: initialChannelProbeAttenuations.map((attenuation, index) => storedChannelCorrectionGain(index, attenuation)),
      channelActualVoltages: initialChannelProbeAttenuations.map((attenuation, index) => storedChannelActualVoltage(index, attenuation)),
      voltageCorrectionGain: storedChannelCorrectionGain(0, initialProbeAttenuation),
      actualVoltage: storedChannelActualVoltage(0, initialProbeAttenuation),
      lastRawStableVoltage: null,
      channelLastRawStableVoltages: [null, null],
      capture: null,
      frameBuffer: [],
      channelFrameBuffers: [],
      frameSampleRateHz: defaultSampleRateHz,
      sampleRateCorrection: storedSampleRateCorrection(),
      calPadMode: initialCalPadMode,
      calPadExpectedFrequencyHz: calPadModeProfile(initialCalPadMode).frequencyHz || 0,
      lastCalPadCorrectionRounded: "",
      latestCaptureVoltages: [],
      latestCaptureChannels: [],
      displayWindow: [],
      displayChannelWindows: [],
      displaySummary: emptySummary(),
      spectrum: null,
      fftAverageBins: [],
      fftAverageKey: "",
      fftAverageCount: 0,
      fftAverageByChannel: [],
      voltageHistory: [],
      lowestDropVoltage: null,
      channelVoltageHistories: [[], []],
      channelLowestDropVoltages: [null, null],
      framesCaptured: 0,
      recordSessionId: "",
      recordFrameCount: 0,
      recordFilePath: "",
      selectedDevice: "",
      deviceConnectionStatus: "idle",
      isRunning: false,
      isCapturing: false,
      isBusy: false,
      isRecording: false,
      calPadEnabled: false,
      pendingCalPadModeApply: false,
      message: "OSC siap.",
      errorMessage: ""
    };
  }

  function statsFor(values) {
    if (!values.length) {
      return { min: 0, max: 0, avg: 0, rms: 0, vpp: 0 };
    }
    let min = values[0];
    let max = values[0];
    let sum = 0;
    for (const value of values) {
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
      sum += value;
    }
    const avg = sum / values.length;
    let squareSum = 0;
    for (const value of values) {
      const centered = value - avg;
      squareSum += centered * centered;
    }
    return {
      min,
      max,
      avg,
      rms: Math.sqrt(squareSum / values.length),
      vpp: max - min
    };
  }

  function captureToVoltages(capture, localState = null) {
    return captureToVoltageChannels(capture, localState)[0] || [];
  }

  function captureToVoltageChannels(capture, localState = null) {
    const scaleState = localState || {
      probeAttenuation: defaultProbeAttenuation,
      channelProbeAttenuations: [defaultProbeAttenuation, defaultProbeAttenuation]
    };
    const samples = Array.isArray(capture?.samples) ? capture.samples : [];
    const channelSamples = Array.isArray(capture?.channelSamples) ? capture.channelSamples : null;
    const baseVoltsPerCount = Number(capture?.vrefMv || 0) > 0 && Number(capture?.adcMax || 0) > 0
      ? (Number(capture.vrefMv) / 1000) / Number(capture.adcMax)
      : Number(capture?.voltsPerCount || 0) / Math.max(1, normalizeProbeAttenuation(scaleState.probeAttenuation));
    if (baseVoltsPerCount <= 0) {
      return [];
    }

    if (channelSamples?.length) {
      return channelSamples
        .map((channel, index) => {
          const attenuation = normalizeProbeAttenuation(scaleState.channelProbeAttenuations?.[index] ?? scaleState.probeAttenuation);
          return Array.isArray(channel)
            ? channel.map((sample) => Number(sample || 0) * baseVoltsPerCount * attenuation)
            : [];
        });
    }

    const voltsPerCount = baseVoltsPerCount * normalizeProbeAttenuation(scaleState.probeAttenuation);
    return samples.length
      ? [samples.map((sample) => Number(sample || 0) * voltsPerCount)]
      : [];
  }

  function stableReferenceVoltage(values) {
    if (!values.length) {
      return 0;
    }

    const sorted = values.slice().sort((a, b) => a - b);
    const lower = Math.floor((sorted.length - 1) * 0.40);
    const upper = Math.ceil((sorted.length - 1) * 0.60);
    let sum = 0;
    let count = 0;
    for (let index = lower; index <= upper; index++) {
      sum += sorted[index];
      count += 1;
    }
    return count > 0 ? sum / count : statsFor(values).avg;
  }

  function parseVoltageInput(value) {
    return Number(String(value ?? "").trim().replace(",", "."));
  }

  function applyCorrectionGain(values, correctionGain) {
    const gain = Number(correctionGain);
    if (!Number.isFinite(gain) || gain <= 0) {
      return values.slice();
    }
    return values.map((value) => value * gain);
  }

  function applyDisplayReference(values, referenceVoltage) {
    const reference = Number(referenceVoltage);
    if (!Number.isFinite(reference)) {
      return values.slice();
    }
    return values.map((value) => value - reference);
  }

  function applyDisplayReferences(channelValues, referenceVoltages) {
    if (!Array.isArray(channelValues)) {
      return [];
    }
    return channelValues.map((values, index) => {
      const reference = Array.isArray(referenceVoltages)
        ? referenceVoltages[index]
        : index === 0 ? referenceVoltages : null;
      return applyDisplayReference(values, reference);
    });
  }

  function effectiveSampleRateHz(rawRate, state) {
    const baseRate = Number(rawRate || state.sampleRateHz || defaultSampleRateHz);
    const correction = finiteNumber(state.sampleRateCorrection, 1);
    if (!Number.isFinite(baseRate) || baseRate <= 0) {
      return defaultSampleRateHz;
    }
    return Math.max(1, baseRate * (correction > 0 ? correction : 1));
  }

  function appendRecordBuffer(state, values, sampleRateHz) {
    if (!values.length) {
      return;
    }
    const rate = Number(sampleRateHz || state.sampleRateHz || defaultSampleRateHz);
    const previousRate = Number(state.frameSampleRateHz || rate);
    if (previousRate > 0 && Math.abs(previousRate - rate) / previousRate > 0.02) {
      state.frameBuffer = [];
    }
    state.frameSampleRateHz = rate;
    state.frameBuffer.push(...values);
    if (state.frameBuffer.length > maxRecordSamples) {
      state.frameBuffer = state.frameBuffer.slice(state.frameBuffer.length - maxRecordSamples);
    }
  }

  function appendChannelRecordBuffers(state, channelValues, sampleRateHz) {
    const channels = Array.isArray(channelValues) ? channelValues : [];
    if (!channels.length || !channels[0]?.length) {
      return;
    }

    const rate = Number(sampleRateHz || state.sampleRateHz || defaultSampleRateHz);
    const previousRate = Number(state.frameSampleRateHz || rate);
    if (previousRate > 0 && Math.abs(previousRate - rate) / previousRate > 0.02) {
      state.channelFrameBuffers = [];
      state.frameBuffer = [];
    }

    state.frameSampleRateHz = rate;
    state.channelFrameBuffers = channels.map((values, index) => {
      const existing = state.channelFrameBuffers[index] || [];
      const next = existing.concat(values || []);
      return next.length > maxRecordSamples ? next.slice(next.length - maxRecordSamples) : next;
    });
    state.frameBuffer = state.channelFrameBuffers[0] || [];
  }

  function resetLiveDisplayBuffers(state, { keepCapture = false } = {}) {
    state.frameBuffer = [];
    state.channelFrameBuffers = [];
    state.latestCaptureVoltages = [];
    state.latestCaptureChannels = [];
    state.displayWindow = [];
    state.displayChannelWindows = [];
    state.displaySummary = emptySummary();
    if (!keepCapture) {
      state.capture = null;
    }
    clearVoltageHistories(state);
    resetFftAverage(state);
  }

  function appendVoltageHistory(state, values) {
    if (!values.length) {
      return;
    }

    const traceStats = statsFor(values);
    const nowMs = typeof performance !== "undefined" && performance.now
      ? performance.now()
      : Date.now();
    state.voltageHistory.push({
      timeMs: nowMs,
      min: traceStats.min,
      avg: traceStats.avg,
      max: traceStats.max,
      rms: traceStats.rms,
      vpp: traceStats.vpp
    });

    if (state.voltageHistory.length > maxVoltageHistoryFrames) {
      state.voltageHistory = state.voltageHistory.slice(state.voltageHistory.length - maxVoltageHistoryFrames);
    }

    if (state.lowestDropVoltage === null || traceStats.min < state.lowestDropVoltage) {
      state.lowestDropVoltage = traceStats.min;
    }
  }

  function clearVoltageHistories(state) {
    state.voltageHistory = [];
    state.lowestDropVoltage = null;
    state.channelVoltageHistories = [[], []];
    state.channelLowestDropVoltages = [null, null];
  }

  function hasVoltageHistory(state) {
    return (state.channelVoltageHistories || []).some((history) => history?.length > 0)
      || state.voltageHistory.length > 0;
  }

  function appendChannelVoltageHistories(state, channelValues) {
    const channels = Array.isArray(channelValues) ? channelValues : [];
    if (!channels.some((values) => values?.length)) {
      return;
    }

    const nowMs = typeof performance !== "undefined" && performance.now
      ? performance.now()
      : Date.now();
    const channelCount = Math.max(2, state.channelVoltageHistories?.length || 0, channels.length);
    const histories = Array.from({ length: channelCount }, (_item, index) => (
      state.channelVoltageHistories?.[index] || []
    ));
    const lowestValues = Array.from({ length: channelCount }, (_item, index) => (
      state.channelLowestDropVoltages?.[index] ?? null
    ));

    channels.forEach((values, channelIndex) => {
      if (!values?.length) {
        return;
      }

      const traceStats = statsFor(values);
      const nextHistory = histories[channelIndex].concat({
        timeMs: nowMs,
        min: traceStats.min,
        avg: traceStats.avg,
        max: traceStats.max,
        rms: traceStats.rms,
        vpp: traceStats.vpp
      });
      histories[channelIndex] = nextHistory.length > maxVoltageHistoryFrames
        ? nextHistory.slice(nextHistory.length - maxVoltageHistoryFrames)
        : nextHistory;
      if (lowestValues[channelIndex] === null || traceStats.min < lowestValues[channelIndex]) {
        lowestValues[channelIndex] = traceStats.min;
      }
    });

    state.channelVoltageHistories = histories;
    state.channelLowestDropVoltages = lowestValues;
    state.voltageHistory = histories[0] || [];
    state.lowestDropVoltage = lowestValues[0] ?? null;
  }

  function sinc(value) {
    if (Math.abs(value) < 0.000001) {
      return 1;
    }
    const angle = Math.PI * value;
    return Math.sin(angle) / angle;
  }

  function lanczos(value, taps = 3) {
    const distance = Math.abs(value);
    if (distance >= taps) {
      return 0;
    }
    return sinc(value) * sinc(value / taps);
  }

  function linearResample(values, targetCount) {
    if (!values.length || targetCount <= 0) {
      return [];
    }
    if (targetCount === 1) {
      return [values[0]];
    }
    if (values.length === targetCount) {
      return values.slice();
    }
    const result = new Array(targetCount);
    const scale = (values.length - 1) / Math.max(1, targetCount - 1);
    for (let index = 0; index < targetCount; index++) {
      const position = index * scale;
      const left = Math.floor(position);
      const right = Math.min(values.length - 1, left + 1);
      const fraction = position - left;
      result[index] = values[left] * (1 - fraction) + values[right] * fraction;
    }
    return result;
  }

  function sincResample(values, targetCount) {
    if (!values.length || targetCount <= 0) {
      return [];
    }
    if (values.length <= targetCount) {
      return linearResample(values, targetCount);
    }
    const result = new Array(targetCount);
    const scale = (values.length - 1) / Math.max(1, targetCount - 1);
    const radius = Math.min(64, Math.max(3, scale * 0.65));
    for (let index = 0; index < targetCount; index++) {
      const center = index * scale;
      const left = Math.max(0, Math.floor(center - radius));
      const right = Math.min(values.length - 1, Math.ceil(center + radius));
      let sum = 0;
      let weightSum = 0;
      for (let sampleIndex = left; sampleIndex <= right; sampleIndex++) {
        const normalizedDistance = (sampleIndex - center) / Math.max(1, scale);
        const weight = lanczos(normalizedDistance, 3);
        if (weight === 0) {
          continue;
        }
        sum += values[sampleIndex] * weight;
        weightSum += weight;
      }
      result[index] = weightSum > 0 ? sum / weightSum : values[Math.round(center)];
    }
    return result;
  }

  function resampleForDisplay(values, targetCount, sincEnabled) {
    return sincEnabled ? sincResample(values, targetCount) : linearResample(values, targetCount);
  }

  function triggerLevelFor(values, state) {
    const traceStats = statsFor(values);
    const profile = probeProfile(state.probeAttenuation);
    const span = Math.max(traceStats.vpp, profile.minSpan);
    const min = traceStats.vpp > 0 ? traceStats.avg - span / 2 : profile.min;
    const max = traceStats.vpp > 0 ? traceStats.avg + span / 2 : profile.max;
    return min + (max - min) * clamp(Number(state.triggerLevelPercent || 50), 0, 100) / 100;
  }

  function findTriggerIndex(values, level, edge) {
    if (values.length < 8) {
      return -1;
    }
    const traceStats = statsFor(values);
    if (traceStats.vpp < 0.006) {
      return -1;
    }
    const hysteresis = Math.max(traceStats.vpp * 0.05, 0.002);
    const start = Math.max(1, Math.floor(values.length * 0.06));
    const end = Math.max(start + 1, Math.floor(values.length * 0.94));

    if (edge === "falling") {
      let armed = values[start - 1] > level + hysteresis;
      for (let index = start; index < end; index++) {
        const previous = values[index - 1];
        const current = values[index];
        if (!armed && current > level + hysteresis) {
          armed = true;
        }
        if (armed && previous >= level && current < level) {
          return index;
        }
      }
      return -1;
    }

    let armed = values[start - 1] < level - hysteresis;
    for (let index = start; index < end; index++) {
      const previous = values[index - 1];
      const current = values[index];
      if (!armed && current < level - hysteresis) {
        armed = true;
      }
      if (armed && previous <= level && current > level) {
        return index;
      }
    }
    return -1;
  }

  function primaryAnalysisChannelIndex(state) {
    const visibility = Array.isArray(state.channelVisibility)
      ? state.channelVisibility
      : [true, false];
    const channels = Array.isArray(state.latestCaptureChannels)
      ? state.latestCaptureChannels
      : [];
    const buffers = Array.isArray(state.channelFrameBuffers)
      ? state.channelFrameBuffers
      : [];
    const candidateCount = Math.max(1, channels.length, buffers.length, visibility.length);
    for (let index = 0; index < candidateCount; index++) {
      if (visibility[index] === false) {
        continue;
      }
      if ((channels[index]?.length || 0) > 0 || (buffers[index]?.length || 0) > 0) {
        return index;
      }
    }
    return visibility[0] === false && visibility[1] !== false ? 1 : 0;
  }

  function prepareDisplayWindow(state) {
    const primaryIndex = primaryAnalysisChannelIndex(state);
    const primaryFrameBuffer = state.channelFrameBuffers?.[primaryIndex]?.length
      ? state.channelFrameBuffers[primaryIndex]
      : primaryIndex === 0 ? state.frameBuffer : [];
    const primaryLatest = state.latestCaptureChannels?.[primaryIndex]?.length
      ? state.latestCaptureChannels[primaryIndex]
      : primaryIndex === 0 ? state.latestCaptureVoltages : [];
    const activeCalProfile = state.calPadEnabled ? calPadModeProfile(state.calPadMode) : null;
    const preferLatestCalPadFrame = Boolean(activeCalProfile && primaryLatest.length >= 128);
    const useFrameBuffer = !preferLatestCalPadFrame && primaryFrameBuffer.length >= 256;
    const rawSource = useFrameBuffer ? primaryFrameBuffer : primaryLatest;
    const requestedBaseCount = Math.floor(state.sampleCount || defaultSampleCount);
    const preliminaryCount = clamp(requestedBaseCount, 128, rawSource.length);
    const recentLimit = useFrameBuffer
      ? Math.min(rawSource.length, preliminaryCount)
      : rawSource.length;
    const sourceOffset = Math.max(0, rawSource.length - recentLimit);
    const source = rawSource.slice(sourceOffset);
    if (!source.length) {
      state.displayWindow = [];
      state.displayChannelWindows = [];
      state.displaySummary = emptySummary();
      return;
    }

    const requestedCount = clamp(requestedBaseCount, 128, source.length);
    const level = triggerLevelFor(source, state);
    const triggerIndex = findTriggerIndex(source, level, state.triggerEdge);
    const locked = triggerIndex >= 0;
    const preTrigger = clamp(Number(state.preTriggerPercent || 50), 10, 90) / 100;
    const fallbackStart = Math.max(0, source.length - requestedCount);
    const preferredStart = locked ? triggerIndex - Math.floor(requestedCount * preTrigger) : fallbackStart;
    const start = clamp(preferredStart, 0, Math.max(0, source.length - requestedCount));
    const windowValues = source.slice(start, start + requestedCount);
    const sourceChannels = useFrameBuffer
      ? state.channelFrameBuffers
      : state.latestCaptureChannels;
    state.displayChannelWindows = (sourceChannels?.length ? sourceChannels : [source])
      .map((channelValues) => (channelValues || []).slice(sourceOffset, sourceOffset + source.length).slice(start, start + requestedCount));
    const traceStats = statsFor(windowValues);
    const rate = Number(state.frameSampleRateHz || state.sampleRateHz || defaultSampleRateHz);

    const pulseTiming = analyzePulseTiming(windowValues, rate);
    const periodic = analyzePeriodicSignal(windowValues, rate);
    const edgeSignal = periodic.confidence >= 0.82
      ? { frequencyHz: 0, confidence: 0 }
      : analyzeEdgeSignal(windowValues, rate);
    const signalConfidence = Math.max(periodic.confidence, edgeSignal.confidence, pulseTiming.confidence);
    const frequencyHz = pulseTiming.frequencyHz > 0
      ? pulseTiming.frequencyHz
      : periodic.frequencyHz > 0 ? periodic.frequencyHz : edgeSignal.frequencyHz;
    const hasValidFrequency = frequencyHz >= 1;
    state.displayWindow = windowValues;
    state.displaySummary = {
      frequencyHz,
      peakToPeakVoltage: traceStats.vpp,
      rmsVoltage: traceStats.rms,
      lowestVoltage: state.lowestDropVoltage ?? traceStats.min,
      minVoltage: traceStats.min,
      maxVoltage: traceStats.max,
      averageVoltage: traceStats.avg,
      spanSeconds: rate > 0 ? windowValues.length / rate : 0,
      binHz: rate > 0 && windowValues.length > 0 ? rate / windowValues.length : 0,
      dutyCyclePercent: pulseTiming.dutyCyclePercent,
      periodSeconds: pulseTiming.periodSeconds || (frequencyHz > 0 ? 1 / frequencyHz : 0),
      triggerLocked: locked && hasValidFrequency && signalConfidence >= 0.50,
      triggerLevel: level,
      periodicConfidence: hasValidFrequency ? signalConfidence : 0
    };
  }

  function analyzePeriodicSignal(values, sampleRateHz) {
    const rate = Number(sampleRateHz || 0);
    if (values.length < 16 || rate <= 0) {
      return { frequencyHz: 0, confidence: 0 };
    }
    const traceStats = statsFor(values);
    if (traceStats.vpp < minimumPulseDetectVpp) {
      return { frequencyHz: 0, confidence: 0 };
    }
    const level = traceStats.avg;
    const hysteresis = Math.max(traceStats.vpp * 0.16, 0.006);
    const crossings = [];
    let armed = values[0] < level - hysteresis;
    for (let index = 1; index < values.length; index++) {
      const previous = values[index - 1];
      const current = values[index];
      if (!armed && current < level - hysteresis) {
        armed = true;
      }
      if (armed && previous <= level && current > level) {
        const denominator = current - previous;
        const fraction = Math.abs(denominator) > 0.0000001 ? (level - previous) / denominator : 0;
        const crossing = index - 1 + clamp(fraction, 0, 1);
        if (!crossings.length || crossing - crossings[crossings.length - 1] > 3) {
          crossings.push(crossing);
        }
        armed = false;
      }
    }
    if (crossings.length < 4) {
      return { frequencyHz: 0, confidence: 0 };
    }
    const periods = [];
    for (let index = 1; index < crossings.length; index++) {
      periods.push(crossings[index] - crossings[index - 1]);
    }
    periods.sort((a, b) => a - b);
    const median = periods[Math.floor(periods.length / 2)];
    if (!median || median < 8) {
      return { frequencyHz: 0, confidence: 0 };
    }

    const deviations = periods.map((period) => Math.abs(period - median)).sort((a, b) => a - b);
    const medianDeviation = deviations[Math.floor(deviations.length / 2)] || 0;
    const consistency = clamp(1 - medianDeviation / median, 0, 1);
    if (consistency < 0.82) {
      return { frequencyHz: 0, confidence: consistency };
    }

    return {
      frequencyHz: rate / median,
      confidence: consistency
    };
  }

  function analyzeEdgeSignal(values, sampleRateHz) {
    const rate = Number(sampleRateHz || 0);
    if (values.length < 32 || rate <= 0) {
      return { frequencyHz: 0, confidence: 0 };
    }

    const traceStats = statsFor(values);
    if (traceStats.vpp < minimumPulseDetectVpp) {
      return { frequencyHz: 0, confidence: 0 };
    }

    const low = traceStats.min + traceStats.vpp * 0.25;
    const high = traceStats.min + traceStats.vpp * 0.75;
    const zoneFor = (value) => {
      if (value >= high) {
        return 1;
      }
      if (value <= low) {
        return -1;
      }
      return 0;
    };

    let lastZone = zoneFor(values[0]);
    let lastTransition = -9999;
    const transitions = [];
    for (let index = 1; index < values.length; index++) {
      const zone = zoneFor(values[index]);
      if (zone === 0) {
        continue;
      }
      if (lastZone !== 0 && zone !== lastZone && index - lastTransition > 3) {
        transitions.push(index);
        lastTransition = index;
      }
      lastZone = zone;
    }

    if (transitions.length < 4) {
      return { frequencyHz: 0, confidence: 0 };
    }

    const gaps = [];
    for (let index = 1; index < transitions.length; index++) {
      gaps.push(transitions[index] - transitions[index - 1]);
    }
    gaps.sort((a, b) => a - b);
    const medianGap = gaps[Math.floor(gaps.length / 2)];
    if (!medianGap || medianGap < 4) {
      return { frequencyHz: 0, confidence: 0 };
    }

    const deviations = gaps.map((gap) => Math.abs(gap - medianGap)).sort((a, b) => a - b);
    const medianDeviation = deviations[Math.floor(deviations.length / 2)] || 0;
    const consistency = clamp(1 - medianDeviation / medianGap, 0, 1);
    const density = clamp(transitions.length / Math.max(4, values.length / medianGap), 0, 1);
    const confidence = clamp(consistency * 0.75 + density * 0.25, 0, 1);
    if (confidence < 0.50) {
      return { frequencyHz: 0, confidence };
    }

    return {
      frequencyHz: rate / (medianGap * 2),
      confidence
    };
  }

  function analyzePulseTiming(values, sampleRateHz) {
    const rate = Number(sampleRateHz || 0);
    if (!Array.isArray(values) || values.length < 32 || rate <= 0) {
      return { frequencyHz: 0, dutyCyclePercent: 0, periodSamples: 0, periodSeconds: 0, confidence: 0 };
    }

    const traceStats = statsFor(values);
    if (traceStats.vpp < minimumPulseDetectVpp) {
      return { frequencyHz: 0, dutyCyclePercent: 0, periodSamples: 0, periodSeconds: 0, confidence: 0 };
    }

    const lowThreshold = traceStats.min + traceStats.vpp * 0.25;
    const highThreshold = traceStats.min + traceStats.vpp * 0.75;
    const midpoint = traceStats.min + traceStats.vpp * 0.5;
    const rising = [];
    const falling = [];
    let stateZone = values[0] >= midpoint ? 1 : -1;
    let highSamples = stateZone > 0 ? 1 : 0;
    const crossingAtMidpoint = (index) => {
      const previous = values[index - 1];
      const current = values[index];
      const denominator = current - previous;
      if (Math.abs(denominator) <= 0.0000001) {
        return index;
      }
      return index - 1 + clamp((midpoint - previous) / denominator, 0, 1);
    };

    for (let index = 1; index < values.length; index++) {
      const value = values[index];
      if (stateZone < 0 && value >= highThreshold) {
        rising.push(crossingAtMidpoint(index));
        stateZone = 1;
      } else if (stateZone > 0 && value <= lowThreshold) {
        falling.push(crossingAtMidpoint(index));
        stateZone = -1;
      }
      if (stateZone > 0) {
        highSamples += 1;
      }
    }

    if (rising.length < 2) {
      return {
        frequencyHz: 0,
        dutyCyclePercent: clamp(highSamples / values.length * 100, 0, 100),
        periodSamples: 0,
        periodSeconds: 0,
        confidence: 0
      };
    }

    const periods = [];
    for (let index = 1; index < rising.length; index++) {
      periods.push(rising[index] - rising[index - 1]);
    }
    periods.sort((a, b) => a - b);
    const periodSamples = periods[Math.floor(periods.length / 2)] || 0;
    if (periodSamples < 4) {
      return { frequencyHz: 0, dutyCyclePercent: 0, periodSamples: 0, periodSeconds: 0, confidence: 0 };
    }

    const deviations = periods.map((period) => Math.abs(period - periodSamples)).sort((a, b) => a - b);
    const medianDeviation = deviations[Math.floor(deviations.length / 2)] || 0;
    const consistency = clamp(1 - medianDeviation / periodSamples, 0, 1);
    const highDurations = [];
    let fallingIndex = 0;
    for (let index = 0; index < rising.length - 1; index++) {
      const start = rising[index];
      const end = rising[index + 1];
      while (fallingIndex < falling.length && falling[fallingIndex] <= start) {
        fallingIndex += 1;
      }
      if (fallingIndex < falling.length && falling[fallingIndex] < end) {
        highDurations.push(falling[fallingIndex] - start);
      }
    }
    highDurations.sort((a, b) => a - b);
    const medianHighDuration = highDurations[Math.floor(highDurations.length / 2)] || 0;
    const dutyCyclePercent = medianHighDuration > 0
      ? clamp(medianHighDuration / periodSamples * 100, 0, 100)
      : clamp(highSamples / values.length * 100, 0, 100);
    return {
      frequencyHz: rate / periodSamples,
      dutyCyclePercent,
      periodSamples,
      periodSeconds: periodSamples / rate,
      confidence: consistency
    };
  }

  function updateCalPadSampleRateCorrection(state, values, rawSampleRateHz) {
    const profile = calPadModeProfile(state.calPadMode);
    const expectedHz = Number(state.calPadExpectedFrequencyHz ?? profile.frequencyHz ?? 0);
    const rawRate = Number(rawSampleRateHz || 0);
    if (!state.calPadEnabled || profile.variable || !values?.length || expectedHz <= 0 || rawRate <= 0) {
      return false;
    }

    const timing = analyzePulseTiming(values, rawRate);
    const traceStats = statsFor(values);
    if (
      timing.confidence < 0.85 ||
      timing.periodSamples < 8 ||
      timing.dutyCyclePercent < 2 ||
      timing.dutyCyclePercent > 98 ||
      traceStats.vpp < 0.05
    ) {
      return false;
    }

    const nextCorrection = clamp(expectedHz * timing.periodSamples / rawRate, 0.05, 128);
    const previousCorrection = finiteNumber(state.sampleRateCorrection, 1);
    const nextRounded = Number(nextCorrection.toFixed(4));
    if (Math.abs(previousCorrection - nextCorrection) / Math.max(0.001, previousCorrection) < 0.005) {
      return false;
    }

    state.sampleRateCorrection = nextCorrection;
    state.lastCalPadCorrectionRounded = String(nextRounded);
    saveSampleRateCorrection(nextCorrection);
    return true;
  }

  function estimateFrequency(values, sampleRateHz) {
    return analyzePeriodicSignal(values, sampleRateHz).frequencyHz;
  }

  function largestPowerOfTwo(value) {
    let power = 1;
    const limit = Math.max(1, Math.floor(value));
    while (power * 2 <= limit) {
      power *= 2;
    }
    return power;
  }

  function detrendForFft(values) {
    if (!values.length) {
      return [];
    }

    const size = values.length;
    const center = (size - 1) / 2;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    for (let index = 0; index < size; index++) {
      const x = index - center;
      const y = values[index];
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    const average = sumY / size;
    const slope = sumX2 > 0 ? sumXY / sumX2 : 0;
    return values.map((value, index) => value - (average + slope * (index - center)));
  }

  function buildSpectrum(values, sampleRateHz) {
    const rate = Number(sampleRateHz || 0);
    if (values.length < 16 || rate <= 0) {
      return { bins: [], peakFrequencyHz: 0, peakMagnitude: 0, binHz: 0 };
    }

    const size = largestPowerOfTwo(Math.min(values.length, fftMaxSize));
    const source = detrendForFft(values.slice(values.length - size));
    const real = new Array(size);
    const imag = new Array(size).fill(0);
    for (let index = 0; index < size; index++) {
      const windowValue = 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / Math.max(1, size - 1));
      real[index] = source[index] * windowValue;
    }

    for (let index = 1, reverse = 0; index < size; index++) {
      let bit = size >> 1;
      for (; reverse & bit; bit >>= 1) {
        reverse ^= bit;
      }
      reverse ^= bit;
      if (index < reverse) {
        [real[index], real[reverse]] = [real[reverse], real[index]];
        [imag[index], imag[reverse]] = [imag[reverse], imag[index]];
      }
    }

    for (let length = 2; length <= size; length <<= 1) {
      const angle = (-2 * Math.PI) / length;
      const stepReal = Math.cos(angle);
      const stepImag = Math.sin(angle);
      for (let start = 0; start < size; start += length) {
        let wReal = 1;
        let wImag = 0;
        for (let offset = 0; offset < length / 2; offset++) {
          const even = start + offset;
          const odd = even + length / 2;
          const oddReal = real[odd] * wReal - imag[odd] * wImag;
          const oddImag = real[odd] * wImag + imag[odd] * wReal;
          real[odd] = real[even] - oddReal;
          imag[odd] = imag[even] - oddImag;
          real[even] += oddReal;
          imag[even] += oddImag;
          const nextReal = wReal * stepReal - wImag * stepImag;
          wImag = wReal * stepImag + wImag * stepReal;
          wReal = nextReal;
        }
      }
    }

    const binHz = rate / size;
    const bins = [];
    let peakFrequencyHz = 0;
    let peakMagnitude = 0;
    for (let index = 1; index < size / 2; index++) {
      const frequencyHz = index * binHz;
      const lowCutFactor = frequencyHz < fftLowCutHz
        ? clamp(frequencyHz / Math.max(1, fftLowCutHz), 0, 1) ** 2
        : 1;
      const magnitude = lowCutFactor * 2 * Math.sqrt(real[index] * real[index] + imag[index] * imag[index]) / size;
      bins.push({ frequencyHz, magnitude });
      if (magnitude > peakMagnitude) {
        peakMagnitude = magnitude;
        peakFrequencyHz = frequencyHz;
      }
    }
    if (peakMagnitude < minimumFftPeakMagnitude) {
      peakFrequencyHz = 0;
    }
    return { bins, peakFrequencyHz, peakMagnitude, binHz, lowCutHz: fftLowCutHz };
  }

  function resetFftAverage(state) {
    state.fftAverageBins = [];
    state.fftAverageKey = "";
    state.fftAverageCount = 0;
    state.fftAverageByChannel = [];
  }

  function averageSpectrum(state, spectrum, channelIndex = 0) {
    if (!spectrum.bins.length) {
      return spectrum;
    }

    const key = `${Math.round(Number(state.frameSampleRateHz || 0))}:${spectrum.bins.length}:${formatNumber(spectrum.binHz, 6)}`;
    const averageSlots = Array.isArray(state.fftAverageByChannel) ? state.fftAverageByChannel : [];
    const previous = averageSlots[channelIndex] || { key: "", bins: [], count: 0 };
    let nextBins;
    let nextCount;
    if (previous.key !== key || previous.bins.length !== spectrum.bins.length) {
      nextBins = spectrum.bins.map((bin) => bin.magnitude);
      nextCount = 1;
    } else {
      const alpha = 2 / (fftAverageDepth + 1);
      nextBins = spectrum.bins.map((bin, index) => (
        previous.bins[index] * (1 - alpha) + bin.magnitude * alpha
      ));
      nextCount = Math.min(fftAverageDepth, previous.count + 1);
    }
    averageSlots[channelIndex] = { key, bins: nextBins, count: nextCount };
    state.fftAverageByChannel = averageSlots;
    if (channelIndex === 0) {
      state.fftAverageKey = key;
      state.fftAverageBins = nextBins;
      state.fftAverageCount = nextCount;
    }

    let peakFrequencyHz = 0;
    let peakMagnitude = 0;
    const bins = spectrum.bins.map((bin, index) => {
      const magnitude = nextBins[index] || 0;
      if (bin.frequencyHz >= fftLowCutHz && magnitude >= minimumFftPeakMagnitude && magnitude > peakMagnitude) {
        peakMagnitude = magnitude;
        peakFrequencyHz = bin.frequencyHz;
      }
      return { ...bin, magnitude };
    });

    return {
      ...spectrum,
      bins,
      peakFrequencyHz,
      peakMagnitude,
      averageCount: nextCount
    };
  }

  function canvasScope(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(320, Math.floor(rect.width || canvas.clientWidth || 960));
    const height = Math.max(300, Math.floor(rect.height || canvas.clientHeight || 460));
    const pixelWidth = Math.floor(width * dpr);
    const pixelHeight = Math.floor(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return {
      ctx,
      width,
      height,
      bounds: {
        canvasWidth: width,
        canvasHeight: height,
        left: 68,
        top: 24,
        right: width - 18,
        bottom: height - 36,
        get width() {
          return this.right - this.left;
        },
        get height() {
          return this.bottom - this.top;
        }
      }
    };
  }

  function getOscilloscopeCanvasPalette() {
    const isDarkMode = Boolean(globalScope.document?.body?.classList?.contains("is-dark-mode"));
    if (isDarkMode) {
      return {
        background: "#06111a",
        grid: "#173246",
        label: "#9db5c8",
        empty: "#91aabc",
        guide: "rgba(226, 238, 246, 0.34)",
        trigger: "rgba(151, 174, 190, 0.38)",
        lockedTrigger: "rgba(255, 205, 91, 0.68)",
        triggerLabel: "#9fb6c6",
        tooltipBackground: "rgba(8, 20, 30, 0.92)",
        tooltipText: "#f7fbff",
        tooltipMuted: "#9fb6c8",
        tooltipShadow: "rgba(0, 0, 0, 0.32)"
      };
    }

    return {
      background: "#f5fbfd",
      grid: "rgba(43, 101, 139, 0.24)",
      label: "#416982",
      empty: "#537490",
      guide: "rgba(31, 97, 139, 0.26)",
      trigger: "rgba(68, 101, 122, 0.36)",
      lockedTrigger: "rgba(191, 124, 28, 0.68)",
      triggerLabel: "#55758b",
      tooltipBackground: "rgba(255, 255, 255, 0.94)",
      tooltipText: "#123a60",
      tooltipMuted: "#537490",
      tooltipShadow: "rgba(16, 72, 117, 0.18)"
    };
  }

  function drawGrid(ctx, bounds, xLabels, yLabels) {
    const palette = getOscilloscopeCanvasPalette();
    ctx.fillStyle = palette.background;
    ctx.fillRect(0, 0, bounds.canvasWidth, bounds.canvasHeight);
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let column = 0; column <= 10; column++) {
      const x = bounds.left + bounds.width * column / 10;
      ctx.moveTo(x, bounds.top);
      ctx.lineTo(x, bounds.bottom);
    }
    for (let row = 0; row <= 8; row++) {
      const y = bounds.top + bounds.height * row / 8;
      ctx.moveTo(bounds.left, y);
      ctx.lineTo(bounds.right, y);
    }
    ctx.stroke();

    ctx.fillStyle = palette.label;
    ctx.font = "11px Consolas, monospace";
    ctx.textBaseline = "middle";
    yLabels.forEach((label, index) => {
      const y = bounds.top + bounds.height * index / Math.max(1, yLabels.length - 1);
      ctx.textAlign = "right";
      ctx.fillText(label, bounds.left - 9, y);
    });
    ctx.textBaseline = "top";
    xLabels.forEach((label, index) => {
      const x = bounds.left + bounds.width * index / Math.max(1, xLabels.length - 1);
      ctx.textAlign = index === 0 ? "left" : index === xLabels.length - 1 ? "right" : "center";
      ctx.fillText(label, x, bounds.bottom + 10);
    });
  }

  function verticalAxisFor(values, state, channelIndex = 0) {
    const profile = probeProfile(state.channelProbeAttenuations?.[channelIndex] ?? state.probeAttenuation);
    if (!values.length) {
      return { min: profile.min, max: profile.max };
    }
    const traceStats = statsFor(values);
    const voltsPerDiv = state.channelVoltsPerDiv?.[channelIndex] ?? (channelIndex === 0 ? state.voltsPerDiv : "auto");
    const manualDiv = voltsPerDiv === "auto" ? 0 : Number(voltsPerDiv);
    const span = manualDiv > 0
      ? manualDiv * 8
      : Math.max(traceStats.vpp * 1.7, profile.minSpan);
    const position = finiteNumber(state.channelVerticalPositions?.[channelIndex] ?? (channelIndex === 0 ? state.verticalPosition : 0), 0);
    const center = traceStats.avg - position;
    return {
      min: center - span / 2,
      max: center + span / 2
    };
  }

  function drawTrace(ctx, bounds, values, axis, style = channelStyles[1], options = {}) {
    if (values.length < 2) {
      return;
    }
    const span = Math.max(0.000001, axis.max - axis.min);
    const crisp = Boolean(options.crisp);
    ctx.save();
    ctx.beginPath();
    ctx.rect(bounds.left, bounds.top, bounds.width, bounds.height);
    ctx.clip();
    ctx.shadowColor = crisp ? "transparent" : (style.shadow || "rgba(45, 228, 193, 0.26)");
    ctx.shadowBlur = crisp ? 0 : 8;
    ctx.strokeStyle = style.line || "#2de4c1";
    ctx.lineWidth = crisp ? 1.45 : 1.7;
    ctx.lineCap = crisp ? "butt" : "round";
    ctx.lineJoin = crisp ? "miter" : "round";
    ctx.miterLimit = crisp ? 1.5 : 10;
    ctx.beginPath();
    values.forEach((value, index) => {
      const x = bounds.left + bounds.width * index / Math.max(1, values.length - 1);
      const y = bounds.bottom - (value - axis.min) / span * bounds.height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.restore();
  }

  function squareWaveDisplayInfo(values, summary) {
    if (!values.length) {
      return { active: false };
    }

    const traceStats = statsFor(values);
    const frequencyHz = Number(summary?.frequencyHz || 0);
    if (traceStats.vpp < 0.35 || frequencyHz < 1 || Number(summary?.periodicConfidence || 0) < 0.50) {
      return { active: false };
    }

    const lowLimit = traceStats.min + traceStats.vpp * 0.30;
    const highLimit = traceStats.min + traceStats.vpp * 0.70;
    let lowCount = 0;
    let highCount = 0;
    for (const value of values) {
      if (value <= lowLimit) {
        lowCount += 1;
      } else if (value >= highLimit) {
        highCount += 1;
      }
    }

    const plateauFraction = (lowCount + highCount) / values.length;
    const lowFraction = lowCount / values.length;
    const highFraction = highCount / values.length;
    const active = plateauFraction >= 0.62 && lowFraction >= 0.02 && highFraction >= 0.02;
    return {
      active,
      mid: traceStats.min + traceStats.vpp / 2,
      hysteresis: Math.max(traceStats.vpp * 0.08, 0.012),
      frequencyHz
    };
  }

  function digitalTraceInfo(values, summary, state) {
    if (!values.length) {
      return { active: false };
    }

    const traceStats = statsFor(values);
    if (traceStats.vpp < minimumPulseDetectVpp) {
      return { active: false };
    }

    const profile = state.calPadEnabled ? calPadModeProfile(state.calPadMode) : null;
    const calPadDigital = Boolean(profile && (profile.frequencyHz > 0 || profile.variable));
    const squareInfo = squareWaveDisplayInfo(values, summary);
    if (!calPadDigital && !squareInfo.active) {
      return { active: false };
    }

    const sorted = values.slice().sort((a, b) => a - b);
    const lowCount = clamp(Math.floor(sorted.length * 0.12), 4, sorted.length);
    const highCount = clamp(Math.floor(sorted.length * 0.04), 4, sorted.length);
    const lowLevel = trimmedAverageFromSorted(sorted.slice(0, lowCount), 0.15, 0.85);
    const highLevel = trimmedAverageFromSorted(sorted.slice(sorted.length - highCount), 0.15, 0.85);
    const mid = (lowLevel + highLevel) / 2;
    const hysteresis = Math.max((highLevel - lowLevel) * 0.10, 0.018);
    const expectedHz = Number(profile?.frequencyHz || squareInfo.frequencyHz || summary?.frequencyHz || 0);
    const sampleRateHz = Number(state.frameSampleRateHz || state.sampleRateHz || defaultSampleRateHz);
    const dutyPercent = clamp(Number(profile?.dutyPercent || summary?.dutyCyclePercent || 50), 1, 99);
    const narrowDutyFraction = Math.min(dutyPercent, 100 - dutyPercent) / 100;
    const periodSamples = expectedHz > 0 && sampleRateHz > 0 ? sampleRateHz / expectedHz : 0;
    const minSegmentSamples = periodSamples > 0
      ? Math.max(2, Math.floor(periodSamples * Math.min(0.018, narrowDutyFraction * 0.35)))
      : 2;
    return {
      active: highLevel - lowLevel >= minimumPulseDetectVpp,
      lowLevel,
      highLevel,
      mid,
      hysteresis,
      minSegmentSamples
    };
  }

  function digitalTraceSegments(values, info) {
    if (values.length < 2 || !info?.active) {
      return [];
    }

    const segments = [];
    let high = values[0] >= info.mid;
    let start = 0;
    for (let index = 1; index < values.length; index++) {
      const value = values[index];
      const nextHigh = high
        ? value > info.mid - info.hysteresis
        : value >= info.mid + info.hysteresis;
      if (nextHigh !== high) {
        segments.push({ start, end: index - 1, high });
        start = index;
        high = nextHigh;
      }
    }
    segments.push({ start, end: values.length - 1, high });

    const minSamples = Math.max(1, Math.floor(info.minSegmentSamples || 1));
    if (minSamples <= 1 || segments.length < 3) {
      return segments;
    }

    const cleaned = segments.slice();
    for (let index = 0; index < cleaned.length; index++) {
      const segment = cleaned[index];
      const length = segment.end - segment.start + 1;
      if (length >= minSamples) {
        continue;
      }

      const previous = cleaned[index - 1];
      const next = cleaned[index + 1];
      if (previous && next && previous.high === next.high) {
        previous.end = next.end;
        cleaned.splice(index, 2);
        index = Math.max(-1, index - 2);
      } else if (previous) {
        previous.end = segment.end;
        cleaned.splice(index, 1);
        index = Math.max(-1, index - 2);
      } else if (next) {
        next.start = segment.start;
        cleaned.splice(index, 1);
        index = -1;
      }
    }
    return cleaned;
  }

  function drawDigitalTrace(ctx, bounds, values, axis, style = channelStyles[0], info = null) {
    if (values.length < 2 || !info?.active) {
      return;
    }

    const segments = digitalTraceSegments(values, info);
    if (!segments.length) {
      return;
    }

    const span = Math.max(0.000001, axis.max - axis.min);
    const xFor = (index) => bounds.left + bounds.width * index / Math.max(1, values.length - 1);
    const yFor = (value) => bounds.bottom - (value - axis.min) / span * bounds.height;
    const crisp = (value) => Math.round(value) + 0.5;

    ctx.save();
    ctx.beginPath();
    ctx.rect(bounds.left, bounds.top, bounds.width, bounds.height);
    ctx.clip();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.strokeStyle = style.line || "#ffd56f";
    ctx.lineWidth = 1.45;
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
    ctx.miterLimit = 1.5;
    ctx.beginPath();

    const yLevel = (segment) => crisp(yFor(segment.high ? info.highLevel : info.lowLevel));
    ctx.moveTo(crisp(xFor(segments[0].start)), yLevel(segments[0]));
    for (let index = 0; index < segments.length; index++) {
      const segment = segments[index];
      const currentY = yLevel(segment);
      ctx.lineTo(crisp(xFor(segment.end)), currentY);
      const next = segments[index + 1];
      if (next) {
        const x = crisp(xFor(next.start));
        ctx.lineTo(x, currentY);
        ctx.lineTo(x, yLevel(next));
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  function edgeAwareDisplayCondition(values, summary, sampleRateHz) {
    const info = squareWaveDisplayInfo(values, summary);
    if (!info.active || values.length < 16) {
      return { values: values.slice(), active: false };
    }

    const output = values.slice();
    const rate = Number(sampleRateHz || defaultSampleRateHz);
    const samplesPerPeriod = info.frequencyHz > 0 ? rate / info.frequencyHz : 0;
    const edgeGuard = clamp(Math.floor(samplesPerPeriod * 0.006), 2, 18);
    const minSegmentLength = Math.max(8, edgeGuard * 3);

    const segments = [];
    let zone = values[0] >= info.mid ? 1 : -1;
    let start = 0;
    for (let index = 1; index < values.length; index++) {
      const value = values[index];
      if (zone > 0 && value < info.mid - info.hysteresis) {
        segments.push({ start, end: index - 1, zone });
        start = index;
        zone = -1;
      } else if (zone < 0 && value > info.mid + info.hysteresis) {
        segments.push({ start, end: index - 1, zone });
        start = index;
        zone = 1;
      }
    }
    segments.push({ start, end: values.length - 1, zone });

    let conditionedSegments = 0;
    for (const segment of segments) {
      if (segment.end - segment.start + 1 < minSegmentLength) {
        continue;
      }

      const safeStart = Math.min(segment.end, segment.start + edgeGuard);
      const safeEnd = Math.max(safeStart, segment.end - edgeGuard);
      const plateau = values.slice(safeStart, safeEnd + 1).sort((a, b) => a - b);
      if (plateau.length < 4) {
        continue;
      }

      const level = trimmedAverageFromSorted(plateau, 0.25, 0.75);
      for (let index = safeStart; index <= safeEnd; index++) {
        output[index] = values[index] * 0.035 + level * 0.965;
      }
      conditionedSegments += 1;
    }

    return {
      values: output,
      active: conditionedSegments >= 2
    };
  }

  function buildDcColumns(values, targetCount) {
    if (!values.length || targetCount <= 0) {
      return [];
    }

    const sortedAll = values.slice().sort((a, b) => a - b);
    const stableValue = trimmedAverageFromSorted(sortedAll, 0.40, 0.60);
    const lowBand = sortedAll[Math.floor((sortedAll.length - 1) * 0.10)] ?? stableValue;
    const highBand = sortedAll[Math.ceil((sortedAll.length - 1) * 0.90)] ?? stableValue;
    const count = Math.min(targetCount, values.length);
    return Array.from({ length: count }, () => ({
      avg: stableValue,
      low: lowBand,
      high: highBand
    }));
  }

  function trimmedAverageFromSorted(sorted, lowerQuantile, upperQuantile) {
    if (!sorted.length) {
      return 0;
    }

    const lower = Math.floor((sorted.length - 1) * clamp(lowerQuantile, 0, 1));
    const upper = Math.ceil((sorted.length - 1) * clamp(upperQuantile, 0, 1));
    let sum = 0;
    let count = 0;
    for (let index = lower; index <= upper; index++) {
      sum += sorted[index];
      count += 1;
    }
    return count > 0 ? sum / count : sorted[Math.floor(sorted.length / 2)];
  }

  function smoothDcColumns(columns, radius) {
    if (columns.length < 3 || radius <= 0) {
      return columns;
    }

    return columns.map((column, index) => {
      let sumAvg = 0;
      let sumLow = 0;
      let sumHigh = 0;
      let count = 0;
      const start = Math.max(0, index - radius);
      const end = Math.min(columns.length - 1, index + radius);
      for (let sampleIndex = start; sampleIndex <= end; sampleIndex++) {
        sumAvg += columns[sampleIndex].avg;
        sumLow += columns[sampleIndex].low;
        sumHigh += columns[sampleIndex].high;
        count += 1;
      }
      return {
        avg: sumAvg / count,
        low: sumLow / count,
        high: sumHigh / count
      };
    });
  }

  function shouldUseDcConditioning(summary, values) {
    return false;
  }

  function drawDcConditionedTrace(ctx, bounds, columns, axis, style = channelStyles[0]) {
    if (columns.length < 2) {
      return;
    }

    const span = Math.max(0.000001, axis.max - axis.min);
    const xFor = (index) => bounds.left + bounds.width * index / Math.max(1, columns.length - 1);
    const yFor = (value) => bounds.bottom - (value - axis.min) / span * bounds.height;

    ctx.save();
    ctx.beginPath();
    ctx.rect(bounds.left, bounds.top, bounds.width, bounds.height);
    ctx.clip();

    ctx.fillStyle = style.fill || "rgba(45, 228, 193, 0.13)";
    ctx.beginPath();
    columns.forEach((column, index) => {
      const x = xFor(index);
      const y = yFor(column.high);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    for (let index = columns.length - 1; index >= 0; index--) {
      ctx.lineTo(xFor(index), yFor(columns[index].low));
    }
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = style.shadow || "rgba(255, 213, 111, 0.22)";
    ctx.shadowBlur = 8;
    ctx.strokeStyle = style.line || "#ffd56f";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    columns.forEach((column, index) => {
      const x = xFor(index);
      const y = yFor(column.avg);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawEmpty(ctx, bounds, message) {
    drawGrid(ctx, bounds, ["0 s", "", ""], ["", "", "", "", ""]);
    ctx.fillStyle = getOscilloscopeCanvasPalette().empty;
    ctx.font = "700 14px Inter, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message, bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
    ctx.closePath();
  }

  function averageTelemetry(state) {
    const history = state.voltageHistory;
    const summary = state.displaySummary || emptySummary();
    const relativeAverage = state.displayMode === "drop" && history.length
      ? history[history.length - 1].avg
      : summary.averageVoltage;
    const hasReference = Number.isFinite(Number(state.referenceVoltage));
    const absoluteAverage = hasReference
      ? relativeAverage + Number(state.referenceVoltage)
      : relativeAverage;
    return { relativeAverage, absoluteAverage, hasReference };
  }

  function drawAverageTooltip(ctx, bounds, state, axis = null) {
    if (!state.capture && !state.voltageHistory.length) {
      return;
    }

    const telemetry = averageTelemetry(state);
    const mainLabel = formatVoltage(telemetry.absoluteAverage);
    const subLabel = telemetry.hasReference
      ? `REL ${formatVoltage(telemetry.relativeAverage)}`
      : `CORR ${formatNumber(state.voltageCorrectionGain, 3)}x`;
    const boxWidth = 150;
    const boxHeight = 58;
    const boxX = bounds.right - boxWidth - 10;
    let boxY = bounds.top + 10;

    if (axis && state.displayMode === "yt") {
      const span = Math.max(0.000001, axis.max - axis.min);
      const avgY = bounds.bottom - (telemetry.relativeAverage - axis.min) / span * bounds.height;
      if (avgY >= bounds.top && avgY <= bounds.bottom) {
        ctx.save();
        ctx.strokeStyle = palette.lockedTrigger;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(bounds.left, avgY);
        ctx.lineTo(bounds.right, avgY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        boxY = clamp(avgY - boxHeight / 2, bounds.top + 8, bounds.bottom - boxHeight - 8);
      }
    }

    ctx.save();
    ctx.shadowColor = palette.tooltipShadow;
    ctx.shadowBlur = 14;
    roundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 8);
    ctx.fillStyle = palette.tooltipBackground;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 213, 111, 0.55)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#ffd56f";
    ctx.font = "800 10px Inter, Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("AVG", boxX + 12, boxY + 8);

    ctx.fillStyle = palette.tooltipText;
    ctx.font = "900 18px Consolas, monospace";
    ctx.fillText(mainLabel, boxX + 12, boxY + 23);

    ctx.fillStyle = palette.tooltipMuted;
    ctx.font = "700 10px Consolas, monospace";
    ctx.fillText(subLabel, boxX + 12, boxY + 45);
    ctx.restore();
  }

  function visibleChannelWindows(state) {
    const windows = state.displayChannelWindows?.length
      ? state.displayChannelWindows
      : state.displayWindow?.length
        ? [state.displayWindow]
        : [];
    return windows
      .map((values, index) => ({
        values: values || [],
        index,
        style: channelStyles[index] || channelStyles[0]
      }))
      .filter((channel) => channel.values.length && state.channelVisibility?.[channel.index] !== false);
  }

  function visibleChannelHistories(state) {
    const histories = state.channelVoltageHistories?.length
      ? state.channelVoltageHistories
      : [state.voltageHistory];
    return histories
      .map((history, index) => ({
        history: history || [],
        index,
        style: channelStyles[index] || channelStyles[0]
      }))
      .filter((channel) => channel.history.length >= 2 && state.channelVisibility?.[channel.index] !== false);
  }

  function combinedAxisFor(values, minSpan = 0.05) {
    if (!values.length) {
      return { min: -minSpan / 2, max: minSpan / 2 };
    }
    const traceStats = statsFor(values);
    const span = Math.max(traceStats.vpp * 1.35, minSpan);
    const center = traceStats.avg;
    return {
      min: center - span / 2,
      max: center + span / 2
    };
  }

  function drawChannelTextLegend(ctx, bounds, channels) {
    if (!Array.isArray(channels) || !channels.length) {
      return;
    }
    ctx.save();
    ctx.font = "800 10px Consolas, monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    let y = bounds.top + 8;
    channels.forEach((channel) => {
      ctx.fillStyle = channel.color || "#2de4c1";
      ctx.fillText(channel.text, bounds.right - 10, y);
      y += 14;
    });
    ctx.restore();
  }

  function drawYt(ctx, bounds, state) {
    const visibleChannels = visibleChannelWindows(state);
    const values = state.displayWindow;
    if (!values.length || !visibleChannels.length) {
      drawEmpty(ctx, bounds, "Belum ada capture");
      return;
    }
    const targetCount = Math.max(320, Math.min(2400, Math.floor(bounds.width * 1.4)));
    const summary = state.displaySummary;
    const renderedChannels = visibleChannels.map((channel) => {
      const dcConditioned = shouldUseDcConditioning(summary, channel.values);
      const digitalInfo = dcConditioned ? { active: false } : digitalTraceInfo(channel.values, summary, state);
      const dcColumns = dcConditioned
        ? buildDcColumns(channel.values, Math.max(180, Math.min(640, Math.floor(bounds.width * 0.62))))
        : [];
      const edgeConditioned = dcConditioned || digitalInfo.active
        ? { values: channel.values, active: false }
        : edgeAwareDisplayCondition(channel.values, summary, state.frameSampleRateHz);
      const plotValues = dcConditioned
        ? dcColumns.flatMap((column) => [column.low, column.avg, column.high])
        : digitalInfo.active
          ? channel.values
        : edgeConditioned.active
          ? linearResample(edgeConditioned.values, targetCount)
          : resampleForDisplay(edgeConditioned.values, targetCount, state.sincInterpolation);
      return {
        ...channel,
        dcConditioned,
        dcColumns,
        digitalInfo,
        edgeConditioned,
        plotValues,
        axis: verticalAxisFor(plotValues.length ? plotValues : channel.values, state, channel.index),
        style: channelStyles[channel.index] || channelStyles[0]
      };
    });
    const primaryRendered = renderedChannels.find((channel) => channel.index === 0) || renderedChannels[0];
    const axis = primaryRendered?.axis || verticalAxisFor(values, state, 0);
    const palette = getOscilloscopeCanvasPalette();
    drawGrid(ctx, bounds, [
      "0 s",
      formatDurationSeconds(summary.spanSeconds / 2),
      formatDurationSeconds(summary.spanSeconds)
    ], [
      formatVoltage(axis.max),
      formatVoltage(axis.min + (axis.max - axis.min) * 0.75),
      formatVoltage(axis.min + (axis.max - axis.min) * 0.50),
      formatVoltage(axis.min + (axis.max - axis.min) * 0.25),
      formatVoltage(axis.min)
    ]);

    const span = Math.max(0.000001, axis.max - axis.min);
    const zeroY = bounds.bottom - (0 - axis.min) / span * bounds.height;
    if (zeroY >= bounds.top && zeroY <= bounds.bottom) {
      ctx.strokeStyle = palette.guide;
      ctx.beginPath();
      ctx.moveTo(bounds.left, zeroY);
      ctx.lineTo(bounds.right, zeroY);
      ctx.stroke();
    }

    const triggerY = bounds.bottom - (summary.triggerLevel - axis.min) / span * bounds.height;
    if (triggerY >= bounds.top && triggerY <= bounds.bottom) {
      ctx.strokeStyle = summary.triggerLocked ? palette.lockedTrigger : palette.trigger;
      ctx.beginPath();
      ctx.moveTo(bounds.left, triggerY);
      ctx.lineTo(bounds.right, triggerY);
      ctx.stroke();
    }

    const triggerX = bounds.left + bounds.width * clamp(Number(state.preTriggerPercent || 50), 10, 90) / 100;
    ctx.strokeStyle = summary.triggerLocked ? palette.lockedTrigger : palette.trigger;
    ctx.beginPath();
    ctx.moveTo(triggerX, bounds.top);
    ctx.lineTo(triggerX, bounds.bottom);
    ctx.stroke();

    for (const channel of renderedChannels) {
      if (channel.dcConditioned && channel.dcColumns.length) {
        drawDcConditionedTrace(ctx, bounds, channel.dcColumns, channel.axis, channel.style);
      } else if (channel.digitalInfo?.active) {
        drawDigitalTrace(ctx, bounds, channel.values, channel.axis, channel.style, channel.digitalInfo);
      } else {
        drawTrace(ctx, bounds, channel.plotValues, channel.axis, channel.style, {
          crisp: channel.edgeConditioned?.active
        });
      }
    }
    drawChannelTextLegend(ctx, bounds, renderedChannels.map((channel) => ({
      color: channel.style.line,
      text: channel.style.label || `CH${channel.index + 1}`
    })));

    ctx.fillStyle = summary.triggerLocked ? "#ffd56f" : palette.triggerLabel;
    ctx.font = "700 11px Consolas, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(summary.triggerLocked ? "TRIG" : "AUTO", bounds.left + 8, bounds.top + 8);
  }

  function drawFft(ctx, bounds, state) {
    const channels = visibleChannelWindows(state);
    if (!channels.length) {
      drawEmpty(ctx, bounds, "FFT menunggu data");
      return;
    }

    const spectra = channels
      .map((channel) => ({
        ...channel,
        spectrum: averageSpectrum(state, buildSpectrum(channel.values, state.frameSampleRateHz), channel.index)
      }))
      .filter((channel) => channel.spectrum.bins.length);
    state.spectrum = spectra[0]?.spectrum || null;
    if (!spectra.length) {
      drawEmpty(ctx, bounds, "FFT menunggu data");
      return;
    }

    const nyquistFrequency = Number(state.frameSampleRateHz || 0) / 2;
    const maxFrequency = fftDisplayMaxFrequencyHz(spectra, nyquistFrequency);
    const peakMagnitude = Math.max(...spectra.map((channel) => channel.spectrum.peakMagnitude));
    const maxMagnitude = Math.max(peakMagnitude * 1.25, 0.0005);
    drawGrid(ctx, bounds, ["0 Hz", formatFrequency(maxFrequency / 2), formatFrequency(maxFrequency)], [
      formatVoltage(maxMagnitude),
      formatVoltage(maxMagnitude * 0.75),
      formatVoltage(maxMagnitude * 0.50),
      formatVoltage(maxMagnitude * 0.25),
      "0 V"
    ]);

    spectra.forEach((channel) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(bounds.left, bounds.top, bounds.width, bounds.height);
      ctx.clip();
      ctx.shadowColor = channel.style.shadow || "rgba(45, 228, 193, 0.22)";
      ctx.shadowBlur = 5;
      ctx.strokeStyle = channel.style.line;
      ctx.lineWidth = channel.index === 0 ? 1.35 : 1.55;
      ctx.beginPath();
      let hasPoint = false;
      channel.spectrum.bins.forEach((bin, index) => {
        if (bin.frequencyHz > maxFrequency) {
          return;
        }
        const x = bounds.left + bin.frequencyHz / Math.max(1, maxFrequency) * bounds.width;
        const y = bounds.bottom - bin.magnitude / maxMagnitude * bounds.height;
        if (!hasPoint) {
          ctx.moveTo(x, y);
          hasPoint = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.restore();
    });
    drawFftPeakMarkers(ctx, bounds, spectra, maxFrequency, maxMagnitude);

    drawChannelTextLegend(ctx, bounds, spectra.map((channel) => ({
      color: channel.style.line,
      text: channel.style.label || `CH${channel.index + 1}`
    })));
  }

  function niceCeilFrequencyHz(value) {
    const safeValue = Math.max(1, Number(value || 0));
    const exponent = Math.floor(Math.log10(safeValue));
    const base = 10 ** exponent;
    const normalized = safeValue / base;
    const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return step * base;
  }

  function fftDisplayMaxFrequencyHz(spectra, nyquistFrequency) {
    const nyquist = Math.max(1, Number(nyquistFrequency || 0));
    let target = 0;
    spectra.forEach((channel) => {
      const spectrum = channel.spectrum || {};
      if (spectrum.peakFrequencyHz > 0) {
        target = Math.max(target, spectrum.peakFrequencyHz * 5);
      }
      const significantLevel = Math.max(minimumFftPeakMagnitude, Number(spectrum.peakMagnitude || 0) * 0.08);
      (spectrum.bins || []).forEach((bin) => {
        if (bin.magnitude >= significantLevel) {
          target = Math.max(target, bin.frequencyHz * 1.15);
        }
      });
    });

    if (target <= 0) {
      return nyquist;
    }
    const span = niceCeilFrequencyHz(target);
    return clamp(span, Math.min(100, nyquist), nyquist);
  }

  function drawFftPeakMarkers(ctx, bounds, spectra, maxFrequency, maxMagnitude) {
    const palette = getOscilloscopeCanvasPalette();
    const labelled = spectra.filter((channel) => (
      channel.spectrum?.peakFrequencyHz > 0 &&
      channel.spectrum?.peakMagnitude >= minimumFftPeakMagnitude &&
      channel.spectrum.peakFrequencyHz <= maxFrequency
    ));
    labelled.forEach((channel, index) => {
      const spectrum = channel.spectrum;
      const x = bounds.left + spectrum.peakFrequencyHz / Math.max(1, maxFrequency) * bounds.width;
      const y = bounds.bottom - spectrum.peakMagnitude / maxMagnitude * bounds.height;
      ctx.save();
      ctx.strokeStyle = channel.style.line;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, bounds.top);
      ctx.lineTo(x, bounds.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      const boxWidth = 134;
      const boxHeight = 42;
      const boxX = clamp(x + 8, bounds.left + 4, bounds.right - boxWidth - 4);
      const boxY = bounds.top + 8 + index * (boxHeight + 6);
      ctx.fillStyle = palette.tooltipBackground;
      ctx.strokeStyle = channel.style.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = channel.style.line;
      ctx.font = "800 10px Inter, Segoe UI, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`${channel.style.label || `CH${channel.index + 1}`} PEAK`, boxX + 10, boxY + 7);
      ctx.fillStyle = palette.tooltipText;
      ctx.font = "900 16px Consolas, monospace";
      ctx.fillText(formatFrequency(spectrum.peakFrequencyHz), boxX + 10, boxY + 21);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = channel.style.line;
      ctx.beginPath();
      ctx.arc(x, clamp(y, bounds.top, bounds.bottom), 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawXy(ctx, bounds, state) {
    const ch1 = state.displayChannelWindows?.[0] || state.displayWindow || [];
    const ch2 = state.displayChannelWindows?.[1] || [];
    if (state.channelVisibility?.[0] === false || state.channelVisibility?.[1] === false || ch1.length < 32 || ch2.length < 32) {
      drawEmpty(ctx, bounds, "XY butuh CH1 dan CH2");
      return;
    }

    const ch1Stats = statsFor(ch1);
    const ch2Stats = statsFor(ch2);
    if (ch1Stats.vpp < minimumPulseDetectVpp || ch2Stats.vpp < minimumPulseDetectVpp) {
      drawEmpty(ctx, bounds, "XY butuh sinyal di CH1 dan CH2");
      return;
    }

    const targetCount = Math.min(2400, Math.max(320, Math.floor(bounds.width * 1.4)));
    const xSource = resampleForDisplay(ch1, targetCount, state.sincInterpolation);
    const ySource = resampleForDisplay(ch2, targetCount, state.sincInterpolation);
    const pointCount = Math.min(xSource.length, ySource.length);
    const xValues = xSource.slice(0, pointCount);
    const yValues = ySource.slice(0, pointCount);
    const xAxis = verticalAxisFor(xValues, state, 0);
    const yAxis = verticalAxisFor(yValues, state, 1);
    drawGrid(ctx, bounds, [
      formatVoltage(xAxis.min),
      formatVoltage(xAxis.min + (xAxis.max - xAxis.min) / 2),
      formatVoltage(xAxis.max)
    ], [
      formatVoltage(yAxis.max),
      "",
      formatVoltage(yAxis.min + (yAxis.max - yAxis.min) / 2),
      "",
      formatVoltage(yAxis.min)
    ]);
    const xSpan = Math.max(0.000001, xAxis.max - xAxis.min);
    const ySpan = Math.max(0.000001, yAxis.max - yAxis.min);
    ctx.save();
    ctx.beginPath();
    ctx.rect(bounds.left, bounds.top, bounds.width, bounds.height);
    ctx.clip();
    ctx.strokeStyle = channelStyles[1].line;
    ctx.shadowColor = channelStyles[1].shadow;
    ctx.shadowBlur = 7;
    ctx.lineWidth = 1.4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let index = 0; index < xValues.length; index++) {
      const x = bounds.left + (xValues[index] - xAxis.min) / xSpan * bounds.width;
      const y = bounds.bottom - (yValues[index] - yAxis.min) / ySpan * bounds.height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.restore();
    drawChannelTextLegend(ctx, bounds, [
      { color: channelStyles[0].line, text: "X CH1" },
      { color: channelStyles[1].line, text: "Y CH2" }
    ]);
  }

  function drawHistoryLine(ctx, bounds, points, key, axis, color, width = 1.5, alpha = 1) {
    if (points.length < 2) {
      return;
    }

    const span = Math.max(0.000001, axis.max - axis.min);
    ctx.save();
    ctx.beginPath();
    ctx.rect(bounds.left, bounds.top, bounds.width, bounds.height);
    ctx.clip();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    points.forEach((point, index) => {
      const x = bounds.left + bounds.width * index / Math.max(1, points.length - 1);
      const y = bounds.bottom - (point[key] - axis.min) / span * bounds.height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawDropTrend(ctx, bounds, state) {
    const channelHistories = visibleChannelHistories(state);
    if (!channelHistories.length) {
      drawEmpty(ctx, bounds, "DROP menunggu data");
      return;
    }

    const values = [];
    channelHistories.forEach((channel) => {
      channel.history.forEach((point) => {
        values.push(point.min, point.avg, point.max);
      });
    });
    const axis = combinedAxisFor(values, 0.05);
    const firstMs = Math.min(...channelHistories.map((channel) => channel.history[0].timeMs));
    const lastMs = Math.max(...channelHistories.map((channel) => channel.history[channel.history.length - 1].timeMs));
    const spanSeconds = Math.max(0, (lastMs - firstMs) / 1000);
    const palette = getOscilloscopeCanvasPalette();
    drawGrid(ctx, bounds, [
      `-${formatDurationSeconds(spanSeconds)}`,
      formatDurationSeconds(spanSeconds / 2),
      "now"
    ], [
      formatVoltage(axis.max),
      formatVoltage(axis.min + (axis.max - axis.min) * 0.75),
      formatVoltage(axis.min + (axis.max - axis.min) * 0.50),
      formatVoltage(axis.min + (axis.max - axis.min) * 0.25),
      formatVoltage(axis.min)
    ]);

    const span = Math.max(0.000001, axis.max - axis.min);
    const zeroY = bounds.bottom - (0 - axis.min) / span * bounds.height;
    if (zeroY >= bounds.top && zeroY <= bounds.bottom) {
      ctx.strokeStyle = palette.guide;
      ctx.beginPath();
      ctx.moveTo(bounds.left, zeroY);
      ctx.lineTo(bounds.right, zeroY);
      ctx.stroke();
    }

    channelHistories.forEach((channel) => {
      drawHistoryLine(ctx, bounds, channel.history, "max", axis, channel.style.line, 1.1, 0.48);
      drawHistoryLine(ctx, bounds, channel.history, "avg", axis, channel.style.line, 2.0, 1);
      drawHistoryLine(ctx, bounds, channel.history, "min", axis, channel.style.line, 1.3, 0.68);

      const lowest = state.channelLowestDropVoltages?.[channel.index]
        ?? Math.min(...channel.history.map((point) => point.min));
      const lowY = bounds.bottom - (lowest - axis.min) / span * bounds.height;
      if (lowY >= bounds.top && lowY <= bounds.bottom) {
        ctx.strokeStyle = channel.style.line;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(bounds.left, lowY);
        ctx.lineTo(bounds.right, lowY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    drawChannelTextLegend(ctx, bounds, channelHistories.map((channel) => ({
      color: channel.style.line,
      text: channel.style.label || `CH${channel.index + 1}`
    })));
  }

  function normalizeDeviceSelection(value) {
    const normalized = String(value || "").trim().toUpperCase();
    if (!normalized) {
      return "";
    }
    if (normalized === "WIFI" || normalized === "WI-FI" || normalized === "TEKNISIHUB_FLASH_OSC_WIFI") {
      return "TEKNISIHUB_FLASH_OSC_WIFI";
    }
    if (normalized === "USB" || normalized === "TEKNISIHUB_FLASH_OSC" || normalized === "TEKNISIHUB_FLASH_OSC_USB") {
      return "TEKNISIHUB_FLASH_OSC_USB";
    }
    return "";
  }

  function getDevicePickerState(state) {
    const selectedDevice = normalizeDeviceSelection(state.selectedDevice);
    if (!selectedDevice) {
      return {
        status: "idle",
        icon: "usb",
        title: "Pilih koneksi USB atau WIFI."
      };
    }
    const profile = deviceProfiles[selectedDevice] || deviceProfiles[defaultDeviceType];
    const hasError = state.deviceConnectionStatus === "failed";
    if (hasError) {
      return {
        status: "failed",
        icon: "error",
        title: state.errorMessage || state.device?.message || "Koneksi device gagal."
      };
    }
    if (state.deviceConnectionStatus === "checking") {
      return {
        status: "checking",
        icon: "sync",
        title: `${profile.transport} dicek.`
      };
    }
    if (isSelectedDeviceConnected(state)) {
      return {
        status: "connected",
        icon: profile.icon,
        title: state.device?.message || `${profile.transport} terhubung.`
      };
    }
    return {
      status: "idle",
      icon: profile.icon,
      title: "Pilih koneksi USB atau WIFI."
    };
  }

  function isSelectedDeviceConnected(state) {
    const selectedDevice = normalizeDeviceSelection(state.selectedDevice);
    return Boolean(selectedDevice) &&
      Boolean(state.device?.isPresent) &&
      normalizeDeviceSelection(state.device?.deviceType) === normalizeDeviceSelection(state.selectedDevice);
  }

  function createShellMarkup() {
    const sampleRateOptions = [10000, 20000, 50000, 100000, 200000, 250000, 400000, 480000, 500000, 800000, 1000000, 1300000, 2000000];
    const sampleCountOptions = [512, 1024, 2048, 4096, 8192, 16384];
    const voltsPerDivOptions = ["auto", 0.05, 0.1, 0.2, 0.5, 1, 2, 5];
    const initialChannelProbes = storedChannelProbeAttenuations();
    const initialChannelVisibility = storedChannelVisibility();
    const devicePickerState = getDevicePickerState({
      selectedDevice: "",
      deviceConnectionStatus: "idle",
      device: { isPresent: false }
    });

    return `
      <div class="oscilloscope-shell scoppy-scope">
        <section class="oscilloscope-scope-panel">
          <div class="oscilloscope-topbar">
            <div class="oscilloscope-title-block">
              <p data-osc-device-label>TEKNISIHUB_FLASH_OSC</p>
            </div>
            <label
              class="spi-scope-device-picker oscilloscope-device-picker is-${escapeHtml(devicePickerState.status)}"
              data-osc-device-picker
              data-connection-state="${escapeHtml(devicePickerState.status)}"
              title="${escapeHtml(devicePickerState.title)}">
              <span data-osc-device-icon class="material-symbols-outlined">${escapeHtml(devicePickerState.icon)}</span>
              <select id="oscDeviceSelect" aria-label="Pilih koneksi device">
                <option value="" selected>${escapeHtml(connectionPlaceholderLabel)}</option>
                ${Object.entries(deviceProfiles).map(([key, item]) => `
                  <option value="${escapeHtml(key)}">${escapeHtml(`${item.label} ${item.transport}`)}</option>
                `).join("")}
              </select>
              <span class="spi-scope-device-indicator" aria-hidden="true"></span>
            </label>
          </div>

          <div class="oscilloscope-workbench">
            <div class="oscilloscope-main-stack">
              <div class="oscilloscope-waveform-wrap">
                <canvas id="oscCanvas" class="oscilloscope-waveform" width="1200" height="520"></canvas>
              </div>

              <div class="oscilloscope-readout-row">
                <span class="is-ch1">CH1 VPP <strong data-osc-vpp>-</strong></span>
                <span class="is-ch1">CH1 RMS <strong data-osc-rms>-</strong></span>
                <span class="is-ch1">CH1 AVG <strong data-osc-avg>-</strong></span>
                <span class="is-ch1">CH1 LOW <strong data-osc-low>-</strong></span>
                <span class="is-ch1">CH1 CORR <strong data-osc-correction-ch1>1.000x</strong></span>
                <span class="is-ch2">CH2 VPP <strong data-osc-ch2-vpp>-</strong></span>
                <span class="is-ch2">CH2 RMS <strong data-osc-ch2-rms>-</strong></span>
                <span class="is-ch2">CH2 AVG <strong data-osc-ch2-avg>-</strong></span>
                <span class="is-ch2">CH2 LOW <strong data-osc-ch2-low>-</strong></span>
                <span class="is-ch2">CH2 CORR <strong data-osc-correction-ch2>1.000x</strong></span>
                <span class="is-system">FREQ <strong data-osc-freq>-</strong></span>
                <span class="is-system">PERIOD <strong data-osc-period>-</strong></span>
                <span class="is-system">DUTY <strong data-osc-duty>-</strong></span>
                <span class="is-system">REF <strong data-osc-ref>ABS</strong></span>
                <span class="is-system">TRIG <strong data-osc-trigger>-</strong></span>
                <span class="is-system">MODE <strong data-osc-mode>YT</strong></span>
                <span class="is-system">CH <strong data-osc-readout-channels>1</strong></span>
              </div>

              <div class="oscilloscope-channel-strip">
                <div class="oscilloscope-channel-row oscilloscope-channel-row-ch1">
                  <p>Channel 1</p>
                  <label class="oscilloscope-switch-row">
                    <input id="oscShowCh1" type="checkbox"${initialChannelVisibility[0] ? " checked" : ""}>
                    <span>Show CH1</span>
                  </label>
                  <label>
                    Probe CH1
                    <select id="oscProbeCh1">
                      ${Object.values(probeProfiles).map((profile) => `
                        <option value="${escapeHtml(profile.value)}"${profile.value === initialChannelProbes[0] ? " selected" : ""}>${escapeHtml(profile.label)}</option>
                      `).join("")}
                    </select>
                  </label>
                  <label>
                    Actual V CH1
                    <input id="oscActualVoltageCh1" type="number" inputmode="decimal" step="0.001" placeholder="2.900" value="${escapeHtml(storedChannelActualVoltage(0, initialChannelProbes[0]) ?? "")}">
                  </label>
                  <label>
                    Volts/Div CH1
                    <span class="oscilloscope-select-row">
                      <select id="oscVoltsDivCh1">
                        ${voltsPerDivOptions.map((value) => `
                          <option value="${escapeHtml(value)}">${escapeHtml(value === "auto" ? "Auto" : `${value} V/div`)}</option>
                        `).join("")}
                      </select>
                      <button type="button" id="oscAutoScaleCh1" class="ghost oscilloscope-icon-button" title="Auto scale CH1" aria-label="Auto scale CH1">
                        <span class="material-symbols-outlined" aria-hidden="true">fit_screen</span>
                      </button>
                    </span>
                  </label>
                  <label>
                    Position CH1
                    <span class="oscilloscope-position-row">
                      <input id="oscVerticalPositionCh1" type="range" min="-10" max="10" step="0.05" value="0">
                      <button type="button" id="oscResetPositionCh1" class="ghost oscilloscope-icon-button" title="Reset posisi CH1" aria-label="Reset posisi CH1">
                        <span class="material-symbols-outlined" aria-hidden="true">my_location</span>
                      </button>
                    </span>
                  </label>
                </div>

                <div class="oscilloscope-channel-row oscilloscope-channel-row-ch2">
                  <p>Channel 2</p>
                  <label class="oscilloscope-switch-row">
                    <input id="oscShowCh2" type="checkbox"${initialChannelVisibility[1] ? " checked" : ""}>
                    <span>Show CH2</span>
                  </label>
                  <label>
                    Probe CH2
                    <select id="oscProbeCh2">
                      ${Object.values(probeProfiles).map((profile) => `
                        <option value="${escapeHtml(profile.value)}"${profile.value === initialChannelProbes[1] ? " selected" : ""}>${escapeHtml(profile.label)}</option>
                      `).join("")}
                    </select>
                  </label>
                  <label>
                    Actual V CH2
                    <input id="oscActualVoltageCh2" type="number" inputmode="decimal" step="0.001" placeholder="2.900" value="${escapeHtml(storedChannelActualVoltage(1, initialChannelProbes[1]) ?? "")}">
                  </label>
                  <label>
                    Volts/Div CH2
                    <span class="oscilloscope-select-row">
                      <select id="oscVoltsDivCh2">
                        ${voltsPerDivOptions.map((value) => `
                          <option value="${escapeHtml(value)}">${escapeHtml(value === "auto" ? "Auto" : `${value} V/div`)}</option>
                        `).join("")}
                      </select>
                      <button type="button" id="oscAutoScaleCh2" class="ghost oscilloscope-icon-button" title="Auto scale CH2" aria-label="Auto scale CH2">
                        <span class="material-symbols-outlined" aria-hidden="true">fit_screen</span>
                      </button>
                    </span>
                  </label>
                  <label>
                    Position CH2
                    <span class="oscilloscope-position-row">
                      <input id="oscVerticalPositionCh2" type="range" min="-10" max="10" step="0.05" value="0">
                      <button type="button" id="oscResetPositionCh2" class="ghost oscilloscope-icon-button" title="Reset posisi CH2" aria-label="Reset posisi CH2">
                        <span class="material-symbols-outlined" aria-hidden="true">my_location</span>
                      </button>
                    </span>
                  </label>
                </div>
              </div>

              <p class="oscilloscope-message" data-osc-message>OSC siap.</p>
            </div>

            <div class="oscilloscope-side-controls">
              <div class="oscilloscope-control-group oscilloscope-run-group">
                <p>Acquire</p>
                <button type="button" id="oscRun" class="ghost oscilloscope-run-button">
                  <span class="material-symbols-outlined" aria-hidden="true">play_arrow</span>
                  <span>Run</span>
                </button>
                <button type="button" id="oscSingle" class="ghost">
                  <span class="material-symbols-outlined" aria-hidden="true">timeline</span>
                  <span>Single</span>
                </button>
                <button type="button" id="oscRecord" class="ghost oscilloscope-record-button">
                  <span class="material-symbols-outlined" aria-hidden="true">radio_button_checked</span>
                  <span>Record</span>
                </button>
                <label>
                  CAL PAD Mode
                  <select id="oscCalPadMode">
                    ${calPadModes.map((mode) => `
                      <option value="${escapeHtml(mode.key)}"${mode.key === defaultCalPadMode ? " selected" : ""}>${escapeHtml(mode.label)}</option>
                    `).join("")}
                  </select>
                </label>
                <button type="button" id="oscCalPad" class="ghost oscilloscope-calpad-button">
                  <span class="material-symbols-outlined" aria-hidden="true">power_settings_new</span>
                  <span>CAL PAD Off</span>
                </button>
              </div>

              <div class="oscilloscope-control-group">
                <p>Display</p>
                <div class="oscilloscope-mode-toggle">
                  <button type="button" id="oscModeYt" class="ghost is-active">
                    <span class="material-symbols-outlined" aria-hidden="true">show_chart</span>
                    <span>YT</span>
                  </button>
                  <button type="button" id="oscModeFft" class="ghost">
                    <span class="material-symbols-outlined" aria-hidden="true">monitoring</span>
                    <span>FFT</span>
                  </button>
                  <button type="button" id="oscModeXy" class="ghost">
                    <span class="material-symbols-outlined" aria-hidden="true">scatter_plot</span>
                    <span>XY</span>
                  </button>
                  <button type="button" id="oscModeDrop" class="ghost">
                    <span class="material-symbols-outlined" aria-hidden="true">trending_down</span>
                    <span>DROP</span>
                  </button>
                </div>
                <label class="oscilloscope-switch-row">
                  <input id="oscSinc" type="checkbox" checked>
                  <span>Sin(x)/x interpolation</span>
                </label>
                <button type="button" id="oscClearDrop" class="ghost">
                  <span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>
                  <span>Reset DROP</span>
                </button>
              </div>

              <div class="oscilloscope-control-group">
                <p>Timebase</p>
                <label>
                  Sample Rate
                  <select id="oscSampleRate">
                    ${sampleRateOptions.map((rate) => `
                      <option value="${escapeHtml(rate)}"${rate === defaultSampleRateHz ? " selected" : ""}>${escapeHtml(formatSampleRateOption(rate))}</option>
                    `).join("")}
                  </select>
                </label>
                <label>
                  Record Length
                  <select id="oscSampleCount">
                    ${sampleCountOptions.map((count) => `
                      <option value="${escapeHtml(count)}"${count === defaultSampleCount ? " selected" : ""}>${escapeHtml(formatNumber(count))} pts</option>
                    `).join("")}
                  </select>
                </label>
              </div>

              <div class="oscilloscope-control-group">
                <p>Trigger</p>
                <label>
                  Edge
                  <select id="oscTriggerEdge">
                    <option value="rising">Rising</option>
                    <option value="falling">Falling</option>
                  </select>
                </label>
                <label>
                  Pre-trigger
                  <select id="oscPreTrigger">
                    <option value="10">10%</option>
                    <option value="25">25%</option>
                    <option value="50" selected>50%</option>
                    <option value="75">75%</option>
                    <option value="90">90%</option>
                  </select>
                </label>
                <label>
                  Level
                  <input id="oscTriggerLevel" type="range" min="0" max="100" step="1" value="50">
                </label>
              </div>
            </div>
          </div>
        </section>

        <div
          id="oscRunConfirmModal"
          class="catalog-modal hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="oscRunConfirmTitle"
          aria-describedby="oscRunConfirmDescription"
          tabindex="-1"
        >
          <div class="catalog-modal-card delete-confirm-modal-card">
            <div class="delete-confirm-icon-shell" aria-hidden="true">
              <span class="material-symbols-outlined">warning</span>
            </div>
            <div class="delete-confirm-copy">
              <p class="label">Konfirmasi Run</p>
              <h3 id="oscRunConfirmTitle">Pastikan probe</h3>
              <p id="oscRunConfirmDescription">Pastikan probe fisik sama dengan selector probe dan clip GND probe terhubung ke GND target sebelum mulai capture.</p>
            </div>
            <div class="delete-confirm-target">
              <span class="material-symbols-outlined" aria-hidden="true">cable</span>
              <strong id="oscRunConfirmTarget">Probe</strong>
            </div>
            <div class="delete-confirm-actions">
              <button id="oscRunConfirmCancel" type="button" class="ghost">
                <span class="material-symbols-outlined">close</span>
                <span>Batal</span>
              </button>
              <button id="oscRunConfirmStart" type="button" class="catalog-delete-confirm-button">
                <span class="material-symbols-outlined">play_arrow</span>
                <span>Run</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function createApi() {
    const state = createInitialState();
    let mountedContainer = null;
    let notify = () => {};
    let refs = {};
    let loopTimer = null;
    let loopGeneration = 0;
    let drawQueued = false;
    let runConfirmResolver = null;
    let themeListenerBound = false;
    let deviceSelectionToken = 0;
    let calPadRequestInFlight = false;

    function mountShell() {
      if (!mountedContainer) {
        return;
      }
      mountedContainer.innerHTML = createShellMarkup();
      refs = {
        canvas: mountedContainer.querySelector("#oscCanvas"),
        devicePicker: mountedContainer.querySelector("[data-osc-device-picker]"),
        deviceSelect: mountedContainer.querySelector("#oscDeviceSelect"),
        deviceIcon: mountedContainer.querySelector("[data-osc-device-icon]"),
        run: mountedContainer.querySelector("#oscRun"),
        single: mountedContainer.querySelector("#oscSingle"),
        record: mountedContainer.querySelector("#oscRecord"),
        calPadMode: mountedContainer.querySelector("#oscCalPadMode"),
        calPad: mountedContainer.querySelector("#oscCalPad"),
        modeYt: mountedContainer.querySelector("#oscModeYt"),
        modeFft: mountedContainer.querySelector("#oscModeFft"),
        modeXy: mountedContainer.querySelector("#oscModeXy"),
        modeDrop: mountedContainer.querySelector("#oscModeDrop"),
        clearDrop: mountedContainer.querySelector("#oscClearDrop"),
        sinc: mountedContainer.querySelector("#oscSinc"),
        showCh1: mountedContainer.querySelector("#oscShowCh1"),
        showCh2: mountedContainer.querySelector("#oscShowCh2"),
        probeCh1: mountedContainer.querySelector("#oscProbeCh1"),
        probeCh2: mountedContainer.querySelector("#oscProbeCh2"),
        actualVoltages: [
          mountedContainer.querySelector("#oscActualVoltageCh1"),
          mountedContainer.querySelector("#oscActualVoltageCh2")
        ],
        voltsDivs: [
          mountedContainer.querySelector("#oscVoltsDivCh1"),
          mountedContainer.querySelector("#oscVoltsDivCh2")
        ],
        verticalPositions: [
          mountedContainer.querySelector("#oscVerticalPositionCh1"),
          mountedContainer.querySelector("#oscVerticalPositionCh2")
        ],
        autoScaleButtons: [
          mountedContainer.querySelector("#oscAutoScaleCh1"),
          mountedContainer.querySelector("#oscAutoScaleCh2")
        ],
        resetPositionButtons: [
          mountedContainer.querySelector("#oscResetPositionCh1"),
          mountedContainer.querySelector("#oscResetPositionCh2")
        ],
        sampleRate: mountedContainer.querySelector("#oscSampleRate"),
        sampleCount: mountedContainer.querySelector("#oscSampleCount"),
        triggerEdge: mountedContainer.querySelector("#oscTriggerEdge"),
        preTrigger: mountedContainer.querySelector("#oscPreTrigger"),
        triggerLevel: mountedContainer.querySelector("#oscTriggerLevel"),
        runConfirmModal: mountedContainer.querySelector("#oscRunConfirmModal"),
        runConfirmCancel: mountedContainer.querySelector("#oscRunConfirmCancel"),
        runConfirmStart: mountedContainer.querySelector("#oscRunConfirmStart"),
        runConfirmTitle: mountedContainer.querySelector("#oscRunConfirmTitle"),
        runConfirmDescription: mountedContainer.querySelector("#oscRunConfirmDescription"),
        runConfirmTarget: mountedContainer.querySelector("#oscRunConfirmTarget"),
        labels: {
          device: mountedContainer.querySelector("[data-osc-device-label]"),
          title: mountedContainer.querySelector("[data-osc-run-title]"),
          freq: mountedContainer.querySelector("[data-osc-freq]"),
          period: mountedContainer.querySelector("[data-osc-period]"),
          duty: mountedContainer.querySelector("[data-osc-duty]"),
          vpp: mountedContainer.querySelector("[data-osc-vpp]"),
          rms: mountedContainer.querySelector("[data-osc-rms]"),
          avg: mountedContainer.querySelector("[data-osc-avg]"),
          ch2Vpp: mountedContainer.querySelector("[data-osc-ch2-vpp]"),
          ch2Rms: mountedContainer.querySelector("[data-osc-ch2-rms]"),
          ch2Avg: mountedContainer.querySelector("[data-osc-ch2-avg]"),
          low: mountedContainer.querySelector("[data-osc-low]"),
          ch2Low: mountedContainer.querySelector("[data-osc-ch2-low]"),
          ref: mountedContainer.querySelector("[data-osc-ref]"),
          correctionCh1: mountedContainer.querySelector("[data-osc-correction-ch1]"),
          correctionCh2: mountedContainer.querySelector("[data-osc-correction-ch2]"),
          trigger: mountedContainer.querySelector("[data-osc-trigger]"),
          mode: mountedContainer.querySelector("[data-osc-mode]"),
          readoutChannels: mountedContainer.querySelector("[data-osc-readout-channels]"),
          message: mountedContainer.querySelector("[data-osc-message]")
        }
      };
      bindEvents();
      updateInstrument();
    }

    function bindThemeListener() {
      if (themeListenerBound || !globalScope.document?.addEventListener) {
        return;
      }

      themeListenerBound = true;
      globalScope.document.addEventListener("teknisihub:themechange", () => {
        requestDraw();
      });
    }

    function bindEvents() {
      refs.deviceSelect?.addEventListener("change", () => {
        void selectDevice(refs.deviceSelect.value);
      });
      refs.run?.addEventListener("click", toggleContinuous);
      refs.single?.addEventListener("click", () => withBusy(() => captureWaveform({ saveTemporary: true })));
      refs.record?.addEventListener("click", toggleRecording);
      refs.calPad?.addEventListener("click", () => {
        void toggleCalPadFromUser();
      });
      refs.calPadMode?.addEventListener("change", () => {
        void changeCalPadMode(refs.calPadMode.value);
      });
      refs.modeYt?.addEventListener("click", () => setDisplayMode("yt"));
      refs.modeFft?.addEventListener("click", () => setDisplayMode("fft"));
      refs.modeXy?.addEventListener("click", () => setDisplayMode("xy"));
      refs.modeDrop?.addEventListener("click", () => setDisplayMode("drop"));
      refs.clearDrop?.addEventListener("click", clearDropHistory);
      refs.sinc?.addEventListener("change", () => {
        state.sincInterpolation = Boolean(refs.sinc.checked);
        state.message = state.sincInterpolation ? "Sin(x)/x interpolation aktif." : "Interpolation linear aktif.";
        updateInstrument();
      });
      refs.showCh1?.addEventListener("change", () => {
        state.channelVisibility[0] = Boolean(refs.showCh1.checked);
        if (!state.channelVisibility[0] && !state.channelVisibility[1]) {
          state.channelVisibility[0] = true;
          refs.showCh1.checked = true;
        }
        state.channelVisibility = saveChannelVisibility(state.channelVisibility);
        updateInstrument();
      });
      refs.showCh2?.addEventListener("change", () => {
        state.channelVisibility[1] = Boolean(refs.showCh2.checked);
        if (!state.channelVisibility[0] && !state.channelVisibility[1]) {
          state.channelVisibility[1] = true;
          refs.showCh2.checked = true;
        }
        state.channelVisibility = saveChannelVisibility(state.channelVisibility);
        updateInstrument();
      });
      [refs.probeCh1, refs.probeCh2].forEach((probeSelect, channelIndex) => {
        probeSelect?.addEventListener("change", () => {
          const nextProbe = normalizeProbeAttenuation(probeSelect.value);
          state.channelProbeAttenuations[channelIndex] = nextProbe;
          saveChannelProbeAttenuation(channelIndex, nextProbe);
          state.channelCorrectionGains[channelIndex] = storedChannelCorrectionGain(channelIndex, nextProbe);
          state.channelActualVoltages[channelIndex] = storedChannelActualVoltage(channelIndex, nextProbe);
          state.channelLastRawStableVoltages[channelIndex] = null;
          if (channelIndex === 0) {
            state.probeAttenuation = nextProbe;
            state.voltageCorrectionGain = state.channelCorrectionGains[0];
            state.actualVoltage = state.channelActualVoltages[0];
            state.lastRawStableVoltage = null;
          }
          if (refs.actualVoltages?.[channelIndex]) {
            refs.actualVoltages[channelIndex].value = state.channelActualVoltages[channelIndex] ?? "";
          }
          clearCaptureMemory(`Probe CH${channelIndex + 1} ${probeProfile(nextProbe).label}. Capture ulang agar range benar.`);
        });
      });
      refs.actualVoltages?.forEach((input, channelIndex) => {
        input?.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            applyManualVoltageCorrection(channelIndex);
          }
        });
      });
      refs.voltsDivs?.forEach((select, channelIndex) => {
        select?.addEventListener("change", () => {
          const value = select.value === "auto" ? "auto" : Number(select.value || 0);
          state.channelVoltsPerDiv[channelIndex] = value;
          if (channelIndex === 0) {
            state.voltsPerDiv = value;
          }
          updateInstrument();
        });
      });
      refs.autoScaleButtons?.forEach((button, channelIndex) => {
        button?.addEventListener("click", () => resetChannelScale(channelIndex));
      });
      refs.verticalPositions?.forEach((input, channelIndex) => {
        input?.addEventListener("input", () => {
          const value = Number(input.value || 0);
          state.channelVerticalPositions[channelIndex] = value;
          if (channelIndex === 0) {
            state.verticalPosition = value;
          }
          updateInstrument();
        });
      });
      refs.resetPositionButtons?.forEach((button, channelIndex) => {
        button?.addEventListener("click", () => resetChannelPosition(channelIndex));
      });
      refs.sampleRate?.addEventListener("change", () => {
        state.sampleRateHz = Number(refs.sampleRate.value || defaultSampleRateHz);
        clearCaptureMemory("Sample rate diganti. Buffer record direset.");
      });
      refs.sampleCount?.addEventListener("change", () => {
        state.sampleCount = Number(refs.sampleCount.value || defaultSampleCount);
        updateInstrument();
      });
      refs.triggerEdge?.addEventListener("change", () => {
        state.triggerEdge = refs.triggerEdge.value === "falling" ? "falling" : "rising";
        updateInstrument();
      });
      refs.preTrigger?.addEventListener("change", () => {
        state.preTriggerPercent = Number(refs.preTrigger.value || 50);
        updateInstrument();
      });
      refs.triggerLevel?.addEventListener("input", () => {
        state.triggerLevelPercent = Number(refs.triggerLevel.value || 50);
        updateInstrument();
      });
      refs.runConfirmCancel?.addEventListener("click", () => closeRunConfirmation(false));
      refs.runConfirmStart?.addEventListener("click", () => closeRunConfirmation(true));
      refs.runConfirmModal?.addEventListener("click", (event) => {
        if (event.target === refs.runConfirmModal) {
          closeRunConfirmation(false);
        }
      });
      refs.runConfirmModal?.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeRunConfirmation(false);
        }
      });
    }

    function setText(element, value) {
      if (element) {
        element.textContent = value;
      }
    }

    function supportsChannel2() {
      if (state.device?.isPresent) {
        return Number(state.device?.supportedChannelCount || state.device?.channelCount || 1) >= 2;
      }
      return true;
    }

    function activeChannelCount() {
      const supportsCh2 = supportsChannel2();
      const ch1 = state.channelVisibility?.[0] !== false;
      const ch2 = supportsCh2 && state.channelVisibility?.[1] !== false;
      return ch2 ? 2 : Math.max(1, Number(ch1));
    }

    function requestedCaptureChannelCount() {
      const supportsCh2 = supportsChannel2();
      const ch1 = state.channelVisibility?.[0] !== false;
      const ch2 = supportsCh2 && state.channelVisibility?.[1] !== false;
      return ch1 && ch2 ? 2 : 1;
    }

    function selectedCaptureChannelIndex() {
      const supportsCh2 = supportsChannel2();
      const ch1 = state.channelVisibility?.[0] !== false;
      const ch2 = supportsCh2 && state.channelVisibility?.[1] !== false;
      return !ch1 && ch2 ? 1 : 0;
    }

    function updateDevicePicker(acquisitionLocked = false) {
      const selectedDevice = normalizeDeviceSelection(state.selectedDevice);
      const profile = deviceProfiles[selectedDevice] || deviceProfiles[defaultDeviceType];
      const pickerState = getDevicePickerState(state);
      if (refs.deviceSelect) {
        refs.deviceSelect.value = selectedDevice;
        refs.deviceSelect.disabled = acquisitionLocked;
      }
      if (refs.deviceIcon) {
        refs.deviceIcon.textContent = pickerState.icon;
        refs.deviceIcon.classList.toggle("is-spinning", pickerState.status === "checking");
      }
      if (refs.devicePicker) {
        refs.devicePicker.classList.remove("is-idle", "is-checking", "is-connected", "is-failed");
        refs.devicePicker.classList.add(`is-${pickerState.status}`);
        refs.devicePicker.dataset.connectionState = pickerState.status;
        refs.devicePicker.title = pickerState.title;
      }
      setText(refs.labels?.device, profile.label);
    }

    function channelSampleCountLimit() {
      return requestedCaptureChannelCount() <= 1 ? singleChannelSampleCount : dualChannelSampleCount;
    }

    function channelSampleRateLimit() {
      return requestedCaptureChannelCount() <= 1 ? singleChannelMaxSampleRateHz : dualChannelSampleRateHz;
    }

    function syncSampleRateOptions() {
      if (!refs.sampleRate) {
        return;
      }

      const maxRate = channelSampleRateLimit();
      let largestAllowed = null;
      Array.from(refs.sampleRate.options).forEach((option) => {
        const value = Number(option.value);
        const allowed = Number.isFinite(value) && value <= maxRate;
        option.disabled = !allowed;
        if (allowed) {
          largestAllowed = value;
        }
      });

      const nextRate = Math.min(Number(state.sampleRateHz || defaultSampleRateHz), largestAllowed ?? maxRate);
      if (largestAllowed !== null && Number(state.sampleRateHz) !== nextRate) {
        state.sampleRateHz = nextRate;
        refs.sampleRate.value = String(nextRate);
      }
    }

    function syncSampleCountOptions() {
      if (!refs.sampleCount) {
        return;
      }

      const maxCount = channelSampleCountLimit();
      if (!Number.isFinite(maxCount) || maxCount <= 0) {
        return;
      }

      let largestAllowed = null;
      Array.from(refs.sampleCount.options).forEach((option) => {
        const value = Number(option.value);
        const allowed = Number.isFinite(value) && value <= maxCount;
        option.disabled = !allowed;
        if (allowed) {
          largestAllowed = value;
        }
      });

      const preferredCount = requestedCaptureChannelCount() <= 1 ? singleChannelSampleCount : Math.min(Number(state.sampleCount || defaultSampleCount), dualChannelSampleCount);
      const nextCount = Math.min(preferredCount, largestAllowed ?? maxCount);
      if (largestAllowed !== null && Number(state.sampleCount) !== nextCount) {
        state.sampleCount = nextCount;
        refs.sampleCount.value = String(nextCount);
      }
    }

    function updateInstrument() {
      prepareDisplayWindow(state);
      updateHud();
      requestDraw();
    }

    function updateHud() {
      syncSampleRateOptions();
      syncSampleCountOptions();
      const labels = refs.labels || {};
      const device = state.device || {};
      const summary = state.displaySummary || emptySummary();
      const hasCapture = Boolean(state.capture);
      const rate = hasCapture
        ? effectiveSampleRateHz(state.capture.actualSampleRateHz || state.sampleRateHz, state)
        : effectiveSampleRateHz(state.sampleRateHz, state);
      const points = hasCapture ? Number(state.capture.sampleCount || state.sampleCount) : state.sampleCount;
      const spanSeconds = points / Math.max(1, rate);
      const modeLabel = state.displayMode.toUpperCase();
      const supportsCh2 = supportsChannel2();
      const ch1Visible = state.channelVisibility?.[0] !== false;
      const ch2Visible = supportsCh2 && state.channelVisibility?.[1] !== false;
      const channelVisible = [ch1Visible, ch2Visible];
      const busy = state.isBusy || state.isCapturing;
      const acquisitionLocked = busy || state.isRunning;
      const deviceUnavailable = !isSelectedDeviceConnected(state);
      const channelCount = activeChannelCount();
      const visibleChannelCount = channelVisible.filter(Boolean).length || 1;
      const ch1Window = state.displayChannelWindows?.[0] || state.displayWindow || [];
      const ch2Window = state.displayChannelWindows?.[1] || state.latestCaptureChannels?.[1] || [];
      const ch1Stats = ch1Window.length ? statsFor(ch1Window) : emptySummary();
      const ch2Stats = ch2Window.length ? statsFor(ch2Window) : emptySummary();
      const ch1Reference = Array.isArray(state.referenceVoltages) ? Number(state.referenceVoltages[0]) : Number(state.referenceVoltage);
      const ch1Average = ch1Window.length
        ? ch1Stats.avg + (Number.isFinite(ch1Reference) ? ch1Reference : 0)
        : NaN;
      const ch2RelativeAverage = ch2Window.length ? statsFor(ch2Window).avg : NaN;
      const ch2Reference = Array.isArray(state.referenceVoltages) ? Number(state.referenceVoltages[1]) : NaN;
      const ch2Average = Number.isFinite(ch2RelativeAverage)
        ? ch2RelativeAverage + (Number.isFinite(ch2Reference) ? ch2Reference : 0)
        : NaN;
      const ch1Lowest = Number.isFinite(Number(state.channelLowestDropVoltages?.[0]))
        ? Number(state.channelLowestDropVoltages[0])
        : ch1Window.length ? ch1Stats.min : NaN;
      const ch2Lowest = Number.isFinite(Number(state.channelLowestDropVoltages?.[1]))
        ? Number(state.channelLowestDropVoltages[1])
        : ch2Window.length ? ch2Stats.min : NaN;

      setText(labels.device, device.deviceLabel || "TEKNISIHUB_FLASH_OSC");
      setText(labels.title, `${state.isRunning ? "RUN" : "STOP"} ${modeLabel}`);
      setText(labels.freq, hasCapture && summary.frequencyHz > 0 ? formatFrequency(summary.frequencyHz) : "-");
      setText(labels.period, hasCapture && summary.periodSeconds > 0 ? formatDurationSeconds(summary.periodSeconds) : "-");
      setText(labels.duty, hasCapture && summary.dutyCyclePercent > 0 ? `${formatNumber(summary.dutyCyclePercent, 1)}%` : "-");
      setText(labels.vpp, hasCapture && ch1Visible && ch1Window.length ? formatVoltage(ch1Stats.vpp) : "-");
      setText(labels.rms, hasCapture && ch1Visible && ch1Window.length ? formatVoltage(ch1Stats.rms) : "-");
      setText(labels.avg, hasCapture && ch1Visible && Number.isFinite(ch1Average) ? formatVoltage(ch1Average) : "-");
      setText(labels.ch2Vpp, hasCapture && ch2Visible && channelCount >= 2 && ch2Window.length ? formatVoltage(ch2Stats.vpp) : "-");
      setText(labels.ch2Rms, hasCapture && ch2Visible && channelCount >= 2 && ch2Window.length ? formatVoltage(ch2Stats.rms) : "-");
      setText(labels.ch2Avg, hasCapture && ch2Visible && channelCount >= 2 && Number.isFinite(ch2Average) ? formatVoltage(ch2Average) : "-");
      setText(labels.low, hasCapture && ch1Visible && Number.isFinite(ch1Lowest) ? formatVoltage(ch1Lowest) : "-");
      setText(labels.ch2Low, hasCapture && ch2Visible && channelCount >= 2 && Number.isFinite(ch2Lowest) ? formatVoltage(ch2Lowest) : "-");
      setText(labels.ref, state.pendingRunReference
        ? `REF ${state.referenceWarmupValues.length}/${referenceWarmupFrames}`
        : state.referenceVoltage === null ? "ABS" : formatVoltage(state.referenceVoltage));
      setText(labels.correctionCh1, `${formatNumber(state.channelCorrectionGains?.[0] ?? 1, 3)}x`);
      setText(labels.correctionCh2, `${formatNumber(state.channelCorrectionGains?.[1] ?? 1, 3)}x`);
      setText(labels.trigger, hasCapture ? `${summary.triggerLocked ? "Lock" : "Auto"} ${formatVoltage(summary.triggerLevel)}` : "-");
      setText(labels.mode, `${modeLabel}${state.sincInterpolation ? " SINC" : " LIN"}`);
      setText(labels.readoutChannels, `${formatNumber(visibleChannelCount)} CH`);
      setText(labels.message, state.errorMessage || state.message || device.message || "");

      refs.modeYt?.classList.toggle("is-active", state.displayMode === "yt");
      refs.modeFft?.classList.toggle("is-active", state.displayMode === "fft");
      refs.modeXy?.classList.toggle("is-active", state.displayMode === "xy");
      refs.modeDrop?.classList.toggle("is-active", state.displayMode === "drop");

      refs.run?.classList.toggle("is-active", state.isRunning);
      refs.run?.querySelector(".material-symbols-outlined") && (refs.run.querySelector(".material-symbols-outlined").textContent = state.isRunning ? "pause" : "play_arrow");
      refs.run?.querySelector("span:last-child") && (refs.run.querySelector("span:last-child").textContent = state.isRunning ? "Stop" : "Run");
      refs.record?.classList.toggle("is-active", state.isRecording);
      refs.record?.querySelector("span:last-child") && (refs.record.querySelector("span:last-child").textContent = state.isRecording ? "Rec On" : "Record");
      if (refs.record) {
        refs.record.disabled = deviceUnavailable || (state.isBusy && !state.isRecording);
      }
      refs.calPad?.classList.toggle("is-active", state.calPadEnabled);
      refs.calPad?.querySelector(".material-symbols-outlined") && (refs.calPad.querySelector(".material-symbols-outlined").textContent = "power_settings_new");
      refs.calPad?.querySelector("span:last-child") && (refs.calPad.querySelector("span:last-child").textContent = state.calPadEnabled ? "CAL PAD On" : "CAL PAD Off");
      if (refs.calPadMode) {
        refs.calPadMode.value = normalizeCalPadMode(state.calPadMode);
      }

      updateDevicePicker(acquisitionLocked);
      if (refs.run) {
        refs.run.disabled = !state.isRunning && (busy || deviceUnavailable);
      }
      [
        refs.single,
      ].forEach((element) => {
        if (element) {
          element.disabled = acquisitionLocked || deviceUnavailable;
        }
      });
      [
        refs.triggerEdge,
        refs.preTrigger,
        refs.triggerLevel
      ].forEach((element) => {
        if (element) {
          element.disabled = acquisitionLocked || deviceUnavailable;
        }
      });
      [refs.probeCh1, refs.probeCh2].forEach((element, channelIndex) => {
        if (element) {
          element.disabled = acquisitionLocked || deviceUnavailable || !channelVisible[channelIndex];
        }
      });
      [
        refs.sampleRate,
        refs.sampleCount
      ].forEach((element) => {
        if (element) {
          element.disabled = acquisitionLocked || deviceUnavailable;
        }
      });
      if (refs.calPad) {
        refs.calPad.disabled = deviceUnavailable;
      }
      if (refs.calPadMode) {
        refs.calPadMode.disabled = deviceUnavailable;
      }
      refs.actualVoltages?.forEach((element, channelIndex) => {
        if (element) {
          element.disabled = acquisitionLocked || deviceUnavailable || !channelVisible[channelIndex];
        }
      });
      refs.voltsDivs?.forEach((element, channelIndex) => {
        if (element) {
          element.disabled = deviceUnavailable || !channelVisible[channelIndex];
        }
      });
      refs.autoScaleButtons?.forEach((element, channelIndex) => {
        if (element) {
          element.disabled = deviceUnavailable || !channelVisible[channelIndex];
        }
      });
      refs.verticalPositions?.forEach((element, channelIndex) => {
        if (element) {
          element.disabled = deviceUnavailable || !channelVisible[channelIndex];
        }
      });
      refs.resetPositionButtons?.forEach((element, channelIndex) => {
        if (element) {
          element.disabled = deviceUnavailable || !channelVisible[channelIndex];
        }
      });
      if (refs.showCh1) {
        refs.showCh1.checked = ch1Visible;
        refs.showCh1.disabled = acquisitionLocked || deviceUnavailable;
      }
      if (refs.showCh2) {
        refs.showCh2.checked = ch2Visible;
        refs.showCh2.disabled = acquisitionLocked || deviceUnavailable || !supportsCh2;
      }
      if (refs.clearDrop) {
        refs.clearDrop.classList.toggle("hidden", state.displayMode !== "drop");
        refs.clearDrop.disabled = state.displayMode !== "drop" || !hasVoltageHistory(state);
      }
    }

    function requestDraw() {
      if (drawQueued || !refs.canvas) {
        return;
      }
      drawQueued = true;
      requestAnimationFrame(() => {
        drawQueued = false;
        drawCanvas();
      });
    }

    function drawCanvas() {
      if (!refs.canvas) {
        return;
      }
      const scope = canvasScope(refs.canvas);
      if (state.displayMode === "fft") {
        drawFft(scope.ctx, scope.bounds, state);
      } else if (state.displayMode === "xy") {
        drawXy(scope.ctx, scope.bounds, state);
      } else if (state.displayMode === "drop") {
        drawDropTrend(scope.ctx, scope.bounds, state);
      } else {
        drawYt(scope.ctx, scope.bounds, state);
      }
    }

    function setDisplayMode(mode) {
      state.displayMode = ["yt", "fft", "xy", "drop"].includes(mode) ? mode : "yt";
      state.message = `Display ${state.displayMode.toUpperCase()} aktif.`;
      updateInstrument();
    }

    function clearCaptureMemory(message) {
      state.capture = null;
      state.frameBuffer = [];
      state.channelFrameBuffers = [];
      state.latestCaptureVoltages = [];
      state.latestCaptureChannels = [];
      state.displayWindow = [];
      state.displayChannelWindows = [];
      state.spectrum = null;
      resetFftAverage(state);
      clearVoltageHistories(state);
      state.pendingRunReference = false;
      state.referenceWarmupValues = [];
      state.referenceWarmupChannelValues = [];
      state.referenceVoltage = null;
      state.referenceVoltages = null;
      state.lastRawStableVoltage = null;
      state.channelLastRawStableVoltages = [null, null];
      state.message = message;
      state.errorMessage = "";
      updateInstrument();
    }

    function resetDisplayMemoryOnly() {
      state.frameBuffer = [];
      state.channelFrameBuffers = [];
      state.latestCaptureVoltages = [];
      state.latestCaptureChannels = [];
      state.displayWindow = [];
      state.displayChannelWindows = [];
      state.spectrum = null;
      resetFftAverage(state);
      clearVoltageHistories(state);
      state.referenceWarmupValues = [];
      state.referenceWarmupChannelValues = [];
    }

    function probeConfirmName(channelIndex = 0) {
      const attenuation = normalizeProbeAttenuation(state.channelProbeAttenuations?.[channelIndex] ?? state.probeAttenuation);
      return attenuation === 10 ? "X10" : "X1";
    }

    function showRunConfirmation() {
      if (!refs.runConfirmModal || runConfirmResolver) {
        return Promise.resolve(false);
      }

      const ch1ProbeName = probeConfirmName(0);
      const ch2ProbeName = probeConfirmName(1);
      const profile = probeProfile(state.channelProbeAttenuations?.[0] ?? state.probeAttenuation);
      setText(refs.runConfirmTitle, `Pastikan probe CH1 ${ch1ProbeName}, CH2 ${ch2ProbeName}`);
      setText(
        refs.runConfirmDescription,
        `Selector CH1 sekarang ${profile.label}. Pastikan switch fisik probe sama dengan selector masing-masing channel. Pastikan clip GND probe terhubung ke GND target sebelum Run.`
      );
      setText(refs.runConfirmTarget, `CH1: ${ch1ProbeName} | CH2: ${ch2ProbeName}`);
      refs.runConfirmModal.classList.remove("hidden");

      return new Promise((resolve) => {
        runConfirmResolver = resolve;
        setTimeout(() => {
          refs.runConfirmStart?.focus();
        }, 0);
      });
    }

    function closeRunConfirmation(confirmed) {
      if (!refs.runConfirmModal || refs.runConfirmModal.classList.contains("hidden")) {
        return;
      }

      refs.runConfirmModal.classList.add("hidden");
      const resolver = runConfirmResolver;
      runConfirmResolver = null;
      if (resolver) {
        resolver(Boolean(confirmed));
      }
      refs.run?.focus();
    }

    function resetChannelScale(channelIndex = 0) {
      state.channelVoltsPerDiv[channelIndex] = "auto";
      if (channelIndex === 0) {
        state.voltsPerDiv = "auto";
      }
      if (refs.voltsDivs?.[channelIndex]) {
        refs.voltsDivs[channelIndex].value = "auto";
      }
      state.message = `Auto scale CH${channelIndex + 1}.`;
      updateInstrument();
    }

    function resetChannelPosition(channelIndex = 0) {
      state.channelVerticalPositions[channelIndex] = 0;
      if (channelIndex === 0) {
        state.verticalPosition = 0;
      }
      if (refs.verticalPositions?.[channelIndex]) {
        refs.verticalPositions[channelIndex].value = "0";
      }
      state.message = `Posisi CH${channelIndex + 1} direset.`;
      updateInstrument();
    }

    function clearDropHistory() {
      clearVoltageHistories(state);
      state.message = "Riwayat DROP dibersihkan.";
      updateInstrument();
    }

    function applyManualVoltageCorrection(channelIndex = 0) {
      const actualVoltage = parseVoltageInput(refs.actualVoltages?.[channelIndex]?.value);
      if (!Number.isFinite(actualVoltage) || actualVoltage <= 0) {
        state.errorMessage = `Isi Actual V CH${channelIndex + 1} dengan nilai tegangan real, contoh 2.900.`;
        updateInstrument();
        return;
      }

      const rawChannels = captureToVoltageChannels(state.capture, state);
      const rawStable = Number.isFinite(state.channelLastRawStableVoltages?.[channelIndex])
        ? state.channelLastRawStableVoltages[channelIndex]
        : stableReferenceVoltage(rawChannels[channelIndex] || []);
      if (!Number.isFinite(rawStable) || Math.abs(rawStable) < 0.001) {
        state.errorMessage = `Belum ada pembacaan volt absolut CH${channelIndex + 1} untuk dikoreksi. Tekan Run/Single dulu.`;
        updateInstrument();
        return;
      }

      const nextGain = actualVoltage / rawStable;
      if (!Number.isFinite(nextGain) || nextGain <= 0) {
        state.errorMessage = "Nilai koreksi tidak valid.";
        updateInstrument();
        return;
      }

      const attenuation = normalizeProbeAttenuation(state.channelProbeAttenuations?.[channelIndex] ?? state.probeAttenuation);
      state.channelCorrectionGains[channelIndex] = nextGain;
      state.channelActualVoltages[channelIndex] = actualVoltage;
      saveChannelCorrectionGain(channelIndex, attenuation, nextGain);
      saveChannelActualVoltage(channelIndex, attenuation, actualVoltage);
      if (channelIndex === 0) {
        state.voltageCorrectionGain = nextGain;
        state.actualVoltage = actualVoltage;
        saveCorrectionGain(attenuation, nextGain);
        saveActualVoltage(attenuation, actualVoltage);
      }
      resetDisplayMemoryOnly();
      state.pendingRunReference = state.referenceVoltage !== null || (state.isRunning && state.autoReferenceOnRun);
      state.referenceWarmupValues = [];
      state.referenceWarmupChannelValues = [];
      state.referenceVoltage = null;
      state.referenceVoltages = null;
      state.errorMessage = "";

      if (state.capture) {
        applyCaptureResult(state.capture, {
          countFrame: false,
          useRecordResult: false,
          message: `Koreksi CH${channelIndex + 1} aktif: raw ${formatVoltage(rawStable)} -> actual ${formatVoltage(actualVoltage)} (${formatNumber(nextGain, 3)}x).`
        });
      } else {
        state.message = `Koreksi CH${channelIndex + 1} aktif: ${formatNumber(nextGain, 3)}x. Capture berikutnya memakai skala baru.`;
      }

      updateInstrument();
    }

    async function withBusy(task) {
      if (state.isBusy || state.isCapturing) {
        return;
      }
      state.isBusy = true;
      state.errorMessage = "";
      updateHud();
      try {
        await task();
      } catch (error) {
        state.errorMessage = error?.message || "Operasi oscilloscope gagal.";
        notify(state.errorMessage, "warning");
      } finally {
        state.isBusy = false;
        updateInstrument();
      }
    }

    async function selectDevice(nextDevice) {
      if (state.isRunning || state.isCapturing) {
        updateDevicePicker(true);
        return;
      }

      const normalizedDevice = normalizeDeviceSelection(nextDevice);
      if (!normalizedDevice) {
        deviceSelectionToken += 1;
        state.selectedDevice = "";
        state.deviceConnectionStatus = "idle";
        state.errorMessage = "";
        state.message = "Pilih koneksi USB atau WIFI.";
        state.device = {
          ...state.device,
          success: false,
          isPresent: false,
          deviceType: "",
          transport: "",
          message: state.message
        };
        updateInstrument();
        return;
      }

      const profile = deviceProfiles[normalizedDevice] || deviceProfiles[defaultDeviceType];
      const selectionToken = ++deviceSelectionToken;
      state.selectedDevice = normalizedDevice;
      state.deviceConnectionStatus = "checking";
      state.errorMessage = "";
      state.message = `Cek ${profile.transport} TEKNISIHUB_FLASH_OSC...`;
      state.device = {
        ...state.device,
        success: false,
        isPresent: false,
        deviceLabel: profile.label,
        deviceType: normalizedDevice,
        transport: profile.transport,
        message: state.message
      };
      updateHud();

      try {
        const session = await fetchJson("/spi-flash/device", {
          method: "POST",
          body: JSON.stringify({ deviceType: normalizedDevice })
        });
        const globalDevice = normalizeDeviceSelection(session?.selectedDevice || normalizedDevice);
        if (selectionToken !== deviceSelectionToken) {
          return;
        }
        state.selectedDevice = globalDevice;
        const activeProfile = deviceProfiles[globalDevice] || profile;
        const device = await fetchJson(`/tools/oscilloscope/device?deviceType=${encodeURIComponent(normalizedDevice)}`);
        if (selectionToken !== deviceSelectionToken || state.selectedDevice !== globalDevice) {
          return;
        }

        const responseDeviceType = device.deviceType
          ? normalizeDeviceSelection(device.deviceType)
          : device.transport
            ? normalizeDeviceSelection(device.transport)
            : "";
        const transportMatches = responseDeviceType === globalDevice ||
          (!responseDeviceType && globalDevice === defaultDeviceType);
        const devicePresent = Boolean(device.isPresent) && transportMatches;
        const supportedChannelCount = Number(device.channelCount || state.device.supportedChannelCount || state.device.channelCount || 1);
        state.device = {
          ...state.device,
          ...device,
          isPresent: devicePresent,
          deviceLabel: activeProfile.label,
          deviceType: globalDevice,
          transport: activeProfile.transport,
          channelCount: supportedChannelCount,
          supportedChannelCount
        };
        state.deviceConnectionStatus = devicePresent ? "connected" : "failed";
        state.message = transportMatches
          ? sanitizePublicMessage(device.message || (devicePresent ? `${activeProfile.transport} terhubung.` : `${activeProfile.transport} tidak ditemukan.`))
          : `Aplikasi lokal belum memakai jalur ${activeProfile.transport} untuk OSC.`;
        if (devicePresent) {
          notify(state.message, "success");
          state.calPadEnabled = false;
          try {
            await setCalPadEnabled(false, { silent: true });
          } catch (_error) {
            state.calPadEnabled = false;
          }
        } else {
          notify(state.message, "warning");
        }
      } catch (error) {
        if (selectionToken !== deviceSelectionToken) {
          return;
        }
        state.deviceConnectionStatus = "failed";
        state.errorMessage = sanitizePublicMessage(error?.message || `${profile.transport} gagal dicek.`);
        state.message = state.errorMessage;
        notify(state.errorMessage, "warning");
      } finally {
        if (selectionToken === deviceSelectionToken) {
          updateInstrument();
        }
      }
    }

    async function checkSelectedDevice() {
      try {
        const session = await fetchJson("/spi-flash/session");
        state.selectedDevice = normalizeDeviceSelection(session?.selectedDevice || state.selectedDevice);
      } catch (_error) {
        // OSC tetap bisa mencoba device terakhir kalau session SPI belum terbaca.
      }
      if (state.selectedDevice) {
        await selectDevice(state.selectedDevice);
      }
    }

    function applyCalPadModeTimebase(mode) {
      const profile = calPadModeProfile(mode);
      const nextRate = profile.lowRate ? 10000 : channelSampleRateLimit();
      let changed = false;
      if (state.sampleRateHz !== nextRate) {
        state.sampleRateHz = nextRate;
        changed = true;
        if (refs.sampleRate) {
          refs.sampleRate.value = String(nextRate);
        }
      }
      if (state.sampleCount < singleChannelSampleCount) {
        state.sampleCount = singleChannelSampleCount;
        changed = true;
        if (refs.sampleCount) {
          refs.sampleCount.value = String(singleChannelSampleCount);
        }
      }
      if (changed) {
        resetLiveDisplayBuffers(state);
      }
    }

    async function changeCalPadMode(mode) {
      const nextMode = normalizeCalPadMode(mode);
      state.calPadMode = nextMode;
      state.calPadExpectedFrequencyHz = calPadModeProfile(nextMode).frequencyHz || 0;
      saveCalPadMode(nextMode);
      applyCalPadModeTimebase(nextMode);
      resetLiveDisplayBuffers(state);
      if (state.calPadEnabled) {
        if (state.isBusy || state.isCapturing) {
          state.pendingCalPadModeApply = true;
          state.message = `Mode CAL PAD: ${calPadModeProfile(nextMode).label}.`;
          updateHud();
          return;
        }
        await withBusy(async () => {
          await setCalPadEnabled(true);
        });
        return;
      }
      updateHud();
    }

    async function setCalPadEnabled(enabled, { silent = false } = {}) {
      if (!silent) {
        state.message = enabled ? "Mengaktifkan CAL PAD..." : "Menonaktifkan CAL PAD...";
        updateHud();
      }
      if (enabled) {
        state.calPadMode = normalizeCalPadMode(refs.calPadMode?.value || state.calPadMode);
        saveCalPadMode(state.calPadMode);
        applyCalPadModeTimebase(state.calPadMode);
      }
      resetLiveDisplayBuffers(state);
      const response = await fetchJson("/tools/oscilloscope/cal-pad", {
        method: "POST",
        body: JSON.stringify({
          deviceType: normalizeDeviceSelection(state.selectedDevice),
          enabled,
          mode: state.calPadMode
        })
      });

      state.calPadEnabled = Boolean(response.enabled);
      state.calPadMode = normalizeCalPadMode(response.mode || state.calPadMode);
      state.calPadExpectedFrequencyHz = Number.isFinite(Number(response.frequencyHz))
        ? Number(response.frequencyHz)
        : calPadModeProfile(state.calPadMode).frequencyHz || 0;
      saveCalPadMode(state.calPadMode);
      if (!silent) {
        state.message = sanitizePublicMessage(response.message || (state.calPadEnabled ? "CAL PAD aktif." : "CAL PAD nonaktif."));
        notify(state.message, state.calPadEnabled ? "success" : "info");
        updateInstrument();
      }
      return response;
    }

    async function toggleCalPad() {
      await setCalPadEnabled(!state.calPadEnabled);
    }

    async function toggleCalPadFromUser() {
      if (calPadRequestInFlight || !isSelectedDeviceConnected(state)) {
        return;
      }

      calPadRequestInFlight = true;
      state.errorMessage = "";
      updateHud();
      try {
        await toggleCalPad();
      } catch (error) {
        state.errorMessage = sanitizePublicMessage(error?.message || "Operasi CAL PAD gagal.");
        notify(state.errorMessage, "warning");
      } finally {
        calPadRequestInFlight = false;
        updateInstrument();
      }
    }

    async function requestCapture({ saveTemporary = true, recordEnabled = false } = {}) {
      return fetchJson("/tools/oscilloscope/capture", {
        method: "POST",
        body: JSON.stringify({
          deviceType: normalizeDeviceSelection(state.selectedDevice),
          sampleRateHz: Math.min(Number(state.sampleRateHz || defaultSampleRateHz), channelSampleRateLimit()),
          sampleCount: Number(state.sampleCount || defaultSampleCount),
          channelCount: requestedCaptureChannelCount(),
          channelIndex: selectedCaptureChannelIndex(),
          probeAttenuation: Number(state.probeAttenuation || 1),
          probeAttenuations: [
            normalizeProbeAttenuation(state.channelProbeAttenuations?.[0] ?? state.probeAttenuation),
            normalizeProbeAttenuation(state.channelProbeAttenuations?.[1] ?? state.probeAttenuation)
          ],
          saveTemporary,
          recordEnabled,
          recordSessionId: state.recordSessionId
        })
      });
    }

    function applyCaptureResult(result, options = {}) {
      const countFrame = options.countFrame !== false;
      const useRecordResult = options.useRecordResult !== false;
      const requestedChannelCount = activeChannelCount();
      const capturedChannelCount = Number(result.channelCount || 1);
      const previousSupportedChannelCount = Number(state.device.supportedChannelCount || state.device.channelCount || 2);
      const supportedChannelCount = requestedChannelCount >= 2 && capturedChannelCount < 2
        ? capturedChannelCount
        : Math.max(previousSupportedChannelCount, capturedChannelCount);
      state.capture = result;
      state.device = {
        ...state.device,
        success: true,
        isPresent: true,
        message: state.device.message || "Device OSC terhubung.",
        identity: result.identity || state.device.identity,
        bits: result.bits || state.device.bits,
        vrefMv: result.vrefMv || state.device.vrefMv,
        channelCount: supportedChannelCount,
        supportedChannelCount,
        capturedChannelCount
      };
      const responseProbeAttenuations = Array.isArray(result.probeAttenuations)
        ? result.probeAttenuations
        : state.channelProbeAttenuations;
      state.channelProbeAttenuations = [
        normalizeProbeAttenuation(responseProbeAttenuations?.[0] ?? result.probeAttenuation ?? state.probeAttenuation),
        normalizeProbeAttenuation(responseProbeAttenuations?.[1] ?? state.channelProbeAttenuations?.[1] ?? state.probeAttenuation)
      ];
      state.probeAttenuation = state.channelProbeAttenuations[0];
      if (refs.probeCh1) {
        refs.probeCh1.value = String(state.probeAttenuation);
      }
      if (refs.probeCh2) {
        refs.probeCh2.value = String(state.channelProbeAttenuations[1]);
      }

      const rawChannels = captureToVoltageChannels(result, state);
      const capturePrimaryIndex = (() => {
        const visibility = Array.isArray(state.channelVisibility) ? state.channelVisibility : [true, false];
        const candidateCount = Math.max(1, rawChannels.length, visibility.length);
        for (let index = 0; index < candidateCount; index++) {
          if (visibility[index] !== false && (rawChannels[index]?.length || 0) > 0) {
            return index;
          }
        }
        return selectedCaptureChannelIndex();
      })();
      const rawVoltages = rawChannels[capturePrimaryIndex] || rawChannels[0] || [];
      state.channelLastRawStableVoltages = rawChannels.map((channelValues, channelIndex) => (
        channelValues.length
          ? stableReferenceVoltage(channelValues)
          : state.channelLastRawStableVoltages?.[channelIndex] ?? null
      ));
      state.lastRawStableVoltage = rawVoltages.length
        ? state.channelLastRawStableVoltages[capturePrimaryIndex]
        : state.lastRawStableVoltage;
      const correctedRawChannels = rawChannels.map((channelValues, channelIndex) => (
        applyCorrectionGain(channelValues, state.channelCorrectionGains?.[channelIndex] ?? 1)
      ));
      const correctedRawVoltages = correctedRawChannels[capturePrimaryIndex] || correctedRawChannels[0] || [];
      if (state.pendingRunReference && state.autoReferenceOnRun && correctedRawVoltages.length) {
        const stableChannels = correctedRawChannels.map((channelValues) => stableReferenceVoltage(channelValues));
        state.referenceWarmupValues.push(stableChannels[capturePrimaryIndex]);
        state.referenceWarmupChannelValues.push(stableChannels);
        state.capture = null;
        state.frameBuffer = [];
        state.channelFrameBuffers = [];
        state.latestCaptureVoltages = [];
        state.latestCaptureChannels = [];
        state.displayWindow = [];
        state.displayChannelWindows = [];
        state.spectrum = null;
        resetFftAverage(state);
        clearVoltageHistories(state);
        state.message = `Menyiapkan referensi ${state.referenceWarmupValues.length}/${referenceWarmupFrames}...`;

        if (state.referenceWarmupValues.length < referenceWarmupFrames) {
          return;
        }

        state.referenceVoltage = stableReferenceVoltage(state.referenceWarmupValues);
        const channelCount = Math.max(1, ...state.referenceWarmupChannelValues.map((values) => values.length));
        state.referenceVoltages = Array.from({ length: channelCount }, (_item, channelIndex) => {
          const channelWarmup = state.referenceWarmupChannelValues
            .map((values) => values[channelIndex])
            .filter((value) => Number.isFinite(Number(value)));
          return stableReferenceVoltage(channelWarmup);
        });
        state.referenceWarmupValues = [];
        state.referenceWarmupChannelValues = [];
        state.pendingRunReference = false;
        state.capture = result;
      }

      const channelVoltages = applyDisplayReferences(correctedRawChannels, state.referenceVoltages ?? state.referenceVoltage);
      const voltages = channelVoltages[capturePrimaryIndex] || channelVoltages[0] || [];
      const rawSampleRate = Number(result.actualSampleRateHz || state.sampleRateHz || defaultSampleRateHz);
      const calibratedFromCalPad = updateCalPadSampleRateCorrection(state, correctedRawVoltages, rawSampleRate);
      const displaySampleRate = effectiveSampleRateHz(rawSampleRate, state);
      state.latestCaptureChannels = channelVoltages;
      state.latestCaptureVoltages = voltages;
      appendChannelRecordBuffers(state, channelVoltages, displaySampleRate);
      appendChannelVoltageHistories(state, channelVoltages);
      if (countFrame) {
        state.framesCaptured += 1;
      }
      if (useRecordResult && result.recorded) {
        state.recordFrameCount += 1;
        state.recordFilePath = result.recordFilePath || state.recordFilePath;
      }
      state.message = options.message || (calibratedFromCalPad
        ? "Kalibrasi waktu aktif."
        : state.isRecording
        ? `Record berjalan: ${formatNumber(state.recordFrameCount)} frame.`
        : state.referenceVoltage === null
          ? "Capture selesai."
          : `REF ${formatVoltage(state.referenceVoltage)} aktif. Grafik relatif ke awal Run.`);
    }

    async function captureWaveform({ saveTemporary = true, recordEnabled = state.isRecording } = {}) {
      if (state.isCapturing) {
        return null;
      }
      state.isCapturing = true;
      state.errorMessage = "";
      state.message = "Capture...";
      updateHud();
      try {
        const result = await requestCapture({ saveTemporary, recordEnabled });
        applyCaptureResult(result);
        return result;
      } catch (error) {
        state.errorMessage = error?.message || "Capture oscilloscope gagal.";
        notify(state.errorMessage, "warning");
        throw error;
      } finally {
        state.isCapturing = false;
        updateInstrument();
      }
    }

    function startContinuous() {
      if (state.isRunning) {
        return;
      }
      state.isRunning = true;
      state.errorMessage = "";
      resetLiveDisplayBuffers(state);
      if (state.autoReferenceOnRun) {
        state.pendingRunReference = true;
        state.referenceWarmupValues = [];
        state.referenceWarmupChannelValues = [];
        state.referenceVoltage = null;
        state.referenceVoltages = null;
        state.lastRawStableVoltage = null;
        state.channelLastRawStableVoltages = [null, null];
        state.message = `Menyiapkan referensi 0/${referenceWarmupFrames}...`;
      } else {
        state.message = "Run berjalan.";
      }
      loopGeneration += 1;
      scheduleNextCapture(0, loopGeneration);
      updateInstrument();
    }

    function stopContinuous(message = "Run dihentikan.", options = {}) {
      state.isRunning = false;
      loopGeneration += 1;
      if (loopTimer) {
        clearTimeout(loopTimer);
        loopTimer = null;
      }
      if (!options.silent) {
        state.message = message;
        updateInstrument();
      }
    }

    async function stopContinuousFromUser() {
      const shouldTurnCalPadOff = state.calPadEnabled;
      stopContinuous(shouldTurnCalPadOff ? "Run dihentikan. Mematikan CAL PAD..." : "Run dihentikan.");
      if (!shouldTurnCalPadOff) {
        return;
      }
      try {
        await setCalPadEnabled(false, { silent: true });
        state.calPadEnabled = false;
        state.message = "Run dihentikan. CAL PAD Off.";
        updateInstrument();
      } catch (error) {
        state.errorMessage = sanitizePublicMessage(error?.message || "CAL PAD gagal dimatikan.");
        notify(state.errorMessage, "warning");
        updateInstrument();
      }
    }

    async function toggleContinuous() {
      if (state.isRunning) {
        await stopContinuousFromUser();
      } else {
        const confirmed = await showRunConfirmation();
        if (!confirmed || state.isRunning) {
          return;
        }
        startContinuous();
      }
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
      if (state.isCapturing || state.isBusy) {
        scheduleNextCapture(continuousDelayMs, generation);
        return;
      }
      try {
        if (state.pendingCalPadModeApply && state.calPadEnabled) {
          state.pendingCalPadModeApply = false;
          await setCalPadEnabled(true);
        }
        await captureWaveform({
          saveTemporary: !state.isRecording,
          recordEnabled: state.isRecording
        });
      } catch {
        state.isRunning = false;
        state.isRecording = false;
        updateInstrument();
      } finally {
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
        updateInstrument();
        notify(state.message, "info");
        return;
      }
      state.isRecording = true;
      state.recordSessionId = createRecordSessionId();
      state.recordFrameCount = 0;
      state.recordFilePath = "";
      state.message = "Record berjalan.";
      if (!state.isRunning) {
        startContinuous();
      } else {
        updateInstrument();
      }
      notify("Record mulai.", "success");
    }

    return {
      viewKey: "tool_oscilloscope",
      eyebrow: "Oscilloscope",
      title: "TEKNISIHUB_FLASH_OSC",
      subtitle: "Tampilan sinyal realtime dengan trigger, zoom, dan rekam data.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        notify = typeof options.notify === "function" ? options.notify : notify;
        bindThemeListener();
        mountShell();
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }
        mountedContainer.classList.toggle("hidden", !visible);
        if (!visible) {
          const shouldTurnCalPadOff = state.calPadEnabled;
          stopContinuous("Run dihentikan.", { silent: true });
          if (shouldTurnCalPadOff) {
            setCalPadEnabled(false, { silent: true }).catch((error) => {
              state.errorMessage = sanitizePublicMessage(error?.message || "CAL PAD gagal dimatikan.");
              notify(state.errorMessage, "warning");
              updateInstrument();
            });
          }
          return;
        }
        requestDraw();
      },
      async refresh() {
        updateInstrument();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.oscilloscope = createApi();
})(window);
