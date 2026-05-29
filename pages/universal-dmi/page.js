(function initializeUniversalDmiPage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${serviceBaseUrl}${path}`, {
      headers: { Accept: "application/json" },
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

  function createApi() {
    let mountedContainer = null;
    let notify = () => {};
    let busy = false;
    let message = "Universal DMI siap dibuka sebagai aplikasi desktop.";
    let errorMessage = "";

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = `
        <div class="spi-layout">
          <section class="spi-card">
            <div class="spi-card-head">
              <div>
                <p class="label">Bios Patch</p>
                <h4>Universal DMI</h4>
              </div>
              <button type="button" id="universalDmiLaunchButton" class="ghost${busy ? " disabled" : ""}"${busy ? " disabled" : ""}>
                <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "open_in_new"}</span>
                <span>${busy ? "Membuka..." : "Open"}</span>
              </button>
            </div>
            <p class="spi-note">${escapeHtml(errorMessage || message)}</p>
          </section>
        </div>
      `;

      mountedContainer
        .querySelector("#universalDmiLaunchButton")
        ?.addEventListener("click", () => void launch());
    }

    async function launch() {
      if (busy) {
        return;
      }

      busy = true;
      errorMessage = "";
      message = "Membuka Universal DMI desktop...";
      render();

      try {
        const result = await fetchJson("/tools/universal-dmi/launch");
        message = result.message || "Universal DMI desktop dibuka.";
        notify(message);
      } catch (error) {
        errorMessage = error?.message || "Gagal membuka Universal DMI desktop.";
        notify(errorMessage, true);
      } finally {
        busy = false;
        render();
      }
    }

    return {
      viewKey: "tool_universal_dmi",
      eyebrow: "Bios Patch",
      title: "Universal DMI",
      subtitle: "Launcher aplikasi desktop Universal-DMI-Tools original.",
      items: [],
      mount(options = {}) {
        mountedContainer = options.container || null;
        notify = options.notify || (() => {});
        render();
      },
      setVisible(visible) {
        mountedContainer?.classList.toggle("hidden", !visible);
      },
      refresh() {
        render();
      },
      launch
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.universalDmi = createApi();
})(window);
