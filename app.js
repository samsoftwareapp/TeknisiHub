const serviceBaseUrl = window.resolveTeknisiHubServiceBaseUrl();

const serviceStatus = document.getElementById("serviceStatus");
const serviceVersion = document.getElementById("serviceVersion");
const serviceTrafficIndicator = document.getElementById("serviceTrafficIndicator");
const serviceApiActivity = document.getElementById("serviceApiActivity");
const themeToggleButton = document.getElementById("themeToggleButton");
const backToTopButton = document.getElementById("backToTopButton");
const downloadLocalServiceLink = document.getElementById("downloadLocalServiceLink");
const runLocalUpdateButton = document.getElementById("runLocalUpdateButton");
const viewPreviousVersionsButton = document.getElementById("viewPreviousVersionsButton");
const serviceUpdateNotice = document.getElementById("serviceUpdateNotice");
const updateProgressPanel = document.getElementById("updateProgressPanel");
const updateProgressLabel = document.getElementById("updateProgressLabel");
const updateProgressPercent = document.getElementById("updateProgressPercent");
const updateProgressBar = document.getElementById("updateProgressBar");
const updateProgressMeta = document.getElementById("updateProgressMeta");
const mainPanel = document.getElementById("mainPanel");
const toastContainer = document.getElementById("toastContainer");
const introQuoteModal = document.getElementById("introQuoteModal");
const introQuoteCloseButton = document.getElementById("introQuoteCloseButton");
const introQuoteDismissCheckbox = document.getElementById("introQuoteDismissCheckbox");
const introQuoteEnterButton = document.getElementById("introQuoteEnterButton");
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
const newWindowTabCheckbox = document.getElementById("newWindowTabCheckbox");
const logoutButton = document.getElementById("logoutButton");
const dashboardCheckUpdateButton = document.getElementById("dashboardCheckUpdateButton");
const dashboardTitle = document.getElementById("dashboardTitle");
const dashboardSubtitle = document.getElementById("dashboardSubtitle");
const dashboardLoginStatus = document.getElementById("dashboardLoginStatus");
const dashboardChannelStatus = document.getElementById("dashboardChannelStatus");
const dashboardAgreementStatus = document.getElementById("dashboardAgreementStatus");
const dashboardRoleChip = document.getElementById("dashboardRoleChip");
const dashboardRoleChipIcon = document.getElementById("dashboardRoleChipIcon");
const accessDisplayName = document.getElementById("accessDisplayName");
const accessRole = document.getElementById("accessRole");
const accessChannelCount = document.getElementById("accessChannelCount");
const accessState = document.getElementById("accessState");
const dashboardJoinRequiredCheckbox = document.getElementById("dashboardJoinRequiredCheckbox");
const dashboardJoinBoardviewCheckbox = document.getElementById("dashboardJoinBoardviewCheckbox");
const dashboardJoinSchematicsCheckbox = document.getElementById("dashboardJoinSchematicsCheckbox");
const dashboardJoinButton = document.getElementById("dashboardJoinButton");
const dashboardHomeWorkbench = document.getElementById("dashboardHomeWorkbench");
const spiFlashWorkbench = document.getElementById("spiFlashWorkbench");
const meAnalyzerWorkbench = document.getElementById("meAnalyzerWorkbench");
const uefiToolWorkbench = document.getElementById("uefiToolWorkbench");
const biosVendorDetectWorkbench = document.getElementById("biosVendorDetectWorkbench");
const fileHashCompareWorkbench = document.getElementById("fileHashCompareWorkbench");
const resistorCalculatorWorkbench = document.getElementById("resistorCalculatorWorkbench");
const lenovoBiosPatchWorkbench = document.getElementById("lenovoBiosPatchWorkbench");
const dell8Fc8Workbench = document.getElementById("dell8Fc8Workbench");
const amiDecryptorWorkbench = document.getElementById("amiDecryptorWorkbench");
const biosPasswordWorkbench = document.getElementById("biosPasswordWorkbench");
const microscopeWorkbench = document.getElementById("microscopeWorkbench");
const alienServerWorkbench = document.getElementById("alienServerWorkbench");
const boardViewerWorkbench = document.getElementById("boardViewerWorkbench");
const settingsWorkbench = document.getElementById("settingsWorkbench");
const catalogSection = document.getElementById("catalogSection");
const catalogCount = document.getElementById("catalogCount");
const toastAutoHideDelayMs = 4000;
const minBiosFileSizeBytes = 512 * 1024;
const minOptionalBiosFileSizeBytes = 15 * 1024;
const maxBiosFileSizeBytes = 50 * 1024 * 1024;
const catalogContextPanel = document.getElementById("catalogContextPanel");
const catalogList = document.getElementById("catalogList");
const catalogEyebrow = document.getElementById("catalogEyebrow");
const catalogTitle = document.getElementById("catalogTitle");
const catalogSearchInput = document.getElementById("catalogSearchInput");
const catalogSearchStatus = document.getElementById("catalogSearchStatus");
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
const catalogEditorAdditionalFilesNote = document.getElementById("catalogEditorAdditionalFilesNote");
const catalogEditorAddFileButton = document.getElementById("catalogEditorAddFileButton");
const catalogEditorMetadataFields = document.getElementById("catalogEditorMetadataFields");
const catalogEditorAliasField = document.getElementById("catalogEditorAliasField");
const catalogEditorAliasName = document.getElementById("catalogEditorAliasName");
const catalogEditorDeviceModel = document.getElementById("catalogEditorDeviceModel");
const catalogEditorDeviceModelField = catalogEditorDeviceModel?.closest(".catalog-form-field");
const catalogEditorSerialNumberField = document.getElementById("catalogEditorSerialNumberField");
const catalogEditorSerialNumber = document.getElementById("catalogEditorSerialNumber");
const catalogEditorBoardCode = document.getElementById("catalogEditorBoardCode");
const catalogEditorBoardCodeField = catalogEditorBoardCode?.closest(".catalog-form-field");
const catalogEditorNoteField = document.getElementById("catalogEditorNoteField");
const catalogEditorNote = document.getElementById("catalogEditorNote");
const catalogEditorSubmitButton = document.getElementById("catalogEditorSubmitButton");
const catalogEditorUploadProgress = document.getElementById("catalogEditorUploadProgress");
const catalogEditorUploadProgressLabel = document.getElementById("catalogEditorUploadProgressLabel");
const catalogEditorUploadProgressPercent = document.getElementById("catalogEditorUploadProgressPercent");
const catalogEditorUploadProgressBar = document.getElementById("catalogEditorUploadProgressBar");
const catalogUploadTaskPanel = document.getElementById("catalogUploadTaskPanel");
const catalogUploadTaskSummary = document.getElementById("catalogUploadTaskSummary");
const catalogUploadTaskToggleButton = document.getElementById("catalogUploadTaskToggleButton");
const catalogUploadTaskToggleIcon = document.getElementById("catalogUploadTaskToggleIcon");
const catalogUploadTaskCloseButton = document.getElementById("catalogUploadTaskCloseButton");
const catalogUploadTaskBody = document.getElementById("catalogUploadTaskBody");
const catalogUploadTaskList = document.getElementById("catalogUploadTaskList");
const catalogDeleteModal = document.getElementById("catalogDeleteModal");
const catalogDeleteTitle = document.getElementById("catalogDeleteTitle");
const catalogDeleteDescription = document.getElementById("catalogDeleteDescription");
const catalogDeleteTargetName = document.getElementById("catalogDeleteTargetName");
const catalogDeleteCategoryValue = document.getElementById("catalogDeleteCategoryValue");
const catalogDeleteModelValue = document.getElementById("catalogDeleteModelValue");
const catalogDeleteBoardValue = document.getElementById("catalogDeleteBoardValue");
const catalogDeleteCancelButton = document.getElementById("catalogDeleteCancelButton");
const catalogDeleteConfirmButton = document.getElementById("catalogDeleteConfirmButton");
const catalogAiSuggestionModal = document.getElementById("catalogAiSuggestionModal");
const catalogAiSuggestionTitle = document.getElementById("catalogAiSuggestionTitle");
const catalogAiSuggestionDescription = document.getElementById("catalogAiSuggestionDescription");
const catalogAiSuggestionTargetName = document.getElementById("catalogAiSuggestionTargetName");
const catalogAiSuggestionCategoryValue = document.getElementById("catalogAiSuggestionCategoryValue");
const catalogAiSuggestionModelValue = document.getElementById("catalogAiSuggestionModelValue");
const catalogAiSuggestionBoardValue = document.getElementById("catalogAiSuggestionBoardValue");
const catalogAiSuggestionConfidenceValue = document.getElementById("catalogAiSuggestionConfidenceValue");
const catalogAiSuggestionReasoning = document.getElementById("catalogAiSuggestionReasoning");
const catalogAiSuggestionSources = document.getElementById("catalogAiSuggestionSources");
const catalogAiSuggestionCancelButton = document.getElementById("catalogAiSuggestionCancelButton");
const catalogAiSuggestionApplyButton = document.getElementById("catalogAiSuggestionApplyButton");
const aboutFooterButton = document.getElementById("aboutFooterButton");
const aboutModal = document.getElementById("aboutModal");
const aboutModalCloseButton = document.getElementById("aboutModalCloseButton");
const navBios = document.getElementById("navBios");
const navBoardview = document.getElementById("navBoardview");
const navSchematics = document.getElementById("navSchematics");
const navProblemSolving = document.getElementById("navProblemSolving");
const navDatasheets = document.getElementById("navDatasheets");
const navDashboard = document.getElementById("navDashboard");
const navTools = document.getElementById("navTools");
const navSettings = document.getElementById("navSettings");
const toolSpiFlash = document.getElementById("toolSpiFlash");
const toolMeAnalyzer = document.getElementById("toolMeAnalyzer");
const toolUefi = document.getElementById("toolUefi");
const toolBiosVendorDetect = document.getElementById("toolBiosVendorDetect");
const toolFileHashCompare = document.getElementById("toolFileHashCompare");
const toolResistorCalculator = document.getElementById("toolResistorCalculator");
const toolBiosPatchGroup = document.getElementById("toolBiosPatchGroup");
const toolDumpBiosLenovo = document.getElementById("toolDumpBiosLenovo");
const toolDell8Fc8 = document.getElementById("toolDell8Fc8");
const toolAmiDecryptor = document.getElementById("toolAmiDecryptor");
const toolBiosPassword = document.getElementById("toolBiosPassword");
const toolMicroscope = document.getElementById("toolMicroscope");
const toolAlienServer = document.getElementById("toolAlienServer");
const toolOther = document.getElementById("toolOther");
const problemSolvingViewerModal = document.getElementById("problemSolvingViewerModal");
const problemSolvingViewerTitle = document.getElementById("problemSolvingViewerTitle");
const problemSolvingViewerContent = document.getElementById("problemSolvingViewerContent");
const problemSolvingViewerCloseButton = document.getElementById("problemSolvingViewerCloseButton");
const previousVersionsModal = document.getElementById("previousVersionsModal");
const previousVersionsList = document.getElementById("previousVersionsList");
const previousVersionsCloseButton = document.getElementById("previousVersionsCloseButton");
const defaultDownloadLocalServiceUrl = downloadLocalServiceLink?.getAttribute("href") || "";
const defaultDownloadLocalServiceLabel = downloadLocalServiceLink?.textContent?.trim() || "Download local service";
let previousVersionNotes = [];
let updateStatusPollTimeoutId = null;
let updateRestartPollTimeoutId = null;
let pendingUpdateVersion = "";
let updateProgressHideTimeoutId = null;

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

const biosVendorDetectPage = window.teknisiHubPages?.biosVendorDetect || {
  viewKey: "tool_bios_vendor_detect",
  eyebrow: "BIOS Vendor",
  title: "Deteksi Vendor BIOS",
  subtitle: "Screening cepat untuk menebak vendor perangkat dan core BIOS dari file dump lokal.",
  items: [],
  mount() {},
  setVisible() {},
  refresh() {}
};

const fileHashComparePage = window.teknisiHubPages?.fileHashCompare || {
  viewKey: "tool_file_hash_compare",
  eyebrow: "Hash Compare",
  title: "Cek Hash File",
  subtitle: "Bandingkan dua file dengan MD5 dan SHA-256.",
  items: [],
  mount() {},
  setVisible() {},
  refresh() {}
};

const resistorCalculatorPage = window.teknisiHubPages?.resistorCalculator || {
  viewKey: "tool_resistor_calculator",
  eyebrow: "Elektronika",
  title: "Resistor Kalkulator",
  subtitle: "Decoder resistor warna, kode SMD, dan hitung total seri atau paralel.",
  items: [],
  mount() {},
  setVisible() {},
  refresh() {}
};

const lenovoBiosPatchPage = window.teknisiHubPages?.lenovoBiosPatch || {
  viewKey: "tool_lenovo_dump_bios",
  eyebrow: "Bios Patch",
  title: "Lenovo UEFI AutoPatcher",
  subtitle: "Utility lokal untuk membuat file patch dari Lenovo UEFI AutoPatcher.",
  items: [],
  mount() {},
  setVisible() {},
  refresh() {}
};

const dell8Fc8Page = window.teknisiHubPages?.dell8Fc8 || {
  viewKey: "tool_dell_8fc8",
  eyebrow: "Bios Patch",
  title: "Dell 8FC8",
  subtitle: "Patch dump BIOS Dell 8FC8 langsung dari local service.",
  items: [],
  mount() {},
  setVisible() {},
  refresh() {}
};

const amiDecryptorPage = window.teknisiHubPages?.amiDecryptor || {
  viewKey: "tool_ami_decryptor",
  eyebrow: "Bios Patch",
  title: "AMI Decrytor & Unlocker",
  subtitle: "Cari AMITSESetup dan decode kandidat password supervisor dari BIOS AMI.",
  items: [],
  mount() {},
  setVisible() {},
  refresh() {}
};

const biosPasswordPage = window.teknisiHubPages?.biosPassword || {
  viewKey: "tool_bios_password",
  eyebrow: "BIOS Password",
  title: "BIOS Password Helper",
  subtitle: "Analisa format kode lock BIOS secara offline lewat local service.",
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

const microscopePage = window.teknisiHubPages?.microscope || {
  viewKey: "tool_microscope",
  eyebrow: "Microscope",
  title: "Microscope",
  subtitle: "Preview microscope USB atau camera internal langsung dari browser.",
  items: [],
  mount() {},
  setVisible() {},
  refresh() {}
};

const alienServerPage = window.teknisiHubPages?.alienServer || {
  viewKey: "tool_alien_server",
  eyebrow: "Alien Server",
  title: "Alien Server",
  subtitle: "Embed cepat untuk halaman tool eksternal AMITSESetup.",
  items: [],
  mount() {},
  setVisible() {},
  refresh() {}
};

const settingsPage = window.teknisiHubPages?.settings || {
  viewKey: "settings",
  eyebrow: "Pengaturan",
  title: "Pengaturan",
  subtitle: "Pengaturan dasar untuk local service.",
  items: [],
  mount() {},
  setVisible() {},
  refresh() {}
};

const dashboardHomePage = window.teknisiHubPages?.dashboardHome || {
  viewKey: "dashboard_home",
  eyebrow: "Dashboard",
  title: "Dashboard",
  subtitle: "Ringkasan akses akun, status local service, dan pintasan kerja utama.",
  items: [],
  mount() {},
  setVisible() {},
  refresh() {}
};

let catalogLoaded = false;
let catalogItems = [];
let catalogCache = [];
let currentCatalogView = dashboardHomePage.viewKey;
let currentHashShareViewKey = "";
let currentHashShareMessageId = 0;
let googleAuthPollTimerId = 0;
let googleAuthTab = null;
let googleAuthTabAwaitingResult = false;
let authStatusPollTimerId = 0;
let authStatusPollInFlight = false;
let activeToastSignature = "";
let lastAutoFilledOtpNoticeCode = "";
let currentChannelRole = "";
let currentBiosChannelRole = "";
let currentBoardviewChannelRole = "";
let currentSchematicsChannelRole = "";
let currentProblemSolvingChannelRole = "";
let currentDatasheetsChannelRole = "";
let currentRequiredChannelInviteLink = "";
let currentBoardviewChannelInviteLink = "";
let currentSchematicsChannelInviteLink = "";
let currentProblemSolvingChannelInviteLink = "";
let currentDatasheetsChannelInviteLink = "";
let isSchematicsMember = false;
let isProblemSolvingMember = false;
let isDatasheetsMember = false;
const catalogJoinRequiredState = {
  BIOS: false,
  Boardview: false,
  Schematics: false,
  ProblemSolving: false,
  Datasheets: false
};
let catalogSearchDebounceId = 0;
let catalogEditorMode = "upload";
let catalogBiosDuplicateCheckToken = 0;
let catalogBiosDuplicateFound = false;
let catalogMetadataAiSuggestionToken = 0;
let catalogMetadataAiSuggestionRequestedSignature = "";
let catalogMetadataAiSuggestionLookupSignature = "";
let catalogMetadataAiSuggestionLookupStatus = "idle";
let catalogMetadataAiSuggestionAbortController = null;
let catalogMetadataAiSuggestionResolved = null;
let catalogMetadataAiSuggestionEligibleSignature = "";
let pendingCatalogMetadataAiSuggestion = null;
let pendingCatalogMetadataAiSuggestionTriggerButton = null;
let catalogMetadataAiAppliedSuggestion = null;
let pendingCatalogDeleteItem = null;
let pendingCatalogDeleteTriggerButton = null;
let catalogDeleteSubmitting = false;
const maxCatalogAdditionalFiles = 5;
let catalogRefreshLoading = false;
let catalogRefreshCooldownUntil = 0;
let catalogRefreshCooldownTimerId = 0;
let catalogSearchLoading = false;
const catalogSearchCacheMissNoticeByQuery = new Map();
let catalogEventSource = null;
let catalogEventReconnectTimerId = 0;
const catalogUploadTasks = new Map();
const maxCatalogUploadTasks = 4;
let catalogUploadTaskCollapsed = false;
let catalogUploadTaskDismissed = false;
let catalogUploadTaskSyncTimerId = 0;
const catalogDeleteConfirmDefaultMarkup = catalogDeleteConfirmButton?.innerHTML || "";
const rememberedPhoneStorageKey = "teknisihub_remembered_phone";
const rememberedPhoneFlagKey = "teknisihub_remember_phone_enabled";
const activeOtpPhoneStorageKey = "teknisihub_active_otp_phone";
const introQuoteDismissStorageKey = "teknisihub_hide_intro_quote";
const themeModeStorageKey = "teknisihub_theme_mode";
const themeModeDateStorageKey = "teknisihub_theme_mode_wib_date";
const telegramCatalogFirstPageStoragePrefix = "teknisihub_catalog_first_page_v1_";
const telegramCatalogFirstPageMaxAgeMs = 24 * 60 * 60 * 1000;
const catalogSearchCacheMissNoticeCooldownMs = 5 * 60 * 1000;
const catalogRefreshCooldownMs = 15000;
const wibTimeZone = "Asia/Jakarta";
const wibNightThemeStartHour = 18;
const wibNightThemeEndHour = 6;
let isPhoneNumberChangeRequested = false;
const allowedBiosExtensions = [".bin", ".rom", ".cap", ".img", ".fd", ".bio", ".wph", ".efi", ".hdr"];
const allowedBoardviewExtensions = [".asc", ".bdv", ".brd", ".bv", ".cad", ".cst", ".gr", ".f2b", ".faz", ".fz", ".tvw"];
const allowedSchematicsExtensions = [".pdf"];
const allowedDatasheetsExtensions = [".pdf"];
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

dashboardHomePage.mount?.({
  container: dashboardHomeWorkbench,
  notify: (message, tone) => setNotice(message, tone),
  navigate: (viewKey) => {
    updateViewHash(viewKey);
    currentCatalogView = viewKey;
    catalogItems = catalogCache;
    filterCatalogItems();
  }
});

spiFlashPage.mount?.({
  container: spiFlashWorkbench,
  notify: (message, tone) => setNotice(message, tone),
  reportTask: (task) => {
    if (!task?.remove && !task?.deleted) {
      catalogUploadTaskDismissed = false;
    }
    upsertCatalogUploadTask(task);
  }
});

meAnalyzerPage.mount?.({
  container: meAnalyzerWorkbench,
  notify: (message) => setNotice(message)
});

uefiToolPage.mount?.({
  container: uefiToolWorkbench,
  notify: (message) => setNotice(message)
});

biosVendorDetectPage.mount?.({
  container: biosVendorDetectWorkbench,
  notify: (message) => setNotice(message)
});

fileHashComparePage.mount?.({
  container: fileHashCompareWorkbench,
  notify: (message) => setNotice(message)
});

resistorCalculatorPage.mount?.({
  container: resistorCalculatorWorkbench,
  notify: (message) => setNotice(message)
});

lenovoBiosPatchPage.mount?.({
  container: lenovoBiosPatchWorkbench,
  notify: (message) => setNotice(message)
});

dell8Fc8Page.mount?.({
  container: dell8Fc8Workbench,
  notify: (message) => setNotice(message)
});

amiDecryptorPage.mount?.({
  container: amiDecryptorWorkbench,
  notify: (message) => setNotice(message)
});

biosPasswordPage.mount?.({
  container: biosPasswordWorkbench,
  notify: (message) => setNotice(message)
});

boardViewerPage.mount?.({
  container: boardViewerWorkbench,
  notify: (message) => setNotice(message)
});

microscopePage.mount?.({
  container: microscopeWorkbench,
  notify: (message) => setNotice(message)
});

alienServerPage.mount?.({
  container: alienServerWorkbench,
  notify: (message) => setNotice(message)
});

settingsPage.mount?.({
  container: settingsWorkbench,
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
    invalidExtensionMessage: "Format file Boardview harus salah satu dari: .asc, .bdv, .brd, .bv, .cad, .cst, .gr, .f2b, .faz, .fz, .tvw.",
    endpoint: "boardview"
  },
  Schematics: {
    displayName: "Schematics",
    uploadLabel: "Upload Schematics",
    editTitle: "Edit Metadata Schematics",
    fileLabel: "File Schematics",
    fileAccept: allowedSchematicsExtensions.join(","),
    invalidExtensionMessage: "Format file Schematics harus .pdf.",
    endpoint: "schematics"
  },
  ProblemSolving: {
    displayName: "PS",
    uploadLabel: "Upload PS",
    editTitle: "Edit Metadata Problem Solving",
    fileLabel: "File Markdown",
    fileAccept: ".md",
    invalidExtensionMessage: "Format file Problem Solving harus .md.",
    endpoint: "problem-solving"
  },
  Datasheets: {
    displayName: "Datasheets",
    uploadLabel: "Upload Datasheets",
    editTitle: "Edit Metadata Datasheets",
    fileLabel: "File PDF",
    fileAccept: ".pdf",
    invalidExtensionMessage: "Format file Datasheets harus .pdf.",
    endpoint: "datasheets"
  }
};

const telegramCatalogState = {
  BIOS: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false, cachedFirstPageItems: [], cachedFirstPageHasMore: false, cachedFirstPageNextOffset: 0, lastStatsCacheKey: "" },
  Boardview: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false, cachedFirstPageItems: [], cachedFirstPageHasMore: false, cachedFirstPageNextOffset: 0, lastStatsCacheKey: "" },
  Schematics: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false, cachedFirstPageItems: [], cachedFirstPageHasMore: false, cachedFirstPageNextOffset: 0, lastStatsCacheKey: "" },
  ProblemSolving: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false, cachedFirstPageItems: [], cachedFirstPageHasMore: false, cachedFirstPageNextOffset: 0, lastStatsCacheKey: "" },
  Datasheets: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false, cachedFirstPageItems: [], cachedFirstPageHasMore: false, cachedFirstPageNextOffset: 0, lastStatsCacheKey: "" }
};
const pendingCatalogRealtimeReloads = new Map();
let activeTelegramCategorySync = null;
let activeApiRequestCount = 0;
let nextApiTrafficToken = 1;
const activeApiTrafficRequests = new Map();

const toolViewMap = {
  [dashboardHomePage.viewKey]: {
    eyebrow: dashboardHomePage.eyebrow,
    title: dashboardHomePage.title,
    subtitle: dashboardHomePage.subtitle,
    channelLink: null
  },
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
  [biosVendorDetectPage.viewKey]: {
    eyebrow: biosVendorDetectPage.eyebrow,
    title: biosVendorDetectPage.title,
    subtitle: biosVendorDetectPage.subtitle,
    channelLink: null
  },
  [fileHashComparePage.viewKey]: {
    eyebrow: fileHashComparePage.eyebrow,
    title: fileHashComparePage.title,
    subtitle: fileHashComparePage.subtitle,
    channelLink: null
  },
  [resistorCalculatorPage.viewKey]: {
    eyebrow: resistorCalculatorPage.eyebrow,
    title: resistorCalculatorPage.title,
    subtitle: resistorCalculatorPage.subtitle,
    channelLink: null
  },
  [lenovoBiosPatchPage.viewKey]: {
    eyebrow: lenovoBiosPatchPage.eyebrow,
    title: lenovoBiosPatchPage.title,
    subtitle: lenovoBiosPatchPage.subtitle,
    channelLink: null
  },
  [dell8Fc8Page.viewKey]: {
    eyebrow: dell8Fc8Page.eyebrow,
    title: dell8Fc8Page.title,
    subtitle: dell8Fc8Page.subtitle,
    channelLink: null
  },
  [amiDecryptorPage.viewKey]: {
    eyebrow: amiDecryptorPage.eyebrow,
    title: amiDecryptorPage.title,
    subtitle: amiDecryptorPage.subtitle,
    channelLink: null
  },
  tool_bios_password: {
    eyebrow: biosPasswordPage.eyebrow,
    title: biosPasswordPage.title,
    subtitle: biosPasswordPage.subtitle,
    channelLink: null
  },
  tool_boardviewer: {
    eyebrow: boardViewerPage.eyebrow,
    title: boardViewerPage.title,
    subtitle: boardViewerPage.subtitle,
    channelLink: null
  },
  tool_microscope: {
    eyebrow: microscopePage.eyebrow,
    title: microscopePage.title,
    subtitle: microscopePage.subtitle,
    channelLink: null
  },
  [alienServerPage.viewKey]: {
    eyebrow: alienServerPage.eyebrow,
    title: alienServerPage.title,
    subtitle: alienServerPage.subtitle,
    channelLink: null
  },
  [settingsPage.viewKey]: {
    eyebrow: settingsPage.eyebrow,
    title: settingsPage.title,
    subtitle: settingsPage.subtitle,
    channelLink: null
  }
};

const localWorkbenchViewKeys = new Set([
  dashboardHomePage.viewKey,
  spiFlashPage.viewKey,
  meAnalyzerPage.viewKey,
  uefiToolPage.viewKey,
  biosVendorDetectPage.viewKey,
  fileHashComparePage.viewKey,
  resistorCalculatorPage.viewKey,
  lenovoBiosPatchPage.viewKey,
  dell8Fc8Page.viewKey,
  amiDecryptorPage.viewKey,
  biosPasswordPage.viewKey,
  microscopePage.viewKey,
  alienServerPage.viewKey,
  boardViewerPage.viewKey,
  settingsPage.viewKey
]);

const viewHashMap = {
  [dashboardHomePage.viewKey]: "Dashboard",
  BIOS: "BIOS",
  Boardview: "Boardview",
  Schematics: "Schematics",
  ProblemSolving: "ProblemSolving",
  Datasheets: "Datasheets",
  [spiFlashPage.viewKey]: "SpiFlash",
  [meAnalyzerPage.viewKey]: "MeAnalyzer",
  [uefiToolPage.viewKey]: "UefiTools",
  [biosVendorDetectPage.viewKey]: "BiosVendorDetect",
  [fileHashComparePage.viewKey]: "FileHashCompare",
  [resistorCalculatorPage.viewKey]: "ResistorCalculator",
  [lenovoBiosPatchPage.viewKey]: "DumpBiosLenovo",
  [dell8Fc8Page.viewKey]: "Dell8Fc8",
  [amiDecryptorPage.viewKey]: "AmiDecryptor",
  [biosPasswordPage.viewKey]: "BiosPassword",
  [microscopePage.viewKey]: "Microscope",
  [alienServerPage.viewKey]: "AlienServer",
  [boardViewerPage.viewKey]: "Boardviewer",
  [settingsPage.viewKey]: "Settings"
};

const hashRouteMap = {
  dashboard: dashboardHomePage.viewKey,
  dashboardhome: dashboardHomePage.viewKey,
  bios: "BIOS",
  boardview: "Boardview",
  schematics: "Schematics",
  problemsolving: "ProblemSolving",
  datasheets: "Datasheets",
  spiflash: spiFlashPage.viewKey,
  toolspiflash: spiFlashPage.viewKey,
  meanalyzer: meAnalyzerPage.viewKey,
  toolmeanalyzer: meAnalyzerPage.viewKey,
  uefitools: uefiToolPage.viewKey,
  tooluefitools: uefiToolPage.viewKey,
  tooluefi: uefiToolPage.viewKey,
  biosvendordetect: biosVendorDetectPage.viewKey,
  toolbiosvendordetect: biosVendorDetectPage.viewKey,
  filehashcompare: fileHashComparePage.viewKey,
  toolfilehashcompare: fileHashComparePage.viewKey,
  resistorcalculator: resistorCalculatorPage.viewKey,
  toolresistorcalculator: resistorCalculatorPage.viewKey,
  dumpbioslenovo: lenovoBiosPatchPage.viewKey,
  tooldumpbioslenovo: lenovoBiosPatchPage.viewKey,
  dell8fc8: dell8Fc8Page.viewKey,
  tooldell8fc8: dell8Fc8Page.viewKey,
  amidecryptor: amiDecryptorPage.viewKey,
  toolamidecryptor: amiDecryptorPage.viewKey,
  biospassword: biosPasswordPage.viewKey,
  toolbiospassword: biosPasswordPage.viewKey,
  microscope: microscopePage.viewKey,
  toolmicroscope: microscopePage.viewKey,
  alienserver: alienServerPage.viewKey,
  toolalienserver: alienServerPage.viewKey,
  boardviewer: boardViewerPage.viewKey,
  toolboardviewer: boardViewerPage.viewKey,
  settings: settingsPage.viewKey
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function getViewButton(viewKey) {
  const navMap = {
    [dashboardHomePage.viewKey]: navDashboard,
    BIOS: navBios,
    Boardview: navBoardview,
    Schematics: navSchematics,
    ProblemSolving: navProblemSolving,
    Datasheets: navDatasheets,
    [spiFlashPage.viewKey]: toolSpiFlash,
    [meAnalyzerPage.viewKey]: toolMeAnalyzer,
    [uefiToolPage.viewKey]: toolUefi,
    [biosVendorDetectPage.viewKey]: toolBiosVendorDetect,
    [fileHashComparePage.viewKey]: toolFileHashCompare,
    [resistorCalculatorPage.viewKey]: toolResistorCalculator,
    [lenovoBiosPatchPage.viewKey]: toolDumpBiosLenovo,
    [dell8Fc8Page.viewKey]: toolDell8Fc8,
    [amiDecryptorPage.viewKey]: toolAmiDecryptor,
    [biosPasswordPage.viewKey]: toolBiosPassword,
    [microscopePage.viewKey]: toolMicroscope,
    [boardViewerPage.viewKey]: toolOther,
    [settingsPage.viewKey]: navSettings
  };

  return navMap[viewKey] || null;
}

function parseHashRouteState(hash = window.location.hash) {
  const rawValue = String(hash || "")
    .replace(/^#/, "")
    .trim();

  if (!rawValue) {
    return {
      viewKey: null,
      messageId: 0,
      shareViewKey: ""
    };
  }

  const [routePart, queryPart = ""] = rawValue.split("?");
  const normalizedValue = routePart
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  const viewKey = hashRouteMap[normalizedValue] || null;
  const params = new URLSearchParams(queryPart);
  let messageId = 0;

  for (const [key, value] of params.entries()) {
    if (String(key || "").trim().toLowerCase() !== "messageid") {
      continue;
    }

    const parsedMessageId = Number.parseInt(String(value || "").trim(), 10);
    if (Number.isFinite(parsedMessageId) && parsedMessageId > 0) {
      messageId = parsedMessageId;
    }
    break;
  }

  const shareViewKey = viewKey && isTelegramCatalogView(viewKey) && messageId > 0
    ? viewKey
    : "";

  return {
    viewKey,
    messageId: shareViewKey ? messageId : 0,
    shareViewKey
  };
}

function buildViewHash(viewKey, options = {}) {
  const hashValue = viewHashMap[viewKey];
  if (!hashValue) {
    return "";
  }

  const messageId = Number(options.messageId || 0);
  if (isTelegramCatalogView(viewKey) && messageId > 0) {
    return `#${hashValue}?MessageId=${messageId}`;
  }

  return `#${hashValue}`;
}

function updateViewHash(viewKey, options = {}) {
  const nextHash = buildViewHash(viewKey, options);
  if (!nextHash) {
    return;
  }

  if (window.location.hash === nextHash) {
    return;
  }

  window.location.hash = nextHash.slice(1);
}

function getViewFromHash(hash = window.location.hash) {
  return parseHashRouteState(hash).viewKey;
}

function getCatalogMessageIdFromHash(viewKey = currentCatalogView, hash = window.location.hash) {
  const routeState = parseHashRouteState(hash);
  return routeState.shareViewKey === viewKey ? routeState.messageId : 0;
}

async function restoreViewFromHash() {
  const routeState = parseHashRouteState();
  const targetView = routeState.viewKey;
  const shareStateChanged =
    routeState.shareViewKey !== currentHashShareViewKey ||
    routeState.messageId !== currentHashShareMessageId;

  currentHashShareViewKey = routeState.shareViewKey;
  currentHashShareMessageId = routeState.messageId;

  if (!targetView || (targetView === currentCatalogView && !shareStateChanged)) {
    return;
  }

  currentCatalogView = targetView;

  if (dashboardPanel?.classList.contains("hidden")) {
    return;
  }

  if (isTelegramCatalogView(targetView)) {
    await navigateTelegramCatalog(targetView, getViewButton(targetView));
    return;
  }

  catalogItems = catalogCache;
  filterCatalogItems();
}

function resetCatalog() {
  cancelActiveTelegramCategorySync();
  catalogLoaded = false;
  catalogItems = [];
  catalogCache = [];
  currentChannelRole = "";
  currentBiosChannelRole = "";
  currentBoardviewChannelRole = "";
  currentSchematicsChannelRole = "";
  currentProblemSolvingChannelRole = "";
  currentDatasheetsChannelRole = "";
  isSchematicsMember = false;
  isProblemSolvingMember = false;
  isDatasheetsMember = false;
  setChannelJoinRequired("BIOS", false);
  setChannelJoinRequired("Boardview", false);
  setChannelJoinRequired("Schematics", false);
  setChannelJoinRequired("ProblemSolving", false);
  setChannelJoinRequired("Datasheets", false);
  telegramCatalogState.BIOS.requestToken = 0;
  telegramCatalogState.BIOS.hasMore = false;
  telegramCatalogState.BIOS.nextOffset = 0;
  telegramCatalogState.BIOS.loadingMore = false;
  telegramCatalogState.BIOS.cachedFirstPageItems = [];
  telegramCatalogState.BIOS.cachedFirstPageHasMore = false;
  telegramCatalogState.BIOS.cachedFirstPageNextOffset = 0;
  telegramCatalogState.BIOS.lastStatsCacheKey = "";
  telegramCatalogState.Boardview.requestToken = 0;
  telegramCatalogState.Boardview.hasMore = false;
  telegramCatalogState.Boardview.nextOffset = 0;
  telegramCatalogState.Boardview.loadingMore = false;
  telegramCatalogState.Boardview.cachedFirstPageItems = [];
  telegramCatalogState.Boardview.cachedFirstPageHasMore = false;
  telegramCatalogState.Boardview.cachedFirstPageNextOffset = 0;
  telegramCatalogState.Boardview.lastStatsCacheKey = "";
  telegramCatalogState.Schematics.requestToken = 0;
  telegramCatalogState.Schematics.hasMore = false;
  telegramCatalogState.Schematics.nextOffset = 0;
  telegramCatalogState.Schematics.loadingMore = false;
  telegramCatalogState.Schematics.cachedFirstPageItems = [];
  telegramCatalogState.Schematics.cachedFirstPageHasMore = false;
  telegramCatalogState.Schematics.cachedFirstPageNextOffset = 0;
  telegramCatalogState.Schematics.lastStatsCacheKey = "";
  telegramCatalogState.ProblemSolving.requestToken = 0;
  telegramCatalogState.ProblemSolving.hasMore = false;
  telegramCatalogState.ProblemSolving.nextOffset = 0;
  telegramCatalogState.ProblemSolving.loadingMore = false;
  telegramCatalogState.ProblemSolving.cachedFirstPageItems = [];
  telegramCatalogState.ProblemSolving.cachedFirstPageHasMore = false;
  telegramCatalogState.ProblemSolving.cachedFirstPageNextOffset = 0;
  telegramCatalogState.ProblemSolving.lastStatsCacheKey = "";
  telegramCatalogState.Datasheets.requestToken = 0;
  telegramCatalogState.Datasheets.hasMore = false;
  telegramCatalogState.Datasheets.nextOffset = 0;
  telegramCatalogState.Datasheets.loadingMore = false;
  telegramCatalogState.Datasheets.cachedFirstPageItems = [];
  telegramCatalogState.Datasheets.cachedFirstPageHasMore = false;
  telegramCatalogState.Datasheets.cachedFirstPageNextOffset = 0;
  telegramCatalogState.Datasheets.lastStatsCacheKey = "";
  clearCatalogRealtimeReloads();
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
  closeCatalogDeleteModal({ force: true, restoreFocus: false });
  toggleElement(catalogContextPanel, false);
  closeProblemSolvingViewer();
}

function clearCatalogRealtimeReloads() {
  for (const timerId of pendingCatalogRealtimeReloads.values()) {
    window.clearTimeout(timerId);
  }

  pendingCatalogRealtimeReloads.clear();
}

function closeCatalogEventStream() {
  if (catalogEventReconnectTimerId) {
    window.clearTimeout(catalogEventReconnectTimerId);
    catalogEventReconnectTimerId = 0;
  }

  if (catalogEventSource) {
    catalogEventSource.close();
    catalogEventSource = null;
  }

  updateServiceTrafficIndicator();
}

function scheduleCatalogEventReconnect() {
  if (catalogEventReconnectTimerId || catalogEventSource) {
    return;
  }

  catalogEventReconnectTimerId = window.setTimeout(() => {
    catalogEventReconnectTimerId = 0;
    ensureCatalogEventStreamConnected();
  }, 3000);
}

function scheduleCatalogRealtimeReload(category) {
  if (!category) {
    return;
  }

  const previousTimerId = pendingCatalogRealtimeReloads.get(category);
  if (previousTimerId) {
    window.clearTimeout(previousTimerId);
  }

  const timerId = window.setTimeout(async () => {
    pendingCatalogRealtimeReloads.delete(category);
    resetTelegramCatalogFirstPageCache(category);

    try {
      if (currentCatalogView === category && isTelegramCatalogView(category)) {
        await loadCatalog();
      }
    } catch (error) {
      console.warn(`Gagal memuat ulang cache ${category} dari event realtime`, error);
    }
  }, 250);

  pendingCatalogRealtimeReloads.set(category, timerId);
}

function ensureCatalogEventStreamConnected() {
  if (catalogEventSource || typeof EventSource !== "function") {
    return;
  }

  const eventStreamUrl = `${serviceBaseUrl}/catalog/events`;
  const eventSource = new EventSource(eventStreamUrl);

  eventSource.addEventListener("catalog-cache-changed", (event) => {
    let payload;
    try {
      payload = JSON.parse(event.data || "{}");
    } catch {
      return;
    }

    const category = String(payload?.category || "").trim();
    if (!category) {
      return;
    }

    scheduleCatalogRealtimeReload(category);
  });

  eventSource.onerror = () => {
    if (catalogEventSource !== eventSource) {
      return;
    }

    if (eventSource.readyState === EventSource.CLOSED) {
      closeCatalogEventStream();
      scheduleCatalogEventReconnect();
    }
  };

  catalogEventSource = eventSource;
  updateServiceTrafficIndicator();
}

function isOwnerRole() {
  if (currentCatalogView === "ProblemSolving") {
    return currentProblemSolvingChannelRole.toLowerCase() === "owner";
  }

  if (currentCatalogView === "Schematics") {
    return currentSchematicsChannelRole.toLowerCase() === "owner";
  }

  if (currentCatalogView === "Datasheets") {
    return currentDatasheetsChannelRole.toLowerCase() === "owner";
  }

  const activeRole = currentCatalogView === "Boardview" ? currentBoardviewChannelRole : currentBiosChannelRole;
  return activeRole.toLowerCase() === "owner";
}

function canManageBiosCatalog() {
  const normalizedRole = getDisplayRoleForView(currentCatalogView).toLowerCase();
  return normalizedRole === "owner" || normalizedRole === "admin";
}

function isTelegramCatalogView(viewKey = currentCatalogView) {
  return viewKey === "BIOS" || viewKey === "Boardview" || viewKey === "Schematics" || viewKey === "ProblemSolving" || viewKey === "Datasheets";
}

function getTelegramCatalogConfig(viewKey = currentCatalogView) {
  return telegramCatalogConfigs[viewKey] || telegramCatalogConfigs.BIOS;
}

function getTelegramCatalogState(viewKey = currentCatalogView) {
  return telegramCatalogState[viewKey] || telegramCatalogState.BIOS;
}

function supportsCategoryTelegramStatsSync(viewKey = currentCatalogView) {
  return viewKey === "BIOS" ||
    viewKey === "Boardview" ||
    viewKey === "Schematics" ||
    viewKey === "ProblemSolving" ||
    viewKey === "Datasheets";
}

function buildTelegramCategoryStatsCacheKey(stats) {
  if (!stats || typeof stats !== "object") {
    return "";
  }

  return String(stats.cacheVersion || "").trim();
}

function getTelegramCatalogFirstPageStorageKey(viewKey) {
  return `${telegramCatalogFirstPageStoragePrefix}${viewKey}`;
}

function readTelegramCatalogFirstPageFromStorage(viewKey) {
  if (!isTelegramCatalogView(viewKey)) {
    return null;
  }

  try {
    const rawPayload = localStorage.getItem(getTelegramCatalogFirstPageStorageKey(viewKey));
    if (!rawPayload) {
      return null;
    }

    const payload = JSON.parse(rawPayload);
    const savedAt = Number(payload?.savedAt || 0);
    if (!Array.isArray(payload?.items) || !savedAt || Date.now() - savedAt > telegramCatalogFirstPageMaxAgeMs) {
      localStorage.removeItem(getTelegramCatalogFirstPageStorageKey(viewKey));
      return null;
    }

    return {
      items: payload.items,
      hasMore: Boolean(payload.hasMore),
      nextOffset: Number(payload.nextOffset || payload.items.length || 0),
      cacheVersion: String(payload.cacheVersion || "")
    };
  } catch {
    return null;
  }
}

function writeTelegramCatalogFirstPageToStorage(viewKey, state) {
  if (!isTelegramCatalogView(viewKey) || !Array.isArray(state.cachedFirstPageItems)) {
    return;
  }

  try {
    localStorage.setItem(
      getTelegramCatalogFirstPageStorageKey(viewKey),
      JSON.stringify({
        items: state.cachedFirstPageItems.slice(0, 5),
        hasMore: Boolean(state.cachedFirstPageHasMore),
        nextOffset: Number(state.cachedFirstPageNextOffset || state.cachedFirstPageItems.length || 0),
        cacheVersion: state.lastStatsCacheKey || "",
        savedAt: Date.now()
      })
    );
  } catch {
  }
}

function clearTelegramCatalogFirstPageStorage(viewKey) {
  if (!isTelegramCatalogView(viewKey)) {
    return;
  }

  try {
    localStorage.removeItem(getTelegramCatalogFirstPageStorageKey(viewKey));
  } catch {
  }
}

function hydrateTelegramCatalogFirstPageFromStorage(viewKey, state) {
  const cached = readTelegramCatalogFirstPageFromStorage(viewKey);
  if (!cached) {
    return false;
  }

  catalogItems = [...cached.items];
  state.hasMore = cached.hasMore;
  state.nextOffset = cached.nextOffset;
  state.cachedFirstPageItems = [...cached.items];
  state.cachedFirstPageHasMore = cached.hasMore;
  state.cachedFirstPageNextOffset = cached.nextOffset;
  state.lastStatsCacheKey = cached.cacheVersion;
  return true;
}

function isAbortError(error) {
  return error?.name === "AbortError" || error?.isAbortError === true;
}

function cancelActiveTelegramCategorySync(nextViewKey = "") {
  if (!activeTelegramCategorySync?.controller) {
    return;
  }

  if (nextViewKey && activeTelegramCategorySync.viewKey === nextViewKey) {
    return;
  }

  activeTelegramCategorySync.controller.abort();
  activeTelegramCategorySync = null;
}

function applyTelegramCatalogPage(viewKey, state, catalog) {
  catalogItems = Array.isArray(catalog?.items) ? catalog.items : [];
  state.hasMore = Boolean(catalog?.hasMore);
  state.nextOffset = Number(catalog?.nextOffset || catalogItems.length || 0);
  state.cachedFirstPageItems = [...catalogItems];
  state.cachedFirstPageHasMore = state.hasMore;
  state.cachedFirstPageNextOffset = state.nextOffset;
  if (catalog?.cacheVersion) {
    state.lastStatsCacheKey = String(catalog.cacheVersion);
  }
  writeTelegramCatalogFirstPageToStorage(viewKey, state);
}

function resetTelegramCatalogFirstPageCache(viewKey = currentCatalogView) {
  if (!isTelegramCatalogView(viewKey)) {
    return;
  }

  const state = getTelegramCatalogState(viewKey);
  state.cachedFirstPageItems = [];
  state.cachedFirstPageHasMore = false;
  state.cachedFirstPageNextOffset = 0;
  state.lastStatsCacheKey = "";
  state.hasMore = false;
  state.nextOffset = 0;
  state.loadingMore = false;
  clearTelegramCatalogFirstPageStorage(viewKey);
}

async function loadTelegramCatalogCachePreview(viewKey, state, requestToken) {
  const canUseClientCache = hasCurrentCatalogAccess(viewKey);
  if (canUseClientCache && Array.isArray(state.cachedFirstPageItems) && (state.cachedFirstPageItems.length > 0 || state.lastStatsCacheKey)) {
    catalogItems = [...state.cachedFirstPageItems];
    state.hasMore = Boolean(state.cachedFirstPageHasMore);
    state.nextOffset = Number(state.cachedFirstPageNextOffset || catalogItems.length || 0);
    return { cacheAvailable: true, cacheVersion: state.lastStatsCacheKey || "" };
  }

  if (canUseClientCache && hydrateTelegramCatalogFirstPageFromStorage(viewKey, state)) {
    return { cacheAvailable: true, cacheVersion: state.lastStatsCacheKey || "" };
  }

  const path = `/catalog?category=${encodeURIComponent(viewKey)}&limit=5&cacheOnly=true`;
  const catalog = await fetchJson(path);
  if (requestToken !== state.requestToken) {
    return { cacheAvailable: false, cacheVersion: "" };
  }

  if (!catalog?.cacheAvailable) {
    return { cacheAvailable: false, cacheVersion: "" };
  }

  applyTelegramCatalogPage(viewKey, state, catalog);
  return { cacheAvailable: true, cacheVersion: String(catalog.cacheVersion || "") };
}

async function syncTelegramCategoryInBackground(viewKey, state, requestToken, currentCacheVersion) {
  if (!supportsCategoryTelegramStatsSync(viewKey)) {
    return;
  }

  cancelActiveTelegramCategorySync();
  const abortController = new AbortController();
  activeTelegramCategorySync = {
    viewKey,
    requestToken,
    controller: abortController
  };

  try {
    const stats = await fetchJson(`/catalog/stats?category=${encodeURIComponent(viewKey)}`, {
      signal: abortController.signal
    });
    if (requestToken !== state.requestToken || currentCatalogView !== viewKey) {
      return;
    }

    const statsCacheKey = buildTelegramCategoryStatsCacheKey(stats);
    if (!statsCacheKey || statsCacheKey === currentCacheVersion) {
      if (statsCacheKey) {
        state.lastStatsCacheKey = statsCacheKey;
      }
      return;
    }

    const catalog = await fetchJson(`/catalog?category=${encodeURIComponent(viewKey)}&limit=5&cacheOnly=true`, {
      signal: abortController.signal
    });
    if (requestToken !== state.requestToken || currentCatalogView !== viewKey || !catalog?.cacheAvailable) {
      return;
    }

    applyTelegramCatalogPage(viewKey, state, catalog);
    filterCatalogItems();
  } catch (error) {
    if (isAbortError(error)) {
      return;
    }
    console.warn(`Gagal sinkronisasi background ${viewKey}`, error);
  } finally {
    if (activeTelegramCategorySync?.controller === abortController) {
      activeTelegramCategorySync = null;
    }
  }
}

function notifyCatalogSearchCacheMissValidation(viewKey, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery || !hasCurrentCatalogAccess(viewKey)) {
    return;
  }

  const noticeKey = `${viewKey}:${normalizedQuery}`;
  const retryAfter = Number(catalogSearchCacheMissNoticeByQuery.get(noticeKey) || 0);
  const now = Date.now();
  if (retryAfter > now) {
    return;
  }

  catalogSearchCacheMissNoticeByQuery.set(noticeKey, now + catalogSearchCacheMissNoticeCooldownMs);
  const config = getTelegramCatalogConfig(viewKey);
  setNotice(`Tidak ada hasil di cache ${config.displayName}. Backend sedang cek Google Drive di belakang.`, "info");
}

function getDisplayRoleForView(viewKey = currentCatalogView) {
  if (viewKey === "ProblemSolving") {
    return currentProblemSolvingChannelRole || currentChannelRole;
  }

  if (viewKey === "Schematics") {
    return currentSchematicsChannelRole || currentChannelRole;
  }

  if (viewKey === "Datasheets") {
    return currentDatasheetsChannelRole || currentChannelRole;
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

function isDatasheetsView(viewKey = currentCatalogView) {
  return viewKey === "Datasheets";
}

function isSchematicsView(viewKey = currentCatalogView) {
  return viewKey === "Schematics";
}

function isJoinManagedCatalogView(viewKey = currentCatalogView) {
  return viewKey === "BIOS" || viewKey === "Boardview" || viewKey === "Schematics" || viewKey === "ProblemSolving" || viewKey === "Datasheets";
}

function requiresChannelJoin(viewKey = currentCatalogView) {
  return Boolean(catalogJoinRequiredState[viewKey]);
}

function hasCurrentCatalogAccess(viewKey = currentCatalogView) {
  if (viewKey === "BIOS") {
    return Boolean(currentBiosChannelRole || currentChannelRole);
  }

  if (viewKey === "Boardview") {
    return Boolean(currentBoardviewChannelRole);
  }

  if (viewKey === "Schematics") {
    return isSchematicsMember || Boolean(currentSchematicsChannelRole);
  }

  if (viewKey === "ProblemSolving") {
    return isProblemSolvingMember || Boolean(currentProblemSolvingChannelRole);
  }

  if (viewKey === "Datasheets") {
    return isDatasheetsMember || Boolean(currentDatasheetsChannelRole);
  }

  return true;
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
      title: "Akses BIOS belum aktif.",
      description: "Minta Owner atau Admin membuka akses BIOS untuk akun ini, lalu refresh katalog.",
      buttonId: "biosJoinButton",
      buttonLabel: "Aktifkan Akses BIOS",
      link: currentRequiredChannelInviteLink,
      emptyMessage: "Akses BIOS untuk akun ini belum aktif. Minta Owner atau Admin mengaktifkannya lalu refresh katalog."
    };
  }

  if (viewKey === "Boardview") {
    return {
      title: "Gabung channel Boardview dulu untuk membuka katalog.",
      description: "Setelah berhasil join, katalog Boardview bisa langsung dibuka dan tombol refresh akan memakai cache backend.",
      buttonId: "boardviewJoinButton",
      buttonLabel: "Gabung Channel Boardview",
      link: currentBoardviewChannelInviteLink,
      emptyMessage: "Gabung channel Boardview dulu, lalu buka ulang atau refresh katalog."
    };
  }

  if (viewKey === "Schematics") {
    return {
      title: "Gabung channel Schematics dulu untuk membuka katalog.",
      description: "Setelah berhasil join, katalog Schematics bisa langsung dibuka dan file PDF dapat dilihat dari dashboard.",
      buttonId: "schematicsJoinButton",
      buttonLabel: "Gabung Channel Schematics",
      link: currentSchematicsChannelInviteLink,
      emptyMessage: "Gabung channel Schematics dulu, lalu refresh katalog."
    };
  }

  if (viewKey === "Datasheets") {
    return {
      title: "Gabung channel Datasheets dulu untuk membuka katalog.",
      description: "Setelah berhasil join, katalog Datasheets bisa langsung dibuka dan file PDF dapat diunduh dari dashboard.",
      buttonId: "datasheetsJoinButton",
      buttonLabel: "Gabung Channel Datasheets",
      link: currentDatasheetsChannelInviteLink,
      emptyMessage: "Gabung channel Datasheets dulu, lalu refresh katalog."
    };
  }

  return {
    title: "Gabung channel Problem Solving dulu untuk membuka katalog.",
    description: "Setelah berhasil join, Problem Solving akan muncul list katalog.",
    buttonId: "problemSolvingJoinButton",
    buttonLabel: "Gabung Channel",
    link: currentProblemSolvingChannelInviteLink,
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
  const showUploadButton = isTelegramCatalogView(viewKey) && canManageBiosCatalog();
  toggleElement(catalogUploadButton, showUploadButton);

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
  dashboardHomePage.setVisible?.(viewKey === dashboardHomePage.viewKey);
  spiFlashPage.setVisible?.(viewKey === spiFlashPage.viewKey);
  meAnalyzerPage.setVisible?.(viewKey === meAnalyzerPage.viewKey);
  uefiToolPage.setVisible?.(viewKey === uefiToolPage.viewKey);
  biosVendorDetectPage.setVisible?.(viewKey === biosVendorDetectPage.viewKey);
  fileHashComparePage.setVisible?.(viewKey === fileHashComparePage.viewKey);
  resistorCalculatorPage.setVisible?.(viewKey === resistorCalculatorPage.viewKey);
  lenovoBiosPatchPage.setVisible?.(viewKey === lenovoBiosPatchPage.viewKey);
  dell8Fc8Page.setVisible?.(viewKey === dell8Fc8Page.viewKey);
  amiDecryptorPage.setVisible?.(viewKey === amiDecryptorPage.viewKey);
  biosPasswordPage.setVisible?.(viewKey === biosPasswordPage.viewKey);
  microscopePage.setVisible?.(viewKey === microscopePage.viewKey);
  alienServerPage.setVisible?.(viewKey === alienServerPage.viewKey);
  boardViewerPage.setVisible?.(viewKey === boardViewerPage.viewKey);
  settingsPage.setVisible?.(viewKey === settingsPage.viewKey);

  if (viewKey === dashboardHomePage.viewKey) {
    dashboardHomePage.refresh?.();
  }

  if (viewKey === spiFlashPage.viewKey) {
    spiFlashPage.refresh?.();
  }

  if (viewKey === meAnalyzerPage.viewKey) {
    meAnalyzerPage.refresh?.();
  }

  if (viewKey === uefiToolPage.viewKey) {
    uefiToolPage.refresh?.();
  }

  if (viewKey === biosVendorDetectPage.viewKey) {
    biosVendorDetectPage.refresh?.();
  }

  if (viewKey === fileHashComparePage.viewKey) {
    fileHashComparePage.refresh?.();
  }

  if (viewKey === resistorCalculatorPage.viewKey) {
    resistorCalculatorPage.refresh?.();
  }

  if (viewKey === lenovoBiosPatchPage.viewKey) {
    lenovoBiosPatchPage.refresh?.();
  }

  if (viewKey === dell8Fc8Page.viewKey) {
    dell8Fc8Page.refresh?.();
  }

  if (viewKey === amiDecryptorPage.viewKey) {
    amiDecryptorPage.refresh?.();
  }

  if (viewKey === biosPasswordPage.viewKey) {
    biosPasswordPage.refresh?.();
  }

  if (viewKey === boardViewerPage.viewKey) {
    boardViewerPage.refresh?.();
  }

  if (viewKey === microscopePage.viewKey) {
    microscopePage.refresh?.();
  }

  if (viewKey === alienServerPage.viewKey) {
    alienServerPage.refresh?.();
  }

  if (viewKey === settingsPage.viewKey) {
    settingsPage.refresh?.();
  }
}

function hideWorkbench() {
  dashboardHomePage.setVisible?.(false);
  spiFlashPage.setVisible?.(false);
  meAnalyzerPage.setVisible?.(false);
  uefiToolPage.setVisible?.(false);
  biosVendorDetectPage.setVisible?.(false);
  fileHashComparePage.setVisible?.(false);
  resistorCalculatorPage.setVisible?.(false);
  lenovoBiosPatchPage.setVisible?.(false);
  dell8Fc8Page.setVisible?.(false);
  amiDecryptorPage.setVisible?.(false);
  biosPasswordPage.setVisible?.(false);
  microscopePage.setVisible?.(false);
  alienServerPage.setVisible?.(false);
  boardViewerPage.setVisible?.(false);
  settingsPage.setVisible?.(false);
}

function setActiveNav(targetKey) {
  const isToolView = targetKey.startsWith("tool_");
  const isBiosPatchView = targetKey === lenovoBiosPatchPage.viewKey
    || targetKey === dell8Fc8Page.viewKey
    || targetKey === amiDecryptorPage.viewKey;

  const navMap = {
    [dashboardHomePage.viewKey]: navDashboard,
    BIOS: navBios,
    Boardview: navBoardview,
    Schematics: navSchematics,
    ProblemSolving: navProblemSolving,
    Datasheets: navDatasheets,
    tool_spi_flash: toolSpiFlash,
    tool_me_analyzer: toolMeAnalyzer,
    tool_uefi: toolUefi,
    [biosVendorDetectPage.viewKey]: toolBiosVendorDetect,
    [fileHashComparePage.viewKey]: toolFileHashCompare,
    [resistorCalculatorPage.viewKey]: toolResistorCalculator,
    [lenovoBiosPatchPage.viewKey]: toolDumpBiosLenovo,
    [dell8Fc8Page.viewKey]: toolDell8Fc8,
    [amiDecryptorPage.viewKey]: toolAmiDecryptor,
    tool_bios_password: toolBiosPassword,
    tool_microscope: toolMicroscope,
    [alienServerPage.viewKey]: toolAlienServer,
    tool_boardviewer: toolOther,
    [settingsPage.viewKey]: navSettings
  };

  Object.entries(navMap).forEach(([key, element]) => {
    if (!element) {
      return;
    }

    element.classList.toggle("is-active", key === targetKey);
  });

  if (navTools) {
    navTools.open = isToolView;
    navTools.classList.toggle("is-active", isToolView);
  }

  if (toolBiosPatchGroup) {
    toolBiosPatchGroup.open = isBiosPatchView;
    toolBiosPatchGroup.classList.toggle("is-active", isBiosPatchView);
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

  if (viewKey === "Schematics") {
    setText(catalogEyebrow, "Schematics");
    setText(catalogTitle, "Koleksi file PDF schematic board");
    if (catalogSearchInput) {
      catalogSearchInput.placeholder = "Cari file schematic PDF...";
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

  if (viewKey === "Datasheets") {
    setText(catalogEyebrow, "Datasheets");
    setText(catalogTitle, "Koleksi file PDF datasheet komponen");
    if (catalogSearchInput) {
      catalogSearchInput.placeholder = "Cari nama file datasheet PDF...";
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

function renderFlashChipDeviceSelector(messageId) {
  return `
    <label
      class="catalog-flash-chip-device"
      data-connection-state="idle"
      title="Pilih device programmer dulu. Koneksi akan dicek otomatis setelah dipilih.">
      <span class="material-symbols-outlined">usb</span>
      <select
        class="catalog-flash-chip-device-select"
        data-flash-chip-device
        data-message-id="${messageId}"
        aria-label="Pilih device programmer untuk SPI Flash">
        <option value="">---Pilih Device---</option>
        <option value="CH341A">CH341A</option>
        <option value="STM32">STM32</option>
        <option value="EZP2019">EZP2019+</option>
      </select>
      <span class="catalog-flash-chip-device-indicator" data-flash-chip-device-indicator aria-hidden="true"></span>
    </label>
  `;
}

function renderBoardviewViewerSelector(messageId) {
  return `
    <label
      class="catalog-boardview-viewer"
      title="Pilih viewer Boardview dulu sebelum menekan tombol Buka.">
      <span class="material-symbols-outlined">tv_options_input_settings</span>
      <select
        class="catalog-boardview-viewer-select"
        data-boardview-viewer
        data-message-id="${messageId}"
        required
        aria-label="Pilih viewer untuk membuka Boardview">
        <option value="">---Pilih Viewer---</option>
        <option value="desktop">Boardview Desktop</option>
        <option value="teknisihub">Boardview TeknisiHub</option>
      </select>
    </label>
  `;
}

function renderCatalogShareButton(category, messageId, title = "") {
  const normalizedCategory = String(category || "").trim();
  const normalizedMessageId = Number(messageId || 0);
  if (!normalizedCategory || normalizedMessageId <= 0 || !viewHashMap[normalizedCategory]) {
    return "";
  }

  return `
    <button
      type="button"
      class="catalog-action-button ghost catalog-share-button"
      data-category="${escapeHtml(normalizedCategory)}"
      data-message-id="${normalizedMessageId}"
      data-title="${escapeHtml(title || normalizedCategory)}"
      title="Bagikan link item ini"
      aria-label="Bagikan ${escapeHtml(title || normalizedCategory)}">
      <span class="material-symbols-outlined">share</span>
    </button>
  `;
}

function buildCatalogShareLink(category, messageId) {
  const normalizedCategory = String(category || "").trim();
  const normalizedMessageId = Number(messageId || 0);
  if (!normalizedCategory || normalizedMessageId <= 0) {
    throw new Error("Link bagikan katalog tidak valid.");
  }

  const hash = buildViewHash(normalizedCategory, { messageId: normalizedMessageId });
  if (!hash) {
    throw new Error("Kategori katalog belum mendukung link bagikan.");
  }

  const currentUrl = new URL(window.location.href);
  currentUrl.hash = hash.slice(1);
  return currentUrl.toString();
}

async function copyTextToClipboard(text) {
  const value = String(text || "");
  if (!value) {
    throw new Error("Teks yang akan disalin kosong.");
  }

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const fallbackInput = document.createElement("textarea");
  fallbackInput.value = value;
  fallbackInput.setAttribute("readonly", "true");
  fallbackInput.style.position = "fixed";
  fallbackInput.style.opacity = "0";
  fallbackInput.style.pointerEvents = "none";
  document.body.appendChild(fallbackInput);
  fallbackInput.focus();
  fallbackInput.select();

  try {
    const copied = document.execCommand("copy");
    if (!copied) {
      throw new Error("Clipboard browser menolak menyalin link.");
    }
  } finally {
    fallbackInput.remove();
  }
}

function renderCatalogLoading(viewKey = currentCatalogView, placeholderCount = 4) {
  if (localWorkbenchViewKeys.has(viewKey)) {
    return;
  }

  hideWorkbench();
  if (!catalogList) {
    return;
  }

  updateCatalogHeader(viewKey);
  setActiveNav(viewKey);
  if (catalogCount) {
    catalogCount.textContent = "Memuat...";
  }

  if (catalogContextPanel) {
    catalogContextPanel.innerHTML = "";
    toggleElement(catalogContextPanel, false);
  }

  toggleElement(catalogPagination, false);
  catalogList.innerHTML = Array.from({ length: placeholderCount }, (_, index) => `
    <article class="catalog-card catalog-card-placeholder" aria-hidden="true" data-placeholder-index="${index + 1}">
      <div class="catalog-card-top">
        <span class="catalog-shimmer catalog-shimmer-pill catalog-shimmer-category"></span>
        <span class="catalog-shimmer catalog-shimmer-pill catalog-shimmer-access"></span>
      </div>
      <span class="catalog-shimmer catalog-shimmer-title"></span>
      <div class="catalog-shimmer-grid">
        <span class="catalog-shimmer catalog-shimmer-meta"></span>
        <span class="catalog-shimmer catalog-shimmer-meta"></span>
      </div>
      <span class="catalog-shimmer catalog-shimmer-row"></span>
      <span class="catalog-shimmer catalog-shimmer-row is-short"></span>
      <div class="catalog-card-actions">
        <span class="catalog-shimmer catalog-shimmer-button"></span>
        <span class="catalog-shimmer catalog-shimmer-button is-ghost"></span>
      </div>
    </article>
  `).join("");
  toggleElement(catalogSection, true);
}

function renderCatalog(items, viewKey = currentCatalogView) {
  if (localWorkbenchViewKeys.has(viewKey)) {
    setActiveNav(viewKey);
    if (catalogCount) {
      catalogCount.textContent = viewKey === dashboardHomePage.viewKey
        ? "HOME"
        : viewKey === spiFlashPage.viewKey
        ? "SPI UI"
        : viewKey === meAnalyzerPage.viewKey
        ? "MEA UI"
        : viewKey === uefiToolPage.viewKey
        ? "UEFI UI"
        : viewKey === biosVendorDetectPage.viewKey
        ? "BVD UI"
        : viewKey === biosPasswordPage.viewKey
        ? "PWD UI"
        : viewKey === alienServerPage.viewKey
        ? "ALN UI"
        : viewKey === boardViewerPage.viewKey
        ? "BRD UI"
        : "SET UI";
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
        <div class="catalog-file-row">
          <span class="material-symbols-outlined">fingerprint</span>
          <span>${escapeHtml(`MD5: ${item.md5 || "-"}`)}</span>
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
          ${isTelegramCatalogView(viewKey) && isOwnerRole() && item.messageId ? `
          <button
            type="button"
            class="catalog-action-button ghost catalog-delete-button"
            data-message-id="${item.messageId}">
            <span class="material-symbols-outlined">delete</span>
            <span>Hapus</span>
          </button>` : ""}
          ${renderCatalogShareButton(item.category || "ProblemSolving", item.messageId, item.fileName || item.title || "Problem Solving")}
        </div>
      </article>
    `).join("");

    toggleElement(catalogSection, true);
    return;
  }

  if (isDatasheetsView(viewKey)) {
    catalogList.innerHTML = items.map((item) => `
      <article class="catalog-card">
        <div class="catalog-card-top">
          <span class="catalog-category">${escapeHtml(item.category || "Datasheets")}</span>
          <span class="catalog-access">${escapeHtml(getDisplayRoleForView(viewKey) || item.accessLevel || "Member")}</span>
        </div>
        <h4>${escapeHtml(item.fileName || item.title || "Untitled.pdf")}</h4>
        <div class="catalog-file-row">
          <span class="material-symbols-outlined">fingerprint</span>
          <span>${escapeHtml(`MD5: ${item.md5 || "-"}`)}</span>
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
            class="catalog-action-button catalog-datasheets-view-button"
            data-message-id="${item.messageId || ""}"
            data-file-name="${escapeHtml(item.fileName || item.title || "")}">
            <span class="material-symbols-outlined">visibility</span>
            <span>Lihat</span>
          </button>
          <button
            type="button"
            class="catalog-action-button catalog-download-button"
            data-message-id="${item.messageId || ""}"
            data-category="Datasheets"
            data-title="${escapeHtml(item.fileName || item.title || "")}">
            <span class="material-symbols-outlined">download</span>
            <span>Unduh PDF</span>
          </button>
          ${isTelegramCatalogView(viewKey) && isOwnerRole() && item.messageId ? `
          <button
            type="button"
            class="catalog-action-button ghost catalog-delete-button"
            data-message-id="${item.messageId}">
            <span class="material-symbols-outlined">delete</span>
            <span>Hapus</span>
          </button>` : ""}
          ${renderCatalogShareButton(item.category || "Datasheets", item.messageId, item.fileName || item.title || "Datasheets")}
        </div>
      </article>
    `).join("");

    toggleElement(catalogSection, true);
    return;
  }

  if (isSchematicsView(viewKey)) {
    catalogList.innerHTML = items.map((item) => `
      <article class="catalog-card">
        <div class="catalog-card-top">
          <span class="catalog-category">${escapeHtml(item.category || "Schematics")}</span>
          <span class="catalog-access">${escapeHtml(getDisplayRoleForView(viewKey) || item.accessLevel || "Member")}</span>
        </div>
        <h4>${escapeHtml(item.fileName || item.title || "Untitled.pdf")}</h4>
        <dl class="catalog-meta-grid">
          <div>
            <dt>MODEL</dt>
            <dd>${escapeHtml(item.deviceModel || "-")}</dd>
          </div>
          <div>
            <dt>CODE BOARD</dt>
            <dd>${escapeHtml(item.boardCode || "-")}</dd>
          </div>
        </dl>
        <div class="catalog-file-row">
          <span class="material-symbols-outlined">fingerprint</span>
          <span>${escapeHtml(`MD5: ${item.md5 || "-"}`)}</span>
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
            class="catalog-action-button catalog-schematics-view-button"
            data-message-id="${item.messageId || ""}"
            data-file-name="${escapeHtml(item.fileName || item.title || "")}">
            <span class="material-symbols-outlined">visibility</span>
            <span>Lihat</span>
          </button>
          ${item.messageId && item.hasLocalCache ? `
          <button
            type="button"
            class="catalog-action-button ghost catalog-open-location-button"
            data-message-id="${item.messageId}"
            data-category="Schematics"
            data-file-name="${escapeHtml(item.fileName || item.title || "")}">
            <span class="material-symbols-outlined">folder_open</span>
            <span>Buka Lokasi File</span>
          </button>` : ""}
          <button
            type="button"
            class="catalog-action-button catalog-download-button"
            data-message-id="${item.messageId || ""}"
            data-category="Schematics"
            data-title="${escapeHtml(item.fileName || item.title || "")}">
            <span class="material-symbols-outlined">download</span>
            <span>Unduh PDF</span>
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
          ${renderCatalogShareButton(item.category || "Schematics", item.messageId, item.fileName || item.title || "Schematics")}
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
      <dl class="catalog-meta-grid">
        <div>
          <dt>MODEL</dt>
          <dd>${escapeHtml(item.deviceModel || "-")}</dd>
        </div>
        ${item.category === "BIOS" ? `
        <div>
          <dt>SN</dt>
          <dd>${escapeHtml(item.serialNumber || "-")}</dd>
        </div>` : ""}
        <div>
          <dt>CODE BOARD</dt>
          <dd>${escapeHtml(item.boardCode || "-")}</dd>
        </div>
        ${item.category === "BIOS" ? `
        <div>
          <dt>NOTE</dt>
          <dd>${escapeHtml(item.note || "-")}</dd>
        </div>` : ""}
      </dl>
      ${item.category === "BIOS" || item.category === "Boardview" ? `
      <div class="catalog-file-row">
        <span class="material-symbols-outlined">fingerprint</span>
        <span>${escapeHtml(`MD5: ${item.md5 || "-"}`)}</span>
      </div>` : `
      <div class="catalog-file-row">
        <span class="material-symbols-outlined">description</span>
        <span>${escapeHtml(item.fileName || item.title)}</span>
      </div>`}
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
        ${item.category === "Boardview" && item.messageId ? renderBoardviewViewerSelector(item.messageId) : ""}
        ${item.category === "Boardview" && item.messageId ? `
        <button
          type="button"
          class="catalog-action-button catalog-open-button"
          data-message-id="${item.messageId}"
          data-file-name="${escapeHtml(item.fileName || item.title || "")}"
          disabled
          aria-disabled="true">
          <span class="material-symbols-outlined">open_in_new</span>
          <span>Buka</span>
        </button>` : ""}
        ${(item.category === "Boardview" || item.category === "Schematics") && item.messageId && item.hasLocalCache ? `
        <button
          type="button"
          class="catalog-action-button ghost catalog-open-location-button"
          data-message-id="${item.messageId}"
          data-category="${escapeHtml(item.category || "")}"
          data-file-name="${escapeHtml(item.fileName || item.title || "")}">
          <span class="material-symbols-outlined">folder_open</span>
          <span>Buka Lokasi File</span>
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
        ${item.category === "BIOS" && item.messageId ? `
        ${renderFlashChipDeviceSelector(item.messageId)}
        <button
          type="button"
          class="catalog-action-button ghost catalog-flash-chip-button"
          data-message-id="${item.messageId}"
          data-title="${escapeHtml(item.fileName || item.title || "")}"
          disabled
          aria-disabled="true"
          title="Pilih device programmer dulu">
          <span class="material-symbols-outlined">memory</span>
          <span>Flash Chip</span>
        </button>` : ""}
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
        ${renderCatalogShareButton(item.category, item.messageId, item.title || item.fileName || item.category)}
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

function supportsCatalogAdditionalFiles(category) {
  return category === "BIOS" || category === "Boardview" || category === "Schematics";
}

function renderCatalogAdditionalFiles() {
  if (!catalogEditorAdditionalFilesSection || !catalogEditorAdditionalFilesList || !catalogEditorAddFileButton) {
    return;
  }

  const shouldShow = supportsCatalogAdditionalFiles(currentCatalogView) && catalogEditorMode !== "edit";
  toggleElement(catalogEditorAdditionalFilesSection, shouldShow);
  if (!shouldShow) {
    catalogEditorAdditionalFilesList.innerHTML = "";
    return;
  }

  if (catalogEditorAdditionalFilesNote) {
    catalogEditorAdditionalFilesNote.textContent = currentCatalogView === "BIOS"
      ? "Opsional untuk EC, FULL DUMP, DLL, dan file pendukung lain. Maksimal 5 file."
      : "Opsional untuk file pendukung, foto referensi, PDF terkait, dump terkait, atau file lain. Maksimal 5 file.";
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
  return category !== "ProblemSolving" && category !== "Schematics";
}

function supportsCatalogSerialNumber(category) {
  return category === "BIOS";
}

function supportsCatalogNoteField(category) {
  return category === "BIOS";
}

function getCatalogMetadataRequirementMessage(config) {
  if (config?.displayName === "Schematics") {
    return "Model Device Schematics wajib diisi sebelum submit.";
  }

  return `Model Device dan Code Board ${config.displayName} wajib diisi sebelum submit.`;
}

function supportsCatalogMd5Check(category) {
  return category === "BIOS" || category === "Boardview" || category === "Schematics" || category === "ProblemSolving" || category === "Datasheets";
}

function supportsCatalogMetadataAiSuggestion(category) {
  return category === "BIOS" || category === "Boardview" || category === "Schematics";
}

function buildCatalogMetadataAiSuggestionSignature(category, fileName, md5 = "") {
  return [
    String(category || "").trim(),
    String(fileName || "").trim().toLowerCase(),
    String(md5 || "").trim().toUpperCase()
  ].join("|");
}

function clearCatalogMetadataAiAppliedFieldsIfNeeded() {
  if (!catalogMetadataAiAppliedSuggestion) {
    return;
  }

  if (catalogEditorDeviceModel && catalogEditorDeviceModel.value.trim() === (catalogMetadataAiAppliedSuggestion.deviceModel || "")) {
    catalogEditorDeviceModel.value = "";
  }

  if (catalogEditorBoardCode && catalogEditorBoardCode.value.trim() === (catalogMetadataAiAppliedSuggestion.boardCode || "")) {
    catalogEditorBoardCode.value = "";
  }

  catalogMetadataAiAppliedSuggestion = null;
}

function resetCatalogMetadataAiSuggestionState({ closeModal = true, clearAppliedFields = false } = {}) {
  catalogMetadataAiSuggestionToken += 1;
  catalogMetadataAiSuggestionRequestedSignature = "";
  catalogMetadataAiSuggestionLookupSignature = "";
  catalogMetadataAiSuggestionLookupStatus = "idle";
  catalogMetadataAiSuggestionResolved = null;
  catalogMetadataAiSuggestionEligibleSignature = "";
  if (catalogMetadataAiSuggestionAbortController) {
    catalogMetadataAiSuggestionAbortController.abort();
    catalogMetadataAiSuggestionAbortController = null;
  }
  pendingCatalogMetadataAiSuggestion = null;

  if (clearAppliedFields) {
    clearCatalogMetadataAiAppliedFieldsIfNeeded();
  }

  if (closeModal) {
    closeCatalogAiSuggestionModal({ force: true, restoreFocus: false });
  }
}

function cancelCatalogMetadataAiSuggestionLookup() {
  if (catalogMetadataAiSuggestionAbortController) {
    catalogMetadataAiSuggestionAbortController.abort();
    catalogMetadataAiSuggestionAbortController = null;
  }

  catalogMetadataAiSuggestionLookupStatus = "cancelled";
  catalogMetadataAiSuggestionEligibleSignature = "";
}

function handleCatalogMetadataAiManualFieldInput() {
  if (!supportsCatalogMetadataAiSuggestion(currentCatalogView) || catalogEditorMode === "edit") {
    return;
  }

  if (!(catalogEditorDeviceModel?.value.trim() || "") && !(catalogEditorBoardCode?.value.trim() || "")) {
    return;
  }

  cancelCatalogMetadataAiSuggestionLookup();
  closeCatalogAiSuggestionModal({ force: true, restoreFocus: false });
  catalogMetadataAiAppliedSuggestion = null;
}

function startCatalogMetadataAiSuggestionLookup(category, fileName) {
  if (!supportsCatalogMetadataAiSuggestion(category) || catalogEditorMode === "edit") {
    return;
  }

  if ((catalogEditorDeviceModel?.value.trim() || "") || (catalogEditorBoardCode?.value.trim() || "")) {
    return;
  }

  const signature = buildCatalogMetadataAiSuggestionSignature(category, fileName);
  if (!signature || catalogMetadataAiSuggestionLookupSignature === signature) {
    return;
  }

  cancelCatalogMetadataAiSuggestionLookup();
  catalogMetadataAiSuggestionRequestedSignature = signature;
  catalogMetadataAiSuggestionLookupSignature = signature;
  catalogMetadataAiSuggestionLookupStatus = "pending";
  catalogMetadataAiSuggestionResolved = null;

  const token = ++catalogMetadataAiSuggestionToken;
  const abortController = new AbortController();
  catalogMetadataAiSuggestionAbortController = abortController;

  fetchJson("/catalog/ai-suggest-metadata", {
    method: "POST",
    body: JSON.stringify({
      category,
      fileName
    }),
    signal: abortController.signal
  }).then((suggestion) => {
    if (token !== catalogMetadataAiSuggestionToken || catalogMetadataAiSuggestionLookupSignature !== signature) {
      return;
    }

    catalogMetadataAiSuggestionAbortController = null;
    catalogMetadataAiSuggestionLookupStatus = suggestion?.shouldSuggest && (suggestion.deviceModel || suggestion.boardCode)
      ? "resolved"
      : "empty";
    catalogMetadataAiSuggestionResolved = suggestion?.shouldSuggest
      ? {
          ...suggestion,
          signature
        }
      : null;

    if (catalogMetadataAiSuggestionLookupStatus === "resolved" &&
        catalogMetadataAiSuggestionEligibleSignature === signature &&
        isCatalogEditorOpen() &&
        !(catalogEditorDeviceModel?.value.trim() || "") &&
        !(catalogEditorBoardCode?.value.trim() || "")) {
      openCatalogAiSuggestionModal(
        {
          ...catalogMetadataAiSuggestionResolved,
          signature
        },
        catalogEditorDeviceModel || catalogEditorBoardCode || catalogEditorFile
      );
    }
  }).catch((error) => {
    if (token !== catalogMetadataAiSuggestionToken || catalogMetadataAiSuggestionLookupSignature !== signature) {
      return;
    }

    catalogMetadataAiSuggestionAbortController = null;
    if (error?.name === "AbortError" || error?.isAbortError) {
      catalogMetadataAiSuggestionLookupStatus = "cancelled";
      return;
    }

    catalogMetadataAiSuggestionLookupStatus = "failed";
    catalogMetadataAiSuggestionResolved = null;
    console.warn("Catalog metadata AI suggestion failed", error);
  });
}

function finalizeCatalogMetadataAiSuggestionAfterDuplicateCheck(category, fileName, md5 = "") {
  const signature = buildCatalogMetadataAiSuggestionSignature(category, fileName);
  if (!signature || catalogMetadataAiSuggestionLookupSignature !== signature) {
    return;
  }

  catalogMetadataAiSuggestionEligibleSignature = signature;

  if (catalogMetadataAiSuggestionLookupStatus !== "resolved" || !catalogMetadataAiSuggestionResolved) {
    return;
  }

  if ((catalogEditorDeviceModel?.value.trim() || "") || (catalogEditorBoardCode?.value.trim() || "")) {
    return;
  }

  openCatalogAiSuggestionModal(
    {
      ...catalogMetadataAiSuggestionResolved,
      signature: buildCatalogMetadataAiSuggestionSignature(category, fileName, md5)
    },
    catalogEditorDeviceModel || catalogEditorBoardCode || catalogEditorFile
  );
}

function validateCatalogFileNameLength(fileName, displayName, options = {}) {
  const normalizedFileName = String(fileName || "").trim();
  const minimumLength = options.skipMinimumLength ? 1 : minCatalogFileNameLength;
  if (normalizedFileName.length < minimumLength || normalizedFileName.length > maxCatalogFileNameLength) {
    const minimumMessage = options.skipMinimumLength
      ? "minimal 1 karakter"
      : `minimal ${minCatalogFileNameLength} karakter`;
    const label = options.label || "Nama file";
    throw new Error(`${label} ${displayName} ${minimumMessage} dan maksimal ${maxCatalogFileNameLength} karakter.`);
  }
}

function getCatalogFileExtension(fileName) {
  const normalizedFileName = String(fileName || "").trim();
  const lastDotIndex = normalizedFileName.lastIndexOf(".");
  return lastDotIndex >= 0 ? normalizedFileName.slice(lastDotIndex) : "";
}

function shouldRequireBoardviewAlias(fileName, category = currentCatalogView) {
  const normalizedFileName = String(fileName || "").trim();
  return (category === "Boardview" || category === "Schematics") && normalizedFileName.length > 0 && normalizedFileName.length < minCatalogFileNameLength;
}

function validateBoardviewAliasName(aliasName, originalFileName, displayName) {
  const trimmedAliasName = String(aliasName || "").trim();
  if (!trimmedAliasName) {
    throw new Error(`Nama alias arsip ${displayName} wajib diisi jika nama file kurang dari ${minCatalogFileNameLength} karakter.`);
  }

  const extension = getCatalogFileExtension(originalFileName);
  const removableSuffixes = [".7z", extension].filter(Boolean);
  let normalizedAliasName = trimmedAliasName;
  for (const suffix of removableSuffixes) {
    if (!normalizedAliasName.toLowerCase().endsWith(suffix.toLowerCase())) {
      continue;
    }

    normalizedAliasName = normalizedAliasName.slice(0, -suffix.length).trim();
    break;
  }
  if (!normalizedAliasName) {
    throw new Error(`Nama alias arsip ${displayName} wajib diisi tanpa ekstensi file.`);
  }
  if (/[\\/:*?"<>|]/.test(normalizedAliasName)) {
    throw new Error(`Nama alias arsip ${displayName} mengandung karakter yang tidak valid untuk nama file.`);
  }

  validateCatalogFileNameLength(`${normalizedAliasName}.7z`, displayName, { label: "Nama arsip" });
  return normalizedAliasName;
}

function updateCatalogAliasField(selectedFileName = "", category = currentCatalogView) {
  if (!catalogEditorAliasField || !catalogEditorAliasName) {
    return;
  }

  const requiresAlias = shouldRequireBoardviewAlias(selectedFileName, category) && catalogEditorMode !== "edit";
  toggleElement(catalogEditorAliasField, requiresAlias);
  catalogEditorAliasName.required = requiresAlias;
  if (!requiresAlias) {
    catalogEditorAliasName.value = "";
    return;
  }

  const config = getTelegramCatalogConfig(category);
  catalogEditorAliasName.placeholder = `Wajib diisi untuk nama arsip .7z karena nama file ${config.displayName} kurang dari ${minCatalogFileNameLength} karakter. File utama di dalam arsip tetap nama asli.`;
}

function resetCatalogBiosDuplicateCheck() {
  catalogBiosDuplicateCheckToken += 1;
  catalogBiosDuplicateFound = false;
  resetCatalogMetadataAiSuggestionState({ clearAppliedFields: true });
  if (catalogEditorMd5) {
    catalogEditorMd5.value = "-";
  }
  if (catalogEditorAnalysisPanel) {
    catalogEditorAnalysisPanel.className = "catalog-analysis-panel hidden";
    catalogEditorAnalysisPanel.innerHTML = "";
  }
}

function renderCatalogAnalysisMatchLink(item, displayName) {
  const category = String(item?.category || "").trim();
  const messageId = Number(item?.messageId || 0);
  const label = escapeHtml(item?.fileName || item?.title || `File ${displayName}`);
  if (!category || messageId <= 0 || !viewHashMap[category]) {
    return `<strong>${label}</strong>`;
  }

  const targetHash = buildViewHash(category, { messageId });
  return `
    <a
      href="${escapeHtml(targetHash || "#")}"
      class="catalog-analysis-link"
      data-category="${escapeHtml(category)}"
      data-message-id="${messageId}">
      <strong>${label}</strong>
    </a>
  `;
}

function renderCatalogBiosDuplicateCheck(state, analysis = null) {
  if (!catalogEditorAnalysisPanel) {
    return;
  }

  const config = getTelegramCatalogConfig(currentCatalogView);
  const displayName = config?.displayName || "katalog";

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
    body = `<p>File sedang dihitung hash MD5 dan dicek ke katalog ${escapeHtml(displayName)}.</p>`;
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
            ${renderCatalogAnalysisMatchLink(item, displayName)}
            <span>${escapeHtml(item.postedAt || "-")} | ${escapeHtml(item.uploadedBy || "Unknown")}</span>
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

function buildTelegramCatalogRequestPath(viewKey, options = {}) {
  const params = new URLSearchParams();
  params.set("category", viewKey);
  params.set("limit", String(Math.max(1, Number(options.limit) || 5)));

  const offset = Math.max(0, Number(options.offset) || 0);
  if (offset > 0) {
    params.set("offset", String(offset));
  }

  const normalizedQuery = String(options.query || "").trim();
  if (normalizedQuery) {
    params.set("query", normalizedQuery);
  }

  if (options.cacheOnly) {
    params.set("cacheOnly", "true");
  }

  const messageId = Number(options.messageId || 0);
  if (messageId > 0) {
    params.set("messageId", String(messageId));
  }

  return `/catalog?${params.toString()}`;
}

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2).replace(/\.00$/, "")} MB`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2).replace(/\.00$/, "")} KB`;
  }

  return `${bytes} B`;
}

function validateCatalogFileSize(file, category, options = {}) {
  if (!file || category !== "BIOS") {
    return;
  }

  const minimumSize = options.isAdditionalFile ? minOptionalBiosFileSizeBytes : minBiosFileSizeBytes;
  if (file.size < minimumSize || file.size > maxBiosFileSizeBytes) {
    throw new Error(
      `Ukuran file BIOS ${file.name} tidak didukung. Ukuran file saat ini ${formatFileSize(file.size)}, sedangkan batas upload BIOS adalah ${formatFileSize(minimumSize)} sampai ${formatFileSize(maxBiosFileSizeBytes)}.`
    );
  }
}

async function checkSelectedCatalogDuplicate() {
  if (catalogEditorMode === "edit" || !supportsCatalogMd5Check(currentCatalogView) || !catalogEditorFile?.files?.length) {
    resetCatalogBiosDuplicateCheck();
    return;
  }

  const config = getTelegramCatalogConfig(currentCatalogView);
  const selectedFile = catalogEditorFile.files[0];
  validateCatalogFileNameLength(selectedFile.name, config.displayName, {
    skipMinimumLength: currentCatalogView === "Datasheets" || shouldRequireBoardviewAlias(selectedFile.name, currentCatalogView)
  });
  try {
    validateCatalogFileSize(selectedFile, currentCatalogView);
  } catch (error) {
    resetCatalogBiosDuplicateCheck();
    renderCatalogBiosDuplicateCheck("error", { message: error.message });
    return;
  }
  const lowerFileName = selectedFile.name.toLowerCase();
  const allowedExtensions = currentCatalogView === "Boardview"
    ? allowedBoardviewExtensions
    : currentCatalogView === "Schematics"
    ? allowedSchematicsExtensions
    : currentCatalogView === "ProblemSolving"
    ? [".md"]
    : currentCatalogView === "Datasheets"
    ? allowedDatasheetsExtensions
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

    if (!catalogBiosDuplicateFound) {
      finalizeCatalogMetadataAiSuggestionAfterDuplicateCheck(currentCatalogView, selectedFile.name, result.md5 || "");
    } else {
      cancelCatalogMetadataAiSuggestionLookup();
    }
  } catch (error) {
    if (token !== catalogBiosDuplicateCheckToken) {
      return;
    }

    cancelCatalogMetadataAiSuggestionLookup();
    catalogBiosDuplicateFound = false;
    if (catalogEditorMd5) {
      catalogEditorMd5.value = "-";
    }
    renderCatalogBiosDuplicateCheck("error", { message: error.message });
  }
}

function openCatalogEditor(mode, item = null) {
  catalogEditorMode = mode;
  resetCatalogMetadataAiSuggestionState({ clearAppliedFields: true });
  toggleElement(catalogEditorModal, true);
  if (!catalogEditorTitle || !catalogEditorSubmitButton) {
    return;
  }

  const targetCategory = item?.category || currentCatalogView;
  const config = getTelegramCatalogConfig(targetCategory);
  const isEditMode = mode === "edit";
  const isSimpleFileUpload = !isEditMode && (targetCategory === "ProblemSolving" || targetCategory === "Datasheets");
  const boardCodeRequired = isBoardCodeRequiredForCategory(targetCategory);
  const supportsSerialNumber = supportsCatalogSerialNumber(targetCategory);
  const supportsNote = supportsCatalogNoteField(targetCategory);
  const isMinimalMetadataEditMode = isEditMode && (targetCategory === "ProblemSolving" || targetCategory === "Datasheets");
  const showStructuredMetadataFields = !isSimpleFileUpload && !isMinimalMetadataEditMode;
  const shouldShowMetadataFieldsContainer = supportsCatalogMd5Check(targetCategory) || !isSimpleFileUpload;
  setText(catalogEditorTitle, isEditMode ? config.editTitle : config.uploadLabel);
  catalogEditorMessageId.value = isEditMode && item ? String(item.messageId || "") : "";
  catalogEditorDeviceModel.value = item?.deviceModel === "-" ? "" : (item?.deviceModel || "");
  catalogEditorSerialNumber.value = supportsSerialNumber && item?.serialNumber !== "-"
    ? (item?.serialNumber || "")
    : "";
  catalogEditorBoardCode.value = item?.boardCode === "-" ? "" : (item?.boardCode || "");
  catalogEditorNote.value = supportsNote && item?.note !== "-"
    ? (item?.note || "")
    : "";
  if (catalogEditorAliasName) {
    catalogEditorAliasName.value = "";
  }
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
    modalLabel.textContent = `Manajemen ${config.displayName}`;
  }
  if (fileLabel) {
    fileLabel.textContent = config.fileLabel;
  }
  updateCatalogAliasField("", targetCategory);
  toggleElement(catalogEditorMd5Field, supportsCatalogMd5Check(targetCategory));
  renderCatalogAdditionalFiles();
  if (isEditMode && supportsCatalogMd5Check(targetCategory) && catalogEditorMd5?.value) {
    renderCatalogBiosDuplicateCheck("result", {
      duplicateFound: false,
      message: `Metadata ${config.displayName} ini sudah menyimpan MD5 ${catalogEditorMd5.value}.`,
      md5: catalogEditorMd5.value,
      matchingItems: []
    });
  } else if (!isSimpleFileUpload && supportsCatalogMd5Check(targetCategory)) {
    resetCatalogBiosDuplicateCheck();
  } else {
    renderCatalogBiosDuplicateCheck("hidden");
  }
  toggleElement(catalogEditorMetadataFields, shouldShowMetadataFieldsContainer);
  toggleElement(catalogEditorDeviceModelField, showStructuredMetadataFields);
  toggleElement(catalogEditorBoardCodeField, showStructuredMetadataFields);
  toggleElement(catalogEditorSerialNumberField, !isSimpleFileUpload && supportsSerialNumber);
  toggleElement(catalogEditorNoteField, !isSimpleFileUpload && supportsNote);
  if (catalogEditorDeviceModel) {
    catalogEditorDeviceModel.required = showStructuredMetadataFields;
  }
  if (catalogEditorBoardCode) {
    catalogEditorBoardCode.required = showStructuredMetadataFields && boardCodeRequired;
  }
  [catalogEditorSerialNumber, catalogEditorNote].forEach((input) => {
    if (input) {
      input.required = false;
    }
  });

  catalogEditorSubmitButton.innerHTML = isEditMode
    ? `<span class="material-symbols-outlined">save</span><span>Simpan Perubahan</span>`
    : `<span class="material-symbols-outlined">upload_file</span><span>${escapeHtml(config.uploadLabel)}</span>`;
  catalogEditorSubmitButton.disabled = false;
  setCatalogEditorUploadProgress({ active: false });
}

function closeCatalogEditor() {
  toggleElement(catalogEditorModal, false);
  catalogEditorMode = "upload";
  resetCatalogMetadataAiSuggestionState({ clearAppliedFields: true });
  if (catalogEditorForm) {
    catalogEditorForm.reset();
  }
  resetCatalogBiosDuplicateCheck();
  if (catalogEditorFile) {
    catalogEditorFile.disabled = false;
    catalogEditorFile.required = false;
  }
  updateCatalogAliasField("", currentCatalogView);
  toggleElement(catalogEditorMd5Field, true);
  if (catalogEditorAdditionalFilesList) {
    catalogEditorAdditionalFilesList.innerHTML = "";
  }
  renderCatalogAdditionalFiles();
  toggleElement(catalogEditorMetadataFields, true);
  toggleElement(catalogEditorDeviceModelField, true);
  toggleElement(catalogEditorSerialNumberField, true);
  toggleElement(catalogEditorBoardCodeField, true);
  toggleElement(catalogEditorNoteField, true);
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
  setCatalogEditorUploadProgress({ active: false });
}

function normalizeCatalogDeleteSummaryValue(value, fallback) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized && normalized !== "-" ? normalized : fallback;
}

function setCatalogDeleteSubmitting(active) {
  catalogDeleteSubmitting = Boolean(active);
  if (catalogDeleteConfirmButton) {
    catalogDeleteConfirmButton.disabled = catalogDeleteSubmitting;
    catalogDeleteConfirmButton.innerHTML = catalogDeleteSubmitting
      ? `<span class="material-symbols-outlined is-spinning">progress_activity</span><span>Menghapus...</span>`
      : catalogDeleteConfirmDefaultMarkup;
  }

  [catalogDeleteCancelButton].forEach((button) => {
    if (button) {
      button.disabled = catalogDeleteSubmitting;
    }
  });
}

function openCatalogDeleteModal(item, triggerButton = null) {
  if (!catalogDeleteModal || !catalogDeleteConfirmButton) {
    const category = item?.category || currentCatalogView;
    const confirmed = window.confirm(`Hapus data ${category} ini?`);
    if (confirmed && item?.messageId) {
      deleteCatalogItem(category, Number(item.messageId)).catch((error) => {
        setNotice(error.message, true);
      });
    }
    return;
  }

  const category = normalizeCatalogDeleteSummaryValue(item?.category || currentCatalogView, currentCatalogView);
  const fileName = normalizeCatalogDeleteSummaryValue(
    item?.fileName || item?.title || `${category} #${item?.messageId || ""}`,
    `${category} #${item?.messageId || ""}`
  );
  const modelName = normalizeCatalogDeleteSummaryValue(item?.deviceModel, "Tidak ada model");
  const boardCode = normalizeCatalogDeleteSummaryValue(item?.boardCode, "Tidak ada board code");
  const cacheNotice = category === "BIOS"
    ? " Cache archive BIOS lokal yang sudah pernah tersimpan juga akan ikut dibersihkan."
    : "";

  pendingCatalogDeleteItem = item;
  pendingCatalogDeleteTriggerButton = triggerButton;
  setCatalogDeleteSubmitting(false);
  setText(catalogDeleteTitle, `Hapus ${category} ini?`);
  setText(
    catalogDeleteDescription,
    `Data berikut akan dihapus permanen dari dashboard dan tidak bisa dikembalikan dari UI.${cacheNotice}`
  );
  setText(catalogDeleteTargetName, fileName);
  setText(catalogDeleteCategoryValue, category);
  setText(catalogDeleteModelValue, modelName);
  setText(catalogDeleteBoardValue, boardCode);
  toggleElement(catalogDeleteModal, true);
  window.requestAnimationFrame(() => catalogDeleteConfirmButton.focus());
}

function closeCatalogDeleteModal({ force = false, restoreFocus = true } = {}) {
  if (catalogDeleteSubmitting && !force) {
    return;
  }

  toggleElement(catalogDeleteModal, false);
  pendingCatalogDeleteItem = null;
  setCatalogDeleteSubmitting(false);

  const focusTarget = pendingCatalogDeleteTriggerButton;
  pendingCatalogDeleteTriggerButton = null;
  if (restoreFocus && typeof focusTarget?.focus === "function") {
    window.requestAnimationFrame(() => focusTarget.focus());
  }
}

function formatCatalogAiConfidenceLabel(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "high"
    ? "High"
    : normalized === "low"
    ? "Low"
    : "Medium";
}

function openCatalogAiSuggestionModal(suggestion, triggerButton = null) {
  if (!suggestion) {
    return;
  }

  pendingCatalogMetadataAiSuggestion = suggestion;
  pendingCatalogMetadataAiSuggestionTriggerButton = triggerButton;

  if (!catalogAiSuggestionModal || !catalogAiSuggestionApplyButton) {
    const confirmed = window.confirm("Gemini menemukan saran Model Device dan Code Board. Pakai saran ini?");
    if (confirmed) {
      applyCatalogAiSuggestionToForm();
    }
    return;
  }

  setText(catalogAiSuggestionTitle, `Pakai saran ${suggestion.category || currentCatalogView}?`);
  setText(
    catalogAiSuggestionDescription,
    "Gemini mencari referensi dari nama file dan internet untuk membantu mengisi Model Device dan Code Board. Serial Number tetap diisi manual."
  );
  setText(catalogAiSuggestionTargetName, suggestion.fileName || "Nama file");
  setText(catalogAiSuggestionCategoryValue, suggestion.category || currentCatalogView);
  setText(catalogAiSuggestionModelValue, suggestion.deviceModel || "Tidak yakin");
  setText(catalogAiSuggestionBoardValue, suggestion.boardCode || "Tidak yakin");
  setText(catalogAiSuggestionConfidenceValue, formatCatalogAiConfidenceLabel(suggestion.confidence));

  if (catalogAiSuggestionReasoning) {
    const reasoning = String(suggestion.reasoning || "").trim();
    toggleElement(catalogAiSuggestionReasoning, Boolean(reasoning));
    catalogAiSuggestionReasoning.innerHTML = reasoning
      ? `
        <strong>Alasan singkat</strong>
        <p>${escapeHtml(reasoning)}</p>
      `
      : "";
  }

  if (catalogAiSuggestionSources) {
    const sources = Array.isArray(suggestion.sources) ? suggestion.sources.slice(0, 3) : [];
    toggleElement(catalogAiSuggestionSources, sources.length > 0);
    catalogAiSuggestionSources.innerHTML = sources.length
      ? `
        <strong>Referensi web</strong>
        <div class="catalog-ai-suggestion-source-list">
          ${sources.map((source) => `
            <a href="${escapeHtml(source.url || "#")}" target="_blank" rel="noreferrer noopener" class="catalog-ai-suggestion-source-link">
              <span>${escapeHtml(source.title || source.url || "Sumber web")}</span>
              <small>${escapeHtml(source.host || "")}</small>
            </a>
          `).join("")}
        </div>
      `
      : "";
  }

  toggleElement(catalogAiSuggestionModal, true);
  window.requestAnimationFrame(() => catalogAiSuggestionApplyButton.focus());
}

function closeCatalogAiSuggestionModal({ force = false, restoreFocus = true } = {}) {
  if (!force && !catalogAiSuggestionModal) {
    pendingCatalogMetadataAiSuggestion = null;
    pendingCatalogMetadataAiSuggestionTriggerButton = null;
    return;
  }

  toggleElement(catalogAiSuggestionModal, false);
  pendingCatalogMetadataAiSuggestion = null;

  const focusTarget = pendingCatalogMetadataAiSuggestionTriggerButton;
  pendingCatalogMetadataAiSuggestionTriggerButton = null;
  if (restoreFocus && typeof focusTarget?.focus === "function") {
    window.requestAnimationFrame(() => focusTarget.focus());
  }
}

function applyCatalogAiSuggestionToForm() {
  if (!pendingCatalogMetadataAiSuggestion) {
    return;
  }

  const suggestion = pendingCatalogMetadataAiSuggestion;
  const deviceModel = String(suggestion.deviceModel || "").trim();
  const boardCode = String(suggestion.boardCode || "").trim();

  if (catalogEditorDeviceModel && deviceModel) {
    catalogEditorDeviceModel.value = deviceModel;
  }

  if (catalogEditorBoardCode && boardCode) {
    catalogEditorBoardCode.value = boardCode;
  }

  catalogMetadataAiAppliedSuggestion = {
    signature: suggestion.signature || "",
    deviceModel,
    boardCode
  };

  closeCatalogAiSuggestionModal({ force: true, restoreFocus: false });
}

function openAboutModal() {
  toggleElement(aboutModal, true);
}

function closeAboutModal() {
  toggleElement(aboutModal, false);
}

function shouldHideIntroQuoteModal() {
  try {
    return localStorage.getItem(introQuoteDismissStorageKey) === "true";
  } catch {
    return false;
  }
}

function persistIntroQuotePreference(hidden) {
  try {
    if (hidden) {
      localStorage.setItem(introQuoteDismissStorageKey, "true");
      return;
    }

    localStorage.removeItem(introQuoteDismissStorageKey);
  } catch {
    // Ignore storage issues on file:// or blocked storage contexts.
  }
}

function getWibDateTimeParts() {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: wibTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hour12: false
    });
    const parts = formatter.formatToParts(new Date());
    const getPart = (type) => parts.find((part) => part.type === type)?.value || "";
    const year = getPart("year");
    const month = getPart("month");
    const day = getPart("day");
    const hour = Number.parseInt(getPart("hour"), 10);
    return {
      dateKey: `${year}-${month}-${day}`,
      hour: Number.isFinite(hour) ? hour : 12
    };
  } catch {
    const fallback = new Date();
    return {
      dateKey: fallback.toISOString().slice(0, 10),
      hour: fallback.getHours()
    };
  }
}

function getAutomaticWibThemeMode() {
  const { hour } = getWibDateTimeParts();
  return hour >= wibNightThemeStartHour || hour < wibNightThemeEndHour ? "dark" : "light";
}

function clearSavedThemeMode() {
  try {
    localStorage.removeItem(themeModeStorageKey);
    localStorage.removeItem(themeModeDateStorageKey);
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
}

function readSavedThemeMode() {
  try {
    const storedMode = localStorage.getItem(themeModeStorageKey);
    const storedDateKey = localStorage.getItem(themeModeDateStorageKey);
    const currentWibDateKey = getWibDateTimeParts().dateKey;
    if ((storedMode === "dark" || storedMode === "light") && storedDateKey === currentWibDateKey) {
      return storedMode;
    }

    if (storedMode || storedDateKey) {
      clearSavedThemeMode();
    }

    return "";
  } catch {
    return "";
  }
}

function getPreferredThemeMode() {
  const savedMode = readSavedThemeMode();
  if (savedMode) {
    return savedMode;
  }

  return getAutomaticWibThemeMode();
}

function updateThemeToggleButton(mode = "light") {
  if (!themeToggleButton) {
    return;
  }

  const isDarkMode = mode === "dark";
  const nextModeLabel = isDarkMode ? "Matikan mode malam" : "Aktifkan mode malam";
  const icon = themeToggleButton.querySelector(".material-symbols-outlined");
  if (icon) {
    icon.textContent = isDarkMode ? "light_mode" : "dark_mode";
  }

  themeToggleButton.setAttribute("aria-label", nextModeLabel);
  themeToggleButton.setAttribute("title", nextModeLabel);
  themeToggleButton.setAttribute("aria-pressed", String(isDarkMode));
}

function applyThemeMode(mode, options = {}) {
  const shouldPersist = options.persist !== false;
  const resolvedMode = mode === "dark" ? "dark" : "light";
  document.body.classList.toggle("is-dark-mode", resolvedMode === "dark");
  updateThemeToggleButton(resolvedMode);

  if (!shouldPersist) {
    return;
  }

  try {
    localStorage.setItem(themeModeStorageKey, resolvedMode);
    localStorage.setItem(themeModeDateStorageKey, getWibDateTimeParts().dateKey);
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
}

function initializeThemeMode() {
  applyThemeMode(getPreferredThemeMode(), { persist: false });
}

function syncThemeModeWithWibClock() {
  const preferredMode = getPreferredThemeMode();
  const currentMode = document.body.classList.contains("is-dark-mode") ? "dark" : "light";
  if (currentMode !== preferredMode) {
    applyThemeMode(preferredMode, { persist: false });
  }
}

function handleSharedThemeModeStorageChange(event) {
  if (event.key &&
      event.key !== themeModeStorageKey &&
      event.key !== themeModeDateStorageKey) {
    return;
  }

  syncThemeModeWithWibClock();
}

function toggleThemeMode() {
  const nextMode = document.body.classList.contains("is-dark-mode") ? "light" : "dark";
  applyThemeMode(nextMode);
}

function syncBackToTopButtonVisibility() {
  if (!backToTopButton) {
    return;
  }

  const isVisible = window.scrollY > 320;
  backToTopButton.classList.toggle("is-visible", isVisible);
  backToTopButton.setAttribute("aria-hidden", isVisible ? "false" : "true");
  backToTopButton.tabIndex = isVisible ? 0 : -1;
}

function scrollPageToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function syncFloatingUtilityOffset() {
  if (!document.body) {
    return;
  }

  const panelVisible = Boolean(catalogUploadTaskPanel && !catalogUploadTaskPanel.classList.contains("hidden"));
  if (!panelVisible) {
    document.body.style.setProperty("--floating-utility-offset", "0px");
    return;
  }

  const panelRect = catalogUploadTaskPanel.getBoundingClientRect();
  const offset = Math.max(0, Math.round(window.innerHeight - panelRect.top + 12));
  document.body.style.setProperty("--floating-utility-offset", `${offset}px`);
}

function openIntroQuoteModal() {
  if (!introQuoteModal || shouldHideIntroQuoteModal()) {
    return;
  }

  if (introQuoteDismissCheckbox) {
    introQuoteDismissCheckbox.checked = false;
  }

  document.body.classList.add("quote-intro-open");
  toggleElement(introQuoteModal, true);
  window.requestAnimationFrame(() => introQuoteEnterButton?.focus());
}

function closeIntroQuoteModal() {
  if (!introQuoteModal || introQuoteModal.classList.contains("hidden")) {
    return;
  }

  persistIntroQuotePreference(Boolean(introQuoteDismissCheckbox?.checked));
  document.body.classList.remove("quote-intro-open");
  toggleElement(introQuoteModal, false);
}

function initializeIntroQuoteModal() {
  if (!introQuoteModal || shouldHideIntroQuoteModal()) {
    return;
  }

  openIntroQuoteModal();
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

function renderPreviousVersions(history = []) {
  if (!previousVersionsList) {
    return;
  }

  if (!Array.isArray(history) || history.length === 0) {
    previousVersionsList.innerHTML = `<p class="previous-versions-empty">Belum ada histori versi sebelumnya.</p>`;
    return;
  }

  previousVersionsList.innerHTML = history
    .map((entry) => {
      const date = escapeHtml((entry?.date || "").trim() || "Tanpa tanggal");
      const text = escapeHtml((entry?.text || "").trim() || "Tidak ada catatan.");

      return `
        <article class="previous-version-item">
          <p class="previous-version-date">${date}</p>
          <p class="previous-version-text">${text}</p>
        </article>
      `;
    })
    .join("");
}

function openPreviousVersionsModal() {
  if (!previousVersionsModal) {
    return;
  }

  renderPreviousVersions(previousVersionNotes);
  toggleElement(previousVersionsModal, true);
}

function closePreviousVersionsModal() {
  toggleElement(previousVersionsModal, false);
}

function setPreviousVersionsState(visible, history = []) {
  previousVersionNotes = Array.isArray(history) ? history : [];
  toggleElement(viewPreviousVersionsButton, visible && previousVersionNotes.length > 0);

  if (!visible) {
    closePreviousVersionsModal();
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
      joinSchematicsChannel: viewKey === "Schematics",
      joinProblemSolvingChannel: viewKey === "ProblemSolving",
      joinDatasheetsChannel: viewKey === "Datasheets"
    };
    const result = await fetchJson("/auth/join-channels", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setChannelJoinRequired(viewKey, false);
    setNotice(result.message || "Akses berhasil diperbarui.");
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

  const item = findCatalogItemByMessageId(messageId);
  const fileName = item?.fileName || item?.title || `problem-solving-${messageId}.md`;
  const operationId = createCatalogUploadOperationId();
  const previousMarkup = button?.innerHTML || "";
  if (button) {
    button.disabled = true;
    button.innerHTML = `
      <span class="material-symbols-outlined is-spinning">progress_activity</span>
      <span>Membuka...</span>
    `;
  }

  try {
    beginCatalogUploadTask({
      operationId,
      fileName,
      displayName: "Problem Solving",
      message: "Menyiapkan Problem Solving..."
    });
    const result = await runCatalogOperationWithProgress(
      `/catalog/problem-solving/${messageId}/view?operationId=${encodeURIComponent(operationId)}`,
      {
        method: "POST",
        body: JSON.stringify({}),
        operationId,
        onServerProgress: (progress) => {
          applyCatalogTelegramUploadProgress(progress, {
            operationId,
            fileName,
            displayName: "Problem Solving"
          });
        }
      }
    );
    const content = result.content || result.rawContent || result.text || "";
    const title = result.fileName || result.title || fileName || "Problem Solving";
    upsertCatalogUploadTask({
      operationId,
      fileName: title,
      displayName: "Problem Solving",
      stage: "completed",
      active: false,
      success: true,
      progressPercent: 100,
      message: result.message || "Problem Solving siap dibuka."
    });
    openProblemSolvingViewer(title, content);
  } catch (error) {
    const reconciledProgress = await reconcileCatalogUploadTaskFromService(operationId, {
      operationId,
      fileName,
      displayName: "Problem Solving"
    });
    const reconciledStage = String(reconciledProgress?.stage || "").toLowerCase();

    if (reconciledProgress?.active || ["preparing", "downloading", "loading"].includes(reconciledStage)) {
      setNotice("Problem Solving masih disiapkan di local service. Progress akan lanjut di panel task.", "info");
      return;
    }

    if (reconciledProgress && ["failed", "cancelled"].includes(reconciledStage)) {
      upsertCatalogUploadTask({
        operationId,
        fileName,
        displayName: "Problem Solving",
        stage: reconciledStage,
        active: false,
        success: false,
        progressPercent: reconciledStage === "cancelled" ? 0 : 100,
        message: reconciledProgress.message || "Problem Solving gagal dibuka.",
        lastError: reconciledProgress.lastError || ""
      });
      throw new Error(reconciledProgress.lastError || reconciledProgress.message || error.message || "Problem Solving gagal dibuka.");
    }

    upsertCatalogUploadTask({
      operationId,
      fileName,
      displayName: "Problem Solving",
      stage: "failed",
      active: false,
      success: false,
      progressPercent: 100,
      message: "Problem Solving gagal dibuka.",
      lastError: error.message || "Problem Solving gagal dibuka."
    });
    throw error;
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = previousMarkup;
    }
  }
}

function viewPdfCatalogItem(category, messageId) {
  if (!messageId) {
    throw new Error(`Message ${category} tidak valid.`);
  }

  const config = getTelegramCatalogConfig(category);
  const targetUrl = `${serviceBaseUrl}/catalog/${config.endpoint}/${messageId}/view`;
  const newTab = window.open(targetUrl, "_blank", "noopener,noreferrer");
  if (!newTab) {
    throw new Error("Browser memblokir tab baru. Izinkan pop-up lalu coba lagi.");
  }
}

function resolveLocalServiceUrl(pathOrUrl) {
  const rawValue = String(pathOrUrl || "").trim();
  if (!rawValue) {
    return "";
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }

  return `${serviceBaseUrl}${rawValue.startsWith("/") ? rawValue : `/${rawValue}`}`;
}

function getPreparedSchematicsViewUrls(messageId, result = {}) {
  const responseUrls = Array.isArray(result?.nextActionUrls)
    ? result.nextActionUrls
    : [];
  const actionUrls = responseUrls.length > 0
    ? responseUrls
    : result?.nextActionUrl
    ? [result.nextActionUrl]
    : [`/catalog/schematics/${messageId}/view`];

  return [...new Set(actionUrls.map(resolveLocalServiceUrl).filter(Boolean))];
}

function openPreparedSchematicsViewTabs(messageId, result = {}) {
  if (!messageId) {
    throw new Error("Message Schematics tidak valid.");
  }

  const targetUrls = getPreparedSchematicsViewUrls(messageId, result);
  let blockedCount = 0;

  targetUrls.forEach((targetUrl) => {
    const newTab = window.open(targetUrl, "_blank");
    if (!newTab) {
      blockedCount += 1;
    }
  });

  if (blockedCount > 0) {
    const blockedMessage = targetUrls.length > 1
      ? `Schematics sudah siap, tetapi browser memblokir ${blockedCount} dari ${targetUrls.length} tab baru. Izinkan pop-up lalu klik Lihat lagi.`
      : "Schematics sudah siap, tetapi browser memblokir tab baru. Izinkan pop-up lalu klik Lihat lagi.";
    throw new Error(blockedMessage);
  }

  return targetUrls.length;
}

function openPreparedDatasheetsViewTab(messageId) {
  if (!messageId) {
    throw new Error("Message Datasheets tidak valid.");
  }

  const targetUrl = `${serviceBaseUrl}/catalog/datasheets/${messageId}/view`;
  const newTab = window.open(targetUrl, "_blank");
  if (!newTab) {
    throw new Error("Datasheets sudah siap, tetapi browser memblokir tab baru. Izinkan pop-up lalu klik Lihat lagi.");
  }
}

function filterCatalogItems() {
  if (localWorkbenchViewKeys.has(currentCatalogView)) {
    renderCatalog([], currentCatalogView);
    return;
  }

  const keyword = (catalogSearchInput?.value || "").trim().toLowerCase();
  const sharedMessageId = getCatalogMessageIdFromHash(currentCatalogView);
  const sourceCollection = isTelegramCatalogView(currentCatalogView) ? catalogItems : catalogCache;
  const sourceItems = sourceCollection.filter((item) => {
    if (isTelegramCatalogView(currentCatalogView)) {
      return itemMatchesCatalogView(item, currentCatalogView) &&
        (!sharedMessageId || Number(item.messageId || 0) === sharedMessageId);
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
          [item.title, item.deviceModel, item.description, item.contentPreview, item.category, item.fileName, item.serialNumber, item.boardCode, item.note, item.uploadedBy]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(keyword))
        )
    : !keyword
    ? sourceItems
    : sourceItems.filter((item) =>
        [item.title, item.deviceModel, item.description, item.contentPreview, item.category, item.fileName, item.serialNumber, item.boardCode, item.note, item.uploadedBy]
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
  const sharedMessageId = getCatalogMessageIdFromHash(viewKey);
  const hasSharedMessageFilter = sharedMessageId > 0;
  const requestToken = ++state.requestToken;
  state.loadingMore = false;
  state.nextOffset = 0;
  setCatalogSearchLoading(Boolean(query));
  try {
    if (hasSharedMessageFilter) {
      const previewPath = buildTelegramCatalogRequestPath(viewKey, {
        limit: 1,
        cacheOnly: true,
        messageId: sharedMessageId
      });
      const previewCatalog = await fetchJson(previewPath);
      if (requestToken !== state.requestToken) {
        return;
      }

      if (previewCatalog?.cacheAvailable && Array.isArray(previewCatalog.items) && previewCatalog.items.length > 0) {
        catalogItems = previewCatalog.items || [];
        state.hasMore = false;
        state.nextOffset = catalogItems.length;
        return;
      }
    }

    if (!query && !hasSharedMessageFilter) {
      const preview = await loadTelegramCatalogCachePreview(viewKey, state, requestToken);
      if (requestToken !== state.requestToken) {
        return;
      }

      if (preview.cacheAvailable) {
        void syncTelegramCategoryInBackground(viewKey, state, requestToken, preview.cacheVersion || "");
        return;
      }
    }

    const requestOptions = {
      limit: hasSharedMessageFilter ? 1 : 5,
      query,
      cacheOnly: Boolean(query),
      messageId: sharedMessageId
    };
    const path = buildTelegramCatalogRequestPath(viewKey, requestOptions);
    let catalog = await fetchJson(path);

    if (requestToken !== state.requestToken) {
      return;
    }

    if (
      query &&
      !hasSharedMessageFilter &&
      Array.isArray(catalog?.items) &&
      catalog.items.length === 0
    ) {
      notifyCatalogSearchCacheMissValidation(viewKey, query);
    }

    if (!query && !hasSharedMessageFilter) {
      applyTelegramCatalogPage(viewKey, state, catalog);
    } else {
      catalogItems = catalog.items || [];
      state.hasMore = Boolean(catalog.hasMore);
      state.nextOffset = Number(catalog.nextOffset || catalogItems.length || 0);
    }
  } finally {
    if (requestToken === state.requestToken) {
      setCatalogSearchLoading(false);
    }
  }
}

async function loadMoreTelegramCatalog(viewKey = currentCatalogView) {
  const state = getTelegramCatalogState(viewKey);
  if (!state.hasMore || state.loadingMore) {
    return;
  }

  const query = (catalogSearchInput?.value || "").trim();
  const sharedMessageId = getCatalogMessageIdFromHash(viewKey);
  const requestToken = ++state.requestToken;
  state.loadingMore = true;
  if (catalogLoadMoreButton) {
    catalogLoadMoreButton.disabled = true;
  }

  try {
    const path = buildTelegramCatalogRequestPath(viewKey, {
      limit: sharedMessageId > 0 ? 1 : 5,
      offset: state.nextOffset,
      query,
      cacheOnly: true,
      messageId: sharedMessageId
    });
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
  if (localWorkbenchViewKeys.has(currentCatalogView)) {
    cancelActiveTelegramCategorySync();
    renderCatalog([], currentCatalogView);
    return;
  }

  if (isTelegramCatalogView(currentCatalogView)) {
    renderCatalogLoading(currentCatalogView);
    await loadTelegramCatalog(currentCatalogView);
    setChannelJoinRequired(currentCatalogView, false);
    filterCatalogItems();
    return;
  }

  await loadBaseCatalog();
  catalogItems = catalogCache;
  filterCatalogItems();
}

async function reloadCatalogAfterMutation(viewKey = currentCatalogView) {
  if (isTelegramCatalogView(viewKey)) {
    cancelActiveTelegramCategorySync();
    resetTelegramCatalogFirstPageCache(viewKey);
  }

  await loadCatalog();
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
      setNotice(`Akses ${getTelegramCatalogConfig(currentCatalogView).displayName} belum aktif untuk akun ini.`, "info");
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

function setServiceConnectivityStatus(isConnected) {
  if (!serviceStatus) {
    return;
  }

  serviceStatus.textContent = isConnected ? "Terhubung" : "Terputus";
  serviceStatus.classList.toggle("is-connected", Boolean(isConnected));
  serviceStatus.classList.toggle("is-disconnected", !isConnected);
}

function updateServiceTrafficIndicator() {
  if (!serviceTrafficIndicator) {
    return;
  }

  const isActive = activeApiRequestCount > 0;
  serviceTrafficIndicator.classList.toggle("is-active", isActive);
  serviceTrafficIndicator.title = isActive ? "API aktif" : "API idle";
  serviceTrafficIndicator.setAttribute("aria-label", isActive ? "Indikator trafik API aktif" : "Indikator trafik API idle");

  if (serviceApiActivity) {
    const activeRequestLabels = Array.from(activeApiTrafficRequests.values());
    const latestActiveLabel = activeRequestLabels.length > 0
      ? activeRequestLabels[activeRequestLabels.length - 1]
      : "";
    const fallbackLabel = catalogEventSource ? "/catalog/events..." : "";
    serviceApiActivity.textContent = latestActiveLabel || fallbackLabel;
  }
}

function beginApiTraffic(label = "") {
  const token = nextApiTrafficToken++;
  activeApiRequestCount += 1;
  activeApiTrafficRequests.set(token, String(label || "").trim());
  updateServiceTrafficIndicator();
  return token;
}

function endApiTraffic(token) {
  activeApiRequestCount = Math.max(0, activeApiRequestCount - 1);
  if (token) {
    activeApiTrafficRequests.delete(token);
  }
  updateServiceTrafficIndicator();
}

function setCatalogSearchLoading(loading) {
  catalogSearchLoading = loading;
  toggleElement(catalogSearchStatus, loading);
  if (catalogSearchInput) {
    catalogSearchInput.disabled = loading;
    catalogSearchInput.closest(".catalog-search")?.classList.toggle("is-hidden", loading);
  }
}

function getRepresentativeRoleLabel(status) {
  const roleCandidates = [
    status.biosChannelRole,
    status.boardviewChannelRole,
    status.schematicsChannelRole,
    status.problemSolvingChannelRole,
    status.datasheetsChannelRole,
    status.channelRole
  ];

  const normalizedRole = roleCandidates
    .map((role) => String(role || "").trim().toLowerCase())
    .find((role) => role === "owner" || role === "admin" || role === "member");

  if (normalizedRole === "owner") {
    return { icon: "workspace_premium", label: "Owner" };
  }

  if (normalizedRole === "admin") {
    return { icon: "admin_panel_settings", label: "Admin" };
  }

  return { icon: "verified_user", label: "Member" };
}

function getConnectedChannelCount(status) {
  if (!status || typeof status !== "object") {
    return 0;
  }

  return [
    status.biosChannelRole,
    status.boardviewChannelRole,
    status.schematicsChannelRole,
    status.problemSolvingChannelRole,
    status.datasheetsChannelRole
  ].filter((role) => String(role || "").trim()).length;
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

function syncCodeSubmitButtonState() {
  if (!codeSubmitButton) {
    return;
  }

  const verificationCode = document.getElementById("verificationCode")?.value.trim() || "";
  const isReady = verificationCode.length > 0;
  codeSubmitButton.disabled = !isReady;
  codeSubmitButton.setAttribute("aria-disabled", isReady ? "false" : "true");
  codeSubmitButton.classList.toggle("is-ready", isReady);
}

function setCatalogEditorUploadProgress(progress = {}) {
  const active = Boolean(progress.active);
  if (active && !isCatalogEditorVisible()) {
    return;
  }

  toggleElement(catalogEditorUploadProgress, active);
  if (!catalogEditorUploadProgress) {
    return;
  }

  const percent = Math.max(0, Math.min(100, Math.round(Number(progress.percent) || 0)));
  if (catalogEditorUploadProgressLabel) {
    catalogEditorUploadProgressLabel.textContent = progress.label || "Menyiapkan upload...";
  }
  if (catalogEditorUploadProgressPercent) {
    catalogEditorUploadProgressPercent.textContent = active ? `${percent}%` : "0%";
  }
  if (catalogEditorUploadProgressBar) {
    catalogEditorUploadProgressBar.style.width = active ? `${percent}%` : "0%";
  }

  const progressTrack = catalogEditorUploadProgress.querySelector(".catalog-editor-upload-progress-track");
  if (progressTrack) {
    progressTrack.setAttribute("aria-valuenow", String(active ? percent : 0));
  }
}

function setCatalogEditorSubmitting(isSubmitting, options = {}) {
  if (!catalogEditorSubmitButton) {
    return;
  }

  if (isSubmitting && !isCatalogEditorVisible()) {
    return;
  }

  if (!isSubmitting) {
    catalogEditorSubmitButton.disabled = false;
    catalogEditorSubmitButton.innerHTML = options.defaultMarkup || catalogEditorSubmitButton.innerHTML;
    setCatalogEditorUploadProgress({ active: false });
    return;
  }

  const percent = Math.max(0, Math.min(100, Math.round(Number(options.percent) || 0)));
  const label = options.label || "Memproses...";
  const showProgress = options.showProgress !== false;
  catalogEditorSubmitButton.disabled = true;
  catalogEditorSubmitButton.innerHTML = `
    <span class="material-symbols-outlined is-spinning">progress_activity</span>
    <span>${escapeHtml(label)}</span>
  `;
  setCatalogEditorUploadProgress({
    active: showProgress,
    percent,
    label: options.progressLabel || "Menyiapkan upload..."
  });
}

function createCatalogUploadOperationId() {
  return `catalog-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isCatalogEditorVisible() {
  return Boolean(catalogEditorModal && !catalogEditorModal.classList.contains("hidden"));
}

function parseCatalogUploadTaskTimestamp(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function resolveCatalogUploadTaskSource(taskUpdate = {}, existingTask = {}, operationId = "") {
  const explicitSource = String(taskUpdate.source || taskUpdate.taskSource || existingTask.source || "").trim().toLowerCase();
  if (explicitSource) {
    return explicitSource;
  }

  return String(operationId || "").startsWith("spi-flash-") ? "spi-flash" : "catalog";
}

function isCatalogUploadTaskFinalStage(stage) {
  return ["completed", "failed", "cancelled"].includes(String(stage || "").toLowerCase());
}

function isCatalogUploadTaskWaitingStage(stage) {
  return ["idle", "preparing", "waiting", "waiting-selection"].includes(String(stage || "").toLowerCase());
}

function isCatalogUploadTaskAttentionStage(stage) {
  return ["failed", "cancelled", "waiting-selection"].includes(String(stage || "").toLowerCase());
}

function getCatalogUploadTaskSortGroup(task) {
  const stage = String(task?.stage || "").toLowerCase();
  if (task?.active) {
    return 40;
  }

  if (stage === "waiting-selection") {
    return 35;
  }

  if (stage === "failed" || stage === "cancelled") {
    return 30;
  }

  if (stage === "completed") {
    return 20;
  }

  return 10;
}

function getCatalogUploadTaskSortValue(task) {
  return Number(task?.sortKey ?? task?.updatedAt ?? task?.createdAt ?? 0) || 0;
}

function getCatalogUploadTaskEntries() {
  return Array.from(catalogUploadTasks.values()).sort((left, right) => {
    const groupDelta = getCatalogUploadTaskSortGroup(right) - getCatalogUploadTaskSortGroup(left);
    if (groupDelta !== 0) {
      return groupDelta;
    }

    const sortDelta = getCatalogUploadTaskSortValue(right) - getCatalogUploadTaskSortValue(left);
    if (sortDelta !== 0) {
      return sortDelta;
    }

    return (right.createdAt || 0) - (left.createdAt || 0);
  });
}

function trimCatalogUploadTasks() {
  if (catalogUploadTasks.size <= maxCatalogUploadTasks) {
    return;
  }

  let removableTasks = Array.from(catalogUploadTasks.values())
    .filter((task) => !task.active && !isCatalogUploadTaskAttentionStage(task.stage))
    .sort((left, right) => getCatalogUploadTaskSortValue(left) - getCatalogUploadTaskSortValue(right));

  if (removableTasks.length === 0) {
    removableTasks = Array.from(catalogUploadTasks.values())
      .filter((task) => !task.active)
      .sort((left, right) => getCatalogUploadTaskSortValue(left) - getCatalogUploadTaskSortValue(right));
  }

  while (catalogUploadTasks.size > maxCatalogUploadTasks && removableTasks.length > 0) {
    const removableTask = removableTasks.shift();
    if (removableTask?.operationId) {
      catalogUploadTasks.delete(removableTask.operationId);
    }
  }
}

function stopCatalogUploadTaskSync() {
  if (catalogUploadTaskSyncTimerId) {
    window.clearTimeout(catalogUploadTaskSyncTimerId);
    catalogUploadTaskSyncTimerId = 0;
  }
}

function hasActiveCatalogUploadTasks(source = "") {
  const normalizedSource = String(source || "").trim().toLowerCase();
  return Array.from(catalogUploadTasks.values()).some((task) =>
    task.active && (!normalizedSource || task.source === normalizedSource)
  );
}

function formatCatalogUploadTaskSummary(tasks) {
  const activeCount = tasks.filter((task) => task.active).length;
  const waitingCount = tasks.filter((task) => String(task.stage || "").toLowerCase() === "waiting-selection").length;
  const failedCount = tasks.filter((task) => ["failed", "cancelled"].includes(task.stage)).length;
  const completedCount = tasks.filter((task) => task.stage === "completed").length;

  if (activeCount > 0) {
    return `${activeCount} proses berjalan`;
  }

  if (waitingCount > 0) {
    return `${waitingCount} proses menunggu`;
  }

  if (failedCount > 0) {
    return `${failedCount} proses perlu dicek`;
  }

  if (completedCount > 0) {
    return `${completedCount} proses selesai`;
  }

  return `${tasks.length} proses`;
}

function getCatalogUploadTaskStatusIcon(task) {
  if (task.active) {
    return "progress_activity";
  }

  if (task.stage === "waiting-selection") {
    return "pending_actions";
  }

  if (isCatalogUploadTaskWaitingStage(task.stage)) {
    return "schedule";
  }

  if (task.stage === "completed") {
    return "check_circle";
  }

  if (task.stage === "cancelled") {
    return "do_not_disturb_on";
  }

  return "error";
}

function getCatalogUploadTaskStatusText(task) {
  if (task.active) {
    return `${Math.max(0, Math.min(100, Math.round(Number(task.progressPercent) || 0)))}%`;
  }

  if (task.stage === "waiting-selection") {
    return "Pilih";
  }

  if (isCatalogUploadTaskWaitingStage(task.stage)) {
    return "Menunggu";
  }

  if (task.stage === "completed") {
    return "Selesai";
  }

  if (task.stage === "cancelled") {
    return "Batal";
  }

  return "Gagal";
}

function renderCatalogUploadTasks() {
  if (!catalogUploadTaskPanel || !catalogUploadTaskSummary || !catalogUploadTaskList || !catalogUploadTaskBody) {
    return;
  }

  const tasks = getCatalogUploadTaskEntries();
  toggleElement(catalogUploadTaskPanel, tasks.length > 0 && !catalogUploadTaskDismissed);
  if (tasks.length === 0) {
    catalogUploadTaskList.innerHTML = "";
    syncFloatingUtilityOffset();
    return;
  }

  catalogUploadTaskSummary.textContent = formatCatalogUploadTaskSummary(tasks);
  toggleElement(catalogUploadTaskBody, !catalogUploadTaskCollapsed);
  if (catalogUploadTaskToggleButton) {
    catalogUploadTaskToggleButton.setAttribute("aria-expanded", String(!catalogUploadTaskCollapsed));
  }
  if (catalogUploadTaskToggleIcon) {
    catalogUploadTaskToggleIcon.textContent = catalogUploadTaskCollapsed ? "expand_less" : "expand_more";
  }

  catalogUploadTaskList.innerHTML = tasks.map((task) => {
    const normalizedStage = String(task.stage || "").toLowerCase();
    const stageClass = task.active
      ? "is-active"
      : isCatalogUploadTaskWaitingStage(normalizedStage)
      ? "is-active"
      : normalizedStage === "completed"
      ? "is-completed"
      : normalizedStage === "cancelled"
      ? "is-cancelled"
      : "is-failed";
    const progressPercent = Math.max(0, Math.min(100, Math.round(Number(task.progressPercent) || 0)));
    const icon = task.icon || "description";
    const subtitle = `${task.displayName} - ${task.lastError || task.message || "Menyiapkan proses..."}`;

    return `
      <article class="catalog-upload-task-item ${stageClass}">
        <div class="catalog-upload-task-file">
          <span class="material-symbols-outlined catalog-upload-task-file-icon">${escapeHtml(icon)}</span>
          <div class="catalog-upload-task-copy">
            <strong title="${escapeHtml(task.fileName)}">${escapeHtml(task.fileName)}</strong>
            <span title="${escapeHtml(subtitle)}">${escapeHtml(subtitle)}</span>
          </div>
          <div class="catalog-upload-task-state">
            <span class="catalog-upload-task-state-label">${escapeHtml(getCatalogUploadTaskStatusText(task))}</span>
            <span class="material-symbols-outlined${task.active ? " is-spinning" : ""}">${getCatalogUploadTaskStatusIcon(task)}</span>
          </div>
        </div>
        <div class="catalog-upload-task-progress" aria-hidden="true">
          <span style="width: ${progressPercent}%;"></span>
        </div>
      </article>
    `;
  }).join("");
  syncFloatingUtilityOffset();
}

function upsertCatalogUploadTask(taskUpdate = {}) {
  const operationId = String(taskUpdate.operationId || "").trim();
  if (!operationId) {
    return;
  }

  if (taskUpdate.remove || taskUpdate.deleted) {
    catalogUploadTasks.delete(operationId);
    renderCatalogUploadTasks();
    return;
  }

  const existingTask = catalogUploadTasks.get(operationId) || {};
  const stage = String(taskUpdate.stage || existingTask.stage || "preparing").toLowerCase();
  const isFinalStage = isCatalogUploadTaskFinalStage(stage);
  const rawPercent = taskUpdate.progressPercent ?? taskUpdate.percent ?? existingTask.progressPercent ?? 0;
  const progressPercent = Math.max(0, Math.min(100, Math.round(Number(rawPercent) || 0)));
  const fallbackCreatedAt = existingTask.createdAt || Date.now();
  const fallbackUpdatedAt = existingTask.updatedAt || fallbackCreatedAt;
  const source = resolveCatalogUploadTaskSource(taskUpdate, existingTask, operationId);
  const createdAt = parseCatalogUploadTaskTimestamp(
    taskUpdate.createdAt ?? taskUpdate.startedAt ?? taskUpdate.startedAtUtc,
    fallbackCreatedAt
  );
  const parsedUpdatedAt = parseCatalogUploadTaskTimestamp(
    taskUpdate.updatedAt ?? taskUpdate.updatedAtUtc ?? taskUpdate.completedAt ?? taskUpdate.completedAtUtc,
    Date.now()
  );
  const parsedSortKey = parseCatalogUploadTaskTimestamp(
    taskUpdate.sortKey ?? taskUpdate.orderKey,
    Number.NaN
  );
  const hasExplicitSortKey = Number.isFinite(parsedSortKey);
  const updatedAt = hasExplicitSortKey || taskUpdate.allowEarlierUpdatedAt === true
    ? parsedUpdatedAt
    : Math.max(parsedUpdatedAt, fallbackUpdatedAt);
  const sortKey = hasExplicitSortKey
    ? parsedSortKey
    : Math.max(updatedAt, Number(existingTask.sortKey || 0));
  const active = typeof taskUpdate.active === "boolean"
    ? taskUpdate.active
    : !isFinalStage && stage !== "idle" && stage !== "waiting-selection";
  const success = typeof taskUpdate.success === "boolean" ? taskUpdate.success : stage === "completed";
  const hasLastErrorUpdate = Object.prototype.hasOwnProperty.call(taskUpdate, "lastError");
  const lastError = hasLastErrorUpdate
    ? String(taskUpdate.lastError || "").trim()
    : success || stage === "completed"
      ? ""
      : String(existingTask.lastError || "").trim();
  const nextTask = {
    operationId,
    source,
    fileName: String(taskUpdate.fileName || existingTask.fileName || "Proses").trim(),
    displayName: String(taskUpdate.displayName || existingTask.displayName || currentCatalogView || "Task").trim(),
    icon: String(taskUpdate.icon || existingTask.icon || "description").trim(),
    message: String(taskUpdate.message || existingTask.message || "Menyiapkan proses...").trim(),
    lastError,
    stage,
    active,
    success,
    progressPercent: stage === "completed" ? Math.max(100, progressPercent) : progressPercent,
    createdAt,
    updatedAt,
    sortKey
  };

  catalogUploadTasks.set(operationId, nextTask);
  trimCatalogUploadTasks();
  renderCatalogUploadTasks();
}

function beginCatalogUploadTask(task = {}) {
  catalogUploadTaskDismissed = false;
  catalogUploadTaskCollapsed = false;
  upsertCatalogUploadTask({
    ...task,
    stage: task.stage || "preparing",
    active: true,
    success: false,
    progressPercent: task.progressPercent || 0,
    message: task.message || "Menyiapkan upload..."
  });
}

function toggleCatalogUploadTaskPanel() {
  if (catalogUploadTasks.size === 0) {
    return;
  }

  catalogUploadTaskCollapsed = !catalogUploadTaskCollapsed;
  renderCatalogUploadTasks();
}

function closeCatalogUploadTaskPanel() {
  catalogUploadTaskDismissed = true;
  renderCatalogUploadTasks();
}

function syncCatalogUploadTasksFromEntries(entries = [], options = {}) {
  const normalizedEntries = Array.isArray(entries)
    ? entries
        .filter((entry) => entry && typeof entry === "object")
        .map((entry) => ({
          operationId: String(entry.operationId || "").trim(),
          fileName: String(entry.fileName || "upload.bin").trim(),
          displayName: String(entry.category || "Katalog").trim(),
          source: "catalog",
          stage: String(entry.stage || "idle").toLowerCase(),
          active: Boolean(entry.active),
          success: Boolean(entry.success),
          progressPercent: Math.max(0, Math.min(100, Math.round(Number(entry.progressPercent) || 0))),
          message: String(entry.message || "Menyiapkan upload...").trim(),
          lastError: String(entry.lastError || "").trim(),
          createdAt: entry.startedAtUtc || 0,
          updatedAt: entry.updatedAtUtc || entry.completedAtUtc || entry.startedAtUtc || 0,
          sortKey: entry.updatedAtUtc || entry.completedAtUtc || entry.startedAtUtc || 0
        }))
        .filter((entry) => entry.operationId)
    : [];

  if (options.replaceMissing) {
    const activeOperationIds = new Set(normalizedEntries.map((entry) => entry.operationId));
    for (const operationId of Array.from(catalogUploadTasks.keys())) {
      const task = catalogUploadTasks.get(operationId);
      if (task?.source === "catalog" && task.active && !activeOperationIds.has(operationId)) {
        catalogUploadTasks.delete(operationId);
      }
    }
  }

  normalizedEntries.forEach((entry) => {
    upsertCatalogUploadTask(entry);
  });

  renderCatalogUploadTasks();
}

async function hydrateCatalogUploadTasksFromService() {
  try {
    const entries = await fetchJson("/catalog/upload-progress");
    syncCatalogUploadTasksFromEntries(entries, { replaceMissing: true });
    if (hasActiveCatalogUploadTasks("catalog")) {
      scheduleCatalogUploadTaskSync();
    } else {
      stopCatalogUploadTaskSync();
    }
  } catch (error) {
    stopCatalogUploadTaskSync();
    console.warn("Gagal sinkronisasi task upload dari local service", error);
  }
}

function scheduleCatalogUploadTaskSync() {
  stopCatalogUploadTaskSync();
  if (!hasActiveCatalogUploadTasks("catalog")) {
    return;
  }

  catalogUploadTaskSyncTimerId = window.setTimeout(async () => {
    catalogUploadTaskSyncTimerId = 0;
    await hydrateCatalogUploadTasksFromService();
  }, 900);
}

function waitCatalogUploadReconcileDelay(delayMs) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, Math.max(100, Number(delayMs) || 100));
  });
}

async function runCatalogOperationWithProgress(path, options = {}) {
  const operationId = String(options.operationId || "").trim();
  let pollingTimerId = 0;
  let pollingStopped = false;

  const stopPolling = () => {
    pollingStopped = true;
    if (pollingTimerId) {
      window.clearInterval(pollingTimerId);
      pollingTimerId = 0;
    }
  };

  const pollServerProgress = async () => {
    if (!operationId || pollingStopped || typeof options.onServerProgress !== "function") {
      return;
    }

    try {
      const progress = await fetchJson(`/catalog/upload-progress/${encodeURIComponent(operationId)}`);
      if (pollingStopped) {
        return;
      }

      options.onServerProgress(progress);
      if (!progress.active && ["completed", "failed", "cancelled"].includes(String(progress.stage || "").toLowerCase())) {
        stopPolling();
      }
    } catch {
      // Progress polling is best effort while the main catalog operation is still running.
    }
  };

  try {
    if (operationId && typeof options.onServerProgress === "function") {
      void pollServerProgress();
      pollingTimerId = window.setInterval(() => {
        void pollServerProgress();
      }, 700);
    }

    return await fetchJson(path, {
      method: options.method || "POST",
      body: options.body
    });
  } finally {
    const canPollFinalState = Boolean(operationId) && typeof options.onServerProgress === "function";
    stopPolling();
    if (!canPollFinalState) {
      return;
    }

    fetchJson(`/catalog/upload-progress/${encodeURIComponent(operationId)}`)
      .then((progress) => {
        options.onServerProgress(progress);
      })
      .catch(() => {
        // Ignore final polling failure because the main request already finished.
      });
  }
}

async function reconcileCatalogUploadTaskFromService(operationId, taskContext = {}, options = {}) {
  const normalizedOperationId = String(operationId || "").trim();
  if (!normalizedOperationId) {
    return null;
  }

  const attempts = Math.max(1, Number(options.attempts) || 12);
  const intervalMs = Math.max(250, Number(options.intervalMs) || 700);
  let lastMeaningfulProgress = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const progress = await fetchJson(`/catalog/upload-progress/${encodeURIComponent(normalizedOperationId)}`);
      const stage = String(progress?.stage || "").toLowerCase();
      const isKnownStage = ["preparing", "running", "uploading", "sending", "downloading", "extracting", "loading", "waiting-selection", "completed", "failed", "cancelled"].includes(stage);

      if (isKnownStage) {
        lastMeaningfulProgress = progress;
        applyCatalogTelegramUploadProgress(progress, taskContext);

        if (!progress.active && ["completed", "failed", "cancelled"].includes(stage)) {
          return progress;
        }
      }
    } catch {
      // Best effort reconcile from local service; keep retrying briefly.
    }

    if (attempt < attempts - 1) {
      await waitCatalogUploadReconcileDelay(intervalMs);
    }
  }

  return lastMeaningfulProgress;
}

function applyCatalogTelegramUploadProgress(progress = {}, taskContext = {}) {
  const percent = Math.max(0, Math.min(100, Math.round(Number(progress.progressPercent) || 0)));
  const stage = String(progress.stage || "").toLowerCase();
  if (stage === "idle") {
    return;
  }

  const message = progress.message || "Upload file sedang berjalan...";
  const buttonLabel = stage === "sending"
    ? "Mengirim file..."
    : stage === "completed"
    ? "Upload selesai"
    : stage === "failed"
    ? "Upload gagal"
    : stage === "cancelled"
    ? "Upload dibatalkan"
    : percent > 0
    ? `Upload ${percent}%`
    : "Menyiapkan upload...";

  upsertCatalogUploadTask({
    operationId: progress.operationId || taskContext.operationId,
    fileName: progress.fileName || taskContext.fileName,
    displayName: taskContext.displayName,
    source: "catalog",
    stage,
    active: Boolean(progress.active),
    success: Boolean(progress.success),
    progressPercent: percent,
    message,
    lastError: progress.lastError || "",
    createdAt: progress.startedAtUtc,
    updatedAt: progress.updatedAtUtc || progress.completedAtUtc,
    sortKey: progress.updatedAtUtc || progress.completedAtUtc || progress.startedAtUtc
  });
  if (Boolean(progress.active)) {
    scheduleCatalogUploadTaskSync();
  }

  if (isCatalogEditorVisible()) {
    setCatalogEditorSubmitting(true, {
      percent,
      label: buttonLabel,
      progressLabel: message,
      showProgress: true
    });
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
    activeToastSignature = "";
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
  const signature = `${tone}:${message}`;
  const hasMatchingActiveToast = Array.from(
    toastContainer.querySelectorAll(".toast:not(.is-leaving)")
  ).some((toast) => toast.getAttribute("data-toast-signature") === signature);
  if (
    signature === activeToastSignature &&
    hasMatchingActiveToast
  ) {
    return;
  }

  activeToastSignature = signature;
  const toast = document.createElement("div");
  toast.className = `toast is-${tone}`;
  toast.setAttribute("data-toast-signature", signature);
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

    if (activeToastSignature === signature) {
      activeToastSignature = "";
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

function stopGoogleAuthPolling() {
  if (googleAuthPollTimerId) {
    window.clearInterval(googleAuthPollTimerId);
    googleAuthPollTimerId = 0;
  }

  googleAuthTabAwaitingResult = false;
}

function startGoogleAuthPolling() {
  stopGoogleAuthPolling();
  googleAuthTabAwaitingResult = true;
  googleAuthPollTimerId = window.setInterval(async () => {
    if (!googleAuthTab) {
      stopGoogleAuthPolling();
      return;
    }

    if (googleAuthTab.closed) {
      const waitingForResult = googleAuthTabAwaitingResult;
      googleAuthTab = null;
      stopGoogleAuthPolling();
      if (waitingForResult) {
        setNotice("Tab login Google ditutup sebelum proses selesai.", "info");
      }
    }
  }, 500);
}

function stopAuthStatusPolling() {
  if (authStatusPollTimerId) {
    window.clearInterval(authStatusPollTimerId);
    authStatusPollTimerId = 0;
  }
  authStatusPollInFlight = false;
}

function startAuthStatusPolling() {
  if (authStatusPollTimerId) {
    return;
  }

  authStatusPollTimerId = window.setInterval(async () => {
    if (authStatusPollInFlight) {
      return;
    }

    authStatusPollInFlight = true;
    try {
      const status = await fetchJson("/auth/status");
      applyStatus(status);
    } catch {
      // Ignore transient polling errors while waiting for OTP/password steps.
    } finally {
      authStatusPollInFlight = false;
    }
  }, 1800);
}

function hideInteractivePanels() {
  stopAuthStatusPolling();
  toggleElement(mainPanel, false);
  toggleElement(phoneForm, false);
  toggleElement(codeForm, false);
  toggleElement(passwordForm, false);
  toggleElement(channelJoinPanel, false);
  toggleElement(agreementPanel, false);
  toggleElement(dashboardPanel, false);
  setPreviousVersionsState(false);
  resetCatalog();
}

function requestNewWindowTabPermission() {
  const permissionWindow = window.open("", "teknisihub-catalog-window-permission", "popup,width=420,height=240");
  if (!permissionWindow) {
    return false;
  }

  try {
    permissionWindow.document.title = "TeknisiHub";
    permissionWindow.document.body.style.cssText = "margin:0;display:grid;place-items:center;height:100vh;font:14px system-ui,sans-serif;background:#0f172a;color:#f8fafc;text-align:center;padding:24px;";
    permissionWindow.document.body.textContent = "Izin tab baru TeknisiHub berhasil dicek. Tab ini akan ditutup otomatis.";
  } catch {
    // The permission check already succeeded even if the browser blocks document writes.
  }

  window.setTimeout(() => {
    try {
      permissionWindow.close();
    } catch {
      // Ignore close failures; the opened tab/window can be closed manually.
    }
  }, 350);

  return true;
}

function setDownloadLinkState(visible, href = defaultDownloadLocalServiceUrl, label = defaultDownloadLocalServiceLabel) {
  if (!downloadLocalServiceLink) {
    return;
  }

  downloadLocalServiceLink.href = href || defaultDownloadLocalServiceUrl;
  downloadLocalServiceLink.textContent = label || defaultDownloadLocalServiceLabel;
  toggleElement(downloadLocalServiceLink, visible);
}

function setLocalUpdateButtonState(visible, label = "Update local service") {
  if (!runLocalUpdateButton) {
    return;
  }

  const labelNode = runLocalUpdateButton.querySelector("span:last-child");
  if (labelNode) {
    labelNode.textContent = label;
  }

  toggleElement(runLocalUpdateButton, visible);
}

function setServiceUpdateNotice(message) {
  if (!serviceUpdateNotice) {
    return;
  }

  serviceUpdateNotice.textContent = message || "";
  toggleElement(serviceUpdateNotice, Boolean(message));
}

function setUpdateProgressState(visible, progressPercent = 0, label = "", meta = "") {
  if (updateProgressHideTimeoutId) {
    window.clearTimeout(updateProgressHideTimeoutId);
    updateProgressHideTimeoutId = null;
  }

  toggleElement(updateProgressPanel, visible);

  if (!visible) {
    if (updateProgressBar) {
      updateProgressBar.style.width = "0%";
    }

    if (updateProgressPercent) {
      updateProgressPercent.textContent = "0%";
    }

    if (updateProgressLabel) {
      updateProgressLabel.textContent = "";
    }

    if (updateProgressMeta) {
      updateProgressMeta.textContent = "";
    }

    return;
  }

  const normalizedProgress = Math.max(0, Math.min(100, Number(progressPercent) || 0));
  if (updateProgressBar) {
    updateProgressBar.style.width = `${normalizedProgress}%`;
  }

  if (updateProgressPercent) {
    updateProgressPercent.textContent = `${normalizedProgress}%`;
  }

  if (updateProgressLabel) {
    updateProgressLabel.textContent = label || "Memproses update...";
  }

  if (updateProgressMeta) {
    updateProgressMeta.textContent = meta || "";
  }
}

function clearUpdatePollers() {
  if (updateStatusPollTimeoutId) {
    window.clearTimeout(updateStatusPollTimeoutId);
    updateStatusPollTimeoutId = null;
  }

  if (updateRestartPollTimeoutId) {
    window.clearTimeout(updateRestartPollTimeoutId);
    updateRestartPollTimeoutId = null;
  }
}

function formatBytes(value) {
  const numericValue = Number(value) || 0;
  if (numericValue <= 0) {
    return "";
  }

  const units = ["B", "KB", "MB", "GB"];
  let unitIndex = 0;
  let scaledValue = numericValue;

  while (scaledValue >= 1024 && unitIndex < units.length - 1) {
    scaledValue /= 1024;
    unitIndex += 1;
  }

  return `${scaledValue.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function buildUpdateProgressMeta(operation) {
  const downloadedText = formatBytes(operation?.downloadedBytes);
  const totalText = formatBytes(operation?.totalBytes);
  const versionText = operation?.targetVersion ? `Target v.${operation.targetVersion}` : "";

  if (downloadedText && totalText) {
    return `${versionText}${versionText ? " - " : ""}${downloadedText} / ${totalText}`;
  }

  return versionText;
}

function getUpdateProgressLabel(operation) {
  const stage = String(operation?.stage || "").trim().toLowerCase();

  if (stage === "downloading") {
    return "Mengunduh paket update...";
  }

  if (stage === "launching") {
    return "Menjalankan updater...";
  }

  if (stage === "restarting") {
    return "Menghentikan local service, melepas file lock, lalu menyalakan versi baru...";
  }

  if (stage === "failed") {
    return "Update gagal dijalankan.";
  }

  return operation?.message || "Memproses update...";
}

function scheduleHideUpdateProgress(delayMs = 8000) {
  if (updateProgressHideTimeoutId) {
    window.clearTimeout(updateProgressHideTimeoutId);
  }

  updateProgressHideTimeoutId = window.setTimeout(() => {
    setUpdateProgressState(false);
  }, delayMs);
}

function scheduleUpdateStatusPolling(delayMs = 1200) {
  if (updateStatusPollTimeoutId) {
    window.clearTimeout(updateStatusPollTimeoutId);
  }

  updateStatusPollTimeoutId = window.setTimeout(checkUpdateOperationStatus, delayMs);
}

function scheduleRestartPolling(delayMs = 3000) {
  if (updateRestartPollTimeoutId) {
    window.clearTimeout(updateRestartPollTimeoutId);
  }

  updateRestartPollTimeoutId = window.setTimeout(waitForUpdatedService, delayMs);
}

async function checkUpdateOperationStatus() {
  try {
    const operation = await fetchJson("/update/status");
    if (!operation?.active && operation?.stage !== "restarting") {
      if (operation?.stage === "failed") {
        setUpdateProgressState(true, operation.progressPercent || 0, operation.message || "Update gagal.", operation.lastError || "");
        setNotice(operation.lastError || operation.message || "Update otomatis gagal.", true);
      }
      return;
    }

    pendingUpdateVersion = operation.targetVersion || pendingUpdateVersion;
    setLocalUpdateButtonState(false);
    setDownloadLinkState(false);
    setUpdateProgressState(
      true,
      operation.progressPercent || 0,
      getUpdateProgressLabel(operation),
      buildUpdateProgressMeta(operation)
    );

    if (operation.stage === "restarting") {
      scheduleRestartPolling(2500);
      return;
    }

    scheduleUpdateStatusPolling();
  } catch (error) {
    if (pendingUpdateVersion) {
      setUpdateProgressState(
        true,
        99,
        "Menghentikan local service, melepas file lock, lalu menyalakan versi baru...",
        `Target v.${pendingUpdateVersion}`
      );
      scheduleRestartPolling(3000);
      return;
    }

    setNotice(error.message, true);
  }
}

async function waitForUpdatedService() {
  try {
    const health = await refreshStatus({ forceUpdateCheck: true });
    clearUpdatePollers();
    setUpdateProgressState(
      true,
      100,
      "Update selesai. Local service terbaru sudah aktif.",
      health?.version ? `Versi aktif v.${health.version}` : ""
    );
    scheduleHideUpdateProgress();
    if (health?.version) {
      setNotice(`Update selesai. sudah terbaru v.${health.version}`);
    }
    pendingUpdateVersion = "";
  } catch {
    setUpdateProgressState(
      true,
      99,
      "Menghentikan local service, melepas file lock, lalu menyalakan versi baru...",
      pendingUpdateVersion ? `Target v.${pendingUpdateVersion}` : ""
    );
    scheduleRestartPolling(3000);
  }
}

async function startLocalUpdate() {
  if (!runLocalUpdateButton) {
    return;
  }

  setButtonLoading(runLocalUpdateButton, true, "system_update_alt", "Update local service", "Menyiapkan update...");

  try {
    const result = await fetchJson("/update/start", {
      method: "POST",
      body: JSON.stringify({})
    });

    pendingUpdateVersion = result.operation?.targetVersion || pendingUpdateVersion;
    setNotice(result.message);
    setLocalUpdateButtonState(false);
    setDownloadLinkState(false);
    setUpdateProgressState(
      true,
      result.operation?.progressPercent || 0,
      getUpdateProgressLabel(result.operation),
      buildUpdateProgressMeta(result.operation)
    );
    scheduleUpdateStatusPolling(800);
  } catch (error) {
    setNotice(error.message || "Gagal memulai update otomatis.", true);
  } finally {
    setButtonLoading(runLocalUpdateButton, false, "system_update_alt", "Update local service", "Menyiapkan update...");
  }
}

function applyUpdateRequirement(health) {
  const update = health?.update;
  if (!update?.mustUpdate) {
    setLocalUpdateButtonState(false);
    if (!pendingUpdateVersion) {
      setUpdateProgressState(false);
    }
    setServiceUpdateNotice("");
    setPreviousVersionsState(false);
    return false;
  }

  const currentVersion = health?.version || "unknown";
  const latestVersion = update.latestVersion || "latest";
  const canAutoUpdate = Boolean(update.canAutoUpdate);
  const downloadUrl = canAutoUpdate
    ? (update.updaterUrl || update.downloadUrl || defaultDownloadLocalServiceUrl)
    : (update.installerUrl || update.downloadUrl || defaultDownloadLocalServiceUrl);
  const updateMessage = update.message || `Update local service ke versi ${latestVersion} untuk lanjut menggunakan TeknisiHub.`;
  const noteDate = (update.noteDate || "").trim();
  const noteText = (update.noteText || "").trim();
  const noteMessage = noteText
    ? ` Catatan rilis ${noteDate || "terbaru"}: ${noteText}`
    : (update.notes ? ` Catatan: ${update.notes}` : "");

  setServiceConnectivityStatus(true);
  setText(serviceVersion, `Versi: ${currentVersion} -> ${latestVersion}`);
  setServiceUpdateNotice(`${updateMessage}${noteMessage}`);
  setLocalUpdateButtonState(canAutoUpdate, "Update local service");
  setDownloadLinkState(!canAutoUpdate, downloadUrl, "Update local service");
  hideInteractivePanels();
  setPreviousVersionsState(true, update.noteHistory || []);
  setError("");
  setNotice(`Local service versi ${currentVersion} harus diperbarui ke ${latestVersion} sebelum lanjut menggunakan dashboard.`, true);
  return true;
}

function applyStatus(status) {
  setServiceConnectivityStatus(true);
  toggleElement(mainPanel, true);
  setLocalUpdateButtonState(false);
  setDownloadLinkState(false);
  setServiceUpdateNotice("");
  setPreviousVersionsState(false);
  if (!pendingUpdateVersion) {
    setUpdateProgressState(false);
  }
  setError("");
  currentRequiredChannelInviteLink = status.requiredChannelInviteLink || "";
  currentBoardviewChannelInviteLink = status.boardviewChannelInviteLink || "";
  currentProblemSolvingChannelInviteLink = status.problemSolvingChannelInviteLink || "";
  currentDatasheetsChannelInviteLink = status.datasheetsChannelInviteLink || "";
  const showJoinPanel = false;
  const hasCompletedAgreement = status.hasAgreed && status.allowsNewWindowTab;
  const showAgreementPanel = status.isLoggedIn && !hasCompletedAgreement;
  const showDashboard = status.isLoggedIn && hasCompletedAgreement;
  const blockAuthForms = showJoinPanel || showAgreementPanel || showDashboard;
  const showPhoneEntryForm = (status.requiresPhoneNumber || isPhoneNumberChangeRequested) && !blockAuthForms;
  const showVerificationForm = status.requiresVerificationCode && !isPhoneNumberChangeRequested && !blockAuthForms;
  const showPasswordForm = status.requiresPassword && !isPhoneNumberChangeRequested && !blockAuthForms;
  const codeInput = document.getElementById("verificationCode");

  isSchematicsMember = Boolean(status.isSchematicsChannelMember);
  currentSchematicsChannelRole = status.schematicsChannelRole || "";
  isProblemSolvingMember = Boolean(status.isProblemSolvingChannelMember);
  currentProblemSolvingChannelRole = status.problemSolvingChannelRole || "";
  isDatasheetsMember = Boolean(status.isDatasheetsChannelMember);
  currentDatasheetsChannelRole = status.datasheetsChannelRole || "";

  toggleElement(phoneForm, showPhoneEntryForm);
  toggleElement(codeForm, showVerificationForm);
  toggleElement(passwordForm, showPasswordForm);
  toggleElement(channelJoinPanel, showJoinPanel);
  toggleElement(agreementPanel, showAgreementPanel);
  toggleElement(dashboardPanel, showDashboard);
  syncVerificationPhoneDisplay();

  if (showVerificationForm && codeInput) {
    const suggestedOtp = (status.autoFilledVerificationCode || "").trim();
    if (suggestedOtp && codeInput.value.trim() !== suggestedOtp) {
      codeInput.value = suggestedOtp;
    }
  } else if (codeInput && !showVerificationForm) {
    codeInput.value = "";
    lastAutoFilledOtpNoticeCode = "";
  }
  syncCodeSubmitButtonState();

  if (showVerificationForm || showPasswordForm) {
    startAuthStatusPolling();
  } else {
    stopAuthStatusPolling();
  }

  if (showDashboard) {
    const displayName = status.displayName || status.email || "TeknisiHub User";
    const accountIdentifier = status.email || "Nomor Telegram belum tersedia";
    currentChannelRole = status.channelRole || "";
    currentBiosChannelRole = status.biosChannelRole || status.channelRole || "";
    currentBoardviewChannelRole = status.boardviewChannelRole || "";
    currentSchematicsChannelRole = status.schematicsChannelRole || "";
    currentProblemSolvingChannelRole = status.problemSolvingChannelRole || "";
    currentDatasheetsChannelRole = status.datasheetsChannelRole || "";
    const representativeRole = getRepresentativeRoleLabel(status);
    setText(dashboardTitle, `Halo, ${displayName}`);
    setText(dashboardLoginStatus, "Login Telegram aktif");
    setText(dashboardRoleChipIcon, representativeRole.icon);
    setText(dashboardRoleChip, representativeRole.label);
    setText(accessDisplayName, displayName);
    setText(accessRole, `Role: ${representativeRole.label} | ${accountIdentifier}`);
    setText(accessChannelCount, "Provider login: Telegram");
    setText(dashboardChannelStatus, "Role akun dikelola dari RTD. User baru otomatis masuk sebagai Member sampai peran diperbarui.");
    setText(
      dashboardAgreementStatus,
      hasCompletedAgreement ? "Persetujuan tersimpan" : "Menunggu persetujuan"
    );

    if (hasCompletedAgreement) {
      setText(dashboardSubtitle, "Sesi login Telegram tersimpan aman di local service.");
      setText(accessState, `Terhubung. Akun aktif dengan role ${representativeRole.label}.`);
      setNotice("");
      renderCatalog([], currentCatalogView);
      setServiceConnectivityStatus(true);
      return;
    }

    resetCatalog();

    setText(
      dashboardSubtitle,
      "Sesi login Telegram aktif. Simpan persetujuan lokal untuk membuka akses dashboard penuh."
    );
    setText(accessState, "Login aktif. Simpan persetujuan untuk membuka dashboard.");
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
    const autoFilledOtp = (status.autoFilledVerificationCode || "").trim();
    if (autoFilledOtp) {
      if (lastAutoFilledOtpNoticeCode !== autoFilledOtp) {
        lastAutoFilledOtpNoticeCode = autoFilledOtp;
        setNotice("Kode OTP Telegram terdeteksi dan sudah diisikan otomatis. Periksa lalu tekan Kirim kode.");
      }
    } else {
      lastAutoFilledOtpNoticeCode = "";
      setNotice("Masukkan kode verifikasi Telegram yang diterima user.");
    }
    return;
  }

  if (status.requiresPassword) {
    setNotice("Akun menggunakan 2FA. Lanjutkan dengan password Telegram.");
    return;
  }

  setNotice("Masukkan nomor Telegram untuk memulai login lewat local service.");
}

function handleCatalogLoadFailureDuringRefresh(status, error) {
  setServiceConnectivityStatus(true);
  console.warn("Gagal memuat katalog setelah refresh status.", error);

  if (isJoinManagedCatalogView(currentCatalogView) && isChannelJoinRequiredError(error)) {
    setChannelJoinRequired(currentCatalogView, true);
    catalogItems = [];
    renderCatalog([], currentCatalogView);
    setNotice(`Akses ${getTelegramCatalogConfig(currentCatalogView).displayName} belum aktif untuk akun ini.`, "info");
    return;
  }

  setNotice(error?.message || "Katalog gagal dimuat.", true);
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

  const trafficToken = beginApiTraffic(path);
  try {
    response = await fetch(requestUrl, {
      headers,
      cache: options.cache || "no-store",
      ...options
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      error.isAbortError = true;
      throw error;
    }
    throw new Error(`Koneksi ke local service gagal: ${error.message || "unknown error"}`);
  } finally {
    endApiTraffic(trafficToken);
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

function buildGoogleAuthLaunchUrl(authorizationUrl, forceConsent = false) {
  const searchParams = new URLSearchParams({
    authorizationUrl
  });
  if (forceConsent) {
    searchParams.set("forceConsent", "true");
  }

  return `${serviceBaseUrl}/auth/google/launch?${searchParams.toString()}`;
}

function openGoogleAuthTab(url) {
  const authTab = window.open(url, "teknisihub-google-login");
  if (!authTab) {
    return null;
  }

  try {
    authTab.focus();
  } catch {
    // Browser bisa mengabaikan focus untuk tab tertentu.
  }

  return authTab;
}

function uploadFormData(path, formData, options = {}) {
  const requestUrl = `${serviceBaseUrl}${path}`;
  const operationId = String(options.operationId || "").trim();

  return new Promise((resolve, reject) => {
    const trafficToken = beginApiTraffic(path);
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || "POST", requestUrl, true);
    let pollingTimerId = 0;
    let pollingStopped = false;

    const stopPolling = () => {
      pollingStopped = true;
      if (pollingTimerId) {
        window.clearInterval(pollingTimerId);
        pollingTimerId = 0;
      }
    };

    const pollServerProgress = async () => {
      if (!operationId || pollingStopped || typeof options.onServerProgress !== "function") {
        return;
      }

      try {
        const progress = await fetchJson(`/catalog/upload-progress/${encodeURIComponent(operationId)}`);
        if (pollingStopped) {
          return;
        }

        options.onServerProgress(progress);
        if (!progress.active && ["completed", "failed", "cancelled"].includes(String(progress.stage || "").toLowerCase())) {
          stopPolling();
        }
      } catch {
        // Progress polling is best effort while the main upload request is still running.
      }
    };

    if (operationId && typeof options.onServerProgress === "function") {
      void pollServerProgress();
      pollingTimerId = window.setInterval(() => {
        void pollServerProgress();
      }, 700);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || typeof options.onProgress !== "function") {
        return;
      }

      options.onProgress({
        loaded: event.loaded,
        total: event.total,
        percent: event.total > 0 ? (event.loaded / event.total) * 100 : 0
      });
    };

    xhr.onerror = () => {
      stopPolling();
      reject(new Error("Koneksi ke local service gagal: unknown error"));
    };

    xhr.onabort = () => {
      stopPolling();
      const abortError = new Error("Upload terputus dari browser sebelum respons selesai.");
      abortError.isAbortError = true;
      reject(abortError);
    };

    xhr.onload = () => {
      stopPolling();
      const rawText = xhr.responseText || "";
      let payload = {};

      if (rawText) {
        try {
          payload = JSON.parse(rawText);
        } catch {
          payload = { message: rawText };
        }
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        const validationErrors = payload.errors && typeof payload.errors === "object"
          ? Object.values(payload.errors).flat().join(" ")
          : "";
        reject(new Error(
          payload.message ||
          payload.title ||
          validationErrors ||
          `Request gagal (${xhr.status}).`
        ));
        return;
      }

      resolve(payload);
    };

    xhr.onloadend = () => {
      endApiTraffic(trafficToken);
      const canPollFinalState = Boolean(operationId) && typeof options.onServerProgress === "function";
      stopPolling();
      if (!canPollFinalState) {
        return;
      }

      fetchJson(`/catalog/upload-progress/${encodeURIComponent(operationId)}`)
        .then((progress) => {
          options.onServerProgress(progress);
        })
        .catch(() => {
          // Ignore final polling failure because the main request already carries the definitive result.
        });
    };

    xhr.send(formData);
  });
}

async function refreshStatus(options = {}) {
  const forceUpdateCheck = Boolean(options.forceUpdateCheck);
  toggleElement(mainPanel, false);
  setError("");
  setText(serviceVersion, "Versi: mengecek...");
  let health = null;
  let status = null;

  try {
    const healthUrl = forceUpdateCheck ? "/health?forceUpdateCheck=true" : "/health";
    health = await fetchJson(healthUrl);
    setServiceConnectivityStatus(true);
    setText(serviceVersion, `Versi: ${health.version || "unknown"}`);

    if (applyUpdateRequirement(health)) {
      return health;
    }

    await hydrateCatalogUploadTasksFromService();
    status = await fetchJson("/auth/status");
    applyStatus(status);
  } catch (error) {
    stopCatalogUploadTaskSync();
    closeCatalogEventStream();
    clearCatalogRealtimeReloads();
    setServiceConnectivityStatus(false);
    setText(serviceVersion, "Versi: offline");
    setServiceUpdateNotice("");
    hideInteractivePanels();
    setLocalUpdateButtonState(false);
    if (pendingUpdateVersion) {
      setDownloadLinkState(false);
      setUpdateProgressState(
        true,
        99,
        "Menunggu local service berhenti, file unlock, lalu service baru menyala...",
        pendingUpdateVersion ? `Target v.${pendingUpdateVersion}` : ""
      );
      scheduleRestartPolling(3000);
    } else {
      setDownloadLinkState(true);
      setUpdateProgressState(false);
    }
    setError(`Koneksi ke local service gagal: ${error.message || "unknown error"}`);
    setNotice("Local service belum aktif. Jalankan TeknisiHub.LocalService dulu, lalu refresh.", true);
    throw error;
  }

  if (status?.isLoggedIn && status?.hasAgreed && status?.allowsNewWindowTab) {
    setActiveNav(currentCatalogView);
    try {
      await loadCatalog();
    } catch (error) {
      handleCatalogLoadFailureDuringRefresh(status, error);
    }
  }

  ensureCatalogEventStreamConnected();
  return health;
}

async function submitCatalogEditor(submissionContext = {}) {
  const config = getTelegramCatalogConfig();
  const isSimpleFileUpload = catalogEditorMode !== "edit" && (config.endpoint === "problem-solving" || config.endpoint === "datasheets");
  const supportsSerialNumber = supportsCatalogSerialNumber(currentCatalogView);
  const supportsNote = supportsCatalogNoteField(currentCatalogView);
  const requiresStructuredMetadata =
    !isSimpleFileUpload &&
    currentCatalogView !== "ProblemSolving" &&
    currentCatalogView !== "Datasheets";
  const payload = {
    deviceModel: catalogEditorDeviceModel?.value.trim() || "",
    serialNumber: supportsSerialNumber ? catalogEditorSerialNumber?.value.trim() || "" : "",
    boardCode: catalogEditorBoardCode?.value.trim() || "",
    note: supportsNote ? catalogEditorNote?.value.trim() || "" : ""
  };

  const boardCodeRequired = isBoardCodeRequiredForCategory(currentCatalogView);
  if (requiresStructuredMetadata && (!payload.deviceModel || (boardCodeRequired && !payload.boardCode))) {
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
    await reloadCatalogAfterMutation(currentCatalogView);
    return;
  }

  if (!catalogEditorFile?.files?.length) {
    throw new Error(`Pilih file ${config.displayName} dulu sebelum upload.`);
  }

  const selectedFile = catalogEditorFile.files[0];
  const requiresBoardviewAlias = shouldRequireBoardviewAlias(selectedFile.name, currentCatalogView);
  validateCatalogFileNameLength(selectedFile.name, config.displayName, {
    skipMinimumLength: config.endpoint === "datasheets" || requiresBoardviewAlias
  });
  const aliasName = requiresBoardviewAlias
    ? validateBoardviewAliasName(catalogEditorAliasName?.value, selectedFile.name, config.displayName)
    : "";
  validateCatalogFileSize(selectedFile, currentCatalogView);
  const lowerFileName = selectedFile.name.toLowerCase();
  const allowedExtensions = config.endpoint === "boardview"
    ? allowedBoardviewExtensions
    : config.endpoint === "schematics"
    ? allowedSchematicsExtensions
    : config.endpoint === "problem-solving"
    ? [".md"]
    : config.endpoint === "datasheets"
    ? allowedDatasheetsExtensions
    : allowedBiosExtensions;
  const hasAllowedExtension = allowedExtensions.some((extension) => lowerFileName.endsWith(extension));
  if (!hasAllowedExtension) {
    throw new Error(config.invalidExtensionMessage);
  }

  const formData = new FormData();
  formData.set("file", selectedFile);
  formData.set("md5", catalogEditorMd5?.value.trim() || "");
  if (aliasName) {
    formData.set("aliasName", aliasName);
  }
  getCatalogAdditionalFileInputs().forEach((input) => {
    const extraFile = input.files?.[0];
    if (extraFile) {
      validateCatalogFileSize(extraFile, currentCatalogView, { isAdditionalFile: true });
      formData.append("additionalFiles", extraFile);
    }
  });
  if (!isSimpleFileUpload) {
    formData.set("deviceModel", payload.deviceModel);
    formData.set("serialNumber", payload.serialNumber);
    formData.set("boardCode", payload.boardCode);
    formData.set("note", payload.note);
  }
  const operationId = createCatalogUploadOperationId();
  formData.set("operationId", operationId);
  beginCatalogUploadTask({
    operationId,
    fileName: selectedFile.name,
    displayName: config.displayName,
    message: `Menyiapkan upload ${config.displayName}...`
  });
  submissionContext.minimizedToTask = true;
  closeCatalogEditor();

  let result;
  try {
    result = await uploadFormData(`/catalog/${config.endpoint}`, formData, {
      method: "POST",
      operationId,
      onProgress: ({ percent }) => {
        const localServiceUploadCap = config.endpoint === "bios" ? 20 : 15;
        const roundedPercent = Math.max(1, Math.min(localServiceUploadCap, Math.round(percent * (localServiceUploadCap / 100))));
        upsertCatalogUploadTask({
          operationId,
          fileName: selectedFile.name,
          displayName: config.displayName,
          stage: "uploading",
          active: true,
          success: false,
          progressPercent: roundedPercent,
          message: `Mengirim file ${config.displayName} ke local service...`
        });
      },
      onServerProgress: (progress) => {
        applyCatalogTelegramUploadProgress(progress, {
          operationId,
          fileName: selectedFile.name,
          displayName: config.displayName
        });
      }
    });
  } catch (error) {
    const reconciledProgress = await reconcileCatalogUploadTaskFromService(operationId, {
      operationId,
      fileName: selectedFile.name,
      displayName: config.displayName
    });
    const reconciledStage = String(reconciledProgress?.stage || "").toLowerCase();

    if (reconciledProgress?.active || ["preparing", "uploading", "sending"].includes(reconciledStage)) {
      setNotice(`Upload ${config.displayName} masih diproses di local service. Progress akan lanjut di panel task.`, "info");
      return;
    }

    if (reconciledStage === "completed" || reconciledProgress?.success) {
      const completedMessage = reconciledProgress?.message || `Upload ${config.displayName} selesai.`;
      upsertCatalogUploadTask({
        operationId,
        fileName: selectedFile.name,
        displayName: config.displayName,
        stage: "completed",
        active: false,
        success: true,
        progressPercent: 100,
        message: completedMessage
      });
      setNotice(completedMessage);
      await reloadCatalogAfterMutation(currentCatalogView);
      return;
    }

    if (reconciledProgress && ["failed", "cancelled"].includes(reconciledStage)) {
      const finalMessage = reconciledProgress.lastError || reconciledProgress.message || error.message || "Upload gagal.";
      upsertCatalogUploadTask({
        operationId,
        fileName: selectedFile.name,
        displayName: config.displayName,
        stage: reconciledStage,
        active: false,
        success: false,
        progressPercent: reconciledStage === "cancelled" ? 0 : 100,
        message: reconciledProgress.message || `Upload ${config.displayName} gagal.`,
        lastError: reconciledProgress.lastError || ""
      });
      throw new Error(finalMessage);
    }

    upsertCatalogUploadTask({
      operationId,
      fileName: selectedFile.name,
      displayName: config.displayName,
      stage: "failed",
      active: false,
      success: false,
      progressPercent: 100,
      message: `Upload ${config.displayName} gagal.`,
      lastError: error.message || "Upload gagal."
    });
    throw error;
  }

  upsertCatalogUploadTask({
    operationId,
    fileName: selectedFile.name,
    displayName: config.displayName,
    stage: "completed",
    active: false,
    success: true,
    progressPercent: 100,
    message: result.message || `Upload ${config.displayName} selesai.`
  });

  setNotice(result.message);
  await reloadCatalogAfterMutation(currentCatalogView);
}

async function deleteCatalogItem(category, messageId) {
  const config = getTelegramCatalogConfig(category);
  const result = await fetchJson(`/catalog/${config.endpoint}/${messageId}`, {
    method: "DELETE"
  });
  setNotice(result.message);
  await reloadCatalogAfterMutation(category);
}

async function downloadCatalogItem(category, messageId) {
  const config = getTelegramCatalogConfig(category);
  const supportsTrackedDownload =
    category === "BIOS" ||
    category === "Boardview" ||
    category === "Schematics" ||
    category === "Datasheets";
  if (!supportsTrackedDownload) {
    const result = await fetchJson(`/catalog/${config.endpoint}/${messageId}/download`, {
      method: "POST",
      body: JSON.stringify({})
    });
    setNotice(result.message);
    return;
  }

  const item = findCatalogItemByMessageId(messageId);
  const fallbackFileNamePrefix = category === "Boardview"
    ? "boardview"
    : category === "Schematics"
    ? "schematics"
    : category === "Datasheets"
    ? "datasheets"
    : "bios";
  const fileName = item?.fileName || item?.title || `${fallbackFileNamePrefix}-${messageId}.7z`;
  const operationId = createCatalogUploadOperationId();
  beginCatalogUploadTask({
    operationId,
    fileName,
    displayName: config.displayName,
    message: `Menyiapkan download ${config.displayName}...`
  });

  let result;
  try {
    result = await runCatalogOperationWithProgress(
      `/catalog/${config.endpoint}/${messageId}/download?operationId=${encodeURIComponent(operationId)}`,
      {
        method: "POST",
        body: JSON.stringify({}),
        operationId,
        onServerProgress: (progress) => {
          applyCatalogTelegramUploadProgress(progress, {
            operationId,
            fileName,
            displayName: config.displayName
          });
        }
      }
    );
  } catch (error) {
    const reconciledProgress = await reconcileCatalogUploadTaskFromService(operationId, {
      operationId,
      fileName,
      displayName: config.displayName
    });
    const reconciledStage = String(reconciledProgress?.stage || "").toLowerCase();

    if (reconciledProgress?.active || ["preparing", "uploading", "sending", "downloading", "extracting"].includes(reconciledStage)) {
      setNotice(`Download ${config.displayName} masih diproses di local service. Progress akan lanjut di panel task.`, "info");
      return;
    }

    if (reconciledStage === "completed" || reconciledProgress?.success) {
      const completedMessage = reconciledProgress?.message || `Download ${config.displayName} selesai.`;
      upsertCatalogUploadTask({
        operationId,
        fileName,
        displayName: config.displayName,
        stage: "completed",
        active: false,
        success: true,
        progressPercent: 100,
        message: completedMessage
      });
      setNotice(completedMessage);
      return;
    }

    if (reconciledProgress && ["failed", "cancelled"].includes(reconciledStage)) {
      upsertCatalogUploadTask({
        operationId,
        fileName,
        displayName: config.displayName,
        stage: reconciledStage,
        active: false,
        success: false,
        progressPercent: reconciledStage === "cancelled" ? 0 : 100,
        message: reconciledProgress.message || `Download ${config.displayName} gagal.`,
        lastError: reconciledProgress.lastError || ""
      });
      throw new Error(reconciledProgress.lastError || reconciledProgress.message || error.message || "Download gagal.");
    }

    upsertCatalogUploadTask({
      operationId,
      fileName,
      displayName: config.displayName,
      stage: "failed",
      active: false,
      success: false,
      progressPercent: 100,
      message: `Download ${config.displayName} gagal.`,
      lastError: error.message || "Download gagal."
    });
    throw error;
  }

  upsertCatalogUploadTask({
    operationId,
    fileName,
    displayName: config.displayName,
    stage: "completed",
    active: false,
    success: true,
    progressPercent: 100,
    message: result.message || `Download ${config.displayName} selesai.`
  });
  setNotice(result.message);
}

function openSpiFlashWorkbench(message = "") {
  updateViewHash(spiFlashPage.viewKey);
  currentCatalogView = spiFlashPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
  if (message) {
    setNotice(message);
  }
}

function normalizeBoardviewViewerValue(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  return normalizedValue === "teknisihub" ? "teknisihub" : normalizedValue === "desktop" ? "desktop" : "";
}

function getBoardviewViewerWrapper(target) {
  return target?.closest?.(".catalog-boardview-viewer") || null;
}

function getBoardviewViewerSelect(target) {
  if (!target) {
    return null;
  }

  if (target.matches?.("[data-boardview-viewer]")) {
    return target;
  }

  return getBoardviewViewerWrapper(target)?.querySelector("[data-boardview-viewer]") || null;
}

function getBoardviewOpenActionButton(target) {
  return getBoardviewViewerWrapper(target)?.closest(".catalog-card-actions")?.querySelector(".catalog-open-button") || null;
}

function updateBoardviewOpenActionAvailability(target) {
  const select = getBoardviewViewerSelect(target);
  const button = getBoardviewOpenActionButton(target);
  if (!button) {
    return;
  }

  const hasSelectedViewer = Boolean(normalizeBoardviewViewerValue(select?.value));
  button.disabled = !hasSelectedViewer;
  button.setAttribute("aria-disabled", hasSelectedViewer ? "false" : "true");
}

function buildBoardviewTeknisiHubUrl(sessionId) {
  const targetUrl = new URL("boardview-teknisihub.html", window.location.href);
  targetUrl.searchParams.set("v", "20260512b");
  if (sessionId) {
    targetUrl.searchParams.set("sessionId", sessionId);
  }
  targetUrl.searchParams.set("source", "catalog_boardview");
  return targetUrl.toString();
}

function buildBoardviewOpenPath(messageId, operationId, viewerType, candidateIndex = null) {
  const queryParams = new URLSearchParams();
  if (operationId) {
    queryParams.set("operationId", operationId);
  }
  if (viewerType) {
    queryParams.set("viewerType", viewerType);
  }
  if (candidateIndex !== null && candidateIndex !== undefined) {
    queryParams.set("candidateIndex", String(candidateIndex));
  }
  const query = queryParams.size > 0 ? `?${queryParams.toString()}` : "";
  return `/catalog/boardview/${messageId}/open${query}`;
}

function getBoardviewTeknisiHubLaunchBackgroundUrl() {
  try {
    return new URL("assets/teknisiHubBg.png", window.location.href).toString();
  } catch {
    return "assets/teknisiHubBg.png";
  }
}

function getBoardviewTeknisiHubLaunchThemeMode(themeMode) {
  if (themeMode === "dark" || themeMode === "light") {
    return themeMode;
  }

  if (document.body?.classList.contains("is-dark-mode")) {
    return "dark";
  }

  return "light";
}

function applyBoardviewTeknisiHubLaunchTheme(targetWindow, themeMode, options = {}) {
  if (!targetWindow || targetWindow.closed) {
    return;
  }

  const resolvedMode = themeMode === "dark" ? "dark" : "light";
  const launchRoot = targetWindow.document.querySelector(".th-launch");
  if (launchRoot) {
    launchRoot.classList.toggle("th-theme-dark", resolvedMode === "dark");
    launchRoot.classList.toggle("th-theme-light", resolvedMode !== "dark");
  }

  targetWindow.document.body.dataset.thTheme = resolvedMode;
  const toggleButton = targetWindow.document.querySelector("[data-th-theme-toggle]");
  if (toggleButton) {
    const nextModeLabel = resolvedMode === "dark" ? "Gunakan mode terang" : "Gunakan mode gelap";
    toggleButton.dataset.themeMode = resolvedMode;
    toggleButton.setAttribute("aria-label", nextModeLabel);
    toggleButton.setAttribute("title", nextModeLabel);
    toggleButton.setAttribute("aria-pressed", String(resolvedMode === "dark"));
  }

  if (options.persist) {
    applyThemeMode(resolvedMode);
  }
}

function bindBoardviewTeknisiHubLaunchThemeToggle(targetWindow) {
  if (!targetWindow || targetWindow.closed) {
    return;
  }

  const toggleButton = targetWindow.document.querySelector("[data-th-theme-toggle]");
  if (!toggleButton) {
    return;
  }

  toggleButton.addEventListener("click", () => {
    const currentMode = toggleButton.dataset.themeMode === "dark" ? "dark" : "light";
    const nextMode = currentMode === "dark" ? "light" : "dark";
    applyBoardviewTeknisiHubLaunchTheme(targetWindow, nextMode, { persist: true });
  });
}

function renderBoardviewTeknisiHubLaunchWindow(targetWindow, options = {}) {
  if (!targetWindow || targetWindow.closed) {
    return false;
  }

  const supportedModes = new Set(["pending", "selection", "loading", "error"]);
  const mode = supportedModes.has(options.mode) ? options.mode : "pending";
  const themeMode = getBoardviewTeknisiHubLaunchThemeMode(options.themeMode);
  const backgroundUrl = getBoardviewTeknisiHubLaunchBackgroundUrl();
  const panelWidth = options.panelWidth || (mode === "selection" ? "660px" : "540px");
  const documentTitle = options.documentTitle || "Boardview TeknisiHub";
  const eyebrow = escapeHtml(options.eyebrow || "Boardview TeknisiHub");
  const heading = escapeHtml(options.heading || "Boardview TeknisiHub");
  const copyMarkup = options.copyMarkup || "";
  const contentMarkup = options.contentMarkup || "";
  const footerMarkup = options.footerMarkup || "";

  try {
    targetWindow.document.title = documentTitle;
    targetWindow.document.body.innerHTML = `
      <style>
        html,
        body {
          min-height: 100%;
          margin: 0;
        }

        body {
          font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0c2435;
          background: #f3fbfd;
          color-scheme: light;
          overflow: auto;
        }

        body[data-th-theme="dark"] {
          color: #edf8ff;
          background: #020812;
          color-scheme: dark;
        }

        .th-launch {
          --panel-width: ${panelWidth};
          min-height: 100vh;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, var(--panel-width));
          align-items: center;
          gap: clamp(24px, 5vw, 84px);
          padding: clamp(22px, 5vw, 76px);
          background-color: #f3fbfd;
          background-image:
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.24) 42%, rgba(255, 255, 255, 0.88) 68%, rgba(255, 255, 255, 0.97) 100%),
            url(${JSON.stringify(backgroundUrl)});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .th-launch.th-theme-dark {
          background-color: #020812;
          background-image:
            linear-gradient(90deg, rgba(2, 8, 18, 0.7) 0%, rgba(2, 8, 18, 0.48) 38%, rgba(3, 14, 25, 0.86) 68%, rgba(2, 8, 18, 0.96) 100%),
            url(${JSON.stringify(backgroundUrl)});
        }

        .th-brand-space {
          min-height: 52vh;
        }

        .th-panel {
          position: relative;
          width: min(100%, var(--panel-width));
          justify-self: end;
          box-sizing: border-box;
          border: 1px solid rgba(13, 82, 110, 0.18);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.86);
          box-shadow: 0 24px 70px rgba(10, 46, 63, 0.22);
          backdrop-filter: blur(18px) saturate(1.12);
          padding: clamp(22px, 3vw, 34px);
        }

        .th-theme-dark .th-panel {
          border-color: rgba(94, 234, 212, 0.18);
          background: rgba(4, 16, 28, 0.84);
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.48);
        }

        .th-panel--error {
          border-color: rgba(178, 48, 48, 0.2);
        }

        .th-theme-toggle {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(13, 82, 110, 0.16);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.64);
          cursor: pointer;
          transition: background 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
        }

        .th-theme-toggle:hover,
        .th-theme-toggle:focus-visible {
          transform: translateY(-1px);
          border-color: rgba(16, 160, 178, 0.62);
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 12px 28px rgba(12, 72, 92, 0.18);
          outline: none;
        }

        .th-theme-dark .th-theme-toggle {
          border-color: rgba(94, 234, 212, 0.18);
          background: rgba(3, 18, 32, 0.78);
        }

        .th-theme-dark .th-theme-toggle:hover,
        .th-theme-dark .th-theme-toggle:focus-visible {
          border-color: rgba(94, 234, 212, 0.54);
          background: rgba(8, 31, 50, 0.94);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.32);
        }

        .th-theme-toggle-icon {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #082337;
          box-shadow: inset -5px -4px 0 rgba(255, 255, 255, 0.9);
        }

        .th-theme-dark .th-theme-toggle-icon {
          background: #ffd86b;
          box-shadow:
            0 0 0 4px rgba(255, 216, 107, 0.16),
            0 0 18px rgba(94, 234, 212, 0.22);
        }

        .th-kicker {
          margin: 0 0 12px;
          padding-right: 52px;
          color: #0d7890;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.16em;
          line-height: 1.35;
          text-transform: uppercase;
        }

        .th-theme-dark .th-kicker {
          color: #5eead4;
        }

        .th-panel--error .th-kicker {
          color: #b73838;
        }

        .th-theme-dark .th-panel--error .th-kicker {
          color: #ff9c9c;
        }

        .th-title {
          margin: 0;
          color: #082337;
          font-size: clamp(30px, 4vw, 46px);
          line-height: 1.02;
          font-weight: 850;
        }

        .th-theme-dark .th-title {
          color: #f7fdff;
        }

        .th-copy {
          margin-top: 16px;
          color: #2d4b5c;
          font-size: 15px;
          line-height: 1.68;
        }

        .th-theme-dark .th-copy {
          color: #c6d8e8;
        }

        .th-copy p,
        .th-footer {
          margin: 0;
        }

        .th-copy strong {
          color: #082337;
          font-weight: 800;
        }

        .th-theme-dark .th-copy strong {
          color: #ffffff;
        }

        .th-content {
          margin-top: 22px;
        }

        .th-footer {
          margin-top: 18px;
          color: #527083;
          font-size: 13px;
          line-height: 1.55;
        }

        .th-theme-dark .th-footer {
          color: #93adbd;
        }

        .th-progress {
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(9, 58, 82, 0.12);
        }

        .th-theme-dark .th-progress {
          background: rgba(183, 236, 245, 0.12);
        }

        .th-progress span {
          display: block;
          width: 46%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #0c5574, #1eb9c3, #5cd3a1);
          animation: th-progress-pulse 1.25s ease-in-out infinite;
        }

        .th-candidate-list {
          display: grid;
          gap: 10px;
        }

        .th-candidate {
          width: 100%;
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr) auto;
          align-items: center;
          gap: 13px;
          border: 1px solid rgba(13, 82, 110, 0.16);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.72);
          color: #0c2435;
          cursor: pointer;
          padding: 13px 14px;
          text-align: left;
          transition: background 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
        }

        .th-theme-dark .th-candidate {
          border-color: rgba(94, 234, 212, 0.14);
          background: rgba(6, 18, 32, 0.72);
          color: #edf8ff;
        }

        .th-candidate:hover,
        .th-candidate:focus-visible {
          transform: translateY(-1px);
          border-color: rgba(16, 160, 178, 0.7);
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 14px 34px rgba(12, 72, 92, 0.16);
          outline: none;
        }

        .th-theme-dark .th-candidate:hover,
        .th-theme-dark .th-candidate:focus-visible {
          border-color: rgba(94, 234, 212, 0.58);
          background: rgba(10, 34, 54, 0.94);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.3);
        }

        .th-candidate-number {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #0d5672;
          color: #ffffff;
          font-size: 13px;
          font-weight: 850;
        }

        .th-theme-dark .th-candidate-number {
          background: #5eead4;
          color: #03202b;
        }

        .th-candidate-title {
          display: block;
          min-width: 0;
          color: #082337;
          font-size: 15px;
          font-weight: 850;
          line-height: 1.35;
          word-break: break-word;
        }

        .th-theme-dark .th-candidate-title {
          color: #f7fdff;
        }

        .th-candidate-path {
          display: block;
          margin-top: 4px;
          color: #426679;
          font-size: 12px;
          line-height: 1.45;
          word-break: break-word;
        }

        .th-theme-dark .th-candidate-path {
          color: #9eb8ca;
        }

        .th-candidate-meta {
          display: block;
          margin-top: 7px;
          color: #0d7890;
          font-size: 12px;
          font-weight: 750;
        }

        .th-theme-dark .th-candidate-meta {
          color: #68e7df;
        }

        .th-badge {
          border: 1px solid rgba(25, 128, 88, 0.24);
          border-radius: 999px;
          background: rgba(40, 180, 128, 0.12);
          color: #146547;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.08em;
          line-height: 1;
          padding: 7px 9px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .th-theme-dark .th-badge {
          border-color: rgba(74, 222, 128, 0.24);
          background: rgba(34, 197, 94, 0.12);
          color: #a7f3c4;
        }

        .th-alert {
          border: 1px solid rgba(178, 48, 48, 0.16);
          border-radius: 8px;
          background: rgba(255, 242, 242, 0.88);
          color: #8a2525;
          font-size: 14px;
          line-height: 1.55;
          padding: 13px 14px;
        }

        .th-theme-dark .th-alert {
          border-color: rgba(248, 113, 113, 0.2);
          background: rgba(75, 18, 28, 0.5);
          color: #ffd2d2;
        }

        @keyframes th-progress-pulse {
          0% {
            transform: translateX(-80%);
          }
          50% {
            transform: translateX(75%);
          }
          100% {
            transform: translateX(230%);
          }
        }

        @media (max-width: 820px) {
          .th-launch {
            min-height: 100vh;
            grid-template-columns: 1fr;
            align-items: end;
            padding: 46vh 18px 18px;
            background-image:
              linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.58) 48%, rgba(255, 255, 255, 0.96) 100%),
              url(${JSON.stringify(backgroundUrl)});
            background-position: center top;
          }

          .th-launch.th-theme-dark {
            background-image:
              linear-gradient(180deg, rgba(2, 8, 18, 0.24) 0%, rgba(2, 8, 18, 0.66) 48%, rgba(2, 8, 18, 0.97) 100%),
              url(${JSON.stringify(backgroundUrl)});
          }

          .th-brand-space {
            display: none;
          }

          .th-panel {
            justify-self: stretch;
            width: 100%;
            padding: 20px;
          }

          .th-candidate {
            grid-template-columns: 30px minmax(0, 1fr);
          }

          .th-badge {
            grid-column: 2;
            justify-self: start;
          }
        }
      </style>
      <main class="th-launch th-launch--${mode} th-theme-${themeMode}">
        <div class="th-brand-space" aria-hidden="true"></div>
        <section class="th-panel th-panel--${mode}" aria-live="polite">
          <button type="button" class="th-theme-toggle" data-th-theme-toggle>
            <span class="th-theme-toggle-icon" aria-hidden="true"></span>
          </button>
          <p class="th-kicker">${eyebrow}</p>
          <h1 class="th-title">${heading}</h1>
          ${copyMarkup ? `<div class="th-copy">${copyMarkup}</div>` : ""}
          ${contentMarkup ? `<div class="th-content">${contentMarkup}</div>` : ""}
          ${footerMarkup ? `<p class="th-footer">${footerMarkup}</p>` : ""}
        </section>
      </main>
    `;
    applyBoardviewTeknisiHubLaunchTheme(targetWindow, themeMode);
    bindBoardviewTeknisiHubLaunchThemeToggle(targetWindow);
    return true;
  } catch {
    return false;
  }
}

function openPendingBoardviewTeknisiHubWindow(fileName) {
  const pendingWindow = window.open("", "_blank");
  if (!pendingWindow) {
    return null;
  }

  try {
    pendingWindow.opener = null;
    renderBoardviewTeknisiHubLaunchWindow(pendingWindow, {
      mode: "pending",
      documentTitle: "Menyiapkan Boardview TeknisiHub",
      heading: "Menyiapkan viewer",
      copyMarkup: `<p>Local service sedang menyiapkan session boardview untuk <strong>${escapeHtml(fileName || "Boardview")}</strong>.</p>`,
      contentMarkup: `<div class="th-progress" aria-hidden="true"><span></span></div>`,
      footerMarkup: "Tab ini akan otomatis berpindah ke viewer begitu session siap."
    });
  } catch {
    // Ignore temporary window rendering failure; navigation can still proceed later.
  }

  return pendingWindow;
}

function renderBoardviewCandidateSelectionWindow(targetWindow, payload, context) {
  if (!targetWindow || targetWindow.closed) {
    return false;
  }

  const candidates = Array.isArray(payload?.candidateFiles)
    ? payload.candidateFiles
    : [];
  if (candidates.length <= 0) {
    disposePendingBoardviewTeknisiHubWindow(
      targetWindow,
      context?.fileName || "Boardview",
      "Local service belum mengirim daftar file boardview yang bisa dipilih."
    );
    return false;
  }

  const listMarkup = candidates.map((candidate) => {
    const candidateIndex = Number(candidate.index || 0);
    const label = candidate.fileName || candidate.relativePath || `File ${candidateIndex + 1}`;
    const relativePath = candidate.relativePath && candidate.relativePath !== label
      ? `<span class="th-candidate-path">${escapeHtml(candidate.relativePath)}</span>`
      : "";
    const recommended = candidate.recommended
      ? `<span class="th-badge">Rekomendasi</span>`
      : "";
    const meta = [candidate.extension, candidate.displaySize]
      .filter(Boolean)
      .join(" | ");

    return `
      <button type="button" class="th-candidate" data-boardview-candidate-index="${candidateIndex}" aria-label="Buka ${escapeHtml(label)}">
        <span class="th-candidate-number">${candidateIndex + 1}</span>
        <span style="min-width:0;">
          <strong class="th-candidate-title">${escapeHtml(label)}</strong>
          ${relativePath}
          <span class="th-candidate-meta">${escapeHtml(meta || "Boardview file")}</span>
        </span>
        ${recommended}
      </button>
    `;
  }).join("");

  try {
    const rendered = renderBoardviewTeknisiHubLaunchWindow(targetWindow, {
      mode: "selection",
      panelWidth: "680px",
      documentTitle: "Pilih file Boardview TeknisiHub",
      heading: "Pilih file boardview",
      copyMarkup: `<p>Arsip <strong>${escapeHtml(context?.fileName || payload.fileName || "Boardview")}</strong> berisi beberapa file boardview. Pilih satu file untuk dibuatkan session viewer.</p>`,
      contentMarkup: `<div class="th-candidate-list">${listMarkup}</div>`,
      footerMarkup: "Rekomendasi diurutkan dari kandidat yang paling mungkin menjadi board utama."
    });
    if (!rendered) {
      targetWindow.close();
      return false;
    }

    targetWindow.document.querySelectorAll("[data-boardview-candidate-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const candidateIndex = Number(button.getAttribute("data-boardview-candidate-index") || 0);
        const candidate = candidates.find((entry) => Number(entry.index || 0) === candidateIndex) || candidates[candidateIndex] || candidates[0];
        void openSelectedBoardviewCandidateFromPendingWindow(targetWindow, context, candidate);
      });
    });
    return true;
  } catch {
    targetWindow.close();
    return false;
  }
}

function renderBoardviewCandidateLoadingWindow(targetWindow, fileName) {
  if (!targetWindow || targetWindow.closed) {
    return;
  }

  try {
    renderBoardviewTeknisiHubLaunchWindow(targetWindow, {
      mode: "loading",
      documentTitle: "Menyiapkan Boardview TeknisiHub",
      heading: "Membuka pilihan file",
      copyMarkup: `<p>Local service sedang membuat session untuk <strong>${escapeHtml(fileName || "Boardview")}</strong>.</p>`,
      contentMarkup: `<div class="th-progress" aria-hidden="true"><span></span></div>`,
      footerMarkup: "Tab ini akan otomatis berpindah ke viewer begitu session siap."
    });
  } catch {
    // Navigation can still happen if rendering this transient state fails.
  }
}

async function openSelectedBoardviewCandidateFromPendingWindow(targetWindow, context, candidate) {
  const messageId = Number(context?.messageId || 0);
  const candidateIndex = Number(candidate?.index || 0);
  const candidateFileName = candidate?.fileName || context?.fileName || "Boardview";
  if (messageId <= 0) {
    disposePendingBoardviewTeknisiHubWindow(targetWindow, candidateFileName, "ID katalog Boardview tidak valid.");
    return;
  }

  const operationId = createCatalogUploadOperationId();
  renderBoardviewCandidateLoadingWindow(targetWindow, candidateFileName);
  beginCatalogUploadTask({
    operationId,
    fileName: candidateFileName,
    displayName: "Boardview",
    message: "Membuat session Boardview TeknisiHub dari file pilihan..."
  });

  try {
    const result = await runCatalogOperationWithProgress(
      buildBoardviewOpenPath(messageId, operationId, "teknisihub", candidateIndex),
      {
        method: "POST",
        body: JSON.stringify({}),
        operationId,
        onServerProgress: (progress) => {
          applyCatalogTelegramUploadProgress(progress, {
            operationId,
            fileName: candidateFileName,
            displayName: "Boardview"
          });
        }
      }
    );

    if (result.requiresFileSelection) {
      renderBoardviewCandidateSelectionWindow(targetWindow, result, context);
      return;
    }

    if (!result.sessionId) {
      throw new Error("Session Boardview TeknisiHub belum diterima dari local service.");
    }

    finalizePendingBoardviewTeknisiHubWindow(targetWindow, result.sessionId);
    upsertCatalogUploadTask({
      operationId,
      fileName: result.fileName || candidateFileName,
      displayName: "Boardview",
      stage: "completed",
      active: false,
      success: true,
      progressPercent: 100,
      message: result.message || "Boardview TeknisiHub berhasil dibuka."
    });
    setNotice(result.message || "Boardview TeknisiHub berhasil dibuka.");
    if (markBoardviewItemHasLocalCache(messageId)) {
      filterCatalogItems();
    }
  } catch (error) {
    upsertCatalogUploadTask({
      operationId,
      fileName: candidateFileName,
      displayName: "Boardview",
      stage: "failed",
      active: false,
      success: false,
      progressPercent: 100,
      message: "Membuka Boardview gagal.",
      lastError: error.message || "Membuka Boardview gagal."
    });
    disposePendingBoardviewTeknisiHubWindow(
      targetWindow,
      candidateFileName,
      error.message || "Membuka Boardview gagal."
    );
    setNotice(error.message || "Membuka Boardview gagal.", true);
  }
}

function finalizePendingBoardviewTeknisiHubWindow(targetWindow, sessionId) {
  const targetUrl = buildBoardviewTeknisiHubUrl(sessionId);
  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.replace(targetUrl);
    return;
  }

  const launchedWindow = window.open(targetUrl, "_blank");
  if (!launchedWindow) {
    throw new Error("Session Boardview TeknisiHub sudah siap, tetapi tab baru diblokir browser. Izinkan pop-up lalu klik Buka lagi.");
  }
}

function disposePendingBoardviewTeknisiHubWindow(targetWindow, fileName, errorMessage) {
  if (!targetWindow || targetWindow.closed) {
    return;
  }

  try {
    renderBoardviewTeknisiHubLaunchWindow(targetWindow, {
      mode: "error",
      documentTitle: "Boardview TeknisiHub gagal dibuka",
      heading: "Viewer belum jadi dibuka",
      copyMarkup: `<p>Session untuk <strong>${escapeHtml(fileName || "Boardview")}</strong> belum berhasil disiapkan.</p>`,
      contentMarkup: `<div class="th-alert">${escapeHtml(errorMessage || "Silakan kembali ke tab utama lalu coba lagi.")}</div>`
    });
  } catch {
    targetWindow.close();
  }
}

const supportedFlashChipDevices = new Set(["CH341A", "STM32", "EZP2019"]);

function normalizeFlashChipDeviceValue(value) {
  const normalizedValue = String(value || "").trim().toUpperCase();
  return supportedFlashChipDevices.has(normalizedValue) ? normalizedValue : "";
}

function getFlashChipDeviceWrapper(target) {
  return target?.closest?.(".catalog-flash-chip-device") || null;
}

function getFlashChipDeviceSelect(target) {
  if (!target) {
    return null;
  }

  if (target.matches?.("[data-flash-chip-device]")) {
    return target;
  }

  return getFlashChipDeviceWrapper(target)?.querySelector("[data-flash-chip-device]") || null;
}

function getFlashChipActionButton(target) {
  return getFlashChipDeviceWrapper(target)?.closest(".catalog-card-actions")?.querySelector(".catalog-flash-chip-button") || null;
}

function getFlashChipDeviceStatusTitle(status, message = "") {
  if (status === "checking") {
    return message || "Mencoba konek device programmer...";
  }

  if (status === "connected") {
    return message || "Device programmer terhubung.";
  }

  if (status === "failed") {
    return message || "Koneksi device programmer gagal.";
  }

  return "Pilih device programmer dulu. Koneksi akan dicek otomatis setelah dipilih.";
}

function setFlashChipDeviceConnectionState(target, status = "idle", message = "") {
  const wrapper = getFlashChipDeviceWrapper(target);
  if (!wrapper) {
    return;
  }

  wrapper.classList.remove("is-checking", "is-connected", "is-failed");
  if (status === "checking") {
    wrapper.classList.add("is-checking");
  } else if (status === "connected") {
    wrapper.classList.add("is-connected");
  } else if (status === "failed") {
    wrapper.classList.add("is-failed");
  } else {
    status = "idle";
  }

  wrapper.dataset.connectionState = status;
  wrapper.title = getFlashChipDeviceStatusTitle(status, message);
}

function updateFlashChipActionAvailability(target) {
  const select = getFlashChipDeviceSelect(target);
  const button = getFlashChipActionButton(target);
  if (!button) {
    return;
  }

  const hasSelectedDevice = Boolean(normalizeFlashChipDeviceValue(select?.value));
  button.disabled = !hasSelectedDevice;
  button.setAttribute("aria-disabled", hasSelectedDevice ? "false" : "true");
  button.title = hasSelectedDevice ? "Siapkan BIOS ke SPI Flash." : "Pilih device programmer dulu";
}

function buildFlashChipConnectPayload(session = {}) {
  return {
    chipVendor: session.chipVendor || "",
    chipModel: session.chipModel || "",
    chipCapacity: session.chipCapacity || "",
    autoProcess: session.autoProcess !== false,
    pageSize: Number(session.pageSize || 256),
    speedHz: Number(session.speedHz || 0),
    startAddress: session.startAddress || "",
    length: session.length || ""
  };
}

async function tryConnectFlashChipDevice(deviceSelect) {
  const select = getFlashChipDeviceSelect(deviceSelect);
  if (!select) {
    return;
  }

  const selectedDevice = normalizeFlashChipDeviceValue(select.value);
  const wrapper = getFlashChipDeviceWrapper(select);
  const connectionAttempt = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  if (wrapper) {
    wrapper.dataset.connectionAttempt = connectionAttempt;
  }

  updateFlashChipActionAvailability(select);
  if (!selectedDevice) {
    setFlashChipDeviceConnectionState(select, "idle");
    return;
  }

  setFlashChipDeviceConnectionState(select, "checking", `Mencoba konek ${selectedDevice}...`);

  try {
    const selectedSession = await fetchJson("/spi-flash/device", {
      method: "POST",
      body: JSON.stringify({ deviceType: selectedDevice })
    });
    if (
      wrapper?.dataset.connectionAttempt !== connectionAttempt ||
      normalizeFlashChipDeviceValue(select.value) !== selectedDevice
    ) {
      return;
    }

    const connectedSession = await fetchJson("/spi-flash/actions/connect", {
      method: "POST",
      body: JSON.stringify(buildFlashChipConnectPayload(selectedSession))
    });
    if (
      wrapper?.dataset.connectionAttempt !== connectionAttempt ||
      normalizeFlashChipDeviceValue(select.value) !== selectedDevice
    ) {
      return;
    }

    setFlashChipDeviceConnectionState(
      select,
      "connected",
      connectedSession.connectionState || `${selectedDevice} terhubung.`
    );
  } catch (error) {
    if (
      wrapper?.dataset.connectionAttempt !== connectionAttempt ||
      normalizeFlashChipDeviceValue(select.value) !== selectedDevice
    ) {
      return;
    }

    setFlashChipDeviceConnectionState(
      select,
      "failed",
      error.message || `Koneksi ${selectedDevice} gagal.`
    );
    setNotice(error.message || `Koneksi ${selectedDevice} gagal.`, true);
  }
}

function getSelectedFlashChipDevice(triggerButton) {
  const select = triggerButton?.closest(".catalog-card-actions")?.querySelector("[data-flash-chip-device]");
  return normalizeFlashChipDeviceValue(select?.value);
}

async function prepareBiosForSpiFlash(messageId, selectedDevice = "CH341A") {
  const resolvedDevice = normalizeFlashChipDeviceValue(selectedDevice) || "CH341A";
  const item = findCatalogItemByMessageId(messageId);
  const archiveFileName = item?.fileName || item?.title || `bios-${messageId}.7z`;
  const operationId = createCatalogUploadOperationId();

  beginCatalogUploadTask({
    operationId,
    fileName: archiveFileName,
    displayName: "SPI Flash",
    message: `Menyiapkan BIOS untuk SPI Flash (${resolvedDevice})...`
  });

  let result;
  try {
    result = await runCatalogOperationWithProgress(
      `/catalog/bios/${messageId}/flash-chip?selectedDevice=${encodeURIComponent(resolvedDevice)}&operationId=${encodeURIComponent(operationId)}`,
      {
        method: "POST",
        body: JSON.stringify({}),
        operationId,
        onServerProgress: (progress) => {
          applyCatalogTelegramUploadProgress(progress, {
            operationId,
            fileName: archiveFileName,
            displayName: "SPI Flash"
          });
        }
      }
    );
  } catch (error) {
    const reconciledProgress = await reconcileCatalogUploadTaskFromService(operationId, {
      operationId,
      fileName: archiveFileName,
      displayName: "SPI Flash"
    });
    const reconciledStage = String(reconciledProgress?.stage || "").toLowerCase();

    if (reconciledProgress?.active || ["preparing", "uploading", "sending", "downloading", "extracting", "loading"].includes(reconciledStage)) {
      setNotice("BIOS masih diproses di local service untuk SPI Flash. Progress akan lanjut di panel task.", "info");
      return;
    }

    if (reconciledStage === "completed" || reconciledProgress?.success) {
      const completedMessage = reconciledProgress?.message || "BIOS sudah siap di SPI Flash.";
      upsertCatalogUploadTask({
        operationId,
        fileName: reconciledProgress?.fileName || archiveFileName,
        displayName: "SPI Flash",
        stage: "completed",
        active: false,
        success: true,
        progressPercent: 100,
        message: completedMessage
      });
      openSpiFlashWorkbench(completedMessage);
      return;
    }

    if (reconciledProgress && ["failed", "cancelled"].includes(reconciledStage)) {
      upsertCatalogUploadTask({
        operationId,
        fileName: reconciledProgress?.fileName || archiveFileName,
        displayName: "SPI Flash",
        stage: reconciledStage,
        active: false,
        success: false,
        progressPercent: reconciledStage === "cancelled" ? 0 : 100,
        message: reconciledProgress.message || "Menyiapkan BIOS untuk SPI Flash gagal.",
        lastError: reconciledProgress.lastError || ""
      });
      throw new Error(reconciledProgress.lastError || reconciledProgress.message || error.message || "Menyiapkan BIOS untuk SPI Flash gagal.");
    }

    upsertCatalogUploadTask({
      operationId,
      fileName: archiveFileName,
      displayName: "SPI Flash",
      stage: "failed",
      active: false,
      success: false,
      progressPercent: 100,
      message: "Menyiapkan BIOS untuk SPI Flash gagal.",
      lastError: error.message || "Menyiapkan BIOS untuk SPI Flash gagal."
    });
    throw error;
  }

  upsertCatalogUploadTask({
    operationId,
    fileName: archiveFileName,
    displayName: "SPI Flash",
    stage: "completed",
    active: false,
    success: true,
    progressPercent: 100,
    message: result.message || "BIOS sudah siap di SPI Flash."
  });
  openSpiFlashWorkbench(result.message || "BIOS sudah siap di SPI Flash.");
}

async function openBoardviewCatalogItem(messageId, options = {}) {
  const operationId = String(options.operationId || "").trim();
  const viewerType = normalizeBoardviewViewerValue(options.viewerType);
  const result = await fetchJson(buildBoardviewOpenPath(messageId, operationId, viewerType, options.candidateIndex), {
    method: "POST",
    body: JSON.stringify({})
  });
  return result;
}

async function openBoardviewCacheLocation(messageId) {
  const result = await fetchJson(`/catalog/boardview/${messageId}/open-cache-location`, {
    method: "POST",
    body: JSON.stringify({})
  });
  setNotice(result.message);
  return result;
}

async function openSchematicsCacheLocation(messageId) {
  const result = await fetchJson(`/catalog/schematics/${messageId}/open-cache-location`, {
    method: "POST",
    body: JSON.stringify({})
  });
  setNotice(result.message);
  return result;
}

function markBoardviewItemHasLocalCache(messageId) {
  const normalizedMessageId = Number(messageId || 0);
  if (normalizedMessageId <= 0) {
    return false;
  }

  let updated = false;
  catalogItems.forEach((item) => {
    if (Number(item?.messageId) !== normalizedMessageId || item.category !== "Boardview") {
      return;
    }

    if (!item.hasLocalCache) {
      item.hasLocalCache = true;
      updated = true;
    }
  });

  return updated;
}

function markSchematicsItemHasLocalCache(messageId) {
  const normalizedMessageId = Number(messageId || 0);
  if (normalizedMessageId <= 0) {
    return false;
  }

  let updated = false;
  catalogItems.forEach((item) => {
    if (Number(item?.messageId) !== normalizedMessageId || item.category !== "Schematics") {
      return;
    }

    if (!item.hasLocalCache) {
      item.hasLocalCache = true;
      updated = true;
    }
  });

  return updated;
}

async function joinSelectedChannels() {
  const joinRequiredChannel = Boolean(dashboardJoinRequiredCheckbox?.checked && !dashboardJoinRequiredCheckbox.disabled);
  const joinBoardviewChannel = Boolean(dashboardJoinBoardviewCheckbox?.checked && !dashboardJoinBoardviewCheckbox.disabled);
  const joinSchematicsChannel = Boolean(dashboardJoinSchematicsCheckbox?.checked && !dashboardJoinSchematicsCheckbox.disabled);

  if (!joinRequiredChannel && !joinBoardviewChannel && !joinSchematicsChannel) {
    setNotice("Pilih minimal satu akses sebelum melanjutkan.", true);
    return;
  }

  setButtonLoading(
    dashboardJoinButton,
    true,
    "group_add",
    "Aktifkan akses terpilih",
    "Menyimpan akses..."
  );

  try {
    const result = await fetchJson("/auth/join-channels", {
      method: "POST",
      body: JSON.stringify({
        joinRequiredChannel,
        joinBoardviewChannel,
        joinSchematicsChannel
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
      "Aktifkan akses terpilih",
      "Menyimpan akses..."
    );
  }
}

phoneForm?.addEventListener("submit", async (event) => {
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

codeForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const verificationCode = document.getElementById("verificationCode")?.value.trim() || "";
  if (!verificationCode) {
    syncCodeSubmitButtonState();
    return;
  }
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
    syncCodeSubmitButtonState();
  }
});

passwordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = document.getElementById("password")?.value.trim() || "";
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
    if (!agreeCheckbox.checked) {
      setNotice("Centang persetujuan akses TeknisiHub terlebih dulu.", true);
      return;
    }

    if (!newWindowTabCheckbox?.checked) {
      setNotice("Centang izin tab/jendela baru untuk viewer katalog terlebih dulu.", true);
      return;
    }

    const allowsNewWindowTab = requestNewWindowTabPermission();
    if (!allowsNewWindowTab) {
      setNotice("Browser memblokir tab/jendela baru. Izinkan pop-up untuk TeknisiHub lalu klik Simpan persetujuan lagi.", true);
      return;
    }

    const result = await fetchJson("/auth/agree", {
      method: "POST",
      body: JSON.stringify({
        accepted: agreeCheckbox.checked,
        allowsNewWindowTab
      })
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

      if (agreeCheckbox) {
        agreeCheckbox.checked = true;
      }

      if (newWindowTabCheckbox) {
        newWindowTabCheckbox.checked = true;
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

if (changePhoneButton) {
  changePhoneButton.addEventListener("click", () => {
    const codeInput = document.getElementById("verificationCode");
    isPhoneNumberChangeRequested = true;

    if (codeInput) {
      codeInput.value = "";
    }
    syncCodeSubmitButtonState();

    toggleElement(codeForm, false);
    toggleElement(passwordForm, false);
    toggleElement(phoneForm, true);
    phoneNumberInput?.focus();
    setNotice("Ganti nomor aktif. Masukkan nomor Telegram lain lalu minta kode login baru.", "info");
  });
}

document.getElementById("verificationCode")?.addEventListener("input", () => {
  syncCodeSubmitButtonState();
});

if (dashboardCheckUpdateButton) {
  dashboardCheckUpdateButton.addEventListener("click", async () => {
    setButtonLoading(
      dashboardCheckUpdateButton,
      true,
      "system_update_alt",
      "Check update",
      "Checking..."
    );

    try {
      const health = await refreshStatus({ forceUpdateCheck: true });
      const latestVersion = health?.update?.latestVersion || health?.version || "unknown";
      setNotice(`sudah terbaru v.${latestVersion}`);
    } catch (error) {
      setNotice(error.message || "Gagal mengecek update.", true);
    } finally {
      setButtonLoading(
        dashboardCheckUpdateButton,
        false,
        "system_update_alt",
        "Check update",
        "Checking..."
      );
    }
  });
}

runLocalUpdateButton?.addEventListener("click", startLocalUpdate);

if (refreshButton) {
  refreshButton.addEventListener("click", refreshStatus);
}

dashboardJoinButton?.addEventListener("click", joinSelectedChannels);
themeToggleButton?.addEventListener("click", toggleThemeMode);
backToTopButton?.addEventListener("click", scrollPageToTop);
window.addEventListener("scroll", syncBackToTopButtonVisibility, { passive: true });
window.addEventListener("storage", handleSharedThemeModeStorageChange);
window.addEventListener("resize", () => {
  syncBackToTopButtonVisibility();
  syncFloatingUtilityOffset();
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    syncThemeModeWithWibClock();
  }
});
window.setInterval(syncThemeModeWithWibClock, 60000);

loadRememberedPhone();
syncVerificationPhoneDisplay();
initializeThemeMode();
initializeIntroQuoteModal();
const initialHashRouteState = parseHashRouteState();
currentHashShareViewKey = initialHashRouteState.shareViewKey;
currentHashShareMessageId = initialHashRouteState.messageId;
currentCatalogView = initialHashRouteState.viewKey || dashboardHomePage.viewKey;
syncBackToTopButtonVisibility();
syncFloatingUtilityOffset();
refreshStatus();
window.addEventListener("hashchange", () => {
  restoreViewFromHash().catch((error) => setNotice(error.message, true));
});
window.addEventListener("message", (event) => {
  if (event?.data?.source !== "teknisihub-google-auth") {
    return;
  }

  googleAuthTabAwaitingResult = false;
  stopGoogleAuthPolling();
  googleAuthTab = null;
  void refreshStatus();
});

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
    const schematicsViewButton = event.target.closest(".catalog-schematics-view-button");
    if (schematicsViewButton) {
      const messageId = Number(schematicsViewButton.getAttribute("data-message-id") || 0);
      const fileName = schematicsViewButton.getAttribute("data-file-name") || "Schematics";
      const previousMarkup = schematicsViewButton.innerHTML;
      const operationId = createCatalogUploadOperationId();
      let shouldRefreshCatalog = false;

      schematicsViewButton.disabled = true;
      schematicsViewButton.innerHTML = `
        <span class="material-symbols-outlined is-spinning">progress_activity</span>
        <span>Membuka...</span>
      `;

      try {
        setNotice(`Mengecek cache Schematics untuk ${fileName}, lalu menyiapkan viewer PDF.`);
        beginCatalogUploadTask({
          operationId,
          fileName,
          displayName: "Schematics",
          message: "Menyiapkan Schematics..."
        });

        const result = await runCatalogOperationWithProgress(
          `/catalog/schematics/${messageId}/prepare-view?operationId=${encodeURIComponent(operationId)}`,
          {
            method: "POST",
            body: JSON.stringify({}),
            operationId,
            onServerProgress: (progress) => {
              applyCatalogTelegramUploadProgress(progress, {
                operationId,
                fileName,
                displayName: "Schematics"
              });
            }
          }
        );

        upsertCatalogUploadTask({
          operationId,
          fileName: result.fileName || fileName,
          displayName: "Schematics",
          stage: "completed",
          active: false,
          success: true,
          progressPercent: 100,
          message: result.message || "Schematics siap dibuka."
        });
        let openedTabCount = 0;
        try {
          openedTabCount = openPreparedSchematicsViewTabs(messageId, result);
        } catch (launchError) {
          shouldRefreshCatalog = markSchematicsItemHasLocalCache(messageId);
          setNotice(launchError.message, true);
          return;
        }

        setNotice(result.message || (openedTabCount > 1
          ? `${openedTabCount} file Schematics dibuka di tab baru.`
          : "Schematics siap dibuka."));
        shouldRefreshCatalog = markSchematicsItemHasLocalCache(messageId);
      } catch (error) {
        const reconciledProgress = await reconcileCatalogUploadTaskFromService(operationId, {
          operationId,
          fileName,
          displayName: "Schematics"
        });
        const reconciledStage = String(reconciledProgress?.stage || "").toLowerCase();

        if (reconciledStage === "completed" || reconciledProgress?.success) {
          try {
            openPreparedSchematicsViewTabs(messageId);
          } catch (launchError) {
            setNotice(launchError.message, true);
            return;
          }
          shouldRefreshCatalog = markSchematicsItemHasLocalCache(messageId);
          setNotice(reconciledProgress?.message || "Schematics siap dibuka.");
        } else {
          if (reconciledProgress?.active || ["preparing", "downloading", "extracting", "loading"].includes(reconciledStage)) {
            setNotice("Membuka Schematics masih diproses di local service. Progress akan lanjut di panel task.", "info");
            return;
          }

          setNotice(error.message, true);
        }
      } finally {
        schematicsViewButton.disabled = false;
        schematicsViewButton.innerHTML = previousMarkup;
        if (shouldRefreshCatalog) {
          filterCatalogItems();
        }
      }
      return;
    }

    const datasheetsViewButton = event.target.closest(".catalog-datasheets-view-button");
    if (datasheetsViewButton) {
      const messageId = Number(datasheetsViewButton.getAttribute("data-message-id") || 0);
      const fileName = datasheetsViewButton.getAttribute("data-file-name") || `datasheets-${messageId}.pdf`;
      const previousMarkup = datasheetsViewButton.innerHTML;
      const operationId = createCatalogUploadOperationId();
      try {
        datasheetsViewButton.disabled = true;
        datasheetsViewButton.innerHTML = `
          <span class="material-symbols-outlined is-spinning">progress_activity</span>
          <span>Membuka...</span>
        `;

        beginCatalogUploadTask({
          operationId,
          fileName,
          displayName: "Datasheets",
          message: "Menyiapkan Datasheets..."
        });

        const result = await runCatalogOperationWithProgress(
          `/catalog/datasheets/${messageId}/prepare-view?operationId=${encodeURIComponent(operationId)}`,
          {
            method: "POST",
            body: JSON.stringify({}),
            operationId,
            onServerProgress: (progress) => {
              applyCatalogTelegramUploadProgress(progress, {
                operationId,
                fileName,
                displayName: "Datasheets"
              });
            }
          }
        );

        upsertCatalogUploadTask({
          operationId,
          fileName: result.fileName || fileName,
          displayName: "Datasheets",
          stage: "completed",
          active: false,
          success: true,
          progressPercent: 100,
          message: result.message || "Datasheets siap dibuka."
        });
        openPreparedDatasheetsViewTab(messageId);
        setNotice(result.message || "Datasheets siap dibuka.");
      } catch (error) {
        const reconciledProgress = await reconcileCatalogUploadTaskFromService(operationId, {
          operationId,
          fileName,
          displayName: "Datasheets"
        });
        const reconciledStage = String(reconciledProgress?.stage || "").toLowerCase();

        if (reconciledStage === "completed" || reconciledProgress?.success) {
          try {
            openPreparedDatasheetsViewTab(messageId);
          } catch (launchError) {
            setNotice(launchError.message, true);
            return;
          }
          setNotice(reconciledProgress?.message || "Datasheets siap dibuka.");
        } else {
          if (reconciledProgress?.active || ["preparing", "downloading", "loading"].includes(reconciledStage)) {
            setNotice("Membuka Datasheets masih diproses di local service. Progress akan lanjut di panel task.", "info");
            return;
          }

          setNotice(error.message, true);
        }
      } finally {
        datasheetsViewButton.disabled = false;
        datasheetsViewButton.innerHTML = previousMarkup;
      }
      return;
    }

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

    const openLocationButton = event.target.closest(".catalog-open-location-button");
    if (openLocationButton) {
      const messageId = Number(openLocationButton.getAttribute("data-message-id") || 0);
      const category = openLocationButton.getAttribute("data-category") || "Boardview";
      const fileName = openLocationButton.getAttribute("data-file-name") || category;
      if (messageId > 0) {
        const previousMarkup = openLocationButton.innerHTML;
        openLocationButton.disabled = true;
        openLocationButton.innerHTML = `
          <span class="material-symbols-outlined is-spinning">progress_activity</span>
          <span>Membuka folder...</span>
        `;

        try {
          setNotice(`Membuka lokasi cache lokal ${category} untuk ${fileName}.`);
          if (category === "Schematics") {
            await openSchematicsCacheLocation(messageId);
          } else {
            await openBoardviewCacheLocation(messageId);
          }
        } catch (error) {
          setNotice(error.message, true);
        } finally {
          openLocationButton.disabled = false;
          openLocationButton.innerHTML = previousMarkup;
        }
      }
      return;
    }

    const shareButton = event.target.closest(".catalog-share-button");
    if (shareButton) {
      const category = shareButton.getAttribute("data-category") || currentCatalogView;
      const messageId = Number(shareButton.getAttribute("data-message-id") || 0);
      const itemTitle = shareButton.getAttribute("data-title") || category;
      const previousMarkup = shareButton.innerHTML;

      shareButton.disabled = true;
      shareButton.innerHTML = `<span class="material-symbols-outlined is-spinning">progress_activity</span>`;

      try {
        const shareLink = buildCatalogShareLink(category, messageId);
        await copyTextToClipboard(shareLink);
        setNotice(`Link ${itemTitle} berhasil disalin.`);
      } catch (error) {
        setNotice(error.message, true);
      } finally {
        shareButton.disabled = false;
        shareButton.innerHTML = previousMarkup;
      }
      return;
    }

    const openButton = event.target.closest(".catalog-open-button");
    if (openButton) {
      const messageId = Number(openButton.getAttribute("data-message-id") || 0);
      const fileName = openButton.getAttribute("data-file-name") || "Boardview";
      const selectedViewer = normalizeBoardviewViewerValue(
        openButton.closest(".catalog-card-actions")?.querySelector("[data-boardview-viewer]")?.value
      );
      if (messageId > 0) {
        const previousMarkup = openButton.innerHTML;
        let shouldRefreshCatalog = false;
        const operationId = createCatalogUploadOperationId();
        let pendingBoardviewWindow = null;
        openButton.disabled = true;
        openButton.innerHTML = `
          <span class="material-symbols-outlined is-spinning">progress_activity</span>
          <span>Membuka...</span>
        `;

        try {
          if (!selectedViewer) {
            throw new Error("Pilih viewer Boardview dulu sebelum menekan tombol Buka.");
          }

          if (selectedViewer === "teknisihub") {
            pendingBoardviewWindow = openPendingBoardviewTeknisiHubWindow(fileName);
            if (!pendingBoardviewWindow) {
              throw new Error("Browser memblokir tab Boardview TeknisiHub. Izinkan pop-up lalu klik Buka lagi.");
            }
          }

          setNotice(
            selectedViewer === "teknisihub"
              ? `Mengecek cache Boardview untuk ${fileName}, lalu menyiapkan Boardview TeknisiHub.`
              : `Mengecek cache Boardview untuk ${fileName}, lalu membuka file lewat Boardviewer jika tersedia.`
          );
          beginCatalogUploadTask({
            operationId,
            fileName,
            displayName: "Boardview",
            message: selectedViewer === "teknisihub"
              ? "Menyiapkan Boardview TeknisiHub..."
              : "Menyiapkan buka Boardview..."
          });

          const result = await runCatalogOperationWithProgress(
            buildBoardviewOpenPath(messageId, operationId, selectedViewer),
            {
              method: "POST",
              body: JSON.stringify({}),
              operationId,
              onServerProgress: (progress) => {
                applyCatalogTelegramUploadProgress(progress, {
                  operationId,
                  fileName,
                  displayName: "Boardview"
                });
              }
            }
          );

          if (selectedViewer === "teknisihub") {
            if (result.requiresFileSelection) {
              const selectionWindowReady = renderBoardviewCandidateSelectionWindow(
                pendingBoardviewWindow,
                result,
                { messageId, fileName }
              );
              pendingBoardviewWindow = null;

              upsertCatalogUploadTask({
                operationId,
                fileName: result.fileName || fileName,
                displayName: "Boardview",
                stage: "waiting-selection",
                active: false,
                success: true,
                progressPercent: 100,
                message: result.message || "Pilih file boardview yang ingin dibuka."
              });
              setNotice(
                selectionWindowReady
                  ? "Arsip berisi beberapa file boardview. Pilih file yang mau dibuka di tab Boardview TeknisiHub."
                  : "Arsip berisi beberapa file boardview, tetapi tab pilihan tidak bisa ditampilkan.",
                selectionWindowReady ? "info" : true
              );
              shouldRefreshCatalog = markBoardviewItemHasLocalCache(messageId);
              return;
            }

            if (!result.sessionId) {
              throw new Error("Session Boardview TeknisiHub belum diterima dari local service.");
            }

            finalizePendingBoardviewTeknisiHubWindow(pendingBoardviewWindow, result.sessionId);
            pendingBoardviewWindow = null;
          }

          upsertCatalogUploadTask({
            operationId,
            fileName: result.fileName || fileName,
            displayName: "Boardview",
            stage: "completed",
            active: false,
            success: true,
            progressPercent: 100,
            message: result.message || "Boardview berhasil dibuka."
          });
          setNotice(result.message || "Boardview berhasil dibuka.");
          shouldRefreshCatalog = markBoardviewItemHasLocalCache(messageId);
        } catch (error) {
          const reconciledProgress = await reconcileCatalogUploadTaskFromService(operationId, {
            operationId,
            fileName,
            displayName: "Boardview"
          });
          const reconciledStage = String(reconciledProgress?.stage || "").toLowerCase();

          if (reconciledProgress?.active || ["preparing", "downloading", "extracting", "loading"].includes(reconciledStage)) {
            disposePendingBoardviewTeknisiHubWindow(
              pendingBoardviewWindow,
              fileName,
              "Proses masih berjalan di local service. Silakan tunggu hingga task selesai lalu klik Buka lagi."
            );
            setNotice("Membuka Boardview masih diproses di local service. Progress akan lanjut di panel task.", "info");
            return;
          }

          if (reconciledStage === "completed" || reconciledProgress?.success) {
            const completedMessage = reconciledProgress?.message || "Boardview berhasil dibuka.";
            upsertCatalogUploadTask({
              operationId,
              fileName,
              displayName: "Boardview",
              stage: "completed",
              active: false,
              success: true,
              progressPercent: 100,
              message: completedMessage
            });
            disposePendingBoardviewTeknisiHubWindow(
              pendingBoardviewWindow,
              fileName,
              "Session sudah selesai di local service, tetapi tab viewer perlu dibuka ulang dari tombol Buka."
            );
            setNotice(completedMessage);
            shouldRefreshCatalog = markBoardviewItemHasLocalCache(messageId);
            return;
          }

          if (reconciledProgress && ["failed", "cancelled"].includes(reconciledStage)) {
            upsertCatalogUploadTask({
              operationId,
              fileName,
              displayName: "Boardview",
              stage: reconciledStage,
              active: false,
              success: false,
              progressPercent: reconciledStage === "cancelled" ? 0 : 100,
              message: reconciledProgress.message || "Membuka Boardview gagal.",
              lastError: reconciledProgress.lastError || ""
            });
            disposePendingBoardviewTeknisiHubWindow(
              pendingBoardviewWindow,
              fileName,
              reconciledProgress.lastError || reconciledProgress.message || error.message
            );
            setNotice(reconciledProgress.lastError || reconciledProgress.message || error.message, true);
            return;
          }

          upsertCatalogUploadTask({
            operationId,
            fileName,
            displayName: "Boardview",
            stage: "failed",
            active: false,
            success: false,
            progressPercent: 100,
            message: "Membuka Boardview gagal.",
            lastError: error.message || "Membuka Boardview gagal."
          });
          disposePendingBoardviewTeknisiHubWindow(
            pendingBoardviewWindow,
            fileName,
            error.message || "Membuka Boardview gagal."
          );
          setNotice(error.message, true);
        } finally {
          openButton.disabled = false;
          openButton.innerHTML = previousMarkup;
          updateBoardviewOpenActionAvailability(
            openButton.closest(".catalog-card-actions")?.querySelector("[data-boardview-viewer]") || openButton
          );
          if (shouldRefreshCatalog) {
            filterCatalogItems();
          }
        }
      }
      return;
    }

    const flashChipButton = event.target.closest(".catalog-flash-chip-button");
    if (flashChipButton) {
      const messageId = Number(flashChipButton.getAttribute("data-message-id") || 0);
      const selectedDevice = getSelectedFlashChipDevice(flashChipButton);
      if (!selectedDevice) {
        setNotice("Pilih device programmer dulu sebelum menekan Flash Chip.", true);
        updateFlashChipActionAvailability(flashChipButton);
        return;
      }
      const previousMarkup = flashChipButton.innerHTML;
      flashChipButton.disabled = true;
      flashChipButton.innerHTML = `
        <span class="material-symbols-outlined is-spinning">progress_activity</span>
        <span>Menyiapkan...</span>
      `;

      try {
        await prepareBiosForSpiFlash(messageId, selectedDevice);
      } catch (error) {
        setNotice(error.message, true);
      } finally {
        flashChipButton.innerHTML = previousMarkup;
        updateFlashChipActionAvailability(flashChipButton);
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
        setNotice(`Pilih folder tujuan di dialog Windows yang muncul, lalu tunggu proses download ${config.displayName} selesai.`);

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
    const item = findCatalogItemByMessageId(messageId) || {
      messageId,
      category: currentCatalogView,
      title: `${currentCatalogView} #${messageId}`
    };
    openCatalogDeleteModal(item, deleteButton);
  });

  catalogList.addEventListener("change", (event) => {
    const boardviewViewerSelect = event.target.closest(".catalog-boardview-viewer-select");
    if (boardviewViewerSelect) {
      updateBoardviewOpenActionAvailability(boardviewViewerSelect);
      return;
    }

    const flashChipDeviceSelect = event.target.closest(".catalog-flash-chip-device-select");
    if (!flashChipDeviceSelect) {
      return;
    }

    void tryConnectFlashChipDevice(flashChipDeviceSelect);
  });
}

catalogContextPanel?.addEventListener("click", async (event) => {
  const joinButton = event.target.closest("#biosJoinButton, #boardviewJoinButton, #schematicsJoinButton, #problemSolvingJoinButton, #datasheetsJoinButton");
  if (!joinButton) {
    return;
  }

  try {
    const targetView = joinButton.id === "biosJoinButton"
      ? "BIOS"
      : joinButton.id === "boardviewJoinButton"
      ? "Boardview"
      : joinButton.id === "schematicsJoinButton"
      ? "Schematics"
      : joinButton.id === "datasheetsJoinButton"
      ? "Datasheets"
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
  cancelActiveTelegramCategorySync(viewKey);
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
      setNotice(`Akses ${getTelegramCatalogConfig(viewKey).displayName} belum aktif untuk akun ini.`, "info");
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
    setNotice(`Akses ${getTelegramCatalogConfig(currentCatalogView).displayName} untuk akun ini belum aktif.`, "info");
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
    resetTelegramCatalogFirstPageCache(currentCatalogView);
    await loadCatalog();
  } catch (error) {
    if (isJoinManagedCatalogView(currentCatalogView) && isChannelJoinRequiredError(error)) {
      setChannelJoinRequired(currentCatalogView, true);
      catalogItems = [];
      renderCatalog([], currentCatalogView);
      setNotice(`Akses ${getTelegramCatalogConfig(currentCatalogView).displayName} belum aktif untuk akun ini.`, "info");
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

catalogEditorAnalysisPanel?.addEventListener("click", (event) => {
  const analysisLink = event.target.closest(".catalog-analysis-link");
  if (!analysisLink) {
    return;
  }

  event.preventDefault();
  const category = analysisLink.getAttribute("data-category") || "";
  const messageId = Number(analysisLink.getAttribute("data-message-id") || 0);
  if (!category || messageId <= 0) {
    return;
  }

  closeCatalogEditor();
  updateViewHash(category, { messageId });
  if (currentCatalogView === category && getCatalogMessageIdFromHash(category) === messageId) {
    filterCatalogItems();
  }
});

catalogDeleteCancelButton?.addEventListener("click", () => closeCatalogDeleteModal());

catalogDeleteConfirmButton?.addEventListener("click", async () => {
  if (!pendingCatalogDeleteItem?.messageId) {
    closeCatalogDeleteModal({ force: true, restoreFocus: false });
    return;
  }

  const targetItem = pendingCatalogDeleteItem;
  setCatalogDeleteSubmitting(true);
  try {
    await deleteCatalogItem(targetItem.category || currentCatalogView, Number(targetItem.messageId));
    closeCatalogDeleteModal({ force: true, restoreFocus: false });
  } catch (error) {
    setCatalogDeleteSubmitting(false);
    setNotice(error.message, true);
  }
});

catalogDeleteModal?.addEventListener("click", (event) => {
  if (event.target === catalogDeleteModal) {
    closeCatalogDeleteModal();
  }
});

catalogAiSuggestionCancelButton?.addEventListener("click", () => closeCatalogAiSuggestionModal());

catalogAiSuggestionApplyButton?.addEventListener("click", () => applyCatalogAiSuggestionToForm());

catalogAiSuggestionModal?.addEventListener("click", (event) => {
  if (event.target === catalogAiSuggestionModal) {
    closeCatalogAiSuggestionModal();
  }
});

catalogEditorFile?.addEventListener("change", () => {
  resetCatalogMetadataAiSuggestionState({ clearAppliedFields: true });
  const selectedFileName = catalogEditorFile.files?.[0]?.name || "";
  updateCatalogAliasField(selectedFileName, currentCatalogView);
  startCatalogMetadataAiSuggestionLookup(currentCatalogView, selectedFileName);
  checkSelectedCatalogDuplicate().catch((error) => {
    renderCatalogBiosDuplicateCheck("error", { message: error.message });
  });
});

catalogEditorDeviceModel?.addEventListener("input", handleCatalogMetadataAiManualFieldInput);
catalogEditorBoardCode?.addEventListener("input", handleCatalogMetadataAiManualFieldInput);

catalogEditorAddFileButton?.addEventListener("click", appendCatalogAdditionalFileInput);

introQuoteEnterButton?.addEventListener("click", closeIntroQuoteModal);

introQuoteCloseButton?.addEventListener("click", closeIntroQuoteModal);

introQuoteModal?.addEventListener("click", (event) => {
  if (event.target === introQuoteModal) {
    closeIntroQuoteModal();
  }
});

aboutFooterButton?.addEventListener("click", openAboutModal);

aboutModalCloseButton?.addEventListener("click", closeAboutModal);

problemSolvingViewerCloseButton?.addEventListener("click", closeProblemSolvingViewer);

viewPreviousVersionsButton?.addEventListener("click", openPreviousVersionsModal);

previousVersionsCloseButton?.addEventListener("click", closePreviousVersionsModal);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeIntroQuoteModal();
  closeCatalogDeleteModal();
  closeCatalogAiSuggestionModal();
  closeAboutModal();
  closeProblemSolvingViewer();
  closePreviousVersionsModal();
});

catalogEditorForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  cancelCatalogMetadataAiSuggestionLookup();
  closeCatalogAiSuggestionModal({ force: true, restoreFocus: false });
  const previousMarkup = catalogEditorSubmitButton?.innerHTML || "";
  const submissionContext = { minimizedToTask: false };
  setCatalogEditorSubmitting(true, {
    percent: 0,
    label: catalogEditorMode === "edit" ? "Menyimpan..." : "Menyiapkan upload...",
    progressLabel: catalogEditorMode === "edit" ? "Menyimpan perubahan..." : "Menyiapkan upload...",
    showProgress: catalogEditorMode !== "edit"
  });

  try {
    await submitCatalogEditor(submissionContext);
  } catch (error) {
    setNotice(error.message, true);
  } finally {
    if (submissionContext.minimizedToTask) {
      if (catalogEditorSubmitButton) {
        catalogEditorSubmitButton.disabled = false;
      }
      return;
    }

    setCatalogEditorSubmitting(false, { defaultMarkup: previousMarkup });
  }
});

catalogUploadTaskToggleButton?.addEventListener("click", toggleCatalogUploadTaskPanel);
catalogUploadTaskCloseButton?.addEventListener("click", closeCatalogUploadTaskPanel);

navBios?.addEventListener("click", () => {
  updateViewHash("BIOS");
  navigateTelegramCatalog("BIOS", navBios);
});

navBoardview?.addEventListener("click", () => {
  updateViewHash("Boardview");
  navigateTelegramCatalog("Boardview", navBoardview);
});

navSchematics?.addEventListener("click", () => {
  updateViewHash("Schematics");
  navigateTelegramCatalog("Schematics", navSchematics);
});

navProblemSolving?.addEventListener("click", () => {
  updateViewHash("ProblemSolving");
  navigateTelegramCatalog("ProblemSolving", navProblemSolving);
});

navDatasheets?.addEventListener("click", () => {
  updateViewHash("Datasheets");
  navigateTelegramCatalog("Datasheets", navDatasheets);
});

navDashboard?.addEventListener("click", () => {
  updateViewHash(dashboardHomePage.viewKey);
  currentCatalogView = dashboardHomePage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolSpiFlash?.addEventListener("click", () => {
  updateViewHash(spiFlashPage.viewKey);
  currentCatalogView = spiFlashPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolMeAnalyzer?.addEventListener("click", () => {
  updateViewHash(meAnalyzerPage.viewKey);
  currentCatalogView = meAnalyzerPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolUefi?.addEventListener("click", () => {
  updateViewHash(uefiToolPage.viewKey);
  currentCatalogView = uefiToolPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolBiosVendorDetect?.addEventListener("click", () => {
  updateViewHash(biosVendorDetectPage.viewKey);
  currentCatalogView = biosVendorDetectPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolFileHashCompare?.addEventListener("click", () => {
  updateViewHash(fileHashComparePage.viewKey);
  currentCatalogView = fileHashComparePage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolResistorCalculator?.addEventListener("click", () => {
  updateViewHash(resistorCalculatorPage.viewKey);
  currentCatalogView = resistorCalculatorPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolDumpBiosLenovo?.addEventListener("click", () => {
  updateViewHash(lenovoBiosPatchPage.viewKey);
  currentCatalogView = lenovoBiosPatchPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolDell8Fc8?.addEventListener("click", () => {
  updateViewHash(dell8Fc8Page.viewKey);
  currentCatalogView = dell8Fc8Page.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolAmiDecryptor?.addEventListener("click", () => {
  updateViewHash(amiDecryptorPage.viewKey);
  currentCatalogView = amiDecryptorPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolBiosPassword?.addEventListener("click", () => {
  updateViewHash(biosPasswordPage.viewKey);
  currentCatalogView = biosPasswordPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolMicroscope?.addEventListener("click", () => {
  updateViewHash(microscopePage.viewKey);
  currentCatalogView = microscopePage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolAlienServer?.addEventListener("click", () => {
  updateViewHash(alienServerPage.viewKey);
  currentCatalogView = alienServerPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

toolOther?.addEventListener("click", () => {
  updateViewHash(boardViewerPage.viewKey);
  currentCatalogView = boardViewerPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

navSettings?.addEventListener("click", () => {
  updateViewHash(settingsPage.viewKey);
  currentCatalogView = settingsPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

