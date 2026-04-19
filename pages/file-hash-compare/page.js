(function initializeFileHashComparePage(globalScope) {
  const serviceBaseUrl = "http://127.0.0.1:48721";

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
      firstFileName: "",
      secondFileName: "",
      firstFileSize: 0,
      secondFileSize: 0,
      firstMd5: "-",
      secondMd5: "-",
      firstSha256: "-",
      secondSha256: "-",
      comparedAt: "-",
      method: "MD5 + SHA-256",
      isIdentical: false,
      sizeMatches: false,
      md5Matches: false,
      sha256Matches: false,
      message: "Pilih dua file lalu klik Compare untuk cek apakah keduanya identik.",
      errorMessage: ""
    };
  }

  function createMatchLabel(matches) {
    return matches ? "Match" : "Beda";
  }

  function createWorkbenchMarkup(state, busy) {
    const disableAttr = busy ? " disabled" : "";
    const identicalLabel = state.isIdentical ? "Identik" : "Tidak identik";
    const identicalDescription = state.firstFileName && state.secondFileName
      ? `${state.firstFileName} vs ${state.secondFileName}`
      : "Pilih dua file untuk dibandingkan";
    const hasCompared = state.comparedAt && state.comparedAt !== "-";
    const resultCardClass = hasCompared
      ? (state.isIdentical ? "spi-card file-hash-compare-result-card is-identical" : "spi-card file-hash-compare-result-card is-different")
      : "spi-card file-hash-compare-result-card";

    return `
      <section class="spi-card">
        <div class="spi-card-head">
          <div>
            <p class="label">Input File</p>
            <h4>Bandingkan dua file</h4>
          </div>
          <button type="button" id="fileHashCompareRunButton" class="ghost"${disableAttr}>
            <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "compare_arrows"}</span>
            <span>${busy ? "Membandingkan..." : "Compare"}</span>
          </button>
        </div>
        <div class="spi-form-grid">
          <label class="spi-file-field">
            File Pertama
            <input id="fileHashCompareFirstInput" type="file"${disableAttr}>
          </label>
          <label class="spi-file-field">
            File Kedua
            <input id="fileHashCompareSecondInput" type="file"${disableAttr}>
          </label>
          <label>
            Nama File 1
            <input type="text" value="${escapeHtml(state.firstFileName)}" placeholder="Belum ada file" readonly>
          </label>
          <label>
            Nama File 2
            <input type="text" value="${escapeHtml(state.secondFileName)}" placeholder="Belum ada file" readonly>
          </label>
          <label>
            Ukuran File 1
            <input type="text" value="${escapeHtml(formatBytes(state.firstFileSize))}" placeholder="Belum ada file" readonly>
          </label>
          <label>
            Ukuran File 2
            <input type="text" value="${escapeHtml(formatBytes(state.secondFileSize))}" placeholder="Belum ada file" readonly>
          </label>
        </div>
        <p class="spi-note">${escapeHtml(state.errorMessage || state.message)}</p>
      </section>

      <section class="${resultCardClass}">
        <div class="spi-card-head">
          <div>
            <p class="label">Detail Hash</p>
            <h4>Hasil per file</h4>
          </div>
          <span class="spi-mini-badge">${escapeHtml(state.comparedAt)}</span>
        </div>
        <div class="spi-inline-meta">
          <span>File 1 <strong>${escapeHtml(state.firstFileName || "-")}</strong></span>
          <span>${escapeHtml(formatBytes(state.firstFileSize))}</span>
        </div>
        <div class="spi-inline-meta">
          <span>File 2 <strong>${escapeHtml(state.secondFileName || "-")}</strong></span>
          <span>${escapeHtml(formatBytes(state.secondFileSize))}</span>
        </div>
        <div class="spi-inline-meta">
          <span>Status <strong>${escapeHtml(identicalLabel)}</strong></span>
          <span>${escapeHtml(identicalDescription)}</span>
        </div>
        <div class="spi-form-grid">
          <label>
            MD5 File 1
            <textarea rows="2" readonly>${escapeHtml(state.firstMd5)}</textarea>
          </label>
          <label>
            MD5 File 2
            <textarea rows="2" readonly>${escapeHtml(state.secondMd5)}</textarea>
          </label>
          <label>
            SHA-256 File 1
            <textarea rows="4" readonly>${escapeHtml(state.firstSha256)}</textarea>
          </label>
          <label>
            SHA-256 File 2
            <textarea rows="4" readonly>${escapeHtml(state.secondSha256)}</textarea>
          </label>
        </div>
      </section>
    `;
  }

  function createApi() {
    let state = createInitialState();
    let mountedContainer = null;
    let busy = false;
    let firstFile = null;
    let secondFile = null;

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state, busy);

      const firstInput = mountedContainer.querySelector("#fileHashCompareFirstInput");
      const secondInput = mountedContainer.querySelector("#fileHashCompareSecondInput");
      const runButton = mountedContainer.querySelector("#fileHashCompareRunButton");

      firstInput?.addEventListener("change", () => {
        firstFile = firstInput.files?.[0] || null;
        state.firstFileName = firstFile?.name || "";
        state.firstFileSize = firstFile?.size || 0;
        state.errorMessage = "";
        render();
      });

      secondInput?.addEventListener("change", () => {
        secondFile = secondInput.files?.[0] || null;
        state.secondFileName = secondFile?.name || "";
        state.secondFileSize = secondFile?.size || 0;
        state.errorMessage = "";
        render();
      });

      runButton?.addEventListener("click", () => withBusy(async () => {
        if (!firstFile || !secondFile) {
          throw new Error("Pilih dua file dulu sebelum compare hash.");
        }

        const formData = new FormData();
        formData.set("firstFile", firstFile);
        formData.set("secondFile", secondFile);

        const result = await fetchJson("/tools/file-hash-compare/compare", {
          method: "POST",
          body: formData
        });

        state = {
          firstFileName: result.firstFileName || firstFile.name,
          secondFileName: result.secondFileName || secondFile.name,
          firstFileSize: Number(result.firstFileSize || firstFile.size || 0),
          secondFileSize: Number(result.secondFileSize || secondFile.size || 0),
          firstMd5: result.firstMd5 || "-",
          secondMd5: result.secondMd5 || "-",
          firstSha256: result.firstSha256 || "-",
          secondSha256: result.secondSha256 || "-",
          comparedAt: result.comparedAt || "-",
          method: result.method || "MD5 + SHA-256",
          isIdentical: Boolean(result.isIdentical),
          sizeMatches: Boolean(result.sizeMatches),
          md5Matches: Boolean(result.md5Matches),
          sha256Matches: Boolean(result.sha256Matches),
          message: result.message || "Perbandingan selesai.",
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
        state.errorMessage = error?.message || "Perbandingan hash gagal.";
      } finally {
        busy = false;
        render();
      }
    }

    return {
      viewKey: "tool_file_hash_compare",
      eyebrow: "Hash Compare",
      title: "Cek Hash File",
      subtitle: "Bandingkan dua file dengan MD5 dan SHA-256 untuk cek apakah isinya identik.",
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
  globalScope.teknisiHubPages.fileHashCompare = createApi();
})(window);
