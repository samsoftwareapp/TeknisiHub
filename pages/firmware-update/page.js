(function initializeFirmwareUpdatePage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const usbDeviceType = "TEKNISIHUB_DEVICE_USB";
  const defaultDeviceType = usbDeviceType;
  const deviceDetectionOrder = [usbDeviceType];
  const deviceProfiles = {
    TEKNISIHUB_DEVICE_USB: {
      label: "TEKNISIHUB_DEVICE",
      transport: "USB",
      icon: "usb"
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
      /\b(protocol|programmer|vcc|endpoint)\s*=/i.test(message) ||
      /\bGP\d+\b|\bGPIO\d+\b/i.test(message) ||
      /\b(libusb|winusb|stack trace|exception)\b/i.test(message) ||
      /[A-Z]:\\|\/Users\/|\/home\//i.test(message)
    ) {
      return message.toLowerCase().includes("terhubung")
        ? "Device terhubung."
        : "Operasi firmware gagal. Periksa koneksi lalu coba lagi.";
    }
    return message
      .replace(/\bLocalService\b/g, "aplikasi lokal")
      .replace(/\blocal service\b/gi, "aplikasi lokal")
      .replace(/\bbackend\b/gi, "sistem")
      .replace(/\bGoogle\s+Drive\b/gi, "penyimpanan file")
      .replace(/\bregistry\b/gi, "data akses")
      .replace(/\bFirebase\b/gi, "sistem akses")
      .replace(/\bTelegram\b/g, "akun");
  }

  async function fetchJson(path, options = {}) {
    const isFormDataBody = options.body instanceof FormData;
    const response = await fetch(`${serviceBaseUrl}${path}`, {
      headers: isFormDataBody ? {} : { "Content-Type": "application/json" },
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

  function formatFileSize(bytes) {
    const normalized = Math.max(0, Number(bytes) || 0);
    if (!normalized) {
      return "";
    }
    const units = ["B", "KB", "MB", "GB"];
    let value = normalized;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }
    const digits = unitIndex === 0 ? 0 : (value >= 10 ? 1 : 2);
    return `${Number(value.toFixed(digits)).toString()} ${units[unitIndex]}`;
  }

  function extractFirmwareVersion(identity) {
    const text = String(identity || "");
    const match = text.match(/(?:^|[\s|;,])(?:fw|firmware|firmware_version)\s*=\s*([0-9A-Za-z._-]+)/i);
    return match ? match[1] : "";
  }

  function selectedProfile(deviceType) {
    return deviceProfiles[deviceType] || deviceProfiles[defaultDeviceType];
  }

  function hasReadableDevice(state) {
    return state.detectionStatus === "found" && Boolean(state.currentVersion);
  }

  function createInitialState() {
    return {
      deviceType: defaultDeviceType,
      device: null,
      currentVersion: "",
      latestVersion: "",
      updateAvailable: false,
      updateMessage: "Cek file online untuk membandingkan versi.",
      fileName: "",
      fileSize: "",
      sha256: "",
      source: "online",
      manualFile: null,
      manualFileName: "",
      manualFileSize: "",
      manualSha256: "",
      route: "usb",
      busy: false,
      detectionStatus: "idle",
      detectionMessage: "Mengecek versi firmware device.",
      message: "Mengecek versi firmware device.",
      errorMessage: ""
    };
  }

  function createSourceButton(source, state) {
    const selected = state.source === source;
    const icon = source === "manual" ? "upload_file" : "cloud_download";
    const label = source === "manual" ? "Manual UF2" : "Online Resmi";
    return `
      <button type="button" class="firmware-source-button${selected ? " is-active" : ""}" data-firmware-source="${source}"${state.busy ? " disabled" : ""}>
        <span class="material-symbols-outlined">${icon}</span>
        <span>${label}</span>
      </button>
    `;
  }

  function createManualFileMarkup(state) {
    const selectedName = state.manualFileName || "Belum ada file";
    const selectedMeta = [state.manualFileSize, state.manualSha256 ? `${state.manualSha256.slice(0, 12)}...` : ""]
      .filter(Boolean)
      .join(" | ") || "UF2 lokal";
    return `
      <div class="firmware-manual-file-panel">
        <label class="firmware-manual-file-picker${state.busy ? " is-disabled" : ""}" for="firmwareManualFileInput">
          <span class="material-symbols-outlined">upload_file</span>
          <strong>Pilih UF2</strong>
          <small>${escapeHtml(selectedName)}</small>
          <input id="firmwareManualFileInput" class="firmware-manual-file-input" type="file" accept=".uf2,application/octet-stream"${state.busy ? " disabled" : ""}>
        </label>
        <div class="firmware-manual-file-summary${state.manualFile ? " has-file" : ""}">
          <span>${escapeHtml(selectedName)}</span>
          <small>${escapeHtml(selectedMeta)}</small>
        </div>
      </div>
    `;
  }

  function createDeviceGateMarkup(state) {
    const isChecking = state.detectionStatus === "checking";
    const isMissing = state.detectionStatus === "missing";
    const icon = isChecking ? "sync" : (isMissing ? "usb_off" : "memory");
    const title = isChecking
      ? "Mengecek Device"
      : (isMissing ? "Device Belum Terbaca" : "Update Firmware TeknisiHub");
    const message = isMissing
      ? "Tidak bisa baca versi device. Hubungkan device via USB, lalu klik Cek Ulang."
      : (state.detectionMessage || "Mengecek versi firmware device.");
    return `
      <div class="firmware-update-workbench firmware-update-simple">
        <section class="spi-card firmware-device-gate-card${isMissing ? " is-missing" : ""}">
          <div class="firmware-device-gate-icon${isChecking ? " is-checking" : ""}">
            <span class="material-symbols-outlined">${icon}</span>
          </div>
          <div class="firmware-device-gate-copy">
            <p class="label">Firmware</p>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(message)}</p>
          </div>
          <button type="button" class="ghost firmware-retry-button" id="firmwareRetryDeviceButton"${isChecking ? " disabled" : ""}>
            <span class="material-symbols-outlined">refresh</span>
            <span>${isChecking ? "Mengecek" : "Cek Ulang"}</span>
          </button>
        </section>
      </div>
    `;
  }

  function createOnlinePanel(state) {
    const updateDisableAttr = state.busy || !state.updateAvailable ? " disabled" : "";
    const checkDisableAttr = state.busy ? " disabled" : "";
    const status = state.updateMessage || "Cek file online untuk membandingkan versi.";
    const updateClass = state.updateAvailable ? "has-update" : "";
    const firmwareMeta = state.sha256
      ? `${state.fileSize || "-"} | ${state.sha256.slice(0, 12)}...`
      : (state.fileSize || "-");
    return `
      <div class="firmware-next-panel">
        <div class="spi-firmware-status-grid">
          <div>
            <small>Versi Device</small>
            <strong>${escapeHtml(state.currentVersion || "Belum terbaca")}</strong>
          </div>
          <div>
            <small>Versi Online</small>
            <strong>${escapeHtml(state.latestVersion || "Belum dicek")}</strong>
          </div>
          <div>
            <small>Status</small>
            <strong class="${updateClass}">${escapeHtml(status)}</strong>
          </div>
        </div>
        <div class="firmware-update-action-row">
          <button type="button" class="ghost" id="firmwareCheckUpdateButton"${checkDisableAttr}>
            <span class="material-symbols-outlined">sync</span>
            <span>Cek Online</span>
          </button>
          <button type="button" class="is-hero-action spi-firmware-update-button" id="firmwareRunUpdateButton"${updateDisableAttr}>
            <span class="material-symbols-outlined">system_update_alt</span>
            <strong>${state.updateAvailable ? "Update Online" : "Belum Ada Update"}</strong>
          </button>
        </div>
        <div class="firmware-update-meta">
          <span>${escapeHtml(state.fileName || "teknisihub_device_firmware.uf2")}</span>
          <span>${escapeHtml(firmwareMeta)}</span>
        </div>
      </div>
    `;
  }

  function createManualPanel(state) {
    const updateDisableAttr = state.busy || !state.manualFile ? " disabled" : "";
    return `
      <div class="firmware-next-panel">
        ${createManualFileMarkup(state)}
        <div class="firmware-update-action-row">
          <button type="button" class="is-hero-action spi-firmware-update-button" id="firmwareRunUpdateButton"${updateDisableAttr}>
            <span class="material-symbols-outlined">system_update_alt</span>
            <strong>${state.manualFile ? "Update Manual UF2" : "Pilih UF2"}</strong>
          </button>
        </div>
      </div>
    `;
  }

  function createReadyMarkup(state) {
    const profile = selectedProfile(state.deviceType);
    const statusMessage = state.errorMessage || state.message || "Device siap.";
    return `
      <div class="firmware-update-workbench firmware-update-simple">
        <section class="spi-card firmware-detected-card">
          <div class="firmware-detected-main">
            <span class="material-symbols-outlined">${profile.icon}</span>
            <div>
              <p class="label">Device Terdeteksi</p>
              <h3>${escapeHtml(profile.label)}</h3>
              <small>Jalur update ${escapeHtml(profile.transport)}</small>
            </div>
          </div>
          <div class="firmware-version-pill">
            <small>Versi Firmware</small>
            <strong>${escapeHtml(state.currentVersion)}</strong>
          </div>
          <button type="button" class="ghost firmware-retry-button" id="firmwareRetryDeviceButton"${state.busy ? " disabled" : ""}>
            <span class="material-symbols-outlined">refresh</span>
            <span>Cek Ulang</span>
          </button>
        </section>

        <section class="spi-card firmware-update-device-card">
          <div class="spi-card-title-row">
            <div>
              <p class="label">Sumber UF2</p>
              <h3>Pilih File Update</h3>
            </div>
            <span class="spi-chip">USB UF2</span>
          </div>

          <div class="firmware-update-source-row" aria-label="Sumber UF2">
            ${createSourceButton("online", state)}
            ${createSourceButton("manual", state)}
          </div>

          ${state.source === "manual" ? createManualPanel(state) : createOnlinePanel(state)}
        </section>

        <section class="spi-card firmware-update-log-card">
          <div class="firmware-update-message${state.errorMessage ? " is-error" : ""}">
            ${escapeHtml(statusMessage)}
          </div>
        </section>
      </div>
    `;
  }

  function createMarkup(state) {
    if (!hasReadableDevice(state)) {
      return createDeviceGateMarkup(state);
    }
    return createReadyMarkup(state);
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let notify = () => {};
    let requestToken = 0;
    let isVisible = false;
    let autoDetectStarted = false;

    function render() {
      if (!mountedContainer) {
        return;
      }
      mountedContainer.innerHTML = createMarkup(state);
      bindEvents();
    }

    function clearOnlineUpdateState() {
      state.latestVersion = "";
      state.updateAvailable = false;
      state.updateMessage = "Cek file online untuk membandingkan versi.";
      state.fileName = "";
      state.fileSize = "";
      state.sha256 = "";
    }

    async function readDeviceVersion(deviceType) {
      const payload = await fetchJson(`/tools/oscilloscope/device?deviceType=${encodeURIComponent(deviceType)}`);
      const version = extractFirmwareVersion(payload?.identity);
      const readable = Boolean(payload?.success && payload?.isPresent !== false && version);
      return { payload, readable, version };
    }

    function applyReadableDevice(deviceType, payload, version) {
      const profile = selectedProfile(deviceType);
      state.deviceType = deviceType;
      state.route = "usb";
      state.device = {
        ...(payload || {}),
        isPresent: true,
        deviceLabel: profile.label,
        transport: profile.transport
      };
      state.currentVersion = version;
      state.detectionStatus = "found";
      state.detectionMessage = `Versi firmware device terbaca via ${profile.transport}.`;
      state.message = state.detectionMessage;
      state.errorMessage = "";
      clearOnlineUpdateState();
    }

    async function detectDeviceVersion(options = {}) {
      if (state.busy) {
        return;
      }
      const token = ++requestToken;
      state.busy = true;
      state.detectionStatus = "checking";
      state.device = null;
      state.currentVersion = "";
      state.errorMessage = "";
      clearOnlineUpdateState();
      render();

      let lastErrorMessage = "";
      for (const deviceType of deviceDetectionOrder) {
        if (token !== requestToken) {
          return;
        }
        const profile = selectedProfile(deviceType);
        state.deviceType = deviceType;
        state.route = "usb";
        state.detectionMessage = `Mengecek versi firmware via ${profile.transport}.`;
        state.message = state.detectionMessage;
        render();

        try {
          const result = await readDeviceVersion(deviceType);
          if (token !== requestToken) {
            return;
          }
          if (result.readable) {
            applyReadableDevice(deviceType, result.payload, result.version);
            state.updateMessage = "Mengecek versi online.";
            state.message = "Versi device terbaca. Mengecek versi online.";
            render();
            try {
              await refreshOnlineUpdateStatus({ notify: false, renderBefore: false });
            } catch (error) {
              state.updateMessage = "Gagal mengecek versi online.";
              state.message = state.updateMessage;
              state.errorMessage = sanitizePublicMessage(error?.message || "Gagal mengecek versi online.");
            }
            state.busy = false;
            if (options.notify !== false) {
              notify(state.message, state.errorMessage ? "warning" : (state.updateAvailable ? "info" : "success"));
            }
            render();
            return;
          }
          lastErrorMessage = sanitizePublicMessage(result.payload?.message || "Versi firmware belum terbaca.");
        } catch (error) {
          lastErrorMessage = sanitizePublicMessage(error?.message || "Versi firmware belum terbaca.");
        }
      }

      if (token !== requestToken) {
        return;
      }
      state.busy = false;
      state.deviceType = defaultDeviceType;
      state.route = "usb";
      state.device = null;
      state.currentVersion = "";
      state.detectionStatus = "missing";
      state.detectionMessage = "Tidak bisa baca versi device. Hubungkan device via USB, lalu klik Cek Ulang.";
      state.message = state.detectionMessage;
      state.errorMessage = state.detectionMessage;
      if (options.notify !== false) {
        notify(lastErrorMessage || state.errorMessage, "warning");
      }
      render();
    }

    function startAutoDetect() {
      if (!isVisible || autoDetectStarted || state.busy || hasReadableDevice(state)) {
        return;
      }
      autoDetectStarted = true;
      void detectDeviceVersion({ notify: false });
    }

    function resetDetection() {
      requestToken += 1;
      state.device = null;
      state.currentVersion = "";
      state.detectionStatus = "idle";
      state.detectionMessage = "Mengecek versi firmware device.";
      state.message = state.detectionMessage;
      state.errorMessage = "";
      clearOnlineUpdateState();
      autoDetectStarted = false;
      render();
      startAutoDetect();
    }

    function selectFirmwareSource(source) {
      state.source = source === "manual" ? "manual" : "online";
      state.errorMessage = "";
      state.message = state.source === "manual"
        ? (state.manualFile ? "File UF2 manual siap dipakai." : "Pilih file UF2 manual.")
        : "Cek file online untuk membandingkan versi.";
    }

    function selectManualFile(file) {
      const selectedFile = file || null;
      if (!selectedFile) {
        state.manualFile = null;
        state.manualFileName = "";
        state.manualFileSize = "";
        state.manualSha256 = "";
        state.message = "Pilih file UF2 manual.";
        state.errorMessage = "";
        return;
      }

      if (!String(selectedFile.name || "").toLowerCase().endsWith(".uf2")) {
        state.manualFile = null;
        state.manualFileName = "";
        state.manualFileSize = "";
        state.manualSha256 = "";
        state.message = "File harus berformat UF2.";
        state.errorMessage = state.message;
        notify(state.errorMessage, "warning");
        return;
      }

      state.manualFile = selectedFile;
      state.manualFileName = selectedFile.name;
      state.manualFileSize = formatFileSize(selectedFile.size);
      state.manualSha256 = "";
      state.message = "File UF2 manual siap dipakai.";
      state.errorMessage = "";
    }

    async function withBusy(task) {
      if (state.busy) {
        return;
      }
      state.busy = true;
      state.errorMessage = "";
      render();
      try {
        await task();
      } catch (error) {
        state.errorMessage = sanitizePublicMessage(error?.message || "Operasi firmware gagal.");
        state.message = state.errorMessage;
        notify(state.errorMessage, "warning");
      } finally {
        state.busy = false;
        render();
      }
    }

    function updateFromLatestPayload(payload) {
      state.updateAvailable = Boolean(payload?.updateAvailable);
      state.updateMessage = sanitizePublicMessage(payload?.message || "");
      state.latestVersion = String(payload?.latestVersion || "").trim();
      state.fileName = String(payload?.fileName || "").trim();
      state.fileSize = String(payload?.fileSize || "").trim();
      state.sha256 = String(payload?.sha256 || "").trim();
      if (payload?.currentVersion) {
        state.currentVersion = String(payload.currentVersion || "").trim();
      }
      state.message = state.updateMessage || "Status update online sudah dibaca.";
      state.errorMessage = "";
    }

    async function refreshOnlineUpdateStatus(options = {}) {
      if (!hasReadableDevice(state)) {
        state.errorMessage = "Tidak bisa baca versi device. Hubungkan device via USB, lalu klik Cek Ulang.";
        notify(state.errorMessage, "warning");
        return;
      }
      state.updateMessage = "Mengecek versi online.";
      state.message = "Mengecek versi online.";
      if (options.renderBefore !== false) {
        render();
      }
      const query = `?currentVersion=${encodeURIComponent(state.currentVersion)}`;
      const payload = await fetchJson(`/spi-flash/flash-osc/firmware-update/latest${query}`);
      updateFromLatestPayload(payload);
      if (options.notify !== false) {
        notify(state.message, state.updateAvailable ? "info" : "success");
      }
    }

    async function checkUpdate(options = {}) {
      await refreshOnlineUpdateStatus(options);
    }

    async function runUpdate() {
      if (!hasReadableDevice(state)) {
        notify("Tidak bisa baca versi device. Hubungkan device via USB, lalu klik Cek Ulang.", "warning");
        return;
      }
      if (state.source === "manual") {
        await runManualUpdate();
        return;
      }
      if (!state.updateAvailable) {
        notify("Cek file online dulu.", "info");
        return;
      }
      const payload = await fetchJson("/spi-flash/flash-osc/firmware-update/latest", {
        method: "POST",
        body: JSON.stringify({ route: "usb" })
      });
      state.message = sanitizePublicMessage(payload?.message || "Update firmware berhasil dikirim.");
      state.errorMessage = payload?.success === false ? state.message : "";
      notify(state.message, payload?.success === false ? "warning" : "success");
      if (payload?.latestVersion) {
        state.latestVersion = String(payload.latestVersion || "").trim();
      }
    }

    async function runManualUpdate() {
      if (!state.manualFile) {
        notify("Pilih file UF2 manual dulu.", "warning");
        return;
      }
      const formData = new FormData();
      formData.set("route", "usb");
      formData.set("file", state.manualFile);
      const payload = await fetchJson("/spi-flash/flash-osc/firmware-update", {
        method: "POST",
        body: formData
      });
      state.message = sanitizePublicMessage(payload?.message || "Update firmware manual berhasil dikirim.");
      state.errorMessage = payload?.success === false ? state.message : "";
      state.manualFileName = String(payload?.fileName || state.manualFileName || "").trim();
      state.manualFileSize = String(payload?.fileSize || state.manualFileSize || "").trim();
      state.manualSha256 = String(payload?.sha256 || state.manualSha256 || "").trim();
      notify(state.message, payload?.success === false ? "warning" : "success");
    }

    function bindEvents() {
      mountedContainer?.querySelector("#firmwareRetryDeviceButton")?.addEventListener("click", () => {
        resetDetection();
      });

      mountedContainer?.querySelectorAll("[data-firmware-source]").forEach((button) => {
        button.addEventListener("click", () => {
          selectFirmwareSource(button.getAttribute("data-firmware-source"));
          render();
        });
      });

      mountedContainer?.querySelector("#firmwareManualFileInput")?.addEventListener("change", (event) => {
        selectManualFile(event.target.files?.[0] || null);
        render();
      });

      mountedContainer?.querySelector("#firmwareCheckUpdateButton")?.addEventListener("click", () => {
        void withBusy(() => checkUpdate());
      });

      mountedContainer?.querySelector("#firmwareRunUpdateButton")?.addEventListener("click", () => {
        void withBusy(() => runUpdate());
      });
    }

    return {
      viewKey: "tool_firmware_update",
      eyebrow: "Firmware",
      title: "Update Firmware TeknisiHub",
      subtitle: "Update firmware TEKNISIHUB_DEVICE via USB/BOOTSEL.",
      items: [],
      mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        if (typeof options.notify === "function") {
          notify = options.notify;
        }
        isVisible = Boolean(mountedContainer && !mountedContainer.classList.contains("hidden"));
        render();
        startAutoDetect();
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }
        const nextVisible = Boolean(visible);
        mountedContainer.classList.toggle("hidden", !nextVisible);
        if (nextVisible && !isVisible && state.detectionStatus === "missing") {
          autoDetectStarted = false;
        }
        isVisible = nextVisible;
        if (isVisible) {
          render();
          startAutoDetect();
        }
      },
      refresh() {
        render();
        startAutoDetect();
      }
    };
  }

  globalScope.teknisiHubPages = {
    ...(globalScope.teknisiHubPages || {}),
    firmwareUpdate: createApi()
  };
})(window);
