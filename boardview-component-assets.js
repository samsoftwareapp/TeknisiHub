(function initializeBoardviewComponentAssets(globalScope) {
  const assets = [
    {
      key: "mount-hole",
      label: "Mounting Hole",
      matchKinds: ["hole"],
      matchers: [/STAND-OFF|MOUNT|HOLE|MH\d|H\d/],
      body: { type: "circle", radius: 0.5 },
      detail: { type: "circle", radius: 0.26 }
    },
    {
      key: "test-pad",
      label: "Test Pad",
      matchKinds: ["passive", "chip"],
      matchers: [/^TP\d|TEST PAD|TESTPAD/],
      body: { type: "circle", radius: 0.38 }
    },
    {
      key: "passive-inline",
      label: "Passive 2-Pin",
      matchKinds: ["passive"],
      matchers: [/0603|0402|0805|1206|^(R|PR|C|PC|L|PL|FB)\d/],
      body: { type: "capsule" }
    },
    {
      key: "diode-inline",
      label: "Diode / LED",
      matchKinds: ["passive"],
      matchers: [/^(D|PD|LED)\d|SOD|SCHOTTKY|ZENNER/],
      body: { type: "capsule", cornerRatio: 0.4 }
    },
    {
      key: "jumper-inline",
      label: "Jumper",
      matchKinds: ["jumper", "passive"],
      matchers: [/JUMPER|^JP\d/],
      body: { type: "capsule", cornerRatio: 0.34 }
    },
    {
      key: "connector-rail",
      label: "Connector Rail",
      matchKinds: ["connector", "rail"],
      matchers: [/SMARTMATRIX|ESP32|HEADER|^J\d|^CN\d|CONN|1X\d|2X\d|PORT|FPC|FFC/],
      body: { type: "rail", cornerRatio: 0.16 }
    },
    {
      key: "socket-slot",
      label: "Socket / Slot",
      matchKinds: ["socket", "rail"],
      matchers: [/MICROSD|SOCKET|SLOT|M\.2|NGFF/],
      body: { type: "rounded-rect", cornerRatio: 0.16 },
      detail: { type: "rounded-rect", widthRatio: 0.68, heightRatio: 0.48, cornerRatio: 0.1 }
    },
    {
      key: "triad-sot",
      label: "Triad / SOT",
      matchKinds: ["triad"],
      matchers: [/^Q\d|^PQ\d|MOS|TRANS|SOT23|SOT-23|REG|LDO/],
      body: { type: "trapezoid", taperRatio: 0.78 }
    },
    {
      key: "chip-bga",
      label: "BGA / Controller",
      matchKinds: ["chip", "elongated-chip"],
      matchers: [/BGA|CPU|PCH|KBC|EC|SIO|ITE|ENE|MEC|KB\d/],
      body: { type: "rounded-rect", cornerRatio: 0.12 }
    },
    {
      key: "chip-elongated",
      label: "Elongated Chip",
      matchKinds: ["elongated-chip", "chip"],
      matchers: [/SO16|TSSOP|QFN|QFP|TQFP|SSOP|SOIC|TSOP/],
      body: { type: "rounded-rect", cornerRatio: 0.14 }
    },
    {
      key: "chip-generic",
      label: "Generic Chip",
      matchKinds: ["chip"],
      matchers: [/^U\d|^PU\d|^IC\d|CHIP|CTRL|AMP|ROM|FLASH/],
      body: { type: "rounded-rect", cornerRatio: 0.18 }
    }
  ];

  globalScope.__TEKNISIHUB_BOARDVIEW_COMPONENT_ASSETS__ = {
    version: "2026-05-03",
    assets
  };
})(window);
