(function initializeMeAnalyzerPage(globalScope) {
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

  function createInitialState() {
    return {
      fileName: "",
      fileSize: 0,
      analyzerVersion: "-",
      engineFamily: "-",
      engineVersion: "-",
      analyzedAt: "-",
      rawOutput: "",
      message: "Pilih file BIOS lalu klik Analyze untuk melihat hasil lengkap ME Analyzer.",
      errorMessage: ""
    };
  }

  function createWorkbenchMarkup(state, busy) {
    const disableAttr = busy ? " disabled" : "";
    const hasResult = Boolean(state.rawOutput);

    return `
      <div class="spi-layout">
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Input File</p>
              <h4>Pilih file BIOS</h4>
            </div>
            <button type="button" id="meAnalyzerRunButton" class="ghost"${disableAttr}>
              <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "play_arrow"}</span>
              <span>${busy ? "Menganalisa..." : "Analyze"}</span>
            </button>
          </div>
          <div class="spi-form-grid">
            <label class="spi-file-field">
              File BIOS
              <input id="meAnalyzerFileInput" type="file" accept="${acceptedExtensions}"${disableAttr}>
            </label>
            <label>
              Nama File
              <input type="text" value="${escapeHtml(state.fileName || "")}" placeholder="Belum ada file" readonly>
            </label>
            <label>
              Ukuran
              <input type="text" value="${escapeHtml(formatBytes(state.fileSize))}" placeholder="Belum ada file" readonly>
            </label>
            <label>
              Analisa Terakhir
              <input type="text" value="${escapeHtml(state.analyzedAt)}" placeholder="Belum dijalankan" readonly>
            </label>
          </div>
          <p class="spi-note">${escapeHtml(state.errorMessage || state.message)}</p>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Ringkasan</p>
              <h4>Informasi utama</h4>
            </div>
          </div>
          <div class="spi-stats-grid me-analyzer-stats-grid">
            <article class="spi-stat-card">
              <span class="material-symbols-outlined">memory</span>
              <div>
                <p class="label">Family</p>
                <strong>${escapeHtml(state.engineFamily || "-")}</strong>
                <p>Hasil engine utama</p>
              </div>
            </article>
            <article class="spi-stat-card">
              <span class="material-symbols-outlined">new_releases</span>
              <div>
                <p class="label">Version</p>
                <strong>${escapeHtml(state.engineVersion || "-")}</strong>
                <p>Versi firmware engine</p>
              </div>
            </article>
            <article class="spi-stat-card">
              <span class="material-symbols-outlined">deployed_code</span>
              <div>
                <p class="label">MEA Build</p>
                <strong>${escapeHtml(state.analyzerVersion || "-")}</strong>
                <p>Versi tool yang dipakai</p>
              </div>
            </article>
          </div>
        </section>
      </div>

      <section class="spi-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Console Output</p>
            <h4>Hasil lengkap ME Analyzer</h4>
          </div>
          <span class="spi-mini-badge">${hasResult ? "Output siap" : "Belum ada output"}</span>
        </div>
        ${hasResult
          ? `<pre class="me-analyzer-console">${escapeHtml(state.rawOutput)}</pre>`
          : `<p class="me-analyzer-empty">${escapeHtml(state.message)}</p>`}
      </section>
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

      const fileInput = mountedContainer.querySelector("#meAnalyzerFileInput");
      const runButton = mountedContainer.querySelector("#meAnalyzerRunButton");

      fileInput?.addEventListener("change", () => {
        selectedFile = fileInput.files?.[0] || null;
        state.fileName = selectedFile?.name || "";
        state.fileSize = selectedFile?.size || 0;
        state.errorMessage = "";
        state.message = selectedFile
          ? "File siap dianalisa. Klik Analyze untuk menjalankan ME Analyzer."
          : "Pilih file BIOS lalu klik Analyze untuk melihat hasil lengkap ME Analyzer.";
        render();
      });

      runButton?.addEventListener("click", () => withBusy(async () => {
        if (!selectedFile) {
          throw new Error("Pilih file BIOS dulu sebelum menjalankan ME Analyzer.");
        }

        const formData = new FormData();
        formData.set("file", selectedFile);

        const result = await fetchJson("/tools/me-analyzer/analyze", {
          method: "POST",
          body: formData
        });

        state = {
          fileName: result.fileName || selectedFile.name,
          fileSize: Number(result.fileSize || selectedFile.size || 0),
          analyzerVersion: result.analyzerVersion || "-",
          engineFamily: result.engineFamily || "-",
          engineVersion: result.engineVersion || "-",
          analyzedAt: result.analyzedAt || "-",
          rawOutput: result.rawOutput || "",
          message: result.message || "Analisa selesai.",
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
        state.errorMessage = error?.message || "ME Analyzer gagal dijalankan.";
      } finally {
        busy = false;
        render();
      }
    }

    return {
      viewKey: "tool_me_analyzer",
      eyebrow: "ME Analyzer",
      title: "ME Analyzer",
      subtitle: "Utility manual untuk membaca output lengkap Intel Engine dari file BIOS.",
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
  globalScope.teknisiHubPages.meAnalyzer = createApi();
})(window);
