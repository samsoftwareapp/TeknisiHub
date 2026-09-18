(function registerBbsTelegramPage(globalScope) {
  "use strict";

  const viewKey = "bbs_telegram";
  const sourceOptions = [
    { kind: "bios", label: "BIOS ARCHIVE", handle: "@biosarchive", icon: "memory" },
    { kind: "schematic", label: "BOARDVIEW ARCHIVE", handle: "@schematicslaptop", icon: "developer_board" }
  ];

  const state = {
    container: null,
    notify: () => {},
    openUploadForm: null,
    initialized: false,
    visible: false,
    searching: false,
    searchQuery: "",
    groups: [],
    preparedFiles: new Map(),
    nextPreparedId: 1
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getServiceUrl(path) {
    const baseUrl = typeof globalScope.resolveTeknisiHubServiceBaseUrl === "function"
      ? globalScope.resolveTeknisiHubServiceBaseUrl()
      : "";
    return String(baseUrl).replace(/\/+$/, "") + path;
  }

  function formatBytes(value) {
    const bytes = Number(value || 0);
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return "-";
    }

    const units = ["B", "KB", "MB", "GB"];
    let unitIndex = 0;
    let size = bytes;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }

    return (size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)) + " " + units[unitIndex];
  }

  function formatDate(value) {
    const parsed = new Date(value || "");
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(parsed);
  }

  function getMessage(payload, fallback) {
    const message = typeof payload?.message === "string" ? payload.message.trim() : "";
    return message || fallback;
  }

  async function readJsonResponse(response, fallback) {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      throw new Error(getMessage(payload, fallback || "Permintaan BBS Telegram belum berhasil."));
    }

    return payload || {};
  }

  function selectedSourceKinds() {
    return sourceOptions.map((source) => source.kind);
  }

  function markBoardviewItemHasLocalCache(selection) {
    const sourceKind = String(selection?.sourceKind || "").trim();
    const messageId = Number(selection?.messageId || 0);
    if (!sourceKind || !Number.isInteger(messageId) || messageId <= 0) {
      return false;
    }

    let updated = false;
    state.groups.forEach((group) => {
      if (String(group?.sourceKind || "").trim() !== sourceKind || !Array.isArray(group?.results)) {
        return;
      }

      group.results.forEach((item) => {
        if (Number(item?.messageId) !== messageId || item.hasLocalCache) {
          return;
        }

        item.hasLocalCache = true;
        updated = true;
      });
    });
    return updated;
  }

  function setStatus(message, tone) {
    const status = state.container?.querySelector("[data-bbs-status]");
    if (!status) {
      return;
    }

    status.textContent = message || "";
    status.className = "bbs-telegram-status" + (tone ? " is-" + tone : "");
  }

  function setSearchBusy(active) {
    state.searching = Boolean(active);
    const button = state.container?.querySelector("[data-bbs-search]");
    const input = state.container?.querySelector("[data-bbs-query]");
    if (button) {
      button.disabled = state.searching;
      button.innerHTML = state.searching
        ? '<span class="material-symbols-outlined is-spinning">progress_activity</span><span>Mencari...</span>'
        : '<span class="material-symbols-outlined">search</span><span>Cari Arsip</span>';
    }
    if (input) {
      input.disabled = state.searching;
    }
  }

  function setResultBusy(resultKey, active, label) {
    state.container?.querySelectorAll("[data-bbs-result-key]").forEach((button) => {
      if (button.getAttribute("data-bbs-result-key") !== resultKey) {
        return;
      }

      button.disabled = Boolean(active);
      if (active) {
        button.innerHTML = '<span class="material-symbols-outlined is-spinning">progress_activity</span><span>' +
          escapeHtml(label || "Memproses...") + "</span>";
      } else {
        const action = button.getAttribute("data-bbs-action");
        const actionMarkup = {
          download: '<span class="material-symbols-outlined">download</span><span>Download</span>',
          prepare: '<span class="material-symbols-outlined">upload_file</span><span>Upload</span>',
          "flash-bios": '<span class="material-symbols-outlined">memory</span><span>Flash Chip</span>',
          "open-boardview": '<span class="material-symbols-outlined">open_in_new</span><span>Buka</span>',
          "open-boardview-location": '<span class="material-symbols-outlined">folder_open</span><span>Lokasi File</span>'
        };
        button.innerHTML = actionMarkup[action] || "";
        if (action === "open-boardview") {
          syncBoardviewOpenButton(
            button.closest(".bbs-telegram-actions")?.querySelector("[data-bbs-boardview-viewer]")
          );
        } else if (action === "flash-bios") {
          syncBbsBiosFlashButton(
            button.closest(".bbs-telegram-actions")?.querySelector("[data-bbs-bios-device]")
          );
        }
      }
    });

    state.container?.querySelectorAll("[data-bbs-bios-device]").forEach((select) => {
      const actionButton = select.closest(".bbs-telegram-actions")?.querySelector("[data-bbs-result-key]");
      if (actionButton?.getAttribute("data-bbs-result-key") === resultKey) {
        select.disabled = Boolean(active);
      }
    });
  }

  function normalizeBoardviewViewerType(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return normalized === "desktop" || normalized === "teknisihub" ? normalized : "";
  }

  function syncBoardviewOpenButton(viewerSelect) {
    const actions = viewerSelect?.closest(".bbs-telegram-actions");
    const openButton = actions?.querySelector('[data-bbs-action="open-boardview"]');
    if (!openButton) {
      return;
    }

    const hasViewer = Boolean(normalizeBoardviewViewerType(viewerSelect?.value));
    openButton.disabled = !hasViewer;
    openButton.setAttribute("aria-disabled", hasViewer ? "false" : "true");
  }

  function isBoardviewFlow(source, item) {
    return source?.kind === "schematic" &&
      Boolean(item?.canPrepareForUpload) &&
      String(item?.uploadTargetCategory || "").toLowerCase() === "boardview";
  }

  const supportedBbsBiosDevices = new Set([
    "TEKNISIHUB_DEVICE_USB",
    "TEKNISIHUB_DEVICE_WIFI"
  ]);

  function normalizeBbsBiosDevice(value) {
    const normalized = String(value || "").trim().toUpperCase();
    return supportedBbsBiosDevices.has(normalized) ? normalized : "";
  }

  function getBbsBiosDeviceWrapper(target) {
    return target?.closest?.(".bbs-telegram-bios-device") || null;
  }

  function getBbsBiosFlashButton(target) {
    return getBbsBiosDeviceWrapper(target)
      ?.closest(".bbs-telegram-actions")
      ?.querySelector('[data-bbs-action="flash-bios"]') || null;
  }

  function getBbsBiosDeviceStatusTitle(status, message) {
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

  function setBbsBiosDeviceConnectionState(target, status, message) {
    const wrapper = getBbsBiosDeviceWrapper(target);
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
    wrapper.title = getBbsBiosDeviceStatusTitle(status, message);
  }

  function syncBbsBiosFlashButton(deviceSelect) {
    const button = getBbsBiosFlashButton(deviceSelect);
    if (!button) {
      return;
    }

    const hasSelectedDevice = Boolean(normalizeBbsBiosDevice(deviceSelect?.value));
    button.disabled = !hasSelectedDevice;
    button.setAttribute("aria-disabled", hasSelectedDevice ? "false" : "true");
    button.title = hasSelectedDevice
      ? "Siapkan BIOS di BIOS/EC Programmer."
      : "Pilih device programmer dulu";
  }

  function buildBbsBiosConnectPayload(session) {
    const source = session || {};
    return {
      chipVendor: source.chipVendor || "",
      chipModel: source.chipModel || "",
      chipCapacity: source.chipCapacity || "",
      autoProcess: source.autoProcess !== false,
      pageSize: Number(source.pageSize || 256),
      speedHz: Number(source.speedHz || 0),
      startAddress: source.startAddress || "",
      length: source.length || ""
    };
  }

  async function tryConnectBbsBiosDevice(deviceSelect) {
    const selectedDevice = normalizeBbsBiosDevice(deviceSelect?.value);
    const wrapper = getBbsBiosDeviceWrapper(deviceSelect);
    const connectionAttempt = Date.now() + "-" + Math.random().toString(16).slice(2);
    if (wrapper) {
      wrapper.dataset.connectionAttempt = connectionAttempt;
    }

    syncBbsBiosFlashButton(deviceSelect);
    if (!selectedDevice) {
      setBbsBiosDeviceConnectionState(deviceSelect, "idle");
      return;
    }

    setBbsBiosDeviceConnectionState(deviceSelect, "checking", "Mencoba konek " + selectedDevice + "...");
    try {
      const selectedResponse = await globalScope.fetch(getServiceUrl("/spi-flash/device"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceType: selectedDevice })
      });
      const selectedSession = await readJsonResponse(selectedResponse, "Device programmer belum dapat dipilih.");
      if (wrapper?.dataset.connectionAttempt !== connectionAttempt ||
          normalizeBbsBiosDevice(deviceSelect?.value) !== selectedDevice) {
        return;
      }

      const connectedResponse = await globalScope.fetch(getServiceUrl("/spi-flash/actions/connect"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBbsBiosConnectPayload(selectedSession))
      });
      const connectedSession = await readJsonResponse(connectedResponse, "Koneksi device programmer gagal.");
      if (wrapper?.dataset.connectionAttempt !== connectionAttempt ||
          normalizeBbsBiosDevice(deviceSelect?.value) !== selectedDevice) {
        return;
      }

      setBbsBiosDeviceConnectionState(
        deviceSelect,
        "connected",
        connectedSession.connectionState || selectedDevice + " terhubung."
      );
    } catch (error) {
      if (wrapper?.dataset.connectionAttempt !== connectionAttempt ||
          normalizeBbsBiosDevice(deviceSelect?.value) !== selectedDevice) {
        return;
      }

      const message = error?.message || "Koneksi " + selectedDevice + " gagal.";
      setBbsBiosDeviceConnectionState(deviceSelect, "failed", message);
      setStatus(message, "error");
      state.notify(message, true);
    }
  }

  function isBiosFlow(source, item) {
    return source?.kind === "bios" &&
      Boolean(item?.canPrepareForUpload) &&
      String(item?.uploadTargetCategory || "").toLowerCase() === "bios";
  }

  function renderPreparedChoices() {
    const host = state.container?.querySelector("[data-bbs-prepared]");
    if (!host) {
      return;
    }

    const entries = Array.from(state.preparedFiles.entries());
    if (!entries.length) {
      host.innerHTML = "";
      return;
    }

    host.innerHTML = '<section class="bbs-telegram-prepared">' +
      '<div class="bbs-telegram-prepared-head">' +
      '<span class="material-symbols-outlined">inventory_2</span>' +
      '<div><strong>Hasil extract siap ke form upload</strong><p>Pilih satu file. Tombol ini hanya membuka wizard upload yang sudah ada.</p></div>' +
      "</div>" +
      '<div class="bbs-telegram-prepared-list">' +
      entries.map(([id, file]) =>
        '<article class="bbs-telegram-prepared-item">' +
        '<div><strong>' + escapeHtml(file.fileName) + "</strong>" +
        '<span>' + escapeHtml(formatBytes(file.sizeBytes)) + " · SHA-256 " + escapeHtml(String(file.sha256 || "").slice(0, 12)) + "…</span></div>" +
        '<button type="button" class="bbs-telegram-action bbs-telegram-upload" data-bbs-action="handoff" data-bbs-prepared-id="' +
        escapeHtml(id) + '">' +
        '<span class="material-symbols-outlined">open_in_new</span><span>Buka Form Upload ' +
        escapeHtml(file.targetCategory === "bios" ? "BIOS" : "Boardview") + "</span></button>" +
        "</article>"
      ).join("") +
      "</div></section>";
  }

  function resultKey(sourceKind, messageId) {
    return String(sourceKind || "") + ":" + String(messageId || "");
  }

  function renderResults() {
    const host = state.container?.querySelector("[data-bbs-results]");
    if (!host) {
      return;
    }

    const groups = Array.isArray(state.groups) ? state.groups : [];
    if (!state.searchQuery) {
      host.innerHTML = '<div class="bbs-telegram-empty"><span class="material-symbols-outlined">travel_explore</span>' +
        "<strong>Cari BIOS atau boardview dari Telegram</strong>" +
        "<p>Ketik model atau kode board, misalnya <code>X441NC</code>. Hasil dikelompokkan berdasarkan arsip BIOS dan boardview.</p></div>";
      return;
    }

    const total = groups.reduce((count, group) => count + Number(group?.resultCount || group?.results?.length || 0), 0);
    if (total === 0) {
      host.innerHTML = '<div class="bbs-telegram-empty"><span class="material-symbols-outlined">search_off</span>' +
        "<strong>Belum ada file yang cocok</strong><p>Coba singkatan model, kode board, atau variasi nama lain.</p></div>";
      return;
    }

    const groupsBySource = new Map(
      groups
        .filter((group) => group && typeof group.sourceKind === "string")
        .map((group) => [group.sourceKind, group])
    );
    const orderedSourceKinds = ["schematic", "bios"];
    host.innerHTML = '<div class="bbs-telegram-results-grid">' + orderedSourceKinds.map((sourceKind) => {
      const source = sourceOptions.find((item) => item.kind === sourceKind) || sourceOptions[0];
      const group = groupsBySource.get(source.kind);
      const results = Array.isArray(group?.results) ? group.results : [];
      const sourceLabel = group?.sourceLabel || source.label;
      if (!results.length) {
        return '<section class="bbs-telegram-result-group">' +
          '<header><span class="material-symbols-outlined">' + source.icon + '</span><div><strong>' +
          escapeHtml(sourceLabel) + "</strong><span>" + escapeHtml(source.handle) +
          "</span></div><b>0 file</b></header>" +
          '<p class="bbs-telegram-no-source-result">' +
          (group ? "Tidak ada kecocokan dari sumber ini." : "Arsip ini tidak dipilih pada pencarian ini.") +
          "</p></section>";
      }

      return '<section class="bbs-telegram-result-group">' +
        '<header><span class="material-symbols-outlined">' + source.icon + '</span><div><strong>' +
        escapeHtml(sourceLabel) + "</strong><span>" + escapeHtml(source.handle) +
        "</span></div><b>" + escapeHtml(String(results.length)) + " file</b></header>" +
        '<div class="bbs-telegram-result-list">' +
        results.map((item) => {
          const key = resultKey(source.kind, item.messageId);
          const uploadable = Boolean(item.canPrepareForUpload && item.uploadTargetCategory);
          const boardviewFlow = isBoardviewFlow(source, item);
          const biosFlow = isBiosFlow(source, item);
          const selectionAttributes = ' data-bbs-result-key="' + escapeHtml(key) +
            '" data-bbs-source-kind="' + escapeHtml(source.kind) +
            '" data-bbs-message-id="' + escapeHtml(String(item.messageId)) +
            '" data-bbs-file-name="' + escapeHtml(item.fileName) + '"';
          return '<article class="bbs-telegram-result-item">' +
            '<div class="bbs-telegram-result-main"><div class="bbs-telegram-file-title">' +
            '<span class="material-symbols-outlined">description</span><strong>' + escapeHtml(item.fileName) +
            "</strong></div>" +
            '<div class="bbs-telegram-result-meta"><span>' + escapeHtml(formatBytes(item.sizeBytes)) + "</span>" +
            (formatDate(item.messageDateUtc) ? "<span>" + escapeHtml(formatDate(item.messageDateUtc)) + "</span>" : "") +
            "<span>" + escapeHtml(item.extension || "").toUpperCase() + "</span></div>" +
            "</div>" +
            '<div class="bbs-telegram-actions">' +
            '<button type="button" class="bbs-telegram-action" data-bbs-action="download"' + selectionAttributes +
            (boardviewFlow ? ' data-bbs-boardview-flow="true"' : "") +
            (biosFlow ? ' data-bbs-bios-flow="true"' : "") + '>' +
            '<span class="material-symbols-outlined">download</span><span>Download</span></button>' +
            (boardviewFlow
              ? '<label class="bbs-telegram-boardview-viewer"><span class="material-symbols-outlined" aria-hidden="true">visibility</span>' +
                '<select data-bbs-boardview-viewer aria-label="Pilih aplikasi pembuka Boardview">' +
                '<option value="">---Pilih Viewer---</option><option value="desktop">Boardview Desktop</option>' +
                '<option value="teknisihub">Boardview TeknisiHub</option></select></label>' +
                '<button type="button" class="bbs-telegram-action bbs-telegram-open-boardview" data-bbs-action="open-boardview"' +
                selectionAttributes + ' disabled aria-disabled="true">' +
                '<span class="material-symbols-outlined">open_in_new</span><span>Buka</span></button>' +
                (item.hasLocalCache
                  ? '<button type="button" class="bbs-telegram-action bbs-telegram-open-location" data-bbs-action="open-boardview-location"' +
                    selectionAttributes + '>' +
                    '<span class="material-symbols-outlined">folder_open</span><span>Lokasi File</span></button>'
                  : "")
              : "") +
            (biosFlow
              ? '<label class="bbs-telegram-bios-device" data-connection-state="idle" ' +
                'title="Pilih device programmer dulu. Koneksi akan dicek otomatis setelah dipilih.">' +
                '<span class="material-symbols-outlined" aria-hidden="true">usb</span>' +
                '<select data-bbs-bios-device aria-label="Pilih device programmer untuk BIOS/EC Programmer">' +
                '<option value="">---Pilih Koneksi---</option>' +
                '<option value="TEKNISIHUB_DEVICE_USB">TEKNISIHUB_DEVICE USB</option>' +
                '<option value="TEKNISIHUB_DEVICE_WIFI">TEKNISIHUB_DEVICE WIFI</option>' +
                '</select><span class="bbs-telegram-bios-device-indicator" aria-hidden="true"></span></label>' +
                '<button type="button" class="bbs-telegram-action bbs-telegram-flash-bios" data-bbs-action="flash-bios"' +
                selectionAttributes + ' disabled aria-disabled="true" title="Pilih device programmer dulu">' +
                '<span class="material-symbols-outlined">memory</span><span>Flash Chip</span></button>'
              : "") +
            (uploadable
              ? '<button type="button" class="bbs-telegram-action bbs-telegram-upload" data-bbs-action="prepare" data-bbs-result-key="' +
                escapeHtml(key) + '" data-bbs-source-kind="' + escapeHtml(source.kind) +
                '" data-bbs-message-id="' + escapeHtml(String(item.messageId)) +
                '" data-bbs-file-name="' + escapeHtml(item.fileName) +
                '" data-bbs-target-category="' + escapeHtml(item.uploadTargetCategory) + '">' +
                '<span class="material-symbols-outlined">upload_file</span><span>Upload</span></button>'
              : '<span class="bbs-telegram-manual-note">Download manual</span>') +
            "</div></article>";
        }).join("") +
        "</div></section>";
    }).join("") + "</div>";
  }

  function render() {
    if (!state.container) {
      return;
    }

    state.container.innerHTML =
      '<section class="bbs-telegram-page" aria-label="BBS Telegram">' +
      '<form class="bbs-telegram-search-form" data-bbs-form>' +
      '<label for="bbsTelegramQuery">Model / kode board</label>' +
      '<div class="bbs-telegram-search-row"><input id="bbsTelegramQuery" data-bbs-query type="search" maxlength="120" autocomplete="off" placeholder="Contoh: X441NC" required>' +
      '<button type="submit" data-bbs-search><span class="material-symbols-outlined">search</span><span>Cari Arsip</span></button></div>' +
      "</form>" +
      '<p class="bbs-telegram-status" data-bbs-status aria-live="polite"></p>' +
      '<div data-bbs-results></div><div data-bbs-prepared></div></section>';

    const form = state.container.querySelector("[data-bbs-form]");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      search().catch((error) => {
        setStatus(error.message, "error");
        state.notify(error.message, true);
      });
    });

    state.container.addEventListener("change", (event) => {
      const viewerSelect = event.target.closest("select[data-bbs-boardview-viewer]");
      if (viewerSelect && state.container.contains(viewerSelect)) {
        syncBoardviewOpenButton(viewerSelect);
        return;
      }

      const biosDeviceSelect = event.target.closest("select[data-bbs-bios-device]");
      if (biosDeviceSelect && state.container.contains(biosDeviceSelect)) {
        void tryConnectBbsBiosDevice(biosDeviceSelect);
      }
    });

    state.container.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-bbs-action]");
      if (!button || !state.container.contains(button)) {
        return;
      }

      const action = button.getAttribute("data-bbs-action");
      if (action === "handoff") {
        handoffPreparedFile(button.getAttribute("data-bbs-prepared-id") || "").catch((error) => {
          setStatus(error.message, "error");
          state.notify(error.message, true);
        });
        return;
      }

      const selection = {
        sourceKind: button.getAttribute("data-bbs-source-kind") || "",
        messageId: Number(button.getAttribute("data-bbs-message-id") || 0),
        expectedFileName: button.getAttribute("data-bbs-file-name") || "",
        targetCategory: button.getAttribute("data-bbs-target-category") || "",
        boardviewFlow: button.getAttribute("data-bbs-boardview-flow") === "true",
        biosFlow: button.getAttribute("data-bbs-bios-flow") === "true"
      };
      if (action === "download") {
        downloadSelection(selection).catch((error) => {
          setStatus(error.message, "error");
          state.notify(error.message, true);
        });
      } else if (action === "prepare") {
        prepareSelection(selection).catch((error) => {
          setStatus(error.message, "error");
          state.notify(error.message, true);
        });
      } else if (action === "flash-bios") {
        const selectedDevice = normalizeBbsBiosDevice(
          button.closest(".bbs-telegram-actions")?.querySelector("[data-bbs-bios-device]")?.value
        );
        prepareBiosForSpiFlash(selection, selectedDevice).catch((error) => {
          setStatus(error.message, "error");
          state.notify(error.message, true);
        });
      } else if (action === "open-boardview") {
        const viewerType = normalizeBoardviewViewerType(
          button.closest(".bbs-telegram-actions")?.querySelector("[data-bbs-boardview-viewer]")?.value
        );
        openBoardviewSelection(selection, viewerType).catch((error) => {
          setStatus(error.message, "error");
          state.notify(error.message, true);
        });
      } else if (action === "open-boardview-location") {
        openBoardviewDownloadLocation(selection).catch((error) => {
          setStatus(error.message, "error");
          state.notify(error.message, true);
        });
      }
    });

    renderResults();
  }

  async function search() {
    if (state.searching) {
      return;
    }

    const input = state.container?.querySelector("[data-bbs-query]");
    const query = String(input?.value || "").trim();
    const sourceKinds = selectedSourceKinds();
    if (query.length < 2) {
      throw new Error("Masukkan minimal 2 karakter untuk pencarian.");
    }
    state.preparedFiles.clear();
    renderPreparedChoices();
    setSearchBusy(true);
    setStatus("Mencari file pada arsip Telegram...", "loading");
    try {
      const response = await globalScope.fetch(getServiceUrl("/wtelegram-archive/search"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, sourceKinds })
      });
      const payload = await readJsonResponse(response, "Pencarian Telegram belum berhasil.");
      state.searchQuery = query;
      state.groups = Array.isArray(payload.groups) ? payload.groups : [];
      renderResults();
      const total = state.groups.reduce((count, group) => count + Number(group?.resultCount || group?.results?.length || 0), 0);
      setStatus(total ? total + " file ditemukan. Pilih Download atau Upload." : getMessage(payload, "Tidak ada file yang cocok."), total ? "success" : "info");
    } finally {
      setSearchBusy(false);
    }
  }

  async function downloadSelection(selection) {
    const key = resultKey(selection.sourceKind, selection.messageId);
    const boardviewFlow = Boolean(selection.boardviewFlow);
    const biosFlow = Boolean(selection.biosFlow);
    setResultBusy(key, true, "Mengunduh...");
    setStatus(
      boardviewFlow
        ? "Menyiapkan Master Folder untuk hasil extract Boardview..."
        : biosFlow
          ? "Menyiapkan Master Folder untuk hasil extract BIOS..."
        : "Mengunduh file terpilih...",
      "loading"
    );
    try {
      const response = await globalScope.fetch(getServiceUrl(
        boardviewFlow
          ? "/wtelegram-archive/boardview/download"
          : biosFlow
            ? "/wtelegram-archive/bios/download"
            : "/wtelegram-archive/download"
      ), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(boardviewFlow || biosFlow
          ? {
            sourceKind: selection.sourceKind,
            messageId: selection.messageId,
            expectedFileName: selection.expectedFileName
          }
          : {
            sourceKind: selection.sourceKind,
            selections: [{
              messageId: selection.messageId,
              expectedFileName: selection.expectedFileName
            }]
          })
      });
      const payload = await readJsonResponse(response, "Download Telegram belum berhasil.");
      if (payload.cancelled) {
        setStatus(getMessage(payload, biosFlow ? "Download BIOS dibatalkan." : "Download Boardview dibatalkan."), "info");
        return;
      }
      setStatus(getMessage(payload, "Download selesai."), "success");
      state.notify(getMessage(payload, "Download selesai."), false);
    } finally {
      setResultBusy(key, false);
    }
  }

  async function prepareBiosForSpiFlash(selection, selectedDevice) {
    const resolvedDevice = normalizeBbsBiosDevice(selectedDevice);
    if (!resolvedDevice) {
      throw new Error("Pilih device programmer dulu sebelum menekan Flash Chip.");
    }

    const key = resultKey(selection.sourceKind, selection.messageId);
    setResultBusy(key, true, "Menyiapkan...");
    setStatus("Mengunduh, extract, dan memuat BIOS ke BIOS/EC Programmer...", "loading");
    try {
      const response = await globalScope.fetch(getServiceUrl("/wtelegram-archive/bios/flash-chip"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceKind: selection.sourceKind,
          messageId: selection.messageId,
          expectedFileName: selection.expectedFileName,
          selectedDevice: resolvedDevice
        })
      });
      const payload = await readJsonResponse(response, "BIOS belum dapat disiapkan untuk SPI Flash.");
      const message = getMessage(payload, "BIOS sudah dimuat ke SPI Flash.");
      setStatus(message, "success");
      state.notify(message, false);
      if (typeof payload.nextActionUrl === "string" && payload.nextActionUrl.startsWith("#")) {
        globalScope.location.hash = payload.nextActionUrl;
      }
    } finally {
      setResultBusy(key, false);
    }
  }

  function buildBbsBoardviewUrl(sessionId) {
    const targetUrl = new URL("boardview-teknisihub.html", globalScope.location.href);
    targetUrl.searchParams.set("v", "20260522a");
    targetUrl.searchParams.set("sessionId", String(sessionId || ""));
    targetUrl.searchParams.set("source", "bbs_telegram");
    return targetUrl.toString();
  }

  function renderBbsBoardviewLaunchWindow(targetWindow, options) {
    if (!targetWindow || targetWindow.closed) {
      return false;
    }

    const documentTitle = escapeHtml(options?.documentTitle || "Boardview TeknisiHub");
    const heading = escapeHtml(options?.heading || "Boardview TeknisiHub");
    const copyMarkup = options?.copyMarkup || "";
    const contentMarkup = options?.contentMarkup || "";
    const footerMarkup = options?.footerMarkup || "";
    const mode = escapeHtml(options?.mode || "pending");
    try {
      targetWindow.document.open();
      targetWindow.document.write(
        '<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<title>' + documentTitle + '</title><style>' +
        ':root{color-scheme:light;font-family:Segoe UI,Arial,sans-serif;color:#102c3e;background:#edf5f8}' +
        'body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box;background:linear-gradient(135deg,#d9eef6,#eff7f9)}' +
        '.bbs-launch{width:min(680px,100%);padding:28px;box-sizing:border-box;border:1px solid #a9c9d5;border-radius:4px;background:#fff;box-shadow:0 20px 50px rgba(13,57,76,.18)}' +
        '.bbs-kicker{margin:0 0 7px;color:#1b748e;font-weight:700;font-size:12px;letter-spacing:.1em}.bbs-launch h1{margin:0;color:#102c3e;font-size:25px}.bbs-copy{margin-top:12px;color:#486372;line-height:1.55}.bbs-copy p{margin:0}.bbs-footer{margin:16px 0 0;color:#58717e;font-size:13px;line-height:1.45}' +
        '.bbs-progress{height:5px;margin-top:20px;overflow:hidden;background:#dbeaf0}.bbs-progress span{display:block;width:42%;height:100%;background:#1883a0;animation:bbs-progress 1s ease-in-out infinite}@keyframes bbs-progress{from{transform:translateX(-110%)}to{transform:translateX(340%)}}' +
        '.bbs-candidates{display:grid;gap:8px;margin-top:18px}.bbs-candidate{display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;gap:10px;width:100%;padding:12px;border:1px solid #afcbd5;border-radius:3px;color:#17394a;background:#fafdfe;text-align:left;cursor:pointer;font:inherit}.bbs-candidate:hover{border-color:#1883a0;background:#edf8fb}.bbs-candidate-number{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#1883a0;color:#fff;font-size:13px;font-weight:700}.bbs-candidate strong,.bbs-candidate small{display:block;overflow-wrap:anywhere}.bbs-candidate strong{color:#102c3e}.bbs-candidate small{margin-top:3px;color:#57717d;font-size:12px}.bbs-badge{padding:3px 6px;border:1px solid #6cb19a;border-radius:2px;color:#17694d;font-size:11px;font-weight:700;white-space:nowrap}.bbs-error{margin-top:18px;padding:12px;border:1px solid #dfa6a6;background:#fff5f5;color:#8a2525;line-height:1.5}' +
        '</style></head><body><main class="bbs-launch bbs-launch--' + mode + '" aria-live="polite">' +
        '<p class="bbs-kicker">TEKNISIHUB BOARDVIEW</p><h1>' + heading + '</h1>' +
        (copyMarkup ? '<div class="bbs-copy">' + copyMarkup + '</div>' : "") +
        contentMarkup +
        (footerMarkup ? '<p class="bbs-footer">' + footerMarkup + '</p>' : "") +
        '</main></body></html>'
      );
      targetWindow.document.close();
      return true;
    } catch {
      return false;
    }
  }

  function openPendingBbsBoardviewWindow(fileName) {
    const pendingWindow = globalScope.open("", "_blank");
    if (!pendingWindow) {
      return null;
    }

    try {
      pendingWindow.opener = null;
      renderBbsBoardviewLaunchWindow(pendingWindow, {
        mode: "pending",
        documentTitle: "Menyiapkan Boardview TeknisiHub",
        heading: "Menyiapkan viewer",
        copyMarkup: "<p>Aplikasi lokal sedang menyiapkan viewer untuk <strong>" +
          escapeHtml(fileName || "Boardview") + "</strong>.</p>",
        contentMarkup: '<div class="bbs-progress" aria-hidden="true"><span></span></div>',
        footerMarkup: "Tab ini akan otomatis berpindah ke viewer begitu session siap."
      });
    } catch {
      // Navigation can still proceed if the temporary status page cannot render.
    }
    return pendingWindow;
  }

  function renderBbsBoardviewErrorWindow(targetWindow, fileName, errorMessage) {
    renderBbsBoardviewLaunchWindow(targetWindow, {
      mode: "error",
      documentTitle: "Boardview TeknisiHub gagal dibuka",
      heading: "Viewer belum jadi dibuka",
      copyMarkup: "<p>Session untuk <strong>" + escapeHtml(fileName || "Boardview") +
        "</strong> belum berhasil disiapkan.</p>",
      contentMarkup: '<div class="bbs-error">' + escapeHtml(errorMessage || "Silakan kembali lalu coba lagi.") + "</div>"
    });
  }

  function renderBbsBoardviewCandidateWindow(targetWindow, payload, selection) {
    const candidates = Array.isArray(payload?.candidateFiles) ? payload.candidateFiles : [];
    if (!candidates.length || !targetWindow || targetWindow.closed) {
      return false;
    }

    const candidateMarkup = candidates.map((candidate, position) => {
      const candidateIndex = Number(candidate?.index);
      const safeIndex = Number.isInteger(candidateIndex) && candidateIndex >= 0 ? candidateIndex : position;
      const label = String(candidate?.fileName || candidate?.relativePath || "File " + (position + 1));
      const path = String(candidate?.relativePath || "");
      const meta = [candidate?.extension, candidate?.displaySize].filter(Boolean).join(" | ") || "File Boardview";
      return '<button type="button" class="bbs-candidate" data-bbs-candidate-index="' + safeIndex + '">' +
        '<span class="bbs-candidate-number">' + (position + 1) + '</span><span><strong>' + escapeHtml(label) +
        '</strong>' + (path && path !== label ? '<small>' + escapeHtml(path) + '</small>' : "") +
        '<small>' + escapeHtml(meta) + '</small></span>' +
        (candidate?.recommended ? '<span class="bbs-badge">Rekomendasi</span>' : "") + "</button>";
    }).join("");

    const rendered = renderBbsBoardviewLaunchWindow(targetWindow, {
      mode: "selection",
      documentTitle: "Pilih file Boardview TeknisiHub",
      heading: "Pilih file boardview",
      copyMarkup: "<p>Arsip <strong>" + escapeHtml(payload?.fileName || selection.expectedFileName || "Boardview") +
        "</strong> berisi beberapa file boardview. Pilih satu file untuk dibuka.</p>",
      contentMarkup: '<div class="bbs-candidates">' + candidateMarkup + "</div>",
      footerMarkup: "Rekomendasi diurutkan dari kandidat yang paling mungkin menjadi board utama."
    });
    if (!rendered) {
      return false;
    }

    targetWindow.document.querySelectorAll("[data-bbs-candidate-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const candidateIndex = Number(button.getAttribute("data-bbs-candidate-index"));
        renderBbsBoardviewLaunchWindow(targetWindow, {
          mode: "pending",
          documentTitle: "Menyiapkan Boardview TeknisiHub",
          heading: "Menyiapkan viewer",
          copyMarkup: "<p>Membuat session untuk file Boardview pilihan.</p>",
          contentMarkup: '<div class="bbs-progress" aria-hidden="true"><span></span></div>'
        });
        openBoardviewSelection(selection, "teknisihub", candidateIndex, targetWindow).catch((error) => {
          renderBbsBoardviewErrorWindow(targetWindow, selection.expectedFileName, error.message);
          setStatus(error.message, "error");
          state.notify(error.message, true);
        });
      });
    });
    return true;
  }

  function finalizeBbsBoardviewWindow(targetWindow, sessionId) {
    const targetUrl = buildBbsBoardviewUrl(sessionId);
    if (targetWindow && !targetWindow.closed) {
      targetWindow.location.replace(targetUrl);
      return;
    }

    const launchedWindow = globalScope.open(targetUrl, "_blank");
    if (!launchedWindow) {
      throw new Error("Session Boardview TeknisiHub sudah siap, tetapi tab baru diblokir browser. Izinkan pop-up lalu klik Buka lagi.");
    }
    try {
      launchedWindow.opener = null;
    } catch {
      // Browser may not allow modifying opener after navigation.
    }
  }

  async function openBoardviewSelection(selection, requestedViewerType, candidateIndex = null, existingWindow = null) {
    const viewerType = normalizeBoardviewViewerType(requestedViewerType);
    if (!viewerType) {
      throw new Error("Pilih Boardview Desktop atau Boardview TeknisiHub terlebih dulu.");
    }

    const key = resultKey(selection.sourceKind, selection.messageId);
    let pendingWindow = existingWindow;
    if (viewerType === "teknisihub" && (!pendingWindow || pendingWindow.closed)) {
      pendingWindow = openPendingBbsBoardviewWindow(selection.expectedFileName);
      if (!pendingWindow) {
        throw new Error("Browser memblokir tab Boardview TeknisiHub. Izinkan pop-up lalu klik Buka lagi.");
      }
    }

    setResultBusy(key, true, "Membuka...");
    setStatus(
      viewerType === "teknisihub"
        ? "Menyiapkan Boardview TeknisiHub dari cache lokal..."
        : "Menyiapkan Boardview Desktop dari cache lokal...",
      "loading"
    );
    try {
      const response = await globalScope.fetch(getServiceUrl("/wtelegram-archive/boardview/open"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceKind: selection.sourceKind,
          messageId: selection.messageId,
          expectedFileName: selection.expectedFileName,
          viewerType,
          candidateIndex: Number.isInteger(candidateIndex) ? candidateIndex : null
        })
      });
      const payload = await readJsonResponse(response, "Boardview belum dapat dibuka.");
      if (payload.requiresFileSelection) {
        if (!renderBbsBoardviewCandidateWindow(pendingWindow, payload, selection)) {
          throw new Error("Daftar file Boardview yang bisa dipilih belum siap.");
        }
        setStatus(getMessage(payload, "Pilih file Boardview yang ingin dibuka."), "info");
        return;
      }

      if (viewerType === "teknisihub") {
        if (!payload.sessionId) {
          throw new Error("Session Boardview TeknisiHub belum siap.");
        }
        finalizeBbsBoardviewWindow(pendingWindow, payload.sessionId);
      }

      const successMessage = getMessage(payload,
        viewerType === "teknisihub" ? "Boardview TeknisiHub berhasil dibuka." : "Boardview Desktop berhasil dibuka."
      );
      setStatus(successMessage, "success");
      state.notify(successMessage, false);
      if (markBoardviewItemHasLocalCache(selection)) {
        renderResults();
      }
    } catch (error) {
      if (viewerType === "teknisihub") {
        renderBbsBoardviewErrorWindow(pendingWindow, selection.expectedFileName, error.message);
      }
      throw error;
    } finally {
      setResultBusy(key, false);
    }
  }

  async function openBoardviewDownloadLocation(selection) {
    const key = resultKey(selection.sourceKind, selection.messageId);
    setResultBusy(key, true, "Membuka...");
    setStatus("Membuka lokasi file Boardview...", "loading");
    try {
      const response = await globalScope.fetch(getServiceUrl("/wtelegram-archive/boardview/open-download-location"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceKind: selection.sourceKind,
          messageId: selection.messageId,
          expectedFileName: selection.expectedFileName
        })
      });
      const payload = await readJsonResponse(response, "Lokasi file Boardview belum dapat dibuka.");
      const message = getMessage(payload, "Lokasi file Boardview dibuka.");
      setStatus(message, "success");
      state.notify(message, false);
    } finally {
      setResultBusy(key, false);
    }
  }

  async function prepareSelection(selection) {
    const key = resultKey(selection.sourceKind, selection.messageId);
    setResultBusy(key, true, "Menyiapkan...");
    setStatus("Mengunduh dan menyiapkan file untuk wizard upload...", "loading");
    try {
      const response = await globalScope.fetch(getServiceUrl("/wtelegram-archive/prepare-upload"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceKind: selection.sourceKind,
          messageId: selection.messageId,
          expectedFileName: selection.expectedFileName,
          targetCategory: selection.targetCategory
        })
      });
      const payload = await readJsonResponse(response, "File Telegram belum dapat disiapkan.");
      const files = Array.isArray(payload.files) ? payload.files : [];
      if (!files.length) {
        throw new Error("Tidak ada file yang dapat dimasukkan ke wizard upload.");
      }

      if (files.length === 1) {
        await handoffFile(files[0]);
      } else {
        files.forEach((file) => {
          const id = "prepared-" + state.nextPreparedId++;
          state.preparedFiles.set(id, file);
        });
        renderPreparedChoices();
        setStatus(getMessage(payload, "Pilih file hasil extract untuk form upload."), "success");
      }
    } finally {
      setResultBusy(key, false);
    }
  }

  async function handoffPreparedFile(id) {
    const file = state.preparedFiles.get(id);
    if (!file) {
      throw new Error("Pilihan file hasil extract sudah tidak tersedia. Siapkan ulang dari hasil pencarian.");
    }

    await handoffFile(file);
  }

  async function handoffFile(file) {
    if (typeof state.openUploadForm !== "function") {
      throw new Error("Wizard upload belum siap. Refresh halaman lalu coba lagi.");
    }

    setStatus("Membuka wizard upload dengan file terpilih...", "loading");
    await state.openUploadForm(file);
    setStatus("File sudah dimasukkan ke wizard upload. Lengkapi metadata lalu kirim dari form tersebut.", "success");
  }

  const page = {
    viewKey,
    eyebrow: "BIOS / BOARDVIEW TELEGRAM",
    title: "BBS TELEGRAM",
    subtitle: "Pencarian, download, extract, lalu handoff ke wizard upload BIOS atau Boardview yang sudah ada.",
    mount(options) {
      state.container = options?.container || null;
      state.notify = typeof options?.notify === "function" ? options.notify : () => {};
      state.openUploadForm = typeof options?.openUploadForm === "function" ? options.openUploadForm : null;
      state.initialized = Boolean(state.container);
      if (state.initialized) {
        render();
      }
    },
    setVisible(visible) {
      state.visible = Boolean(visible);
      state.container?.classList.toggle("hidden", !state.visible);
    },
    refresh() {
      if (!state.initialized || !state.visible) {
        return;
      }
      renderResults();
      renderPreparedChoices();
    }
  };

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.bbsTelegram = page;
})(window);
