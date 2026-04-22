(function initializeSpiFlashPage(globalScope) {
  const serviceBaseUrl = "http://127.0.0.1:48721";
  const hexPreviewLineHeight = 24;
  const hexPreviewOverscanLines = 10;
  const hexPreviewMinimumRequestLines = 64;
  const hexPreviewMaxVirtualHeight = 12000000;

  const deviceProfiles = {
    CH341A: {
      label: "CH341A",
      transport: "USB bridge",
      status: "Legacy clip programmer",
      speed: "0.75 MHz",
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
      label: "STM32",
      transport: "USB CDC backend",
      status: "Native backend",
      speed: "42 MHz max",
      note: "Backend STM32 CDC dijalankan langsung dari local service."
    },
    EZP2019: {
      label: "EZP2019+",
      transport: "Bulk USB vendor protocol",
      status: "Native backend",
      speed: "Vendor sequence",
      note: "Backend USB EZP2019+ dijalankan langsung dari local service."
    }
  };

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
      jedec: "",
      startAddress: "",
      length: "",
      fileName: "",
      fileSize: "",
      verifyMode: "",
      progress: 0,
      lastResult: "Status backend belum tersedia",
      lastUpdated: "Belum dijalankan",
      hasReadBuffer: false,
      readBufferIsAllFf: false,
      logs: [
        "[--:--:--] Local service SPI Flash belum bisa dijangkau dari Web UI."
      ],
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
      Boolean(session.length) ||
      Boolean(session.verifyMode);
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

    return {
      serviceAvailable: true,
      errorMessage: "",
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
      jedec: session.jedec || "",
      startAddress: session.startAddress || "",
      length: session.length || "",
      fileName: session.fileName || "",
      fileSize: session.fileSize || "",
      verifyMode: session.verifyMode || "",
      progress: Number(session.progress || 0),
      lastResult: session.lastResult || "Belum ada operasi",
      lastUpdated: session.lastUpdated || "Belum dijalankan",
      hasReadBuffer: Boolean(session.hasReadBuffer),
      readBufferIsAllFf: Boolean(session.readBufferIsAllFf),
      logs: Array.isArray(session.logs) ? session.logs : [],
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

  function createWorkbenchMarkup(state, busy, hexView) {
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
    const controlsDisabled = !state.serviceAvailable || busy;
    const disableAttr = controlsDisabled ? " disabled" : "";
    const actionDisableAttr = controlsDisabled || !state.selectedDevice ? " disabled" : "";
    const pageLabel = state.pageSize > 0 ? `${state.pageSize} byte` : "Belum ada data";
    const fileNameLabel = state.fileName || "Belum ada file";
    const fileSizeLabel = state.fileSize || "-";
    const startAddressLabel = state.startAddress || "-";
    const lengthLabel = state.length || "-";
    const verifyLabel = state.verifyMode || "-";
    const hexPreviewStatusState = getHexPreviewStatusState(state, busy);
    const readActionSummary = autoProcessEnabled ? "Read + Verify" : "Read";
    const writeActionSummary = autoProcessEnabled ? "Erase + Write + Verify" : "Write";
    const autoProcessSummary = autoProcessEnabled
      ? "Aktif: Read=Read+Verify, Write=Erase+Write+Verify"
      : "Nonaktif: Read=Read, Write=Write";
    const selectedDriver = normalizeDriverInfo(state.selectedDeviceDriver, state.selectedDevice);
    const driverInstallLabel = selectedDriver.installLabel || "Install driver";
    const showDriverPanel = Boolean(state.selectedDevice) && Boolean(state.driverInfoLoaded) && !selectedDriver.isPresent;

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
            Device
            <select id="spiFlashDeviceSelect"${disableAttr}>
              <option value=""${state.selectedDevice ? "" : " selected"}>---Pilih Device Programmer---</option>
              ${Object.entries(deviceProfiles).map(([key, item]) => `
                <option value="${escapeHtml(key)}"${key === state.selectedDevice ? " selected" : ""}>
                  ${escapeHtml(item.label)} - ${escapeHtml(item.status)}
                </option>
              `).join("")}
            </select>
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
              <span>Detect JEDEC</span>
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
            <label>
              Verify Mode
              <input data-field="verifyMode" type="text" value="${escapeHtml(state.verifyMode)}" placeholder="Smart compare"${disableAttr}>
            </label>
            <label class="spi-file-field">
              Source File
              <input id="spiFlashFileInput" type="file" accept=".bin,.rom,.cap,.img,.fd,.bio,.wph,.efi,.hdr"${disableAttr}>
            </label>
          </div>
          <div class="spi-inline-meta">
            <span>File <strong>${escapeHtml(fileNameLabel)}</strong></span>
            <span>Ukuran <strong>${escapeHtml(fileSizeLabel)}</strong></span>
            <span>Start <strong>${escapeHtml(startAddressLabel)}</strong></span>
            <span>Length <strong>${escapeHtml(lengthLabel)}</strong></span>
            <span>Verify <strong>${escapeHtml(verifyLabel)}</strong></span>
          </div>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Action Pad</p>
              <h4>Flow operasi</h4>
            </div>
          </div>
          <label class="spi-auto-toggle">
            <input id="spiFlashAutoProcess" data-field="autoProcess" type="checkbox"${autoProcessEnabled ? " checked" : ""}${disableAttr}>
            <span class="spi-auto-toggle-copy">
              <strong>Auto proses</strong>
              <small>${escapeHtml(autoProcessSummary)}</small>
            </span>
          </label>
          <div class="spi-action-grid spi-action-grid-primary">
            <button type="button" data-spi-action="read"${actionDisableAttr}>
              <span class="material-symbols-outlined">download</span>
              <span class="spi-action-copy">
                <strong>Read</strong>
                <small>${escapeHtml(readActionSummary)}</small>
              </span>
            </button>
            <button type="button" data-spi-action="erase"${actionDisableAttr}>
              <span class="material-symbols-outlined">ink_eraser</span>
              <span class="spi-action-copy">
                <strong>Erase</strong>
                <small>Erase</small>
              </span>
            </button>
            <button type="button" data-spi-action="write"${actionDisableAttr}>
              <span class="material-symbols-outlined">upload</span>
              <span class="spi-action-copy">
                <strong>Write</strong>
                <small>${escapeHtml(writeActionSummary)}</small>
              </span>
            </button>
            <button type="button" data-spi-action="verify"${actionDisableAttr}>
              <span class="material-symbols-outlined">rule</span>
              <span class="spi-action-copy">
                <strong>Verify</strong>
                <small>Verify</small>
              </span>
            </button>
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
          <div class="spi-progress-panel">
            <div class="spi-progress-copy">
              <span class="label">Session Progress</span>
              <strong>${escapeHtml(state.activeOperation || "Belum ada operasi")}</strong>
              <span>${escapeHtml(`${progressWidth}%`)}</span>
            </div>
            <div class="spi-progress-track" aria-hidden="true">
              <span style="width: ${progressWidth}%;"></span>
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

  function createApi() {
    let state = createUnavailableState();
    let mountedContainer = null;
    let busy = false;
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
        startAddress: state.startAddress,
        length: state.length,
        verifyMode: state.verifyMode
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

    async function selectDeviceAndConnect(nextDevice) {
      const session = await fetchJson("/spi-flash/device", {
        method: "POST",
        body: JSON.stringify({ deviceType: nextDevice })
      });

      applySessionState(session, { resetScroll: true });
      state.selectedDeviceDriver = normalizeDriverInfo(null, nextDevice);
      state.driverInfoLoaded = false;
      render();

      try {
        const connectedSession = await runAction("connect");
        applySessionState(connectedSession);
        render();
      } catch (error) {
        await fetchDriverInfo(nextDevice);
        render();
        throw error;
      }
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy, hexView);

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
        deviceSelect.addEventListener("change", () => withBusy(async () => {
          const nextDevice = deviceSelect.value;
          if (!state.serviceAvailable) {
            return;
          }

          if (!nextDevice) {
            state.selectedDevice = "";
            state.profile = deviceProfiles.CH347;
            state.selectedDeviceDriver = normalizeDriverInfo(null, "");
            state.driverInfoLoaded = false;
            render();
            return;
          }

          if (!deviceProfiles[nextDevice]) {
            return;
          }

          await selectDeviceAndConnect(nextDevice);
        }));
      }

      mountedContainer.querySelectorAll("[data-field]").forEach((input) => {
        input.addEventListener("input", () => {
          const field = input.getAttribute("data-field");
          if (!field) {
            return;
          }

          if (input.type === "checkbox") {
            state[field] = Boolean(input.checked);
            render();
            return;
          }

          state[field] = field === "pageSize" ? Number(input.value || 0) : input.value;
        });
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
        button.addEventListener("click", () => withBusy(async () => {
          const action = button.getAttribute("data-spi-action");
          if (!action || !state.serviceAvailable) {
            return;
          }

          if ((action === "read" || action === "erase" || action === "write" || action === "verify") && !state.jedec) {
            notifyUser("Chip belum detect, jalankan Detect JEDEC dulu.", "warning");
            return;
          }

          const session = await runAction(action);
          applySessionState(session, { resetScroll: true });
          render();

          if (action === "read" && state.readBufferIsAllFf) {
            notifyUser("Chip kosong, isi buffer masih FF semua.", "warning");
          }

          if (action === "read" && state.autoProcess !== false && state.hasReadBuffer) {
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
        }));
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

    async function withBusy(work) {
      if (busy) {
        return;
      }

      busy = true;
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
