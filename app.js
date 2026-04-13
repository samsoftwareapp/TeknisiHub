const serviceBaseUrl = "http://127.0.0.1:48721";

const serviceStatus = document.getElementById("serviceStatus");
const notice = document.getElementById("notice");
const errorMessage = document.getElementById("errorMessage");
const joinChannelHint = document.getElementById("joinChannelHint");
const joinChannelLink = document.getElementById("joinChannelLink");
const phoneForm = document.getElementById("phoneForm");
const phoneNumberInput = document.getElementById("phoneNumber");
const rememberPhoneCheckbox = document.getElementById("rememberPhoneCheckbox");
const codeForm = document.getElementById("codeForm");
const passwordForm = document.getElementById("passwordForm");
const agreementPanel = document.getElementById("agreementPanel");
const dashboardPanel = document.getElementById("dashboardPanel");
const refreshButton = document.getElementById("refreshButton");
const agreeButton = document.getElementById("agreeButton");
const agreeCheckbox = document.getElementById("agreeCheckbox");
const logoutButton = document.getElementById("logoutButton");
const dashboardTitle = document.getElementById("dashboardTitle");
const dashboardSubtitle = document.getElementById("dashboardSubtitle");
const dashboardLoginStatus = document.getElementById("dashboardLoginStatus");
const dashboardChannelStatus = document.getElementById("dashboardChannelStatus");
const dashboardAgreementStatus = document.getElementById("dashboardAgreementStatus");
const dashboardRoleChip = document.getElementById("dashboardRoleChip");
const accessDisplayName = document.getElementById("accessDisplayName");
const accessRole = document.getElementById("accessRole");
const accessState = document.getElementById("accessState");
const dashboardJoinCta = document.getElementById("dashboardJoinCta");
const dashboardJoinLink = document.getElementById("dashboardJoinLink");
const catalogSection = document.getElementById("catalogSection");
const catalogCount = document.getElementById("catalogCount");
const catalogList = document.getElementById("catalogList");
const catalogEyebrow = document.getElementById("catalogEyebrow");
const catalogTitle = document.getElementById("catalogTitle");
const catalogSubtitle = document.getElementById("catalogSubtitle");
const catalogSearchInput = document.getElementById("catalogSearchInput");
const catalogChannelLink = document.getElementById("catalogChannelLink");
const navBios = document.getElementById("navBios");
const navBoardview = document.getElementById("navBoardview");
const toolSpiFlash = document.getElementById("toolSpiFlash");
const toolUefi = document.getElementById("toolUefi");
const toolOther = document.getElementById("toolOther");

let catalogLoaded = false;
let catalogItems = [];
let currentCatalogView = "BIOS";
const rememberedPhoneStorageKey = "teknisihub_remembered_phone";
const rememberedPhoneFlagKey = "teknisihub_remember_phone_enabled";

const boardviewChannelLink = "https://t.me/+0oa9XOhoXZExNDNl";

const toolViewMap = {
  tool_spi_flash: {
    eyebrow: "Tools Dummy",
    title: "SPI Flash",
    subtitle: "Utility dummy untuk kebutuhan pembacaan, write, dan verify chip SPI.",
    channelLink: null
  },
  tool_uefi: {
    eyebrow: "Tools Dummy",
    title: "UEFI Tools",
    subtitle: "Utility dummy untuk analisa image UEFI, region, dan struktur firmware.",
    channelLink: null
  },
  tool_other: {
    eyebrow: "Tools Dummy",
    title: "Tools Lainnya",
    subtitle: "Kumpulan dummy utility tambahan untuk kebutuhan servis dan maintenance.",
    channelLink: null
  }
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function resetCatalog() {
  catalogLoaded = false;
  catalogItems = [];
  if (catalogCount) {
    catalogCount.textContent = "0 item";
  }

  if (catalogList) {
    catalogList.innerHTML = "";
  }

  if (catalogSearchInput) {
    catalogSearchInput.value = "";
  }

  toggleElement(catalogSection, false);
}

function setActiveNav(targetKey) {
  const navMap = {
    BIOS: navBios,
    Boardview: navBoardview,
    tool_spi_flash: toolSpiFlash,
    tool_uefi: toolUefi,
    tool_other: toolOther
  };

  Object.entries(navMap).forEach(([key, element]) => {
    if (!element) {
      return;
    }

    element.classList.toggle("is-active", key === targetKey);
  });
}

function updateCatalogHeader(viewKey) {
  if (!catalogEyebrow || !catalogTitle || !catalogSubtitle || !catalogChannelLink) {
    return;
  }

  if (viewKey === "BIOS") {
    setText(catalogEyebrow, "BIOS Dummy");
    setText(catalogTitle, "File BIOS");
    setText(catalogSubtitle, "Daftar dummy file BIOS dengan tombol download untuk validasi alur dashboard.");
    toggleElement(catalogChannelLink, false);
    return;
  }

  if (viewKey === "Boardview") {
    setText(catalogEyebrow, "Boardview Dummy");
    setText(catalogTitle, "File Boardview");
    setText(catalogSubtitle, "Daftar dummy boardview. Kategori ini memakai channel khusus boardview.");
    catalogChannelLink.href = boardviewChannelLink;
    toggleElement(catalogChannelLink, true);
    return;
  }

  const toolConfig = toolViewMap[viewKey];
  setText(catalogEyebrow, toolConfig.eyebrow);
  setText(catalogTitle, toolConfig.title);
  setText(catalogSubtitle, toolConfig.subtitle);
  toggleElement(catalogChannelLink, false);
}

function renderCatalog(items, viewKey = currentCatalogView) {
  if (!catalogList || !catalogCount) {
    return;
  }

  updateCatalogHeader(viewKey);
  setActiveNav(viewKey);
  catalogCount.textContent = `${items.length} item`;

  if (items.length === 0) {
    catalogList.innerHTML = `
      <article class="catalog-empty">
        <span class="material-symbols-outlined">search_off</span>
        <strong>Belum ada hasil</strong>
        <p>Coba kata kunci lain atau pindah ke kategori lain.</p>
      </article>
    `;
    toggleElement(catalogSection, true);
    return;
  }

  catalogList.innerHTML = items.map((item) => `
    <article class="catalog-card">
      <div class="catalog-card-top">
        <span class="catalog-category">${escapeHtml(item.category)}</span>
        <span class="catalog-access">${escapeHtml(item.accessLevel)}</span>
      </div>
      <h4>${escapeHtml(item.title)}</h4>
      <p class="catalog-model">${escapeHtml(item.deviceModel)}</p>
      <p class="catalog-description">${escapeHtml(item.description)}</p>
      <dl class="catalog-meta-grid">
        <div>
          <dt>MODEL</dt>
          <dd>${escapeHtml(item.deviceModel || "-")}</dd>
        </div>
        <div>
          <dt>SN</dt>
          <dd>${escapeHtml(item.serialNumber || "-")}</dd>
        </div>
        <div>
          <dt>CODE BOARD</dt>
          <dd>${escapeHtml(item.boardCode || "-")}</dd>
        </div>
        <div>
          <dt>NOTE</dt>
          <dd>${escapeHtml(item.note || "-")}</dd>
        </div>
      </dl>
      <div class="catalog-file-row">
        <span class="material-symbols-outlined">description</span>
        <span>${escapeHtml(item.fileName || item.title)}</span>
      </div>
      <div class="catalog-file-row">
        <span class="material-symbols-outlined">person</span>
        <span>Upload: ${escapeHtml(item.uploadedBy || "Channel")}</span>
      </div>
      <div class="catalog-file-row">
        <span class="material-symbols-outlined">schedule</span>
        <span>${escapeHtml(item.postedAt || "-")}</span>
      </div>
      <button type="button" class="catalog-download-button" data-title="${escapeHtml(item.title)}">
        <span class="material-symbols-outlined">download</span>
        <span>Download</span>
      </button>
    </article>
  `).join("");

  toggleElement(catalogSection, true);
}

function filterCatalogItems() {
  const keyword = (catalogSearchInput?.value || "").trim().toLowerCase();
  const sourceItems = catalogItems.filter((item) => {
    if (currentCatalogView === "BIOS" || currentCatalogView === "Boardview") {
      return item.category === currentCatalogView;
    }

    if (currentCatalogView === "tool_spi_flash") {
      return item.category === "Tools" && item.title.toLowerCase().includes("spi");
    }

    if (currentCatalogView === "tool_uefi") {
      return item.category === "Tools" && item.title.toLowerCase().includes("uefi");
    }

    if (currentCatalogView === "tool_other") {
      return item.category === "Tools" &&
        !item.title.toLowerCase().includes("spi") &&
        !item.title.toLowerCase().includes("uefi");
    }

    return false;
  });

  const filteredItems = !keyword
    ? sourceItems
    : sourceItems.filter((item) =>
        [item.title, item.deviceModel, item.description, item.category, item.fileName, item.serialNumber, item.boardCode, item.note, item.uploadedBy]
          .some((value) => value.toLowerCase().includes(keyword))
      );

  renderCatalog(filteredItems, currentCatalogView);
}

async function loadCatalog() {
  if (catalogLoaded) {
    filterCatalogItems();
    return;
  }

  const catalog = await fetchJson("/catalog");
  catalogItems = catalog.items || [];
  catalogLoaded = true;
  filterCatalogItems();
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function normalizeLocalPhoneNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  if (digits.startsWith("62")) {
    return digits.slice(2);
  }

  if (digits.startsWith("0")) {
    return digits.slice(1);
  }

  return digits;
}

function buildInternationalPhoneNumber(localPhoneNumber) {
  const normalized = normalizeLocalPhoneNumber(localPhoneNumber);
  return normalized ? `+62${normalized}` : "";
}

function loadRememberedPhone() {
  if (!phoneNumberInput || !rememberPhoneCheckbox) {
    return;
  }

  const rememberEnabled = localStorage.getItem(rememberedPhoneFlagKey) === "true";
  const rememberedPhone = localStorage.getItem(rememberedPhoneStorageKey) || "";

  rememberPhoneCheckbox.checked = rememberEnabled;
  if (rememberEnabled && rememberedPhone) {
    phoneNumberInput.value = rememberedPhone;
  }
}

function persistRememberedPhone() {
  if (!phoneNumberInput || !rememberPhoneCheckbox) {
    return;
  }

  const normalized = normalizeLocalPhoneNumber(phoneNumberInput.value);
  phoneNumberInput.value = normalized;

  if (!rememberPhoneCheckbox.checked || !normalized) {
    localStorage.removeItem(rememberedPhoneStorageKey);
    localStorage.setItem(rememberedPhoneFlagKey, String(rememberPhoneCheckbox.checked));
    return;
  }

  localStorage.setItem(rememberedPhoneFlagKey, "true");
  localStorage.setItem(rememberedPhoneStorageKey, normalized);
}

function setNotice(message, isWarning = false) {
  if (!notice) {
    return;
  }

  if (!message) {
    notice.textContent = "";
    notice.classList.add("hidden");
    notice.classList.remove("warning");
    return;
  }

  notice.textContent = message;
  notice.classList.remove("hidden");
  notice.classList.toggle("warning", isWarning);
}

function setError(message) {
  if (!errorMessage) {
    return;
  }

  if (!message) {
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
    return;
  }

  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function toggleElement(element, visible) {
  if (!element) {
    return;
  }

  element.classList.toggle("hidden", !visible);
}

function applyStatus(status) {
  setText(serviceStatus, "Terhubung");
  setError("");

  const hasChannelLink = Boolean(status.requiredChannelInviteLink);
  const showJoinChannelHint = hasChannelLink && (!status.isLoggedIn || !status.isChannelMember);
  toggleElement(joinChannelHint, showJoinChannelHint);
  toggleElement(dashboardJoinCta, status.isLoggedIn && !status.isChannelMember && hasChannelLink);

  if (hasChannelLink) {
    joinChannelLink.href = status.requiredChannelInviteLink;
    dashboardJoinLink.href = status.requiredChannelInviteLink;
  }

  const showDashboard = status.isLoggedIn;

  toggleElement(phoneForm, status.requiresPhoneNumber && !showDashboard);
  toggleElement(codeForm, status.requiresVerificationCode && !showDashboard);
  toggleElement(passwordForm, status.requiresPassword && !showDashboard);
  toggleElement(agreementPanel, status.isLoggedIn && !status.hasAgreed);
  toggleElement(dashboardPanel, showDashboard);

  if (showDashboard) {
    const displayName = status.displayName || "TeknisiHub User";
    const channelRole = status.channelRole ? ` - ${status.channelRole}` : "";
    setText(dashboardTitle, `Halo, ${displayName}`);
    setText(dashboardLoginStatus, "Login Telegram aktif");
    setText(dashboardRoleChip, status.channelRole ? `Role ${status.channelRole}` : "Akses tervalidasi");
    setText(accessDisplayName, displayName);
    setText(
      accessRole,
      status.channelRole ? `Peran channel: ${status.channelRole}` : "Peran channel belum tersedia"
    );
    setText(
      dashboardChannelStatus,
      status.isChannelMember
        ? `Membership channel valid${channelRole}`
        : "Belum join channel wajib"
    );
    setText(
      dashboardAgreementStatus,
      status.hasAgreed ? "Persetujuan tersimpan" : "Menunggu persetujuan"
    );

    if (status.isChannelMember && status.hasAgreed) {
      setText(
        dashboardSubtitle,
        "Session Telegram aktif. Dashboard siap dipakai untuk tahap katalog file dan tool lokal."
      );
      setText(accessState, "Akses penuh aktif. Katalog sudah terbuka.");
      setNotice("");
      loadCatalog().catch((error) => setNotice(error.message, true));
      return;
    }

    resetCatalog();

    if (!status.isChannelMember) {
      setText(
        dashboardSubtitle,
        "Session Telegram aktif, tetapi akses belum dibuka karena akun belum join channel yang diwajibkan."
      );
      setText(accessState, "Login aktif, tetapi membership channel belum valid.");
      setNotice("Login berhasil, tetapi akun belum tergabung di channel yang diwajibkan.", true);
      return;
    }

    setText(
      dashboardSubtitle,
      "Session Telegram aktif. Simpan persetujuan lokal untuk membuka akses dashboard penuh."
    );
    setText(accessState, "Join channel sudah valid, menunggu persetujuan lokal.");
    setText(dashboardLoginStatus, "Login Telegram aktif");
    setNotice("User sudah login lokal. Simpan persetujuan untuk membuka akses dashboard.");
    return;
  }

  resetCatalog();

  if (status.lastError) {
    setNotice(status.lastError, true);
    return;
  }

  if (status.requiresVerificationCode) {
    setNotice("Masukkan kode verifikasi Telegram yang diterima user.");
    return;
  }

  if (status.requiresPassword) {
    setNotice("Akun menggunakan 2FA. Lanjutkan dengan password Telegram.");
    return;
  }

  setNotice("Masukkan nomor Telegram untuk memulai login lewat local service.");
}

async function fetchJson(path, options = {}) {
  const requestUrl = `${serviceBaseUrl}${path}`;
  let response;

  try {
    response = await fetch(requestUrl, {
      headers: {
        "Content-Type": "application/json"
      },
      ...options
    });
  } catch (error) {
    throw new Error(`Koneksi ke local service gagal: ${error.message || "unknown error"}`);
  }

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
    throw new Error(payload.message || `Request gagal (${response.status}).`);
  }

  return payload;
}

async function refreshStatus() {
  try {
    const health = await fetchJson("/health");
    setText(serviceStatus, health.ready ? "Siap" : "Belum siap");

    const status = await fetchJson("/auth/status");
    applyStatus(status);
  } catch (error) {
    setText(serviceStatus, "Tidak aktif");
    toggleElement(joinChannelHint, false);
    toggleElement(phoneForm, true);
    toggleElement(codeForm, false);
    toggleElement(passwordForm, false);
    toggleElement(agreementPanel, false);
    toggleElement(dashboardPanel, false);
    toggleElement(dashboardJoinCta, false);
    resetCatalog();
    setError(`Koneksi ke local service gagal: ${error.message || "unknown error"}`);
    setNotice("Local service belum aktif. Jalankan TeknisiHub.LocalService dulu, lalu refresh.", true);
  }
}

phoneForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const phoneNumber = buildInternationalPhoneNumber(phoneNumberInput?.value || "");

  try {
    const result = await fetchJson("/auth/start", {
      method: "POST",
      body: JSON.stringify({ phoneNumber })
    });
    persistRememberedPhone();
    setNotice(result.message);
    await refreshStatus();
  } catch (error) {
    setNotice(error.message, true);
  }
});

codeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const verificationCode = document.getElementById("verificationCode").value.trim();

  try {
    const result = await fetchJson("/auth/code", {
      method: "POST",
      body: JSON.stringify({ verificationCode })
    });
    setNotice(result.message);
    await refreshStatus();
  } catch (error) {
    setNotice(error.message, true);
  }
});

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = document.getElementById("password").value.trim();

  try {
    const result = await fetchJson("/auth/password", {
      method: "POST",
      body: JSON.stringify({ password })
    });
    setNotice(result.message);
    await refreshStatus();
  } catch (error) {
    setNotice(error.message, true);
  }
});

agreeButton.addEventListener("click", async () => {
  try {
    const result = await fetchJson("/auth/agree", {
      method: "POST",
      body: JSON.stringify({ accepted: agreeCheckbox.checked })
    });
    setNotice(result.message);
    await refreshStatus();
  } catch (error) {
    setNotice(error.message, true);
  }
});

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      const result = await fetchJson("/auth/logout", {
        method: "POST",
        body: JSON.stringify({})
      });

      const phoneInput = document.getElementById("phoneNumber");
      const codeInput = document.getElementById("verificationCode");
      const passwordInput = document.getElementById("password");

      if (phoneInput) {
        if (rememberPhoneCheckbox?.checked) {
          phoneInput.value = localStorage.getItem(rememberedPhoneStorageKey) || "";
        } else {
          phoneInput.value = "";
        }
      }

      if (codeInput) {
        codeInput.value = "";
      }

      if (passwordInput) {
        passwordInput.value = "";
      }

      if (agreeCheckbox) {
        agreeCheckbox.checked = false;
      }

      resetCatalog();
      setNotice(result.message);
      await refreshStatus();
    } catch (error) {
      setNotice(error.message, true);
    }
  });
}

if (refreshButton) {
  refreshButton.addEventListener("click", refreshStatus);
}

if (phoneNumberInput) {
  phoneNumberInput.addEventListener("input", () => {
    phoneNumberInput.value = normalizeLocalPhoneNumber(phoneNumberInput.value);
  });
}

if (rememberPhoneCheckbox) {
  rememberPhoneCheckbox.addEventListener("change", () => {
    persistRememberedPhone();
  });
}

loadRememberedPhone();
refreshStatus();

if (catalogSearchInput) {
  catalogSearchInput.addEventListener("input", filterCatalogItems);
}

if (catalogList) {
  catalogList.addEventListener("click", (event) => {
    const button = event.target.closest(".catalog-download-button");
    if (!button) {
      return;
    }

    const title = button.getAttribute("data-title") || "item dummy";
    setNotice(`Download dummy untuk ${title} belum diimplementasikan. Tahap ini baru validasi dashboard.`, true);
  });
}

navBios?.addEventListener("click", () => {
  currentCatalogView = "BIOS";
  filterCatalogItems();
});

navBoardview?.addEventListener("click", () => {
  currentCatalogView = "Boardview";
  filterCatalogItems();
});

toolSpiFlash?.addEventListener("click", () => {
  currentCatalogView = "tool_spi_flash";
  filterCatalogItems();
});

toolUefi?.addEventListener("click", () => {
  currentCatalogView = "tool_uefi";
  filterCatalogItems();
});

toolOther?.addEventListener("click", () => {
  currentCatalogView = "tool_other";
  filterCatalogItems();
});
