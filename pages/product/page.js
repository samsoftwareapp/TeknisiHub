(function initializeProductPage(globalScope) {
  const whatsappContacts = [
    { key: "lumajang", area: "Lumajang", number: "6285183190794", displayNumber: "+6285183190794" },
    { key: "surabaya", area: "Surabaya", number: "6285101457564", displayNumber: "+6285101457564" }
  ];

  const products = [
    {
      id: "teknisihub-flash-osc-usb",
      orderName: "TEKNISIHUB_FLASH_OSC USB",
      title: "TEKNISIHUB_FLASH_OSC USB",
      description: "Device universal untuk kebutuhan SPI Flash, Flash EC/KBC, dan OSC via USB.",
      price: "Rp300.000",
      unit: "/ Unit",
      moq: "1 Paket",
      rating: "5.0",
      reviews: "50",
      sold: "50",
      delivery: "Fast Delivery",
      tags: ["TEKNISIHUB_FLASH_OSC", "SPI Flash", "EC/KBC"],
      toolViewKey: "tool_spi_flash",
      imageSrc: "assets/HubLogo.png?v=202605230001",
      imageAlt: "TEKNISIHUB_FLASH_OSC USB"
    },
    {
      id: "teknisihub-flash-osc-wifi",
      orderName: "TEKNISIHUB_FLASH_OSC WIFI",
      title: "TEKNISIHUB_FLASH_OSC WIFI",
      description: "Device universal untuk kebutuhan SPI Flash, Flash EC/KBC, dan OSC via WIFI.",
      price: "Rp500.000",
      unit: "/ Unit",
      moq: "1 Unit",
      rating: "5.0",
      reviews: "103",
      sold: "103",
      delivery: "Ready Order",
      tags: ["TEKNISIHUB_FLASH_OSC", "SPI Flash", "EC/KBC", "OSC"],
      toolViewKey: "tool_spi_flash",
      imageSrc: "assets/HubLogo.png?v=202605230001",
      imageAlt: "TEKNISIHUB_FLASH_OSC WIFI"
    },
    {
      id: "member-biasa-1-bulan",
      orderName: "LANGGANAN MEMBER BIASA 1 BULAN",
      title: "LANGGANAN MEMBER BIASA 1 BULAN",
      description: "Akses download 5 file per hari selama 1 bulan untuk kebutuhan servis harian.",
      price: "Rp75.000",
      unit: "/ Bulan",
      moq: "1 Akun",
      rating: "5.0",
      reviews: "0",
      sold: "500",
      delivery: "Aktivasi manual",
      tags: ["5/day", "1 Bulan", "Download"],
      features: ["5 download per hari", "Masa aktif 1 bulan", "Akses katalog sesuai channel"],
      imageSrc: "assets/HubLogo.png?v=202605230001",
      imageAlt: "Langganan Member Biasa TeknisiHub",
      imageFit: "contain"
    },
    {
      id: "vip-1-bulan",
      orderName: "LANGGANAN VIP 1 BULAN",
      title: "LANGGANAN VIP 1 BULAN",
      description: "Akses download 10 file per hari selama 1 bulan plus full support prioritas.",
      price: "Rp150.000",
      unit: "/ Bulan",
      moq: "1 Akun",
      rating: "5.0",
      reviews: "0",
      sold: "233",
      delivery: "Full Support",
      tags: ["10/day", "VIP", "Full Support"],
      features: ["10 download per hari", "Masa aktif 1 bulan", "Full support prioritas"],
      imageSrc: "assets/HubLogo.png?v=202605230001",
      imageAlt: "Langganan VIP TeknisiHub",
      imageFit: "contain"
    }
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  function buildWhatsAppUrl(product, contact) {
    const message = [
      `Saya mau order ${product.orderName}`,
      `Area: ${contact.area}`,
      "Atas nama:",
      "Alamat:",
      "Jumlah:"
    ].join("\n");
    return `https://wa.me/${contact.number}?text=${encodeURIComponent(message)}`;
  }

  function createWhatsAppLinks(product, linkClass, labelPrefix = "WA") {
    return whatsappContacts.map((contact) => `
      <a
        class="${escapeHtml(linkClass)} is-${escapeHtml(contact.key)}"
        href="${escapeHtml(buildWhatsAppUrl(product, contact))}"
        target="_blank"
        rel="noopener noreferrer"
        title="Order ${escapeHtml(product.orderName)} area ${escapeHtml(contact.area)}"
      >
        <span class="material-symbols-outlined">chat</span>
        <span>${escapeHtml(labelPrefix)} ${escapeHtml(contact.area)}</span>
      </a>
    `).join("");
  }

  function createProductCard(product) {
    return `
      <article class="product-card">
        <div class="product-card-topline">
          <span>${escapeHtml(product.rating)}<span class="product-star">&#9733;</span> (${escapeHtml(product.reviews)})</span>
          <span>Terjual ${escapeHtml(product.sold)}</span>
        </div>

        <div class="product-media${product.imageFit ? ` product-media-${escapeHtml(product.imageFit)}` : ""}">
          <img src="${escapeHtml(product.imageSrc)}" alt="${escapeHtml(product.imageAlt)}" loading="lazy">
          <div class="product-quick-actions">
            ${createWhatsAppLinks(product, "product-quick-link", "WA")}
          </div>
        </div>

        <div class="product-card-body">
          <h4>${escapeHtml(product.title)}</h4>
          <p>${escapeHtml(product.description)}</p>
          ${product.features?.length ? `
          <ul class="product-feature-list">
            ${product.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
          </ul>
          ` : ""}
          <div class="product-tag-row">
            ${product.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
          </div>
          <div class="product-price-row">
            <strong>${escapeHtml(product.price)}</strong>
            <span>${escapeHtml(product.unit)}</span>
          </div>
          <p class="product-moq">${escapeHtml(product.moq)} (MOQ)</p>

          <div class="product-actions">
            ${createWhatsAppLinks(product, "product-inquiry-button", "Order")}
            ${product.toolViewKey ? `
            <button class="product-tool-button ghost" type="button" data-product-tool="${escapeHtml(product.toolViewKey)}">
              <span class="material-symbols-outlined">open_in_new</span>
              <span>Buka Tool</span>
            </button>
            ` : ""}
          </div>

          <div class="product-supplier-row">
            <span class="material-symbols-outlined">verified</span>
            <strong>TeknisiHub</strong>
            <span>${escapeHtml(product.delivery)} | Terjual ${escapeHtml(product.sold)}</span>
          </div>
        </div>
      </article>
    `;
  }

  function createWorkbenchMarkup() {
    return `
      <div class="product-shell">
        <section class="product-head">
          <div>
            <p class="label">Product</p>
            <h3>Produk TeknisiHub</h3>
            <p>Pilih produk hardware atau langganan member, lalu order lewat WhatsApp sesuai area terdekat.</p>
          </div>
          <div class="product-head-meta">
            <span class="spi-mini-badge">${escapeHtml(String(products.length))} Produk</span>
          </div>
        </section>

        <section class="product-grid" aria-label="Daftar produk TeknisiHub">
          ${products.map(createProductCard).join("")}
        </section>
      </div>
    `;
  }

  function createApi() {
    let mountedContainer = null;
    let navigate = () => {};

    function bindEvents() {
      mountedContainer.querySelectorAll("[data-product-tool]").forEach((button) => {
        button.addEventListener("click", () => {
          const viewKey = button.getAttribute("data-product-tool");
          if (viewKey) {
            navigate(viewKey);
          }
        });
      });
    }

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup();
      bindEvents();
    }

    return {
      viewKey: "product",
      eyebrow: "Product",
      title: "Product",
      subtitle: "Produk hardware dan langganan member yang bisa diorder via WhatsApp.",
      items: products,
      mount(context = {}) {
        mountedContainer = context.container || null;
        navigate = typeof context.navigate === "function" ? context.navigate : () => {};
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
  globalScope.teknisiHubPages.product = createApi();
})(window);
