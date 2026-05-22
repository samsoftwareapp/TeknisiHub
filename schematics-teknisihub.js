(function initializeSchematicsViewer() {
  const serviceBaseUrl = typeof window.resolveTeknisiHubServiceBaseUrl === "function"
    ? window.resolveTeknisiHubServiceBaseUrl()
    : "http://127.0.0.1:48721";

  const params = new URLSearchParams(window.location.search);
  const fileNameEl = document.getElementById("schematicFileName");
  const framesEl = document.getElementById("schematicFrames");
  const errorEl = document.getElementById("schematicError");
  const copySessionButton = document.getElementById("copySessionButton");
  let loadedFiles = [];

  function parseCsvParam(name) {
    return String(params.get(name) || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  function parseSessionMessageId(sessionId) {
    const match = String(sessionId || "").match(/^catalog-schematics-(\d+)-\d+$/i);
    return match ? Number(match[1]) : 0;
  }

  function parseSessionFileIndex(sessionId) {
    const match = String(sessionId || "").match(/^catalog-schematics-\d+-(\d+)$/i);
    return match ? Number(match[1]) : 0;
  }

  function normalizeFileIndex(value) {
    const parsed = Math.max(0, Number(value || 0));
    return Number.isFinite(parsed) ? Math.floor(parsed) : 0;
  }

  function getFileIndexesFromParams() {
    const explicitIndexes = parseCsvParam("fileIndexes")
      .map(normalizeFileIndex)
      .filter((fileIndex) => Number.isFinite(fileIndex) && fileIndex >= 0);

    if (explicitIndexes.length > 0) {
      return [...new Set(explicitIndexes)];
    }

    return [normalizeFileIndex(params.get("fileIndex"))];
  }

  function buildSessionId(messageId, fileIndex) {
    const normalizedMessageId = Number(messageId || 0);
    if (!Number.isFinite(normalizedMessageId) || normalizedMessageId <= 0) {
      return "";
    }

    return `catalog-schematics-${Math.floor(normalizedMessageId)}-${normalizeFileIndex(fileIndex)}`;
  }

  function buildSessionIdsFromParams() {
    const explicitSessionIds = parseCsvParam("sessionIds");
    if (explicitSessionIds.length > 0) {
      return [...new Set(explicitSessionIds)];
    }

    const sessionId = String(params.get("sessionId") || "").trim();
    const messageId = Number(params.get("messageId") || parseSessionMessageId(sessionId) || 0);
    const fileIndexes = getFileIndexesFromParams();
    if (messageId > 0) {
      const builtSessionIds = fileIndexes
        .map((fileIndex) => buildSessionId(messageId, fileIndex))
        .filter(Boolean);
      if (builtSessionIds.length > 0) {
        return [...new Set(builtSessionIds)];
      }
    }

    return sessionId ? [sessionId] : [];
  }

  function resolveServiceUrl(pathOrUrl) {
    const rawValue = String(pathOrUrl || "").trim();
    if (!rawValue) return "";
    if (/^https?:\/\//i.test(rawValue)) return rawValue;
    return `${serviceBaseUrl}${rawValue.startsWith("/") ? rawValue : `/${rawValue}`}`;
  }

  function buildSessionApiUrl(sessionIds) {
    const normalizedSessionIds = [...new Set((sessionIds || []).filter(Boolean))];
    const firstSessionId = normalizedSessionIds[0] || "";
    if (!firstSessionId) return "";

    const url = new URL(`/catalog/schematics/session/${encodeURIComponent(firstSessionId)}`, serviceBaseUrl);
    if (normalizedSessionIds.length > 1) {
      url.searchParams.set("sessionIds", normalizedSessionIds.join(","));
    }
    return url.toString();
  }

  function buildAiPrompt(sessionApiUrl, files = []) {
    const fileList = files
      .map((file, index) => `${index + 1}. ${file.fileName || file.sessionId || "Schematics PDF"}`)
      .join("\n");
    const fileBlock = fileList ? `\nFile dalam session:\n${fileList}\n` : "";

    return `Session Schematics:
${sessionApiUrl}
${fileBlock}
Prompt AI:
Kamu adalah asisten teknisi motherboard. Baca semua PDF schematic dari link session di atas sebelum memberi arahan. Jangan mengarang nama komponen, nilai resistor, pin IC, atau rail; kalau tidak terbaca dari schematic, bilang tidak ditemukan dan minta halaman/area yang perlu dibuka.

1. Cara Baca
- Identifikasi dulu model board, blok power utama, charger IC, EC/SIO, jalur adaptor DC-IN, jalur baterai, rail always, rail enable, dan signal penting yang terkait keluhan.
- Saat menyebut komponen, tulis reference designator persis dari schematic, nilai nominal jika ada, pin yang diukur, dan halaman/blok jika terbaca.
- Bedakan data schematic dengan asumsi. Jangan campur.

2. Aturan Kerja Step By Step
- Mulai dari gejala user. Kalau gejala belum jelas, tanya singkat dulu.
- Beri satu langkah cek utama per balasan, bukan daftar panjang sekaligus.
- Untuk contoh kasus "tidak mau ngecas", urutkan diagnosis dari input adaptor/DC jack, fuse/proteksi, MOSFET input, charger IC, resistor sense/divider, ACDET/ACOK/ACIN, SMBus baterai, lalu BAT+/charging path sesuai schematic.
- Contoh gaya kerja: setelah membaca schematic, simpulkan komponen yang perlu dicek, misalnya "cek R126 berapa ohm" hanya jika R126 memang ada dan relevan di schematic. Tunggu jawaban user, lalu lanjut ke cek berikutnya berdasarkan hasil ukur.
- Format jawaban setiap langkah: Dugaan, Komponen/Pin yang dicek, Cara ukur, Nilai normal dari schematic, Arti jika normal, Arti jika tidak normal, Pertanyaan untuk user.
- Jangan langsung menyuruh ganti IC. Buktikan dulu dengan pengukuran bertahap.`;
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "true");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } finally {
      helper.remove();
    }
    return copied;
  }

  function showError(message) {
    if (errorEl) {
      errorEl.textContent = message || "Session Schematics gagal dimuat.";
      errorEl.classList.remove("hidden");
    }
    if (framesEl) {
      framesEl.innerHTML = "";
      framesEl.classList.remove("is-single", "is-multiple");
    }
  }

  function createFramePanel(file, index, totalFiles) {
    const panel = document.createElement("article");
    panel.className = "schematic-frame-panel";

    if (totalFiles > 1) {
      const title = document.createElement("div");
      title.className = "schematic-frame-title";

      const label = document.createElement("span");
      label.textContent = `${index + 1}. ${file.fileName || file.sessionId}`;
      title.appendChild(label);

      panel.appendChild(title);
    }

    const frame = document.createElement("iframe");
    frame.className = "schematic-frame";
    frame.title = totalFiles > 1
      ? `TeknisiHub Schematics PDF ${index + 1}`
      : "TeknisiHub Schematics PDF";
    frame.src = file.pdfUrl;
    panel.appendChild(frame);

    return panel;
  }

  function renderFrames(files) {
    if (!framesEl) return;

    framesEl.innerHTML = "";
    framesEl.classList.toggle("is-single", files.length <= 1);
    framesEl.classList.toggle("is-multiple", files.length > 1);
    files.forEach((file, index) => {
      framesEl.appendChild(createFramePanel(file, index, files.length));
    });
  }

  async function fetchSession(sessionId) {
    const response = await fetch(`${serviceBaseUrl}/catalog/schematics/session/${encodeURIComponent(sessionId)}`, {
      cache: "no-store"
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      throw new Error(payload.message || payload.detail || "Session Schematics gagal dimuat.");
    }

    const pdfUrl = resolveServiceUrl(payload.pdfUrl);
    if (!pdfUrl) {
      throw new Error("URL PDF session tidak tersedia.");
    }

    return {
      sessionId: payload.sessionId || sessionId,
      fileName: payload.fileName || sessionId,
      pdfUrl,
      usedCache: Boolean(payload.usedCache)
    };
  }

  async function loadSession() {
    const sessionIds = buildSessionIdsFromParams();
    if (sessionIds.length === 0) {
      showError("Session Schematics tidak ditemukan di URL.");
      return;
    }

    if (copySessionButton) {
      copySessionButton.addEventListener("click", async () => {
        try {
          const copied = await copyText(buildAiPrompt(buildSessionApiUrl(sessionIds), loadedFiles));
          if (!copied) throw new Error("copy failed");
          copySessionButton.classList.add("is-copied");
          copySessionButton.textContent = "Copied";
          window.setTimeout(() => {
            copySessionButton.classList.remove("is-copied");
            copySessionButton.textContent = "Copy Session";
          }, 1400);
        } catch {
          copySessionButton.textContent = "Copy Failed";
          window.setTimeout(() => { copySessionButton.textContent = "Copy Session"; }, 1600);
        }
      });
    }

    try {
      const files = [];
      for (const sessionId of sessionIds) {
        files.push(await fetchSession(sessionId));
      }

      document.title = files.length > 1
        ? `TeknisiHub Schematics - ${files.length} file PDF`
        : `TeknisiHub Schematics - ${files[0].fileName}`;
      if (fileNameEl) {
        fileNameEl.textContent = files.length > 1
          ? `${files[0].fileName} + ${files.length - 1} file`
          : files[0].fileName;
      }
      if (errorEl) errorEl.classList.add("hidden");
      loadedFiles = files;
      renderFrames(files);
    } catch (error) {
      showError(error.message || "Session Schematics gagal dimuat.");
    }
  }

  void loadSession();
})();
