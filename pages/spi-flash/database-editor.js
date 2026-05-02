(function initializeSpiFlashDatabaseEditor(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const chipTypeOptions = ["SPI_FLASH", "25_EEPROM", "93_EEPROM", "24_EEPROM", "95_EEPROM"];
  const voltageOptions = ["3.3 V", "1.8 V", "5.0 V"];
  const themeModeStorageKey = "teknisihub_theme_mode";
  const themeModeDateStorageKey = "teknisihub_theme_mode_wib_date";
  const wibNightThemeStartHour = 18;
  const wibNightThemeEndHour = 6;
  const state = {
    records: [],
    databasePath: "",
    lastModifiedUtc: "",
    dirty: false,
    loading: false,
    saving: false,
    searchQuery: "",
    duplicateJedecRows: new Set()
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

  function getPreferredThemeMode() {
    return readSavedThemeMode() || getAutomaticWibThemeMode();
  }

  function applyThemeMode(mode) {
    document.body.classList.toggle("is-dark-mode", mode === "dark");
  }

  function syncThemeMode() {
    applyThemeMode(getPreferredThemeMode());
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

  function updateHeader() {
    if (pathElement) {
      pathElement.textContent = state.databasePath || "-";
    }

    if (lastModifiedElement) {
      lastModifiedElement.textContent = formatDate(state.lastModifiedUtc);
    }

    if (recordCountElement) {
      recordCountElement.textContent = String(state.records.length);
    }

    if (dirtyStateElement) {
      if (state.loading) {
        dirtyStateElement.textContent = "Memuat data...";
      } else if (state.saving) {
        dirtyStateElement.textContent = "Menyimpan perubahan...";
      } else if (state.dirty) {
        dirtyStateElement.textContent = "Ada perubahan belum disimpan";
      } else {
        dirtyStateElement.textContent = "Semua perubahan sudah tersimpan";
      }
    }

    if (saveButton) {
      saveButton.disabled = state.loading || state.saving || !state.records.length || state.duplicateJedecRows.size > 0;
    }

    if (reloadButton) {
      reloadButton.disabled = state.loading || state.saving;
    }

    if (addRowButton) {
      addRowButton.disabled = state.loading || state.saving;
    }
  }

  function getFilteredRecordIndices() {
    const query = state.searchQuery.trim().toLowerCase();
    if (!query) {
      return state.records.map((_, index) => index);
    }

    return state.records
      .map((record, index) => ({ record, index }))
      .filter(({ record }) => Object.values(record).some((value) => String(value || "").toLowerCase().includes(query)))
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

  function renderTable() {
    if (!tableBody) {
      return;
    }

    const filteredIndices = getFilteredRecordIndices();
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
      setMessage(`Database berhasil dimuat. ${state.records.length} record siap diedit.`, "success");
    } catch (error) {
      render();
      setMessage(error?.message || "Gagal memuat database SPI Flash.", "danger");
    } finally {
      state.loading = false;
      updateHeader();
    }
  }

  syncThemeMode();
  window.addEventListener("storage", (event) => {
    if (!event.key || event.key === themeModeStorageKey || event.key === themeModeDateStorageKey) {
      syncThemeMode();
    }
  });
  window.setInterval(syncThemeMode, 60_000);

  async function saveDatabase() {
    syncDuplicateJedecState();
    if (state.duplicateJedecRows.size > 0) {
      setMessage("JEDEC ID duplikat terdeteksi. Perbaiki dulu sebelum simpan.", "danger");
      return;
    }

    state.saving = true;
    updateHeader();
    setMessage("Menyimpan perubahan database...");

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
      setMessage(`${payload.message || "Database berhasil disimpan."}${backupCopy}`, "success");
    } catch (error) {
      setMessage(error?.message || "Gagal menyimpan database SPI Flash.", "danger");
    } finally {
      state.saving = false;
      updateHeader();
    }
  }

  function markDirty() {
    state.dirty = true;
    updateHeader();
  }

  function handleTableInput(event) {
    const rowIndex = Number(event.target?.dataset?.rowIndex);
    const field = event.target?.dataset?.field;
    if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= state.records.length || !field) {
      return;
    }

    state.records[rowIndex][field] = event.target.value;
    markDirty();
    syncDuplicateJedecState();
  }

  function handleTableClick(event) {
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
    state.records.unshift(createBlankRecord());
    state.searchQuery = "";
    if (searchInput) {
      searchInput.value = "";
    }
    markDirty();
    render();
    setMessage("Baris baru ditambahkan di paling atas. Isi kolomnya lalu simpan.", "success");
  }

  function confirmReload() {
    if (state.dirty && !window.confirm("Perubahan belum disimpan. Reload database dan buang perubahan ini?")) {
      return;
    }

    void loadDatabase();
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

    globalScope.addEventListener("beforeunload", (event) => {
      if (!state.dirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    });
  }

  attachEvents();
  void loadDatabase();
})(window);
