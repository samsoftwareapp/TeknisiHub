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
      logs: [
        "[--:--:--] Local service SPI Flash belum bisa dijangkau dari Web UI."
      ],
      hexPreview: [
        "Belum ada data."
      ],
      profile
    };
  }

  function mapServiceSessionToState(session) {
    const selectedDevice = session.selectedDevice || "CH347";
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
      logs: Array.isArray(session.logs) ? session.logs : [],
      hexPreview: Array.isArray(session.hexPreview) ? session.hexPreview : [],
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

  function createWorkbenchMarkup(state, busy) {
    const profile = state.profile || deviceProfiles.CH347;
    const progressWidth = Math.max(0, Math.min(100, Number(state.progress) || 0));
    const controlsDisabled = !state.serviceAvailable || busy;
    const disableAttr = controlsDisabled ? " disabled" : "";
    const chipLabel = [state.chipVendor, state.chipModel].filter(Boolean).join(" ");
    const chipMeta = [];
    if (state.chipCapacity) {
      chipMeta.push(state.chipCapacity);
    }
    if (state.jedec) {
      chipMeta.push(`JEDEC ${state.jedec}`);
    }
    const pageLabel = state.pageSize > 0 ? `${state.pageSize} byte` : "Belum ada data";
    const fileNameLabel = state.fileName || "Belum ada file";
    const fileSizeLabel = state.fileSize || "-";
    const startAddressLabel = state.startAddress || "-";
    const lengthLabel = state.length || "-";
    const verifyLabel = state.verifyMode || "-";
    const lastUpdatedLabel = state.lastUpdated || "-";
    const normalizedConnectionState = (state.connectionState || "").trim().toLowerCase();
    const isConnected = normalizedConnectionState.length > 0 &&
      !normalizedConnectionState.includes("belum terhubung") &&
      normalizedConnectionState.includes("terhubung");
    const statsStateClass = isConnected ? " is-connected" : " is-disconnected";

    return `
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

      <div class="spi-stats-grid">
        <article class="spi-stat-card${statsStateClass}">
          <span class="material-symbols-outlined">usb</span>
          <div>
            <p class="label">Transport</p>
            <strong>${escapeHtml(profile.transport)}</strong>
            <p>${escapeHtml(state.connectionState)}</p>
          </div>
        </article>
        <article class="spi-stat-card${statsStateClass}">
          <span class="material-symbols-outlined">memory</span>
          <div>
            <p class="label">Chip Aktif</p>
            <strong>${escapeHtml(chipLabel || "Belum ada data")}</strong>
            <p>${escapeHtml(chipMeta.join(" • ") || "Belum detect")}</p>
          </div>
        </article>
        <article class="spi-stat-card${statsStateClass}">
          <span class="material-symbols-outlined">speed</span>
          <div>
            <p class="label">Clock & Page</p>
            <strong>Clock belum dibaca</strong>
            <p>Page size ${escapeHtml(pageLabel)}</p>
          </div>
        </article>
        <article class="spi-stat-card${statsStateClass}">
          <span class="material-symbols-outlined">task_alt</span>
          <div>
            <p class="label">Operasi Terakhir</p>
            <strong>${escapeHtml(state.lastResult)}</strong>
            <p>${escapeHtml(lastUpdatedLabel)}</p>
          </div>
        </article>
      </div>

      <div class="spi-layout">
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Device Backend</p>
              <h4>Pilih programmer</h4>
            </div>
            <button type="button" class="ghost spi-connect-button" data-spi-action="connect"${disableAttr}>
              <span class="material-symbols-outlined">cable</span>
              <span>${busy ? "Memproses..." : "Connect device"}</span>
            </button>
          </div>
          <div class="spi-device-grid">
            ${Object.entries(deviceProfiles).map(([key, item]) => `
              <button
                type="button"
                class="spi-device-button${key === state.selectedDevice ? " is-active" : ""}"
                data-device="${escapeHtml(key)}"${disableAttr}>
                <strong>${escapeHtml(item.label)}</strong>
                <span>${escapeHtml(item.status)}</span>
              </button>
            `).join("")}
          </div>
          <p class="spi-note">${escapeHtml(profile.note)}</p>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Chip Profile</p>
              <h4>Parameter flash</h4>
            </div>
            <button type="button" class="ghost" data-spi-action="detect"${disableAttr}>
              <span class="material-symbols-outlined">radar</span>
              <span>Detect JEDEC</span>
            </button>
          </div>
          <div class="spi-form-grid">
            <label>
              Vendor
              <input data-field="chipVendor" type="text" value="${escapeHtml(state.chipVendor)}" placeholder="Contoh: Winbond" readonly${disableAttr}>
            </label>
            <label>
              Model
              <input data-field="chipModel" type="text" value="${escapeHtml(state.chipModel)}" placeholder="Contoh: W25Q64JV" readonly${disableAttr}>
            </label>
            <label>
              Capacity
              <input data-field="chipCapacity" type="text" value="${escapeHtml(state.chipCapacity)}" placeholder="Contoh: 8 MB" readonly${disableAttr}>
            </label>
            <label>
              Page Size
              <input data-field="pageSize" type="number" min="1" value="${escapeHtml(state.pageSize > 0 ? String(state.pageSize) : "")}" placeholder="256"${disableAttr}>
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
          <div class="spi-action-grid">
            <button type="button" data-spi-action="read"${disableAttr}>
              <span class="material-symbols-outlined">download</span>
              <span>Read</span>
            </button>
            <button type="button" data-spi-action="erase"${disableAttr}>
              <span class="material-symbols-outlined">ink_eraser</span>
              <span>Erase</span>
            </button>
            <button type="button" data-spi-action="write"${disableAttr}>
              <span class="material-symbols-outlined">upload</span>
              <span>Write</span>
            </button>
            <button type="button" data-spi-action="verify"${disableAttr}>
              <span class="material-symbols-outlined">rule</span>
              <span>Verify</span>
            </button>
            <button type="button" data-spi-action="auto"${disableAttr}>
              <span class="material-symbols-outlined">smart_toy</span>
              <span>Auto</span>
            </button>
            <button type="button" class="ghost" data-spi-action="reset"${disableAttr}>
              <span class="material-symbols-outlined">restart_alt</span>
              <span>Reset Session</span>
            </button>
          </div>
          <div class="spi-progress-panel">
            <div class="spi-progress-copy">
              <span class="label">Session Progress</span>
              <strong>${escapeHtml(state.activeOperation || "Belum ada operasi")}</strong>
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
              <h4>Data baca</h4>
            </div>
            <span class="spi-mini-badge">${escapeHtml(fileNameLabel)}</span>
          </div>
          <pre class="spi-hex-preview">${escapeHtml((state.hexPreview || []).join("\n"))}</pre>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Session Log</p>
              <h4>Aktivitas terbaru</h4>
            </div>
            <span class="spi-mini-badge">${escapeHtml(state.backendMode)}</span>
          </div>
          <div class="spi-log-list">
            ${(state.logs || []).map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
          </div>
        </section>
      </div>
    `;
  }

  function createApi() {
    let state = createUnavailableState();
    let mountedContainer = null;
    let busy = false;

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

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy);

      mountedContainer.querySelectorAll("[data-device]").forEach((button) => {
        button.addEventListener("click", () => withBusy(async () => {
          const nextDevice = button.getAttribute("data-device");
          if (!nextDevice || !deviceProfiles[nextDevice] || !state.serviceAvailable) {
            return;
          }

          const session = await fetchJson("/spi-flash/device", {
            method: "POST",
            body: JSON.stringify({ deviceType: nextDevice })
          });

          state = mapServiceSessionToState(session);
          render();
        }));
      });

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

          state = mapServiceSessionToState(session);
          render();
        }));
      }

      mountedContainer.querySelectorAll("[data-spi-action]").forEach((button) => {
        button.addEventListener("click", () => withBusy(async () => {
          const action = button.getAttribute("data-spi-action");
          if (!action || !state.serviceAvailable) {
            return;
          }

          if (action === "reset") {
            const session = await fetchJson("/spi-flash/reset", {
              method: "POST",
              body: JSON.stringify({})
            });

            state = mapServiceSessionToState(session);
            render();
            return;
          }

          const session = await fetchJson(`/spi-flash/actions/${encodeURIComponent(action)}`, {
            method: "POST",
            body: JSON.stringify(collectActionPayload())
          });

          state = mapServiceSessionToState(session);
          render();
        }));
      });
    }

    async function withBusy(work) {
      if (busy) {
        return;
      }

      busy = true;
      render();

      try {
        await work();
      } catch (error) {
        state.errorMessage = error?.message || "Operasi SPI Flash gagal.";
        render();
      } finally {
        busy = false;
        render();
      }
    }

    async function loadSessionFromService() {
      try {
        const session = await fetchJson("/spi-flash/session");
        state = mapServiceSessionToState(session);
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
