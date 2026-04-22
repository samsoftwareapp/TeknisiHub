(function initializeComponentEquivalentsPage(globalScope) {
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

  function createInitialState() {
    return {
      query: "",
      message: "Menyiapkan database persamaan komponen...",
      databasePath: "",
      databaseExists: false,
      databaseSourceUrl: "",
      databaseCurrentVersion: "",
      databaseSourceVersion: "",
      databaseFileSizeBytes: 0,
      databaseLastModifiedUtc: "",
      totalPartCount: 0,
      totalFamilyCount: 0,
      resultCount: 0,
      suggestions: [],
      results: [],
      selectedFamilyKey: "",
      aiMessage: "AI lookup siap dipakai saat Anda butuh referensi internet tambahan.",
      aiAnswer: "",
      aiModelName: "",
      aiGrounded: false,
      aiWebSearchQueries: [],
      aiSources: [],
      aiLocalMatches: []
    };
  }

  function formatBytes(value) {
    const bytes = Number(value || 0);
    if (!bytes) {
      return "0 B";
    }

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const normalized = bytes / (1024 ** index);
    return `${normalized >= 10 || index === 0 ? normalized.toFixed(0) : normalized.toFixed(1)} ${units[index]}`;
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

  function createSearchChips(suggestions) {
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return "";
    }

    return `
      <div class="component-equivalent-chip-row">
        ${suggestions.map((value) => `
          <button type="button" class="component-equivalent-chip" data-suggestion="${escapeHtml(value)}">${escapeHtml(value)}</button>
        `).join("")}
      </div>
    `;
  }

  function createFamilyCards(state) {
    if (!state.results.length) {
      return `
        <article class="catalog-empty component-equivalent-empty">
          <span class="material-symbols-outlined">search_off</span>
          <strong>Belum ada hasil</strong>
          <p>${escapeHtml(state.message)}</p>
        </article>
      `;
    }

    return state.results.map((family) => {
      const isActive = family.familyKey === state.selectedFamilyKey;
      return `
        <article class="component-equivalent-card${isActive ? " is-active" : ""}" data-family-key="${escapeHtml(family.familyKey)}">
          <div class="component-equivalent-card-top">
            <span class="spi-mini-badge">${escapeHtml(family.matchLabel || "Keluarga part")}</span>
            <span class="component-equivalent-card-score">${escapeHtml(String(family.memberCount || 0))} part</span>
          </div>
          <h4>${escapeHtml(family.canonicalPartNumber || family.canonicalDisplayName || "-")}</h4>
          <p class="component-equivalent-card-subtitle">${escapeHtml(family.type || "-")} • ${escapeHtml(family.package || "-")}</p>
          <p class="component-equivalent-card-summary">${escapeHtml(family.summary || "-")}</p>
          <div class="component-equivalent-meta-list">
            ${(family.searchHighlights || []).map((value) => `<span class="component-equivalent-meta-pill">${escapeHtml(value)}</span>`).join("")}
          </div>
        </article>
      `;
    }).join("");
  }

  function createDetailPanel(state) {
    const family = state.results.find((item) => item.familyKey === state.selectedFamilyKey) || state.results[0];
    if (!family) {
      return `
        <div class="detail-empty">
          Ketik part number seperti <code>AO3401</code>, <code>BQ24717</code>, atau package seperti <code>SC70-6</code> untuk mulai cari keluarga penggantinya.
        </div>
      `;
    }

    return `
      <div class="detail-block">
        <div class="component-equivalent-detail-head">
          <div>
            <p class="label">Keluarga Utama</p>
            <h3>${escapeHtml(family.canonicalDisplayName || family.canonicalPartNumber)}</h3>
          </div>
          <span class="spi-mini-badge">${escapeHtml(family.matchLabel || "Match")}</span>
        </div>
        <div class="detail-grid">
          <strong>Part utama</strong><span>${escapeHtml(family.canonicalPartNumber || "-")}</span>
          <strong>Tipe</strong><span>${escapeHtml(family.type || "-")}</span>
          <strong>Package</strong><span>${escapeHtml(family.package || "-")}</span>
          <strong>Total anggota</strong><span>${escapeHtml(String(family.memberCount || 0))}</span>
          <strong>Alternatif</strong><span>${escapeHtml(String(family.equivalentCount || 0))}</span>
          <strong>Ringkasan</strong><span>${escapeHtml(family.summary || "-")}</span>
        </div>
        <div class="note">${escapeHtml(family.consistencyNote || family.pinoutNote || "Tetap cek pinout dan rating sebelum substitusi.")}</div>
      </div>

      <div class="detail-block">
        <h3>Anggota Keluarga</h3>
        <div class="component-equivalent-member-list">
          ${(family.members || []).map((member) => `
            <article class="component-equivalent-member-card${member.isDirectMatch ? " is-direct-match" : ""}">
              <div class="component-equivalent-member-head">
                <div>
                  <strong>${escapeHtml(member.partNumber || "-")}</strong>
                  <p>${escapeHtml(member.displayName || member.partNumber || "-")}</p>
                </div>
                <span class="component-equivalent-member-kind">${escapeHtml(member.matchReason || (member.kind === "canonical" ? "Part utama" : "Satu keluarga"))}</span>
              </div>
              <div class="component-equivalent-member-grid">
                <span>${escapeHtml(member.type || "-")}</span>
                <span>${escapeHtml(member.package || "-")}</span>
              </div>
              <p class="component-equivalent-card-summary">${escapeHtml(member.summary || "-")}</p>
              <p class="component-equivalent-member-note">${escapeHtml(member.pinoutNote || "Tetap cek pinout.")}</p>
              <div class="component-equivalent-meta-list">
                ${(member.searchTerms || []).slice(0, 5).map((value) => `<span class="component-equivalent-meta-pill">${escapeHtml(value)}</span>`).join("")}
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }

  function createAiResultCard(state) {
    const hasAiAnswer = Boolean(state.aiAnswer);
    const hasAiQueries = Array.isArray(state.aiWebSearchQueries) && state.aiWebSearchQueries.length > 0;
    const hasAiSources = Array.isArray(state.aiSources) && state.aiSources.length > 0;
    const hasAiLocalMatches = Array.isArray(state.aiLocalMatches) && state.aiLocalMatches.length > 0;

    return `
      <section class="spi-card component-equivalent-ai-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Analisa AI</p>
            <h4>Referensi Internet Gemini</h4>
          </div>
          <span class="spi-mini-badge">${escapeHtml(state.aiModelName || "Gemini")}</span>
        </div>
        <p class="spi-note">${escapeHtml(state.aiMessage || "AI lookup siap dipakai.")}</p>
        ${state.aiGrounded ? '<div class="note">Google Search grounding aktif. Tetap verifikasi pinout, package, dan rating komponen sebelum substitusi.</div>' : ""}
        ${hasAiAnswer ? `
          <div class="component-equivalent-ai-answer">${escapeHtml(state.aiAnswer).replaceAll("\n", "<br>")}</div>
        ` : `
          <div class="component-equivalent-ai-empty">
            Gunakan tombol <strong>Cari via AI Gemini</strong> untuk menambahkan referensi internet dari AI.
          </div>
        `}
        ${hasAiQueries ? `
          <div class="detail-block">
            <h3>Query Web</h3>
            <div class="component-equivalent-meta-list">
              ${state.aiWebSearchQueries.map((value) => `<span class="component-equivalent-meta-pill">${escapeHtml(value)}</span>`).join("")}
            </div>
          </div>
        ` : ""}
        ${hasAiSources ? `
          <div class="detail-block">
            <h3>Sumber Web</h3>
            <div class="component-equivalent-ai-sources">
              ${state.aiSources.map((source) => `
                <a class="component-equivalent-ai-source" href="${escapeHtml(source.url || "#")}" target="_blank" rel="noreferrer noopener">
                  <strong>${escapeHtml(source.title || source.url || "-")}</strong>
                  <span>${escapeHtml(source.host || source.url || "-")}</span>
                </a>
              `).join("")}
            </div>
          </div>
        ` : ""}
        ${hasAiLocalMatches ? `
          <div class="detail-block">
            <h3>Pembanding Lokal</h3>
            <div class="component-equivalent-ai-local-list">
              ${state.aiLocalMatches.map((family) => `
                <article class="component-equivalent-ai-local-card">
                  <strong>${escapeHtml(family.canonicalPartNumber || "-")}</strong>
                  <span>${escapeHtml(family.type || "-")} | ${escapeHtml(family.package || "-")}</span>
                </article>
              `).join("")}
            </div>
          </div>
        ` : ""}
      </section>
    `;
  }

  function createWorkbenchMarkup(state, busy) {
    const databaseBusy = busy === "database-download" || busy === "database-update";
    const databaseActionLabel = state.databaseExists
      ? (busy === "database-update" ? "Mengecek..." : "Cek Update Database")
      : (busy === "database-download" ? "Mengunduh..." : "Download Database");
    const databaseActionIcon = databaseBusy ? "progress_activity" : (state.databaseExists ? "system_update_alt" : "download");

    return `
      <div class="spi-workbench-shell component-equivalent-shell${busy ? " is-busy" : ""}">
        <section class="spi-card component-equivalent-hero-card">
          <div class="component-equivalent-hero">
            <div>
              <p class="label">Smart Match Engine</p>
              <h4>Persamaan Komponen</h4>
              <p class="component-equivalent-hero-copy">Cari part utama, donor, alias marking, tipe, atau package untuk menemukan keluarga komponen yang paling mendekati.</p>
            </div>
            <div class="component-equivalent-hero-stats">
              <span><strong>${escapeHtml(String(state.totalPartCount || 0))}</strong> part</span>
              <span><strong>${escapeHtml(String(state.totalFamilyCount || 0))}</strong> keluarga</span>
              <span><strong>${escapeHtml(String(state.resultCount || 0))}</strong> hasil</span>
            </div>
          </div>
          <div class="component-equivalent-search-panel">
            <label class="component-equivalent-search-box">
              <span class="material-symbols-outlined">precision_manufacturing</span>
              <input id="componentEquivalentSearchInput" type="search" value="${escapeHtml(state.query)}" placeholder="Contoh: AO3401, BQ24717, 2N7002, SC70-6">
            </label>
            <div class="component-equivalent-action-row">
              <button id="componentEquivalentSearchButton" type="button"${busy ? " disabled" : ""}>
                <span class="material-symbols-outlined${busy === "search" ? " is-spinning" : ""}">${busy === "search" ? "progress_activity" : "search"}</span>
                <span>${busy === "search" ? "Mencari..." : "Cari Persamaan"}</span>
              </button>
              <button id="componentEquivalentAiButton" type="button"${busy ? " disabled" : ""}>
                <span class="material-symbols-outlined${busy === "ai" ? " is-spinning" : ""}">${busy === "ai" ? "progress_activity" : "travel_explore"}</span>
                <span>${busy === "ai" ? "Cari via AI..." : "Cari via AI Gemini"}</span>
              </button>
              <button id="componentEquivalentDatabaseButton" type="button"${busy ? " disabled" : ""}>
                <span class="material-symbols-outlined${databaseBusy ? " is-spinning" : ""}">${databaseActionIcon}</span>
                <span>${databaseActionLabel}</span>
              </button>
            </div>
          </div>
          ${createSearchChips(state.suggestions)}
          <p class="spi-note">${escapeHtml(state.message || "Database siap dipakai.")}</p>
        </section>

        <div class="component-equivalent-layout">
          <section class="spi-card">
            <div class="spi-card-head">
              <div>
                <p class="label">Hasil Pencarian</p>
                <h4>Keluarga Part</h4>
              </div>
              <span class="spi-mini-badge">${escapeHtml(String(state.resultCount || 0))} hasil</span>
            </div>
            <div class="component-equivalent-results">
              ${createFamilyCards(state)}
            </div>
          </section>

          <section class="spi-card">
            <div class="spi-card-head">
              <div>
                <p class="label">Detail Persamaan</p>
                <h4>Analisa Keluarga</h4>
              </div>
            </div>
            <div class="panel-body">
              ${createDetailPanel(state)}
            </div>
          </section>
        </div>

        ${createAiResultCard(state)}
      </div>
    `;
  }

  function createApi() {
    let mountedContainer = null;
    let pageNotifier = null;
    let state = createInitialState();
    let busy = false;

    function notify(message, tone = false) {
      if (typeof pageNotifier === "function" && message) {
        pageNotifier(message, tone);
      }
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy);

      const searchInput = mountedContainer.querySelector("#componentEquivalentSearchInput");
      const searchButton = mountedContainer.querySelector("#componentEquivalentSearchButton");
      const aiButton = mountedContainer.querySelector("#componentEquivalentAiButton");
      const databaseButton = mountedContainer.querySelector("#componentEquivalentDatabaseButton");

      searchInput?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          void runSearch(searchInput.value);
        }
      });

      searchButton?.addEventListener("click", () => {
        void runSearch(searchInput?.value || state.query);
      });

      aiButton?.addEventListener("click", () => {
        void runAiLookup(searchInput?.value || state.query);
      });

      databaseButton?.addEventListener("click", () => {
        void syncDatabase();
      });

      mountedContainer.querySelectorAll("[data-suggestion]").forEach((button) => {
        button.addEventListener("click", () => {
          const nextQuery = button.getAttribute("data-suggestion") || "";
          void runSearch(nextQuery);
        });
      });

      mountedContainer.querySelectorAll("[data-family-key]").forEach((card) => {
        card.addEventListener("click", () => {
          state.selectedFamilyKey = card.getAttribute("data-family-key") || "";
          render();
        });
      });
    }

    async function refreshDatabaseStatus(ensureReady = false) {
      const result = await fetchJson(`/tools/component-equivalents/database-status?ensureReady=${ensureReady ? "true" : "false"}`);
      state.databaseExists = Boolean(result.exists);
      state.databasePath = result.databasePath || state.databasePath || "";
      state.databaseSourceUrl = result.sourceUrl || "";
      state.databaseCurrentVersion = result.currentVersion || "";
      state.databaseSourceVersion = result.sourceVersion || "";
      state.databaseFileSizeBytes = Number(result.fileSizeBytes || 0);
      state.databaseLastModifiedUtc = result.lastModifiedUtc || "";
      state.totalPartCount = Number(result.totalPartCount || state.totalPartCount || 0);
      return result;
    }

    async function runSearch(query) {
      if (busy) {
        return;
      }

      busy = "search";
      state.query = query || "";
      render();

      try {
        const result = await fetchJson(`/tools/component-equivalents/search?query=${encodeURIComponent(query || "")}`);
        state = {
          query: result.query || "",
          message: result.message || "Pencarian selesai.",
          databasePath: result.databasePath || "",
          databaseExists: true,
          databaseSourceUrl: state.databaseSourceUrl,
          databaseCurrentVersion: state.databaseCurrentVersion,
          databaseSourceVersion: state.databaseSourceVersion,
          databaseFileSizeBytes: state.databaseFileSizeBytes,
          databaseLastModifiedUtc: state.databaseLastModifiedUtc,
          totalPartCount: Number(result.totalPartCount || 0),
          totalFamilyCount: Number(result.totalFamilyCount || 0),
          resultCount: Number(result.resultCount || 0),
          suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
          results: Array.isArray(result.results) ? result.results : [],
          selectedFamilyKey: result.results?.[0]?.familyKey || "",
          aiMessage: state.aiMessage,
          aiAnswer: state.aiAnswer,
          aiModelName: state.aiModelName,
          aiGrounded: state.aiGrounded,
          aiWebSearchQueries: state.aiWebSearchQueries,
          aiSources: state.aiSources,
          aiLocalMatches: state.aiLocalMatches
        };
        await refreshDatabaseStatus(false);
      } catch (error) {
        state.message = error?.message || "Pencarian persamaan komponen gagal.";
        notify(state.message, true);
      } finally {
        busy = false;
        render();
      }
    }

    async function syncDatabase() {
      if (busy) {
        return;
      }

      const action = state.databaseExists ? "database-update" : "database-download";
      busy = action;
      state.message = state.databaseExists
        ? "Sedang mengecek update database persamaan komponen..."
        : "Sedang mengunduh database persamaan komponen...";
      render();

      try {
        const endpoint = state.databaseExists
          ? "/tools/component-equivalents/database-check-update"
          : "/tools/component-equivalents/database-download";
        const result = await fetchJson(endpoint, { method: "POST" });

        state.databaseExists = Boolean(result.exists);
        state.databasePath = result.databasePath || state.databasePath || "";
        state.databaseSourceUrl = result.sourceUrl || state.databaseSourceUrl || "";
        state.databaseCurrentVersion = result.currentVersion || state.databaseCurrentVersion || "";
        state.databaseSourceVersion = result.sourceVersion || state.databaseSourceVersion || "";
        state.databaseFileSizeBytes = Number(result.fileSizeBytes || 0);
        state.databaseLastModifiedUtc = result.lastModifiedUtc || "";
        state.totalPartCount = Number(result.totalPartCount || 0);
        state.message = result.message || "Sinkronisasi database selesai.";

        if (result.alreadyLatest) {
          notify(state.message, false);
        } else if (result.updated) {
          notify(state.message, false);
        }

        if (state.databaseExists) {
          busy = false;
          await runSearch(state.query || "");
          return;
        }
      } catch (error) {
        state.message = error?.message || "Sinkronisasi database persamaan komponen gagal.";
        notify(state.message, true);
      } finally {
        if (busy === action) {
          busy = false;
          render();
        }
      }
    }

    async function runAiLookup(query) {
      if (busy) {
        return;
      }

      const trimmedQuery = String(query || "").trim();
      if (!trimmedQuery) {
        notify("Masukkan part number dulu sebelum cari via AI.", true);
        return;
      }

      busy = "ai";
      state.query = trimmedQuery;
      state.aiMessage = "Gemini sedang mencari referensi internet untuk part ini...";
      render();

      try {
        const result = await fetchJson("/tools/component-equivalents/ai-lookup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: trimmedQuery,
            maxLocalFamilies: 3
          })
        });

        state.aiMessage = result.message || "Lookup AI selesai.";
        state.aiAnswer = result.answer || "";
        state.aiModelName = result.modelName || "Gemini";
        state.aiGrounded = Boolean(result.groundedWithGoogleSearch);
        state.aiWebSearchQueries = Array.isArray(result.webSearchQueries) ? result.webSearchQueries : [];
        state.aiSources = Array.isArray(result.sources) ? result.sources : [];
        state.aiLocalMatches = Array.isArray(result.localMatches) ? result.localMatches : [];
      } catch (error) {
        state.aiMessage = error?.message || "Lookup AI persamaan komponen gagal.";
        state.aiAnswer = "";
        state.aiSources = [];
        state.aiWebSearchQueries = [];
        state.aiLocalMatches = [];
        notify(state.aiMessage, true);
      } finally {
        busy = false;
        render();
      }
    }

    return {
      viewKey: "ComponentEquivalents",
      eyebrow: "Persamaan Part",
      title: "Persamaan Komponen",
      subtitle: "Workbench cerdas untuk mencari keluarga part pengganti dari database backend local service.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        if (typeof options.notify === "function") {
          pageNotifier = options.notify;
        }
        try {
          await refreshDatabaseStatus(false);
        } catch (error) {
          state.message = error?.message || "Gagal mengecek database persamaan komponen.";
          notify(state.message, true);
        }
        if (state.databaseExists) {
          await runSearch("");
          return;
        }

        state.message = "Database persamaan komponen belum ada. Klik Download Database untuk mulai pakai fitur ini.";
        render();
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }

        mountedContainer.classList.toggle("hidden", !visible);
      },
      async refresh() {
        await runSearch(state.query || "");
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.componentEquivalents = createApi();
})(window);
