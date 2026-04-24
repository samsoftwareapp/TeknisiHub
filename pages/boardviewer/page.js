(function initializeBoardViewerPage(globalScope) {
  const serviceBaseUrl = "http://127.0.0.1:48721";
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
      message: "Pilih file boardview lalu klik Open Boardviewer untuk membukanya lewat local service.",
      errorMessage: ""
    };
  }

  function createWorkbenchMarkup(state, busy) {
    const disableAttr = busy ? " disabled" : "";
    return `
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
          </div>
          <div class="spi-inline-meta">
            <span>Staging file <strong>${escapeHtml(state.workingPath || "-")}</strong></span>
          </div>
        </section>
      </div>
    `;
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let busy = false;
    let selectedFile = null;

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy);
      const fileInput = mountedContainer.querySelector("#boardViewerFileInput");
      const openButton = mountedContainer.querySelector("#boardViewerOpenButton");

      fileInput?.addEventListener("change", () => {
        selectedFile = fileInput.files?.[0] || null;
        state.fileName = selectedFile?.name || "";
        state.fileSize = selectedFile?.size || 0;
        state.errorMessage = "";
        state.message = selectedFile
          ? "File siap dibuka. Klik Open Boardviewer untuk membukanya lewat local service."
          : "Pilih file boardview lalu klik Open Boardviewer untuk membukanya lewat local service.";
        render();
      });

      openButton?.addEventListener("click", () => withBusy(async () => {
        if (!selectedFile) {
          throw new Error("Pilih file boardview dulu sebelum membuka Boardviewer.");
        }

        const formData = new FormData();
        formData.set("file", selectedFile);

        const result = await fetchJson("/tools/boardviewer/open", {
          method: "POST",
          body: formData
        });

        state = {
          fileName: result.fileName || selectedFile.name,
          fileSize: Number(result.fileSize || selectedFile.size || 0),
          toolVersion: result.toolVersion || "-",
          launchedAt: result.launchedAt || "-",
          workingPath: result.workingPath || "-",
          message: result.message || "Boardviewer dibuka.",
          errorMessage: ""
        };
      }));
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
        state.errorMessage = error?.message || "Boardviewer gagal dibuka.";
      } finally {
        busy = false;
        render();
      }
    }

    return {
      viewKey: "tool_boardviewer",
      eyebrow: "Boardviewer",
      title: "Boardviewer",
      subtitle: "Utility lokal untuk membuka file boardview lewat local service.",
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
