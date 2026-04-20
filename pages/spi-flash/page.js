(function initializeSpiFlashPage(globalScope) {
  const serviceBaseUrl = "http://127.0.0.1:48721";

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

  function createUnavailableState(message = "") {
    const profile = deviceProfiles.CH347;
    return {
      serviceAvailable: false,
      errorMessage: message,
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

  function getVerifyPreviewState(state) {
    const activeOperation = String(state.activeOperation || "").trim().toLowerCase();
    const lastResult = String(state.lastResult || "").trim().toLowerCase();
    const verifyFailed =
      activeOperation.includes("verify gagal") ||
      lastResult.includes("verify gagal") ||
      lastResult.includes("mismatch");
    const verifySucceeded =
      !verifyFailed && (
        activeOperation.includes("verify selesai") ||
        lastResult.includes(" byte match") ||
        lastResult.includes("verify sukses") ||
        lastResult.includes("erase -> write -> verify")
      );

    if (verifyFailed) {
      return {
        cardClass: " is-failed",
        subtitleClass: " is-failed",
        subtitle: "Verify fail!"
      };
    }

    if (verifySucceeded) {
      return {
        cardClass: "",
        subtitleClass: " is-success",
        subtitle: "Verify sukses"
      };
    }

    return {
      cardClass: "",
      subtitleClass: "",
      subtitle: ""
    };
  }

  function createWorkbenchMarkup(state, busy) {
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
    const verifyPreviewState = getVerifyPreviewState(state);
    const selectedDriver = normalizeDriverInfo(state.selectedDeviceDriver, state.selectedDevice);
    const driverInstallLabel = selectedDriver.installLabel || "Install driver";
    const showDriverPanel = Boolean(state.selectedDevice) && Boolean(state.driverInfoLoaded) && !selectedDriver.isPresent;

    return `
      <div class="spi-workbench-shell${busy ? " is-busy" : ""}">
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
          ${busy ? `
            <div class="spi-busy-inline" id="spiBusyShield" aria-live="polite">
              <div class="spi-busy-shield-copy">
                <span class="material-symbols-outlined is-spinning">progress_activity</span>
                <strong>Proses SPI masih berjalan</strong>
                <span>Tunggu sampai selesai. Operasi tidak boleh diinterupsi.</span>
              </div>
            </div>
          ` : ""}
          <div class="spi-action-grid">
            <button type="button" data-spi-action="read"${actionDisableAttr}>
              <span class="material-symbols-outlined">download</span>
              <span>Read</span>
            </button>
            <button type="button" data-spi-action="erase"${actionDisableAttr}>
              <span class="material-symbols-outlined">ink_eraser</span>
              <span>Erase</span>
            </button>
            <button type="button" data-spi-action="write"${actionDisableAttr}>
              <span class="material-symbols-outlined">upload</span>
              <span>Write</span>
            </button>
            <button type="button" data-spi-action="verify"${actionDisableAttr}>
              <span class="material-symbols-outlined">rule</span>
              <span>Verify</span>
            </button>
            <button type="button" data-spi-action="auto"${actionDisableAttr}>
              <span class="material-symbols-outlined">smart_toy</span>
              <span>Auto</span>
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
        <section class="spi-card${verifyPreviewState.cardClass}">
          <div class="spi-card-head">
            <div>
              <p class="label">Hex Preview</p>
              <h4>Data baca</h4>
            </div>
            <div class="spi-panel-actions">
              <span class="spi-mini-badge">${escapeHtml(fileNameLabel)}</span>
              ${state.hasReadBuffer ? `
                <button type="button" class="ghost" id="spiFlashSaveBinButton"${disableAttr}>
                  <span class="material-symbols-outlined">save</span>
                  <span>Save as BIN</span>
                </button>
              ` : ""}
            </div>
          </div>
          <pre class="spi-hex-preview">${escapeHtml((state.hexPreview || []).join("\n"))}</pre>
          ${verifyPreviewState.subtitle ? `
            <p class="spi-verify-subtitle${verifyPreviewState.subtitleClass}">${escapeHtml(verifyPreviewState.subtitle)}</p>
          ` : ""}
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

    function collectActionPayload() {
      return {
        chipVendor: state.chipVendor,
        chipModel: state.chipModel,
        chipCapacity: state.chipCapacity,
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

    async function refreshSessionSilently() {
      if (sessionPollInFlight || !state.serviceAvailable) {
        return;
      }

      sessionPollInFlight = true;
      try {
        const session = await fetchJson("/spi-flash/session");
        state = mapServiceSessionToState(session, state);
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

      state = mapServiceSessionToState(session, state);
      state.selectedDeviceDriver = normalizeDriverInfo(null, nextDevice);
      state.driverInfoLoaded = false;
      render();

      try {
        const connectedSession = await runAction("connect");
        state = mapServiceSessionToState(connectedSession, state);
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

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy);

      const busyShield = mountedContainer.querySelector("#spiBusyShield");
      if (busyShield) {
        const warnBusyInterruption = (event) => {
          event.preventDefault();
          event.stopPropagation();
          notifyUser("Proses SPI masih berjalan, tidak boleh diinterupsi.", "warning");
        };

        busyShield.addEventListener("click", warnBusyInterruption);
        busyShield.addEventListener("contextmenu", warnBusyInterruption);
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

          state = mapServiceSessionToState(session, state);
          render();
        }));
      }

      mountedContainer.querySelectorAll("[data-spi-action]").forEach((button) => {
        button.addEventListener("click", () => withBusy(async () => {
          const action = button.getAttribute("data-spi-action");
          if (!action || !state.serviceAvailable) {
            return;
          }

          if ((action === "read" || action === "erase" || action === "write" || action === "verify" || action === "auto") && !state.jedec) {
            notifyUser("Chip belum detect, jalankan Detect JEDEC dulu.", "warning");
            return;
          }

          const session = await runAction(action);
          state = mapServiceSessionToState(session, state);
          render();

          if (action === "read" && state.readBufferIsAllFf) {
            notifyUser("Chip kosong, isi buffer masih FF semua.", "warning");
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
        saveBinButton.addEventListener("click", () => {
          if (!state.hasReadBuffer) {
            notifyUser("Belum ada hasil read SPI Flash yang bisa disimpan.", "info");
            return;
          }

          if (state.readBufferIsAllFf) {
            notifyUser("Chip empty, isi buffer masih FF semua.", "warning");
            return;
          }

          const downloadLink = document.createElement("a");
          downloadLink.href = `${serviceBaseUrl}/spi-flash/read-buffer-bin`;
          downloadLink.rel = "noopener";
          downloadLink.style.display = "none";
          document.body.append(downloadLink);
          downloadLink.click();
          downloadLink.remove();
          notifyUser("Hasil read SPI Flash disiapkan sebagai file BIN.");
        });
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
          state = mapServiceSessionToState(session, state);
          render();
        }));
      }
    }

    async function withBusy(work) {
      if (busy) {
        notifyUser("Proses SPI masih berjalan, tidak boleh diinterupsi.", "warning");
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
        state = mapServiceSessionToState(session, state);
      } catch (error) {
        state = createUnavailableState(error?.message || "Local service SPI Flash belum tersedia.");
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
