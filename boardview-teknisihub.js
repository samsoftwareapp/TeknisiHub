const state = {
  board: null,
  boardId: null,
  boardToken: null,
  showPins: true,
  showOutline: true,
  showParts: true,
  showLabels: true,
  showNails: false,
  netLinesMode: 'trace',
  routesMode: 'selected',
  visibleSide: 'top',
  mirrorMode: "off",  // "off" | "x" | "y" | "xy"
  selectedPart: null,
  selectedNet: null,
  selectedPin: null,
  hoverPart: null,
  hoverPin: null,
  hoverNet: null,
  partListSide: 'all',
  config: { uploadAuthRequired: false, maxUploadMb: null, boardTtlMinutes: null, supportUrl: '', appVersion: '', appRevision: '', appTagline: '', googleAuthEnabled: false, appleAuthEnabled: false, authProviders: [], requireLogin: false, loginGateEnabled: false, authConfigured: false, currentUser: null, canViewMetrics: false },
  auth: { username: '', password: '' },
  drag: { active: false, moved: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 },
  camera: { scale: 1, offsetX: 0, offsetY: 0, baseScale: 1 },
  indexes: {
    pinsByPart: new Map(),
    pinsByNet: new Map(),
    nailsByNet: new Map(),
    partsByName: new Map(),
    routesByNet: new Map(),
    arcsByNet: new Map(),
    pinGrid: new Map(),
    partGrid: new Map(),
    partBoxes: new Map(),
    connectionCache: new Map(),
    cellSize: 50,
  },
  renderLoop: {
    scheduled: false,
    lastDurationMs: 0,
    lastVisibleParts: 0,
    lastVisiblePins: 0,
    lastVisibleRoutes: 0,
    dpr: 1.0,
  },
  theme: localStorage.getItem('boardview-theme') || 'dark',
  hoverScheduler: {
    scheduled: false,
    clientX: 0,
    clientY: 0,
    inside: false,
  },
  measure: {
    active: false,
    pointA: null,
    pointB: null,
    cursorWorld: null,
  },
  searchMode: 'all',
  searchFocusPulse: null,
};

const THEMES = {
  dark: {
    bg: '#0b1220',
    bgTop: '#11182b',
    bgBottom: '#11182b',
    grid: 'rgba(255,255,255,0.03)',
    outline: '#64748b',
    top: '#60a5fa',
    bottom: '#f472b6',
    selected: '#f59e0b',
    hover: '#f8fafc',
    net: '#22c55e',
    text: '#e5e7eb',
    textMuted: '#cbd5e1',
    legendBg: 'rgba(8,15,28,0.72)',
    legendBorder: 'rgba(148,163,184,0.2)',
  },
  light: {
    bg: '#edf4ff',
    bgTop: '#f5f8fe',
    bgBottom: '#f5f8fe',
    grid: 'rgba(15,23,42,0.05)',
    outline: '#7b8da6',
    top: '#4d9cff',
    bottom: '#e86ab1',
    selected: '#d97706',
    hover: '#0f172a',
    net: '#16a34a',
    text: '#0f172a',
    textMuted: '#516274',
    legendBg: 'rgba(255,255,255,0.78)',
    legendBorder: 'rgba(148,163,184,0.32)',
  },
};

const COLORS = { ...THEMES.dark };

const LIST_LIMITS = {
  componentsInitial: 500,
  componentsStep: 500,
  netMembersInitial: 150,
  netMembersStep: 150,
  netPinsInitial: 250,
  netPinsStep: 250,
};


const SUPPORT_CONFIG = {
  supportUrl: '',
  tiers: [
    { key: '1', amount: '$1', label: 'Small support', description: 'Helps cover hosting, testing, and small interface fixes.' },
    { key: '2', amount: '$2', label: 'Feature support', description: 'Helps improve navigation, search, and board rendering performance.' },
    { key: '5', amount: '$5', label: 'Format support', description: 'Helps add new boardview and CAD parsers, tracing, and advanced tools.' },
  ],
};

const canvas = document.getElementById('board-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const minimapShellEl = document.getElementById('minimap-shell');
const minimapCanvas = document.getElementById('minimap-canvas');
const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;
const minimapZoomEl = document.getElementById('minimap-zoom');
const statusEl = document.getElementById('status');
const perfEl = document.getElementById('perf-badge');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const resultsEl = document.getElementById('results');
const netListEl = document.getElementById('net-list');
const matchListEl = document.getElementById('match-list');
const matchCountEl = document.getElementById('match-count');
const searchInput = document.getElementById('search-input');
const searchAllBtn = document.getElementById('search-all-btn');
const searchPartBtn = document.getElementById('search-part-btn');
const searchNetBtn = document.getElementById('search-net-btn');
const partListEl = document.getElementById('part-list');
const partCountEl = document.getElementById('part-count');
const partFilterInput = document.getElementById('part-filter-input');
const netFilterInput = document.getElementById('net-filter-input');
const selectedNetListEl = document.getElementById('selected-net-list');
const selectedNetTitleEl = document.getElementById('selected-net-title');
const selectedNetCountEl = document.getElementById('selected-net-count');
const selectedNetGroupsEl = document.getElementById('selected-net-groups');
const selectedPinGroupsEl = document.getElementById('selected-pin-groups');
const selectedPinCountEl = document.getElementById('selected-pin-count');

const actionCardEl = document.getElementById('action-card');
const actionCardCloseBtn = document.getElementById('action-card-close-btn');
const actionTabShareBtn = document.getElementById('action-tab-share');
const actionTabSupportBtn = document.getElementById('action-tab-support');
const sharePanelEl = document.getElementById('action-panel-share');
const supportPanelEl = document.getElementById('action-panel-support');
const aboutmeDockEl = document.getElementById('aboutme');
const aboutmeButtonEl = document.getElementById('aboutme-button');
const aboutmeCardEl = document.getElementById('aboutme-card');
const supportFabBtn = document.getElementById('support-fab-btn');
const supportConfigNoteEl = document.getElementById('support-config-note');
const appTitleEl = document.getElementById('app-title');
const fileInputEl = document.getElementById('file-input');
const uploadNoteEl = document.getElementById('upload-note');
const statusActionsEl = document.getElementById('status-actions');
const reportIssueBtnEl = document.getElementById('report-issue-btn');
const authPanelEl = document.getElementById('auth-panel');
const authUsernameEl = document.getElementById('auth-username');
const authPasswordEl = document.getElementById('auth-password');
const loginRequiredNoteEl = document.getElementById('login-required-note');
const versionTriggerBtn = document.getElementById('version-trigger-btn');
const viewerVersionChip = document.getElementById('viewer-version-chip');
const updatesModalEl = document.getElementById('updates-modal');
const metricsTriggerBtn = document.getElementById('metrics-trigger-btn');
const metricsModalEl = document.getElementById('metrics-modal');
const metricsStatusEl = document.getElementById('metrics-status');
const metricsGridEl = document.getElementById('metrics-grid');
const metricsBoardsEl = document.getElementById('metrics-boards');
const metricsUsersEl = document.getElementById('metrics-users');
const metricsEventsEl = document.getElementById('metrics-events');
const metricsClearBtn = document.getElementById('metrics-clear-btn');
const authLoginGoogleLinkEl = document.getElementById('auth-login-google-link');
const authLoginAppleLinkEl = document.getElementById('auth-login-apple-link');
const authLogoutLinkEl = document.getElementById('auth-logout-link');
const authUserDisplayEl = document.getElementById('auth-user-display');
const authRoleBadgeEl = document.getElementById('auth-role-badge');
const shareFabBtn = document.getElementById('share-fab-btn');
const shareSaveBtn = document.getElementById('share-save-btn');
const shareTelegramBtn = document.getElementById('share-telegram-btn');
const shareWhatsappBtn = document.getElementById('share-whatsapp-btn');
const shareStatusEl = document.getElementById('share-status');

const tooltipEl = document.createElement('div');
tooltipEl.className = 'canvas-tooltip';
tooltipEl.hidden = true;
document.querySelector('.viewer-area').appendChild(tooltipEl);

function applyTheme(themeName) {
  const next = themeName === 'light' ? 'light' : 'dark';
  state.theme = next;
  Object.assign(COLORS, THEMES[next]);
  document.body.dataset.theme = next;
  try { localStorage.setItem('boardview-theme', next); } catch (_) {}
  if (themeToggleBtn) {
    const toLabel = next === 'light' ? 'dark' : 'light';
    themeToggleBtn.title = `Switch to ${toLabel} theme`;
    themeToggleBtn.setAttribute('aria-label', `Switch to ${toLabel} theme`);
    themeToggleBtn.classList.toggle('active', next === 'light');
    const label = themeToggleBtn.querySelector('.tool-label');
    if (label) label.textContent = next === 'light' ? 'Light' : 'Dark';
    const icon = themeToggleBtn.querySelector('.tool-icon');
    if (icon) icon.textContent = next === 'light' ? '☀' : '◐';
  }
}

function toggleTheme() {
  applyTheme(state.theme === 'light' ? 'dark' : 'light');
  render();
}

function drawCanvasBackground(width, height) {
  ctx.fillStyle = COLORS.bgTop;
  ctx.fillRect(0, 0, width, height);
}

function drawCanvasWatermarkOverlay(width, height) {
  ctx.save();
  const now = performance.now() * 0.00018;
  const driftX = Math.sin(now) * 24;
  const driftY = Math.cos(now * 0.8) * 18;
  const tileX = 320;
  const tileY = 210;
  const textColor = state.theme === 'light'
    ? 'rgba(15, 23, 42, 0.045)'
    : 'rgba(241, 245, 249, 0.04)';
  ctx.translate(width / 2 + driftX, height / 2 + driftY);
  ctx.rotate(-Math.PI / 5.6);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 34px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = textColor;
  for (let y = -height; y <= height; y += tileY) {
    for (let x = -width; x <= width; x += tileX) {
      ctx.fillText('TEKNISI HUB', x, y);
    }
  }
  ctx.restore();
}

function getDetailZoom() {
  const base = Math.max(state.camera.baseScale || state.camera.scale || 1, 1e-6);
  return state.camera.scale / base;
}

function isTvwComponentBoard() {
  return isTvwBoardData(state.board);
}

function isTvwBoardData(board) {
  return String(board?.meta?.format_name || '').toLowerCase().startsWith('tvw');
}

function hasTvwNativeSegments() {
  return isTvwComponentBoard() && (state.board?.outline_segments?.length || 0) > 128;
}

function getBoardDensityFactor() {
  const board = state.board;
  if (!board) return 1;
  const bounds = board.bounds || {};
  // bounds are in mils after normalization; convert area to mm² for meaningful density
  // 1 mil² = 0.000645 mm²
  const areaMil2 = Math.max((bounds.width || 0) * (bounds.height || 0), 1e-6);
  const areaMm2 = areaMil2 * 0.000645;
  const parts = Array.isArray(board.parts) ? board.parts.length : 0;
  const pins = Array.isArray(board.pins) ? board.pins.length : 0;
  const density = (parts + pins * 0.2) / areaMm2;
  if (density >= 0.5) return 1.8;   // very dense: smartphone, camera module
  if (density >= 0.2) return 1.45;  // dense: phone motherboard
  if (density >= 0.05) return 1.2;  // moderate: laptop logic board
  return 1.0;                        // sparse: GPU, Arduino, simple boards
}

function shouldShowPartLabel(part, bounds, zoom, flags = {}) {
  if (!state.showLabels) return false;
  if (flags.force) return true;
  const maxDim = Math.max(bounds.width, bounds.height);
  const minDim = Math.min(bounds.width, bounds.height);
  const area = Math.max(bounds.width * bounds.height, 0);
  const nameLength = Math.max(2, String(part?.name || '').length);
  const detailZoom = getDetailZoom();
  const densityFactor = getBoardDensityFactor();
  // zoomBonus: 0 at fit view (detailZoom=1), grows as user zooms in
  // This ensures labels appear progressively with zoom, not all at once
  const zoomBonus = Math.max(0, detailZoom - 1) * 15;
  const score = maxDim + minDim * 0.45 + Math.sqrt(area) * 0.55 + zoomBonus;
  if (isTvwComponentBoard()) {
    return detailZoom >= 1.05 && (score >= 18 || maxDim >= 10 || area >= 80);
  }
  const threshold = (24 + nameLength * 1.35) * densityFactor;
  return score >= threshold && (maxDim >= 12 || area >= 90 || detailZoom >= 3.25);
}

function refreshAuthUi() {
  const currentUser = state.config.currentUser;
  if (authLoginGoogleLinkEl) authLoginGoogleLinkEl.classList.toggle('is-hidden', !state.config.googleAuthEnabled || !!currentUser);
  if (authLoginAppleLinkEl) authLoginAppleLinkEl.classList.toggle('is-hidden', !state.config.appleAuthEnabled || !!currentUser);
  if (authLogoutLinkEl) authLogoutLinkEl.classList.toggle('is-hidden', !currentUser);
  if (authUserDisplayEl) {
    authUserDisplayEl.classList.toggle('is-hidden', !currentUser);
    authUserDisplayEl.textContent = currentUser?.name || '';
  }
  if (authRoleBadgeEl) {
    authRoleBadgeEl.classList.toggle('is-hidden', !currentUser);
    authRoleBadgeEl.textContent = currentUser?.role ? String(currentUser.role).charAt(0).toUpperCase() + String(currentUser.role).slice(1) : '';
  }
  if (metricsTriggerBtn) {
    metricsTriggerBtn.classList.toggle('is-hidden', !state.config.canViewMetrics);
  }
}

function formatUptime(seconds) {
  const s = Math.max(0, Number(seconds || 0));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function formatAge(seconds) {
  const s = Math.max(0, Number(seconds || 0));
  if (s < 60) return 'just now';
  if (s < 3600) { const m = Math.floor(s / 60); return `${m} min ago`; }
  if (s < 86400) { const h = Math.floor(s / 3600); return `${h}h ago`; }
  return `${Math.floor(s / 86400)}d ago`;
}

function escapeMetricText(value) {
  return escapeHtml(value ?? '');
}

function formatTimestamp(ts) {
  if (!ts) return '—';
  const d = new Date(Number(ts) * 1000);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function trimUserAgent(value) {
  const text = String(value || '').trim();
  if (!text) return 'Unknown client';
  return text.length > 80 ? `${text.slice(0, 77)}…` : text;
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.remove('is-hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add('is-hidden');
  modal.setAttribute('aria-hidden', 'true');
}

async function openMetricsModal() {
  if (!metricsModalEl) return;
  openModal(metricsModalEl);
  metricsStatusEl.textContent = 'Loading admin activity log…';
  metricsGridEl.innerHTML = '';
  metricsBoardsEl.innerHTML = '';
  if (metricsUsersEl) metricsUsersEl.innerHTML = '';
  metricsEventsEl.innerHTML = '';
  try {
    const resp = await fetch('/api/admin/activity', { headers: clientHeaders(), cache: 'no-store' });
    const payload = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(payload.detail || 'Failed to load admin activity log.');
    metricsStatusEl.textContent = payload.resets_on_restart ? 'This admin log is stored only for the current runtime.' : `Admin log loaded from ${escapeMetricText(payload.storage_backend || 'persistent storage')}.`; 
    const cards = [
      ['Uptime', formatUptime(payload.uptime_seconds)],
      ['Browser sessions', String(payload.sessions_total ?? 0)],
      ['Landing visits', String(payload.landing_views_total ?? 0)],
      ['Open Viewer clicks', String(payload.open_viewer_clicks_total ?? 0)],
      ['Support us clicks', String(payload.support_clicks_total ?? 0)],
      ['Sign-ins', String(payload.logins_total ?? 0)],
      ['Login conversion', `${escapeMetricText(payload.login_conversion_percent ?? 0)}%`],
      ['Known users', String(payload.authenticated_users_seen ?? 0)],
      ['Admins', String(payload.admin_users ?? 0)],
      ['Uploads', String(payload.uploads_total ?? 0)],
      ['Board opens', String(payload.board_views_total ?? 0)],
      ['Active boards', String(payload.active_boards ?? 0)],
      ['Uploaded data', `${Math.round((payload.bytes_uploaded_total || 0) / 1024 / 1024 * 10) / 10} MB`],
    ];
    for (const [label, value] of cards) {
      const card = document.createElement('div');
      card.className = 'metric-card';
      card.innerHTML = `<span>${escapeMetricText(label)}</span><strong>${escapeMetricText(value)}</strong>`;
      metricsGridEl.appendChild(card);
    }

    const formatEntries = Object.entries(payload.uploads_by_format || {});
    if (formatEntries.length) {
      const card = document.createElement('div');
      card.className = 'metric-card metric-card-wide';
      card.innerHTML = `<span>Formats</span><strong>${formatEntries.map(([name, count]) => `${escapeMetricText(name)}: ${escapeMetricText(count)}`).join(' · ')}</strong>`;
      metricsGridEl.appendChild(card);
    }

    const recentBoards = payload.recent_boards || [];
    if (!recentBoards.length) {
      metricsBoardsEl.innerHTML = '<div class="list-empty">No boards yet.</div>';
    } else {
      for (const board of recentBoards) {
        const item = document.createElement('div');
        item.className = 'metrics-item';
        item.innerHTML = `<strong>${escapeMetricText(board.filename)}</strong><small>${escapeMetricText(board.uploaded_by)} · ${escapeMetricText(formatAge(board.age_seconds))}</small>`;
        metricsBoardsEl.appendChild(item);
      }
    }

    const recentLogins = payload.recent_logins || [];
    if (metricsUsersEl) {
      if (!recentLogins.length) {
        metricsUsersEl.innerHTML = '<div class="list-empty">No sign-ins recorded yet.</div>';
      } else {
        for (const entry of recentLogins) {
          const item = document.createElement('div');
          item.className = 'metrics-item';
          item.innerHTML = `<strong>${escapeMetricText(entry.actor_email || 'Unknown user')}</strong><small>${escapeMetricText(entry.provider || 'provider')} · ${escapeMetricText(entry.ip_address || 'unknown IP')} · ${escapeMetricText(formatTimestamp(entry.ts))}</small><small>${escapeMetricText(trimUserAgent(entry.user_agent))}</small>`;
          metricsUsersEl.appendChild(item);
        }
      }
    }

    const recentEvents = payload.recent_events || [];
    if (!recentEvents.length) {
      metricsEventsEl.innerHTML = '<div class="list-empty">No events yet.</div>';
    } else {
      for (const event of recentEvents) {
        const item = document.createElement('div');
        item.className = 'metrics-item';
        item.innerHTML = `<strong>${escapeMetricText(event.kind)} · ${escapeMetricText(event.actor_email || 'guest')}</strong><small>${escapeMetricText(event.message)}</small><small>${escapeMetricText(event.ip_address || 'unknown IP')} · ${escapeMetricText(formatTimestamp(event.ts))} · ${escapeMetricText(trimUserAgent(event.user_agent))}</small>`;
        metricsEventsEl.appendChild(item);
      }
    }
  } catch (err) {
    metricsStatusEl.textContent = err.message || 'Failed to load admin activity log.';
  }
}


async function clearMetricsLog() {
  if (!metricsClearBtn) return;
  const confirmed = window.confirm('Clear admin monitor data and counters? User accounts stay intact.');
  if (!confirmed) return;
  metricsClearBtn.disabled = true;
  const previousLabel = metricsClearBtn.textContent;
  metricsClearBtn.textContent = 'Clearing…';
  metricsStatusEl.textContent = 'Clearing admin monitor data…';
  try {
    const resp = await fetch('/api/admin/activity/clear', {
      method: 'POST',
      headers: clientHeaders({ 'Content-Type': 'application/json' }),
      cache: 'no-store',
    });
    const payload = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(payload.detail || 'Failed to clear admin activity log.');
    metricsStatusEl.textContent = payload.detail || 'Admin monitor data cleared.';
    metricsGridEl.innerHTML = '';
    metricsBoardsEl.innerHTML = '<div class="list-empty">No boards yet.</div>';
    if (metricsUsersEl) metricsUsersEl.innerHTML = '<div class="list-empty">No sign-ins yet.</div>';
    metricsEventsEl.innerHTML = '<div class="list-empty">No events yet.</div>';
    await openMetricsModal();
  } catch (err) {
    metricsStatusEl.textContent = err.message || 'Failed to clear admin monitor data.';
  } finally {
    metricsClearBtn.disabled = false;
    metricsClearBtn.textContent = previousLabel;
  }
}

function clientHeaders(extra = {}) {
  return { 'X-BoardView-Client': 'webapp', ...extra };
}

function setViewerDocumentTitle(fileName = '') {
  const baseTitle = 'Boardview TeknisiHub';
  const cleanName = String(fileName || '').trim();
  document.title = cleanName ? `${cleanName} | ${baseTitle}` : baseTitle;
}

function applyViewerVersionLabel(versionText = '') {
  const cleanVersion = String(versionText || '').trim();
  const label = cleanVersion ? `v${cleanVersion}` : 'v-';
  if (versionTriggerBtn) versionTriggerBtn.textContent = label;
  if (viewerVersionChip) viewerVersionChip.textContent = label;
}

async function fetchLocalServiceHealthVersion() {
  try {
    const resp = await fetch(`${getTeknisiHubServiceBaseUrl()}/health`, {
      headers: clientHeaders(),
      cache: 'no-store',
    });
    const payload = await resp.json().catch(() => ({}));
    if (!resp.ok) return '';
    return String(payload.version || '').trim();
  } catch (_) {
    return '';
  }
}

function basicAuthHeader() {
  const username = (authUsernameEl?.value || state.auth.username || '').trim();
  const password = authPasswordEl?.value || state.auth.password || '';
  if (!username || !password) return {};
  state.auth.username = username;
  state.auth.password = password;
  return { Authorization: `Basic ${btoa(`${username}:${password}`)}` };
}

async function fetchConfig() {
  state.config.uploadAuthRequired = false;
  state.config.maxUploadMb = 50;
  state.config.boardTtlMinutes = 60;
  state.config.supportUrl = '';
  state.config.appVersion = '0.17 TH';
  state.config.appRevision = 'TeknisiHub';
  state.config.appTagline = 'Offline native session';
  state.config.googleAuthEnabled = false;
  state.config.appleAuthEnabled = false;
  state.config.authProviders = [];
  state.config.requireLogin = false;
  state.config.loginGateEnabled = false;
  state.config.authConfigured = false;
  state.config.currentUser = null;
  state.config.canViewMetrics = false;
  if (appTitleEl) appTitleEl.textContent = 'Boardview TeknisiHub';
  setViewerDocumentTitle(state.board?.filename || '');
  authPanelEl?.classList.add('is-hidden');
  loginRequiredNoteEl?.classList.add('is-hidden');
  if (fileInputEl) fileInputEl.disabled = false;
  applyViewerVersionLabel(state.config.appVersion);
  const localServiceVersion = await fetchLocalServiceHealthVersion();
  if (localServiceVersion) {
    state.config.appVersion = localServiceVersion;
    applyViewerVersionLabel(localServiceVersion);
  }
  refreshAuthUi();
  applySupportLinks();
  return;

  try {
    const resp = await fetch('/api/config', { headers: clientHeaders() });
    if (!resp.ok) throw new Error('Failed to load viewer configuration.');
    const config = await resp.json();
    state.config.uploadAuthRequired = !!config.upload_auth_required;
    state.config.maxUploadMb = config.max_upload_mb;
    state.config.boardTtlMinutes = config.board_ttl_minutes;
    state.config.supportUrl = config.support_url || '';
    state.config.appVersion = config.app_version || '';
    state.config.appRevision = config.app_revision || '';
    state.config.appTagline = config.app_tagline || '';
    state.config.googleAuthEnabled = !!config.google_auth_enabled;
    state.config.appleAuthEnabled = !!config.apple_auth_enabled;
    state.config.authProviders = Array.isArray(config.auth_providers) ? config.auth_providers : [];
    state.config.requireLogin = !!config.require_login;
    state.config.loginGateEnabled = !!config.login_gate_enabled;
    state.config.authConfigured = !!config.auth_configured;
    state.config.currentUser = config.current_user || null;
    state.config.canViewMetrics = !!config.can_view_metrics;

    if (appTitleEl && config.app_title) appTitleEl.textContent = config.app_title;
    setViewerDocumentTitle(state.board?.filename || '');
    if (uploadNoteEl) {
      const parts = [];
      if (config.max_upload_mb) parts.push(`Max file: ${config.max_upload_mb} MB.`);
      if (config.board_ttl_minutes) parts.push(`Expires after ${config.board_ttl_minutes} min.`);
      if (config.login_gate_enabled) parts.push('Sign-in required.');
      uploadNoteEl.innerHTML =
        (parts.length ? `<span class="upload-note-limits">${parts.join(' ')}</span>` : '') +
        '<div class="upload-note-formats">' +
          '<span class="upload-note-formats-label">Supported formats:</span> ' +
          '<span class="upload-note-format-list">.brd · .bdv · .fz · .cad · .gencad · .bv · .bvr · .tvw · .f2b · .gr · .zip (ASC)</span>' +
        '</div>' +
        '<div class="upload-note-asc-hint">ASC requires a ZIP archive with format.asc, parts.asc, pins.asc, nails.asc.</div>';
    }
    authPanelEl?.classList.toggle('is-hidden', !state.config.uploadAuthRequired);
    if (loginRequiredNoteEl) {
      const locked = state.config.loginGateEnabled && !state.config.currentUser;
      loginRequiredNoteEl.classList.toggle('is-hidden', !locked);
    }
    if (fileInputEl) fileInputEl.disabled = !!(state.config.loginGateEnabled && !state.config.currentUser);
    if (state.config.supportUrl) {
      SUPPORT_CONFIG.supportUrl = state.config.supportUrl || '';
    }
    applyViewerVersionLabel(state.config.appVersion);
    refreshAuthUi();
    applySupportLinks();
  } catch (err) {
    console.error(err);
    setStatus(err.message || 'Failed to load configuration.', true);
  }
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, state.renderLoop.dpr);
  const rect = canvas.getBoundingClientRect();
  const nextWidth = Math.max(1, Math.round(rect.width * dpr));
  const nextHeight = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== nextWidth) canvas.width = nextWidth;
  if (canvas.height !== nextHeight) canvas.height = nextHeight;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  render();
}

window.addEventListener('resize', resizeCanvas);


function applySupportConfig() {
  const url = SUPPORT_CONFIG.supportUrl || '#';
  for (const tier of SUPPORT_CONFIG.tiers) {
    const link = document.getElementById(`support-tier-${tier.key}`);
    if (!link) continue;
    link.href = url;
  }
  const placeholder = !url || url.includes('YOUR_PAGE');
  supportConfigNoteEl?.classList.toggle('is-hidden', !placeholder);
}

function setStatus(text, isError = false, options = {}) {
  statusEl.textContent = text;
  statusEl.classList.toggle('error', isError);
  const showReport = !!(isError && options.allowReport);
  statusActionsEl?.classList.toggle('is-hidden', !showReport);
}


function resetSearchFields() {
  searchInput.value = '';
  partFilterInput.value = '';
  netFilterInput.value = '';
  matchListEl.innerHTML = '';
  matchCountEl.textContent = '0';
  state.hoverPart = null;
  state.hoverPin = null;
  state.hoverNet = null;
  state.selectedPart = null;
  state.selectedNet = null;
  state.selectedPin = null;
  state.partListSide = 'all';
  document.getElementById('part-side-all-btn').classList.add('active');
  document.getElementById('part-side-top-btn').classList.remove('active');
  document.getElementById('part-side-bottom-btn').classList.remove('active');
  resultsEl.textContent = 'Nothing selected.';
  clearSelectedNetMembers();
  setSearchMode('all');
}

async function buildUploadFailureMeta(file, detail) {
  const slice = await file.slice(0, 32).arrayBuffer();
  const bytes = Array.from(new Uint8Array(slice));
  const firstBytesHex = bytes.map((value) => value.toString(16).padStart(2, '0')).join(' ');
  return {
    filename: file.name || 'uploaded.board',
    sizeBytes: file.size || 0,
    firstBytesHex,
    detail: detail || 'Upload parse issue',
    detectedFormat: ((file.name || '').toLowerCase().endsWith('.cad') || (file.name || '').toLowerCase().endsWith('.gcd') || (file.name || '').toLowerCase().endsWith('.gencad')) ? 'gencad-candidate' : 'unknown',
  };
}

async function reportUploadIssue() {
  if (!lastUploadFailure) return;
  try {
    const resp = await fetch('/api/report-upload-issue', {
      method: 'POST',
      headers: clientHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        filename: lastUploadFailure.filename,
        size_bytes: lastUploadFailure.sizeBytes,
        first_bytes_hex: lastUploadFailure.firstBytesHex,
        detail: lastUploadFailure.detail,
        detected_format: lastUploadFailure.detectedFormat,
      }),
    });
    if (!resp.ok) throw new Error('Unable to report this file right now.');
    setStatus('Report sent to support. Thank you.', false);
    lastUploadFailure = null;
  } catch (err) {
    setStatus(err.message || 'Unable to report this file right now.', true, { allowReport: true });
  }
}

function resetUiForNewUpload(filename = '') {
  lastUploadFailure = null;
  resetSearchFields();
  state.boardId = null;
  state.boardToken = null;
  setViewerDocumentTitle(filename);
  if (filename) {
    setStatus(`Uploading: ${filename}…`);
  } else {
    setStatus('Preparing upload…');
  }
}

function clearAllQueries() {
  resetSearchFields();
  if (state.board) {
    populatePartList();
    populateNetList();
    clearSelectedNetMembers();
    render();
    setStatus(`Loaded: ${state.board.filename}`);
  } else {
    render();
    setStatus('Waiting for a file…');
  }
}

function clearSelectedNetMembers() {
  selectedNetTitleEl.textContent = 'No net selected';
  selectedNetCountEl.textContent = '0';
  selectedPinCountEl.textContent = '0';
  selectedNetListEl.innerHTML = '';
  selectedNetGroupsEl.innerHTML = '';
  selectedPinGroupsEl.innerHTML = '';
}

function normalizeSide(side) {
  if (!side) return 'other';
  const value = String(side).toLowerCase();
  if (value === 'top') return 'top';
  if (value === 'bottom') return 'bottom';
  return 'other';
}

function groupPartsForNet(netName) {
  if (!state.board || !netName) return { top: [], bottom: [], other: [] };
  const key = netName.toLowerCase();
  const pins = state.indexes.pinsByNet.get(key) || [];
  const seen = new Set();
  const groups = { top: [], bottom: [], other: [] };

  for (const pin of pins) {
    const part = state.board.parts[pin.part - 1];
    if (!part) continue;
    const tag = part.index || part.name;
    if (seen.has(tag)) continue;
    seen.add(tag);
    groups[normalizeSide(part.mounting_side)].push(part);
  }

  for (const side of Object.keys(groups)) {
    groups[side].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  }
  return groups;
}

function groupPinsForNet(netName) {
  if (!state.board || !netName) return { top: [], bottom: [], other: [] };
  const key = netName.toLowerCase();
  const pins = [...(state.indexes.pinsByNet.get(key) || [])];
  const groups = { top: [], bottom: [], other: [] };

  pins.sort((a, b) => {
    const partA = state.board.parts[a.part - 1]?.name || '';
    const partB = state.board.parts[b.part - 1]?.name || '';
    const partCmp = partA.localeCompare(partB, undefined, { numeric: true, sensitivity: 'base' });
    if (partCmp !== 0) return partCmp;
    return (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' });
  });

  for (const pin of pins) {
    groups[normalizeSide(pin.side)].push(pin);
  }
  return groups;
}

function appendGroupHeading(container, title, count, shown = count) {
  const group = document.createElement('div');
  group.className = 'net-group';
  const header = document.createElement('div');
  header.className = 'net-group-header';
  const counter = shown < count ? `${shown} / ${count}` : `${count}`;
  header.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${counter}</span>`;
  group.appendChild(header);
  const list = document.createElement('div');
  list.className = 'group-list';
  group.appendChild(list);
  container.appendChild(group);
  return { group, header, list };
}

function appendPagedButtons(list, items, makeButton, initialLimit, step, emptyLabel = '') {
  let shown = 0;

  function renderChunk(limit) {
    const fragment = document.createDocumentFragment();
    const end = Math.min(items.length, shown + limit);
    for (let i = shown; i < end; i += 1) {
      fragment.appendChild(makeButton(items[i], i));
    }
    list.appendChild(fragment);
    shown = end;
    return shown;
  }

  if (!items.length) {
    if (emptyLabel) {
      const empty = document.createElement('div');
      empty.className = 'muted small';
      empty.textContent = emptyLabel;
      list.appendChild(empty);
    }
    return;
  }

  renderChunk(initialLimit);
  if (shown >= items.length) return;

  const moreBtn = document.createElement('button');
  moreBtn.type = 'button';
  moreBtn.className = 'list-more-btn';
  const updateText = () => {
    moreBtn.textContent = `Show more (${items.length - shown} left)`;
  };
  updateText();
  moreBtn.addEventListener('click', () => {
    renderChunk(step);
    if (shown >= items.length) {
      moreBtn.remove();
    } else {
      updateText();
    }
  });
  list.appendChild(moreBtn);
}

function populateSelectedNetMembers(netName) {
  selectedNetListEl.innerHTML = '';
  selectedNetGroupsEl.innerHTML = '';
  selectedPinGroupsEl.innerHTML = '';
  selectedPinCountEl.textContent = '0';
  if (!state.board || !netName) {
    clearSelectedNetMembers();
    return;
  }

  const groups = groupPartsForNet(netName);
  const total = groups.top.length + groups.bottom.length + groups.other.length;
  selectedNetTitleEl.textContent = netName;
  selectedNetCountEl.textContent = String(total);

  const orderedGroups = [
    ['Top side', groups.top],
    ['Bottom side', groups.bottom],
    ['Other / unknown', groups.other],
  ];

  for (const [label, parts] of orderedGroups) {
    if (!parts.length) continue;
    const shown = Math.min(parts.length, LIST_LIMITS.netMembersInitial);
    const { list } = appendGroupHeading(selectedNetGroupsEl, label, parts.length, shown);
    appendPagedButtons(list, parts, (part) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `list-item ${part.mounting_side === 'bottom' ? 'part-bottom' : 'part-top'}`;
      const partPins = getPartPins(part).filter((pin) => (pin.net || '').toLowerCase() === netName.toLowerCase());
      const pinPreview = partPins.slice(0, 4).map((pin) => pin.name || `#${pin.index}`).join(', ');
      btn.innerHTML = `${escapeHtml(part.name)} <small>${escapeHtml(part.mounting_side || 'unknown')} · ${partPins.length} pin${partPins.length === 1 ? '' : 's'}${pinPreview ? ` · ${escapeHtml(pinPreview)}` : ''}</small>`;
      btn.addEventListener('click', () => selectPart(part));
      btn.addEventListener('mouseenter', () => {
        state.hoverPart = part;
        render();
      });
      btn.addEventListener('mouseleave', () => {
        state.hoverPart = null;
        render();
      });
      return btn;
    }, LIST_LIMITS.netMembersInitial, LIST_LIMITS.netMembersStep);
  }

  populateSelectedNetPins(netName);
}

function populateSelectedNetPins(netName) {
  selectedPinGroupsEl.innerHTML = '';
  if (!state.board || !netName) {
    selectedPinCountEl.textContent = '0';
    return;
  }

  const groups = groupPinsForNet(netName);
  const total = groups.top.length + groups.bottom.length + groups.other.length;
  selectedPinCountEl.textContent = String(total);

  const orderedGroups = [
    ['Top pins', groups.top],
    ['Bottom pins', groups.bottom],
    ['Other / unknown pins', groups.other],
  ];

  for (const [label, pins] of orderedGroups) {
    if (!pins.length) continue;
    const shown = Math.min(pins.length, LIST_LIMITS.netPinsInitial);
    const { list } = appendGroupHeading(selectedPinGroupsEl, label, pins.length, shown);
    appendPagedButtons(list, pins, (pin) => {
      const part = state.board.parts[pin.part - 1] || null;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `list-item ${pin.side === 'bottom' ? 'part-bottom' : 'part-top'}`;
      btn.innerHTML = `${escapeHtml(part?.name || 'Unknown part')} · ${escapeHtml(pin.name || `#${pin.index}`)} <small>${escapeHtml(pin.side || 'unknown')} · ${Number(pin.x).toFixed(2)}, ${Number(pin.y).toFixed(2)}${pin.probe ? ` · ${escapeHtml(pin.probe)}` : ''}</small>`;
      btn.addEventListener('click', () => selectPin(pin));
      return btn;
    }, LIST_LIMITS.netPinsInitial, LIST_LIMITS.netPinsStep);
  }
}

function updateStats(board) {
  const sideCounts = board.meta.side_counts || {};
  const partSides = sideCounts.parts || {};
  document.getElementById('stat-file').textContent = board.filename || '—';
  document.getElementById('stat-format').textContent = board.meta.format_name || '—';
  document.getElementById('stat-units').textContent = board.meta.units || '—';
  document.getElementById('stat-parts').textContent = String(board.meta.parts ?? board.parts.length);
  document.getElementById('stat-pins').textContent = String(board.meta.pins ?? board.pins.length);
  document.getElementById('stat-nails').textContent = String(board.meta.nails ?? board.nails.length);
  document.getElementById('stat-routes').textContent = `${board.meta.routes || 0}${board.meta.arcs ? ` + ${board.meta.arcs} arcs` : ''}`;
  document.getElementById('stat-outline').textContent = `${board.meta.outline_segments || 0} segments`;
  document.getElementById('stat-sides').textContent = `${partSides.top || 0} / ${partSides.bottom || 0}`;
}

function computeAutoCellSize(board) {
  const longest = Math.max(board.bounds?.width || 0, board.bounds?.height || 0, 1);
  return Math.max(8, longest / 70);
}

function gridKey(gx, gy) {
  return `${gx}:${gy}`;
}

function addItemToGrid(grid, rect, cellSize, value) {
  const x1 = Math.floor(rect.x_min / cellSize);
  const x2 = Math.floor(rect.x_max / cellSize);
  const y1 = Math.floor(rect.y_min / cellSize);
  const y2 = Math.floor(rect.y_max / cellSize);
  for (let gx = x1; gx <= x2; gx += 1) {
    for (let gy = y1; gy <= y2; gy += 1) {
      const key = gridKey(gx, gy);
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(value);
    }
  }
}

function getItemsNearPoint(grid, x, y, radiusWorld, cellSize) {
  const x1 = Math.floor((x - radiusWorld) / cellSize);
  const x2 = Math.floor((x + radiusWorld) / cellSize);
  const y1 = Math.floor((y - radiusWorld) / cellSize);
  const y2 = Math.floor((y + radiusWorld) / cellSize);
  const found = [];
  const seen = new Set();
  for (let gx = x1; gx <= x2; gx += 1) {
    for (let gy = y1; gy <= y2; gy += 1) {
      const bucket = grid.get(gridKey(gx, gy));
      if (!bucket) continue;
      for (const item of bucket) {
        const id = item.index ?? `${item.part}:${item.name || ''}:${item.x}:${item.y}`;
        if (seen.has(id)) continue;
        seen.add(id);
        found.push(item);
      }
    }
  }
  return found;
}

function derivePinsBBox(pins) {
  if (!pins.length) return null;
  const xs = pins.map((pin) => pin.x);
  const ys = pins.map((pin) => pin.y);
  const pad = Math.max(0.8, Math.min(4, (Math.max(...xs) - Math.min(...xs) + Math.max(...ys) - Math.min(...ys)) * 0.08 || 1.5));
  return {
    x_min: Math.min(...xs) - pad,
    x_max: Math.max(...xs) + pad,
    y_min: Math.min(...ys) - pad,
    y_max: Math.max(...ys) + pad,
  };
}

function normalizeWorldBBox(box) {
  const x1 = Number(box?.x_min);
  const x2 = Number(box?.x_max);
  const y1 = Number(box?.y_min);
  const y2 = Number(box?.y_max);
  if (![x1, x2, y1, y2].every(Number.isFinite)) return null;
  return {
    x_min: Math.min(x1, x2),
    x_max: Math.max(x1, x2),
    y_min: Math.min(y1, y2),
    y_max: Math.max(y1, y2),
  };
}

function expandWorldBBox(box, padX, padY = padX) {
  const normalized = normalizeWorldBBox(box);
  if (!normalized) return null;
  return {
    x_min: normalized.x_min - padX,
    x_max: normalized.x_max + padX,
    y_min: normalized.y_min - padY,
    y_max: normalized.y_max + padY,
  };
}

function unionWorldBBox(current, next) {
  const box = normalizeWorldBBox(next);
  if (!box) return current;
  if (!current) return box;
  return {
    x_min: Math.min(current.x_min, box.x_min),
    x_max: Math.max(current.x_max, box.x_max),
    y_min: Math.min(current.y_min, box.y_min),
    y_max: Math.max(current.y_max, box.y_max),
  };
}

function getTvwSegmentType(segment) {
  return Number(segment?.segment_type ?? segment?.segmentType ?? segment?.type ?? 0) || 0;
}

function getSegmentWorldBBox(segment) {
  const x1 = Number(segment?.x1);
  const y1 = Number(segment?.y1);
  const x2 = Number(segment?.x2);
  const y2 = Number(segment?.y2);
  if (![x1, y1, x2, y2].every(Number.isFinite)) return null;
  return {
    x_min: Math.min(x1, x2),
    x_max: Math.max(x1, x2),
    y_min: Math.min(y1, y2),
    y_max: Math.max(y1, y2),
  };
}

function overlapSpan(aMin, aMax, bMin, bMax) {
  return Math.min(aMax, bMax) - Math.max(aMin, bMin);
}

function sidesOverlap(a, b) {
  const left = String(a || 'both').toLowerCase();
  const right = String(b || 'both').toLowerCase();
  return left === 'both' || right === 'both' || left === 'all' || right === 'all' || left === right;
}

function validateTvwFootprintBBox(candidate, pinBox, boardBounds) {
  const box = normalizeWorldBBox(candidate);
  const pins = normalizeWorldBBox(pinBox);
  if (!box || !pins) return false;
  const width = box.x_max - box.x_min;
  const height = box.y_max - box.y_min;
  const pinWidth = Math.max(pins.x_max - pins.x_min, 1);
  const pinHeight = Math.max(pins.y_max - pins.y_min, 1);
  if (width < pinWidth * 0.95 || height < pinHeight * 0.95) return false;
  if (width <= pinWidth * 1.12 && height <= pinHeight * 1.12) return false;

  const boardWidth = boardBounds ? boardBounds.x_max - boardBounds.x_min : 0;
  const boardHeight = boardBounds ? boardBounds.y_max - boardBounds.y_min : 0;
  const maxWidth = boardWidth > 0
    ? Math.min(Math.max(pinWidth * 14, 70000), boardWidth * 0.36)
    : Math.max(pinWidth * 14, 140000);
  const maxHeight = boardHeight > 0
    ? Math.min(Math.max(pinHeight * 14, 70000), boardHeight * 0.36)
    : Math.max(pinHeight * 14, 140000);
  if (width > maxWidth || height > maxHeight) return false;

  const tolerance = Math.max(1800, Math.min(15000, Math.max(pinWidth, pinHeight) * 0.14));
  if (box.x_min > pins.x_min + tolerance) return false;
  if (box.x_max < pins.x_max - tolerance) return false;
  if (box.y_min > pins.y_min + tolerance) return false;
  if (box.y_max < pins.y_max - tolerance) return false;
  return true;
}

function deriveTvwNativeFootprintBBox(part, pins, pinBox, board = state.board) {
  const segments = Array.isArray(board?.outline_segments) ? board.outline_segments : [];
  const normalizedPins = normalizeWorldBBox(pinBox);
  if (!normalizedPins || pins.length < 6 || segments.length < 128) return null;

  const pinWidth = Math.max(normalizedPins.x_max - normalizedPins.x_min, 1);
  const pinHeight = Math.max(normalizedPins.y_max - normalizedPins.y_min, 1);
  const pinSpan = Math.max(pinWidth, pinHeight, 1);
  const boardBounds = normalizeWorldBBox(board?.bounds);
  const searchPad = Math.max(25000, Math.min(180000, pinSpan * 4.8));
  const searchBox = expandWorldBBox(normalizedPins, searchPad);
  const side = part?.mounting_side || pins[0]?.side || 'both';
  const xBand = expandWorldBBox(normalizedPins, Math.max(6500, Math.min(searchPad * 0.45, Math.max(pinWidth * 1.25, pinSpan * 0.35))), 0);
  const yBand = expandWorldBBox(normalizedPins, 0, Math.max(6500, Math.min(searchPad * 0.45, Math.max(pinHeight * 1.25, pinSpan * 0.35))));
  const minLineLength = Math.max(420, Math.min(2400, pinSpan * 0.026));
  const verticals = [];
  const horizontals = [];
  let nearbyUnion = null;
  let nearbyCount = 0;

  for (const segment of segments) {
    if (!sidesOverlap(side, segment.side)) continue;
    const segBox = getSegmentWorldBBox(segment);
    if (!segBox || !rectIntersectsWorldBounds(segBox, searchBox)) continue;
    const x1 = Number(segment.x1);
    const y1 = Number(segment.y1);
    const x2 = Number(segment.x2);
    const y2 = Number(segment.y2);
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const length = Math.hypot(dx, dy);
    const type = getTvwSegmentType(segment);
    if (type === 25 || !Number.isFinite(length) || length < minLineLength) continue;

    const verticalish = dy >= Math.max(dx * 2.2, minLineLength);
    const horizontalish = dx >= Math.max(dy * 2.2, minLineLength);
    if (!verticalish && !horizontalish) continue;

    nearbyUnion = unionWorldBBox(nearbyUnion, segBox);
    nearbyCount += 1;
    if (verticalish && yBand && overlapSpan(segBox.y_min, segBox.y_max, yBand.y_min, yBand.y_max) > 0) {
      verticals.push({ x: (x1 + x2) / 2, box: segBox });
    }
    if (horizontalish && xBand && overlapSpan(segBox.x_min, segBox.x_max, xBand.x_min, xBand.x_max) > 0) {
      horizontals.push({ y: (y1 + y2) / 2, box: segBox });
    }
  }

  const left = verticals.filter((line) => line.x <= normalizedPins.x_min + pinWidth * 0.25);
  const right = verticals.filter((line) => line.x >= normalizedPins.x_max - pinWidth * 0.25);
  const top = horizontals.filter((line) => line.y <= normalizedPins.y_min + pinHeight * 0.25);
  const bottom = horizontals.filter((line) => line.y >= normalizedPins.y_max - pinHeight * 0.25);
  if (left.length && right.length && top.length && bottom.length) {
    const candidate = {
      x_min: Math.min(...left.map((line) => line.box.x_min)),
      x_max: Math.max(...right.map((line) => line.box.x_max)),
      y_min: Math.min(...top.map((line) => line.box.y_min)),
      y_max: Math.max(...bottom.map((line) => line.box.y_max)),
    };
    const pad = Math.max(900, Math.min(6500, pinSpan * 0.045));
    const expanded = expandWorldBBox(candidate, pad);
    if (validateTvwFootprintBBox(expanded, normalizedPins, boardBounds)) return expanded;
  }

  if (nearbyCount >= 2) {
    const pad = Math.max(900, Math.min(5500, pinSpan * 0.04));
    const expanded = expandWorldBBox(nearbyUnion, pad);
    if (validateTvwFootprintBBox(expanded, normalizedPins, boardBounds)) return expanded;
  }

  return null;
}

function derivePartBBox(part, pins, board = state.board) {
  if (isTvwBoardData(board) && pins.length) {
    const pinBox = derivePinsBBox(pins);
    const footprintBox = deriveTvwNativeFootprintBBox(part, pins, pinBox, board);
    if (footprintBox) return footprintBox;
    const nativeBox = normalizeWorldBBox(part.native_bbox || part.placement_bbox);
    if (nativeBox) return nativeBox;
    if (part.bbox) return normalizeWorldBBox(part.bbox) || pinBox;
    return pinBox;
  }

  if (part.bbox) {
    return normalizeWorldBBox(part.bbox);
  }

  if (pins.length) {
    return derivePinsBBox(pins);
  }

  if (part.center) {
    return {
      x_min: part.center.x - 1,
      x_max: part.center.x + 1,
      y_min: part.center.y - 1,
      y_max: part.center.y + 1,
    };
  }

  return null;
}

function buildIndexes(board) {
  state.indexes = {
    pinsByPart: new Map(),
    pinsByNet: new Map(),
    nailsByNet: new Map(),
    partsByName: new Map(),
    routesByNet: new Map(),
    arcsByNet: new Map(),
    pinGrid: new Map(),
    partGrid: new Map(),
    partBoxes: new Map(),
    connectionCache: new Map(),
    cellSize: computeAutoCellSize(board),
  };

  for (const part of board.parts) {
    state.indexes.partsByName.set(part.name.toLowerCase(), part);
  }

  for (const pin of board.pins) {
    if (!state.indexes.pinsByPart.has(pin.part)) state.indexes.pinsByPart.set(pin.part, []);
    state.indexes.pinsByPart.get(pin.part).push(pin);
    const key = (pin.net || '').toLowerCase();
    if (key) {
      if (!state.indexes.pinsByNet.has(key)) state.indexes.pinsByNet.set(key, []);
      state.indexes.pinsByNet.get(key).push(pin);
    }

    addItemToGrid(
      state.indexes.pinGrid,
      { x_min: pin.x, x_max: pin.x, y_min: pin.y, y_max: pin.y },
      state.indexes.cellSize,
      pin,
    );
  }

  for (const part of board.parts) {
    const pins = state.indexes.pinsByPart.get(part.index) || [];
    const box = derivePartBBox(part, pins, board);
    if (!box) continue;
    state.indexes.partBoxes.set(part.index, box);
    addItemToGrid(state.indexes.partGrid, box, state.indexes.cellSize, part);
  }

  for (const nail of board.nails || []) {
    const key = (nail.net || '').toLowerCase();
    if (!key) continue;
    if (!state.indexes.nailsByNet.has(key)) state.indexes.nailsByNet.set(key, []);
    state.indexes.nailsByNet.get(key).push(nail);
  }

  for (const route of board.routes || []) {
    const key = (route.net || '').toLowerCase();
    if (!key) continue;
    if (!state.indexes.routesByNet.has(key)) state.indexes.routesByNet.set(key, []);
    state.indexes.routesByNet.get(key).push(route);
  }

  for (const arc of board.arcs || []) {
    const key = (arc.net || '').toLowerCase();
    if (!key) continue;
    if (!state.indexes.arcsByNet.has(key)) state.indexes.arcsByNet.set(key, []);
    state.indexes.arcsByNet.get(key).push(arc);
  }
}

function isSideVisible(side) {
  return state.visibleSide === 'both' || side === state.visibleSide || side === 'both' || side === 'all';
}

function transformWorld(x, y) {
  if (state.board && state.mirrorMode && state.mirrorMode !== 'off') {
    const b = state.board.bounds;
    const mx = (state.mirrorMode === 'x' || state.mirrorMode === 'xy')
      ? b.x_min + b.x_max - x : x;
    const my = (state.mirrorMode === 'y' || state.mirrorMode === 'xy')
      ? b.y_min + b.y_max - y : y;
    return { x: mx, y: my };
  }
  return { x, y };
}

function worldToScreen(x, y) {
  const p = transformWorld(x, y);
  return {
    x: p.x * state.camera.scale + state.camera.offsetX,
    y: p.y * state.camera.scale + state.camera.offsetY,
  };
}

function screenToWorld(x, y) {
  let wx = (x - state.camera.offsetX) / state.camera.scale;
  let wy = (y - state.camera.offsetY) / state.camera.scale;
  if (state.board && state.mirrorMode && state.mirrorMode !== 'off') {
    const b = state.board.bounds;
    if (state.mirrorMode === 'x' || state.mirrorMode === 'xy') wx = b.x_min + b.x_max - wx;
    if (state.mirrorMode === 'y' || state.mirrorMode === 'xy') wy = b.y_min + b.y_max - wy;
  }
  return { x: wx, y: wy };
}

function getViewportWorldBounds(padPx = 80) {
  const pad = padPx / Math.max(state.camera.scale, 0.0001);
  const a = screenToWorld(-padPx, -padPx);
  const b = screenToWorld(canvas.clientWidth + padPx, canvas.clientHeight + padPx);
  return {
    x_min: Math.min(a.x, b.x) - pad,
    x_max: Math.max(a.x, b.x) + pad,
    y_min: Math.min(a.y, b.y) - pad,
    y_max: Math.max(a.y, b.y) + pad,
  };
}

function pointInWorldBounds(x, y, bounds) {
  return x >= bounds.x_min && x <= bounds.x_max && y >= bounds.y_min && y <= bounds.y_max;
}

function rectIntersectsWorldBounds(rect, bounds) {
  return !(rect.x_max < bounds.x_min || rect.x_min > bounds.x_max || rect.y_max < bounds.y_min || rect.y_min > bounds.y_max);
}

function screenDistanceToWorld(distancePx) {
  return distancePx / Math.max(state.camera.scale, 0.0001);
}

function getPartBox(part) {
  return state.indexes.partBoxes.get(part.index) || null;
}

function updatePerfBadge() {
  if (!perfEl) return;
  const detailZoom = getDetailZoom();
  const mode = detailZoom < 1.2 ? 'Perf: aggressive' : detailZoom < 2.5 ? 'Perf: balanced' : 'Perf: detail';
  perfEl.textContent = `${mode} · ${state.renderLoop.lastDurationMs.toFixed(1)} ms · Zoom ×${detailZoom.toFixed(2)}`;
}

function showTooltip(html, clientX, clientY) {
  tooltipEl.innerHTML = html;
  tooltipEl.hidden = false;
  const rect = document.querySelector('.viewer-area').getBoundingClientRect();
  tooltipEl.style.left = `${clientX - rect.left + 14}px`;
  tooltipEl.style.top = `${clientY - rect.top + 18}px`;
}

function hideTooltip() {
  tooltipEl.hidden = true;
}

function updateHoverTooltip(clientX, clientY) {
  if (state.hoverPin) {
    const pin = state.hoverPin;
    const part = pin.part ? state.board?.parts?.find((item) => item.index === pin.part) : null;
    const lines = [
      `<strong>${escapeHtml(pin.name || `#${pin.index}`)}</strong>`,
      `Net: ${escapeHtml(pin.net || 'No net')}`,
      `Component: ${escapeHtml(part?.name || 'Unknown')}`,
      `Pin: ${escapeHtml(pin.name || '—')}`,
      `Side: ${escapeHtml(pin.mounting_side || part?.mounting_side || 'unknown')}`,
    ];
    showTooltip(lines.join('<br>'), clientX, clientY);
    return;
  }
  if (state.hoverPart) {
    const part = state.hoverPart;
    const pinCount = (state.board?.pins || []).filter((pin) => pin.part === part.index).length;
    const note = notesGet(partNoteKey(part.name));
    const mark = markGet(part.name);
    const markLabel = mark ? { ok: '✓ OK', suspect: '⚠ Suspect', bad: '✕ Bad' }[mark] : null;
    const lines = [
      `<strong>${escapeHtml(part.name)}</strong>`,
      `Device: ${escapeHtml(part.device || part.shape || 'Unknown')}`,
      `Pins: ${pinCount} · Side: ${escapeHtml(part.mounting_side || 'unknown')}`,
    ];
    if (markLabel) lines.push(`<span style="opacity:0.85">${escapeHtml(markLabel)}</span>`);
    if (note) lines.push(`<span style="opacity:0.75;font-style:italic">${escapeHtml(note.slice(0, 80))}${note.length > 80 ? '…' : ''}</span>`);
    showTooltip(lines.join('<br>'), clientX, clientY);
    return;
  }
  hideTooltip();
}

function getMinimapLayout() {
  if (!state.board || !minimapCanvas) return null;
  const bounds = state.board.bounds;
  const pad = 10;
  const innerW = minimapCanvas.width - pad * 2;
  const innerH = minimapCanvas.height - pad * 2;
  const scale = Math.min(innerW / Math.max(bounds.width, 1), innerH / Math.max(bounds.height, 1));
  const drawW = bounds.width * scale;
  const drawH = bounds.height * scale;
  const offsetX = (minimapCanvas.width - drawW) / 2;
  const offsetY = (minimapCanvas.height - drawH) / 2;
  return { bounds, scale, offsetX, offsetY };
}

function minimapWorldToScreen(x, y, layout) {
  let mx = x, my = y;
  if (state.mirrorMode && state.mirrorMode !== 'off' && state.board?.bounds) {
    const b = state.board.bounds;
    if (state.mirrorMode === 'x' || state.mirrorMode === 'xy') mx = b.x_min + b.x_max - x;
    if (state.mirrorMode === 'y' || state.mirrorMode === 'xy') my = b.y_min + b.y_max - y;
  }
  return {
    x: layout.offsetX + (mx - layout.bounds.x_min) * layout.scale,
    y: layout.offsetY + (my - layout.bounds.y_min) * layout.scale,
  };
}

function minimapScreenToWorld(x, y, layout) {
  return {
    x: layout.bounds.x_min + (x - layout.offsetX) / layout.scale,
    y: layout.bounds.y_min + (y - layout.offsetY) / layout.scale,
  };
}

function drawMinimap() {
  if (!minimapCtx || !minimapShellEl) return;
  const hasBoard = Boolean(state.board);
  minimapShellEl.classList.toggle('is-hidden', !hasBoard);
  if (!hasBoard) return;
  const layout = getMinimapLayout();
  if (!layout) return;

  minimapCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  minimapCtx.fillStyle = state.theme === 'light' ? '#f8fbff' : '#0b1220';
  minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);

  minimapCtx.strokeStyle = state.theme === 'light' ? '#94a3b8' : '#334155';
  minimapCtx.lineWidth = 1;
  minimapCtx.strokeRect(layout.offsetX, layout.offsetY, layout.bounds.width * layout.scale, layout.bounds.height * layout.scale);

  const parts = state.board.parts || [];
  const isLight = state.theme === 'light';
  const colorTop    = isLight ? 'rgba(37, 99, 235, 0.40)'  : 'rgba(96, 165, 250, 0.50)';
  const colorBottom = isLight ? 'rgba(190, 24, 93, 0.38)'  : 'rgba(244, 114, 182, 0.50)';
  const colorBoth   = isLight ? 'rgba(71, 85, 105, 0.30)'  : 'rgba(148, 163, 184, 0.35)';
  for (const part of parts) {
    if (!isSideVisible(part.mounting_side || 'both')) continue;
    const box = getPartBox(part);
    if (!box) continue;
    const side = part.mounting_side || 'both';
    minimapCtx.fillStyle = side === 'top' ? colorTop : side === 'bottom' ? colorBottom : colorBoth;
    const p1 = minimapWorldToScreen(box.x_min, box.y_min, layout);
    const p2 = minimapWorldToScreen(box.x_max, box.y_max, layout);
    const x = Math.min(p1.x, p2.x);
    const y = Math.min(p1.y, p2.y);
    const w = Math.max(1, Math.abs(p2.x - p1.x));
    const h = Math.max(1, Math.abs(p2.y - p1.y));
    minimapCtx.fillRect(x, y, w, h);
  }

  const view = getViewportWorldBounds(0);
  const vp1 = minimapWorldToScreen(view.x_min, view.y_min, layout);
  const vp2 = minimapWorldToScreen(view.x_max, view.y_max, layout);
  minimapCtx.fillStyle = state.theme === 'light' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(56, 189, 248, 0.18)';
  minimapCtx.strokeStyle = state.theme === 'light' ? '#0284c7' : '#38bdf8';
  minimapCtx.lineWidth = 1.25;
  minimapCtx.fillRect(Math.min(vp1.x, vp2.x), Math.min(vp1.y, vp2.y), Math.abs(vp2.x - vp1.x), Math.abs(vp2.y - vp1.y));
  minimapCtx.strokeRect(Math.min(vp1.x, vp2.x), Math.min(vp1.y, vp2.y), Math.abs(vp2.x - vp1.x), Math.abs(vp2.y - vp1.y));

  if (minimapZoomEl) minimapZoomEl.textContent = `${state.visibleSide} · ×${getDetailZoom().toFixed(2)}`;
}

function recenterFromMinimapEvent(ev) {
  if (!state.board || !minimapCanvas) return;
  const rect = minimapCanvas.getBoundingClientRect();
  const layout = getMinimapLayout();
  if (!layout) return;
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;
  const world = minimapScreenToWorld(x, y, layout);
  centerOnPoint(world.x, world.y);
  render();
}

function fitBoard() {
  if (!state.board) return;
  const { bounds } = state.board;
  const vw = Math.max(1, canvas.clientWidth);
  const vh = Math.max(1, canvas.clientHeight);
  const margin = 40;
  const bw = Math.max(1e-6, bounds.width || 0);
  const bh = Math.max(1e-6, bounds.height || 0);
  const scale = Math.max(0.0005, Math.min(2000, Math.min((vw - margin * 2) / bw, (vh - margin * 2) / bh)));
  state.camera.scale = scale;
  state.camera.baseScale = scale;
  state.camera.offsetX = margin - bounds.x_min * scale + (vw - margin * 2 - bw * scale) / 2;
  state.camera.offsetY = margin - bounds.y_min * scale + (vh - margin * 2 - bh * scale) / 2;
  render();
}

function autoFitBoard() {
  if (!state.board) return;
  window.requestAnimationFrame(() => {
    fitBoard();
    window.requestAnimationFrame(() => fitBoard());
  });
}

function centerOnPoint(x, y) {
  const t = transformWorld(x, y);
  state.camera.offsetX = canvas.clientWidth / 2 - t.x * state.camera.scale;
  state.camera.offsetY = canvas.clientHeight / 2 - t.y * state.camera.scale;
}

function triggerSearchFocusPulse(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  state.searchFocusPulse = {
    x,
    y,
    startedAt: performance.now(),
    durationMs: 850,
  };
}

function zoomToBounds(bounds, options = {}) {
  if (!bounds) return;
  const xMin = bounds.x_min ?? bounds.xMin ?? 0;
  const xMax = bounds.x_max ?? bounds.xMax ?? 0;
  const yMin = bounds.y_min ?? bounds.yMin ?? 0;
  const yMax = bounds.y_max ?? bounds.yMax ?? 0;
  const width = Math.max(1, Math.abs(xMax - xMin));
  const height = Math.max(1, Math.abs(yMax - yMin));
  const centerX = (xMin + xMax) / 2;
  const centerY = (yMin + yMax) / 2;
  const padding = options.padding ?? 0.42;
  const maxScaleMultiplier = options.maxScaleMultiplier ?? 18;
  const minScaleMultiplier = options.minScaleMultiplier ?? 1.8;
  const fitScale = Math.min(
    (canvas.clientWidth * padding) / width,
    (canvas.clientHeight * padding) / height
  );
  const base = state.camera.baseScale || 1;
  state.camera.scale = Math.max(base * minScaleMultiplier, Math.min(base * maxScaleMultiplier, fitScale));
  centerOnPoint(centerX, centerY);
  triggerSearchFocusPulse(centerX, centerY);
}

function focusPartSelection(part) {
  const partBox = state.indexes.partBoxes.get(part.index);
  if (partBox) {
    zoomToBounds(partBox, { minScaleMultiplier: 2.2, maxScaleMultiplier: 22 });
    return;
  }
  if (part?.center) {
    centerOnPoint(part.center.x, part.center.y);
    triggerSearchFocusPulse(part.center.x, part.center.y);
  }
}

function focusPinSelection(pin) {
  if (!pin) return;
  const base = state.camera.baseScale || 1;
  state.camera.scale = Math.max(state.camera.scale, base * 5);
  centerOnPoint(pin.x, pin.y);
  triggerSearchFocusPulse(pin.x, pin.y);
}

function focusNetSelection(netName) {
  const pins = state.indexes.pinsByNet.get(String(netName || '').toLowerCase()) || [];
  if (!pins.length) return;
  const bounds = {
    x_min: Number.POSITIVE_INFINITY,
    x_max: Number.NEGATIVE_INFINITY,
    y_min: Number.POSITIVE_INFINITY,
    y_max: Number.NEGATIVE_INFINITY,
  };
  for (const pin of pins) {
    bounds.x_min = Math.min(bounds.x_min, pin.x);
    bounds.x_max = Math.max(bounds.x_max, pin.x);
    bounds.y_min = Math.min(bounds.y_min, pin.y);
    bounds.y_max = Math.max(bounds.y_max, pin.y);
  }
  zoomToBounds(bounds, { minScaleMultiplier: 1.3, maxScaleMultiplier: 8 });
}

function setSearchMode(mode) {
  state.searchMode = mode === 'part' || mode === 'net' ? mode : 'all';
  searchAllBtn?.classList.toggle('active', state.searchMode === 'all');
  searchPartBtn?.classList.toggle('active', state.searchMode === 'part');
  searchNetBtn?.classList.toggle('active', state.searchMode === 'net');
}

function getSearchQueryOrNotify() {
  const raw = String(searchInput?.value || '').trim();
  if (raw) return raw.toLowerCase();
  setStatus('Isi kata kunci dulu untuk mencari part atau net.', true);
  searchInput?.focus();
  return '';
}

function runActiveSearch() {
  if (state.searchMode === 'part') {
    searchPart();
    return;
  }
  if (state.searchMode === 'net') {
    searchNet();
    return;
  }
  searchAll();
}


function getNetPinCount(netName) {
  if (!state.board || !netName) return 0;
  const key = netName.toLowerCase();
  const found = (state.board.nets || []).find(n => n.name.toLowerCase() === key);
  return found ? found.pin_count : 0;
}

function getNetGlowColor(netName) {
  const n = (netName || '').toUpperCase();
  if (/^(GND|AGND|DGND|SGND|PGND|VSS|GNDA|GNDD)/.test(n)) return '#94a3b8'; // slate
  if (/^(VCC|VDD|VIN|PP|PPBUS|PPVDD|PWR|POWER|3V|5V|1V|12V|VBAT|VSYS|VCC|VBUS)/.test(n)) return '#fb923c'; // orange
  return '#5eead4'; // teal — default signal
}

const DENSE_NET_THRESHOLD = 50;

function render() {
  if (state.renderLoop.scheduled) return;
  state.renderLoop.scheduled = true;
  window.requestAnimationFrame(() => {
    state.renderLoop.scheduled = false;
    renderNow();
  });
}

function renderNow() {
  const started = performance.now();
  state.renderLoop.lastVisibleParts = 0;
  state.renderLoop.lastVisiblePins = 0;
  state.renderLoop.lastVisibleRoutes = 0;

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  ctx.clearRect(0, 0, w, h);
  drawCanvasBackground(w, h);

  if (!state.board) {
    ctx.fillStyle = state.theme === 'light' ? '#64748b' : '#9ca3af';
    ctx.font = '16px sans-serif';
    ctx.fillText('Upload a supported board file to start.', 24, 32);
    drawCanvasWatermarkOverlay(w, h);
    state.renderLoop.lastDurationMs = performance.now() - started;
    updatePerfBadge();
    drawMinimap();
    ctx.restore();
    return;
  }

  drawGrid();
  if (state.showOutline) drawOutline();
  drawRoutes();
  if (state.showParts) drawParts();
  if (state.netLinesMode !== 'off') drawConnections();
  if (state.showPins) drawPins();
  if (state.showNails) drawNails();
  drawSelectionHalo();
  drawSearchFocusPulse();
  drawDenseNetBorderGlow();
  drawMeasure();
  drawCanvasWatermarkOverlay(w, h);
  drawLegend();
  drawMinimap();
  ctx.restore();
  state.renderLoop.lastDurationMs = performance.now() - started;
  updatePerfBadge();
}


function drawDenseNetBorderGlow() {
  const netName = state.selectedNet;
  if (!netName) return;
  if (getNetPinCount(netName) < DENSE_NET_THRESHOLD) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const color = getNetGlowColor(netName);
  const thickness = 8;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness * 2;
  ctx.globalAlpha = 0.55;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.strokeRect(0, 0, w, h);
  ctx.globalAlpha = 0.25;
  ctx.shadowBlur = 0;
  ctx.lineWidth = thickness;
  ctx.strokeRect(0, 0, w, h);
  ctx.restore();
}

function drawSearchFocusPulse() {
  const pulse = state.searchFocusPulse;
  if (!pulse) return;
  const elapsed = performance.now() - pulse.startedAt;
  if (elapsed >= pulse.durationMs) {
    state.searchFocusPulse = null;
    return;
  }
  const progress = elapsed / pulse.durationMs;
  const screen = worldToScreen(pulse.x, pulse.y);
  const radius = 18 + progress * 58;
  const alpha = (1 - progress) * 0.85;
  ctx.save();
  ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(125, 211, 252, ${alpha * 0.65})`;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.arc(screen.x, screen.y, radius * 0.55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  render();
}

function drawGrid() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.save();
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);

  const majorStep = 96;
  const minorStep = 24;
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += minorStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += minorStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.strokeStyle = state.theme === 'light' ? 'rgba(15,23,42,0.09)' : 'rgba(255,255,255,0.05)';
  for (let x = 0; x < w; x += majorStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += majorStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawOutline() {
  const viewport = getViewportWorldBounds(40);
  const segments = state.board.outline_segments || [];
  if (segments.length) {
    ctx.save();
    const tvwNative = hasTvwNativeSegments();
    ctx.strokeStyle = tvwNative
      ? (state.theme === 'light' ? 'rgba(30,41,59,0.72)' : 'rgba(226,232,240,0.72)')
      : COLORS.outline;
    ctx.lineWidth = tvwNative ? Math.max(0.65, Math.min(1.25, 0.7 + getDetailZoom() * 0.1)) : 1.2;
    ctx.beginPath();
    let pending = 0;
    for (const seg of segments) {
      if (!isSideVisible(seg.side || 'both')) continue;
      const segBox = {
        x_min: Math.min(seg.x1, seg.x2),
        x_max: Math.max(seg.x1, seg.x2),
        y_min: Math.min(seg.y1, seg.y2),
        y_max: Math.max(seg.y1, seg.y2),
      };
      if (!rectIntersectsWorldBounds(segBox, viewport)) continue;
      const a = worldToScreen(seg.x1, seg.y1);
      const b = worldToScreen(seg.x2, seg.y2);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      pending += 1;
      if (pending >= 1800) {
        ctx.stroke();
        ctx.beginPath();
        pending = 0;
      }
    }
    if (pending) ctx.stroke();
    ctx.restore();
    return;
  }

  const outline = state.board.outline || [];
  if (outline.length < 2) return;
  ctx.save();
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  outline.forEach((p, idx) => {
    const s = worldToScreen(p.x, p.y);
    if (idx === 0) ctx.moveTo(s.x, s.y);
    else ctx.lineTo(s.x, s.y);
  });
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function getPartPins(part) {
  return state.indexes.pinsByPart.get(part.index) || [];
}

function partColor(part, alpha = 1) {
  const base = part.mounting_side === 'bottom' ? '244,114,182' : '96,165,250';
  return `rgba(${base},${alpha})`;
}

function getPinBaseOuterRadius(detailZoom) {
  if (detailZoom < 1.5) {
    return Math.max(1.0, detailZoom * 1.2);
  }

  if (detailZoom < 3.2) {
    return Math.max(1.8, 0.6 + detailZoom * 1.4);
  }

  return Math.max(3.0, Math.min(6.0, 1.4 + detailZoom * 1.6));
}

function getScreenBoundsForPart(part, pins, partBox, options = {}) {
  let bbox = partBox;
  if (!bbox && part.center) {
    bbox = { x_min: part.center.x - 1, x_max: part.center.x + 1, y_min: part.center.y - 1, y_max: part.center.y + 1 };
  }
  const pinSource = pins.length ? pins.map((pin) => worldToScreen(pin.x, pin.y)) : [worldToScreen(part.center?.x || 0, part.center?.y || 0)];
  const xs = pinSource.map((p) => p.x);
  const ys = pinSource.map((p) => p.y);
  let xMin = Math.min(...xs);
  let xMax = Math.max(...xs);
  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  if (bbox) {
    const a = worldToScreen(bbox.x_min, bbox.y_min);
    const b = worldToScreen(bbox.x_max, bbox.y_max);
    xMin = Math.min(xMin, a.x, b.x);
    xMax = Math.max(xMax, a.x, b.x);
    yMin = Math.min(yMin, a.y, b.y);
    yMax = Math.max(yMax, a.y, b.y);
  }
  if (isTvwComponentBoard() && pins.length) {
    const dotRadius = Math.max(
      getPinBaseOuterRadius(getDetailZoom()),
      options.active ? 3.8 : 0,
    );
    const visualPad = dotRadius + 1.5;
    xMin -= visualPad;
    xMax += visualPad;
    yMin -= visualPad;
    yMax += visualPad;
  }
  const minSpan = Math.max(7, Math.min(18, 12 * Math.max(1, state.camera.scale)));
  if (xMax - xMin < minSpan) {
    const pad = (minSpan - (xMax - xMin)) / 2;
    xMin -= pad;
    xMax += pad;
  }
  if (yMax - yMin < minSpan) {
    const pad = (minSpan - (yMax - yMin)) / 2;
    yMin -= pad;
    yMax += pad;
  }
  return { xMin, xMax, yMin, yMax, width: xMax - xMin, height: yMax - yMin };
}

function classifyPartGeometry(part, pins, bounds) {
  const name = String(part.name || '').toUpperCase();
  const count = pins.length;
  const width = bounds.width;
  const height = bounds.height;
  const aspect = width > 0 && height > 0 ? Math.max(width, height) / Math.max(1, Math.min(width, height)) : 1;
  const xs = pins.map((pin) => pin.x);
  const ys = pins.map((pin) => pin.y);
  const xSpan = xs.length ? Math.max(...xs) - Math.min(...xs) : 0;
  const ySpan = ys.length ? Math.max(...ys) - Math.min(...ys) : 0;
  if (/^(J|CN|CON|PJP|XW)/.test(name) || (count >= 4 && aspect > 3.2)) return 'connector';
  if (/^(TP|TEST|VIA)/.test(name)) return 'testpoint';
  if (/^(D)/.test(name) && count <= 3) return 'diode';
  if (/^(R|C|L|FB|F)/.test(name) && count <= 4) return 'passive';
  if (/^(Q|U?Q)/.test(name) && count >= 3 && count <= 6) return 'sot';
  if (count >= 20 && Math.abs(xSpan - ySpan) < Math.max(xSpan, ySpan) * 0.35) return 'bga';
  if (count >= 8) return 'ic';
  if (count >= 3 && count <= 6) return 'small-ic';
  return 'generic';
}

function drawPartMarker(kind, bounds, strokeStyle) {
  ctx.save();
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = strokeStyle;
  ctx.lineWidth = 1;
  if (kind === 'diode') {
    const midY = bounds.yMin + bounds.height / 2;
    ctx.beginPath();
    ctx.moveTo(bounds.xMin + 6, midY - 5);
    ctx.lineTo(bounds.xMin + 6, midY + 5);
    ctx.stroke();
  } else if (kind === 'connector') {
    ctx.beginPath();
    ctx.moveTo(bounds.xMin + 6, bounds.yMin + bounds.height / 2);
    ctx.lineTo(bounds.xMin + 14, bounds.yMin + bounds.height / 2 - 5);
    ctx.lineTo(bounds.xMin + 14, bounds.yMin + bounds.height / 2 + 5);
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(bounds.xMin + 7, bounds.yMin + 7, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}


function drawParts() {
  const zoom = state.camera.scale;
  const detailZoom = getDetailZoom();
  const tvwMode = isTvwComponentBoard();
  const tvwNativeSegments = hasTvwNativeSegments();
  const selectedNetKey = (state.selectedNet || '').toLowerCase();
  const viewport = getViewportWorldBounds(90);
  // Spatial label deconfliction: track occupied screen rectangles
  // Only show label if its bounding box doesn't overlap an already-placed label
  const labelRects = []; // [{x,y,w,h}]
  function labelFits(lx, ly, lw, lh) {
    const pad = 2;
    for (const r of labelRects) {
      if (lx - pad < r.x + r.w && lx + lw + pad > r.x &&
          ly - pad < r.y + r.h && ly + lh + pad > r.y) return false;
    }
    return true;
  }

  for (const part of state.board.parts) {
    if (!isSideVisible(part.mounting_side)) continue;
    const pins = getPartPins(part);
    const partBox = getPartBox(part);
    if (partBox && !rectIntersectsWorldBounds(partBox, viewport)) continue;
    state.renderLoop.lastVisibleParts += 1;

    const isSelectedPart = state.selectedPart && state.selectedPart.index === part.index;
    const isHoverPart = state.hoverPart && state.hoverPart.index === part.index;
    const partHasSelectedNet = selectedNetKey && (part.nets || []).some((n) => n.toLowerCase() === selectedNetKey);
    const hasMark = state.board ? Boolean(markGet(part.name)) : false;
    const faded = (state.selectedPart || state.selectedNet || state.selectedPin) && !isSelectedPart && !partHasSelectedNet && !hasMark;
    if (!partBox && !pins.length && !part.center) continue;
    const bounds = getScreenBoundsForPart(part, pins, partBox, {
      active: Boolean(isSelectedPart || isHoverPart || partHasSelectedNet),
    });
    const kind = classifyPartGeometry(part, pins, bounds);
    const mark = state.board ? markGet(part.name) : null;
    const markStyle = mark ? MARK_COLORS[mark] : null;
    const edgeColor = isSelectedPart ? COLORS.selected
      : markStyle && !faded ? markStyle.stroke
      : isHoverPart ? 'rgba(248,250,252,0.82)'
      : faded ? 'rgba(148,163,184,0.14)'
      : partColor(part, tvwMode ? 0.98 : (part.mounting_side === 'bottom' ? 0.82 : 0.9));
    const fillColor = isSelectedPart ? 'rgba(245,158,11,0.10)'
      : markStyle && !faded ? markStyle.fill
      : isHoverPart ? 'rgba(248,250,252,0.06)'
      : faded ? 'rgba(148,163,184,0.02)'
      : tvwMode
        ? (part.mounting_side === 'bottom' ? 'rgba(244,114,182,0.045)' : 'rgba(96,165,250,0.045)')
        : (part.mounting_side === 'bottom' ? 'rgba(244,114,182,0.05)' : 'rgba(96,165,250,0.05)');

    ctx.save();
    ctx.strokeStyle = edgeColor;
    ctx.fillStyle = fillColor;
    ctx.lineWidth = tvwMode
      ? (isSelectedPart ? 2.4 : isHoverPart ? 2 : Math.max(1.35, Math.min(2.1, 1.2 + detailZoom * 0.22)))
      : (isSelectedPart ? 1.8 : isHoverPart ? 1.4 : 1);

    const drawArtificialPartBody = true;
    if (detailZoom >= 0.9 && drawArtificialPartBody) {
      if (kind === 'passive') {
        const longHorizontal = bounds.width >= bounds.height;
        const padInset = Math.max(2, Math.min(7, longHorizontal ? bounds.width * 0.18 : bounds.height * 0.18));
        if (longHorizontal) {
          roundRect(ctx, bounds.xMin + padInset, bounds.yMin + 1.5, Math.max(4, bounds.width - padInset * 2), Math.max(4, bounds.height - 3), 4);
        } else {
          roundRect(ctx, bounds.xMin + 1.5, bounds.yMin + padInset, Math.max(4, bounds.width - 3), Math.max(4, bounds.height - padInset * 2), 4);
        }
      } else if (kind === 'connector') {
        roundRect(ctx, bounds.xMin + 1.5, bounds.yMin + 1.5, Math.max(5, bounds.width - 3), Math.max(5, bounds.height - 3), 4);
      } else if (kind === 'bga' || kind === 'ic' || kind === 'small-ic' || kind === 'sot' || kind === 'generic' || kind === 'diode') {
        roundRect(ctx, bounds.xMin + 1.5, bounds.yMin + 1.5, Math.max(5, bounds.width - 3), Math.max(5, bounds.height - 3), kind === 'bga' ? 8 : 4);
      }
      ctx.fill();
      ctx.stroke();

      if (tvwMode && !tvwNativeSegments && !faded) {
        const center = part.center || { x: pins[0]?.x || 0, y: pins[0]?.y || 0 };
        const c = worldToScreen(center.x, center.y);
        const dotRadius = Math.max(2.2, Math.min(4.5, 2.4 + detailZoom * 0.45));
        ctx.save();
        ctx.fillStyle = part.mounting_side === 'bottom' ? '#f9a8d4' : '#93c5fd';
        ctx.strokeStyle = state.theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(2,6,23,0.82)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(c.x, c.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      if (detailZoom >= 1.8 && (kind === 'diode' || kind === 'connector')) {
        drawPartMarker(kind, bounds, edgeColor);
      }
    }

    if (shouldShowPartLabel(part, bounds, zoom, { force: Boolean(isSelectedPart || isHoverPart || partHasSelectedNet) })) {
      const forced = isSelectedPart || isHoverPart || partHasSelectedNet;
      ctx.fillStyle = isSelectedPart ? '#fde68a' : isHoverPart ? COLORS.text : COLORS.textMuted;
      const fontSize = Math.max(9, Math.min(14, 9 + zoom * 14));
      ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
      const center = part.center || { x: pins[0]?.x || 0, y: pins[0]?.y || 0 };
      const c = worldToScreen(center.x, center.y);
      const tw = ctx.measureText(part.name).width;
      const th = fontSize;
      const lx = c.x - tw / 2;
      const ly = bounds.yMin - 4 - th;
      // Show label if forced (selected/hovered) or if space is free
      if (forced || labelFits(lx, ly, tw, th)) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        if (tvwMode) {
          ctx.save();
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = state.theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(2,6,23,0.92)';
          ctx.strokeText(part.name, c.x, bounds.yMin - 4);
          ctx.restore();
          ctx.fillStyle = isSelectedPart
            ? '#fde68a'
            : part.mounting_side === 'bottom' ? '#fbcfe8' : '#bfdbfe';
        }
        ctx.fillText(part.name, c.x, bounds.yMin - 4);
        if (!forced) labelRects.push({ x: lx, y: ly, w: tw, h: th });
      }
    }

    if (detailZoom >= 1.5 && state.board) {
      const hasMark = Boolean(mark); const hasNote = Boolean(notesGet(partNoteKey(part.name)));
      if (hasMark || hasNote) {
        ctx.save(); let dotX = bounds.xMax;
        if (hasMark) { const dr = Math.max(3, Math.min(5.5, zoom * 12)); dotX -= dr;
          ctx.beginPath(); ctx.arc(dotX, bounds.yMin + dr, dr, 0, Math.PI * 2); ctx.fillStyle = markStyle.stroke; ctx.fill(); dotX -= dr + 2; }
        if (hasNote) { const dr = Math.max(2.5, Math.min(4, zoom * 9)); dotX -= dr;
          ctx.beginPath(); ctx.arc(dotX, bounds.yMin + dr, dr, 0, Math.PI * 2); ctx.fillStyle = '#84cc16'; ctx.fill(); }
        ctx.restore();
      }
    }

    ctx.restore();
  }
}

function drawPins() {
  const selectedNetKey = (state.selectedNet || '').toLowerCase();
  const selectedPartIndex = state.selectedPart?.index || null;
  const hoverPartIndex = state.hoverPart?.index || null;
  const hoverPinIndex = state.hoverPin?.index || null;
  const tvwNative = hasTvwNativeSegments();
  // Hover net: when hovering a pin, highlight all pins on its net
  const hoverNetKey = (state.hoverPin?.net || '').toLowerCase();
  const viewport = getViewportWorldBounds(50);
  const forceVisible = Boolean(selectedNetKey || selectedPartIndex || hoverPartIndex || hoverPinIndex || state.selectedPin);
  if (!forceVisible && getDetailZoom() < 0.85) return;

  const dz = getDetailZoom();
  // Pin rendering mode: scales with zoom so pins don't dominate at overview
  // overview (<1.5x): micro dot, no ring  →  mid (1.5-3x): thin stroke ring
  // close (>3x): full filled ring with inner hole
  const pinMode = dz < 1.5 ? 'dot' : dz < 3.2 ? 'ring' : 'full';

  ctx.save();
  for (const pin of state.board.pins) {
    if (!isSideVisible(pin.side)) continue;
    if (!pointInWorldBounds(pin.x, pin.y, viewport)) continue;

    const isSelectedNet = selectedNetKey && (pin.net || '').toLowerCase() === selectedNetKey;
    const isSelectedPart = selectedPartIndex && pin.part === selectedPartIndex;
    const isHoverPart = hoverPartIndex && pin.part === hoverPartIndex;
    const isSelectedPin = state.selectedPin && state.selectedPin.index === pin.index;
    const isHoverPin = hoverPinIndex && pin.index === hoverPinIndex;
    const isHoverNet = hoverNetKey && !isHoverPin && (pin.net || '').toLowerCase() === hoverNetKey;
    const isActive = isSelectedPin || isHoverPin || isHoverNet || isSelectedNet || isSelectedPart || isHoverPart;
    const hasNote = notesGet(pinNoteKey(pin));
    state.renderLoop.lastVisiblePins += 1;

    // Base size: starts tiny at overview, grows with zoom
    let outer = dz < 1.5
      ? Math.max(1.0, dz * 1.2)                      // 1.0–1.8px at overview
      : dz < 3.2
        ? Math.max(1.8, 0.6 + dz * 1.4)               // 1.8–5.1px at mid
        : Math.max(3.0, Math.min(6.0, 1.4 + dz * 1.6)); // 3–6px at close

    // Base color — side-dependent, opacity scales with zoom
    const baseAlpha = dz < 1.5 ? 0.55 : dz < 3 ? 0.75 : 0.92;
    let ring = pin.side === 'bottom'
      ? `rgba(244,114,182,${baseAlpha})`
      : `rgba(96,165,250,${baseAlpha})`;
    let inner = 'rgba(11,18,32,0.92)';

    // Active states — override size and color
    if (isSelectedPin) {
      ring = '#fde68a'; outer = Math.max(outer, 5.2); inner = 'rgba(120,53,15,0.92)';
    } else if (isHoverPin) {
      ring = '#ffffff'; outer = Math.max(outer, 4.8);
    } else if (isHoverNet) {
      ring = '#5eead4'; outer = Math.max(outer, 4.0); inner = 'rgba(13,30,30,0.88)';
    } else if (isSelectedNet) {
      const _dense = getNetPinCount(state.selectedNet) >= DENSE_NET_THRESHOLD;
      ring = _dense ? getNetGlowColor(state.selectedNet) : COLORS.net;
      outer = _dense ? Math.max(outer * 0.75, 1.8) : Math.max(outer, 4.2);
    } else if (isSelectedPart || isHoverPart) {
      ring = COLORS.selected; outer = Math.max(outer, 3.8);
    } else if (state.selectedNet || state.selectedPart || state.selectedPin) {
      // Fade inactive pins when something is selected
      const fadeAlpha = dz < 1.5 ? 0.18 : 0.22;
      ring = `rgba(255,255,255,${fadeAlpha})`;
      inner = 'rgba(11,18,32,0.6)';
      outer = Math.max(1.0, outer * 0.65);
    }

    const s = worldToScreen(pin.x, pin.y);
    if (tvwNative && !isActive && hasNote) {
      const noteDot = Math.max(2.2, Math.min(4.5, outer * 0.75));
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(s.x, s.y, noteDot, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    const effectiveMode = isActive ? 'full' : pinMode;

    if (effectiveMode === 'dot') {
      // Tiny filled dot — minimal visual weight
      ctx.fillStyle = ring;
      ctx.beginPath();
      ctx.arc(s.x, s.y, outer, 0, Math.PI * 2);
      ctx.fill();

    } else if (effectiveMode === 'ring') {
      // Stroke-only ring — shows pad location without heavy fill
      ctx.strokeStyle = ring;
      ctx.lineWidth = Math.max(0.8, outer * 0.38);
      ctx.beginPath();
      ctx.arc(s.x, s.y, Math.max(1.0, outer * 0.72), 0, Math.PI * 2);
      ctx.stroke();

    } else {
      // Full detail: filled ring + dark inner hole
      ctx.fillStyle = ring;
      ctx.beginPath();
      ctx.arc(s.x, s.y, outer, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = inner;
      ctx.beginPath();
      ctx.arc(s.x, s.y, Math.max(0.6, outer * 0.42), 0, Math.PI * 2);
      ctx.fill();
    }

    if (hasNote && dz >= 1.2) {
      const noteDot = Math.max(2, Math.min(4, outer * 0.55));
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(s.x + outer + noteDot, s.y - outer - noteDot, noteDot, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawNails() {
  const viewport = getViewportWorldBounds(50);
  ctx.save();
  for (const nail of state.board.nails || []) {
    if (!isSideVisible(nail.side)) continue;
    if (!pointInWorldBounds(nail.x, nail.y, viewport)) continue;
    const selectedNet = state.selectedNet && nail.net && nail.net.toLowerCase() === state.selectedNet.toLowerCase();
    const s = worldToScreen(nail.x, nail.y);
    ctx.strokeStyle = selectedNet ? '#86efac' : 'rgba(255,255,255,0.18)';
    ctx.lineWidth = selectedNet ? 1.5 : 1;
    ctx.strokeRect(s.x - 2.5, s.y - 2.5, 5, 5);
  }
  ctx.restore();
}

function getActiveNetKeys() {
  const keys = new Set();
  if (state.selectedNet) keys.add(state.selectedNet.toLowerCase());
  if (!state.selectedNet && state.selectedPin?.net) keys.add(state.selectedPin.net.toLowerCase());
  const netSourcePart = state.selectedPart || state.hoverPart;
  if (!state.selectedNet && netSourcePart) {
    (netSourcePart.nets || []).slice(0, 12).forEach((n) => keys.add(n.toLowerCase()));
  }
  return keys;
}

function getConnectionPointsForSelectedNet() {
  const key = (state.selectedNet || state.selectedPin?.net || '').toLowerCase();
  if (!key) return [];
  const pins = (state.indexes.pinsByNet.get(key) || [])
    .filter((pin) => isSideVisible(pin.side))
    .map((pin) => ({ x: pin.x, y: pin.y, kind: 'pin', ref: pin }));
  const nails = (state.indexes.nailsByNet.get(key) || [])
    .filter((nail) => isSideVisible(nail.side))
    .map((nail) => ({ x: nail.x, y: nail.y, kind: 'nail', ref: nail }));
  return [...pins, ...nails];
}

function getTraceAnchorPoint(points) {
  const key = (state.selectedNet || state.selectedPin?.net || '').toLowerCase();
  const pin = state.selectedPin && (state.selectedPin.net || '').toLowerCase() === key ? state.selectedPin
    : state.hoverPin && (state.hoverPin.net || '').toLowerCase() === key ? state.hoverPin
    : null;
  if (pin) return { x: pin.x, y: pin.y, kind: 'pin', ref: pin };

  const bounds = getViewportWorldBounds(0);
  const center = {
    x: (bounds.x_min + bounds.x_max) / 2,
    y: (bounds.y_min + bounds.y_max) / 2,
  };
  let best = null;
  let bestDist = Infinity;
  for (const point of points) {
    const d = distanceSq(point, center);
    if (d < bestDist) {
      bestDist = d;
      best = point;
    }
  }
  return best;
}

function getTracePointsForSelectedNet() {
  const allPoints = getConnectionPointsForSelectedNet();
  if (!allPoints.length) return [];

  const anchor = getTraceAnchorPoint(allPoints);
  if (!anchor) return [];

  const detailZoom = getDetailZoom();
  const maxNeighbors = detailZoom < 1.2 ? 18 : detailZoom < 2 ? 32 : detailZoom < 3.5 ? 56 : 96;
  const sorted = allPoints
    .filter((point) => point !== anchor && distanceSq(point, anchor) > 0)
    .sort((a, b) => distanceSq(a, anchor) - distanceSq(b, anchor))
    .slice(0, maxNeighbors);

  return [anchor, ...sorted];
}

function getConnectionPointsForSelectedPart() {
  if (!state.selectedPart) return [];
  const partPins = getPartPins(state.selectedPart);
  const points = [];
  const seen = new Set();

  for (const pin of partPins) {
    if (!pin.net) continue;
    const key = pin.net.toLowerCase();
    const netPins = (state.indexes.pinsByNet.get(key) || []).filter((p) => isSideVisible(p.side));
    const sorted = [...netPins]
      .sort((a, b) => distanceSq(a, pin) - distanceSq(b, pin))
      .slice(0, 14);
    for (const match of sorted) {
      const tag = `${match.index}`;
      if (seen.has(tag)) continue;
      seen.add(tag);
      points.push({ x: match.x, y: match.y, kind: 'pin', ref: match });
    }
  }

  return points;
}

function distanceSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function buildApproxMST(points, maxPoints = 220) {
  if (points.length > maxPoints) return null;
  if (points.length < 2) return [];

  const remaining = points.map((p, idx) => ({ ...p, __i: idx }));
  const visited = new Set([0]);
  const edges = [];

  while (visited.size < remaining.length) {
    let bestFrom = -1;
    let bestTo = -1;
    let bestDist = Infinity;

    for (const i of visited) {
      const a = remaining[i];
      for (let j = 0; j < remaining.length; j += 1) {
        if (visited.has(j)) continue;
        const b = remaining[j];
        const d = distanceSq(a, b);
        if (d < bestDist) {
          bestDist = d;
          bestFrom = i;
          bestTo = j;
        }
      }
    }

    if (bestTo === -1) break;
    visited.add(bestTo);
    edges.push([remaining[bestFrom], remaining[bestTo]]);
  }

  return edges;
}

function drawConnections() {
  let points = [];
  let mode = null;

  if ((state.selectedNet || state.selectedPin?.net) && state.netLinesMode !== 'off') {
    points = state.netLinesMode === 'trace' ? getTracePointsForSelectedNet() : getConnectionPointsForSelectedNet();
    mode = 'net';
  } else if (state.selectedPart && !hasTvwNativeSegments() && state.netLinesMode !== 'off') {
    points = getConnectionPointsForSelectedPart();
    mode = 'part';
  }

  if (!points.length) return;

  const cacheKey = `${mode}:${state.netLinesMode}:${state.selectedNet || state.selectedPin?.net || state.selectedPart?.index || 'none'}:${state.selectedPin?.index || 'none'}:${state.visibleSide}`;
  let edges = state.indexes.connectionCache.get(cacheKey);
  if (!edges) {
    const maxPoints = mode === 'net' ? (state.netLinesMode === 'trace' ? 120 : 180) : 120;
    edges = buildApproxMST(points, maxPoints);
    state.indexes.connectionCache.set(cacheKey, edges);
  }

  ctx.save();
  ctx.strokeStyle = mode === 'net' ? 'rgba(34,197,94,0.55)' : 'rgba(245,158,11,0.45)';
  ctx.lineWidth = 1.2;

  if (edges === null) {
    const anchor = getTraceAnchorPoint(points) || points[0];
    const sample = points
      .filter((point) => point !== anchor)
      .sort((a, b) => distanceSq(a, anchor) - distanceSq(b, anchor))
      .slice(0, 96);
    const sa = worldToScreen(anchor.x, anchor.y);
    for (const point of sample) {
      const s = worldToScreen(point.x, point.y);
      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }
  } else {
    for (const [a, b] of edges) {
      const sa = worldToScreen(a.x, a.y);
      const sb = worldToScreen(b.x, b.y);
      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(sb.x, sb.y);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawRoutes() {
  if (!state.board || state.routesMode === 'off') return;

  const activeNetKeys = getActiveNetKeys();
  const drawAll = state.routesMode === 'all';
  const viewport = getViewportWorldBounds(100);
  const lowZoom = getDetailZoom() < 0.9;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (drawAll) {
    const routeLimit = lowZoom ? 4200 : 14000;
    const arcLimit = lowZoom ? 700 : 2600;
    let drawnRoutes = 0;
    let drawnArcs = 0;
    for (const route of (state.board.routes || [])) {
      if (drawnRoutes >= routeLimit) break;
      if (!isSideVisible(route.side || 'both')) continue;
      const box = {
        x_min: Math.min(route.x1, route.x2),
        x_max: Math.max(route.x1, route.x2),
        y_min: Math.min(route.y1, route.y2),
        y_max: Math.max(route.y1, route.y2),
      };
      if (!rectIntersectsWorldBounds(box, viewport)) continue;
      drawRouteLine(route, lowZoom ? 1 : 1.05, false, lowZoom);
      drawnRoutes += 1;
    }
    for (const arc of (state.board.arcs || [])) {
      if (drawnArcs >= arcLimit) break;
      if (!isSideVisible(arc.side || 'both')) continue;
      const box = {
        x_min: Math.min(arc.x1, arc.x2, arc.cx),
        x_max: Math.max(arc.x1, arc.x2, arc.cx),
        y_min: Math.min(arc.y1, arc.y2, arc.cy),
        y_max: Math.max(arc.y1, arc.y2, arc.cy),
      };
      if (!rectIntersectsWorldBounds(box, viewport)) continue;
      drawRouteArc(arc, lowZoom ? 1 : 1.05, false, lowZoom);
      drawnArcs += 1;
    }
    state.renderLoop.lastVisibleRoutes += drawnRoutes + drawnArcs;
    ctx.restore();
    return;
  }

  if (!activeNetKeys.size) {
    ctx.restore();
    return;
  }

  for (const key of activeNetKeys) {
    const routes = state.indexes.routesByNet.get(key) || [];
    const arcs = state.indexes.arcsByNet.get(key) || [];
    for (const route of routes) {
      if (!isSideVisible(route.side || 'both')) continue;
      const box = {
        x_min: Math.min(route.x1, route.x2),
        x_max: Math.max(route.x1, route.x2),
        y_min: Math.min(route.y1, route.y2),
        y_max: Math.max(route.y1, route.y2),
      };
      if (!rectIntersectsWorldBounds(box, viewport)) continue;
      drawRouteLine(route, 1.2, true, lowZoom);
      state.renderLoop.lastVisibleRoutes += 1;
    }
    for (const arc of arcs) {
      if (!isSideVisible(arc.side || 'both')) continue;
      const box = {
        x_min: Math.min(arc.x1, arc.x2, arc.cx),
        x_max: Math.max(arc.x1, arc.x2, arc.cx),
        y_min: Math.min(arc.y1, arc.y2, arc.cy),
        y_max: Math.max(arc.y1, arc.y2, arc.cy),
      };
      if (!rectIntersectsWorldBounds(box, viewport)) continue;
      drawRouteArc(arc, 1.2, true, lowZoom);
      state.renderLoop.lastVisibleRoutes += 1;
    }
  }

  ctx.restore();
}

function routeStrokeStyle(item, isActive = false, lowZoom = false) {
  if (isActive) return state.selectedNet ? 'rgba(34,197,94,0.58)' : 'rgba(245,158,11,0.5)';
  if ((item.side || 'both') === 'bottom') return lowZoom ? 'rgba(244,114,182,0.14)' : 'rgba(244,114,182,0.24)';
  if ((item.side || 'both') === 'top') return lowZoom ? 'rgba(96,165,250,0.14)' : 'rgba(96,165,250,0.24)';
  return lowZoom ? 'rgba(203,213,225,0.12)' : 'rgba(203,213,225,0.2)';
}

function drawRouteLine(route, fallbackWidth = 1, isActive = false, lowZoom = false) {
  const a = worldToScreen(route.x1, route.y1);
  const b = worldToScreen(route.x2, route.y2);
  const width = route.width ? Math.max(1, Math.min(5, route.width * state.camera.scale * 0.015)) : fallbackWidth;
  ctx.strokeStyle = routeStrokeStyle(route, isActive, lowZoom);
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function drawRouteArc(arc, fallbackWidth = 1, isActive = false, lowZoom = false) {
  const c = worldToScreen(arc.cx, arc.cy);
  const a = worldToScreen(arc.x1, arc.y1);
  const b = worldToScreen(arc.x2, arc.y2);
  const radius = Math.hypot(a.x - c.x, a.y - c.y);
  if (!isFinite(radius) || radius < 0.2) return;
  const angleStart = Math.atan2(a.y - c.y, a.x - c.x);
  const angleEnd = Math.atan2(b.y - c.y, b.x - c.x);
  const angleMid = normalizedAngleBetween(angleStart, angleEnd);
  const midPoint = {
    x: c.x + radius * Math.cos(angleMid),
    y: c.y + radius * Math.sin(angleMid),
  };
  const chordMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const anticlockwise = Math.hypot(midPoint.x - chordMid.x, midPoint.y - chordMid.y) > radius * 0.5;
  const width = arc.width ? Math.max(1, Math.min(5, arc.width * state.camera.scale * 0.015)) : fallbackWidth;
  ctx.strokeStyle = routeStrokeStyle(arc, isActive, lowZoom);
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(c.x, c.y, radius, angleStart, angleEnd, anticlockwise);
  ctx.stroke();
}

function normalizedAngleBetween(a1, a2) {
  let diff = a2 - a1;
  while (diff <= -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;
  return a1 + diff / 2;
}

function drawSelectionHalo() {
  if (state.selectedPin) {
    const s = worldToScreen(state.selectedPin.x, state.selectedPin.y);
    ctx.save();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // halo removed — redundant with outline highlight on the part body
}


function drawMeasure() {
  const m = state.measure;
  if (!m.active && !m.pointA) return;
  const T = COLORS;
  const accentColor = '#f59e0b';
  const textColor   = T.text;
  const bgColor     = T.legendBg;
  ctx.save();
  function drawCrosshair(wp) {
    const s = worldToScreen(wp.x, wp.y);
    const r = 7;
    ctx.strokeStyle = accentColor; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(s.x - r, s.y); ctx.lineTo(s.x + r, s.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s.x, s.y - r); ctx.lineTo(s.x, s.y + r); ctx.stroke();
    ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI * 2); ctx.stroke();
  }
  if (m.pointA) drawCrosshair(m.pointA);
  const endpoint = m.pointB || m.cursorWorld;
  if (m.pointA && endpoint) {
    const sa = worldToScreen(m.pointA.x, m.pointA.y);
    const sb = worldToScreen(endpoint.x, endpoint.y);
    ctx.setLineDash([5, 4]); ctx.strokeStyle = accentColor; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sb.x, sb.y); ctx.stroke();
    ctx.setLineDash([]);
    if (m.pointB) drawCrosshair(m.pointB);
    const dx = (m.pointB || endpoint).x - m.pointA.x;
    const dy = (m.pointB || endpoint).y - m.pointA.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const _units = (state.board?.meta?.units || 'native').toUpperCase();
    let mmPerUnit = 0.0254;
    const _um = _units.match(/USER\s+(\d+)/);
    if (_um) { const upi = parseFloat(_um[1]); if (upi > 0) mmPerUnit = 25.4 / upi; }
    else if (_units.includes('METRIC')) { mmPerUnit = 0.001; }
    else if (_units.includes('MM') || _units.includes('MILLIMETER')) { mmPerUnit = 1.0; }
    const distMm  = dist * mmPerUnit;
    const distMil = distMm / 0.0254;
    const label = m.pointB
      ? `${distMm.toFixed(2)} mm  /  ${Math.round(distMil)} mil`
      : `${distMm.toFixed(2)} mm  /  ${Math.round(distMil)} mil  (click to set)`;
    const mx = (sa.x + sb.x) / 2, my = (sa.y + sb.y) / 2;
    ctx.font = '13px Inter, Arial, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const tw = ctx.measureText(label).width, pad = 8, bw = tw + pad * 2, bh = 26;
    let lx = mx + 10, ly = my - bh / 2;
    if (lx + bw > canvas.clientWidth - 8) lx = mx - bw - 10;
    if (ly < 4) ly = 4;
    roundRect(ctx, lx, ly, bw, bh, 6);
    ctx.fillStyle = bgColor; ctx.fill();
    ctx.strokeStyle = accentColor; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = textColor; ctx.fillText(label, lx + pad, ly + bh / 2);
  }
  if (m.active) {
    const statusText = m.pointA ? 'Measure: click point B  ·  Esc = cancel' : 'Measure: click point A  ·  Esc = cancel';
    ctx.font = '12px Inter, Arial, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const sw = ctx.measureText(statusText).width, px = 10, py = 8, sh = 24;
    const sx = canvas.clientWidth - sw - px * 2 - 8;
    roundRect(ctx, sx, py, sw + px * 2, sh, 6);
    ctx.fillStyle = bgColor; ctx.fill();
    ctx.strokeStyle = accentColor; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = accentColor; ctx.fillText(statusText, sx + px, py + sh / 2);
  }
  ctx.restore();
}

function toggleMeasure() {
  const m = state.measure;
  const btn = document.getElementById('measure-btn');
  if (m.active) {
    m.active = false; m.pointA = null; m.pointB = null; m.cursorWorld = null;
    canvas.style.cursor = ''; btn?.classList.remove('active');
  } else {
    m.active = true; m.pointA = null; m.pointB = null; m.cursorWorld = null;
    canvas.style.cursor = 'crosshair'; btn?.classList.add('active');
  }
  render();
}

function drawLegend() {
  const items = [
    { label: 'Top copper', color: COLORS.top },
    { label: 'Bottom copper', color: COLORS.bottom },
    { label: 'Pad / via', color: '#d1d5db' },
    { label: 'Net', color: COLORS.net },
    { label: 'Selected', color: COLORS.selected },
  ];
  ctx.save();
  ctx.font = '12px Inter, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const paddingX = 12;
  const rowH = 22;
  let contentW = 0;
  for (const item of items) contentW += 18 + ctx.measureText(item.label).width + 20;
  const boxW = Math.min(canvas.clientWidth - 16, contentW + paddingX * 2);
  const boxH = rowH + 8;
  const x0 = 12;
  const y0 = canvas.clientHeight - boxH - 10;
  roundRect(ctx, x0, y0, boxW, boxH, 10);
  ctx.fillStyle = COLORS.legendBg;
  ctx.fill();
  ctx.strokeStyle = COLORS.legendBorder;
  ctx.lineWidth = 1;
  ctx.stroke();
  let x = x0 + paddingX;
  const y = y0 + boxH / 2;
  for (const item of items) {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(x + 5, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.textMuted;
    ctx.fillText(item.label, x + 14, y);
    x += 18 + ctx.measureText(item.label).width + 20;
    if (x > x0 + boxW - 40) break;
  }
  ctx.restore();
}

function roundRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function populateNetList() {
  netListEl.innerHTML = '';
  if (!state.board) return;
  const query = netFilterInput.value.trim().toLowerCase();
  const nets = state.board.nets
    .filter((net) => !query || net.name.toLowerCase().includes(query))
    .slice(0, 250);

  for (const net of nets) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'list-item';
    item.dataset.net = net.name;
    item.innerHTML = `${escapeHtml(net.name)} <small>${net.pin_count} pins${net.route_count ? ` · ${net.route_count} routes` : ''}</small>`;
    item.addEventListener('mouseenter', () => {
      state.hoverNet = net.name;
      render();
    });
    item.addEventListener('mouseleave', () => {
      state.hoverNet = null;
      render();
    });
    item.addEventListener('click', () => selectNet(net.name));
    netListEl.appendChild(item);
  }
}

function filteredParts() {
  if (!state.board) return [];
  const q = partFilterInput.value.trim().toLowerCase();
  return state.board.parts.filter((part) => {
    if (state.partListSide !== 'all' && part.mounting_side !== state.partListSide) return false;
    if (!q) return true;
    return part.name.toLowerCase().includes(q)
      || (part.device || '').toLowerCase().includes(q)
      || (part.shape || '').toLowerCase().includes(q);
  });
}

function populatePartList() {
  partListEl.innerHTML = '';
  const parts = filteredParts();
  const shown = Math.min(parts.length, LIST_LIMITS.componentsInitial);
  partCountEl.textContent = shown < parts.length ? `${shown} / ${parts.length}` : String(parts.length);

  appendPagedButtons(partListEl, parts, (part) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `list-item ${part.mounting_side === 'bottom' ? 'part-bottom' : 'part-top'}`;
    const netPreview = (part.nets || []).slice(0, 2).join(', ');
    btn.innerHTML = `${escapeHtml(part.name)} <small>${escapeHtml(part.mounting_side)}${part.device ? ` · ${escapeHtml(part.device)}` : ''}${netPreview ? ` · ${escapeHtml(netPreview)}` : ''}</small>`;
    if (parts.length <= LIST_LIMITS.componentsInitial) {
      btn.addEventListener('mouseenter', () => {
        state.hoverPart = part;
        btn.classList.add('preview');
        render();
      });
      btn.addEventListener('mouseleave', () => {
        state.hoverPart = null;
        btn.classList.remove('preview');
        render();
      });
    }
    btn.addEventListener('click', () => selectPart(part));
    return btn;
  }, LIST_LIMITS.componentsInitial, LIST_LIMITS.componentsStep, 'No components match the current filter.');
}

function populateMatches(items) {
  matchListEl.innerHTML = '';
  matchCountEl.textContent = String(items.length);
  for (const item of items.slice(0, 200)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'list-item';
    if (item.kind === 'part') {
      btn.innerHTML = `${escapeHtml(item.part.name)} <small>${item.part.mounting_side} · ${(item.part.nets || []).slice(0, 3).join(', ') || 'no nets'}</small>`;
      btn.addEventListener('click', () => {
        setSearchMode('part');
        selectPart(item.part);
        focusPartSelection(item.part);
        render();
        onViewChanged();
      });
    } else {
      btn.innerHTML = `${escapeHtml(item.net.name)} <small>${item.net.pin_count} pins${item.net.route_count ? ` · ${item.net.route_count} routes` : ''}</small>`;
      btn.addEventListener('click', () => {
        setSearchMode('net');
        selectNet(item.net.name);
        focusNetSelection(item.net.name);
        render();
        onViewChanged();
      });
    }
    matchListEl.appendChild(btn);
  }
}

function showPartResult(part, pin = null) {
  const partPins = getPartPins(part);
  const nets = (part.nets || []).slice(0, 20);
  resultsEl.innerHTML = `
    <div class="row"><strong>Part:</strong> ${escapeHtml(part.name)}</div>
    <div class="row"><strong>Side:</strong> ${escapeHtml(part.mounting_side)}</div>
    <div class="row"><strong>Type:</strong> ${escapeHtml(part.part_type || 'unknown')}</div>
    ${part.shape ? `<div class="row"><strong>Shape:</strong> ${escapeHtml(part.shape)}</div>` : ''}
    ${part.device ? `<div class="row"><strong>Device:</strong> ${escapeHtml(part.device)}</div>` : ''}
    ${Number.isFinite(part.rotation) ? `<div class="row"><strong>Rotation:</strong> ${part.rotation}&deg;</div>` : ''}
    <div class="row"><strong>Pins:</strong> ${partPins.length}</div>
    ${pin ? `<div class="row"><strong>Selected pin:</strong> ${escapeHtml(pin.name || `#${pin.index}`)}${pin.net ? ` · ${escapeHtml(pin.net)}` : ''}</div>` : ''}
    <div class="row"><strong>Nets:</strong></div>
    <div class="chips">${nets.map((net) => `<button type="button" class="chip chip-button" data-net="${escapeAttr(net)}">${escapeHtml(net)}</button>`).join('') || '<span class="muted">—</span>'}</div>
  `;
  notesRenderMarkBadge(part.name);
  notesRenderBlock({
    key: partNoteKey(part.name),
    label: `Notes: ${part.name}`,
    placeholder: 'Catatan untuk komponen ini...'
  });
}

function showNetResult(name, pins) {
  const netKey = name.toLowerCase();
  const netMeta = state.board.nets.find((n) => n.name.toLowerCase() === netKey);
  const uniqueParts = [...new Set(pins.map((p) => state.board.parts[p.part - 1]?.name).filter(Boolean))].slice(0, 24);
  resultsEl.innerHTML = `
    <div class="row"><strong>Net:</strong> ${escapeHtml(name)}</div>
    <div class="row"><strong>Pins:</strong> ${pins.length}</div>
    ${netMeta ? `<div class="row"><strong>Routes:</strong> ${netMeta.route_count || 0} · <strong>Vias:</strong> ${netMeta.via_count || 0}</div>` : ''}
    <div class="row"><strong>Parts:</strong></div>
    <div class="chips">${uniqueParts.map((partName) => `<button type="button" class="chip chip-button" data-part="${escapeAttr(partName)}">${escapeHtml(partName)}</button>`).join('') || '<span class="muted">—</span>'}</div>
  `;
}

function showPinResult(pin) {
  const part = state.board.parts[pin.part - 1] || null;
  resultsEl.innerHTML = `
    <div class="row"><strong>Pin:</strong> ${escapeHtml(pin.name || `#${pin.index}`)}</div>
    <div class="row"><strong>Pin index:</strong> ${pin.index}</div>
    <div class="row"><strong>Probe:</strong> ${escapeHtml(pin.probe)}</div>
    <div class="row"><strong>Part:</strong> ${part ? escapeHtml(part.name) : '—'}</div>
    <div class="row"><strong>Side:</strong> ${escapeHtml(pin.side || 'unknown')}</div>
    <div class="row"><strong>Net:</strong> ${pin.net ? `<button type="button" class="chip chip-button" data-net="${escapeAttr(pin.net)}">${escapeHtml(pin.net)}</button>` : '—'}</div>
    <div class="row"><strong>Position:</strong> ${Number(pin.x).toFixed(2)}, ${Number(pin.y).toFixed(2)}</div>
  `;
  if (part) {
    notesRenderMarkBadge(part.name);
    notesRenderBlock({
      key: pinNoteKey(pin),
      label: `Notes: ${part.name} pin ${pin.name || `#${pin.index}`}`,
      placeholder: 'Catatan untuk pin ini...'
    });
  }
}

function selectPart(part) {
  switchSidebarTab('inspector');
  state.selectedPart = part;
  state.selectedPin = null;
  state.selectedNet = null;
  clearSelectedNetMembers();
  showPartResult(part);
  setStatus(`Part selected: ${part.name}`);
  render();
  onViewChanged();
}

function selectPin(pin) {
  switchSidebarTab('inspector');
  state.selectedPin = pin;
  state.selectedPart = state.board.parts[pin.part - 1] || null;
  state.selectedNet = pin.net || null;
  if (state.selectedNet) populateSelectedNetMembers(state.selectedNet); else clearSelectedNetMembers();
  showPinResult(pin);
  setStatus(`Pin selected: ${pin.name || `#${pin.index}`}${pin.net ? ` · ${pin.net}` : ''}`);
  render();
  onViewChanged();
}

function selectNet(netName) {
  switchSidebarTab('nets');
  document.getElementById('sb-net-detail')?.classList.remove('is-hidden');
  state.selectedNet = netName;
  state.selectedPart = null;
  state.selectedPin = null;
  const pins = state.indexes.pinsByNet.get(netName.toLowerCase()) || [];
  populateSelectedNetMembers(netName);
  showNetResult(netName, pins);
  setStatus(`Net selected: ${netName}`);
  render();
  onViewChanged();
}

function clearSelection() {
  document.getElementById('sb-net-detail')?.classList.add('is-hidden');
  state.selectedPart = null;
  state.selectedNet = null;
  state.selectedPin = null;
  state.hoverPart = null;
  state.hoverPin = null;
  state.hoverNet = null;
  resultsEl.textContent = 'Nothing selected.';
  clearSelectedNetMembers();
  matchListEl.innerHTML = '';
  matchCountEl.textContent = '0';
  setStatus(state.board ? `Loaded: ${state.board.filename}` : 'Waiting for a file…');
  render();
}


// ── Part notes ────────────────────────────────────────────────────────────────
const sessionAnnotationFallback = {};
const sessionAnnotationCache = {};

function sessionAnnotationKey(kind) {
  const sessionKey = getTeknisiHubSessionId() || state.boardId || state.board?.filename || 'manual';
  const safeKey = String(sessionKey).toLowerCase().replace(/[^a-z0-9._-]/g, '_');
  return `bvt-session-${kind}-${safeKey}`;
}

function sessionAnnotationLoad(kind) {
  const key = sessionAnnotationKey(kind);
  if (sessionAnnotationCache[key]) return sessionAnnotationCache[key];
  try {
    const raw = sessionStorage.getItem(key);
    sessionAnnotationCache[key] = raw ? JSON.parse(raw) : {};
    return sessionAnnotationCache[key];
  } catch (_) {
    sessionAnnotationCache[key] = { ...(sessionAnnotationFallback[key] || {}) };
    return sessionAnnotationCache[key];
  }
}

function sessionAnnotationSave(kind, data) {
  const key = sessionAnnotationKey(kind);
  sessionAnnotationCache[key] = { ...data };
  sessionAnnotationFallback[key] = { ...data };
  try {
    if (Object.keys(data).length) sessionStorage.setItem(key, JSON.stringify(data));
    else sessionStorage.removeItem(key);
  } catch (_) {}
}

function partNoteKey(partName) {
  return `part:${String(partName || '').trim()}`;
}

function pinNoteKey(pin) {
  return `pin:${pin?.index || ''}`;
}

function notesGet(noteKey) {
  const notes = sessionAnnotationLoad('notes');
  if (notes[noteKey]) return notes[noteKey];
  if (String(noteKey || '').startsWith('part:')) {
    const legacyPartName = String(noteKey).slice(5);
    return notes[legacyPartName] || '';
  }
  return '';
}

function notesSet(noteKey, text) {
  const n = sessionAnnotationLoad('notes');
  if (text.trim()) n[noteKey] = text; else delete n[noteKey];
  sessionAnnotationSave('notes', n);
}

function stopNoteEditorEventPropagation(element) {
  for (const eventName of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick', 'touchstart']) {
    element.addEventListener(eventName, (event) => event.stopPropagation());
  }
}

// ── Component marking ─────────────────────────────────────────────────────────
const MARK_COLORS = {
  ok:      { stroke: '#4ade80', fill: 'rgba(74,222,128,0.10)',  label: '✓ OK' },
  suspect: { stroke: '#fbbf24', fill: 'rgba(251,191,36,0.10)',  label: '⚠ Suspect' },
  bad:     { stroke: '#f87171', fill: 'rgba(248,113,113,0.12)', label: '✕ Bad' },
};
function marksLoad() { return sessionAnnotationLoad('marks'); }
function marksSave(m) { sessionAnnotationSave('marks', m); }
function markGet(partName) { return marksLoad()[partName] || null; }
function markSet(partName, status) {
  const m = marksLoad();
  if (status) m[partName] = status; else delete m[partName];
  marksSave(m);
}

let _ctxMenu = null;
function closeContextMenu() { if (_ctxMenu) { _ctxMenu.remove(); _ctxMenu = null; } }
function showContextMenu(part, screenX, screenY, pin = null) {
  closeContextMenu();
  const menu = document.createElement('div');
  menu.className = 'ctx-menu'; _ctxMenu = menu;
  const current = markGet(part.name);
  const header = document.createElement('div');
  header.className = 'ctx-header';
  header.textContent = pin ? `${part.name} pin ${pin.name || `#${pin.index}`}` : part.name;
  menu.appendChild(header);

  // Mark section
  const markSectionLabel = document.createElement('div');
  markSectionLabel.className = 'ctx-section-label';
  markSectionLabel.textContent = 'Status';
  menu.appendChild(markSectionLabel);
  for (const item of [
    { status: 'ok',      icon: '✓', label: 'OK',           cls: 'ctx-ok' },
    { status: 'suspect', icon: '⚠', label: 'Suspect',      cls: 'ctx-suspect' },
    { status: 'bad',     icon: '✕', label: 'Bad / faulty', cls: 'ctx-bad' },
    { status: null,      icon: '○', label: 'Clear mark',   cls: 'ctx-clear' },
  ]) {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'ctx-item ' + item.cls;
    if (item.status === current) btn.classList.add('ctx-active');
    btn.innerHTML = `<span class="ctx-icon">${item.icon}</span><span>${item.label}</span>`;
    btn.addEventListener('click', () => {
      markSet(part.name, item.status); closeContextMenu(); render();
      if (state.selectedPart?.name === part.name) showPartResult(part);
    });
    menu.appendChild(btn);
  }

  // Note section
  const noteSectionLabel = document.createElement('div');
  noteSectionLabel.className = 'ctx-section-label';
  noteSectionLabel.textContent = 'Note (session)';
  menu.appendChild(noteSectionLabel);

  const noteWrap = document.createElement('div');
  noteWrap.className = 'ctx-note-wrap';
  stopNoteEditorEventPropagation(noteWrap);
  const noteKey = pin ? pinNoteKey(pin) : partNoteKey(part.name);
  const currentNote = notesGet(noteKey);
  const noteArea = document.createElement('textarea');
  noteArea.className = 'ctx-note-textarea';
  noteArea.placeholder = 'Contoh: 3.3V OK, ganti kapasitor...';
  noteArea.maxLength = 500;
  noteArea.rows = 2;
  noteArea.value = currentNote;
  stopNoteEditorEventPropagation(noteArea);
  noteArea.addEventListener('keydown', (e) => e.stopPropagation());
  noteArea.addEventListener('focus', () => { state.drag.active = false; });
  noteArea.addEventListener('input', (e) => e.stopPropagation());
  const noteActions = document.createElement('div');
  noteActions.className = 'ctx-note-actions';
  const noteStatus = document.createElement('span');
  noteStatus.className = 'muted small ctx-note-status';
  const saveNoteBtn = document.createElement('button');
  saveNoteBtn.type = 'button';
  saveNoteBtn.className = 'note-save-btn ctx-note-save-btn';
  saveNoteBtn.textContent = 'Simpan';
  stopNoteEditorEventPropagation(saveNoteBtn);
  saveNoteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notesSet(noteKey, noteArea.value);
    noteStatus.textContent = 'Sesi tersimpan';
    if (pin && state.selectedPin?.index === pin.index) showPinResult(pin);
    else if (state.selectedPart?.name === part.name) showPartResult(part);
    render();
    setTimeout(() => { noteStatus.textContent = ''; }, 1800);
  });
  noteArea.addEventListener('input', () => {
    noteStatus.textContent = 'Belum disimpan';
  });
  noteActions.append(noteStatus, saveNoteBtn);
  noteWrap.appendChild(noteArea);
  noteWrap.appendChild(noteActions);
  menu.appendChild(noteWrap);

  document.body.appendChild(menu);
  // Focus textarea after menu renders
  setTimeout(() => noteArea.focus(), 50);

  const vw = window.innerWidth, vh = window.innerHeight, mw = 200, mh = 310;
  menu.style.left = (screenX + mw > vw ? screenX - mw : screenX) + 'px';
  menu.style.top  = (screenY + mh > vh ? screenY - mh : screenY) + 'px';
  function onOutsideClick(e) {
    if (_ctxMenu && !_ctxMenu.contains(e.target)) {
      closeContextMenu();
      document.removeEventListener('mousedown', onOutsideClick);
    }
  }
  function onEsc(e) {
    if (e.key === 'Escape') { closeContextMenu(); document.removeEventListener('keydown', onEsc); }
  }
  setTimeout(() => {
    document.addEventListener('mousedown', onOutsideClick);
    document.addEventListener('keydown', onEsc);
  }, 0);
}
function initContextMenu() {
  canvas.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    if (!state.board) return;
    const rect = canvas.getBoundingClientRect();
    const picked = pickAt(ev.clientX - rect.left, ev.clientY - rect.top);
    const pin = picked?.kind === 'pin' ? picked.value : null;
    const part = picked?.kind === 'part' ? picked.value
               : pin ? (state.board.parts[pin.part - 1] || null)
               : null;
    if (part) showContextMenu(part, ev.clientX, ev.clientY, pin); else closeContextMenu();
  });
}

// ── Permalink ─────────────────────────────────────────────────────────────────
function permalinkEncode() {
  if (!state.board) return;
  const p = new URLSearchParams();
  p.set('v', '1'); p.set('s', state.visibleSide);
  p.set('x', state.camera.offsetX.toFixed(1)); p.set('y', state.camera.offsetY.toFixed(1));
  p.set('z', state.camera.scale.toFixed(4));
  if (state.selectedPart) p.set('part', state.selectedPart.name);
  if (state.selectedNet)  p.set('net',  state.selectedNet);
  if (state.selectedPin)  p.set('pin',  String(state.selectedPin.index));
  history.replaceState(null, '', '#' + p.toString());
}
function permalinkDecode() {
  const hash = location.hash.slice(1);
  if (!hash) return null;
  try {
    const p = new URLSearchParams(hash);
    if (p.get('v') !== '1') return null;
    return { side: p.get('s') || null, offsetX: p.has('x') ? parseFloat(p.get('x')) : null,
      offsetY: p.has('y') ? parseFloat(p.get('y')) : null, scale: p.has('z') ? parseFloat(p.get('z')) : null,
      part: p.get('part') || null, net: p.get('net') || null, pin: p.has('pin') ? parseInt(p.get('pin'), 10) : null };
  } catch (e) { return null; }
}
function permalinkApply(pl) {
  if (!pl || !state.board) return;
  if (pl.side) { state.visibleSide = pl.side; refreshToolbarButtons(); }
  if (pl.m) { state.mirrorMode = ['x','y','xy'].includes(pl.m) ? pl.m : 'off'; }
  if (pl.scale !== null && pl.offsetX !== null) {
    const _plBase = state.camera.baseScale || 1;
    state.camera.scale = Math.max(_plBase * 0.05, Math.min(_plBase * 80, pl.scale));
    state.camera.offsetX = pl.offsetX; state.camera.offsetY = pl.offsetY != null ? pl.offsetY : 0;
  }
  if (pl.pin !== null) {
    const pin = state.board.pins[pl.pin - 1] || state.board.pins.find(function(p) { return p.index === pl.pin; });
    if (pin) { state.selectedPin = pin; state.selectedPart = state.board.parts[pin.part - 1] || null;
      state.selectedNet = pin.net || null; if (state.selectedNet) populateSelectedNetMembers(state.selectedNet); showPinResult(pin); }
  } else if (pl.part) {
    const part = state.indexes.partsByName.get(pl.part.toLowerCase());
    if (part) { state.selectedPart = part; showPartResult(part); }
  } else if (pl.net) {
    const pins = state.indexes.pinsByNet.get(pl.net.toLowerCase()) || [];
    state.selectedNet = pl.net; populateSelectedNetMembers(pl.net); showNetResult(pl.net, pins);
  }
  render();
}
function onViewChanged() { if (state.board) permalinkEncode(); }

function notesRenderMarkBadge(partName) {
  const existing = resultsEl.querySelector('.mark-badge-row');
  if (existing) existing.remove();
  const mark = markGet(partName);
  const row = document.createElement('div');
  row.className = 'mark-badge-row';
  if (mark) { const ms = MARK_COLORS[mark]; row.innerHTML = `<span class="mark-status-badge mark-${mark}">${ms.label}</span>`; }
  else { row.innerHTML = '<span class="mark-status-badge mark-none">○ No status</span>'; }
  resultsEl.appendChild(row);
}

function notesRenderBlock(target) {
  const noteTarget = typeof target === 'string'
    ? { key: partNoteKey(target), label: `Notes: ${target}`, placeholder: 'Catatan untuk komponen ini...' }
    : target;
  const noteKey = noteTarget?.key || '';
  if (!noteKey) return;
  const existing = resultsEl.querySelector('.note-block');
  if (existing && existing.dataset.noteKey === noteKey) {
    const ta = existing.querySelector('#note-textarea');
    if (document.activeElement === ta) return;
  }
  if (existing) existing.remove();
  const currentNote = notesGet(noteKey);
  const block = document.createElement('div');
  block.className = 'note-block';
  block.dataset.noteKey = noteKey;
  block.innerHTML = `
    <div class="note-label"><span>${escapeHtml(noteTarget.label || 'Notes')} <small class="note-session-badge">Session only</small></span><span class="note-saved-indicator muted small" id="note-saved-msg"></span></div>
    <textarea id="note-textarea" class="note-textarea" placeholder="${escapeAttr(noteTarget.placeholder || 'Catatan sesi...')}" rows="3" maxlength="500">${escapeHtml(currentNote)}</textarea>
    <div class="note-actions"><span class="muted small" id="note-char-count">${currentNote.length}/500</span><div class="note-action-buttons"><button type="button" class="note-clear-btn muted small" id="note-clear-btn"${currentNote ? '' : ' disabled'}>Clear</button><button type="button" class="note-save-btn" id="note-save-btn">Simpan</button></div></div>
  `;
  resultsEl.appendChild(block);
  const ta = block.querySelector('#note-textarea'), msg = block.querySelector('#note-saved-msg');
  const cnt = block.querySelector('#note-char-count'), clr = block.querySelector('#note-clear-btn');
  const save = block.querySelector('#note-save-btn');
  stopNoteEditorEventPropagation(block);
  stopNoteEditorEventPropagation(ta);
  stopNoteEditorEventPropagation(save);
  stopNoteEditorEventPropagation(clr);
  ta.addEventListener('focus', () => { state.drag.active = false; });
  ta.addEventListener('input', () => {
    cnt.textContent = ta.value.length + '/500';
    msg.textContent = 'Belum disimpan';
    clr.disabled = !ta.value.trim();
  });
  save.addEventListener('click', () => {
    notesSet(noteKey, ta.value);
    msg.textContent = 'Session saved';
    clr.disabled = !ta.value.trim();
    render();
    setTimeout(() => { msg.textContent = ''; }, 1800);
  });
  clr.addEventListener('click', () => {
    ta.value = ''; cnt.textContent = '0/500'; notesSet(noteKey, '');
    render(); msg.textContent = 'Cleared'; clr.disabled = true; setTimeout(() => { msg.textContent = ''; }, 1800);
  });
}

function findPartByName(name) {
  return state.indexes.partsByName.get(name.toLowerCase()) || null;
}

function searchPart() {
  if (!state.board) return;
  const q = getSearchQueryOrNotify();
  if (!q) return;
  setSearchMode('part');
  const parts = state.board.parts.filter((p) => p.name.toLowerCase().includes(q));
  if (!parts.length) {
    populateMatches([]);
    setStatus('Part not found.', true);
    return;
  }
  populateMatches(parts.map((part) => ({ kind: 'part', part })));
  setStatus(`Found ${parts.length} part match(es).`);
  selectPart(parts[0]);
  focusPartSelection(parts[0]);
  render();
  onViewChanged();
}

function searchNet() {
  if (!state.board) return;
  const q = getSearchQueryOrNotify();
  if (!q) return;
  setSearchMode('net');
  const nets = state.board.nets.filter((n) => n.name.toLowerCase().includes(q));
  if (!nets.length) {
    populateMatches([]);
    setStatus('Net not found.', true);
    return;
  }
  populateMatches(nets.map((net) => ({ kind: 'net', net })));
  setStatus(`Found ${nets.length} net match(es).`);
  selectNet(nets[0].name);
  focusNetSelection(nets[0].name);
  render();
  onViewChanged();
}

function searchAll() {
  if (!state.board) return;
  const q = getSearchQueryOrNotify();
  if (!q) return;
  setSearchMode('all');
  const parts = state.board.parts
    .filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, 100)
    .map((part) => ({ kind: 'part', part }));
  const nets = state.board.nets
    .filter((n) => n.name.toLowerCase().includes(q))
    .slice(0, 100)
    .map((net) => ({ kind: 'net', net }));
  const matches = [...parts, ...nets];
  populateMatches(matches);
  if (!matches.length) {
    setStatus('Nothing found.', true);
    return;
  }
  const first = matches[0];
  setStatus(`Found ${matches.length} match(es).`);
  if (first.kind === 'part') {
    selectPart(first.part);
    focusPartSelection(first.part);
  } else {
    selectNet(first.net.name);
    focusNetSelection(first.net.name);
  }
  render();
  onViewChanged();
}

function findNearestPinInPartAtScreenPoint(part, screenX, screenY, maxDistancePx) {
  let bestPin = null;
  let bestPinDist = maxDistancePx;
  const pins = getPartPins(part);
  for (const pin of pins) {
    if (!isSideVisible(pin.side)) continue;
    const s = worldToScreen(pin.x, pin.y);
    const d = Math.hypot(screenX - s.x, screenY - s.y);
    if (d < bestPinDist) {
      bestPin = pin;
      bestPinDist = d;
    }
  }
  return bestPin;
}

function pickAt(screenX, screenY) {
  if (!state.board) return null;

  const tvwNative = hasTvwNativeSegments();
  const world = screenToWorld(screenX, screenY);
  const pinRadiusPx = tvwNative ? 28 : 10;
  const pinRadiusWorld = screenDistanceToWorld(pinRadiusPx);
  const partRadiusWorld = screenDistanceToWorld(26);

  let bestPin = null;
  let bestPinDist = pinRadiusPx;
  const pinCandidates = getItemsNearPoint(state.indexes.pinGrid, world.x, world.y, pinRadiusWorld, state.indexes.cellSize);
  for (const pin of pinCandidates) {
    if (!isSideVisible(pin.side)) continue;
    const s = worldToScreen(pin.x, pin.y);
    const d = Math.hypot(screenX - s.x, screenY - s.y);
    if (d < bestPinDist) {
      bestPin = pin;
      bestPinDist = d;
    }
  }
  if (bestPin) return { kind: 'pin', value: bestPin };

  let bestPart = null;
  let bestPartDist = 26;
  const partCandidates = getItemsNearPoint(state.indexes.partGrid, world.x, world.y, partRadiusWorld, state.indexes.cellSize);
  for (const part of partCandidates) {
    if (!isSideVisible(part.mounting_side)) continue;
    const pins = getPartPins(part);
    const center = part.center || pins[0];
    if (!center) continue;
    const s = worldToScreen(center.x, center.y);
    const d = Math.hypot(screenX - s.x, screenY - s.y);
    if (d < bestPartDist) {
      bestPart = part;
      bestPartDist = d;
    }

    const box = getPartBox(part);
    if (box) {
      const a = worldToScreen(box.x_min, box.y_min);
      const b = worldToScreen(box.x_max, box.y_max);
      const xMin = Math.min(a.x, b.x) - 8;
      const xMax = Math.max(a.x, b.x) + 8;
      const yMin = Math.min(a.y, b.y) - 8;
      const yMax = Math.max(a.y, b.y) + 8;
      if (screenX >= xMin && screenX <= xMax && screenY >= yMin && screenY <= yMax) {
        if (tvwNative) {
          const nearestPin = findNearestPinInPartAtScreenPoint(part, screenX, screenY, 56);
          if (nearestPin) return { kind: 'pin', value: nearestPin };
        }
        bestPart = part;
        bestPartDist = 0;
      }
    }
  }
  if (bestPart) return { kind: 'part', value: bestPart };
  return null;
}

function runHoverPick() {
  state.hoverScheduler.scheduled = false;
  if (!state.hoverScheduler.inside || !state.board) return;
  const rect = canvas.getBoundingClientRect();
  const picked = pickAt(state.hoverScheduler.clientX - rect.left, state.hoverScheduler.clientY - rect.top);
  const newHoverPin = picked?.kind === 'pin' ? picked.value : null;
  const newHoverPart = picked?.kind === 'part' ? picked.value : (newHoverPin ? state.board.parts[newHoverPin.part - 1] : null);
  const changed = (state.hoverPin?.index || null) !== (newHoverPin?.index || null)
    || (state.hoverPart?.index || null) !== (newHoverPart?.index || null);
  if (changed) {
    state.hoverPin = newHoverPin;
    state.hoverPart = newHoverPart;
    render();
  }
  updateHoverTooltip(state.hoverScheduler.clientX, state.hoverScheduler.clientY);
}

function scheduleHoverPick(clientX, clientY) {
  state.hoverScheduler.clientX = clientX;
  state.hoverScheduler.clientY = clientY;
  state.hoverScheduler.inside = true;
  if (state.hoverScheduler.scheduled) return;
  state.hoverScheduler.scheduled = true;
  window.requestAnimationFrame(runHoverPick);
}

async function fetchBoard(boardId, boardToken) {
  const resp = await fetch(`/api/board/${boardId}`, {
    headers: clientHeaders({ 'X-Board-Token': boardToken || '' }),
  });
  if (!resp.ok) {
    const payload = await resp.json().catch(() => ({}));
    throw new Error(payload.detail || 'Failed to load parsed board data.');
  }
  return resp.json();
}

async function handleUpload() {
  const input = fileInputEl;
  if (!input.files.length) return;
  if (state.config.requireLogin && !state.config.currentUser) {
    setStatus('Please sign in before uploading a board file.', true);
    return;
  }
  const selectedFile = input.files[0];
  // Check file size before upload — state.config.maxUploadMb comes from server config
  const maxMb = state.config.maxUploadMb || 25;
  if (selectedFile.size > maxMb * 1024 * 1024) {
    setStatus(`File is too large (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${maxMb} MB. Try a smaller file or contact support.`, true);
    input.value = '';
    return;
  }
  const form = new FormData();
  form.append('file', selectedFile);
  resetUiForNewUpload(selectedFile.name || '');
  setStatus('Parsing file…');

  try {
    const resp = await fetch('/api/upload', {
      method: 'POST',
      body: form,
      headers: clientHeaders({ ...basicAuthHeader() }),
    });
    const payload = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      if (resp.status === 401) {
        authPanelEl?.classList.remove('is-hidden');
      }
      throw new Error(payload.detail || 'Upload failed');
    }
    state.boardId = payload.board_id;
    state.boardToken = payload.board_token;
    state.board = await fetchBoard(payload.board_id, payload.board_token);
    buildIndexes(state.board);
    updateStats(state.board);
    populateNetList();
    populatePartList();
    clearSelectedNetMembers();
    resetSearchFields();
    state.visibleSide = 'top';
    refreshToolbarButtons();
    const _pl = permalinkDecode();
    if (_pl) { autoFitBoard(); permalinkApply(_pl); } else { autoFitBoard(); }
    setViewerDocumentTitle(state.board.filename);
    setStatus(`Loaded: ${state.board.filename} (${state.board.meta.format_name || 'unknown format'})`);
    if (uploadNoteEl) uploadNoteEl.classList.add('is-hidden');
    input.value = '';
  } catch (err) {
    console.error(err);
    lastUploadFailure = await buildUploadFailureMeta(selectedFile, err.message || 'Upload failed');
    if (uploadNoteEl) uploadNoteEl.classList.remove('is-hidden');
    setStatus(err.message, true, { allowReport: true });
  }
}

function getTeknisiHubServiceBaseUrl() {
  if (typeof window.resolveTeknisiHubServiceBaseUrl === 'function') {
    return window.resolveTeknisiHubServiceBaseUrl();
  }
  return 'http://127.0.0.1:48721';
}

function getTeknisiHubSessionId() {
  return new URLSearchParams(window.location.search).get('sessionId') || '';
}

function getTeknisiHubRequestedPart() {
  return (new URLSearchParams(window.location.search).get('part') || '').trim();
}

function getTeknisiHubRequestedPin() {
  return (new URLSearchParams(window.location.search).get('pin') || '').trim();
}

function getTeknisiHubRequestedSide() {
  const value = (new URLSearchParams(window.location.search).get('layer') || '').trim().toLowerCase();
  if (value === 'top') return 'top';
  if (value === 'bottom') return 'bottom';
  if (value === 'both') return 'both';
  return '';
}

async function fetchTeknisiHubNativeSession(sessionId) {
  const resp = await fetch(`${getTeknisiHubServiceBaseUrl()}/tools/boardviewer/native-session/${encodeURIComponent(sessionId)}`);
  const payload = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(payload.message || payload.detail || 'TeknisiHub native session gagal dimuat.');
  }
  return payload;
}

function toTeknisiHubLabSide(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'top' || normalized === 't') return 'top';
  if (normalized === 'bottom' || normalized === 'bot' || normalized === 'b') return 'bottom';
  return 'both';
}

function addTeknisiHubBound(bounds, x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  bounds.x_min = Math.min(bounds.x_min, x);
  bounds.x_max = Math.max(bounds.x_max, x);
  bounds.y_min = Math.min(bounds.y_min, y);
  bounds.y_max = Math.max(bounds.y_max, y);
}

function finishTeknisiHubBounds(bounds) {
  if (![bounds.x_min, bounds.x_max, bounds.y_min, bounds.y_max].every(Number.isFinite)) {
    bounds.x_min = 0;
    bounds.y_min = 0;
    bounds.x_max = 100;
    bounds.y_max = 60;
  }
  if (Math.abs(bounds.x_max - bounds.x_min) < 1) {
    bounds.x_min -= 50;
    bounds.x_max += 50;
  }
  if (Math.abs(bounds.y_max - bounds.y_min) < 1) {
    bounds.y_min -= 30;
    bounds.y_max += 30;
  }
  bounds.width = Math.max(1, bounds.x_max - bounds.x_min);
  bounds.height = Math.max(1, bounds.y_max - bounds.y_min);
  return bounds;
}

function getTeknisiHubPadExtents(connection) {
  const width = Math.max(0, Number(connection?.padWidth || 0));
  const height = Math.max(0, Number(connection?.padHeight || 0));
  if (!(width > 0) || !(height > 0)) return { x: 0, y: 0 };
  const angle = (Number(connection?.padRotation || 0) * Math.PI) / 180;
  return {
    x: (Math.abs(Math.cos(angle)) * width / 2) + (Math.abs(Math.sin(angle)) * height / 2),
    y: (Math.abs(Math.sin(angle)) * width / 2) + (Math.abs(Math.cos(angle)) * height / 2),
  };
}

function compareTeknisiHubNatural(left, right) {
  return String(left || '').localeCompare(String(right || ''), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

function convertTeknisiHubSessionToLabBoard(session) {
  const nodes = Array.isArray(session?.previewNodes) ? session.previewNodes.filter(Boolean) : [];
  const connections = Array.isArray(session?.connections) ? session.connections.filter(Boolean) : [];
  const outlineSegments = Array.isArray(session?.outlineSegments) ? session.outlineSegments.filter(Boolean) : [];
  const partSeeds = new Map();
  const groupedPins = new Map();
  const bounds = {
    x_min: Number.POSITIVE_INFINITY,
    x_max: Number.NEGATIVE_INFINITY,
    y_min: Number.POSITIVE_INFINITY,
    y_max: Number.NEGATIVE_INFINITY,
  };

  function ensureSeed(partId, seed = {}) {
    const name = String(partId || seed.id || '').trim();
    if (!name) return null;
    const key = name.toLowerCase();
    if (!partSeeds.has(key)) {
      partSeeds.set(key, {
        name,
        device: String(seed.partName || seed.device || seed.info || '').trim(),
        shape: String(seed.label || '').trim(),
        mounting_side: toTeknisiHubLabSide(seed.layer),
        sourceX: Number(seed.x),
        sourceY: Number(seed.y),
        width: Number(seed.width || 0),
        height: Number(seed.height || 0),
        rotation: Number(seed.rotation || 0),
        nets: new Set(seed.net ? [String(seed.net)] : []),
      });
    }
    return partSeeds.get(key);
  }

  nodes.forEach((node) => {
    const seed = ensureSeed(node.id || node.label, node);
    if (!seed) return;
    if (Number.isFinite(seed.sourceX) && Number.isFinite(seed.sourceY)) {
      addTeknisiHubBound(bounds, seed.sourceX, seed.sourceY);
    }
    if (seed.width > 0 && seed.height > 0 && Number.isFinite(seed.sourceX) && Number.isFinite(seed.sourceY)) {
      addTeknisiHubBound(bounds, seed.sourceX - seed.width / 2, seed.sourceY - seed.height / 2);
      addTeknisiHubBound(bounds, seed.sourceX + seed.width / 2, seed.sourceY + seed.height / 2);
    }
  });

  connections.forEach((connection) => {
    if (!connection?.hasCoordinates) return;
    const x = Number(connection.x);
    const y = Number(connection.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const partName = String(connection.partId || '').trim();
    if (!partName) return;
    const seed = ensureSeed(partName, connection);
    if (!seed) return;
    seed.mounting_side = toTeknisiHubLabSide(connection.layer || seed.mounting_side);
    if (connection.netName) seed.nets.add(String(connection.netName));
    const key = partName.toLowerCase();
    if (!groupedPins.has(key)) groupedPins.set(key, []);
    groupedPins.get(key).push(connection);
    addTeknisiHubBound(bounds, x, y);
    const extents = getTeknisiHubPadExtents(connection);
    addTeknisiHubBound(bounds, x - extents.x, y - extents.y);
    addTeknisiHubBound(bounds, x + extents.x, y + extents.y);
  });

  outlineSegments.forEach((segment) => {
    addTeknisiHubBound(bounds, Number(segment.x1), Number(segment.y1));
    addTeknisiHubBound(bounds, Number(segment.x2), Number(segment.y2));
  });

  const parts = Array.from(partSeeds.values())
    .sort((left, right) => compareTeknisiHubNatural(left.name, right.name))
    .map((seed, index) => {
      const sourcePins = groupedPins.get(seed.name.toLowerCase()) || [];
      const xs = sourcePins.map((pin) => Number(pin.x)).filter(Number.isFinite);
      const ys = sourcePins.map((pin) => Number(pin.y)).filter(Number.isFinite);
      const hasPins = xs.length > 0 && ys.length > 0;
      const nativeBBox = seed.width > 0 && seed.height > 0 && Number.isFinite(seed.sourceX) && Number.isFinite(seed.sourceY)
        ? {
            x_min: seed.sourceX - seed.width / 2,
            x_max: seed.sourceX + seed.width / 2,
            y_min: seed.sourceY - seed.height / 2,
            y_max: seed.sourceY + seed.height / 2,
          }
        : null;
      const center = {
        x: hasPins ? xs.reduce((sum, value) => sum + value, 0) / xs.length : (Number.isFinite(seed.sourceX) ? seed.sourceX : bounds.x_min),
        y: hasPins ? ys.reduce((sum, value) => sum + value, 0) / ys.length : (Number.isFinite(seed.sourceY) ? seed.sourceY : bounds.y_min),
      };
      let bbox = null;
      if (hasPins) {
        const boardSpan = Math.max(bounds.x_max - bounds.x_min, bounds.y_max - bounds.y_min);
        const minPad = boardSpan > 0 && boardSpan < 100 ? 0.02 : 0.8;
        const maxPad = boardSpan > 0 && boardSpan < 100 ? 0.12 : 4;
        const fallbackPad = Math.max(minPad, Math.min(maxPad, ((Math.max(...xs) - Math.min(...xs)) + (Math.max(...ys) - Math.min(...ys))) * 0.08 || minPad));
        let xMin = Number.POSITIVE_INFINITY;
        let xMax = Number.NEGATIVE_INFINITY;
        let yMin = Number.POSITIVE_INFINITY;
        let yMax = Number.NEGATIVE_INFINITY;
        sourcePins.forEach((pin) => {
          const x = Number(pin.x);
          const y = Number(pin.y);
          if (!Number.isFinite(x) || !Number.isFinite(y)) return;
          const extents = getTeknisiHubPadExtents(pin);
          const padX = extents.x > 0 ? extents.x : fallbackPad;
          const padY = extents.y > 0 ? extents.y : fallbackPad;
          xMin = Math.min(xMin, x - padX);
          xMax = Math.max(xMax, x + padX);
          yMin = Math.min(yMin, y - padY);
          yMax = Math.max(yMax, y + padY);
        });
        bbox = {
          x_min: Number.isFinite(xMin) ? xMin : Math.min(...xs) - fallbackPad,
          x_max: Number.isFinite(xMax) ? xMax : Math.max(...xs) + fallbackPad,
          y_min: Number.isFinite(yMin) ? yMin : Math.min(...ys) - fallbackPad,
          y_max: Number.isFinite(yMax) ? yMax : Math.max(...ys) + fallbackPad,
        };
      } else if (nativeBBox) {
        bbox = nativeBBox;
      }
      return {
        index: index + 1,
        name: seed.name,
        device: seed.device || `Device${index + 1}`,
        shape: seed.shape || '',
        mounting_side: seed.mounting_side,
        center,
        bbox,
        native_bbox: nativeBBox,
        nets: Array.from(seed.nets).sort(compareTeknisiHubNatural),
      };
    });

  const partIndexByName = new Map(parts.map((part) => [part.name.toLowerCase(), part.index]));
  const pins = [];
  connections.forEach((connection) => {
    if (!connection?.hasCoordinates) return;
    const x = Number(connection.x);
    const y = Number(connection.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const partIndex = partIndexByName.get(String(connection.partId || '').toLowerCase());
    if (!partIndex) return;
    pins.push({
      index: pins.length + 1,
      part: partIndex,
      name: String(connection.pin || connection.pinName || pins.length + 1),
      net: String(connection.netName || ''),
      x,
      y,
      side: toTeknisiHubLabSide(connection.layer),
      mounting_side: toTeknisiHubLabSide(connection.layer),
      probe: String(connection.info || ''),
      pad_width: Number(connection.padWidth || 0),
      pad_height: Number(connection.padHeight || 0),
      rotation: Number(connection.padRotation || 0),
      raw: connection,
    });
  });

  const nets = Array.from(pins.reduce((map, pin) => {
    if (!pin.net) return map;
    const key = pin.net.toLowerCase();
    const entry = map.get(key) || { name: pin.net, pin_count: 0 };
    entry.pin_count += 1;
    map.set(key, entry);
    return map;
  }, new Map()).values()).sort((left, right) => compareTeknisiHubNatural(left.name, right.name));

  const sideCounts = parts.reduce((counts, part) => {
    if (part.mounting_side === 'top') counts.top += 1;
    else if (part.mounting_side === 'bottom') counts.bottom += 1;
    return counts;
  }, { top: 0, bottom: 0 });

  return {
    filename: session?.fileName || 'TeknisiHub boardview',
    meta: {
      format_name: session?.formatHint || session?.fileExtension || 'TeknisiHub native',
      units: 'native',
      parts: Number(session?.componentCount || parts.length),
      pins: Number(session?.padCount || pins.length),
      nails: Number(session?.nailCount || 0),
      routes: 0,
      arcs: 0,
      outline_segments: Number(session?.outlineSegmentCount || outlineSegments.length),
      side_counts: { parts: sideCounts },
    },
    bounds: finishTeknisiHubBounds(bounds),
    parts,
    pins,
    nets,
    nails: [],
    routes: [],
    arcs: [],
    outline_segments: outlineSegments.map((segment, index) => ({
      index,
      x1: Number(segment.x1),
      y1: Number(segment.y1),
      x2: Number(segment.x2),
      y2: Number(segment.y2),
      segment_type: Number(segment.segmentType ?? segment.segment_type ?? 0),
      side: toTeknisiHubLabSide(segment.layer),
    })).filter((segment) => [segment.x1, segment.y1, segment.x2, segment.y2].every(Number.isFinite)),
    outline: [],
  };
}

async function loadTeknisiHubNativeSessionFromQuery() {
  const sessionId = getTeknisiHubSessionId();
  if (!sessionId) return false;
  try {
    setStatus('Loading TeknisiHub native session...');
    const session = await fetchTeknisiHubNativeSession(sessionId);
    state.boardId = session.sessionId || sessionId;
    state.boardToken = '';
    state.board = convertTeknisiHubSessionToLabBoard(session);
    buildIndexes(state.board);
    updateStats(state.board);
    populateNetList();
    populatePartList();
    clearSelectedNetMembers();
    resetSearchFields();
    state.visibleSide = getTeknisiHubRequestedSide()
      || ((session.availableSides || []).some((side) => toTeknisiHubLabSide(side) === 'top') ? 'top' : 'both');
    refreshToolbarButtons();
    autoFitBoard();
    setViewerDocumentTitle(state.board.filename);
    setStatus(`Loaded: ${state.board.filename} (${state.board.meta.format_name || 'TeknisiHub native'})`);
    if (uploadNoteEl) uploadNoteEl.classList.add('is-hidden');

    const requestedPart = getTeknisiHubRequestedPart();
    const requestedPin = getTeknisiHubRequestedPin();
    if (requestedPart) {
      const part = state.board.parts.find((candidate) => candidate.name.toLowerCase() === requestedPart.toLowerCase());
      if (part) {
        if (requestedPin) {
          const pin = (state.indexes.pinsByPart.get(part.index) || []).find((candidate) =>
            String(candidate.name || '').trim().toLowerCase() === requestedPin.toLowerCase()
          );
          if (pin) selectPin(pin);
          else selectPart(part);
        } else {
          selectPart(part);
        }
      }
    }
    return true;
  } catch (err) {
    console.error(err);
    setStatus(err.message || 'TeknisiHub native session gagal dimuat.', true);
    return false;
  }
}

function setSide(side) {
  state.visibleSide = side;
  state.indexes.connectionCache.clear();
  document.getElementById('side-both-btn').classList.toggle('active', side === 'both');
  document.getElementById('side-top-btn').classList.toggle('active', side === 'top');
  document.getElementById('side-bottom-btn').classList.toggle('active', side === 'bottom');
  setStatus(`View side: ${side}`);
  refreshToolbarButtons();
  render();
  onViewChanged();
}

function setPartSideFilter(side) {
  state.partListSide = side;
  document.getElementById('part-side-all-btn').classList.toggle('active', side === 'all');
  document.getElementById('part-side-top-btn').classList.toggle('active', side === 'top');
  document.getElementById('part-side-bottom-btn').classList.toggle('active', side === 'bottom');
  populatePartList();
}

function cycleRoutesMode() {
  const order = ['selected', 'all', 'off'];
  const index = order.indexOf(state.routesMode);
  state.routesMode = order[(index + 1) % order.length];
  refreshToolbarButtons();
  render();
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(text) {
  return escapeHtml(text);
}

function setToolButtonState(id, options = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  const { active = null, status = '', title = '', pressed = null } = options;
  if (active !== null) el.classList.toggle('active', Boolean(active));
  if (status) el.dataset.state = status;
  else delete el.dataset.state;
  if (title) {
    el.title = title;
    el.setAttribute('aria-label', title);
  }
  if (pressed !== null) {
    el.setAttribute('aria-pressed', String(Boolean(pressed)));
  }
}

function refreshToolbarButtons() {
  setToolButtonState('fit-btn', { title: 'Fit board (F)' });
  setToolButtonState('side-both-btn', { active: state.visibleSide === 'both', title: 'Show both sides (1)' });
  setToolButtonState('side-top-btn', { active: state.visibleSide === 'top', title: 'Show top side (2)' });
  setToolButtonState('side-bottom-btn', { active: state.visibleSide === 'bottom', title: 'Show bottom side (3)' });
  const _mirrorLabels = { 'off': 'Off', 'x': '↔ X', 'y': '↕ Y', 'xy': '↔↕ XY' };
  setToolButtonState('mirror-bottom-btn', {
    active: state.mirrorMode !== 'off',
    status: _mirrorLabels[state.mirrorMode] || 'Off',
    title: `Mirror: ${state.mirrorMode.toUpperCase()} — click to cycle Off→X→Y→XY`,
    pressed: state.mirrorMode !== 'off',
  });
  setToolButtonState('toggle-parts-btn', {
    active: state.showParts,
    status: state.showParts ? 'On' : 'Off',
    title: `Parts: ${state.showParts ? 'on' : 'off'}`,
    pressed: state.showParts,
  });
  setToolButtonState('toggle-pins-btn', {
    active: state.showPins,
    status: state.showPins ? 'On' : 'Off',
    title: `Pins: ${state.showPins ? 'on' : 'off'}`,
    pressed: state.showPins,
  });
  setToolButtonState('toggle-labels-btn', {
    active: state.showLabels,
    status: state.showLabels ? 'On' : 'Off',
    title: `Labels: ${state.showLabels ? 'on' : 'off'}`,
    pressed: state.showLabels,
  });
  const routeState = state.routesMode === 'selected' ? 'Sel' : state.routesMode === 'all' ? 'All' : 'Off';
  setToolButtonState('toggle-routes-btn', {
    active: state.routesMode !== 'off',
    status: routeState,
    title: `Routes: ${state.routesMode}`,
    pressed: state.routesMode !== 'off',
  });
  const netState = state.netLinesMode === 'trace' ? 'Tr' : state.netLinesMode === 'full' ? 'On' : 'Off';
  setToolButtonState('toggle-nets-btn', {
    active: state.netLinesMode !== 'off',
    status: netState,
    title: `Ratsnest: ${state.netLinesMode}`,
    pressed: state.netLinesMode !== 'off',
  });
  setToolButtonState('toggle-nails-btn', {
    active: state.showNails,
    status: state.showNails ? 'On' : 'Off',
    title: `Vias / nails: ${state.showNails ? 'on' : 'off'}`,
    pressed: state.showNails,
  });
  setToolButtonState('toggle-outline-btn', {
    active: state.showOutline,
    status: state.showOutline ? 'On' : 'Off',
    title: `Outline: ${state.showOutline ? 'on' : 'off'}`,
    pressed: state.showOutline,
  });
}

function handleHotkeys(ev) {
  if (ev.target && ['INPUT', 'TEXTAREA'].includes(ev.target.tagName)) return;
  const key = ev.key.toLowerCase();
  if (key === 'f') {
    ev.preventDefault();
    fitBoard();
  } else if (key === '1') {
    setSide('both');
  } else if (key === '2') {
    setSide('top');
  } else if (key === '3') {
    setSide('bottom');
  } else if (key === 'p') {
    document.getElementById('toggle-pins-btn').click();
  } else if (key === 'l') {
    document.getElementById('toggle-labels-btn').click();
  } else if (key === 'r') {
    document.getElementById('toggle-routes-btn').click();
  } else if (key === 'n') {
    document.getElementById('toggle-nets-btn').click();
  } else if (key === 'm') {
    ev.preventDefault(); toggleMeasure();
  } else if (key === 'escape') {
    if (state.measure.active || state.measure.pointA) {
      state.measure.active = false; state.measure.pointA = null; state.measure.pointB = null; state.measure.cursorWorld = null;
      canvas.style.cursor = ''; document.getElementById('measure-btn')?.classList.remove('active'); render(); return;
    }
    if (actionCardEl && !actionCardEl.classList.contains('is-hidden')) {
      closeActionCard();
      return;
    }
    if (aboutmeCardEl && !aboutmeCardEl.classList.contains('is-hidden')) {
      closeAboutmeCard();
      return;
    }
    if (updatesModalEl && !updatesModalEl.classList.contains('is-hidden')) {
      closeModal(updatesModalEl);
      return;
    }
    if (metricsModalEl && !metricsModalEl.classList.contains('is-hidden')) {
      closeModal(metricsModalEl);
      return;
    }
    clearSelection();
  }
}


function hasConfiguredSupportUrl() {
  return Boolean(SUPPORT_CONFIG.supportUrl) && SUPPORT_CONFIG.supportUrl !== '#';
}

function applySupportLinks() {
  applySupportConfig();
  const configured = hasConfiguredSupportUrl();
  for (const tier of SUPPORT_CONFIG.tiers) {
    const link = document.getElementById(`support-tier-${tier.key}`);
    if (!link) continue;
    link.dataset.tier = tier.key;
    link.title = configured
      ? `Open support page for ${tier.amount}`
      : 'Support eksternal dinonaktifkan untuk build TeknisiHub';
  }
}


function setShareStatus(message = '', isError = false) {
  if (!shareStatusEl) return;
  shareStatusEl.textContent = message;
  shareStatusEl.classList.toggle('is-hidden', !message);
  shareStatusEl.style.color = isError ? '#fecaca' : '';
}

function setActionTab(kind = 'share') {
  const isShare   = kind === 'share';
  const isSupport = kind === 'support';
  const isContact = kind === 'contact';
  actionTabShareBtn?.classList.toggle('is-active', isShare);
  actionTabSupportBtn?.classList.toggle('is-active', isSupport);
  document.getElementById('action-tab-contact')?.classList.toggle('is-active', isContact);
  actionTabShareBtn?.setAttribute('aria-selected', isShare ? 'true' : 'false');
  actionTabSupportBtn?.setAttribute('aria-selected', isSupport ? 'true' : 'false');
  document.getElementById('action-tab-contact')?.setAttribute('aria-selected', isContact ? 'true' : 'false');
  sharePanelEl?.classList.toggle('is-hidden', !isShare);
  supportPanelEl?.classList.toggle('is-hidden', !isSupport);
  document.getElementById('action-panel-contact')?.classList.toggle('is-hidden', !isContact);
}

function openActionCard(kind = 'share') {
  if (!actionCardEl) return;
  closeAboutmeCard();
  setActionTab(kind);
  actionCardEl.classList.remove('is-hidden');
  document.getElementById('action-main-btn')?.setAttribute('aria-expanded', 'true');
}

function closeActionCard() {
  if (!actionCardEl) return;
  actionCardEl.classList.add('is-hidden');
  shareFabBtn?.setAttribute('aria-expanded', 'false');
  supportFabBtn?.setAttribute('aria-expanded', 'false');
  setShareStatus('');
}

function openAboutmeCard() {
  if (!aboutmeCardEl) return;
  closeActionCard();
  aboutmeCardEl.classList.remove('is-hidden');
  aboutmeButtonEl?.setAttribute('aria-expanded', 'true');
}

function closeAboutmeCard() {
  if (!aboutmeCardEl) return;
  aboutmeCardEl.classList.add('is-hidden');
  aboutmeButtonEl?.setAttribute('aria-expanded', 'false');
}

function toggleAboutmeCard() {
  if (aboutmeCardEl?.classList.contains('is-hidden')) openAboutmeCard();
  else closeAboutmeCard();
}

function openShareMenu() {
  openActionCard('share');
}

function closeShareMenu() {
  if (actionCardEl?.classList.contains('is-hidden')) return;
  if (!sharePanelEl || sharePanelEl.classList.contains('is-hidden')) return;
  closeActionCard();
}

function toggleShareMenu() {
  if (!actionCardEl) return;
  const shareOpen = !actionCardEl.classList.contains('is-hidden') && sharePanelEl && !sharePanelEl.classList.contains('is-hidden');
  if (shareOpen) closeActionCard();
  else openActionCard('share');
}

function snapshotFilename(ext = 'jpg') {
  const base = String(state.board?.filename || 'boardview').replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '_');
  return `${base || 'boardview'}_${state.visibleSide}.${ext}`;
}

function exportCanvasJpegBlob(quality = 0.92) {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      reject(new Error('Canvas not ready.'));
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to render JPG snapshot.'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', quality);
  });
}

async function saveSnapshotJpeg() {
  const blob = await exportCanvasJpegBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = snapshotFilename('jpg');
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function shareSnapshot(target = 'generic') {
  if (!state.board) {
    setShareStatus('Open a board file first.', true);
    return;
  }
  try {
    const blob = await exportCanvasJpegBlob();
    const file = new File([blob], snapshotFilename('jpg'), { type: 'image/jpeg' });
    const title = `${state.config.appTitle || 'Boardview TeknisiHub'} snapshot`;
    const text = `${state.board.filename} · ${state.visibleSide} view`;
    if (navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `${title}${target === 'telegram' ? ' · Telegram' : target === 'whatsapp' ? ' · WhatsApp' : ''}`,
        text,
        files: [file],
      });
      closeShareMenu();
      return;
    }
    await saveSnapshotJpeg();
    const currentUrl = window.location.href;
    if (target === 'telegram') {
      setShareStatus('JPG saved. External Telegram share is disabled in TeknisiHub build.', false);
      return;
    }
    if (target === 'whatsapp') {
      setShareStatus('JPG saved. External WhatsApp share is disabled in TeknisiHub build.', false);
      return;
    }
    setShareStatus('JPG saved to your device.', false);
  } catch (err) {
    setShareStatus(err.message || 'Failed to create snapshot.', true);
  }
}

function openSupportMenu() {
  openActionCard('support');
}

function closeSupportMenu() {
  if (actionCardEl?.classList.contains('is-hidden')) return;
  if (!supportPanelEl || supportPanelEl.classList.contains('is-hidden')) return;
  closeActionCard();
}

function toggleSupportMenu() {
  if (!actionCardEl) return;
  const supportOpen = !actionCardEl.classList.contains('is-hidden') && supportPanelEl && !supportPanelEl.classList.contains('is-hidden');
  if (supportOpen) closeActionCard();
  else openActionCard('support');
}

resultsEl.addEventListener('click', (ev) => {
  const target = ev.target.closest('[data-net], [data-part]');
  if (!target || !state.board) return;
  if (target.dataset.net) {
    selectNet(target.dataset.net);
    return;
  }
  if (target.dataset.part) {
    const part = findPartByName(target.dataset.part);
    if (part) selectPart(part);
  }
});

fileInputEl?.addEventListener('change', async (ev) => {
  const file = ev.target.files?.[0] || null;
  if (!file) return;
  await handleUpload();
});
reportIssueBtnEl?.addEventListener('click', reportUploadIssue);
searchAllBtn?.addEventListener('click', searchAll);
searchPartBtn?.addEventListener('click', searchPart);
searchNetBtn?.addEventListener('click', searchNet);
document.getElementById('clear-btn').addEventListener('click', clearAllQueries);
document.getElementById('fit-btn').addEventListener('click', fitBoard);
document.getElementById('side-both-btn').addEventListener('click', () => setSide('both'));
document.getElementById('side-top-btn').addEventListener('click', () => setSide('top'));
document.getElementById('side-bottom-btn').addEventListener('click', () => setSide('bottom'));
document.getElementById('part-side-all-btn').addEventListener('click', () => setPartSideFilter('all'));
document.getElementById('part-side-top-btn').addEventListener('click', () => setPartSideFilter('top'));
document.getElementById('part-side-bottom-btn').addEventListener('click', () => setPartSideFilter('bottom'));

document.getElementById('mirror-bottom-btn').addEventListener('click', () => {
  const cycle = { 'off': 'x', 'x': 'y', 'y': 'xy', 'xy': 'off' };
  state.mirrorMode = cycle[state.mirrorMode] || 'x';
  refreshToolbarButtons();
  render();
});

document.getElementById('toggle-parts-btn').addEventListener('click', () => {
  state.showParts = !state.showParts;
  refreshToolbarButtons();
  render();
});

document.getElementById('toggle-pins-btn').addEventListener('click', () => {
  state.showPins = !state.showPins;
  refreshToolbarButtons();
  render();
});

document.getElementById('toggle-labels-btn').addEventListener('click', () => {
  state.showLabels = !state.showLabels;
  refreshToolbarButtons();
  render();
});

document.getElementById('toggle-routes-btn').addEventListener('click', () => cycleRoutesMode());

function cycleNetLinesMode() {
  state.netLinesMode = state.netLinesMode === 'off' ? 'trace' : state.netLinesMode === 'trace' ? 'full' : 'off';
  state.indexes.connectionCache.clear();
  refreshToolbarButtons();
  render();
}

document.getElementById('toggle-nets-btn').addEventListener('click', () => cycleNetLinesMode());

document.getElementById('toggle-nails-btn').addEventListener('click', () => {
  state.showNails = !state.showNails;
  refreshToolbarButtons();
  render();
});

document.getElementById('toggle-outline-btn').addEventListener('click', () => {
  state.showOutline = !state.showOutline;
  refreshToolbarButtons();
  render();
});

searchInput.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') {
    ev.preventDefault();
    runActiveSearch();
  }
});

partFilterInput.addEventListener('input', populatePartList);
netFilterInput.addEventListener('input', populateNetList);

canvas.addEventListener('mousedown', (ev) => {
  state.drag.active = true;
  state.drag.moved = false;
  state.drag.startX = ev.clientX;
  state.drag.startY = ev.clientY;
  state.drag.offsetX = state.camera.offsetX;
  state.drag.offsetY = state.camera.offsetY;
  canvas.classList.add('dragging');
});

window.addEventListener('mouseup', (ev) => {
  if (state.drag.active && !state.drag.moved) {
    const rect = canvas.getBoundingClientRect();
    const insideCanvas = ev.clientX >= rect.left && ev.clientX <= rect.right &&
                         ev.clientY >= rect.top  && ev.clientY <= rect.bottom;
    if (!insideCanvas) { state.drag.active = false; canvas.classList.remove('dragging'); return; }
    if (state.measure.active) {
      const wx = ev.clientX - rect.left, wy = ev.clientY - rect.top;
      const wp = screenToWorld(wx, wy);
      if (!state.measure.pointA) { state.measure.pointA = wp; }
      else { state.measure.pointB = wp; state.measure.active = false; canvas.style.cursor = ''; document.getElementById('measure-btn')?.classList.remove('active'); }
      render(); state.drag.active = false; canvas.classList.remove('dragging'); return;
    }
    const picked = pickAt(ev.clientX - rect.left, ev.clientY - rect.top);
    if (picked?.kind === 'pin') selectPin(picked.value);
    else if (picked?.kind === 'part') selectPart(picked.value);
  }
  state.drag.active = false;
  canvas.classList.remove('dragging');
});

window.addEventListener('mousemove', (ev) => {
  if (state.drag.active) {
    const dx = ev.clientX - state.drag.startX;
    const dy = ev.clientY - state.drag.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) state.drag.moved = true;
    state.camera.offsetX = state.drag.offsetX + dx;
    state.camera.offsetY = state.drag.offsetY + dy;
    render();
    onViewChanged();
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const inside = ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom;
  if (!inside || !state.board) return;
  if (state.measure.active && state.measure.pointA && !state.measure.pointB) {
    state.measure.cursorWorld = screenToWorld(ev.clientX - rect.left, ev.clientY - rect.top);
    render(); return;
  }
  scheduleHoverPick(ev.clientX, ev.clientY);
});


canvas.addEventListener('mouseleave', () => {
  state.hoverScheduler.inside = false;
  state.hoverPin = null;
  state.hoverPart = null;
  hideTooltip();
  render();
});


if (minimapCanvas) {
  let minimapDragging = false;
  minimapCanvas.addEventListener('mousedown', (ev) => {
    minimapDragging = true;
    recenterFromMinimapEvent(ev);
  });
  window.addEventListener('mouseup', () => { minimapDragging = false; });
  minimapCanvas.addEventListener('mousemove', (ev) => {
    if (!minimapDragging) return;
    recenterFromMinimapEvent(ev);
  });
  minimapCanvas.addEventListener('click', recenterFromMinimapEvent);
}

canvas.addEventListener('wheel', (ev) => {
  ev.preventDefault();
  if (!state.board) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = ev.clientX - rect.left;
  const mouseY = ev.clientY - rect.top;
  const before = screenToWorld(mouseX, mouseY);
  const factor = ev.deltaY < 0 ? 1.12 : 0.9;
  const _base = state.camera.baseScale || 1;
  state.camera.scale = Math.max(_base * 0.05, Math.min(_base * 80, state.camera.scale * factor));
  const transformed = transformWorld(before.x, before.y);
  state.camera.offsetX = mouseX - transformed.x * state.camera.scale;
  state.camera.offsetY = mouseY - transformed.y * state.camera.scale;
  render();
  onViewChanged();
}, { passive: false });


window.addEventListener('keydown', handleHotkeys);


themeToggleBtn?.addEventListener('click', toggleTheme);
document.getElementById('measure-btn')?.addEventListener('click', toggleMeasure);

// ── Sidebar tabs ──────────────────────────────────────────────────────────────
const SB_TABS = ['inspector', 'components', 'nets', 'info'];

function switchSidebarTab(name) {
  for (const id of SB_TABS) {
    const btn = document.getElementById('tab-' + id);
    const panel = document.getElementById('tabpanel-' + id);
    const active = id === name;
    btn?.classList.toggle('active', active);
    btn?.setAttribute('aria-selected', active ? 'true' : 'false');
    panel?.classList.toggle('is-hidden', !active);
  }
}

function initSidebarTabs() {
  for (const id of SB_TABS) {
    document.getElementById('tab-' + id)?.addEventListener('click', () => switchSidebarTab(id));
  }
}
// ── End sidebar tabs ──────────────────────────────────────────────────────────

initContextMenu();
initSidebarTabs();

// ── Toolbar share dropdown ────────────────────────────────────────────────────
(function() {
  const wrap = document.getElementById('share-dropdown-wrap');
  const btn  = document.getElementById('tb-share-btn');
  const menu = document.getElementById('tb-share-menu');
  if (!btn || !menu) return;

  function openMenu() { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
  function closeMenu() { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
  function toggleMenu() { menu.hidden ? openMenu() : closeMenu(); }

  btn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
  document.addEventListener('mousedown', (e) => {
    if (wrap && !wrap.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  document.getElementById('tb-save-jpg-btn')?.addEventListener('click', () => {
    closeMenu();
    saveSnapshotJpeg().catch((err) => setStatus(err.message || 'Failed to save JPG.', true));
  });
  document.getElementById('tb-share-telegram-btn')?.addEventListener('click', () => {
    closeMenu(); shareSnapshot('telegram');
  });
  document.getElementById('tb-share-whatsapp-btn')?.addEventListener('click', () => {
    closeMenu(); shareSnapshot('whatsapp');
  });
})();
// ── End toolbar share dropdown ────────────────────────────────────────────────

actionCardCloseBtn?.addEventListener('click', (ev) => {
  ev.preventDefault();
  closeActionCard();
});

actionTabShareBtn?.addEventListener('click', (ev) => {
  ev.preventDefault();
  openActionCard('share');
});

actionTabSupportBtn?.addEventListener('click', (ev) => {
  ev.preventDefault();
  openActionCard('support');
});
document.getElementById('action-tab-contact')?.addEventListener('click', (ev) => {
  ev.preventDefault();
  openActionCard('contact');
});

actionCardEl?.addEventListener('click', (ev) => ev.stopPropagation());

if (shareFabBtn) {
  shareFabBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    toggleShareMenu();
  });
}

// Single main action button
const actionMainBtn = document.getElementById('action-main-btn');
if (actionMainBtn) {
  actionMainBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (actionCardEl?.classList.contains('is-hidden')) openActionCard('share');
    else closeActionCard();
  });
}

aboutmeButtonEl?.addEventListener('click', (ev) => {
  ev.stopPropagation();
  toggleAboutmeCard();
});

aboutmeCardEl?.addEventListener('click', (ev) => ev.stopPropagation());

shareSaveBtn?.addEventListener('click', async () => {
  await saveSnapshotJpeg().catch((err) => setShareStatus(err.message || 'Failed to save JPG.', true));
});
shareTelegramBtn?.addEventListener('click', async () => shareSnapshot('telegram'));
shareWhatsappBtn?.addEventListener('click', async () => shareSnapshot('whatsapp'));
if (supportFabBtn) {
  supportFabBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    toggleSupportMenu();
  });
}

for (const tier of SUPPORT_CONFIG.tiers) {
  const link = document.getElementById(`support-tier-${tier.key}`);
  if (!link) continue;
  link.addEventListener('click', (ev) => {
    if (hasConfiguredSupportUrl()) return;
    ev.preventDefault();
    openSupportMenu();
  });
}

document.addEventListener('click', (ev) => {
  const insideActionCard = actionCardEl && actionCardEl.contains(ev.target);
  const onMainBtn = actionMainBtn && actionMainBtn.contains(ev.target);
  if (!insideActionCard && !onMainBtn) closeActionCard();
  if (aboutmeDockEl && !aboutmeDockEl.contains(ev.target)) closeAboutmeCard();
});

if (metricsClearBtn) {
  metricsClearBtn.addEventListener('click', () => clearMetricsLog());
}

for (const btn of [versionTriggerBtn, viewerVersionChip]) {
  btn?.addEventListener('click', () => openModal(updatesModalEl));
}
metricsTriggerBtn?.addEventListener('click', () => openMetricsModal());
for (const modal of [updatesModalEl, metricsModalEl]) {
  modal?.addEventListener('click', (ev) => {
    if (ev.target === modal || ev.target.closest('[data-close-modal]')) closeModal(modal);
  });
}

applyTheme(state.theme);
setSearchMode(state.searchMode);
setActionTab('share');
refreshToolbarButtons();
applySupportLinks();
resizeCanvas();
fetchConfig();
setStatus('Waiting for a file…');
loadTeknisiHubNativeSessionFromQuery();

// ── Contact form ──────────────────────────────────────────────────────────
(function () {
  const sendBtn = document.getElementById('contact-send-btn');
  const statusEl = document.getElementById('contact-status');
  if (!sendBtn) return;

  function setContactStatus(msg, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'contact-status' + (msg ? '' : ' is-hidden') + (isError ? ' contact-status-error' : ' contact-status-ok');
  }

  sendBtn.addEventListener('click', async () => {
    const name = (document.getElementById('contact-name')?.value || '').trim();
    const message = (document.getElementById('contact-message')?.value || '').trim();
    if (!message) {
      setContactStatus('Please enter your message.', true);
      return;
    }
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending…';
    setContactStatus('');
    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: clientHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name, message }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.detail || 'Server error. Please try again.');
      setContactStatus('Message sent. Thank you!');
      document.getElementById('contact-name').value = '';
      document.getElementById('contact-message').value = '';
    } catch (err) {
      setContactStatus(err.message || 'Failed to send. Please try again later.', true);
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2L2 7l5 2 2 5 5-12z"/></svg> Send';
    }
  });
})();
// ── End contact form ──────────────────────────────────────────────────────

// ── Demo mode (?demo=1) ───────────────────────────────────────────────────
(async function () {
  if (!new URLSearchParams(window.location.search).has('demo')) return;

  // Hide UI chrome that's not needed in demo
  document.querySelector('.sidebar')?.style.setProperty('display', 'none');
  document.querySelector('.toolbar-wrap')?.style.setProperty('display', 'none');
  document.getElementById('status-bar')?.style.setProperty('display', 'none');
  document.getElementById('floating-actions')?.style.setProperty('display', 'none');
  document.querySelector('.hint-bar')?.style.setProperty('display', 'none');
  document.querySelector('.minimap-shell')?.style.setProperty('display', 'none');
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  try {
    const resp = await fetch('/api/demo-board');
    if (!resp.ok) return;
    state.board = await resp.json();
    buildIndexes(state.board);
    state.visibleSide = 'top';
    autoFitBoard();
    render();

    // Guided tour: select components and nets in sequence
    const tour = [
      { delay: 1200,  action: () => { selectPart(state.board.parts.find(p => p.name === 'U1')); } },
      { delay: 2800,  action: () => { selectNet('PPBUS_G3H'); switchSidebarTab('nets'); } },
      { delay: 5000,  action: () => { clearSelection(); } },
      { delay: 6000,  action: () => { selectPart(state.board.parts.find(p => p.name === 'U7')); } },
      { delay: 8200,  action: () => { selectNet('USB_DP'); } },
      { delay: 10500, action: () => { clearSelection(); state.visibleSide = 'bot'; refreshToolbarButtons(); fitBoard(); render(); } },
      { delay: 12000, action: () => { selectPart(state.board.parts.find(p => p.name === 'U19')); } },
      { delay: 14000, action: () => { clearSelection(); state.visibleSide = 'top'; refreshToolbarButtons(); autoFitBoard(); render(); } },
    ];

    // Loop the tour
    function runTour() {
      tour.forEach(({ delay, action }) => setTimeout(action, delay));
      setTimeout(runTour, tour[tour.length-1].delay + 2000);
    }
    setTimeout(runTour, 800);

  } catch (e) {
    console.warn('Demo board load failed:', e);
  }
})();
// ── End demo mode ─────────────────────────────────────────────────────────
