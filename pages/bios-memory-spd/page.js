(function initializeBiosMemorySpdPage(globalScope) {
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

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${serviceBaseUrl}${path}`, {
      headers: options.body instanceof FormData ? {} : { "Content-Type": "application/json" },
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

  async function fetchBinary(path, formData, fallbackFileName) {
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
      fileName: extractDownloadFileName(response) || fallbackFileName
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
      blockCount: 0,
      cleanableBlockCount: 0,
      cleanableBytes: 0,
      ddr3Count: 0,
      ddr4Count: 0,
      blocks: [],
      selectedOffsets: [],
      memoryType: "DDR4",
      fillByte: "00",
      spdBytes: 504,
      exportFileName: "",
      cleanedFileName: "",
      message: "Pilih dump BIOS lalu Analyze untuk menampilkan daftar RAM.",
      errorMessage: "",
      notes: [
        "Mode default mengikuti referensi legacy: DDR4, fill 00, SPD Bytes 504.",
        "Centang RAM yang ingin dibersihkan sebelum klik Finished BIOS.",
        "File original tidak diubah."
      ]
    };
  }

  function getVisibleBlocks(state) {
    return (Array.isArray(state.blocks) ? state.blocks : [])
      .filter((block) => block.memoryType === state.memoryType && block.cleanable);
  }

  function isSelected(state, block) {
    return state.selectedOffsets.includes(Number(block.offset));
  }

  function createRamTableMarkup(state) {
    const rows = getVisibleBlocks(state);
    if (rows.length === 0) {
      return `
        <div class="bios-vendor-detect-candidate-card bios-vendor-detect-candidate-card-empty">
          <span class="material-symbols-outlined">memory_alt</span>
          <div>
            <strong>Belum ada RAM ${escapeHtml(state.memoryType)}</strong>
            <p>Analyze file BIOS atau ganti pilihan DDR3/DDR4.</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="bios-memory-spd-table-wrap">
        <table class="bios-memory-spd-table">
          <thead>
            <tr>
              <th></th>
              <th>No</th>
              <th>RAM</th>
              <th>HEX</th>
              <th>C</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((block, index) => `
              <tr>
                <td>
                  <input
                    type="checkbox"
                    class="bios-memory-spd-row-checkbox"
                    data-offset="${escapeHtml(block.offset)}"
                    ${isSelected(state, block) ? "checked" : ""}>
                </td>
                <td>${index + 1}</td>
                <td>${escapeHtml(block.partNumber && block.partNumber !== "-" ? block.partNumber : block.moduleType)}</td>
                <td>${escapeHtml(block.offsetHex || "-")}</td>
                <td>${block.crcValid ? "OK" : "-"}</td>
                <td>${escapeHtml(block.sizeText || "-")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function createWorkbenchMarkup(state, busyAction, hasExportDownload, hasCleanDownload) {
    const busy = Boolean(busyAction);
    const disableAttr = busy ? " disabled" : "";
    const selectedCount = state.selectedOffsets.length;
    const exportDisabled = busy || state.blockCount <= 0 ? " disabled" : "";
    const cleanDisabled = busy || selectedCount <= 0 ? " disabled" : "";
    const exportReadyClass = hasExportDownload ? "ghost ami-decryptor-download-button is-ready" : "ghost ami-decryptor-download-button";
    const cleanReadyClass = hasCleanDownload ? "ghost ami-decryptor-download-button is-ready" : "ghost ami-decryptor-download-button";

    return `
      <section class="spi-card bios-memory-spd-card${state.errorMessage ? " is-failed" : ""}">
        <div class="spi-card-head">
          <div>
            <p class="label">BIOS folder</p>
            <h4>${escapeHtml(state.fileName || "Belum ada file")}</h4>
          </div>
          <button type="button" id="biosMemorySpdAnalyzeButton" class="ghost"${disableAttr}>
            <span class="material-symbols-outlined${busyAction === "analyze" ? " is-spinning" : ""}">${busyAction === "analyze" ? "progress_activity" : "search"}</span>
            <span>${busyAction === "analyze" ? "Analyze..." : "Analyze"}</span>
          </button>
        </div>

        <div class="spi-form-grid bios-memory-spd-control-grid">
          <label class="spi-file-field">
            File BIOS
            <input id="biosMemorySpdFileInput" type="file" accept="${acceptedExtensions}"${disableAttr}>
          </label>
          <label>
            Ukuran
            <input type="text" value="${escapeHtml(formatBytes(state.fileSize))}" readonly>
          </label>
          <label>
            SPD Bytes
            <input id="biosMemorySpdBytesInput" type="number" min="1" max="512" value="${escapeHtml(state.spdBytes)}"${disableAttr}>
          </label>
          <label>
            Fill
            <select id="biosMemorySpdFillSelect"${disableAttr}>
              <option value="00"${state.fillByte === "00" ? " selected" : ""}>00</option>
              <option value="FF"${state.fillByte === "FF" ? " selected" : ""}>FF</option>
            </select>
          </label>
        </div>

        <p class="spi-note">${escapeHtml(state.errorMessage || state.message)}</p>

        <div class="bios-memory-spd-legacy-grid">
          <div>
            ${createRamTableMarkup(state)}
          </div>
          <div class="bios-memory-spd-side-panel">
            <label class="bios-memory-spd-radio">
              <input type="radio" name="biosMemorySpdType" value="DDR3"${state.memoryType === "DDR3" ? " checked" : ""}${disableAttr}>
              <span>DDR3</span>
            </label>
            <label class="bios-memory-spd-radio">
              <input type="radio" name="biosMemorySpdType" value="DDR4"${state.memoryType === "DDR4" ? " checked" : ""}${disableAttr}>
              <span>DDR4</span>
            </label>
            <button type="button" id="biosMemorySpdClearSelectionButton" class="ghost"${disableAttr}>
              <span class="material-symbols-outlined">delete</span>
              <span>Delete</span>
            </button>
            <button type="button" id="biosMemorySpdExportButton" class="ghost"${exportDisabled}>
              <span class="material-symbols-outlined${busyAction === "export" ? " is-spinning" : ""}">${busyAction === "export" ? "progress_activity" : "archive"}</span>
              <span>Export SPD</span>
            </button>
            <button type="button" id="biosMemorySpdCleanButton" class="ghost"${cleanDisabled}>
              <span class="material-symbols-outlined${busyAction === "clean" ? " is-spinning" : ""}">${busyAction === "clean" ? "progress_activity" : "task_alt"}</span>
              <span>Finished BIOS</span>
            </button>
          </div>
        </div>

        <div class="boardviewer-actions lenovo-bios-patch-download">
          <button type="button" id="biosMemorySpdDownloadExportButton" class="${exportReadyClass}"${hasExportDownload ? "" : " disabled"}>
            <span class="material-symbols-outlined">download</span>
            <span>Download ZIP</span>
          </button>
          <button type="button" id="biosMemorySpdDownloadCleanButton" class="${cleanReadyClass}"${hasCleanDownload ? "" : " disabled"}>
            <span class="material-symbols-outlined">download</span>
            <span>Download clean</span>
          </button>
        </div>
      </section>
    `;
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let notify = () => {};
    let busyAction = "";
    let selectedFile = null;
    let exportDownloadUrl = "";
    let cleanDownloadUrl = "";

    function revokeDownloadUrls() {
      if (exportDownloadUrl) {
        URL.revokeObjectURL(exportDownloadUrl);
        exportDownloadUrl = "";
      }

      if (cleanDownloadUrl) {
        URL.revokeObjectURL(cleanDownloadUrl);
        cleanDownloadUrl = "";
      }
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(
        state,
        busyAction,
        Boolean(exportDownloadUrl),
        Boolean(cleanDownloadUrl)
      );

      const fileInput = mountedContainer.querySelector("#biosMemorySpdFileInput");
      const fillSelect = mountedContainer.querySelector("#biosMemorySpdFillSelect");
      const spdBytesInput = mountedContainer.querySelector("#biosMemorySpdBytesInput");
      const analyzeButton = mountedContainer.querySelector("#biosMemorySpdAnalyzeButton");
      const exportButton = mountedContainer.querySelector("#biosMemorySpdExportButton");
      const cleanButton = mountedContainer.querySelector("#biosMemorySpdCleanButton");
      const clearSelectionButton = mountedContainer.querySelector("#biosMemorySpdClearSelectionButton");
      const downloadExportButton = mountedContainer.querySelector("#biosMemorySpdDownloadExportButton");
      const downloadCleanButton = mountedContainer.querySelector("#biosMemorySpdDownloadCleanButton");

      fileInput?.addEventListener("change", () => {
        selectedFile = fileInput.files?.[0] || null;
        revokeDownloadUrls();
        state = {
          ...createInitialState(),
          fileName: selectedFile?.name || "",
          fileSize: Number(selectedFile?.size || 0),
          message: selectedFile
            ? "File siap dianalisa. Klik Analyze untuk membaca daftar RAM."
            : createInitialState().message
        };
        render();
      });

      fillSelect?.addEventListener("change", () => {
        state.fillByte = fillSelect.value === "FF" ? "FF" : "00";
        render();
      });

      spdBytesInput?.addEventListener("change", () => {
        const value = Number.parseInt(spdBytesInput.value, 10);
        state.spdBytes = Number.isFinite(value) ? Math.min(512, Math.max(1, value)) : 504;
        render();
      });

      mountedContainer.querySelectorAll("input[name='biosMemorySpdType']").forEach((radio) => {
        radio.addEventListener("change", () => {
          state.memoryType = radio.value === "DDR3" ? "DDR3" : "DDR4";
          state.selectedOffsets = [];
          render();
        });
      });

      mountedContainer.querySelectorAll(".bios-memory-spd-row-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          const offset = Number(checkbox.getAttribute("data-offset"));
          const selected = new Set(state.selectedOffsets);
          if (checkbox.checked) {
            selected.add(offset);
          } else {
            selected.delete(offset);
          }

          state.selectedOffsets = Array.from(selected).sort((left, right) => left - right);
          render();
        });
      });

      clearSelectionButton?.addEventListener("click", () => {
        state.selectedOffsets = [];
        render();
      });

      analyzeButton?.addEventListener("click", () => withBusy("analyze", async () => {
        if (!selectedFile) {
          throw new Error("Pilih file BIOS dulu sebelum menjalankan Analyze.");
        }

        const formData = new FormData();
        formData.set("file", selectedFile);
        const analysis = await fetchJson("/tools/bios-memory-spd/analyze", {
          method: "POST",
          body: formData
        });

        revokeDownloadUrls();
        state = {
          ...state,
          fileName: analysis.fileName || selectedFile.name,
          fileSize: Number(analysis.fileSize || selectedFile.size || 0),
          analyzedAt: analysis.analyzedAt || "-",
          blockCount: Number(analysis.blockCount || 0),
          cleanableBlockCount: Number(analysis.cleanableBlockCount || 0),
          cleanableBytes: Number(analysis.cleanableBytes || 0),
          ddr3Count: Number(analysis.ddr3Count || 0),
          ddr4Count: Number(analysis.ddr4Count || 0),
          blocks: Array.isArray(analysis.blocks) ? analysis.blocks : [],
          fillByte: analysis.defaultFillByteHex === "FF" ? "FF" : "00",
          selectedOffsets: [],
          message: analysis.message || "Analyze selesai.",
          errorMessage: "",
          exportFileName: "",
          cleanedFileName: ""
        };
        notify(state.message);
      }));

      exportButton?.addEventListener("click", () => withBusy("export", async () => {
        if (!selectedFile) {
          throw new Error("Pilih file BIOS dulu sebelum Export SPD.");
        }

        const formData = new FormData();
        formData.set("file", selectedFile);
        const result = await fetchBinary("/tools/bios-memory-spd/export", formData, `${selectedFile.name}_exportSPD.zip`);

        if (exportDownloadUrl) {
          URL.revokeObjectURL(exportDownloadUrl);
        }

        exportDownloadUrl = URL.createObjectURL(result.blob);
        state.exportFileName = result.fileName;
        state.message = `Export SPD selesai: ${result.fileName}.`;
        state.errorMessage = "";
        notify("Export SPD selesai. Tombol download ZIP sudah aktif.");
      }));

      cleanButton?.addEventListener("click", () => withBusy("clean", async () => {
        if (!selectedFile) {
          throw new Error("Pilih file BIOS dulu sebelum Finished BIOS.");
        }

        if (state.selectedOffsets.length <= 0) {
          throw new Error("Centang minimal satu RAM sebelum Finished BIOS.");
        }

        const formData = new FormData();
        formData.set("file", selectedFile);
        formData.set("fillByte", state.fillByte);
        formData.set("spdBytes", String(state.spdBytes));
        formData.set(
          "selectedOffsets",
          state.selectedOffsets.map((offset) => `0x${offset.toString(16).toUpperCase()}`).join(",")
        );

        const result = await fetchBinary("/tools/bios-memory-spd/clean", formData, `clean_SPD_${selectedFile.name}`);

        if (cleanDownloadUrl) {
          URL.revokeObjectURL(cleanDownloadUrl);
        }

        cleanDownloadUrl = URL.createObjectURL(result.blob);
        state.cleanedFileName = result.fileName;
        state.message = `Finished BIOS selesai: ${result.fileName}.`;
        state.errorMessage = "";
        notify("Finished BIOS selesai. Tombol download clean sudah aktif.");
      }));

      downloadExportButton?.addEventListener("click", () => {
        if (exportDownloadUrl && state.exportFileName) {
          triggerBrowserDownload(exportDownloadUrl, state.exportFileName);
        }
      });

      downloadCleanButton?.addEventListener("click", () => {
        if (cleanDownloadUrl && state.cleanedFileName) {
          triggerBrowserDownload(cleanDownloadUrl, state.cleanedFileName);
        }
      });
    }

    async function withBusy(action, work) {
      if (busyAction) {
        return;
      }

      busyAction = action;
      render();

      try {
        await work();
      } catch (error) {
        state.errorMessage = error?.message || "BIOS Memory SPD Cleaner gagal dijalankan.";
        notify(state.errorMessage, true);
      } finally {
        busyAction = "";
        render();
      }
    }

    return {
      viewKey: "tool_bios_memory_spd",
      eyebrow: "Bios Patch",
      title: "BIOS Memory SPD Cleaner",
      subtitle: "Select RAM, export SPD, dan Finished BIOS dengan pola legacy tool.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        notify = typeof options.notify === "function" ? options.notify : notify;
        render();
      },
      setVisible(visible) {
        mountedContainer?.classList.toggle("hidden", !visible);
      },
      async refresh() {
        render();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.biosMemorySpd = createApi();
})(window);
