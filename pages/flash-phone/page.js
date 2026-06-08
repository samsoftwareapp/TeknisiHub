(function initializeFlashPhonePage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();

  const androidToolOptions = [
    {
      value: "universal",
      label: "Universal",
      icon: "apps"
    },
    {
      value: "qfil",
      label: "QFIL",
      icon: "memory"
    }
  ];

  const platformOptions = [
    {
      value: "mtk",
      label: "MediaTek",
      badge: "MTK",
      modes: ["PreLoader / VCOM", "BootROM", "DA / Auth", "Meta"],
      series: [
        "4th Boot (Auto Connect)",
        "3rd OLD MTK II",
        "5th Boot (All Flash / 6235)",
        "6th New Boot (62xx)",
        "7th Boot (V5/V12 MT6252/6276)",
        "8th Boot (MT65xx/MT67xx/8127)",
        "Boot (MT6735/MT6582/MT6571/2)",
        "DA_SWSEC I",
        "DA_SWSEC II"
      ],
      profiles: ["Universal", "VIVO", "OPPO", "MEIZU", "Xiaomi", "Samsung", "Nokia USB"],
      brands: ["Acer", "VIVO", "OPPO", "MEIZU", "Xiaomi", "Lenovo", "Huawei"],
      models: ["Universal", "A1-811", "Y15", "Y69", "Y66", "A1601", "A71", "F5/A79/A83"],
      tabs: {
        service: [
          "Read Info", "Read", "Write", "Format", "Read Unlock / IMEI", "Badsoftware",
          "Read TelBk", "Write TelBk", "NV Read", "NV Write", "Backup Factory",
          "Network Unlock", "Repair FS", "Clear Code (ADB)", "Read Code (SIM)",
          "Unlock Bootloader", "Unlock (SIM)"
        ],
        unlock: [
          "Fix DL Mode", "ROOT", "Read Pattern", "Restore ROOT", "Read Network Code",
          "Reset Code", "Read PhoneBook", "Clear Setting / FRP", "BT Addr Repair",
          "Account Unlock", "Unlock Network", "Phone Lock"
        ],
        extra: [
          "Open USB Debug", "Backup BPLGUI", "Write Preloader", "FRP Remove", "RAM Test",
          "Memory Repartition", "Memory Read", "Memory Write", "Read Preloader",
          "Fix Baseband", "Init Modem", "Oppo Extract", "CPB Extract"
        ],
        custom: ["Custom Loader"]
      },
      files: ["DA File", "Auth File", "Preloader", "Scatter"]
    },
    {
      value: "qualcomm",
      label: "Qualcomm",
      badge: "QC",
      modes: ["EDL 9008", "Firehose", "Fastboot", "Diag"],
      series: ["Universal Qualcomm Method", "UFS Firehose", "eMMC Firehose", "Fastboot Method"],
      profiles: ["Universal", "Xiaomi", "VIVO / BBK", "OPPO", "Samsung", "Lenovo", "Motorola"],
      brands: ["Universal", "Xiaomi", "VIVO", "OPPO", "Samsung", "Motorola", "Lenovo"],
      models: ["Universal Qualcomm Method", "EDL New Method", "No Root Method", "Auto Backup QCN"],
      tabs: {
        service: [
          "Read Info", "Reboot", "Enable Diag", "Lock Bootloader", "Unlock Bootloader",
          "Reboot EDL from Fastboot", "Forced EDL", "Read QCN", "Write QCN", "Factory QCN Format"
        ],
        flash: ["Write Flash", "Custom Flasher", "EDL Mode", "Fastboot Mode"],
        format: [
          "Read Partitions", "Read Flash", "Read Pattern", "Factory Reset", "Direct Unlock",
          "Write Selected", "Wipe Selected", "Repair FS"
        ],
        unlock: ["Read Codes (Network)", "Direct Unlock (Network)", "New Method", "No Root Method"],
        extra: ["Backup QCN", "Restore QCN", "Port Check"]
      },
      files: ["Programmer", "RawProgram", "Patch File", "XML"]
    },
    {
      value: "spd",
      label: "Spreadtrum / SPD",
      badge: "SPD",
      modes: ["Diag", "Flash", "FDL", "PAC"],
      series: ["SPD6600L/6226/6530/6610/20", "SC77xx", "SC88xx", "SC98xx", "Unisoc"],
      profiles: ["Universal", "NAND", "eMMC", "PAC"],
      brands: ["Universal", "Itel", "Tecno", "Infinix", "Advan", "Evercoss"],
      models: ["Universal", "Auto", "Feature Phone", "Android SPD"],
      tabs: {
        service: [
          "Read Info", "Read", "Write", "Format", "Read Unlock", "File Unlock",
          "Read NV (Nand)", "Write NV (Nand)", "Backup Phonebook", "Read HW Info"
        ],
        unlock: ["Clear Code (Android)", "ROOT (ADB)", "SP Unlock", "FRP Reset", "Best User Code"],
        format: ["Main Clear", "Skip Userdata (eMMC)", "Read Flash Range"],
        extra: ["Restore Boot", "Restore Backup", "Miracle AV"]
      },
      files: ["PAC File", "FDL1", "FDL2"]
    },
    {
      value: "android",
      label: "ADB / Fastboot",
      badge: "ADB",
      modes: ["ADB", "Fastboot", "Recovery", "Sideload"],
      series: ["Android", "HTC / BCM", "Allwinner", "Nokia", "MTK Flasher", "Intel", "Xiaomi"],
      profiles: ["Universal", "Method 1", "Method 2", "Fastboot Extra"],
      brands: ["Universal", "Xiaomi", "Samsung", "VIVO", "OPPO", "Huawei", "Nokia"],
      models: ["Universal", "ADB Online", "Fastboot", "Recovery"],
      tabs: {
        service: [
          "Read Info", "Reboot Recovery", "Reboot Fastboot", "Install APK", "Sideload ZIP",
          "Backup APP", "Restore APP", "Backup SMS", "Restore SMS", "Backup Contacts"
        ],
        unlock: ["Clear Code", "Wipe / Factory Reset", "ROOT (ADB)", "Reset Gmail", "Google Lock Remove", "Mi Account Reset"],
        extra: ["Enable Diag", "Repair WiFi", "Read NV RAM", "Write NV RAM", "Enable All Languages"]
      },
      files: ["APK", "ZIP", "Image"]
    },
    {
      value: "rda",
      label: "RDA / CoolSand",
      badge: "RDA",
      modes: ["Boot", "SPI", "RAM Run"],
      series: ["CoolSand / RDA", "Feature Phone", "Auto Boot"],
      profiles: ["Universal", "SPI Flash", "NOR", "NAND"],
      brands: ["Universal", "Feature Phone"],
      models: ["Universal", "Auto"],
      tabs: {
        service: ["Read Info", "Read", "Write", "Format", "Read Code"],
        unlock: ["Unlock", "Clear Code", "Repair"],
        extra: ["Boot File", "RAM Run", "Pinout"]
      },
      files: ["Boot File", "Flash File"]
    },
    {
      value: "cdma",
      label: "CDMA / Legacy",
      badge: "CDMA",
      modes: ["Boot File", "SRE", "Legacy"],
      series: ["Universal", "CDMA", "SRE", "S37"],
      profiles: ["Universal", "Feature Phone"],
      brands: ["Universal"],
      models: ["Universal"],
      tabs: {
        service: ["Read Info", "Read", "Write", "Format"],
        unlock: ["Unlock", "Clear Code", "Repair"],
        extra: ["Boot File"]
      },
      files: ["Boot File", "SRE"]
    },
    {
      value: "intel",
      label: "Intel / xFSTK",
      badge: "INTEL",
      modes: ["xFSTK", "DNX", "Fastboot"],
      series: ["Universal", "Intel Android", "Legacy"],
      profiles: ["Universal", "DNX", "Fastboot"],
      brands: ["Universal", "Asus", "Lenovo"],
      models: ["Universal"],
      tabs: {
        service: ["Read Info", "Reboot", "Fastboot"],
        flash: ["Flash DNX", "Flash IFWI", "Flash OS"],
        unlock: ["Wipe", "Unlock"],
        extra: ["xFSTK Helper"]
      },
      files: ["DNX", "IFWI", "OS Image"]
    },
    {
      value: "brand",
      label: "Brand Pack",
      badge: "BRAND",
      modes: ["Xiaomi", "VIVO / BBK", "Samsung", "Motorola", "Blackberry"],
      series: ["Universal", "Xiaomi", "VIVO", "Samsung", "Moto", "Blackberry"],
      profiles: ["Universal", "EDL", "Fastboot", "ADB"],
      brands: ["Xiaomi", "VIVO", "OPPO", "Samsung", "Motorola", "Blackberry"],
      models: ["Universal", "Auto"],
      tabs: {
        service: ["Read Info", "Reboot", "Backup"],
        flash: ["Flash", "Patch", "Restore"],
        unlock: ["FRP Reset", "Account Reset", "Bootloader"],
        extra: ["Persist", "QCN", "GPT"]
      },
      files: ["Firehose", "Persist", "QCN", "Patch"]
    }
  ];

  const tabLabels = {
    service: "Service",
    flash: "Flash",
    format: "Format",
    unlock: "Unlock / Fix",
    extra: "Extra",
    custom: "Custom"
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${serviceBaseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      cache: options.cache || "no-store",
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

  async function fetchFormJson(path, formData, options = {}) {
    const response = await fetch(`${serviceBaseUrl}${path}`, {
      body: formData,
      cache: "no-store",
      method: "POST",
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
    const platform = platformOptions[0];
    const tab = Object.keys(platform.tabs)[0];
    return {
      busy: false,
      connected: false,
      running: false,
      progress: 0,
      status: "idle",
      androidTool: "universal",
      platform: platform.value,
      mode: platform.modes[0],
      portName: "auto",
      workTab: tab,
      action: platform.tabs[tab][0],
      series: platform.series[0],
      profile: platform.profiles[0],
      brand: platform.brands[0],
      model: platform.models[0],
      startAddress: "0x000000",
      size: "auto",
      flags: {
        usbCable: true,
        scanDef: false,
        all: true,
        backupRead: false,
        saveScatter: false
      },
      files: {},
      qualcommBuildType: "meta",
      qualcommInventory: null,
      qualcommLoad: null,
      selectedQualcommPackageId: "",
      ports: [],
      message: "Ready",
      logs: ["Ready"],
      readOnly: true,
      accessLabel: "Free"
    };
  }

  function getPlatform(value) {
    return platformOptions.find((item) => item.value === value) || platformOptions[0];
  }

  function getActiveTab(state) {
    const platform = getPlatform(state.platform);
    return platform.tabs[state.workTab] ? state.workTab : Object.keys(platform.tabs)[0];
  }

  function getActionOptions(state) {
    const platform = getPlatform(state.platform);
    return platform.tabs[getActiveTab(state)] || [];
  }

  function normalizePortName(value) {
    const nextValue = String(value || "").trim();
    return nextValue || "auto";
  }

  function formatTime() {
    const date = new Date();
    return [
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0"),
      String(date.getSeconds()).padStart(2, "0")
    ].join(":");
  }

  function createStatusText(state) {
    if (String(state.status || "").toLowerCase() === "waiting") {
      return "Waiting";
    }
    if (state.running) {
      return "Running";
    }
    if (state.connected) {
      return "Connected";
    }
    if (state.busy) {
      return "Working";
    }
    return "Standby";
  }

  function optionMarkup(options, selectedValue) {
    return (options || []).map((item) => `
      <option value="${escapeHtml(item)}"${item === selectedValue ? " selected" : ""}>${escapeHtml(item)}</option>
    `).join("");
  }

  function createPlatformOptionsMarkup(selectedValue) {
    return platformOptions.map((item) => `
      <option value="${escapeHtml(item.value)}"${item.value === selectedValue ? " selected" : ""}>
        ${escapeHtml(item.label)}
      </option>
    `).join("");
  }

  function createPortOptionsMarkup(state) {
    const selectedPort = normalizePortName(state.portName);
    const portOptions = Array.isArray(state.ports) ? state.ports : [];
    return `
      <option value="auto"${selectedPort === "auto" ? " selected" : ""}>Auto</option>
      ${portOptions.map((port) => {
        const portName = normalizePortName(port.portName);
        const label = port.label || port.portName || port.kind || "Device";
        return `
          <option value="${escapeHtml(portName)}"${portName === selectedPort ? " selected" : ""}>
            ${escapeHtml(label)}
          </option>
        `;
      }).join("")}
    `;
  }

  function createPlatformStrip(state, disabled = "") {
    return platformOptions.map((item) => `
      <button
        type="button"
        class="flash-phone-platform-pill${item.value === state.platform ? " is-active" : ""}"
        data-flash-platform="${escapeHtml(item.value)}"
        title="${escapeHtml(item.label)}"${disabled}>
        ${escapeHtml(item.badge)}
      </button>
    `).join("");
  }

  function createTabMarkup(state, disabled = "") {
    const platform = getPlatform(state.platform);
    const activeTab = getActiveTab(state);
    return Object.keys(platform.tabs).map((tab) => `
      <button
        type="button"
        class="flash-phone-work-tab${tab === activeTab ? " is-active" : ""}"
        data-flash-tab="${escapeHtml(tab)}"${disabled}>
        ${escapeHtml(tabLabels[tab] || tab)}
      </button>
    `).join("");
  }

  function createActionGrid(state, disabled = "") {
    const actions = getActionOptions(state);
    const disabledClass = disabled ? " is-disabled" : "";
    return actions.map((action) => `
      <label class="flash-phone-action-option${action === state.action ? " is-selected" : ""}${disabledClass}">
        <input type="radio" name="flashPhoneAction" value="${escapeHtml(action)}"${action === state.action ? " checked" : ""}${disabled}>
        <span>${escapeHtml(action)}</span>
      </label>
    `).join("");
  }

  function createFileFields(state, disabled = "") {
    const platform = getPlatform(state.platform);
    const disabledClass = disabled ? " is-disabled" : "";
    return (platform.files || []).map((label, index) => {
      const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `file-${index}`;
      const selectedFile = state.files[key] || "";
      return `
        <label class="flash-phone-file-field">
          <span>${escapeHtml(label)}</span>
          <span class="flash-phone-file-control${disabledClass}">
            <span class="flash-phone-file-name${selectedFile ? " has-file" : ""}" title="${escapeHtml(selectedFile || "No file")}">
              ${escapeHtml(selectedFile || "No file")}
            </span>
            <input type="file" data-flash-file="${escapeHtml(key)}"${disabled}>
          </span>
        </label>
      `;
    }).join("");
  }

  function getQualcommBuildType(state) {
    return state.qualcommBuildType === "flat" ? "flat" : "meta";
  }

  function createQualcommBuildOptions(state, disabled = "") {
    const buildType = getQualcommBuildType(state);
    return [
      ["flat", "Flat Build"],
      ["meta", "Meta Build"]
    ].map(([value, label]) => `
      <label class="flash-phone-qc-build-option${buildType === value ? " is-selected" : ""}${disabled ? " is-disabled" : ""}">
        <input type="radio" name="flashPhoneQualcommBuildType" value="${escapeHtml(value)}" data-flash-qc-build="${escapeHtml(value)}"${buildType === value ? " checked" : ""}${disabled}>
        <span>${escapeHtml(label)}</span>
      </label>
    `).join("");
  }

  function getQualcommPortLabel(state) {
    const selectedPort = normalizePortName(state.portName);
    const ports = Array.isArray(state.ports) ? state.ports : [];
    const exactPort = ports.find((port) => normalizePortName(port.portName) === selectedPort);

    if (exactPort) {
      return exactPort.label || exactPort.portName || selectedPort;
    }

    if (selectedPort !== "auto") {
      return selectedPort;
    }

    const detectedPort = ports.find((port) => /9008|qdloader|edl|qualcomm/i.test([
      port.label,
      port.portName,
      port.kind
    ].filter(Boolean).join(" "))) || ports[0];

    return detectedPort?.label || detectedPort?.portName || "No Port Available";
  }

  function createQualcommBrowseField(state, options, disabled = "") {
    const fileName = state.files[options.key] || "";
    const disabledClass = disabled ? " is-disabled" : "";
    const accept = options.accept ? ` accept="${escapeHtml(options.accept)}"` : "";
    return `
      <label class="flash-phone-qc-path">
        <span>${escapeHtml(options.label)}</span>
        <span class="flash-phone-qc-path-value${fileName ? " has-file" : ""}" title="${escapeHtml(fileName || "No file")}">
          ${escapeHtml(fileName || "")}
        </span>
        <span class="flash-phone-qc-browse${disabledClass}">
          <span>${escapeHtml(options.button || "Browse...")}</span>
          <input type="file" data-flash-file="${escapeHtml(options.key)}"${accept}${disabled}>
        </span>
      </label>
    `;
  }

  function createQualcommPanel(state, disabled = "") {
    const inventory = state.qualcommInventory || null;
    const packages = Array.isArray(inventory?.packages) ? inventory.packages : [];
    const selectedPackageId = state.selectedQualcommPackageId || packages[0]?.id || "";
    const selectedPackage = packages.find((item) => item.id === selectedPackageId) || packages[0] || null;
    const loadedXml = state.qualcommLoad || null;
    const loadedPackage = loadedXml?.package || null;
    const loadedPartitions = Array.isArray(loadedXml?.partitions) ? loadedXml.partitions.slice(0, 10) : [];
    const buildType = getQualcommBuildType(state);
    const portLabel = getQualcommPortLabel(state);
    const hasPort = portLabel !== "No Port Available";
    const rawProgramName = loadedPackage?.rawProgram || state.files.rawprogram || state.files.xml || selectedPackage?.rawProgram || "";
    const patchName = loadedPackage?.patch || state.files["patch-file"] || selectedPackage?.patch || "";
    const programmerName = loadedPackage?.programmer || state.files.programmer || selectedPackage?.programmer || "";
    const storageName = loadedPackage?.storage || selectedPackage?.storage || "emmc";
    const storageValue = /ufs/i.test(storageName) ? "ufs" : "emmc";
    const packageOptions = packages.map((item) => `
      <option value="${escapeHtml(item.id)}"${item.id === selectedPackageId ? " selected" : ""}>
        ${escapeHtml(item.name)} (${escapeHtml(item.storage || "unknown")})
      </option>
    `).join("");
    const packageMarkup = selectedPackage ? `
      <div class="flash-phone-qc-package">
        <span>Programmer <strong>${escapeHtml(selectedPackage.programmer || "-")}</strong></span>
        <span>RawProgram <strong>${escapeHtml(selectedPackage.rawProgram || "-")}</strong></span>
        <span>Patch <strong>${escapeHtml(selectedPackage.patch || "-")}</strong></span>
        <span>Storage <strong>${escapeHtml(selectedPackage.storage || "unknown")}</strong></span>
      </div>
    ` : "";
    const loadMarkup = loadedXml ? `
      <div class="flash-phone-qc-loaded">
        <div class="flash-phone-qc-loaded-head">
          <strong>${escapeHtml(loadedXml.message || "XML loaded")}</strong>
          <span>${escapeHtml(String(loadedXml.partitions?.length || 0))} partitions</span>
        </div>
        ${Array.isArray(loadedXml.missingItems) && loadedXml.missingItems.length > 0 ? `
          <div class="flash-phone-qc-missing">
            ${loadedXml.missingItems.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
          </div>
        ` : ""}
        ${loadedPartitions.length > 0 ? `
          <div class="flash-phone-qc-partitions">
            ${loadedPartitions.map((partition) => `
              <span>
                <strong>${escapeHtml(partition.label || partition.fileName || "partition")}</strong>
                <em>${escapeHtml(partition.sectorCount || "0")} sector</em>
              </span>
            `).join("")}
          </div>
        ` : ""}
      </div>
    ` : "";
    const rawPatchTable = `
      <div class="flash-phone-qc-rawpatch">
        <div class="flash-phone-qc-rawpatch-head">
          <span>RawProgram</span>
          <span>Patch</span>
        </div>
        <div class="flash-phone-qc-rawpatch-row">
          <span title="${escapeHtml(rawProgramName || "No rawprogram loaded")}">${escapeHtml(rawProgramName || "-")}</span>
          <span title="${escapeHtml(patchName || "No patch loaded")}">${escapeHtml(patchName || "-")}</span>
        </div>
      </div>
    `;
    const programmerField = createQualcommBrowseField(state, {
      label: "Programmer Path",
      key: "programmer",
      accept: ".mbn,.elf,.bin"
    }, disabled);
    const rawProgramField = createQualcommBrowseField(state, {
      label: "RawProgram XML",
      key: "rawprogram",
      accept: ".xml",
      button: "Load XML..."
    }, disabled);
    const patchField = createQualcommBrowseField(state, {
      label: "Patch XML",
      key: "patch-file",
      accept: ".xml"
    }, disabled);
    const cdtField = createQualcommBrowseField(state, {
      label: "CDT Config",
      key: "cdt-config",
      accept: ".xml,.mbn,.bin"
    }, disabled);
    const contentField = createQualcommBrowseField(state, {
      label: "Content XML",
      key: "content-xml",
      accept: ".xml",
      button: "Load Content..."
    }, disabled);

    return `
      <div class="flash-phone-qc-panel">
        <div class="flash-phone-qc-menubar" aria-label="Qualcomm menu">
          <span>File</span>
          <span>Tools</span>
          <span>Configuration</span>
          <span>Help</span>
        </div>
        <div class="flash-phone-qc-head">
          <strong>Qualcomm Flash</strong>
          <span class="${hasPort ? "is-port-ready" : "is-port-empty"}">${escapeHtml(portLabel)}</span>
        </div>
        <div class="flash-phone-qc-actions">
          <button type="button" id="flashPhoneQualcommScanButton" class="ghost"${disabled}>
            <span class="material-symbols-outlined">usb</span>
            <span>Select Port...</span>
          </button>
          <button type="button" id="flashPhoneQualcommLoadXmlButton" class="ghost"${disabled}>
            <span class="material-symbols-outlined">data_object</span>
            <span>${buildType === "meta" ? "Load Content..." : "Load XML"}</span>
          </button>
          <button type="button" id="flashPhoneQualcommDownloadButton" class="ghost is-start"${disabled || !loadedXml ? " disabled" : ""}>
            <span class="material-symbols-outlined">download</span>
            <span>${buildType === "meta" ? "Download Content" : "Download"}</span>
          </button>
        </div>
        <div class="flash-phone-qc-build">
          <strong>Select Build Type</strong>
          <div class="flash-phone-qc-build-options">
            ${createQualcommBuildOptions(state, disabled)}
          </div>
        </div>
        <div class="flash-phone-qc-section">
          <strong>Select Programmer</strong>
          ${programmerField}
          ${programmerName ? `<span class="flash-phone-qc-hint">Loaded: ${escapeHtml(programmerName)}</span>` : ""}
        </div>
        ${buildType === "meta" ? `
          <div class="flash-phone-qc-section">
            <strong>Select Meta Build</strong>
            ${cdtField}
            ${contentField}
            <div class="flash-phone-qc-meta-row">
              <label>
                Available Meta Build Storage Types
                <select disabled>
                  <option value="emmc"${storageValue === "emmc" ? " selected" : ""}>emmc</option>
                  <option value="ufs"${storageValue === "ufs" ? " selected" : ""}>ufs</option>
                </select>
              </label>
              <label>
                Product Flavors
                <select disabled>
                  <option>Default</option>
                </select>
              </label>
            </div>
            ${rawProgramField}
            ${patchField}
            ${rawPatchTable}
          </div>
        ` : `
          <div class="flash-phone-qc-section">
            <strong>Flat Build XML</strong>
            ${rawProgramField}
            ${patchField}
            ${rawPatchTable}
          </div>
        `}
        <div class="flash-phone-qc-menu" aria-label="Qualcomm tools">
          <button type="button" class="ghost" disabled>
            <span class="material-symbols-outlined">table_rows</span>
            <span>Partition Manager</span>
          </button>
          <button type="button" class="ghost" disabled>
            <span class="material-symbols-outlined">storage</span>
            <span>Storage Info</span>
          </button>
          <button type="button" class="ghost" disabled>
            <span class="material-symbols-outlined">restart_alt</span>
            <span>Reset Port</span>
          </button>
        </div>
        ${packages.length > 0 ? `
          <label class="flash-phone-qc-select">
            Detected Package
            <select id="flashPhoneQualcommPackageSelect"${disabled}>
              ${packageOptions}
            </select>
          </label>
          ${packageMarkup}
        ` : ""}
        ${loadMarkup}
      </div>
    `;
  }

  function createCustomPanel(state, disabled = "") {
    const platform = getPlatform(state.platform);
    const showAddressRange = state.platform === "spd" || state.workTab === "format";
    return `
      <section class="spi-card flash-phone-detail-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Setup</p>
            <h4>${escapeHtml(state.action || "Action")}</h4>
          </div>
          <span class="spi-mini-badge">${escapeHtml(state.series || "-")}</span>
        </div>
        <div class="flash-phone-detail-grid">
          <label>
            Brand
            <select id="flashPhoneBrandSelect"${disabled}>
              ${optionMarkup(platform.brands, state.brand)}
            </select>
          </label>
          <label>
            Model
            <select id="flashPhoneModelSelect"${disabled}>
              ${optionMarkup(platform.models, state.model)}
            </select>
          </label>
          ${showAddressRange ? `
            <label>
              Start
              <input id="flashPhoneStartAddress" type="text" value="${escapeHtml(state.startAddress)}"${disabled}>
            </label>
            <label>
              Size
              <input id="flashPhoneSize" type="text" value="${escapeHtml(state.size)}"${disabled}>
            </label>
          ` : ""}
        </div>
        ${state.platform === "qualcomm" ? "" : `
          <div class="flash-phone-file-grid">
            ${createFileFields(state, disabled)}
          </div>
        `}
        <div class="flash-phone-flag-row">
          ${createFlag("usbCable", "USB Cable", state.flags.usbCable, disabled)}
          ${createFlag("scanDef", "Scan Def", state.flags.scanDef, disabled)}
          ${createFlag("all", "All", state.flags.all, disabled)}
          ${createFlag("backupRead", "Bkpt Rd", state.flags.backupRead, disabled)}
          ${createFlag("saveScatter", "Save Scatter", state.flags.saveScatter, disabled)}
        </div>
        ${state.platform === "qualcomm" ? createQualcommPanel(state, disabled) : ""}
      </section>
    `;
  }

  function createFlag(key, label, checked, disabled = "") {
    return `
      <label class="flash-phone-check${disabled ? " is-disabled" : ""}">
        <input type="checkbox" data-flash-flag="${escapeHtml(key)}"${checked ? " checked" : ""}${disabled}>
        <span>${escapeHtml(label)}</span>
      </label>
    `;
  }

  function createAndroidToolSubtools(state, disabled = "") {
    const currentTool = state.androidTool === "qfil" ? "qfil" : "universal";
    return androidToolOptions.map((tool) => `
      <button
        type="button"
        class="flash-phone-subtool-button${tool.value === currentTool ? " is-active" : ""}"
        data-flash-android-tool="${escapeHtml(tool.value)}"${disabled}>
        <span class="material-symbols-outlined">${escapeHtml(tool.icon)}</span>
        <span>${escapeHtml(tool.label)}</span>
      </button>
    `).join("");
  }

  function createLogMarkup(state) {
    const logs = Array.isArray(state.logs) && state.logs.length > 0 ? state.logs : ["Ready"];
    return logs.slice(-10).map((line) => `<div>${escapeHtml(line)}</div>`).join("");
  }

  function createWorkbenchMarkup(state) {
    const platform = getPlatform(state.platform);
    const sessionLocked = Boolean(state.running);
    const readOnly = Boolean(state.readOnly);
    const controlsDisabled = state.busy || sessionLocked || readOnly ? " disabled" : "";
    const startDisabled = state.busy || sessionLocked || readOnly ? " disabled" : "";
    const stopDisabled = state.busy || !sessionLocked || readOnly ? " disabled" : "";
    const statusText = createStatusText(state);
    const progressWidth = Math.max(0, Math.min(100, Number(state.progress) || 0));
    const currentTool = state.androidTool === "qfil" ? "qfil" : "universal";
    const accessLabel = state.accessLabel || "Free";
    const accessBadgeMarkup = readOnly ? `
      <span class="flash-phone-access-badge" title="Premium">
        <span class="material-symbols-outlined" aria-hidden="true">star</span>
        <span>Premium</span>
      </span>
    ` : "";
    const readonlyBannerMarkup = readOnly ? `
      <div class="flash-phone-readonly-banner">
        <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
        <span>Mode lihat saja untuk role ${escapeHtml(accessLabel)}</span>
      </div>
    ` : "";
    const logCardMarkup = `
      <section class="spi-card flash-phone-log-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Status</p>
            <h4>${escapeHtml(state.message || "Ready")}</h4>
          </div>
          <span class="spi-mini-badge">${escapeHtml(String((state.ports || []).length))} port</span>
        </div>
        <div id="flashPhoneLog" class="flash-phone-log">${createLogMarkup(state)}</div>
      </section>
    `;

    return `
      <section class="spi-card flash-phone-control-card">
        <div class="spi-card-head flash-phone-head">
          <div>
            <p class="label">Tools</p>
            <h4>Android Tools</h4>
          </div>
          <div class="flash-phone-head-badges">
            ${accessBadgeMarkup}
            <span class="flash-phone-status is-${escapeHtml(state.status || "idle")}">${escapeHtml(statusText)}</span>
          </div>
        </div>

        <div class="flash-phone-subtool-tabs" aria-label="Android tool mode">
          ${createAndroidToolSubtools(state, controlsDisabled)}
        </div>

        ${readonlyBannerMarkup}

        ${currentTool === "universal" ? `
          <div class="flash-phone-control-grid is-wide">
            <label>
              Processor
              <select id="flashPhonePlatformSelect"${controlsDisabled}>
                ${createPlatformOptionsMarkup(state.platform)}
              </select>
            </label>
            <label>
              Mode
              <select id="flashPhoneModeSelect"${controlsDisabled}>
                ${optionMarkup(platform.modes, state.mode)}
              </select>
            </label>
            <label>
              Port
              <select id="flashPhonePortSelect"${controlsDisabled}>
                ${createPortOptionsMarkup(state)}
              </select>
            </label>
            <label>
              Series
              <select id="flashPhoneSeriesSelect"${controlsDisabled}>
                ${optionMarkup(platform.series, state.series)}
              </select>
            </label>
            <label>
              Profile
              <select id="flashPhoneProfileSelect"${controlsDisabled}>
                ${optionMarkup(platform.profiles, state.profile)}
              </select>
            </label>
          </div>

          <div class="flash-phone-platform-strip" aria-label="Processor cepat">
            ${createPlatformStrip(state, controlsDisabled)}
          </div>

          <div class="flash-phone-work-tabs">
            ${createTabMarkup(state, controlsDisabled)}
          </div>
        ` : `
          <div class="flash-phone-qfil-port-row">
            <label>
              Port
              <select id="flashPhonePortSelect"${controlsDisabled}>
                ${createPortOptionsMarkup(state)}
              </select>
            </label>
          </div>
        `}
      </section>

      ${currentTool === "qfil" ? `
        <section class="spi-card flash-phone-qfil-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Qualcomm</p>
              <h4>QFIL Flasher</h4>
            </div>
            <span class="spi-mini-badge">Firehose</span>
          </div>
          <div class="flash-phone-qfil-body">
            ${createQualcommPanel(state, controlsDisabled)}
          </div>
        </section>
        ${logCardMarkup}
      ` : `
        <div class="flash-phone-work-layout">
          <section class="spi-card flash-phone-action-card">
            <div class="spi-card-head">
              <div>
                <p class="label">Action</p>
                <h4>${escapeHtml(tabLabels[getActiveTab(state)] || "Service")}</h4>
              </div>
              <span class="spi-mini-badge">${escapeHtml(platform.badge)}</span>
            </div>
            <div class="flash-phone-action-grid">
              ${createActionGrid(state, controlsDisabled)}
            </div>
          </section>

          ${createCustomPanel(state, controlsDisabled)}
        </div>

        <section class="spi-card flash-phone-run-card">
          <div class="flash-phone-actions">
            <button type="button" id="flashPhoneScanButton" class="ghost is-scan"${controlsDisabled}>
              <span class="material-symbols-outlined${state.busy ? " is-spinning" : ""}">${state.busy ? "progress_activity" : "search"}</span>
              <span>Scan</span>
            </button>
            <button type="button" id="flashPhoneConnectButton" class="ghost is-connect"${controlsDisabled}>
              <span class="material-symbols-outlined">usb</span>
              <span>Connect</span>
            </button>
            <button type="button" id="flashPhoneStartButton" class="ghost is-start"${startDisabled}>
              <span class="material-symbols-outlined">play_arrow</span>
              <span>Start</span>
            </button>
            <button type="button" id="flashPhoneStopButton" class="ghost is-stop"${stopDisabled}>
              <span class="material-symbols-outlined">stop</span>
              <span>Stop</span>
            </button>
          </div>
          <div class="flash-phone-progress" aria-hidden="true">
            <span style="width: ${progressWidth}%"></span>
          </div>
        </section>

        ${logCardMarkup}
      `}
    `;
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let notify = () => {};
    let hasLoadedOnce = false;
    let isVisible = false;
    let pollTimer = null;
    const selectedFiles = new Map();

    function pushLog(message) {
      const cleanMessage = String(message || "").trim();
      if (!cleanMessage) {
        return;
      }

      state.logs = [...(state.logs || []), `${formatTime()} ${cleanMessage}`].slice(-20);
    }

    function syncPlatformDefaults(platformValue) {
      const platform = getPlatform(platformValue);
      const tab = Object.keys(platform.tabs)[0];
      state.platform = platform.value;
      state.mode = platform.modes[0];
      state.workTab = tab;
      state.action = platform.tabs[tab][0];
      state.series = platform.series[0];
      state.profile = platform.profiles[0];
      state.brand = platform.brands[0];
      state.model = platform.models[0];
      state.connected = false;
      state.running = false;
      state.progress = 0;
      state.status = "idle";
      state.message = platform.label;
    }

    function applyPayload(payload) {
      if (!payload || typeof payload !== "object") {
        return;
      }

      state = {
        ...state,
        connected: Boolean(payload.connected),
        running: Boolean(payload.running),
        progress: Number(payload.progress || 0),
        status: payload.status || state.status,
        platform: payload.platform || state.platform,
        mode: payload.mode || state.mode,
        portName: payload.portName || state.portName,
        workTab: payload.operationGroup || state.workTab,
        action: payload.operation || state.action,
        series: payload.series || state.series,
        profile: payload.profile || state.profile,
        brand: payload.brand || state.brand,
        model: payload.model || state.model,
        startAddress: payload.startAddress || state.startAddress,
        size: payload.size || state.size,
        flags: payload.flags && typeof payload.flags === "object" ? payload.flags : state.flags,
        files: payload.files && typeof payload.files === "object" ? payload.files : state.files,
        ports: Array.isArray(payload.ports) ? payload.ports : state.ports,
        message: payload.message || state.message,
        logs: Array.isArray(payload.logs) && payload.logs.length > 0 ? payload.logs : state.logs
      };
    }

    function buildRequestBody() {
      return {
        platform: state.platform,
        mode: state.mode,
        portName: state.portName,
        operationGroup: state.workTab,
        operation: state.action,
        series: state.series,
        profile: state.profile,
        brand: state.brand,
        model: state.model,
        startAddress: state.startAddress,
        size: state.size,
        flags: state.flags,
        files: state.files
      };
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state);
      bindEvents();
    }

    function applyAccessState(access = {}) {
      const nextReadOnly = access.readOnly !== false;
      const nextAccessLabel = String(access.roleLabel || access.label || (nextReadOnly ? "Free" : "Premium")).trim() || "Free";
      if (state.readOnly === nextReadOnly && state.accessLabel === nextAccessLabel) {
        return;
      }

      state = {
        ...state,
        readOnly: nextReadOnly,
        accessLabel: nextAccessLabel
      };
      render();
    }

    function syncPolling() {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }

      if (!mountedContainer || !isVisible || !state.running) {
        return;
      }

      pollTimer = setInterval(() => {
        if (!state.busy) {
          loadSession();
        }
      }, 2200);
    }

    async function runOperation(operation, action) {
      if (state.readOnly) {
        notify("Android Tools Premium. Akun Free hanya mode lihat.", "info");
        return;
      }

      state.busy = true;
      state.message = operation;
      render();

      try {
        const payload = await action();
        applyPayload(payload);
        pushLog(payload.message || operation);
      } catch (error) {
        state.status = "failed";
        state.message = error?.message || "Gagal";
        pushLog(state.message);
        notify(state.message, "warning");
      } finally {
        state.busy = false;
        render();
        syncPolling();
      }
    }

    function applyQualcommInventory(payload) {
      state.qualcommInventory = payload && typeof payload === "object" ? payload : null;
      const packages = Array.isArray(state.qualcommInventory?.packages) ? state.qualcommInventory.packages : [];
      if (packages.length === 0) {
        state.selectedQualcommPackageId = "";
        state.qualcommLoad = null;
        return;
      }

      const hasSelected = packages.some((item) => item.id === state.selectedQualcommPackageId);
      if (!hasSelected) {
        state.selectedQualcommPackageId = packages[0].id || "";
      }
    }

    function buildQualcommLoadFormData() {
      const rawProgram = selectedFiles.get("rawprogram") || selectedFiles.get("xml") || null;
      if (!rawProgram) {
        if (selectedFiles.has("content-xml")) {
          throw new Error("Pilih RawProgram XML juga. Content XML saja belum cukup untuk upload browser.");
        }
        throw new Error("Pilih RawProgram XML dulu.");
      }

      const formData = new FormData();
      const programmer = selectedFiles.get("programmer");
      const patch = selectedFiles.get("patch-file");
      if (programmer) {
        formData.append("programmer", programmer, programmer.name);
      }
      formData.append("rawProgram", rawProgram, rawProgram.name);
      if (patch) {
        formData.append("patch", patch, patch.name);
      }
      return formData;
    }

    async function runQualcommTask(operation, action) {
      if (state.readOnly) {
        notify("Android Tools Premium. Akun Free hanya mode lihat.", "info");
        return null;
      }

      state.busy = true;
      state.message = operation;
      render();

      try {
        const payload = await action();
        pushLog(payload.message || operation);
        return payload;
      } catch (error) {
        state.status = "failed";
        state.message = error?.message || "Gagal";
        pushLog(state.message);
        notify(state.message, "warning");
        return null;
      } finally {
        state.busy = false;
        render();
      }
    }

    async function loadSession() {
      try {
        const payload = await fetchJson("/flash-phone/session");
        applyPayload(payload);
      } catch (error) {
        state.status = "offline";
        state.message = "Service belum siap";
        pushLog(error?.message || "Service belum siap");
      }

      render();
      syncPolling();
    }

    function setField(id, handler) {
      const element = mountedContainer?.querySelector(id);
      element?.addEventListener("change", () => handler(element));
    }

    function canEditSetup() {
      return !state.readOnly && !state.busy && !state.running;
    }

    function bindEvents() {
      mountedContainer?.querySelectorAll("[data-flash-android-tool]").forEach((button) => {
        button.addEventListener("click", () => {
          if (!canEditSetup()) {
            return;
          }
          state.androidTool = button.dataset.flashAndroidTool === "qfil" ? "qfil" : "universal";
          if (state.androidTool === "qfil") {
            state.qualcommBuildType = state.qualcommBuildType || "meta";
          }
          render();
        });
      });

      setField("#flashPhonePlatformSelect", (element) => {
        if (!canEditSetup()) {
          return;
        }
        syncPlatformDefaults(element.value);
        render();
      });
      setField("#flashPhoneModeSelect", (element) => {
        if (!canEditSetup()) {
          return;
        }
        state.mode = element.value;
        state.connected = false;
        state.running = false;
        state.progress = 0;
        render();
      });
      setField("#flashPhonePortSelect", (element) => {
        if (!canEditSetup()) {
          return;
        }
        state.portName = normalizePortName(element.value);
        state.connected = false;
        state.running = false;
        state.progress = 0;
        render();
      });
      setField("#flashPhoneSeriesSelect", (element) => {
        if (!canEditSetup()) {
          return;
        }
        state.series = element.value;
        render();
      });
      setField("#flashPhoneProfileSelect", (element) => {
        if (!canEditSetup()) {
          return;
        }
        state.profile = element.value;
        render();
      });
      setField("#flashPhoneBrandSelect", (element) => {
        if (!canEditSetup()) {
          return;
        }
        state.brand = element.value;
        render();
      });
      setField("#flashPhoneModelSelect", (element) => {
        if (!canEditSetup()) {
          return;
        }
        state.model = element.value;
        render();
      });
      setField("#flashPhoneStartAddress", (element) => {
        if (!canEditSetup()) {
          return;
        }
        state.startAddress = element.value;
      });
      setField("#flashPhoneSize", (element) => {
        if (!canEditSetup()) {
          return;
        }
        state.size = element.value;
      });

      mountedContainer?.querySelectorAll("[data-flash-platform]").forEach((button) => {
        button.addEventListener("click", () => {
          if (!canEditSetup()) {
            return;
          }
          syncPlatformDefaults(button.dataset.flashPlatform);
          render();
        });
      });

      mountedContainer?.querySelectorAll("[data-flash-tab]").forEach((button) => {
        button.addEventListener("click", () => {
          if (!canEditSetup()) {
            return;
          }
          const platform = getPlatform(state.platform);
          const tab = button.dataset.flashTab;
          state.workTab = platform.tabs[tab] ? tab : Object.keys(platform.tabs)[0];
          state.action = platform.tabs[state.workTab][0];
          render();
        });
      });

      mountedContainer?.querySelectorAll("input[name='flashPhoneAction']").forEach((input) => {
        input.addEventListener("change", () => {
          if (!canEditSetup()) {
            return;
          }
          if (input.checked) {
            state.action = input.value;
            render();
          }
        });
      });

      mountedContainer?.querySelectorAll("[data-flash-flag]").forEach((input) => {
        input.addEventListener("change", () => {
          if (!canEditSetup()) {
            return;
          }
          state.flags[input.dataset.flashFlag] = Boolean(input.checked);
        });
      });

      mountedContainer?.querySelectorAll("[data-flash-file]").forEach((input) => {
        input.addEventListener("change", () => {
          if (!canEditSetup()) {
            return;
          }
          const file = input.files && input.files.length > 0 ? input.files[0] : null;
          const fileName = file ? file.name : "";
          if (file) {
            selectedFiles.set(input.dataset.flashFile, file);
          } else {
            selectedFiles.delete(input.dataset.flashFile);
          }
          state.files[input.dataset.flashFile] = fileName;
          if (state.platform === "qualcomm" || state.androidTool === "qfil") {
            state.qualcommLoad = null;
          }
          render();
        });
      });

      mountedContainer?.querySelectorAll("[data-flash-qc-build]").forEach((input) => {
        input.addEventListener("change", () => {
          if (!canEditSetup() || !input.checked) {
            return;
          }
          state.qualcommBuildType = input.value === "flat" ? "flat" : "meta";
          state.qualcommLoad = null;
          render();
        });
      });

      setField("#flashPhoneQualcommPackageSelect", (element) => {
        if (!canEditSetup()) {
          return;
        }
        state.selectedQualcommPackageId = element.value;
        state.qualcommLoad = null;
        render();
      });

      mountedContainer?.querySelector("#flashPhoneQualcommScanButton")?.addEventListener("click", () => {
        if (!canEditSetup()) {
          return;
        }
        runQualcommTask("Scanning Port", async () => {
          const payload = await fetchJson("/flash-phone/ports");
          state.ports = Array.isArray(payload.ports) ? payload.ports : [];
          if (normalizePortName(state.portName) === "auto" && state.ports.length > 0) {
            const detectedPort = state.ports.find((port) => /9008|qdloader|edl|qualcomm/i.test([
              port.label,
              port.portName,
              port.kind
            ].filter(Boolean).join(" "))) || state.ports[0];
            state.portName = normalizePortName(detectedPort.portName);
          }
          state.message = state.ports.length > 0 ? "Port selected" : "No Port Available";
          return {
            message: state.message
          };
        });
      });

      mountedContainer?.querySelector("#flashPhoneQualcommLoadXmlButton")?.addEventListener("click", () => {
        if (!canEditSetup()) {
          return;
        }
        runQualcommTask("Loading Qualcomm XML", async () => {
          let payload;
          if (selectedFiles.has("rawprogram") || selectedFiles.has("xml") || selectedFiles.has("content-xml")) {
            payload = await fetchFormJson("/flash-phone/qualcomm/load-files", buildQualcommLoadFormData());
          } else {
            payload = await fetchJson("/flash-phone/qualcomm/load-xml", {
              method: "POST",
              body: JSON.stringify({
                packageId: state.selectedQualcommPackageId,
                operation: "Load XML"
              })
            });
          }
          state.qualcommLoad = payload;
          if (payload.package?.id) {
            state.selectedQualcommPackageId = payload.package.id;
          }
          return payload;
        });
      });

      mountedContainer?.querySelector("#flashPhoneQualcommDownloadButton")?.addEventListener("click", () => {
        if (!canEditSetup()) {
          return;
        }
        notify("Download Qualcomm belum diaktifkan sampai port EDL dan stop/log engine siap.", "warning");
      });

      mountedContainer?.querySelector("#flashPhoneScanButton")?.addEventListener("click", () => {
        if (!canEditSetup()) {
          return;
        }
        runOperation("Scanning", async () => {
          const payload = await fetchJson("/flash-phone/ports");
          return {
            ...state,
            ports: Array.isArray(payload.ports) ? payload.ports : [],
            message: payload.message || "Scan selesai",
            status: "idle"
          };
        });
      });

      mountedContainer?.querySelector("#flashPhoneConnectButton")?.addEventListener("click", () => {
        if (!canEditSetup()) {
          return;
        }
        runOperation("Connecting", () => fetchJson("/flash-phone/connect", {
          method: "POST",
          body: JSON.stringify(buildRequestBody())
        }));
      });

      mountedContainer?.querySelector("#flashPhoneStartButton")?.addEventListener("click", () => {
        if (!canEditSetup()) {
          return;
        }
        runOperation("Starting", () => fetchJson("/flash-phone/start", {
          method: "POST",
          body: JSON.stringify(buildRequestBody())
        }));
      });

      mountedContainer?.querySelector("#flashPhoneStopButton")?.addEventListener("click", () => {
        runOperation("Stopping", () => fetchJson("/flash-phone/stop", { method: "POST" }));
      });
    }

    return {
      viewKey: "tool_flash_phone",
      eyebrow: "Tools",
      title: "Android Tools",
      subtitle: "Multi-processor phone service.",
      items: [],
      mount({ container, notify: notifyCallback } = {}) {
        mountedContainer = container || null;
        notify = typeof notifyCallback === "function" ? notifyCallback : notify;
        render();
        if (!hasLoadedOnce) {
          hasLoadedOnce = true;
          loadSession();
        }
      },
      setAccessState(access) {
        applyAccessState(access);
      },
      setVisible(visible) {
        isVisible = Boolean(visible);
        if (!mountedContainer) {
          syncPolling();
          return;
        }

        mountedContainer.classList.toggle("hidden", !visible);
        syncPolling();
      },
      refresh() {
        loadSession();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.flashPhone = createApi();
})(window);
