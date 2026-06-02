(function initializeDashboardHomePage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();

  const catalogDefinitions = [
    { key: "BIOS", label: "BIOS", icon: "memory", countKey: "biosCount" },
    { key: "Boardview", label: "Boardview", icon: "developer_board", countKey: "boardviewCount" },
    { key: "Schematics", label: "Schematics", icon: "schema", countKey: "schematicsCount" },
    { key: "ProblemSolving", label: "Problem Solving", icon: "psychology", countKey: "problemSolvingCount" },
    { key: "Datasheets", label: "Datasheets", icon: "picture_as_pdf", countKey: "datasheetsCount" }
  ];

  const rolePriority = {
    owner: 3,
    admin: 2,
    member: 1
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

  function formatCompactNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return "0";
    }

    return new Intl.NumberFormat("id-ID", {
      notation: number >= 10000 ? "compact" : "standard",
      maximumFractionDigits: 1
    }).format(number);
  }

  function parseInteger(value, fallback = 0) {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }

    const number = Number.parseInt(String(value), 10);
    return Number.isFinite(number) ? number : fallback;
  }

  function getDefaultLimitForRole(role) {
    const normalizedRole = String(role || "").trim().toLowerCase();
    if (normalizedRole === "owner") {
      return 1000;
    }

    if (normalizedRole === "admin") {
      return 100;
    }

    return 5;
  }

  function getRoleLabel(value) {
    const role = String(value || "").trim();
    return role || "-";
  }

  function getRepresentativeRole(accessItems, fallbackRole) {
    return accessItems
      .map((item) => item.role)
      .filter((role) => role && role !== "-")
      .sort((left, right) => {
        const leftScore = rolePriority[String(left).toLowerCase()] || 0;
        const rightScore = rolePriority[String(right).toLowerCase()] || 0;
        return rightScore - leftScore;
      })[0] || getRoleLabel(fallbackRole || "Member");
  }

  function isAccessActive(roleValue) {
    return Boolean(String(roleValue || "").trim());
  }

  function createAccessItems(status = {}) {
    return [
      {
        key: "BIOS",
        label: "BIOS",
        role: getRoleLabel(status.biosChannelRole || status.channelRole),
        active: isAccessActive(status.biosChannelRole || status.channelRole)
      },
      {
        key: "Boardview",
        label: "Boardview",
        role: getRoleLabel(status.boardviewChannelRole),
        active: isAccessActive(status.boardviewChannelRole)
      },
      {
        key: "Schematics",
        label: "Schematics",
        role: getRoleLabel(status.schematicsChannelRole),
        active: isAccessActive(status.schematicsChannelRole)
      },
      {
        key: "ProblemSolving",
        label: "Problem Solving",
        role: getRoleLabel(status.problemSolvingChannelRole),
        active: isAccessActive(status.problemSolvingChannelRole)
      },
      {
        key: "Datasheets",
        label: "Datasheets",
        role: getRoleLabel(status.datasheetsChannelRole),
        active: isAccessActive(status.datasheetsChannelRole)
      }
    ];
  }

  function normalizeIdentity(value) {
    return String(value || "").trim().toLowerCase();
  }

  function findCurrentMember(members, status) {
    if (!Array.isArray(members) || members.length === 0) {
      return null;
    }

    const currentIdentity = normalizeIdentity(status?.email);
    if (currentIdentity) {
      const matchedByIdentity = members.find((member) => normalizeIdentity(member.email) === currentIdentity);
      if (matchedByIdentity) {
        return matchedByIdentity;
      }
    }

    const currentName = normalizeIdentity(status?.displayName);
    if (currentName) {
      return members.find((member) => normalizeIdentity(member.displayName) === currentName) || null;
    }

    return null;
  }

  function resolveQuota(member, role) {
    const total = parseInteger(member?.totalDownload, 0);
    const totalLimit = parseInteger(member?.totalDownloadLimit, 0);
    const isTrial = totalLimit > 0;
    const limit = isTrial ? totalLimit : parseInteger(member?.limitDownloadToday, getDefaultLimitForRole(role));
    const used = isTrial ? total : parseInteger(member?.downloadTodayCount, 0);
    const remaining = Math.max(0, limit - used);

    return {
      label: isTrial ? "Trial Download" : "Kuota Hari Ini",
      scope: isTrial ? "trial-total" : "daily",
      limit,
      used,
      total,
      remaining,
      isEmpty: limit > 0 && remaining <= 0,
      isLow: limit > 0 && remaining > 0 && remaining <= Math.max(2, Math.ceil(limit * 0.12)),
      emptyMeta: isTrial ? "Silakan langganan untuk lanjut download" : "Tunggu reset harian",
      remainingMeta: isTrial
        ? `${formatCompactNumber(remaining)} sisa trial`
        : `${formatCompactNumber(remaining)} sisa`
    };
  }

  function resolveUpdateLabel(health) {
    const update = health?.update || {};
    if (update.mustUpdate) {
      return {
        tone: "danger",
        label: "Wajib update",
        value: update.latestVersion ? `v${update.latestVersion}` : "Update"
      };
    }

    if (update.lastError) {
      return {
        tone: "warning",
        label: "Cek gagal",
        value: "Ulangi"
      };
    }

    if (update.checked) {
      return {
        tone: "success",
        label: "Terbaru",
        value: health?.version ? `v${health.version}` : "Siap"
      };
    }

    return {
      tone: "neutral",
      label: "Belum dicek",
      value: health?.version ? `v${health.version}` : "-"
    };
  }

  function createInitialState() {
    const accessItems = createAccessItems();
    return {
      loaded: false,
      message: "Memuat dashboard...",
      version: "-",
      serviceReady: false,
      isLoggedIn: false,
      hasAgreed: false,
      allowsNewWindowTab: false,
      displayName: "TeknisiHub User",
      identity: "-",
      provider: "Telegram",
      role: "Member",
      lastLoginUtc: "",
      totalLocalMembers: 0,
      quota: resolveQuota(null, "Member"),
      cacheStats: {},
      cacheStatsLoaded: false,
      updateLabel: { tone: "neutral", label: "Belum dicek", value: "-" },
      update: {},
      updateOperation: {},
      accessItems
    };
  }

  function createStatusCards(state) {
    const activeAccess = state.accessItems.filter((item) => item.active).length;
    const totalAccess = state.accessItems.length;
    const serviceTone = state.serviceReady && state.isLoggedIn ? "success" : state.serviceReady ? "warning" : "danger";
    const serviceLabel = state.serviceReady && state.isLoggedIn ? "Siap" : state.serviceReady ? "Login" : "Cek service";
    const quotaTone = state.quota.isEmpty ? "danger" : state.quota.isLow ? "warning" : "success";
    const accessTone = activeAccess === totalAccess ? "success" : activeAccess > 0 ? "warning" : "danger";
    const cards = [
      {
        icon: "hub",
        label: "Service",
        value: serviceLabel,
        meta: state.version === "-" ? "-" : `v${state.version}`,
        tone: serviceTone
      },
      {
        icon: "system_update_alt",
        label: "Update",
        value: state.updateLabel.label,
        meta: state.updateLabel.value,
        tone: state.updateLabel.tone
      },
      {
        icon: "download",
        label: state.quota.label,
        value: `${formatCompactNumber(state.quota.used)}/${formatCompactNumber(state.quota.limit)}`,
        meta: state.quota.remainingMeta,
        tone: quotaTone
      },
      {
        icon: "verified_user",
        label: "Akses",
        value: `${activeAccess}/${totalAccess}`,
        meta: state.role,
        tone: accessTone
      }
    ];

    return cards.map((card) => `
      <article class="dashboard-home-status-card is-${escapeHtml(card.tone)}">
        <span class="material-symbols-outlined">${escapeHtml(card.icon)}</span>
        <div>
          <small>${escapeHtml(card.label)}</small>
          <strong>${escapeHtml(card.value)}</strong>
          <em>${escapeHtml(card.meta)}</em>
        </div>
      </article>
    `).join("");
  }

  function createAuditItems(state) {
    const items = [];
    const missingAccess = state.accessItems
      .filter((item) => !item.active)
      .map((item) => item.label);

    if (!state.serviceReady) {
      items.push({
        tone: "danger",
        icon: "settings_alert",
        title: "Aplikasi lokal belum siap",
        meta: "Cek aplikasi pendukung"
      });
    } else if (!state.isLoggedIn) {
      items.push({
        tone: "warning",
        icon: "login",
        title: "Login belum aktif",
        meta: "Masuk dengan Telegram"
      });
    }

    if (state.isLoggedIn && !state.hasAgreed) {
      items.push({
        tone: "warning",
        icon: "fact_check",
        title: "Persetujuan belum disimpan",
        meta: "Selesaikan sekali saja"
      });
    }

    if (state.isLoggedIn && state.hasAgreed && !state.allowsNewWindowTab) {
      items.push({
        tone: "warning",
        icon: "open_in_new",
        title: "Izin tab baru belum aktif",
        meta: "Dibutuhkan viewer file"
      });
    }

    if (state.update?.mustUpdate) {
      items.push({
        tone: "danger",
        icon: "system_update_alt",
        title: "Update wajib",
        meta: state.update.latestVersion ? `Target v${state.update.latestVersion}` : "Jalankan update"
      });
    } else if (state.update?.lastError) {
      items.push({
        tone: "warning",
        icon: "sync_problem",
        title: "Cek update gagal",
        meta: state.update.lastError
      });
    }

    if (state.updateOperation?.active) {
      items.push({
        tone: "warning",
        icon: "progress_activity",
        title: "Update berjalan",
        meta: `${state.updateOperation.progressPercent || 0}% ${state.updateOperation.stage || ""}`.trim()
      });
    }

    if (state.quota.isEmpty) {
      items.push({
        tone: "danger",
        icon: "block",
        title: "Kuota download habis",
        meta: state.quota.emptyMeta
      });
    } else if (state.quota.isLow) {
      items.push({
        tone: "warning",
        icon: "hourglass_bottom",
        title: "Kuota mulai menipis",
        meta: `${formatCompactNumber(state.quota.remaining)} download tersisa`
      });
    }

    if (missingAccess.length > 0) {
      items.push({
        tone: "warning",
        icon: "lock",
        title: "Akses belum lengkap",
        meta: missingAccess.slice(0, 3).join(", ") + (missingAccess.length > 3 ? "..." : "")
      });
    }

    if (items.length === 0) {
      items.push({
        tone: "success",
        icon: "task_alt",
        title: "Semua siap",
        meta: "Tidak ada blocker utama"
      });
    }

    return items.map((item) => `
      <article class="dashboard-home-check-item is-${escapeHtml(item.tone)}">
        <span class="material-symbols-outlined">${escapeHtml(item.icon)}</span>
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.meta)}</small>
        </div>
      </article>
    `).join("");
  }

  function getCatalogCount(state, countKey) {
    return parseInteger(state.cacheStats?.[countKey], 0);
  }

  function getCatalogCountLabel(state, countKey) {
    return state.cacheStatsLoaded ? formatCompactNumber(getCatalogCount(state, countKey)) : "-";
  }

  function getAccessMap(state) {
    return state.accessItems.reduce((map, item) => {
      map[item.key] = item;
      return map;
    }, {});
  }

  function createActionButtons(state) {
    const accessMap = getAccessMap(state);
    const actionItems = [
      {
        target: "BIOS",
        icon: "memory",
        label: "BIOS",
        meta: "Cari / flash",
        badge: getCatalogCountLabel(state, "biosCount"),
        active: accessMap.BIOS?.active
      },
      {
        target: "tool_spi_flash",
        icon: "developer_board",
        label: "SPI Flash",
        meta: "Read / write",
        badge: "Tool",
        active: true
      },
      {
        target: "Boardview",
        icon: "account_tree",
        label: "Boardview",
        meta: "Open viewer",
        badge: getCatalogCountLabel(state, "boardviewCount"),
        active: accessMap.Boardview?.active
      },
      {
        target: "Schematics",
        icon: "schema",
        label: "Schematics",
        meta: "PDF board",
        badge: getCatalogCountLabel(state, "schematicsCount"),
        active: accessMap.Schematics?.active
      },
      {
        target: "ProblemSolving",
        icon: "psychology",
        label: "Problem",
        meta: "Kasus servis",
        badge: getCatalogCountLabel(state, "problemSolvingCount"),
        active: accessMap.ProblemSolving?.active
      },
      {
        target: "Datasheets",
        icon: "picture_as_pdf",
        label: "Datasheets",
        meta: "PDF komponen",
        badge: getCatalogCountLabel(state, "datasheetsCount"),
        active: accessMap.Datasheets?.active
      },
      {
        target: "tool_file_hash_compare",
        icon: "fingerprint",
        label: "Cek Hash",
        meta: "MD5 / SHA",
        badge: "Tool",
        active: true
      }
    ];

    return actionItems.map((item) => `
      <button type="button" class="dashboard-home-action-button${item.active ? "" : " is-locked"}" data-view-target="${escapeHtml(item.target)}">
        <span class="material-symbols-outlined">${escapeHtml(item.icon)}</span>
        <span class="dashboard-home-action-copy">
          <strong>${escapeHtml(item.label)}</strong>
          <small>${escapeHtml(item.meta)}</small>
        </span>
        <em>${escapeHtml(item.active ? item.badge : "Lock")}</em>
      </button>
    `).join("");
  }

  function createCatalogItems(state) {
    const accessMap = getAccessMap(state);
    return catalogDefinitions.map((item) => {
      const access = accessMap[item.key] || { role: "-", active: false };
      const count = getCatalogCountLabel(state, item.countKey);
      return `
        <article class="dashboard-home-catalog-item${access.active ? " is-active" : " is-locked"}">
          <span class="material-symbols-outlined">${escapeHtml(item.icon)}</span>
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <small>${escapeHtml(count)} file</small>
          </div>
          <em>${escapeHtml(access.active ? access.role : "Belum aktif")}</em>
        </article>
      `;
    }).join("");
  }

  function createAccountRows(state) {
    const rows = [
      ["User", state.displayName],
      ["ID", state.identity],
      ["Role", state.role],
      ["Login", formatDateTime(state.lastLoginUtc)],
      ["Total download", formatCompactNumber(state.quota.total)],
      ["Akun lokal", formatCompactNumber(state.totalLocalMembers)]
    ];

    return rows.map(([label, value]) => `
      <div class="dashboard-home-kv">
        <small>${escapeHtml(label)}</small>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `).join("");
  }

  function createWorkbenchMarkup(state) {
    return `
      <section class="dashboard-home-status-grid" aria-label="Status utama dashboard">
        ${createStatusCards(state)}
      </section>

      <div class="dashboard-home-main-grid">
        <section class="spi-card dashboard-home-panel">
          <div class="dashboard-home-section-head">
            <div>
              <p class="label">Audit</p>
              <h4>Perlu dicek</h4>
            </div>
            <span class="spi-mini-badge">${escapeHtml(state.loaded ? "Live" : "Loading")}</span>
          </div>
          <div class="dashboard-home-check-list">
            ${createAuditItems(state)}
          </div>
        </section>

        <section class="spi-card dashboard-home-panel">
          <div class="dashboard-home-section-head">
            <div>
              <p class="label">Akun</p>
              <h4>Ringkasan sesi</h4>
            </div>
            <span class="spi-mini-badge">${escapeHtml(state.provider)}</span>
          </div>
          <div class="dashboard-home-kv-list">
            ${createAccountRows(state)}
          </div>
        </section>
      </div>

      <section class="spi-card dashboard-home-panel">
        <div class="dashboard-home-section-head">
          <div>
            <p class="label">Shortcut</p>
            <h4>Pekerjaan cepat</h4>
          </div>
        </div>
        <div class="dashboard-home-action-grid">
          ${createActionButtons(state)}
        </div>
      </section>

      <section class="spi-card dashboard-home-panel">
        <div class="dashboard-home-section-head">
          <div>
            <p class="label">Katalog</p>
            <h4>Jumlah file & akses</h4>
          </div>
          <span class="spi-mini-badge">${escapeHtml(state.cacheStatsLoaded ? formatCompactNumber(state.cacheStats?.totalCount || 0) : "-")} total</span>
        </div>
        <div class="dashboard-home-catalog-grid">
          ${createCatalogItems(state)}
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
        const [health, status, members, cacheStats, updateOperation] = await Promise.all([
          fetchJson("/health"),
          fetchJson("/auth/status"),
          fetchJson("/auth/members").catch(() => []),
          fetchJson("/catalog/cache-stats").catch(() => null),
          fetchJson("/update/status").catch(() => ({}))
        ]);
        const accessItems = createAccessItems(status);
        const role = getRepresentativeRole(accessItems, status.channelRole);
        const currentMember = findCurrentMember(members, status);

        state = {
          loaded: true,
          message: "Dashboard siap.",
          version: health.version || "-",
          serviceReady: Boolean(status.serviceReady),
          isLoggedIn: Boolean(status.isLoggedIn),
          hasAgreed: Boolean(status.hasAgreed),
          allowsNewWindowTab: Boolean(status.allowsNewWindowTab),
          displayName: status.displayName || status.email || "TeknisiHub User",
          identity: status.email || "-",
          provider: String(status.authProvider || "telegram").toUpperCase(),
          role,
          lastLoginUtc: currentMember?.lastLoginUtc || "",
          totalLocalMembers: Array.isArray(members) ? members.length : 0,
          quota: resolveQuota(currentMember, role),
          cacheStats: cacheStats || {},
          cacheStatsLoaded: Boolean(cacheStats && Object.keys(cacheStats).length > 0),
          updateLabel: resolveUpdateLabel(health),
          update: health.update || {},
          updateOperation: updateOperation || {},
          accessItems
        };
      } catch (error) {
        state = {
          ...state,
          loaded: true,
          message: error.message || "Dashboard belum bisa dimuat.",
          serviceReady: false,
          updateLabel: { tone: "danger", label: "Offline", value: "Service" }
        };
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
      subtitle: "Status kerja, kuota, akses, dan shortcut utama.",
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
