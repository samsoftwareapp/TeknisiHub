const serviceBaseUrl = "http://127.0.0.1:48721";

const serviceStatus = document.getElementById("serviceStatus");
const serviceVersion = document.getElementById("serviceVersion");
const downloadLocalServiceLink = document.getElementById("downloadLocalServiceLink");
const serviceUpdateNotice = document.getElementById("serviceUpdateNotice");
const mainPanel = document.getElementById("mainPanel");
const toastContainer = document.getElementById("toastContainer");
const errorMessage = document.getElementById("errorMessage");
const phoneForm = document.getElementById("phoneForm");
const phoneNumberInput = document.getElementById("phoneNumber");
const phoneSubmitButton = document.getElementById("phoneSubmitButton");
const rememberPhoneCheckbox = document.getElementById("rememberPhoneCheckbox");
const codeForm = document.getElementById("codeForm");
const verificationPhoneDisplay = document.getElementById("verificationPhoneDisplay");
const changePhoneButton = document.getElementById("changePhoneButton");
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
const dashboardCatalogTotal = document.getElementById("dashboardCatalogTotal");
const dashboardRoleChip = document.getElementById("dashboardRoleChip");
const accessDisplayName = document.getElementById("accessDisplayName");
const accessRole = document.getElementById("accessRole");
const accessState = document.getElementById("accessState");
const dashboardJoinRequiredCheckbox = document.getElementById("dashboardJoinRequiredCheckbox");
const dashboardJoinBoardviewCheckbox = document.getElementById("dashboardJoinBoardviewCheckbox");
const dashboardJoinButton = document.getElementById("dashboardJoinButton");
const spiFlashWorkbench = document.getElementById("spiFlashWorkbench");
const meAnalyzerWorkbench = document.getElementById("meAnalyzerWorkbench");
const uefiToolWorkbench = document.getElementById("uefiToolWorkbench");
const boardViewerWorkbench = document.getElementById("boardViewerWorkbench");
const catalogSection = document.getElementById("catalogSection");
const catalogCount = document.getElementById("catalogCount");
const toastAutoHideDelayMs = 4000;
const catalogContextPanel = document.getElementById("catalogContextPanel");
const catalogList = document.getElementById("catalogList");
const catalogEyebrow = document.getElementById("catalogEyebrow");
const catalogTitle = document.getElementById("catalogTitle");
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
const catalogEditorMd5 = document.getElementById("catalogEditorMd5");
const catalogEditorMd5Field = document.getElementById("catalogEditorMd5Field");
const catalogEditorFile = document.getElementById("catalogEditorFile");
const catalogEditorAnalysisPanel = document.getElementById("catalogEditorAnalysisPanel");
const catalogEditorAdditionalFilesSection = document.getElementById("catalogEditorAdditionalFilesSection");
const catalogEditorAdditionalFilesList = document.getElementById("catalogEditorAdditionalFilesList");
const catalogEditorAddFileButton = document.getElementById("catalogEditorAddFileButton");
const catalogEditorMetadataFields = document.getElementById("catalogEditorMetadataFields");
const catalogEditorDeviceModel = document.getElementById("catalogEditorDeviceModel");
const catalogEditorSerialNumber = document.getElementById("catalogEditorSerialNumber");
const catalogEditorBoardCode = document.getElementById("catalogEditorBoardCode");
const catalogEditorNote = document.getElementById("catalogEditorNote");
const catalogEditorSubmitButton = document.getElementById("catalogEditorSubmitButton");
const aboutFooterButton = document.getElementById("aboutFooterButton");
const aboutModal = document.getElementById("aboutModal");
const aboutModalCloseButton = document.getElementById("aboutModalCloseButton");
const navBios = document.getElementById("navBios");
const navBoardview = document.getElementById("navBoardview");
const navProblemSolving = document.getElementById("navProblemSolving");
const navTools = document.getElementById("navTools");
const toolSpiFlash = document.getElementById("toolSpiFlash");
const toolMeAnalyzer = document.getElementById("toolMeAnalyzer");
const toolUefi = document.getElementById("toolUefi");
const toolOther = document.getElementById("toolOther");
const problemSolvingViewerModal = document.getElementById("problemSolvingViewerModal");
const problemSolvingViewerTitle = document.getElementById("problemSolvingViewerTitle");
const problemSolvingViewerContent = document.getElementById("problemSolvingViewerContent");
const problemSolvingViewerCloseButton = document.getElementById("problemSolvingViewerCloseButton");
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

const meAnalyzerPage = window.teknisiHubPages?.meAnalyzer || {
  viewKey: "tool_me_analyzer",
  eyebrow: "ME Analyzer",
  title: "ME Analyzer",
  subtitle: "Utility lokal untuk analisa manual output lengkap ME Analyzer.",
  items: [],
  mount() {},
  setVisible() {},
  refresh() {}
};

const uefiToolPage = window.teknisiHubPages?.uefiTool || {
  viewKey: "tool_uefi",
  eyebrow: "UEFI Tools",
  title: "UEFI Tools",
  subtitle: "Utility lokal untuk analisa manual struktur firmware UEFI.",
  items: [],
  mount() {},
  setVisible() {},
  refresh() {}
};

const boardViewerPage = window.teknisiHubPages?.boardViewer || {
  viewKey: "tool_boardviewer",
  eyebrow: "Boardviewer",
  title: "Boardviewer",
  subtitle: "Utility lokal untuk membuka file boardview lewat local service.",
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
let currentProblemSolvingChannelRole = "";
let isProblemSolvingMember = false;
const catalogJoinRequiredState = {
  BIOS: false,
  Boardview: false,
  ProblemSolving: false
};
let catalogSearchDebounceId = 0;
let catalogEditorMode = "upload";
let catalogBiosDuplicateCheckToken = 0;
let catalogBiosDuplicateFound = false;
const maxCatalogAdditionalFiles = 5;
let catalogRefreshLoading = false;
let catalogRefreshCooldownUntil = 0;
let catalogRefreshCooldownTimerId = 0;
const rememberedPhoneStorageKey = "teknisihub_remembered_phone";
const rememberedPhoneFlagKey = "teknisihub_remember_phone_enabled";
const activeOtpPhoneStorageKey = "teknisihub_active_otp_phone";
const catalogRefreshCooldownMs = 15000;
let isPhoneNumberChangeRequested = false;
const allowedBiosExtensions = [".bin", ".rom", ".cap", ".img", ".fd", ".bio", ".wph", ".efi", ".hdr"];
const allowedBoardviewExtensions = [".brd", ".bdv", ".boardview", ".fz", ".cad", ".tvw", ".asc"];
const minCatalogFileNameLength = 15;
const maxCatalogFileNameLength = 70;
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

meAnalyzerPage.mount?.({
  container: meAnalyzerWorkbench,
  notify: (message) => setNotice(message)
});

uefiToolPage.mount?.({
  container: uefiToolWorkbench,
  notify: (message) => setNotice(message)
});

boardViewerPage.mount?.({
  container: boardViewerWorkbench,
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
  },
  ProblemSolving: {
    displayName: "Problem Solving",
    uploadLabel: "Upload Problem Solving",
    editTitle: "Edit Metadata Problem Solving",
    fileLabel: "File Markdown",
    fileAccept: ".md",
    invalidExtensionMessage: "Format file Problem Solving harus .md.",
    endpoint: "problem-solving"
  }
};

const telegramCatalogState = {
  BIOS: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false },
  Boardview: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false },
  ProblemSolving: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false }
};

const toolViewMap = {
  tool_spi_flash: {
    eyebrow: spiFlashPage.eyebrow,
    title: spiFlashPage.title,
    subtitle: spiFlashPage.subtitle,
    channelLink: null
  },
  tool_me_analyzer: {
    eyebrow: meAnalyzerPage.eyebrow,
    title: meAnalyzerPage.title,
    subtitle: meAnalyzerPage.subtitle,
    channelLink: null
  },
  tool_uefi: {
    eyebrow: uefiToolPage.eyebrow,
    title: uefiToolPage.title,
    subtitle: uefiToolPage.subtitle,
    channelLink: null
  },
  tool_boardviewer: {
    eyebrow: boardViewerPage.eyebrow,
    title: boardViewerPage.title,
    subtitle: boardViewerPage.subtitle,
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
  currentProblemSolvingChannelRole = "";
  isProblemSolvingMember = false;
  setChannelJoinRequired("BIOS", false);
  setChannelJoinRequired("Boardview", false);
  setChannelJoinRequired("ProblemSolving", false);
  telegramCatalogState.BIOS.requestToken = 0;
  telegramCatalogState.BIOS.hasMore = false;
  telegramCatalogState.BIOS.nextOffset = 0;
  telegramCatalogState.BIOS.loadingMore = false;
  telegramCatalogState.Boardview.requestToken = 0;
  telegramCatalogState.Boardview.hasMore = false;
  telegramCatalogState.Boardview.nextOffset = 0;
  telegramCatalogState.Boardview.loadingMore = false;
  telegramCatalogState.ProblemSolving.requestToken = 0;
  telegramCatalogState.ProblemSolving.hasMore = false;
  telegramCatalogState.ProblemSolving.nextOffset = 0;
  telegramCatalogState.ProblemSolving.loadingMore = false;
  catalogEditorMode = "upload";
  if (catalogSearchDebounceId) {
    clearTimeout(catalogSearchDebounceId);
    catalogSearchDebounceId = 0;
  }
  if (catalogCount) {
    catalogCount.textContent = "0 item";
  }

  if (dashboardCatalogTotal) {
    dashboardCatalogTotal.textContent = "0 file";
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
  toggleElement(catalogContextPanel, false);
  closeProblemSolvingViewer();
}

async function refreshCatalogStats() {
  try {
    const stats = await fetchJson("/catalog/cache-stats");
    if (dashboardCatalogTotal) {
      dashboardCatalogTotal.textContent = `${stats.totalCount || 0} file`;
    }
  } catch {
    if (dashboardCatalogTotal) {
      dashboardCatalogTotal.textContent = "0 file";
    }
  }
}

function isOwnerRole() {
  if (currentCatalogView === "ProblemSolving") {
    return currentProblemSolvingChannelRole.toLowerCase() === "owner";
  }

  const activeRole = currentCatalogView === "Boardview" ? currentBoardviewChannelRole : currentBiosChannelRole;
  return activeRole.toLowerCase() === "owner";
}

function canManageBiosCatalog() {
  const normalizedRole = getDisplayRoleForView(currentCatalogView).toLowerCase();
  return normalizedRole === "owner" || normalizedRole === "admin";
}

function isTelegramCatalogView(viewKey = currentCatalogView) {
  return viewKey === "BIOS" || viewKey === "Boardview" || viewKey === "ProblemSolving";
}

function getTelegramCatalogConfig(viewKey = currentCatalogView) {
  return telegramCatalogConfigs[viewKey] || telegramCatalogConfigs.BIOS;
}

function getTelegramCatalogState(viewKey = currentCatalogView) {
  return telegramCatalogState[viewKey] || telegramCatalogState.BIOS;
}

function getDisplayRoleForView(viewKey = currentCatalogView) {
  if (viewKey === "ProblemSolving") {
    return currentProblemSolvingChannelRole || currentChannelRole;
  }

  if (viewKey === "Boardview") {
    return currentBoardviewChannelRole || currentChannelRole;
  }

  if (viewKey === "BIOS") {
    return currentBiosChannelRole || currentChannelRole;
  }

  return currentChannelRole;
}

function isProblemSolvingView(viewKey = currentCatalogView) {
  return viewKey === "ProblemSolving";
}

function isJoinManagedCatalogView(viewKey = currentCatalogView) {
  return viewKey === "BIOS" || viewKey === "Boardview" || viewKey === "ProblemSolving";
}

function requiresChannelJoin(viewKey = currentCatalogView) {
  return Boolean(catalogJoinRequiredState[viewKey]);
}

function setChannelJoinRequired(viewKey, required) {
  if (!isJoinManagedCatalogView(viewKey)) {
    return;
  }

  catalogJoinRequiredState[viewKey] = Boolean(required);
}

function getJoinPromptConfig(viewKey = currentCatalogView) {
  if (viewKey === "BIOS") {
    return {
      title: "Gabung channel BIOS dulu untuk membuka katalog.",
      description: "Setelah berhasil join, katalog BIOS bisa langsung dibuka dan tombol refresh akan memakai cache backend.",
      buttonId: "biosJoinButton",
      buttonLabel: "Gabung Channel BIOS",
      link: "https://t.me/+Xew7ZbqEE9A3NjNl",
      emptyMessage: "Gabung channel BIOS dulu, lalu buka ulang atau refresh katalog."
    };
  }

  if (viewKey === "Boardview") {
    return {
      title: "Gabung channel Boardview dulu untuk membuka katalog.",
      description: "Setelah berhasil join, katalog Boardview bisa langsung dibuka dan tombol refresh akan memakai cache backend.",
      buttonId: "boardviewJoinButton",
      buttonLabel: "Gabung Channel Boardview",
      link: "https://t.me/+0oa9XOhoXZExNDNl",
      emptyMessage: "Gabung channel Boardview dulu, lalu buka ulang atau refresh katalog."
    };
  }

  return {
    title: "Gabung channel Problem Solving dulu untuk membuka katalog.",
    description: "Setelah berhasil join, tombol refresh akan memakai cache backend seperti katalog Telegram lainnya.",
    buttonId: "problemSolvingJoinButton",
    buttonLabel: "Gabung Channel",
    link: "https://t.me/+lDTpuhq-9v40OWI1",
    emptyMessage: "Gabung channel Problem Solving dulu, lalu refresh katalog."
  };
}

function normalizeCatalogCategory(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function itemMatchesCatalogView(item, viewKey = currentCatalogView) {
  return normalizeCatalogCategory(item?.category) === normalizeCatalogCategory(viewKey);
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

function showWorkbenchOnly(viewKey) {
  toggleElement(catalogSection, false);
  toggleElement(catalogPagination, false);
  spiFlashPage.setVisible?.(viewKey === spiFlashPage.viewKey);
  meAnalyzerPage.setVisible?.(viewKey === meAnalyzerPage.viewKey);
  uefiToolPage.setVisible?.(viewKey === uefiToolPage.viewKey);
  boardViewerPage.setVisible?.(viewKey === boardViewerPage.viewKey);

  if (viewKey === spiFlashPage.viewKey) {
    spiFlashPage.refresh?.();
  }

  if (viewKey === meAnalyzerPage.viewKey) {
    meAnalyzerPage.refresh?.();
  }

  if (viewKey === uefiToolPage.viewKey) {
    uefiToolPage.refresh?.();
  }

  if (viewKey === boardViewerPage.viewKey) {
    boardViewerPage.refresh?.();
  }
}

function hideWorkbench() {
  spiFlashPage.setVisible?.(false);
  meAnalyzerPage.setVisible?.(false);
  uefiToolPage.setVisible?.(false);
  boardViewerPage.setVisible?.(false);
}

function setActiveNav(targetKey) {
  const navMap = {
    BIOS: navBios,
    Boardview: navBoardview,
    ProblemSolving: navProblemSolving,
    tool_spi_flash: toolSpiFlash,
    tool_me_analyzer: toolMeAnalyzer,
    tool_uefi: toolUefi,
    tool_boardviewer: toolOther
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
  if (!catalogEyebrow || !catalogTitle) {
    return;
  }

  toggleElement(catalogContextPanel, false);

  if (viewKey === "BIOS") {
    setText(catalogEyebrow, "File BIOS");
    setText(catalogTitle, "");
    if (catalogSearchInput) {
      catalogSearchInput.placeholder = "Cari file BIOS lalu tekan Enter...";
    }
    updateCatalogToolbar(viewKey);
    return;
  }

  if (viewKey === "Boardview") {
    setText(catalogEyebrow, "File Boardview");
    setText(catalogTitle, "");
    if (catalogSearchInput) {
      catalogSearchInput.placeholder = "Cari file boardview lalu tekan Enter...";
    }
    updateCatalogToolbar(viewKey);
    return;
  }

  if (viewKey === "ProblemSolving") {
    setText(catalogEyebrow, "Problem Solving");
    setText(catalogTitle, "Postingan diagnosa dan solusi teknisi");
    if (catalogSearchInput) {
      catalogSearchInput.placeholder = "Cari nama file atau isi problem solving...";
    }
    updateCatalogToolbar(viewKey);
    return;
  }

  const toolConfig = toolViewMap[viewKey];
  setText(catalogEyebrow, toolConfig.eyebrow);
  setText(catalogTitle, toolConfig.title);
  if (catalogSearchInput) {
    catalogSearchInput.placeholder = "Cari file atau tool...";
  }
  updateCatalogToolbar(viewKey);
}

function renderCatalog(items, viewKey = currentCatalogView) {
  if (
    viewKey === spiFlashPage.viewKey ||
    viewKey === meAnalyzerPage.viewKey ||
    viewKey === uefiToolPage.viewKey ||
    viewKey === boardViewerPage.viewKey
  ) {
    setActiveNav(viewKey);
    if (catalogCount) {
      catalogCount.textContent = viewKey === spiFlashPage.viewKey
        ? "SPI UI"
        : viewKey === meAnalyzerPage.viewKey
        ? "MEA UI"
        : viewKey === uefiToolPage.viewKey
        ? "UEFI UI"
        : "BRD UI";
    }
    showWorkbenchOnly(viewKey);
    return;
  }

  hideWorkbench();
  if (!catalogList) {
    return;
  }

  updateCatalogHeader(viewKey);
  setActiveNav(viewKey);
  if (catalogCount) {
    catalogCount.textContent = `${items.length} item`;
  }
  const paginationState = getTelegramCatalogState(viewKey);
  toggleElement(catalogPagination, isTelegramCatalogView(viewKey) && paginationState.hasMore && items.length > 0);

  if (catalogContextPanel) {
    if (isJoinManagedCatalogView(viewKey) && requiresChannelJoin(viewKey)) {
      const joinPromptConfig = getJoinPromptConfig(viewKey);
      catalogContextPanel.innerHTML = `
        <strong>${escapeHtml(joinPromptConfig.title)}</strong>
        <p>${escapeHtml(joinPromptConfig.description)}</p>
        <div class="catalog-context-actions">
          <button id="${escapeHtml(joinPromptConfig.buttonId)}" type="button">
            <span class="material-symbols-outlined">group_add</span>
            <span>${escapeHtml(joinPromptConfig.buttonLabel)}</span>
          </button>
          <a class="sidebar-link" href="${escapeHtml(joinPromptConfig.link)}" target="_blank" rel="noopener noreferrer">
            <span class="material-symbols-outlined">open_in_new</span>
            <span>Buka link channel</span>
          </a>
        </div>
      `;
      toggleElement(catalogContextPanel, true);
    } else {
      catalogContextPanel.innerHTML = "";
      toggleElement(catalogContextPanel, false);
    }
  }

  if (items.length === 0) {
    const joinPromptConfig = isJoinManagedCatalogView(viewKey) ? getJoinPromptConfig(viewKey) : null;
    catalogList.innerHTML = `
      <article class="catalog-empty">
        <span class="material-symbols-outlined">search_off</span>
        <strong>Belum ada hasil</strong>
        <p>${requiresChannelJoin(viewKey) && joinPromptConfig ? escapeHtml(joinPromptConfig.emptyMessage) : "Coba kata kunci lain atau pindah ke kategori lain."}</p>
      </article>
    `;
    toggleElement(catalogSection, true);
    return;
  }

  if (isProblemSolvingView(viewKey)) {
    catalogList.innerHTML = items.map((item) => `
      <article class="catalog-card">
        <div class="catalog-card-top">
          <span class="catalog-category">${escapeHtml(item.category || "ProblemSolving")}</span>
          <span class="catalog-access">${escapeHtml(getDisplayRoleForView(viewKey) || item.accessLevel || "Member")}</span>
        </div>
        <h4>${escapeHtml(item.fileName || item.title || "Untitled.md")}</h4>
        ${item.description ? `<p class="catalog-description">${escapeHtml(item.description)}</p>` : ""}
        <div class="catalog-file-row">
          <span class="material-symbols-outlined">description</span>
          <span>${escapeHtml(item.fileName || item.title || "-")}</span>
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
            class="catalog-action-button catalog-view-button"
            data-message-id="${item.messageId || ""}"
            data-file-name="${escapeHtml(item.fileName || item.title || "")}">
            <span class="material-symbols-outlined">article</span>
            <span>Lihat</span>
          </button>
        </div>
      </article>
    `).join("");

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
        ${item.category === "BIOS" ? `
        <div>
          <dt>MD5</dt>
          <dd>${escapeHtml(item.md5 || "-")}</dd>
        </div>` : ""}
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
        ${item.category === "Boardview" && item.messageId ? `
        <button
          type="button"
          class="catalog-action-button catalog-open-button"
          data-message-id="${item.messageId}"
          data-file-name="${escapeHtml(item.fileName || item.title || "")}">
          <span class="material-symbols-outlined">open_in_new</span>
          <span>Buka</span>
        </button>` : ""}
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

function getCatalogAdditionalFileInputs() {
  if (!catalogEditorAdditionalFilesList) {
    return [];
  }

  return Array.from(catalogEditorAdditionalFilesList.querySelectorAll('input[type="file"]'));
}

function renderCatalogAdditionalFiles() {
  if (!catalogEditorAdditionalFilesSection || !catalogEditorAdditionalFilesList || !catalogEditorAddFileButton) {
    return;
  }

  const shouldShow = currentCatalogView === "BIOS" && catalogEditorMode !== "edit";
  toggleElement(catalogEditorAdditionalFilesSection, shouldShow);
  if (!shouldShow) {
    catalogEditorAdditionalFilesList.innerHTML = "";
    return;
  }

  catalogEditorAddFileButton.disabled = getCatalogAdditionalFileInputs().length >= maxCatalogAdditionalFiles;
}

function appendCatalogAdditionalFileInput() {
  if (!catalogEditorAdditionalFilesList) {
    return;
  }

  const currentInputs = getCatalogAdditionalFileInputs();
  if (currentInputs.length >= maxCatalogAdditionalFiles) {
    setNotice(`File tambahan maksimal ${maxCatalogAdditionalFiles}.`, "info");
    return;
  }

  const index = currentInputs.length + 1;
  const row = document.createElement("div");
  row.className = "catalog-additional-file-row";
  row.innerHTML = `
    <input type="file" name="additionalFiles" data-index="${index}">
    <button type="button" class="ghost catalog-remove-file-button" aria-label="Hapus file tambahan">
      <span class="material-symbols-outlined">delete</span>
    </button>
  `;
  row.querySelector(".catalog-remove-file-button")?.addEventListener("click", () => {
    row.remove();
    renderCatalogAdditionalFiles();
  });

  catalogEditorAdditionalFilesList.appendChild(row);
  renderCatalogAdditionalFiles();
}

function isBoardCodeRequiredForCategory(category) {
  return category !== "ProblemSolving";
}

function getCatalogMetadataRequirementMessage(config) {
  return `Model Device dan Code Board ${config.displayName} wajib diisi sebelum submit.`;
}

function supportsCatalogMd5Check(category) {
  return category === "BIOS" || category === "Boardview";
}

function validateCatalogFileNameLength(fileName, displayName) {
  const normalizedFileName = String(fileName || "").trim();
  if (normalizedFileName.length < minCatalogFileNameLength || normalizedFileName.length > maxCatalogFileNameLength) {
    throw new Error(`Nama file ${displayName} minimal ${minCatalogFileNameLength} karakter dan maksimal ${maxCatalogFileNameLength} karakter.`);
  }
}

function resetCatalogBiosDuplicateCheck() {
  catalogBiosDuplicateCheckToken += 1;
  catalogBiosDuplicateFound = false;
  if (catalogEditorMd5) {
    catalogEditorMd5.value = "-";
  }
  if (catalogEditorAnalysisPanel) {
    catalogEditorAnalysisPanel.className = "catalog-analysis-panel hidden";
    catalogEditorAnalysisPanel.innerHTML = "";
  }
}

function renderCatalogBiosDuplicateCheck(state, analysis = null) {
  if (!catalogEditorAnalysisPanel) {
    return;
  }

  if (state === "hidden") {
    catalogEditorAnalysisPanel.className = "catalog-analysis-panel hidden";
    catalogEditorAnalysisPanel.innerHTML = "";
    return;
  }

  let toneClass = "is-info";
  let icon = "info";
  let title = "Cek MD5";
  let body = "";

  if (state === "loading") {
    icon = "progress_activity";
    title = "Sedang hitung MD5";
    body = "<p>File sedang dihitung hash MD5 dan dicek langsung ke Telegram.</p>";
  } else if (state === "error") {
    toneClass = "is-warning";
    icon = "warning";
    title = "MD5 belum bisa dicek";
    body = `<p>${escapeHtml(analysis?.message || "Cek MD5 file gagal dijalankan.")}</p>`;
  } else {
    const matches = Array.isArray(analysis?.matchingItems) ? analysis.matchingItems : [];
    const detectedBiosType = analysis?.detectedBiosType || "";
    const detectedMeVersion = analysis?.detectedMeVersion || "";
    toneClass = analysis?.duplicateFound ? "is-warning" : "is-success";
    icon = analysis?.duplicateFound ? "warning" : "check_circle";
    title = analysis?.duplicateFound ? "File serupa sudah ada" : "File tidak ada duplikasi";
    body = `
      ${analysis?.message && analysis.message !== title ? `<p>${escapeHtml(analysis.message)}</p>` : ""}
      ${detectedBiosType ? `<p class="catalog-analysis-detected">Terdeteksi: ${escapeHtml(detectedBiosType)}</p>` : ""}
      ${detectedBiosType === "Intel BIOS" && detectedMeVersion ? `<p class="catalog-analysis-detected">ME Version: ${escapeHtml(detectedMeVersion)}</p>` : ""}
      ${matches.length ? `
      <div class="catalog-analysis-list">
        ${matches.slice(0, 3).map((item) => `
          <div class="catalog-analysis-item">
            <strong>${escapeHtml(item.fileName || item.title || "File BIOS")}</strong>
            <span>${escapeHtml(item.postedAt || "-")} • ${escapeHtml(item.uploadedBy || "Unknown")}</span>
          </div>
        `).join("")}
      </div>` : ""}
    `;
  }

  catalogEditorAnalysisPanel.className = `catalog-analysis-panel ${toneClass}`;
  catalogEditorAnalysisPanel.innerHTML = `
    <div class="catalog-analysis-head">
      <span class="material-symbols-outlined ${state === "loading" ? "is-spinning" : ""}">${icon}</span>
      <strong>${escapeHtml(title)}</strong>
    </div>
    ${body}
  `;
}

async function checkSelectedCatalogDuplicate() {
  if (catalogEditorMode === "edit" || !supportsCatalogMd5Check(currentCatalogView) || !catalogEditorFile?.files?.length) {
    resetCatalogBiosDuplicateCheck();
    return;
  }

  const config = getTelegramCatalogConfig(currentCatalogView);
  const selectedFile = catalogEditorFile.files[0];
  validateCatalogFileNameLength(selectedFile.name, config.displayName);
  const lowerFileName = selectedFile.name.toLowerCase();
  const allowedExtensions = currentCatalogView === "Boardview"
    ? allowedBoardviewExtensions
    : allowedBiosExtensions;
  const hasAllowedExtension = allowedExtensions.some((extension) => lowerFileName.endsWith(extension));
  if (!hasAllowedExtension) {
    resetCatalogBiosDuplicateCheck();
    renderCatalogBiosDuplicateCheck("error", { message: config.invalidExtensionMessage });
    return;
  }

  const token = ++catalogBiosDuplicateCheckToken;
  catalogBiosDuplicateFound = false;
  if (catalogEditorMd5) {
    catalogEditorMd5.value = "Menghitung...";
  }
  renderCatalogBiosDuplicateCheck("loading");

  const formData = new FormData();
  formData.set("file", selectedFile);

  try {
    const result = await fetchJson(`/catalog/${config.endpoint}/check-duplicate`, {
      method: "POST",
      body: formData
    });

    if (token !== catalogBiosDuplicateCheckToken) {
      return;
    }

    catalogBiosDuplicateFound = Boolean(result.duplicateFound);
    if (catalogEditorMd5) {
      catalogEditorMd5.value = result.md5 || "-";
    }
    renderCatalogBiosDuplicateCheck("result", result);
  } catch (error) {
    if (token !== catalogBiosDuplicateCheckToken) {
      return;
    }

    catalogBiosDuplicateFound = false;
    if (catalogEditorMd5) {
      catalogEditorMd5.value = "-";
    }
    renderCatalogBiosDuplicateCheck("error", { message: error.message });
  }
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
  const isProblemSolvingUpload = !isEditMode && targetCategory === "ProblemSolving";
  const boardCodeRequired = isBoardCodeRequiredForCategory(targetCategory);
  setText(catalogEditorTitle, isEditMode ? config.editTitle : config.uploadLabel);
  catalogEditorMessageId.value = isEditMode && item ? String(item.messageId || "") : "";
  catalogEditorDeviceModel.value = item?.deviceModel === "-" ? "" : (item?.deviceModel || "");
  catalogEditorSerialNumber.value = item?.serialNumber === "-" ? "" : (item?.serialNumber || "");
  catalogEditorBoardCode.value = item?.boardCode === "-" ? "" : (item?.boardCode || "");
  catalogEditorNote.value = item?.note === "-" ? "" : (item?.note || "");
  if (catalogEditorMd5) {
    catalogEditorMd5.value = item?.md5 || "-";
  }
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
  toggleElement(catalogEditorMd5Field, supportsCatalogMd5Check(targetCategory));
  renderCatalogAdditionalFiles();
  if (isEditMode && supportsCatalogMd5Check(targetCategory) && catalogEditorMd5?.value) {
    renderCatalogBiosDuplicateCheck("result", {
      duplicateFound: false,
      message: `Metadata ${config.displayName} ini sudah menyimpan MD5 ${catalogEditorMd5.value}.`,
      md5: catalogEditorMd5.value,
      matchingItems: []
    });
  } else if (!isProblemSolvingUpload && supportsCatalogMd5Check(targetCategory)) {
    resetCatalogBiosDuplicateCheck();
  } else {
    renderCatalogBiosDuplicateCheck("hidden");
  }
  toggleElement(catalogEditorMetadataFields, !isProblemSolvingUpload);
  if (catalogEditorDeviceModel) {
    catalogEditorDeviceModel.required = !isProblemSolvingUpload;
  }
  if (catalogEditorBoardCode) {
    catalogEditorBoardCode.required = !isProblemSolvingUpload && boardCodeRequired;
  }
  [catalogEditorSerialNumber, catalogEditorNote].forEach((input) => {
    if (input) {
      input.required = false;
    }
  });

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
  resetCatalogBiosDuplicateCheck();
  if (catalogEditorFile) {
    catalogEditorFile.disabled = false;
    catalogEditorFile.required = false;
  }
  toggleElement(catalogEditorMd5Field, true);
  if (catalogEditorAdditionalFilesList) {
    catalogEditorAdditionalFilesList.innerHTML = "";
  }
  renderCatalogAdditionalFiles();
  toggleElement(catalogEditorMetadataFields, true);
  if (catalogEditorDeviceModel) {
    catalogEditorDeviceModel.required = true;
  }
  if (catalogEditorBoardCode) {
    catalogEditorBoardCode.required = true;
  }
  [catalogEditorSerialNumber, catalogEditorNote].forEach((input) => {
    if (input) {
      input.required = false;
    }
  });
}

function openAboutModal() {
  toggleElement(aboutModal, true);
}

function closeAboutModal() {
  toggleElement(aboutModal, false);
}

function openProblemSolvingViewer(title, content) {
  if (!problemSolvingViewerModal || !problemSolvingViewerContent) {
    return;
  }

  setText(problemSolvingViewerTitle, title || "Baca postingan");
  problemSolvingViewerContent.textContent = content || "";
  toggleElement(problemSolvingViewerModal, true);
}

function closeProblemSolvingViewer() {
  if (!problemSolvingViewerModal) {
    return;
  }

  toggleElement(problemSolvingViewerModal, false);
  setText(problemSolvingViewerTitle, "Baca postingan");
  if (problemSolvingViewerContent) {
    problemSolvingViewerContent.textContent = "";
  }
}

async function joinCatalogChannel(viewKey = currentCatalogView, button = null) {
  const previousMarkup = button?.innerHTML || "";
  if (button) {
    button.disabled = true;
    button.innerHTML = `
      <span class="material-symbols-outlined is-spinning">progress_activity</span>
      <span>Sedang gabung...</span>
    `;
  }

  try {
    const payload = {
      joinRequiredChannel: viewKey === "BIOS",
      joinBoardviewChannel: viewKey === "Boardview",
      joinProblemSolvingChannel: viewKey === "ProblemSolving"
    };
    const result = await fetchJson("/auth/join-channels", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setChannelJoinRequired(viewKey, false);
    setNotice(result.message || "Berhasil gabung channel.");
    await refreshStatus();
    if (currentCatalogView === viewKey) {
      await loadCatalog();
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = previousMarkup;
    }
  }
}

async function viewProblemSolvingItem(messageId, button = null) {
  if (!messageId) {
    throw new Error("Message Problem Solving tidak valid.");
  }

  const previousMarkup = button?.innerHTML || "";
  if (button) {
    button.disabled = true;
    button.innerHTML = `
      <span class="material-symbols-outlined is-spinning">progress_activity</span>
      <span>Membuka...</span>
    `;
  }

  try {
    const result = await fetchJson(`/catalog/problem-solving/${messageId}/view`, {
      method: "POST",
      body: JSON.stringify({})
    });
    const content = result.content || result.rawContent || result.text || "";
    const title = result.fileName || result.title || findCatalogItemByMessageId(messageId)?.fileName || "Problem Solving";
    openProblemSolvingViewer(title, content);
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = previousMarkup;
    }
  }
}

function filterCatalogItems() {
  if (currentCatalogView === spiFlashPage.viewKey || currentCatalogView === meAnalyzerPage.viewKey || currentCatalogView === uefiToolPage.viewKey) {
    renderCatalog([], currentCatalogView);
    return;
  }

  const keyword = (catalogSearchInput?.value || "").trim().toLowerCase();
  const sourceCollection = isTelegramCatalogView(currentCatalogView) ? catalogItems : catalogCache;
  const sourceItems = sourceCollection.filter((item) => {
    if (isTelegramCatalogView(currentCatalogView)) {
      return itemMatchesCatalogView(item, currentCatalogView);
    }

    if (currentCatalogView === "tool_spi_flash") {
      return item.category === "Tools" && item.title.toLowerCase().includes("spi");
    }

    if (currentCatalogView === "tool_uefi") {
      return item.category === "Tools" && item.title.toLowerCase().includes("uefi");
    }

    if (currentCatalogView === boardViewerPage.viewKey) {
      return item.category === "Tools" &&
        item.title.toLowerCase().includes("board");
    }

    return false;
  });

  const filteredItems = isTelegramCatalogView(currentCatalogView)
    ? !keyword
      ? sourceItems
      : sourceItems.filter((item) =>
          [item.title, item.deviceModel, item.description, item.category, item.fileName, item.serialNumber, item.boardCode, item.note, item.uploadedBy]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(keyword))
        )
    : !keyword
    ? sourceItems
    : sourceItems.filter((item) =>
        [item.title, item.deviceModel, item.description, item.category, item.fileName, item.serialNumber, item.boardCode, item.note, item.uploadedBy]
          .filter(Boolean)
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
  if (currentCatalogView === spiFlashPage.viewKey || currentCatalogView === meAnalyzerPage.viewKey || currentCatalogView === uefiToolPage.viewKey) {
    renderCatalog([], currentCatalogView);
    return;
  }

  if (isTelegramCatalogView(currentCatalogView)) {
    await loadTelegramCatalog(currentCatalogView);
    setChannelJoinRequired(currentCatalogView, false);
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

  loadCatalog().catch((error) => {
    if (isJoinManagedCatalogView(currentCatalogView) && isChannelJoinRequiredError(error)) {
      setChannelJoinRequired(currentCatalogView, true);
      catalogItems = [];
      renderCatalog([], currentCatalogView);
      setNotice(`Akses ${getTelegramCatalogConfig(currentCatalogView).displayName} belum aktif. Klik tombol gabung channel untuk melanjutkan.`, "info");
      return;
    }

    setNotice(error.message, true);
  });
}

function isChannelJoinRequiredError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("belum tergabung") ||
    message.includes("channel akses untuk kategori") ||
    message.includes("belum tergabung di channel") ||
    message.includes("belum bisa diakses dengan akun ini");
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

function getActiveOtpPhoneNumber() {
  const savedActivePhone = sessionStorage.getItem(activeOtpPhoneStorageKey);
  if (savedActivePhone) {
    return savedActivePhone;
  }

  return buildInternationalPhoneNumber(phoneNumberInput?.value || "");
}

function syncVerificationPhoneDisplay() {
  if (!verificationPhoneDisplay) {
    return;
  }

  verificationPhoneDisplay.textContent = getActiveOtpPhoneNumber() || "+62-";
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
  let dismissTimeoutId = null;

  const dismissToast = () => {
    if (!toast.isConnected) {
      return;
    }

    if (dismissTimeoutId) {
      window.clearTimeout(dismissTimeoutId);
      dismissTimeoutId = null;
    }

    toast.classList.add("is-leaving");
    window.setTimeout(() => {
      toast.remove();
    }, 180);
  };

  toast.querySelector(".toast-close")?.addEventListener("click", dismissToast);
  toastContainer.prepend(toast);
  dismissTimeoutId = window.setTimeout(dismissToast, toastAutoHideDelayMs);
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
  const showJoinPanel = false;
  const showAgreementPanel = status.isLoggedIn && !status.hasAgreed;
  const showDashboard = status.isLoggedIn && status.hasAgreed;
  const blockAuthForms = showJoinPanel || showAgreementPanel || showDashboard;
  const showPhoneEntryForm = (status.requiresPhoneNumber || isPhoneNumberChangeRequested) && !blockAuthForms;
  const showVerificationForm = status.requiresVerificationCode && !isPhoneNumberChangeRequested && !blockAuthForms;
  const showPasswordForm = status.requiresPassword && !isPhoneNumberChangeRequested && !blockAuthForms;

  if (dashboardJoinRequiredCheckbox) {
    dashboardJoinRequiredCheckbox.checked = Boolean(status.isRequiredChannelMember);
    dashboardJoinRequiredCheckbox.disabled = !hasRequiredLink || Boolean(status.isRequiredChannelMember);
  }
  if (dashboardJoinBoardviewCheckbox) {
    dashboardJoinBoardviewCheckbox.checked = Boolean(status.isBoardviewChannelMember);
    dashboardJoinBoardviewCheckbox.disabled = !hasBoardviewLink || Boolean(status.isBoardviewChannelMember);
  }

  isProblemSolvingMember = Boolean(status.isProblemSolvingChannelMember);
  currentProblemSolvingChannelRole = status.problemSolvingChannelRole || "";

  toggleElement(phoneForm, showPhoneEntryForm);
  toggleElement(codeForm, showVerificationForm);
  toggleElement(passwordForm, showPasswordForm);
  toggleElement(channelJoinPanel, showJoinPanel);
  toggleElement(agreementPanel, showAgreementPanel);
  toggleElement(dashboardPanel, showDashboard);
  syncVerificationPhoneDisplay();

  if (showDashboard) {
    const displayName = status.displayName || "TeknisiHub User";
    const channelRole = status.channelRole ? ` - ${status.channelRole}` : "";
    const biosRole = status.biosChannelRole || status.channelRole || "-";
    const boardviewRole = status.boardviewChannelRole || "-";
    const problemSolvingRole = status.problemSolvingChannelRole || "-";
    currentChannelRole = status.channelRole || "";
    currentBiosChannelRole = status.biosChannelRole || status.channelRole || "";
    currentBoardviewChannelRole = status.boardviewChannelRole || "";
    currentProblemSolvingChannelRole = status.problemSolvingChannelRole || "";
    setText(dashboardTitle, `Halo, ${displayName}`);
    setText(dashboardLoginStatus, "Login Telegram aktif");
    setText(dashboardRoleChip, `BIOS ${biosRole} | Boardview ${boardviewRole} | Problem Solving ${problemSolvingRole}`);
    setText(accessDisplayName, displayName);
    setText(accessRole, `Role BIOS: ${biosRole}\nRole Boardview: ${boardviewRole}\nRole Problem Solving: ${problemSolvingRole}`);
    setText(
      dashboardChannelStatus,
      hasKnownChannelAccess
        ? `Membership channel valid${channelRole}`
        : "Join channel dilakukan dari menu BIOS, Boardview, atau Problem Solving"
    );
    setText(
      dashboardAgreementStatus,
      status.hasAgreed ? "Persetujuan tersimpan" : "Menunggu persetujuan"
    );

    if (status.hasAgreed) {
      setText(
        dashboardSubtitle,
        "Session Telegram aktif. Buka menu BIOS, Boardview, atau Problem Solving untuk cek akses channel saat diperlukan."
      );
      setText(accessState, "Dashboard aktif. Join channel dilakukan per menu saat dibutuhkan.");
      setNotice("");
      loadCatalog().catch((error) => setNotice(error.message, true));
      return;
    }

    resetCatalog();

    setText(
      dashboardSubtitle,
      "Session Telegram aktif. Simpan persetujuan lokal untuk membuka akses dashboard penuh."
    );
    setText(accessState, "Login aktif. Setelah persetujuan tersimpan, channel bisa digabung dari tiap menu.");
    setText(dashboardLoginStatus, "Login Telegram aktif");
    setNotice("User sudah login lokal. Simpan persetujuan untuk membuka dashboard.");
    return;
  }

  currentChannelRole = "";
  resetCatalog();

  if (!status.requiresVerificationCode) {
    isPhoneNumberChangeRequested = false;
    if (!status.requiresPassword && !status.isLoggedIn) {
      sessionStorage.removeItem(activeOtpPhoneStorageKey);
      syncVerificationPhoneDisplay();
    }
  }

  if (showAgreementPanel) {
    setNotice("Login berhasil. Simpan persetujuan untuk membuka dashboard.", true);
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
  toggleElement(mainPanel, false);
  setError("");
  setText(serviceStatus, "Mengecek koneksi...");
  setText(serviceVersion, "Versi: mengecek...");

  try {
    const health = await fetchJson("/health");
    setText(serviceStatus, health.ready ? "Siap" : "Belum siap");
    setText(serviceVersion, `Versi: ${health.version || "unknown"}`);

    if (applyUpdateRequirement(health)) {
      return;
    }

    const status = await fetchJson("/auth/status");
    applyStatus(status);
    await refreshCatalogStats();
  } catch (error) {
    setText(serviceStatus, "Tidak aktif");
    setText(serviceVersion, "Versi: offline");
    setServiceUpdateNotice("");
    hideInteractivePanels();
    setDownloadLinkState(true);
    if (dashboardCatalogTotal) {
      dashboardCatalogTotal.textContent = "0 file";
    }
    setError(`Koneksi ke local service gagal: ${error.message || "unknown error"}`);
    setNotice("Local service belum aktif. Jalankan TeknisiHub.LocalService dulu, lalu refresh.", true);
  }
}

async function submitCatalogEditor() {
  const config = getTelegramCatalogConfig();
  const isProblemSolvingUpload = catalogEditorMode !== "edit" && config.endpoint === "problem-solving";
  const payload = {
    deviceModel: catalogEditorDeviceModel?.value.trim() || "",
    serialNumber: catalogEditorSerialNumber?.value.trim() || "",
    boardCode: catalogEditorBoardCode?.value.trim() || "",
    note: catalogEditorNote?.value.trim() || ""
  };

  const boardCodeRequired = isBoardCodeRequiredForCategory(currentCatalogView);
  if (!isProblemSolvingUpload && (!payload.deviceModel || (boardCodeRequired && !payload.boardCode))) {
    throw new Error(getCatalogMetadataRequirementMessage(config));
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
  validateCatalogFileNameLength(selectedFile.name, config.displayName);
  const lowerFileName = selectedFile.name.toLowerCase();
  const allowedExtensions = config.endpoint === "boardview"
    ? allowedBoardviewExtensions
    : config.endpoint === "problem-solving"
    ? [".md"]
    : allowedBiosExtensions;
  const hasAllowedExtension = allowedExtensions.some((extension) => lowerFileName.endsWith(extension));
  if (!hasAllowedExtension) {
    throw new Error(config.invalidExtensionMessage);
  }

  const formData = new FormData();
  formData.set("file", selectedFile);
  formData.set("md5", catalogEditorMd5?.value.trim() || "");
  getCatalogAdditionalFileInputs().forEach((input) => {
    const extraFile = input.files?.[0];
    if (extraFile) {
      formData.append("additionalFiles", extraFile);
    }
  });
  if (!isProblemSolvingUpload) {
    formData.set("deviceModel", payload.deviceModel);
    formData.set("serialNumber", payload.serialNumber);
    formData.set("boardCode", payload.boardCode);
    formData.set("note", payload.note);
  }

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

async function openBoardviewCatalogItem(messageId) {
  const result = await fetchJson(`/catalog/boardview/${messageId}/open`, {
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
  isPhoneNumberChangeRequested = false;
  sessionStorage.setItem(activeOtpPhoneStorageKey, phoneNumber);
  syncVerificationPhoneDisplay();
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
        agreeCheckbox.checked = true;
      }

      isPhoneNumberChangeRequested = false;
      sessionStorage.removeItem(activeOtpPhoneStorageKey);
      syncVerificationPhoneDisplay();
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
    if (!sessionStorage.getItem(activeOtpPhoneStorageKey)) {
      syncVerificationPhoneDisplay();
    }
  });
}

if (changePhoneButton) {
  changePhoneButton.addEventListener("click", () => {
    const codeInput = document.getElementById("verificationCode");
    isPhoneNumberChangeRequested = true;

    if (codeInput) {
      codeInput.value = "";
    }

    toggleElement(codeForm, false);
    toggleElement(passwordForm, false);
    toggleElement(phoneForm, true);
    phoneNumberInput?.focus();
    setNotice("Ganti nomor aktif. Masukkan nomor Telegram lain lalu minta kode login baru.", "info");
  });
}

if (rememberPhoneCheckbox) {
  rememberPhoneCheckbox.addEventListener("change", () => {
    persistRememberedPhone();
  });
}

loadRememberedPhone();
syncVerificationPhoneDisplay();
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
    const viewButton = event.target.closest(".catalog-view-button");
    if (viewButton) {
      const messageId = Number(viewButton.getAttribute("data-message-id") || 0);
      try {
        await viewProblemSolvingItem(messageId, viewButton);
      } catch (error) {
        setNotice(error.message, true);
      }
      return;
    }

    const openButton = event.target.closest(".catalog-open-button");
    if (openButton) {
      const messageId = Number(openButton.getAttribute("data-message-id") || 0);
      const fileName = openButton.getAttribute("data-file-name") || "Boardview";
      if (messageId > 0) {
        const previousMarkup = openButton.innerHTML;
        openButton.disabled = true;
        openButton.innerHTML = `
          <span class="material-symbols-outlined is-spinning">progress_activity</span>
          <span>Membuka...</span>
        `;

        try {
          setNotice(`Mengecek cache Boardview untuk ${fileName}, lalu membuka file lewat Boardviewer jika tersedia.`);
          await openBoardviewCatalogItem(messageId);
        } catch (error) {
          setNotice(error.message, true);
        } finally {
          openButton.disabled = false;
          openButton.innerHTML = previousMarkup;
        }
      }
      return;
    }

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

catalogContextPanel?.addEventListener("click", async (event) => {
  const joinButton = event.target.closest("#biosJoinButton, #boardviewJoinButton, #problemSolvingJoinButton");
  if (!joinButton) {
    return;
  }

  try {
    const targetView = joinButton.id === "biosJoinButton"
      ? "BIOS"
      : joinButton.id === "boardviewJoinButton"
      ? "Boardview"
      : "ProblemSolving";
    await joinCatalogChannel(targetView, joinButton);
  } catch (error) {
    setNotice(error.message, true);
  }
});

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
  closeProblemSolvingViewer();
  setActiveNav(viewKey);
  setNavButtonLoading(button, true);

  try {
    await loadCatalog();
  } catch (error) {
    if (isJoinManagedCatalogView(viewKey) && isChannelJoinRequiredError(error)) {
      setChannelJoinRequired(viewKey, true);
      catalogItems = [];
      renderCatalog([], viewKey);
      setNotice(`Akses ${getTelegramCatalogConfig(viewKey).displayName} belum aktif. Klik tombol gabung channel untuk melanjutkan.`, "info");
    } else {
      setNotice(error.message, true);
    }
  } finally {
    setNavButtonLoading(button, false);
  }
}

async function refreshCurrentTelegramCatalog() {
  if (!catalogRefreshButton || !isTelegramCatalogView(currentCatalogView)) {
    return;
  }

  if (requiresChannelJoin(currentCatalogView)) {
    setNotice(`Gabung channel ${getTelegramCatalogConfig(currentCatalogView).displayName} dulu sebelum refresh katalog.`, "info");
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
    setChannelJoinRequired(currentCatalogView, false);
    setNotice(`${result.message} Tombol refresh akan aktif lagi dalam 15 detik.`, "info");
    await loadCatalog();
  } catch (error) {
    if (isJoinManagedCatalogView(currentCatalogView) && isChannelJoinRequiredError(error)) {
      setChannelJoinRequired(currentCatalogView, true);
      catalogItems = [];
      renderCatalog([], currentCatalogView);
      setNotice(`Akses ${getTelegramCatalogConfig(currentCatalogView).displayName} belum aktif. Klik tombol gabung channel untuk melanjutkan.`, "info");
    } else {
      setNotice(error.message, true);
    }
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

catalogEditorFile?.addEventListener("change", () => {
  checkSelectedCatalogDuplicate().catch((error) => {
    renderCatalogBiosDuplicateCheck("error", { message: error.message });
  });
});

catalogEditorAddFileButton?.addEventListener("click", appendCatalogAdditionalFileInput);

aboutFooterButton?.addEventListener("click", openAboutModal);

aboutModalCloseButton?.addEventListener("click", closeAboutModal);

problemSolvingViewerCloseButton?.addEventListener("click", closeProblemSolvingViewer);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
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

navProblemSolving?.addEventListener("click", () => {
  navigateTelegramCatalog("ProblemSolving", navProblemSolving);
});

toolSpiFlash?.addEventListener("click", () => {
  currentCatalogView = spiFlashPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolMeAnalyzer?.addEventListener("click", () => {
  currentCatalogView = meAnalyzerPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolUefi?.addEventListener("click", () => {
  currentCatalogView = uefiToolPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolOther?.addEventListener("click", () => {
  currentCatalogView = boardViewerPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});
