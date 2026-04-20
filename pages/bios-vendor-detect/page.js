(function initializeBiosVendorDetectPage(globalScope) {
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

  function formatConfidenceLabel(value) {
    const normalized = String(value || "").toLowerCase();
    if (normalized === "high") {
      return "Tinggi";
    }

    if (normalized === "medium") {
      return "Sedang";
    }

    if (normalized === "low") {
      return "Rendah";
    }

    return "Belum pasti";
  }

  function formatEvidenceSource(value) {
    switch (String(value || "").toLowerCase()) {
      case "binary-ascii":
        return "Binary ASCII";
      case "binary-utf16le":
        return "Binary UTF-16LE";
      case "uefi-report":
        return "UEFI Report";
      case "uefi-image-name":
        return "UEFI Image";
      default:
        return "Marker";
    }
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
      systemVendor: "Unknown",
      systemVendorConfidence: "unknown",
      biosCoreVendor: "Unknown",
      biosCoreVendorConfidence: "unknown",
      uefiImageType: "-",
      uefiImageSubtype: "-",
      uefiImageName: "-",
      toolVersion: "-",
      analyzedAt: "-",
      notes: [
        "Tool ini membaca marker OEM dari isi binary dan menggabungkannya dengan metadata UEFIExtract bila tersedia.",
        "Hasil deteksi bersifat heuristic, jadi cocok untuk screening awal sebelum patch atau analisa lanjutan.",
        "Vendor perangkat seperti Lenovo, ASUS, Dell dipisahkan dari core BIOS seperti AMI, Insyde, atau Phoenix."
      ],
      systemVendorCandidates: [],
      biosCoreCandidates: [],
      message: "Pilih file BIOS lalu klik Detect untuk menebak vendor perangkat dan core BIOS.",
      errorMessage: ""
    };
  }

  function createEvidenceMarkup(evidence) {
    if (!Array.isArray(evidence) || evidence.length === 0) {
      return "<p class=\"bios-vendor-detect-empty-inline\">Belum ada evidence marker.</p>";
    }

    return `
      <div class="bios-vendor-detect-evidence-row">
        ${evidence.map((item) => `
          <span class="bios-vendor-detect-evidence-chip">
            <strong>${escapeHtml(item.marker || "-")}</strong>
            <small>${escapeHtml(formatEvidenceSource(item.source))}</small>
          </span>
        `).join("")}
      </div>
    `;
  }

  function createCandidateCards(candidates, emptyTitle, emptyDescription) {
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return `
        <article class="bios-vendor-detect-candidate-card bios-vendor-detect-candidate-card-empty">
          <span class="material-symbols-outlined">search_off</span>
          <div>
            <strong>${escapeHtml(emptyTitle)}</strong>
            <p>${escapeHtml(emptyDescription)}</p>
          </div>
        </article>
      `;
    }

    return candidates.map((candidate, index) => `
      <article class="bios-vendor-detect-candidate-card">
        <div class="bios-vendor-detect-candidate-head">
          <div>
            <p class="label">Kandidat ${index + 1}</p>
            <strong>${escapeHtml(candidate.vendor || "Unknown")}</strong>
          </div>
          <div class="bios-vendor-detect-candidate-badges">
            <span class="spi-mini-badge">Score ${escapeHtml(String(candidate.score ?? 0))}</span>
            <span class="bios-vendor-detect-confidence is-${escapeHtml(String(candidate.confidence || "unknown").toLowerCase())}">
              ${escapeHtml(formatConfidenceLabel(candidate.confidence))}
            </span>
          </div>
        </div>
        ${createEvidenceMarkup(candidate.evidence)}
      </article>
    `).join("");
  }

  function createNotesMarkup(notes) {
    return (notes || [])
      .map((note) => `<p>${escapeHtml(note)}</p>`)
      .join("");
  }

  function createWorkbenchMarkup(state, busy) {
    const disableAttr = busy ? " disabled" : "";
    const systemKnown = state.systemVendor && state.systemVendor !== "Unknown";
    const coreKnown = state.biosCoreVendor && state.biosCoreVendor !== "Unknown";

    return `
      <div class="spi-layout">
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Input File</p>
              <h4>Deteksi vendor BIOS</h4>
            </div>
            <button type="button" id="biosVendorDetectRunButton" class="ghost"${disableAttr}>
              <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "search"}</span>
              <span>${busy ? "Mendeteksi..." : "Detect"}</span>
            </button>
          </div>
          <div class="spi-form-grid">
            <label class="spi-file-field">
              File BIOS
              <input id="biosVendorDetectFileInput" type="file" accept="${acceptedExtensions}"${disableAttr}>
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
              Analisa Terakhir
              <input type="text" value="${escapeHtml(state.analyzedAt)}" placeholder="Belum dijalankan" readonly>
            </label>
          </div>
          <p class="spi-note">${escapeHtml(state.errorMessage || state.message)}</p>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Ringkasan</p>
              <h4>Hasil deteksi utama</h4>
            </div>
            <span class="spi-mini-badge">${escapeHtml(state.toolVersion || "-")}</span>
          </div>
          <div class="spi-stats-grid bios-vendor-detect-stats-grid">
            <article class="spi-stat-card${systemKnown ? " is-connected" : ""}">
              <span class="material-symbols-outlined">laptop_windows</span>
              <div>
                <p class="label">System Vendor</p>
                <strong>${escapeHtml(state.systemVendor || "Unknown")}</strong>
                <p>${escapeHtml(formatConfidenceLabel(state.systemVendorConfidence))}</p>
              </div>
            </article>
            <article class="spi-stat-card${coreKnown ? " is-connected" : ""}">
              <span class="material-symbols-outlined">developer_board</span>
              <div>
                <p class="label">BIOS Core</p>
                <strong>${escapeHtml(state.biosCoreVendor || "Unknown")}</strong>
                <p>${escapeHtml(formatConfidenceLabel(state.biosCoreVendorConfidence))}</p>
              </div>
            </article>
            <article class="spi-stat-card">
              <span class="material-symbols-outlined">memory</span>
              <div>
                <p class="label">UEFI Image</p>
                <strong>${escapeHtml(state.uefiImageType || "-")}</strong>
                <p>${escapeHtml(state.uefiImageSubtype || "-")}</p>
              </div>
            </article>
            <article class="spi-stat-card">
              <span class="material-symbols-outlined">inventory_2</span>
              <div>
                <p class="label">Image Name</p>
                <strong>${escapeHtml(state.uefiImageName || "-")}</strong>
                <p>UEFIExtract metadata</p>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div class="spi-bottom-grid bios-vendor-detect-bottom-grid">
        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Catatan</p>
              <h4>Interpretasi hasil</h4>
            </div>
          </div>
          <div class="bios-vendor-detect-notes">${createNotesMarkup(state.notes)}</div>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">System Vendor Candidates</p>
              <h4>Kandidat vendor perangkat</h4>
            </div>
          </div>
          <div class="bios-vendor-detect-candidate-grid">
            ${createCandidateCards(
              state.systemVendorCandidates,
              "Belum ada kandidat vendor perangkat",
              "Coba file dump lain atau cek apakah image terlalu minim marker OEM."
            )}
          </div>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">BIOS Core Candidates</p>
              <h4>Kandidat core BIOS</h4>
            </div>
          </div>
          <div class="bios-vendor-detect-candidate-grid">
            ${createCandidateCards(
              state.biosCoreCandidates,
              "Belum ada kandidat core BIOS",
              "Marker AMI, Insyde, Phoenix, Award, atau coreboot belum ditemukan kuat."
            )}
          </div>
        </section>

        <section class="spi-card">
          <div class="spi-card-head">
            <div>
              <p class="label">Metadata</p>
              <h4>Informasi UEFI</h4>
            </div>
          </div>
          <div class="bios-vendor-detect-notes">
            <p>Tipe image: ${escapeHtml(state.uefiImageType || "-")}</p>
            <p>Subtype: ${escapeHtml(state.uefiImageSubtype || "-")}</p>
            <p>Image name: ${escapeHtml(state.uefiImageName || "-")}</p>
          </div>
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

      const fileInput = mountedContainer.querySelector("#biosVendorDetectFileInput");
      const runButton = mountedContainer.querySelector("#biosVendorDetectRunButton");

      fileInput?.addEventListener("change", () => {
        selectedFile = fileInput.files?.[0] || null;
        state.fileName = selectedFile?.name || "";
        state.fileSize = selectedFile?.size || 0;
        state.errorMessage = "";
        state.message = selectedFile
          ? "File siap dianalisa. Klik Detect untuk menebak vendor perangkat dan core BIOS."
          : "Pilih file BIOS lalu klik Detect untuk menebak vendor perangkat dan core BIOS.";
        render();
      });

      runButton?.addEventListener("click", () => withBusy(async () => {
        if (!selectedFile) {
          throw new Error("Pilih file BIOS dulu sebelum menjalankan deteksi vendor.");
        }

        const formData = new FormData();
        formData.set("file", selectedFile);

        const result = await fetchJson("/tools/bios-vendor-detect/analyze", {
          method: "POST",
          body: formData
        });

        state = {
          fileName: result.fileName || selectedFile.name,
          fileSize: Number(result.fileSize || selectedFile.size || 0),
          systemVendor: result.systemVendor || "Unknown",
          systemVendorConfidence: result.systemVendorConfidence || "unknown",
          biosCoreVendor: result.biosCoreVendor || "Unknown",
          biosCoreVendorConfidence: result.biosCoreVendorConfidence || "unknown",
          uefiImageType: result.uefiImageType || "-",
          uefiImageSubtype: result.uefiImageSubtype || "-",
          uefiImageName: result.uefiImageName || "-",
          toolVersion: result.toolVersion || "-",
          analyzedAt: new Date().toLocaleString("id-ID"),
          notes: Array.isArray(result.notes) && result.notes.length > 0
            ? result.notes
            : createInitialState().notes,
          systemVendorCandidates: Array.isArray(result.systemVendorCandidates) ? result.systemVendorCandidates : [],
          biosCoreCandidates: Array.isArray(result.biosCoreCandidates) ? result.biosCoreCandidates : [],
          message: result.message || "Deteksi vendor BIOS selesai.",
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
        state.errorMessage = error?.message || "Deteksi vendor BIOS gagal dijalankan.";
      } finally {
        busy = false;
        render();
      }
    }

    return {
      viewKey: "tool_bios_vendor_detect",
      eyebrow: "BIOS Vendor",
      title: "Deteksi Vendor BIOS",
      subtitle: "Screening cepat untuk menebak vendor perangkat dan core BIOS dari file dump lokal.",
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
  globalScope.teknisiHubPages.biosVendorDetect = createApi();
})(window);
