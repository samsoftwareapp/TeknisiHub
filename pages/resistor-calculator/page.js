(function initializeResistorCalculatorPage(globalScope) {
  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  const digitBands = [
    { key: "black", label: "Hitam", value: 0, hex: "#1f2933", textColor: "#ffffff" },
    { key: "brown", label: "Coklat", value: 1, hex: "#7a4b22", textColor: "#ffffff" },
    { key: "red", label: "Merah", value: 2, hex: "#c83b32", textColor: "#ffffff" },
    { key: "orange", label: "Oranye", value: 3, hex: "#ec8b22", textColor: "#112130" },
    { key: "yellow", label: "Kuning", value: 4, hex: "#f2c94c", textColor: "#112130" },
    { key: "green", label: "Hijau", value: 5, hex: "#2f9e62", textColor: "#ffffff" },
    { key: "blue", label: "Biru", value: 6, hex: "#2f6fd6", textColor: "#ffffff" },
    { key: "violet", label: "Ungu", value: 7, hex: "#7c4dff", textColor: "#ffffff" },
    { key: "gray", label: "Abu-abu", value: 8, hex: "#98a2b3", textColor: "#112130" },
    { key: "white", label: "Putih", value: 9, hex: "#f8fafc", textColor: "#112130" }
  ];

  const multiplierBands = [
    { key: "silver", label: "Perak", exponent: -2, hex: "#c3c8d4", textColor: "#112130" },
    { key: "gold", label: "Emas", exponent: -1, hex: "#d4a72c", textColor: "#112130" },
    ...digitBands.map((band) => ({ ...band, exponent: band.value }))
  ];

  const toleranceBands = [
    { key: "brown", label: "Coklat", tolerance: 1, hex: "#7a4b22", textColor: "#ffffff" },
    { key: "red", label: "Merah", tolerance: 2, hex: "#c83b32", textColor: "#ffffff" },
    { key: "green", label: "Hijau", tolerance: 0.5, hex: "#2f9e62", textColor: "#ffffff" },
    { key: "blue", label: "Biru", tolerance: 0.25, hex: "#2f6fd6", textColor: "#ffffff" },
    { key: "violet", label: "Ungu", tolerance: 0.1, hex: "#7c4dff", textColor: "#ffffff" },
    { key: "gray", label: "Abu-abu", tolerance: 0.05, hex: "#98a2b3", textColor: "#112130" },
    { key: "gold", label: "Emas", tolerance: 5, hex: "#d4a72c", textColor: "#112130" },
    { key: "silver", label: "Perak", tolerance: 10, hex: "#c3c8d4", textColor: "#112130" }
  ];

  const tempcoBands = [
    { key: "brown", label: "Coklat", ppm: 100, hex: "#7a4b22", textColor: "#ffffff" },
    { key: "red", label: "Merah", ppm: 50, hex: "#c83b32", textColor: "#ffffff" },
    { key: "orange", label: "Oranye", ppm: 15, hex: "#ec8b22", textColor: "#112130" },
    { key: "yellow", label: "Kuning", ppm: 25, hex: "#f2c94c", textColor: "#112130" },
    { key: "blue", label: "Biru", ppm: 10, hex: "#2f6fd6", textColor: "#ffffff" },
    { key: "violet", label: "Ungu", ppm: 5, hex: "#7c4dff", textColor: "#ffffff" }
  ];

  const eia96Values = [
    100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130,
    133, 137, 140, 143, 147, 150, 154, 158, 162, 165, 169, 174,
    178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232,
    237, 243, 249, 255, 261, 267, 274, 280, 287, 294, 301, 309,
    316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412,
    422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549,
    562, 576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732,
    750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953, 976
  ];

  const eia96Multipliers = {
    Z: 0.001,
    Y: 0.01,
    X: 0.1,
    A: 1,
    B: 10,
    C: 100,
    D: 1000,
    E: 10000,
    F: 100000
  };

  function formatCompactNumber(value, maximumFractionDigits = 2) {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits
    }).format(value);
  }

  function formatResistance(value) {
    const ohms = Number(value);
    if (!Number.isFinite(ohms)) {
      return "-";
    }

    const absolute = Math.abs(ohms);
    const units = [
      { limit: 1e9, suffix: "GOhm" },
      { limit: 1e6, suffix: "MOhm" },
      { limit: 1e3, suffix: "kOhm" },
      { limit: 1, suffix: "Ohm" }
    ];

    for (const unit of units) {
      if (absolute >= unit.limit) {
        return `${formatCompactNumber(ohms / unit.limit)} ${unit.suffix}`;
      }
    }

    return `${formatCompactNumber(ohms, 3)} Ohm`;
  }

  function parseResistanceInput(value) {
    const raw = String(value ?? "").trim().toUpperCase().replace(",", ".");
    if (!raw) {
      return null;
    }

    const normalized = raw
      .replace(/\s+/g, "")
      .replace(/OHMS?$/g, "")
      .replace(/OHM$/g, "")
      .replace(/MEG$/g, "M");

    if (/^\d*\.?\d+$/.test(normalized)) {
      return Number(normalized);
    }

    const decimalWithUnit = normalized.match(/^(\d*)([RKM])(\d*)$/);
    if (decimalWithUnit) {
      const [, left = "", unit = "", right = ""] = decimalWithUnit;
      const base = Number(`${left || "0"}.${right || "0"}`);
      if (!Number.isFinite(base)) {
        return null;
      }

      if (unit === "R") {
        return base;
      }
      if (unit === "K") {
        return base * 1e3;
      }
      if (unit === "M") {
        return base * 1e6;
      }
    }

    const withSuffix = normalized.match(/^(\d*\.?\d+)([RKM])$/);
    if (withSuffix) {
      const numeric = Number(withSuffix[1]);
      if (!Number.isFinite(numeric)) {
        return null;
      }
      if (withSuffix[2] === "R") {
        return numeric;
      }
      if (withSuffix[2] === "K") {
        return numeric * 1e3;
      }
      if (withSuffix[2] === "M") {
        return numeric * 1e6;
      }
    }

    return null;
  }

  function describeBandPosition(index, bandCount) {
    const labels = bandCount === 4
      ? ["Digit 1", "Digit 2", "Multiplier", "Tolerance"]
      : bandCount === 5
        ? ["Digit 1", "Digit 2", "Digit 3", "Multiplier", "Tolerance"]
        : ["Digit 1", "Digit 2", "Digit 3", "Multiplier", "Tolerance", "Tempco"];
    return labels[index] || `Band ${index + 1}`;
  }

  function getBandOptions(index, bandCount) {
    const toleranceIndex = bandCount - 1;
    const tempcoIndex = bandCount - 1;
    if (bandCount === 6 && index === tempcoIndex) {
      return tempcoBands;
    }
    if ((bandCount === 4 && index === 3) || (bandCount >= 5 && index === 4)) {
      return toleranceBands;
    }
    if ((bandCount === 4 && index === 2) || (bandCount >= 5 && index === 3)) {
      return multiplierBands;
    }
    return digitBands;
  }

  function createInitialState() {
    return {
      bandCount: 4,
      bandSelections: ["yellow", "violet", "red", "gold", "brown", "brown"],
      smdCode: "472",
      combinationInputs: ["100", "220", "330", ""],
      message: "Pilih warna resistor, isi kode SMD, atau hitung kombinasi seri/paralel."
    };
  }

  function decodeColorBands(state) {
    const bandCount = Number(state.bandCount || 4);
    const selected = state.bandSelections.slice(0, bandCount);
    const digitCount = bandCount === 4 ? 2 : 3;

    const digitValues = selected
      .slice(0, digitCount)
      .map((key) => digitBands.find((item) => item.key === key)?.value);

    if (digitValues.some((value) => typeof value !== "number")) {
      return null;
    }

    const multiplierKey = selected[digitCount];
    const toleranceKey = selected[digitCount + 1];
    const tempcoKey = bandCount === 6 ? selected[5] : "";

    const multiplier = multiplierBands.find((item) => item.key === multiplierKey);
    const tolerance = toleranceBands.find((item) => item.key === toleranceKey);
    const tempco = tempcoBands.find((item) => item.key === tempcoKey);

    if (!multiplier || !tolerance) {
      return null;
    }

    const significant = Number(digitValues.join(""));
    const ohms = significant * (10 ** multiplier.exponent);
    const toleranceValue = tolerance.tolerance;
    const minimum = ohms * (1 - (toleranceValue / 100));
    const maximum = ohms * (1 + (toleranceValue / 100));

    return {
      ohms,
      formatted: formatResistance(ohms),
      tolerance: `+/- ${formatCompactNumber(toleranceValue, 2)}%`,
      minimum: formatResistance(minimum),
      maximum: formatResistance(maximum),
      tempco: tempco ? `${formatCompactNumber(tempco.ppm, 0)} ppm/C` : "-",
      code: selected.map((key) => getBandOptions(selected.indexOf(key), bandCount).find((item) => item.key === key)?.label || key).join(" - ")
    };
  }

  function decodeSmdCode(rawCode) {
    const code = String(rawCode ?? "").trim().toUpperCase();
    if (!code) {
      return {
        title: "Belum ada kode",
        summary: "Masukkan kode resistor SMD seperti 103, 4701, 4R7, 0R22, atau 68C.",
        detail: "-",
        value: "-"
      };
    }

    if (/^0+$/.test(code)) {
      return {
        title: "Jumper 0 Ohm",
        summary: "Kode nol menandakan resistor jumper atau link 0 Ohm.",
        detail: "Dipakai sebagai penghubung jalur pada PCB.",
        value: "0 Ohm"
      };
    }

    if (/^\dR\d$|^\d+R\d+$/.test(code) || /^R\d+$/.test(code)) {
      const value = parseResistanceInput(code);
      return {
        title: "Format decimal R",
        summary: "Huruf R dipakai sebagai tanda desimal pada resistor SMD.",
        detail: `Kode ${code} dibaca langsung sebagai nilai resistansi.`,
        value: formatResistance(value)
      };
    }

    if (/^\d{3}$/.test(code)) {
      const digits = Number(code.slice(0, 2));
      const exponent = Number(code[2]);
      const value = digits * (10 ** exponent);
      return {
        title: "Kode 3 digit",
        summary: `${digits} x 10^${exponent}`,
        detail: "Dua digit pertama adalah angka signifikan, digit terakhir adalah multiplier.",
        value: formatResistance(value)
      };
    }

    if (/^\d{4}$/.test(code)) {
      const digits = Number(code.slice(0, 3));
      const exponent = Number(code[3]);
      const value = digits * (10 ** exponent);
      return {
        title: "Kode 4 digit",
        summary: `${digits} x 10^${exponent}`,
        detail: "Tiga digit pertama adalah angka signifikan, digit terakhir adalah multiplier.",
        value: formatResistance(value)
      };
    }

    if (/^\d{2}[A-Z]$/.test(code)) {
      const index = Number(code.slice(0, 2));
      const multiplier = eia96Multipliers[code[2]];
      const base = eia96Values[index - 1];
      if (multiplier && base) {
        const value = base * multiplier;
        return {
          title: "Kode EIA-96",
          summary: `Index ${index} = ${base}, multiplier ${code[2]} = x${multiplier}`,
          detail: "Umum dipakai pada resistor presisi 1%.",
          value: formatResistance(value)
        };
      }
    }

    return {
      title: "Format belum dikenali",
      summary: "Kode belum cocok dengan pola 3 digit, 4 digit, decimal R, atau EIA-96.",
      detail: "Cek ulang marking fisik resistor karena beberapa vendor memakai kode internal.",
      value: "-"
    };
  }

  function calculateCombinations(values) {
    const cleaned = values
      .map((item) => parseResistanceInput(item))
      .filter((item) => Number.isFinite(item) && item >= 0);

    if (cleaned.length === 0) {
      return {
        count: 0,
        series: "-",
        parallel: "-",
        note: "Isi minimal satu nilai resistor untuk menghitung kombinasi."
      };
    }

    const series = cleaned.reduce((sum, value) => sum + value, 0);
    const hasZero = cleaned.some((value) => value === 0);
    const parallel = hasZero ? 0 : 1 / cleaned.reduce((sum, value) => sum + (1 / value), 0);

    return {
      count: cleaned.length,
      series: formatResistance(series),
      parallel: formatResistance(parallel),
      note: hasZero
        ? "Salah satu resistor 0 Ohm, jadi total paralel juga 0 Ohm."
        : "Hitungan paralel memakai 1 / (1/R1 + 1/R2 + ...)."
    };
  }

  function createBandMarkup(state) {
    const bandCount = Number(state.bandCount || 4);
    return Array.from({ length: bandCount }, (_, index) => {
      const options = getBandOptions(index, bandCount);
      const currentKey = state.bandSelections[index];
      return `
        <article class="resistor-band-card">
          <div class="spi-card-head resistor-band-card-head">
            <div>
              <p class="label">Band ${index + 1}</p>
              <h4>${escapeHtml(describeBandPosition(index, bandCount))}</h4>
            </div>
          </div>
          <div class="resistor-band-grid">
            ${options.map((option) => `
              <button
                type="button"
                class="resistor-band-chip${currentKey === option.key ? " is-active" : ""}"
                data-band-index="${index}"
                data-band-key="${escapeHtml(option.key)}"
                style="--band-color:${escapeHtml(option.hex)};--band-text:${escapeHtml(option.textColor)}"
              >
                <span class="resistor-band-chip-swatch"></span>
                <span>${escapeHtml(option.label)}</span>
              </button>
            `).join("")}
          </div>
        </article>
      `;
    }).join("");
  }

  function createWorkbenchMarkup(state) {
    const colorResult = decodeColorBands(state);
    const smdResult = decodeSmdCode(state.smdCode);
    const comboResult = calculateCombinations(state.combinationInputs);

    return `
      <div class="spi-workbench-shell resistor-calculator-shell">
        <div class="spi-layout resistor-calculator-layout">
          <section class="spi-card">
            <div class="spi-card-head">
              <div>
                <p class="label">Color Band Decoder</p>
                <h4>Resistor axial 4, 5, atau 6 band</h4>
              </div>
              <div class="resistor-band-count-row">
                ${[4, 5, 6].map((count) => `
                  <button type="button" class="ghost resistor-band-count-button${Number(state.bandCount) === count ? " is-active" : ""}" data-band-count="${count}">
                    ${count} band
                  </button>
                `).join("")}
              </div>
            </div>
            <div class="resistor-band-list">
              ${createBandMarkup(state)}
            </div>
          </section>

          <section class="spi-card resistor-result-card${colorResult ? "" : " is-failed"}">
            <div class="spi-card-head">
              <div>
                <p class="label">Hasil Decoder</p>
                <h4>Nilai resistor warna</h4>
              </div>
            </div>
            ${colorResult ? `
              <div class="resistor-highlight-value">${escapeHtml(colorResult.formatted)}</div>
              <div class="detail-grid resistor-detail-grid">
                <strong>Toleransi</strong><span>${escapeHtml(colorResult.tolerance)}</span>
                <strong>Nilai minimum</strong><span>${escapeHtml(colorResult.minimum)}</span>
                <strong>Nilai maksimum</strong><span>${escapeHtml(colorResult.maximum)}</span>
                <strong>Tempco</strong><span>${escapeHtml(colorResult.tempco)}</span>
              </div>
            ` : `
              <p class="spi-note">Konfigurasi band belum lengkap.</p>
            `}
          </section>
        </div>

        <div class="spi-layout resistor-calculator-layout">
          <section class="spi-card">
            <div class="spi-card-head">
              <div>
                <p class="label">SMD Decoder</p>
                <h4>Baca kode resistor SMD</h4>
              </div>
            </div>
            <label for="resistorSmdInput">
              Kode SMD
              <input id="resistorSmdInput" type="text" value="${escapeHtml(state.smdCode)}" placeholder="Contoh: 103, 4701, 4R7, 68C">
            </label>
            <div class="resistor-quick-chip-row">
              ${["103", "472", "4701", "4R7", "0R22", "68C", "000"].map((example) => `
                <button type="button" class="ghost resistor-example-chip" data-smd-example="${escapeHtml(example)}">${escapeHtml(example)}</button>
              `).join("")}
            </div>
          </section>

          <section class="spi-card">
            <div class="spi-card-head">
              <div>
                <p class="label">Hasil SMD</p>
                <h4>${escapeHtml(smdResult.title)}</h4>
              </div>
            </div>
            <div class="resistor-highlight-value">${escapeHtml(smdResult.value)}</div>
            <p class="spi-note">${escapeHtml(smdResult.summary)}</p>
            <div class="note">${escapeHtml(smdResult.detail)}</div>
          </section>
        </div>

        <div class="spi-layout resistor-calculator-layout">
          <section class="spi-card">
            <div class="spi-card-head">
              <div>
                <p class="label">Kombinasi Resistor</p>
                <h4>Hitung seri dan paralel</h4>
              </div>
            </div>
            <div class="spi-form-grid">
              ${state.combinationInputs.map((value, index) => `
                <label>
                  R${index + 1}
                  <input type="text" value="${escapeHtml(value)}" placeholder="Contoh: 10k" data-combo-index="${index}">
                </label>
              `).join("")}
            </div>
            <p class="spi-note">Format input bisa berupa <code>220</code>, <code>4.7k</code>, <code>1M</code>, atau <code>0R22</code>.</p>
          </section>

          <section class="spi-card">
            <div class="spi-card-head">
              <div>
                <p class="label">Hasil Kombinasi</p>
                <h4>Total dari ${escapeHtml(String(comboResult.count))} resistor</h4>
              </div>
            </div>
            <div class="detail-grid resistor-detail-grid">
              <strong>Seri</strong><span>${escapeHtml(comboResult.series)}</span>
              <strong>Paralel</strong><span>${escapeHtml(comboResult.parallel)}</span>
            </div>
            <p class="spi-note">${escapeHtml(comboResult.note)}</p>
          </section>
        </div>
      </div>
    `;
  }

  function createApi() {
    let mountedContainer = null;
    let state = createInitialState();

    function render() {
      if (!mountedContainer) {
        return;
      }

      mountedContainer.innerHTML = createWorkbenchMarkup(state);

      mountedContainer.querySelectorAll("[data-band-count]").forEach((button) => {
        button.addEventListener("click", () => {
          state.bandCount = Number(button.getAttribute("data-band-count")) || 4;
          render();
        });
      });

      mountedContainer.querySelectorAll("[data-band-index][data-band-key]").forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.getAttribute("data-band-index"));
          const key = button.getAttribute("data-band-key") || "";
          state.bandSelections[index] = key;
          render();
        });
      });

      const smdInput = mountedContainer.querySelector("#resistorSmdInput");
      smdInput?.addEventListener("input", () => {
        state.smdCode = smdInput.value;
        render();
      });

      mountedContainer.querySelectorAll("[data-smd-example]").forEach((button) => {
        button.addEventListener("click", () => {
          state.smdCode = button.getAttribute("data-smd-example") || "";
          render();
        });
      });

      mountedContainer.querySelectorAll("[data-combo-index]").forEach((input) => {
        input.addEventListener("input", () => {
          const index = Number(input.getAttribute("data-combo-index"));
          state.combinationInputs[index] = input.value;
          render();
        });
      });
    }

    return {
      viewKey: "tool_resistor_calculator",
      eyebrow: "Elektronika",
      title: "Resistor Kalkulator",
      subtitle: "Decoder resistor warna, kode SMD, dan kalkulator seri paralel dalam satu halaman.",
      items: [],
      async mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
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
  globalScope.teknisiHubPages.resistorCalculator = createApi();
})(window);
