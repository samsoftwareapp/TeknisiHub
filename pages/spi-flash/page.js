(function initializeSpiFlashPage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const hexPreviewLineHeight = 24;
  const hexPreviewOverscanLines = 10;
  const hexPreviewMinimumRequestLines = 64;
  const hexPreviewMaxVirtualHeight = 12000000;
  const maxSpiFlashTaskPanelEntries = 4;

  const deviceProfiles = {
    CH341A: {
      label: "CH341A",
      transport: "USB bridge",
      status: "Legacy clip programmer",
      speed: "0.75 MHz fixed",
      note: "Backend CH341A dijalankan langsung dari local service."
    },
    CH347: {
      label: "CH347",
      transport: "USB high speed",
      status: "Native backend",
      speed: "60 MHz max",
      note: "Backend CH347 dijalankan langsung dari local service."
    },
    STM32: {
      label: "STM32 KBC/EC",
      transport: "USB WinUSB vendor bulk",
      status: "SPI + ENE/ITE KBC/EC",
      speed: "20 MHz request",
      note: "Backend STM32 memakai firmware MYGPROG stabil dari repo rp2040-with-ene-main."
    },
    EZP2019: {
      label: "EZP2019+",
      transport: "Bulk USB vendor protocol",
      status: "Native backend",
      speed: "3/6/12 MHz",
      note: "Backend USB EZP2019+ dijalankan langsung dari local service."
    }
  };

  const disabledDeviceSelections = new Set(["CH347"]);

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

  function createChipSummary(entry) {
    const model = String(entry?.chipModel || "").trim();
    const voltage = String(entry?.chipVoltage || "").trim();
    const capacity = String(entry?.chipCapacity || "").trim();
    return [model, voltage, capacity].filter(Boolean).join(" ");
  }

  function isIdleOperationLabel(value) {
    const label = String(value || "").trim().toLowerCase();
    return !label ||
      label === "idle" ||
      label === "belum ada operasi" ||
      label === "device dipilih" ||
      label === "file siap dipakai";
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

  function reportActionProgressTasks(state, busy, deviceBusy, progressWidth, reportTask) {
    if (typeof reportTask !== "function") {
      return;
    }

    const completedEntries = (Array.isArray(state.fullProgressHistory)
      ? state.fullProgressHistory
      : [])
      .slice()
      .sort((left, right) => (right.sequence || 0) - (left.sequence || 0));
    const activeOperation = String(state.activeOperation || "").trim();
    const hasActiveOperation = (busy || deviceBusy) && !isIdleOperationLabel(activeOperation);
    const lowerActiveOperation = activeOperation.toLowerCase();
    const shouldShowCurrentResult =
      !hasActiveOperation &&
      Number(state.progress || 0) >= 100 &&
      lowerActiveOperation.includes("jedec");
    const failedMessage = !busy && !deviceBusy && state.errorMessage
      ? String(state.errorMessage || "").trim()
      : "";
    const activeMeta = [
      state.selectedDevice ? resolveSelectedDeviceLabel(state.selectedDevice) : "",
      state.jedec ? `JEDEC ${state.jedec}` : "",
      state.fileName || ""
    ].filter(Boolean).join(" - ") || "Menunggu update dari local service";

    if (hasActiveOperation) {
      const timestamp = Date.now();
      reportTask({
        operationId: "spi-flash-active",
        source: "spi-flash",
        fileName: activeOperation,
        displayName: "SPI Flash",
        icon: "progress_activity",
        message: activeMeta,
        stage: "running",
        active: true,
        success: false,
        progressPercent: progressWidth,
        updatedAt: timestamp,
        sortKey: timestamp
      });
    } else {
      reportTask({
        operationId: "spi-flash-active",
        source: "spi-flash",
        remove: true
      });
    }

    completedEntries.slice(0, maxSpiFlashTaskPanelEntries).forEach((entry, index) => {
      const timestamp = getSpiFlashTaskTimestamp(entry, index);
      reportTask({
        operationId: `spi-flash-history-${entry.sequence}`,
        source: "spi-flash",
        fileName: entry.actionLabel || "SPI Flash action",
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
        fileName: activeOperation,
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
      const timestamp = Date.now();
      const failedTitle = activeOperation && !isIdleOperationLabel(activeOperation)
        ? activeOperation
        : "Proses gagal";
      reportTask({
        operationId: `spi-flash-failed-${failedMessage.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80)}`,
        source: "spi-flash",
        fileName: failedTitle,
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
    }
  }

  function createUnavailableState(message = "") {
    const profile = deviceProfiles.CH347;
    return {
      serviceAvailable: false,
      errorMessage: message,
      autoProcess: true,
      previewMode: false,
      backendMode: "local-service",
      selectedDevice: "CH347",
      connectionState: "Local service belum terhubung",
      activeOperation: "Belum ada operasi",
      chipVendor: "",
      chipModel: "",
      chipCapacity: "",
      chipVoltage: "",
      pageSize: 0,
      speedHz: 0,
      jedec: "",
      startAddress: "",
      length: "",
      fileName: "",
      fileSize: "",
      progress: 0,
      lastResult: "Status backend belum tersedia",
      lastUpdated: "Belum dijalankan",
      hasReadBuffer: false,
      readBufferIsAllFf: false,
      logs: [
        "[--:--:--] Local service SPI Flash belum bisa dijangkau dari Web UI."
      ],
      progressHistory: [],
      fullProgressHistory: [],
      hexPreviewTotalBytes: 0,
      hexPreviewTotalLines: 0,
      hexPreviewScrollTop: 0,
      hexPreview: [
        "Belum ada data."
      ],
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

  function mapServiceSessionToState(session, previousState = null) {
    const hasPersistedSessionState =
      Boolean(session.fileName) ||
      Boolean(session.jedec) ||
      Boolean(session.chipVendor) ||
      Boolean(session.chipModel) ||
      Boolean(session.startAddress) ||
      Boolean(session.length);
    const activeOperation = String(session.activeOperation || "").trim().toLowerCase();
    const normalizedConnectionState = String(session.connectionState || "").trim().toLowerCase();
    const isFreshDefaultSession =
      (session.selectedDevice || "") === "CH347" &&
      !hasPersistedSessionState &&
      activeOperation === "belum ada operasi" &&
      normalizedConnectionState.includes("belum terhubung");
    const selectedDevice = isFreshDefaultSession ? "" : (session.selectedDevice || "");
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
    const serviceFailureMessage = resolveServiceFailureMessage(session);

    return {
      serviceAvailable: true,
      errorMessage: serviceFailureMessage,
      autoProcess: session.autoProcess !== false,
      previewMode: Boolean(session.previewMode),
      backendMode: session.backendMode || "local-service",
      selectedDevice,
      connectionState: session.connectionState || "Device belum terhubung",
      activeOperation: session.activeOperation || "Belum ada operasi",
      chipVendor: session.chipVendor || "",
      chipModel: session.chipModel || "",
      chipCapacity: session.chipCapacity || "",
      chipVoltage: session.chipVoltage || "",
      pageSize: Number(session.pageSize || 0),
      speedHz: Number(session.speedHz || 0),
      jedec: session.jedec || "",
      startAddress: session.startAddress || "",
      length: session.length || "",
      fileName: session.fileName || "",
      fileSize: session.fileSize || "",
      progress: Number(session.progress || 0),
      lastResult: session.lastResult || "Belum ada operasi",
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
      selectedDeviceDriver,
      driverInfoLoaded,
      profile: deviceProfiles[selectedDevice] || deviceProfiles.CH347
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
      throw new Error(payload.message || payload.title || `Request gagal (${response.status}).`);
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
          <span>${escapeHtml(state.activeOperation || "Memproses...")}</span>
        `
      };
    }

    const isError =
      activeOperation.includes("gagal") ||
      lastResult.includes("gagal") ||
      hasExplicitMismatchFailure;

    const successLabel =
      activeOperation.includes("read + verify selesai") ? "Read + Verify sukses" :
      activeOperation.includes("read selesai") ? "Read sukses" :
      activeOperation.includes("write flow selesai") ? "Erase + Write + Verify sukses" :
      activeOperation.includes("write selesai") ? "Write sukses" :
      activeOperation.includes("chip erase selesai") || activeOperation.includes("erase selesai") ? "Erase sukses" :
      activeOperation.includes("verify selesai") ? "Verify sukses" :
      "";

    if (isError) {
      const errorLabel =
        activeOperation.includes("read") ? "Read error" :
        activeOperation.includes("write") ? "Write error" :
        activeOperation.includes("erase") ? "Erase error" :
        activeOperation.includes("verify") ? "Verify error" :
        "Status error";

      return {
        toneClass: " is-failed",
        loading: false,
        headingMarkup: escapeHtml(errorLabel)
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

  function createDefaultActionPadMarkup(autoProcessEnabled, autoProcessSummary, readActionSummary, writeActionSummary, disableAttr, actionDisableAttr) {
    return `
      ${createAutoProcessMarkup(autoProcessEnabled, autoProcessSummary, disableAttr)}
      <div class="spi-action-grid spi-action-grid-primary">
        ${createActionButton("read", "download", "Read", readActionSummary, actionDisableAttr)}
        ${createActionButton("erase", "ink_eraser", "Erase", "Erase", actionDisableAttr)}
        ${createActionButton("write", "upload", "Write", writeActionSummary, actionDisableAttr)}
        ${createActionButton("verify", "rule", "Verify", "Verify", actionDisableAttr)}
      </div>
      <div class="spi-action-grid spi-action-grid-secondary">
        <button type="button" class="ghost" data-spi-action="reset"${disableAttr}>
          <span class="material-symbols-outlined">restart_alt</span>
          <span>Reset Session</span>
        </button>
        <button type="button" class="ghost" id="spiFlashEditDatabaseButton"${disableAttr}>
          <span class="material-symbols-outlined">edit_note</span>
          <span>Edit Database</span>
        </button>
      </div>
    `;
  }

  function getStm32TargetKind(state) {
    const vendor = String(state?.chipVendor || "").trim().toUpperCase();
    const model = String(state?.chipModel || "").trim().toUpperCase();
    if (vendor === "ENE" || model.includes("ENE ")) {
      return "ene";
    }

    if (vendor === "ITE" || model.includes("ITE ")) {
      return "ite";
    }

    return "spi";
  }

  function resolveStm32CommonAction(state, action) {
    const targetKind = getStm32TargetKind(state);
    if (targetKind === "ene") {
      return `ene-${action}`;
    }

    if (targetKind === "ite") {
      return `ite-${action}`;
    }

    return action;
  }

  function resolveActionTaskLabel(action, autoProcessEnabled, selectedDevice = state.selectedDevice) {
    const normalizedAction = String(action || "").trim().toLowerCase();
    if (normalizedAction === "detect") {
      return "SmartID";
    }

    if (normalizedAction === "read") {
      return selectedDevice === "EZP2019" || !autoProcessEnabled ? "Read" : "Read+Verify";
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

  function createStm32ActionPadMarkup(state, autoProcessEnabled, autoProcessSummary, readActionSummary, writeActionSummary, disableAttr, actionDisableAttr) {
    const targetKind = getStm32TargetKind(state);
    const targetLabel = targetKind === "ene"
      ? "ENE"
      : targetKind === "ite"
        ? "ITE"
        : "SPI";

    return `
      ${createAutoProcessMarkup(autoProcessEnabled, autoProcessSummary, disableAttr)}
      <div class="spi-action-grid spi-action-grid-primary">
        ${createActionButton("detect", "radar", "SmartID", "SPI JEDEC", actionDisableAttr)}
        ${createActionButton("ene-detect", "memory", "Detect ENE", "KBC/EC", actionDisableAttr)}
        ${createActionButton("ite-detect", "memory", "Detect ITE", "KBC/EC", actionDisableAttr)}
        ${createActionButton(resolveStm32CommonAction(state, "read"), "download", "Read", `${targetLabel} ${readActionSummary}`, actionDisableAttr)}
        ${createActionButton(resolveStm32CommonAction(state, "write"), "upload", "Write", `${targetLabel} ${writeActionSummary}`, actionDisableAttr)}
        ${createActionButton(resolveStm32CommonAction(state, "verify"), "rule", "Verify", `${targetLabel} compare`, actionDisableAttr)}
        ${createActionButton(resolveStm32CommonAction(state, "erase"), "ink_eraser", "Erase", `${targetLabel} erase`, actionDisableAttr)}
      </div>
      <div class="spi-action-grid spi-action-grid-secondary">
        <button type="button" class="ghost" data-spi-action="reset"${disableAttr}>
          <span class="material-symbols-outlined">restart_alt</span>
          <span>Reset Session</span>
        </button>
        <button type="button" class="ghost" id="spiFlashEditDatabaseButton"${disableAttr}>
          <span class="material-symbols-outlined">edit_note</span>
          <span>Edit Database</span>
        </button>
      </div>
    `;
  }

  function createWorkbenchMarkup(state, busy, deviceBusy, deviceMenuOpen, hexView) {
    const autoProcessEnabled = state.autoProcess !== false;
    const normalizedConnectionState = String(state.connectionState || "").trim().toLowerCase();
    const isDeviceConnected =
      Boolean(state.selectedDevice) &&
      !normalizedConnectionState.includes("belum terhubung") &&
      (normalizedConnectionState.includes("terhubung") || normalizedConnectionState.includes("aktif"));
    const profile = state.selectedDevice
      ? (state.profile || deviceProfiles.CH347)
      : {
          transport: "-",
          speed: "-",
          note: "Pilih device programmer terlebih dahulu untuk mulai koneksi."
        };
    const progressWidth = Math.max(0, Math.min(100, Number(state.progress) || 0));
    const controlsDisabled = !state.serviceAvailable || busy || deviceBusy;
    const disableAttr = controlsDisabled ? " disabled" : "";
    const actionDisableAttr = controlsDisabled || !state.selectedDevice ? " disabled" : "";
    const pageLabel = state.pageSize > 0 ? `${state.pageSize} byte` : "Belum ada data";
    const fileNameLabel = state.fileName || "Belum ada file";
    const showStm32SpeedField = state.selectedDevice === "STM32";
    const showEzpSpeedField = state.selectedDevice === "EZP2019";
    const showFixedSpeedField = state.selectedDevice === "CH341A";
    const fixedSpeedLabel = "0.75 MHz";
    const speedInputValue = formatSpeedInputValue(state.speedHz || 12000000);
    const hexPreviewStatusState = getHexPreviewStatusState(state, busy);
    const ezpReadUsesSinglePass = state.selectedDevice === "EZP2019";
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
    const selectedDeviceSubtext = resolveSelectedDeviceSubtext(state.selectedDevice, deviceBusy);
    const actionPadMarkup = state.selectedDevice === "STM32"
      ? createStm32ActionPadMarkup(state, autoProcessEnabled, autoProcessSummary, readActionSummary, writeActionSummary, disableAttr, actionDisableAttr)
      : createDefaultActionPadMarkup(autoProcessEnabled, autoProcessSummary, readActionSummary, writeActionSummary, disableAttr, actionDisableAttr);

    return `
      <div class="spi-workbench-shell${busy ? " is-busy" : ""}">
      ${busy ? `
        <div class="spi-busy-overlay" id="spiBusyOverlay" aria-hidden="true"></div>
      ` : ""}
      ${state.errorMessage ? `
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Status Service</p>
              <h4>Koneksi backend bermasalah</h4>
            </div>
          </div>
          <p class="spi-note">${escapeHtml(state.errorMessage)}</p>
        </section>
      ` : ""}

      <div class="spi-layout">
        <section class="spi-card${isDeviceConnected ? " is-success" : ""}">
          <div class="spi-card-head">
            <div>
              <p class="label">Device Backend</p>
              <h4>Pilih programmer</h4>
            </div>
          </div>
          <label class="spi-device-select">
            <span>Device</span>
            <div class="spi-device-combobox${deviceMenuOpen ? " is-open" : ""}${controlsDisabled ? " is-disabled" : ""}" data-open="${deviceMenuOpen ? "true" : "false"}">
              <button
                type="button"
                class="spi-device-combobox-trigger"
                id="spiFlashDeviceToggle"
                aria-haspopup="listbox"
                aria-expanded="${deviceMenuOpen ? "true" : "false"}"
                aria-controls="spiFlashDeviceMenu"
                ${controlsDisabled ? "disabled" : ""}
              >
                <span class="spi-device-combobox-copy">
                  <strong>${escapeHtml(selectedDeviceLabel)}</strong>
                  <small>${escapeHtml(selectedDeviceSubtext)}</small>
                </span>
                <span class="material-symbols-outlined">expand_more</span>
              </button>
              <div class="spi-device-combobox-menu" id="spiFlashDeviceMenu" role="listbox" aria-label="Pilih device programmer"${deviceMenuOpen ? "" : " hidden"}>
                ${availableDevices.map(([key, item]) => `
                  <button
                    type="button"
                    class="spi-device-combobox-option${key === state.selectedDevice ? " is-selected" : ""}"
                    data-spi-device-option="${escapeHtml(key)}"
                    role="option"
                    aria-selected="${key === state.selectedDevice ? "true" : "false"}"
                  >
                    <span class="spi-device-combobox-option-copy">
                      <strong>${escapeHtml(item.label)}</strong>
                      <small>${escapeHtml(item.status)}</small>
                    </span>
                    ${key === state.selectedDevice ? `<span class="material-symbols-outlined">check</span>` : ""}
                  </button>
                `).join("")}
              </div>
            </div>
          </label>
          <div class="spi-inline-meta">
            <span>Status <strong>${escapeHtml(state.selectedDevice ? (state.connectionState || "Belum terhubung") : "Belum ada device dipilih")}</strong></span>
            <span>Transport <strong>${escapeHtml(profile.transport)}</strong></span>
            <span>Clock <strong>${escapeHtml(profile.speed)}</strong></span>
            <span>Page size <strong>${escapeHtml(pageLabel)}</strong></span>
          </div>
          <p class="spi-note">${escapeHtml(profile.note)}</p>
          ${showDriverPanel ? `
            <p class="spi-driver-link-row">
              <a href="#" class="spi-driver-link" data-spi-install-driver="1">${escapeHtml(driverInstallLabel)}</a>
            </p>
          ` : ""}
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Chip Profile</p>
              <h4>Parameter flash</h4>
            </div>
            <button type="button" class="ghost" data-spi-action="detect"${actionDisableAttr}>
              <span class="material-symbols-outlined">radar</span>
              <span>${state.selectedDevice === "STM32" ? "SmartID" : "Detect JEDEC"}</span>
            </button>
          </div>
          <div class="spi-form-grid">
            <label>
              Manufacturer
              <input data-field="chipVendor" type="text" value="${escapeHtml(state.chipVendor)}" placeholder="-" readonly${disableAttr}>
            </label>
            <label>
              Name
              <input data-field="chipModel" type="text" value="${escapeHtml(state.chipModel)}" placeholder="-" readonly${disableAttr}>
            </label>
            <label>
              Size
              <input data-field="chipCapacity" type="text" value="${escapeHtml(state.chipCapacity)}" placeholder="-" readonly${disableAttr}>
            </label>
            <label>
              Volt
              <input type="text" value="${escapeHtml(state.chipVoltage || "-")}" placeholder="-" readonly${disableAttr}>
            </label>
          </div>
          <div class="spi-inline-meta">
            <span>JEDEC <strong>${escapeHtml(state.jedec || "-")}</strong></span>
            <span>Page size <strong>${escapeHtml(pageLabel)}</strong></span>
          </div>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Region & File</p>
              <h4>Input operasi</h4>
            </div>
          </div>
          <div class="spi-form-grid">
            <label>
              Start Address
              <input data-field="startAddress" type="text" value="${escapeHtml(state.startAddress)}" placeholder="0x000000"${disableAttr}>
            </label>
            <label>
              Length
              <input data-field="length" type="text" value="${escapeHtml(state.length)}" placeholder="0x00800000"${disableAttr}>
            </label>
            <label class="spi-file-field">
              Source File
              <input id="spiFlashFileInput" type="file" accept=".bin,.rom,.cap,.img,.fd,.bio,.wph,.efi,.hdr"${disableAttr}>
            </label>
            ${showStm32SpeedField ? `
              <label>
                Speed (MHz)
                <input data-field="speedHz" data-field-format="mhz" type="text" value="${escapeHtml(speedInputValue)}" placeholder="12"${disableAttr}>
              </label>
            ` : showEzpSpeedField ? `
              <label>
                Speed
                <select data-field="speedHz"${disableAttr}>
                  <option value="12000000"${Number(state.speedHz || 12000000) === 12000000 ? " selected" : ""}>12 MHz</option>
                  <option value="6000000"${Number(state.speedHz || 12000000) === 6000000 ? " selected" : ""}>6 MHz</option>
                  <option value="3000000"${Number(state.speedHz || 12000000) === 3000000 ? " selected" : ""}>3 MHz</option>
                </select>
              </label>
            ` : showFixedSpeedField ? `
              <label>
                Speed
                <input type="text" value="${escapeHtml(fixedSpeedLabel)}" readonly${disableAttr}>
              </label>
            ` : ""}
          </div>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Action Pad</p>
              <h4>${state.selectedDevice === "STM32" ? "Flow SPI + KBC/EC" : "Flow operasi"}</h4>
            </div>
          </div>
          ${actionPadMarkup}
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

  function resolveSelectedDeviceSubtext(selectedDevice, deviceBusy) {
    if (deviceBusy && selectedDevice && deviceProfiles[selectedDevice]) {
      return "Menyambungkan device...";
    }

    if (!selectedDevice || !deviceProfiles[selectedDevice]) {
      return "Pilih device lalu konek otomatis.";
    }

    return deviceProfiles[selectedDevice].status;
  }

  function createApi() {
    let state = createUnavailableState();
    let mountedContainer = null;
    let reportTask = () => {};
    let busy = false;
    let deviceBusy = false;
    let deviceMenuOpen = false;
    let sessionPollTimer = null;
    let sessionPollInFlight = false;
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
      state = mapServiceSessionToState(session, state);
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

    function collectActionPayload() {
      return {
        chipVendor: state.chipVendor,
        chipModel: state.chipModel,
        chipCapacity: state.chipCapacity,
        autoProcess: state.autoProcess !== false,
        pageSize: Number(state.pageSize || 256),
        speedHz: Number(state.speedHz || 0),
        startAddress: state.startAddress,
        length: state.length
      };
    }

    async function fetchDriverInfo(deviceType) {
      if (!deviceType || !state.serviceAvailable) {
        return;
      }

      const driverInfo = await fetchJson(`/spi-flash/drivers/${encodeURIComponent(deviceType)}`);
      state.selectedDeviceDriver = normalizeDriverInfo(driverInfo, deviceType);
      state.driverInfoLoaded = true;
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
        body: JSON.stringify(collectActionPayload())
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

    async function refreshSessionSilently() {
      if (sessionPollInFlight || !state.serviceAvailable) {
        return;
      }

      sessionPollInFlight = true;
      try {
        const session = await fetchJson("/spi-flash/session");
        applySessionState(session);
        render();
      } catch {
        // Ignore polling hiccups while the main action request is still running.
      } finally {
        sessionPollInFlight = false;
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

    function toggleDeviceMenu(forceOpen) {
      const nextState = typeof forceOpen === "boolean" ? forceOpen : !deviceMenuOpen;
      if (deviceBusy || busy || !state.serviceAvailable) {
        deviceMenuOpen = false;
      } else {
        deviceMenuOpen = nextState;
      }

      render();
    }

    async function selectDevice(nextDevice) {
      const session = await fetchJson("/spi-flash/device", {
        method: "POST",
        body: JSON.stringify({ deviceType: nextDevice })
      });

      applySessionState(session, { resetScroll: true });
      state.selectedDeviceDriver = normalizeDriverInfo(null, nextDevice);
      state.driverInfoLoaded = false;
    }

    async function refreshStm32ConnectionStatus(deviceType) {
      if (!state.serviceAvailable || deviceType !== "STM32") {
        return;
      }

      try {
        const session = await runAction("connect");
        applySessionState(session);
      } catch {
        if (state.selectedDevice === "STM32") {
          state.connectionState = `${resolveSelectedDeviceLabel("STM32")} belum terhubung`;
        }
      }
    }

    async function handleDeviceSelection(nextDevice) {
      if (busy || deviceBusy || !state.serviceAvailable) {
        return;
      }

      const normalizedDevice = String(nextDevice || "").trim();
      deviceMenuOpen = false;

      if (!normalizedDevice) {
        state.selectedDevice = "";
        state.profile = deviceProfiles.CH347;
        state.connectionState = "Belum ada device dipilih";
        state.selectedDeviceDriver = normalizeDriverInfo(null, "");
        state.driverInfoLoaded = false;
        render();
        return;
      }

      if (!deviceProfiles[normalizedDevice]) {
        return;
      }

      if (disabledDeviceSelections.has(normalizedDevice)) {
        notifyUser("CH347 sedang dinonaktifkan dan tidak bisa dipilih.", "warning");
        render();
        return;
      }

      deviceBusy = true;
      state.errorMessage = "";
      state.selectedDevice = normalizedDevice;
      state.profile = deviceProfiles[normalizedDevice] || deviceProfiles.CH347;
      state.connectionState = `Device ${normalizedDevice} dipilih`;
      state.selectedDeviceDriver = normalizeDriverInfo(null, normalizedDevice);
      state.driverInfoLoaded = false;
      render();

      try {
        await selectDevice(normalizedDevice);
        await refreshStm32ConnectionStatus(normalizedDevice);
        try {
          await fetchDriverInfo(normalizedDevice);
        } catch {
          // Driver info is helpful, but selecting the device must stay usable without it.
        }
      } catch (error) {
        state.errorMessage = error?.message || "Gagal memilih device SPI Flash.";
        notifyUser(state.errorMessage, "warning");
      } finally {
        deviceBusy = false;
        render();
      }
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      reportActionProgressTasks(
        state,
        busy,
        deviceBusy,
        Math.max(0, Math.min(100, Number(state.progress) || 0)),
        reportTask
      );
      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy, deviceBusy, deviceMenuOpen, hexView);

      const busyOverlay = mountedContainer.querySelector("#spiBusyOverlay");
      if (busyOverlay) {
        busyOverlay.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          notifyUser("Progress masih berjalan. Tunggu sampai proses selesai, lalu lanjutkan aksi berikutnya.", "info");
        });
      }

      const deviceCombobox = mountedContainer.querySelector(".spi-device-combobox");
      const deviceToggle = mountedContainer.querySelector("#spiFlashDeviceToggle");
      if (deviceCombobox) {
        deviceCombobox.addEventListener("focusout", (event) => {
          if (deviceCombobox.contains(event.relatedTarget)) {
            return;
          }

          if (deviceMenuOpen) {
            deviceMenuOpen = false;
            render();
          }
        });
      }

      if (deviceToggle) {
        deviceToggle.addEventListener("click", () => {
          toggleDeviceMenu();
        });

        deviceToggle.addEventListener("keydown", (event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleDeviceMenu(true);
            mountedContainer.querySelector("[data-spi-device-option]")?.focus();
          }
        });
      }

      mountedContainer.querySelectorAll("[data-spi-device-option]").forEach((optionButton, index, optionButtons) => {
        optionButton.addEventListener("click", async () => {
          const nextDevice = optionButton.getAttribute("data-spi-device-option") || "";
          await handleDeviceSelection(nextDevice);
        });

        optionButton.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            deviceMenuOpen = false;
            render();
            mountedContainer.querySelector("#spiFlashDeviceToggle")?.focus();
            return;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            optionButtons[Math.min(index + 1, optionButtons.length - 1)]?.focus();
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            if (index <= 0) {
              mountedContainer.querySelector("#spiFlashDeviceToggle")?.focus();
              return;
            }

            optionButtons[index - 1]?.focus();
          }
        });
      });

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
            return;
          }

          if (field === "speedHz") {
            state[field] = Number(input.value || 0);
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

          void withBusy(async () => {
            const session = await runAction(action);
            applySessionState(session, { resetScroll: true });
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

      busy = true;
      deviceMenuOpen = false;
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
        state.errorMessage = error?.message || "Operasi SPI Flash gagal.";
        notifyUser(state.errorMessage, "warning");
        render();
      } finally {
        stopSessionPolling();
        await refreshSessionSilently();
        busy = false;
        render();
      }
    }

    async function loadSessionFromService() {
      try {
        const session = await fetchJson("/spi-flash/session");
        applySessionState(session);
      } catch (error) {
        state = createUnavailableState(error?.message || "Local service SPI Flash belum tersedia.");
        syncHexViewFromState({ resetScroll: true });
      }
    }

    return {
      viewKey: "tool_spi_flash",
      eyebrow: "SPI Flash Studio",
      title: "SPI Flash Studio",
      subtitle: "Workbench web untuk operasi SPI flash yang disinkronkan langsung ke local service.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        if (typeof options.notify === "function") {
          pageNotifier = options.notify;
        }
        reportTask = typeof options.reportTask === "function" ? options.reportTask : () => {};
        await loadSessionFromService();
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
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.spiFlash = createApi();
})(window);
