(function initializeAmiDecryptorPage(globalScope) {
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

  async function fetchUnlockedFile(path, formData) {
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

    return {
      blob: await response.blob(),
      fileName: extractDownloadFileName(response) || "ami_unlock.bin"
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
      fileName: "",
      fileSize: 0,
      analyzedAt: "-",
      chunkCount: 0,
      rawOutput: "",
      chunks: [],
      unlockedFileName: "",
      unlockedFileSize: 0,
      decryptFileName: "",
      decryptFileSize: 0,
      message: "Pilih file BIOS AMI lalu klik Analyze & Unlock untuk membuat output lab berupa BIOS unlock dan decrypt txt.",
      errorMessage: ""
    };
  }

  function getCardStateClass(state) {
    if (state.errorMessage) {
      return " is-failed";
    }

    if (state.analyzedAt && state.analyzedAt !== "-" && !state.errorMessage) {
      return " is-success";
    }

    return "";
  }

  function createWorkbenchMarkup(state, busy, hasUnlockedDownload, hasDecryptDownload) {
    const disableAttr = busy ? " disabled" : "";
    const actionLabel = busy ? "Memproses..." : "Analyze & Unlock";
    const unlockButtonClass = hasUnlockedDownload ? "ghost ami-decryptor-download-button is-ready" : "ghost ami-decryptor-download-button";
    const decryptButtonClass = hasDecryptDownload ? "ghost ami-decryptor-download-button is-ready" : "ghost ami-decryptor-download-button";
    const cardStateClass = getCardStateClass(state);

    return `
      <section class="spi-card${cardStateClass}">
        <div class="spi-card-head">
          <div>
            <p class="label">Input File</p>
            <h4>Analyze AMITSESetup lalu buat file unlock</h4>
          </div>
          <button type="button" id="amiDecryptorRunButton" class="ghost"${disableAttr}>
            <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "lock_open"}</span>
            <span>${actionLabel}</span>
          </button>
        </div>
        <div class="spi-form-grid">
          <label class="spi-file-field">
            File BIOS AMI
            <input id="amiDecryptorFileInput" type="file" accept="${acceptedExtensions}"${disableAttr}>
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
            Analisa Terakhir
            <input type="text" value="${escapeHtml(state.analyzedAt)}" placeholder="Belum dijalankan" readonly>
          </label>
        </div>
        <p class="spi-note">${escapeHtml(state.errorMessage || state.message)}</p>
        <div class="boardviewer-actions lenovo-bios-patch-download">
          <button type="button" id="amiDecryptorDownloadUnlockButton" class="${unlockButtonClass}"${hasUnlockedDownload ? "" : " disabled"}>
            <span class="material-symbols-outlined">download</span>
            <span>Download BIN unlock</span>
          </button>
          <button type="button" id="amiDecryptorDownloadDecryptButton" class="${decryptButtonClass}"${hasDecryptDownload ? "" : " disabled"}>
            <span class="material-symbols-outlined">download</span>
            <span>Download decrypt txt</span>
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
    let unlockedDownloadUrl = "";
    let decryptDownloadUrl = "";

    function revokeDownloadUrls() {
      if (unlockedDownloadUrl) {
        URL.revokeObjectURL(unlockedDownloadUrl);
        unlockedDownloadUrl = "";
      }

      if (decryptDownloadUrl) {
        URL.revokeObjectURL(decryptDownloadUrl);
        decryptDownloadUrl = "";
      }
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(
        state,
        busy,
        Boolean(unlockedDownloadUrl),
        Boolean(decryptDownloadUrl)
      );

      const fileInput = mountedContainer.querySelector("#amiDecryptorFileInput");
      const runButton = mountedContainer.querySelector("#amiDecryptorRunButton");
      const downloadUnlockButton = mountedContainer.querySelector("#amiDecryptorDownloadUnlockButton");
      const downloadDecryptButton = mountedContainer.querySelector("#amiDecryptorDownloadDecryptButton");

      fileInput?.addEventListener("change", () => {
        selectedFile = fileInput.files?.[0] || null;
        revokeDownloadUrls();
        state = {
          ...createInitialState(),
          fileName: selectedFile?.name || "",
          fileSize: Number(selectedFile?.size || 0),
          message: selectedFile
            ? "File BIOS siap diproses. Klik Analyze & Unlock untuk membuat BIOS unlock dan decrypt txt."
            : createInitialState().message
        };
        render();
      });

      runButton?.addEventListener("click", () => withBusy(async () => {
        if (!selectedFile) {
          throw new Error("Pilih file BIOS AMI dulu sebelum menjalankan AMI decryptor.");
        }

        const analyzeFormData = new FormData();
        analyzeFormData.set("file", selectedFile);

        const analysis = await fetchJson("/tools/ami-decryptor/analyze", {
          method: "POST",
          body: analyzeFormData
        });

        revokeDownloadUrls();

        state = {
          fileName: analysis.fileName || selectedFile.name,
          fileSize: Number(analysis.fileSize || selectedFile.size || 0),
          analyzedAt: analysis.analyzedAt || "-",
          chunkCount: Number(analysis.chunkCount || 0),
          rawOutput: analysis.rawOutput || "",
          chunks: Array.isArray(analysis.chunks) ? analysis.chunks : [],
          unlockedFileName: analysis.unlockedFileName || `${selectedFile.name}_Unlocked_By_Alien_Server.bin`,
          unlockedFileSize: 0,
          decryptFileName: analysis.decryptFileName || "AMITSESetup Decrypt.txt",
          decryptFileSize: 0,
          message: analysis.message || "Analisa selesai.",
          errorMessage: ""
        };

        if (state.rawOutput) {
          const decryptBlob = new Blob([state.rawOutput], { type: "text/plain;charset=utf-8" });
          decryptDownloadUrl = URL.createObjectURL(decryptBlob);
          state.decryptFileSize = Number(decryptBlob.size || 0);
        }

        const unlockFormData = new FormData();
        unlockFormData.set("file", selectedFile);

        const unlockResult = await fetchUnlockedFile("/tools/ami-decryptor/unlock", unlockFormData);
        unlockedDownloadUrl = URL.createObjectURL(unlockResult.blob);
        state.unlockedFileName = unlockResult.fileName || state.unlockedFileName;
        state.unlockedFileSize = Number(unlockResult.blob.size || 0);
        notify("AMI Decryptor selesai. File hasil sudah siap untuk di-download.");
      }));

      downloadUnlockButton?.addEventListener("click", () => {
        if (!unlockedDownloadUrl || !state.unlockedFileName) {
          return;
        }

        triggerBrowserDownload(unlockedDownloadUrl, state.unlockedFileName);
      });

      downloadDecryptButton?.addEventListener("click", () => {
        if (!decryptDownloadUrl || !state.decryptFileName) {
          return;
        }

        triggerBrowserDownload(decryptDownloadUrl, state.decryptFileName);
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
        state.errorMessage = error?.message || "AMI decryptor gagal dijalankan.";
        notify(state.errorMessage, true);
      } finally {
        busy = false;
        render();
      }
    }

    return {
      viewKey: "tool_ami_decryptor",
      eyebrow: "Bios Patch",
      title: "AMI Decrytor & Unlocker",
      subtitle: "Buat file BIOS unlock dan output decrypt txt dengan format yang disamakan ke hasil lab.",
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
  globalScope.teknisiHubPages.amiDecryptor = createApi();
})(window);
