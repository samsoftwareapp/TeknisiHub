(function initializeBoardViewerPage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const acceptedExtensions = ".asc,.bdv,.brd,.bv,.cad,.cst,.gr,.f2b,.faz,.fz,.tvw";

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (!Number.isFinite(value) || value <= 0) {
      return "-";
    }
    if (value >= 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    }
    if (value >= 1024) {
      return `${(value / 1024).toFixed(2)} KB`;
    }
    return `${value} B`;
  }

  async function fetchJson(path, options = {}) {
    const requestUrl = `${serviceBaseUrl}${path}`;
    const isFormDataBody = options.body instanceof FormData;
    const headers = isFormDataBody ? {} : { "Content-Type": "application/json" };
    const response = await fetch(requestUrl, { headers, ...options });
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

  function createInitialState() {
    return {
      fileName: "",
      fileSize: 0,
      toolVersion: "-",
      launchedAt: "-",
      workingPath: "-",
      nativeFileName: "",
      nativeFileSize: 0,
      nativeLaunchedAt: "-",
      message: "Pilih file boardview lalu klik Open Boardviewer untuk membukanya lewat local service.",
      nativeMessage: "Pilih file boardview untuk membuka Boardview TeknisiHub di tab baru.",
      errorMessage: "",
      nativeErrorMessage: ""
    };
  }

  function buildNativeViewerUrl(payload) {
    const targetUrl = new URL("boardview-teknisihub.html", globalScope.location.href);
    if (payload.sessionId) {
      targetUrl.searchParams.set("sessionId", payload.sessionId);
    }
    targetUrl.searchParams.set("source", payload.source || "tool_boardviewer");
    return targetUrl.toString();
  }

  function createNativeLauncherMarkup(state, busy) {
    const disableAttr = busy ? " disabled" : "";
    return `
      <section class="spi-card boardviewer-preview-card">
        <div class="spi-card-head boardviewer-preview-card-head">
          <div>
            <p class="label">Boardview TeknisiHub</p>
            <h4>Launcher viewer TeknisiHub di tab baru</h4>
            <p class="boardviewer-preview-copy">Card launcher desktop tetap dipertahankan. Card ini khusus memilih file boardview lalu membuka viewer TeknisiHub pada new tab agar area kerja board lebih lega.</p>
          </div>
          <div class="boardviewer-preview-head-badges">
            <span class="boardviewer-preview-badge">Viewer lokal</span>
            <span class="boardviewer-preview-badge is-accent">New tab</span>
          </div>
        </div>

        <div class="boardviewer-preview-shell boardviewer-preview-shell-compact">
          <section class="boardviewer-preview-panel boardviewer-native-launch-panel">
            <div class="spi-form-grid">
              <label class="spi-file-field">
                File Boardview
                <input id="boardViewerNativeFileInput" type="file" accept="${acceptedExtensions}"${disableAttr}>
              </label>
              <label>
                Nama File
                <input type="text" value="${escapeHtml(state.nativeFileName)}" placeholder="Belum ada file" readonly>
              </label>
              <label>
                Ukuran
                <input type="text" value="${escapeHtml(formatBytes(state.nativeFileSize))}" placeholder="Belum ada file" readonly>
              </label>
              <label>
                Open Terakhir
                <input type="text" value="${escapeHtml(state.nativeLaunchedAt)}" placeholder="Belum dibuka" readonly>
              </label>
            </div>
            <div class="boardviewer-actions">
              <button type="button" id="boardViewerNativeOpenButton" class="ghost"${disableAttr}>
                <span class="material-symbols-outlined">open_in_new</span>
                <span>Buka Boardview TeknisiHub</span>
              </button>
            </div>
            <p class="spi-note">${escapeHtml(state.nativeErrorMessage || state.nativeMessage)}</p>
          </section>

          <aside class="boardviewer-preview-sidebar">
            <article class="boardviewer-preview-panel">
              <p class="label">Cara kerja</p>
              <strong>Pilih file lalu buka tab baru</strong>
              <p>Tab baru digunakan supaya viewer board tidak bercampur dengan dashboard utama dan ruang kerja tetap luas.</p>
            </article>
            <article class="boardviewer-preview-panel">
              <p class="label">Arah viewer</p>
              <div class="boardviewer-preview-chip-list">
                <span class="boardviewer-preview-chip">Boards</span>
                <span class="boardviewer-preview-chip">SCH</span>
                <span class="boardviewer-preview-chip">Top</span>
                <span class="boardviewer-preview-chip">Bottom</span>
                <span class="boardviewer-preview-chip">Both</span>
              </div>
            </article>
          </aside>
        </div>
      </section>
    `;
  }

  function createWorkbenchMarkup(state, busy) {
    const disableAttr = busy ? " disabled" : "";
    return `
      <div class="boardviewer-shell">
        <div class="spi-layout">
          <section class="spi-card">
            <div class="spi-card-head">
              <div>
                <p class="label">Input File</p>
                <h4>Pilih file boardview</h4>
              </div>
              <div class="boardviewer-actions">
                <button type="button" id="boardViewerOpenButton" class="ghost"${disableAttr}>
                  <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "open_in_new"}</span>
                  <span>${busy ? "Membuka..." : "Open Boardviewer"}</span>
                </button>
              </div>
            </div>
            <div class="spi-form-grid">
              <label class="spi-file-field">
                File Boardview
                <input id="boardViewerFileInput" type="file" accept="${acceptedExtensions}"${disableAttr}>
              </label>
              <label>
                Nama File
                <input type="text" value="${escapeHtml(state.fileName)}" placeholder="Belum ada file" readonly>
              </label>
              <label>
                Ukuran
                <input type="text" value="${escapeHtml(formatBytes(state.fileSize))}" placeholder="Belum ada file" readonly>
              </label>
              <label>
                Tool Build
                <input type="text" value="${escapeHtml(state.toolVersion)}" placeholder="Belum dijalankan" readonly>
              </label>
            </div>
            <p class="spi-note">${escapeHtml(state.errorMessage || state.message)}</p>
          </section>

          <section class="spi-card">
            <div class="spi-card-head">
              <div>
                <p class="label">Session Info</p>
                <h4>Status launcher</h4>
              </div>
            </div>
            <div class="spi-stats-grid boardviewer-stats-grid">
              <article class="spi-stat-card">
                <span class="material-symbols-outlined">developer_board</span>
                <div>
                  <p class="label">Format</p>
                  <strong>Boardview desktop</strong>
                  <p>BRD, BDV, Boardview, FZ, CAD, TVW, ASC</p>
                </div>
              </article>
              <article class="spi-stat-card">
                <span class="material-symbols-outlined">schedule</span>
                <div>
                  <p class="label">Open Terakhir</p>
                  <strong>${escapeHtml(state.launchedAt)}</strong>
                  <p>Waktu terakhir launcher dijalankan</p>
                </div>
              </article>
              <article class="spi-stat-card">
                <span class="material-symbols-outlined">hub</span>
                <div>
                  <p class="label">Preview</p>
                  <strong>Boardview TeknisiHub</strong>
                  <p>Card baru untuk membuka viewer boardview versi TeknisiHub di tab baru.</p>
                </div>
              </article>
            </div>
            <div class="spi-inline-meta">
              <span>Staging file <strong>${escapeHtml(state.workingPath || "-")}</strong></span>
            </div>
          </section>
        </div>

        ${createNativeLauncherMarkup(state, busy)}
      </div>
    `;
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let busy = false;
    let selectedDesktopFile = null;
    let selectedNativeFile = null;

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy);
      const fileInput = mountedContainer.querySelector("#boardViewerFileInput");
      const openButton = mountedContainer.querySelector("#boardViewerOpenButton");
      const nativeFileInput = mountedContainer.querySelector("#boardViewerNativeFileInput");
      const nativeOpenButton = mountedContainer.querySelector("#boardViewerNativeOpenButton");

      fileInput?.addEventListener("change", () => {
        selectedDesktopFile = fileInput.files?.[0] || null;
        state.fileName = selectedDesktopFile?.name || "";
        state.fileSize = Number(selectedDesktopFile?.size || 0);
        state.errorMessage = "";
        state.message = selectedDesktopFile
          ? "File siap dibuka. Klik Open Boardviewer untuk membukanya lewat local service."
          : "Pilih file boardview lalu klik Open Boardviewer untuk membukanya lewat local service.";
        render();
      });

      openButton?.addEventListener("click", () => withBusy(async () => {
        if (!selectedDesktopFile) {
          throw new Error("Pilih file boardview dulu sebelum membuka Boardviewer.");
        }

        const formData = new FormData();
        formData.set("file", selectedDesktopFile);

        const result = await fetchJson("/tools/boardviewer/open", {
          method: "POST",
          body: formData
        });

        state = {
          ...state,
          fileName: result.fileName || selectedDesktopFile.name,
          fileSize: Number(result.fileSize || selectedDesktopFile.size || 0),
          toolVersion: result.toolVersion || "-",
          launchedAt: result.launchedAt || "-",
          workingPath: result.workingPath || "-",
          message: result.message || "Boardviewer dibuka.",
          errorMessage: ""
        };
      }, "desktop"));

      nativeFileInput?.addEventListener("change", () => {
        selectedNativeFile = nativeFileInput.files?.[0] || null;
        state.nativeFileName = selectedNativeFile?.name || "";
        state.nativeFileSize = Number(selectedNativeFile?.size || 0);
        state.nativeErrorMessage = "";
        state.nativeMessage = selectedNativeFile
          ? "File siap dibuka ke Boardview TeknisiHub di tab baru."
          : "Pilih file boardview untuk membuka Boardview TeknisiHub di tab baru.";
        render();
      });

      nativeOpenButton?.addEventListener("click", () => withBusy(async () => {
        if (!selectedNativeFile) {
          throw new Error("Pilih file boardview dulu sebelum membuka Boardview TeknisiHub.");
        }

        const formData = new FormData();
        formData.set("file", selectedNativeFile);

        const nativeSession = await fetchJson("/tools/boardviewer/native-session", {
          method: "POST",
          body: formData
        });

        const launchPayload = {
          sessionId: nativeSession.sessionId || "",
          source: "tool_boardviewer"
        };

        const launchedWindow = globalScope.open(buildNativeViewerUrl(launchPayload), "_blank", "noopener");
        if (!launchedWindow) {
          throw new Error("Tab baru terblokir browser. Izinkan pop-up atau buka viewer manual.");
        }

        state.nativeLaunchedAt = nativeSession.createdAt || new Date().toLocaleString("id-ID");
        state.nativeErrorMessage = "";
        state.nativeMessage = nativeSession.message || `Boardview TeknisiHub dibuka di tab baru untuk ${selectedNativeFile.name}.`;
        state.nativeFileName = nativeSession.fileName || selectedNativeFile.name;
        state.nativeFileSize = Number(nativeSession.fileSize || selectedNativeFile.size || 0);
      }, "native"));
    }

    async function withBusy(work, errorTarget = "desktop") {
      if (busy) {
        return;
      }
      busy = true;
      render();
      try {
        await work();
      } catch (error) {
        if (errorTarget === "native") {
          state.nativeErrorMessage = error?.message || "Boardview TeknisiHub gagal dibuka.";
        } else {
          state.errorMessage = error?.message || "Boardviewer gagal dibuka.";
        }
      } finally {
        busy = false;
        render();
      }
    }

    return {
      viewKey: "tool_boardviewer",
      eyebrow: "Boardviewer",
      title: "Boardviewer",
      subtitle: "Launcher desktop lama dan launcher Boardview TeknisiHub versi tab baru.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        render();
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }
        mountedContainer.classList.toggle("hidden", !visible);
      },
      async refresh() {
        render();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.boardViewer = createApi();
})(window);
