(function initializeBoardviewTeknisiHubPage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const root = globalScope.document.getElementById("boardviewerNativeRoot");
  const boardGeometry = {
    width: 1600,
    height: 940,
    paddingX: 140,
    paddingY: 96
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
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    mirrored: false,
    boardsOpen: false,
    activePanel: "inspector",
    dragging: null
  };

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

  function hashString(value) {
    let hash = 0;
    const text = String(value ?? "");
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
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

  function getSessionNodes() {
    const nodes = Array.isArray(state.session?.previewNodes) ? state.session.previewNodes.filter(Boolean) : [];
    return nodes.length > 0 ? nodes : defaultNodes;
  }

  function getAvailableSides() {
    const sides = Array.isArray(state.session?.availableSides) ? state.session.availableSides.filter(Boolean) : [];
    return sides.length > 0 ? sides : ["Top", "Bottom", "Both"];
  }

  function normalizeNodes(nodes) {
    if (nodes.length === 0) {
      return defaultNodes.map((node) => ({
        ...node,
        boardX: boardGeometry.width / 2,
        boardY: boardGeometry.height / 2
      }));
    }

    const xValues = nodes.map((node) => Number(node.x ?? 50)).filter(Number.isFinite);
    const yValues = nodes.map((node) => Number(node.y ?? 50)).filter(Number.isFinite);
    const minX = xValues.length > 0 ? Math.min(...xValues) : 0;
    const maxX = xValues.length > 0 ? Math.max(...xValues) : 100;
    const minY = yValues.length > 0 ? Math.min(...yValues) : 0;
    const maxY = yValues.length > 0 ? Math.max(...yValues) : 100;
    const spanX = Math.max(1, maxX - minX);
    const spanY = Math.max(1, maxY - minY);
    const innerWidth = boardGeometry.width - (boardGeometry.paddingX * 2);
    const innerHeight = boardGeometry.height - (boardGeometry.paddingY * 2);

    return nodes.map((node, index) => {
      const sourceX = Number(node.x ?? 50);
      const sourceY = Number(node.y ?? 50);
      const xRatio = Number.isFinite(sourceX) ? (sourceX - minX) / spanX : 0.5;
      const yRatio = Number.isFinite(sourceY) ? (sourceY - minY) / spanY : 0.5;
      return {
        ...node,
        sourceIndex: index,
        boardX: boardGeometry.paddingX + (xRatio * innerWidth),
        boardY: boardGeometry.paddingY + (yRatio * innerHeight)
      };
    });
  }

  function inferFootprint(node) {
    const signature = `${node.id || ""} ${node.partName || ""} ${node.label || ""}`.toUpperCase();
    const hash = hashString(signature);
    let kind = "chip";
    let width = 90;
    let height = 54;
    let rotation = 0;
    let padCount = 8;

    if (/STAND-OFF|MOUNT|HOLE|H\d/.test(signature)) {
      kind = "hole";
      width = 34;
      height = 34;
      padCount = 0;
    } else if (/MICROSD|SOCKET|SLOT/.test(signature)) {
      kind = "socket";
      width = 182;
      height = 82;
      padCount = 10;
    } else if (/SMARTMATRIX|ESP32|HEADER|J\d|CN\d|CONN|1X\d|PORT/.test(signature)) {
      kind = "connector";
      width = /ESP32|SMARTMATRIX/.test(signature) ? 220 : 146;
      height = /ESP32|SMARTMATRIX/.test(signature) ? 34 : 30;
      padCount = /ESP32|SMARTMATRIX/.test(signature) ? 20 : 8;
      rotation = hash % 2 === 0 ? 90 : 0;
    } else if (/0603|0402|0805|R\d|C\d|L\d|D\d|LED/.test(signature)) {
      kind = "passive";
      width = /0805|SOD/.test(signature) ? 44 : 32;
      height = /0805|SOD/.test(signature) ? 22 : 16;
      padCount = 2;
      rotation = hash % 2 === 0 ? 90 : 0;
    } else if (/JUMPER|JP\d/.test(signature)) {
      kind = "jumper";
      width = 54;
      height = 18;
      padCount = 2;
      rotation = hash % 2 === 0 ? 90 : 0;
    } else if (/SO16|TSSOP|QFN|QFP|SOT23|IC|UC|U\d/.test(signature)) {
      kind = "chip";
      width = /TSSOP|SO16/.test(signature) ? 112 : 96;
      height = /TSSOP|SO16/.test(signature) ? 68 : 58;
      padCount = /SO16|TSSOP/.test(signature) ? 16 : 8;
      rotation = hash % 2 === 0 ? 90 : 0;
    }

    const textSize = clamp(Math.round(Math.min(width, height) * (kind === "passive" ? 0.42 : 0.34)), 10, kind === "chip" ? 32 : 18);

    return {
      ...node,
      kind,
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

  function buildScene() {
    const footprints = normalizeNodes(getSessionNodes()).map(inferFootprint);
    const visibleFootprints = footprints.filter((node) => isVisibleForLayer(node, state.viewerLayer));
    return {
      footprints,
      visibleFootprints,
      traces: buildTraceSegments(visibleFootprints)
    };
  }

  function buildTraceSegments(footprints) {
    const pairKeys = new Set();
    const segments = [];

    footprints.forEach((current) => {
      const neighbors = footprints
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
          points: [
            `${current.boardX.toFixed(1)},${current.boardY.toFixed(1)}`,
            `${midX.toFixed(1)},${current.boardY.toFixed(1)}`,
            `${midX.toFixed(1)},${candidate.boardY.toFixed(1)}`,
            `${candidate.boardX.toFixed(1)},${candidate.boardY.toFixed(1)}`
          ].join(" ")
        });
      });
    });

    return segments;
  }

  function buildPadMarkup(footprint) {
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

  function renderFootprintSvg(footprint, activeId) {
    const isActive = footprint.id === activeId;
    const isMuted = !isVisibleForLayer(footprint, state.viewerLayer);
    const groupClassName = [
      "boardviewer-svg-footprint",
      isActive ? "is-active" : "",
      isMuted ? "is-muted" : ""
    ].filter(Boolean).join(" ");

    if (footprint.kind === "hole") {
      return `
        <g
          class="${groupClassName}"
          data-preview-node="${escapeHtml(footprint.id)}"
          transform="translate(${footprint.boardX.toFixed(1)} ${footprint.boardY.toFixed(1)})"
        >
          <circle class="boardviewer-svg-body is-hole" r="${(footprint.width / 2).toFixed(1)}"></circle>
          <circle fill="rgba(12, 18, 32, 0.88)" stroke="rgba(223, 233, 255, 0.46)" stroke-width="1.1" r="${(footprint.width / 4).toFixed(1)}"></circle>
          <text class="boardviewer-svg-text" y="${(footprint.width / 2) + 16}" font-size="12">${escapeHtml(footprint.id)}</text>
        </g>
      `;
    }

    return `
      <g
        class="${groupClassName}"
        data-preview-node="${escapeHtml(footprint.id)}"
        transform="translate(${footprint.boardX.toFixed(1)} ${footprint.boardY.toFixed(1)}) rotate(${footprint.rotation})"
      >
        ${buildPadMarkup(footprint)}
        <rect
          class="boardviewer-svg-body"
          x="${(-footprint.width / 2).toFixed(1)}"
          y="${(-footprint.height / 2).toFixed(1)}"
          width="${footprint.width.toFixed(1)}"
          height="${footprint.height.toFixed(1)}"
          rx="${Math.max(3, Math.min(footprint.height, footprint.width) * 0.08).toFixed(1)}"
        ></rect>
        <text class="boardviewer-svg-text" font-size="${footprint.textSize}" y="2">${escapeHtml(footprint.id)}</text>
      </g>
    `;
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
    const translation = `translate(calc(-50% + ${state.panX}px), calc(-50% + ${state.panY}px))`;
    const scale = `scale(${state.zoom})`;
    const rotation = `rotate(${state.rotation}deg)`;
    const mirror = state.mirrored ? "scaleX(-1)" : "";
    return [translation, scale, rotation, mirror].filter(Boolean).join(" ");
  }

  function syncViewportTransform() {
    const world = root?.querySelector(".boardviewer-stage-world");
    const viewport = root?.querySelector(".boardviewer-stage-viewport");
    const zoomLabel = root?.querySelector("[data-zoom-readout]");

    if (world) {
      world.style.transform = buildWorldTransform();
    }

    if (viewport) {
      viewport.classList.toggle("is-dragging", Boolean(state.dragging));
    }

    if (zoomLabel) {
      zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
    }
  }

  function fitView() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    syncViewportTransform();
  }

  function renderLoading() {
    if (!root) {
      return;
    }

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

  function renderInspectorPanel(activeFootprint) {
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
            <strong>${escapeHtml(activeFootprint.net || "-")}</strong>
          </div>
        </div>
      </div>
      <div class="boardviewer-panel-block">
        <p>${escapeHtml(activeFootprint.description || "Komponen aktif diambil dari preview node local service. Panel ini siap dipakai nanti saat parser pad, net, dan pin sudah lebih detail.")}</p>
      </div>
      <div class="boardviewer-panel-block">
        <p>Tipe footprint terdeteksi: <b>${escapeHtml(activeFootprint.kind)}</b>.</p>
        <p>Ukuran render: <b>${Math.round(activeFootprint.width)} x ${Math.round(activeFootprint.height)}</b>.</p>
      </div>
    `;
  }

  function renderSessionPanel() {
    const previewLines = Array.isArray(state.session?.previewLines) ? state.session.previewLines : [];
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
        <p>Source file disimpan local service di roaming, jadi viewer tidak lagi bergantung pada <code>localStorage</code> browser untuk membawa file antar tab.</p>
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
        <p>Arah berikutnya yang paling penting adalah menaikkan parser board lokal supaya viewer tidak hanya punya preview node, tetapi juga outline, pad, nail, dan routing detail dari file board asli.</p>
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

    const scene = buildScene();
    ensureSelection(scene);
    const activeFootprint = getActiveFootprint(scene);
    const viewerLetter = String(state.session.fileName || activeFootprint.id || "B").trim().charAt(0).toUpperCase() || "B";
    const availableSides = getAvailableSides();

    root.innerHTML = `
      <div class="boardviewer-workspace">
        <header class="boardviewer-shell-top">
          <button type="button" class="boardviewer-boards-trigger" data-action="toggle-boards">Boards</button>
          <div class="boardviewer-top-chips">
            <span class="boardviewer-top-chip"><strong>${escapeHtml(state.session.fileName || "-")}</strong></span>
            <span class="boardviewer-top-chip">Format <strong>${escapeHtml(state.session.formatHint || "offline")}</strong></span>
            <span class="boardviewer-top-chip">Session <strong>${escapeHtml(state.session.sessionId || "-")}</strong></span>
          </div>
        </header>

        ${renderBoardsDrawer()}

        <div class="boardviewer-stage-shell">
          <div class="boardviewer-stage-viewport">
            <div class="boardviewer-stage-overlay">
              <div>
                <p class="boardviewer-kicker">Active component</p>
                <strong>${escapeHtml(activeFootprint.id)}</strong>
                <span>${escapeHtml(activeFootprint.partName || "-")} | ${escapeHtml(activeFootprint.net || "-")}</span>
              </div>
            </div>

            <div class="boardviewer-stage-world">
              <svg viewBox="0 0 ${boardGeometry.width} ${boardGeometry.height}" role="img" aria-label="Preview boardview TeknisiHub">
                <rect class="boardviewer-svg-board-shadow" x="108" y="112" width="1386" height="730" rx="12"></rect>
                <rect class="boardviewer-svg-board-main" x="92" y="96" width="1386" height="730" rx="8"></rect>
                <rect class="boardviewer-svg-board-inner" x="118" y="122" width="1334" height="678" rx="4"></rect>
                <g aria-hidden="true">
                  ${scene.traces.map((trace) => `
                    <polyline
                      class="boardviewer-svg-trace${trace.strong ? " is-strong" : ""}"
                      points="${trace.points}"
                    ></polyline>
                  `).join("")}
                </g>
                <g>
                  ${scene.footprints.map((footprint) => renderFootprintSvg(footprint, activeFootprint.id)).join("")}
                </g>
              </svg>
            </div>
          </div>
        </div>

        <aside class="boardviewer-shell-right-rail">
          <div class="boardviewer-rail-avatar">${escapeHtml(viewerLetter)}</div>
          <button type="button" class="boardviewer-rail-button${state.activePanel === "about" ? " is-active" : ""}" data-panel="about" aria-label="Tentang viewer"><span>i</span></button>
          <button type="button" class="boardviewer-rail-button${state.activePanel === "inspector" ? " is-active" : ""}" data-panel="inspector" aria-label="Inspector komponen"><span>o</span></button>
          <button type="button" class="boardviewer-rail-button${state.activePanel === "session" ? " is-active" : ""}" data-panel="session" aria-label="Session lokal"><span>s</span></button>
          <button type="button" class="boardviewer-rail-button" data-action="close-tab" aria-label="Tutup tab"><span>x</span></button>
        </aside>

        ${renderRightPanel(activeFootprint)}

        <footer class="boardviewer-bottombar">
          <div class="boardviewer-toolbar-cluster">
            <button type="button" class="boardviewer-toolbar-button" data-action="fit" title="Reset view">[]</button>
            <button type="button" class="boardviewer-toolbar-button" data-action="zoom-out" title="Zoom out">-</button>
            <button type="button" class="boardviewer-toolbar-button" data-action="zoom-in" title="Zoom in">+</button>
            <span class="boardviewer-zoom-readout" data-zoom-readout>${Math.round(state.zoom * 100)}%</span>
            <span class="boardviewer-toolbar-divider" aria-hidden="true"></span>
            <button type="button" class="boardviewer-toolbar-button" data-action="rotate-left" title="Putar kiri">L</button>
            <button type="button" class="boardviewer-toolbar-button" data-action="rotate-right" title="Putar kanan">R</button>
            <button type="button" class="boardviewer-toolbar-button${state.mirrored ? " is-active" : ""}" data-action="mirror" title="Mirror">M</button>
          </div>
          <div class="boardviewer-layer-switch" role="tablist" aria-label="Filter layer board">
            ${availableSides.map((layer) => `
              <button
                type="button"
                class="boardviewer-layer-button${state.viewerLayer === layer ? " is-active" : ""}"
                data-boardviewer-layer="${escapeHtml(layer)}"
                aria-pressed="${state.viewerLayer === layer ? "true" : "false"}"
              >${escapeHtml(layer)}</button>
            `).join("")}
          </div>
          <div class="boardviewer-toolbar-note">${escapeHtml(scene.visibleFootprints.length)} komponen terlihat | drag untuk pan | scroll untuk zoom</div>
        </footer>
      </div>
    `;

    syncViewportTransform();
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
      const availableSides = Array.isArray(session.availableSides) ? session.availableSides.filter(Boolean) : [];
      state.viewerLayer = availableSides.includes("Top")
        ? "Top"
        : (availableSides.includes("Both") ? "Both" : (availableSides[0] || "Both"));
      state.selectedPreviewNode = Array.isArray(session.previewNodes) && session.previewNodes.length > 0
        ? session.previewNodes[0].id
        : defaultNodes[0].id;
      state.zoom = 1;
      state.panX = 0;
      state.panY = 0;
      state.rotation = 0;
      state.mirrored = false;
    } catch (error) {
      state.errorMessage = error?.message || "Session Boardview TeknisiHub gagal dimuat dari local service.";
    } finally {
      state.loading = false;
      render();
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
      case "zoom-out":
        state.zoom = clamp(state.zoom - 0.1, 0.45, 2.8);
        syncViewportTransform();
        break;
      case "zoom-in":
        state.zoom = clamp(state.zoom + 0.1, 0.45, 2.8);
        syncViewportTransform();
        break;
      case "rotate-left":
        state.rotation -= 90;
        syncViewportTransform();
        break;
      case "rotate-right":
        state.rotation += 90;
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
      state.activePanel = panelTarget.getAttribute("data-panel") || "inspector";
      render();
      return;
    }

    const layerTarget = event.target.closest("[data-boardviewer-layer]");
    if (layerTarget) {
      state.viewerLayer = layerTarget.getAttribute("data-boardviewer-layer") || "Both";
      render();
      return;
    }

    const nodeTarget = event.target.closest("[data-preview-node]");
    if (nodeTarget) {
      state.selectedPreviewNode = nodeTarget.getAttribute("data-preview-node") || state.selectedPreviewNode;
      state.activePanel = "inspector";
      render();
    }
  });

  root?.addEventListener("wheel", (event) => {
    const viewport = event.target.closest(".boardviewer-stage-viewport");
    if (!viewport) {
      return;
    }

    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.08 : -0.08;
    state.zoom = clamp(state.zoom + delta, 0.45, 2.8);
    syncViewportTransform();
  }, { passive: false });

  root?.addEventListener("pointerdown", (event) => {
    const viewport = event.target.closest(".boardviewer-stage-viewport");
    if (!viewport || event.button !== 0 || event.target.closest("[data-preview-node]")) {
      return;
    }

    state.dragging = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: state.panX,
      panY: state.panY
    };
    viewport.setPointerCapture?.(event.pointerId);
    syncViewportTransform();
  });

  globalScope.addEventListener("pointermove", (event) => {
    if (!state.dragging || state.dragging.pointerId !== event.pointerId) {
      return;
    }

    state.panX = state.dragging.panX + (event.clientX - state.dragging.startX);
    state.panY = state.dragging.panY + (event.clientY - state.dragging.startY);
    syncViewportTransform();
  });

  globalScope.addEventListener("pointerup", (event) => {
    if (!state.dragging || state.dragging.pointerId !== event.pointerId) {
      return;
    }

    state.dragging = null;
    syncViewportTransform();
  });

  globalScope.addEventListener("keydown", (event) => {
    if (event.key === "+" || event.key === "=") {
      state.zoom = clamp(state.zoom + 0.1, 0.45, 2.8);
      syncViewportTransform();
    } else if (event.key === "-") {
      state.zoom = clamp(state.zoom - 0.1, 0.45, 2.8);
      syncViewportTransform();
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

  loadSession();
})(window);
