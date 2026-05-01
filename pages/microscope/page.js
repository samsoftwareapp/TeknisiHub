(function initializeMicroscopePage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const zoomStep = 0.1;
  const minZoom = 1;
  const maxZoom = 5;
  const resolutionPresets = [
    { value: "auto", label: "Auto" },
    { value: "320x240", label: "320 x 240" },
    { value: "640x480", label: "640 x 480" },
    { value: "800x600", label: "800 x 600" },
    { value: "1024x768", label: "1024 x 768" },
    { value: "1280x720", label: "1280 x 720" },
    { value: "1280x1024", label: "1280 x 1024" },
    { value: "1600x1200", label: "1600 x 1200" },
    { value: "1920x1080", label: "1920 x 1080" }
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  function clampZoom(value) {
    const nextValue = Number(value || 1);
    return Math.min(maxZoom, Math.max(minZoom, nextValue));
  }

  function formatZoom(value) {
    return `${Math.round(clampZoom(value) * 100)}%`;
  }

  async function fetchJson(path, options = {}) {
    const requestUrl = `${serviceBaseUrl}${path}`;
    const response = await fetch(requestUrl, {
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

  function buildResolutionOptions(state) {
    const options = [...resolutionPresets];
    const actualResolutionValue = state.actualResolution && state.actualResolution !== "Auto"
      ? state.actualResolution.toLowerCase()
      : "";

    if (actualResolutionValue && !options.some((item) => item.value.toLowerCase() === actualResolutionValue)) {
      options.push({
        value: actualResolutionValue,
        label: `${state.actualResolution} (Detected)`
      });
    }

    return options.map((item) => `
      <option value="${escapeHtml(item.value)}"${item.value === state.selectedResolution ? " selected" : ""}>
        ${escapeHtml(item.label)}
      </option>
    `).join("");
  }

  function createInitialState() {
    return {
      scanning: false,
      streaming: false,
      selectedDeviceId: "",
      selectedResolution: "auto",
      zoomLevel: 1,
      actualResolution: "Auto",
      devices: [],
      streamUrl: "",
      message: "Klik Scan Camera untuk mendeteksi microscope USB atau kamera internal lewat local service.",
      errorMessage: "",
      debugLines: ["Mode microscope sekarang memakai LocalService untuk akses camera."]
    };
  }

  function createWorkbenchMarkup(state) {
    const disableAttr = state.scanning ? " disabled" : "";
    const selectedDeviceLabel = state.devices.find((device) => device.deviceId === state.selectedDeviceId)?.label
      || "Belum ada kamera dipilih";

    return `
      <div class="spi-layout microscope-layout">
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Camera Control</p>
              <h4>Pilih device microscope</h4>
            </div>
            <button type="button" id="microscopeScanButton" class="ghost"${disableAttr}>
              <span class="material-symbols-outlined${state.scanning ? " is-spinning" : ""}">${state.scanning ? "progress_activity" : "videocam"}</span>
              <span>${state.scanning ? "Scanning..." : "Scan Camera"}</span>
            </button>
          </div>

          <div class="spi-form-grid microscope-form-grid">
            <label>
              Pilih Camera
              <select id="microscopeDeviceSelect"${disableAttr}>
                ${state.devices.length > 0
                  ? state.devices.map((device) => `
                      <option value="${escapeHtml(device.deviceId)}"${device.deviceId === state.selectedDeviceId ? " selected" : ""}>
                        ${escapeHtml(device.label)}
                      </option>
                    `).join("")
                  : `<option value="">Belum ada camera terdeteksi</option>`}
              </select>
            </label>
            <label>
              Ukuran Preview
              <select id="microscopeResolutionSelect"${disableAttr}>
                ${buildResolutionOptions(state)}
              </select>
            </label>
            <label>
              Device Aktif
              <input type="text" value="${escapeHtml(selectedDeviceLabel)}" readonly>
            </label>
            <label>
              Zoom
              <input id="microscopeZoomValue" type="text" value="${escapeHtml(formatZoom(state.zoomLevel))}" readonly>
            </label>
          </div>

          <div class="microscope-actions">
            <button type="button" id="microscopeStartButton" class="ghost"${disableAttr}${state.selectedDeviceId ? "" : " disabled"}>
              <span class="material-symbols-outlined">play_circle</span>
              <span>Tampilkan</span>
            </button>
            <button type="button" id="microscopeStopButton" class="ghost"${disableAttr}${state.streaming ? "" : " disabled"}>
              <span class="material-symbols-outlined">stop_circle</span>
              <span>Stop</span>
            </button>
            <button type="button" id="microscopeZoomOutButton" class="ghost"${disableAttr}>
              <span class="material-symbols-outlined">zoom_out</span>
              <span>Zoom Out</span>
            </button>
            <button type="button" id="microscopeZoomResetButton" class="ghost"${disableAttr}>
              <span class="material-symbols-outlined">center_focus_strong</span>
              <span>Reset Zoom</span>
            </button>
            <button type="button" id="microscopeZoomInButton" class="ghost"${disableAttr}>
              <span class="material-symbols-outlined">zoom_in</span>
              <span>Zoom In</span>
            </button>
          </div>

          <p id="microscopeNote" class="spi-note">${escapeHtml(state.errorMessage || state.message)}</p>

          <details class="microscope-debug-panel">
            <summary>Debug Camera</summary>
            <pre id="microscopeDebugLog" class="microscope-debug-log">${escapeHtml(state.debugLines.join("\n"))}</pre>
          </details>
        </section>

        <section id="microscopePreviewPanel" class="spi-card microscope-preview-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Live Preview</p>
              <h4>Stream dari Local Service</h4>
            </div>
            <div class="microscope-panel-actions">
              <button type="button" id="microscopeFullscreenButton" class="ghost"${disableAttr}>
                <span class="material-symbols-outlined">fullscreen</span>
                <span>Full Screen</span>
              </button>
              <span id="microscopeStreamBadge" class="spi-mini-badge">${state.streaming ? "Live" : "Standby"}</span>
            </div>
          </div>

          <div id="microscopeViewport" class="microscope-viewport">
            <img
              id="microscopePreviewImage"
              class="microscope-video${state.streaming ? " is-ready" : ""}"
              alt="Microscope preview dari local service">
            <div id="microscopeOverlay" class="microscope-overlay${state.streaming ? " hidden" : ""}">
              <span class="material-symbols-outlined">videocam</span>
              <strong>Preview belum aktif</strong>
              <p>Scan camera lewat local service, pilih device, lalu klik Tampilkan.</p>
            </div>
          </div>

          <div class="spi-inline-meta microscope-meta">
            <span>Resolusi aktif <strong id="microscopeActualResolutionLabel">${escapeHtml(state.actualResolution)}</strong></span>
            <span>Device terdeteksi <strong>${escapeHtml(String(state.devices.length))}</strong></span>
          </div>
        </section>
      </div>
    `;
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let notify = () => {};
    let isVisible = false;
    let hasLoadedOnce = false;

    function pushDebug(message) {
      const nextLine = String(message || "").trim();
      if (!nextLine) {
        return;
      }

      state.debugLines = [...state.debugLines, nextLine].slice(-12);
      syncDebugLog();
    }

    function syncDebugLog() {
      const debugLog = mountedContainer?.querySelector("#microscopeDebugLog");
      if (debugLog) {
        debugLog.textContent = state.debugLines.join("\n");
      }
    }

    function syncStatusText() {
      const note = mountedContainer?.querySelector("#microscopeNote");
      if (note) {
        note.textContent = state.errorMessage || state.message;
      }
    }

    function syncPreviewMeta() {
      const actualResolutionLabel = mountedContainer?.querySelector("#microscopeActualResolutionLabel");
      const zoomValue = mountedContainer?.querySelector("#microscopeZoomValue");
      const streamBadge = mountedContainer?.querySelector("#microscopeStreamBadge");
      const overlay = mountedContainer?.querySelector("#microscopeOverlay");
      const previewImage = mountedContainer?.querySelector("#microscopePreviewImage");
      const stopButton = mountedContainer?.querySelector("#microscopeStopButton");

      if (actualResolutionLabel) {
        actualResolutionLabel.textContent = state.actualResolution;
      }
      if (zoomValue) {
        zoomValue.value = formatZoom(state.zoomLevel);
      }
      if (streamBadge) {
        streamBadge.textContent = state.streaming ? "Live" : "Standby";
      }
      if (overlay) {
        overlay.classList.toggle("hidden", state.streaming);
      }
      if (previewImage) {
        previewImage.classList.toggle("is-ready", state.streaming);
      }
      if (stopButton) {
        stopButton.disabled = !state.streaming || state.scanning;
      }
    }

    function applyPreviewTransform() {
      const previewImage = mountedContainer?.querySelector("#microscopePreviewImage");
      if (previewImage) {
        previewImage.style.transform = `scale(${clampZoom(state.zoomLevel)})`;
      }
    }

    function updateZoom(nextZoom) {
      state.zoomLevel = clampZoom(nextZoom);
      applyPreviewTransform();
      syncPreviewMeta();
    }

    function buildStreamUrl() {
      const params = new URLSearchParams({
        deviceId: state.selectedDeviceId,
        resolution: state.selectedResolution,
        _: Date.now().toString()
      });

      return `${serviceBaseUrl}/tools/microscope/stream?${params.toString()}`;
    }

    function stopPreview(reason = "Preview microscope dihentikan.") {
      state.streaming = false;
      state.streamUrl = "";
      state.actualResolution = state.selectedResolution === "auto"
        ? "Auto"
        : state.selectedResolution;
      state.message = reason;
      state.errorMessage = "";
      pushDebug(reason);

      const previewImage = mountedContainer?.querySelector("#microscopePreviewImage");
      if (previewImage) {
        previewImage.removeAttribute("src");
      }

      render();
    }

    async function scanDevices() {
      state.scanning = true;
      state.streaming = false;
      state.streamUrl = "";
      state.errorMessage = "";
      state.actualResolution = "Auto";
      state.message = "Mendeteksi camera lewat local service...";
      pushDebug("Scan camera dimulai lewat local service.");
      render();

      try {
        const result = await fetchJson("/tools/microscope/devices");
        state.devices = Array.isArray(result.devices) ? result.devices : [];

        if (!state.devices.length) {
          state.selectedDeviceId = "";
          state.message = result.message || "Tidak ada camera yang terdeteksi oleh local service.";
          pushDebug("Local service tidak menemukan camera yang bisa dibuka.");
          return;
        }

        if (!state.devices.some((device) => device.deviceId === state.selectedDeviceId)) {
          state.selectedDeviceId = state.devices[0].deviceId;
        }

        state.message = result.message || `${state.devices.length} camera terdeteksi oleh local service.`;
        state.errorMessage = "";
        pushDebug(`${state.devices.length} camera siap dipakai oleh local service.`);
        notify(state.message);
      } catch (error) {
        state.devices = [];
        state.selectedDeviceId = "";
        state.errorMessage = error?.message || "Gagal mendeteksi camera dari local service.";
        pushDebug(`Scan gagal: ${state.errorMessage}`);
      } finally {
        state.scanning = false;
        render();
      }
    }

    function startPreview() {
      if (!state.selectedDeviceId) {
        state.errorMessage = "Pilih camera terlebih dahulu.";
        pushDebug("Tombol Tampilkan ditekan tanpa camera terpilih.");
        render();
        return;
      }

      const selectedDevice = state.devices.find((device) => device.deviceId === state.selectedDeviceId);
      state.streaming = true;
      state.errorMessage = "";
      state.actualResolution = state.selectedResolution === "auto"
        ? "Auto"
        : state.selectedResolution;
      state.streamUrl = buildStreamUrl();
      state.message = `Meminta stream local service untuk ${selectedDevice?.label || "camera terpilih"}.`;
      pushDebug(`Preview dimulai via local service: ${selectedDevice?.label || state.selectedDeviceId}, resolusi ${state.selectedResolution}.`);
      render();
    }

    function bindPreviewImage(previewImage) {
      if (!previewImage) {
        return;
      }

      previewImage.addEventListener("load", () => {
        if (previewImage.naturalWidth && previewImage.naturalHeight) {
          state.actualResolution = `${previewImage.naturalWidth}x${previewImage.naturalHeight}`;
          state.message = "Preview microscope aktif dari local service.";
          state.errorMessage = "";
          syncStatusText();
          syncPreviewMeta();
          pushDebug(`Frame awal diterima: ${state.actualResolution}.`);
        }
      }, { once: true });

      previewImage.addEventListener("error", () => {
        if (!state.streaming) {
          return;
        }

        state.streaming = false;
        state.streamUrl = "";
        state.errorMessage = "Preview dari local service gagal dimuat. Pastikan camera tidak sedang dipakai aplikasi lain.";
        pushDebug("Tag IMG gagal memuat stream MJPEG dari local service.");
        render();
      }, { once: true });

      previewImage.dataset.streamUrl = state.streamUrl;
      previewImage.src = state.streamUrl;
      applyPreviewTransform();
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state);

      const scanButton = mountedContainer.querySelector("#microscopeScanButton");
      const deviceSelect = mountedContainer.querySelector("#microscopeDeviceSelect");
      const resolutionSelect = mountedContainer.querySelector("#microscopeResolutionSelect");
      const startButton = mountedContainer.querySelector("#microscopeStartButton");
      const stopButton = mountedContainer.querySelector("#microscopeStopButton");
      const zoomInButton = mountedContainer.querySelector("#microscopeZoomInButton");
      const zoomOutButton = mountedContainer.querySelector("#microscopeZoomOutButton");
      const zoomResetButton = mountedContainer.querySelector("#microscopeZoomResetButton");
      const fullscreenButton = mountedContainer.querySelector("#microscopeFullscreenButton");
      const previewPanel = mountedContainer.querySelector("#microscopePreviewPanel");
      const viewport = mountedContainer.querySelector("#microscopeViewport");
      const previewImage = mountedContainer.querySelector("#microscopePreviewImage");

      syncStatusText();
      syncPreviewMeta();

      scanButton?.addEventListener("click", () => {
        scanDevices();
      });

      startButton?.addEventListener("click", () => {
        startPreview();
      });

      stopButton?.addEventListener("click", () => {
        stopPreview("Preview microscope dihentikan dari Web UI.");
      });

      fullscreenButton?.addEventListener("click", async () => {
        const fullscreenTarget = previewPanel || viewport;
        if (!fullscreenTarget) {
          return;
        }

        if (document.fullscreenElement === fullscreenTarget) {
          await document.exitFullscreen();
          return;
        }

        await fullscreenTarget.requestFullscreen();
      });

      deviceSelect?.addEventListener("change", () => {
        state.selectedDeviceId = deviceSelect.value || "";
        state.zoomLevel = 1;
        state.actualResolution = "Auto";
        state.errorMessage = "";
        state.message = state.selectedDeviceId
          ? "Camera dipilih. Klik Tampilkan untuk membuka stream dari local service."
          : "Pilih camera terlebih dahulu.";
        pushDebug(`Device aktif diganti ke ${state.devices.find((device) => device.deviceId === state.selectedDeviceId)?.label || state.selectedDeviceId || "kosong"}.`);

        if (state.streaming) {
          startPreview();
          return;
        }

        render();
      });

      resolutionSelect?.addEventListener("change", () => {
        state.selectedResolution = resolutionSelect.value || "auto";
        state.zoomLevel = 1;
        state.errorMessage = "";
        state.actualResolution = state.selectedResolution === "auto"
          ? "Auto"
          : state.selectedResolution;
        pushDebug(`Resolusi dipilih: ${state.selectedResolution}.`);

        if (state.streaming) {
          startPreview();
          return;
        }

        render();
      });

      zoomInButton?.addEventListener("click", () => updateZoom(state.zoomLevel + zoomStep));
      zoomOutButton?.addEventListener("click", () => updateZoom(state.zoomLevel - zoomStep));
      zoomResetButton?.addEventListener("click", () => updateZoom(1));

      viewport?.addEventListener("wheel", (event) => {
        if (!event.ctrlKey) {
          return;
        }

        event.preventDefault();
        updateZoom(state.zoomLevel + (event.deltaY < 0 ? zoomStep : -zoomStep));
      }, { passive: false });

      if (state.streamUrl && previewImage) {
        bindPreviewImage(previewImage);
      } else {
        applyPreviewTransform();
      }
    }

    return {
      viewKey: "tool_microscope",
      eyebrow: "Microscope",
      title: "Microscope",
      subtitle: "Preview microscope USB atau camera internal lewat local service.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        notify = typeof options.notify === "function" ? options.notify : notify;
        render();
      },
      setVisible(visible) {
        isVisible = Boolean(visible);
        if (!mountedContainer) {
          return;
        }

        mountedContainer.classList.toggle("hidden", !visible);
        if (!visible && state.streaming) {
          stopPreview("Preview microscope dihentikan karena panel disembunyikan.");
        }
      },
      async refresh() {
        if (!isVisible) {
          return;
        }

        if (!hasLoadedOnce) {
          hasLoadedOnce = true;
          await scanDevices();
          return;
        }

        render();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.microscope = createApi();
})(window);
