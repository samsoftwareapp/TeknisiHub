(function initializeMicroscopePage(globalScope) {
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
      permissionGranted: false,
      selectedDeviceId: "",
      selectedResolution: "auto",
      zoomLevel: 1,
      actualResolution: "Auto",
      devices: [],
      message: "Klik Scan Camera untuk mendeteksi microscope USB atau kamera internal yang tersedia.",
      errorMessage: ""
    };
  }

  function createWorkbenchMarkup(state) {
    const disableAttr = state.scanning ? " disabled" : "";
    const selectedDeviceLabel = state.devices.find((device) => device.deviceId === state.selectedDeviceId)?.label
      || "Belum ada kamera dipilih";

    return `
      <div class="spi-workbench-hero microscope-hero">
        <div>
          <p class="label">Microscope</p>
          <h3>Preview live microscope USB dan kamera servis</h3>
          <p class="spi-workbench-copy">Scan semua kamera yang terdeteksi, pilih device, atur ukuran resolusi, lalu zoom pakai tombol atau Ctrl + scroll langsung pada preview.</p>
        </div>
        <div class="spi-workbench-badge-row">
          <span class="spi-status-pill">${state.devices.length} camera</span>
          <span class="spi-status-pill">${escapeHtml(state.actualResolution)}</span>
          <span class="spi-status-pill">${escapeHtml(formatZoom(state.zoomLevel))}</span>
        </div>
      </div>

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
                  ? state.devices.map((device, index) => `
                      <option value="${escapeHtml(device.deviceId)}"${device.deviceId === state.selectedDeviceId ? " selected" : ""}>
                        ${escapeHtml(device.label || `Camera ${index + 1}`)}
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
              <input type="text" value="${escapeHtml(formatZoom(state.zoomLevel))}" readonly>
            </label>
          </div>

          <div class="microscope-actions">
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

          <p class="spi-note">${escapeHtml(state.errorMessage || state.message)}</p>
        </section>

        <section class="spi-card microscope-preview-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Live Preview</p>
              <h4>Ctrl + scroll untuk zoom</h4>
            </div>
            <span class="spi-mini-badge">${state.streaming ? "Live" : "Standby"}</span>
          </div>

          <div id="microscopeViewport" class="microscope-viewport">
            <video
              id="microscopeVideo"
              class="microscope-video${state.streaming ? " is-ready" : ""}"
              autoplay
              playsinline
              muted></video>
            <div class="microscope-overlay${state.streaming ? " hidden" : ""}">
              <span class="material-symbols-outlined">mic</span>
              <strong>Preview belum aktif</strong>
              <p>Scan camera lalu pilih device yang ingin dipakai.</p>
            </div>
          </div>

          <div class="spi-inline-meta microscope-meta">
            <span>Resolusi aktif <strong>${escapeHtml(state.actualResolution)}</strong></span>
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
    let currentStream = null;
    let isVisible = false;
    let hasLoadedOnce = false;
    let deviceChangeBound = false;

    function stopCurrentStream() {
      if (!currentStream) {
        const videoElement = mountedContainer?.querySelector("#microscopeVideo");
        if (videoElement) {
          videoElement.srcObject = null;
        }
        return;
      }

      currentStream.getTracks().forEach((track) => track.stop());
      currentStream = null;

      const videoElement = mountedContainer?.querySelector("#microscopeVideo");
      if (videoElement) {
        videoElement.pause?.();
        videoElement.srcObject = null;
      }
    }

    function applyVideoTransform() {
      if (!mountedContainer) {
        return;
      }

      const videoElement = mountedContainer.querySelector("#microscopeVideo");
      if (videoElement) {
        videoElement.style.transform = `scale(${clampZoom(state.zoomLevel)})`;
      }
    }

    function updateZoom(nextZoom) {
      state.zoomLevel = clampZoom(nextZoom);
      applyVideoTransform();
    }

    async function attachStreamToVideoElement(stream) {
      const videoElement = mountedContainer?.querySelector("#microscopeVideo");
      if (!videoElement) {
        return false;
      }

      if (videoElement.srcObject !== stream) {
        videoElement.srcObject = stream;
      }

      if (typeof videoElement.load === "function") {
        videoElement.load();
      }

      const metadataPromise = new Promise((resolve) => {
        if (videoElement.readyState >= 1) {
          resolve();
          return;
        }

        const handleLoadedMetadata = () => {
          videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
          resolve();
        };

        videoElement.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
      });

      await metadataPromise;
      await videoElement.play();
      applyVideoTransform();
      return true;
    }

    async function requestCameraPermission() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      state.permissionGranted = true;
      stream.getTracks().forEach((track) => track.stop());
    }

    async function scanDevices(options = {}) {
      if (!navigator.mediaDevices?.enumerateDevices || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("Browser ini belum mendukung akses camera via MediaDevices.");
      }

      state.scanning = true;
      state.errorMessage = "";
      state.message = options.silent ? state.message : "Mendeteksi camera yang tersedia...";
      render();

      try {
        if (!state.permissionGranted || options.forcePermission) {
          await requestCameraPermission();
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices
          .filter((device) => device.kind === "videoinput")
          .map((device, index) => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${index + 1}`
          }));

        state.devices = videoInputs;

        if (!videoInputs.length) {
          state.selectedDeviceId = "";
          state.streaming = false;
          state.actualResolution = "Auto";
          stopCurrentStream();
          state.message = "Tidak ada camera yang terdeteksi. Pastikan microscope USB atau camera laptop sudah terhubung.";
          return;
        }

        if (!videoInputs.some((device) => device.deviceId === state.selectedDeviceId)) {
          state.selectedDeviceId = videoInputs[0].deviceId;
        }

        state.message = `${videoInputs.length} camera terdeteksi. Preview sedang disiapkan.`;
        await startPreview();
      } catch (error) {
        state.devices = [];
        state.selectedDeviceId = "";
        state.streaming = false;
        stopCurrentStream();
        state.errorMessage = error?.message || "Gagal mendeteksi camera.";
      } finally {
        state.scanning = false;
        render();
      }
    }

    function parseResolution(value) {
      const normalized = String(value || "auto").trim().toLowerCase();
      if (!normalized || normalized === "auto") {
        return null;
      }

      const [widthValue, heightValue] = normalized.split("x");
      const width = Number(widthValue);
      const height = Number(heightValue);
      if (!Number.isFinite(width) || !Number.isFinite(height)) {
        return null;
      }

      return { width, height };
    }

    async function startPreview() {
      if (!state.selectedDeviceId) {
        state.streaming = false;
        state.actualResolution = "Auto";
        render();
        return;
      }

      stopCurrentStream();
      state.streaming = false;
      state.errorMessage = "";
      state.message = "Menghubungkan preview camera...";
      render();

      const resolution = parseResolution(state.selectedResolution);
      const videoConstraints = {
        deviceId: { exact: state.selectedDeviceId }
      };

      if (resolution) {
        videoConstraints.width = { ideal: resolution.width };
        videoConstraints.height = { ideal: resolution.height };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      currentStream = stream;

      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings?.() || {};
      if (settings.width && settings.height) {
        state.actualResolution = `${settings.width}x${settings.height}`;
      } else if (resolution) {
        state.actualResolution = `${resolution.width}x${resolution.height}`;
      } else {
        state.actualResolution = "Auto";
      }

      const attached = await attachStreamToVideoElement(stream);
      if (!attached) {
        throw new Error("Elemen preview camera tidak ditemukan.");
      }

      state.streaming = true;
      state.message = `Preview aktif untuk ${state.devices.find((device) => device.deviceId === state.selectedDeviceId)?.label || "camera terpilih"}.`;
      state.errorMessage = "";

      render();
    }

    function bindDeviceChangeListener() {
      if (deviceChangeBound || !navigator.mediaDevices?.addEventListener) {
        return;
      }

      navigator.mediaDevices.addEventListener("devicechange", async () => {
        if (!isVisible) {
          return;
        }

        await scanDevices({ silent: true });
        notify("Perubahan device camera terdeteksi. Daftar camera sudah diperbarui.");
      });
      deviceChangeBound = true;
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state);

      const scanButton = mountedContainer.querySelector("#microscopeScanButton");
      const deviceSelect = mountedContainer.querySelector("#microscopeDeviceSelect");
      const resolutionSelect = mountedContainer.querySelector("#microscopeResolutionSelect");
      const zoomInButton = mountedContainer.querySelector("#microscopeZoomInButton");
      const zoomOutButton = mountedContainer.querySelector("#microscopeZoomOutButton");
      const zoomResetButton = mountedContainer.querySelector("#microscopeZoomResetButton");
      const viewport = mountedContainer.querySelector("#microscopeViewport");
      const videoElement = mountedContainer.querySelector("#microscopeVideo");

      if (videoElement && currentStream) {
        videoElement.srcObject = currentStream;
        videoElement.play().catch((error) => {
          state.streaming = false;
          state.errorMessage = error?.message || "Preview camera tidak bisa diputar.";
          render();
        });
        applyVideoTransform();
      }

      scanButton?.addEventListener("click", async () => {
        await scanDevices();
      });

      deviceSelect?.addEventListener("change", async () => {
        state.selectedDeviceId = deviceSelect.value || "";
        state.zoomLevel = 1;
        await startPreview().catch((error) => {
          stopCurrentStream();
          state.streaming = false;
          state.errorMessage = error?.message || "Gagal memulai preview camera.";
          render();
        });
      });

      resolutionSelect?.addEventListener("change", async () => {
        state.selectedResolution = resolutionSelect.value || "auto";
        state.zoomLevel = 1;
        await startPreview().catch((error) => {
          stopCurrentStream();
          state.streaming = false;
          state.errorMessage = error?.message || "Gagal menerapkan ukuran preview camera.";
          render();
        });
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
    }

    return {
      viewKey: "tool_microscope",
      eyebrow: "Microscope",
      title: "Microscope",
      subtitle: "Preview microscope USB atau camera internal langsung dari browser.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        notify = typeof options.notify === "function" ? options.notify : notify;
        bindDeviceChangeListener();
        render();
      },
      setVisible(visible) {
        isVisible = Boolean(visible);
        if (!mountedContainer) {
          return;
        }

        mountedContainer.classList.toggle("hidden", !visible);
        if (!visible) {
          stopCurrentStream();
          state.streaming = false;
          render();
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

        if (!currentStream && state.selectedDeviceId) {
          await startPreview().catch(async () => {
            await scanDevices({ silent: true });
          });
          return;
        }

        render();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.microscope = createApi();
})(window);
