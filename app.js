const serviceBaseUrl = "http://127.0.0.1:48721";

const serviceStatus = document.getElementById("serviceStatus");
const serviceVersion = document.getElementById("serviceVersion");
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
const dashboardCheckUpdateButton = document.getElementById("dashboardCheckUpdateButton");
const dashboardTitle = document.getElementById("dashboardTitle");
const dashboardSubtitle = document.getElementById("dashboardSubtitle");
const dashboardLoginStatus = document.getElementById("dashboardLoginStatus");
const dashboardChannelStatus = document.getElementById("dashboardChannelStatus");
const dashboardAgreementStatus = document.getElementById("dashboardAgreementStatus");
const dashboardCatalogTotal = document.getElementById("dashboardCatalogTotal");
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
const spiFlashWorkbench = document.getElementById("spiFlashWorkbench");
const meAnalyzerWorkbench = document.getElementById("meAnalyzerWorkbench");
const uefiToolWorkbench = document.getElementById("uefiToolWorkbench");
const biosVendorDetectWorkbench = document.getElementById("biosVendorDetectWorkbench");
const fileHashCompareWorkbench = document.getElementById("fileHashCompareWorkbench");
const resistorCalculatorWorkbench = document.getElementById("resistorCalculatorWorkbench");
const componentEquivalentsWorkbench = document.getElementById("componentEquivalentsWorkbench");
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
const catalogEditorSerialNumberField = document.getElementById("catalogEditorSerialNumberField");
const catalogEditorSerialNumber = document.getElementById("catalogEditorSerialNumber");
const catalogEditorBoardCode = document.getElementById("catalogEditorBoardCode");
const catalogEditorNoteField = document.getElementById("catalogEditorNoteField");
const catalogEditorNote = document.getElementById("catalogEditorNote");
const catalogEditorSubmitButton = document.getElementById("catalogEditorSubmitButton");
const catalogEditorUploadProgress = document.getElementById("catalogEditorUploadProgress");
const catalogEditorUploadProgressLabel = document.getElementById("catalogEditorUploadProgressLabel");
const catalogEditorUploadProgressPercent = document.getElementById("catalogEditorUploadProgressPercent");
const catalogEditorUploadProgressBar = document.getElementById("catalogEditorUploadProgressBar");
const aboutFooterButton = document.getElementById("aboutFooterButton");
const aboutModal = document.getElementById("aboutModal");
const aboutModalCloseButton = document.getElementById("aboutModalCloseButton");
const navBios = document.getElementById("navBios");
const navBoardview = document.getElementById("navBoardview");
const navSchematics = document.getElementById("navSchematics");
const navProblemSolving = document.getElementById("navProblemSolving");
const navDatasheets = document.getElementById("navDatasheets");
const navComponentEquivalents = document.getElementById("navComponentEquivalents");
const navForum = document.getElementById("navForum");
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
const forumThreadModal = document.getElementById("forumThreadModal");
const forumThreadTitle = document.getElementById("forumThreadTitle");
const forumThreadAuthor = document.getElementById("forumThreadAuthor");
const forumThreadDate = document.getElementById("forumThreadDate");
const forumThreadContent = document.getElementById("forumThreadContent");
const forumThreadReplies = document.getElementById("forumThreadReplies");
const forumThreadReplyCount = document.getElementById("forumThreadReplyCount");
const forumThreadCloseButton = document.getElementById("forumThreadCloseButton");
const forumReplyForm = document.getElementById("forumReplyForm");
const forumReplyInput = document.getElementById("forumReplyInput");
const forumReplySubmitButton = document.getElementById("forumReplySubmitButton");
const forumTopicModal = document.getElementById("forumTopicModal");
const forumTopicCloseButton = document.getElementById("forumTopicCloseButton");
const forumTopicForm = document.getElementById("forumTopicForm");
const forumTopicTitleInput = document.getElementById("forumTopicTitleInput");
const forumTopicContentInput = document.getElementById("forumTopicContentInput");
const forumTopicSubmitButton = document.getElementById("forumTopicSubmitButton");
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

const componentEquivalentsPage = window.teknisiHubPages?.componentEquivalents || {
  viewKey: "ComponentEquivalents",
  eyebrow: "Persamaan Part",
  title: "Persamaan Komponen",
  subtitle: "Cari keluarga part dan donor pengganti dari database backend local service.",
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

let catalogLoaded = false;
let catalogItems = [];
let catalogCache = [];
let currentCatalogView = "Forum";
let currentChannelRole = "";
let currentBiosChannelRole = "";
let currentBoardviewChannelRole = "";
let currentSchematicsChannelRole = "";
let currentProblemSolvingChannelRole = "";
let currentDatasheetsChannelRole = "";
let currentForumChannelRole = "";
let currentRequiredChannelInviteLink = "";
let currentBoardviewChannelInviteLink = "";
let currentSchematicsChannelInviteLink = "";
let currentProblemSolvingChannelInviteLink = "";
let currentDatasheetsChannelInviteLink = "";
let currentForumChannelInviteLink = "";
let isSchematicsMember = false;
let isProblemSolvingMember = false;
let isDatasheetsMember = false;
let isForumMember = false;
let currentForumThreadMessageId = 0;
const catalogJoinRequiredState = {
  BIOS: false,
  Boardview: false,
  Schematics: false,
  ProblemSolving: false,
  Datasheets: false,
  Forum: false
};
let catalogSearchDebounceId = 0;
let catalogEditorMode = "upload";
let catalogBiosDuplicateCheckToken = 0;
let catalogBiosDuplicateFound = false;
const maxCatalogAdditionalFiles = 5;
let catalogRefreshLoading = false;
let catalogRefreshCooldownUntil = 0;
let catalogRefreshCooldownTimerId = 0;
let catalogSearchLoading = false;
const rememberedPhoneStorageKey = "teknisihub_remembered_phone";
const rememberedPhoneFlagKey = "teknisihub_remember_phone_enabled";
const activeOtpPhoneStorageKey = "teknisihub_active_otp_phone";
const catalogRefreshCooldownMs = 15000;
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

spiFlashPage.mount?.({
  container: spiFlashWorkbench,
  notify: (message, tone) => setNotice(message, tone)
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

componentEquivalentsPage.mount?.({
  container: componentEquivalentsWorkbench,
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
    displayName: "Problem Solving",
    uploadLabel: "Upload Problem Solving",
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
  },
  Forum: {
    displayName: "Forum",
    uploadLabel: "Buat Thread Forum",
    editTitle: "Edit Thread Forum",
    fileLabel: "Isi Thread",
    fileAccept: "",
    invalidExtensionMessage: "",
    endpoint: "forum"
  }
};

const telegramCatalogState = {
  BIOS: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false },
  Boardview: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false },
  Schematics: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false },
  ProblemSolving: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false },
  Datasheets: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false },
  Forum: { requestToken: 0, hasMore: false, nextOffset: 0, loadingMore: false }
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
  [componentEquivalentsPage.viewKey]: {
    eyebrow: componentEquivalentsPage.eyebrow,
    title: componentEquivalentsPage.title,
    subtitle: componentEquivalentsPage.subtitle,
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
  spiFlashPage.viewKey,
  meAnalyzerPage.viewKey,
  uefiToolPage.viewKey,
  biosVendorDetectPage.viewKey,
  fileHashComparePage.viewKey,
  resistorCalculatorPage.viewKey,
  componentEquivalentsPage.viewKey,
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
  BIOS: "BIOS",
  Boardview: "Boardview",
  Schematics: "Schematics",
  ProblemSolving: "ProblemSolving",
  Datasheets: "Datasheets",
  [componentEquivalentsPage.viewKey]: "ComponentEquivalents",
  Forum: "Forum",
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
  bios: "BIOS",
  boardview: "Boardview",
  schematics: "Schematics",
  problemsolving: "ProblemSolving",
  datasheets: "Datasheets",
  componentequivalents: componentEquivalentsPage.viewKey,
  persamaankomponen: componentEquivalentsPage.viewKey,
  forum: "Forum",
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
    BIOS: navBios,
    Boardview: navBoardview,
    Schematics: navSchematics,
    ProblemSolving: navProblemSolving,
    Datasheets: navDatasheets,
    [componentEquivalentsPage.viewKey]: navComponentEquivalents,
    Forum: navForum,
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

function updateViewHash(viewKey) {
  const hashValue = viewHashMap[viewKey];
  if (!hashValue) {
    return;
  }

  const nextHash = `#${hashValue}`;
  if (window.location.hash === nextHash) {
    return;
  }

  window.location.hash = hashValue;
}

function getViewFromHash(hash = window.location.hash) {
  const rawValue = String(hash || "")
    .replace(/^#/, "")
    .trim();

  if (!rawValue) {
    return null;
  }

  const normalizedValue = rawValue
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  return hashRouteMap[normalizedValue] || null;
}

async function restoreViewFromHash() {
  const targetView = getViewFromHash();
  if (!targetView || targetView === currentCatalogView) {
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
  catalogLoaded = false;
  catalogItems = [];
  catalogCache = [];
  currentChannelRole = "";
  currentBiosChannelRole = "";
  currentBoardviewChannelRole = "";
  currentSchematicsChannelRole = "";
  currentProblemSolvingChannelRole = "";
  currentDatasheetsChannelRole = "";
  currentForumChannelRole = "";
  isSchematicsMember = false;
  isProblemSolvingMember = false;
  isDatasheetsMember = false;
  isForumMember = false;
  setChannelJoinRequired("BIOS", false);
  setChannelJoinRequired("Boardview", false);
  setChannelJoinRequired("Schematics", false);
  setChannelJoinRequired("ProblemSolving", false);
  setChannelJoinRequired("Datasheets", false);
  setChannelJoinRequired("Forum", false);
  telegramCatalogState.BIOS.requestToken = 0;
  telegramCatalogState.BIOS.hasMore = false;
  telegramCatalogState.BIOS.nextOffset = 0;
  telegramCatalogState.BIOS.loadingMore = false;
  telegramCatalogState.Boardview.requestToken = 0;
  telegramCatalogState.Boardview.hasMore = false;
  telegramCatalogState.Boardview.nextOffset = 0;
  telegramCatalogState.Boardview.loadingMore = false;
  telegramCatalogState.Schematics.requestToken = 0;
  telegramCatalogState.Schematics.hasMore = false;
  telegramCatalogState.Schematics.nextOffset = 0;
  telegramCatalogState.Schematics.loadingMore = false;
  telegramCatalogState.ProblemSolving.requestToken = 0;
  telegramCatalogState.ProblemSolving.hasMore = false;
  telegramCatalogState.ProblemSolving.nextOffset = 0;
  telegramCatalogState.ProblemSolving.loadingMore = false;
  telegramCatalogState.Datasheets.requestToken = 0;
  telegramCatalogState.Datasheets.hasMore = false;
  telegramCatalogState.Datasheets.nextOffset = 0;
  telegramCatalogState.Datasheets.loadingMore = false;
  telegramCatalogState.Forum.requestToken = 0;
  telegramCatalogState.Forum.hasMore = false;
  telegramCatalogState.Forum.nextOffset = 0;
  telegramCatalogState.Forum.loadingMore = false;
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
  closeForumThreadModal();
  closeForumTopicModal();
}

async function refreshCatalogStats() {
  try {
    const stats = await fetchJson("/catalog/telegram-stats");
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

  if (currentCatalogView === "Schematics") {
    return currentSchematicsChannelRole.toLowerCase() === "owner";
  }

  if (currentCatalogView === "Datasheets") {
    return currentDatasheetsChannelRole.toLowerCase() === "owner";
  }

  if (currentCatalogView === "Forum") {
    return currentForumChannelRole.toLowerCase() === "owner";
  }

  const activeRole = currentCatalogView === "Boardview" ? currentBoardviewChannelRole : currentBiosChannelRole;
  return activeRole.toLowerCase() === "owner";
}

function canManageBiosCatalog() {
  const normalizedRole = getDisplayRoleForView(currentCatalogView).toLowerCase();
  return normalizedRole === "owner" || normalizedRole === "admin";
}

function canCreateForumTopic() {
  return currentCatalogView === "Forum" && isForumMember && !requiresChannelJoin("Forum");
}

function isTelegramCatalogView(viewKey = currentCatalogView) {
  return viewKey === "BIOS" || viewKey === "Boardview" || viewKey === "Schematics" || viewKey === "ProblemSolving" || viewKey === "Datasheets" || viewKey === "Forum";
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

  if (viewKey === "Schematics") {
    return currentSchematicsChannelRole || currentChannelRole;
  }

  if (viewKey === "Datasheets") {
    return currentDatasheetsChannelRole || currentChannelRole;
  }

  if (viewKey === "Forum") {
    return currentForumChannelRole || currentChannelRole;
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
  return viewKey === "BIOS" || viewKey === "Boardview" || viewKey === "Schematics" || viewKey === "ProblemSolving" || viewKey === "Datasheets" || viewKey === "Forum";
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
      link: currentRequiredChannelInviteLink,
      emptyMessage: "Gabung channel BIOS dulu, lalu buka ulang atau refresh katalog."
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

  if (viewKey === "Forum") {
    return {
      title: "Gabung grup Forum dulu untuk membuka diskusi.",
      description: "Setelah berhasil join, thread forum bisa langsung dibuka dan kamu dapat membalas posting dari dashboard.",
      buttonId: "forumJoinButton",
      buttonLabel: "Gabung Grup Forum",
      link: currentForumChannelInviteLink,
      emptyMessage: "Gabung grup Forum dulu, lalu refresh daftar thread."
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
  const showUploadButton = viewKey === "Forum"
    ? isForumMember && !requiresChannelJoin("Forum")
    : isTelegramCatalogView(viewKey) && canManageBiosCatalog();
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
  spiFlashPage.setVisible?.(viewKey === spiFlashPage.viewKey);
  meAnalyzerPage.setVisible?.(viewKey === meAnalyzerPage.viewKey);
  uefiToolPage.setVisible?.(viewKey === uefiToolPage.viewKey);
  biosVendorDetectPage.setVisible?.(viewKey === biosVendorDetectPage.viewKey);
  fileHashComparePage.setVisible?.(viewKey === fileHashComparePage.viewKey);
  resistorCalculatorPage.setVisible?.(viewKey === resistorCalculatorPage.viewKey);
  componentEquivalentsPage.setVisible?.(viewKey === componentEquivalentsPage.viewKey);
  lenovoBiosPatchPage.setVisible?.(viewKey === lenovoBiosPatchPage.viewKey);
  dell8Fc8Page.setVisible?.(viewKey === dell8Fc8Page.viewKey);
  amiDecryptorPage.setVisible?.(viewKey === amiDecryptorPage.viewKey);
  biosPasswordPage.setVisible?.(viewKey === biosPasswordPage.viewKey);
  microscopePage.setVisible?.(viewKey === microscopePage.viewKey);
  alienServerPage.setVisible?.(viewKey === alienServerPage.viewKey);
  boardViewerPage.setVisible?.(viewKey === boardViewerPage.viewKey);
  settingsPage.setVisible?.(viewKey === settingsPage.viewKey);

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

  if (viewKey === componentEquivalentsPage.viewKey) {
    componentEquivalentsPage.refresh?.();
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
  spiFlashPage.setVisible?.(false);
  meAnalyzerPage.setVisible?.(false);
  uefiToolPage.setVisible?.(false);
  biosVendorDetectPage.setVisible?.(false);
  fileHashComparePage.setVisible?.(false);
  resistorCalculatorPage.setVisible?.(false);
  componentEquivalentsPage.setVisible?.(false);
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
    BIOS: navBios,
    Boardview: navBoardview,
    Schematics: navSchematics,
    ProblemSolving: navProblemSolving,
    Datasheets: navDatasheets,
    [componentEquivalentsPage.viewKey]: navComponentEquivalents,
    Forum: navForum,
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

  if (viewKey === "Forum") {
    setText(catalogEyebrow, "Forum");
    setText(catalogTitle, "Diskusi teknisi, tanya jawab, dan balasan thread");
    if (catalogSearchInput) {
      catalogSearchInput.placeholder = "Cari judul thread, isi posting, atau nama pengirim...";
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
  if (localWorkbenchViewKeys.has(viewKey)) {
    setActiveNav(viewKey);
    if (catalogCount) {
      catalogCount.textContent = viewKey === spiFlashPage.viewKey
        ? "SPI UI"
        : viewKey === meAnalyzerPage.viewKey
        ? "MEA UI"
        : viewKey === uefiToolPage.viewKey
        ? "UEFI UI"
        : viewKey === biosVendorDetectPage.viewKey
        ? "BVD UI"
        : viewKey === componentEquivalentsPage.viewKey
        ? "CMP UI"
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

  if (viewKey === "Forum") {
    catalogList.innerHTML = items.map((item) => `
      <article class="catalog-card">
        <div class="catalog-card-top">
          <span class="catalog-category">${escapeHtml(item.category || "Forum")}</span>
          <span class="catalog-access">${escapeHtml(getDisplayRoleForView(viewKey) || item.accessLevel || "Member")}</span>
        </div>
        <h4>${escapeHtml(item.title || "Thread Forum")}</h4>
        <div class="catalog-inline-meta">
          ${item.uploadedBy ? `
          <div class="catalog-file-row">
            <span class="material-symbols-outlined">person</span>
            <span>${escapeHtml(item.uploadedBy)}</span>
          </div>` : ""}
          <div class="catalog-file-row">
            <span class="material-symbols-outlined">forum</span>
            <span>${escapeHtml(String(item.replyCount || 0))} balasan</span>
          </div>
          <div class="catalog-file-row">
            <span class="material-symbols-outlined">schedule</span>
            <span>${escapeHtml(item.postedAt || "-")}</span>
          </div>
        </div>
        <div class="catalog-card-actions">
          <button
            type="button"
            class="catalog-action-button catalog-forum-thread-button"
            data-message-id="${item.messageId || ""}"
            data-title="${escapeHtml(item.title || "Thread Forum")}">
            <span class="material-symbols-outlined">forum</span>
            <span>Buka Thread</span>
          </button>
        </div>
      </article>
    `).join("");

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

  if (isDatasheetsView(viewKey)) {
    catalogList.innerHTML = items.map((item) => `
      <article class="catalog-card">
        <div class="catalog-card-top">
          <span class="catalog-category">${escapeHtml(item.category || "Datasheets")}</span>
          <span class="catalog-access">${escapeHtml(getDisplayRoleForView(viewKey) || item.accessLevel || "Member")}</span>
        </div>
        <h4>${escapeHtml(item.fileName || item.title || "Untitled.pdf")}</h4>
        ${item.description ? `<p class="catalog-description">${escapeHtml(item.description)}</p>` : ""}
        <div class="catalog-file-row">
          <span class="material-symbols-outlined">picture_as_pdf</span>
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
        ${item.description ? `<p class="catalog-description">${escapeHtml(item.description)}</p>` : ""}
        <div class="catalog-file-row">
          <span class="material-symbols-outlined">schema</span>
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
            class="catalog-action-button catalog-schematics-view-button"
            data-message-id="${item.messageId || ""}"
            data-file-name="${escapeHtml(item.fileName || item.title || "")}">
            <span class="material-symbols-outlined">visibility</span>
            <span>Lihat</span>
          </button>
          <button
            type="button"
            class="catalog-action-button catalog-download-button"
            data-message-id="${item.messageId || ""}"
            data-category="Schematics"
            data-title="${escapeHtml(item.fileName || item.title || "")}">
            <span class="material-symbols-outlined">download</span>
            <span>Unduh PDF</span>
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
        ${item.category === "Boardview" && item.messageId && item.hasLocalCache ? `
        <button
          type="button"
          class="catalog-action-button ghost catalog-open-location-button"
          data-message-id="${item.messageId}"
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

function supportsCatalogAdditionalFiles(category) {
  return category === "BIOS" || category === "Boardview";
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
    catalogEditorAdditionalFilesNote.textContent = currentCatalogView === "Boardview"
      ? "Opsional untuk file pendukung boardview, foto referensi, PDF, dump terkait, atau file lain. Maksimal 5 file."
      : "Opsional untuk EC, FULL DUMP, DLL, dan file pendukung lain. Maksimal 5 file.";
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

function supportsCatalogSerialNumberAndNote(category) {
  return category === "BIOS";
}

function getCatalogMetadataRequirementMessage(config) {
  if (config?.displayName === "Schematics") {
    return "Model Device Schematics wajib diisi sebelum submit.";
  }

  return `Model Device dan Code Board ${config.displayName} wajib diisi sebelum submit.`;
}

function supportsCatalogMd5Check(category) {
  return category === "BIOS" || category === "Boardview" || category === "Schematics" || category === "Datasheets";
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
  return category === "Boardview" && normalizedFileName.length > 0 && normalizedFileName.length < minCatalogFileNameLength;
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
  const isSimpleFileUpload = !isEditMode && (targetCategory === "ProblemSolving" || targetCategory === "Datasheets");
  const boardCodeRequired = isBoardCodeRequiredForCategory(targetCategory);
  const supportsSerialNumberAndNote = supportsCatalogSerialNumberAndNote(targetCategory);
  setText(catalogEditorTitle, isEditMode ? config.editTitle : config.uploadLabel);
  catalogEditorMessageId.value = isEditMode && item ? String(item.messageId || "") : "";
  catalogEditorDeviceModel.value = item?.deviceModel === "-" ? "" : (item?.deviceModel || "");
  catalogEditorSerialNumber.value = supportsSerialNumberAndNote && item?.serialNumber !== "-"
    ? (item?.serialNumber || "")
    : "";
  catalogEditorBoardCode.value = item?.boardCode === "-" ? "" : (item?.boardCode || "");
  catalogEditorNote.value = supportsSerialNumberAndNote && item?.note !== "-"
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
    modalLabel.textContent = `${config.displayName} Telegram`;
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
  toggleElement(catalogEditorMetadataFields, !isSimpleFileUpload);
  toggleElement(catalogEditorSerialNumberField, !isSimpleFileUpload && supportsSerialNumberAndNote);
  toggleElement(catalogEditorNoteField, !isSimpleFileUpload && supportsSerialNumberAndNote);
  if (catalogEditorDeviceModel) {
    catalogEditorDeviceModel.required = !isSimpleFileUpload;
  }
  if (catalogEditorBoardCode) {
    catalogEditorBoardCode.required = !isSimpleFileUpload && boardCodeRequired;
  }
  [catalogEditorSerialNumber, catalogEditorNote].forEach((input) => {
    if (input) {
      input.required = false;
    }
  });

  catalogEditorSubmitButton.innerHTML = isEditMode
    ? `<span class="material-symbols-outlined">save</span><span>Simpan Perubahan</span>`
    : `<span class="material-symbols-outlined">upload_file</span><span>${escapeHtml(config.uploadLabel)}</span>`;
  setCatalogEditorUploadProgress({ active: false });
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
  updateCatalogAliasField("", currentCatalogView);
  toggleElement(catalogEditorMd5Field, true);
  if (catalogEditorAdditionalFilesList) {
    catalogEditorAdditionalFilesList.innerHTML = "";
  }
  renderCatalogAdditionalFiles();
  toggleElement(catalogEditorMetadataFields, true);
  toggleElement(catalogEditorSerialNumberField, true);
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

function renderForumReplies(replies = []) {
  if (!forumThreadReplies || !forumThreadReplyCount) {
    return;
  }

  forumThreadReplyCount.textContent = `${replies.length} balasan`;
  if (!Array.isArray(replies) || replies.length === 0) {
    forumThreadReplies.innerHTML = `<p class="forum-thread-empty">Belum ada balasan. Jadilah yang pertama membalas thread ini.</p>`;
    return;
  }

  forumThreadReplies.innerHTML = replies.map((reply) => `
    <article class="forum-thread-reply-item">
      <div class="forum-thread-reply-meta">
        <span>${escapeHtml(reply.uploadedBy || "Member")}</span>
        <span>${escapeHtml((reply.authorRole || "Member").toLowerCase())}</span>
        <span>${escapeHtml(reply.postedAt || "-")}</span>
      </div>
      <p class="forum-thread-reply-content">${escapeHtml(reply.content || "")}</p>
    </article>
  `).join("");
}

function openForumThreadModal(thread) {
  if (!forumThreadModal) {
    return;
  }

  currentForumThreadMessageId = Number(thread?.messageId || 0);
  setText(forumThreadTitle, thread?.title || "Thread forum");
  setText(forumThreadAuthor, thread?.uploadedBy || "Pengirim tidak diketahui");
  setText(forumThreadDate, thread?.postedAt || "-");
  if (forumThreadContent) {
    forumThreadContent.textContent = thread?.content || "";
  }
  if (forumReplyInput) {
    forumReplyInput.value = "";
  }
  renderForumReplies(Array.isArray(thread?.replies) ? thread.replies : []);
  toggleElement(forumThreadModal, true);
}

function closeForumThreadModal() {
  currentForumThreadMessageId = 0;
  toggleElement(forumThreadModal, false);
  setText(forumThreadTitle, "Thread forum");
  setText(forumThreadAuthor, "Pengirim");
  setText(forumThreadDate, "Tanggal");
  if (forumThreadContent) {
    forumThreadContent.textContent = "";
  }
  if (forumThreadReplies) {
    forumThreadReplies.innerHTML = "";
  }
  if (forumThreadReplyCount) {
    forumThreadReplyCount.textContent = "0 balasan";
  }
  if (forumReplyInput) {
    forumReplyInput.value = "";
  }
}

function openForumTopicModal() {
  if (!forumTopicModal) {
    return;
  }

  if (!canCreateForumTopic()) {
    throw new Error("Gabung grup Forum dulu sebelum membuat topic baru.");
  }

  if (forumTopicForm) {
    forumTopicForm.reset();
  }
  toggleElement(forumTopicModal, true);
  forumTopicTitleInput?.focus();
}

function closeForumTopicModal() {
  toggleElement(forumTopicModal, false);
  if (forumTopicForm) {
    forumTopicForm.reset();
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
      joinDatasheetsChannel: viewKey === "Datasheets",
      joinForumChannel: viewKey === "Forum"
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

async function viewForumThread(messageId, button = null) {
  if (!messageId) {
    throw new Error("Thread forum tidak valid.");
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
    const result = await fetchJson(`/catalog/forum/${messageId}/thread`, {
      method: "POST",
      body: JSON.stringify({})
    });
    openForumThreadModal(result);
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = previousMarkup;
    }
  }
}

async function submitForumReply() {
  if (!currentForumThreadMessageId) {
    throw new Error("Pilih thread forum dulu sebelum membalas.");
  }

  const content = (forumReplyInput?.value || "").trim();
  if (!content) {
    throw new Error("Isi balasan forum wajib diisi.");
  }

  const result = await fetchJson(`/catalog/forum/${currentForumThreadMessageId}/reply`, {
    method: "POST",
    body: JSON.stringify({ content })
  });
  setNotice(result.message || "Balasan forum berhasil dikirim.");
  await viewForumThread(currentForumThreadMessageId);
  await loadCatalog();
}

async function submitForumTopic() {
  const title = (forumTopicTitleInput?.value || "").trim();
  const content = (forumTopicContentInput?.value || "").trim();
  if (!title) {
    throw new Error("Judul topic forum wajib diisi.");
  }

  if (!content) {
    throw new Error("Isi topic forum wajib diisi.");
  }

  const result = await fetchJson("/catalog/forum/topic", {
    method: "POST",
    body: JSON.stringify({ title, content })
  });
  setNotice(result.message || "Topic forum berhasil dibuat.");
  closeForumTopicModal();
  await loadCatalog();
}

function filterCatalogItems() {
  if (localWorkbenchViewKeys.has(currentCatalogView)) {
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
  const requestToken = ++state.requestToken;
  state.loadingMore = false;
  state.nextOffset = 0;
  setCatalogSearchLoading(Boolean(query));
  try {
    const path = `/catalog?category=${encodeURIComponent(viewKey)}&limit=5${query ? `&query=${encodeURIComponent(query)}` : ""}`;
    const catalog = await fetchJson(path);

    if (requestToken !== state.requestToken) {
      return;
    }

    catalogItems = catalog.items || [];
    state.hasMore = Boolean(catalog.hasMore);
    state.nextOffset = Number(catalog.nextOffset || catalogItems.length || 0);
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
  if (localWorkbenchViewKeys.has(currentCatalogView)) {
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

function setCatalogEditorUploadProgress(progress = {}) {
  const active = Boolean(progress.active);
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

function applyCatalogTelegramUploadProgress(progress = {}) {
  const percent = Math.max(0, Math.min(100, Math.round(Number(progress.progressPercent) || 0)));
  const stage = String(progress.stage || "").toLowerCase();
  const message = progress.message || "Upload ke Telegram sedang berjalan...";
  const buttonLabel = stage === "sending"
    ? "Mengirim ke channel..."
    : stage === "completed"
    ? "Upload selesai"
    : stage === "failed"
    ? "Upload gagal"
    : stage === "cancelled"
    ? "Upload dibatalkan"
    : percent > 0
    ? `Upload Telegram ${percent}%`
    : "Menyiapkan upload Telegram...";

  setCatalogEditorSubmitting(true, {
    percent,
    label: buttonLabel,
    progressLabel: message,
    showProgress: true
  });
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
  setPreviousVersionsState(false);
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
    return `${versionText}${versionText ? " • " : ""}${downloadedText} / ${totalText}`;
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

  setText(serviceStatus, "Wajib update");
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
  setText(serviceStatus, "Terhubung");
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
  currentSchematicsChannelInviteLink = status.schematicsChannelInviteLink || "";
  currentProblemSolvingChannelInviteLink = status.problemSolvingChannelInviteLink || "";
  currentDatasheetsChannelInviteLink = status.datasheetsChannelInviteLink || "";
  currentForumChannelInviteLink = status.forumChannelInviteLink || "";

  const hasRequiredLink = Boolean(status.requiredChannelInviteLink);
  const hasBoardviewLink = Boolean(status.boardviewChannelInviteLink);
  const hasSchematicsLink = Boolean(status.schematicsChannelInviteLink);
  const hasJoinOption = hasRequiredLink || hasBoardviewLink || hasSchematicsLink;
  const hasKnownChannelAccess = Boolean(
    status.isChannelMember ||
    status.channelRole ||
    status.biosChannelRole ||
    status.boardviewChannelRole ||
    status.schematicsChannelRole ||
    status.problemSolvingChannelRole ||
    status.datasheetsChannelRole
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
  if (dashboardJoinSchematicsCheckbox) {
    dashboardJoinSchematicsCheckbox.checked = Boolean(status.isSchematicsChannelMember);
    dashboardJoinSchematicsCheckbox.disabled = !hasSchematicsLink || Boolean(status.isSchematicsChannelMember);
  }

  isSchematicsMember = Boolean(status.isSchematicsChannelMember);
  currentSchematicsChannelRole = status.schematicsChannelRole || "";
  isProblemSolvingMember = Boolean(status.isProblemSolvingChannelMember);
  currentProblemSolvingChannelRole = status.problemSolvingChannelRole || "";
  isDatasheetsMember = Boolean(status.isDatasheetsChannelMember);
  currentDatasheetsChannelRole = status.datasheetsChannelRole || "";
  isForumMember = Boolean(status.isForumChannelMember);
  currentForumChannelRole = status.forumChannelRole || "";

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
    const schematicsRole = status.schematicsChannelRole || "-";
    const problemSolvingRole = status.problemSolvingChannelRole || "-";
    const datasheetsRole = status.datasheetsChannelRole || "-";
    currentChannelRole = status.channelRole || "";
    currentBiosChannelRole = status.biosChannelRole || status.channelRole || "";
    currentBoardviewChannelRole = status.boardviewChannelRole || "";
    currentSchematicsChannelRole = status.schematicsChannelRole || "";
    currentProblemSolvingChannelRole = status.problemSolvingChannelRole || "";
    currentDatasheetsChannelRole = status.datasheetsChannelRole || "";
    currentForumChannelRole = status.forumChannelRole || "";
    const representativeRole = getRepresentativeRoleLabel(status);
    const connectedChannelCount = getConnectedChannelCount(status);
    setText(dashboardTitle, `Halo, ${displayName}`);
    setText(dashboardLoginStatus, "Login Telegram aktif");
    setText(dashboardRoleChipIcon, representativeRole.icon);
    setText(dashboardRoleChip, representativeRole.label);
    setText(accessDisplayName, displayName);
    setText(accessRole, `Role utama: ${representativeRole.label}`);
    setText(
      accessChannelCount,
      connectedChannelCount > 0
        ? `${connectedChannelCount} channel aktif`
        : "Belum ada channel aktif"
    );
    setText(
      dashboardChannelStatus,
      status.totalChannelMemberCount > 0
        ? `${Number(status.totalChannelMemberCount).toLocaleString("id-ID")} subscriber`
        : hasKnownChannelAccess
        ? `Membership channel valid${channelRole}`
        : "Join channel dilakukan dari menu BIOS, Boardview, Schematics, Problem Solving, atau Datasheets"
    );
    setText(
      dashboardAgreementStatus,
      status.hasAgreed ? "Persetujuan tersimpan" : "Menunggu persetujuan"
    );

    if (status.hasAgreed) {
      setText(
        dashboardSubtitle,
        "Session Telegram aktif."
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

function uploadFormData(path, formData, options = {}) {
  const requestUrl = `${serviceBaseUrl}${path}`;
  const operationId = String(options.operationId || "").trim();

  return new Promise((resolve, reject) => {
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
  setText(serviceStatus, "Mengecek koneksi...");
  setText(serviceVersion, "Versi: mengecek...");

  try {
    const healthUrl = forceUpdateCheck ? "/health?forceUpdateCheck=true" : "/health";
    const health = await fetchJson(healthUrl);
    setText(serviceStatus, health.ready ? "Siap" : "Belum siap");
    setText(serviceVersion, `Versi: ${health.version || "unknown"}`);

    if (applyUpdateRequirement(health)) {
      return health;
    }

    const status = await fetchJson("/auth/status");
    applyStatus(status);
    await refreshCatalogStats();
    return health;
  } catch (error) {
    setText(serviceStatus, "Tidak aktif");
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
  if (dashboardCatalogTotal) {
    dashboardCatalogTotal.textContent = "0 item";
  }
    setError(`Koneksi ke local service gagal: ${error.message || "unknown error"}`);
    setNotice("Local service belum aktif. Jalankan TeknisiHub.LocalService dulu, lalu refresh.", true);
    throw error;
  }
}

async function submitCatalogEditor() {
  const config = getTelegramCatalogConfig();
  const isSimpleFileUpload = catalogEditorMode !== "edit" && (config.endpoint === "problem-solving" || config.endpoint === "datasheets");
  const supportsSerialNumberAndNote = supportsCatalogSerialNumberAndNote(currentCatalogView);
  const payload = {
    deviceModel: catalogEditorDeviceModel?.value.trim() || "",
    serialNumber: supportsSerialNumberAndNote ? catalogEditorSerialNumber?.value.trim() || "" : "",
    boardCode: catalogEditorBoardCode?.value.trim() || "",
    note: supportsSerialNumberAndNote ? catalogEditorNote?.value.trim() || "" : ""
  };

  const boardCodeRequired = isBoardCodeRequiredForCategory(currentCatalogView);
  if (!isSimpleFileUpload && (!payload.deviceModel || (boardCodeRequired && !payload.boardCode))) {
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

  const result = await uploadFormData(`/catalog/${config.endpoint}`, formData, {
    method: "POST",
    operationId,
    onProgress: ({ percent }) => {
      const roundedPercent = Math.max(1, Math.min(15, Math.round(percent * 0.15)));
      setCatalogEditorSubmitting(true, {
        percent: roundedPercent,
        label: "Mengirim file...",
        progressLabel: `Mengirim file ${config.displayName} ke local service...`,
        showProgress: true
      });
    },
    onServerProgress: (progress) => {
      applyCatalogTelegramUploadProgress(progress);
    }
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

async function joinSelectedChannels() {
  const joinRequiredChannel = Boolean(dashboardJoinRequiredCheckbox?.checked && !dashboardJoinRequiredCheckbox.disabled);
  const joinBoardviewChannel = Boolean(dashboardJoinBoardviewCheckbox?.checked && !dashboardJoinBoardviewCheckbox.disabled);
  const joinSchematicsChannel = Boolean(dashboardJoinSchematicsCheckbox?.checked && !dashboardJoinSchematicsCheckbox.disabled);

  if (!joinRequiredChannel && !joinBoardviewChannel && !joinSchematicsChannel) {
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
currentCatalogView = getViewFromHash() || "Forum";
refreshStatus();
window.addEventListener("hashchange", () => {
  restoreViewFromHash().catch((error) => setNotice(error.message, true));
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
      try {
        viewPdfCatalogItem("Schematics", messageId);
      } catch (error) {
        setNotice(error.message, true);
      }
      return;
    }

    const datasheetsViewButton = event.target.closest(".catalog-datasheets-view-button");
    if (datasheetsViewButton) {
      const messageId = Number(datasheetsViewButton.getAttribute("data-message-id") || 0);
      try {
        viewPdfCatalogItem("Datasheets", messageId);
      } catch (error) {
        setNotice(error.message, true);
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
      const fileName = openLocationButton.getAttribute("data-file-name") || "Boardview";
      if (messageId > 0) {
        const previousMarkup = openLocationButton.innerHTML;
        openLocationButton.disabled = true;
        openLocationButton.innerHTML = `
          <span class="material-symbols-outlined is-spinning">progress_activity</span>
          <span>Membuka folder...</span>
        `;

        try {
          setNotice(`Membuka lokasi cache lokal Boardview untuk ${fileName}.`);
          await openBoardviewCacheLocation(messageId);
        } catch (error) {
          setNotice(error.message, true);
        } finally {
          openLocationButton.disabled = false;
          openLocationButton.innerHTML = previousMarkup;
        }
      }
      return;
    }

    const openButton = event.target.closest(".catalog-open-button");
    if (openButton) {
      const messageId = Number(openButton.getAttribute("data-message-id") || 0);
      const fileName = openButton.getAttribute("data-file-name") || "Boardview";
      if (messageId > 0) {
        const previousMarkup = openButton.innerHTML;
        let shouldRefreshCatalog = false;
        openButton.disabled = true;
        openButton.innerHTML = `
          <span class="material-symbols-outlined is-spinning">progress_activity</span>
          <span>Membuka...</span>
        `;

        try {
          setNotice(`Mengecek cache Boardview untuk ${fileName}, lalu membuka file lewat Boardviewer jika tersedia.`);
          await openBoardviewCatalogItem(messageId);
          shouldRefreshCatalog = markBoardviewItemHasLocalCache(messageId);
        } catch (error) {
          setNotice(error.message, true);
        } finally {
          openButton.disabled = false;
          openButton.innerHTML = previousMarkup;
          if (shouldRefreshCatalog) {
            filterCatalogItems();
          }
        }
      }
      return;
    }

    const forumButton = event.target.closest(".catalog-forum-thread-button");
    if (forumButton) {
      const messageId = Number(forumButton.getAttribute("data-message-id") || 0);
      try {
        await viewForumThread(messageId, forumButton);
      } catch (error) {
        setNotice(error.message, true);
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
  const joinButton = event.target.closest("#biosJoinButton, #boardviewJoinButton, #schematicsJoinButton, #problemSolvingJoinButton, #datasheetsJoinButton, #forumJoinButton");
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
      : joinButton.id === "forumJoinButton"
      ? "Forum"
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
  closeForumThreadModal();
  closeForumTopicModal();
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
  if (currentCatalogView === "Forum") {
    openForumTopicModal();
    return;
  }

  openCatalogEditor("upload");
});

catalogRefreshButton?.addEventListener("click", refreshCurrentTelegramCatalog);

catalogEditorCloseButton?.addEventListener("click", closeCatalogEditor);

catalogEditorFile?.addEventListener("change", () => {
  updateCatalogAliasField(catalogEditorFile.files?.[0]?.name || "", currentCatalogView);
  checkSelectedCatalogDuplicate().catch((error) => {
    renderCatalogBiosDuplicateCheck("error", { message: error.message });
  });
});

catalogEditorAddFileButton?.addEventListener("click", appendCatalogAdditionalFileInput);

aboutFooterButton?.addEventListener("click", openAboutModal);

aboutModalCloseButton?.addEventListener("click", closeAboutModal);

problemSolvingViewerCloseButton?.addEventListener("click", closeProblemSolvingViewer);
forumThreadCloseButton?.addEventListener("click", closeForumThreadModal);
forumTopicCloseButton?.addEventListener("click", closeForumTopicModal);

viewPreviousVersionsButton?.addEventListener("click", openPreviousVersionsModal);

previousVersionsCloseButton?.addEventListener("click", closePreviousVersionsModal);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeAboutModal();
  closeProblemSolvingViewer();
  closeForumThreadModal();
  closeForumTopicModal();
  closePreviousVersionsModal();
});

forumReplyForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const previousMarkup = forumReplySubmitButton?.innerHTML || "";
  if (forumReplySubmitButton) {
    forumReplySubmitButton.disabled = true;
    forumReplySubmitButton.innerHTML = `
      <span class="material-symbols-outlined is-spinning">progress_activity</span>
      <span>Mengirim...</span>
    `;
  }

  try {
    await submitForumReply();
  } catch (error) {
    setNotice(error.message, true);
  } finally {
    if (forumReplySubmitButton) {
      forumReplySubmitButton.disabled = false;
      forumReplySubmitButton.innerHTML = previousMarkup;
    }
  }
});

forumTopicForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const previousMarkup = forumTopicSubmitButton?.innerHTML || "";
  if (forumTopicSubmitButton) {
    forumTopicSubmitButton.disabled = true;
    forumTopicSubmitButton.innerHTML = `
      <span class="material-symbols-outlined is-spinning">progress_activity</span>
      <span>Membuat...</span>
    `;
  }

  try {
    await submitForumTopic();
  } catch (error) {
    setNotice(error.message, true);
  } finally {
    if (forumTopicSubmitButton) {
      forumTopicSubmitButton.disabled = false;
      forumTopicSubmitButton.innerHTML = previousMarkup;
    }
  }
});

catalogEditorForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const previousMarkup = catalogEditorSubmitButton?.innerHTML || "";
  setCatalogEditorSubmitting(true, {
    percent: 0,
    label: catalogEditorMode === "edit" ? "Menyimpan..." : "Menyiapkan upload...",
    progressLabel: catalogEditorMode === "edit" ? "Menyimpan perubahan..." : "Menyiapkan upload...",
    showProgress: catalogEditorMode !== "edit"
  });

  try {
    await submitCatalogEditor();
  } catch (error) {
    setNotice(error.message, true);
  } finally {
    setCatalogEditorSubmitting(false, { defaultMarkup: previousMarkup });
  }
});

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

navComponentEquivalents?.addEventListener("click", () => {
  updateViewHash(componentEquivalentsPage.viewKey);
  currentCatalogView = componentEquivalentsPage.viewKey;
  catalogItems = catalogCache;
  filterCatalogItems();
});

navForum?.addEventListener("click", () => {
  updateViewHash("Forum");
  navigateTelegramCatalog("Forum", navForum);
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
