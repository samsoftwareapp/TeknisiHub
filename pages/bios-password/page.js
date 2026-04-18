(function initializeBiosPasswordPage(globalScope) {
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
    const response = await fetch(`${serviceBaseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
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
    return {
      code: "",
      normalizedCode: "",
      message: "Masukkan kode lock BIOS lalu jalankan generator.",
      notes: [
        "Engine berjalan offline lewat local service.",
        "Hasil memakai basis algoritma pwgen-for-bios."
      ],
      catalog: [],
      results: [],
      copied: false,
      errorMessage: ""
    };
  }

  function createPasswordRow(passwords) {
    if (!Array.isArray(passwords) || passwords.length === 0) {
      return "<p class=\"spi-note\">Tidak ada kandidat password.</p>";
    }

    return `
      <div class="bios-password-password-row">
        ${passwords.map((password) => `<code>${escapeHtml(password)}</code>`).join("")}
      </div>
    `;
  }

  function createResultCards(results) {
    if (!Array.isArray(results) || results.length === 0) {
      return `
        <article class="bios-password-result-card bios-password-empty-state">
          <span class="material-symbols-outlined">key_off</span>
          <div>
            <strong>Belum ada hasil</strong>
            <p>Generator akan menampilkan solver yang cocok beserta kandidat password di sini.</p>
          </div>
        </article>
      `;
    }

    return results.map((result) => `
      <article class="bios-password-result-card">
        <div class="bios-password-pattern-head">
          <strong>${escapeHtml(result.name || result.id || "-")}</strong>
          <span class="spi-mini-badge">${escapeHtml(result.id || "-")}</span>
        </div>
        ${Array.isArray(result.examples) && result.examples.length > 0 ? `
          <div class="bios-password-example-row">
            ${result.examples.map((example) => `<button type="button" class="ghost bios-password-example-button" data-example="${escapeHtml(example)}">${escapeHtml(example)}</button>`).join("")}
          </div>
        ` : ""}
        ${createPasswordRow(result.passwords)}
      </article>
    `).join("");
  }

  function createCatalogCards(catalog, results) {
    const activeIds = new Set((results || []).map((item) => item.id));
    return (catalog || []).map((item) => `
      <article class="bios-password-pattern-card${activeIds.has(item.id) ? " is-active" : ""}">
        <div class="bios-password-pattern-head">
          <strong>${escapeHtml(item.name || item.id || "-")}</strong>
          <span class="spi-mini-badge">${escapeHtml(item.id || "-")}</span>
        </div>
        <div class="bios-password-example-row">
          ${(item.examples || []).map((example) => `<button type="button" class="ghost bios-password-example-button" data-example="${escapeHtml(example)}">${escapeHtml(example)}</button>`).join("")}
        </div>
      </article>
    `).join("");
  }

  function createWorkbenchMarkup(state, busy, loadingCatalog) {
    const hasMatches = Array.isArray(state.results) && state.results.length > 0;
    const statusClass = hasMatches ? " is-connected" : " is-disconnected";
    const statusIcon = hasMatches ? "vpn_key" : "key_off";
    const catalogMarkup = createCatalogCards(state.catalog, state.results);
    const resultMarkup = createResultCards(state.results);
    const notesMarkup = (state.notes || []).map((note) => `<p>${escapeHtml(note)}</p>`).join("");

    return `
      <div class="spi-stats-grid bios-password-stats-grid">
        <article class="spi-stat-card${statusClass}">
          <span class="material-symbols-outlined">${statusIcon}</span>
          <div>
            <p class="label">Solver Cocok</p>
            <strong>${hasMatches ? `${state.results.length} hasil` : "Belum ada"}</strong>
            <p>${escapeHtml(state.message)}</p>
          </div>
        </article>
        <article class="spi-stat-card">
          <span class="material-symbols-outlined">password</span>
          <div>
            <p class="label">Kode Aktif</p>
            <strong>${escapeHtml(state.normalizedCode || "-")}</strong>
            <p>Tempel persis seperti di layar lock BIOS.</p>
          </div>
        </article>
        <article class="spi-stat-card">
          <span class="material-symbols-outlined">dataset</span>
          <div>
            <p class="label">Catalog Solver</p>
            <strong>${loadingCatalog ? "Memuat..." : `${state.catalog.length} solver`}</strong>
            <p>Klik contoh untuk mengisi input lebih cepat.</p>
          </div>
        </article>
      </div>

      <div class="spi-layout bios-password-layout">
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Input Lock Code</p>
              <h4>Jalankan generator password BIOS</h4>
            </div>
          </div>
          <label class="bios-password-input-label" for="biosPasswordInput">Kode lock</label>
          <textarea id="biosPasswordInput" class="bios-password-input" rows="3" placeholder="Contoh: 1234567-595B">${escapeHtml(state.code)}</textarea>
          <p class="spi-note">Contoh format yang umum: Dell service tag, Sony 7 digit, Samsung hex, Insyde 8 digit, HP Mini 10 karakter.</p>
          ${state.errorMessage ? `<p class="spi-note">${escapeHtml(state.errorMessage)}</p>` : ""}
          <div class="boardviewer-actions bios-password-actions">
            <button id="biosPasswordGenerateButton" type="button"${busy ? " disabled" : ""}>
              <span class="material-symbols-outlined">${busy ? "progress_activity" : "key"}</span>
              <span>${busy ? "Memproses..." : "Generate password"}</span>
            </button>
            <button id="biosPasswordCopyButton" type="button" class="ghost">
              <span class="material-symbols-outlined">content_copy</span>
              <span>${state.copied ? "Tersalin" : "Salin kode"}</span>
            </button>
          </div>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Catatan</p>
              <h4>Petunjuk penggunaan dan verifikasi</h4>
            </div>
          </div>
          <div class="bios-password-checklist">${notesMarkup}</div>
        </section>
      </div>

      <section class="spi-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Hasil Generator</p>
            <h4>Kandidat password dari solver yang cocok</h4>
          </div>
        </div>
        <div class="bios-password-result-grid">${resultMarkup}</div>
      </section>

      <section class="spi-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Catalog</p>
            <h4>Daftar solver BIOS password yang tersedia</h4>
          </div>
        </div>
        <div class="bios-password-pattern-grid">${catalogMarkup}</div>
      </section>
    `;
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let notify = () => {};
    let busy = false;
    let loadingCatalog = false;

    async function loadCatalog() {
      loadingCatalog = true;
      render();

      try {
        const result = await fetchJson("/tools/bios-password/catalog");
        state = {
          ...state,
          message: result.message || state.message,
          notes: Array.isArray(result.notes) ? result.notes : state.notes,
          catalog: Array.isArray(result.catalog) ? result.catalog : []
        };
      } finally {
        loadingCatalog = false;
        render();
      }
    }

    async function generatePasswords(rawCode) {
      const normalizedCode = String(rawCode || "").trim();
      if (!normalizedCode) {
        throw new Error("Kode BIOS lock wajib diisi.");
      }

      const result = await fetchJson("/tools/bios-password/generate", {
        method: "POST",
        body: JSON.stringify({ code: normalizedCode })
      });

      state = {
        ...state,
        code: rawCode,
        normalizedCode: result.normalizedCode || normalizedCode.toUpperCase(),
        message: result.message || "Generator selesai dijalankan.",
        notes: Array.isArray(result.notes) ? result.notes : [],
        catalog: Array.isArray(result.catalog) && result.catalog.length > 0 ? result.catalog : state.catalog,
        results: Array.isArray(result.results) ? result.results : [],
        copied: false,
        errorMessage: ""
      };
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy, loadingCatalog);
      const input = mountedContainer.querySelector("#biosPasswordInput");
      const generateButton = mountedContainer.querySelector("#biosPasswordGenerateButton");
      const copyButton = mountedContainer.querySelector("#biosPasswordCopyButton");
      const exampleButtons = mountedContainer.querySelectorAll("[data-example]");

      input?.addEventListener("input", () => {
        state.code = input.value;
        state.copied = false;
        state.errorMessage = "";
      });

      generateButton?.addEventListener("click", async () => {
        if (busy) {
          return;
        }

        busy = true;
        render();

        try {
          await generatePasswords(input?.value || "");
          notify("Generator BIOS password selesai.");
        } catch (error) {
          state.errorMessage = error?.message || "Generator BIOS password gagal.";
          notify(state.errorMessage, true);
        } finally {
          busy = false;
          render();
        }
      });

      copyButton?.addEventListener("click", async () => {
        const textToCopy = String(input?.value || state.code || "").trim();
        if (!textToCopy) {
          notify("Belum ada kode untuk disalin.", "info");
          return;
        }

        try {
          await navigator.clipboard.writeText(textToCopy);
          state.copied = true;
          render();
          notify("Kode BIOS lock berhasil disalin.");
        } catch {
          notify("Clipboard browser tidak tersedia. Salin manual dari kolom input.", "info");
        }
      });

      exampleButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const example = button.getAttribute("data-example") || "";
          state.code = example;
          state.copied = false;
          state.errorMessage = "";
          render();
          const refreshedInput = mountedContainer.querySelector("#biosPasswordInput");
          if (refreshedInput) {
            refreshedInput.focus();
            refreshedInput.setSelectionRange(refreshedInput.value.length, refreshedInput.value.length);
          }
        });
      });
    }

    return {
      viewKey: "tool_bios_password",
      eyebrow: "BIOS Password",
      title: "BIOS Password Generator",
      subtitle: "Generator password BIOS offline yang dijalankan oleh local service.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        notify = typeof options.notify === "function" ? options.notify : notify;
        render();
        await loadCatalog();
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }

        mountedContainer.classList.toggle("hidden", !visible);
      },
      async refresh() {
        await loadCatalog();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.biosPassword = createApi();
})(window);
