(function initializeSettingsPage(globalScope) {
  const serviceBaseUrl = "http://127.0.0.1:48721";

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
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
      loading: true,
      saving: false,
      cleaning: false,
      startWithWindows: false,
      openWebUiOnStartup: true,
      minimizeToTrayOnClose: true,
      checkUpdateOnStartup: true,
      launchCommand: "-",
      message: "Memuat pengaturan local service..."
    };
  }

  function createWorkbenchMarkup(state) {
    const disabledAttr = state.loading || state.saving || state.cleaning ? " disabled" : "";
    const actionLabel = state.saving ? "Menyimpan..." : "Simpan Pengaturan";
    const cleanupLabel = state.cleaning ? "Membersihkan..." : "Bersihkan Cache/File Temporary";
    const statusLabel = state.startWithWindows ? "Aktif" : "Nonaktif";

    return `
      <div class="spi-layout settings-layout">
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Startup Service</p>
              <h4>Perilaku saat Windows dijalankan</h4>
            </div>
            <span class="spi-mini-badge">${escapeHtml(statusLabel)}</span>
          </div>
          <label class="settings-toggle-card">
            <input id="settingsStartupCheckbox" type="checkbox"${state.startWithWindows ? " checked" : ""}${disabledAttr}>
            <div>
              <strong>Jalankan local service otomatis saat Windows startup</strong>
              <p>Opsi ini akan menambah atau menghapus entry startup untuk user Windows yang sedang aktif.</p>
            </div>
          </label>
          <label class="settings-toggle-card">
            <input id="settingsOpenWebUiCheckbox" type="checkbox"${state.openWebUiOnStartup ? " checked" : ""}${disabledAttr}>
            <div>
              <strong>Buka Web UI otomatis setelah service siap</strong>
              <p>Default aktif. Saat local service berhasil start, browser akan langsung membuka dashboard TeknisiHub.</p>
            </div>
          </label>
          <label class="settings-toggle-card">
            <input id="settingsMinimizeToTrayCheckbox" type="checkbox"${state.minimizeToTrayOnClose ? " checked" : ""}${disabledAttr}>
            <div>
              <strong>Minimize ke tray saat jendela ditutup</strong>
              <p>Untuk arsitektur saat ini, local service memang tetap berjalan di system tray walau tab/browser Web UI ditutup.</p>
            </div>
          </label>
          <label class="settings-toggle-card">
            <input id="settingsCheckUpdateOnStartupCheckbox" type="checkbox"${state.checkUpdateOnStartup ? " checked" : ""}${disabledAttr}>
            <div>
              <strong>Cek update otomatis saat startup</strong>
              <p>Jika aktif, local service akan memeriksa metadata update segera setelah aplikasi berjalan.</p>
            </div>
          </label>
          <div class="settings-inline-meta">
            <span>Command startup</span>
            <code>${escapeHtml(state.launchCommand || "-")}</code>
          </div>
          <div class="settings-actions">
            <button id="settingsSaveButton" type="button"${disabledAttr}>
              <span class="material-symbols-outlined${state.saving ? " is-spinning" : ""}">${state.saving ? "progress_activity" : "save"}</span>
              <span>${escapeHtml(actionLabel)}</span>
            </button>
          </div>
          <p class="spi-note">${escapeHtml(state.message)}</p>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Maintenance</p>
              <h4>Bersihkan cache dan file temporary</h4>
            </div>
          </div>
          <p class="settings-maintenance-copy">Membersihkan cache katalog, cache update, cache boardview, dan folder temporary TeknisiHub di Windows. Session login dan file pengaturan tidak ikut dihapus.</p>
          <div class="settings-actions">
            <button id="settingsCleanupButton" type="button" class="ghost"${disabledAttr}>
              <span class="material-symbols-outlined${state.cleaning ? " is-spinning" : ""}">${state.cleaning ? "progress_activity" : "cleaning_services"}</span>
              <span>${escapeHtml(cleanupLabel)}</span>
            </button>
          </div>
        </section>
      </div>
    `;
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;

    async function loadSettings() {
      if (!mountedContainer) {
        return;
      }

      state.loading = true;
      state.message = "Memuat pengaturan local service...";
      render();

      try {
        const settings = await fetchJson("/settings/local-service");
        state.startWithWindows = Boolean(settings.startWithWindows);
        state.openWebUiOnStartup = settings.openWebUiOnStartup !== false;
        state.minimizeToTrayOnClose = settings.minimizeToTrayOnClose !== false;
        state.checkUpdateOnStartup = settings.checkUpdateOnStartup !== false;
        state.launchCommand = settings.launchCommand || "-";
        state.message = state.startWithWindows
          ? "Startup otomatis aktif. Local service akan mengikuti startup Windows."
          : "Startup otomatis belum aktif. Centang lalu simpan jika ingin local service ikut berjalan saat Windows menyala.";
      } catch (error) {
        state.message = error.message || "Pengaturan local service belum bisa dimuat.";
      } finally {
        state.loading = false;
        render();
      }
    }

    async function saveSettings() {
      if (state.loading || state.saving) {
        return;
      }

      state.saving = true;
      state.message = "Menyimpan pengaturan startup local service...";
      render();

      try {
        const result = await fetchJson("/settings/local-service", {
          method: "PUT",
          body: JSON.stringify({
            startWithWindows: state.startWithWindows,
            openWebUiOnStartup: state.openWebUiOnStartup,
            minimizeToTrayOnClose: state.minimizeToTrayOnClose,
            checkUpdateOnStartup: state.checkUpdateOnStartup
          })
        });

        state.message = result.message || "Pengaturan berhasil disimpan.";
      } catch (error) {
        state.message = error.message || "Pengaturan gagal disimpan.";
      } finally {
        state.saving = false;
        await loadSettings();
      }
    }

    async function cleanupTemporaryFiles() {
      if (state.loading || state.saving || state.cleaning) {
        return;
      }

      state.cleaning = true;
      state.message = "Membersihkan cache dan file temporary...";
      render();

      try {
        const result = await fetchJson("/settings/cleanup", {
          method: "POST"
        });

        state.message = result.message || "Cache dan file temporary berhasil dibersihkan.";
      } catch (error) {
        state.message = error.message || "Gagal membersihkan cache dan file temporary.";
      } finally {
        state.cleaning = false;
        render();
      }
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state);

      const startupCheckbox = mountedContainer.querySelector("#settingsStartupCheckbox");
      const openWebUiCheckbox = mountedContainer.querySelector("#settingsOpenWebUiCheckbox");
      const minimizeToTrayCheckbox = mountedContainer.querySelector("#settingsMinimizeToTrayCheckbox");
      const checkUpdateOnStartupCheckbox = mountedContainer.querySelector("#settingsCheckUpdateOnStartupCheckbox");
      const saveButton = mountedContainer.querySelector("#settingsSaveButton");
      const cleanupButton = mountedContainer.querySelector("#settingsCleanupButton");

      startupCheckbox?.addEventListener("change", () => {
        state.startWithWindows = Boolean(startupCheckbox.checked);
      });

      openWebUiCheckbox?.addEventListener("change", () => {
        state.openWebUiOnStartup = Boolean(openWebUiCheckbox.checked);
      });

      minimizeToTrayCheckbox?.addEventListener("change", () => {
        state.minimizeToTrayOnClose = Boolean(minimizeToTrayCheckbox.checked);
      });

      checkUpdateOnStartupCheckbox?.addEventListener("change", () => {
        state.checkUpdateOnStartup = Boolean(checkUpdateOnStartupCheckbox.checked);
      });

      saveButton?.addEventListener("click", () => {
        void saveSettings();
      });

      cleanupButton?.addEventListener("click", () => {
        void cleanupTemporaryFiles();
      });
    }

    return {
      viewKey: "settings",
      eyebrow: "Pengaturan",
      title: "Pengaturan Local Service",
      subtitle: "Startup dasar local service dan maintenance cache local service.",
      items: [],
      mount({ container }) {
        mountedContainer = container;
        render();
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }

        mountedContainer.classList.toggle("hidden", !visible);
      },
      refresh() {
        void loadSettings();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.settings = createApi();
})(window);
