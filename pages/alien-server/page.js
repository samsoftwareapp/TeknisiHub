(function initializeAlienServerPage(globalScope) {
  const cardSources = [
    {
      title: "Alien Server AMITSESetup",
      url: "https://alien.raaz.info.np/server/unlock/AMITSESetup/"
    },
    {
      title: "Alien Server Surface",
      url: "https://alien.raaz.info.np/server/unlock/surface/"
    },
    {
      title: "Alien Server Chromebook",
      url: "https://alien.raaz.info.np/server/unlock/chromebook/"
    },
    {
      title: "Alien Server Apple",
      url: "https://alien.raaz.info.np/server/unlock/apple/"
    },
    {
      title: "Alien Server Cleaner",
      url: "https://alien.raaz.info.np/server/unlock/cleaner/"
    },
    {
      title: "Alien Server BIOS Splitter",
      url: "https://alien.raaz.info.np/server/unlock/bios_splitter/"
    },
    {
      title: "Alien Server 8FC8",
      url: "https://alien.raaz.info.np/server/unlock/8fc8/"
    },
    {
      title: "Alien Server NVRAM",
      url: "https://alien.raaz.info.np/server/unlock/nvram/"
    },
    {
      title: "Alien Server BinMerger",
      url: "https://alien.raaz.info.np/server/unlock/binmerger/"
    },
    {
      title: "Alien Server Onboard RAM Disable",
      url: "https://alien.raaz.info.np/server/unlock/onboard_ram_disable/"
    },
    {
      title: "Alien Server Win Key",
      url: "https://alien.raaz.info.np/server/unlock/win_key/"
    }
  ];

  function createWorkbenchMarkup() {
    return `
      <div class="alien-server-grid">
        ${cardSources.map((card) => `
          <section class="spi-card alien-server-card">
            <div class="alien-server-frame-shell">
              <iframe
                class="alien-server-frame"
                src="${card.url}"
                title="${card.title}"
                loading="lazy"
                referrerpolicy="no-referrer"
              ></iframe>
            </div>
          </section>
        `).join("")}
      </div>
    `;
  }

  function createApi() {
    let mountedContainer = null;

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup();
    }

    return {
      viewKey: "tool_alien_server",
      eyebrow: "Alien Server",
      title: "Alien Server",
      subtitle: "Embed cepat untuk halaman tool eksternal AMITSESetup.",
      items: [],
      mount({ container } = {}) {
        mountedContainer = container || null;
        render();
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }

        mountedContainer.classList.toggle("hidden", !visible);
      },
      refresh() {
        render();
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.alienServer = createApi();
})(window);
