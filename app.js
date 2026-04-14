const serviceBaseUrl = "http://127.0.0.1:48721";

const serviceStatus = document.getElementById("serviceStatus");
const toastContainer = document.getElementById("toastContainer");
const errorMessage = document.getElementById("errorMessage");
const joinChannelHint = document.getElementById("joinChannelHint");
const phoneForm = document.getElementById("phoneForm");
const phoneNumberInput = document.getElementById("phoneNumber");
const phoneSubmitButton = document.getElementById("phoneSubmitButton");
const rememberPhoneCheckbox = document.getElementById("rememberPhoneCheckbox");
const codeForm = document.getElementById("codeForm");
const codeSubmitButton = document.getElementById("codeSubmitButton");
const passwordForm = document.getElementById("passwordForm");
const passwordSubmitButton = document.getElementById("passwordSubmitButton");
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
const dashboardJoinRequiredCheckbox = document.getElementById("dashboardJoinRequiredCheckbox");
const dashboardJoinBoardviewCheckbox = document.getElementById("dashboardJoinBoardviewCheckbox");
const dashboardJoinButton = document.getElementById("dashboardJoinButton");
const dashboardJoinRequiredLink = document.getElementById("dashboardJoinRequiredLink");
const dashboardJoinBoardviewLink = document.getElementById("dashboardJoinBoardviewLink");
const catalogSection = document.getElementById("catalogSection");
const catalogCount = document.getElementById("catalogCount");
const catalogList = document.getElementById("catalogList");
const catalogEyebrow = document.getElementById("catalogEyebrow");
const catalogTitle = document.getElementById("catalogTitle");
const catalogSubtitle = document.getElementById("catalogSubtitle");
const catalogSearchInput = document.getElementById("catalogSearchInput");
const catalogChannelLink = document.getElementById("catalogChannelLink");
const catalogUploadButton = document.getElementById("catalogUploadButton");
const catalogPagination = document.getElementById("catalogPagination");
const catalogLoadMoreButton = document.getElementById("catalogLoadMoreButton");
const catalogEditorModal = document.getElementById("catalogEditorModal");
const catalogEditorTitle = document.getElementById("catalogEditorTitle");
const catalogEditorCloseButton = document.getElementById("catalogEditorCloseButton");
const catalogEditorForm = document.getElementById("catalogEditorForm");
const catalogEditorMessageId = document.getElementById("catalogEditorMessageId");
const catalogEditorFile = document.getElementById("catalogEditorFile");
const catalogEditorDeviceModel = document.getElementById("catalogEditorDeviceModel");
const catalogEditorSerialNumber = document.getElementById("catalogEditorSerialNumber");
const catalogEditorBoardCode = document.getElementById("catalogEditorBoardCode");
const catalogEditorNote = document.getElementById("catalogEditorNote");
const catalogEditorSubmitButton = document.getElementById("catalogEditorSubmitButton");
const navBios = document.getElementById("navBios");
const navBoardview = document.getElementById("navBoardview");
const toolSpiFlash = document.getElementById("toolSpiFlash");
const toolUefi = document.getElementById("toolUefi");
const toolOther = document.getElementById("toolOther");

let catalogLoaded = false;
let catalogItems = [];
let catalogCache = [];
let currentCatalogView = "BIOS";
let currentChannelRole = "";
let currentBiosChannelRole = "";
let currentBoardviewChannelRole = "";
let currentRequiredChannelLink = "";
let currentBoardviewChannelLink = "";
let catalogSearchDebounceId = 0;
let catalogEditorMode = "upload";
const rememberedPhoneStorageKey = "teknisihub_remembered_phone";
const rememberedPhoneFlagKey = "teknisihub_remember_phone_enabled";
const allowedBiosExtensions = [".bin", ".rom", ".cap", ".img", ".fd", ".bio", ".wph", ".efi", ".hdr"];
const allowedBoardviewExtensions = [".brd", ".bdv", ".boardview", ".fz", ".cad", ".tvw", ".asc"];

const boardviewChannelLink = "https://t.me/+0oa9XOhoXZExNDNl";

const telegramCatalogConfigs = {
  BIOS: {
    displayName: "BIOS",
    uploadLabel: "Upload BIOS",
    editTitle: "Edit Metadata BIOS",
    fileLabel: "File BIOS",
    fileAccept: allowedBiosExtensions.join(","),
    invalidExtensionMessage: "Format file BIOS harus salah satu dari: .bin, .rom, .cap, .img, .fd, .bio, .wph, .efi, .hdr.",
    endpoint: "bios",
    channelLink: null
  },
  Boardview: {
    displayName: "Boardview",
    uploadLabel: "Upload Boardview",
    editTitle: "Edit Metadata Boardview",
    fileLabel: "File Boardview",
    fileAccept: allowedBoardviewExtensions.join(","),
    invalidExtensionMessage: "Format file Boardview harus salah satu dari: .brd, .bdv, .boardview, .fz, .cad, .tvw, .asc.",
    endpoint: "boardview",
    channelLink: boardviewChannelLink
  }
};

const telegramCatalogState = {
  BIOS: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false },
  Boardview: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false }
};

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
  catalogCache = [];
  currentChannelRole = "";
  currentBiosChannelRole = "";
  currentBoardviewChannelRole = "";
  currentRequiredChannelLink = "";
  currentBoardviewChannelLink = "";
  telegramCatalogState.BIOS.requestToken = 0;
  telegramCatalogState.BIOS.hasMore = false;
  telegramCatalogState.BIOS.nextOffset = 0;
  telegramCatalogState.BIOS.loadingMore = false;
  telegramCatalogState.Boardview.requestToken = 0;
  telegramCatalogState.Boardview.hasMore = false;
  telegramCatalogState.Boardview.nextOffset = 0;
  telegramCatalogState.Boardview.loadingMore = false;
  catalogEditorMode = "upload";
  if (catalogSearchDebounceId) {
    clearTimeout(catalogSearchDebounceId);
    catalogSearchDebounceId = 0;
  }
  if (catalogCount) {
    catalogCount.textContent = "0 item";
  }

  if (catalogList) {
    catalogList.innerHTML = "";
  }

  toggleElement(catalogPagination, false);

  if (catalogSearchInput) {
    catalogSearchInput.value = "";
  }

  toggleElement(catalogSection, false);
  toggleElement(catalogUploadButton, false);
  toggleElement(catalogEditorModal, false);
}

function isOwnerRole() {
  const activeRole = currentCatalogView === "Boardview" ? currentBoardviewChannelRole : currentBiosChannelRole;
  return activeRole.toLowerCase() === "owner";
}

function canManageBiosCatalog() {
  const normalizedRole = (currentCatalogView === "Boardview" ? currentBoardviewChannelRole : currentBiosChannelRole).toLowerCase();
  return normalizedRole === "owner" || normalizedRole === "admin";
}

function isTelegramCatalogView(viewKey = currentCatalogView) {
  return viewKey === "BIOS" || viewKey === "Boardview";
}

function getTelegramCatalogConfig(viewKey = currentCatalogView) {
  return telegramCatalogConfigs[viewKey] || telegramCatalogConfigs.BIOS;
}

function getTelegramCatalogState(viewKey = currentCatalogView) {
  return telegramCatalogState[viewKey] || telegramCatalogState.BIOS;
}

function getDisplayRoleForView(viewKey = currentCatalogView) {
  if (viewKey === "Boardview") {
    return currentBoardviewChannelRole || currentChannelRole;
  }

  if (viewKey === "BIOS") {
    return currentBiosChannelRole || currentChannelRole;
  }

  return currentChannelRole;
}

function updateCatalogToolbar(viewKey = currentCatalogView) {
  const canManage = isTelegramCatalogView(viewKey) && canManageBiosCatalog();
  toggleElement(catalogUploadButton, canManage);

  if (!catalogUploadButton) {
    return;
  }

  const config = getTelegramCatalogConfig(viewKey);
  catalogUploadButton.innerHTML = `
    <span class="material-symbols-outlined">upload_file</span>
    <span>${escapeHtml(config.uploadLabel)}</span>
  `;
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
    setText(catalogEyebrow, "BIOS Telegram");
    setText(catalogTitle, "File BIOS");
    setText(catalogSubtitle, "");
    if (catalogSearchInput) {
      catalogSearchInput.placeholder = "Cari file BIOS lalu tekan Enter...";
    }
    toggleElement(catalogChannelLink, false);
    updateCatalogToolbar(viewKey);
    return;
  }

  if (viewKey === "Boardview") {
    setText(catalogEyebrow, "Boardview Telegram");
    setText(catalogTitle, "File Boardview");
    setText(catalogSubtitle, "");
    if (catalogSearchInput) {
      catalogSearchInput.placeholder = "Cari file boardview lalu tekan Enter...";
    }
    catalogChannelLink.href = boardviewChannelLink;
    toggleElement(catalogChannelLink, true);
    updateCatalogToolbar(viewKey);
    return;
  }

  const toolConfig = toolViewMap[viewKey];
  setText(catalogEyebrow, toolConfig.eyebrow);
  setText(catalogTitle, toolConfig.title);
  setText(catalogSubtitle, toolConfig.subtitle);
  if (catalogSearchInput) {
    catalogSearchInput.placeholder = "Cari file atau tool...";
  }
  toggleElement(catalogChannelLink, false);
  updateCatalogToolbar(viewKey);
}

function renderCatalog(items, viewKey = currentCatalogView) {
  if (!catalogList || !catalogCount) {
    return;
  }

  updateCatalogHeader(viewKey);
  setActiveNav(viewKey);
  catalogCount.textContent = `${items.length} item`;
  const paginationState = getTelegramCatalogState(viewKey);
  toggleElement(catalogPagination, isTelegramCatalogView(viewKey) && paginationState.hasMore && items.length > 0);

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
        <span class="catalog-access">${escapeHtml(getDisplayRoleForView(viewKey) || item.accessLevel)}</span>
      </div>
      <h4>${escapeHtml(item.title)}</h4>
     
      ${item.description ? `<p class="catalog-description">${escapeHtml(item.description)}</p>` : ""}
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
      ${item.uploadedBy ? `
      <div class="catalog-file-row">
        <span class="material-symbols-outlined">person</span>
        <span>${escapeHtml(item.uploadedBy)}</span>
      </div>` : ""}
      <div class="catalog-file-row">
        <span class="material-symbols-outlined">schedule</span>
        <span>${escapeHtml(item.postedAt || "-")}</span>
      </div>
      <div class="catalog-card-actions">
        <button
          type="button"
          class="catalog-download-button"
          data-title="${escapeHtml(item.title)}"
          data-category="${escapeHtml(item.category)}"
          data-message-id="${item.messageId || ""}">
          <span class="material-symbols-outlined">download</span>
          <span>Download</span>
        </button>
        ${isTelegramCatalogView(viewKey) && canManageBiosCatalog() && item.messageId ? `
        <button
          type="button"
          class="catalog-action-button ghost catalog-edit-button"
          data-message-id="${item.messageId}">
          <span class="material-symbols-outlined">edit</span>
          <span>Edit</span>
        </button>` : ""}
        ${isTelegramCatalogView(viewKey) && isOwnerRole() && item.messageId ? `
        <button
          type="button"
          class="catalog-action-button ghost catalog-delete-button"
          data-message-id="${item.messageId}">
          <span class="material-symbols-outlined">delete</span>
          <span>Hapus</span>
        </button>` : ""}
      </div>
    </article>
  `).join("");

  toggleElement(catalogSection, true);
}

function findCatalogItemByMessageId(messageId) {
  return catalogItems.find((item) => Number(item.messageId) === Number(messageId));
}

function openCatalogEditor(mode, item = null) {
  catalogEditorMode = mode;
  toggleElement(catalogEditorModal, true);
  if (!catalogEditorTitle || !catalogEditorSubmitButton) {
    return;
  }

  const targetCategory = item?.category || currentCatalogView;
  const config = getTelegramCatalogConfig(targetCategory);
  const isEditMode = mode === "edit";
  setText(catalogEditorTitle, isEditMode ? config.editTitle : config.uploadLabel);
  catalogEditorMessageId.value = isEditMode && item ? String(item.messageId || "") : "";
  catalogEditorDeviceModel.value = item?.deviceModel === "-" ? "" : (item?.deviceModel || "");
  catalogEditorSerialNumber.value = item?.serialNumber === "-" ? "" : (item?.serialNumber || "");
  catalogEditorBoardCode.value = item?.boardCode === "-" ? "" : (item?.boardCode || "");
  catalogEditorNote.value = item?.note === "-" ? "" : (item?.note || "");
  if (catalogEditorFile) {
    catalogEditorFile.value = "";
    catalogEditorFile.disabled = isEditMode;
    catalogEditorFile.required = !isEditMode;
    catalogEditorFile.accept = config.fileAccept;
  }

  const modalLabel = document.getElementById("catalogEditorLabel");
  const fileLabel = document.getElementById("catalogEditorFileLabel");
  if (modalLabel) {
    modalLabel.textContent = `${config.displayName} Telegram`;
  }
  if (fileLabel) {
    fileLabel.textContent = config.fileLabel;
  }

  catalogEditorSubmitButton.innerHTML = isEditMode
    ? `<span class="material-symbols-outlined">save</span><span>Simpan Perubahan</span>`
    : `<span class="material-symbols-outlined">upload_file</span><span>${escapeHtml(config.uploadLabel)}</span>`;
}

function closeCatalogEditor() {
  toggleElement(catalogEditorModal, false);
  catalogEditorMode = "upload";
  if (catalogEditorForm) {
    catalogEditorForm.reset();
  }
  if (catalogEditorFile) {
    catalogEditorFile.disabled = false;
    catalogEditorFile.required = false;
  }
}

function filterCatalogItems() {
  const keyword = (catalogSearchInput?.value || "").trim().toLowerCase();
  const sourceCollection = isTelegramCatalogView(currentCatalogView) ? catalogItems : catalogCache;
  const sourceItems = sourceCollection.filter((item) => {
    if (isTelegramCatalogView(currentCatalogView)) {
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

  const filteredItems = isTelegramCatalogView(currentCatalogView)
    ? sourceItems
    : !keyword
    ? sourceItems
    : sourceItems.filter((item) =>
        [item.title, item.deviceModel, item.description, item.category, item.fileName, item.serialNumber, item.boardCode, item.note, item.uploadedBy]
          .some((value) => value.toLowerCase().includes(keyword))
      );

  renderCatalog(filteredItems, currentCatalogView);
}

async function loadBaseCatalog() {
  if (catalogLoaded) {
    return;
  }

  const catalog = await fetchJson("/catalog");
  catalogCache = catalog.items || [];
  catalogLoaded = true;
}

async function loadTelegramCatalog(viewKey = currentCatalogView) {
  const state = getTelegramCatalogState(viewKey);
  const query = (catalogSearchInput?.value || "").trim();
  const requestToken = ++state.requestToken;
  state.loadingMore = false;
  state.nextOffset = 0;
  const path = `/catalog?category=${encodeURIComponent(viewKey)}&limit=5${query ? `&query=${encodeURIComponent(query)}` : ""}`;
  const catalog = await fetchJson(path);

  if (requestToken !== state.requestToken) {
    return;
  }

  catalogItems = catalog.items || [];
  state.hasMore = Boolean(catalog.hasMore);
  state.nextOffset = Number(catalog.nextOffset || catalogItems.length || 0);
}

async function loadMoreTelegramCatalog(viewKey = currentCatalogView) {
  const state = getTelegramCatalogState(viewKey);
  if (!state.hasMore || state.loadingMore) {
    return;
  }

  const query = (catalogSearchInput?.value || "").trim();
  const requestToken = ++state.requestToken;
  state.loadingMore = true;
  if (catalogLoadMoreButton) {
    catalogLoadMoreButton.disabled = true;
  }

  try {
    const path = `/catalog?category=${encodeURIComponent(viewKey)}&limit=5&offset=${state.nextOffset}${query ? `&query=${encodeURIComponent(query)}` : ""}`;
    const catalog = await fetchJson(path);

    if (requestToken !== state.requestToken) {
      return;
    }

    catalogItems = [...catalogItems, ...(catalog.items || [])];
    state.hasMore = Boolean(catalog.hasMore);
    state.nextOffset = Number(catalog.nextOffset || catalogItems.length || 0);
    filterCatalogItems();
  } finally {
    state.loadingMore = false;
    if (catalogLoadMoreButton) {
      catalogLoadMoreButton.disabled = false;
    }
  }
}

async function loadCatalog() {
  if (isTelegramCatalogView(currentCatalogView)) {
    await loadTelegramCatalog(currentCatalogView);
    filterCatalogItems();
    return;
  }

  await loadBaseCatalog();
  catalogItems = catalogCache;
  filterCatalogItems();
}

function queueCatalogSearch() {
  if (!catalogSearchInput) {
    return;
  }

  if (catalogSearchDebounceId) {
    clearTimeout(catalogSearchDebounceId);
    catalogSearchDebounceId = 0;
  }

  if (!isTelegramCatalogView(currentCatalogView)) {
    filterCatalogItems();
    return;
  }

  loadCatalog().catch((error) => setNotice(error.message, true));
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setButtonLoading(button, loading, defaultIcon, defaultLabel, loadingLabel) {
  if (!button) {
    return;
  }

  button.disabled = loading;
  button.innerHTML = loading
    ? `
      <span class="material-symbols-outlined is-spinning">progress_activity</span>
      <span>${escapeHtml(loadingLabel)}</span>
    `
    : `
      <span class="material-symbols-outlined">${escapeHtml(defaultIcon)}</span>
      <span>${escapeHtml(defaultLabel)}</span>
    `;
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
  if (!toastContainer) {
    return;
  }

  if (!message) {
    toastContainer.innerHTML = "";
    return;
  }

  const tone = isWarning ? "warning" : "success";
  const icon = isWarning ? "warning" : "check_circle";
  const toast = document.createElement("div");
  toast.className = `toast is-${tone}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined toast-icon">${icon}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button type="button" class="toast-close" aria-label="Tutup pesan">
      <span class="material-symbols-outlined">close</span>
    </button>
  `;

  const dismissToast = () => {
    if (!toast.isConnected) {
      return;
    }

    toast.classList.add("is-leaving");
    window.setTimeout(() => {
      toast.remove();
    }, 180);
  };

  toast.querySelector(".toast-close")?.addEventListener("click", dismissToast);
  toastContainer.prepend(toast);
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

  const hasRequiredLink = Boolean(status.requiredChannelInviteLink);
  const hasBoardviewLink = Boolean(status.boardviewChannelInviteLink);
  const hasJoinOption = hasRequiredLink || hasBoardviewLink;
  const showJoinChannelHint = hasJoinOption && !status.isLoggedIn;
  toggleElement(joinChannelHint, showJoinChannelHint);
  toggleElement(dashboardJoinCta, status.isLoggedIn && !status.isChannelMember && hasJoinOption);

  const showDashboard = status.isLoggedIn;

  toggleElement(phoneForm, status.requiresPhoneNumber && !showDashboard);
  toggleElement(codeForm, status.requiresVerificationCode && !showDashboard);
  toggleElement(passwordForm, status.requiresPassword && !showDashboard);
  toggleElement(agreementPanel, status.isLoggedIn && !status.hasAgreed);
  toggleElement(dashboardPanel, showDashboard);

  if (showDashboard) {
    const displayName = status.displayName || "TeknisiHub User";
    const channelRole = status.channelRole ? ` - ${status.channelRole}` : "";
    const biosRole = status.biosChannelRole || status.channelRole || "-";
    const boardviewRole = status.boardviewChannelRole || "-";
    currentChannelRole = status.channelRole || "";
    currentBiosChannelRole = status.biosChannelRole || status.channelRole || "";
    currentBoardviewChannelRole = status.boardviewChannelRole || "";
    currentRequiredChannelLink = status.requiredChannelInviteLink || "";
    currentBoardviewChannelLink = status.boardviewChannelInviteLink || "";
    if (dashboardJoinRequiredCheckbox) {
      dashboardJoinRequiredCheckbox.checked = Boolean(status.isRequiredChannelMember);
      dashboardJoinRequiredCheckbox.disabled = !hasRequiredLink || Boolean(status.isRequiredChannelMember);
    }
    if (dashboardJoinBoardviewCheckbox) {
      dashboardJoinBoardviewCheckbox.checked = Boolean(status.isBoardviewChannelMember);
      dashboardJoinBoardviewCheckbox.disabled = !hasBoardviewLink || Boolean(status.isBoardviewChannelMember);
    }
    if (dashboardJoinRequiredLink) {
      dashboardJoinRequiredLink.href = currentRequiredChannelLink || "#";
      toggleElement(dashboardJoinRequiredLink, hasRequiredLink);
    }
    if (dashboardJoinBoardviewLink) {
      dashboardJoinBoardviewLink.href = currentBoardviewChannelLink || "#";
      toggleElement(dashboardJoinBoardviewLink, hasBoardviewLink);
    }
    setText(dashboardTitle, `Halo, ${displayName}`);
    setText(dashboardLoginStatus, "Login Telegram aktif");
    setText(dashboardRoleChip, `BIOS ${biosRole} | Boardview ${boardviewRole}`);
    setText(accessDisplayName, displayName);
    setText(
      accessRole,
      `Role BIOS: ${biosRole} | Peran channel Boardview: ${boardviewRole}`
    );
    setText(
      dashboardChannelStatus,
      status.isChannelMember
        ? `Membership channel valid${channelRole}`
        : "Belum join channel akses"
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
        "Session Telegram aktif, tetapi akses belum dibuka karena akun belum tergabung di salah satu channel akses."
      );
      setText(accessState, "Login aktif, pilih minimal satu channel lalu klik gabung.");
      setNotice("Login berhasil, tetapi akun belum tergabung di salah satu channel akses.", true);
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

  currentChannelRole = "";
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
  const isFormDataBody = options.body instanceof FormData;
  const headers = isFormDataBody
    ? {}
    : {
        "Content-Type": "application/json"
      };

  try {
    response = await fetch(requestUrl, {
      headers,
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
    const validationErrors = payload.errors && typeof payload.errors === "object"
      ? Object.values(payload.errors).flat().join(" ")
      : "";
    throw new Error(
      payload.message ||
      payload.title ||
      validationErrors ||
      `Request gagal (${response.status}).`
    );
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

async function submitCatalogEditor() {
  const config = getTelegramCatalogConfig();
  const payload = {
    deviceModel: catalogEditorDeviceModel?.value.trim() || "",
    serialNumber: catalogEditorSerialNumber?.value.trim() || "",
    boardCode: catalogEditorBoardCode?.value.trim() || "",
    note: catalogEditorNote?.value.trim() || ""
  };

  if (!payload.deviceModel || !payload.serialNumber || !payload.boardCode || !payload.note) {
    throw new Error(`Semua field metadata ${config.displayName} wajib diisi sebelum submit.`);
  }

  if (catalogEditorMode === "edit") {
    const messageId = Number(catalogEditorMessageId?.value || 0);
    const result = await fetchJson(`/catalog/${config.endpoint}/${messageId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    setNotice(result.message);
    closeCatalogEditor();
    await loadCatalog();
    return;
  }

  if (!catalogEditorFile?.files?.length) {
    throw new Error(`Pilih file ${config.displayName} dulu sebelum upload.`);
  }

  const selectedFile = catalogEditorFile.files[0];
  const lowerFileName = selectedFile.name.toLowerCase();
  const allowedExtensions = config.endpoint === "boardview" ? allowedBoardviewExtensions : allowedBiosExtensions;
  const hasAllowedExtension = allowedExtensions.some((extension) => lowerFileName.endsWith(extension));
  if (!hasAllowedExtension) {
    throw new Error(config.invalidExtensionMessage);
  }

  const formData = new FormData();
  formData.set("file", selectedFile);
  formData.set("deviceModel", payload.deviceModel);
  formData.set("serialNumber", payload.serialNumber);
  formData.set("boardCode", payload.boardCode);
  formData.set("note", payload.note);

  const result = await fetchJson(`/catalog/${config.endpoint}`, {
    method: "POST",
    body: formData
  });

  setNotice(result.message);
  closeCatalogEditor();
  await loadCatalog();
}

async function deleteCatalogItem(category, messageId) {
  const config = getTelegramCatalogConfig(category);
  const result = await fetchJson(`/catalog/${config.endpoint}/${messageId}`, {
    method: "DELETE"
  });
  setNotice(result.message);
  await loadCatalog();
}

async function downloadCatalogItem(category, messageId) {
  const config = getTelegramCatalogConfig(category);
  const result = await fetchJson(`/catalog/${config.endpoint}/${messageId}/download`, {
    method: "POST",
    body: JSON.stringify({})
  });
  setNotice(result.message);
}

async function joinSelectedChannels() {
  const joinRequiredChannel = Boolean(dashboardJoinRequiredCheckbox?.checked && !dashboardJoinRequiredCheckbox.disabled);
  const joinBoardviewChannel = Boolean(dashboardJoinBoardviewCheckbox?.checked && !dashboardJoinBoardviewCheckbox.disabled);

  if (!joinRequiredChannel && !joinBoardviewChannel) {
    setNotice("Pilih minimal satu channel sebelum melanjutkan.", true);
    return;
  }

  setButtonLoading(
    dashboardJoinButton,
    true,
    "group_add",
    "Gabung channel terpilih",
    "Sedang gabung..."
  );

  try {
    const result = await fetchJson("/auth/join-channels", {
      method: "POST",
      body: JSON.stringify({
        joinRequiredChannel,
        joinBoardviewChannel
      })
    });
    setNotice(result.message);
    await refreshStatus();
  } catch (error) {
    setNotice(error.message, true);
  } finally {
    setButtonLoading(
      dashboardJoinButton,
      false,
      "group_add",
      "Gabung channel terpilih",
      "Sedang gabung..."
    );
  }
}

phoneForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const phoneNumber = buildInternationalPhoneNumber(phoneNumberInput?.value || "");
  setButtonLoading(phoneSubmitButton, true, "send_to_mobile", "Minta kode login", "Meminta kode...");

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
  } finally {
    setButtonLoading(phoneSubmitButton, false, "send_to_mobile", "Minta kode login", "Meminta kode...");
  }
});

codeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const verificationCode = document.getElementById("verificationCode").value.trim();
  setButtonLoading(codeSubmitButton, true, "password", "Kirim kode", "Mengirim kode...");

  try {
    const result = await fetchJson("/auth/code", {
      method: "POST",
      body: JSON.stringify({ verificationCode })
    });
    setNotice(result.message);
    await refreshStatus();
  } catch (error) {
    setNotice(error.message, true);
  } finally {
    setButtonLoading(codeSubmitButton, false, "password", "Kirim kode", "Mengirim kode...");
  }
});

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = document.getElementById("password").value.trim();
  setButtonLoading(passwordSubmitButton, true, "lock_open_right", "Selesaikan login", "Memverifikasi...");

  try {
    const result = await fetchJson("/auth/password", {
      method: "POST",
      body: JSON.stringify({ password })
    });
    setNotice(result.message);
    await refreshStatus();
  } catch (error) {
    setNotice(error.message, true);
  } finally {
    setButtonLoading(passwordSubmitButton, false, "lock_open_right", "Selesaikan login", "Memverifikasi...");
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

dashboardJoinButton?.addEventListener("click", joinSelectedChannels);

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
  catalogSearchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    queueCatalogSearch();
  });
}

if (catalogList) {
  catalogList.addEventListener("click", async (event) => {
    const button = event.target.closest(".catalog-download-button");
    if (button) {
      const title = button.getAttribute("data-title") || "item dummy";
      const category = button.getAttribute("data-category") || "";
      const messageId = Number(button.getAttribute("data-message-id") || 0);
      if (isTelegramCatalogView(category) && messageId > 0) {
        const config = getTelegramCatalogConfig(category);
        const previousMarkup = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
          <span class="material-symbols-outlined is-spinning">progress_activity</span>
          <span>Downloading...</span>
        `;
        setNotice(`Pilih folder tujuan di dialog Windows yang muncul, lalu tunggu proses download dan extract ${config.displayName} selesai.`);

        try {
          await downloadCatalogItem(category, messageId);
        } catch (error) {
          setNotice(error.message, true);
        } finally {
          button.disabled = false;
          button.innerHTML = previousMarkup;
        }
        return;
      }

      setNotice(`Download dummy untuk ${title} belum diimplementasikan. Tahap ini baru validasi dashboard.`, true);
      return;
    }

    const editButton = event.target.closest(".catalog-edit-button");
    if (editButton) {
      const item = findCatalogItemByMessageId(Number(editButton.getAttribute("data-message-id")));
      if (item) {
        openCatalogEditor("edit", item);
      }
      return;
    }

    const deleteButton = event.target.closest(".catalog-delete-button");
    if (!deleteButton) {
      return;
    }

    const messageId = Number(deleteButton.getAttribute("data-message-id"));
    const item = findCatalogItemByMessageId(messageId);
    const displayName = item?.category || currentCatalogView;
    const confirmed = window.confirm(`Hapus posting ${displayName} ini dari channel Telegram?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteCatalogItem(displayName, messageId);
    } catch (error) {
      setNotice(error.message, true);
    }
  });
}

if (catalogLoadMoreButton) {
  catalogLoadMoreButton.addEventListener("click", async () => {
    const previousLabel = catalogLoadMoreButton.innerHTML;
    catalogLoadMoreButton.innerHTML = `
      <span class="material-symbols-outlined">progress_activity</span>
      <span>Memuat...</span>
    `;

    try {
      await loadMoreTelegramCatalog(currentCatalogView);
    } catch (error) {
      setNotice(error.message, true);
    } finally {
      catalogLoadMoreButton.innerHTML = previousLabel;
    }
  });
}

catalogUploadButton?.addEventListener("click", () => {
  openCatalogEditor("upload");
});

catalogEditorCloseButton?.addEventListener("click", closeCatalogEditor);

catalogEditorModal?.addEventListener("click", (event) => {
  if (event.target === catalogEditorModal) {
    closeCatalogEditor();
  }
});

catalogEditorForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const previousMarkup = catalogEditorSubmitButton?.innerHTML || "";
  if (catalogEditorSubmitButton) {
    catalogEditorSubmitButton.disabled = true;
    catalogEditorSubmitButton.innerHTML = `
      <span class="material-symbols-outlined">progress_activity</span>
      <span>Memproses...</span>
    `;
  }

  try {
    await submitCatalogEditor();
  } catch (error) {
    setNotice(error.message, true);
  } finally {
    if (catalogEditorSubmitButton) {
      catalogEditorSubmitButton.disabled = false;
      catalogEditorSubmitButton.innerHTML = previousMarkup;
    }
  }
});

navBios?.addEventListener("click", () => {
  currentCatalogView = "BIOS";
  loadCatalog().catch((error) => setNotice(error.message, true));
});

navBoardview?.addEventListener("click", () => {
  currentCatalogView = "Boardview";
  loadCatalog().catch((error) => setNotice(error.message, true));
});

toolSpiFlash?.addEventListener("click", () => {
  currentCatalogView = "tool_spi_flash";
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolUefi?.addEventListener("click", () => {
  currentCatalogView = "tool_uefi";
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolOther?.addEventListener("click", () => {
  currentCatalogView = "tool_other";
  catalogItems = catalogCache;
  filterCatalogItems();
});
