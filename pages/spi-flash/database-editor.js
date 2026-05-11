(function initializeSpiFlashDatabaseEditor(globalScope) {
  const serviceBaseUrl = typeof globalScope.resolveTeknisiHubServiceBaseUrl === "function"
    ? globalScope.resolveTeknisiHubServiceBaseUrl()
    : "http://127.0.0.1:48721";
  const chipTypeOptions = ["SPI_FLASH", "25_EEPROM", "93_EEPROM", "24_EEPROM", "95_EEPROM"];
  const voltageOptions = ["3.3 V", "1.8 V", "5.0 V"];
  const themeModeStorageKey = "teknisihub_theme_mode";
  const themeModeDateStorageKey = "teknisihub_theme_mode_wib_date";
  const wibNightThemeStartHour = 18;
  const wibNightThemeEndHour = 6;
  const state = {
    activeDatabase: "spi",
    records: [],
    databasePath: "",
    lastModifiedUtc: "",
    dirty: false,
    loading: false,
    saving: false,
    searchQuery: "",
    duplicateJedecRows: new Set(),
    kbcProfiles: [],
    kbcItePinouts: [],
    kbcDatabasePath: "",
    kbcLastModifiedUtc: "",
    kbcDirty: false,
    kbcLoaded: false
  };

  const pathElement = document.getElementById("databaseEditorPath");
  const lastModifiedElement = document.getElementById("databaseEditorLastModified");
  const recordCountElement = document.getElementById("databaseEditorRecordCount");
  const dirtyStateElement = document.getElementById("databaseEditorDirtyState");
  const messageElement = document.getElementById("databaseEditorMessage");
  const searchInput = document.getElementById("databaseEditorSearchInput");
  const reloadButton = document.getElementById("databaseEditorReloadButton");
  const addRowButton = document.getElementById("databaseEditorAddRowButton");
  const saveButton = document.getElementById("databaseEditorSaveButton");
  const tableBody = document.getElementById("databaseEditorTableBody");
  const tableHeaderRow = document.getElementById("databaseEditorHeaderRow");
  const tabButtons = Array.from(document.querySelectorAll("[data-database-tab]"));

  function getWibDateTimeParts() {
    try {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        hour12: false
      });
      const parts = formatter.formatToParts(new Date());
      const getPart = (type) => parts.find((part) => part.type === type)?.value || "";
      const year = getPart("year");
      const month = getPart("month");
      const day = getPart("day");
      const hour = Number.parseInt(getPart("hour"), 10);
      return {
        dateKey: `${year}-${month}-${day}`,
        hour: Number.isFinite(hour) ? hour : 12
      };
    } catch {
      const fallback = new Date();
      return {
        dateKey: fallback.toISOString().slice(0, 10),
        hour: fallback.getHours()
      };
    }
  }

  function getAutomaticWibThemeMode() {
    const { hour } = getWibDateTimeParts();
    return hour >= wibNightThemeStartHour || hour < wibNightThemeEndHour ? "dark" : "light";
  }

  function clearSavedThemeMode() {
    try {
      localStorage.removeItem(themeModeStorageKey);
      localStorage.removeItem(themeModeDateStorageKey);
    } catch {
      // Ignore storage failures.
    }
  }

  function readSavedThemeMode() {
    try {
      const storedMode = localStorage.getItem(themeModeStorageKey);
      const storedDateKey = localStorage.getItem(themeModeDateStorageKey);
      const currentWibDateKey = getWibDateTimeParts().dateKey;
      if ((storedMode === "dark" || storedMode === "light") && storedDateKey === currentWibDateKey) {
        return storedMode;
      }

      if (storedMode || storedDateKey) {
        clearSavedThemeMode();
      }

      return "";
    } catch {
      return "";
    }
  }

  function applyThemeMode(mode) {
    document.body.classList.toggle("is-dark-mode", mode === "dark");
  }

  function syncThemeMode() {
    applyThemeMode(readSavedThemeMode() || getAutomaticWibThemeMode());
  }

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
      headers: {
        "Content-Type": "application/json"
      },
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

  function setMessage(message, tone = "muted") {
    if (!messageElement) {
      return;
    }

    messageElement.textContent = message || "";
    messageElement.dataset.tone = tone;
    messageElement.style.color = tone === "danger"
      ? "#b42318"
      : tone === "success"
      ? "#156f61"
      : "var(--muted)";
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "medium"
    }).format(date);
  }

  function normalizeJedec(value) {
    const normalized = String(value || "").trim().toUpperCase();
    if (!normalized) {
      return "";
    }

    return normalized.startsWith("0X") ? normalized.slice(2) : normalized;
  }

  function formatList(value) {
    return Array.isArray(value)
      ? value.filter(Boolean).join("; ")
      : String(value || "");
  }

  function splitList(value) {
    return String(value || "")
      .split(/[;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function createBlankRecord() {
    return {
      chipType: "SPI_FLASH",
      manufacturer: "",
      name: "",
      jedecId: "0x",
      chipSize: "8 M",
      blockSize: "256",
      typeHex: "0x00",
      algorithm: "0x00",
      delay: "1000",
      extend: "0x00",
      eeprom: "0x00",
      eepromPages: "0x00",
      voltage: "3.3 V"
    };
  }

  function normalizeRecord(record) {
    return {
      chipType: record.chipType || "SPI_FLASH",
      manufacturer: record.manufacturer || "",
      name: record.name || "",
      jedecId: record.jedecId || "0x",
      chipSize: record.chipSize || "",
      blockSize: record.blockSize || "",
      typeHex: record.typeHex || "0x00",
      algorithm: record.algorithm || "0x00",
      delay: record.delay || "0",
      extend: record.extend || "0x00",
      eeprom: record.eeprom || "0x00",
      eepromPages: record.eepromPages || "0x00",
      voltage: record.voltage || "3.3 V"
    };
  }

  function createBlankKbcProfile() {
    return {
      vendor: "ITE",
      family: "IT8xxx",
      name: "",
      interface: "Keyboard connector SMBus/I2C debug",
      flashSize: "",
      driverKey: "ite_it8xxx",
      operationMode: "ite",
      status: "supported",
      source: "TeknisiHub manual entry",
      aliases: "",
      notes: ""
    };
  }

  function normalizeKbcProfile(profile) {
    return {
      vendor: profile.vendor || "",
      family: profile.family || "",
      name: profile.name || "",
      interface: profile.interface || "",
      flashSize: profile.flashSize == null ? "" : String(profile.flashSize),
      driverKey: profile.driverKey || "",
      operationMode: profile.operationMode || "",
      status: profile.status || "",
      source: profile.source || "",
      aliases: formatList(profile.aliases),
      notes: formatList(profile.notes)
    };
  }

  function parseNullableSize(value) {
    const trimmed = String(value || "").trim().toUpperCase();
    if (!trimmed || trimmed === "-" || trimmed === "AUTO") {
      return null;
    }

    const normalized = trimmed.replace(/\s+/g, "");
    const match = normalized.match(/^(\d+)(B|KB|K|MB|M)?$/);
    if (!match) {
      throw new Error("Flash size KBC/EC tidak valid. Contoh: 128 K, 256 K, 1048576, atau kosong untuk auto.");
    }

    const baseValue = Number.parseInt(match[1], 10);
    if (!Number.isFinite(baseValue) || baseValue < 0) {
      throw new Error("Flash size KBC/EC tidak valid.");
    }

    const unit = match[2] || "B";
    if (unit === "M" || unit === "MB") {
      return baseValue * 1024 * 1024;
    }

    if (unit === "K" || unit === "KB") {
      return baseValue * 1024;
    }

    return baseValue;
  }

  function buildKbcSaveProfiles() {
    return state.kbcProfiles.map((profile) => ({
      vendor: profile.vendor.trim(),
      family: profile.family.trim(),
      name: profile.name.trim(),
      interface: profile.interface.trim(),
      flashSize: parseNullableSize(profile.flashSize),
      driverKey: profile.driverKey.trim(),
      operationMode: profile.operationMode.trim(),
      status: profile.status.trim(),
      source: profile.source.trim(),
      aliases: splitList(profile.aliases),
      notes: splitList(profile.notes)
    }));
  }

  function getDuplicateJedecRows() {
    const jedecToRows = new Map();
    state.records.forEach((record, index) => {
      const normalizedJedec = normalizeJedec(record.jedecId);
      if (!normalizedJedec) {
        return;
      }

      const rows = jedecToRows.get(normalizedJedec) || [];
      rows.push(index);
      jedecToRows.set(normalizedJedec, rows);
    });

    const duplicateRows = new Set();
    jedecToRows.forEach((rows) => {
      if (rows.length > 1) {
        rows.forEach((rowIndex) => duplicateRows.add(rowIndex));
      }
    });

    return duplicateRows;
  }

  function syncDuplicateJedecState() {
    state.duplicateJedecRows = getDuplicateJedecRows();

    if (state.activeDatabase !== "spi") {
      return;
    }

    tableBody?.querySelectorAll('[data-field="jedecId"]').forEach((input) => {
      const rowIndex = Number(input.getAttribute("data-row-index"));
      input.classList.toggle("is-invalid", state.duplicateJedecRows.has(rowIndex));
      input.title = state.duplicateJedecRows.has(rowIndex)
        ? "JEDEC ID duplikat tidak boleh."
        : "";
    });

    if (state.duplicateJedecRows.size > 0) {
      setMessage("JEDEC ID duplikat terdeteksi. Perbaiki dulu sebelum simpan.", "danger");
      return;
    }

    if (messageElement?.dataset?.tone === "danger" && messageElement.textContent.includes("JEDEC ID duplikat")) {
      setMessage(state.dirty ? "Ada perubahan belum disimpan." : "Semua perubahan sudah tersimpan.", "muted");
    }
  }

  function getActivePath() {
    return state.activeDatabase === "kbc" ? state.kbcDatabasePath : state.databasePath;
  }

  function getActiveLastModified() {
    return state.activeDatabase === "kbc" ? state.kbcLastModifiedUtc : state.lastModifiedUtc;
  }

  function getActiveRecordCount() {
    return state.activeDatabase === "kbc" ? state.kbcProfiles.length : state.records.length;
  }

  function isActiveDirty() {
    return state.activeDatabase === "kbc" ? state.kbcDirty : state.dirty;
  }

  function updateHeader() {
    tabButtons.forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-database-tab") === state.activeDatabase);
    });

    if (pathElement) {
      pathElement.textContent = getActivePath() || "-";
    }

    if (lastModifiedElement) {
      lastModifiedElement.textContent = formatDate(getActiveLastModified());
    }

    if (recordCountElement) {
      recordCountElement.textContent = String(getActiveRecordCount());
    }

    if (searchInput) {
      searchInput.placeholder = state.activeDatabase === "kbc"
        ? "Cari vendor, family, nama EC/KBC, interface, status, alias..."
        : "Cari type, manufacturer, nama chip, JEDEC, atau ukuran...";
    }

    if (dirtyStateElement) {
      if (state.loading) {
        dirtyStateElement.textContent = "Memuat data...";
      } else if (state.saving) {
        dirtyStateElement.textContent = "Menyimpan perubahan...";
      } else if (isActiveDirty()) {
        dirtyStateElement.textContent = "Ada perubahan belum disimpan";
      } else {
        dirtyStateElement.textContent = "Semua perubahan sudah tersimpan";
      }
    }

    if (saveButton) {
      saveButton.disabled = state.loading ||
        state.saving ||
        getActiveRecordCount() === 0 ||
        (state.activeDatabase === "spi" && state.duplicateJedecRows.size > 0);
    }

    if (reloadButton) {
      reloadButton.disabled = state.loading || state.saving;
    }

    if (addRowButton) {
      addRowButton.disabled = state.loading || state.saving;
    }
  }

  function getFilteredSpiRecordIndices() {
    const query = state.searchQuery.trim().toLowerCase();
    if (!query) {
      return state.records.map((_, index) => index);
    }

    return state.records
      .map((record, index) => ({ record, index }))
      .filter(({ record }) => Object.values(record).some((value) => String(value || "").toLowerCase().includes(query)))
      .map(({ index }) => index);
  }

  function getFilteredKbcProfileIndices() {
    const query = state.searchQuery.trim().toLowerCase();
    if (!query) {
      return state.kbcProfiles.map((_, index) => index);
    }

    return state.kbcProfiles
      .map((profile, index) => ({ profile, index }))
      .filter(({ profile }) => Object.values(profile).some((value) => String(value || "").toLowerCase().includes(query)))
      .map(({ index }) => index);
  }

  function createTypeSelect(rowIndex, value) {
    return `
      <select class="db-editor-cell-select" data-row-index="${rowIndex}" data-field="chipType">
        ${chipTypeOptions.map((option) => `
          <option value="${escapeHtml(option)}"${option === value ? " selected" : ""}>${escapeHtml(option)}</option>
        `).join("")}
      </select>
    `;
  }

  function createVoltageSelect(rowIndex, value) {
    return `
      <select class="db-editor-cell-select" data-row-index="${rowIndex}" data-field="voltage">
        ${voltageOptions.map((option) => `
          <option value="${escapeHtml(option)}"${option === value ? " selected" : ""}>${escapeHtml(option)}</option>
        `).join("")}
      </select>
    `;
  }

  function createTextInput(rowIndex, field, value, placeholder = "") {
    return `<input class="db-editor-cell-input" data-row-index="${rowIndex}" data-field="${escapeHtml(field)}" type="text" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}">`;
  }

  function createKbcTextInput(rowIndex, field, value, placeholder = "") {
    return `<input class="db-editor-cell-input" data-kbc-profile-index="${rowIndex}" data-field="${escapeHtml(field)}" type="text" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}">`;
  }

  function renderTableHeader() {
    if (!tableHeaderRow) {
      return;
    }

    if (state.activeDatabase === "kbc") {
      tableHeaderRow.innerHTML = `
        <th>No</th>
        <th>Vendor</th>
        <th>Family</th>
        <th>Name</th>
        <th>Interface</th>
        <th>Flash Size</th>
        <th>Driver Key</th>
        <th>Mode</th>
        <th>Status</th>
        <th>Source</th>
        <th>Aliases</th>
        <th>Notes</th>
        <th>Aksi</th>
      `;
      return;
    }

    tableHeaderRow.innerHTML = `
      <th>No</th>
      <th>Type</th>
      <th>Manufacture</th>
      <th>IC Name</th>
      <th>JEDEC ID</th>
      <th>Size</th>
      <th>Block Size</th>
      <th>Type HEX</th>
      <th>Algorithm</th>
      <th>Delay</th>
      <th>Extend</th>
      <th>EEPROM</th>
      <th>EEPROM Pages</th>
      <th>VCC</th>
      <th>Aksi</th>
    `;
  }

  function renderSpiTable() {
    const filteredIndices = getFilteredSpiRecordIndices();
    if (!filteredIndices.length) {
      tableBody.innerHTML = `<tr><td colspan="15" class="db-editor-empty">Tidak ada record yang cocok dengan pencarian saat ini.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filteredIndices.map((rowIndex, position) => {
      const record = state.records[rowIndex];
      const isDuplicateJedec = state.duplicateJedecRows.has(rowIndex);
      return `
        <tr>
          <td>${position + 1}</td>
          <td>${createTypeSelect(rowIndex, record.chipType)}</td>
          <td>${createTextInput(rowIndex, "manufacturer", record.manufacturer, "Vendor")}</td>
          <td>${createTextInput(rowIndex, "name", record.name, "Nama chip")}</td>
          <td>${createTextInput(rowIndex, "jedecId", record.jedecId, "0xEF4018").replace('class="db-editor-cell-input"', `class="db-editor-cell-input${isDuplicateJedec ? " is-invalid" : ""}"`)}</td>
          <td>${createTextInput(rowIndex, "chipSize", record.chipSize, "8 M")}</td>
          <td>${createTextInput(rowIndex, "blockSize", record.blockSize, "256")}</td>
          <td>${createTextInput(rowIndex, "typeHex", record.typeHex, "0x00")}</td>
          <td>${createTextInput(rowIndex, "algorithm", record.algorithm, "0x00")}</td>
          <td>${createTextInput(rowIndex, "delay", record.delay, "1000")}</td>
          <td>${createTextInput(rowIndex, "extend", record.extend, "0x00")}</td>
          <td>${createTextInput(rowIndex, "eeprom", record.eeprom, "0x00")}</td>
          <td>${createTextInput(rowIndex, "eepromPages", record.eepromPages, "0x00")}</td>
          <td>${createVoltageSelect(rowIndex, record.voltage)}</td>
          <td>
            <div class="db-editor-row-actions">
              <button type="button" class="ghost" data-row-remove="${rowIndex}">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  function renderKbcTable() {
    const filteredIndices = getFilteredKbcProfileIndices();
    if (!filteredIndices.length) {
      tableBody.innerHTML = `<tr><td colspan="13" class="db-editor-empty">Tidak ada profile KBC/EC yang cocok dengan pencarian saat ini.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filteredIndices.map((rowIndex, position) => {
      const profile = state.kbcProfiles[rowIndex];
      return `
        <tr>
          <td>${position + 1}</td>
          <td>${createKbcTextInput(rowIndex, "vendor", profile.vendor, "ENE / ITE")}</td>
          <td>${createKbcTextInput(rowIndex, "family", profile.family, "KB90xx / IT8xxx")}</td>
          <td>${createKbcTextInput(rowIndex, "name", profile.name, "Nama KBC/EC")}</td>
          <td>${createKbcTextInput(rowIndex, "interface", profile.interface, "Interface")}</td>
          <td>${createKbcTextInput(rowIndex, "flashSize", profile.flashSize, "128 K / auto")}</td>
          <td>${createKbcTextInput(rowIndex, "driverKey", profile.driverKey, "ene_kb9xxx")}</td>
          <td>${createKbcTextInput(rowIndex, "operationMode", profile.operationMode, "ene / ite")}</td>
          <td>${createKbcTextInput(rowIndex, "status", profile.status, "supported")}</td>
          <td>${createKbcTextInput(rowIndex, "source", profile.source, "Source")}</td>
          <td>${createKbcTextInput(rowIndex, "aliases", profile.aliases, "Pisah dengan ;")}</td>
          <td>${createKbcTextInput(rowIndex, "notes", profile.notes, "Pisah dengan ;")}</td>
          <td>
            <div class="db-editor-row-actions">
              <button type="button" class="ghost" data-kbc-profile-remove="${rowIndex}">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  function renderTable() {
    if (!tableBody) {
      return;
    }

    renderTableHeader();
    if (state.activeDatabase === "kbc") {
      renderKbcTable();
      return;
    }

    renderSpiTable();
  }

  function render() {
    updateHeader();
    renderTable();
    syncDuplicateJedecState();
  }

  async function loadDatabase() {
    state.loading = true;
    updateHeader();
    setMessage("Memuat database SPI Flash...");

    try {
      const payload = await fetchJson("/spi-flash/database");
      state.records = Array.isArray(payload.records) ? payload.records.map(normalizeRecord) : [];
      state.databasePath = payload.databasePath || "";
      state.lastModifiedUtc = payload.lastModifiedUtc || "";
      state.dirty = false;
      render();
      setMessage(`Database SPI Flash berhasil dimuat. ${state.records.length} record siap diedit.`, "success");
    } catch (error) {
      render();
      setMessage(error?.message || "Gagal memuat database SPI Flash.", "danger");
    } finally {
      state.loading = false;
      updateHeader();
    }
  }

  async function loadKbcEcDatabase() {
    state.loading = true;
    updateHeader();
    setMessage("Memuat database KBC/EC ENE/ITE...");

    try {
      const payload = await fetchJson("/spi-flash/kbc-ec-database");
      state.kbcProfiles = Array.isArray(payload.profiles) ? payload.profiles.map(normalizeKbcProfile) : [];
      state.kbcItePinouts = Array.isArray(payload.itePinouts) ? payload.itePinouts : [];
      state.kbcDatabasePath = payload.databasePath || "";
      state.kbcLastModifiedUtc = payload.lastModifiedUtc || "";
      state.kbcDirty = false;
      state.kbcLoaded = true;
      render();
      setMessage(`Database KBC/EC berhasil dimuat. ${state.kbcProfiles.length} profile, ${state.kbcItePinouts.length} pinout ITE tersimpan.`, "success");
    } catch (error) {
      render();
      setMessage(error?.message || "Gagal memuat database KBC/EC.", "danger");
    } finally {
      state.loading = false;
      updateHeader();
    }
  }

  async function saveDatabase() {
    if (state.activeDatabase === "kbc") {
      await saveKbcEcDatabase();
      return;
    }

    syncDuplicateJedecState();
    if (state.duplicateJedecRows.size > 0) {
      setMessage("JEDEC ID duplikat terdeteksi. Perbaiki dulu sebelum simpan.", "danger");
      return;
    }

    state.saving = true;
    updateHeader();
    setMessage("Menyimpan perubahan database SPI Flash...");

    try {
      const payload = await fetchJson("/spi-flash/database", {
        method: "PUT",
        body: JSON.stringify({
          records: state.records
        })
      });

      state.databasePath = payload.databasePath || state.databasePath;
      state.lastModifiedUtc = payload.lastModifiedUtc || state.lastModifiedUtc;
      state.dirty = false;
      updateHeader();
      const backupCopy = payload.backupPath ? ` Backup: ${payload.backupPath}` : "";
      setMessage(`${payload.message || "Database SPI Flash berhasil disimpan."}${backupCopy}`, "success");
    } catch (error) {
      setMessage(error?.message || "Gagal menyimpan database SPI Flash.", "danger");
    } finally {
      state.saving = false;
      updateHeader();
    }
  }

  async function saveKbcEcDatabase() {
    state.saving = true;
    updateHeader();
    setMessage("Menyimpan perubahan database KBC/EC...");

    try {
      const profiles = buildKbcSaveProfiles();
      const payload = await fetchJson("/spi-flash/kbc-ec-database", {
        method: "PUT",
        body: JSON.stringify({
          profiles,
          itePinouts: state.kbcItePinouts
        })
      });

      state.kbcDatabasePath = payload.databasePath || state.kbcDatabasePath;
      state.kbcLastModifiedUtc = payload.lastModifiedUtc || state.kbcLastModifiedUtc;
      state.kbcDirty = false;
      updateHeader();
      const backupCopy = payload.backupPath ? ` Backup: ${payload.backupPath}` : "";
      setMessage(`${payload.message || "Database KBC/EC berhasil disimpan."}${backupCopy}`, "success");
    } catch (error) {
      setMessage(error?.message || "Gagal menyimpan database KBC/EC.", "danger");
    } finally {
      state.saving = false;
      updateHeader();
    }
  }

  function markDirty() {
    if (state.activeDatabase === "kbc") {
      state.kbcDirty = true;
    } else {
      state.dirty = true;
    }

    updateHeader();
  }

  function handleTableInput(event) {
    const field = event.target?.dataset?.field;
    if (!field) {
      return;
    }

    if (state.activeDatabase === "kbc") {
      const rowIndex = Number(event.target?.dataset?.kbcProfileIndex);
      if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= state.kbcProfiles.length) {
        return;
      }

      state.kbcProfiles[rowIndex][field] = event.target.value;
      markDirty();
      return;
    }

    const rowIndex = Number(event.target?.dataset?.rowIndex);
    if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= state.records.length) {
      return;
    }

    state.records[rowIndex][field] = event.target.value;
    markDirty();
    syncDuplicateJedecState();
  }

  function handleTableClick(event) {
    const kbcRemoveButton = event.target.closest("[data-kbc-profile-remove]");
    if (kbcRemoveButton) {
      const rowIndex = Number(kbcRemoveButton.getAttribute("data-kbc-profile-remove"));
      if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= state.kbcProfiles.length) {
        return;
      }

      state.kbcProfiles.splice(rowIndex, 1);
      markDirty();
      renderTable();
      return;
    }

    const removeButton = event.target.closest("[data-row-remove]");
    if (!removeButton) {
      return;
    }

    const rowIndex = Number(removeButton.getAttribute("data-row-remove"));
    if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= state.records.length) {
      return;
    }

    state.records.splice(rowIndex, 1);
    markDirty();
    renderTable();
    syncDuplicateJedecState();
  }

  function handleAddRow() {
    if (state.activeDatabase === "kbc") {
      state.kbcProfiles.unshift(createBlankKbcProfile());
      state.searchQuery = "";
      if (searchInput) {
        searchInput.value = "";
      }
      markDirty();
      render();
      setMessage("Profile KBC/EC baru ditambahkan di paling atas. Isi kolomnya lalu simpan.", "success");
      return;
    }

    state.records.unshift(createBlankRecord());
    state.searchQuery = "";
    if (searchInput) {
      searchInput.value = "";
    }
    markDirty();
    render();
    setMessage("Baris SPI Flash baru ditambahkan di paling atas. Isi kolomnya lalu simpan.", "success");
  }

  function confirmReload() {
    if (isActiveDirty() && !window.confirm("Perubahan belum disimpan. Reload database dan buang perubahan ini?")) {
      return;
    }

    if (state.activeDatabase === "kbc") {
      void loadKbcEcDatabase();
      return;
    }

    void loadDatabase();
  }

  function switchDatabaseTab(nextDatabase) {
    if (nextDatabase !== "spi" && nextDatabase !== "kbc") {
      return;
    }

    if (nextDatabase === state.activeDatabase) {
      return;
    }

    state.activeDatabase = nextDatabase;
    state.searchQuery = "";
    if (searchInput) {
      searchInput.value = "";
    }

    render();

    if (nextDatabase === "kbc" && !state.kbcLoaded) {
      void loadKbcEcDatabase();
      return;
    }

    const message = nextDatabase === "kbc"
      ? `Database KBC/EC siap. ${state.kbcProfiles.length} profile, ${state.kbcItePinouts.length} pinout ITE tersimpan.`
      : `Database SPI Flash siap. ${state.records.length} record.`;
    setMessage(message, "success");
  }

  function attachEvents() {
    tableBody?.addEventListener("input", handleTableInput);
    tableBody?.addEventListener("change", handleTableInput);
    tableBody?.addEventListener("click", handleTableClick);

    searchInput?.addEventListener("input", () => {
      state.searchQuery = searchInput.value || "";
      renderTable();
    });

    reloadButton?.addEventListener("click", confirmReload);
    addRowButton?.addEventListener("click", handleAddRow);
    saveButton?.addEventListener("click", () => {
      void saveDatabase();
    });

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        switchDatabaseTab(button.getAttribute("data-database-tab") || "spi");
      });
    });

    globalScope.addEventListener("beforeunload", (event) => {
      if (!state.dirty && !state.kbcDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    });
  }

  syncThemeMode();
  window.addEventListener("storage", (event) => {
    if (!event.key || event.key === themeModeStorageKey || event.key === themeModeDateStorageKey) {
      syncThemeMode();
    }
  });
  window.setInterval(syncThemeMode, 60_000);

  attachEvents();
  void loadDatabase();
})(window);
