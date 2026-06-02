(function initializeUniversalDmiPage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const acceptedExtensions = ".bin,.rom,.cap,.fd,.bio,.wph,.img,.efi,.hdr,.zip";

  const fieldDefs = [
    ["manufacturer", "Manufacturer"],
    ["product", "Product"],
    ["version", "Version"],
    ["mtm", "MTM / SKU"],
    ["serial", "Serial"],
    ["boardSerial", "Board serial"],
    ["uuidText", "UUID"],
    ["asset", "Asset tag"],
    ["family", "Family"]
  ];

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

  function createInitialValues() {
    return Object.fromEntries(fieldDefs.map(([key]) => [key, ""]));
  }

  function createInitialState() {
    return {
      manifest: null,
      brand: "Auto Detect",
      values: createInitialValues(),
      official: null,
      dump: null,
      officialResult: null,
      dumpResult: null,
      downloadUrl: "",
      downloadFileName: "",
      message: "Pilih dump atau official BIOS, lalu baca DMI sebelum patch.",
      errorMessage: ""
    };
  }

  function createBrandOptions(state) {
    const brands = state.manifest?.brands?.length
      ? state.manifest.brands
      : ["Auto Detect", "Lenovo", "ASUS", "Acer", "Dell", "HP", "Toshiba", "Generic"];
    return brands
      .map((brand) => `<option value="${escapeHtml(brand)}"${state.brand === brand ? " selected" : ""}>${escapeHtml(brand)}</option>`)
      .join("");
  }

  function createFieldsMarkup(state, busy) {
    const disabled = busy ? " disabled" : "";
    return fieldDefs
      .map(([key, label]) => `
        <label>
          ${escapeHtml(label)}
          <input
            data-dmi-field="${escapeHtml(key)}"
            type="text"
            value="${escapeHtml(state.values[key] || "")}"
            ${disabled}>
        </label>
      `)
      .join("");
  }

  function createResultMarkup(title, result) {
    if (!result) {
      return `
        <article class="spi-stat-card">
          <span class="material-symbols-outlined">draft</span>
          <div>
            <p class="label">${escapeHtml(title)}</p>
            <strong>Belum dibaca</strong>
            <p>-</p>
          </div>
        </article>
      `;
    }

    return `
      <article class="spi-stat-card">
        <span class="material-symbols-outlined">${result.success ? "task_alt" : "info"}</span>
        <div>
          <p class="label">${escapeHtml(title)}</p>
          <strong>${escapeHtml(result.variant?.variantId || "-")}</strong>
          <p>${escapeHtml(result.candidateName || result.fileName || "-")} | ${escapeHtml(formatBytes(result.fileSize))}</p>
        </div>
      </article>
    `;
  }

  function createWorkbenchMarkup(state, busyAction) {
    const busy = Boolean(busyAction);
    const disabled = busy ? " disabled" : "";
    const patchDisabled = busy || (!state.official && !state.dump) ? " disabled" : "";
    const downloadDisabled = state.downloadUrl ? "" : " disabled";

    return `
      <div class="spi-layout">
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Universal DMI</p>
              <h4>Patcher data perangkat</h4>
            </div>
            <button type="button" id="universalDmiPatchButton" class="ghost"${patchDisabled}>
              <span class="material-symbols-outlined${busyAction === "patch" ? " is-spinning" : ""}">${busyAction === "patch" ? "progress_activity" : "construction"}</span>
              <span>${busyAction === "patch" ? "Patch..." : "Patch"}</span>
            </button>
          </div>

          <div class="spi-form-grid">
            <label>
              Brand
              <select id="universalDmiBrandSelect"${disabled}>
                ${createBrandOptions(state)}
              </select>
            </label>
            <label class="spi-file-field">
              Official BIOS
              <input id="universalDmiOfficialInput" type="file" accept="${acceptedExtensions}"${disabled}>
            </label>
            <label class="spi-file-field">
              Dump BIOS
              <input id="universalDmiDumpInput" type="file" accept="${acceptedExtensions}"${disabled}>
            </label>
            <label>
              Engine
              <input type="text" value="${escapeHtml(state.manifest?.engine || "TeknisiHub Universal DMI")}" readonly>
            </label>
          </div>

          <div class="boardviewer-actions lenovo-bios-patch-download">
            <button type="button" id="universalDmiReadOfficialButton" class="ghost"${busy || !state.official ? " disabled" : ""}>
              <span class="material-symbols-outlined${busyAction === "readOfficial" ? " is-spinning" : ""}">${busyAction === "readOfficial" ? "progress_activity" : "source"}</span>
              <span>Read official</span>
            </button>
            <button type="button" id="universalDmiReadDumpButton" class="ghost"${busy || !state.dump ? " disabled" : ""}>
              <span class="material-symbols-outlined${busyAction === "readDump" ? " is-spinning" : ""}">${busyAction === "readDump" ? "progress_activity" : "memory"}</span>
              <span>Read dump</span>
            </button>
            <button type="button" id="universalDmiDownloadButton" class="ghost ami-decryptor-download-button${state.downloadUrl ? " is-ready" : ""}"${downloadDisabled}>
              <span class="material-symbols-outlined">download</span>
              <span>Download ZIP</span>
            </button>
          </div>

          <p class="spi-note">${escapeHtml(state.errorMessage || state.message)}</p>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">DMI Fields</p>
              <h4>Patch input</h4>
            </div>
          </div>
          <div class="spi-form-grid">
            ${createFieldsMarkup(state, busy)}
          </div>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Read Result</p>
              <h4>Detected variants</h4>
            </div>
          </div>
          <div class="spi-stats-grid">
            ${createResultMarkup("Official", state.officialResult)}
            ${createResultMarkup("Dump", state.dumpResult)}
          </div>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Raw Info</p>
              <h4>Parser output</h4>
            </div>
          </div>
          <pre class="me-analyzer-console">${escapeHtml(state.dumpResult?.rawInfo || state.officialResult?.rawInfo || "Belum ada output.")}</pre>
        </section>
      </div>
    `;
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let notify = () => {};
    let busyAction = "";

    function revokeDownloadUrl() {
      if (state.downloadUrl) {
        URL.revokeObjectURL(state.downloadUrl);
        state.downloadUrl = "";
        state.downloadFileName = "";
      }
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busyAction);

      mountedContainer.querySelector("#universalDmiBrandSelect")?.addEventListener("change", (event) => {
        state.brand = event.target.value || "Auto Detect";
      });

      mountedContainer.querySelector("#universalDmiOfficialInput")?.addEventListener("change", (event) => {
        state.official = event.target.files?.[0] || null;
        state.officialResult = null;
        revokeDownloadUrl();
        state.message = state.official ? `Official siap: ${state.official.name}.` : "Official BIOS belum dipilih.";
        state.errorMessage = "";
        render();
      });

      mountedContainer.querySelector("#universalDmiDumpInput")?.addEventListener("change", (event) => {
        state.dump = event.target.files?.[0] || null;
        state.dumpResult = null;
        revokeDownloadUrl();
        state.message = state.dump ? `Dump siap: ${state.dump.name}.` : "Dump BIOS belum dipilih.";
        state.errorMessage = "";
        render();
      });

      mountedContainer.querySelectorAll("[data-dmi-field]").forEach((input) => {
        input.addEventListener("input", () => {
          state.values[input.getAttribute("data-dmi-field")] = input.value;
        });
      });

      mountedContainer.querySelector("#universalDmiReadOfficialButton")?.addEventListener("click", () => {
        void readFile("official");
      });

      mountedContainer.querySelector("#universalDmiReadDumpButton")?.addEventListener("click", () => {
        void readFile("dump");
      });

      mountedContainer.querySelector("#universalDmiPatchButton")?.addEventListener("click", () => {
        void patch();
      });

      mountedContainer.querySelector("#universalDmiDownloadButton")?.addEventListener("click", () => {
        if (state.downloadUrl && state.downloadFileName) {
          triggerBrowserDownload(state.downloadUrl, state.downloadFileName);
        }
      });
    }

    function applyValues(values) {
      const next = { ...state.values };
      fieldDefs.forEach(([key]) => {
        if (values?.[key]) {
          next[key] = values[key];
        }
      });
      state.values = next;
      if (values?.brand && state.brand === "Auto Detect") {
        state.brand = values.brand;
      }
    }

    async function readFile(kind) {
      const file = kind === "official" ? state.official : state.dump;
      if (!file) {
        throw new Error(kind === "official" ? "Pilih Official BIOS dulu." : "Pilih Dump BIOS dulu.");
      }

      const formData = new FormData();
      formData.set("file", file);
      formData.set("brand", state.brand);
      const path = kind === "official" ? "/tools/universal-dmi/read-official" : "/tools/universal-dmi/read-dump";

      await withBusy(kind === "official" ? "readOfficial" : "readDump", async () => {
        const result = await fetchJson(path, {
          method: "POST",
          body: formData
        });
        if (kind === "official") {
          state.officialResult = result;
        } else {
          state.dumpResult = result;
        }
        applyValues(result.values || {});
        state.message = result.message || "Read selesai.";
        state.errorMessage = "";
        notify(state.message);
      });
    }

    async function patch() {
      await withBusy("patch", async () => {
        if (!state.official && !state.dump) {
          throw new Error("Pilih Official BIOS atau Dump BIOS dulu.");
        }

        const formData = new FormData();
        formData.set("brand", state.brand);
        fieldDefs.forEach(([key]) => formData.set(key, state.values[key] || ""));
        if (state.official) {
          formData.set("officialFile", state.official);
        }
        if (state.dump) {
          formData.set("dumpFile", state.dump);
        }

        const result = await fetchBinary("/tools/universal-dmi/patch", formData, "UniversalDMI_patch.zip");
        revokeDownloadUrl();
        state.downloadUrl = URL.createObjectURL(result.blob);
        state.downloadFileName = result.fileName;
        state.message = `Patch selesai: ${result.fileName}.`;
        state.errorMessage = "";
        notify("Patch selesai. Tombol Download ZIP sudah aktif.");
      });
    }

    async function loadManifest() {
      try {
        state.manifest = await fetchJson("/tools/universal-dmi/manifest");
      } catch (error) {
        state.errorMessage = error?.message || "Manifest Universal DMI gagal dibaca.";
      }
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
        state.errorMessage = error?.message || "Universal DMI gagal dijalankan.";
        notify(state.errorMessage, true);
      } finally {
        busyAction = "";
        render();
      }
    }

    return {
      viewKey: "tool_universal_dmi",
      eyebrow: "Bios Patch",
      title: "Universal DMI",
      subtitle: "Baca dan patch data DMI perangkat dari file BIOS.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        notify = options.notify || (() => {});
        if (!state.manifest) {
          await loadManifest();
        }
        render();
      },
      setVisible(visible) {
        mountedContainer?.classList.toggle("hidden", !visible);
      },
      async refresh() {
        if (!state.manifest) {
          await loadManifest();
        }
        render();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.universalDmi = createApi();
})(window);
