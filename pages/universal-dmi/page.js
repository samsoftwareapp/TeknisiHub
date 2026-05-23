(function initializeUniversalDmiPage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const brandPlaceholder = "----Select Brand ---";
  const brands = [
    "Lenovo",
    "ASUS",
    "Acer",
    "Dell",
    "HP",
    "MSI",
    "Gigabyte",
    "Toshiba",
    "Samsung",
    "Sony",
    "Fujitsu",
    "Generic"
  ];
  const officialExtensionsByBrand = {
    ASUS: [".zip"],
    Acer: [".zip"],
    Lenovo: [".exe"],
    HP: [".exe"],
    Dell: [".exe"],
    Toshiba: [".exe", ".zip"],
    MSI: [".zip"],
    Gigabyte: [".zip"],
    Samsung: [".exe", ".zip"],
    Fujitsu: [".exe", ".zip"],
    Sony: [".exe", ".zip"],
    Generic: [".exe", ".zip"]
  };
  const dumpExtensions = [".bin", ".rom", ".fd", ".cap", ".bio", ".wph"];
  const fieldDefs = [
    ["product", "Product"],
    ["version", "Version"],
    ["mtm", "MTM / SKU"],
    ["serial", "Serial"],
    ["boardSerial", "Board serial"],
    ["uuidText", "UUID"],
    ["asset", "Asset tag"],
    ["family", "Family"],
    ["manufacturer", "Manufacturer"]
  ];
  const fieldLayouts = {
    Lenovo: ["product", "version", "mtm", "serial", "boardSerial", "uuidText", "asset", "family"],
    ASUS: ["product", "version", "mtm", "serial", "boardSerial", "manufacturer"],
    Acer: ["product", "serial", "boardSerial", "uuidText", "asset", "family", "manufacturer"],
    Dell: ["product", "version", "mtm", "serial", "boardSerial", "uuidText", "asset", "family", "manufacturer"],
    HP: ["product", "version", "mtm", "serial", "boardSerial", "uuidText", "asset", "family", "manufacturer"],
    MSI: ["product", "version", "serial", "boardSerial", "uuidText", "family", "manufacturer"],
    Gigabyte: ["product", "version", "serial", "boardSerial", "uuidText", "family", "manufacturer"],
    Toshiba: ["product", "version", "serial", "boardSerial", "uuidText", "asset", "family", "manufacturer"],
    Samsung: ["product", "version", "serial", "boardSerial", "uuidText", "asset", "family", "manufacturer"],
    Sony: ["product", "version", "serial", "boardSerial", "uuidText", "asset", "family", "manufacturer"],
    Fujitsu: ["product", "version", "serial", "boardSerial", "uuidText", "asset", "family", "manufacturer"],
    Generic: ["product", "version", "mtm", "serial", "boardSerial", "uuidText", "asset", "family", "manufacturer"]
  };
  const labelOverrides = {
    "Acer:asset": "SNID",
    "HP:mtm": "Product number / SKU"
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  function normalizeBrand(value) {
    const text = String(value || "").trim();
    return brands.includes(text) ? text : brandPlaceholder;
  }

  function isBrandSelected(value) {
    return brands.includes(String(value || "").trim());
  }

  function effectiveBrand(value) {
    return isBrandSelected(value) ? value : "ASUS";
  }

  function allowedOfficialExtensions(brand) {
    return officialExtensionsByBrand[effectiveBrand(brand)] || [".exe", ".zip"];
  }

  function extensionOf(fileName) {
    const match = String(fileName || "").toLowerCase().match(/(\.[^.\\/:]+)$/);
    return match?.[1] || "";
  }

  function validateExtension(file, allowed, kind, brand = "") {
    const suffix = extensionOf(file?.name || "");
    if (allowed.includes(suffix)) {
      return "";
    }

    if (kind === "official") {
      return [
        "Official BIOS ditolak.",
        `Format source official untuk ${effectiveBrand(brand)}: ${allowed.join(", ")}.`,
        `File yang dipilih: ${file?.name || "-"} (${suffix || "tanpa ekstensi"})`,
        "File raw seperti .bin/.rom/.fd/.bio/.wph/.cap jangan diload sebagai Official BIOS.",
        "Kalau file itu hasil programmer, hasil extract, donor, atau hasil patch, load sebagai Dump BIOS."
      ].join("\n");
    }

    return [
      "Dump BIOS ditolak.",
      `Format dump BIOS yang diterima: ${dumpExtensions.join(", ")}.`,
      `File yang dipilih: ${file?.name || "-"} (${suffix || "tanpa ekstensi"})`,
      "Paket vendor seperti .zip/.exe hanya untuk Load Official BIOS."
    ].join("\n");
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

  function displayValue(value) {
    const text = String(value || "").trim();
    return text || "NA";
  }

  function createInitialValues(brand = brandPlaceholder) {
    return {
      brand,
      product: "",
      version: "",
      mtm: "",
      serial: "",
      boardSerial: "",
      uuidText: "",
      asset: "",
      family: "",
      manufacturer: ""
    };
  }

  function normalizeValues(values, fallbackBrand = brandPlaceholder) {
    return {
      ...createInitialValues(fallbackBrand),
      ...(values || {}),
      brand: normalizeBrand(values?.brand || fallbackBrand)
    };
  }

  function hasDmiFields(values) {
    return fieldDefs.some(([key]) => String(values?.[key] || "").trim());
  }

  function visibleFieldDefs(brand, values = {}) {
    const layout = new Set(fieldLayouts[effectiveBrand(brand)] || fieldLayouts.ASUS);
    for (const [key] of fieldDefs) {
      if (String(values?.[key] || "").trim()) {
        layout.add(key);
      }
    }
    return fieldDefs.filter(([key]) => layout.has(key));
  }

  function fieldLabel(brand, key, fallback) {
    return labelOverrides[`${effectiveBrand(brand)}:${key}`] || fallback;
  }

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${serviceBaseUrl}${path}`, options);
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

  async function fetchPatchZip(formData) {
    const response = await fetch(`${serviceBaseUrl}/tools/universal-dmi/patch`, {
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
      fileName: extractDownloadFileName(response) || "universal_dmi_patch.zip"
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

  function createBrandOptions(selectedBrand) {
    return [brandPlaceholder, ...brands]
      .map((brand) => `<option value="${escapeHtml(brand)}"${brand === selectedBrand ? " selected" : ""}>${escapeHtml(brand)}</option>`)
      .join("");
  }

  function createSummary(values) {
    const normalized = normalizeValues(values, values?.brand || brandPlaceholder);
    const lines = [`Brand        : ${displayValue(normalized.brand === brandPlaceholder ? "" : normalized.brand)}`];
    for (const [key, label] of visibleFieldDefs(normalized.brand, normalized)) {
      lines.push(`${fieldLabel(normalized.brand, key, label).padEnd(12, " ")}: ${displayValue(normalized[key])}`);
    }
    return lines.join("\n");
  }

  function createReadFormMarkup(title, prefix, result) {
    if (!result) {
      return "";
    }
    const values = normalizeValues(result.values, result.values?.brand || brandPlaceholder);
    const variant = result.variant || {};
    return `
      <section class="spi-card universal-dmi-form-card is-success">
        <div class="spi-card-head">
          <div>
            <p class="label">${escapeHtml(title)}</p>
            <h4>${escapeHtml(values.brand || "NA")}</h4>
          </div>
          <span class="spi-mini-badge">${escapeHtml(variant.variantId || "NO_VARIANT")}</span>
        </div>
        <pre class="universal-dmi-summary" aria-label="${escapeHtml(title)}">${escapeHtml(createSummary(values))}</pre>
        <div class="universal-dmi-variant-strip">
          <span>${escapeHtml(variant.strategy || "-")}</span>
          <span>${variant.patchable ? "Patchable" : "Read only"}</span>
          <span>${escapeHtml(result.candidateName || "-")}</span>
        </div>
        <details class="universal-dmi-raw">
          <summary>Report ${escapeHtml(prefix)}</summary>
          <pre>${escapeHtml(result.rawInfo || "Belum ada report.")}</pre>
        </details>
      </section>
    `;
  }

  function createPatchFieldsMarkup(values, disabled) {
    const disabledAttr = disabled ? " disabled" : "";
    const brand = effectiveBrand(values.brand);
    return visibleFieldDefs(brand, values).map(([key, label]) => `
      <label>
        ${escapeHtml(fieldLabel(brand, key, label))}
        <input id="universalDmiPatch_${escapeHtml(key)}" type="text" value="${escapeHtml(values[key] || "")}"${disabledAttr}>
      </label>
    `).join("");
  }

  function createStateMessage(state) {
    return escapeHtml(state.errorMessage || state.message || "");
  }

  function createWorkbenchMarkup(state) {
    const busy = Boolean(state.busy);
    const disabledAttr = busy ? " disabled" : "";
    const officialAccept = allowedOfficialExtensions(state.brand).join(",");
    const patchVisible = Boolean(state.officialResult || state.dumpResult);
    const patchReady = patchVisible && isBrandSelected(state.brand) && !busy;
    const downloadReady = Boolean(state.downloadUrl);

    return `
      <div class="spi-layout universal-dmi-top-layout">
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Universal DMI</p>
              <h4>Files</h4>
            </div>
            <span class="spi-mini-badge">${escapeHtml(state.engineVersion || "csharp-native")}</span>
          </div>
          <div class="spi-form-grid">
            <label>
              Brand
              <select id="universalDmiBrandSelect"${disabledAttr}>
                ${createBrandOptions(state.brand)}
              </select>
            </label>
            <label class="spi-file-field">
              Official BIOS
              <input id="universalDmiOfficialFile" type="file" accept="${officialAccept}"${disabledAttr}>
            </label>
            <label>
              Official terpilih
              <input type="text" value="${escapeHtml(state.officialFile?.name || "")}" placeholder="Belum ada file" readonly>
            </label>
            <label>
              Ukuran official
              <input type="text" value="${escapeHtml(formatBytes(state.officialFile?.size || 0))}" placeholder="-" readonly>
            </label>
            <label class="spi-file-field">
              Dump BIOS
              <input id="universalDmiDumpFile" type="file" accept="${dumpExtensions.join(",")}"${disabledAttr}>
            </label>
            <label>
              Dump terpilih
              <input type="text" value="${escapeHtml(state.dumpFile?.name || "")}" placeholder="Belum ada file" readonly>
            </label>
            <label>
              Ukuran dump
              <input type="text" value="${escapeHtml(formatBytes(state.dumpFile?.size || 0))}" placeholder="-" readonly>
            </label>
            <label>
              Status
              <input type="text" value="${escapeHtml(state.busyLabel || "Ready")}" readonly>
            </label>
          </div>
          <p class="spi-note">${createStateMessage(state)}</p>
        </section>

        ${patchVisible ? `
          <section class="spi-card">
            <div class="spi-card-head">
              <div>
                <p class="label">FORM 3 PATCH INPUT</p>
                <h4>Editable</h4>
              </div>
              <label class="checkline universal-dmi-cleanme">
                <input id="universalDmiCleanMeCheckbox" type="checkbox"${state.cleanMe ? " checked" : ""}${disabledAttr}>
                <span>Clean ME</span>
              </label>
            </div>
            <div class="spi-form-grid">
              ${createPatchFieldsMarkup(state.patchValues, busy)}
            </div>
            <div class="boardviewer-actions universal-dmi-patch-actions">
              <button type="button" id="universalDmiPatchButton" class="ghost"${patchReady ? "" : " disabled"}>
                <span class="material-symbols-outlined${state.busy === "patch" ? " is-spinning" : ""}">${state.busy === "patch" ? "progress_activity" : "build"}</span>
                <span>${state.cleanMe ? "Patch Clean ME" : "Patch BIOS"}</span>
              </button>
              <button type="button" id="universalDmiDownloadButton" class="ghost ami-decryptor-download-button${downloadReady ? " is-ready" : ""}"${downloadReady ? "" : " disabled"}>
                <span class="material-symbols-outlined">download</span>
                <span>Download hasil</span>
              </button>
            </div>
          </section>
        ` : ""}
      </div>

      <div class="spi-layout universal-dmi-form-layout">
        ${createReadFormMarkup("FORM 1 OFFICIAL - Read Only", "official", state.officialResult)}
        ${createReadFormMarkup("FORM 2 DUMP - Read Only", "dump", state.dumpResult)}
      </div>
    `;
  }

  function createApi() {
    let state = {
      brand: brandPlaceholder,
      engineVersion: "",
      officialFile: null,
      dumpFile: null,
      officialResult: null,
      dumpResult: null,
      patchValues: createInitialValues(brandPlaceholder),
      cleanMe: false,
      busy: "",
      busyLabel: "",
      message: "Pilih brand, lalu load Official BIOS atau Dump BIOS. File akan auto-read.",
      errorMessage: "",
      downloadUrl: "",
      downloadFileName: ""
    };
    let mountedContainer = null;
    let notify = () => {};

    function revokeDownloadUrl() {
      if (state.downloadUrl) {
        URL.revokeObjectURL(state.downloadUrl);
      }
      state.downloadUrl = "";
      state.downloadFileName = "";
    }

    function patchValuesFromInputs() {
      const next = normalizeValues(state.patchValues, state.brand);
      for (const [key] of fieldDefs) {
        const input = mountedContainer?.querySelector(`#universalDmiPatch_${key}`);
        if (input) {
          next[key] = input.value;
        }
      }
      next.brand = state.brand;
      return next;
    }

    function syncPatchFromResult(result, prefer) {
      const values = normalizeValues(result?.values, state.brand);
      state.brand = values.brand || state.brand;
      if (prefer || !hasDmiFields(state.patchValues)) {
        state.patchValues = normalizeValues(values, state.brand);
      } else {
        state.patchValues.brand = state.brand;
      }
    }

    function rejectWithoutBrand(input) {
      if (isBrandSelected(state.brand)) {
        return false;
      }
      if (input) {
        input.value = "";
      }
      state.errorMessage = "Pilih brand dulu sebelum Load BIOS.";
      notify(state.errorMessage, true);
      render();
      return true;
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state);

      const brandSelect = mountedContainer.querySelector("#universalDmiBrandSelect");
      const officialInput = mountedContainer.querySelector("#universalDmiOfficialFile");
      const dumpInput = mountedContainer.querySelector("#universalDmiDumpFile");
      const patchButton = mountedContainer.querySelector("#universalDmiPatchButton");
      const downloadButton = mountedContainer.querySelector("#universalDmiDownloadButton");
      const cleanMeCheckbox = mountedContainer.querySelector("#universalDmiCleanMeCheckbox");

      brandSelect?.addEventListener("change", () => {
        state.brand = normalizeBrand(brandSelect.value);
        state.patchValues.brand = state.brand;
        state.errorMessage = "";
        render();
      });

      officialInput?.addEventListener("change", () => {
        if (rejectWithoutBrand(officialInput)) {
          return;
        }
        const file = officialInput.files?.[0] || null;
        if (file) {
          const message = validateExtension(file, allowedOfficialExtensions(state.brand), "official", state.brand);
          if (message) {
            officialInput.value = "";
            state.errorMessage = message;
            notify(message, true);
            render();
            return;
          }
        }
        state.officialFile = file;
        state.officialResult = null;
        state.errorMessage = "";
        revokeDownloadUrl();
        render();
        if (state.officialFile) {
          void readSource("official");
        }
      });

      dumpInput?.addEventListener("change", () => {
        if (rejectWithoutBrand(dumpInput)) {
          return;
        }
        const file = dumpInput.files?.[0] || null;
        if (file) {
          const message = validateExtension(file, dumpExtensions, "dump");
          if (message) {
            dumpInput.value = "";
            state.errorMessage = message;
            notify(message, true);
            render();
            return;
          }
        }
        state.dumpFile = file;
        state.dumpResult = null;
        state.errorMessage = "";
        revokeDownloadUrl();
        render();
        if (state.dumpFile) {
          void readSource("dump");
        }
      });

      cleanMeCheckbox?.addEventListener("change", () => {
        state.cleanMe = Boolean(cleanMeCheckbox.checked);
        render();
      });

      for (const [key] of fieldDefs) {
        const input = mountedContainer.querySelector(`#universalDmiPatch_${key}`);
        input?.addEventListener("input", () => {
          state.patchValues[key] = input.value;
          revokeDownloadUrl();
        });
      }

      patchButton?.addEventListener("click", () => void patchBios());
      downloadButton?.addEventListener("click", () => {
        if (!state.downloadUrl) {
          return;
        }
        const anchor = document.createElement("a");
        anchor.href = state.downloadUrl;
        anchor.download = state.downloadFileName || "universal_dmi_patch.zip";
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
      });
    }

    async function loadManifest() {
      try {
        const manifest = await fetchJson("/tools/universal-dmi/manifest", {
          headers: { Accept: "application/json" }
        });
        state.engineVersion = manifest.version || "csharp-native";
        render();
      } catch {
        state.engineVersion = "csharp-native";
      }
    }

    async function readSource(kind) {
      if (state.busy) {
        return;
      }
      if (!isBrandSelected(state.brand)) {
        state.errorMessage = "Pilih brand dulu sebelum Load BIOS.";
        render();
        return;
      }
      const file = kind === "official" ? state.officialFile : state.dumpFile;
      if (!file) {
        state.errorMessage = kind === "official" ? "Load Official BIOS dulu." : "Load Dump BIOS dulu.";
        render();
        return;
      }

      state.busy = kind;
      state.busyLabel = kind === "official" ? "Read Official BIOS..." : "Read Dump BIOS...";
      state.errorMessage = "";
      state.message = kind === "official"
        ? "Read Official BIOS sedang berjalan..."
        : "Read Dump BIOS sedang berjalan...";
      revokeDownloadUrl();
      render();

      try {
        const formData = new FormData();
        formData.set("brand", state.brand);
        formData.set("file", file);
        const path = kind === "official" ? "/tools/universal-dmi/read-official" : "/tools/universal-dmi/read-dump";
        const result = await fetchJson(path, {
          method: "POST",
          body: formData
        });

        if (kind === "official") {
          state.officialResult = result;
          syncPatchFromResult(result, false);
        } else {
          state.dumpResult = result;
          syncPatchFromResult(result, true);
        }

        state.message = result.message || "Read DMI selesai.";
        notify(`${kind === "official" ? "Official" : "Dump"} DMI selesai dibaca.`);
      } catch (error) {
        state.errorMessage = error?.message || "Read DMI gagal.";
        notify(state.errorMessage, true);
      } finally {
        state.busy = "";
        state.busyLabel = "";
        render();
      }
    }

    async function patchBios() {
      if (state.busy) {
        return;
      }
      if (!isBrandSelected(state.brand)) {
        state.errorMessage = "Pilih brand manual atau Read dump dulu sampai brand terdeteksi.";
        render();
        return;
      }
      if (!state.officialFile && !state.dumpFile) {
        state.errorMessage = "Load Official BIOS atau Dump BIOS dulu sebelum patch.";
        render();
        return;
      }

      state.patchValues = patchValuesFromInputs();
      state.busy = "patch";
      state.busyLabel = state.cleanMe ? "Patch Clean ME..." : "Patch BIOS...";
      state.errorMessage = "";
      state.message = state.cleanMe ? "Patch Clean ME sedang berjalan..." : "Patch BIOS sedang berjalan...";
      revokeDownloadUrl();
      render();

      try {
        const formData = new FormData();
        formData.set("brand", state.brand);
        formData.set("cleanMe", state.cleanMe ? "true" : "false");
        for (const [key] of fieldDefs) {
          const pascalKey = key.slice(0, 1).toUpperCase() + key.slice(1);
          formData.set(pascalKey, state.patchValues[key] || "");
        }
        if (state.officialFile) {
          formData.set("officialFile", state.officialFile);
        }
        if (state.dumpFile) {
          formData.set("dumpFile", state.dumpFile);
        }

        const result = await fetchPatchZip(formData);
        state.downloadUrl = URL.createObjectURL(result.blob);
        state.downloadFileName = result.fileName;
        state.message = "Patch selesai. File ZIP hasil patch siap di-download.";
        notify("Patch Universal DMI selesai.");
      } catch (error) {
        state.errorMessage = error?.message || "Patch Universal DMI gagal.";
        notify(state.errorMessage, true);
      } finally {
        state.busy = "";
        state.busyLabel = "";
        render();
      }
    }

    return {
      viewKey: "tool_universal_dmi",
      eyebrow: "Universal DMI",
      title: "Universal DMI Tools",
      subtitle: "Read dan patch DMI BIOS mengikuti alur FORM 1/2/3 Universal-DMI-Tools.",
      items: [],
      mount(options = {}) {
        mountedContainer = options.container || null;
        notify = options.notify || (() => {});
        render();
        void loadManifest();
      },
      setVisible(visible) {
        mountedContainer?.classList.toggle("hidden", !visible);
      },
      refresh() {
        render();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.universalDmi = createApi();
})(window);
