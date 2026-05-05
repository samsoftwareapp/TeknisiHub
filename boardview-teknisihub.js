(function initializeBoardviewTeknisiHubPage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const root = globalScope.document.getElementById("boardviewerNativeRoot");
  const boardGeometryDefaults = {
    minWidth: 1120,
    maxWidth: 1920,
    minHeight: 820,
    maxHeight: 1380,
    baseWidth: 1560,
    minPaddingX: 52,
    maxPaddingX: 132,
    minPaddingY: 48,
    maxPaddingY: 126
  };
  const zoomLimits = {
    min: 0.14,
    max: 18
  };
  const panelDescriptions = {
    inspector: "Fokus ke komponen yang sedang dipilih di stage board.",
    session: "Metadata session lokal, preview teks, dan status file sumber.",
    about: "Catatan kontrol viewer dan arah pengembangan engine offline TeknisiHub."
  };
  const defaultNodes = [
    {
      id: "SESSION",
      label: "SES",
      partName: "Boardview TeknisiHub",
      layer: "Both",
      net: "Offline session",
      x: 50,
      y: 50,
      description: "Session local service aktif, tetapi preview node belum tersedia."
    }
  ];
  const state = {
    loading: true,
    errorMessage: "",
    session: null,
    viewerLayer: "Both",
    selectedPreviewNode: "",
    selectedNetName: "",
    selectedConnectionKey: "",
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    mirrored: false,
    interacting: false,
    idleSharp: true,
    boardsOpen: false,
    activePanel: "part",
    dragging: null
  };
  const domRefs = {
    world: null,
    viewport: null,
    zoomLabel: null,
    tooltip: null,
    baseCanvas: null,
    overlayCanvas: null
  };
  let sceneCacheKey = "";
  let sceneCacheValue = null;
  let viewportSyncFrame = 0;
  let interactionCooldownTimer = 0;
  let idleCrispTimer = 0;
  let stagePaintFrame = 0;
  let hoverFrame = 0;
  let pendingHoverPoint = null;
  let stageRuntime = null;
  let stageRenderSnapshot = null;
  let stageBaseCacheSignature = "";
  let stageBaseCacheCanvas = null;
  let requestedInitialViewApplied = false;
  const componentAssetLibrary = normalizeComponentAssetLibrary(
    globalScope.__TEKNISIHUB_BOARDVIEW_COMPONENT_ASSETS__
  );
  const componentAssetPathCache = new Map();

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function normalizeRotationDegrees(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return 0;
    }

    let normalized = numericValue % 360;
    if (normalized < 0) {
      normalized += 360;
    }
    return normalized;
  }

  function hashString(value) {
    let hash = 0;
    const text = String(value ?? "");
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function buildFootprintSignature(footprint) {
    return [
      footprint?.id || "",
      footprint?.partName || "",
      footprint?.label || "",
      footprint?.description || ""
    ].join(" ").toUpperCase();
  }

  function getFootprintPackageHint(signature) {
    const normalized = String(signature || "").toUpperCase();
    if (/0201/.test(normalized)) {
      return "0201";
    }
    if (/0402/.test(normalized)) {
      return "0402";
    }
    if (/0603/.test(normalized)) {
      return "0603";
    }
    if (/0805/.test(normalized)) {
      return "0805";
    }
    if (/1206/.test(normalized)) {
      return "1206";
    }
    if (/QFN|QFP|TQFP|LQFP/.test(normalized)) {
      return "qfp";
    }
    if (/BGA|LGA/.test(normalized)) {
      return "bga";
    }
    if (/SOT23|SOT-23|SOT89|SOT-89/.test(normalized)) {
      return "sot";
    }
    if (/SOIC|SSOP|TSSOP|TSOP/.test(normalized)) {
      return "soic";
    }
    return "";
  }

  function normalizeComponentAssetLibrary(source) {
    const assets = Array.isArray(source?.assets)
      ? source.assets.filter((asset) => asset && asset.key)
      : [];
    return {
      assets,
      byKey: new Map(assets.map((asset) => [String(asset.key), asset]))
    };
  }

  function getDefaultComponentAssetKey(kind, shapeKind = kind) {
    switch (shapeKind) {
      case "hole":
        return "mount-hole";
      case "socket":
        return "socket-slot";
      case "rail":
        return "connector-rail";
      case "triad":
        return "triad-sot";
      case "dense-chip":
        return "chip-bga";
      case "elongated-chip":
        return "chip-elongated";
      case "passive":
        return "passive-inline";
      default:
        break;
    }

    switch (kind) {
      case "hole":
        return "mount-hole";
      case "socket":
        return "socket-slot";
      case "connector":
        return "connector-rail";
      case "jumper":
        return "jumper-inline";
      case "passive":
        return "passive-inline";
      default:
        return "chip-generic";
    }
  }

  function resolveComponentAssetKey(signature, fallbackKey, hints = {}) {
    const normalizedSignature = String(signature || "").toUpperCase();
    const hintKinds = new Set(
      [hints.kind, hints.shapeKind]
        .filter(Boolean)
        .map((value) => String(value))
    );

    const matchedAsset = componentAssetLibrary.assets.find((asset) => {
      if (Array.isArray(asset.matchKinds) && asset.matchKinds.length > 0) {
        const acceptsHint = asset.matchKinds.some((kind) => hintKinds.has(String(kind)));
        if (!acceptsHint) {
          return false;
        }
      }

      return Array.isArray(asset.matchers)
        && asset.matchers.some((matcher) => matcher instanceof RegExp && matcher.test(normalizedSignature));
    });

    return matchedAsset?.key || fallbackKey || "chip-generic";
  }

  function getComponentAssetDefinition(assetKey) {
    return componentAssetLibrary.byKey.get(String(assetKey || ""))
      || componentAssetLibrary.byKey.get("chip-generic")
      || null;
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
    const isJsonBody = options.body && !(options.body instanceof FormData);
    const headers = isJsonBody ? { "Content-Type": "application/json" } : undefined;
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

  function buildLauncherUrl() {
    return new URL("index.html#tool_boardviewer", globalScope.location.href).toString();
  }

  function getSessionId() {
    const searchParams = new URLSearchParams(globalScope.location.search);
    return searchParams.get("sessionId") || "";
  }

  function getRequestedPartId() {
    const searchParams = new URLSearchParams(globalScope.location.search);
    return String(searchParams.get("part") || "").trim();
  }

  function getRequestedLayer() {
    const searchParams = new URLSearchParams(globalScope.location.search);
    const layer = String(searchParams.get("layer") || "").trim();
    return ["Top", "Bottom", "Both"].includes(layer) ? layer : "";
  }

  function getRequestedZoom() {
    const searchParams = new URLSearchParams(globalScope.location.search);
    const rawZoom = Number(searchParams.get("zoom"));
    return Number.isFinite(rawZoom)
      ? clamp(rawZoom, zoomLimits.min, zoomLimits.max)
      : null;
  }

  function getRequestedPin() {
    const searchParams = new URLSearchParams(globalScope.location.search);
    return String(searchParams.get("pin") || "").trim();
  }

  function getSessionNodes() {
    const nodes = Array.isArray(state.session?.previewNodes) ? state.session.previewNodes.filter(Boolean) : [];
    return nodes.length > 0 ? nodes : defaultNodes;
  }

  function getSessionOutlineSegments() {
    const segments = Array.isArray(state.session?.outlineSegments) ? state.session.outlineSegments.filter(Boolean) : [];
    return segments;
  }

  function getSessionConnections() {
    const connections = Array.isArray(state.session?.connections) ? state.session.connections.filter(Boolean) : [];
    return connections;
  }

  function getConnectionPinDisplay(connection) {
    const pinValue = String(connection?.pin || connection?.pinName || "").trim();
    return pinValue || "-";
  }

  function buildConnectionKey(connection) {
    return [
      connection?.partId || "",
      connection?.pin || "",
      connection?.netName || ""
    ].join("::");
  }

  function compareNaturalText(left, right) {
    return String(left || "").localeCompare(String(right || ""), undefined, {
      numeric: true,
      sensitivity: "base"
    });
  }

  function getConnectionPeerPriority(connection) {
    const partId = String(connection?.partId || "").toUpperCase();
    if (/^(KBC|EC|SIO|ITE|ENE)/.test(partId)) {
      return 0;
    }
    if (/^(PU|U|IC)/.test(partId)) {
      return 1;
    }
    if (/^(J|CN|PJ|CON)/.test(partId)) {
      return 2;
    }
    if (/^(Q|PQ|MOS)/.test(partId)) {
      return 3;
    }
    if (/^(R|C|L|D|F|FB|PR|PC|PL|PD)/.test(partId)) {
      return 5;
    }
    return 4;
  }

  function formatConnectionPeerRef(connection) {
    const partId = String(connection?.partId || "").trim();
    const pinValue = getConnectionPinDisplay(connection);
    if (!partId) {
      return pinValue;
    }
    return pinValue && pinValue !== "-"
      ? `${partId}/${pinValue}`
      : partId;
  }

  function getPeerConnections(connection, limit = 4) {
    if (!connection?.netName) {
      return [];
    }

    const currentKey = buildConnectionKey(connection);
    return getNetConnections(connection.netName)
      .filter((candidate) => buildConnectionKey(candidate) !== currentKey)
      .sort((left, right) =>
        getConnectionPeerPriority(left) - getConnectionPeerPriority(right)
        || compareNaturalText(left.partId, right.partId)
        || compareNaturalText(getConnectionPinDisplay(left), getConnectionPinDisplay(right))
      )
      .slice(0, Math.max(1, limit));
  }

  function getConnectionPeerSummary(connection, limit = 3) {
    const peers = getPeerConnections(connection, limit + 1);
    if (peers.length === 0) {
      return "-";
    }

    const visiblePeers = peers.slice(0, limit).map((peer) => formatConnectionPeerRef(peer));
    const hiddenCount = Math.max(0, peers.length - limit);
    return hiddenCount > 0
      ? `${visiblePeers.join(", ")} +${hiddenCount}`
      : visiblePeers.join(", ");
  }

  function getPartConnections(partId) {
    return getSessionConnections()
      .filter((connection) => String(connection.partId || "").toUpperCase() === String(partId || "").toUpperCase())
      .sort((left, right) => compareNaturalText(left.pin, right.pin) || compareNaturalText(left.netName, right.netName));
  }

  function getNetConnections(netName) {
    return getSessionConnections()
      .filter((connection) => String(connection.netName || "").toUpperCase() === String(netName || "").toUpperCase())
      .sort((left, right) =>
        compareNaturalText(left.partId, right.partId)
        || compareNaturalText(left.pin, right.pin)
        || compareNaturalText(left.layer, right.layer)
      );
  }

  function getPrimaryNetForPart(partId) {
    return getPartConnections(partId)[0]?.netName || "";
  }

  function getActiveNetName(activeFootprint) {
    if (state.selectedNetName) {
      return state.selectedNetName;
    }

    if (state.activePanel === "net") {
      return activeFootprint?.net || getPrimaryNetForPart(activeFootprint?.id) || "";
    }

    return "";
  }

  function getConnectedPartIdsForNet(netName) {
    return new Set(
      getNetConnections(netName)
        .map((connection) => connection.partId)
        .filter(Boolean)
    );
  }

  function getVisibleNetPins(netName) {
    return getNetConnections(netName)
      .filter((connection) => Boolean(connection.hasCoordinates) && isVisibleForLayer(connection, state.viewerLayer));
  }

  function getVisiblePartPins(partId) {
    return getPartConnections(partId)
      .filter((connection) => Boolean(connection.hasCoordinates) && isVisibleForLayer(connection, state.viewerLayer));
  }

  function buildVisiblePinOverlay(partId, netName, bounds, geometry) {
    const overlayMap = new Map();

    getVisiblePartPins(partId).forEach((connection) => {
      const key = buildConnectionKey(connection);
      overlayMap.set(key, {
        ...connection,
        markerRole: "part",
        boardX: normalizeBoardX(Number(connection.x || 0), bounds, geometry),
        boardY: normalizeBoardY(Number(connection.y || 0), bounds, geometry)
      });
    });

    getVisibleNetPins(netName).forEach((connection) => {
      const key = buildConnectionKey(connection);
      const existing = overlayMap.get(key);
      overlayMap.set(key, {
        ...(existing || connection),
        ...connection,
        markerRole: existing ? "shared" : "net",
        boardX: normalizeBoardX(Number(connection.x || 0), bounds, geometry),
        boardY: normalizeBoardY(Number(connection.y || 0), bounds, geometry)
      });
    });

    return Array.from(overlayMap.values());
  }

  function getSelectedOverlayConnection(runtime) {
    if (!runtime?.visibleNetPins?.length || !state.selectedConnectionKey) {
      return null;
    }

    return runtime.visibleNetPins.find((connection) => (
      buildConnectionKey(connection) === state.selectedConnectionKey
    )) || null;
  }

  function getSelectedOverlayPeers(runtime, limit = 18) {
    const selectedConnection = getSelectedOverlayConnection(runtime);
    if (!selectedConnection?.netName) {
      return [];
    }

    const selectedPartKey = String(selectedConnection.partId || "").toUpperCase();
    return (runtime.visibleNetPins || [])
      .filter((connection) => buildConnectionKey(connection) !== state.selectedConnectionKey)
      .filter((connection) => String(connection.netName || "").toUpperCase() === String(selectedConnection.netName || "").toUpperCase())
      .filter((connection) => String(connection.partId || "").toUpperCase() !== selectedPartKey)
      .sort((left, right) => {
        const leftDistance = Math.hypot(
          Number(left.boardX || 0) - Number(selectedConnection.boardX || 0),
          Number(left.boardY || 0) - Number(selectedConnection.boardY || 0)
        );
        const rightDistance = Math.hypot(
          Number(right.boardX || 0) - Number(selectedConnection.boardX || 0),
          Number(right.boardY || 0) - Number(selectedConnection.boardY || 0)
        );
        return getConnectionPeerPriority(left) - getConnectionPeerPriority(right)
          || compareNaturalText(left.partId, right.partId)
          || compareNaturalText(getConnectionPinDisplay(left), getConnectionPinDisplay(right))
          || (leftDistance - rightDistance);
      })
      .slice(0, Math.max(1, limit));
  }

  function buildPeerDisplayPosition(runtime, selectedConnection, peer) {
    const fallbackX = Number(peer?.boardX || 0);
    const fallbackY = Number(peer?.boardY || 0);
    return {
      boardX: fallbackX,
      boardY: fallbackY
    };
  }

  function getSelectedOverlayPeerDisplays(runtime, limit = 18) {
    const selectedConnection = getSelectedOverlayConnection(runtime);
    if (!selectedConnection) {
      return [];
    }

    return getSelectedOverlayPeers(runtime, limit).map((peer) => ({
      ...peer,
      ...buildPeerDisplayPosition(runtime, selectedConnection, peer)
    }));
  }

  function buildPartPinGeometryMap(bounds, geometry) {
    const partPinsMap = new Map();
    getSessionConnections().forEach((connection) => {
      if (!connection?.hasCoordinates || !connection?.partId || !isVisibleForLayer(connection, state.viewerLayer)) {
        return;
      }

      const sourceX = Number(connection.x);
      const sourceY = Number(connection.y);
      if (!Number.isFinite(sourceX) || !Number.isFinite(sourceY)) {
        return;
      }

      const key = String(connection.partId || "").toUpperCase();
      let entries = partPinsMap.get(key);
      if (!entries) {
        entries = [];
        partPinsMap.set(key, entries);
      }

      entries.push({
        ...connection,
        boardX: normalizeBoardX(sourceX, bounds, geometry),
        boardY: normalizeBoardY(sourceY, bounds, geometry),
        ...(buildBoardPadGeometry(connection, bounds, geometry) || {})
      });
    });

    partPinsMap.forEach((entries) => {
      entries.sort((left, right) =>
        compareNaturalText(getConnectionPinDisplay(left), getConnectionPinDisplay(right))
        || compareNaturalText(left.netName, right.netName)
      );
    });

    return partPinsMap;
  }

  function getSelectablePartIds() {
    return getScene().footprints
      .map((footprint) => footprint.id)
      .filter(Boolean)
      .sort(compareNaturalText);
  }

  function getSelectableNetNames() {
    const netNames = new Set();
    getSessionConnections().forEach((connection) => {
      if (connection?.netName) {
        netNames.add(String(connection.netName));
      }
    });
    getSessionNodes().forEach((node) => {
      if (node?.net) {
        netNames.add(String(node.net));
      }
    });
    return Array.from(netNames).sort(compareNaturalText);
  }

  function findToolbarOptionMatch(rawValue, options, { allowEmpty = false } = {}) {
    const normalizedValue = String(rawValue || "").trim();
    if (allowEmpty && (!normalizedValue || normalizedValue === "-")) {
      return "";
    }

    if (!normalizedValue) {
      return null;
    }

    const exactMatch = options.find((option) => String(option) === normalizedValue);
    if (exactMatch) {
      return exactMatch;
    }

    const foldedValue = normalizedValue.toUpperCase();
    return options.find((option) => String(option).trim().toUpperCase() === foldedValue) || null;
  }

  function findToolbarSearchMatch(rawValue, options, { allowEmpty = false } = {}) {
    const exactMatch = findToolbarOptionMatch(rawValue, options, { allowEmpty });
    if (exactMatch !== null) {
      return exactMatch;
    }

    const normalizedValue = String(rawValue || "").trim().toUpperCase();
    if (!normalizedValue) {
      return null;
    }

    const startsWithMatch = options.find((option) => String(option).trim().toUpperCase().startsWith(normalizedValue));
    if (startsWithMatch) {
      return startsWithMatch;
    }

    return options.find((option) => String(option).trim().toUpperCase().includes(normalizedValue)) || null;
  }

  function applyPartPickerValue(rawValue) {
    const nextPartId = findToolbarOptionMatch(rawValue, getSelectablePartIds());
    if (!nextPartId) {
      render();
      return false;
    }

    state.selectedPreviewNode = nextPartId;
    state.selectedConnectionKey = "";
    state.activePanel = "part";
    render();
    globalScope.requestAnimationFrame(() => {
      focusPartInViewport(nextPartId);
    });
    return true;
  }

  function applyNetPickerValue(rawValue) {
    const nextNetName = findToolbarOptionMatch(rawValue, getSelectableNetNames(), { allowEmpty: true });
    if (nextNetName === null) {
      render();
      return false;
    }

    state.selectedNetName = nextNetName;
    state.selectedConnectionKey = "";
    state.activePanel = nextNetName ? "net" : "part";

    const netConnections = getNetConnections(nextNetName);
    if (!state.selectedPreviewNode && netConnections.length > 0) {
      state.selectedPreviewNode = netConnections[0].partId || state.selectedPreviewNode;
    }

    render();
    return true;
  }

  function getToolbarLayers() {
    const availableSides = getAvailableSides();
    const desktopLayers = ["Top", "Bottom"].filter((layer) => availableSides.includes(layer));
    if (desktopLayers.length > 0) {
      return desktopLayers;
    }

    if (availableSides.includes("Both")) {
      return ["Both"];
    }

    return availableSides.slice(0, 2);
  }

  function getAvailableSides() {
    const sides = Array.isArray(state.session?.availableSides) ? state.session.availableSides.filter(Boolean) : [];
    return sides.length > 0 ? sides : ["Top", "Bottom", "Both"];
  }

  function buildSceneBounds(nodes, segments) {
    const xValues = [];
    const yValues = [];

    nodes.forEach((node) => {
      const sourceX = Number(node?.x);
      const sourceY = Number(node?.y);
      if (Number.isFinite(sourceX)) {
        xValues.push(sourceX);
      }
      if (Number.isFinite(sourceY)) {
        yValues.push(sourceY);
      }
    });

    segments.forEach((segment) => {
      const x1 = Number(segment?.x1);
      const y1 = Number(segment?.y1);
      const x2 = Number(segment?.x2);
      const y2 = Number(segment?.y2);
      if (Number.isFinite(x1)) {
        xValues.push(x1);
      }
      if (Number.isFinite(y1)) {
        yValues.push(y1);
      }
      if (Number.isFinite(x2)) {
        xValues.push(x2);
      }
      if (Number.isFinite(y2)) {
        yValues.push(y2);
      }
    });

    const minX = xValues.length > 0 ? Math.min(...xValues) : 0;
    const maxX = xValues.length > 0 ? Math.max(...xValues) : 100;
    const minY = yValues.length > 0 ? Math.min(...yValues) : 0;
    const maxY = yValues.length > 0 ? Math.max(...yValues) : 100;
    return {
      minX,
      maxX,
      minY,
      maxY,
      spanX: Math.max(1, maxX - minX),
      spanY: Math.max(1, maxY - minY)
    };
  }

  function buildBoardGeometry(bounds) {
    const aspectRatio = clamp(bounds.spanX / Math.max(1, bounds.spanY), 0.58, 2.9);
    let width = boardGeometryDefaults.baseWidth;
    let height = Math.round(width / aspectRatio);

    if (height > boardGeometryDefaults.maxHeight) {
      height = boardGeometryDefaults.maxHeight;
      width = Math.round(height * aspectRatio);
    }

    if (width > boardGeometryDefaults.maxWidth) {
      width = boardGeometryDefaults.maxWidth;
      height = Math.round(width / aspectRatio);
    }

    if (height < boardGeometryDefaults.minHeight) {
      height = boardGeometryDefaults.minHeight;
      width = Math.round(height * aspectRatio);
    }

    if (width < boardGeometryDefaults.minWidth) {
      width = boardGeometryDefaults.minWidth;
      height = Math.round(width / aspectRatio);
    }

    width = clamp(width, boardGeometryDefaults.minWidth, boardGeometryDefaults.maxWidth);
    height = clamp(height, boardGeometryDefaults.minHeight, boardGeometryDefaults.maxHeight);

    const paddingX = clamp(Math.round(width * 0.062), boardGeometryDefaults.minPaddingX, boardGeometryDefaults.maxPaddingX);
    const paddingY = clamp(Math.round(height * 0.072), boardGeometryDefaults.minPaddingY, boardGeometryDefaults.maxPaddingY);
    const boardX = Math.round(paddingX * 0.44);
    const boardY = Math.round(paddingY * 0.46);
    const boardWidth = width - (boardX * 2);
    const boardHeight = height - (boardY * 2);
    const innerX = paddingX;
    const innerY = paddingY;
    const innerWidth = width - (paddingX * 2);
    const innerHeight = height - (paddingY * 2);
    return {
      width,
      height,
      paddingX,
      paddingY,
      boardX,
      boardY,
      boardWidth,
      boardHeight,
      innerX,
      innerY,
      innerWidth,
      innerHeight,
      shadowOffset: Math.max(12, Math.round(Math.min(width, height) * 0.012)),
      aspectRatio
    };
  }

  function normalizeBoardX(value, bounds, geometry) {
    return geometry.innerX + (((value - bounds.minX) / bounds.spanX) * geometry.innerWidth);
  }

  function normalizeBoardY(value, bounds, geometry) {
    return geometry.innerY + (((value - bounds.minY) / bounds.spanY) * geometry.innerHeight);
  }

  function normalizeBoardSpanX(value, bounds, geometry) {
    return (Math.abs(value) / bounds.spanX) * geometry.innerWidth;
  }

  function normalizeBoardSpanY(value, bounds, geometry) {
    return (Math.abs(value) / bounds.spanY) * geometry.innerHeight;
  }

  function getPadAxisAlignedHalfExtents(width, height, rotationDegrees = 0) {
    const safeWidth = Math.max(0, Number(width) || 0);
    const safeHeight = Math.max(0, Number(height) || 0);
    if (!(safeWidth > 0) || !(safeHeight > 0)) {
      return { halfX: 0, halfY: 0 };
    }

    const radians = normalizeRotationDegrees(rotationDegrees) * (Math.PI / 180);
    const absCos = Math.abs(Math.cos(radians));
    const absSin = Math.abs(Math.sin(radians));
    const halfWidth = safeWidth / 2;
    const halfHeight = safeHeight / 2;
    return {
      halfX: (halfWidth * absCos) + (halfHeight * absSin),
      halfY: (halfWidth * absSin) + (halfHeight * absCos)
    };
  }

  function buildBoardPadGeometry(connection, bounds, geometry) {
    const sourcePadWidth = Number(connection?.padWidth || 0);
    const sourcePadHeight = Number(connection?.padHeight || 0);
    if (!(sourcePadWidth > 0) || !(sourcePadHeight > 0)) {
      return null;
    }

    return {
      boardPadWidth: Math.max(1.4, normalizeBoardSpanX(sourcePadWidth, bounds, geometry)),
      boardPadHeight: Math.max(1.4, normalizeBoardSpanY(sourcePadHeight, bounds, geometry)),
      boardPadRotation: normalizeRotationDegrees(connection?.padRotation || 0)
    };
  }

  function buildPartPinBounds(partPins) {
    const validPins = Array.isArray(partPins)
      ? partPins.filter((pin) =>
        Number.isFinite(Number(pin?.boardX))
        && Number.isFinite(Number(pin?.boardY)))
      : [];
    if (validPins.length === 0) {
      return null;
    }

    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let totalPadMajor = 0;
    let totalPadMinor = 0;
    let measuredPadCount = 0;

    validPins.forEach((pin) => {
      const boardX = Number(pin.boardX || 0);
      const boardY = Number(pin.boardY || 0);
      const boardPadWidth = Number(pin.boardPadWidth || 0);
      const boardPadHeight = Number(pin.boardPadHeight || 0);
      if (boardPadWidth > 0 && boardPadHeight > 0) {
        const extents = getPadAxisAlignedHalfExtents(
          boardPadWidth,
          boardPadHeight,
          Number(pin.boardPadRotation || 0)
        );
        minX = Math.min(minX, boardX - extents.halfX);
        maxX = Math.max(maxX, boardX + extents.halfX);
        minY = Math.min(minY, boardY - extents.halfY);
        maxY = Math.max(maxY, boardY + extents.halfY);
        totalPadMajor += Math.max(boardPadWidth, boardPadHeight);
        totalPadMinor += Math.min(boardPadWidth, boardPadHeight);
        measuredPadCount += 1;
        return;
      }

      minX = Math.min(minX, boardX);
      maxX = Math.max(maxX, boardX);
      minY = Math.min(minY, boardY);
      maxY = Math.max(maxY, boardY);
    });

    return {
      pins: validPins,
      minX,
      maxX,
      minY,
      maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
      spanX: Math.max(1.2, maxX - minX),
      spanY: Math.max(1.2, maxY - minY),
      avgPadMajor: measuredPadCount > 0 ? (totalPadMajor / measuredPadCount) : 0,
      avgPadMinor: measuredPadCount > 0 ? (totalPadMinor / measuredPadCount) : 0
    };
  }

  function buildPinTopologyMetrics(pinBounds) {
    if (!pinBounds?.pins?.length) {
      return null;
    }

    const pinCount = pinBounds.pins.length;
    const bucketSize = Math.max(
      1.2,
      Math.min(
        Math.max(pinBounds.avgPadMinor || 0, 0),
        Math.max(pinBounds.avgPadMajor || 0, 0),
        7.2
      ) * 0.9
    );
    const xBuckets = new Set();
    const yBuckets = new Set();
    const edgeInsetX = Math.max(bucketSize * 1.1, pinBounds.spanX * 0.08);
    const edgeInsetY = Math.max(bucketSize * 1.1, pinBounds.spanY * 0.08);
    const perimeterInsetX = Math.max(bucketSize * 1.2, pinBounds.spanX * 0.12);
    const perimeterInsetY = Math.max(bucketSize * 1.2, pinBounds.spanY * 0.12);
    let interiorCount = 0;
    let perimeterCount = 0;
    let horizontalEdgeCount = 0;
    let verticalEdgeCount = 0;

    pinBounds.pins.forEach((pin) => {
      const boardX = Number(pin.boardX || 0);
      const boardY = Number(pin.boardY || 0);
      xBuckets.add(Math.round(boardX / bucketSize));
      yBuckets.add(Math.round(boardY / bucketSize));
      const nearLeft = boardX <= (pinBounds.minX + perimeterInsetX);
      const nearRight = boardX >= (pinBounds.maxX - perimeterInsetX);
      const nearTop = boardY <= (pinBounds.minY + perimeterInsetY);
      const nearBottom = boardY >= (pinBounds.maxY - perimeterInsetY);
      if (nearLeft || nearRight || nearTop || nearBottom) {
        perimeterCount += 1;
      }
      if (nearLeft || nearRight) {
        verticalEdgeCount += 1;
      }
      if (nearTop || nearBottom) {
        horizontalEdgeCount += 1;
      }
      if (boardX > (pinBounds.minX + edgeInsetX)
        && boardX < (pinBounds.maxX - edgeInsetX)
        && boardY > (pinBounds.minY + edgeInsetY)
        && boardY < (pinBounds.maxY - edgeInsetY)) {
        interiorCount += 1;
      }
    });

    const uniqueXCount = xBuckets.size;
    const uniqueYCount = yBuckets.size;
    const gridSlots = Math.max(1, uniqueXCount * uniqueYCount);
    const interiorRatio = interiorCount / Math.max(1, pinCount);
    const perimeterRatio = perimeterCount / Math.max(1, pinCount);
    const occupancyRatio = pinCount / gridSlots;
    const isDenseArrayPackage = pinCount >= 24
      && uniqueXCount >= 4
      && uniqueYCount >= 4
      && interiorRatio >= 0.14
      && occupancyRatio >= 0.32;
    const isPerimeterPackage = pinCount >= 8
      && uniqueXCount >= 2
      && uniqueYCount >= 2
      && interiorRatio <= 0.08
      && perimeterRatio >= 0.72;

    return {
      uniqueXCount,
      uniqueYCount,
      interiorRatio,
      occupancyRatio,
      perimeterRatio,
      horizontalEdgeCount,
      verticalEdgeCount,
      isDenseArrayPackage,
      isPerimeterPackage
    };
  }

  function buildPartFootprintMetricsMap(nodes, bounds, geometry) {
    const componentLookup = new Map(
      nodes
        .filter((node) => Boolean(node?.id))
        .map((node) => [String(node.id || "").toUpperCase(), node])
    );
    const metrics = new Map();

    nodes.forEach((node) => {
      if (!node?.id || !node?.hasMeasuredGeometry) {
        return;
      }

      const sourceWidth = Number(node.width || 0);
      const sourceHeight = Number(node.height || 0);
      if (!(sourceWidth > 0) && !(sourceHeight > 0)) {
        return;
      }

      metrics.set(
        String(node.id || "").toUpperCase(),
        deriveMeasuredFootprintMetrics(
          node,
          Number(node.padCount || 0),
          normalizeBoardSpanX(sourceWidth, bounds, geometry),
          normalizeBoardSpanY(sourceHeight, bounds, geometry),
          Number(node.rotation || 0)
        )
      );
    });

    const grouped = new Map();

    getSessionConnections().forEach((connection) => {
      if (!connection?.hasCoordinates || !connection?.partId) {
        return;
      }

      const key = String(connection.partId || "").toUpperCase();
      if (metrics.has(key)) {
        return;
      }
      const sourceX = Number(connection.x);
      const sourceY = Number(connection.y);
      if (!Number.isFinite(sourceX) || !Number.isFinite(sourceY)) {
        return;
      }

      let current = grouped.get(key);
      if (!current) {
        current = {
          minX: sourceX,
          maxX: sourceX,
          minY: sourceY,
          maxY: sourceY,
          padCount: 0,
          node: componentLookup.get(key) || null
        };
        grouped.set(key, current);
      }

      current.minX = Math.min(current.minX, sourceX);
      current.maxX = Math.max(current.maxX, sourceX);
      current.minY = Math.min(current.minY, sourceY);
      current.maxY = Math.max(current.maxY, sourceY);
      current.padCount += 1;
    });

    grouped.forEach((current, key) => {
      metrics.set(
        key,
        deriveMeasuredFootprintMetrics(
          current.node,
          current.padCount,
          normalizeBoardSpanX(current.maxX - current.minX, bounds, geometry),
          normalizeBoardSpanY(current.maxY - current.minY, bounds, geometry),
          Number(current.node?.rotation || 0)
        )
      );
    });

    return metrics;
  }

  function deriveMeasuredFootprintMetrics(node, padCount, rawWidth, rawHeight, rotationOverride = 0) {
    const signature = buildFootprintSignature(node);
    const isPassive = /0603|0402|0805|R\d|C\d|L\d|D\d|LED/.test(signature);
    const isConnector = /SMARTMATRIX|ESP32|HEADER|J\d|CN\d|CONN|1X\d|PORT/.test(signature);
    const isSocket = /MICROSD|SOCKET|SLOT/.test(signature);
    const isJumper = /JUMPER|JP\d/.test(signature);
    const isHole = /STAND-OFF|MOUNT|HOLE|H\d/.test(signature);
    const dominantSpan = Math.max(rawWidth, rawHeight);
    const minorSpan = Math.min(rawWidth, rawHeight);
    const horizontal = rawWidth >= rawHeight;
    let width = Math.max(rawWidth, padCount <= 2 ? 8 : 12);
    let height = Math.max(rawHeight, padCount <= 2 ? 8 : 12);
    let rotation = Number.isFinite(rotationOverride) ? rotationOverride : (horizontal ? 0 : 90);

    if (isHole) {
      const diameter = Math.max(dominantSpan, 10);
      width = diameter;
      height = diameter;
      rotation = 0;
    } else if ((isPassive || isJumper) && padCount <= 4) {
      const major = Math.max(dominantSpan * 0.84, 14);
      const minor = Math.max(Math.max(minorSpan, major * 0.28), 6);
      width = horizontal ? major : minor;
      height = horizontal ? minor : major;
    } else if (isConnector || isSocket) {
      const major = Math.max(dominantSpan * 1.02, isSocket ? 40 : 26);
      const minor = Math.max(Math.max(minorSpan, major * (isSocket ? 0.34 : 0.18)), isSocket ? 16 : 8);
      width = horizontal ? major : minor;
      height = horizontal ? minor : major;
    } else {
      const major = Math.max(dominantSpan * 0.94, 18);
      const minor = Math.max(Math.max(minorSpan, major * 0.32), 10);
      width = horizontal ? major : minor;
      height = horizontal ? minor : major;
    }

    const textSize = clamp(
      Math.round(Math.min(width, height) * (isPassive ? 0.68 : isConnector ? 0.34 : 0.46)),
      isPassive ? 7 : 8,
      isConnector ? 18 : 30
    );

    return {
      width,
      height,
      rotation,
      padCount,
      textSize,
      hasMeasuredGeometry: true
    };
  }

  function normalizeNodes(nodes, bounds, geometry, partMetricsMap = null) {
    if (nodes.length === 0) {
      return defaultNodes.map((node) => ({
        ...node,
        boardX: geometry.width / 2,
        boardY: geometry.height / 2
      }));
    }

    return nodes.map((node, index) => {
      const sourceX = Number(node.x ?? 50);
      const sourceY = Number(node.y ?? 50);
      const measuredMetrics = partMetricsMap?.get(String(node.id || "").toUpperCase()) || null;
      return {
        ...node,
        sourceIndex: index,
        width: measuredMetrics?.width || Number(node.width || 0),
        height: measuredMetrics?.height || Number(node.height || 0),
        rotation: measuredMetrics?.rotation ?? Number(node.rotation || 0),
        padCount: measuredMetrics?.padCount || Number(node.padCount || 0),
        textSize: measuredMetrics?.textSize || Number(node.textSize || 0),
        hasMeasuredGeometry: Boolean(measuredMetrics?.hasMeasuredGeometry),
        boardX: Number.isFinite(sourceX) ? normalizeBoardX(sourceX, bounds, geometry) : (geometry.width / 2),
        boardY: Number.isFinite(sourceY) ? normalizeBoardY(sourceY, bounds, geometry) : (geometry.height / 2)
      };
    });
  }

  function normalizeOutlineSegments(segments, bounds, geometry) {
    return segments.map((segment, index) => {
      const sourceX1 = Number(segment.x1 ?? 0);
      const sourceY1 = Number(segment.y1 ?? 0);
      const sourceX2 = Number(segment.x2 ?? 0);
      const sourceY2 = Number(segment.y2 ?? 0);
      return {
        ...segment,
        sourceIndex: index,
        boardX1: normalizeBoardX(sourceX1, bounds, geometry),
        boardY1: normalizeBoardY(sourceY1, bounds, geometry),
        boardX2: normalizeBoardX(sourceX2, bounds, geometry),
        boardY2: normalizeBoardY(sourceY2, bounds, geometry)
      };
    });
  }

  function inferFootprint(node) {
    const signature = buildFootprintSignature(node);
    const hash = hashString(signature);
    let kind = "chip";
    let width = Number(node.width || 0);
    let height = Number(node.height || 0);
    let rotation = Number(node.rotation || 0);
    let padCount = Number(node.padCount || 0);
    const hasMeasuredGeometry = Boolean(node.hasMeasuredGeometry) && width > 0 && height > 0;

    if (/STAND-OFF|MOUNT|HOLE|H\d/.test(signature)) {
      kind = "hole";
      if (!hasMeasuredGeometry) {
        width = 22;
        height = 22;
        padCount = 0;
      }
    } else if (/MICROSD|SOCKET|SLOT/.test(signature)) {
      kind = "socket";
      if (!hasMeasuredGeometry) {
        width = 142;
        height = 60;
        padCount = 10;
      }
    } else if (/SMARTMATRIX|ESP32|HEADER|J\d|CN\d|CONN|1X\d|PORT/.test(signature)) {
      kind = "connector";
      if (!hasMeasuredGeometry) {
        width = /ESP32|SMARTMATRIX/.test(signature) ? 168 : 104;
        height = /ESP32|SMARTMATRIX/.test(signature) ? 24 : 18;
        padCount = /ESP32|SMARTMATRIX/.test(signature) ? 20 : 8;
        rotation = hash % 2 === 0 ? 90 : 0;
      }
    } else if (/0603|0402|0805|R\d|C\d|L\d|D\d|LED/.test(signature)) {
      kind = "passive";
      if (!hasMeasuredGeometry) {
        width = /0805|SOD/.test(signature) ? 28 : 20;
        height = /0805|SOD/.test(signature) ? 14 : 9;
        padCount = 2;
        rotation = hash % 2 === 0 ? 90 : 0;
      }
    } else if (/JUMPER|JP\d/.test(signature)) {
      kind = "jumper";
      if (!hasMeasuredGeometry) {
        width = 32;
        height = 10;
        padCount = 2;
        rotation = hash % 2 === 0 ? 90 : 0;
      }
    } else if (/SO16|TSSOP|QFN|QFP|SOT23|IC|UC|U\d/.test(signature)) {
      kind = "chip";
      if (!hasMeasuredGeometry) {
        width = /TSSOP|SO16/.test(signature) ? 82 : 64;
        height = /TSSOP|SO16/.test(signature) ? 46 : 36;
        padCount = /SO16|TSSOP/.test(signature) ? 16 : 8;
        rotation = hash % 2 === 0 ? 90 : 0;
      }
    }

    if (width <= 0) {
      width = 68;
    }
    if (height <= 0) {
      height = 40;
    }
    if (padCount <= 0 && kind !== "hole") {
      padCount = 8;
    }

    const textSize = Number(node.textSize || 0) > 0
      ? Number(node.textSize || 0)
      : clamp(
        Math.round(Math.min(width, height) * (kind === "passive" ? 0.62 : kind === "connector" ? 0.34 : 0.42)),
        kind === "passive" ? 7 : 8,
        kind === "chip" ? 28 : 18
      );
    const assetKey = resolveComponentAssetKey(
      signature,
      getDefaultComponentAssetKey(kind),
      { kind, shapeKind: kind }
    );

    return {
      ...node,
      kind,
      assetKey,
      width,
      height,
      rotation,
      padCount,
      textSize
    };
  }

  function isVisibleForLayer(node, layer) {
    const nodeLayer = String(node.layer || "Both");
    return layer === "Both" || nodeLayer === layer || nodeLayer === "Both";
  }

  function buildSceneCacheKey() {
    return `${state.session?.sessionId || ""}::${state.viewerLayer || "Both"}`;
  }

  function clearSceneCache() {
    sceneCacheKey = "";
    sceneCacheValue = null;
    stageRenderSnapshot = null;
    stageBaseCacheSignature = "";
    stageBaseCacheCanvas = null;
  }

  function buildScene() {
    const rawNodes = getSessionNodes();
    const rawOutlineSegments = getSessionOutlineSegments();
    const bounds = buildSceneBounds(rawNodes, rawOutlineSegments);
    const geometry = buildBoardGeometry(bounds);
    const partMetricsMap = buildPartFootprintMetricsMap(rawNodes, bounds, geometry);
    const partPinsMap = buildPartPinGeometryMap(bounds, geometry);
    const footprints = normalizeNodes(rawNodes, bounds, geometry, partMetricsMap).map(inferFootprint);
    const visibleFootprints = footprints.filter((node) => isVisibleForLayer(node, state.viewerLayer));
    const outlineSegments = normalizeOutlineSegments(rawOutlineSegments, bounds, geometry)
      .filter((segment) => isVisibleForLayer(segment, state.viewerLayer));
    return {
      bounds,
      geometry,
      footprints,
      visibleFootprints,
      partPinsMap,
      outlineSegments,
      traces: []
    };
  }

  function getScene() {
    const cacheKey = buildSceneCacheKey();
    if (sceneCacheValue && sceneCacheKey === cacheKey) {
      return sceneCacheValue;
    }

    sceneCacheKey = cacheKey;
    sceneCacheValue = buildScene();
    return sceneCacheValue;
  }

  function buildRenderProfile(scene) {
    const visibleCount = scene.visibleFootprints.length;
    const interacting = Boolean(state.interacting);
    const zoomAwareLabelScale = Math.pow(clamp(state.zoom, zoomLimits.min, 2.8), 0.16);
    const useSimplifiedFootprints = (
      (visibleCount >= 5200 && state.zoom <= 0.64)
      || (visibleCount >= 3200 && state.zoom <= 0.42)
      || (interacting && visibleCount >= 2600 && state.zoom <= 0.82)
    );

    return {
      simplifiedFootprints: useSimplifiedFootprints,
      showPads: !interacting || state.zoom >= 0.54,
      showText: true,
      outlineStride: visibleCount >= 4200 ? 2 : 1,
      footprintScale: useSimplifiedFootprints
        ? clamp(0.78 + (state.zoom * 0.18), 0.78, 0.96)
        : clamp(0.84 + (state.zoom * 0.14), 0.84, 1.02),
      labelScale: clamp((0.84 + (state.zoom * 0.18)) * zoomAwareLabelScale, 0.8, 1.16)
    };
  }

  function buildTraceSegments(footprints) {
    if (footprints.length > 520) {
      return [];
    }

    const traceSources = footprints.length > 260
      ? footprints.filter((_, index) => index % Math.ceil(footprints.length / 260) === 0)
      : footprints;
    const pairKeys = new Set();
    const segments = [];

    traceSources.forEach((current) => {
      const neighbors = traceSources
        .filter((candidate) => candidate.id !== current.id)
        .map((candidate) => {
          const deltaX = candidate.boardX - current.boardX;
          const deltaY = candidate.boardY - current.boardY;
          return {
            candidate,
            distance: Math.sqrt((deltaX * deltaX) + (deltaY * deltaY))
          };
        })
        .sort((left, right) => left.distance - right.distance)
        .slice(0, current.kind === "connector" ? 3 : 2);

      neighbors.forEach(({ candidate, distance }, neighborIndex) => {
        if (distance > 360) {
          return;
        }

        const key = [current.id, candidate.id].sort().join("::");
        if (pairKeys.has(key)) {
          return;
        }
        pairKeys.add(key);

        const curveBias = ((hashString(`${current.id}:${candidate.id}`) % 3) - 1) * 26;
        const midX = ((current.boardX + candidate.boardX) / 2) + curveBias;
        segments.push({
          key,
          strong: current.kind === "connector" || candidate.kind === "connector" || neighborIndex === 0,
          pathData: [
            `M ${current.boardX.toFixed(1)} ${current.boardY.toFixed(1)}`,
            `L ${midX.toFixed(1)} ${current.boardY.toFixed(1)}`,
            `L ${midX.toFixed(1)} ${candidate.boardY.toFixed(1)}`,
            `L ${candidate.boardX.toFixed(1)} ${candidate.boardY.toFixed(1)}`
          ].join(" ")
        });
      });
    });

    return segments;
  }

  function getCanvasQualityBoost(scene) {
    const visibleCount = Number(scene?.visibleFootprints?.length || 0);
    const zoomBoost = clamp(
      1 + (Math.log2(clamp(state.zoom, 1, zoomLimits.max)) * 0.14),
      1,
      1.74
    );
    const baseIdleBoost = visibleCount >= 3200
      ? 1.08
      : visibleCount >= 2200
        ? 1.18
        : visibleCount >= 1400
          ? 1.28
          : 1.44;
    if (state.interacting) {
      return 1;
    }
    return state.idleSharp
      ? clamp(baseIdleBoost * zoomBoost * 1.16, 1.15, 2.72)
      : clamp(baseIdleBoost * zoomBoost, 1.08, 2.26);
  }

  function getFootprintRenderMetrics(footprint, activeId, renderProfile, connectedPartIds) {
    const isActive = footprint.id === activeId;
    const isNetHit = connectedPartIds.has(footprint.id);
    const componentArea = Math.max(1, footprint.width * footprint.height);
    const componentScale = clamp(Math.pow(componentArea / 2400, 0.12), 0.82, footprint.kind === "hole" ? 1.08 : 1.02);
    const footprintScale = isActive
      ? Math.max(renderProfile.footprintScale * componentScale, 0.96)
      : (renderProfile.footprintScale * componentScale);
    const componentLabelScale = clamp(
      Math.pow(componentArea / 1800, 0.1),
      0.78,
      isPriorityLabelFootprint(footprint) ? 1.06 : 0.98
    );
    const labelScale = isActive
      ? Math.max(renderProfile.labelScale * componentLabelScale, 0.96)
      : (renderProfile.labelScale * componentLabelScale);

    return {
      isActive,
      isNetHit,
      showLabel: Boolean(renderProfile.showText),
      footprintScale,
      labelScale,
      pointRadius: footprint.kind === "connector"
        ? 7.8
        : footprint.kind === "hole"
          ? 6.8
          : 4.8
    };
  }

  function isPriorityLabelFootprint(footprint) {
    const signature = buildFootprintSignature(footprint);
    return footprint?.kind === "connector"
      || footprint?.kind === "socket"
      || footprint?.kind === "hole"
      || /^U[A-Z]{0,3}\d|^PU[A-Z]{0,3}\d|^J[A-Z]{0,4}\d|^PJ[A-Z]{0,4}\d|^PL[A-Z]{0,3}\d|^CN[A-Z]{0,3}\d|^USB|^LAN|^HDMI|^VGA|^CPU|^KBC|^PCH/.test(signature);
  }

  function shouldRenderBodyLabel(footprint, width, height, fontSize, options = {}) {
    if (options.forceVisible) {
      return true;
    }

    if (state.interacting) {
      return false;
    }

    const priority = isPriorityLabelFootprint(footprint);
    const signature = buildFootprintSignature(footprint);
    const packageHint = getFootprintPackageHint(signature);
    const shortSide = Math.max(0, Math.min(width, height));
    const longSide = Math.max(0, Math.max(width, height));
    const zoomFactor = getCurrentStageScreenScale();
    const apparentShortSide = shortSide * zoomFactor;
    const apparentLongSide = longSide * zoomFactor;
    if (priority) {
      return apparentLongSide >= 24 && apparentShortSide >= 6.8 && fontSize >= 5.6;
    }

    if (footprint?.kind === "passive" || ["0201", "0402", "0603", "0805", "1206"].includes(packageHint)) {
      return apparentLongSide >= 42 && apparentShortSide >= 8.4 && fontSize >= 6;
    }

    return apparentShortSide >= 9.2 && apparentLongSide >= 28 && fontSize >= 6;
  }

  function shouldRenderMeasuredBody(footprint, shape, width, height, options = {}) {
    if (footprint?.kind === "hole" || options.forceVisible) {
      return true;
    }

    const apparentShortSide = Math.min(width, height) * clamp(state.zoom, zoomLimits.min, zoomLimits.max);
    const apparentLongSide = Math.max(width, height) * clamp(state.zoom, zoomLimits.min, zoomLimits.max);

    if (shape.shapeKind === "dense-chip") {
      return true;
    }

    if (isPriorityLabelFootprint(footprint)) {
      return apparentLongSide >= 10.8;
    }

    if (shape.shapeKind === "passive") {
      return apparentLongSide >= 10.8 && apparentShortSide >= 3.2;
    }

    if (shape.shapeKind === "triad") {
      return apparentLongSide >= 10 && apparentShortSide >= 3.4;
    }

    return apparentLongSide >= 9.4 && apparentShortSide >= 4.2;
  }

  function traceRoundedRectPath(context, x, y, width, height, radius) {
    const boundedRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
    context.beginPath();
    context.moveTo(x + boundedRadius, y);
    context.lineTo(x + width - boundedRadius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + boundedRadius);
    context.lineTo(x + width, y + height - boundedRadius);
    context.quadraticCurveTo(x + width, y + height, x + width - boundedRadius, y + height);
    context.lineTo(x + boundedRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - boundedRadius);
    context.lineTo(x, y + boundedRadius);
    context.quadraticCurveTo(x, y, x + boundedRadius, y);
    context.closePath();
  }

  function fillRectPath(context, x, y, width, height) {
    context.beginPath();
    context.rect(x, y, width, height);
    context.closePath();
  }

  function fillPadRect(context, x, y, width, height) {
    fillRectPath(context, x, y, width, height);
    context.fill();
  }

  function traceRoundedRectOnPath(path, x, y, width, height, radius) {
    const boundedRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
    path.moveTo(x + boundedRadius, y);
    path.lineTo(x + width - boundedRadius, y);
    path.quadraticCurveTo(x + width, y, x + width, y + boundedRadius);
    path.lineTo(x + width, y + height - boundedRadius);
    path.quadraticCurveTo(x + width, y + height, x + width - boundedRadius, y + height);
    path.lineTo(x + boundedRadius, y + height);
    path.quadraticCurveTo(x, y + height, x, y + height - boundedRadius);
    path.lineTo(x, y + boundedRadius);
    path.quadraticCurveTo(x, y, x + boundedRadius, y);
    path.closePath();
  }

  function appendAssetShapePath(path, descriptor) {
    if (!path || !descriptor) {
      return;
    }

    const shapeType = String(descriptor.type || "rounded-rect");
    const widthRatio = Number(descriptor.widthRatio || 1);
    const heightRatio = Number(descriptor.heightRatio || 1);
    const halfWidth = widthRatio / 2;
    const halfHeight = heightRatio / 2;

    if (shapeType === "circle") {
      const radius = clamp(Number(descriptor.radius || 0.5), 0.05, 0.5);
      path.moveTo(radius, 0);
      path.arc(0, 0, radius, 0, Math.PI * 2);
      path.closePath();
      return;
    }

    if (shapeType === "trapezoid") {
      const taperRatio = clamp(Number(descriptor.taperRatio || 0.78), 0.4, 1);
      const topHalfWidth = halfWidth * taperRatio;
      path.moveTo(-topHalfWidth, -halfHeight);
      path.lineTo(topHalfWidth, -halfHeight);
      path.lineTo(halfWidth, halfHeight);
      path.lineTo(-halfWidth, halfHeight);
      path.closePath();
      return;
    }

    const cornerRatio = shapeType === "capsule"
      ? 0.5
      : clamp(Number(descriptor.cornerRatio || (shapeType === "rail" ? 0.16 : 0.18)), 0.02, 0.5);
    const radius = Math.min(halfWidth, halfHeight) * cornerRatio * 2;
    traceRoundedRectOnPath(path, -halfWidth, -halfHeight, widthRatio, heightRatio, radius);
  }

  function getCachedComponentAssetPaths(assetKey) {
    if (componentAssetPathCache.has(assetKey)) {
      return componentAssetPathCache.get(assetKey);
    }

    if (typeof globalScope.Path2D !== "function") {
      componentAssetPathCache.set(assetKey, null);
      return null;
    }

    const asset = getComponentAssetDefinition(assetKey);
    if (!asset?.body) {
      componentAssetPathCache.set(assetKey, null);
      return null;
    }

    const bodyPath = new globalScope.Path2D();
    appendAssetShapePath(bodyPath, asset.body);

    let detailPath = null;
    if (asset.detail) {
      detailPath = new globalScope.Path2D();
      appendAssetShapePath(detailPath, asset.detail);
    }

    const cachedValue = { bodyPath, detailPath, asset };
    componentAssetPathCache.set(assetKey, cachedValue);
    return cachedValue;
  }

  function drawCachedComponentBody(context, assetKey, width, height, palette, options = {}) {
    const cachedPaths = getCachedComponentAssetPaths(assetKey);
    if (!cachedPaths?.bodyPath) {
      return false;
    }

    const scaleX = Math.max(1, Number(width || 0));
    const scaleY = Math.max(1, Number(height || 0));
    const lineScale = Math.max(scaleX, scaleY);

    context.save();
    context.scale(scaleX, scaleY);
    context.fillStyle = palette.bodyFill;
    context.strokeStyle = palette.bodyStroke;
    context.lineWidth = (palette.bodyLineWidth || 1.05) / lineScale;
    context.fill(cachedPaths.bodyPath);
    context.stroke(cachedPaths.bodyPath);

    if (cachedPaths.detailPath) {
      if (Object.prototype.hasOwnProperty.call(options, "detailFillStyle") && options.detailFillStyle) {
        context.fillStyle = options.detailFillStyle;
        context.fill(cachedPaths.detailPath);
      }
      context.strokeStyle = options.detailStrokeStyle || palette.holeInnerStroke || palette.bodyStroke;
      context.lineWidth = Number(options.detailLineWidth || 0.85) / lineScale;
      context.stroke(cachedPaths.detailPath);
    }

    drawComponentAssetDecorations(context, assetKey, cachedPaths.asset, palette, lineScale, options);

    context.restore();
    return true;
  }

  function drawComponentAssetDecorations(context, assetKey, asset, palette, lineScale, options = {}) {
    if (!assetKey) {
      return;
    }

    const accentStroke = options.markerStrokeStyle || palette.holeInnerStroke || palette.bodyStroke;
    const accentFill = options.markerFillStyle || palette.labelFill || palette.bodyStroke;
    const bodyFill = palette.bodyFill;
    const lineWidth = Math.max(0.018, Number(options.markerLineWidth || 0.72) / Math.max(1, lineScale));

    context.save();
    context.lineWidth = lineWidth;
    context.strokeStyle = accentStroke;
    context.fillStyle = accentFill;

    if (assetKey === "diode-inline") {
      context.beginPath();
      context.moveTo(0.12, -0.34);
      context.lineTo(0.12, 0.34);
      context.stroke();
    } else if (assetKey === "jumper-inline") {
      context.beginPath();
      context.moveTo(-0.18, 0);
      context.lineTo(0.18, 0);
      context.stroke();
    } else if (assetKey === "connector-rail") {
      context.beginPath();
      context.moveTo(-0.42, -0.16);
      context.lineTo(0.42, -0.16);
      context.moveTo(-0.42, 0.16);
      context.lineTo(0.42, 0.16);
      context.stroke();
    } else if (assetKey === "socket-slot") {
      context.beginPath();
      context.arc(-0.34, -0.22, 0.045, 0, Math.PI * 2);
      context.fill();
    } else if (assetKey === "triad-sot") {
      context.beginPath();
      context.arc(-0.18, -0.12, 0.05, 0, Math.PI * 2);
      context.fill();
    } else if (assetKey === "chip-bga" || assetKey === "chip-generic" || assetKey === "chip-elongated") {
      if (!options.showOrientationMarker) {
        context.restore();
        return;
      }
      context.beginPath();
      context.arc(-0.26, -0.2, 0.04, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.moveTo(-0.18, -0.32);
      context.lineTo(0.18, -0.32);
      context.stroke();
      if (assetKey === "chip-elongated") {
        context.fillStyle = bodyFill;
        context.strokeStyle = accentStroke;
        context.beginPath();
        context.rect(-0.13, -0.08, 0.26, 0.16);
        context.fill();
        context.stroke();
      }
    } else if (assetKey === "test-pad") {
      context.beginPath();
      context.arc(0, 0, 0.11, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }

  function drawFootprintPadsCanvas(context, footprint, renderProfile) {
    if (!renderProfile.showPads || footprint.padCount <= 0 || footprint.kind === "hole") {
      return;
    }

    const half = Math.max(1, Math.floor(footprint.padCount / 2));
    if (footprint.kind === "passive" || footprint.kind === "jumper") {
      fillPadRect(context, (-footprint.width / 2) - 12, -4.6, 12, 9.2);
      fillPadRect(context, footprint.width / 2, -4.6, 12, 9.2);
      return;
    }

    if (footprint.kind === "connector" || footprint.kind === "socket") {
      const step = footprint.width / Math.max(half, 1);
      for (let index = 0; index < half; index += 1) {
        const x = (-footprint.width / 2) + (step * index) + (step * 0.18);
        const padWidth = Math.max(6.5, step * 0.42);
        fillPadRect(context, x, (footprint.height / 2) - 2.3, padWidth, 10.4);
        if (footprint.kind === "socket") {
          fillPadRect(context, x, (-footprint.height / 2) - 8.1, padWidth, 8.1);
        }
      }
      return;
    }

    const step = footprint.height / Math.max(half, 1);
    for (let index = 0; index < half; index += 1) {
      const y = (-footprint.height / 2) + (step * index) + (step * 0.18);
      const padHeight = Math.max(6.5, step * 0.42);
      fillPadRect(context, (-footprint.width / 2) - 10.4, y, 10.4, padHeight);
      fillPadRect(context, footprint.width / 2, y, 10.4, padHeight);
    }
  }

  function drawFootprintLabelCanvas(context, footprint, metrics, fillStyle, yOffset = 2, fontSizeOverride = null, options = {}) {
    if (!metrics.showLabel) {
      return;
    }

    const bodyWidth = Math.max(4, Number(options.bodyWidth || footprint.width || 0));
    const bodyHeight = Math.max(4, Number(options.bodyHeight || footprint.height || 0));
    const forceVisible = Boolean(options.forceVisible || metrics.isActive || metrics.isNetHit);
    const resolvedFontSize = clamp(
      Math.min(
        Number(fontSizeOverride || footprint.textSize || 11),
        Math.max(5.4, Math.min(bodyWidth, bodyHeight) * Number(options.maxFontRatio || 0.76))
      ),
      5.2,
      16.2
    );
    if (!shouldRenderBodyLabel(
      footprint,
      bodyWidth * Math.max(metrics.footprintScale, 0.0001),
      bodyHeight * Math.max(metrics.footprintScale, 0.0001),
      resolvedFontSize * Math.max(metrics.labelScale, 0.0001),
      { forceVisible }
    )) {
      return;
    }

    context.save();
    context.scale(metrics.labelScale, metrics.labelScale);
    context.fillStyle = fillStyle;
    context.font = `${resolvedFontSize}px Consolas, "Courier New", monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    const labelText = String(footprint.id || "");
    const shouldClipToBody = options.clipToBody !== false && Math.abs(yOffset) <= ((bodyHeight / 2) + 4);
    const availableTextWidth = Math.max(6, bodyWidth - Math.max(2.6, bodyWidth * 0.18));
    const measuredTextWidth = Math.max(1, context.measureText(labelText).width);
    const textScaleX = Math.min(1, availableTextWidth / measuredTextWidth);
    if (shouldClipToBody) {
      traceRoundedRectPath(
        context,
        -(bodyWidth / 2) + 0.8,
        -(bodyHeight / 2) + 0.8,
        Math.max(2, bodyWidth - 1.6),
        Math.max(2, bodyHeight - 1.6),
        Math.max(1.2, Math.min(bodyWidth, bodyHeight) * 0.12)
      );
      context.clip();
    }
    context.scale(textScaleX, 1);
    context.fillText(labelText, 0, yOffset);
    context.restore();
  }

  function drawActualPartPinsCanvas(context, footprint, partPins, options = {}) {
    if (!Array.isArray(partPins) || partPins.length === 0) {
      return;
    }

    const fillStyle = options.fillStyle || "rgba(228, 228, 228, 0.4)";
    const strokeStyle = options.strokeStyle || "rgba(245, 245, 245, 0.62)";
    const lineWidth = Number(options.lineWidth || 0.82);
    const shapeKind = String(options.shapeKind || "");
    const denseArrayPads = shapeKind === "dense-chip";
    const anchorX = Number(options.anchorX ?? footprint.boardX ?? 0);
    const anchorY = Number(options.anchorY ?? footprint.boardY ?? 0);
    const pinScale = clamp(Number(options.pinScale || 1), 0.42, denseArrayPads ? 1.04 : 1.2);
    const densityScale = partPins.length >= 52
      ? 0.64
      : partPins.length >= 36
        ? 0.7
        : partPins.length >= 24
          ? 0.78
          : partPins.length >= 18
            ? 0.84
            : partPins.length >= 8
              ? 0.9
              : 1;
    const padLength = Number(options.padLength || (partPins.length <= 2 ? 11.4 : 8.1)) * pinScale * densityScale;
    const padThickness = Number(options.padThickness || (partPins.length <= 2 ? 4.2 : 3.2)) * pinScale * densityScale;

    partPins.forEach((pin) => {
      const deltaX = Number(pin.boardX || 0) - anchorX;
      const deltaY = Number(pin.boardY || 0) - anchorY;
      const angle = Math.atan2(deltaY, deltaX);
      const actualPadWidth = Number(pin.boardPadWidth || 0);
      const actualPadHeight = Number(pin.boardPadHeight || 0);
      const hasActualPadGeometry = actualPadWidth > 0 && actualPadHeight > 0;
      const actualPadRotation = normalizeRotationDegrees(pin.boardPadRotation || 0) * (Math.PI / 180);
      const actualPadScale = denseArrayPads
        ? clamp(0.56 + ((pinScale - 0.42) * 0.28), 0.52, 0.72)
        : clamp(0.62 + ((pinScale - 0.42) * 0.36), 0.56, 0.84);
      const renderedPadWidth = hasActualPadGeometry
        ? clamp(actualPadWidth * actualPadScale, 1.4, 24)
        : padLength;
      const renderedPadHeight = hasActualPadGeometry
        ? clamp(actualPadHeight * actualPadScale, 1.4, 16)
        : padThickness;
      const aspectRatio = renderedPadWidth / Math.max(renderedPadHeight, 0.0001);
      const shouldRenderRoundPad = denseArrayPads || (hasActualPadGeometry && aspectRatio >= 0.88 && aspectRatio <= 1.14);

      context.save();
      context.translate(Number(pin.boardX || 0), Number(pin.boardY || 0));
      context.rotate(hasActualPadGeometry ? actualPadRotation : angle);
      if (shouldRenderRoundPad) {
        context.beginPath();
        context.ellipse(0, 0, renderedPadWidth / 2, renderedPadHeight / 2, 0, 0, Math.PI * 2);
        context.closePath();
      } else {
        traceRoundedRectPath(
          context,
          -renderedPadWidth / 2,
          -renderedPadHeight / 2,
          renderedPadWidth,
          renderedPadHeight,
          Math.min(denseArrayPads ? 1.4 : 1.9, renderedPadHeight / 2));
      }
      context.fillStyle = fillStyle;
      context.fill();
      if (strokeStyle && lineWidth > 0.01) {
        context.strokeStyle = strokeStyle;
        context.lineWidth = denseArrayPads ? Math.min(lineWidth, 0.56) : lineWidth;
        context.stroke();
      }
      context.restore();
    });
  }

  function traceTrapezoidPath(context, width, height, taperRatio = 0.76) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const topHalfWidth = halfWidth * clamp(taperRatio, 0.45, 1);
    context.beginPath();
    context.moveTo(-topHalfWidth, -halfHeight);
    context.lineTo(topHalfWidth, -halfHeight);
    context.lineTo(halfWidth, halfHeight);
    context.lineTo(-halfWidth, halfHeight);
    context.closePath();
  }

  function buildMeasuredPartShape(footprint, partPins) {
    const pinBounds = buildPartPinBounds(partPins);
    if (!pinBounds) {
      return null;
    }

    const {
      pins: validPins,
      minX,
      maxX,
      minY,
      maxY,
      centerX,
      centerY,
      spanX,
      spanY,
      avgPadMajor,
      avgPadMinor
    } = pinBounds;
    const majorSpan = Math.max(spanX, spanY);
    const minorSpan = Math.max(1.2, Math.min(spanX, spanY));
    const horizontal = spanX >= spanY;
    const baseAngle = Number(footprint.rotation || 0) * (Math.PI / 180);
    const signature = buildFootprintSignature(footprint);
    const packageHint = getFootprintPackageHint(signature);
    const pinCount = validPins.length;
    const effectivePadMajor = Math.max(avgPadMajor || 0, Math.min(majorSpan * 0.22, 8.6));
    const effectivePadMinor = Math.max(avgPadMinor || 0, Math.min(minorSpan * 0.44, 4.4));
    const topology = buildPinTopologyMetrics(pinBounds);
    const denseArrayPackage = Boolean(topology?.isDenseArrayPackage)
      || (
        /BGA|CPU|PCH|KBC|EC|SIO|ITE|ENE|MEC|^UC\d/.test(signature)
        && pinCount >= 16
        && spanX >= 16
        && spanY >= 16
      );
    const perimeterPackage = Boolean(topology?.isPerimeterPackage) && !denseArrayPackage;
    const resolvedAxisAngle = perimeterPackage || (majorSpan >= (minorSpan * 1.35))
      ? (horizontal ? 0 : (Math.PI / 2))
      : baseAngle;
    const resolveMeasuredAssetKey = (shapeKind) => resolveComponentAssetKey(
      signature,
      getDefaultComponentAssetKey(footprint.kind, shapeKind),
      { kind: footprint.kind, shapeKind }
    );

    if (pinCount <= 2 || footprint.kind === "passive" || footprint.kind === "jumper") {
      let farthestLeft = validPins[0];
      let farthestRight = validPins[Math.min(1, validPins.length - 1)] || validPins[0];
      let farthestDistance = 0;
      for (let leftIndex = 0; leftIndex < validPins.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < validPins.length; rightIndex += 1) {
          const leftPin = validPins[leftIndex];
          const rightPin = validPins[rightIndex];
          const distance = Math.hypot(
            Number(rightPin.boardX) - Number(leftPin.boardX),
            Number(rightPin.boardY) - Number(leftPin.boardY)
          );
          if (distance > farthestDistance) {
            farthestDistance = distance;
            farthestLeft = leftPin;
            farthestRight = rightPin;
          }
        }
      }

      const deltaX = Number(farthestRight.boardX) - Number(farthestLeft.boardX);
      const deltaY = Number(farthestRight.boardY) - Number(farthestLeft.boardY);
      const distance = Math.max(7, Math.hypot(deltaX, deltaY));
      const passiveBodyRatio = packageHint === "0201"
        ? 0.44
        : packageHint === "0402"
          ? 0.48
          : packageHint === "0603"
            ? 0.54
            : packageHint === "0805"
              ? 0.58
              : packageHint === "1206"
                ? 0.64
                : 0.6;
      const passiveMinorRatio = packageHint === "0201"
        ? 0.46
        : packageHint === "0402"
          ? 0.52
          : packageHint === "0603"
            ? 0.56
            : 0.6;
      return {
        shapeKind: "passive",
        assetKey: resolveMeasuredAssetKey("passive"),
        centerX: (Number(farthestLeft.boardX) + Number(farthestRight.boardX)) / 2,
        centerY: (Number(farthestLeft.boardY) + Number(farthestRight.boardY)) / 2,
        angle: Math.atan2(deltaY, deltaX),
        width: clamp(
          Math.max(distance - (effectivePadMajor * 1.08), effectivePadMajor * passiveBodyRatio),
          4.8,
          Math.max(distance * passiveBodyRatio, 11.8)),
        height: clamp(Math.max(effectivePadMinor * passiveMinorRatio, distance * 0.055), 2.8, 7.8),
        padLength: clamp(Math.max(effectivePadMajor * 0.96, distance * 0.16), 5.8, 15.2),
        padThickness: clamp(Math.max(effectivePadMinor * 0.98, 2.6), 2.6, 6),
        labelFontSize: clamp(Math.max(distance * 0.11, effectivePadMinor * 1.28), 5.4, 11.2)
      };
    }

    if (footprint.kind === "connector" || footprint.kind === "socket" || /HEADER|CONN|SLOT|SOCKET|PORT|1X\d/.test(signature)) {
      return {
        shapeKind: footprint.kind === "socket" ? "socket" : "rail",
        assetKey: resolveMeasuredAssetKey(footprint.kind === "socket" ? "socket" : "rail"),
        centerX,
        centerY,
        angle: resolvedAxisAngle,
        width: Math.max(majorSpan + 2.4, 13.8),
        height: clamp(Math.max(minorSpan * (footprint.kind === "socket" ? 0.48 : 0.34), pinCount > 10 ? 6.2 : 4.4), 4.4, footprint.kind === "socket" ? 15.6 : 9.4),
        padLength: clamp(minorSpan * 1.2, 7.8, 12.1),
        padThickness: clamp(minorSpan * 0.48, 2.9, 4.7),
        labelFontSize: clamp(Math.min(majorSpan * 0.11, 12.4), 6.2, 12.4)
      };
    }

    if (pinCount === 3 || /Q\d|PQ\d|MOS|TRANS|SOT23|REG/.test(signature)) {
      return {
        shapeKind: "triad",
        assetKey: resolveMeasuredAssetKey("triad"),
        centerX,
        centerY,
        angle: resolvedAxisAngle,
        width: Math.max(majorSpan * 0.46, 8.2),
        height: clamp(Math.max(minorSpan * 0.62, 5.2), 5.2, 12.8),
        padLength: clamp(minorSpan * 1.12, 6.8, 10),
        padThickness: clamp(minorSpan * 0.44, 2.8, 4.3),
        labelFontSize: clamp(Math.min(majorSpan * 0.14, 12.6), 6.2, 12.6)
      };
    }

    if (denseArrayPackage) {
      return {
        shapeKind: "dense-chip",
        assetKey: resolveMeasuredAssetKey("dense-chip"),
        centerX,
        centerY,
        angle: baseAngle,
        width: Math.max(spanX - Math.max(effectivePadMajor * 0.18, 0.9), 13.4),
        height: Math.max(spanY - Math.max(effectivePadMajor * 0.18, 0.9), 13.4),
        padLength: clamp(Math.max(effectivePadMajor * 0.78, 2.2), 2.2, 6.8),
        padThickness: clamp(Math.max(effectivePadMinor * 0.82, 2.1), 2.1, 6.2),
        labelFontSize: clamp(Math.min(Math.min(spanX, spanY) * 0.28, 16.2), 6.8, 16.2)
      };
    }

    if (majorSpan >= (minorSpan * 1.65)) {
      const padInset = effectivePadMajor * (perimeterPackage ? 0.96 : 0.72);
      return {
        shapeKind: "elongated-chip",
        assetKey: resolveMeasuredAssetKey("elongated-chip"),
        centerX,
        centerY,
        angle: resolvedAxisAngle,
        width: Math.max(majorSpan - padInset, 8.2),
        height: clamp(Math.max(minorSpan - (effectivePadMinor * 0.28), 4.8), 4.8, 12.4),
        padLength: clamp(minorSpan * 0.88, 5.2, 7.8),
        padThickness: clamp(minorSpan * 0.28, 1.8, 3.4),
        labelFontSize: clamp(Math.min(minorSpan * 0.58, 11.8), 6, 11.8)
      };
    }

    const padInset = effectivePadMajor * (perimeterPackage ? 1.04 : 0.72);
    return {
      shapeKind: "chip",
      assetKey: resolveMeasuredAssetKey("chip"),
      centerX,
      centerY,
      angle: perimeterPackage ? resolvedAxisAngle : baseAngle,
      width: Math.max(spanX - padInset, 6.8),
      height: Math.max(spanY - padInset, 6.8),
      padLength: clamp(Math.min(majorSpan * 0.14, 7.2), 4.8, 7.2),
      padThickness: clamp(Math.min(minorSpan * 0.24, 3.4), 1.8, 3.4),
      labelFontSize: clamp(Math.min(Math.min(spanX, spanY) * 0.34, 12), 6, 12)
    };
  }

  function drawMeasuredPartBodyCanvas(context, footprint, partPins, palette, options = {}) {
    const shape = buildMeasuredPartShape(footprint, partPins);
    if (!shape) {
      return null;
    }

    const bodyScale = clamp(Number(options.bodyScale || 1), 0.78, 1.22);
    const labelScale = clamp(Number(options.labelScale || 1), 0.82, 1.32);
    const scaledWidth = shape.width * bodyScale;
    const scaledHeight = shape.height * bodyScale;
    const scaledLabelFontSize = clamp(
      Math.min(
        shape.labelFontSize * labelScale,
        Math.max(
          5.4,
          Math.min(scaledWidth, scaledHeight) * (
            shape.shapeKind === "passive"
              ? 0.9
              : shape.shapeKind === "dense-chip"
                ? 0.52
                : 0.68
          )
        )
      ),
      5.2,
      shape.shapeKind === "dense-chip" ? 20.4 : 15.2
    );
    const scaledPadLength = shape.padLength * Math.min(bodyScale * 0.98, 1.12);
    const scaledPadThickness = shape.padThickness * Math.min(bodyScale * 0.96, 1.12);
    const renderBody = shouldRenderMeasuredBody(
      footprint,
      shape,
      scaledWidth,
      scaledHeight,
      { forceVisible: Boolean(options.forceLabel) }
    );

    context.save();
    context.translate(shape.centerX, shape.centerY);
    context.rotate(shape.angle || 0);
    if (renderBody) {
      context.fillStyle = palette.bodyFill;
      context.strokeStyle = palette.bodyStroke;
      context.lineWidth = palette.bodyLineWidth || 1.05;

      const usedCachedAsset = drawCachedComponentBody(
        context,
        shape.assetKey,
        scaledWidth,
        scaledHeight,
        palette,
        shape.assetKey === "mount-hole"
          ? {
              detailFillStyle: palette.holeInnerFill,
              detailStrokeStyle: palette.holeInnerStroke,
              detailLineWidth: 1.1
            }
          : shape.assetKey === "socket-slot"
            ? {
                detailStrokeStyle: palette.holeInnerStroke || palette.bodyStroke,
                detailLineWidth: 0.85
              }
            : {}
      );

      if (!usedCachedAsset) {
        if (shape.shapeKind === "triad") {
          traceTrapezoidPath(context, scaledWidth, scaledHeight, 0.78);
          context.fill();
          context.stroke();
        } else {
          traceRoundedRectPath(
            context,
            -(scaledWidth / 2),
            -(scaledHeight / 2),
            scaledWidth,
            scaledHeight,
            shape.shapeKind === "passive"
              ? scaledHeight / 2
              : Math.max(2.8, Math.min(scaledWidth, scaledHeight) * 0.18)
          );
          context.fill();
          context.stroke();

          if (shape.shapeKind === "socket") {
            traceRoundedRectPath(
              context,
              -(scaledWidth * 0.34),
              -(scaledHeight * 0.24),
              scaledWidth * 0.68,
              scaledHeight * 0.48,
              Math.max(2, scaledHeight * 0.12)
            );
            context.strokeStyle = palette.holeInnerStroke || palette.bodyStroke;
            context.lineWidth = 0.85;
            context.stroke();
          }
        }
      }

      if (!options.hideLabel && shouldRenderBodyLabel(
        footprint,
        scaledWidth,
        scaledHeight,
        scaledLabelFontSize,
        { forceVisible: Boolean(options.forceLabel) }
      )) {
        const labelClipWidth = Math.max(4.8, scaledWidth - Math.max(2.4, scaledWidth * 0.16));
        const labelClipHeight = Math.max(4.6, scaledHeight - Math.max(2, scaledHeight * 0.18));
        const labelText = String(footprint.id || "");
        const shouldKeepLabelReadable = isPriorityLabelFootprint(footprint)
          || shape.shapeKind === "dense-chip"
          || shape.shapeKind === "chip"
          || shape.shapeKind === "elongated-chip"
          || shape.shapeKind === "rail"
          || shape.shapeKind === "socket";
        context.save();
        if (shouldKeepLabelReadable) {
          context.rotate(-(shape.angle || 0));
        }
        traceRoundedRectPath(
          context,
          -(labelClipWidth / 2),
          -(labelClipHeight / 2),
          labelClipWidth,
          labelClipHeight,
          Math.max(1.6, Math.min(labelClipWidth, labelClipHeight) * 0.14)
        );
        context.clip();
        context.fillStyle = palette.labelFill;
        context.font = `${scaledLabelFontSize}px Consolas, "Courier New", monospace`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        const measuredLabelWidth = Math.max(1, context.measureText(labelText).width);
        const textScaleX = Math.min(
          1,
          Math.max(shape.shapeKind === "dense-chip" ? 0.9 : 0.78, labelClipWidth / measuredLabelWidth)
        );
        context.scale(textScaleX, 1);
        context.fillText(labelText, 0, 0.4);
        context.restore();
      }
    }

    context.restore();
    return {
      ...shape,
      width: scaledWidth,
      height: scaledHeight,
      padLength: scaledPadLength,
      padThickness: scaledPadThickness,
      labelFontSize: scaledLabelFontSize
    };
  }

  function buildPinLabelEntries(runtime) {
    if (!runtime?.activeFootprint) {
      return [];
    }

    const activeKey = String(runtime.activeFootprint.id || "").toUpperCase();
    const activePartPins = runtime.scene.partPinsMap.get(activeKey) || [];
    const labels = [];

    activePartPins.forEach((pin) => {
      const labelText = getConnectionPinDisplay(pin);
      const connectionKey = buildConnectionKey(pin);
      const padMajor = Math.max(
        Number(pin.boardPadWidth || 0),
        Number(pin.boardPadHeight || 0),
        0
      );
      const padMinor = Math.max(
        0,
        Math.min(
          Number(pin.boardPadWidth || 0) || padMajor,
          Number(pin.boardPadHeight || 0) || padMajor
        )
      );
      labels.push({
        kind: "part",
        text: labelText,
        boardX: Number(pin.boardX || 0),
        boardY: Number(pin.boardY || 0),
        padMajor,
        padMinor,
        connection: pin,
        connectionKey,
        isSelected: connectionKey === state.selectedConnectionKey
      });
    });

    if (state.selectedConnectionKey) {
      getSelectedOverlayPeerDisplays(runtime, 18).forEach((pin) => {
        const padMajor = Math.max(
          Number(pin.boardPadWidth || 0),
          Number(pin.boardPadHeight || 0),
          0
        );
        const padMinor = Math.max(
          0,
          Math.min(
            Number(pin.boardPadWidth || 0) || padMajor,
            Number(pin.boardPadHeight || 0) || padMajor
          )
        );
        labels.push({
          kind: "peer-pin",
          text: getConnectionPinDisplay(pin),
          boardX: Number(pin.boardX || 0),
          boardY: Number(pin.boardY || 0),
          padMajor,
          padMinor,
          connection: pin,
          connectionKey: buildConnectionKey(pin),
          isSelected: false
        });
      });
    }

    return labels;
  }

  function buildVisiblePinLabelRenderEntries(runtime, screenScale = getCurrentStageScreenScale(runtime?.scene)) {
    const labels = buildPinLabelEntries(runtime);
    if (labels.length === 0) {
      return [];
    }

    const safeScreenScale = Math.max(0.0001, Number(screenScale) || 0.0001);
    const circularLabels = labels.filter((label) => label.kind === "part" || label.kind === "peer-pin");
    const partLabelNeighborDistances = new Map();

    circularLabels.forEach((label, index) => {
      let nearestDistanceBoard = Number.POSITIVE_INFINITY;
      for (let compareIndex = 0; compareIndex < circularLabels.length; compareIndex += 1) {
        if (compareIndex === index) {
          continue;
        }
        const other = circularLabels[compareIndex];
        const distanceBoard = Math.hypot(
          Number(label.boardX || 0) - Number(other.boardX || 0),
          Number(label.boardY || 0) - Number(other.boardY || 0)
        );
        if (distanceBoard < nearestDistanceBoard) {
          nearestDistanceBoard = distanceBoard;
        }
      }
      partLabelNeighborDistances.set(
        label,
        Number.isFinite(nearestDistanceBoard)
          ? (nearestDistanceBoard * safeScreenScale)
          : Number.POSITIVE_INFINITY
      );
    });

    const visibleEntries = [];
    circularLabels.forEach((label) => {
      const isSelectedPin = Boolean(label.isSelected);
      const isPeerPin = label.kind === "peer-pin";
      const padMajor = Math.max(0, Number(label.padMajor || 0));
      const padMinor = Math.max(0, Number(label.padMinor || 0));
      const fallbackPad = Math.max(padMajor, 4.2);
      const apparentPadDiameter = Math.max(padMajor, padMinor || fallbackPad) * safeScreenScale;
      const digitCount = String(label.text).length;
      const labelVisibilityThreshold = isPeerPin
        ? (digitCount >= 2 ? 12 : 10)
        : (digitCount >= 2 ? 18 : 14);
      const nearestNeighborScreenDistance = Number(partLabelNeighborDistances.get(label) || 0);
      if (
        !isSelectedPin
        && !isPeerPin
        && (
          apparentPadDiameter < labelVisibilityThreshold
          || nearestNeighborScreenDistance < (digitCount >= 2 ? 9.8 : 8.2)
        )
      ) {
        return;
      }

      const minimumScreenRadius = isSelectedPin
        ? (digitCount >= 2 ? 3.8 : 3.45)
        : isPeerPin
          ? (digitCount >= 2 ? 3.6 : 3.25)
          : (digitCount >= 2 ? 4.3 : 3.8);
      const maximumScreenRadius = isSelectedPin
        ? 4.35
        : isPeerPin
          ? 4.05
          : 4.9;
      const padDrivenRadius = isSelectedPin || isPeerPin
        ? minimumScreenRadius
        : Math.min(apparentPadDiameter * 0.18, minimumScreenRadius + 0.45);
      const desiredScreenRadius = clamp(
        Math.max(minimumScreenRadius, padDrivenRadius),
        minimumScreenRadius,
        maximumScreenRadius
      );
      const desiredScreenFont = clamp(
        desiredScreenRadius * (digitCount >= 2 ? 1.06 : 1.14),
        4.5,
        7.4
      );

      visibleEntries.push({
        ...label,
        isSelectedPin,
        isPeerPin,
        radiusBoard: desiredScreenRadius / safeScreenScale,
        fontSizeBoard: desiredScreenFont / safeScreenScale,
        strokeWidthBoard: Math.max(0.6, 1 / safeScreenScale),
        textOffsetBoard: 0.1 / safeScreenScale,
        fillStyle: isSelectedPin
          ? "rgba(255, 255, 255, 0.98)"
          : isPeerPin
            ? "rgba(245, 249, 255, 0.96)"
            : "rgba(95, 136, 170, 0.86)",
        strokeStyle: isSelectedPin
          ? "rgba(19, 37, 58, 0.96)"
          : isPeerPin
            ? "rgba(214, 228, 244, 0.96)"
            : "rgba(214, 236, 247, 0.5)",
        textFillStyle: isSelectedPin || isPeerPin
          ? "rgba(18, 31, 47, 0.98)"
          : "rgba(23, 41, 61, 0.94)"
      });
    });

    return visibleEntries;
  }

  function drawPinLabelsCanvas(context, runtime) {
    const visibleLabels = buildVisiblePinLabelRenderEntries(runtime);
    if (visibleLabels.length === 0) {
      return;
    }

    visibleLabels.forEach((label) => {
      context.beginPath();
      context.fillStyle = label.fillStyle;
      context.strokeStyle = label.strokeStyle;
      context.lineWidth = label.strokeWidthBoard;
      context.arc(label.boardX, label.boardY, label.radiusBoard, 0, Math.PI * 2);
      context.fill();
      context.stroke();

      context.font = `${label.fontSizeBoard}px Consolas, "Courier New", monospace`;
      context.fillStyle = label.textFillStyle;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(label.text, label.boardX, label.boardY + label.textOffsetBoard);
    });
  }

  function buildVisibleNetMarkerRenderEntries(runtime, screenScale = getCurrentStageScreenScale(runtime?.scene), cameraBounds = null) {
    if (!runtime?.visibleNetPins?.length || state.selectedConnectionKey) {
      return [];
    }

    const safeScreenScale = Math.max(0.0001, Number(screenScale) || 0.0001);
    const hasNetOverlay = Boolean(state.selectedNetName);
    const isNetOnlyOverlay = hasNetOverlay;
    const entries = [];

    runtime.visibleNetPins.forEach((connection) => {
      const connectionKey = buildConnectionKey(connection);
      const markerBoardX = Number(connection.boardX || 0);
      const markerBoardY = Number(connection.boardY || 0);
      if (cameraBounds
        && (markerBoardX < cameraBounds.minX
          || markerBoardX > cameraBounds.maxX
          || markerBoardY < cameraBounds.minY
          || markerBoardY > cameraBounds.maxY)) {
        return;
      }

      const isSelected = connectionKey === state.selectedConnectionKey;
      const isPartOnlyPinMarker = connection.markerRole === "part"
        && !state.selectedConnectionKey
        && !state.selectedNetName;
      if (isPartOnlyPinMarker) {
        return;
      }
      if (isNetOnlyOverlay && connection.markerRole === "part") {
        return;
      }

      let fillStyle = "#fff14c";
      let strokeStyle = "#0f0f0f";
      let lineWidthScreen = 0.96;
      let radiusScreen = 3.5;
      if (connection.markerRole === "part") {
        fillStyle = "#7fe8ff";
        strokeStyle = "#052c35";
      } else if (connection.markerRole === "shared") {
        strokeStyle = "#ffffff";
        lineWidthScreen = 1.08;
        radiusScreen = 3.7;
      }
      if (isNetOnlyOverlay) {
        fillStyle = connection.markerRole === "shared"
          ? "rgba(248, 251, 255, 0.28)"
          : "rgba(246, 250, 255, 0.14)";
        strokeStyle = connection.markerRole === "shared"
          ? "rgba(243, 247, 252, 0.92)"
          : "rgba(226, 234, 244, 0.72)";
        lineWidthScreen = connection.markerRole === "shared" ? 0.98 : 0.84;
        radiusScreen = connection.markerRole === "shared" ? 3.3 : 2.95;
      }
      if (isSelected) {
        fillStyle = "rgba(255, 255, 255, 0.98)";
        strokeStyle = "rgba(18, 35, 55, 0.96)";
        lineWidthScreen = 1.18;
        radiusScreen = 3.85;
      }

      entries.push({
        connection,
        connectionKey,
        boardX: markerBoardX,
        boardY: markerBoardY,
        radiusBoard: radiusScreen / safeScreenScale,
        lineWidthBoard: lineWidthScreen / safeScreenScale,
        fillStyle,
        strokeStyle
      });
    });

    return entries;
  }

  function drawSelectedConnectionGuideLinesCanvas(context, runtime, cameraBounds) {
    const selectedConnection = getSelectedOverlayConnection(runtime);
    if (!selectedConnection) {
      return;
    }

    const peers = getSelectedOverlayPeerDisplays(runtime, 18);
    if (peers.length === 0) {
      return;
    }

    const screenScale = Math.max(getCurrentStageScreenScale(runtime.scene), 0.0001);
    const selectedRadiusBoard = 5.9 / screenScale;
    const peerRadiusBoard = 5.5 / screenScale;
    context.save();
    context.strokeStyle = "rgba(255, 255, 255, 0.92)";
    context.lineWidth = clamp(1.15 / screenScale, 0.52, 1.08);
    context.lineCap = "round";
    context.lineJoin = "round";
    peers.forEach((peer) => {
      const deltaX = Number(peer.boardX || 0) - Number(selectedConnection.boardX || 0);
      const deltaY = Number(peer.boardY || 0) - Number(selectedConnection.boardY || 0);
      const distance = Math.hypot(deltaX, deltaY);
      if (distance <= 0.0001) {
        return;
      }

      const unitX = deltaX / distance;
      const unitY = deltaY / distance;
      const sourceTrim = Math.min(selectedRadiusBoard * 0.62, distance * 0.12);
      const targetTrim = Math.min(peerRadiusBoard * 0.62, distance * 0.12);
      const startX = Number(selectedConnection.boardX || 0) + (unitX * sourceTrim);
      const startY = Number(selectedConnection.boardY || 0) + (unitY * sourceTrim);
      const endX = Number(peer.boardX || 0) - (unitX * targetTrim);
      const endY = Number(peer.boardY || 0) - (unitY * targetTrim);

      context.beginPath();
      context.strokeStyle = "rgba(16, 30, 49, 0.28)";
      context.lineWidth = clamp(3.3 / screenScale, 1.08, 2.28);
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();

      context.beginPath();
      context.strokeStyle = "rgba(255, 255, 255, 0.94)";
      context.lineWidth = clamp(1.52 / screenScale, 0.72, 1.26);
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
    });
    context.restore();
  }

  function drawFootprintCanvas(context, footprint, metrics, renderProfile, palette, options = {}) {
    const forceDetailed = Boolean(options.forceDetailed);
    const usePoint = renderProfile.simplifiedFootprints && !forceDetailed && !metrics.isActive;
    context.save();
    context.translate(footprint.boardX, footprint.boardY);

    if (usePoint) {
      context.beginPath();
      context.fillStyle = palette.pointFill;
      context.strokeStyle = palette.pointStroke;
      context.lineWidth = 1.2;
      context.arc(0, 0, metrics.pointRadius, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      if (metrics.showLabel && !options.hideLabel) {
        drawFootprintLabelCanvas(context, footprint, metrics, palette.labelFill, metrics.pointRadius + 11, 12);
      }
      context.restore();
      return;
    }

    context.rotate((Number(footprint.rotation || 0) * Math.PI) / 180);
    context.scale(metrics.footprintScale, metrics.footprintScale);

    if (footprint.kind === "hole") {
      const usedCachedHoleAsset = drawCachedComponentBody(
        context,
        footprint.assetKey,
        footprint.width,
        footprint.height,
        palette,
        {
          detailFillStyle: palette.holeInnerFill,
          detailStrokeStyle: palette.holeInnerStroke,
          detailLineWidth: 1.1
        }
      );

      if (!usedCachedHoleAsset) {
        context.beginPath();
        context.fillStyle = palette.bodyFill;
        context.strokeStyle = palette.bodyStroke;
        context.lineWidth = 1.05;
        context.arc(0, 0, footprint.width / 2, 0, Math.PI * 2);
        context.fill();
        context.stroke();

        context.beginPath();
        context.fillStyle = palette.holeInnerFill;
        context.strokeStyle = palette.holeInnerStroke;
        context.lineWidth = 1.1;
        context.arc(0, 0, footprint.width / 4, 0, Math.PI * 2);
        context.fill();
        context.stroke();
      }

      if (metrics.showLabel && !options.hideLabel) {
        drawFootprintLabelCanvas(context, footprint, metrics, palette.labelFill, (footprint.width / 2) + 18, 12);
      }
      context.restore();
      return;
    }

    context.fillStyle = palette.padFill;
    drawFootprintPadsCanvas(context, footprint, renderProfile);

    const usedCachedBody = drawCachedComponentBody(
      context,
      footprint.assetKey,
      footprint.width,
      footprint.height,
      palette,
      footprint.assetKey === "socket-slot"
        ? {
            detailStrokeStyle: palette.holeInnerStroke || palette.bodyStroke,
            detailLineWidth: 0.85
          }
        : {}
    );

    if (!usedCachedBody) {
      traceRoundedRectPath(
        context,
        -footprint.width / 2,
        -footprint.height / 2,
        footprint.width,
        footprint.height,
        Math.max(3, Math.min(footprint.height, footprint.width) * 0.08)
      );
      context.fillStyle = palette.bodyFill;
      context.strokeStyle = palette.bodyStroke;
      context.lineWidth = palette.bodyLineWidth || 1.05;
      context.fill();
      context.stroke();
    }

    if (metrics.showLabel && !options.hideLabel) {
      drawFootprintLabelCanvas(context, footprint, metrics, palette.labelFill, 2);
    }

    context.restore();
  }

  function ensureCanvasBackingStore(canvas, cssWidth, cssHeight, qualityBoost, geometry, shouldApplyStyle = true) {
    if (!canvas) {
      return null;
    }

    const pixelRatio = Math.max(1, Math.min(3, Number(globalScope.devicePixelRatio || 1)));
    let scaledPixelWidth = Math.max(1, Math.round(cssWidth * pixelRatio * qualityBoost));
    let scaledPixelHeight = Math.max(1, Math.round(cssHeight * pixelRatio * qualityBoost));
    const maxCanvasDimension = 6144;
    const longestDimension = Math.max(scaledPixelWidth, scaledPixelHeight);
    if (longestDimension > maxCanvasDimension) {
      const downscaleRatio = maxCanvasDimension / longestDimension;
      scaledPixelWidth = Math.max(1, Math.round(scaledPixelWidth * downscaleRatio));
      scaledPixelHeight = Math.max(1, Math.round(scaledPixelHeight * downscaleRatio));
    }

    if (canvas.width !== scaledPixelWidth) {
      canvas.width = scaledPixelWidth;
    }
    if (canvas.height !== scaledPixelHeight) {
      canvas.height = scaledPixelHeight;
    }
    if (shouldApplyStyle) {
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
    }

    const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!context) {
      return null;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, scaledPixelWidth, scaledPixelHeight);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    return {
      context,
      cssWidth,
      cssHeight,
      pixelWidth: scaledPixelWidth,
      pixelHeight: scaledPixelHeight
    };
  }

  function getStageFitScale(scene, cssWidth, cssHeight) {
    return Math.min(
      Math.max(1, Number(cssWidth) || scene.geometry.width) / Math.max(1, scene.geometry.width),
      Math.max(1, Number(cssHeight) || scene.geometry.height) / Math.max(1, scene.geometry.height)
    );
  }

  function captureStageCameraSnapshot(scene, cssWidth, cssHeight, sourceState = state) {
    const normalizedWidth = Math.max(1, Number(cssWidth) || scene.geometry.width);
    const normalizedHeight = Math.max(1, Number(cssHeight) || scene.geometry.height);
    return {
      cssWidth: normalizedWidth,
      cssHeight: normalizedHeight,
      centerX: normalizedWidth / 2,
      centerY: normalizedHeight / 2,
      panX: Number(sourceState.panX || 0),
      panY: Number(sourceState.panY || 0),
      zoom: clamp(Number(sourceState.zoom || 1), zoomLimits.min, zoomLimits.max),
      rotation: normalizeRotationDegrees(sourceState.rotation || 0),
      mirrored: Boolean(sourceState.mirrored),
      fitScale: getStageFitScale(scene, normalizedWidth, normalizedHeight)
    };
  }

  function getStageLinearMatrix(cameraSnapshot) {
    const angle = (cameraSnapshot.rotation * Math.PI) / 180;
    const scale = cameraSnapshot.fitScale * cameraSnapshot.zoom;
    const mirrorX = cameraSnapshot.mirrored ? -1 : 1;
    return {
      a: scale * Math.cos(angle) * mirrorX,
      b: scale * Math.sin(angle) * mirrorX,
      c: scale * -Math.sin(angle),
      d: scale * Math.cos(angle)
    };
  }

  function getCurrentStageScreenScale(scene = stageRuntime?.scene || null) {
    if (!scene) {
      return clamp(state.zoom, zoomLimits.min, zoomLimits.max);
    }

    const cssWidth = Math.max(1, Math.round(domRefs.world?.clientWidth || scene.geometry.width));
    const cssHeight = Math.max(1, Math.round(domRefs.world?.clientHeight || scene.geometry.height));
    const snapshot = captureStageCameraSnapshot(scene, cssWidth, cssHeight);
    const linear = getStageLinearMatrix(snapshot);
    return Math.max(0.0001, Math.hypot(linear.a, linear.b));
  }

  function invertLinearMatrix(matrix) {
    const determinant = (matrix.a * matrix.d) - (matrix.b * matrix.c);
    if (Math.abs(determinant) < 0.0000001) {
      return null;
    }

    return {
      a: matrix.d / determinant,
      b: -matrix.b / determinant,
      c: -matrix.c / determinant,
      d: matrix.a / determinant
    };
  }

  function multiplyLinearMatrices(left, right) {
    return {
      a: (left.a * right.a) + (left.c * right.b),
      b: (left.b * right.a) + (left.d * right.b),
      c: (left.a * right.c) + (left.c * right.d),
      d: (left.b * right.c) + (left.d * right.d)
    };
  }

  function buildRelativeStageWorldMatrix(snapshot, current) {
    const snapshotLinear = getStageLinearMatrix(snapshot);
    const currentLinear = getStageLinearMatrix(current);
    const inverseSnapshotLinear = invertLinearMatrix(snapshotLinear);
    if (!inverseSnapshotLinear) {
      return null;
    }

    const deltaLinear = multiplyLinearMatrices(currentLinear, inverseSnapshotLinear);
    const snapshotPivotX = snapshot.centerX + snapshot.panX;
    const snapshotPivotY = snapshot.centerY + snapshot.panY;
    const currentPivotX = current.centerX + current.panX;
    const currentPivotY = current.centerY + current.panY;

    return {
      a: deltaLinear.a,
      b: deltaLinear.b,
      c: deltaLinear.c,
      d: deltaLinear.d,
      e: currentPivotX - ((deltaLinear.a * snapshotPivotX) + (deltaLinear.c * snapshotPivotY)),
      f: currentPivotY - ((deltaLinear.b * snapshotPivotX) + (deltaLinear.d * snapshotPivotY))
    };
  }

  function applyStageCameraTransform(canvasState, scene, cameraSnapshot) {
    const context = canvasState.context;
    const geometry = scene.geometry;
    const linear = getStageLinearMatrix(cameraSnapshot);
    context.setTransform(
      canvasState.pixelWidth / canvasState.cssWidth,
      0,
      0,
      canvasState.pixelHeight / canvasState.cssHeight,
      0,
      0
    );
    context.translate(
      cameraSnapshot.centerX + cameraSnapshot.panX,
      cameraSnapshot.centerY + cameraSnapshot.panY
    );
    context.transform(linear.a, linear.b, linear.c, linear.d, 0, 0);
    context.translate(-(geometry.width / 2), -(geometry.height / 2));
  }

  function mapStageLocalPointToBoardPoint(localX, localY, scene, cameraSnapshot) {
    const linear = getStageLinearMatrix(cameraSnapshot);
    const inverseLinear = invertLinearMatrix(linear);
    if (!inverseLinear) {
      return null;
    }

    const pivotX = cameraSnapshot.centerX + cameraSnapshot.panX;
    const pivotY = cameraSnapshot.centerY + cameraSnapshot.panY;
    const deltaX = localX - pivotX;
    const deltaY = localY - pivotY;
    const localBoardX = (inverseLinear.a * deltaX) + (inverseLinear.c * deltaY);
    const localBoardY = (inverseLinear.b * deltaX) + (inverseLinear.d * deltaY);
    const boardX = (scene.geometry.width / 2) + localBoardX;
    const boardY = (scene.geometry.height / 2) + localBoardY;

    if (boardX < 0 || boardY < 0 || boardX > scene.geometry.width || boardY > scene.geometry.height) {
      return null;
    }

    return { boardX, boardY };
  }

  function mapBoardPointToStageLocalPoint(boardX, boardY, scene, cameraSnapshot) {
    const linear = getStageLinearMatrix(cameraSnapshot);
    const pivotX = cameraSnapshot.centerX + cameraSnapshot.panX;
    const pivotY = cameraSnapshot.centerY + cameraSnapshot.panY;
    const localBoardX = Number(boardX || 0) - (scene.geometry.width / 2);
    const localBoardY = Number(boardY || 0) - (scene.geometry.height / 2);
    return {
      localX: pivotX + (linear.a * localBoardX) + (linear.c * localBoardY),
      localY: pivotY + (linear.b * localBoardX) + (linear.d * localBoardY)
    };
  }

  function buildStageCameraBounds(scene, cameraSnapshot) {
    const samples = [
      mapStageLocalPointToBoardPoint(0, 0, scene, cameraSnapshot),
      mapStageLocalPointToBoardPoint(cameraSnapshot.cssWidth, 0, scene, cameraSnapshot),
      mapStageLocalPointToBoardPoint(0, cameraSnapshot.cssHeight, scene, cameraSnapshot),
      mapStageLocalPointToBoardPoint(cameraSnapshot.cssWidth, cameraSnapshot.cssHeight, scene, cameraSnapshot)
    ].filter(Boolean);

    if (samples.length < 3) {
      return null;
    }

    const linear = getStageLinearMatrix(cameraSnapshot);
    const screenScale = Math.max(0.0001, Math.hypot(linear.a, linear.b));
    const boardMargin = Math.max(14, 28 / screenScale);

    return {
      minX: Math.min(...samples.map((point) => point.boardX)) - boardMargin,
      maxX: Math.max(...samples.map((point) => point.boardX)) + boardMargin,
      minY: Math.min(...samples.map((point) => point.boardY)) - boardMargin,
      maxY: Math.max(...samples.map((point) => point.boardY)) + boardMargin
    };
  }

  function isFootprintInsideStageBounds(footprint, metrics, renderProfile, cameraBounds) {
    if (!cameraBounds) {
      return true;
    }

    const radius = renderProfile.simplifiedFootprints && !metrics.isActive
      ? metrics.pointRadius + 14
      : Math.max(
        ((footprint.width * metrics.footprintScale) / 2) + 20,
        ((footprint.height * metrics.footprintScale) / 2) + 20
      );

    return footprint.boardX + radius >= cameraBounds.minX
      && footprint.boardX - radius <= cameraBounds.maxX
      && footprint.boardY + radius >= cameraBounds.minY
      && footprint.boardY - radius <= cameraBounds.maxY;
  }

  function buildStageBaseCacheSignature(scene, renderProfile, cssWidth, cssHeight, qualityBoost, cameraSnapshot) {
    return [
      sceneCacheKey,
      Math.round(cssWidth),
      Math.round(cssHeight),
      Math.round(qualityBoost * 100),
      Math.round((cameraSnapshot?.zoom || 1) * 1000),
      Math.round(Number(cameraSnapshot?.panX || 0) * 10),
      Math.round(Number(cameraSnapshot?.panY || 0) * 10),
      Math.round(Number(cameraSnapshot?.rotation || 0)),
      cameraSnapshot?.mirrored ? 1 : 0,
      renderProfile.simplifiedFootprints ? 1 : 0,
      renderProfile.showPads ? 1 : 0,
      renderProfile.showText ? 1 : 0,
      renderProfile.outlineStride,
      Math.round(renderProfile.footprintScale * 1000),
      Math.round(renderProfile.labelScale * 1000)
    ].join("::");
  }

  function paintStageBaseContext(canvasState, runtime, renderProfile, cameraSnapshot) {
    const context = canvasState.context;
    const scene = runtime.scene;
    const geometry = scene.geometry;
    const neutralConnectedParts = new Set();
    const cameraBounds = buildStageCameraBounds(scene, cameraSnapshot);

    context.save();
    applyStageCameraTransform(canvasState, scene, cameraSnapshot);
    context.fillStyle = "rgba(9, 16, 34, 0.38)";
    fillRectPath(context, geometry.boardX + geometry.shadowOffset, geometry.boardY + geometry.shadowOffset, geometry.boardWidth, geometry.boardHeight);
    context.fill();

    context.fillStyle = "#3a4d8d";
    context.strokeStyle = "rgba(192, 211, 252, 0.9)";
    context.lineWidth = 1.16;
    fillRectPath(context, geometry.boardX, geometry.boardY, geometry.boardWidth, geometry.boardHeight);
    context.fill();
    context.stroke();

    context.fillStyle = "rgba(109, 136, 206, 0.12)";
    context.strokeStyle = "rgba(206, 220, 255, 0.18)";
    context.lineWidth = 0.8;
    fillRectPath(context, geometry.innerX, geometry.innerY, geometry.innerWidth, geometry.innerHeight);
    context.fill();
    context.stroke();

    if (scene.outlineSegments.length > 0) {
      context.beginPath();
      context.strokeStyle = "rgba(211, 223, 255, 0.7)";
      context.lineWidth = 1.22;
      const stride = Math.max(1, Number(renderProfile.outlineStride) || 1);
      for (let index = 0; index < scene.outlineSegments.length; index += stride) {
        const segment = scene.outlineSegments[index];
        context.moveTo(segment.boardX1, segment.boardY1);
        context.lineTo(segment.boardX2, segment.boardY2);
      }
      context.stroke();
    }

    if (scene.traces.length > 0) {
      context.beginPath();
      context.strokeStyle = "rgba(189, 205, 248, 0.18)";
      context.lineWidth = 1.02;
      scene.traces.forEach((trace) => {
        if (trace.strong) {
          return;
        }
        context.moveTo(trace.fromX, trace.fromY);
        context.quadraticCurveTo(trace.midX, trace.midY, trace.toX, trace.toY);
      });
      context.stroke();

      context.beginPath();
      context.strokeStyle = "rgba(219, 231, 255, 0.24)";
      context.lineWidth = 1.08;
      scene.traces.forEach((trace) => {
        if (!trace.strong) {
          return;
        }
        context.moveTo(trace.fromX, trace.fromY);
        context.quadraticCurveTo(trace.midX, trace.midY, trace.toX, trace.toY);
      });
      context.stroke();
    }

    const basePalette = {
      pointFill: "rgba(122, 152, 218, 0.82)",
      pointStroke: "rgba(215, 229, 255, 0.62)",
      bodyFill: "rgba(92, 126, 198, 0.045)",
      bodyStroke: "rgba(214, 227, 255, 0.6)",
      bodyLineWidth: 0.78,
      padFill: "rgba(170, 196, 240, 0.24)",
      labelFill: "rgba(223, 232, 248, 0.9)",
      holeInnerFill: "rgba(64, 88, 146, 0.9)",
      holeInnerStroke: "rgba(213, 228, 255, 0.54)"
    };

    scene.visibleFootprints.forEach((footprint) => {
      const metrics = getFootprintRenderMetrics(footprint, "", renderProfile, neutralConnectedParts);
      if (!isFootprintInsideStageBounds(footprint, metrics, renderProfile, cameraBounds)) {
        return;
      }
      const partPins = scene.partPinsMap.get(String(footprint.id || "").toUpperCase()) || [];
      const measuredShape = drawMeasuredPartBodyCanvas(context, footprint, partPins, basePalette, {
        bodyScale: clamp(metrics.footprintScale * 0.88, 0.8, 0.98),
        labelScale: clamp(metrics.labelScale * 0.76, 0.76, 1.02)
      });
      if (!measuredShape) {
        drawFootprintCanvas(context, footprint, metrics, renderProfile, basePalette);
      }
      drawActualPartPinsCanvas(context, footprint, partPins, measuredShape
        ? {
            fillStyle: "rgba(198, 214, 248, 0.28)",
            strokeStyle: "rgba(229, 238, 255, 0.26)",
            lineWidth: 0.34,
            pinScale: renderProfile.simplifiedFootprints
              ? 0.44
              : clamp(0.44 + (state.zoom * 0.12), 0.44, 0.62),
            anchorX: measuredShape.centerX,
            anchorY: measuredShape.centerY,
            shapeKind: measuredShape.shapeKind,
            padLength: measuredShape.padLength,
            padThickness: measuredShape.padThickness
          }
        : {
            fillStyle: "rgba(198, 214, 248, 0.28)",
            strokeStyle: "rgba(229, 238, 255, 0.26)",
            lineWidth: 0.34,
            pinScale: renderProfile.simplifiedFootprints
              ? 0.44
              : clamp(0.44 + (state.zoom * 0.12), 0.44, 0.62)
          });
    });
    context.restore();
  }

  function paintStageOverlayContext(canvasState, runtime, renderProfile, cameraSnapshot) {
    const context = canvasState.context;
    const cameraBounds = buildStageCameraBounds(runtime.scene, cameraSnapshot);
    context.save();
    applyStageCameraTransform(canvasState, runtime.scene, cameraSnapshot);
    const hasSelectedConnection = Boolean(state.selectedConnectionKey);
    const hasNetOverlay = Boolean(state.selectedNetName);
    const isNetOnlyOverlay = hasNetOverlay && !hasSelectedConnection;
    const isPartOnlyOverlay = !hasSelectedConnection && !hasNetOverlay;
    const highlightPalette = {
      pointFill: "rgba(138, 184, 216, 0.12)",
      pointStroke: "rgba(230, 242, 255, 0.76)",
      bodyFill: "rgba(163, 194, 226, 0.02)",
      bodyStroke: "rgba(225, 238, 255, 0.82)",
      bodyLineWidth: 0.88,
      padFill: "rgba(162, 198, 230, 0.08)",
      labelFill: "rgba(233, 241, 250, 0.94)",
      holeInnerFill: "rgba(12, 18, 32, 0.88)",
      holeInnerStroke: "rgba(225, 238, 255, 0.76)"
    };
    const activePalette = {
      pointFill: "rgba(128, 178, 210, 0.14)",
      pointStroke: "rgba(227, 239, 250, 0.84)",
      bodyFill: "rgba(156, 187, 219, 0.02)",
      bodyStroke: "rgba(228, 239, 251, 0.88)",
      bodyLineWidth: 0.92,
      padFill: "rgba(150, 193, 226, 0.08)",
      labelFill: "rgba(236, 242, 249, 0.98)",
      holeInnerFill: "rgba(12, 18, 32, 0.88)",
      holeInnerStroke: "rgba(236, 242, 249, 0.9)"
    };
    const activeId = runtime.activeFootprint.id;
    if (hasNetOverlay && !hasSelectedConnection) {
      runtime.scene.visibleFootprints.forEach((footprint) => {
        if (footprint.id === activeId) {
          return;
        }
        if (!runtime.connectedPartIds.has(footprint.id)) {
          return;
        }
        const metrics = getFootprintRenderMetrics(footprint, activeId, renderProfile, runtime.connectedPartIds);
        if (!isFootprintInsideStageBounds(footprint, metrics, renderProfile, cameraBounds)) {
          return;
        }
        const partPins = runtime.scene.partPinsMap.get(String(footprint.id || "").toUpperCase()) || [];
        const measuredShape = drawMeasuredPartBodyCanvas(context, footprint, partPins, highlightPalette, {
          bodyScale: clamp(metrics.footprintScale * 0.96, 0.92, 1.08),
          labelScale: clamp(metrics.labelScale * 0.88, 0.88, 1.12),
          forceLabel: metrics.isNetHit,
          hideLabel: true
        });
        if (!measuredShape) {
          drawFootprintCanvas(context, footprint, metrics, renderProfile, highlightPalette, { hideLabel: true });
        }
      });
    }

    if (runtime.activeFootprint && !isPartOnlyOverlay) {
      const activeMetrics = getFootprintRenderMetrics(runtime.activeFootprint, activeId, renderProfile, runtime.connectedPartIds);
      if (isFootprintInsideStageBounds(runtime.activeFootprint, activeMetrics, renderProfile, cameraBounds)) {
        const activePartPins = runtime.scene.partPinsMap.get(String(runtime.activeFootprint.id || "").toUpperCase()) || [];
        const activeMeasuredShape = drawMeasuredPartBodyCanvas(context, runtime.activeFootprint, activePartPins, activePalette, {
          bodyScale: clamp(activeMetrics.footprintScale * 0.98, 0.96, 1.08),
          labelScale: clamp(activeMetrics.labelScale * 0.9, 0.9, 1.18),
          forceLabel: true,
          hideLabel: true
        });
        if (!activeMeasuredShape) {
          drawFootprintCanvas(context, runtime.activeFootprint, activeMetrics, renderProfile, activePalette, { hideLabel: true });
        }
      }
    }

    if (hasSelectedConnection) {
      drawSelectedConnectionGuideLinesCanvas(context, runtime, cameraBounds);
    }

    if (!hasSelectedConnection) {
      const screenScale = getCurrentStageScreenScale(runtime.scene);
      buildVisibleNetMarkerRenderEntries(runtime, screenScale, cameraBounds).forEach((marker) => {
        context.beginPath();
        context.fillStyle = marker.fillStyle;
        context.strokeStyle = marker.strokeStyle;
        context.lineWidth = marker.lineWidthBoard;
        context.arc(
          marker.boardX,
          marker.boardY,
          marker.radiusBoard,
          0,
          Math.PI * 2
        );
        context.fill();
        context.stroke();
      });
    }

    if (!state.interacting) {
      context.save();
      drawPinLabelsCanvas(context, runtime);
      context.restore();
    }
    context.restore();
  }

  function paintStageNow() {
    if (!stageRuntime?.scene || !domRefs.world || !domRefs.baseCanvas || !domRefs.overlayCanvas) {
      return;
    }

    const scene = stageRuntime.scene;
    const renderProfile = buildRenderProfile(scene);
    const cssWidth = Math.max(1, Math.round(domRefs.world.clientWidth || scene.geometry.width));
    const cssHeight = Math.max(1, Math.round(domRefs.world.clientHeight || scene.geometry.height));
    const qualityBoost = getCanvasQualityBoost(scene);
    const cameraSnapshot = captureStageCameraSnapshot(scene, cssWidth, cssHeight);

    const baseCanvasState = ensureCanvasBackingStore(domRefs.baseCanvas, cssWidth, cssHeight, qualityBoost, scene.geometry);
    const overlayCanvasState = ensureCanvasBackingStore(domRefs.overlayCanvas, cssWidth, cssHeight, qualityBoost, scene.geometry);
    if (!baseCanvasState || !overlayCanvasState) {
      return;
    }

    const cacheSignature = buildStageBaseCacheSignature(scene, renderProfile, cssWidth, cssHeight, qualityBoost, cameraSnapshot);
    if (!stageBaseCacheCanvas || stageBaseCacheSignature !== cacheSignature) {
      const cacheCanvas = globalScope.document.createElement("canvas");
      const cacheState = ensureCanvasBackingStore(cacheCanvas, cssWidth, cssHeight, qualityBoost, scene.geometry, false);
      if (cacheState) {
        paintStageBaseContext(cacheState, stageRuntime, renderProfile, cameraSnapshot);
        stageBaseCacheCanvas = cacheCanvas;
        stageBaseCacheSignature = cacheSignature;
      }
    }

    baseCanvasState.context.setTransform(1, 0, 0, 1, 0, 0);
    baseCanvasState.context.clearRect(0, 0, baseCanvasState.pixelWidth, baseCanvasState.pixelHeight);
    if (stageBaseCacheCanvas) {
      baseCanvasState.context.drawImage(stageBaseCacheCanvas, 0, 0);
    }

    stageRenderSnapshot = cameraSnapshot;
    paintStageOverlayContext(overlayCanvasState, stageRuntime, renderProfile, cameraSnapshot);
    syncViewportTransformNow();
  }

  function scheduleStagePaint() {
    if (stagePaintFrame) {
      return;
    }

    stagePaintFrame = globalScope.requestAnimationFrame(() => {
      stagePaintFrame = 0;
      paintStageNow();
    });
  }

  function tryMapClientPointToBoardPoint(clientX, clientY) {
    if (!stageRuntime?.scene || !domRefs.viewport) {
      return null;
    }

    const viewportRect = domRefs.viewport.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.round(domRefs.world?.clientWidth || viewportRect.width || stageRuntime.scene.geometry.width));
    const cssHeight = Math.max(1, Math.round(domRefs.world?.clientHeight || viewportRect.height || stageRuntime.scene.geometry.height));
    const cameraSnapshot = captureStageCameraSnapshot(stageRuntime.scene, cssWidth, cssHeight);
    return mapStageLocalPointToBoardPoint(
      clientX - viewportRect.left,
      clientY - viewportRect.top,
      stageRuntime.scene,
      cameraSnapshot
    );
  }

  function getCurrentStageViewportSnapshot() {
    if (!stageRuntime?.scene || !domRefs.viewport) {
      return null;
    }

    const viewportRect = domRefs.viewport.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.round(domRefs.world?.clientWidth || viewportRect.width || stageRuntime.scene.geometry.width));
    const cssHeight = Math.max(1, Math.round(domRefs.world?.clientHeight || viewportRect.height || stageRuntime.scene.geometry.height));
    const cameraSnapshot = captureStageCameraSnapshot(stageRuntime.scene, cssWidth, cssHeight);
    return {
      viewportRect,
      cssWidth,
      cssHeight,
      cameraSnapshot,
      screenScale: Math.max(0.0001, Math.hypot(getStageLinearMatrix(cameraSnapshot).a, getStageLinearMatrix(cameraSnapshot).b))
    };
  }

  function buildInteractiveConnectionHitEntries(runtime, screenScale) {
    if (!runtime?.scene) {
      return [];
    }

    const safeScreenScale = Math.max(0.0001, Number(screenScale) || 0.0001);
    const entries = [];
    const seenKeys = new Set();

    buildVisiblePinLabelRenderEntries(runtime, safeScreenScale).forEach((label) => {
      if (!label?.connection || !label.connectionKey || seenKeys.has(label.connectionKey)) {
        return;
      }
      seenKeys.add(label.connectionKey);
      entries.push({
        connection: label.connection,
        connectionKey: label.connectionKey,
        boardX: Number(label.boardX || 0),
        boardY: Number(label.boardY || 0),
        radiusBoard: label.radiusBoard + (1.4 / safeScreenScale),
        scoreBias: label.isSelectedPin ? -0.02 : (label.isPeerPin ? 0.01 : 0)
      });
    });

    buildVisibleNetMarkerRenderEntries(runtime, safeScreenScale).forEach((marker) => {
      if (!marker?.connection || !marker.connectionKey || seenKeys.has(marker.connectionKey)) {
        return;
      }
      seenKeys.add(marker.connectionKey);
      entries.push({
        connection: marker.connection,
        connectionKey: marker.connectionKey,
        boardX: Number(marker.boardX || 0),
        boardY: Number(marker.boardY || 0),
        radiusBoard: marker.radiusBoard + (1.25 / safeScreenScale),
        scoreBias: 0.025
      });
    });

    return entries;
  }

  function measureConnectionHit(hitEntry, boardPoint) {
    const boardX = Number(hitEntry?.boardX || 0);
    const boardY = Number(hitEntry?.boardY || 0);
    if (!Number.isFinite(boardX) || !Number.isFinite(boardY)) {
      return null;
    }

    const deltaX = Number(boardPoint?.boardX || 0) - boardX;
    const deltaY = Number(boardPoint?.boardY || 0) - boardY;
    const radiusBoard = Math.max(0.24, Number(hitEntry?.radiusBoard || 0));
    const distance = Math.hypot(deltaX, deltaY);
    if (distance > radiusBoard) {
      return null;
    }

    return {
      score: (distance / Math.max(radiusBoard, 0.0001)) + Number(hitEntry?.scoreBias || 0),
      boardX,
      boardY
    };
  }

  function isPointInsideFootprint(boardPoint, footprint, metrics, renderProfile) {
    const deltaX = boardPoint.boardX - footprint.boardX;
    const deltaY = boardPoint.boardY - footprint.boardY;
    const inverseScale = 1 / Math.max(metrics.footprintScale, 0.0001);
    const scaledX = deltaX * inverseScale;
    const scaledY = deltaY * inverseScale;
    const angle = (-Number(footprint.rotation || 0) * Math.PI) / 180;
    const localX = (scaledX * Math.cos(angle)) - (scaledY * Math.sin(angle));
    const localY = (scaledX * Math.sin(angle)) + (scaledY * Math.cos(angle));

    if (renderProfile.simplifiedFootprints && !metrics.isActive) {
      return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY)) <= (metrics.pointRadius + 3.6);
    }

    if (footprint.kind === "hole") {
      return Math.sqrt((localX * localX) + (localY * localY)) <= ((footprint.width / 2) + 3.4);
    }

    return Math.abs(localX) <= ((footprint.width / 2) + 4)
      && Math.abs(localY) <= ((footprint.height / 2) + 4);
  }

  function resolveStageHitTarget(clientX, clientY) {
    if (!stageRuntime?.scene) {
      return null;
    }

    const boardPoint = tryMapClientPointToBoardPoint(clientX, clientY);
    if (!boardPoint) {
      return null;
    }

    const viewportSnapshot = getCurrentStageViewportSnapshot();
    const screenScale = viewportSnapshot?.screenScale || getCurrentStageScreenScale(stageRuntime.scene);
    const interactiveEntries = buildInteractiveConnectionHitEntries(stageRuntime, screenScale);
    let bestConnectionHit = null;

    for (let index = 0; index < interactiveEntries.length; index += 1) {
      const hitEntry = interactiveEntries[index];
      const measuredHit = measureConnectionHit(hitEntry, boardPoint);
      if (!measuredHit) {
        continue;
      }

      if (!bestConnectionHit || measuredHit.score < bestConnectionHit.score) {
        bestConnectionHit = {
          type: "connection",
          connection: hitEntry.connection,
          anchorBoardX: measuredHit.boardX,
          anchorBoardY: measuredHit.boardY,
          score: measuredHit.score
        };
      }
    }

    if (bestConnectionHit) {
      return bestConnectionHit;
    }

    const renderProfile = buildRenderProfile(stageRuntime.scene);
    for (let index = stageRuntime.scene.visibleFootprints.length - 1; index >= 0; index -= 1) {
      const footprint = stageRuntime.scene.visibleFootprints[index];
      const metrics = getFootprintRenderMetrics(
        footprint,
        stageRuntime.activeFootprint.id,
        renderProfile,
        stageRuntime.connectedPartIds
      );
      if (isPointInsideFootprint(boardPoint, footprint, metrics, renderProfile)) {
        return {
          type: "part",
          footprint,
          anchorBoardX: Number(footprint.boardX || 0),
          anchorBoardY: Number(footprint.boardY || 0)
        };
      }
    }

    return null;
  }

  function applyStageHitTarget(hitTarget) {
    if (!hitTarget) {
      return;
    }

    if (hitTarget.type === "connection" && hitTarget.connection) {
      state.selectedPreviewNode = hitTarget.connection.partId || state.selectedPreviewNode;
      state.selectedNetName = hitTarget.connection.netName || getPrimaryNetForPart(state.selectedPreviewNode);
      state.selectedConnectionKey = buildConnectionKey(hitTarget.connection);
      state.activePanel = "net";
      render();
      return;
    }

    if (hitTarget.type === "part" && hitTarget.footprint) {
      state.selectedPreviewNode = hitTarget.footprint.id || state.selectedPreviewNode;
      state.selectedConnectionKey = "";
      state.activePanel = "part";
      render();
    }
  }

  function scheduleStageHover(clientX, clientY) {
    pendingHoverPoint = { clientX, clientY };
    if (hoverFrame) {
      return;
    }

    hoverFrame = globalScope.requestAnimationFrame(() => {
      hoverFrame = 0;
      const currentHoverPoint = pendingHoverPoint;
      pendingHoverPoint = null;
      if (!currentHoverPoint) {
        hideHoverTooltip();
        return;
      }

      const hitTarget = resolveStageHitTarget(currentHoverPoint.clientX, currentHoverPoint.clientY);
      if (!hitTarget) {
        hideHoverTooltip();
        return;
      }

      const hoverPayload = hitTarget.type === "connection"
        ? getConnectionHoverData(buildConnectionKey(hitTarget.connection))
        : getPartHoverData(hitTarget.footprint.id);
      const viewportSnapshot = getCurrentStageViewportSnapshot();
      if (!viewportSnapshot) {
        hideHoverTooltip();
        return;
      }

      const anchorBoardX = Number(hitTarget.anchorBoardX ?? hitTarget.connection?.boardX ?? hitTarget.footprint?.boardX ?? 0);
      const anchorBoardY = Number(hitTarget.anchorBoardY ?? hitTarget.connection?.boardY ?? hitTarget.footprint?.boardY ?? 0);
      const localAnchorPoint = mapBoardPointToStageLocalPoint(
        anchorBoardX,
        anchorBoardY,
        stageRuntime.scene,
        viewportSnapshot.cameraSnapshot
      );
      showHoverTooltip(hoverPayload, localAnchorPoint.localX, localAnchorPoint.localY);
    });
  }

  function buildPadMarkup(footprint, renderProfile) {
    if (!renderProfile.showPads) {
      return "";
    }

    if (footprint.padCount <= 0 || footprint.kind === "hole") {
      return "";
    }

    const pads = [];
    const half = Math.max(1, Math.floor(footprint.padCount / 2));

    if (footprint.kind === "passive" || footprint.kind === "jumper") {
      pads.push(`<rect class="boardviewer-svg-pad" x="${(-footprint.width / 2) - 10}" y="-4" width="10" height="8" rx="1.4"></rect>`);
      pads.push(`<rect class="boardviewer-svg-pad" x="${(footprint.width / 2)}" y="-4" width="10" height="8" rx="1.4"></rect>`);
      return pads.join("");
    }

    if (footprint.kind === "connector" || footprint.kind === "socket") {
      const step = footprint.width / Math.max(half, 1);
      for (let index = 0; index < half; index += 1) {
        const x = (-footprint.width / 2) + (step * index) + (step * 0.18);
        pads.push(`<rect class="boardviewer-svg-pad" x="${x.toFixed(1)}" y="${(footprint.height / 2) - 2}" width="${Math.max(6, step * 0.42).toFixed(1)}" height="10" rx="1.4"></rect>`);
      }
      return pads.join("");
    }

    const step = footprint.height / Math.max(half, 1);
    for (let index = 0; index < half; index += 1) {
      const y = (-footprint.height / 2) + (step * index) + (step * 0.18);
      const padHeight = Math.max(6, step * 0.42);
      pads.push(`<rect class="boardviewer-svg-pad" x="${(-footprint.width / 2) - 9}" y="${y.toFixed(1)}" width="9" height="${padHeight.toFixed(1)}" rx="1.2"></rect>`);
      pads.push(`<rect class="boardviewer-svg-pad" x="${(footprint.width / 2)}" y="${y.toFixed(1)}" width="9" height="${padHeight.toFixed(1)}" rx="1.2"></rect>`);
    }

    return pads.join("");
  }

  function renderOutlinePath(outlineSegments, outlineStride) {
    if (!Array.isArray(outlineSegments) || outlineSegments.length === 0) {
      return "";
    }

    const pathParts = [];
    const stride = Math.max(1, Number(outlineStride) || 1);
    for (let index = 0; index < outlineSegments.length; index += stride) {
      const segment = outlineSegments[index];
      pathParts.push(
        `M ${segment.boardX1.toFixed(1)} ${segment.boardY1.toFixed(1)} ` +
        `L ${segment.boardX2.toFixed(1)} ${segment.boardY2.toFixed(1)}`
      );
    }

    return pathParts.join(" ");
  }

  function buildTracePath(traces, onlyStrong) {
    if (!Array.isArray(traces) || traces.length === 0) {
      return "";
    }

    return traces
      .filter((trace) => Boolean(trace.strong) === Boolean(onlyStrong))
      .map((trace) => trace.pathData)
      .join(" ");
  }

  function getPartHoverData(partId) {
    if (!partId) {
      return null;
    }

    const scene = getScene();
    const footprint = scene.footprints.find((node) => String(node.id || "").toUpperCase() === String(partId || "").toUpperCase());
    if (!footprint) {
      return null;
    }

    const partConnections = getPartConnections(footprint.id);
    const connectionLines = partConnections
      .slice(0, 8)
      .map((connection) => `Pin ${getConnectionPinDisplay(connection)} -> ${getConnectionPeerSummary(connection, 2)}`);
    return {
      title: footprint.id,
      subtitle: footprint.partName || footprint.kind || "Component",
      details: [
        `Layer: ${footprint.layer || state.viewerLayer}`,
        `Pins: ${partConnections.length}`,
        ...(connectionLines.length > 0 ? connectionLines : [`Net: ${footprint.net || "-"}`]),
        ...(partConnections.length > connectionLines.length ? [`+${partConnections.length - connectionLines.length} pin lain`] : [])
      ]
    };
  }

  function getConnectionHoverData(connectionKey) {
    if (!connectionKey) {
      return null;
    }

    const connection = getSessionConnections().find((candidate) => buildConnectionKey(candidate) === connectionKey);
    if (!connection) {
      return null;
    }

    return {
      title: `${connection.partId || "-"} / ${getConnectionPinDisplay(connection)}`,
      subtitle: connection.pinName || connection.info || "Pin",
      details: [
        `Net: ${connection.netName || "-"}`,
        `Layer: ${connection.layer || state.viewerLayer}`,
        `Terhubung: ${getConnectionPeerSummary(connection, 3)}`,
        connection.info ? `Info: ${connection.info}` : ""
      ].filter(Boolean)
    };
  }

  function renderHoverTooltip(payload) {
    return `
      <strong>${escapeHtml(payload.title || "-")}</strong>
      <span>${escapeHtml(payload.subtitle || "")}</span>
      ${payload.details.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    `;
  }

  function hideHoverTooltip() {
    if (!domRefs.tooltip) {
      return;
    }

    domRefs.tooltip.hidden = true;
    domRefs.tooltip.innerHTML = "";
  }

  function showHoverTooltip(payload, anchorLocalX, anchorLocalY) {
    const viewport = domRefs.viewport;
    if (!domRefs.tooltip || !viewport || !payload) {
      hideHoverTooltip();
      return;
    }

    const rect = viewport.getBoundingClientRect();
    domRefs.tooltip.innerHTML = renderHoverTooltip(payload);
    domRefs.tooltip.hidden = false;
    domRefs.tooltip.style.visibility = "hidden";
    domRefs.tooltip.style.transform = "translate(0px, 0px)";

    const tooltipWidth = Math.max(220, Math.ceil(domRefs.tooltip.offsetWidth || 258));
    const tooltipHeight = Math.max(56, Math.ceil(domRefs.tooltip.offsetHeight || (42 + (payload.details.length * 18))));
    const nextX = clamp(
      Number(anchorLocalX || 0) - (tooltipWidth / 2),
      8,
      Math.max(8, rect.width - tooltipWidth - 10)
    );
    const preferredY = Number(anchorLocalY || 0) - tooltipHeight - 18;
    const fallbackY = Number(anchorLocalY || 0) + 16;
    const nextY = preferredY >= 8
      ? preferredY
      : clamp(fallbackY, 8, Math.max(8, rect.height - tooltipHeight - 10));

    domRefs.tooltip.style.transform = `translate(${Math.round(nextX)}px, ${Math.round(nextY)}px)`;
    domRefs.tooltip.style.visibility = "";
  }

  function setInteractionState(nextValue) {
    const previousValue = Boolean(state.interacting);
    state.interacting = Boolean(nextValue);
    if (idleCrispTimer) {
      globalScope.clearTimeout(idleCrispTimer);
      idleCrispTimer = 0;
    }
    if (state.interacting) {
      state.idleSharp = false;
    }
    syncViewportTransform();
    if (previousValue && !state.interacting) {
      scheduleStagePaint();
      idleCrispTimer = globalScope.setTimeout(() => {
        idleCrispTimer = 0;
        if (state.interacting) {
          return;
        }
        state.idleSharp = true;
        scheduleStagePaint();
      }, 180);
    }
  }

  function pulseInteractionState() {
    setInteractionState(true);
    if (interactionCooldownTimer) {
      globalScope.clearTimeout(interactionCooldownTimer);
    }

    interactionCooldownTimer = globalScope.setTimeout(() => {
      interactionCooldownTimer = 0;
      setInteractionState(false);
    }, 150);
  }

  function renderFootprintSvg(footprint, activeId, renderProfile, connectedPartIds) {
    const isActive = footprint.id === activeId;
    const isMuted = !isVisibleForLayer(footprint, state.viewerLayer);
    const isNetHit = connectedPartIds.has(footprint.id);
    const componentArea = Math.max(1, footprint.width * footprint.height);
    const componentScale = clamp(Math.sqrt(componentArea / 2100), 0.56, 1.46);
    const footprintScale = isActive
      ? Math.max(renderProfile.footprintScale * componentScale, 0.2)
      : (renderProfile.footprintScale * componentScale);
    const groupClassName = [
      "boardviewer-svg-footprint",
      isActive ? "is-active" : "",
      isNetHit ? "is-net-hit" : "",
      isMuted ? "is-muted" : ""
    ].filter(Boolean).join(" ");
    const showLabel = true;
    const componentLabelScale = clamp(Math.sqrt(componentArea / 1500), 0.68, 1.9);
    const labelScale = isActive
      ? Math.max(renderProfile.labelScale * componentLabelScale, 0.42)
      : (renderProfile.labelScale * componentLabelScale);
    const primaryNet = getPrimaryNetForPart(footprint.id) || footprint.net || "";
    const hoverAttrs = [
      `data-preview-node="${escapeHtml(footprint.id)}"`,
      `data-hover-kind="part"`,
      `data-part-id="${escapeHtml(footprint.id)}"`,
      `data-part-name="${escapeHtml(footprint.partName || footprint.kind || "")}"`,
      `data-net-name="${escapeHtml(primaryNet)}"`
    ].join(" ");

    if (renderProfile.simplifiedFootprints && !isActive) {
      const pointRadius = footprint.kind === "connector"
        ? 8
        : footprint.kind === "hole"
          ? 6
          : 4.6;
      return `
        <g transform="translate(${footprint.boardX.toFixed(1)} ${footprint.boardY.toFixed(1)})">
          <circle
            class="boardviewer-svg-point${isNetHit ? " is-net-hit" : ""}${isMuted ? " is-muted" : ""}"
            ${hoverAttrs}
            r="${pointRadius.toFixed(1)}"
          ></circle>
          ${showLabel ? `<text class="boardviewer-svg-caption${isNetHit ? " is-net-hit" : ""}" y="${(pointRadius + 11).toFixed(1)}" transform="scale(${labelScale.toFixed(3)})">${escapeHtml(footprint.id)}</text>` : ""}
        </g>
      `;
    }

    if (footprint.kind === "hole") {
      return `
        <g
          class="${groupClassName}"
          ${hoverAttrs}
          transform="translate(${footprint.boardX.toFixed(1)} ${footprint.boardY.toFixed(1)}) scale(${footprintScale.toFixed(3)})"
        >
          <circle class="boardviewer-svg-body is-hole" r="${(footprint.width / 2).toFixed(1)}"></circle>
          <circle fill="rgba(12, 18, 32, 0.88)" stroke="rgba(223, 233, 255, 0.46)" stroke-width="1.1" r="${(footprint.width / 4).toFixed(1)}"></circle>
          ${showLabel ? `<text class="boardviewer-svg-caption${isNetHit ? " is-net-hit" : ""}" y="${(footprint.width / 2) + 18}" font-size="12" transform="scale(${labelScale.toFixed(3)})">${escapeHtml(footprint.id)}</text>` : ""}
        </g>
      `;
    }

    return `
      <g
        class="${groupClassName}"
        ${hoverAttrs}
        transform="translate(${footprint.boardX.toFixed(1)} ${footprint.boardY.toFixed(1)}) rotate(${footprint.rotation}) scale(${footprintScale.toFixed(3)})"
      >
        ${buildPadMarkup(footprint, renderProfile)}
        <rect
          class="boardviewer-svg-body"
          x="${(-footprint.width / 2).toFixed(1)}"
          y="${(-footprint.height / 2).toFixed(1)}"
          width="${footprint.width.toFixed(1)}"
          height="${footprint.height.toFixed(1)}"
          rx="${Math.max(3, Math.min(footprint.height, footprint.width) * 0.08).toFixed(1)}"
        ></rect>
        ${showLabel ? `<text class="boardviewer-svg-caption${isNetHit ? " is-net-hit" : ""}" font-size="${footprint.textSize}" y="2" transform="scale(${labelScale.toFixed(3)})">${escapeHtml(footprint.id)}</text>` : ""}
      </g>
    `;
  }

  function renderNetPinMarkers(netPins) {
    if (!Array.isArray(netPins) || netPins.length === 0) {
      return "";
    }

    return netPins.map((connection) => {
      const isSelected = buildConnectionKey(connection) === state.selectedConnectionKey;
      const markerRoleClass = connection.markerRole === "shared"
        ? " is-shared"
        : connection.markerRole === "part"
          ? " is-part"
          : " is-net";
      return `
        <circle
          class="boardviewer-svg-net-pin${markerRoleClass}${isSelected ? " is-selected" : ""}"
          data-preview-node="${escapeHtml(connection.partId)}"
          data-hover-kind="pin"
          data-net-name="${escapeHtml(connection.netName)}"
          data-connection-key="${escapeHtml(buildConnectionKey(connection))}"
          data-pin="${escapeHtml(connection.pin || "")}"
          data-pin-name="${escapeHtml(connection.pinName || "")}"
          data-info="${escapeHtml(connection.info || "")}"
          data-layer="${escapeHtml(connection.layer || "")}"
          cx="${Number(connection.boardX).toFixed(1)}"
          cy="${Number(connection.boardY).toFixed(1)}"
          r="${isSelected ? "6.2" : "4.2"}"
        ></circle>
      `;
    }).join("");
  }

  function getActiveFootprint(scene) {
    return scene.visibleFootprints.find((node) => node.id === state.selectedPreviewNode)
      || scene.visibleFootprints[0]
      || scene.footprints[0]
      || inferFootprint(defaultNodes[0]);
  }

  function ensureSelection(scene) {
    if (!scene.visibleFootprints.some((node) => node.id === state.selectedPreviewNode)) {
      state.selectedPreviewNode = scene.visibleFootprints[0]?.id || scene.footprints[0]?.id || defaultNodes[0].id;
    }
  }

  function buildWorldTransform() {
    if (!domRefs.world || !stageRuntime?.scene || !stageRenderSnapshot) {
      return "matrix(1, 0, 0, 1, 0, 0)";
    }

    const cssWidth = Math.max(1, Math.round(domRefs.world.clientWidth || stageRenderSnapshot.cssWidth));
    const cssHeight = Math.max(1, Math.round(domRefs.world.clientHeight || stageRenderSnapshot.cssHeight));
    if (stageRenderSnapshot.cssWidth !== cssWidth || stageRenderSnapshot.cssHeight !== cssHeight) {
      return "matrix(1, 0, 0, 1, 0, 0)";
    }

    const currentSnapshot = captureStageCameraSnapshot(stageRuntime.scene, cssWidth, cssHeight);
    const relativeMatrix = buildRelativeStageWorldMatrix(stageRenderSnapshot, currentSnapshot);
    if (!relativeMatrix) {
      return "matrix(1, 0, 0, 1, 0, 0)";
    }

    return `matrix(${relativeMatrix.a.toFixed(6)}, ${relativeMatrix.b.toFixed(6)}, ${relativeMatrix.c.toFixed(6)}, ${relativeMatrix.d.toFixed(6)}, ${relativeMatrix.e.toFixed(3)}, ${relativeMatrix.f.toFixed(3)})`;
  }

  function syncViewportTransformNow() {
    if (domRefs.world) {
      domRefs.world.style.transform = buildWorldTransform();
      domRefs.world.classList.toggle("is-interacting", Boolean(state.interacting));
    }

    if (domRefs.viewport) {
      domRefs.viewport.classList.toggle("is-dragging", Boolean(state.dragging));
    }

    if (domRefs.zoomLabel) {
      domRefs.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
    }
  }

  function syncViewportTransform() {
    if (viewportSyncFrame) {
      return;
    }

    viewportSyncFrame = globalScope.requestAnimationFrame(() => {
      viewportSyncFrame = 0;
      syncViewportTransformNow();
    });
  }

  function fitView() {
    hideHoverTooltip();
    if (interactionCooldownTimer) {
      globalScope.clearTimeout(interactionCooldownTimer);
      interactionCooldownTimer = 0;
    }
    if (idleCrispTimer) {
      globalScope.clearTimeout(idleCrispTimer);
      idleCrispTimer = 0;
    }
    state.interacting = false;
    state.idleSharp = true;
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    syncViewportTransform();
    scheduleStagePaint();
  }

  function focusBoardPoint(boardX, boardY, zoomOverride = null) {
    if (!stageRuntime?.scene || !domRefs.world) {
      return;
    }

    hideHoverTooltip();
    if (Number.isFinite(zoomOverride)) {
      state.zoom = clamp(Number(zoomOverride), zoomLimits.min, zoomLimits.max);
    }

    const cssWidth = Math.max(1, Math.round(domRefs.world.clientWidth || stageRuntime.scene.geometry.width));
    const cssHeight = Math.max(1, Math.round(domRefs.world.clientHeight || stageRuntime.scene.geometry.height));
    const snapshot = captureStageCameraSnapshot(stageRuntime.scene, cssWidth, cssHeight);
    const linear = getStageLinearMatrix(snapshot);
    const deltaX = Number(boardX || 0) - (stageRuntime.scene.geometry.width / 2);
    const deltaY = Number(boardY || 0) - (stageRuntime.scene.geometry.height / 2);
    state.panX = -((linear.a * deltaX) + (linear.c * deltaY));
    state.panY = -((linear.b * deltaX) + (linear.d * deltaY));
    state.interacting = false;
    state.idleSharp = true;
    syncViewportTransform();
    scheduleStagePaint();
  }

  function normalizeFocusBounds(minX, maxX, minY, maxY) {
    if (![minX, maxX, minY, maxY].every(Number.isFinite)) {
      return null;
    }

    return {
      minX,
      maxX,
      minY,
      maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
      spanX: Math.max(1.2, maxX - minX),
      spanY: Math.max(1.2, maxY - minY)
    };
  }

  function mergeFocusBounds(baseBounds, nextBounds) {
    if (!baseBounds) {
      return nextBounds || null;
    }
    if (!nextBounds) {
      return baseBounds;
    }

    return normalizeFocusBounds(
      Math.min(baseBounds.minX, nextBounds.minX),
      Math.max(baseBounds.maxX, nextBounds.maxX),
      Math.min(baseBounds.minY, nextBounds.minY),
      Math.max(baseBounds.maxY, nextBounds.maxY)
    );
  }

  function buildPartFocusBounds(footprint, partPins) {
    const pinBounds = buildPartPinBounds(partPins);
    const measuredShape = buildMeasuredPartShape(footprint, partPins);
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    if (pinBounds) {
      minX = Math.min(minX, pinBounds.minX);
      maxX = Math.max(maxX, pinBounds.maxX);
      minY = Math.min(minY, pinBounds.minY);
      maxY = Math.max(maxY, pinBounds.maxY);
    }

    if (measuredShape) {
      const halfWidth = Math.max(1.8, Number(measuredShape.width || 0) / 2);
      const halfHeight = Math.max(1.8, Number(measuredShape.height || 0) / 2);
      const angle = Number(measuredShape.angle || 0);
      const extentX = (Math.abs(Math.cos(angle)) * halfWidth) + (Math.abs(Math.sin(angle)) * halfHeight);
      const extentY = (Math.abs(Math.sin(angle)) * halfWidth) + (Math.abs(Math.cos(angle)) * halfHeight);
      const padInset = Math.max(
        2.2,
        Number(measuredShape.padLength || 0) * 0.9,
        Number(measuredShape.padThickness || 0) * 1.2
      );
      minX = Math.min(minX, Number(measuredShape.centerX || footprint.boardX || 0) - extentX - padInset);
      maxX = Math.max(maxX, Number(measuredShape.centerX || footprint.boardX || 0) + extentX + padInset);
      minY = Math.min(minY, Number(measuredShape.centerY || footprint.boardY || 0) - extentY - padInset);
      maxY = Math.max(maxY, Number(measuredShape.centerY || footprint.boardY || 0) + extentY + padInset);
    }

    if (![minX, maxX, minY, maxY].every(Number.isFinite)) {
      const halfWidth = Math.max(6, Number(footprint?.width || 0) / 2);
      const halfHeight = Math.max(6, Number(footprint?.height || 0) / 2);
      return normalizeFocusBounds(
        Number(footprint?.boardX || 0) - halfWidth,
        Number(footprint?.boardX || 0) + halfWidth,
        Number(footprint?.boardY || 0) - halfHeight,
        Number(footprint?.boardY || 0) + halfHeight
      );
    }

    const perimeterPadding = Math.max(
      8,
      Number(pinBounds?.avgPadMajor || 0) * 1.2,
      Number(pinBounds?.avgPadMinor || 0) * 1.8
    );
    return normalizeFocusBounds(
      minX - perimeterPadding,
      maxX + perimeterPadding,
      minY - perimeterPadding,
      maxY + perimeterPadding
    );
  }

  function resolveViewportFocusZoom(spanX, spanY, options = {}) {
    const scene = getScene();
    if (!scene?.geometry) {
      return clamp(state.zoom, zoomLimits.min, zoomLimits.max);
    }

    const viewportWidth = Math.max(1, Number(domRefs.world?.clientWidth || scene.geometry.width || 1));
    const viewportHeight = Math.max(1, Number(domRefs.world?.clientHeight || scene.geometry.height || 1));
    const fitScale = Math.max(0.0001, getStageFitScale(scene, viewportWidth, viewportHeight));
    const paddedSpanX = Math.max(18, Number(spanX || 0) + Number(options.paddingX || 0));
    const paddedSpanY = Math.max(18, Number(spanY || 0) + Number(options.paddingY || 0));
    const fillX = clamp(Number(options.fillX || 0.4), 0.18, 0.92);
    const fillY = clamp(Number(options.fillY || 0.46), 0.18, 0.92);
    return clamp(
      Math.min(
        (viewportWidth * fillX) / (paddedSpanX * fitScale),
        (viewportHeight * fillY) / (paddedSpanY * fitScale)
      ),
      zoomLimits.min,
      zoomLimits.max
    );
  }

  function resolveFocusedZoom(zoomOverride, fitZoom) {
    if (Number.isFinite(zoomOverride)) {
      return clamp(Math.max(Number(zoomOverride), fitZoom), zoomLimits.min, zoomLimits.max);
    }

    return clamp(fitZoom, zoomLimits.min, zoomLimits.max);
  }

  function focusPartInViewport(partId, zoomOverride = null) {
    const scene = getScene();
    const targetKey = String(partId || "").toUpperCase();
    const footprint = scene.visibleFootprints.find((node) => String(node.id || "").toUpperCase() === targetKey)
      || scene.footprints.find((node) => String(node.id || "").toUpperCase() === targetKey);
    if (!footprint) {
      return false;
    }

    const partPins = scene.partPinsMap.get(targetKey) || [];
    const focusBounds = buildPartFocusBounds(footprint, partPins);
    const fitZoom = focusBounds
      ? resolveViewportFocusZoom(focusBounds.spanX, focusBounds.spanY, {
          paddingX: Math.max(16, focusBounds.spanX * 0.22),
          paddingY: Math.max(16, focusBounds.spanY * 0.26),
          fillX: 0.38,
          fillY: 0.44
        })
      : clamp(state.zoom, zoomLimits.min, zoomLimits.max);
    focusBoardPoint(
      focusBounds?.centerX ?? footprint.boardX,
      focusBounds?.centerY ?? footprint.boardY,
      resolveFocusedZoom(zoomOverride, fitZoom)
    );
    return true;
  }

  function focusConnectionClusterInViewport(connection, zoomOverride = null) {
    if (!connection) {
      return false;
    }

    const scene = getScene();
    if (!scene?.geometry || !scene?.bounds) {
      return false;
    }

    const peers = getVisibleNetPins(connection.netName)
      .filter((candidate) => buildConnectionKey(candidate) !== buildConnectionKey(connection))
      .slice(0, 24);
    const clusterConnections = [connection, ...peers];
    const relatedPartIds = new Set(
      clusterConnections
        .map((candidate) => String(candidate?.partId || "").toUpperCase())
        .filter(Boolean)
    );
    let focusBounds = null;

    relatedPartIds.forEach((partId) => {
      const footprint = scene.visibleFootprints.find((node) => String(node.id || "").toUpperCase() === partId)
        || scene.footprints.find((node) => String(node.id || "").toUpperCase() === partId);
      if (!footprint) {
        return;
      }

      const partPins = scene.partPinsMap.get(partId) || [];
      focusBounds = mergeFocusBounds(focusBounds, buildPartFocusBounds(footprint, partPins));
    });

    clusterConnections.forEach((candidate) => {
      const sourceX = Number(candidate?.x);
      const sourceY = Number(candidate?.y);
      if (!Number.isFinite(sourceX) || !Number.isFinite(sourceY)) {
        return;
      }

      const boardX = normalizeBoardX(sourceX, scene.bounds, scene.geometry);
      const boardY = normalizeBoardY(sourceY, scene.bounds, scene.geometry);
      focusBounds = mergeFocusBounds(
        focusBounds,
        normalizeFocusBounds(boardX - 3.2, boardX + 3.2, boardY - 3.2, boardY + 3.2)
      );
    });

    if (!focusBounds) {
      return false;
    }

    const fitZoom = resolveViewportFocusZoom(focusBounds.spanX, focusBounds.spanY, {
      paddingX: Math.max(18, focusBounds.spanX * 0.18),
      paddingY: Math.max(18, focusBounds.spanY * 0.24),
      fillX: 0.4,
      fillY: 0.46
    });
    const resolvedZoom = resolveFocusedZoom(zoomOverride, fitZoom);

    focusBoardPoint(
      focusBounds.centerX,
      focusBounds.centerY,
      resolvedZoom
    );
    return true;
  }

  function applyRequestedInitialView() {
    if (requestedInitialViewApplied) {
      return;
    }

    const requestedPartId = getRequestedPartId();
    const requestedPin = getRequestedPin();
    const requestedZoom = getRequestedZoom();
    if (!requestedPartId && !requestedPin && !Number.isFinite(requestedZoom)) {
      requestedInitialViewApplied = true;
      return;
    }

    requestedInitialViewApplied = true;
    const requestedConnection = requestedPin
      ? getPartConnections(requestedPartId || state.selectedPreviewNode)
        .find((connection) => String(getConnectionPinDisplay(connection)).trim().toUpperCase() === requestedPin.toUpperCase())
      : null;
    if (requestedConnection) {
      state.selectedPreviewNode = requestedConnection.partId || state.selectedPreviewNode;
      state.selectedNetName = requestedConnection.netName || "";
      state.selectedConnectionKey = buildConnectionKey(requestedConnection);
      state.activePanel = "net";
      render();
      if (focusConnectionClusterInViewport(requestedConnection, requestedZoom)) {
        return;
      }
    }

    if ((requestedPartId || requestedConnection?.partId) && focusPartInViewport(requestedPartId || requestedConnection?.partId, requestedZoom)) {
      return;
    }

    if (Number.isFinite(requestedZoom)) {
      state.zoom = clamp(Number(requestedZoom), zoomLimits.min, zoomLimits.max);
      syncViewportTransform();
      scheduleStagePaint();
    }
  }

  function getViewportCenterPoint() {
    const viewport = domRefs.viewport || root?.querySelector(".boardviewer-stage-viewport");
    if (!viewport) {
      return null;
    }

    const rect = viewport.getBoundingClientRect();
    return {
      clientX: rect.left + (rect.width / 2),
      clientY: rect.top + (rect.height / 2)
    };
  }

  function zoomAtViewportPoint(nextZoom, clientX, clientY) {
    const viewport = domRefs.viewport || root?.querySelector(".boardviewer-stage-viewport");
    const previousZoom = state.zoom;
    const normalizedNextZoom = clamp(nextZoom, zoomLimits.min, zoomLimits.max);
    hideHoverTooltip();
    if (!viewport || Math.abs(normalizedNextZoom - previousZoom) < 0.0001) {
      state.zoom = normalizedNextZoom;
      syncViewportTransform();
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const cursorX = clientX - rect.left - (rect.width / 2);
    const cursorY = clientY - rect.top - (rect.height / 2);
    const zoomRatio = normalizedNextZoom / previousZoom;

    state.panX = (zoomRatio * state.panX) + ((1 - zoomRatio) * cursorX);
    state.panY = (zoomRatio * state.panY) + ((1 - zoomRatio) * cursorY);
    state.zoom = normalizedNextZoom;
    pulseInteractionState();
    syncViewportTransform();
    scheduleStagePaint();
  }

  function getWheelZoomTarget(deltaY, deltaMode = 0) {
    const normalizedDelta = deltaMode === 1
      ? deltaY * 16
      : deltaMode === 2
        ? deltaY * 72
        : deltaY;
    const direction = normalizedDelta < 0 ? 1 : -1;
    const intensity = clamp(Math.abs(normalizedDelta) / 120, 0.85, 2.4);
    const multiplier = 1 + (0.24 * intensity);
    return direction > 0
      ? state.zoom * multiplier
      : state.zoom / multiplier;
  }

  function getStepZoomTarget(direction) {
    const multiplier = state.zoom < 1
      ? 1.18
      : state.zoom < 4
        ? 1.28
        : 1.42;
    return direction > 0
      ? state.zoom * multiplier
      : state.zoom / multiplier;
  }

  function buildDebugInteractivePinEntries() {
    if (!stageRuntime?.scene) {
      return [];
    }

    const viewportSnapshot = getCurrentStageViewportSnapshot();
    if (!viewportSnapshot) {
      return [];
    }

    const screenScale = viewportSnapshot.screenScale || getCurrentStageScreenScale(stageRuntime.scene);
    const labelEntries = state.interacting
      ? []
      : buildVisiblePinLabelRenderEntries(stageRuntime, screenScale);
    const markerEntries = buildVisibleNetMarkerRenderEntries(stageRuntime, screenScale);
    const toDebugEntry = (entry, kind) => {
      const localPoint = mapBoardPointToStageLocalPoint(
        Number(entry.boardX || 0),
        Number(entry.boardY || 0),
        stageRuntime.scene,
        viewportSnapshot.cameraSnapshot
      );
      return {
        kind,
        connectionKey: entry.connectionKey || "",
        partId: String(entry.connection?.partId || ""),
        pin: getConnectionPinDisplay(entry.connection),
        netName: String(entry.connection?.netName || ""),
        boardX: Number(entry.boardX || 0),
        boardY: Number(entry.boardY || 0),
        localX: Number(localPoint.localX || 0),
        localY: Number(localPoint.localY || 0),
        radiusBoard: Number(entry.radiusBoard || 0),
        radiusScreen: Number(entry.radiusBoard || 0) * screenScale,
        selected: Boolean(entry.isSelectedPin || entry.connectionKey === state.selectedConnectionKey)
      };
    };

    return [
      ...labelEntries.map((entry) => toDebugEntry(entry, "label")),
      ...markerEntries.map((entry) => toDebugEntry(entry, "marker"))
    ];
  }

  globalScope.__TEKNISIHUB_BOARDVIEW_DEBUG__ = {
    getStateSnapshot() {
      return {
        selectedPreviewNode: state.selectedPreviewNode,
        selectedNetName: state.selectedNetName,
        selectedConnectionKey: state.selectedConnectionKey,
        activePanel: state.activePanel,
        zoom: state.zoom,
        panX: state.panX,
        panY: state.panY,
        interacting: state.interacting,
        viewerLayer: state.viewerLayer
      };
    },
    getInteractivePins() {
      return buildDebugInteractivePinEntries();
    },
    getConnectionScreenPoint(connectionKey) {
      const targetKey = String(connectionKey || "");
      return buildDebugInteractivePinEntries().find((entry) => entry.connectionKey === targetKey) || null;
    },
    resolveHitAtLocal(localX, localY) {
      const rect = domRefs.viewport?.getBoundingClientRect();
      if (!rect) {
        return null;
      }
      const hitTarget = resolveStageHitTarget(
        rect.left + Number(localX || 0),
        rect.top + Number(localY || 0)
      );
      if (!hitTarget) {
        return null;
      }
      return {
        type: hitTarget.type,
        partId: String(hitTarget.connection?.partId || hitTarget.footprint?.id || ""),
        pin: hitTarget.connection ? getConnectionPinDisplay(hitTarget.connection) : "",
        netName: String(hitTarget.connection?.netName || ""),
        connectionKey: hitTarget.connection ? buildConnectionKey(hitTarget.connection) : ""
      };
    }
  };

  function renderLoading() {
    if (!root) {
      return;
    }

    stageRuntime = null;

    root.innerHTML = `
      <section class="boardviewer-loading">
        <article class="boardviewer-loading-card">
          <p class="boardviewer-kicker">Boardview TeknisiHub</p>
          <h1>Menyiapkan session offline</h1>
          <p>Local service sedang memuat file boardview yang tadi Anda pilih. Begitu session siap, viewer akan pindah langsung ke workspace penuh.</p>
        </article>
      </section>
    `;
  }

  function renderError() {
    if (!root) {
      return;
    }

    stageRuntime = null;

    root.innerHTML = `
      <section class="boardviewer-error">
        <article class="boardviewer-error-card">
          <p class="boardviewer-kicker">Boardview TeknisiHub</p>
          <h1>Session viewer belum siap</h1>
          <p>${escapeHtml(state.errorMessage || "Session Boardview TeknisiHub belum tersedia.")}</p>
          <div class="boardviewer-panel-actions" style="margin-top:18px;">
            <button type="button" class="boardviewer-panel-button is-primary" data-action="reload">Coba lagi</button>
            <button type="button" class="boardviewer-panel-button" data-action="back-launcher">Kembali ke launcher</button>
          </div>
        </article>
      </section>
    `;
  }

  function renderPartConnectionsTable(partConnections) {
    if (partConnections.length === 0) {
      return "<p>Daftar pin untuk part ini belum tersedia pada format source sekarang.</p>";
    }

    return `
      <div class="boardviewer-connection-table" role="table" aria-label="Daftar pin part aktif">
        <div class="boardviewer-connection-head is-part" role="row">
          <span>Pin</span>
          <span>Net</span>
          <span>Tujuan</span>
        </div>
        ${partConnections.map((connection) => `
          <button
            type="button"
            class="boardviewer-connection-row is-part${state.selectedConnectionKey === buildConnectionKey(connection) ? " is-active" : ""}"
            role="row"
            data-preview-node="${escapeHtml(connection.partId)}"
            data-net-name="${escapeHtml(connection.netName)}"
            data-connection-key="${escapeHtml(buildConnectionKey(connection))}"
          >
            <span>${escapeHtml(getConnectionPinDisplay(connection))}</span>
            <span>${escapeHtml(connection.netName || "-")}</span>
            <span>${escapeHtml(getConnectionPeerSummary(connection, 3))}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderNetConnectionsTable(netConnections) {
    if (netConnections.length === 0) {
      return "<p>Belum ada daftar member untuk net aktif.</p>";
    }

    return `
      <div class="boardviewer-connection-table" role="table" aria-label="Daftar member net aktif">
        <div class="boardviewer-connection-head is-net" role="row">
          <span>L</span>
          <span>Ref</span>
          <span>Pin</span>
          <span>Info</span>
        </div>
        ${netConnections.map((connection) => `
          <button
            type="button"
            class="boardviewer-connection-row is-net${String(connection.partId || "").toUpperCase() === String(state.selectedPreviewNode || "").toUpperCase() ? " is-active" : ""}"
            role="row"
            data-preview-node="${escapeHtml(connection.partId)}"
            data-net-name="${escapeHtml(connection.netName)}"
            data-connection-key="${escapeHtml(buildConnectionKey(connection))}"
          >
            <span>${escapeHtml(String(connection.layer || "").charAt(0) || "-")}</span>
            <span>${escapeHtml(connection.partId || "-")}</span>
            <span>${escapeHtml(getConnectionPinDisplay(connection))}</span>
            <span>${escapeHtml(connection.info || getConnectionPeerSummary(connection, 2) || "-")}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderInspectorPanel(activeFootprint) {
    const partConnections = getPartConnections(activeFootprint.id);
    const activeNetName = getActiveNetName(activeFootprint);
    const netConnections = getNetConnections(activeNetName);
    return `
      <div class="boardviewer-panel-block">
        <div class="boardviewer-panel-meta">
          <div>
            <span>Komponen</span>
            <strong>${escapeHtml(activeFootprint.id)}</strong>
          </div>
          <div>
            <span>Layer</span>
            <strong>${escapeHtml(activeFootprint.layer || state.viewerLayer)}</strong>
          </div>
          <div>
            <span>Package</span>
            <strong>${escapeHtml(activeFootprint.partName || "-")}</strong>
          </div>
          <div>
            <span>Net</span>
            <strong>${escapeHtml(activeNetName || activeFootprint.net || "-")}</strong>
          </div>
        </div>
      </div>
      <div class="boardviewer-panel-block">
        <p>${escapeHtml(activeFootprint.description || "Komponen aktif diambil dari preview node local service.")}</p>
      </div>
      <div class="boardviewer-panel-block">
        <p class="boardviewer-kicker">Part</p>
        <p><b>${escapeHtml(activeFootprint.id)}</b> | ${partConnections.length} pin/member terdeteksi.</p>
        ${renderPartConnectionsTable(partConnections)}
      </div>
      <div class="boardviewer-panel-block">
        <p class="boardviewer-kicker">Net</p>
        <p><b>${escapeHtml(activeNetName || "-")}</b> | ${netConnections.length} koneksi terdeteksi.</p>
        ${renderNetConnectionsTable(netConnections)}
      </div>
    `;
  }

  function renderSessionPanel() {
    const previewLines = Array.isArray(state.session?.previewLines) ? state.session.previewLines : [];
    const componentCount = Number(state.session?.componentCount || getSessionNodes().length || 0);
    const padCount = Number(state.session?.padCount || 0);
    const netCount = Number(state.session?.netCount || 0);
    const nailCount = Number(state.session?.nailCount || 0);
    const outlineCount = Number(state.session?.outlineSegmentCount || getSessionOutlineSegments().length || 0);
    return `
      <div class="boardviewer-panel-block">
        <div class="boardviewer-panel-meta">
          <div>
            <span>Nama file</span>
            <strong>${escapeHtml(state.session?.fileName || "-")}</strong>
          </div>
          <div>
            <span>Ukuran</span>
            <strong>${escapeHtml(formatBytes(state.session?.fileSize))}</strong>
          </div>
          <div>
            <span>Format</span>
            <strong>${escapeHtml(state.session?.formatHint || "offline")}</strong>
          </div>
          <div>
            <span>Session</span>
            <strong>${escapeHtml(state.session?.sessionId || "-")}</strong>
          </div>
        </div>
      </div>
      <div class="boardviewer-panel-block">
        <div class="boardviewer-panel-meta">
          <div>
            <span>Komponen</span>
            <strong>${escapeHtml(componentCount)}</strong>
          </div>
          <div>
            <span>Pad</span>
            <strong>${escapeHtml(padCount)}</strong>
          </div>
          <div>
            <span>Net</span>
            <strong>${escapeHtml(netCount)}</strong>
          </div>
          <div>
            <span>Nail</span>
            <strong>${escapeHtml(nailCount)}</strong>
          </div>
          <div>
            <span>Outline</span>
            <strong>${escapeHtml(outlineCount)}</strong>
          </div>
        </div>
      </div>
      <div class="boardviewer-panel-block">
        <p>Source file disimpan local service di roaming, dan parser sekarang mulai membaca geometri board nyata untuk bundle <code>.asc</code> serta <code>.cad</code> GenCAD.</p>
      </div>
      <div class="boardviewer-panel-block">
        <p class="boardviewer-kicker">Preview source</p>
        <div class="boardviewer-preview-lines">
          ${previewLines.length > 0
            ? previewLines.slice(0, 12).map((line) => `<p>${escapeHtml(line)}</p>`).join("")
            : "<p>Preview teks belum tersedia untuk source ini.</p>"}
        </div>
      </div>
    `;
  }

  function renderAboutPanel() {
    return `
      <div class="boardviewer-panel-block">
        <ul>
          <li>Drag area kosong board untuk pan.</li>
          <li>Scroll mouse untuk zoom in atau zoom out.</li>
          <li>Klik komponen untuk memindah fokus inspector.</li>
          <li>Tombol <code>Top</code>, <code>Bottom</code>, <code>Both</code> langsung memfilter layer render.</li>
        </ul>
      </div>
      <div class="boardviewer-panel-block">
        <p>HAR yang Anda berikan menunjukkan viewer contoh hanya mengambil satu payload file utama <code>application/octet-stream</code> dari API. Jadi pembeda utamanya memang engine parser + layout workspace, bukan kerumitan network.</p>
      </div>
      <div class="boardviewer-panel-block">
        <p>Saat ini viewer sudah mulai memakai komponen dan outline nyata untuk bundle <code>.asc</code> serta <code>.cad</code>. Langkah berikutnya tinggal memperdalam pad, nail, route, dan hit-test detail dari data board asli.</p>
      </div>
    `;
  }

  function renderRightPanel(activeFootprint) {
    const title = state.activePanel === "session"
      ? "Session Lokal"
      : state.activePanel === "about"
        ? "Tentang Viewer"
        : "Inspector";
    const content = state.activePanel === "session"
      ? renderSessionPanel()
      : state.activePanel === "about"
        ? renderAboutPanel()
        : renderInspectorPanel(activeFootprint);

    return `
      <aside class="boardviewer-side-panel" aria-label="${escapeHtml(title)}">
        <div class="boardviewer-panel-head">
          <div>
            <p class="boardviewer-kicker">${escapeHtml(state.activePanel)}</p>
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(panelDescriptions[state.activePanel] || panelDescriptions.inspector)}</p>
          </div>
        </div>
        ${content}
      </aside>
    `;
  }

  function renderBoardsDrawer() {
    const previewLines = Array.isArray(state.session?.previewLines) ? state.session.previewLines : [];
    const componentCount = Number(state.session?.componentCount || getSessionNodes().length || 0);
    const netCount = Number(state.session?.netCount || 0);
    const nailCount = Number(state.session?.nailCount || 0);
    const outlineCount = Number(state.session?.outlineSegmentCount || getSessionOutlineSegments().length || 0);
    return `
      <aside class="boardviewer-boards-drawer${state.boardsOpen ? " is-open" : ""}">
        <div class="boardviewer-panel-head">
          <div>
            <p class="boardviewer-kicker">Boards</p>
            <h2>${escapeHtml(state.session?.fileName || "Board aktif")}</h2>
            <p>Launcher desktop tetap ada, tetapi tab ini sekarang fokus ke viewer offline native TeknisiHub.</p>
          </div>
        </div>

        <div class="boardviewer-panel-block">
          <div class="boardviewer-panel-meta">
            <div>
              <span>Format</span>
              <strong>${escapeHtml(state.session?.formatHint || "offline")}</strong>
            </div>
            <div>
              <span>Ukuran</span>
              <strong>${escapeHtml(formatBytes(state.session?.fileSize))}</strong>
            </div>
            <div>
              <span>Dibuka</span>
              <strong>${escapeHtml(state.session?.createdAt || "-")}</strong>
            </div>
            <div>
              <span>Layer aktif</span>
              <strong>${escapeHtml(state.viewerLayer)}</strong>
            </div>
            <div>
              <span>Komponen</span>
              <strong>${escapeHtml(componentCount)}</strong>
            </div>
            <div>
              <span>Net</span>
              <strong>${escapeHtml(netCount)}</strong>
            </div>
            <div>
              <span>Nail</span>
              <strong>${escapeHtml(nailCount)}</strong>
            </div>
            <div>
              <span>Outline</span>
              <strong>${escapeHtml(outlineCount)}</strong>
            </div>
          </div>
        </div>

        <div class="boardviewer-panel-block">
          <p class="boardviewer-kicker">Preview source</p>
          <div class="boardviewer-preview-lines">
            ${previewLines.length > 0
              ? previewLines.slice(0, 10).map((line) => `<p>${escapeHtml(line)}</p>`).join("")
              : "<p>Preview source belum tersedia.</p>"}
          </div>
        </div>

        <div class="boardviewer-panel-actions">
          <button type="button" class="boardviewer-panel-button is-primary" data-action="reload">Reload session</button>
          <button type="button" class="boardviewer-panel-button" data-action="back-launcher">Kembali ke launcher</button>
        </div>
      </aside>
    `;
  }

  function renderWorkspace() {
    if (!root || !state.session) {
      return;
    }

    const scene = getScene();
    ensureSelection(scene);
    const activeFootprint = getActiveFootprint(scene);
    const activeNetName = getActiveNetName(activeFootprint);
    const connectedPartIds = getConnectedPartIdsForNet(activeNetName);
    const geometry = scene.geometry;
    const visibleNetPins = buildVisiblePinOverlay(activeFootprint.id, activeNetName, scene.bounds, geometry);
    const toolbarLayers = getToolbarLayers();
    const partOptions = getSelectablePartIds();
    const netOptions = getSelectableNetNames();
    const partConnections = getPartConnections(activeFootprint.id);
    const netConnections = getNetConnections(activeNetName);

    root.innerHTML = `
      <div class="boardviewer-workspace">
        <header class="boardviewer-desktop-toolbar">
          <div class="boardviewer-desktop-tools">
            <button type="button" class="boardviewer-desktop-tool" data-action="rotate-left" title="Putar kiri">L</button>
            <button type="button" class="boardviewer-desktop-tool" data-action="rotate-right" title="Putar kanan">R</button>
            <button type="button" class="boardviewer-desktop-tool" data-action="zoom-out" title="Zoom out">-</button>
            <button type="button" class="boardviewer-desktop-tool" data-action="zoom-in" title="Zoom in">+</button>
            <button type="button" class="boardviewer-desktop-tool is-wide" data-action="fit" title="Zoom to fit">Fit</button>
          </div>
          <div class="boardviewer-desktop-layer-strip" role="tablist" aria-label="Filter layer board">
            ${toolbarLayers.map((layer) => `
              <button
                type="button"
                class="boardviewer-layer-button${state.viewerLayer === layer ? " is-active" : ""}"
                data-boardviewer-layer="${escapeHtml(layer)}"
                aria-pressed="${state.viewerLayer === layer ? "true" : "false"}"
              >${escapeHtml(layer)}</button>
            `).join("")}
          </div>
          <label class="boardviewer-desktop-field">
            <span>Parts:</span>
            <span class="boardviewer-desktop-combobox">
              <input
                type="text"
                list="boardviewerPartOptions"
                value="${escapeHtml(activeFootprint.id || "")}"
                data-part-select
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
              >
              <button type="button" class="boardviewer-desktop-combobox-toggle" data-combobox-toggle="part" aria-label="Buka daftar part"></button>
            </span>
            <datalist id="boardviewerPartOptions">
              ${partOptions.map((partId) => `
                <option value="${escapeHtml(partId)}"></option>
              `).join("")}
            </datalist>
          </label>
          <label class="boardviewer-desktop-field">
            <span>Nets:</span>
            <span class="boardviewer-desktop-combobox">
              <input
                type="text"
                list="boardviewerNetOptions"
                value="${escapeHtml(activeNetName || "")}"
                data-net-select
                placeholder="-"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
              >
              <button type="button" class="boardviewer-desktop-combobox-toggle" data-combobox-toggle="net" aria-label="Buka daftar net"></button>
            </span>
            <datalist id="boardviewerNetOptions">
              <option value="-"></option>
              ${netOptions.map((netName) => `
                <option value="${escapeHtml(netName)}"></option>
              `).join("")}
            </datalist>
          </label>
        </header>

        <div class="boardviewer-desktop-main">
          <section class="boardviewer-desktop-stage-pane">
            <div class="boardviewer-desktop-tabbar">
              <button type="button" class="boardviewer-desktop-filetab is-active">${escapeHtml(state.session.fileName || "Board aktif")}</button>
            </div>
            <div class="boardviewer-stage-shell">
              <div class="boardviewer-stage-viewport">
                <div class="boardviewer-stage-world" role="img" aria-label="Preview boardview TeknisiHub">
                  <canvas class="boardviewer-stage-canvas is-base" data-stage-base aria-hidden="true"></canvas>
                  <canvas class="boardviewer-stage-canvas is-overlay" data-stage-overlay aria-hidden="true"></canvas>
                </div>
                <div class="boardviewer-hover-tooltip" data-hover-tooltip hidden></div>
              </div>
            </div>
          </section>

          <aside class="boardviewer-desktop-inspector">
            <div class="boardviewer-desktop-tabbar is-panel">
              <button type="button" class="boardviewer-desktop-panel-tab${state.activePanel === "part" ? " is-active" : ""}" data-panel="part">Part</button>
              <button type="button" class="boardviewer-desktop-panel-tab${state.activePanel === "net" ? " is-active" : ""}" data-panel="net">Net</button>
            </div>
            <div class="boardviewer-desktop-panel-body">
              <div class="boardviewer-desktop-selection">
                <strong>${escapeHtml(state.activePanel === "net" ? (activeNetName || "-") : activeFootprint.id)}</strong>
                <span>${escapeHtml(state.activePanel === "net" ? `${netConnections.length} koneksi` : (activeFootprint.partName || "-"))}</span>
              </div>
              ${state.activePanel === "net"
                ? renderNetConnectionsTable(netConnections)
                : renderPartConnectionsTable(partConnections)}
            </div>
          </aside>
        </div>
      </div>
    `;

    domRefs.world = root.querySelector(".boardviewer-stage-world");
    domRefs.viewport = root.querySelector(".boardviewer-stage-viewport");
    domRefs.zoomLabel = null;
    domRefs.tooltip = root.querySelector("[data-hover-tooltip]");
    domRefs.baseCanvas = root.querySelector("[data-stage-base]");
    domRefs.overlayCanvas = root.querySelector("[data-stage-overlay]");
    stageRuntime = {
      scene,
      activeFootprint,
      activeNetName,
      connectedPartIds,
      visibleNetPins
    };
    hideHoverTooltip();
    syncViewportTransformNow();
    scheduleStagePaint();
  }

  function render() {
    if (!root) {
      return;
    }

    if (state.loading) {
      renderLoading();
      return;
    }

    if (state.errorMessage || !state.session) {
      renderError();
      return;
    }

    renderWorkspace();
  }

  async function loadSession() {
    state.loading = true;
    state.errorMessage = "";
    render();

    const sessionId = getSessionId();
    if (!sessionId) {
      state.loading = false;
      state.errorMessage = "SessionId Boardview TeknisiHub belum ada. Buka viewer ini dari launcher Boardviewer.";
      render();
      return;
    }

    try {
      const session = await fetchJson(`/tools/boardviewer/native-session/${encodeURIComponent(sessionId)}`);
      state.session = session;
      clearSceneCache();
      requestedInitialViewApplied = false;
      const requestedLayer = getRequestedLayer();
      const requestedPartId = getRequestedPartId();
      const availableSides = Array.isArray(session.availableSides) ? session.availableSides.filter(Boolean) : [];
      state.viewerLayer = requestedLayer
        || (availableSides.includes("Top")
          ? "Top"
          : (availableSides.includes("Both") ? "Both" : (availableSides[0] || "Both")));
      state.selectedPreviewNode = requestedPartId
        || (Array.isArray(session.previewNodes) && session.previewNodes.length > 0
          ? session.previewNodes[0].id
          : defaultNodes[0].id);
      state.selectedNetName = "";
      state.selectedConnectionKey = "";
      state.activePanel = "part";
      state.zoom = 1;
      state.panX = 0;
      state.panY = 0;
      state.rotation = 0;
      state.mirrored = false;
      state.interacting = false;
      state.idleSharp = true;
    } catch (error) {
      state.errorMessage = error?.message || "Session Boardview TeknisiHub gagal dimuat dari local service.";
    } finally {
      state.loading = false;
      render();
      globalScope.requestAnimationFrame(() => {
        applyRequestedInitialView();
      });
    }
  }

  function handleAction(action) {
    switch (action) {
      case "toggle-boards":
        state.boardsOpen = !state.boardsOpen;
        render();
        break;
      case "reload":
        loadSession();
        break;
      case "back-launcher":
        globalScope.location.href = buildLauncherUrl();
        break;
      case "close-tab":
        globalScope.close();
        break;
      case "fit":
        fitView();
        break;
      case "zoom-out": {
        const viewportCenter = getViewportCenterPoint();
        if (viewportCenter) {
          zoomAtViewportPoint(getStepZoomTarget(-1), viewportCenter.clientX, viewportCenter.clientY);
        } else {
          state.zoom = clamp(getStepZoomTarget(-1), zoomLimits.min, zoomLimits.max);
          syncViewportTransform();
        }
        break;
      }
      case "zoom-in": {
        const viewportCenter = getViewportCenterPoint();
        if (viewportCenter) {
          zoomAtViewportPoint(getStepZoomTarget(1), viewportCenter.clientX, viewportCenter.clientY);
        } else {
          state.zoom = clamp(getStepZoomTarget(1), zoomLimits.min, zoomLimits.max);
          syncViewportTransform();
        }
        break;
      }
      case "rotate-left":
        state.rotation -= 90;
        pulseInteractionState();
        syncViewportTransform();
        break;
      case "rotate-right":
        state.rotation += 90;
        pulseInteractionState();
        syncViewportTransform();
        break;
      case "mirror":
        state.mirrored = !state.mirrored;
        syncViewportTransform();
        render();
        break;
      default:
        break;
    }
  }

  root?.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget) {
      handleAction(actionTarget.getAttribute("data-action") || "");
      return;
    }

    const panelTarget = event.target.closest("[data-panel]");
    if (panelTarget) {
      state.activePanel = panelTarget.getAttribute("data-panel") || "part";
      render();
      return;
    }

    const layerTarget = event.target.closest("[data-boardviewer-layer]");
    if (layerTarget) {
      state.viewerLayer = layerTarget.getAttribute("data-boardviewer-layer") || "Both";
      clearSceneCache();
      render();
      return;
    }

    const nodeTarget = event.target.closest("[data-preview-node]");
    if (nodeTarget) {
      const isNetTarget = nodeTarget.matches(".boardviewer-svg-net-pin") || Boolean(nodeTarget.closest(".boardviewer-connection-row.is-net"));
      state.selectedPreviewNode = nodeTarget.getAttribute("data-preview-node") || state.selectedPreviewNode;
      state.selectedNetName = isNetTarget
        ? (nodeTarget.getAttribute("data-net-name") || state.selectedNetName)
        : state.selectedNetName;
      state.selectedConnectionKey = isNetTarget
        ? (nodeTarget.getAttribute("data-connection-key") || "")
        : "";
      state.activePanel = isNetTarget ? "net" : "part";
      render();
      return;
    }

    const netTarget = event.target.closest("[data-net-name]");
    if (netTarget) {
      state.selectedNetName = netTarget.getAttribute("data-net-name") || state.selectedNetName;
      state.selectedConnectionKey = netTarget.getAttribute("data-connection-key") || "";
      state.activePanel = "net";
      render();
    }
  });

  root?.addEventListener("change", (event) => {
    const partSelect = event.target.closest("[data-part-select]");
    if (partSelect) {
      applyPartPickerValue(partSelect.value || "");
      return;
    }

    const netSelect = event.target.closest("[data-net-select]");
    if (netSelect) {
      applyNetPickerValue(netSelect.value || "");
    }
  });

  root?.addEventListener("input", (event) => {
    const partSelect = event.target.closest("[data-part-select]");
    if (partSelect) {
      const nextPartId = findToolbarOptionMatch(partSelect.value || "", getSelectablePartIds());
      if (nextPartId) {
        applyPartPickerValue(nextPartId);
      }
      return;
    }

    const netSelect = event.target.closest("[data-net-select]");
    if (netSelect) {
      const nextNetName = findToolbarOptionMatch(netSelect.value || "", getSelectableNetNames(), { allowEmpty: true });
      if (nextNetName !== null) {
        applyNetPickerValue(nextNetName);
      }
    }
  });

  root?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const partSelect = event.target.closest("[data-part-select]");
    if (partSelect) {
      const nextPartId = findToolbarSearchMatch(partSelect.value || "", getSelectablePartIds());
      if (nextPartId) {
        event.preventDefault();
        applyPartPickerValue(nextPartId);
      }
      return;
    }

    const netSelect = event.target.closest("[data-net-select]");
    if (netSelect) {
      const nextNetName = findToolbarSearchMatch(netSelect.value || "", getSelectableNetNames(), { allowEmpty: true });
      if (nextNetName !== null) {
        event.preventDefault();
        applyNetPickerValue(nextNetName);
      }
    }
  });

  root?.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-combobox-toggle]");
    if (!toggle) {
      return;
    }

    const combobox = toggle.closest(".boardviewer-desktop-combobox");
    const input = combobox?.querySelector("input[list]");
    if (!input) {
      return;
    }

    input.focus({ preventScroll: true });
    if (typeof input.select === "function") {
      input.select();
    }

    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        // Chromium may block picker in some contexts; keeping focus is enough fallback.
      }
    }
  });

  root?.addEventListener("pointermove", (event) => {
    if (state.dragging) {
      hideHoverTooltip();
      return;
    }

    const viewport = event.target.closest(".boardviewer-stage-viewport");
    if (!viewport) {
      hideHoverTooltip();
      return;
    }

    scheduleStageHover(event.clientX, event.clientY);
  });

  root?.addEventListener("pointerout", (event) => {
    if (event.target.closest?.(".boardviewer-stage-viewport") && !event.relatedTarget?.closest?.(".boardviewer-stage-viewport")) {
      pendingHoverPoint = null;
      hideHoverTooltip();
    }
  });

  root?.addEventListener("wheel", (event) => {
    const viewport = event.target.closest(".boardviewer-stage-viewport");
    if (!viewport) {
      return;
    }

    event.preventDefault();
    zoomAtViewportPoint(
      getWheelZoomTarget(event.deltaY, event.deltaMode),
      event.clientX,
      event.clientY
    );
  }, { passive: false });

  root?.addEventListener("pointerdown", (event) => {
    const viewport = event.target.closest(".boardviewer-stage-viewport");
    if (!viewport || event.button !== 0) {
      return;
    }

    state.dragging = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: state.panX,
      panY: state.panY,
      moved: false
    };
    hideHoverTooltip();
    viewport.setPointerCapture?.(event.pointerId);
    syncViewportTransform();
  });

  globalScope.addEventListener("pointermove", (event) => {
    if (!state.dragging || state.dragging.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - state.dragging.startX;
    const deltaY = event.clientY - state.dragging.startY;
    if (!state.dragging.moved && Math.hypot(deltaX, deltaY) < 4) {
      return;
    }

    state.dragging.moved = true;
    state.panX = state.dragging.panX + (event.clientX - state.dragging.startX);
    state.panY = state.dragging.panY + (event.clientY - state.dragging.startY);
    pulseInteractionState();
    syncViewportTransform();
  });

  globalScope.addEventListener("pointerup", (event) => {
    if (!state.dragging || state.dragging.pointerId !== event.pointerId) {
      return;
    }

    const wasMoved = Boolean(state.dragging.moved);
    state.dragging = null;
    syncViewportTransform();
    if (!wasMoved) {
      applyStageHitTarget(resolveStageHitTarget(event.clientX, event.clientY));
    }
  });

  globalScope.addEventListener("keydown", (event) => {
    if (event.key === "+" || event.key === "=") {
      const viewportCenter = getViewportCenterPoint();
      if (viewportCenter) {
        zoomAtViewportPoint(getStepZoomTarget(1), viewportCenter.clientX, viewportCenter.clientY);
      } else {
        state.zoom = clamp(getStepZoomTarget(1), zoomLimits.min, zoomLimits.max);
        syncViewportTransform();
      }
    } else if (event.key === "-") {
      const viewportCenter = getViewportCenterPoint();
      if (viewportCenter) {
        zoomAtViewportPoint(getStepZoomTarget(-1), viewportCenter.clientX, viewportCenter.clientY);
      } else {
        state.zoom = clamp(getStepZoomTarget(-1), zoomLimits.min, zoomLimits.max);
        syncViewportTransform();
      }
    } else if (event.key === "0") {
      fitView();
    } else if (event.key.toLowerCase() === "b") {
      state.boardsOpen = !state.boardsOpen;
      render();
    } else if (event.key === "Escape" && state.boardsOpen) {
      state.boardsOpen = false;
      render();
    }
  });

  globalScope.addEventListener("resize", () => {
    stageRenderSnapshot = null;
    stageBaseCacheSignature = "";
    stageBaseCacheCanvas = null;
    scheduleStagePaint();
  });

  loadSession();
})(window);
