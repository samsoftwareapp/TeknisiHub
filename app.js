const serviceBaseUrl = "http://127.0.0.1:48721";

const serviceStatus = document.getElementById("serviceStatus");
const serviceVersion = document.getElementById("serviceVersion");
const downloadLocalServiceLink = document.getElementById("downloadLocalServiceLink");
const serviceUpdateNotice = document.getElementById("serviceUpdateNotice");
const mainPanel = document.getElementById("mainPanel");
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
const channelJoinPanel = document.getElementById("channelJoinPanel");
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
const dashboardJoinRequiredCheckbox = document.getElementById("dashboardJoinRequiredCheckbox");
const dashboardJoinBoardviewCheckbox = document.getElementById("dashboardJoinBoardviewCheckbox");
const dashboardJoinButton = document.getElementById("dashboardJoinButton");
const spiFlashWorkbench = document.getElementById("spiFlashWorkbench");
const catalogSection = document.getElementById("catalogSection");
const catalogCount = document.getElementById("catalogCount");
const catalogList = document.getElementById("catalogList");
const catalogEyebrow = document.getElementById("catalogEyebrow");
const catalogTitle = document.getElementById("catalogTitle");
const catalogSubtitle = document.getElementById("catalogSubtitle");
const catalogSearchInput = document.getElementById("catalogSearchInput");
const catalogUploadButton = document.getElementById("catalogUploadButton");
const catalogRefreshButton = document.getElementById("catalogRefreshButton");
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
const navTools = document.getElementById("navTools");
const toolSpiFlash = document.getElementById("toolSpiFlash");
const toolUefi = document.getElementById("toolUefi");
const toolOther = document.getElementById("toolOther");
const defaultDownloadLocalServiceUrl = downloadLocalServiceLink?.getAttribute("href") || "";
const defaultDownloadLocalServiceLabel = downloadLocalServiceLink?.textContent?.trim() || "Download local service";

const spiFlashPage = window.teknisiHubPages?.spiFlash || {
  viewKey: "tool_spi_flash",
  eyebrow: "Tools Local",
  title: "SPI Flash",
  subtitle: "Utility lokal untuk kebutuhan SPI Flash.",
  items: [],
  mount() {},
  setVisible() {},
  refresh() {}
};

let catalogLoaded = false;
let catalogItems = [];
let catalogCache = [];
let currentCatalogView = spiFlashPage.viewKey;
let currentChannelRole = "";
let currentBiosChannelRole = "";
let currentBoardviewChannelRole = "";
let catalogSearchDebounceId = 0;
let catalogEditorMode = "upload";
let catalogRefreshLoading = false;
let catalogRefreshCooldownUntil = 0;
let catalogRefreshCooldownTimerId = 0;
const rememberedPhoneStorageKey = "teknisihub_remembered_phone";
const rememberedPhoneFlagKey = "teknisihub_remember_phone_enabled";
const catalogRefreshCooldownMs = 15000;
const allowedBiosExtensions = [".bin", ".rom", ".cap", ".img", ".fd", ".bio", ".wph", ".efi", ".hdr"];
const allowedBoardviewExtensions = [".brd", ".bdv", ".boardview", ".fz", ".cad", ".tvw", ".asc"];
const localToolCatalog = [
  ...spiFlashPage.items,
  {
    id: "tool-uefi-editor",
    category: "Tools",
    title: "UEFI Tools Pack",
    deviceModel: "Universal",
    description: "Paket utilitas lokal untuk analisa struktur firmware UEFI, extract volume, dan pemeriksaan region.",
    accessLevel: "Member",
    fileName: "uefi-tools-pack.zip",
    serialNumber: "-",
    boardCode: "UEFI",
    note: "Dummy tools entry",
    postedAt: "Local Tool",
    uploadedBy: "TeknisiHub Local"
  },
  {
    id: "tool-cleaner-suite",
    category: "Tools",
    title: "Maintenance Helper Suite",
    deviceModel: "Universal",
    description: "Bundle utilitas lokal tambahan untuk kebutuhan maintenance dan servis umum.",
    accessLevel: "Member",
    fileName: "maintenance-helper-suite.zip",
    serialNumber: "-",
    boardCode: "TOOLS",
    note: "Dummy tools entry",
    postedAt: "Local Tool",
    uploadedBy: "TeknisiHub Local"
  }
];

spiFlashPage.mount?.({
  container: spiFlashWorkbench,
  notify: (message) => setNotice(message)
});

const telegramCatalogConfigs = {
  BIOS: {
    displayName: "BIOS",
    uploadLabel: "Upload BIOS",
    editTitle: "Edit Metadata BIOS",
    fileLabel: "File BIOS",
    fileAccept: allowedBiosExtensions.join(","),
    invalidExtensionMessage: "Format file BIOS harus salah satu dari: .bin, .rom, .cap, .img, .fd, .bio, .wph, .efi, .hdr.",
    endpoint: "bios"
  },
  Boardview: {
    displayName: "Boardview",
    uploadLabel: "Upload Boardview",
    editTitle: "Edit Metadata Boardview",
    fileLabel: "File Boardview",
    fileAccept: allowedBoardviewExtensions.join(","),
    invalidExtensionMessage: "Format file Boardview harus salah satu dari: .brd, .bdv, .boardview, .fz, .cad, .tvw, .asc.",
    endpoint: "boardview"
  }
};

const telegramCatalogState = {
  BIOS: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false },
  Boardview: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false }
};

const toolViewMap = {
  tool_spi_flash: {
    eyebrow: spiFlashPage.eyebrow,
    title: spiFlashPage.title,
    subtitle: spiFlashPage.subtitle,
    channelLink: null
  },
  tool_uefi: {
    eyebrow: "Tools Local",
    title: "UEFI Tools",
    subtitle: "Utility lokal untuk analisa image UEFI, region, dan struktur firmware tanpa request ke Telegram.",
    channelLink: null
  },
  tool_other: {
    eyebrow: "Tools Local",
    title: "Tools Lainnya",
    subtitle: "Kumpulan utility lokal tambahan untuk kebutuhan servis dan maintenance.",
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
  hideWorkbench();

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
    if (!catalogRefreshButton) {
      return;
    }
  }

  const config = getTelegramCatalogConfig(viewKey);
  if (catalogUploadButton) {
    catalogUploadButton.innerHTML = `
      <span class="material-symbols-outlined">upload_file</span>
      <span>${escapeHtml(config.uploadLabel)}</span>
    `;
  }
  updateCatalogRefreshButton(viewKey);
}

function showWorkbenchOnly() {
  toggleElement(catalogSection, false);
  toggleElement(catalogPagination, false);
  spiFlashPage.setVisible?.(true);
  spiFlashPage.refresh?.();
}

function hideWorkbench() {
  spiFlashPage.setVisible?.(false);
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

  if (navTools) {
    navTools.open = targetKey.startsWith("tool_");
  }
}

function setNavButtonLoading(button, loading) {
  if (!button) {
    return;
  }

  button.classList.toggle("is-loading", loading);
  button.disabled = loading;

  const icon = button.querySelector(".material-symbols-outlined");
  if (!icon) {
    return;
  }

  if (loading) {
    button.dataset.originalIcon = icon.textContent.trim();
    icon.textContent = "progress_activity";
    icon.classList.add("is-spinning");
    return;
  }

  icon.textContent = button.dataset.originalIcon || icon.textContent;
  icon.classList.remove("is-spinning");
}

function updateCatalogHeader(viewKey) {
  if (!catalogEyebrow || !catalogTitle || !catalogSubtitle) {
    return;
  }

  if (viewKey === "BIOS") {
    setText(catalogEyebrow, "File BIOS");
    setText(catalogTitle, "");
    setText(catalogSubtitle, "");
    if (catalogSearchInput) {
      catalogSearchInput.placeholder = "Cari file BIOS lalu tekan Enter...";
    }
    updateCatalogToolbar(viewKey);
    return;
  }

  if (viewKey === "Boardview") {
    setText(catalogEyebrow, "File Boardview");
    setText(catalogTitle, "");
    setText(catalogSubtitle, "");
    if (catalogSearchInput) {
      catalogSearchInput.placeholder = "Cari file boardview lalu tekan Enter...";
    }
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
  updateCatalogToolbar(viewKey);
}

function renderCatalog(items, viewKey = currentCatalogView) {
  if (viewKey === spiFlashPage.viewKey) {
    setActiveNav(viewKey);
    if (catalogCount) {
      catalogCount.textContent = "SPI UI";
    }
    showWorkbenchOnly();
    return;
  }

  hideWorkbench();
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
  if (currentCatalogView === spiFlashPage.viewKey) {
    renderCatalog([], currentCatalogView);
    return;
  }

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

  catalogCache = localToolCatalog;
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
  if (currentCatalogView === spiFlashPage.viewKey) {
    renderCatalog([], currentCatalogView);
    return;
  }

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

function getCatalogRefreshRemainingMs() {
  return Math.max(0, catalogRefreshCooldownUntil - Date.now());
}

function getCatalogRefreshRemainingSeconds() {
  return Math.ceil(getCatalogRefreshRemainingMs() / 1000);
}

function updateCatalogRefreshButton(viewKey = currentCatalogView) {
  if (!catalogRefreshButton) {
    return;
  }

  const canRefresh = isTelegramCatalogView(viewKey);
  toggleElement(catalogRefreshButton, canRefresh);
  if (!canRefresh) {
    return;
  }

  const config = getTelegramCatalogConfig(viewKey);
  const remainingSeconds = getCatalogRefreshRemainingSeconds();

  if (catalogRefreshLoading) {
    catalogRefreshButton.disabled = true;
    catalogRefreshButton.innerHTML = `
      <span class="material-symbols-outlined is-spinning">progress_activity</span>
      <span>Refreshing...</span>
    `;
    return;
  }

  if (remainingSeconds > 0) {
    catalogRefreshButton.disabled = true;
    catalogRefreshButton.innerHTML = `
      <span class="material-symbols-outlined">timer</span>
      <span>Tunggu ${remainingSeconds} dtk</span>
    `;
    return;
  }

  catalogRefreshButton.disabled = false;
  catalogRefreshButton.innerHTML = `
    <span class="material-symbols-outlined">refresh</span>
    <span>Refresh ${escapeHtml(config.displayName)}</span>
  `;
}

function startCatalogRefreshCooldown() {
  catalogRefreshCooldownUntil = Date.now() + catalogRefreshCooldownMs;

  if (catalogRefreshCooldownTimerId) {
    window.clearInterval(catalogRefreshCooldownTimerId);
  }

  updateCatalogRefreshButton();
  catalogRefreshCooldownTimerId = window.setInterval(() => {
    updateCatalogRefreshButton();

    if (getCatalogRefreshRemainingMs() > 0) {
      return;
    }

    window.clearInterval(catalogRefreshCooldownTimerId);
    catalogRefreshCooldownTimerId = 0;
    updateCatalogRefreshButton();
  }, 1000);
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

function setNotice(message, toneOrWarning = false) {
  if (!toastContainer) {
    return;
  }

  if (!message) {
    toastContainer.innerHTML = "";
    return;
  }

  const tone = typeof toneOrWarning === "string"
    ? toneOrWarning
    : toneOrWarning
    ? "warning"
    : "success";
  const icon = tone === "warning"
    ? "warning"
    : tone === "info"
    ? "info"
    : "check_circle";
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

function hideInteractivePanels() {
  toggleElement(mainPanel, false);
  toggleElement(joinChannelHint, false);
  toggleElement(phoneForm, false);
  toggleElement(codeForm, false);
  toggleElement(passwordForm, false);
  toggleElement(channelJoinPanel, false);
  toggleElement(agreementPanel, false);
  toggleElement(dashboardPanel, false);
  resetCatalog();
}

function setDownloadLinkState(visible, href = defaultDownloadLocalServiceUrl, label = defaultDownloadLocalServiceLabel) {
  if (!downloadLocalServiceLink) {
    return;
  }

  downloadLocalServiceLink.href = href || defaultDownloadLocalServiceUrl;
  downloadLocalServiceLink.textContent = label || defaultDownloadLocalServiceLabel;
  toggleElement(downloadLocalServiceLink, visible);
}

function setServiceUpdateNotice(message) {
  if (!serviceUpdateNotice) {
    return;
  }

  serviceUpdateNotice.textContent = message || "";
  toggleElement(serviceUpdateNotice, Boolean(message));
}

function applyUpdateRequirement(health) {
  const update = health?.update;
  if (!update?.mustUpdate) {
    setServiceUpdateNotice("");
    return false;
  }

  const currentVersion = health?.version || "unknown";
  const latestVersion = update.latestVersion || "latest";
  const downloadUrl = update.downloadUrl || defaultDownloadLocalServiceUrl;
  const updateMessage = update.message || `Update local service ke versi ${latestVersion} untuk lanjut menggunakan TeknisiHub.`;
  const noteMessage = update.notes ? ` Catatan: ${update.notes}` : "";

  setText(serviceStatus, "Wajib update");
  setText(serviceVersion, `Versi: ${currentVersion} -> ${latestVersion}`);
  setServiceUpdateNotice(`${updateMessage}${noteMessage}`);
  setDownloadLinkState(true, downloadUrl, "Update local service");
  hideInteractivePanels();
  setError("");
  setNotice(`Local service versi ${currentVersion} harus diperbarui ke ${latestVersion} sebelum lanjut menggunakan dashboard.`, true);
  return true;
}

function applyStatus(status) {
  setText(serviceStatus, "Terhubung");
  toggleElement(mainPanel, true);
  setDownloadLinkState(false);
  setServiceUpdateNotice("");
  setError("");

  const hasRequiredLink = Boolean(status.requiredChannelInviteLink);
  const hasBoardviewLink = Boolean(status.boardviewChannelInviteLink);
  const hasJoinOption = hasRequiredLink || hasBoardviewLink;
  const hasKnownChannelAccess = Boolean(
    status.isChannelMember ||
    status.channelRole ||
    status.biosChannelRole ||
    status.boardviewChannelRole
  );
  const showJoinChannelHint = hasJoinOption && !status.isLoggedIn;
  const showJoinPanel = status.isLoggedIn && !hasKnownChannelAccess && hasJoinOption;
  const showAgreementPanel = status.isLoggedIn && hasKnownChannelAccess && !status.hasAgreed;
  const showDashboard = status.isLoggedIn && hasKnownChannelAccess && status.hasAgreed;
  toggleElement(joinChannelHint, showJoinChannelHint);

  if (dashboardJoinRequiredCheckbox) {
    dashboardJoinRequiredCheckbox.checked = Boolean(status.isRequiredChannelMember);
    dashboardJoinRequiredCheckbox.disabled = !hasRequiredLink || Boolean(status.isRequiredChannelMember);
  }
  if (dashboardJoinBoardviewCheckbox) {
    dashboardJoinBoardviewCheckbox.checked = Boolean(status.isBoardviewChannelMember);
    dashboardJoinBoardviewCheckbox.disabled = !hasBoardviewLink || Boolean(status.isBoardviewChannelMember);
  }

  toggleElement(phoneForm, status.requiresPhoneNumber && !showJoinPanel && !showAgreementPanel && !showDashboard);
  toggleElement(codeForm, status.requiresVerificationCode && !showJoinPanel && !showAgreementPanel && !showDashboard);
  toggleElement(passwordForm, status.requiresPassword && !showJoinPanel && !showAgreementPanel && !showDashboard);
  toggleElement(channelJoinPanel, showJoinPanel);
  toggleElement(agreementPanel, showAgreementPanel);
  toggleElement(dashboardPanel, showDashboard);

  if (showDashboard) {
    const displayName = status.displayName || "TeknisiHub User";
    const channelRole = status.channelRole ? ` - ${status.channelRole}` : "";
    const biosRole = status.biosChannelRole || status.channelRole || "-";
    const boardviewRole = status.boardviewChannelRole || "-";
    currentChannelRole = status.channelRole || "";
    currentBiosChannelRole = status.biosChannelRole || status.channelRole || "";
    currentBoardviewChannelRole = status.boardviewChannelRole || "";
    setText(dashboardTitle, `Halo, ${displayName}`);
    setText(dashboardLoginStatus, "Login Telegram aktif");
    setText(dashboardRoleChip, `BIOS ${biosRole} | Boardview ${boardviewRole}`);
    setText(accessDisplayName, displayName);
    setText(accessRole, `Role BIOS: ${biosRole}\nRole Boardview: ${boardviewRole}`);
    setText(
      dashboardChannelStatus,
      hasKnownChannelAccess
        ? `Membership channel valid${channelRole}`
        : "Belum join channel akses"
    );
    setText(
      dashboardAgreementStatus,
      status.hasAgreed ? "Persetujuan tersimpan" : "Menunggu persetujuan"
    );

    if (status.hasAgreed) {
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

  if (showAgreementPanel) {
    setNotice("Join channel sudah valid. Simpan persetujuan untuk membuka dashboard.", true);
    return;
  }

  if (showJoinPanel) {
    setNotice("Login berhasil. Pilih minimal satu channel lalu klik gabung untuk melanjutkan.", true);
    return;
  }

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
    setText(serviceVersion, `Versi: ${health.version || "unknown"}`);

    if (applyUpdateRequirement(health)) {
      return;
    }

    const status = await fetchJson("/auth/status");
    applyStatus(status);
  } catch (error) {
    setText(serviceStatus, "Tidak aktif");
    setText(serviceVersion, "Versi: offline");
    setServiceUpdateNotice("");
    hideInteractivePanels();
    setDownloadLinkState(true);
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

async function navigateTelegramCatalog(viewKey, button) {
  currentCatalogView = viewKey;
  setActiveNav(viewKey);
  setNavButtonLoading(button, true);

  try {
    await loadCatalog();
  } catch (error) {
    setNotice(error.message, true);
  } finally {
    setNavButtonLoading(button, false);
  }
}

async function refreshCurrentTelegramCatalog() {
  if (!catalogRefreshButton || !isTelegramCatalogView(currentCatalogView)) {
    return;
  }

  if (catalogRefreshLoading) {
    setNotice("Refresh katalog masih berjalan. Tunggu sampai selesai dulu.", "info");
    return;
  }

  const remainingSeconds = getCatalogRefreshRemainingSeconds();
  if (remainingSeconds > 0) {
    setNotice(`Refresh katalog masih dikunci. Coba lagi dalam ${remainingSeconds} detik.`, "info");
    updateCatalogRefreshButton();
    return;
  }

  const config = getTelegramCatalogConfig(currentCatalogView);
  catalogRefreshLoading = true;
  updateCatalogRefreshButton();

  try {
    const result = await fetchJson(`/catalog/refresh?category=${encodeURIComponent(currentCatalogView)}`, {
      method: "POST",
      body: JSON.stringify({})
    });
    setNotice(`${result.message} Tombol refresh akan aktif lagi dalam 15 detik.`, "info");
    await loadCatalog();
  } catch (error) {
    setNotice(error.message, true);
  } finally {
    catalogRefreshLoading = false;
    startCatalogRefreshCooldown();
  }
}

catalogUploadButton?.addEventListener("click", () => {
  openCatalogEditor("upload");
});

catalogRefreshButton?.addEventListener("click", refreshCurrentTelegramCatalog);

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
  navigateTelegramCatalog("BIOS", navBios);
});

navBoardview?.addEventListener("click", () => {
  navigateTelegramCatalog("Boardview", navBoardview);
});

toolSpiFlash?.addEventListener("click", () => {
  currentCatalogView = spiFlashPage.viewKey;
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
