(function initializeBiosSpdRemovalPage(globalScope) {
  const serviceBaseUrl = "http://127.0.0.1:48721";
  const acceptedExtensions = ".bin,.rom,.cap,.img,.fd,.bio,.wph,.efi,.hdr";

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
      executableAvailable: false,
      inputFileName: "",
      inputFileSize: 0,
      workspacePath: "-",
      toolPath: "-",
      message: "Pilih file BIOS lalu klik Open BIOS SPD Removal untuk membukanya lewat local service.",
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
              <h4>Pilih file BIOS</h4>
            </div>
            <div class="boardviewer-actions">
              <button type="button" id="biosSpdRemovalOpenButton" class="ghost"${disableAttr}>
                <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "open_in_new"}</span>
                <span>${busy ? "Membuka..." : "Open BIOS SPD Removal"}</span>
              </button>
            </div>
          </div>
          <div class="spi-form-grid">
            <label class="spi-file-field">
              File BIOS
              <input id="biosSpdRemovalFileInput" type="file" accept="${acceptedExtensions}"${disableAttr}>
            </label>
            <label>
              Nama File
              <input type="text" value="${escapeHtml(state.inputFileName)}" placeholder="Belum ada file" readonly>
            </label>
            <label>
              Ukuran
              <input type="text" value="${escapeHtml(formatBytes(state.inputFileSize))}" placeholder="Belum ada file" readonly>
            </label>
            <label>
              Status Executable
              <input type="text" value="${escapeHtml(state.executableAvailable ? "Terdeteksi" : "Tidak ditemukan")}" readonly>
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
              <span class="material-symbols-outlined">memory</span>
              <div>
                <p class="label">Format</p>
                <strong>BIOS desktop tool</strong>
                <p>BIN, ROM, CAP, IMG, FD, BIO, WPH, EFI, HDR</p>
              </div>
            </article>
            <article class="spi-stat-card">
              <span class="material-symbols-outlined">open_in_new</span>
              <div>
                <p class="label">Mode</p>
                <strong>Open file ke exe asli</strong>
                <p>Web UI hanya bantu kirim file BIOS ke launcher lokal</p>
              </div>
            </article>
          </div>
          <div class="spi-inline-meta">
            <span>Staging file <strong>${escapeHtml(state.workspacePath || "-")}</strong></span>
            <span>Tool path <strong>${escapeHtml(state.toolPath || "-")}</strong></span>
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

    async function loadStatus() {
      try {
        const result = await fetchJson("/tools/bios-spd-removal/status");
        state.executableAvailable = Boolean(result.executableAvailable);
        state.toolPath = result.toolPath || "-";
        state.message = result.message || state.message;
        state.errorMessage = "";
      } catch (error) {
        state.executableAvailable = false;
        state.toolPath = "-";
        state.errorMessage = error?.message || "Status tool BIOS SPD removal gagal dimuat.";
      }
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy);
      const fileInput = mountedContainer.querySelector("#biosSpdRemovalFileInput");
      const openButton = mountedContainer.querySelector("#biosSpdRemovalOpenButton");

      fileInput?.addEventListener("change", () => {
        selectedFile = fileInput.files?.[0] || null;
        state.inputFileName = selectedFile?.name || "";
        state.inputFileSize = selectedFile?.size || 0;
        state.workspacePath = "-";
        state.errorMessage = "";
        state.message = selectedFile
          ? "File siap dibuka. Klik Open BIOS SPD Removal untuk membukanya lewat local service."
          : "Pilih file BIOS lalu klik Open BIOS SPD Removal untuk membukanya lewat local service.";
        render();
      });

      openButton?.addEventListener("click", () => withBusy(async () => {
        if (!selectedFile) {
          throw new Error("Pilih file BIOS dulu sebelum membuka BIOS SPD Removal.");
        }

        const formData = new FormData();
        formData.set("file", selectedFile);

        const result = await fetchJson("/tools/bios-spd-removal/launch", {
          method: "POST",
          body: formData
        });

        state = {
          executableAvailable: state.executableAvailable,
          inputFileName: result.inputFileName || selectedFile.name,
          inputFileSize: Number(selectedFile.size || 0),
          workspacePath: result.workspacePath || "-",
          toolPath: result.toolPath || state.toolPath || "-",
          message: result.message || "BIOS SPD Removal dibuka.",
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
        state.errorMessage = error?.message || "BIOS SPD Removal gagal dibuka.";
      } finally {
        busy = false;
        render();
      }
    }

    return {
      viewKey: "tool_bios_spd_removal",
      eyebrow: "Bios Patch",
      title: "BIOS SPD Removal",
      subtitle: "Launcher lokal untuk membuka file BIOS ke BIOS memory SPD removal tool asli.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        await loadStatus();
        render();
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }
        mountedContainer.classList.toggle("hidden", !visible);
      },
      async refresh() {
        await loadStatus();
        render();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.biosSpdRemoval = createApi();
})(window);
