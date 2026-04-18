(function initializeUefiToolPage(globalScope) {
  const serviceBaseUrl = "http://127.0.0.1:48721";
  const acceptedExtensions = ".bin,.rom,.cap,.img,.fd,.bio,.wph,.efi,.hdr";

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
    const requestUrl = `${serviceBaseUrl}${path}`;
    const isFormDataBody = options.body instanceof FormData;
    const headers = isFormDataBody ? {} : { "Content-Type": "application/json" };

    const response = await fetch(requestUrl, {
      headers,
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
      fileName: "",
      fileSize: 0,
      toolVersion: "-",
      imageType: "-",
      imageSubtype: "-",
      imageName: "-",
      warningCount: 0,
      warningOutput: "",
      reportOutput: "",
      analyzedAt: "-",
      reportSearchQuery: "",
      reportSearchOpen: false,
      reportMatchIndex: 0,
      message: "Pilih file BIOS/UEFI lalu klik Analyze untuk melihat report lengkap UEFIExtract.",
      errorMessage: ""
    };
  }

  function escapeRegExp(value) {
    return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function createHighlightedReportMarkup(reportOutput, searchQuery) {
    const source = String(reportOutput ?? "");
    if (!source) {
      return "";
    }

    const escapedSource = escapeHtml(source);
    const trimmedQuery = String(searchQuery ?? "").trim();
    if (!trimmedQuery) {
      return escapedSource;
    }

    const pattern = new RegExp(escapeRegExp(trimmedQuery), "gi");
    return escapedSource.replace(pattern, (match) => `<mark>${match}</mark>`);
  }

  function countMatches(reportOutput, searchQuery) {
    const source = String(reportOutput ?? "");
    const trimmedQuery = String(searchQuery ?? "").trim();
    if (!source || !trimmedQuery) {
      return 0;
    }

    const pattern = new RegExp(escapeRegExp(trimmedQuery), "gi");
    const matches = source.match(pattern);
    return Array.isArray(matches) ? matches.length : 0;
  }

  function parseReportRows(reportOutput) {
    const source = String(reportOutput ?? "").trim();
    if (!source) {
      return [];
    }

    const lines = source.split(/\r?\n/).filter(Boolean);
    if (lines.length <= 1) {
      return [];
    }

    return lines.slice(1).map((line) => {
      const parts = line.split("|");
      const normalized = [];

      for (let index = 0; index < 6; index += 1) {
        normalized.push((parts[index] || "").trim());
      }

      return {
        type: normalized[0],
        subtype: normalized[1],
        base: normalized[2],
        size: normalized[3],
        crc32: normalized[4],
        name: normalized.slice(5).join(" | ").trim()
      };
    });
  }

  function createHighlightedMarkup(value, searchQuery) {
    const escapedValue = escapeHtml(value ?? "");
    const trimmedQuery = String(searchQuery ?? "").trim();
    if (!trimmedQuery) {
      return escapedValue;
    }

    const pattern = new RegExp(escapeRegExp(trimmedQuery), "gi");
    return escapedValue.replace(pattern, (match) => `<mark>${match}</mark>`);
  }

  function createReportTableMarkup(rows, searchQuery) {
    return `
      <div id="uefiToolReportConsole" class="uefi-tool-console">
        <table class="uefi-tool-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Subtype</th>
              <th>Base</th>
              <th>Size</th>
              <th>CRC32</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td>${createHighlightedMarkup(row.type, searchQuery)}</td>
                <td>${createHighlightedMarkup(row.subtype, searchQuery)}</td>
                <td>${createHighlightedMarkup(row.base, searchQuery)}</td>
                <td>${createHighlightedMarkup(row.size, searchQuery)}</td>
                <td>${createHighlightedMarkup(row.crc32, searchQuery)}</td>
                <td>${createHighlightedMarkup(row.name, searchQuery)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderSearchResults(container, state) {
    if (!container) {
      return;
    }

    const reportConsole = container.querySelector("#uefiToolReportConsole");
    if (reportConsole) {
      const rows = parseReportRows(state.reportOutput);
      reportConsole.outerHTML = createReportTableMarkup(rows, state.reportSearchQuery);
    }

    const nextReportConsole = container.querySelector("#uefiToolReportConsole");
    const matches = Array.from(nextReportConsole?.querySelectorAll("mark") || []);
    const matchCount = matches.length;
    if (matchCount > 0) {
      state.reportMatchIndex = Math.min(state.reportMatchIndex, matchCount - 1);
      matches.forEach((item, index) => {
        item.classList.toggle("is-active", index === state.reportMatchIndex);
      });
    } else {
      state.reportMatchIndex = 0;
    }

    const searchCount = container.querySelector(".uefi-tool-searchcount");
    if (searchCount) {
      searchCount.textContent = matchCount > 0
        ? `${state.reportMatchIndex + 1}/${matchCount} match`
        : "0 match";
    }

    const searchBar = container.querySelector("#uefiToolSearchbar");
    if (searchBar) {
      searchBar.classList.toggle("hidden", !state.reportSearchOpen);
    }

    const prevButton = container.querySelector("#uefiToolFindPrevButton");
    const nextButton = container.querySelector("#uefiToolFindNextButton");
    if (prevButton) {
      prevButton.disabled = matchCount === 0;
    }
    if (nextButton) {
      nextButton.disabled = matchCount === 0;
    }

    const activeMatch = matches[state.reportMatchIndex];
    if (activeMatch) {
      activeMatch.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function createWorkbenchMarkup(state, busy) {
    const disableAttr = busy ? " disabled" : "";
    const hasWarnings = Boolean(state.warningOutput);
    const hasReport = Boolean(state.reportOutput);
    const hasSearch = Boolean(state.reportSearchOpen);
    const reportRows = parseReportRows(state.reportOutput);

    return `
      <div class="spi-layout">
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Input File</p>
              <h4>Pilih image firmware</h4>
            </div>
            <button type="button" id="uefiToolRunButton" class="ghost"${disableAttr}>
              <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "play_arrow"}</span>
              <span>${busy ? "Menganalisa..." : "Analyze"}</span>
            </button>
          </div>
          <div class="spi-form-grid">
            <label class="spi-file-field">
              File Firmware
              <input id="uefiToolFileInput" type="file" accept="${acceptedExtensions}"${disableAttr}>
            </label>
            <label>
              Nama File
              <input type="text" value="${escapeHtml(state.fileName)}" placeholder="Belum ada file" readonly>
            </label>
            <label>
              Ukuran
              <input type="text" value="${escapeHtml(formatBytes(state.fileSize))}" placeholder="Belum ada file" readonly>
            </label>
            <label>
              Tool Build
              <input type="text" value="${escapeHtml(state.toolVersion)}" placeholder="Belum dijalankan" readonly>
            </label>
          </div>
          <p class="spi-note">${escapeHtml(state.errorMessage || state.message)}</p>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Ringkasan</p>
              <h4>Informasi image</h4>
            </div>
          </div>
          <div class="spi-stats-grid uefi-tool-stats-grid">
            <article class="spi-stat-card">
              <span class="material-symbols-outlined">memory</span>
              <div>
                <p class="label">Image Type</p>
                <strong>${escapeHtml(state.imageType)}</strong>
                <p>${escapeHtml(state.imageSubtype)}</p>
              </div>
            </article>
            <article class="spi-stat-card">
              <span class="material-symbols-outlined">inventory_2</span>
              <div>
                <p class="label">Image Name</p>
                <strong>${escapeHtml(state.imageName)}</strong>
                <p>${escapeHtml(state.analyzedAt)}</p>
              </div>
            </article>
            <article class="spi-stat-card${state.warningCount > 0 ? " is-disconnected" : " is-connected"}">
              <span class="material-symbols-outlined">warning</span>
              <div>
                <p class="label">Parser Warning</p>
                <strong>${escapeHtml(String(state.warningCount))}</strong>
                <p>${state.warningCount > 0 ? "Perlu dicek manual" : "Tidak ada warning parser"}</p>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div class="spi-bottom-grid">
        <section id="uefiToolReportPanel" class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">UEFI Report</p>
              <h4>Hasil lengkap UEFIExtract</h4>
            </div>
            <div class="uefi-tool-panel-actions">
              <button type="button" id="uefiToolFindToggleButton" class="ghost"${disableAttr}>
                <span class="material-symbols-outlined">search</span>
                <span>Find</span>
              </button>
              <button type="button" id="uefiToolFullscreenButton" class="ghost"${disableAttr}>
                <span class="material-symbols-outlined">fullscreen</span>
                <span>Full Screen</span>
              </button>
              <span class="spi-mini-badge">${hasReport ? "Report siap" : "Belum ada report"}</span>
            </div>
          </div>
          <div id="uefiToolSearchbar" class="uefi-tool-searchbar${hasSearch ? "" : " hidden"}">
            <label>
              Cari di report
              <input
                id="uefiToolFindInput"
                type="text"
                value="${escapeHtml(state.reportSearchQuery)}"
                placeholder="Contoh: Volume, Region, GUID"
                ${disableAttr}>
            </label>
            <div class="uefi-tool-searchactions">
              <button id="uefiToolFindPrevButton" type="button" class="ghost"${disableAttr}>Prev</button>
              <button id="uefiToolFindNextButton" type="button" class="ghost"${disableAttr}>Next</button>
            </div>
            <span class="uefi-tool-searchcount">0 match</span>
          </div>
          ${hasReport
            ? createReportTableMarkup(reportRows, state.reportSearchQuery)
            : `<p class="me-analyzer-empty">${escapeHtml(state.message)}</p>`}
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Parser Warning</p>
              <h4>Log pemeriksaan</h4>
            </div>
            <span class="spi-mini-badge">${state.warningCount} warning</span>
          </div>
          ${hasWarnings
            ? `<pre class="uefi-tool-warnings">${escapeHtml(state.warningOutput)}</pre>`
            : `<p class="me-analyzer-empty">Tidak ada warning parser dari UEFIExtract.</p>`}
        </section>
      </div>
    `;
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let busy = false;
    let selectedFile = null;

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy);

      const fileInput = mountedContainer.querySelector("#uefiToolFileInput");
      const runButton = mountedContainer.querySelector("#uefiToolRunButton");
      const findToggleButton = mountedContainer.querySelector("#uefiToolFindToggleButton");
      const fullscreenButton = mountedContainer.querySelector("#uefiToolFullscreenButton");
      const findInput = mountedContainer.querySelector("#uefiToolFindInput");
      const reportConsole = mountedContainer.querySelector("#uefiToolReportConsole");
      const reportPanel = mountedContainer.querySelector("#uefiToolReportPanel");
      const searchBar = mountedContainer.querySelector("#uefiToolSearchbar");
      const prevButton = mountedContainer.querySelector("#uefiToolFindPrevButton");
      const nextButton = mountedContainer.querySelector("#uefiToolFindNextButton");

      fileInput?.addEventListener("change", () => {
        selectedFile = fileInput.files?.[0] || null;
        state.fileName = selectedFile?.name || "";
        state.fileSize = selectedFile?.size || 0;
        state.errorMessage = "";
        state.message = selectedFile
          ? "File siap dianalisa. Klik Analyze untuk menjalankan UEFIExtract."
          : "Pilih file BIOS/UEFI lalu klik Analyze untuk melihat report lengkap UEFIExtract.";
        render();
      });

      findToggleButton?.addEventListener("click", () => {
        state.reportSearchOpen = !state.reportSearchOpen;
        if (!state.reportSearchOpen) {
          state.reportSearchQuery = "";
          state.reportMatchIndex = 0;
        }

        searchBar?.classList.toggle("hidden", !state.reportSearchOpen);
        if (!state.reportSearchOpen && findInput) {
          findInput.value = "";
        }

        renderSearchResults(mountedContainer, state);

        if (state.reportSearchOpen && findInput) {
          findInput.focus();
          findInput.setSelectionRange(findInput.value.length, findInput.value.length);
        }
      });

      fullscreenButton?.addEventListener("click", async () => {
        const fullscreenTarget = reportPanel || reportConsole;
        if (!fullscreenTarget) {
          return;
        }

        if (document.fullscreenElement === fullscreenTarget) {
          await document.exitFullscreen();
          return;
        }

        await fullscreenTarget.requestFullscreen();
      });

      findInput?.addEventListener("input", () => {
        state.reportSearchQuery = findInput.value || "";
        state.reportMatchIndex = 0;
        renderSearchResults(mountedContainer, state);
      });

      prevButton?.addEventListener("click", () => {
        const totalMatches = countMatches(state.reportOutput, state.reportSearchQuery);
        if (totalMatches <= 0) {
          return;
        }

        state.reportMatchIndex = state.reportMatchIndex <= 0
          ? totalMatches - 1
          : state.reportMatchIndex - 1;
        renderSearchResults(mountedContainer, state);
      });

      nextButton?.addEventListener("click", () => {
        const totalMatches = countMatches(state.reportOutput, state.reportSearchQuery);
        if (totalMatches <= 0) {
          return;
        }

        state.reportMatchIndex = state.reportMatchIndex >= totalMatches - 1
          ? 0
          : state.reportMatchIndex + 1;
        renderSearchResults(mountedContainer, state);
      });

      if (findInput && state.reportSearchOpen) {
        findInput.focus();
        findInput.setSelectionRange(findInput.value.length, findInput.value.length);
      }

      const firstMatch = reportConsole?.querySelector("mark");
      if (firstMatch) {
        firstMatch.scrollIntoView({ block: "nearest" });
      }

      runButton?.addEventListener("click", () => withBusy(async () => {
        if (!selectedFile) {
          throw new Error("Pilih file firmware dulu sebelum menjalankan UEFI Tools.");
        }

        const formData = new FormData();
        formData.set("file", selectedFile);

        const result = await fetchJson("/tools/uefi-tool/analyze", {
          method: "POST",
          body: formData
        });

        state = {
          fileName: result.fileName || selectedFile.name,
          fileSize: Number(result.fileSize || selectedFile.size || 0),
          toolVersion: result.toolVersion || "-",
          imageType: result.imageType || "-",
          imageSubtype: result.imageSubtype || "-",
          imageName: result.imageName || "-",
          warningCount: Number(result.warningCount || 0),
          warningOutput: result.warningOutput || "",
          reportOutput: result.reportOutput || "",
          analyzedAt: result.analyzedAt || "-",
          reportSearchQuery: state.reportSearchQuery || "",
          reportSearchOpen: state.reportSearchOpen || false,
          reportMatchIndex: 0,
          message: result.message || "Analisa selesai.",
          errorMessage: ""
        };

      }));
    }

    async function withBusy(work) {
      if (busy) {
        return;
      }

      busy = true;
      render();

      try {
        await work();
      } catch (error) {
        state.errorMessage = error?.message || "UEFI Tools gagal dijalankan.";
      } finally {
        busy = false;
        render();
      }
    }

    return {
      viewKey: "tool_uefi",
      eyebrow: "UEFI Tools",
      title: "UEFI Tools",
      subtitle: "Utility manual untuk membaca report lengkap struktur firmware UEFI.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        render();
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }

        mountedContainer.classList.toggle("hidden", !visible);
      },
      async refresh() {
        render();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.uefiTool = createApi();
})(window);
