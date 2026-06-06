(function initializeSpiFlashPage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const hexPreviewLineHeight = 24;
  const hexPreviewOverscanLines = 10;
  const hexPreviewMinimumRequestLines = 64;
  const hexPreviewMaxVirtualHeight = 12000000;
  const maxSpiFlashTaskPanelEntries = 10;
  const eneDefaultSpeedHz = 20000000;
  const spiDefaultSpeedHz = 20000000;
  const usbDefaultChunkSizeBytes = 61440;
  const wifiDefaultChunkSizeBytes = 8192;
  const eneDefaultChunkSizeBytes = 4096;
  const iteDefaultChunkSizeBytes = 256;
  const connectionPlaceholderLabel = "---- PILIH KONEKSI ----";

  const deviceProfiles = {
    TEKNISIHUB_FLASH_OSC_USB: {
      label: "TEKNISIHUB_FLASH_OSC",
      transport: "USB",
      status: "SPI + ENE/ITE KBC/EC + OSC",
      speed: "20 MHz request",
      note: "Koneksi USB TEKNISIHUB_FLASH_OSC."
    },
    TEKNISIHUB_FLASH_OSC_WIFI: {
      label: "TEKNISIHUB_FLASH_OSC",
      transport: "WIFI",
      status: "SPI + ENE/ITE KBC/EC + OSC",
      speed: "20 MHz request",
      note: "Koneksi WIFI TEKNISIHUB_FLASH_OSC."
    }
  };

  const defaultDeviceType = "TEKNISIHUB_FLASH_OSC_USB";
  const disabledDeviceSelections = new Set();
  let latestSpiFlashFailureSignature = "";
  let latestSpiFlashFailureTimestamp = 0;

  function isTeknisiHubFlasherDevice(deviceType) {
    const normalizedDevice = String(deviceType || "").trim().toUpperCase();
    return isFlashOscDevice(normalizedDevice);
  }

  function isFlashOscDevice(deviceType) {
    const normalizedDevice = String(deviceType || "").trim().toUpperCase();
    return normalizedDevice === "TEKNISIHUB_FLASH_OSC_USB" ||
      normalizedDevice === "TEKNISIHUB_FLASH_OSC_WIFI";
  }

  let pageNotifier = (message, tone = "success") => {
    if (typeof globalScope.setNotice === "function") {
      globalScope.setNotice(message, tone);
    }
  };

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
      /\b(libusb|winusb|stack trace|exception)\b/i.test(message) ||
      /[A-Z]:\\|\/Users\/|\/home\//i.test(message)
    ) {
      return "Operasi device gagal. Periksa koneksi lalu coba lagi.";
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

  function formatInteger(value) {
    return new Intl.NumberFormat("id-ID").format(Math.max(0, Number(value) || 0));
  }

  function getHexVirtualLineHeight(totalLines) {
    const normalizedTotalLines = Math.max(0, Number(totalLines) || 0);
    if (!normalizedTotalLines) {
      return hexPreviewLineHeight;
    }

    return Math.min(
      hexPreviewLineHeight,
      Math.max(1, hexPreviewMaxVirtualHeight / normalizedTotalLines)
    );
  }

  function normalizeProgressHistory(entries) {
    if (!Array.isArray(entries)) {
      return [];
    }

    return entries
      .map((entry) => ({
        sequence: Number(entry?.sequence || 0),
        deviceLabel: String(entry?.deviceLabel || "").trim(),
        pageSize: Math.max(0, Number(entry?.pageSize || 0)),
        speedHz: Math.max(0, Number(entry?.speedHz || 0)),
        chipModel: String(entry?.chipModel || "").trim(),
        chipVoltage: String(entry?.chipVoltage || "").trim(),
        chipCapacity: String(entry?.chipCapacity || "").trim(),
        actionLabel: String(entry?.actionLabel || "").trim(),
        durationMilliseconds: Math.max(0, Number(entry?.durationMilliseconds || 0)),
        completedAtUnixMilliseconds: Math.max(0, Number(entry?.completedAtUnixMilliseconds || entry?.completedAt || 0))
      }))
      .filter((entry) => entry.sequence > 0 && entry.deviceLabel && entry.actionLabel)
      .sort((left, right) => (right.sequence || 0) - (left.sequence || 0));
  }

  function formatDurationLabel(durationMilliseconds) {
    const totalSeconds = Math.max(1, Math.round(Math.max(0, Number(durationMilliseconds) || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes <= 0) {
      return `${seconds}detik`;
    }

    return `${minutes}m${seconds}detik`;
  }

  function formatSpeedLabel(speedHz) {
    const normalized = Math.max(0, Number(speedHz) || 0);
    if (!normalized) {
      return "-";
    }

    const speedMHz = normalized / 1000000;
    return `${Number(speedMHz.toFixed(2)).toString()}Mhz`;
  }

  function formatSpeedInputValue(speedHz) {
    const normalized = Math.max(0, Number(speedHz) || 0);
    if (!normalized) {
      return "";
    }

    const speedMHz = normalized / 1000000;
    return Number(speedMHz.toFixed(2)).toString();
  }

  function parseSpeedInputValue(rawValue) {
    const normalized = String(rawValue || "").trim().replace(",", ".");
    if (!normalized) {
      return 0;
    }

    const numeric = Number(normalized);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return 0;
    }

    return Math.round(numeric * 1000000);
  }

  function formatChunkInputValue(chunkSizeBytes) {
    const normalized = Math.max(0, Number(chunkSizeBytes) || 0);
    if (!normalized) {
      return "";
    }

    const chunkKb = normalized / 1024;
    return Number(chunkKb.toFixed(2)).toString();
  }

  function parseChunkInputValue(rawValue) {
    const normalized = String(rawValue || "").trim().replace(",", ".");
    if (!normalized) {
      return 0;
    }

    const numeric = Number(normalized);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return 0;
    }

    return Math.round(numeric * 1024);
  }

  function createChipSummary(entry) {
    const model = String(entry?.chipModel || "").trim();
    const voltage = String(entry?.chipVoltage || "").trim();
    const capacity = String(entry?.chipCapacity || "").trim();
    return [model, voltage, capacity].filter(Boolean).join(" ");
  }

  function resolveFlashBrandMark(manufacturer, model) {
    const source = [manufacturer, model].filter(Boolean).join(" ").trim();
    const normalized = source.toUpperCase().replace(/[^A-Z0-9]+/g, "");
    const aliases = [
      ["winbond", "Winbond", ["WINBOND"]],
      ["gigadevice", "GigaDevice", ["GIGADEVICE", "GD25"]],
      ["xmc", "XMC", ["XMC", "XM25"]],
      ["puya", "PUYA", ["PUYA", "PY25", "P25Q"]],
      ["macronix", "MXIC", ["MACRONIX", "MXIC", "MX25"]],
      ["micron", "micron", ["MICRON", "NUMONYX", "N25Q", "MT25"]],
      ["eon", "EON", ["EON", "EN25"]],
      ["issi", "ISSI", ["ISSI", "IS25"]],
      ["atmel", "ATMEL", ["ATMEL", "AT25"]],
      ["amic", "AMIC", ["AMIC", "A25L"]],
      ["sst", "SST", ["SST", "SST25"]],
      ["fudan", "FUDAN", ["FUDAN", "FM25"]],
      ["spansion", "Spansion", ["SPANSION", "S25"]],
      ["boya", "BOYA", ["BOYA", "BY25"]],
      ["xtx", "XTX", ["XTX", "XT25"]],
      ["zbit", "Zbit", ["ZBIT", "ZB25"]],
      ["esmt", "ESMT", ["ESMT", "F25L"]],
      ["excelsemi", "ExcelSemi", ["EXCELSEMI", "ES25"]],
      ["pct", "PCT", ["PCT"]],
      ["pflash", "PFLASH", ["PFLASH"]],
      ["zetta", "Zetta", ["ZETTA", "ZD25"]],
      ["intel", "intel", ["INTEL"]],
      ["nantronics", "Nantronics", ["NANTRONICS"]],
      ["paragon", "Paragon", ["PARAGON"]],
      ["sanyo", "SANYO", ["SANYO"]],
      ["pmc", "PMC", ["PMC", "PM25"]],
      ["onsemi", "onsemi", ["ONSEMI", "ON25"]],
      ["douqi", "DOUQI", ["DOUQI"]],
      ["st", "ST", ["ST", "M25P", "M25PE", "M45PE"]]
    ];

    const match = aliases.find(([, , tokens]) => tokens.some((token) => normalized.includes(token)));
    if (match) {
      return { key: match[0], label: match[1] };
    }

    const fallbackLabel = String(manufacturer || "").trim() || "25 SPI";
    return {
      key: "generic",
      label: fallbackLabel.length > 14 ? fallbackLabel.slice(0, 14) : fallbackLabel
    };
  }

  function normalizeMonitorTarget(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return normalized === "bios" || normalized === "ene" || normalized === "ite"
      ? normalized
      : "";
  }

  function resolveMonitorTargetFromAction(action) {
    const normalizedAction = String(action || "").trim().toLowerCase();
    if (normalizedAction === "detect-bios") {
      return "bios";
    }
    if (normalizedAction === "ene-detect") {
      return "ene";
    }
    if (normalizedAction === "ite-detect") {
      return "ite";
    }
    return "";
  }

  function resolveMonitorTargetFromDetectedFields(entry) {
    const targetText = [
      entry?.chipVendor,
      entry?.chipModel,
      entry?.jedec
    ].filter(Boolean).join(" ").toLowerCase();
    if (String(entry?.chipVendor || "").trim().toUpperCase() === "ENE" ||
      targetText.includes("ene") ||
      targetText.includes("kb9")) {
      return "ene";
    }
    if (String(entry?.chipVendor || "").trim().toUpperCase() === "ITE" ||
      targetText.includes("ite") ||
      targetText.includes("it8")) {
      return "ite";
    }
    if (entry?.chipVendor || entry?.chipModel || entry?.jedec) {
      return "bios";
    }
    return "";
  }

  function isIdleOperationLabel(value) {
    const label = String(value || "").trim().toLowerCase();
    return !label ||
      label === "idle" ||
      label === "belum ada operasi" ||
      label === "device dipilih" ||
      label === "file siap dipakai";
  }

  function isFinalOperationLabel(value) {
    const label = String(value || "").trim().toLowerCase();
    return label.includes("selesai") ||
      label.includes("sukses") ||
      label.includes("gagal") ||
      label.includes("error") ||
      label.includes("failed") ||
      label.includes("batal") ||
      label.includes("cancelled");
  }

  function normalizeTaskKey(value) {
    return normalizeSpiFlashTaskActionName(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  }

  function doesSessionMatchActiveTask(state, activeTaskOperationLabel = "") {
    const activeTaskKey = normalizeTaskKey(activeTaskOperationLabel);
    if (!activeTaskKey) {
      return true;
    }

    return [
      state.activeOperation,
      state.lastResult,
      ...(Array.isArray(state.logs) ? state.logs.slice(0, 4) : [])
    ].some((item) => {
      const itemKey = normalizeTaskKey(item);
      return itemKey && (itemKey.includes(activeTaskKey) || activeTaskKey.includes(itemKey));
    });
  }

  function isSessionActionSettled(state, activeTaskOperationLabel = "") {
    const progressDone = Number(state.progress || 0) >= 100;
    const statusText = `${state.activeOperation || ""} ${state.lastResult || ""}`;
    return (progressDone || isFinalOperationLabel(statusText)) &&
      doesSessionMatchActiveTask(state, activeTaskOperationLabel);
  }

  function createSessionSettlementSignature(state) {
    return [
      state.activeOperation,
      state.lastResult,
      state.lastUpdated,
      state.progress,
      state.chipVendor,
      state.chipModel,
      ...(Array.isArray(state.logs) ? state.logs.slice(0, 2) : [])
    ].map((item) => String(item || "").trim()).join("|");
  }

  function isSpiFlashSessionProgressActive(currentState) {
    const activeOperation = String(currentState?.activeOperation || "").trim();
    if (isIdleOperationLabel(activeOperation)) {
      return false;
    }

    const progress = Number(currentState?.progress || 0);
    const statusText = `${activeOperation} ${currentState?.lastResult || ""} ${currentState?.lastUpdated || ""}`;
    return progress >= 0 &&
      progress < 100 &&
      !isFinalOperationLabel(statusText);
  }

  function resolveServiceFailureMessage(session) {
    const activeOperation = String(session?.activeOperation || "").trim();
    const lastResult = String(session?.lastResult || "").trim();
    const normalizedOperation = activeOperation.toLowerCase();
    const normalizedResult = lastResult.toLowerCase();
    const hasMismatch =
      normalizedResult.includes("mismatch") &&
      !normalizedResult.includes("tanpa mismatch");
    const hasFailure =
      normalizedOperation.includes("gagal") ||
      normalizedResult.includes("gagal") ||
      hasMismatch;

    if (!hasFailure) {
      return "";
    }

    return lastResult || activeOperation || "Operasi SPI Flash gagal.";
  }

  function getActionProgressIcon(label) {
    const normalized = String(label || "").toLowerCase();
    if (normalized.includes("jedec") || normalized.includes("detect")) {
      return "radar";
    }

    if (normalized.includes("erase")) {
      return "ink_eraser";
    }

    if (normalized.includes("write")) {
      return "upload";
    }

    if (normalized.includes("verify")) {
      return "rule";
    }

    if (normalized.includes("read")) {
      return "download";
    }

    if (normalized.includes("connect") || normalized.includes("konek")) {
      return "usb";
    }

    return "memory";
  }

  function createActionProgressMeta(entry) {
    const chipSummary = createChipSummary(entry);
    const parts = [
      entry.deviceLabel,
      chipSummary || "SPI Flash",
      formatSpeedLabel(entry.speedHz)
    ].filter((part) => part && part !== "-");
    return parts.join(" - ");
  }

  function getSpiFlashTaskTimestamp(entry, fallbackOffset = 0) {
    const completedAt = Number(entry?.completedAtUnixMilliseconds || 0);
    if (completedAt > 0) {
      return completedAt;
    }

    return Date.now() - Math.max(0, fallbackOffset);
  }

  function normalizeSpiFlashTaskActionName(value) {
    const rawText = String(value || "").trim();
    const normalized = rawText
      .toLowerCase()
      .replace(/\b(sedang|selesai|sukses|gagal|error|failed|completed|running|progress)\b/g, " ")
      .replace(/\b\d+%\b/g, " ")
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const normalizedTokens = normalized.split(/\s+/).filter(Boolean);
    const hasEne = normalizedTokens.includes("ene");
    const hasIte = normalizedTokens.includes("ite");
    const prefix = hasEne ? "ENE " : hasIte ? "ITE " : "";

    if ((hasEne || hasIte) && normalized.includes("detect")) {
      return `Detect ${hasEne ? "ENE" : "ITE"}`;
    }

    if (normalized.includes("detect bios") || normalized.includes("25 spi")) {
      return "Detect BIOS";
    }

    if (
      normalized.includes("erase+write+verify") ||
      normalized.includes("write flow") ||
      normalized.includes("auto flow") ||
      (normalized.includes("erase") && normalized.includes("write") && normalized.includes("verify"))
    ) {
      return `${prefix}Erase+Write+Verify`.trim();
    }

    if (
      normalized.includes("read+verify") ||
      normalized.includes("read verify")
    ) {
      return `${prefix}Read+Verify`.trim();
    }

    if (
      normalized.includes("smartid") ||
      normalized.includes("jedec") ||
      (normalized.includes("detect") && !hasEne && !hasIte)
    ) {
      return "SmartID";
    }

    if (normalized.includes("verify")) {
      return `${prefix}Verify`.trim();
    }

    if (normalized.includes("erase")) {
      return `${prefix}Erase`.trim();
    }

    if (normalized.includes("write")) {
      return `${prefix}Write`.trim();
    }

    if (normalized.includes("read")) {
      return `${prefix}Read`.trim();
    }

    if (normalized.includes("connect") || normalized.includes("koneksi")) {
      return "Connect";
    }

    if (normalized.includes("proses") || normalized.includes("operasi")) {
      return "Proses";
    }

    return rawText || "SPI Flash";
  }

  function createSpiFlashTaskTitle(actionName, stage) {
    const normalizedAction = normalizeSpiFlashTaskActionName(actionName);
    const normalizedStage = String(stage || "").trim().toLowerCase();
    if (normalizedStage === "running") {
      return `Sedang ${normalizedAction}...`;
    }

    if (normalizedStage === "completed") {
      return `${normalizedAction} selesai`;
    }

    if (normalizedStage === "failed") {
      return `${normalizedAction} gagal`;
    }

    if (normalizedStage === "cancelled") {
      return `${normalizedAction} batal`;
    }

    return normalizedAction;
  }

  function getStableSpiFlashFailureTimestamp(signature) {
    const normalizedSignature = String(signature || "").trim();
    if (!normalizedSignature) {
      latestSpiFlashFailureSignature = "";
      latestSpiFlashFailureTimestamp = 0;
      return Date.now();
    }

    if (normalizedSignature !== latestSpiFlashFailureSignature) {
      latestSpiFlashFailureSignature = normalizedSignature;
      latestSpiFlashFailureTimestamp = Date.now();
    }

    return latestSpiFlashFailureTimestamp || Date.now();
  }

  function reportActionProgressTasks(
    state,
    busy,
    deviceBusy,
    progressWidth,
    reportTask,
    activeTaskOperationLabel = "",
    activeTaskOperationId = "",
    historyClearedAtMs = 0
  ) {
    if (typeof reportTask !== "function") {
      return;
    }

    const completedEntries = (Array.isArray(state.fullProgressHistory)
      ? state.fullProgressHistory
      : [])
      .slice()
      .filter((entry) => Number(entry.completedAtUnixMilliseconds || 0) > Number(historyClearedAtMs || 0))
      .sort((left, right) => (right.sequence || 0) - (left.sequence || 0));
    const activeOperation = String(activeTaskOperationLabel || state.activeOperation || "").trim();
    const sessionProgressActive = isSpiFlashSessionProgressActive(state);
    const hasActiveOperation =
      (busy || deviceBusy || sessionProgressActive) &&
      !isIdleOperationLabel(activeOperation);
    const lowerActiveOperation = activeOperation.toLowerCase();
    const lowerLastResult = String(state.lastResult || "").trim().toLowerCase();
    const failedMessage = !busy && !deviceBusy && state.errorMessage
      ? String(state.errorMessage || "").trim()
      : "";
    const hasCurrentFailure =
      Boolean(failedMessage) ||
      lowerActiveOperation.includes("gagal") ||
      lowerActiveOperation.includes("failed") ||
      lowerLastResult.includes("gagal") ||
      lowerLastResult.includes("failed") ||
      lowerLastResult.includes("tidak menemukan") ||
      (
        lowerLastResult.includes("mismatch") &&
        !lowerLastResult.includes("tanpa mismatch")
      );
    const shouldShowCurrentResult =
      !hasActiveOperation &&
      !hasCurrentFailure &&
      Number(state.progress || 0) >= 100 &&
      (
        lowerActiveOperation.includes("jedec") ||
        lowerActiveOperation.includes("smartid") ||
        lowerActiveOperation.includes("detect")
      );
    const activeMeta = [
      state.selectedDevice ? resolveSelectedDeviceLabel(state.selectedDevice) : "",
      state.jedec ? (String(state.jedec).trim().toUpperCase().startsWith("ENE ")
        ? `ENE ID ${state.jedec.replace(/^ENE\s+/i, "")}`
        : `JEDEC ${state.jedec}`) : "",
      state.fileName || ""
    ].filter(Boolean).join(" - ") || "Menunggu update dari aplikasi lokal";

    if (hasActiveOperation) {
      const timestamp = Date.now();
      reportTask({
        operationId: activeTaskOperationId || "spi-flash-active",
        source: "spi-flash",
        fileName: createSpiFlashTaskTitle(activeOperation, "running"),
        displayName: "SPI Flash",
        icon: "progress_activity",
        message: activeMeta,
        stage: "running",
        active: true,
        success: false,
        progressPercent: Math.max(progressWidth, Number(state.progress || 0)),
        updatedAt: timestamp,
        sortKey: timestamp
      });
    } else {
      reportTask({
        operationId: activeTaskOperationId || "spi-flash-active",
        source: "spi-flash",
        remove: true
      });
    }

    completedEntries.slice(0, maxSpiFlashTaskPanelEntries).forEach((entry, index) => {
      const timestamp = getSpiFlashTaskTimestamp(entry, index);
      reportTask({
        operationId: `spi-flash-history-${entry.sequence}`,
        source: "spi-flash",
        fileName: createSpiFlashTaskTitle(entry.actionLabel || "SPI Flash action", "completed"),
        displayName: "SPI Flash",
        icon: getActionProgressIcon(entry.actionLabel),
        message: `${createActionProgressMeta(entry)} - ${formatDurationLabel(entry.durationMilliseconds)}`,
        stage: "completed",
        active: false,
        success: true,
        progressPercent: 100,
        updatedAt: timestamp,
        sortKey: timestamp
      });
    });

    if (shouldShowCurrentResult && completedEntries.length === 0) {
      const timestamp = Date.now();
      const resultKey = `${activeOperation}-${state.jedec || ""}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "completed";
      reportTask({
        operationId: `spi-flash-result-${resultKey}`,
        source: "spi-flash",
        fileName: createSpiFlashTaskTitle(activeOperation, "completed"),
        displayName: "SPI Flash",
        icon: getActionProgressIcon(activeOperation),
        message: activeMeta,
        stage: "completed",
        active: false,
        success: true,
        progressPercent: 100,
        updatedAt: timestamp,
        sortKey: timestamp
      });
    }

    if (failedMessage) {
      const failedTitle = activeOperation && !isIdleOperationLabel(activeOperation)
        ? activeOperation
        : "Proses gagal";
      const failureSignature = `${failedTitle}|${failedMessage}`;
      const timestamp = getStableSpiFlashFailureTimestamp(failureSignature);
      reportTask({
        operationId: `spi-flash-failed-${failedMessage.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80)}`,
        source: "spi-flash",
        fileName: createSpiFlashTaskTitle(failedTitle, "failed"),
        displayName: "SPI Flash",
        icon: getActionProgressIcon(failedTitle),
        message: failedMessage,
        lastError: failedMessage,
        stage: "failed",
        active: false,
        success: false,
        progressPercent: Math.max(0, progressWidth),
        updatedAt: timestamp,
        sortKey: timestamp
      });
    } else {
      getStableSpiFlashFailureTimestamp("");
    }
  }

  function createDefaultPinMonitorState() {
    return {
      loading: false,
      errorMessage: "",
      message: "Belum dibaca.",
      capturedAt: "",
      mode: "voltage",
      pins: []
    };
  }

  const soicPinNames = ["/CS", "DO/SO", "/WP", "GND", "DI/SI", "CLK", "/HOLD", "VCC"];
  const soicPinToSenseMuxChannel = [7, 6, 5, 4, 0, 1, 2, 3];
  const soicSignalPins = new Set([1, 2, 3, 5, 6, 7]);
  const soicChipBiasThresholds = {
    3: 500,
    5: 465,
    6: 445,
    7: 510
  };

  function resolveSoicSenseMuxChannel(pinNumber) {
    const normalizedPinNumber = Math.max(1, Math.min(8, Number(pinNumber) || 0));
    return soicPinToSenseMuxChannel[normalizedPinNumber - 1] ?? 0;
  }

  function resolveSoicPinName(pinNumber) {
    const normalizedPinNumber = Math.max(1, Math.min(8, Number(pinNumber) || 0));
    return soicPinNames[normalizedPinNumber - 1] || "";
  }

  function resolveSoicFunctionalStatus(pinNumber, payload) {
    if (pinNumber !== 1) {
      return null;
    }

    const welMv = Number(payload?.targetMillivolts || 0);
    return welMv >= 3000
      ? { status: "connected", label: "CS/WEL OK", detail: "WREN latch OK" }
      : { status: "open", label: "WEL VERIFY FAIL", detail: "cek /CS + SO" };
  }

  function normalizeSoicProbeSample(pinNumber, payload) {
    const lowMv = Number(payload?.lowBeforeMillivolts || 0);
    const highMv = Number(payload?.drivenHighMillivolts || 0);
    const afterMv = Number(payload?.lowAfterMillivolts || 0);

    return {
      payload,
      pinNumber,
      lowMv,
      highMv,
      afterMv,
      deltaMv: afterMv - lowMv,
      targetMv: Number(payload?.targetMillivolts || 0)
    };
  }

  function resolveWpVotedContactStatus(samples) {
    const validSamples = Array.isArray(samples) ? samples : [];
    const sampleCount = Math.max(1, validSamples.length);
    const thresholdMv = soicChipBiasThresholds[3] || 500;
    const deltas = validSamples.map((sample) => Number(sample.deltaMv || 0));
    const hitCount = deltas.filter((deltaMv) => deltaMv >= thresholdMv).length;
    const maxDeltaMv = deltas.length ? Math.max(...deltas) : 0;
    const minDeltaMv = deltas.length ? Math.min(...deltas) : 0;
    const detail = `${hitCount}/${sampleCount} hit, ${Math.round(minDeltaMv)}-${Math.round(maxDeltaMv)} mV`;

    if (hitCount >= 3) {
      return { status: "connected", label: "WP BIAS OK", detail };
    }

    if (hitCount === 0) {
      return { status: "open", label: "WP KOSONG?", detail };
    }

    return { status: "check", label: "WP CEK", detail };
  }

  function applySoicDerivedContactStatus(pins) {
    const csPin = pins.find((pin) => pin.pinNumber === 1);
    const soPin = pins.find((pin) => pin.pinNumber === 2);
    if (!soPin || !csPin) {
      return;
    }

    if (csPin.contactStatus === "connected") {
      soPin.contactStatus = "connected";
      soPin.contactLabel = "SO OK";
      soPin.state = "SO OK";
      soPin.contactDetail = "terbukti WEL read";
      return;
    }

    if (csPin.contactStatus === "open") {
      soPin.contactStatus = "check";
      soPin.contactLabel = "SO CEK";
      soPin.state = "SO CEK";
      soPin.contactDetail = "WEL read gagal";
    }
  }

  function formatMillivolts(millivolts) {
    const value = Number(millivolts || 0);
    return `${(value / 1000).toFixed(3)} V`;
  }

  function createUnavailableState(message = "") {
    const profile = deviceProfiles[defaultDeviceType];
    return {
      serviceAvailable: false,
      errorMessage: message,
      autoProcess: true,
      previewMode: false,
      backendMode: "local-service",
      selectedDevice: "",
      connectionState: "Aplikasi lokal belum terhubung",
      activeOperation: "Belum ada operasi",
      firmwareVersion: "",
      firmwareLatestVersion: "",
      firmwareUpdateAvailable: false,
      firmwareUpdateMessage: "",
      firmwareUpdateFileName: "",
      firmwareUpdateFileSize: "",
      firmwareUpdateCheckedAtUtc: "",
      chipVendor: "",
      chipModel: "",
      chipCapacity: "",
      chipVoltage: "",
      monitorTarget: "",
      pageSize: 0,
      speedHz: 0,
      chunkSizeBytes: 0,
      jedec: "",
      startAddress: "",
      length: "",
      fileName: "",
      fileSize: "",
      progress: 0,
      lastResult: "Status aplikasi lokal belum tersedia",
      lastUpdated: "Belum dijalankan",
      hasReadBuffer: false,
      readBufferIsAllFf: false,
      logs: [
        "[--:--:--] Aplikasi lokal SPI Flash belum bisa dijangkau."
      ],
      progressHistory: [],
      fullProgressHistory: [],
      hexPreviewTotalBytes: 0,
      hexPreviewTotalLines: 0,
      hexPreviewScrollTop: 0,
      hexPreview: [
        "Belum ada data."
      ],
      pinMonitor: createDefaultPinMonitorState(),
      selectedDeviceDriver: {
        deviceType: "",
        deviceLabel: "",
        isPresent: false,
        isExpectedDriver: false,
        friendlyName: "",
        instanceId: "",
        deviceClass: "",
        status: "Device belum terdeteksi",
        manufacturer: "",
        driverName: "",
        driverService: "",
        driverProvider: "",
        driverVersion: "",
        driverDate: "",
        expectedService: "",
        installUrl: "",
        installLabel: "",
        installHint: ""
      },
      driverInfoLoaded: false,
      profile
    };
  }

  function normalizeDriverInfo(driverInfo, selectedDevice = "") {
    if (!driverInfo || typeof driverInfo !== "object") {
      return {
        deviceType: selectedDevice || "",
        deviceLabel: deviceProfiles[selectedDevice]?.label || "",
        isPresent: false,
        isExpectedDriver: false,
        friendlyName: "",
        instanceId: "",
        deviceClass: "",
        status: selectedDevice ? "Device belum terdeteksi" : "",
        manufacturer: "",
        driverName: "",
        driverService: "",
        driverProvider: "",
        driverVersion: "",
        driverDate: "",
        expectedService: "",
        installUrl: selectedDevice ? `/spi-flash/drivers/${encodeURIComponent(selectedDevice)}/install` : "",
        installLabel: selectedDevice ? `Install driver ${deviceProfiles[selectedDevice]?.label || selectedDevice}` : "",
        installHint: ""
      };
    }

    return {
      deviceType: driverInfo.deviceType || selectedDevice || "",
      deviceLabel: driverInfo.deviceLabel || deviceProfiles[selectedDevice]?.label || "",
      isPresent: Boolean(driverInfo.isPresent),
      isExpectedDriver: Boolean(driverInfo.isExpectedDriver),
      friendlyName: driverInfo.friendlyName || "",
      instanceId: driverInfo.instanceId || "",
      deviceClass: driverInfo.deviceClass || "",
      status: driverInfo.status || (selectedDevice ? "Device belum terdeteksi" : ""),
      manufacturer: driverInfo.manufacturer || "",
      driverName: driverInfo.driverName || "",
      driverService: driverInfo.driverService || "",
      driverProvider: driverInfo.driverProvider || "",
      driverVersion: driverInfo.driverVersion || "",
      driverDate: driverInfo.driverDate || "",
      expectedService: driverInfo.expectedService || "",
      installUrl: driverInfo.installUrl || (selectedDevice ? `/spi-flash/drivers/${encodeURIComponent(selectedDevice)}/install` : ""),
      installLabel: driverInfo.installLabel || (selectedDevice ? `Install driver ${deviceProfiles[selectedDevice]?.label || selectedDevice}` : ""),
      installHint: driverInfo.installHint || ""
    };
  }

  function hasDriverPayload(driverInfo) {
    return Boolean(
      driverInfo &&
      typeof driverInfo === "object" &&
      (
        driverInfo.deviceType ||
        driverInfo.deviceLabel ||
        driverInfo.friendlyName ||
        driverInfo.driverName ||
        driverInfo.driverService ||
        driverInfo.isPresent
      )
    );
  }

  function mapServiceSessionToState(session, previousState = null, options = {}) {
    const hasPersistedSessionState =
      Boolean(session.fileName) ||
      Boolean(session.jedec) ||
      Boolean(session.chipVendor) ||
      Boolean(session.chipModel) ||
      Boolean(session.startAddress) ||
      Boolean(session.length);
    const activeOperation = String(session.activeOperation || "").trim().toLowerCase();
    const normalizedConnectionState = String(session.connectionState || "").trim().toLowerCase();
    const isFreshDefaultSession = false;
    const forceNoDeviceSelection = options.forceNoDeviceSelection === true;
    const selectedDevice = forceNoDeviceSelection ? "" : (session.selectedDevice || "");
    const previousDriverInfo =
      previousState &&
      previousState.selectedDevice === selectedDevice
        ? previousState.selectedDeviceDriver
        : null;
    const driverPayloadPresent = hasDriverPayload(session.selectedDeviceDriver);
    const selectedDeviceDriver = driverPayloadPresent
      ? normalizeDriverInfo(session.selectedDeviceDriver, selectedDevice)
      : (previousDriverInfo || normalizeDriverInfo(null, selectedDevice));
    const driverInfoLoaded = selectedDevice
      ? (driverPayloadPresent || Boolean(previousState && previousState.selectedDevice === selectedDevice && previousState.driverInfoLoaded))
      : false;
    const pinMonitor = previousState?.selectedDevice === selectedDevice
      ? (previousState.pinMonitor || createDefaultPinMonitorState())
      : createDefaultPinMonitorState();
    const monitorTarget = previousState?.selectedDevice === selectedDevice
      ? normalizeMonitorTarget(previousState.monitorTarget)
      : "";
    const serviceFailureMessage = sanitizePublicMessage(resolveServiceFailureMessage(session));

    return {
      serviceAvailable: true,
      errorMessage: serviceFailureMessage,
      autoProcess: session.autoProcess !== false,
      previewMode: Boolean(session.previewMode),
      backendMode: session.backendMode || "local-service",
      selectedDevice,
      connectionState: forceNoDeviceSelection ? "Belum ada device dipilih" : sanitizePublicMessage(session.connectionState || "Device belum terhubung"),
      activeOperation: session.activeOperation || "Belum ada operasi",
      firmwareVersion: String(session.firmwareVersion || "").trim(),
      firmwareLatestVersion: String(session.firmwareLatestVersion || "").trim(),
      firmwareUpdateAvailable: Boolean(session.firmwareUpdateAvailable),
      firmwareUpdateMessage: sanitizePublicMessage(session.firmwareUpdateMessage || ""),
      firmwareUpdateFileName: String(session.firmwareUpdateFileName || "").trim(),
      firmwareUpdateFileSize: String(session.firmwareUpdateFileSize || "").trim(),
      firmwareUpdateCheckedAtUtc: session.firmwareUpdateCheckedAtUtc || "",
      chipVendor: session.chipVendor || "",
      chipModel: session.chipModel || "",
      chipCapacity: session.chipCapacity || "",
      chipVoltage: session.chipVoltage || "",
      monitorTarget,
      pageSize: Number(session.pageSize || 0),
      speedHz: Number(session.speedHz || 0),
      chunkSizeBytes: Number(session.chunkSizeBytes || 0),
      jedec: session.jedec || "",
      startAddress: session.startAddress || "",
      length: session.length || "",
      fileName: session.fileName || "",
      fileSize: session.fileSize || "",
      progress: Number(session.progress || 0),
      lastResult: sanitizePublicMessage(session.lastResult || "Belum ada operasi"),
      lastUpdated: session.lastUpdated || "Belum dijalankan",
      hasReadBuffer: Boolean(session.hasReadBuffer),
      readBufferIsAllFf: Boolean(session.readBufferIsAllFf),
      logs: Array.isArray(session.logs) ? session.logs : [],
      progressHistory: normalizeProgressHistory(session.progressHistory),
      fullProgressHistory: normalizeProgressHistory(session.fullProgressHistory),
      hexPreviewTotalBytes: Number(session.hexPreviewTotalBytes || 0),
      hexPreviewTotalLines: Number(session.hexPreviewTotalLines || 0),
      hexPreviewScrollTop: Number(previousState?.hexPreviewScrollTop || 0),
      hexPreview: Array.isArray(session.hexPreview) ? session.hexPreview : [],
      pinMonitor,
      selectedDeviceDriver,
      driverInfoLoaded,
      profile: deviceProfiles[selectedDevice] || deviceProfiles[defaultDeviceType]
    };
  }

  async function fetchJson(path, options = {}) {
    const requestUrl = `${serviceBaseUrl}${path}`;
    const isFormDataBody = options.body instanceof FormData;
    const headers = isFormDataBody ? {} : { "Content-Type": "application/json" };

    const response = await fetch(requestUrl, {
      headers,
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

  function resolveDownloadFileName(contentDisposition, fallbackName = "SPIFlash_TeknisiHub.bin") {
    const headerValue = String(contentDisposition || "").trim();
    if (!headerValue) {
      return fallbackName;
    }

    const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      try {
        return decodeURIComponent(utf8Match[1]);
      } catch {
        return utf8Match[1];
      }
    }

    const asciiMatch = headerValue.match(/filename=\"?([^\";]+)\"?/i);
    return asciiMatch?.[1] || fallbackName;
  }

  async function saveBlobToDisk(blob, suggestedName) {
    if (typeof window.showSaveFilePicker === "function") {
      const extension = suggestedName.includes(".")
        ? `.${suggestedName.split(".").pop()}`
        : ".bin";
      const fileHandle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: "Binary file",
            accept: {
              "application/octet-stream": [extension]
            }
          }
        ]
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    }

    return false;
  }

  function notifyUser(message, tone = "success") {
    if (!message) {
      return;
    }

    pageNotifier(message, tone);
  }

  function openDatabaseEditor() {
    const editorUrl = new URL("pages/spi-flash/database-editor.html", window.location.href);
    const nextWindow = window.open(editorUrl.toString(), "_blank", "noopener");
    if (!nextWindow) {
      notifyUser("Popup editor database diblokir browser. Izinkan popup lalu coba lagi.", "warning");
      return;
    }

    nextWindow.focus?.();
  }

  function getHexPreviewStatusState(state, busy) {
    const activeOperation = String(state.activeOperation || "").trim().toLowerCase();
    const lastResult = String(state.lastResult || "").trim().toLowerCase();
    const hasExplicitMismatchFailure =
      lastResult.includes("mismatch") &&
      !lastResult.includes("tanpa mismatch");

    if (busy) {
      return {
        toneClass: "",
        loading: true,
        headingMarkup: `
          <span class="material-symbols-outlined is-spinning">progress_activity</span>
          <span>${escapeHtml(createSpiFlashTaskTitle(state.activeOperation || "Proses", "running"))}</span>
        `
      };
    }

    const isError =
      activeOperation.includes("gagal") ||
      lastResult.includes("gagal") ||
      hasExplicitMismatchFailure;

    const successLabel =
      activeOperation.includes("read + verify selesai") ||
      activeOperation.includes("read selesai") ||
      activeOperation.includes("write flow selesai") ||
      activeOperation.includes("write selesai") ||
      activeOperation.includes("chip erase selesai") ||
      activeOperation.includes("erase selesai") ||
      activeOperation.includes("verify selesai") ||
      activeOperation.includes("auto flow selesai") ||
      (activeOperation.includes("detect") && activeOperation.includes("selesai"))
        ? createSpiFlashTaskTitle(state.activeOperation, "completed")
        : "";

    if (isError) {
      return {
        toneClass: " is-failed",
        loading: false,
        headingMarkup: escapeHtml(createSpiFlashTaskTitle(state.activeOperation || "Proses", "failed"))
      };
    }

    if (successLabel) {
      return {
        toneClass: " is-success",
        loading: false,
        headingMarkup: escapeHtml(successLabel)
      };
    }

    return {
      toneClass: "",
      loading: false,
      headingMarkup: "Data baca"
    };
  }

  function hasHexPreviewContent(state) {
    return Number(state?.hexPreviewTotalBytes || 0) > 0 && Number(state?.hexPreviewTotalLines || 0) > 0;
  }

  function parseHexPreviewLine(line) {
    const normalized = String(line || "");
    const match = normalized.match(/^([0-9A-F]{8})\s{2}(.{48})\s{2}\|(.{16})\|$/);
    if (!match) {
      return {
        offset: "",
        hex: normalized,
        ascii: ""
      };
    }

    return {
      offset: match[1],
      hex: match[2],
      ascii: match[3]
    };
  }

  function createHexPreviewRowsMarkup(lines) {
    return lines.map((line) => {
      const parsedLine = parseHexPreviewLine(line);
      return `
        <div class="spi-hex-row" role="row">
          <span class="spi-hex-cell spi-hex-offset" role="cell">${escapeHtml(parsedLine.offset || "--------")}</span>
          <span class="spi-hex-cell spi-hex-bytes" role="cell">${escapeHtml(parsedLine.hex)}</span>
          <span class="spi-hex-cell spi-hex-ascii" role="cell">${escapeHtml(parsedLine.ascii)}</span>
        </div>
      `;
    }).join("");
  }

  function createHexPreviewMarkup(state, hexView) {
    const hasContent = hasHexPreviewContent(state);
    const normalizedLines = hasContent
      ? (Array.isArray(hexView?.lines) && hexView.lines.length > 0
          ? hexView.lines
          : (Array.isArray(state.hexPreview) && state.hexPreview.length > 0 ? state.hexPreview : []))
      : ["Belum ada data."];
    const virtualLineHeight = getHexVirtualLineHeight(state.hexPreviewTotalLines);
    const totalHeight = hasContent
      ? Math.max(Number(state.hexPreviewTotalLines || 0) * virtualLineHeight, hexPreviewLineHeight)
      : 0;
    const translateY = hasContent
      ? Math.max(0, Number(hexView?.lineStart || 0) * virtualLineHeight)
      : 0;

    return `
      <div class="spi-hex-preview-shell${hasContent ? "" : " is-empty"}">
        <div class="spi-hex-preview-scroll" id="spiHexPreviewViewport">
          ${hasContent ? `
            <div class="spi-hex-preview-sticky" aria-hidden="true">
              <div class="spi-hex-preview-chrome">
                <span class="spi-hex-preview-caption">Hex Editor View</span>
              </div>
              <div class="spi-hex-preview-head" id="spiHexPreviewHead" role="row">
                <span class="spi-hex-cell spi-hex-preview-head-offset" role="columnheader">Offset(h)</span>
                <span class="spi-hex-cell spi-hex-preview-head-bytes" role="columnheader">00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F</span>
                <span class="spi-hex-cell spi-hex-preview-head-ascii" role="columnheader">ASCII</span>
              </div>
            </div>
          ` : ""}
          <div class="spi-hex-preview-body">
            ${hasContent ? `
              <div class="spi-hex-preview-spacer" id="spiHexPreviewSpacer" style="height: ${totalHeight}px;"></div>
              <div class="spi-hex-preview-canvas" id="spiHexPreviewCanvas" style="transform: translateY(${translateY}px);">
                <div class="spi-hex-preview-grid" id="spiHexPreviewContent" role="table">${createHexPreviewRowsMarkup(normalizedLines)}</div>
              </div>
              <div class="spi-hex-preview-loading${hexView?.loading ? " is-visible" : ""}" id="spiHexPreviewLoading">Memuat baris hex...</div>
            ` : `
              <pre class="spi-hex-preview">${escapeHtml(normalizedLines.join("\n"))}</pre>
            `}
          </div>
        </div>
      </div>
    `;
  }

  function createActionButton(action, icon, label, detail, disableAttr, extraClass = "") {
    return `
      <button type="button" class="${escapeHtml(extraClass)}" data-spi-action="${escapeHtml(action)}"${disableAttr}>
        <span class="material-symbols-outlined">${escapeHtml(icon)}</span>
        <span class="spi-action-copy">
          <strong>${escapeHtml(label)}</strong>
          <small>${escapeHtml(detail)}</small>
        </span>
      </button>
    `;
  }

  function normalizePinMonitorPin(pin) {
    const pinNumber = Number(pin?.pinNumber || 0);
    const millivolts = Number(pin?.millivolts || 0);
    const contactDeltaMv = Number(pin?.contactDeltaMv ?? pin?.deltaHighMillivolts ?? 0);
    const contactLowMv = Number(pin?.contactLowMv ?? pin?.lowBeforeMillivolts ?? 0);
    const contactHighMv = Number(pin?.contactHighMv ?? pin?.drivenHighMillivolts ?? 0);
    return {
      pinNumber,
      channel: Number(pin?.channel ?? resolveSoicSenseMuxChannel(pinNumber)),
      name: String(pin?.name || "").trim(),
      raw: Number(pin?.raw || 0),
      millivolts,
      voltage: String(pin?.voltage || `${(millivolts / 1000).toFixed(3)} V`).trim(),
      state: String(pin?.state || "-").trim(),
      contactStatus: String(pin?.contactStatus || "").trim(),
      contactLabel: String(pin?.contactLabel || "").trim(),
      contactDetail: String(pin?.contactDetail || "").trim(),
      contactDeltaMv,
      contactLowMv,
      contactHighMv,
      contactSamples: Number(pin?.contactSamples || 0)
    };
  }

  function normalizePinDiagnosticPin(pin) {
    const pinNumber = Number(pin?.pinNumber || 0);
    const pullSpanMv = Number(pin?.pullSpanMillivolts || 0);
    const decaySpanMv = Number(pin?.decaySpanMillivolts || 0);
    const couplingSelfMv = Number(pin?.couplingSelfMillivolts || 0);
    const staticMv = Number(pin?.staticMillivolts || 0);
    const hint = String(pin?.diagnosticHint || "").trim();
    const isGround = pinNumber === 4 && hint.toLowerCase().includes("gnd");
    const isVcc = pinNumber === 8 && staticMv >= 1600;
    return {
      pinNumber,
      channel: Number(pin?.channel ?? resolveSoicSenseMuxChannel(pinNumber)),
      name: String(pin?.name || resolveSoicPinName(pinNumber)),
      raw: 0,
      millivolts: staticMv,
      voltage: String(pin?.staticVoltage || formatMillivolts(staticMv)),
      state: hint || "DIAG",
      contactStatus: isGround ? "ground" : isVcc ? "vcc" : "check",
      contactLabel: isGround ? "GND OK" : isVcc ? "VCC OK" : "DIAG",
      contactDetail: hint,
      contactDeltaMv: Math.max(pullSpanMv, decaySpanMv, couplingSelfMv),
      contactLowMv: Number(pin?.pullDownMillivolts || 0),
      contactHighMv: Number(pin?.pullUpMillivolts || 0),
      contactSamples: 1
    };
  }

  function applyPinFunctionalTest(pins, functional) {
    if (!functional || typeof functional !== "object") {
      return pins;
    }

    const byPin = new Map(pins.map((pin) => [pin.pinNumber, pin]));
    const normalJedecValid = Boolean(functional.normalJedecValid);
    const restoredJedecValid = Boolean(functional.restoredJedecValid);
    const spiCoreValid = normalJedecValid && restoredJedecValid;

    if (!spiCoreValid) {
      [
        [1, "/CS FAIL"],
        [2, "SO FAIL"],
        [3, "WP FAIL"],
        [4, "GND FAIL"],
        [5, "SI FAIL"],
        [6, "CLK FAIL"],
        [7, "HOLD FAIL"],
        [8, "VCC FAIL"]
      ].forEach(([pinNumber, label]) => {
        const pin = byPin.get(pinNumber);
        if (!pin) {
          return;
        }

        pin.contactStatus = "open";
        pin.contactLabel = label;
        pin.state = label;
        pin.contactDetail = "";
      });

      return pins;
    }

    [
      [4, "GND OK"],
      [8, "VCC OK"]
    ].forEach(([pinNumber, label]) => {
      const pin = byPin.get(pinNumber);
      if (!pin) {
        return;
      }

      pin.contactStatus = "connected";
      pin.contactLabel = label;
      pin.state = label;
      pin.contactDetail = "";
    });

    if (spiCoreValid) {
      [
        [2, "SO OK"],
        [5, "SI OK"],
        [6, "CLK OK"]
      ].forEach(([pinNumber, label]) => {
        const pin = byPin.get(pinNumber);
        if (!pin) {
          return;
        }

        pin.contactStatus = "connected";
        pin.contactLabel = label;
        pin.state = label;
        pin.contactDetail = "";
      });
    }

    const csPin = byPin.get(1);
    if (csPin) {
      const csOk = spiCoreValid && Boolean(functional.csPinFunctional);
      csPin.contactStatus = csOk ? "connected" : "open";
      csPin.contactLabel = csOk ? "/CS OK" : "/CS FAIL";
      csPin.state = csPin.contactLabel;
      csPin.contactDetail = "";
    }

    const holdPin = byPin.get(7);
    if (holdPin) {
      holdPin.contactStatus = "connected";
      holdPin.contactLabel = "HOLD OK";
      holdPin.state = holdPin.contactLabel;
      holdPin.contactDetail = "";
    }

    const wpPin = byPin.get(3);
    if (wpPin) {
      wpPin.contactStatus = "connected";
      wpPin.contactLabel = "WP OK";
      wpPin.state = wpPin.contactLabel;
      wpPin.contactDetail = "";
    }

    return pins;
  }

  function applyMuxRequiredPinFailure(pins) {
    const byPin = new Map(pins.map((pin) => [pin.pinNumber, pin]));
    [
      [3, "WP FAIL"],
      [4, "GND FAIL"],
      [8, "VCC FAIL"]
    ].forEach(([pinNumber, label]) => {
      const pin = byPin.get(pinNumber);
      if (!pin) {
        return;
      }

      pin.contactStatus = "open";
      pin.contactLabel = label;
      pin.state = label;
      pin.contactDetail = "";
    });
    return pins;
  }

  function applyMuxPinDiagnosticOverrides(pins, diagnostic) {
    if (!diagnostic || !Array.isArray(diagnostic.pins)) {
      return applyMuxRequiredPinFailure(pins);
    }

    const byPin = new Map(pins.map((pin) => [pin.pinNumber, pin]));
    const labels = {
      3: ["WP OK", "WP FAIL"],
      4: ["GND OK", "GND FAIL"],
      8: ["VCC OK", "VCC FAIL"]
    };
    diagnostic.pins.forEach((diagnosticPin) => {
      const pinNumber = Number(diagnosticPin?.pinNumber || 0);
      if (![3, 4, 8].includes(pinNumber)) {
        return;
      }

      const pin = byPin.get(pinNumber);
      if (!pin) {
        return;
      }

      const hint = String(diagnosticPin?.diagnosticHint || "").toUpperCase();
      const ok = hint.includes("OK");
      const check = hint.includes("CEK");
      const [okLabel, failLabel] = labels[pinNumber];
      pin.contactStatus = ok
        ? (pinNumber === 4 ? "ground" : pinNumber === 8 ? "vcc" : "connected")
        : check ? "check" : "open";
      pin.contactLabel = ok ? okLabel : check ? `${resolveSoicPinName(pinNumber).replace("/", "")} CEK` : failLabel;
      pin.state = pin.contactLabel;
      pin.millivolts = Number(diagnosticPin?.staticMillivolts || 0);
      pin.voltage = String(diagnosticPin?.staticVoltage || formatMillivolts(pin.millivolts));
      pin.contactDetail = pin.voltage;
      pin.contactSamples = 1;
    });

    return pins;
  }

  function createFunctionalOnlyPin(pinNumber) {
    return {
      pinNumber,
      channel: resolveSoicSenseMuxChannel(pinNumber),
      name: resolveSoicPinName(pinNumber),
      raw: 0,
      millivolts: 0,
      voltage: "-",
      state: "CEK",
      contactStatus: "check",
      contactLabel: "CEK",
      contactDetail: "",
      contactDeltaMv: 0,
      contactLowMv: 0,
      contactHighMv: 0,
      contactSamples: 0
    };
  }

  function createFunctionalOnlyPins(functional) {
    const pins = Array.from({ length: 8 }, (_, index) => createFunctionalOnlyPin(index + 1));
    return applyPinFunctionalTest(pins, functional);
  }

  function resolvePinMonitorTone(pin) {
    const contactStatus = String(pin?.contactStatus || "").toLowerCase();
    if (contactStatus === "connected" || contactStatus === "ground" || contactStatus === "vcc") {
      return "is-good";
    }

    if (contactStatus === "open") {
      return "is-bad";
    }

    if (contactStatus === "check") {
      return "is-warn";
    }

    const label = String(pin?.state || "").toLowerCase();
    if (label.includes("konek") || label.includes("ok") || label.includes("1.8") || label.includes("3.3") || label === "high") {
      return "is-good";
    }

    if (label.includes("open")) {
      return "is-bad";
    }

    if (label.includes("cek") || label.includes("tinggi") || label === "mid") {
      return "is-warn";
    }

    if (label.includes("off")) {
      return "is-off";
    }

    return "";
  }

  function resolveSoicContactStatus(pinNumber, deltaMv, lowMv = 0) {
    if (pinNumber === 4) {
      return lowMv <= 180
        ? { status: "ground", label: "GND OK", detail: `${Math.round(lowMv)} mV` }
        : { status: "open", label: "GND OPEN?", detail: `${Math.round(lowMv)} mV` };
    }

    if (pinNumber === 8) {
      return lowMv <= 220
        ? { status: "vcc", label: "VCC OFF", detail: `${Math.round(lowMv)} mV` }
        : { status: "check", label: "VCC CEK", detail: `${Math.round(lowMv)} mV` };
    }

    if (!soicSignalPins.has(pinNumber)) {
      return { status: "check", label: "CEK", detail: `${Math.round(deltaMv)} mV` };
    }

    const chipBiasThreshold = soicChipBiasThresholds[pinNumber];
    if (chipBiasThreshold) {
      if (deltaMv >= chipBiasThreshold) {
        return { status: "connected", label: "CHIP BIAS", detail: `3.3V bias ${Math.round(deltaMv)} mV` };
      }

      return { status: "open", label: "KOSONG?", detail: `3.3V bias ${Math.round(deltaMv)} mV` };
    }

    if (deltaMv >= 250) {
      return { status: "check", label: "JALUR AKTIF", detail: `3.3V bias ${Math.round(deltaMv)} mV` };
    }

    return { status: "check", label: "CEK JALUR", detail: `3.3V bias ${Math.round(deltaMv)} mV` };
  }

  function formatPinMonitorTimestamp(capturedAt) {
    const timestamp = Date.parse(capturedAt || "");
    if (!Number.isFinite(timestamp)) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date(timestamp));
  }

  function createPinMonitorMarkup(state, disableAttr) {
    const monitor = state.pinMonitor || createDefaultPinMonitorState();
    const isContactMode = monitor.mode === "contact";
    const monitorTarget = normalizeMonitorTarget(state.monitorTarget);
    const stateTextForMonitor = [
      state.chipVendor,
      state.chipModel,
      state.jedec
    ].filter(Boolean).join(" ").toLowerCase();
    const detectedMonitorTarget = resolveMonitorTargetFromDetectedFields(state);
    const detectedEneChip = String(state.chipVendor || "").trim().toUpperCase() === "ENE" ||
      /\bene\b|\bkb9/.test(stateTextForMonitor);
    const detectedIteChip = String(state.chipVendor || "").trim().toUpperCase() === "ITE" ||
      /\bite\b|\bit8/.test(stateTextForMonitor);
    const isEneChip = monitorTarget === "ene" || (!monitorTarget && detectedEneChip);
    const isIteChip = monitorTarget === "ite" || (!monitorTarget && detectedIteChip);
    const isKbcChip = isEneChip || isIteChip;
    const useBiosProfile = !detectedEneChip && !detectedIteChip && detectedMonitorTarget === "bios";
    const pins = Array.isArray(monitor.pins)
      ? monitor.pins.map(normalizePinMonitorPin).filter((pin) => pin.pinNumber >= 1 && pin.pinNumber <= 8)
      : [];
    const normalizedPins = Array.from({ length: 8 }, (_, index) => {
      const pinNumber = index + 1;
      return pins.find((pin) => pin.pinNumber === pinNumber) || {
        pinNumber,
        channel: resolveSoicSenseMuxChannel(pinNumber),
        name: resolveSoicPinName(pinNumber),
        raw: 0,
        millivolts: 0,
        voltage: "-",
        state: "-",
        contactStatus: "",
        contactLabel: "",
        contactDetail: ""
      };
    });
    const buttonDisabled = disableAttr || monitor.loading ? " disabled" : "";
    const pinByNumber = new Map(normalizedPins.map((pin) => [pin.pinNumber, pin]));
    const leftPins = [1, 2, 3, 4].map((pinNumber) => pinByNumber.get(pinNumber));
    const rightPins = [8, 7, 6, 5].map((pinNumber) => pinByNumber.get(pinNumber));
    const chipProfileRows = [
      ["Manufacturer", isEneChip ? (detectedEneChip ? (state.chipVendor || "ENE") : "ENE") : isIteChip ? (detectedIteChip ? (state.chipVendor || "ITE") : "ITE") : (useBiosProfile ? (state.chipVendor || "-") : "-")],
      ["Name", isEneChip ? (detectedEneChip ? (state.chipModel || "KB9xxx") : "KB9xxx") : isIteChip ? (detectedIteChip ? (state.chipModel || "IT8xxx") : "IT8xxx") : (useBiosProfile ? (state.chipModel || "-") : "-")],
      ["Size", isEneChip ? (detectedEneChip ? (state.chipCapacity || "128 KB") : "128 KB") : isIteChip ? (detectedIteChip ? (state.chipCapacity || "Detect") : "Detect") : (useBiosProfile ? (state.chipCapacity || "-") : "-")],
      ["Volt", isKbcChip ? (state.chipVoltage || "3.3 V") : (useBiosProfile ? (state.chipVoltage || "-") : "-")]
    ];
    const biosBrandMark = resolveFlashBrandMark(
      useBiosProfile ? state.chipVendor : "",
      useBiosProfile ? state.chipModel : ""
    );
    const renderKbcMonitor = () => {
      const kbcPins = isIteChip ? [
        { side: "left", signal: "SDA", detail: "Data", net: "SDA" },
        { side: "left", signal: "SCL", detail: "Clock", net: "SCL" },
        { side: "left", signal: "GND", detail: "Common", net: "GND" },
        { side: "right", signal: "3.3V", detail: "Board power", net: "VCC" },
        { side: "right", signal: "ISP", detail: "Unlock", net: "ITE" }
      ] : [
        { side: "left", signal: "CS", detail: "SOIC pin 1 / IC pin 59", net: "KSI4" },
        { side: "left", signal: "CLK", detail: "SOIC pin 6 / IC pin 60", net: "KSI5" },
        { side: "left", signal: "MOSI", detail: "SOIC pin 5 / IC pin 61", net: "KSI6" },
        { side: "right", signal: "MISO", detail: "SOIC pin 2 / IC pin 62", net: "KSI7" },
        { side: "right", signal: "GND", detail: "KSO3 -> GND / IC pin 42", net: "KSO3" }
      ];
      const leftKbcPins = kbcPins.filter((pin) => pin.side === "left");
      const rightKbcPins = kbcPins.filter((pin) => pin.side === "right");
      const renderKbcPin = (pin) => `
        <article class="spi-kbc-pin spi-kbc-pin-${escapeHtml(pin.side)}">
          <span>${escapeHtml(pin.net)}</span>
          <strong>${escapeHtml(pin.signal)}</strong>
          <small>${escapeHtml(pin.detail)}</small>
        </article>
      `;
      const kbcModeLabel = isIteChip ? "ITE" : "ENE";
      const kbcTitle = isIteChip ? "KBC/EC I2C" : "KBC/EC EDI";

      return `
        <section class="spi-card spi-pin-monitor-card spi-kbc-monitor-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Chips Monitor</p>
              <h4>${escapeHtml(kbcTitle)}</h4>
            </div>
            <div class="spi-panel-actions">
              <span class="spi-mini-badge">${escapeHtml(kbcModeLabel)}</span>
            </div>
          </div>
          <div class="spi-kbc-monitor" aria-label="KBC EC monitor">
            <div class="spi-kbc-pin-column">
              ${leftKbcPins.map(renderKbcPin).join("")}
            </div>
            <div class="spi-kbc-chip-stack">
              <div class="spi-kbc-chip" aria-hidden="true">
                <span class="spi-kbc-dot"></span>
                <strong>KBC/EC</strong>
                <span class="spi-kbc-brand-mark spi-kbc-brand-${isIteChip ? "ite" : "ene"}">${isIteChip ? "ITE" : "ene"}</span>
                <div class="spi-soic-chip-profile spi-kbc-chip-profile">
                  ${chipProfileRows.map(([label, value]) => `
                    <span>
                      <small>${escapeHtml(label)}</small>
                      <strong>${escapeHtml(value)}</strong>
                    </span>
                  `).join("")}
                </div>
              </div>
            </div>
            <div class="spi-kbc-pin-column">
              ${rightKbcPins.map(renderKbcPin).join("")}
            </div>
          </div>
          <p class="spi-kbc-wire-note">Kabel &gt;10 cm: turunkan Speed (MHz) untuk stabilitas read/write.</p>
          ${monitor.errorMessage ? `<p class="spi-note">${escapeHtml(monitor.errorMessage)}</p>` : ""}
        </section>
      `;
    };
    const renderSoicPin = (pin, side) => `
      <article class="spi-soic-pin spi-soic-pin-${side} ${escapeHtml(resolvePinMonitorTone(pin))}">
        <span class="spi-soic-pin-index">Pin${escapeHtml(String(pin.pinNumber))}</span>
        ${isContactMode ? `
          <strong>${escapeHtml(pin.contactLabel || pin.state || "CEK")}</strong>
        ` : `
          <em>${escapeHtml(pin.voltage)}</em>
        `}
      </article>
    `;

    if (isKbcChip) {
      return renderKbcMonitor();
    }

    return `
      <section class="spi-card spi-pin-monitor-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Chips Monitor</p>
              <h4>Pin 1-8</h4>
            </div>
          <div class="spi-panel-actions">
            <span class="spi-mini-badge">${escapeHtml(formatPinMonitorTimestamp(monitor.capturedAt))}</span>
            <button type="button" class="ghost" id="spiFlashPinMonitorContact"${buttonDisabled}>
              <span class="material-symbols-outlined${monitor.loading ? " is-spinning" : ""}">${monitor.loading ? "progress_activity" : "fact_check"}</span>
              <span>Detek pin</span>
            </button>
          </div>
        </div>
        <div class="spi-soic-monitor" aria-label="SOIC 8 pin monitor">
          <div class="spi-soic-side spi-soic-side-left">
            ${leftPins.map((pin) => renderSoicPin(pin, "left")).join("")}
          </div>
          <div class="spi-soic-chip" aria-hidden="true">
            <span class="spi-soic-notch"></span>
            <span class="spi-soic-dot"></span>
            <span class="spi-soic-brand-mark spi-flash-brand-${escapeHtml(biosBrandMark.key)}">${escapeHtml(biosBrandMark.label)}</span>
            <div class="spi-soic-chip-profile">
              ${chipProfileRows.map(([label, value]) => `
                <span>
                  <small>${escapeHtml(label)}</small>
                  <strong>${escapeHtml(value)}</strong>
                </span>
              `).join("")}
            </div>
          </div>
          <div class="spi-soic-side spi-soic-side-right">
            ${rightPins.map((pin) => renderSoicPin(pin, "right")).join("")}
          </div>
        </div>
        ${monitor.errorMessage ? `<p class="spi-note">${escapeHtml(monitor.errorMessage)}</p>` : ""}
      </section>
    `;
  }

  function createAutoProcessMarkup(autoProcessEnabled, autoProcessSummary, disableAttr) {
    return `
      <label class="spi-auto-toggle">
        <input id="spiFlashAutoProcess" data-field="autoProcess" type="checkbox"${autoProcessEnabled ? " checked" : ""}${disableAttr}>
        <span class="spi-auto-toggle-copy">
          <strong>Auto proses</strong>
          <small>${escapeHtml(autoProcessSummary)}</small>
        </span>
      </label>
    `;
  }

  function isEneAction(action) {
    return String(action || "").trim().toLowerCase().startsWith("ene-");
  }

  function isIteAction(action) {
    return String(action || "").trim().toLowerCase().startsWith("ite-");
  }

  function isGenericMemoryAction(action) {
    const normalizedAction = String(action || "").trim().toLowerCase();
    return normalizedAction === "read" ||
      normalizedAction === "write" ||
      normalizedAction === "verify" ||
      normalizedAction === "erase";
  }

  function isEneState(currentState) {
    const targetText = [
      currentState?.chipVendor,
      currentState?.chipModel,
      currentState?.jedec
    ].filter(Boolean).join(" ").toLowerCase();
    return String(currentState?.chipVendor || "").trim().toUpperCase() === "ENE" ||
      targetText.includes("ene") ||
      targetText.includes("kb9");
  }

  function isIteState(currentState) {
    const targetText = [
      currentState?.chipVendor,
      currentState?.chipModel,
      currentState?.jedec
    ].filter(Boolean).join(" ").toLowerCase();
    return String(currentState?.chipVendor || "").trim().toUpperCase() === "ITE" ||
      targetText.includes("ite") ||
      targetText.includes("it8");
  }

  function resolveDefaultChunkSizeBytes(currentState, action = "") {
    const normalizedAction = String(action || "").trim().toLowerCase();
    const useDetectedTargetDefault = !normalizedAction || isGenericMemoryAction(normalizedAction);
    if (isEneAction(normalizedAction) || (useDetectedTargetDefault && isEneState(currentState))) {
      return eneDefaultChunkSizeBytes;
    }

    if (isIteAction(normalizedAction) || (useDetectedTargetDefault && isIteState(currentState))) {
      return iteDefaultChunkSizeBytes;
    }

    return String(currentState?.selectedDevice || "").toUpperCase().includes("WIFI")
      ? wifiDefaultChunkSizeBytes
      : usbDefaultChunkSizeBytes;
  }

  function resolveVisibleChunkSizeBytes(currentState) {
    const chunkSizeBytes = Number(currentState?.chunkSizeBytes || 0);
    const defaultChunkSizeBytes = resolveDefaultChunkSizeBytes(currentState);
    const normalTransportDefault = String(currentState?.selectedDevice || "").toUpperCase().includes("WIFI")
      ? wifiDefaultChunkSizeBytes
      : usbDefaultChunkSizeBytes;
    if (!chunkSizeBytes) {
      return defaultChunkSizeBytes;
    }

    if ((isEneState(currentState) || isIteState(currentState)) && chunkSizeBytes === normalTransportDefault) {
      return defaultChunkSizeBytes;
    }

    return chunkSizeBytes;
  }

  function createDefaultActionPadMarkup(autoProcessEnabled, autoProcessSummary, readActionSummary, writeActionSummary, disableAttr, actionDisableAttr) {
    return `
      <div class="spi-action-surface">
        <div class="spi-action-toolbar">
          ${createAutoProcessMarkup(autoProcessEnabled, autoProcessSummary, disableAttr)}
          <div class="spi-action-utility-row">
            <button type="button" class="ghost" data-spi-action="reset"${disableAttr}>
              <span class="material-symbols-outlined">restart_alt</span>
              <span>Reset Session</span>
            </button>
            <button type="button" class="ghost" id="spiFlashEditDatabaseButton"${disableAttr}>
              <span class="material-symbols-outlined">edit_note</span>
              <span>Edit Database</span>
            </button>
          </div>
        </div>
        <div class="spi-action-command-grid is-default-actions">
          ${createActionButton("detect", "radar", "SmartID", "BIOS/EC/KBC", actionDisableAttr, "is-hero-action")}
          ${createActionButton("detect-bios", "developer_board", "Detect BIOS", "25 SPI Series", actionDisableAttr)}
          ${createActionButton("read", "download", "Read", readActionSummary, actionDisableAttr, "is-hero-action")}
          ${createActionButton("write", "upload", "Write", writeActionSummary, actionDisableAttr, "is-hero-action")}
          ${createActionButton("verify", "rule", "Verify", "Verify", actionDisableAttr)}
          ${createActionButton("erase", "ink_eraser", "Erase", "Erase", actionDisableAttr)}
        </div>
      </div>
    `;
  }

  function resolveActionTaskLabel(action, autoProcessEnabled, selectedDevice = state.selectedDevice) {
    const normalizedAction = String(action || "").trim().toLowerCase();
    if (normalizedAction === "detect") {
      return "SmartID";
    }

    if (normalizedAction === "detect-bios") {
      return "Detect BIOS";
    }

    if (normalizedAction === "read") {
      return !autoProcessEnabled ? "Read" : "Read+Verify";
    }

    if (normalizedAction === "write" || normalizedAction === "auto") {
      return autoProcessEnabled ? "Erase+Write+Verify" : "Write";
    }

    if (normalizedAction === "erase") {
      return "Erase";
    }

    if (normalizedAction === "verify") {
      return "Verify";
    }

    if (normalizedAction.startsWith("ene-")) {
      const suffix = normalizedAction.slice(4);
      if (suffix === "detect") {
        return "Detect ENE";
      }
      if (suffix === "read") {
        return autoProcessEnabled ? "ENE Read+Verify" : "ENE Read";
      }
      if (suffix === "write") {
        return autoProcessEnabled ? "ENE Erase+Write+Verify" : "ENE Write";
      }
      if (suffix === "erase") {
        return "ENE Erase";
      }
      if (suffix === "verify") {
        return "ENE Verify";
      }
    }

    if (normalizedAction.startsWith("ite-")) {
      const suffix = normalizedAction.slice(4);
      if (suffix === "detect") {
        return "Detect ITE";
      }
      if (suffix === "read") {
        return autoProcessEnabled ? "ITE Read+Verify" : "ITE Read";
      }
      if (suffix === "write") {
        return autoProcessEnabled ? "ITE Erase+Write+Verify" : "ITE Write";
      }
      if (suffix === "erase") {
        return "ITE Erase";
      }
      if (suffix === "verify") {
        return "ITE Verify";
      }
    }

    return normalizedAction ? normalizedAction : "SPI Flash";
  }

  function createFlashOscActionPadMarkup(state, autoProcessEnabled, autoProcessSummary, readActionSummary, writeActionSummary, disableAttr, actionDisableAttr) {
    const targetText = [
      state.chipVendor,
      state.chipModel,
      state.jedec
    ].filter(Boolean).join(" ").toLowerCase();
    const isEneTarget = String(state.chipVendor || "").trim().toUpperCase() === "ENE" ||
      targetText.includes("ene") ||
      targetText.includes("kb9");
    const isIteTarget = String(state.chipVendor || "").trim().toUpperCase() === "ITE" ||
      targetText.includes("ite") ||
      targetText.includes("it8");
    const targetLabel = isEneTarget ? "ENE" : isIteTarget ? "ITE" : "SPI";
    const readAction = isEneTarget ? "ene-read" : isIteTarget ? "ite-read" : "read";
    const writeAction = isEneTarget ? "ene-write" : isIteTarget ? "ite-write" : "write";
    const verifyAction = isEneTarget ? "ene-verify" : isIteTarget ? "ite-verify" : "verify";
    const eraseAction = isEneTarget ? "ene-erase" : isIteTarget ? "ite-erase" : "erase";

    return `
      <div class="spi-action-surface">
        <div class="spi-action-toolbar">
          ${createAutoProcessMarkup(autoProcessEnabled, autoProcessSummary, disableAttr)}
          <div class="spi-action-utility-row">
            <button type="button" class="ghost" data-spi-action="reset"${disableAttr}>
              <span class="material-symbols-outlined">restart_alt</span>
              <span>Reset Session</span>
            </button>
            <button type="button" class="ghost" id="spiFlashEditDatabaseButton"${disableAttr}>
              <span class="material-symbols-outlined">edit_note</span>
              <span>Edit Database</span>
            </button>
          </div>
        </div>
        <div class="spi-action-command-grid is-kbc-actions">
          ${createActionButton("detect", "radar", "SmartID", "BIOS/EC/KBC", actionDisableAttr, "is-hero-action")}
          ${createActionButton("detect-bios", "developer_board", "Detect BIOS", "25 SPI Series", actionDisableAttr)}
          ${createActionButton(readAction, "download", "Read", `${targetLabel} ${readActionSummary}`, actionDisableAttr, "is-hero-action")}
          ${createActionButton(writeAction, "upload", "Write", `${targetLabel} ${writeActionSummary}`, actionDisableAttr, "is-hero-action")}
          ${createActionButton(verifyAction, "rule", "Verify", `${targetLabel} compare`, actionDisableAttr)}
          ${createActionButton(eraseAction, "ink_eraser", "Erase", `${targetLabel} erase`, actionDisableAttr)}
          ${createActionButton("ene-detect", "memory", "Detect ENE", "KBC/EC", actionDisableAttr)}
          ${createActionButton("ite-detect", "memory", "Detect ITE", "KBC/EC", actionDisableAttr)}
        </div>
      </div>
    `;
  }

  function getDevicePickerState(state, busy, deviceBusy, isDeviceConnected, deviceConnectionState = null) {
    const connectionText = String(state.connectionState || "").trim();
    if (!state.selectedDevice) {
      return {
        status: "idle",
        icon: "usb",
        title: "Pilih koneksi USB atau WIFI."
      };
    }

    if (
      deviceConnectionState &&
      deviceConnectionState.deviceType === state.selectedDevice &&
      deviceConnectionState.status
    ) {
      const overrideStatus = String(deviceConnectionState.status || "").trim();
      const overrideMessage = String(deviceConnectionState.message || "").trim();
      return {
        status: overrideStatus,
        icon: overrideStatus === "checking"
          ? "sync"
          : overrideStatus === "failed"
            ? "error"
            : state.profile?.transport === "WIFI" ? "wifi" : "usb",
        title: overrideMessage || connectionText || "Status device."
      };
    }

    if (isDeviceConnected) {
      return {
        status: "connected",
        icon: state.profile?.transport === "WIFI" ? "wifi" : "usb",
        title: connectionText || "Device terhubung."
      };
    }

    return {
      status: "idle",
      icon: state.profile?.transport === "WIFI" ? "wifi" : "usb",
      title: "Pilih koneksi USB atau WIFI."
    };
  }

  function createWorkbenchMarkup(state, busy, deviceBusy, hexView, deviceConnectionState = null) {
    const autoProcessEnabled = state.autoProcess !== false;
    const normalizedConnectionState = String(state.connectionState || "").trim().toLowerCase();
    const isDeviceConnected =
      Boolean(state.selectedDevice) &&
      !normalizedConnectionState.includes("belum terhubung") &&
      (normalizedConnectionState.includes("terhubung") || normalizedConnectionState.includes("aktif"));
    const profile = state.selectedDevice
      ? (state.profile || deviceProfiles[defaultDeviceType])
      : {
          transport: "-",
          speed: "-",
          note: "Pilih device programmer terlebih dahulu untuk mulai koneksi."
        };
    const progressWidth = Math.max(0, Math.min(100, Number(state.progress) || 0));
    const controlsDisabled = !state.serviceAvailable || busy || deviceBusy;
    const disableAttr = controlsDisabled ? " disabled" : "";
    const actionDisableAttr = controlsDisabled || !state.selectedDevice ? " disabled" : "";
    const fileNameLabel = state.fileName || "Belum ada file";
    const showFlashOscSpeedField = isTeknisiHubFlasherDevice(state.selectedDevice);
    const showEzpSpeedField = false;
    const showFixedSpeedField = false;
    const fixedSpeedLabel = "0.75 MHz";
    const visibleSpeedHz = state.speedHz || spiDefaultSpeedHz;
    const speedInputValue = formatSpeedInputValue(visibleSpeedHz);
    const chunkInputValue = formatChunkInputValue(resolveVisibleChunkSizeBytes(state));
    const hexPreviewStatusState = getHexPreviewStatusState(state, busy);
    const ezpReadUsesSinglePass = false;
    const readActionSummary = ezpReadUsesSinglePass
      ? "Read"
      : autoProcessEnabled ? "Read + Verify" : "Read";
    const writeActionSummary = autoProcessEnabled ? "Erase + Write + Verify" : "Write";
    const autoProcessSummary = autoProcessEnabled
      ? ezpReadUsesSinglePass
        ? "Aktif: Read=Read, Write=Erase+Write+Verify"
        : "Aktif: Read=Read+Verify, Write=Erase+Write+Verify"
      : "Nonaktif: Read=Read, Write=Write";
    const selectedDriver = normalizeDriverInfo(state.selectedDeviceDriver, state.selectedDevice);
    const driverInstallLabel = selectedDriver.installLabel || "Install driver";
    const showDriverPanel = Boolean(state.selectedDevice) && Boolean(state.driverInfoLoaded) && !selectedDriver.isPresent;
    const availableDevices = getEnabledDeviceEntries();
    const selectedDeviceLabel = resolveSelectedDeviceLabel(state.selectedDevice);
    const actionPadMarkup = isTeknisiHubFlasherDevice(state.selectedDevice)
      ? createFlashOscActionPadMarkup(state, autoProcessEnabled, autoProcessSummary, readActionSummary, writeActionSummary, disableAttr, actionDisableAttr)
      : createDefaultActionPadMarkup(autoProcessEnabled, autoProcessSummary, readActionSummary, writeActionSummary, disableAttr, actionDisableAttr);
    const devicePickerState = getDevicePickerState(state, busy, deviceBusy, isDeviceConnected, deviceConnectionState);
    const firmwareTitle = state.firmwareVersion
      ? `Firmware v${state.firmwareVersion}`
      : isDeviceConnected ? "Firmware belum terbaca" : "Firmware belum terhubung";

    return `
      <div class="spi-workbench-shell spi-scope-theme scoppy-scope${busy ? " is-busy" : ""}">
      ${busy ? `
        <div class="spi-busy-overlay" id="spiBusyOverlay" aria-hidden="true"></div>
      ` : ""}
      <section class="spi-scope-panel">
        <div class="spi-scope-topbar">
          <div class="spi-scope-title-block">
            <p>${escapeHtml(state.selectedDevice ? selectedDeviceLabel : "TEKNISIHUB_FLASH_OSC")}</p>
            <small>${escapeHtml(firmwareTitle)}</small>
          </div>
          <label
            class="spi-scope-device-picker is-${escapeHtml(devicePickerState.status)}"
            data-connection-state="${escapeHtml(devicePickerState.status)}"
            title="${escapeHtml(devicePickerState.title)}">
            <span class="material-symbols-outlined${devicePickerState.status === "checking" ? " is-spinning" : ""}">${escapeHtml(devicePickerState.icon)}</span>
            <select id="spiFlashDeviceSelect" aria-label="Pilih koneksi device"${controlsDisabled ? " disabled" : ""}>
              <option value=""${state.selectedDevice ? "" : " selected"}>${escapeHtml(connectionPlaceholderLabel)}</option>
              ${availableDevices.map(([key, item]) => `
                <option value="${escapeHtml(key)}"${key === state.selectedDevice ? " selected" : ""}>${escapeHtml(`${item.label} ${item.transport}`)}</option>
              `).join("")}
            </select>
            <span class="spi-scope-device-indicator" aria-hidden="true"></span>
          </label>
        </div>
      </section>
      ${state.errorMessage ? `
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Status Service</p>
              <h4>Koneksi aplikasi bermasalah</h4>
            </div>
          </div>
          <p class="spi-note">${escapeHtml(state.errorMessage)}</p>
        </section>
      ` : ""}

      <div class="spi-layout">
        ${showDriverPanel ? `
          <section class="spi-card">
            <div class="spi-card-head">
              <div>
                <p class="label">Driver</p>
                <h4>Driver belum siap</h4>
              </div>
            </div>
            <p class="spi-driver-link-row">
              <a href="#" class="spi-driver-link" data-spi-install-driver="1">${escapeHtml(driverInstallLabel)}</a>
            </p>
          </section>
        ` : ""}

        ${isFlashOscDevice(state.selectedDevice) ? createPinMonitorMarkup(state, disableAttr) : ""}

        <section class="spi-card spi-operation-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Action Pad</p>
              <h4>${isTeknisiHubFlasherDevice(state.selectedDevice) ? "Flow SPI + KBC/EC" : "Flow operasi"}</h4>
            </div>
          </div>
          <div class="spi-operation-grid">
            <div class="spi-operation-region">
              <div class="spi-form-grid spi-operation-form-grid${state.selectedDevice ? " has-chunk-field" : ""}">
                <label class="spi-field-start">
                  Start Address
                  <input data-field="startAddress" type="text" value="${escapeHtml(state.startAddress)}" placeholder="0x000000"${disableAttr}>
                </label>
                <label class="spi-field-length">
                  Length
                  <input data-field="length" type="text" value="${escapeHtml(state.length)}" placeholder="0x00800000"${disableAttr}>
                </label>
                <label class="spi-file-field">
                  <span>Source File</span>
                  <span class="spi-file-picker-control">
                    <span class="spi-file-picker-button">Pilih File</span>
                    <span
                      id="spiFlashSelectedFileName"
                      class="spi-file-selected-name${state.fileName ? " has-file" : ""}"
                      title="${escapeHtml(fileNameLabel)}"
                    >${escapeHtml(fileNameLabel)}</span>
                    <input
                      id="spiFlashFileInput"
                      class="spi-file-input"
                      type="file"
                      accept=".bin,.rom,.cap,.img,.fd,.bio,.wph,.efi,.hdr"
                      aria-describedby="spiFlashSelectedFileName"
                      ${disableAttr}
                    >
                  </span>
                </label>
                ${showFlashOscSpeedField ? `
                  <label class="spi-field-speed">
                    Speed (MHz)
                    <input data-field="speedHz" data-field-format="mhz" type="text" value="${escapeHtml(speedInputValue)}" placeholder="20"${disableAttr}>
                  </label>
                ` : showEzpSpeedField ? `
                  <label class="spi-field-speed">
                    Speed
                    <select data-field="speedHz"${disableAttr}>
                      <option value="12000000"${Number(state.speedHz || 12000000) === 12000000 ? " selected" : ""}>12 MHz</option>
                      <option value="6000000"${Number(state.speedHz || 12000000) === 6000000 ? " selected" : ""}>6 MHz</option>
                      <option value="3000000"${Number(state.speedHz || 12000000) === 3000000 ? " selected" : ""}>3 MHz</option>
                    </select>
                  </label>
                ` : showFixedSpeedField ? `
                  <label class="spi-field-speed">
                    Speed
                    <input type="text" value="${escapeHtml(fixedSpeedLabel)}" readonly${disableAttr}>
                  </label>
                ` : ""}
                ${state.selectedDevice ? `
                  <label class="spi-field-chunk">
                    Chunk (KB)
                    <input data-field="chunkSizeBytes" data-field-format="kb" type="text" value="${escapeHtml(chunkInputValue)}" placeholder="4"${disableAttr}>
                  </label>
                ` : ""}
              </div>
            </div>
            <div class="spi-operation-actions">
              ${actionPadMarkup}
            </div>
          </div>
        </section>
      </div>

      <div class="spi-bottom-grid">
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Hex Preview</p>
              <h4 class="spi-status-title${hexPreviewStatusState.loading ? " is-loading" : ""}${hexPreviewStatusState.toneClass || ""}">${hexPreviewStatusState.headingMarkup}</h4>
            </div>
            <div class="spi-panel-actions">
              <span class="spi-mini-badge">${escapeHtml(`${formatInteger(state.hexPreviewTotalBytes)} byte`)}</span>
              <span class="spi-mini-badge">${escapeHtml(`${formatInteger(state.hexPreviewTotalLines)} baris`)}</span>
              <span class="spi-mini-badge">${escapeHtml(fileNameLabel)}</span>
              ${state.hasReadBuffer ? `
                <button type="button" class="ghost" id="spiFlashSaveBinButton"${disableAttr}>
                  <span class="material-symbols-outlined">save</span>
                  <span>Save as BIN</span>
                </button>
              ` : ""}
            </div>
          </div>
          ${createHexPreviewMarkup(state, hexView)}
        </section>

      </div>
      </div>
    `;
  }

  function getEnabledDeviceEntries() {
    return Object.entries(deviceProfiles).filter(([key]) => !disabledDeviceSelections.has(key));
  }

  function resolveSelectedDeviceLabel(selectedDevice) {
    if (!selectedDevice || !deviceProfiles[selectedDevice]) {
      return "---Pilih Device Programmer---";
    }

    return deviceProfiles[selectedDevice].label;
  }

  function createApi() {
    let state = createUnavailableState();
    let mountedContainer = null;
    let reportTask = () => {};
    let busy = false;
    let deviceBusy = false;
    let busyRunToken = 0;
    let deviceSelectionToken = 0;
    let deviceConnectionState = null;
    let activeTaskOperationLabel = "";
    let activeTaskOperationId = "";
    let activeTaskInitialSignature = "";
    let speedHzUserOverride = false;
    let chunkSizeUserOverride = false;
    let sessionPollTimer = null;
    let sessionPollInFlight = false;
    let sessionRefreshSequence = 0;
    let taskHistoryClearedAtMs = 0;
    let hexViewRequestToken = 0;
    let hexView = {
      requestKey: "",
      totalBytes: 0,
      totalLines: 0,
      lineStart: 0,
      lineCount: 0,
      lines: [],
      loading: false
    };

    function getHexViewRequestKey(nextState) {
      return [
        nextState.fileName || "",
        nextState.lastUpdated || "",
        nextState.activeOperation || "",
        Number(nextState.hexPreviewTotalBytes || 0),
        Number(nextState.hexPreviewTotalLines || 0)
      ].join("|");
    }

    function syncHexViewFromState(options = {}) {
      const { resetScroll = false } = options;
      const nextRequestKey = getHexViewRequestKey(state);
      const dataChanged = nextRequestKey !== hexView.requestKey;
      const nextLines = Array.isArray(state.hexPreview) ? [...state.hexPreview] : [];

      if (dataChanged) {
        hexView = {
          requestKey: nextRequestKey,
          totalBytes: Number(state.hexPreviewTotalBytes || 0),
          totalLines: Number(state.hexPreviewTotalLines || 0),
          lineStart: 0,
          lineCount: nextLines.length,
          lines: nextLines,
          loading: false
        };
      } else {
        hexView.totalBytes = Number(state.hexPreviewTotalBytes || 0);
        hexView.totalLines = Number(state.hexPreviewTotalLines || 0);
        if (hexView.lines.length === 0 && nextLines.length > 0) {
          hexView.lineStart = 0;
          hexView.lineCount = nextLines.length;
          hexView.lines = nextLines;
        }
      }

      if (resetScroll || !hexView.totalLines) {
        state.hexPreviewScrollTop = 0;
      }
    }

    function applySessionState(session, options = {}) {
      const previousSpeedHz = Number(state.speedHz || 0);
      const previousChunkSizeBytes = Number(state.chunkSizeBytes || 0);
      state = mapServiceSessionToState(session, state, options);
      if (speedHzUserOverride) {
        state.speedHz = previousSpeedHz;
      }
      if (chunkSizeUserOverride) {
        state.chunkSizeBytes = previousChunkSizeBytes;
      }
      syncHexViewFromState(options);
    }

    function updateHexPreviewDom() {
      if (!mountedContainer) {
        return;
      }

      const virtualLineHeight = getHexVirtualLineHeight(state.hexPreviewTotalLines);
      const spacer = mountedContainer.querySelector("#spiHexPreviewSpacer");
      const canvas = mountedContainer.querySelector("#spiHexPreviewCanvas");
      const content = mountedContainer.querySelector("#spiHexPreviewContent");
      const loading = mountedContainer.querySelector("#spiHexPreviewLoading");

      if (spacer) {
        spacer.style.height = `${Math.max(0, Number(state.hexPreviewTotalLines || 0) * virtualLineHeight)}px`;
      }

      if (canvas) {
        canvas.style.transform = `translateY(${Math.max(0, Number(hexView.lineStart || 0) * virtualLineHeight)}px)`;
      }

      if (content) {
        content.innerHTML = createHexPreviewRowsMarkup(hexView.lines || []);
      }

      if (loading) {
        loading.classList.toggle("is-visible", Boolean(hexView.loading));
      }
    }

    async function loadHexPreviewRange(lineStart, lineCount) {
      if (!state.serviceAvailable || !state.hexPreviewTotalLines) {
        return;
      }

      const requestKey = hexView.requestKey;
      const requestToken = ++hexViewRequestToken;
      hexView.loading = true;
      updateHexPreviewDom();

      try {
        const payload = await fetchJson(`/spi-flash/hex-view?lineStart=${lineStart}&lineCount=${lineCount}`);
        if (requestToken !== hexViewRequestToken || requestKey !== hexView.requestKey) {
          return;
        }

        hexView.totalBytes = Number(payload.totalBytes || 0);
        hexView.totalLines = Number(payload.totalLines || 0);
        hexView.lineStart = Number(payload.lineStart || 0);
        hexView.lineCount = Number(payload.lineCount || 0);
        hexView.lines = Array.isArray(payload.lines) ? payload.lines : [];
      } finally {
        if (requestToken === hexViewRequestToken) {
          hexView.loading = false;
          updateHexPreviewDom();
        }
      }
    }

    async function syncHexPreviewViewport(force = false) {
      const viewport = mountedContainer?.querySelector("#spiHexPreviewViewport");
      if (!viewport || !state.hexPreviewTotalLines) {
        return;
      }

      const head = mountedContainer.querySelector("#spiHexPreviewHead");
      const headHeight = head ? head.offsetHeight : 0;
      const virtualLineHeight = getHexVirtualLineHeight(state.hexPreviewTotalLines);
      const contentScrollTop = Math.max(0, viewport.scrollTop - headHeight);
      const viewportHeight = Math.max(1, viewport.clientHeight - headHeight);
      const visibleLines = Math.max(1, Math.ceil(viewportHeight / virtualLineHeight));
      const requestedLineCount = Math.max(
        hexPreviewMinimumRequestLines,
        visibleLines + (hexPreviewOverscanLines * 2)
      );
      const unclampedLineStart = Math.max(0, Math.floor(contentScrollTop / virtualLineHeight) - hexPreviewOverscanLines);
      const lineStart = Math.min(
        unclampedLineStart,
        Math.max(0, Number(state.hexPreviewTotalLines || 0) - requestedLineCount)
      );
      const currentRangeEnd = Number(hexView.lineStart || 0) + Number(hexView.lineCount || 0);
      const requestedRangeEnd = lineStart + requestedLineCount;
      const alreadyCovered =
        !force &&
        hexView.lines.length > 0 &&
        lineStart >= Number(hexView.lineStart || 0) &&
        requestedRangeEnd <= currentRangeEnd;

      state.hexPreviewScrollTop = viewport.scrollTop;

      if (alreadyCovered) {
        updateHexPreviewDom();
        return;
      }

      await loadHexPreviewRange(lineStart, requestedLineCount);
    }

    function resolveActionSpeedHz(action) {
      const speedHz = Number(state.speedHz || 0);
      const normalizedAction = String(action || "").trim().toLowerCase();
      if (normalizedAction === "detect-bios") {
        return speedHzUserOverride ? speedHz : spiDefaultSpeedHz;
      }

      if (isEneAction(action) || (isEneState(state) && isGenericMemoryAction(action))) {
        if (speedHzUserOverride) {
          return speedHz;
        }
        return eneDefaultSpeedHz;
      }

      return speedHz || spiDefaultSpeedHz;
    }

    function resolveActionChunkSizeBytes(action) {
      const normalizedAction = String(action || "").trim().toLowerCase();
      const chunkSizeBytes = Number(state.chunkSizeBytes || 0);
      const defaultChunkSizeBytes = resolveDefaultChunkSizeBytes(state, action);
      const normalTransportDefault = String(state.selectedDevice || "").toUpperCase().includes("WIFI")
        ? wifiDefaultChunkSizeBytes
        : usbDefaultChunkSizeBytes;
      if (normalizedAction === "detect-bios") {
        return chunkSizeUserOverride && chunkSizeBytes ? chunkSizeBytes : normalTransportDefault;
      }

      if (!chunkSizeBytes) {
        return defaultChunkSizeBytes;
      }

      if (chunkSizeUserOverride) {
        return chunkSizeBytes;
      }

      if ((isEneAction(action) || isIteAction(action) || (isEneState(state) && isGenericMemoryAction(action)) || (isIteState(state) && isGenericMemoryAction(action))) && chunkSizeBytes === normalTransportDefault) {
        return defaultChunkSizeBytes;
      }

      return chunkSizeBytes;
    }

    function collectActionPayload(action = "") {
      return {
        chipVendor: state.chipVendor,
        chipModel: state.chipModel,
        chipCapacity: state.chipCapacity,
        autoProcess: state.autoProcess !== false,
        pageSize: Number(state.pageSize || 256),
        speedHz: resolveActionSpeedHz(action),
        chunkSizeBytes: resolveActionChunkSizeBytes(action),
        startAddress: state.startAddress,
        length: state.length
      };
    }

    async function fetchDriverInfo(deviceType) {
      if (!deviceType || !state.serviceAvailable) {
        return;
      }

      const driverInfo = await fetchJson(`/spi-flash/drivers/${encodeURIComponent(deviceType)}`);
      if (state.selectedDevice !== deviceType) {
        return;
      }

      state.selectedDeviceDriver = normalizeDriverInfo(driverInfo, deviceType);
      state.driverInfoLoaded = true;
    }

    async function refreshPinMonitor(options = {}) {
      if (!state.serviceAvailable || !isFlashOscDevice(state.selectedDevice)) {
        return;
      }

      const vccOffScan = Boolean(options.vccOffScan);
      state.pinMonitor = {
        ...(state.pinMonitor || createDefaultPinMonitorState()),
        loading: true,
        mode: "voltage",
        errorMessage: ""
      };
      render();

      try {
        const payload = await fetchJson(`/spi-flash/pin-monitor${vccOffScan ? "?vccOffScan=true" : ""}`);
        state.pinMonitor = {
          loading: false,
          errorMessage: "",
          mode: "voltage",
          message: payload.message || (vccOffScan ? "Pin SOIC 1-8 terbaca saat VCC off." : "Pin SOIC 1-8 terbaca."),
          capturedAt: payload.capturedAt || new Date().toISOString(),
          pins: Array.isArray(payload.pins) ? payload.pins : []
        };
      } catch (error) {
        state.pinMonitor = {
          ...(state.pinMonitor || createDefaultPinMonitorState()),
          loading: false,
          mode: "voltage",
          errorMessage: error?.message || "Gagal membaca monitor pin.",
          message: ""
        };
        notifyUser(state.pinMonitor.errorMessage, "warning");
      }

      render();
    }

    async function refreshPinContact() {
      if (!state.serviceAvailable || !isFlashOscDevice(state.selectedDevice)) {
        return;
      }

      state.pinMonitor = {
        ...(state.pinMonitor || createDefaultPinMonitorState()),
        loading: true,
        mode: "contact",
        errorMessage: "",
        message: "Mengecek detek pin SOIC..."
      };
      render();

      try {
        const functionalPayload = await fetchJson("/spi-flash/pin-functional");
        const pins = createFunctionalOnlyPins(functionalPayload);

        state.pinMonitor = {
          loading: false,
          errorMessage: "",
          mode: "contact",
          message: functionalPayload.message || "",
          capturedAt: functionalPayload.capturedAt || new Date().toISOString(),
          pins
        };
      } catch (error) {
        state.pinMonitor = {
          ...(state.pinMonitor || createDefaultPinMonitorState()),
          loading: false,
          mode: "contact",
          errorMessage: error?.message || "Gagal detek pin SOIC.",
          message: ""
        };
        notifyUser(state.pinMonitor.errorMessage, "warning");
      }

      render();
    }

    async function runAction(action) {
      if (action === "reset") {
        return fetchJson("/spi-flash/reset", {
          method: "POST",
          body: JSON.stringify({})
        });
      }

      return fetchJson(`/spi-flash/actions/${encodeURIComponent(action)}`, {
        method: "POST",
        body: JSON.stringify(collectActionPayload(action))
      });
    }

    async function saveReadBufferToBin(options = {}) {
      const {
        showSuccessToast = true,
        suppressEmptyWarning = false,
        preferBrowserDownload = false
      } = options;

      if (!state.hasReadBuffer) {
        notifyUser("Belum ada hasil read SPI Flash yang bisa disimpan.", "info");
        return false;
      }

      if (state.readBufferIsAllFf && !suppressEmptyWarning) {
        notifyUser("Chip empty, isi buffer masih FF semua.", "warning");
        return false;
      }

      const response = await fetch(`${serviceBaseUrl}/spi-flash/read-buffer-bin`);
      if (!response.ok) {
        throw new Error(`Gagal menyiapkan file BIN (${response.status}).`);
      }

      const blob = await response.blob();
      const resolvedFileName = resolveDownloadFileName(
        response.headers.get("Content-Disposition"),
        state.fileName || "SPIFlash_TeknisiHub.bin"
      );
      const savedDirectly = preferBrowserDownload
        ? false
        : await saveBlobToDisk(blob, resolvedFileName);

      if (savedDirectly) {
        if (showSuccessToast) {
          notifyUser("File BIN selesai disimpan.");
        }

        return true;
      }

      const objectUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = resolvedFileName;
      downloadLink.rel = "noopener";
      downloadLink.style.display = "none";
      document.body.append(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      return true;
    }

    async function refreshSessionSilently(options = {}) {
      const force = options.force === true;
      if ((sessionPollInFlight && !force) || !state.serviceAvailable) {
        return;
      }

      const refreshToken = ++sessionRefreshSequence;
      sessionPollInFlight = true;
      try {
        const session = await fetchJson("/spi-flash/session");
        if (refreshToken !== sessionRefreshSequence) {
          return;
        }

        applySessionState(session);
        render();
      } catch {
        // Ignore polling hiccups while the main action request is still running.
      } finally {
        if (refreshToken === sessionRefreshSequence) {
          sessionPollInFlight = false;
        }
      }
    }

    function startSessionPolling() {
      stopSessionPolling();
      sessionPollTimer = setInterval(() => {
        void refreshSessionSilently();
      }, 250);
    }

    function stopSessionPolling() {
      if (sessionPollTimer) {
        clearInterval(sessionPollTimer);
        sessionPollTimer = null;
      }
    }

    async function selectDevice(nextDevice) {
      return fetchJson("/spi-flash/device", {
        method: "POST",
        body: JSON.stringify({ deviceType: nextDevice })
      });
    }

    async function handleDeviceSelection(nextDevice) {
      if (busy || deviceBusy || !state.serviceAvailable) {
        return;
      }

      const selectionToken = ++deviceSelectionToken;
      const normalizedDevice = String(nextDevice || "").trim();

      if (!normalizedDevice) {
        state.selectedDevice = "";
        state.profile = deviceProfiles[defaultDeviceType];
        state.connectionState = "Belum ada device dipilih";
        state.selectedDeviceDriver = normalizeDriverInfo(null, "");
        state.driverInfoLoaded = false;
        deviceConnectionState = null;
        render();
        return;
      }

      if (!deviceProfiles[normalizedDevice]) {
        return;
      }

      if (disabledDeviceSelections.has(normalizedDevice)) {
        notifyUser("Device ini sedang dinonaktifkan dan tidak bisa dipilih.", "warning");
        render();
        return;
      }

      state.errorMessage = "";
      state.selectedDevice = normalizedDevice;
      state.profile = deviceProfiles[normalizedDevice] || deviceProfiles[defaultDeviceType];
      state.connectionState = `${state.profile.transport} dicek`;
      state.selectedDeviceDriver = normalizeDriverInfo(null, normalizedDevice);
      state.driverInfoLoaded = false;
      state.pinMonitor = createDefaultPinMonitorState();
      deviceConnectionState = {
        deviceType: normalizedDevice,
        status: "checking",
        message: `Mengecek ${state.profile.transport}...`
      };
      render();

      try {
        const session = await selectDevice(normalizedDevice);
        if (selectionToken !== deviceSelectionToken || state.selectedDevice !== normalizedDevice) {
          return;
        }

        applySessionState(session, { resetScroll: true });
        state.selectedDeviceDriver = normalizeDriverInfo(null, normalizedDevice);
        state.driverInfoLoaded = false;
        render();

        const connectedSession = await runAction("connect");
        if (selectionToken !== deviceSelectionToken || state.selectedDevice !== normalizedDevice) {
          return;
        }

        applySessionState(connectedSession);
        deviceConnectionState = {
          deviceType: normalizedDevice,
          status: "connected",
          message: sanitizePublicMessage(connectedSession.connectionState || `${state.profile?.transport || "Device"} terhubung.`)
        };
        render();

        void fetchDriverInfo(normalizedDevice)
          .then(() => {
            if (selectionToken === deviceSelectionToken && state.selectedDevice === normalizedDevice) {
              render();
            }
          })
          .catch(() => {
            // Driver info is helpful, but selecting the device must stay responsive without it.
          });
      } catch (error) {
        if (selectionToken !== deviceSelectionToken || state.selectedDevice !== normalizedDevice) {
          return;
        }

        state.errorMessage = sanitizePublicMessage(error?.message || "Gagal memilih device SPI Flash.");
        deviceConnectionState = {
          deviceType: normalizedDevice,
          status: "failed",
          message: state.errorMessage
        };
        notifyUser(state.errorMessage, "warning");
        render();
      }
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      const renderState = busy && activeTaskOperationLabel
        ? { ...state, activeOperation: activeTaskOperationLabel }
        : state;

      reportActionProgressTasks(
        renderState,
        busy,
        deviceBusy,
        Math.max(0, Math.min(100, Number(renderState.progress) || 0)),
        reportTask,
        activeTaskOperationLabel,
        activeTaskOperationId,
        taskHistoryClearedAtMs
      );
      mountedContainer.innerHTML = createWorkbenchMarkup(renderState, busy, deviceBusy, hexView, deviceConnectionState);

      const busyOverlay = mountedContainer.querySelector("#spiBusyOverlay");
      if (busyOverlay) {
        busyOverlay.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          notifyUser("Progress masih berjalan. Tunggu sampai proses selesai, lalu lanjutkan aksi berikutnya.", "info");
        });
      }

      const deviceSelect = mountedContainer.querySelector("#spiFlashDeviceSelect");
      if (deviceSelect) {
        deviceSelect.addEventListener("change", () => {
          const nextDevice = deviceSelect.value || "";
          if (nextDevice === state.selectedDevice) {
            return;
          }

          void handleDeviceSelection(nextDevice);
        });
      }

      mountedContainer.querySelectorAll("[data-field]").forEach((input) => {
        const handleFieldChange = () => {
          const field = input.getAttribute("data-field");
          if (!field) {
            return;
          }

          if (input.type === "checkbox") {
            state[field] = Boolean(input.checked);
            render();
            return;
          }

          if (field === "pageSize") {
            state[field] = Number(input.value || 0);
            return;
          }

          if (field === "speedHz" && input.getAttribute("data-field-format") === "mhz") {
            state[field] = parseSpeedInputValue(input.value);
            speedHzUserOverride = true;
            return;
          }

          if (field === "chunkSizeBytes" && input.getAttribute("data-field-format") === "kb") {
            state[field] = parseChunkInputValue(input.value);
            chunkSizeUserOverride = true;
            return;
          }

          if (field === "speedHz") {
            state[field] = Number(input.value || 0);
            speedHzUserOverride = true;
            return;
          }

          state[field] = input.value;
        };

        input.addEventListener("input", handleFieldChange);
        input.addEventListener("change", handleFieldChange);
      });

      const fileInput = mountedContainer.querySelector("#spiFlashFileInput");
      if (fileInput) {
        fileInput.addEventListener("change", () => withBusy(async () => {
          const selectedFile = fileInput.files?.[0];
          if (!selectedFile || !state.serviceAvailable) {
            return;
          }

          const formData = new FormData();
          formData.set("file", selectedFile);

          const session = await fetchJson("/spi-flash/source-file", {
            method: "POST",
            body: formData
          });

          applySessionState(session, { resetScroll: true });
          render();
        }));
      }

      mountedContainer.querySelectorAll("[data-spi-action]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.getAttribute("data-spi-action");
          if (!action || !state.serviceAvailable) {
            return;
          }

          if ((action === "read" || action === "erase" || action === "write" || action === "verify") && !state.jedec) {
            notifyUser("Chip belum detect, jalankan Detect JEDEC dulu.", "warning");
            return;
          }

          const manualMonitorTarget = resolveMonitorTargetFromAction(action);
          if (manualMonitorTarget) {
            state.monitorTarget = manualMonitorTarget;
            render();
          }

          void withBusy(async () => {
            if (action === "reset") {
              speedHzUserOverride = false;
              chunkSizeUserOverride = false;
              state.monitorTarget = "";
            }

            const session = await runAction(action);
            applySessionState(session, { resetScroll: true });
            if (action === "detect") {
              const detectedMonitorTarget = resolveMonitorTargetFromDetectedFields(session);
              if (detectedMonitorTarget) {
                state.monitorTarget = detectedMonitorTarget;
              }
            }
            render();

            const isReadAction = action === "read" || action === "ene-read" || action === "ite-read";
            if (isReadAction && state.readBufferIsAllFf) {
              notifyUser("Chip kosong, isi buffer masih FF semua.", "warning");
            }

            if (isReadAction && state.autoProcess !== false && state.hasReadBuffer) {
              try {
                await saveReadBufferToBin({
                  showSuccessToast: false,
                  suppressEmptyWarning: true,
                  preferBrowserDownload: true
                });
              } catch (error) {
                if (error?.name !== "AbortError") {
                  notifyUser(error?.message || "Gagal menyiapkan file BIN.", "warning");
                }
              }
            }
          }, {
            activeOperation: resolveActionTaskLabel(action, state.autoProcess !== false, state.selectedDevice)
          });
        });
      });

      const editDatabaseButton = mountedContainer.querySelector("#spiFlashEditDatabaseButton");
      if (editDatabaseButton) {
        editDatabaseButton.addEventListener("click", () => {
          openDatabaseEditor();
        });
      }

      const saveBinButton = mountedContainer.querySelector("#spiFlashSaveBinButton");
      if (saveBinButton) {
        saveBinButton.addEventListener("click", async () => {
          try {
            await saveReadBufferToBin({
              showSuccessToast: true,
              suppressEmptyWarning: false
            });
          } catch (error) {
            if (error?.name === "AbortError") {
              return;
            }
            notifyUser(error?.message || "Gagal menyiapkan file BIN.", "warning");
          }
        });
      }

      const pinMonitorButton = mountedContainer.querySelector("#spiFlashPinMonitorRefresh");
      if (pinMonitorButton) {
        pinMonitorButton.addEventListener("click", () => {
          void refreshPinMonitor();
        });
      }

      const pinMonitorContactButton = mountedContainer.querySelector("#spiFlashPinMonitorContact");
      if (pinMonitorContactButton) {
        pinMonitorContactButton.addEventListener("click", () => {
          void refreshPinContact();
        });
      }

      const hexViewport = mountedContainer.querySelector("#spiHexPreviewViewport");
      if (hexViewport) {
        hexViewport.scrollTop = Math.max(0, Number(state.hexPreviewScrollTop) || 0);
        hexViewport.addEventListener("scroll", () => {
          state.hexPreviewScrollTop = hexViewport.scrollTop;
          void syncHexPreviewViewport();
        });
        void syncHexPreviewViewport();
      }

      const installDriverLink = mountedContainer.querySelector("[data-spi-install-driver]");
      if (installDriverLink) {
        installDriverLink.addEventListener("click", (event) => withBusy(async () => {
          event.preventDefault();

          if (!state.serviceAvailable || !state.selectedDevice) {
            return;
          }

          const selectedDriver = normalizeDriverInfo(state.selectedDeviceDriver, state.selectedDevice);
          const installPath = selectedDriver.installUrl || `/spi-flash/drivers/${encodeURIComponent(state.selectedDevice)}/install`;
          const payload = await fetchJson(installPath);

          if (payload?.driver) {
            state.selectedDeviceDriver = normalizeDriverInfo(payload.driver, state.selectedDevice);
            state.driverInfoLoaded = true;
          }

          notifyUser(
            payload?.message || `Permintaan install driver ${state.selectedDevice} dikirim.`,
            payload?.success === false ? "warning" : "success"
          );

          const session = await fetchJson("/spi-flash/session");
          applySessionState(session);
          render();
        }));
      }
    }

    async function withBusy(work, options = {}) {
      if (busy) {
        return;
      }

      const runToken = ++busyRunToken;
      let actionErrorMessage = "";
      busy = true;
      activeTaskOperationLabel = String(options.activeOperation || "").trim();
      activeTaskOperationId = `spi-flash-active-${runToken}`;
      activeTaskInitialSignature = createSessionSettlementSignature(state);
      if (options.activeOperation) {
        state.activeOperation = options.activeOperation;
        state.progress = 0;
        state.errorMessage = "";
      }
      render();
      startSessionPolling();

      try {
        await work();
      } catch (error) {
        if (state.selectedDevice && !state.driverInfoLoaded) {
          try {
            await fetchDriverInfo(state.selectedDevice);
          } catch {
            // Keep the original action error as the main feedback.
          }
        }
        actionErrorMessage = sanitizePublicMessage(error?.message || "Operasi SPI Flash gagal.");
        state.errorMessage = actionErrorMessage;
        notifyUser(state.errorMessage, "warning");
        render();
      } finally {
        stopSessionPolling();
        await refreshSessionSilently({ force: true });
        if (actionErrorMessage) {
          state.errorMessage = actionErrorMessage;
        }

        if (runToken === busyRunToken) {
          if (activeTaskOperationId) {
            reportTask({
              operationId: activeTaskOperationId,
              source: "spi-flash",
              remove: true,
              forceRemove: true
            });
          }
          busy = false;
          activeTaskOperationLabel = "";
          activeTaskOperationId = "";
          activeTaskInitialSignature = "";
          render();
        }
      }
    }

    async function loadSessionFromService(options = {}) {
      try {
        const session = await fetchJson("/spi-flash/session");
        applySessionState(session, options);
      } catch (error) {
        state = createUnavailableState(sanitizePublicMessage(error?.message || "Aplikasi lokal SPI Flash belum tersedia."));
        syncHexViewFromState({ resetScroll: true });
      }
    }

    return {
      viewKey: "tool_spi_flash",
      eyebrow: "SPI Flash Studio",
      title: "SPI Flash Studio",
      subtitle: "Workbench web untuk operasi SPI flash yang disinkronkan langsung ke aplikasi lokal.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        if (typeof options.notify === "function") {
          pageNotifier = options.notify;
        }
        reportTask = typeof options.reportTask === "function" ? options.reportTask : () => {};
        await loadSessionFromService({ forceNoDeviceSelection: !state.selectedDevice });
        render();
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }

        mountedContainer.classList.toggle("hidden", !visible);
      },
      async refresh() {
        await loadSessionFromService();
        render();
      },
      clearTaskHistoryLocally() {
        taskHistoryClearedAtMs = Date.now();
        state.progressHistory = [];
        state.fullProgressHistory = [];
        render();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.spiFlash = createApi();
})(window);
