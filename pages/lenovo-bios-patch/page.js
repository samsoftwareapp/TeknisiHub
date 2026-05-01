(function initializeLenovoBiosPatchPage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
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

  async function fetchPatchedFile(path, formData) {
    const response = await fetch(`${serviceBaseUrl}${path}`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const rawText = await response.text();
      let payload = {};

      if (rawText) {
        try {
          payload = JSON.parse(rawText);
        } catch {
          payload = { message: rawText };
        }
      }

      throw new Error(payload.message || payload.title || `Request gagal (${response.status}).`);
    }

    const blob = await response.blob();
    return {
      blob,
      fileName: extractDownloadFileName(response) || "lenovo_bios_PATCHED.bin"
    };
  }

  function extractDownloadFileName(response) {
    const disposition = response.headers.get("Content-Disposition") || "";
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      try {
        return decodeURIComponent(utf8Match[1]);
      } catch {
        return utf8Match[1];
      }
    }

    const asciiMatch = disposition.match(/filename=\"?([^\";]+)\"?/i);
    return asciiMatch?.[1] || "";
  }

  function triggerBrowserDownload(url, fileName) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  function createInitialState() {
    return {
      inputFileName: "",
      inputFileSize: 0,
      patchedFileName: "",
      patchedFileSize: 0,
      patchedAt: "-",
      message: "Pilih dump BIOS Lenovo lalu jalankan patch untuk membuat file BIOS _PATCHED.",
      errorMessage: "",
      notes: [
        "Tool ini membuat file BIOS Lenovo hasil patch dari dump asli yang Anda pilih.",
        "Utamanya untuk ThinkPad generasi lama sampai Intel Gen 8, misalnya X270, T470, T480, dan T580.",
        "Setelah patch selesai, file output akan disiapkan untuk diunduh manual lewat tombol Download file patch.",
        "Flash dan penggunaan file hasil patch tetap perlu verifikasi manual di perangkat target."
      ]
    };
  }

  function createNotesMarkup(notes) {
    return (notes || [])
      .map((note) => `<p>${escapeHtml(note)}</p>`)
      .join("");
  }

  function getCardStateClass(state) {
    if (state.errorMessage) {
      return " is-failed";
    }

    if (state.patchedAt && state.patchedAt !== "-" && !state.errorMessage) {
      return " is-success";
    }

    return "";
  }

  function createWorkbenchMarkup(state, busy, hasDownload) {
    const actionLabel = busy ? "Memproses patch..." : "Buat file patch";
    const disableAttr = busy ? " disabled" : "";
    const downloadButtonClass = hasDownload ? "ghost ami-decryptor-download-button is-ready" : "ghost ami-decryptor-download-button";
    const cardStateClass = getCardStateClass(state);

    return `
      <section class="spi-card${cardStateClass}">
        <div class="spi-card-head">
          <div>
            <p class="label">Dump Bios Lenovo</p>
            <h4>Upload file BIOS lalu jalankan patch</h4>
          </div>
          <button type="button" id="lenovoBiosPatchRunButton" class="ghost"${disableAttr}>
            <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "play_arrow"}</span>
            <span>${actionLabel}</span>
          </button>
        </div>
        <div class="spi-form-grid">
          <label class="spi-file-field">
            File BIOS
            <input id="lenovoBiosPatchFileInput" type="file" accept="${acceptedExtensions}"${disableAttr}>
          </label>
          <label>
            File Terpilih
            <input type="text" value="${escapeHtml(state.inputFileName)}" placeholder="Belum ada file" readonly>
          </label>
          <label>
            Ukuran Input
            <input type="text" value="${escapeHtml(formatBytes(state.inputFileSize))}" placeholder="Belum ada file" readonly>
          </label>
          <label>
            Waktu Patch
            <input type="text" value="${escapeHtml(state.patchedAt)}" placeholder="Belum dijalankan" readonly>
          </label>
        </div>
        <p class="spi-note">${escapeHtml(state.errorMessage || state.message)}</p>
        <div class="lenovo-bios-patch-notes">${createNotesMarkup(state.notes)}</div>
        <div class="boardviewer-actions lenovo-bios-patch-download">
          <button type="button" id="lenovoBiosPatchDownloadButton" class="${downloadButtonClass}"${hasDownload ? "" : " disabled"}>
            <span class="material-symbols-outlined">download</span>
            <span>Download file patch</span>
          </button>
        </div>
      </section>
    `;
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let notify = () => {};
    let busy = false;
    let selectedFile = null;
    let downloadUrl = "";

    function revokeDownloadUrl() {
      if (!downloadUrl) {
        return;
      }

      URL.revokeObjectURL(downloadUrl);
      downloadUrl = "";
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy, Boolean(downloadUrl));

      const fileInput = mountedContainer.querySelector("#lenovoBiosPatchFileInput");
      const runButton = mountedContainer.querySelector("#lenovoBiosPatchRunButton");
      const downloadButton = mountedContainer.querySelector("#lenovoBiosPatchDownloadButton");

      fileInput?.addEventListener("change", () => {
        selectedFile = fileInput.files?.[0] || null;
        revokeDownloadUrl();
        state.inputFileName = selectedFile?.name || "";
        state.inputFileSize = Number(selectedFile?.size || 0);
        state.patchedFileName = "";
        state.patchedFileSize = 0;
        state.patchedAt = "-";
        state.errorMessage = "";
        state.message = selectedFile
          ? "File siap dipatch. Klik Buat file patch untuk memproses dump BIOS Lenovo."
          : "Pilih dump BIOS Lenovo lalu jalankan patch untuk membuat file BIOS _PATCHED.";
        render();
      });

      runButton?.addEventListener("click", async () => {
        if (busy) {
          return;
        }

        busy = true;
        render();

        try {
          if (!selectedFile) {
            throw new Error("Pilih file BIOS Lenovo dulu sebelum menjalankan patch.");
          }

          const formData = new FormData();
          formData.set("file", selectedFile);

          const result = await fetchPatchedFile("/tools/lenovo-bios-patch/patch", formData);
          state.patchedFileName = result.fileName || `${selectedFile.name}_PATCHED.bin`;
          state.patchedFileSize = Number(result.blob.size || 0);
          state.patchedAt = new Date().toLocaleString("id-ID");
          state.message = "Patch BIOS Lenovo selesai. File hasil patch sudah siap untuk di-download.";
          state.errorMessage = "";

          revokeDownloadUrl();
          downloadUrl = URL.createObjectURL(result.blob);
          notify("Patch BIOS Lenovo selesai. Tombol download sudah aktif.");
        } catch (error) {
          state.errorMessage = error?.message || "Patch BIOS Lenovo gagal dijalankan.";
          notify(state.errorMessage, true);
        } finally {
          busy = false;
          render();
        }
      });

      downloadButton?.addEventListener("click", () => {
        if (!downloadUrl || !state.patchedFileName) {
          return;
        }

        triggerBrowserDownload(downloadUrl, state.patchedFileName);
      });
    }

    return {
      viewKey: "tool_lenovo_dump_bios",
      eyebrow: "Bios Patch",
      title: "Dump Bios Lenovo",
      subtitle: "Upload dump BIOS Lenovo lalu buat file patch hasil modifikasi langsung dari local service.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        notify = typeof options.notify === "function" ? options.notify : notify;
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
  globalScope.teknisiHubPages.lenovoBiosPatch = createApi();
})(window);
