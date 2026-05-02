(function initializeDashboardHomePage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
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

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function getRoleLabel(value) {
    const role = String(value || "").trim();
    return role || "-";
  }

  function isAccessActive(roleValue) {
    return Boolean(String(roleValue || "").trim());
  }

  function createInitialState() {
    return {
      message: "Memuat ringkasan dashboard...",
      version: "-",
      status: "Memeriksa local service...",
      displayName: "TeknisiHub User",
      email: "-",
      role: "Member",
      provider: "Telegram",
      lastLoginUtc: "",
      totalLocalMembers: 0,
      accessItems: [
        { label: "BIOS", role: "-", active: false },
        { label: "Boardview", role: "-", active: false },
        { label: "Schematics", role: "-", active: false },
        { label: "Problem Solving", role: "-", active: false },
        { label: "Datasheets", role: "-", active: false }
      ]
    };
  }

  function createAccessCards(state) {
    return state.accessItems.map((item) => `
      <article class="spi-card dashboard-home-access-card${item.active ? " is-success" : ""}">
        <div class="dashboard-home-access-top">
          <span class="spi-mini-badge">${escapeHtml(item.label)}</span>
          <span class="dashboard-home-access-state${item.active ? " is-active" : ""}">${item.active ? "Aktif" : "Belum aktif"}</span>
        </div>
        <strong>${escapeHtml(item.role)}</strong>
        <p>${item.active ? "Akses sudah siap dipakai." : "Aktivasi akses dilakukan oleh Owner/Admin."}</p>
      </article>
    `).join("");
  }

  function createWorkbenchMarkup(state) {
    return `
      <section class="spi-workbench-hero dashboard-home-hero">
        <div>
          <p class="label">Dashboard</p>
          <h3>Halo, ${escapeHtml(state.displayName)}</h3>
          <p class="spi-workbench-copy">Ringkasan cepat untuk status local service, akses akun aktif, dan jalur kerja utama TeknisiHub di mesin ini.</p>
        </div>
        <div class="spi-workbench-badge-row">
          <span class="spi-status-pill">${escapeHtml(state.provider)}</span>
          <span class="spi-status-pill is-preview">${escapeHtml(state.role)}</span>
        </div>
      </section>

      <div class="spi-layout dashboard-home-summary-grid">
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Status Service</p>
              <h4>Koneksi local service</h4>
            </div>
            <span class="spi-mini-badge">v${escapeHtml(state.version)}</span>
          </div>
          <p class="spi-note">${escapeHtml(state.status)}</p>
          <div class="dashboard-home-metric-list">
            <div class="dashboard-home-metric">
              <span class="material-symbols-outlined">person</span>
              <div>
                <strong>${escapeHtml(state.displayName)}</strong>
                <p>${escapeHtml(state.email)}</p>
              </div>
            </div>
            <div class="dashboard-home-metric">
              <span class="material-symbols-outlined">groups</span>
              <div>
                <strong>${escapeHtml(String(state.totalLocalMembers))} akun lokal</strong>
                <p>Daftar akun yang pernah login di PC ini</p>
              </div>
            </div>
            <div class="dashboard-home-metric">
              <span class="material-symbols-outlined">schedule</span>
              <div>
                <strong>Login terakhir</strong>
                <p>${escapeHtml(formatDateTime(state.lastLoginUtc))}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Quick Actions</p>
              <h4>Masuk ke area kerja</h4>
            </div>
          </div>
          <div class="dashboard-home-action-grid">
            <button type="button" class="dashboard-home-action-button" data-view-target="BIOS">
              <span class="material-symbols-outlined">memory</span>
              <span>BIOS</span>
            </button>
            <button type="button" class="dashboard-home-action-button" data-view-target="Boardview">
              <span class="material-symbols-outlined">developer_board</span>
              <span>Boardview</span>
            </button>
            <button type="button" class="dashboard-home-action-button" data-view-target="Schematics">
              <span class="material-symbols-outlined">schema</span>
              <span>Schematics</span>
            </button>
            <button type="button" class="dashboard-home-action-button" data-view-target="settings">
              <span class="material-symbols-outlined">settings</span>
              <span>Pengaturan</span>
            </button>
          </div>
          <p class="spi-note">${escapeHtml(state.message)}</p>
        </section>
      </div>

      <section class="spi-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Akses Akun</p>
            <h4>Status per kategori utama</h4>
          </div>
        </div>
        <div class="dashboard-home-access-grid">
          ${createAccessCards(state)}
        </div>
      </section>
    `;
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let notify = () => {};
    let navigate = () => {};

    async function load() {
      if (!mountedContainer) {
        return;
      }

      try {
        const [health, status, members] = await Promise.all([
          fetchJson("/health"),
          fetchJson("/auth/status"),
          fetchJson("/auth/members").catch(() => [])
        ]);

        state.version = health.version || "-";
        state.status = status.serviceReady
          ? (status.isLoggedIn ? "Local service aktif dan sesi login tersedia." : "Local service aktif, menunggu login akun.")
          : "Local service aktif, tetapi konfigurasi akses belum lengkap.";
        state.displayName = status.displayName || status.email || "TeknisiHub User";
        state.email = status.email || "-";
        state.role = status.channelRole || "Member";
        state.provider = "Telegram";
        state.lastLoginUtc = status.lastLoginUtc || "";
        state.totalLocalMembers = Array.isArray(members) ? members.length : 0;
        state.accessItems = [
          { label: "BIOS", role: getRoleLabel(status.biosChannelRole || status.channelRole), active: isAccessActive(status.biosChannelRole || status.channelRole) },
          { label: "Boardview", role: getRoleLabel(status.boardviewChannelRole), active: isAccessActive(status.boardviewChannelRole) },
          { label: "Schematics", role: getRoleLabel(status.schematicsChannelRole), active: isAccessActive(status.schematicsChannelRole) },
          { label: "Problem Solving", role: getRoleLabel(status.problemSolvingChannelRole), active: isAccessActive(status.problemSolvingChannelRole) },
          { label: "Datasheets", role: getRoleLabel(status.datasheetsChannelRole), active: isAccessActive(status.datasheetsChannelRole) }
        ];
        state.message = "Dashboard siap dipakai. Pilih area kerja dari quick actions atau sidebar.";
      } catch (error) {
        state.status = "Dashboard belum bisa memuat data.";
        state.message = error.message || "Terjadi kesalahan saat memuat dashboard.";
        notify(state.message, true);
      }

      render();
    }

    function bindEvents() {
      mountedContainer.querySelectorAll("[data-view-target]").forEach((button) => {
        button.addEventListener("click", () => {
          const viewKey = button.getAttribute("data-view-target");
          if (viewKey) {
            navigate(viewKey);
          }
        });
      });
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state);
      bindEvents();
    }

    return {
      viewKey: "dashboard_home",
      eyebrow: "Dashboard",
      title: "Dashboard",
      subtitle: "Ringkasan local service dan akses akun aktif.",
      items: [],
      mount(context = {}) {
        mountedContainer = context.container || null;
        notify = typeof context.notify === "function" ? context.notify : () => {};
        navigate = typeof context.navigate === "function" ? context.navigate : () => {};
        render();
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }

        mountedContainer.classList.toggle("hidden", !visible);
      },
      refresh() {
        void load();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.dashboardHome = createApi();
})(window);
