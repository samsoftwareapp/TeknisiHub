(function initializeBatteryUnlockPage(globalScope) {
  const serviceBaseUrl = globalScope.resolveTeknisiHubServiceBaseUrl();
  const usbDeviceType = "TEKNISIHUB_DEVICE_USB";
  const wifiDeviceType = "TEKNISIHUB_DEVICE_WIFI";
  const defaultSampleRateHz = 2000000;
  const maxSampleRateHz = 10000000;
  const minimumMonitorDecodeRateHz = 1000000;
  const busDetectRequestTimeoutMs = 30000;
  const directMonitorRequestTimeoutMs = 12000;
  const directMonitorProbeTimeoutMs = 12000;
  const directMonitorSlowReadMs = 15000;
  const recoverySmbusCommandTimeoutMs = 22000;
  const recoveryStatusTimeoutMs = 35000;
  const recoveryLongOperationTimeoutMs = 95000;
  const batteryChipDecodeRules = {
    "0550": {
      chip: "BQ30Z55",
      family: "BQ30",
      catalogFamilyId: "bq30z554-family"
    }
  };
  let activeBatteryOperationSignal = null;
  const sampleRateOptionsHz = [
    100000,
    250000,
    500000,
    1000000,
    2000000,
    4000000,
    8000000,
    maxSampleRateHz
  ];
  const defaultState = {
    activeTab: "monitor",
    deviceType: usbDeviceType,
    busy: false,
    database: null,
    selectedCatalogFamilyId: "bq30z554-family",
    selectedProfileId: "bq30z554-family",
    selectedActionId: "universal-read-info",
    isolatedConfirmed: false,
    writeConfirmed: false,
    smbusOperation: "read-word",
    smbusAddress: "0x0B",
    smbusCommand: "0x08",
    smbusDataHex: "",
    smbusReadLength: 2,
    smbusPinMode: "auto",
    smbusSpeedMode: "auto",
    busDetected: false,
    busPinMode: "",
    busDeviceName: "",
    busDetectRawHex: "",
    busDetectMessage: "Detek SCL/SDA belum dijalankan.",
    busDetectedAt: "",
    busChip: "",
    busChipFamily: "",
    busChipManufacturer: "",
    busChipNotes: "",
    busChipUpdatedAt: "",
    busChipUpdatedBy: "",
    busChipCanEdit: false,
    busChipDatabaseHash: "",
    busChipMessage: "Chip/IC belum diprobe.",
    smbusRequireIdle: false,
    smbusScanAddresses: true,
    monitorSampleRateHz: defaultSampleRateHz,
    monitorMessage: "Monitor pasif siap.",
    pinoutBrand: "HP",
    pinoutPartNumber: "",
    pinoutResult: null,
    pinoutMessage: "Pinout finder siap.",
    apiMessage: "",
    recoveryMessage: "",
    metrics: {},
    monitorRows: [],
    monitorMode: "idle",
    captureInfo: {},
    monitorRunning: false,
    bq30CellCheckRunning: false,
    bq30CellCheckCycle: 0,
    transactions: [],
    busFrames: [],
    rawRows: [],
    smbusResult: null,
    smbusDiagnostic: null,
    smbusGaugeProbe: null,
    recoveryPreview: null,
    bq30RecoveryRows: [],
    bq30TargetBalanceDeltaMv: 30,
    bq30TargetLevelPercent: 100,
    bq30TargetHealthPercent: 100,
    dataMessage: "Data tools siap.",
    dataBackup: null,
    dataImportedBackup: null,
    dataImportVerified: false,
    dataRows: [],
    dataFileName: ""
  };
  const monitorPollDelayMs = 160;

  const monitorParameters = [
    { key: "manufacturerAccess", label: "Manufacturer Access", command: "0x00", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "manufacturerName", label: "Manufacturer Name", command: "0x20", operation: "read-block", readLength: 33, unit: "" },
    { key: "deviceName", label: "Device Name", command: "0x21", operation: "read-block", readLength: 33, unit: "" },
    { key: "deviceChemistry", label: "Device Chemistry", command: "0x22", operation: "read-block", readLength: 33, unit: "" },
    { key: "manufacturerData", label: "Manufacturer Data", command: "0x23", operation: "read-block", readLength: 33, unit: "" },
    { key: "remainingCapacityAlarm", label: "Remaining Cap Alarm", command: "0x01", operation: "read-word", readLength: 2, unit: "mAh" },
    { key: "remainingTimeAlarm", label: "Remaining Time Alarm", command: "0x02", operation: "read-word", readLength: 2, unit: "min" },
    { key: "batteryMode", label: "Battery Mode", command: "0x03", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "atRate", label: "At Rate", command: "0x04", operation: "read-word", readLength: 2, unit: "mA" },
    { key: "atRateTimeToFull", label: "At Rate Time To Full", command: "0x05", operation: "read-word", readLength: 2, unit: "min" },
    { key: "atRateTimeToEmpty", label: "At Rate Time To Empty", command: "0x06", operation: "read-word", readLength: 2, unit: "min" },
    { key: "atRateOk", label: "At Rate OK", command: "0x07", operation: "read-word", readLength: 2, unit: "" },
    { key: "temperature", label: "Temperature", command: "0x08", operation: "read-word", readLength: 2, unit: "C" },
    { key: "voltage", label: "Voltage", command: "0x09", operation: "read-word", readLength: 2, unit: "mV" },
    { key: "current", label: "Current", command: "0x0A", operation: "read-word", readLength: 2, unit: "mA" },
    { key: "averageCurrent", label: "Average Current", command: "0x0B", operation: "read-word", readLength: 2, unit: "mA" },
    { key: "maxError", label: "MaxError", command: "0x0C", operation: "read-word", readLength: 2, unit: "%" },
    { key: "relativeSoc", label: "RSoC", command: "0x0D", operation: "read-word", readLength: 2, unit: "%" },
    { key: "absoluteSoc", label: "ASoC", command: "0x0E", operation: "read-word", readLength: 2, unit: "%" },
    { key: "remainingCapacity", label: "Remaining Capacity", command: "0x0F", operation: "read-word", readLength: 2, unit: "mAh" },
    { key: "fullChargeCapacity", label: "Full Charge Capacity", command: "0x10", operation: "read-word", readLength: 2, unit: "mAh" },
    { key: "runTimeToEmpty", label: "Run Time To Empty", command: "0x11", operation: "read-word", readLength: 2, unit: "min" },
    { key: "averageTimeToEmpty", label: "Average Time To Empty", command: "0x12", operation: "read-word", readLength: 2, unit: "min" },
    { key: "averageTimeToFull", label: "Average Time To Full", command: "0x13", operation: "read-word", readLength: 2, unit: "min" },
    { key: "chargingCurrent", label: "Charging Current", command: "0x14", operation: "read-word", readLength: 2, unit: "mA" },
    { key: "chargingVoltage", label: "Charging Voltage", command: "0x15", operation: "read-word", readLength: 2, unit: "mV" },
    { key: "batteryStatus", label: "Battery Status", command: "0x16", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "cycleCount", label: "Cycle Count", command: "0x17", operation: "read-word", readLength: 2, unit: "" },
    { key: "designCapacity", label: "Design Capacity", command: "0x18", operation: "read-word", readLength: 2, unit: "mAh" },
    { key: "designVoltage", label: "Design Voltage", command: "0x19", operation: "read-word", readLength: 2, unit: "mV" },
    { key: "manufactureDate", label: "Manufacture Date", command: "0x1B", operation: "read-word", readLength: 2, unit: "" },
    { key: "serialNumber", label: "Serial Number", command: "0x1C", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "cellVoltage1", label: "Cell Voltage 1", command: "0x3F", operation: "read-word", readLength: 2, unit: "mV" },
    { key: "cellVoltage2", label: "Cell Voltage 2", command: "0x3E", operation: "read-word", readLength: 2, unit: "mV" },
    { key: "cellVoltage3", label: "Cell Voltage 3", command: "0x3D", operation: "read-word", readLength: 2, unit: "mV" },
    { key: "cellVoltage4", label: "Cell Voltage 4", command: "0x3C", operation: "read-word", readLength: 2, unit: "mV" },
    { key: "renesas045SafetyAlert", label: "045A20 Safety Alert", command: "0x50", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "renesas045SafetyStatus", label: "045A20 Safety Status", command: "0x51", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "renesas045PfAlert", label: "045A20 PF Alert", command: "0x52", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "renesas045PfStatus", label: "045A20 PF Status", command: "0x53", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "renesas045OperationStatus", label: "045A20 Operation Status", command: "0x54", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "bq30Security", label: "BQ30 Security / SEC", unit: "", sourceEndpoint: "bq30/status", chipFamily: "BQ30" },
    { key: "bq30FetStatus", label: "BQ30 FET", unit: "", sourceEndpoint: "bq30/status", chipFamily: "BQ30" },
    { key: "bq30PfStatus", label: "BQ30 PF Status", unit: "hex", sourceEndpoint: "bq30/status", chipFamily: "BQ30" },
    { key: "bq30SafetyStatus", label: "BQ30 Safety Status", unit: "hex", sourceEndpoint: "bq30/status", chipFamily: "BQ30" },
    { key: "bq40Security", label: "BQ40 Security / SEC", unit: "", sourceEndpoint: "bq40/status", chipFamily: "BQ40" },
    { key: "bq40FetStatus", label: "BQ40 FET", unit: "", sourceEndpoint: "bq40/status", chipFamily: "BQ40" },
    { key: "bq40PfStatus", label: "BQ40 PF Status", unit: "hex", sourceEndpoint: "bq40/status", chipFamily: "BQ40" },
    { key: "bq40SafetyStatus", label: "BQ40 Safety Status", unit: "hex", sourceEndpoint: "bq40/status", chipFamily: "BQ40" },
    { key: "cellsBalance", label: "Cells Balance", unit: "", sourceDerived: "cell-voltage-delta" },
    { key: "maxImbalance", label: "Max Imbalance", unit: "mV", sourceDerived: "cell-voltage-delta" }
  ];

  const isSbsMonitorCommand = (parameter) => {
    const command = Number.parseInt(String(parameter?.command || "").replace(/^0x/i, ""), 16);
    return Number.isFinite(command) && command <= 0x23;
  };

  const directMonitorCommands = monitorParameters.filter((item) => item.command && isSbsMonitorCommand(item));

  const dataBackupReadPlan = [
    { label: "Manufacturer Name", command: "0x20", operation: "read-block", readLength: 33, identity: true },
    { label: "Device Name", command: "0x21", operation: "read-block", readLength: 33, identity: true },
    { label: "Device Chemistry", command: "0x22", operation: "read-block", readLength: 33, identity: true },
    { label: "Manufacturer Data", command: "0x23", operation: "read-block", readLength: 33 },
    { label: "Remaining Capacity Alarm", command: "0x01", operation: "read-word", readLength: 2, restoreSupported: true },
    { label: "Remaining Time Alarm", command: "0x02", operation: "read-word", readLength: 2, restoreSupported: true },
    { label: "Battery Mode", command: "0x03", operation: "read-word", readLength: 2, restoreSupported: true },
    { label: "At Rate", command: "0x04", operation: "read-word", readLength: 2, restoreSupported: true },
    { label: "Temperature", command: "0x08", operation: "read-word", readLength: 2 },
    { label: "Voltage", command: "0x09", operation: "read-word", readLength: 2 },
    { label: "Current", command: "0x0A", operation: "read-word", readLength: 2 },
    { label: "Average Current", command: "0x0B", operation: "read-word", readLength: 2 },
    { label: "Relative SOC", command: "0x0D", operation: "read-word", readLength: 2 },
    { label: "Remaining Capacity", command: "0x0F", operation: "read-word", readLength: 2 },
    { label: "Full Charge Capacity", command: "0x10", operation: "read-word", readLength: 2 },
    { label: "Battery Status", command: "0x16", operation: "read-word", readLength: 2 },
    { label: "Cycle Count", command: "0x17", operation: "read-word", readLength: 2 },
    { label: "Design Capacity", command: "0x18", operation: "read-word", readLength: 2 },
    { label: "Design Voltage", command: "0x19", operation: "read-word", readLength: 2 },
    { label: "Manufacture Date", command: "0x1B", operation: "read-word", readLength: 2 },
    { label: "Serial Number", command: "0x1C", operation: "read-word", readLength: 2 },
    { label: "Cell Voltage 1", command: "0x3F", operation: "read-word", readLength: 2 },
    { label: "Cell Voltage 2", command: "0x3E", operation: "read-word", readLength: 2 },
    { label: "Cell Voltage 3", command: "0x3D", operation: "read-word", readLength: 2 },
    { label: "Cell Voltage 4", command: "0x3C", operation: "read-word", readLength: 2 }
  ];

  const bq30AfterCellReplaceReadPlan = [
    { key: "temperature", label: "Temperature", command: "0x08", operation: "read-word", readLength: 2 },
    { key: "voltage", label: "Voltage", command: "0x09", operation: "read-word", readLength: 2 },
    { key: "current", label: "Current", command: "0x0A", operation: "read-word", readLength: 2 },
    { key: "averageCurrent", label: "Average Current", command: "0x0B", operation: "read-word", readLength: 2 },
    { key: "relativeSoc", label: "RSoC", command: "0x0D", operation: "read-word", readLength: 2 },
    { key: "remainingCapacity", label: "Remaining Capacity", command: "0x0F", operation: "read-word", readLength: 2 },
    { key: "fullChargeCapacity", label: "Full Charge Capacity", command: "0x10", operation: "read-word", readLength: 2 },
    { key: "batteryStatus", label: "Battery Status", command: "0x16", operation: "read-word", readLength: 2 },
    { key: "cycleCount", label: "Cycle Count", command: "0x17", operation: "read-word", readLength: 2 },
    { key: "designCapacity", label: "Design Capacity", command: "0x18", operation: "read-word", readLength: 2 },
    { key: "designVoltage", label: "Design Voltage", command: "0x19", operation: "read-word", readLength: 2 },
    { key: "cellVoltage1", label: "Cell Voltage 1", command: "0x3F", operation: "read-word", readLength: 2 },
    { key: "cellVoltage2", label: "Cell Voltage 2", command: "0x3E", operation: "read-word", readLength: 2 },
    { key: "cellVoltage3", label: "Cell Voltage 3", command: "0x3D", operation: "read-word", readLength: 2 },
    { key: "cellVoltage4", label: "Cell Voltage 4", command: "0x3C", operation: "read-word", readLength: 2 },
    { key: "renesas045SafetyAlert", label: "045A20 Safety Alert", command: "0x50", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "renesas045SafetyStatus", label: "045A20 Safety Status", command: "0x51", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "renesas045PfAlert", label: "045A20 PF Alert", command: "0x52", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "renesas045PfStatus", label: "045A20 PF Status", command: "0x53", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "renesas045OperationStatus", label: "045A20 Operation Status", command: "0x54", operation: "read-word", readLength: 2, unit: "hex" }
  ];

  const bq30FetRecoveryCommands = [
    { label: "FET Control", subCommand: "0x22" },
    { label: "Charge FET", subCommand: "0x1F" },
    { label: "Discharge FET", subCommand: "0x20" }
  ];

  const bq30PfRecoveryCommands = [
    { label: "Permanent Failure", subCommand: "0x24" },
    { label: "PF Data Reset", subCommand: "0x29" }
  ];

  const bq30CalibrationTrigger = {
    label: "Refresh Gauge / Relearn Trigger",
    command: "0x00",
    subCommand: "0x0041",
    dataHex: "41 00",
    settleMs: 1500
  };

  const universalRecoveryOperations = [
    { id: "universal-read-info", name: "Read Info", kind: "universal-read-info", order: 1, target: "Read Info" },
    { id: "universal-read-status", name: "Read Status", kind: "universal-read-status", order: 2, target: "Read Status" },
    { id: "universal-scan-commands", name: "Scan Commands", kind: "universal-scan-commands", order: 3, target: "Scan Commands" },
    { id: "universal-check-cells", name: "Check Cells", kind: "universal-check-cells", order: 4, target: "Check Cells" },
    { id: "universal-protection-status", name: "Protection Status", kind: "universal-protection-status", order: 5, target: "Protection Status" },
    { id: "universal-clear-protection", name: "Clear Protection", kind: "universal-clear-protection", order: 6, target: "Clear Protection" },
    { id: "universal-full-access", name: "Full Access", kind: "universal-full-access", order: 7, target: "Full Access" },
    { id: "universal-unlock-fet", name: "Unlock FET", kind: "universal-unlock-fet", order: 8, target: "Unlock FET" },
    { id: "universal-refresh-gauge", name: "Refresh Gauge / Relearn", kind: "universal-refresh-gauge", order: 9, target: "Refresh Gauge / Relearn" }
  ];

  const universalReadInfoPlan = [
    { key: "manufacturerName", label: "Manufacturer", command: "0x20", operation: "read-block", readLength: 33 },
    { key: "deviceName", label: "Device Name", command: "0x21", operation: "read-block", readLength: 33 },
    { key: "serialNumber", label: "Serial Number", command: "0x1C", operation: "read-word", readLength: 2 },
    { key: "deviceChemistry", label: "Chemistry", command: "0x22", operation: "read-block", readLength: 33 },
    { key: "designCapacity", label: "Design Capacity", command: "0x18", operation: "read-word", readLength: 2 },
    { key: "designVoltage", label: "Design Voltage", command: "0x19", operation: "read-word", readLength: 2 }
  ];

  const universalReadStatusPlan = [
    { key: "voltage", label: "Voltage", command: "0x09", operation: "read-word", readLength: 2 },
    { key: "current", label: "Current", command: "0x0A", operation: "read-word", readLength: 2 },
    { key: "remainingCapacity", label: "Remaining Capacity", command: "0x0F", operation: "read-word", readLength: 2 },
    { key: "fullChargeCapacity", label: "Full Charge Capacity", command: "0x10", operation: "read-word", readLength: 2 },
    { key: "temperature", label: "Temperature", command: "0x08", operation: "read-word", readLength: 2 },
    { key: "batteryStatus", label: "Battery Status", command: "0x16", operation: "read-word", readLength: 2 },
    { key: "relativeSoc", label: "RSoC", command: "0x0D", operation: "read-word", readLength: 2 }
  ];

  const universalCellReadPlan = [
    { key: "cellVoltage1", label: "Cell 1 Voltage", command: "0x3F", operation: "read-word", readLength: 2 },
    { key: "cellVoltage2", label: "Cell 2 Voltage", command: "0x3E", operation: "read-word", readLength: 2 },
    { key: "cellVoltage3", label: "Cell 3 Voltage", command: "0x3D", operation: "read-word", readLength: 2 },
    { key: "cellVoltage4", label: "Cell 4 Voltage", command: "0x3C", operation: "read-word", readLength: 2 }
  ];

  const universalProtectionReadPlan = [
    { key: "batteryStatus", label: "Battery Status", command: "0x16", operation: "read-word", readLength: 2 },
    { key: "manufacturerAccess", label: "Manufacturer Access", command: "0x00", operation: "read-word", readLength: 2 }
  ];

  const renesas045A20StatusReadPlan = [
    { key: "renesas045ManufacturerAccess", label: "045A20 Manufacturer Access", command: "0x00", operation: "read-word", readLength: 2 },
    { key: "manufacturerName", label: "Manufacturer Name", command: "0x20", operation: "read-block", readLength: 33 },
    { key: "deviceName", label: "Device Name", command: "0x21", operation: "read-block", readLength: 33 },
    { key: "deviceChemistry", label: "Device Chemistry", command: "0x22", operation: "read-block", readLength: 33 },
    { key: "temperature", label: "Temperature", command: "0x08", operation: "read-word", readLength: 2 },
    { key: "voltage", label: "Voltage", command: "0x09", operation: "read-word", readLength: 2 },
    { key: "current", label: "Current", command: "0x0A", operation: "read-word", readLength: 2 },
    { key: "averageCurrent", label: "Average Current", command: "0x0B", operation: "read-word", readLength: 2 },
    { key: "relativeSoc", label: "RSoC", command: "0x0D", operation: "read-word", readLength: 2 },
    { key: "remainingCapacity", label: "Remaining Capacity", command: "0x0F", operation: "read-word", readLength: 2 },
    { key: "fullChargeCapacity", label: "Full Charge Capacity", command: "0x10", operation: "read-word", readLength: 2 },
    { key: "batteryStatus", label: "Battery Status", command: "0x16", operation: "read-word", readLength: 2 },
    { key: "cycleCount", label: "Cycle Count", command: "0x17", operation: "read-word", readLength: 2 },
    { key: "designCapacity", label: "Design Capacity", command: "0x18", operation: "read-word", readLength: 2 },
    { key: "designVoltage", label: "Design Voltage", command: "0x19", operation: "read-word", readLength: 2 },
    { key: "cellVoltage1", label: "Cell Voltage 1", command: "0x3F", operation: "read-word", readLength: 2 },
    { key: "cellVoltage2", label: "Cell Voltage 2", command: "0x3E", operation: "read-word", readLength: 2 },
    { key: "cellVoltage3", label: "Cell Voltage 3", command: "0x3D", operation: "read-word", readLength: 2 },
    { key: "cellVoltage4", label: "Cell Voltage 4", command: "0x3C", operation: "read-word", readLength: 2 }
  ];

  const renesas045A20ExtendedStatusReadPlan = [
    { key: "renesas045SafetyAlert", label: "Safety Alert", command: "0x50", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "renesas045SafetyStatus", label: "Safety Status", command: "0x51", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "renesas045PfAlert", label: "PF Alert", command: "0x52", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "renesas045PfStatus", label: "PF Status", command: "0x53", operation: "read-word", readLength: 2, unit: "hex" },
    { key: "renesas045OperationStatus", label: "Operation Status", command: "0x54", operation: "read-word", readLength: 2, unit: "hex" }
  ];

  const renesas045A20UnlockCandidateCommands = [
    { label: "PF Clear key A", subCommand: "0x2673", mode: "ma-word" },
    { label: "PF Clear key B", subCommand: "0x1712", mode: "ma-word" },
    { label: "FET Control", subCommand: "0x0046", mode: "ma-word" },
    { label: "PF Data Reset", subCommand: "0x0029", mode: "ma-word" },
    { label: "Charge FET", subCommand: "0x001F", mode: "ma-word" },
    { label: "Discharge FET", subCommand: "0x0020", mode: "ma-word" },
    { label: "PF Clear key A + PEC", subCommand: "0x2673", mode: "ma-word-pec" },
    { label: "PF Clear key B + PEC", subCommand: "0x1712", mode: "ma-word-pec" }
  ];

  const renesas045A20IdentityProbePlan = [
    { key: "manufacturerName", label: "Manufacturer Name", command: "0x20", operation: "read-block", readLength: 33 },
    { key: "deviceName", label: "Device Name", command: "0x21", operation: "read-block", readLength: 33 },
    { key: "deviceChemistry", label: "Device Chemistry", command: "0x22", operation: "read-block", readLength: 33 },
    { label: "Manufacturer Data", command: "0x23", operation: "read-block", readLength: 33 },
    { label: "Optional Mfg Function 5", command: "0x2F", operation: "read-block", readLength: 33 }
  ];

  const renesas045A20ManufacturerProbePlan = [
    { key: "manufacturerAccess", label: "Manufacturer Access", command: "0x00", operation: "read-word", readLength: 2 },
    { key: "batteryStatus", label: "Battery Status", command: "0x16", operation: "read-word", readLength: 2 },
    { label: "Manufacturer Data", command: "0x23", operation: "read-block", readLength: 33 },
    { label: "Optional Mfg Function 5", command: "0x2F", operation: "read-block", readLength: 33 },
    { key: "cellVoltage4", label: "Cell Voltage 4", command: "0x3C", operation: "read-word", readLength: 2 },
    { key: "cellVoltage3", label: "Cell Voltage 3", command: "0x3D", operation: "read-word", readLength: 2 },
    { key: "cellVoltage2", label: "Cell Voltage 2", command: "0x3E", operation: "read-word", readLength: 2 },
    { key: "cellVoltage1", label: "Cell Voltage 1", command: "0x3F", operation: "read-word", readLength: 2 }
  ];

  const commandLabels = {
    0x00: "Manufacturer Access",
    0x08: "Temperature",
    0x09: "Voltage",
    0x0A: "Current",
    0x0B: "Average Current",
    0x0D: "Relative SOC",
    0x0E: "Absolute SOC",
    0x16: "Battery Status",
    0x20: "Manufacturer Name",
    0x21: "Device Name",
    0x22: "Device Chemistry",
    0x23: "Manufacturer Data",
    0x2F: "Manufacturer Input",
    0x3C: "Cell Voltage 4",
    0x3D: "Cell Voltage 3",
    0x3E: "Cell Voltage 2",
    0x3F: "Cell Voltage 1",
    0x50: "Safety Alert",
    0x51: "Safety Status",
    0x52: "PF Alert",
    0x53: "PF Status",
    0x54: "Operation Status",
    0x55: "Charging Status",
    0x56: "Gauging Status",
    0x57: "Manufacturing Status"
  };

  const batteryPinoutBrands = [
    "Acer",
    "Apple",
    "Asus",
    "Clevo",
    "Dell",
    "eMachines",
    "Fujitsu",
    "Gateway",
    "Gigabyte",
    "Hansung",
    "HP",
    "Lenovo",
    "LG",
    "Medion",
    "Microsoft",
    "MSI",
    "NEC",
    "Packard Bell",
    "Samsung",
    "Sony",
    "Toshiba"
  ];

  const batteryPinoutLegend = [
    ["-", "GND"],
    ["+", "Vbat"],
    ["C", "Clock"],
    ["D", "Data"],
    ["T", "System Present/GND"],
    ["X", "GAP/Missing"]
  ];

  const batteryPinoutRecords = [
    {
      brand: "Dell",
      partNumbers: ["DELL-9PIN-EXAMPLE"],
      displayPartNumber: "Dell 9-pin example",
      pinCount: 9,
      code: "-1,T4,D6,C7,+9",
      source: "Reference example",
      pins: [
        { pin: "Pin1", signal: "GND", symbol: "-" },
        { pin: "Pin4", signal: "System Present/GND", symbol: "T" },
        { pin: "Pin6", signal: "Data", symbol: "D" },
        { pin: "Pin7", signal: "Clock", symbol: "C" },
        { pin: "Pin9", signal: "Vbat", symbol: "+" }
      ]
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

  async function fetchJson(path, options = {}) {
    const { timeoutMs, signal, ...fetchOptions } = options;
    const effectiveSignal = signal ||
      (path.startsWith("/tools/battery-unlock/") && !path.endsWith("/reset")
        ? activeBatteryOperationSignal
        : null);
    const controller = timeoutMs ? new AbortController() : null;
    const timeoutId = controller
      ? window.setTimeout(() => controller.abort(), timeoutMs)
      : null;
    if (controller && effectiveSignal) {
      if (effectiveSignal.aborted) {
        controller.abort();
      } else {
        effectiveSignal.addEventListener("abort", () => controller.abort(), { once: true });
      }
    }
    try {
      const response = await fetch(`${serviceBaseUrl}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...fetchOptions,
        signal: controller?.signal || effectiveSignal
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
    } catch (error) {
      if (effectiveSignal?.aborted) {
        const abortError = new Error("Request dibatalkan.");
        abortError.name = "AbortError";
        throw abortError;
      }
      if (controller?.signal?.aborted) {
        throw new Error("Request timeout. Periksa koneksi/device lalu coba lagi.");
      }
      throw error;
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }
  }

  function formatNumber(value, digits = 0) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return "-";
    }
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(number);
  }

  function parseHexByte(value, fallback = 0) {
    const text = String(value ?? "").trim();
    if (!text) {
      return fallback;
    }
    const normalized = text.startsWith("0x") || text.startsWith("0X") ? text.slice(2) : text;
    const parsed = Number.parseInt(normalized, 16);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 0xFF ? parsed : fallback;
  }

  function signed16(value) {
    const word = value & 0xFFFF;
    return word >= 0x8000 ? word - 0x10000 : word;
  }

  function hex(value, digits = 2) {
    return `0x${Number(value || 0).toString(16).toUpperCase().padStart(digits, "0")}`;
  }

  function byteBits(value) {
    return Number(value || 0).toString(2).padStart(8, "0");
  }

  function delay(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function abortableDelay(ms, signal = null) {
    return new Promise((resolve) => {
      if (signal?.aborted) {
        resolve();
        return;
      }
      const timeoutId = window.setTimeout(resolve, ms);
      signal?.addEventListener("abort", () => {
        window.clearTimeout(timeoutId);
        resolve();
      }, { once: true });
    });
  }

  function formatRate(value) {
    const rate = Number(value || 0);
    if (!Number.isFinite(rate) || rate <= 0) {
      return "-";
    }
    if (rate >= 1000000) {
      return `${formatNumber(rate / 1000000, rate % 1000000 === 0 ? 0 : 2)} MHz`;
    }
    if (rate >= 1000) {
      return `${formatNumber(rate / 1000, rate % 1000 === 0 ? 0 : 1)} kHz`;
    }
    return `${formatNumber(rate)} Hz`;
  }

  function normalizeSampleRateHz(value) {
    const rate = Number(value);
    if (!Number.isFinite(rate)) {
      return defaultSampleRateHz;
    }
    return sampleRateOptionsHz.reduce((best, candidate) => (
      Math.abs(candidate - rate) < Math.abs(best - rate) ? candidate : best
    ), sampleRateOptionsHz[0]);
  }

  function normalizeMonitorSampleRateHz(value) {
    const rate = normalizeSampleRateHz(value);
    return rate < minimumMonitorDecodeRateHz ? defaultSampleRateHz : rate;
  }

  function formatMonitorSampleRateOption(rate) {
    return rate < minimumMonitorDecodeRateHz
      ? `${formatRate(rate)} (raw only)`
      : formatRate(rate);
  }

  function normalizePinOrder(value) {
    const text = String(value || "").trim().toLowerCase();
    return text === "normal" || text === "swap" ? text : "unknown";
  }

  function formatPinOrder(info = {}) {
    const order = normalizePinOrder(info.pinOrder);
    if (order === "normal") {
      return info.pinOrderLocked ? "SDA/SCL NORMAL" : "NORMAL CHECK";
    }
    if (order === "swap") {
      return info.pinOrderLocked ? "SDA/SCL SWAP" : "SWAP CHECK";
    }
    return "SDA/SCL DETECT";
  }

  function formatDeviceName(deviceType) {
    return deviceType === wifiDeviceType ? "TEKNISIHUB_DEVICE WIFI" : "TEKNISIHUB_DEVICE USB";
  }

  function normalizePinoutText(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  function findBatteryPinoutRecord(brand, partNumber) {
    const selectedBrand = String(brand || "").trim().toLowerCase();
    const normalizedPart = normalizePinoutText(partNumber);
    return batteryPinoutRecords.find((record) => {
      if (String(record.brand || "").trim().toLowerCase() !== selectedBrand) {
        return false;
      }
      if (!normalizedPart) {
        return false;
      }
      return (record.partNumbers || []).some((part) => normalizePinoutText(part) === normalizedPart);
    }) || null;
  }

  function runLocalPinoutLookup(state) {
    const record = findBatteryPinoutRecord(state.pinoutBrand, state.pinoutPartNumber);
    if (record) {
      return {
        pinoutResult: record,
        pinoutMessage: `${record.brand} ${record.displayPartNumber || state.pinoutPartNumber}: ${record.code}`
      };
    }
    return {
      pinoutResult: null,
      pinoutMessage: state.pinoutPartNumber.trim()
        ? "Pinout belum ada di database lokal."
        : "Isi part number baterai dulu."
    };
  }

  function createInitialMetrics() {
    return {
      temperature: "-",
      voltage: "-",
      current: "-",
      averageCurrent: "-",
      relativeSoc: "-",
      batteryStatus: "-"
    };
  }

  function parseHexBytes(value) {
    return String(value || "")
      .trim()
      .split(/\s+/)
      .map((item) => Number.parseInt(item, 16))
      .filter((item) => Number.isFinite(item) && item >= 0 && item <= 0xFF);
  }

  function decodeBlockText(bytes) {
    if (!bytes.length) {
      return "-";
    }
    const count = Math.min(bytes[0] || 0, bytes.length - 1);
    if (count <= 0) {
      return "-";
    }
    return bytes
      .slice(1, 1 + count)
      .map((byte) => (byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ""))
      .join("")
      .trim() || "-";
  }

  function isValidDeviceName(value) {
    const text = String(value || "").trim();
    return text.length >= 2 && text !== "-" && /[A-Za-z0-9]/.test(text);
  }

  function hasBatteryBusLock(state) {
    return Boolean(state?.busDetected && (state.busPinMode === "normal" || state.busPinMode === "swap"));
  }

  function lockedBatteryPinMode(state) {
    return hasBatteryBusLock(state) ? state.busPinMode : "auto";
  }

  function batteryBusLockLabel(state) {
    if (!hasBatteryBusLock(state)) {
      return "SCL/SDA belum detek";
    }
    return `SCL/SDA ${String(state.busPinMode || "").toUpperCase()} locked`;
  }

  function batteryChipInfoLabel(state) {
    const chip = String(state.busChip || "").trim();
    const family = String(state.busChipFamily || "").trim();
    if (!chip) {
      return "Chip/IC belum ada di database";
    }
    return [chip, family].filter(Boolean).join(" / ");
  }

  function decodeManufactureDate(word) {
    const day = word & 0x1F;
    const month = (word >> 5) & 0x0F;
    const year = 1980 + ((word >> 9) & 0x7F);
    if (day <= 0 || month <= 0 || month > 12) {
      return hex(word, 4);
    }
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function decodeDirectMonitorValue(definition, readHex, fallback = "") {
    const bytes = parseHexBytes(readHex);
    const word = bytes.length >= 2 ? (bytes[0] | (bytes[1] << 8)) : 0;
    if (definition.operation === "read-block") {
      return decodeBlockText(bytes);
    }
    switch (definition.command) {
      case "0x08":
        return formatNumber(word / 10 - 273.15, 2);
      case "0x09":
        return formatNumber(word);
      case "0x0A":
      case "0x0B":
      case "0x14":
      case "0x04":
        return formatNumber(signed16(word));
      case "0x0D":
      case "0x0E":
      case "0x0C":
        return formatNumber(word);
      case "0x0F":
      case "0x10":
      case "0x18":
      case "0x01":
        return formatNumber(word);
      case "0x19":
      case "0x15":
      case "0x3C":
      case "0x3D":
      case "0x3E":
      case "0x3F":
      case "0x02":
      case "0x05":
      case "0x06":
      case "0x11":
      case "0x12":
      case "0x13":
      case "0x17":
        return word === 0xFFFF ? "N/A" : formatNumber(word);
      case "0x1B":
        return decodeManufactureDate(word);
      case "0x16":
      case "0x03":
      case "0x1A":
      case "0x1C":
      case "0x00":
      case "0x50":
      case "0x51":
      case "0x52":
      case "0x53":
      case "0x54":
        return hex(word, 4);
      case "0x07":
        return word === 0 ? "No" : "Yes";
      default:
        return fallback || (bytes.length ? hex(word, 4) : "-");
    }
  }

  function decodeDirectMonitorNumber(definition, readHex) {
    const bytes = parseHexBytes(readHex);
    const word = bytes.length >= 2 ? (bytes[0] | (bytes[1] << 8)) : null;
    if (word === null || word === 0xFFFF || definition.operation === "read-block") {
      return null;
    }
    if (definition.command === "0x08") {
      return word / 10 - 273.15;
    }
    if (["0x0A", "0x0B", "0x14", "0x04"].includes(definition.command)) {
      return signed16(word);
    }
    return word;
  }

  function directRowToMetrics(row) {
    const metrics = {};
    if (!row || row.status !== "OK") {
      return metrics;
    }
    const unit = row.unit ? ` ${row.unit}` : "";
    if (row.key === "temperature") {
      metrics.temperature = `${row.value}${unit}`;
    } else if (row.key === "voltage") {
      metrics.voltage = `${row.value}${unit}`;
    } else if (row.key === "current") {
      metrics.current = `${row.value}${unit}`;
    } else if (row.key === "averageCurrent") {
      metrics.averageCurrent = `${row.value}${unit}`;
    } else if (row.key === "relativeSoc") {
      metrics.relativeSoc = `${row.value}${unit}`;
    } else if (row.key === "batteryStatus") {
      metrics.batteryStatus = row.value;
    }
    return metrics;
  }

  function bq30StatusToMonitorRows(status) {
    const securityMode = Number.isFinite(Number(status?.securityMode)) ? Number(status.securityMode) : null;
    const securityName = status?.securityModeName || "Unknown";
    const pfNames = Array.isArray(status?.activePermanentFailures) ? status.activePermanentFailures : [];
    return [
      {
        key: "bq30Security",
        source: "Direct",
        label: "BQ30 Security / SEC",
        command: "MA 0x54",
        value: securityMode === null ? "-" : `SEC=${securityMode} ${securityName}`,
        unit: "",
        raw: status?.operationStatusHex || "-",
        status: status?.success ? "OK" : "ERR",
        meta: "ManufacturerAccess -> ManufacturerData 0x23"
      },
      {
        key: "bq30FetStatus",
        source: "Direct",
        label: "BQ30 FET",
        command: "MA 0x54",
        value: `CHG=${status?.chargeFetOn ? "ON" : "OFF"} DSG=${status?.dischargeFetOn ? "ON" : "OFF"}`,
        unit: "",
        raw: status?.operationStatusHex || "-",
        status: status?.success ? "OK" : "ERR",
        meta: status?.permanentFailure ? "PF active" : "PF clear"
      },
      {
        key: "bq30PfStatus",
        source: "Direct",
        label: "BQ30 PF Status",
        command: "MA 0x53",
        value: status?.pfStatusHex || "-",
        unit: "hex",
        raw: status?.pfStatusHex || "-",
        status: pfNames.length ? pfNames.join(", ") : "OK",
        meta: pfNames.length ? "active PF" : "clear"
      },
      {
        key: "bq30SafetyStatus",
        source: "Direct",
        label: "BQ30 Safety Status",
        command: "MA 0x51",
        value: status?.safetyStatusHex || "-",
        unit: "hex",
        raw: status?.safetyStatusHex || "-",
        status: status?.safetyStatusHex === "0x00000000" ? "OK" : "ACTIVE",
        meta: "SafetyStatus"
      }
    ];
  }

  function bq40BackendRowToMonitorRow(row) {
    const numeric = Number(row?.value);
    return {
      key: row?.key || `bq40-${row?.command || "status"}`,
      source: "Recovery",
      label: row?.label || "BQ40 Status",
      command: row?.command || "-",
      value: row?.value || "-",
      unit: row?.unit || "",
      numeric: Number.isFinite(numeric) ? numeric : null,
      raw: row?.readHex || "-",
      status: row?.success ? row?.status || "OK" : row?.status || "ERR",
      meta: "BQ40 direct read"
    };
  }

  function bq40StatusToMonitorRows(status) {
    const securityMode = Number.isFinite(Number(status?.securityMode)) ? Number(status.securityMode) : null;
    const decoded = securityMode !== null && securityMode >= 0;
    const securityName = status?.securityModeName || "Unknown";
    const pfNames = Array.isArray(status?.activePermanentFailures) ? status.activePermanentFailures : [];
    const safetyNames = Array.isArray(status?.activeSafetyFlags) ? status.activeSafetyFlags : [];
    return [
      {
        key: "bq40Security",
        source: "Direct",
        label: "BQ40 Security / SEC",
        command: "0x54",
        value: decoded ? `SEC=${securityMode} ${securityName}` : "raw status only",
        unit: "",
        raw: status?.operationStatusHex || "-",
        status: decoded ? "OK" : status?.operationStatusHex ? "RAW" : "ERR",
        meta: "OperationStatus"
      },
      {
        key: "bq40FetStatus",
        source: "Direct",
        label: "BQ40 FET",
        command: "0x54",
        value: decoded ? `CHG=${status?.chargeFetOn ? "ON" : "OFF"} DSG=${status?.dischargeFetOn ? "ON" : "OFF"}` : "not decoded",
        unit: "",
        raw: status?.operationStatusHex || "-",
        status: decoded ? "OK" : status?.operationStatusHex ? "RAW" : "ERR",
        meta: decoded ? status?.permanentFailure ? "PF active" : "PF clear" : "raw fallback"
      },
      {
        key: "bq40PfStatus",
        source: "Direct",
        label: "BQ40 PF Status",
        command: "0x53",
        value: status?.pfStatusHex || "-",
        unit: "hex",
        raw: status?.pfStatusHex || "-",
        status: decoded ? pfNames.length ? pfNames.join(", ") : "OK" : status?.pfStatusHex ? "RAW" : "ERR",
        meta: decoded ? pfNames.length ? "active PF" : "clear" : "raw fallback"
      },
      {
        key: "bq40SafetyStatus",
        source: "Direct",
        label: "BQ40 Safety Status",
        command: "0x51",
        value: status?.safetyStatusHex || "-",
        unit: "hex",
        raw: status?.safetyStatusHex || "-",
        status: decoded ? safetyNames.length ? safetyNames.join(", ") : "OK" : status?.safetyStatusHex ? "RAW" : "ERR",
        meta: decoded ? safetyNames.length ? "active safety" : "clear" : "raw fallback"
      }
    ];
  }

  function decodeRenesas045A20ManufacturerAccess(readHex) {
    const bytes = parseHexBytes(readHex);
    if (bytes.length < 2) {
      return null;
    }
    const word = bytes[0] | (bytes[1] << 8);
    const fetCode = (word >> 14) & 0x03;
    const failureCode = (word >> 12) & 0x03;
    const chargeCode = (word >> 8) & 0x0F;
    const fetStatus = {
      0: "DSG=ON CHG=ON",
      1: "DSG=ON CHG=OFF",
      2: "DSG=OFF CHG=OFF",
      3: "DSG=OFF CHG=ON"
    }[fetCode] || "FET unknown";
    const failureStatus = {
      0: "Hardware fuse / no PF detail",
      1: "Cell imbalance failure",
      2: "Over voltage failure",
      3: "FET failure"
    }[failureCode] || "Failure unknown";
    const chargeStatus = {
      0x0: "Discharging",
      0x1: "Normal charge",
      0x3: "Pre-charge",
      0x4: "Charge suspension",
      0x7: "OV failure",
      0x8: "Temporary failure",
      0x9: "Permanent failure",
      0xA: "Over current",
      0xB: "Over heat",
      0xC: "Over discharge",
      0xD: "Sleep mode",
      0xE: "Battery alone",
      0xF: "Reserved"
    }[chargeCode] || `ChargeStatus 0x${chargeCode.toString(16).toUpperCase()}`;
    return {
      word,
      fetStatus,
      failureStatus,
      chargeStatus,
      text: `${fetStatus}; ${chargeStatus}; ${failureStatus}`
    };
  }

  function appendDerivedCellBalanceRows(rows) {
    const cellRows = (rows || [])
      .filter((row) => /^cellVoltage\d+$/.test(String(row?.key || "")) && row.status === "OK")
      .map((row) => ({
        ...row,
        numericValue: Number(row.numeric)
      }))
      .filter((row) => Number.isFinite(row.numericValue) && row.numericValue > 0);
    if (cellRows.length < 2) {
      return rows;
    }

    const values = cellRows.map((row) => row.numericValue);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const delta = max - min;
    const balanceStatus = delta <= 30 ? "Good" : delta <= 80 ? "Watch" : "Imbalance";
    return [
      ...rows,
      {
        key: "cellsBalance",
        source: "Derived",
        label: "Cells Balance",
        command: "0x3C-0x3F",
        value: balanceStatus,
        unit: "",
        numeric: delta,
        raw: `${formatNumber(min)}-${formatNumber(max)} mV`,
        status: `Delta ${formatNumber(delta)} mV`,
        meta: `${cellRows.length} active cells`
      },
      {
        key: "maxImbalance",
        source: "Derived",
        label: "Max Imbalance",
        command: "0x3C-0x3F",
        value: formatNumber(delta),
        unit: "mV",
        numeric: delta,
        raw: `${formatNumber(min)}-${formatNumber(max)} mV`,
        status: balanceStatus,
        meta: `${cellRows.length} active cells`
      }
    ];
  }

  function bq30CellRows(rows) {
    return [1, 2, 3, 4]
      .map((index) => {
        const row = monitorRowByKey(rows, `cellVoltage${index}`);
        const numeric = Number(row?.numeric);
        if (!Number.isFinite(numeric) || numeric <= 0) {
          return null;
        }
        return {
          index,
          key: `cellVoltage${index}`,
          label: row?.label || `Cell Voltage ${index}`,
          command: row?.command || `0x3${5 - index}`,
          value: row?.value || formatNumber(numeric),
          raw: row?.raw || "-",
          status: row?.status || "OK",
          meta: row?.meta || "",
          voltage: numeric
        };
      })
      .filter(Boolean);
  }

  function bq30CellBalanceAnalysis(rows, targetDeltaMv = 30) {
    const cellsByIndex = bq30CellRows(rows);
    const cellsByVoltage = [...cellsByIndex].sort((a, b) => a.voltage - b.voltage);
    const voltages = cellsByIndex.map((cell) => cell.voltage);
    const activeCount = cellsByIndex.length;
    const packType = activeCount ? `${activeCount}S` : "-";
    const minVoltage = voltages.length ? Math.min(...voltages) : null;
    const maxVoltage = voltages.length ? Math.max(...voltages) : null;
    const delta = minVoltage !== null && maxVoltage !== null ? maxVoltage - minVoltage : null;
    const averageVoltage = voltages.length
      ? voltages.reduce((sum, value) => sum + value, 0) / voltages.length
      : null;
    const needsBalance = delta !== null && delta > targetDeltaMv;
    const targetVoltage = maxVoltage !== null ? maxVoltage - targetDeltaMv : null;
    const targetCells = needsBalance && targetVoltage !== null
      ? cellsByIndex.filter((cell) => cell.voltage <= targetVoltage)
      : [];
    const primaryCell = cellsByVoltage[0] || null;
    const secondaryCells = targetCells.filter((cell) => cell.index !== primaryCell?.index);
    const cellListText = cellsByIndex.length
      ? cellsByIndex.map((cell) => `C${cell.index} ${formatNumber(cell.voltage, 0)} mV`).join(" | ")
      : "-";
    const targetCellText = targetCells.length
      ? targetCells.map((cell) => `Cell ${cell.index}`).join(", ")
      : "-";
    const status = !cellsByIndex.length
      ? "No cell data"
      : needsBalance
        ? delta <= 80 ? "Watch" : "Imbalance"
        : "Good";
    return {
      cellsByIndex,
      cellsByVoltage,
      activeCount,
      packType,
      minVoltage,
      maxVoltage,
      averageVoltage,
      delta,
      targetDeltaMv,
      targetVoltage,
      needsBalance,
      primaryCell,
      targetCells,
      secondaryCells,
      cellListText,
      targetCellText,
      status,
      targetVoltageText: targetVoltage === null ? "-" : `${formatNumber(targetVoltage, 0)} mV`,
      deltaText: delta === null ? "-" : `${formatNumber(delta, 0)} mV`
    };
  }

  function bq30CellVisualRole(cell, analysis) {
    if (!cell) {
      return "is-empty";
    }
    if (analysis.primaryCell && cell.index === analysis.primaryCell.index && analysis.needsBalance) {
      return "is-target";
    }
    if (analysis.targetCells.some((item) => item.index === cell.index)) {
      return "is-target";
    }
    if (analysis.maxVoltage !== null && cell.voltage === analysis.maxVoltage) {
      return "is-high";
    }
    if (analysis.minVoltage !== null && cell.voltage === analysis.minVoltage) {
      return "is-low";
    }
    return "is-mid";
  }

  function bq30CellFillPercent(cell, analysis) {
    if (!cell || analysis.minVoltage === null || analysis.maxVoltage === null) {
      return 60;
    }
    const range = Math.max(1, analysis.maxVoltage - analysis.minVoltage);
    const percent = 18 + (((cell.voltage - analysis.minVoltage) / range) * 72);
    return Math.max(12, Math.min(96, percent));
  }

  function renderBq30CellPackVisual(analysis, mode = "balance") {
    const cells = Array.isArray(analysis?.cellsByIndex) ? analysis.cellsByIndex : [];
    if (!cells.length) {
      return `
        <div class="battery-bq30-visual is-empty">
          <div class="battery-bq30-visual-head">
            <span>${escapeHtml(mode === "calibration" ? "Relearn" : "Balance")}</span>
            <strong>Cell data belum cukup</strong>
          </div>
          <p>Jalankan Check Cells dulu untuk membaca cell voltage yang aktif.</p>
        </div>
      `;
    }

    return `
      <div class="battery-bq30-visual">
        <div class="battery-bq30-visual-head">
          <span>${escapeHtml(analysis.packType || `${cells.length}S`)}</span>
          <strong>${escapeHtml(analysis.status || "-")} / Delta ${escapeHtml(analysis.deltaText || "-")}</strong>
        </div>
        <div class="battery-bq30-cell-grid battery-bq30-cell-grid-${cells.length}">
          ${cells.map((cell) => {
            const role = bq30CellVisualRole(cell, analysis);
            const fillPercent = bq30CellFillPercent(cell, analysis);
            return `
              <div class="battery-bq30-cell ${escapeHtml(role)}">
                <div class="battery-bq30-cell-fill" style="height: ${formatNumber(fillPercent, 0)}%;"></div>
                <div class="battery-bq30-cell-cap"></div>
                <strong>Cell ${cell.index}</strong>
                <span>${escapeHtml(formatNumber(cell.voltage, 0))} mV</span>
                <small>${escapeHtml(role === "is-target"
                  ? "Suntik / cek ulang"
                  : role === "is-high"
                    ? "Referensi tinggi"
                    : role === "is-low"
                      ? "Paling rendah"
                      : "Normal")}</small>
              </div>
            `;
          }).join("")}
        </div>
        <div class="battery-bq30-visual-legend">
          <span class="is-target">Target inject</span>
          <span class="is-high">Highest cell</span>
          <span class="is-low">Lowest cell</span>
        </div>
      </div>
    `;
  }

  function bq30CellInstructionText(analysis, mode, targetLabel) {
    if (!analysis?.cellsByIndex?.length) {
      return "Cell data belum cukup. Jalankan Check Cells dulu.";
    }
    if (!analysis.needsBalance) {
      if (mode === "repair") {
        return `Repair selesai. Delta ${analysis.deltaText} sudah masuk target ${targetLabel}.`;
      }
      if (mode === "calibration") {
        return `Balance sudah aman untuk relearn step. Delta ${analysis.deltaText}.`;
      }
      return `Balance good. Delta ${analysis.deltaText} sudah di bawah target ${targetLabel}.`;
    }

    const primary = analysis.primaryCell ? `Cell ${analysis.primaryCell.index}` : "cell utama";
    const secondary = analysis.secondaryCells.length
      ? analysis.secondaryCells.map((cell) => `Cell ${cell.index}`).join(", ")
      : "";
    const targetCellText = analysis.targetCellText && analysis.targetCellText !== "-" ? analysis.targetCellText : primary;
    if (mode === "repair") {
      return secondary
        ? `Repair target ${targetLabel}. Inject ${primary} dulu, lalu cek ${secondary}. Cell target: ${targetCellText}.`
        : `Repair target ${targetLabel}. Inject ${primary} sampai mendekati ${analysis.targetVoltageText}.`
    }
    return secondary
      ? `Balance target ${targetLabel}. Inject ${primary} dulu, lalu cek ${secondary}. Cell target: ${targetCellText}.`
      : `Balance target ${targetLabel}. Inject ${primary} sampai mendekati ${analysis.targetVoltageText}.`;
  }

  function bq30CellGuidanceRows(rows, mode, targetDeltaMv) {
    const analysis = bq30CellBalanceAnalysis(rows, targetDeltaMv);
    const title = mode === "repair" ? "Repair Plan" : "Balance Plan";
    return [
      {
        label: title,
        command: "0x3C-0x3F",
        writeHex: "-",
        readHex: analysis.cellListText,
        status: bq30CellInstructionText(analysis, mode, `${formatNumber(targetDeltaMv, 0)} mV`)
      },
      {
        label: "Cell Target",
        command: "Target",
        writeHex: "-",
        readHex: analysis.targetVoltageText,
        status: analysis.targetCellText === "-"
          ? "Tidak ada cell yang perlu disuntik."
          : `Prioritas: ${analysis.primaryCell ? `Cell ${analysis.primaryCell.index}` : "-"}${analysis.secondaryCells.length ? `; tambahan ${analysis.secondaryCells.map((cell) => `Cell ${cell.index}`).join(", ")}` : ""}`
      },
      {
        label: "Pack Type",
        command: "Cells",
        writeHex: "-",
        readHex: analysis.cellListText,
        status: analysis.packType === "-" ? "No cell data" : `${analysis.packType} detected`
      }
    ];
  }

  function bq30CalibrationGoalRows(rows, status, options = {}) {
    const targetBalanceDeltaMv = Number(options.targetBalanceDeltaMv || 30);
    const targetLevelPercent = Number(options.targetLevelPercent || 100);
    const targetHealthPercent = Number(options.targetHealthPercent || 100);
    const analysis = bq30CellBalanceAnalysis(rows, targetBalanceDeltaMv);
    const health = calculateHealthPercent(rows);
    const charge = calculateChargePercent(rows);
    const ready = Boolean(
      status?.chargeFetOn &&
      status?.dischargeFetOn &&
      status?.pfStatusHex === "0x00000000" &&
      status?.safetyStatusHex === "0x00000000" &&
      (analysis.delta === null || analysis.delta <= targetBalanceDeltaMv) &&
      charge !== null &&
      charge >= targetLevelPercent &&
      health !== null &&
      health >= targetHealthPercent
    );
    const healthText = health === null ? "Unknown" : `${formatNumber(health, 0)}%`;
    const chargeText = charge === null ? "Unknown" : `${formatNumber(charge, 0)}%`;
    return [
      {
        label: "Relearn Goal",
        command: "Target",
        writeHex: "-",
        readHex: `${formatNumber(targetLevelPercent, 0)}% / ${formatNumber(targetHealthPercent, 0)}%`,
        status: ready
          ? "Ready for refresh/relearn goal."
          : `Current ${chargeText} / ${healthText}. Target ${formatNumber(targetLevelPercent, 0)}% / ${formatNumber(targetHealthPercent, 0)}%.`
      },
      {
        label: "Refresh Gauge Readiness",
        command: "0x53/0x51/0x54",
        writeHex: "-",
        readHex: `${status?.pfStatusHex || "-"} / ${status?.safetyStatusHex || "-"} / ${status?.operationStatusHex || "-"}`,
        status: ready
          ? `Ready. Delta ${analysis.deltaText}, charge ${chargeText}, health ${healthText}.`
          : `Not ready. Balance ${analysis.deltaText}, charge ${chargeText}, health ${healthText}.`
      }
    ];
  }

  function transactionToMonitorRow(transaction) {
    const command = hex(transaction.command);
    const definition = monitorParameters.find((item) => item.command === command);
    const raw = Array.isArray(transaction.data) ? transaction.data.map((byte) => hex(byte)).join(" ") : "";
    const value = definition
      ? decodeDirectMonitorValue(definition, raw, transaction.decoded)
      : transaction.decoded || "-";
    return {
      key: definition?.key || `passive-${transaction.command}`,
      source: "Passive",
      label: definition?.label || transaction.label,
      command,
      value,
      unit: definition?.unit || "",
      numeric: definition ? decodeDirectMonitorNumber(definition, raw) : null,
      raw: raw || "-",
      status: "ACK",
      meta: `C${formatNumber(transaction.captureIndex || 1)} - ${formatNumber(transaction.timeUs, 1)} us`
    };
  }

  function mergeMonitorRows(existingRows, newRows) {
    const byKey = new Map((existingRows || []).map((row) => [`${row.source}:${row.command}:${row.label}`, row]));
    (newRows || []).forEach((row) => {
      byKey.set(`${row.source}:${row.command}:${row.label}`, row);
    });
    return Array.from(byKey.values()).slice(-80);
  }

  function rowValueForDisplay(row) {
    return row?.value && row.value !== "0xFFFF" ? row.value : "-";
  }

  function countFilledMonitorParameters(rows) {
    const byKey = new Map((Array.isArray(rows) ? rows : []).map((row) => [row.key, row]));
    return visibleMonitorParameters(rows).filter((parameter) => rowValueForDisplay(byKey.get(parameter.key)) !== "-").length;
  }

  function formatMonitorParameterCount(rows) {
    const parameters = visibleMonitorParameters(rows);
    return `${countFilledMonitorParameters(rows)}/${parameters.length} parameter`;
  }

  function monitorRowByKey(rows, key) {
    return (Array.isArray(rows) ? rows : []).find((row) => row?.key === key) || null;
  }

  function parseMonitorNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    const match = String(value || "").match(/-?[\d.,]+/);
    if (!match) {
      return null;
    }
    const normalized = match[0].replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function monitorNumericValue(rows, key) {
    const row = monitorRowByKey(rows, key);
    if (!row || rowValueForDisplay(row) === "-") {
      return null;
    }
    if (Number.isFinite(row.numeric)) {
      return row.numeric;
    }
    return parseMonitorNumber(row.value);
  }

  function clampPercent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return null;
    }
    return Math.max(0, Math.min(100, number));
  }

  function normalizeTargetNumber(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, number));
  }

  function calculateChargePercent(rows) {
    const relativeSoc = monitorNumericValue(rows, "relativeSoc");
    if (relativeSoc !== null) {
      return clampPercent(relativeSoc);
    }
    const absoluteSoc = monitorNumericValue(rows, "absoluteSoc");
    if (absoluteSoc !== null) {
      return clampPercent(absoluteSoc);
    }
    const remainingCapacity = monitorNumericValue(rows, "remainingCapacity");
    const fullChargeCapacity = monitorNumericValue(rows, "fullChargeCapacity");
    if (remainingCapacity !== null && fullChargeCapacity > 0) {
      return clampPercent((remainingCapacity / fullChargeCapacity) * 100);
    }
    return null;
  }

  function calculateHealthPercent(rows) {
    const fullChargeCapacity = monitorNumericValue(rows, "fullChargeCapacity");
    const designCapacity = monitorNumericValue(rows, "designCapacity");
    if (fullChargeCapacity !== null && designCapacity > 0) {
      return clampPercent((fullChargeCapacity / designCapacity) * 100);
    }
    return null;
  }

  function renderBatteryGauge(title, value, markers) {
    const percent = clampPercent(value);
    const level = percent === null ? 0 : percent;
    const label = percent === null ? "-" : `${formatNumber(percent, 0)}%`;
    return `
      <div class="battery-gauge${percent === null ? " is-empty" : ""}">
        <div class="battery-gauge-head">
          <span>${escapeHtml(title)}</span>
          <strong>${escapeHtml(label)}</strong>
        </div>
        <div class="battery-gauge-body">
          <div class="battery-gauge-scale">
            ${markers.map((marker) => `<span>${escapeHtml(marker)}</span>`).join("")}
          </div>
          <div class="battery-gauge-track" aria-label="${escapeHtml(title)} ${escapeHtml(label)}">
            <div class="battery-gauge-fill" style="height: ${level}%;"></div>
          </div>
        </div>
      </div>
    `;
  }

  function monitorParameterGroup(parameter) {
    if (parameter?.sourceDerived) {
      return "derived";
    }
    if (parameter?.chipFamily || String(parameter?.key || "").startsWith("renesas045")) {
      return "extended";
    }
    return isSbsMonitorCommand(parameter) ? "standard" : "extended";
  }

  function renderUnifiedMonitorTable(rows) {
    const byKey = new Map((Array.isArray(rows) ? rows : []).map((row) => [row.key, row]));
    const parameters = visibleMonitorParameters(rows);
    return `
      <div class="battery-table-wrap">
        <table class="battery-table">
          <thead>
            <tr><th>Parameter</th><th>Value</th><th>Unit</th></tr>
          </thead>
          <tbody>
            ${parameters.map((parameter) => {
              const row = byKey.get(parameter.key);
              const group = monitorParameterGroup(parameter);
              return `
              <tr class="battery-monitor-row battery-monitor-row-${escapeHtml(group)}">
                <td>${escapeHtml(parameter.label)}</td>
                <td>${escapeHtml(rowValueForDisplay(row))}</td>
                <td>${escapeHtml(parameter.unit || row?.unit || "")}</td>
              </tr>
            `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function directPinOrderFromDiagnostic(diagnostic) {
    const probe = (diagnostic?.probes || diagnostic?.scanHits || []).find((item) => item?.batteryDetected) ||
      (diagnostic?.scanHits || []).find((item) => item?.batteryDetected);
    const mode = String(probe?.activeMode || "").toLowerCase();
    if (mode.includes("swap")) {
      return "swap";
    }
    if (mode.includes("normal")) {
      return "normal";
    }
    return "unknown";
  }

  function directSmbusModeFromDiagnostic(diagnostic) {
    return {
      pinMode: "auto",
      speedMode: "auto"
    };
  }

  function formatLineDiagnosticMessage(diagnostic) {
    const line = diagnostic?.lineDiagnostic;
    if (!line || line.success !== false) {
      return diagnostic?.message || "";
    }
    return `${diagnostic?.message || "Line data/clock belum sehat."} Idle ${line.idle || "-"}, release ${line.release || "-"}.`;
  }

  function diagnosticHasBatteryAck(diagnostic) {
    return Boolean(
      diagnostic?.batteryDetected ||
      (Array.isArray(diagnostic?.scanHits) && diagnostic.scanHits.some((item) => item?.batteryDetected)) ||
      (Array.isArray(diagnostic?.probes) && diagnostic.probes.some((item) => item?.batteryDetected))
    );
  }

  function hasMetricValue(value) {
    return typeof value === "string" && value.trim() !== "" && value.trim() !== "-";
  }

  function mergeMetrics(target, source) {
    const merged = { ...createInitialMetrics(), ...(target || {}) };
    Object.entries(source || {}).forEach(([key, value]) => {
      if (hasMetricValue(value)) {
        merged[key] = value;
      }
    });
    return merged;
  }

  function hasAnyMetric(metrics) {
    return Object.values(metrics || {}).some(hasMetricValue);
  }

  function summarizeMetrics(metrics) {
    const parts = [];
    if (hasMetricValue(metrics.temperature)) {
      parts.push(`Temp ${metrics.temperature}`);
    }
    if (hasMetricValue(metrics.relativeSoc)) {
      parts.push(`SOC ${metrics.relativeSoc}`);
    }
    if (hasMetricValue(metrics.voltage)) {
      parts.push(`Voltage ${metrics.voltage}`);
    }
    if (hasMetricValue(metrics.current)) {
      parts.push(`Current ${metrics.current}`);
    }
    if (hasMetricValue(metrics.averageCurrent)) {
      parts.push(`Avg ${metrics.averageCurrent}`);
    }
    if (hasMetricValue(metrics.batteryStatus)) {
      parts.push(`Status ${metrics.batteryStatus}`);
    }
    return parts.join(", ");
  }

  function decodeI2cRows(samples, sampleRateHz) {
    const rows = [];
    if (!Array.isArray(samples) || samples.length < 4) {
      return rows;
    }

    const safeRate = Math.max(1, Number(sampleRateHz || 0));
    let previous = Number(samples[0] || 0) & 0x03;
    let collecting = false;
    let bits = [];
    let expectAck = false;
    let lastByte = 0;
    let byteIndex = 0;
    let transactionIndex = 0;

    for (let index = 1; index < samples.length; index += 1) {
      const current = Number(samples[index] || 0) & 0x03;
      const previousSda = previous & 0x01;
      const previousScl = (previous >> 1) & 0x01;
      const sda = current & 0x01;
      const scl = (current >> 1) & 0x01;
      const timeUs = (index / safeRate) * 1000000;

      if (previousSda === 1 && sda === 0 && scl === 1) {
        collecting = true;
        bits = [];
        expectAck = false;
        byteIndex = 0;
        transactionIndex += 1;
        previous = current;
        continue;
      }

      if (previousSda === 0 && sda === 1 && scl === 1) {
        collecting = false;
        bits = [];
        expectAck = false;
        previous = current;
        continue;
      }

      if (collecting && previousScl === 0 && scl === 1) {
        if (expectAck) {
          const ack = sda === 0;
          const isAddress = byteIndex === 0;
          rows.push({
            timeUs,
            type: isAddress ? "ADDR" : "DATA",
            value: isAddress ? (lastByte >> 1) : lastByte,
            rawByte: lastByte,
            rw: isAddress ? ((lastByte & 0x01) ? "R" : "W") : "",
            ack,
            bits: byteBits(lastByte),
            transactionIndex
          });
          byteIndex += 1;
          bits = [];
          expectAck = false;
        } else {
          bits.push(sda);
          if (bits.length === 8) {
            lastByte = bits.reduce((acc, bit) => ((acc << 1) | bit), 0);
            expectAck = true;
          }
        }
      }

      previous = current;
    }

    return rows;
  }

  function decodeSmartBattery(rows) {
    const transactions = [];
    const metrics = createInitialMetrics();
    for (let index = 0; index < rows.length; index += 1) {
      const start = rows[index];
      const command = rows[index + 1];
      const repeated = rows[index + 2];
      if (!start || !command || !repeated) {
        continue;
      }

      if (start.type !== "ADDR" || start.value !== 0x0B || start.rw !== "W" || !start.ack) {
        continue;
      }
      if (command.type !== "DATA" || !command.ack) {
        continue;
      }
      if (repeated.type !== "ADDR" || repeated.value !== 0x0B || repeated.rw !== "R" || !repeated.ack) {
        continue;
      }

      const data = [];
      let cursor = index + 3;
      while (cursor < rows.length && rows[cursor].type === "DATA") {
        data.push(rows[cursor].value);
        if (!rows[cursor].ack) {
          cursor += 1;
          break;
        }
        cursor += 1;
      }

      if (data.length === 0) {
        continue;
      }

      const cmd = command.value;
      const word = data.length >= 2 ? (data[0] | (data[1] << 8)) : data[0];
      const label = commandLabels[cmd] || `Command ${hex(cmd)}`;
      let decoded = data.map((item) => hex(item)).join(" ");
      if (cmd === 0x08 && data.length >= 2) {
        decoded = `${formatNumber(word / 10 - 273.15, 2)} C`;
        metrics.temperature = decoded;
      } else if (cmd === 0x09 && data.length >= 2) {
        decoded = `${formatNumber(word)} mV`;
        metrics.voltage = decoded;
      } else if (cmd === 0x0A && data.length >= 2) {
        decoded = `${formatNumber(signed16(word))} mA`;
        metrics.current = decoded;
      } else if (cmd === 0x0B && data.length >= 2) {
        decoded = `${formatNumber(signed16(word))} mA`;
        metrics.averageCurrent = decoded;
      } else if (cmd === 0x0D || cmd === 0x0E) {
        decoded = `${formatNumber(word)} %`;
        if (cmd === 0x0D) {
          metrics.relativeSoc = decoded;
        }
      } else if (cmd === 0x16 && data.length >= 2) {
        decoded = `0x${word.toString(16).toUpperCase().padStart(4, "0")}`;
        metrics.batteryStatus = decoded;
      }

      transactions.push({
        timeUs: start.timeUs,
        command: cmd,
        label,
        data,
        decoded
      });
    }
    return { metrics, transactions };
  }

  function smbusAddressLabel(address) {
    if (address === 0x0B) {
      return "Smart Battery";
    }
    if (address === 0x09) {
      return "Smart Charger";
    }
    return "SMBus Device";
  }

  function decodeSmbusFrames(rows) {
    const frames = [];
    let current = null;
    const pushCurrent = () => {
      if (!current) {
        return;
      }
      const word = current.data.length >= 2
        ? (current.data[0] | (current.data[1] << 8))
        : null;
      let note = `${smbusAddressLabel(current.address)} ${current.rw}`;
      if (current.address === 0x09 && current.rw === "R") {
        note = "Charger read; command tidak ikut tertangkap";
      } else if (current.address === 0x0B && current.rw === "R") {
        note = "Battery read; tunggu command 0x0B W";
      } else if (current.address === 0x0B && current.rw === "W") {
        note = "Battery command";
      }
      frames.push({
        timeUs: current.timeUs,
        captureIndex: current.captureIndex,
        address: current.address,
        rw: current.rw,
        data: current.data,
        word,
        note
      });
      current = null;
    };

    rows.forEach((row) => {
      if (row.type === "ADDR") {
        pushCurrent();
        current = {
          timeUs: row.timeUs,
          captureIndex: row.captureIndex || 1,
          address: row.value,
          rw: row.rw,
          data: []
        };
        return;
      }
      if (row.type === "DATA" && current) {
        current.data.push(row.value);
      }
    });
    pushCurrent();
    return frames;
  }

  function renderTabs(state) {
    const tabs = [
      ["monitor", "monitor_heart", "Monitor"],
      ["data", "database", "Data"],
      ["smbus", "swap_horiz", "SMBus"],
      ["recovery", "lock_open", "Recovery"]
    ];
    return `
      <div class="battery-tabs" role="tablist">
        ${tabs.map(([tab, icon, label]) => `
          <button type="button" class="${state.activeTab === tab ? "is-active" : ""}" data-battery-tab="${tab}">
            <span class="material-symbols-outlined">${icon}</span>
            <span>${label}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderDeviceSelect(state, disabled, className = "") {
    return `
      <label${className ? ` class="${className}"` : ""}>
        Koneksi
        <select id="batteryDeviceType"${disabled ? " disabled" : ""}>
          <option value="${usbDeviceType}"${state.deviceType === usbDeviceType ? " selected" : ""}>TEKNISIHUB_DEVICE USB</option>
          <option value="${wifiDeviceType}"${state.deviceType === wifiDeviceType ? " selected" : ""}>TEKNISIHUB_DEVICE WIFI</option>
        </select>
      </label>
    `;
  }

  function renderGlobalControls(state) {
    const busy = state.busy || state.monitorRunning;
    const busLocked = hasBatteryBusLock(state);
    const selectedSampleRateHz = normalizeMonitorSampleRateHz(state.monitorSampleRateHz);
    const sampleRateOptions = sampleRateOptionsHz.map((rate) => `
      <option value="${rate}"${selectedSampleRateHz === rate ? " selected" : ""}${rate < minimumMonitorDecodeRateHz ? " disabled" : ""}>${escapeHtml(formatMonitorSampleRateOption(rate))}</option>
    `).join("");
    const smbusSpeedOptions = [
      ["auto", "Auto"],
      ["fast", "Fast"],
      ["slow", "Slow"],
      ["ultra", "Ultra"]
    ].map(([value, label]) => `<option value="${value}"${state.smbusSpeedMode === value ? " selected" : ""}>${label}</option>`).join("");
    return `
      <section class="spi-card battery-panel-main battery-global-controls">
        <div class="spi-card-head">
          <div>
            <p class="label">Session</p>
            <h4>Battery Bus Control</h4>
          </div>
          <div class="battery-action-row">
            <button id="batteryResetSessionButton" type="button" class="ghost battery-session-reset"${state.busy ? " disabled" : ""}>
              <span class="material-symbols-outlined">restart_alt</span>
              <span>Reset Session</span>
            </button>
            <button id="batteryDetectBusButton" type="button"${busy ? " disabled" : ""}>
              <span class="material-symbols-outlined${state.busy ? " is-spinning" : ""}">${state.busy ? "progress_activity" : busLocked ? "verified" : "cable"}</span>
              <span>${escapeHtml(busLocked ? "Detek Ulang" : "Detek")}</span>
            </button>
          </div>
        </div>
        <div class="spi-form-grid battery-bus-grid">
          ${renderDeviceSelect(state, busy, "battery-control-connection")}
          <label class="battery-control-sample">
            Sample Rate
            <select id="batteryGlobalSampleRate"${busy ? " disabled" : ""}>
              ${sampleRateOptions}
            </select>
          </label>
          <label class="battery-control-speed">
            SMBus Speed
            <select id="batteryGlobalSmbusSpeed"${busy ? " disabled" : ""}>
              ${smbusSpeedOptions}
            </select>
          </label>
          <label class="battery-control-pin">
            SCL/SDA
            <input type="text" value="${escapeHtml(busLocked ? `${String(state.busPinMode || "").toUpperCase()} locked` : "Belum detek")}" readonly>
          </label>
          <label class="battery-control-device">
            Device Name
            <input type="text" value="${escapeHtml(state.busDeviceName || "-")}" readonly>
          </label>
          <label class="battery-control-chip">
            Chip/IC
            <input id="batteryDeviceChipInput" type="text" value="${escapeHtml(state.busChip || "")}" placeholder="probe otomatis" readonly>
          </label>
          <label class="battery-control-family">
            Family
            <input id="batteryDeviceFamilyInput" type="text" value="${escapeHtml(state.busChipFamily || "")}" placeholder="probe otomatis" readonly>
          </label>
        </div>
      </section>
    `;
  }

  function renderMonitor(state) {
    const monitorRunning = Boolean(state.monitorRunning);
    const directRunning = monitorRunning && state.monitorMode === "direct";
    const busLocked = hasBatteryBusLock(state);
    const directDisabled = !busLocked || (monitorRunning && !directRunning);
    const chargePercent = calculateChargePercent(state.monitorRows);
    const healthPercent = calculateHealthPercent(state.monitorRows);

    return `
      <section class="spi-card battery-panel-main battery-monitor-panel battery-monitor-simple">
        <div class="spi-card-head">
          <div>
            <p class="label">Monitoring</p>
            <h4>Battery Monitor</h4>
          </div>
          <div class="battery-action-row">
            <button id="batteryMonitorDirectButton" type="button"${directDisabled ? " disabled" : ""}>
              <span class="material-symbols-outlined">${directRunning ? "stop_circle" : "battery_5_bar"}</span>
              <span>${directRunning ? "Stop Direct" : "Scan Direct"}</span>
            </button>
          </div>
        </div>
        <div class="battery-monitor-body">
          <div class="battery-monitor-gauges">
            ${renderBatteryGauge("Charge State", chargePercent, ["Full", "50%", "Empty"])}
            ${renderBatteryGauge("Health", healthPercent, ["New", "Good", "Fair", "Poor"])}
          </div>
          <div class="battery-monitor-table-area">
            ${renderUnifiedMonitorTable(state.monitorRows)}
          </div>
        </div>
      </section>
    `;
  }

  function renderBatteryPinoutFinder(state) {
    const result = state.pinoutResult;
    const pinRows = Array.isArray(result?.pins) ? result.pins : [];
    return `
      <section class="spi-card battery-panel-main">
        <div class="spi-card-head">
          <div>
            <p class="label">Pinout</p>
            <h4>Find Battery Pinout</h4>
          </div>
          <button id="batteryPinoutFindButton" type="button" class="ghost"${state.busy ? " disabled" : ""}>
            <span class="material-symbols-outlined">manage_search</span>
            <span>Find Pinout</span>
          </button>
        </div>
        <div class="spi-form-grid">
          <label>
            Brand
            <select id="batteryPinoutBrand"${state.busy ? " disabled" : ""}>
              ${batteryPinoutBrands.map((brand) => `
                <option value="${escapeHtml(brand)}"${state.pinoutBrand === brand ? " selected" : ""}>${escapeHtml(brand)}</option>
              `).join("")}
            </select>
          </label>
          <label>
            Part Number
            <input id="batteryPinoutPartNumber" type="text" value="${escapeHtml(state.pinoutPartNumber)}" placeholder="HSTNN / 607762-001"${state.busy ? " disabled" : ""}>
          </label>
          <label>
            Pin Count
            <input type="text" value="${escapeHtml(result?.pinCount || "-")}" readonly>
          </label>
          <label>
            Pinout
            <input type="text" value="${escapeHtml(result?.code || "-")}" readonly>
          </label>
        </div>
        <div class="battery-profile-strip">
          ${batteryPinoutLegend.map(([symbol, label]) => `<span><strong>${escapeHtml(symbol)}</strong> ${escapeHtml(label)}</span>`).join("")}
        </div>
        <div class="battery-table-wrap">
          <table class="battery-table">
            <thead>
              <tr><th>Pin</th><th>Signal</th><th>Code</th><th>Source</th></tr>
            </thead>
            <tbody>
              ${pinRows.map((pin) => `
                <tr>
                  <td>${escapeHtml(pin.pin)}</td>
                  <td>${escapeHtml(pin.signal)}</td>
                  <td>${escapeHtml(pin.symbol)}</td>
                  <td>${escapeHtml(result.source || "-")}</td>
                </tr>
              `).join("") || `<tr><td colspan="4">Belum ada hasil pinout.</td></tr>`}
            </tbody>
          </table>
        </div>
        <p class="spi-note">${escapeHtml(state.pinoutMessage)}</p>
      </section>
    `;
  }

  function renderDataRows(rows) {
    const dataRows = Array.isArray(rows) ? rows : [];
    return `
      <div class="battery-table-wrap">
        <table class="battery-table">
          <thead>
            <tr><th>Item</th><th>Cmd</th><th>Operation</th><th>Raw</th><th>Value</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${dataRows.map((row) => `
              <tr>
                <td>${escapeHtml(row.label || "-")}</td>
                <td>${escapeHtml(row.command || "-")}</td>
                <td>${escapeHtml(row.operation || "-")}</td>
                <td>${escapeHtml(row.readHex || row.writeHex || "-")}</td>
                <td>${escapeHtml(row.decodedValue || "-")}</td>
                <td>${escapeHtml(row.status || "-")}</td>
              </tr>
            `).join("") || `<tr><td colspan="6">Belum ada data.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderData(state) {
    const busy = state.busy || state.monitorRunning;
    const busLocked = hasBatteryBusLock(state);
    const profile = selectedProfile(state);
    const family = selectedCatalogFamily(state);
    const seriesOptions = buildSeriesOptions(state);
    const selectedSeriesValue = family && !findProfileForFamily(state, family)
      ? `catalog:${family.id}`
      : `profile:${profile?.id || ""}`;
    const backup = state.dataBackup;
    const imported = state.dataImportedBackup;
    const restoreItems = getRestoreItems(imported);
    const identifyDisabled = busy || !busLocked || !state.isolatedConfirmed;
    const backupDisabled = identifyDisabled;
    const exportDisabled = busy || !backup;
    const verifyDisabled = busy || !busLocked || !state.isolatedConfirmed || !imported;
    const restoreDisabled = busy || !busLocked || !state.isolatedConfirmed || !state.writeConfirmed || !state.dataImportVerified || restoreItems.length === 0;
    return `
      <section class="spi-card battery-panel-main">
        <div class="spi-card-head">
          <div>
            <p class="label">Data</p>
            <h4>Backup / Restore</h4>
          </div>
          <div class="battery-action-row">
            <button id="batteryDataIdentifyButton" type="button" class="ghost"${identifyDisabled ? " disabled" : ""}>
              <span class="material-symbols-outlined">badge</span>
              <span>Identify</span>
            </button>
            <button id="batteryDataBackupButton" type="button"${backupDisabled ? " disabled" : ""}>
              <span class="material-symbols-outlined">download</span>
              <span>Backup</span>
            </button>
            <button id="batteryDataExportButton" type="button" class="ghost"${exportDisabled ? " disabled" : ""}>
              <span class="material-symbols-outlined">save</span>
              <span>Export</span>
            </button>
            <button id="batteryDataImportButton" type="button" class="ghost"${busy ? " disabled" : ""}>
              <span class="material-symbols-outlined">upload_file</span>
              <span>Import</span>
            </button>
            <button id="batteryDataVerifyButton" type="button" class="ghost"${verifyDisabled ? " disabled" : ""}>
              <span class="material-symbols-outlined">rule</span>
              <span>Verify</span>
            </button>
            <button id="batteryDataRestoreButton" type="button"${restoreDisabled ? " disabled" : ""}>
              <span class="material-symbols-outlined">restore</span>
              <span>Restore</span>
            </button>
          </div>
        </div>
        <div class="spi-form-grid">
          <label>
            Seri / IC
            <select id="batteryDataSeriesSelect"${busy ? " disabled" : ""}>
              ${seriesOptions.map((item) => `<option value="${escapeHtml(item.value)}"${selectedSeriesValue === item.value ? " selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
            </select>
          </label>
          <label>
            Scope
            <input value="SBS snapshot + writable params" readonly>
          </label>
          <label>
            Imported
            <input value="${escapeHtml(state.dataFileName || "-")}" readonly>
          </label>
        </div>
        <div class="battery-confirm-row">
          <label><input id="batteryDataIsolatedConfirmed" type="checkbox"${state.isolatedConfirmed ? " checked" : ""}${busy ? " disabled" : ""}> <span>Battery isolated</span></label>
          <label><input id="batteryDataWriteConfirmed" type="checkbox"${state.writeConfirmed ? " checked" : ""}${busy ? " disabled" : ""}> <span>Write enable</span></label>
        </div>
        <input id="batteryDataImportFile" type="file" accept="application/json,.json" hidden>
      </section>
      <section class="spi-card battery-result-panel">
        <div class="spi-card-head">
          <div>
            <p class="label">Dump</p>
            <h4>Backup / Verify Log</h4>
          </div>
          <span class="spi-mini-badge">${escapeHtml(state.dataRows.length ? `${state.dataRows.length} row` : "WAIT")}</span>
        </div>
        ${renderDataRows(state.dataRows)}
      </section>
    `;
  }

  function renderSmbus(state) {
    const busy = state.busy || state.monitorRunning;
    const busLocked = hasBatteryBusLock(state);
    const directDisabled = busy || !busLocked || !state.isolatedConfirmed;
    const writeDisabled = directDisabled || !state.writeConfirmed;
    const isWrite = state.smbusOperation.startsWith("write") || state.smbusOperation === "raw-transfer";
    return `
      <section class="spi-card battery-panel-main">
        <div class="spi-card-head">
          <div>
            <p class="label">Direct SMBus</p>
            <h4>Manual Command Lab</h4>
          </div>
          <div class="battery-action-row">
            <button id="batterySmbusGaugeProbeButton" type="button" class="ghost"${directDisabled ? " disabled" : ""}>
              <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "memory"}</span>
              <span>Probe IC</span>
            </button>
            <button id="batterySmbusSendButton" type="button" class="ghost"${(isWrite ? writeDisabled : directDisabled) ? " disabled" : ""}>
              <span class="material-symbols-outlined${busy ? " is-spinning" : ""}">${busy ? "progress_activity" : "send"}</span>
              <span>Send</span>
            </button>
          </div>
        </div>
        <div class="spi-form-grid">
          <label>
            Operation
            <select id="batterySmbusOperation"${busy ? " disabled" : ""}>
              ${["read-word", "read-byte", "read-block", "write-word", "write-block", "raw-transfer"].map((item) => `<option value="${item}"${state.smbusOperation === item ? " selected" : ""}>${item}</option>`).join("")}
            </select>
          </label>
          <label>
            Address
            <input id="batterySmbusAddress" type="text" value="${escapeHtml(state.smbusAddress)}"${busy ? " disabled" : ""}>
          </label>
          <label>
            Command
            <input id="batterySmbusCommand" type="text" value="${escapeHtml(state.smbusCommand)}"${busy ? " disabled" : ""}>
          </label>
          <label>
            Data Hex
            <input id="batterySmbusDataHex" type="text" value="${escapeHtml(state.smbusDataHex)}"${busy ? " disabled" : ""}>
          </label>
          <label>
            Read Len
            <input id="batterySmbusReadLength" type="number" min="0" max="64" value="${Number(state.smbusReadLength || 0)}"${busy ? " disabled" : ""}>
          </label>
          <label>
            SDA/SCL
            <input type="text" value="${escapeHtml(busLocked ? String(state.busPinMode || "").toUpperCase() : "Detek dulu")}" readonly>
          </label>
        </div>
        <div class="battery-confirm-row">
          <label><input id="batteryIsolatedConfirmed" type="checkbox"${state.isolatedConfirmed ? " checked" : ""}${busy ? " disabled" : ""}> <span>Battery isolated</span></label>
          <label><input id="batteryWriteConfirmed" type="checkbox"${state.writeConfirmed ? " checked" : ""}${busy ? " disabled" : ""}> <span>Write enable</span></label>
          <label><input id="batterySmbusRequireIdle" type="checkbox"${state.smbusRequireIdle ? " checked" : ""}${busy ? " disabled" : ""}> <span>Require idle</span></label>
          <label><input id="batterySmbusScanAddresses" type="checkbox"${state.smbusScanAddresses ? " checked" : ""}${busy ? " disabled" : ""}> <span>Scan address</span></label>
        </div>
      </section>
      <section class="spi-card battery-result-panel">
        <div class="spi-card-head">
          <div>
            <p class="label">Result</p>
            <h4>SMBus response</h4>
          </div>
          <span class="spi-mini-badge">${state.smbusResult?.success ? "OK" : "WAIT"}</span>
        </div>
        <div class="spi-form-grid">
          <label>
            Write
            <textarea rows="3" readonly>${escapeHtml(state.smbusResult?.writeHex || "-")}</textarea>
          </label>
          <label>
            Read
            <textarea rows="3" readonly>${escapeHtml(state.smbusResult?.readHex || "-")}</textarea>
          </label>
          <label>
            Decode
            <input type="text" value="${escapeHtml(state.smbusResult?.decodedValue || "-")}" readonly>
          </label>
        </div>
        ${renderSmbusDiagnostic(state.smbusDiagnostic)}
      </section>
      ${renderSmbusGaugeProbe(state.smbusGaugeProbe)}
    `;
  }

  function renderSmbusGaugeProbe(result) {
    if (!result) {
      return "";
    }
    const rows = Array.isArray(result.rows) ? result.rows : [];
    const confidence = String(result.confidence || "WAIT").toUpperCase();
    const confidenceClass = confidence === "HIGH" ? "is-high" : confidence === "MED" ? "is-med" : confidence === "LOW" ? "is-low" : "is-wait";
    const resultClass = confidence === "HIGH" ? "is-confirmed" : confidence === "MED" ? "is-probable" : "is-unknown";
    const resultIcon = confidence === "HIGH" ? "verified" : confidence === "MED" ? "fact_check" : "help";
    return `
      <section class="spi-card battery-result-panel battery-gauge-probe-panel ${escapeHtml(resultClass)}">
        <div class="spi-card-head">
          <div>
            <p class="label">Gauge Probe</p>
            <h4>Identify Gauge</h4>
          </div>
          <span class="battery-gauge-confidence ${escapeHtml(confidenceClass)}">${escapeHtml(confidence)} CONFIDENCE</span>
        </div>
        <div class="battery-gauge-probe-summary ${escapeHtml(resultClass)}">
          <span class="material-symbols-outlined">${escapeHtml(resultIcon)}</span>
          <div>
            <small>Gauge result</small>
            <strong>${escapeHtml(result.gauge || "Gauge unknown")}</strong>
            <span>${escapeHtml(result.packIdentity || "Pack unknown")}</span>
          </div>
        </div>
        <div class="battery-profile-strip">
          <span>${escapeHtml(result.packIdentity || "Pack unknown")}</span>
          <span>${escapeHtml(result.address || "0x0B")}</span>
          <span>${escapeHtml(result.pinMode || "auto")}</span>
        </div>
        <div class="battery-table-wrap">
          <table class="battery-table">
            <thead>
              <tr><th>Check</th><th>Cmd</th><th>Count</th><th>Payload / Value</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${rows.map((row) => `
                <tr>
                  <td>${escapeHtml(row.label || "-")}</td>
                  <td>${escapeHtml(row.command || "-")}</td>
                  <td>${escapeHtml(row.count ?? "-")}</td>
                  <td>${escapeHtml(row.payload || row.value || "-")}</td>
                  <td>${escapeHtml(row.status || "-")}</td>
                </tr>
              `).join("") || `<tr><td colspan="5">Belum ada hasil probe.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderSmbusDiagnostic(result) {
    if (!result) {
      return "";
    }

    const line = result.lineDiagnostic || {};
    const probes = Array.isArray(result.probes) ? result.probes : [];
    const scanHits = Array.isArray(result.scanHits) ? result.scanHits : [];
    return `
      <div class="battery-profile-strip">
        <span>${escapeHtml(result.message || "Diagnostic selesai.")}</span>
        <span>${escapeHtml(result.identity || "-")}</span>
        <span>${escapeHtml(`Scan ${Number(result.scanCount || 0)} / hit ${scanHits.length}`)}</span>
        <span>${escapeHtml(`${result.pinMode || "auto"} / ${result.speedMode || "auto"}`)}</span>
      </div>
      <div class="spi-form-grid">
        <label>
          Line
          <textarea rows="3" readonly>${escapeHtml([
            `Idle: ${line.idle || "-"}`,
            `Data low: ${line.driveDataLow || "-"}`,
            `Clock low: ${line.driveClockLow || "-"}`,
            `Release: ${line.release || "-"}`,
            `Raw: ${line.rawHex || "-"}`
          ].join("\n"))}</textarea>
        </label>
        <label>
          Active
          <input type="text" value="${escapeHtml(result.batteryDetected ? "ACK detected" : "No ACK")}" readonly>
        </label>
      </div>
      ${renderSmbusProbeTable("Probe", probes)}
      ${renderSmbusProbeTable("Scan hits", scanHits)}
    `;
  }

  function renderSmbusProbeTable(title, probes) {
    const rows = Array.isArray(probes) ? probes : [];
    return `
      <div class="battery-table-wrap">
        <table class="battery-table">
          <thead>
            <tr>
              <th>${escapeHtml(title)}</th>
              <th>Cmd</th>
              <th>HW</th>
              <th>Fast N</th>
              <th>Fast S</th>
              <th>Slow N</th>
              <th>Slow S</th>
              <th>Mode</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((probe) => `
              <tr>
                <td>${escapeHtml(probe.address || "-")}</td>
                <td>${escapeHtml(probe.command || "-")}</td>
                <td>${escapeHtml(probe.hardwareNormal || "-")}</td>
                <td>${escapeHtml(probe.fastNormal || "-")}</td>
                <td>${escapeHtml(probe.fastSwapped || "-")}</td>
                <td>${escapeHtml(probe.slowNormal || "-")}</td>
                <td>${escapeHtml(probe.slowSwapped || "-")}</td>
                <td>${escapeHtml(probe.activeMode || "-")}</td>
              </tr>
            `).join("") || `<tr><td colspan="8">Tidak ada ACK.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  function getProfiles(state) {
    return Array.isArray(state.database?.profiles) ? state.database.profiles : [];
  }

  function getSeriesFamilies(state) {
    return Array.isArray(state.database?.catalog?.families) ? state.database.catalog.families : [];
  }

  function selectedProfile(state) {
    const profiles = getProfiles(state);
    return profiles.find((profile) => profile.id === state.selectedProfileId) || profiles[0] || null;
  }

  function selectedCatalogFamily(state) {
    const families = getSeriesFamilies(state);
    return families.find((family) => family.id === state.selectedCatalogFamilyId) || families[0] || null;
  }

  function buildSeriesOptions(state) {
    const profiles = getProfiles(state);
    const families = getSeriesFamilies(state);
    const options = profiles.map((profile) => ({
      value: `profile:${profile.id}`,
      label: profile.name,
      profile,
      family: families.find((item) => item.id === profile.id || (item.aliases || []).some((alias) => (profile.aliases || []).includes(alias))) || null
    }));
    families.forEach((family) => {
      if (findProfileForFamily(state, family)) {
        return;
      }
      options.push({
        value: `catalog:${family.id}`,
        label: `${family.family || family.id} - ${catalogStatusLabel(family.status)}`,
        profile: null,
        family
      });
    });
    return options;
  }

  function selectedAction(state, profile = selectedProfile(state)) {
    return profile?.recoveryActions?.find((action) => action.id === state.selectedActionId) || profile?.recoveryActions?.[0] || null;
  }

  function recoveryOperations(state, profile = selectedProfile(state), family = selectedCatalogFamily(state)) {
    return universalRecoveryOperations.map((operation) => ({ ...operation }));
  }

  function selectedRecoveryOperation(state, profile = selectedProfile(state), family = selectedCatalogFamily(state)) {
    const operations = recoveryOperations(state, profile, family);
    return operations.find((item) => item.id === state.selectedActionId) || operations[0] || null;
  }

  function findProfileForFamily(state, family) {
    const normalizedStatus = String(family?.status || "").toLowerCase();
    if (normalizedStatus === "reference-only") {
      return getProfiles(state).find((profile) => profile.id === family?.id) || null;
    }

    const familyAliases = new Set([
      String(family?.id || "").toLowerCase(),
      String(family?.family || "").toLowerCase(),
      ...(family?.aliases || []).map((item) => String(item || "").toLowerCase())
    ].filter(Boolean));
    return getProfiles(state).find((profile) => {
      const tokens = [
        profile.id,
        profile.family,
        ...(profile.aliases || [])
      ].map((item) => String(item || "").toLowerCase());
      return tokens.some((token) => familyAliases.has(token));
    }) || null;
  }

  function catalogStatusLabel(status) {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "implemented") {
      return "Siap pakai";
    }
    if (normalized === "implemented-profile") {
      return "Profile siap";
    }
    if (normalized === "reference-only") {
      return "Probe dulu";
    }
    return status || "-";
  }

  function probeCommandForFamily(family) {
    const id = String(family?.id || "").toLowerCase();
    if (id.includes("045a20") || id.includes("raj240045")) {
      return { command: "0x21", operation: "read-block", readLength: 33, message: "Probe 045A20 diset ke Device Name 0x21. Tidak ada write." };
    }
    if (id.includes("bq304")) {
      return { command: "0x59", operation: "read-block", readLength: 33, message: "Probe BQ304xx diset ke block 0x59. Jalankan Diagnostic/Send setelah baterai isolated." };
    }
    if (id.includes("bq80") || id.includes("bq90")) {
      return { command: "0x21", operation: "read-block", readLength: 33, message: "Probe BQ80xx/BQ90xx legacy diset ke DeviceName 0x21. Jika marking BQ9000 berperilaku seperti keluarga BQ40, pilih profile BQ40z50/BQ9000." };
    }
    return { command: "0x2F", operation: "read-block", readLength: 33, message: "Probe authenticate/manufacturer input diset ke 0x2F. Capture hasil read-only dulu." };
  }

  function normalizeHexText(value) {
    return String(value || "").replace(/[^0-9a-f]/gi, "").toUpperCase();
  }

  function normalizeCommandCode(value) {
    const parsed = parseHexByte(value, Number.NaN);
    return Number.isFinite(parsed) ? `0x${parsed.toString(16).padStart(2, "0").toUpperCase()}` : String(value || "").trim();
  }

  function getBackupItems(backup) {
    return Array.isArray(backup?.items) ? backup.items : [];
  }

  function getRestoreItems(backup) {
    return getBackupItems(backup).filter((item) =>
      item?.success &&
      item?.restoreSupported &&
      item?.operation === "read-word" &&
      normalizeHexText(item?.readHex).length === 4);
  }

  function findBackupItem(backup, command) {
    const normalized = normalizeCommandCode(command);
    return getBackupItems(backup).find((item) => normalizeCommandCode(item.command) === normalized) || null;
  }

  function formatBackupFileName(backup) {
    const device = String(findBackupItem(backup, "0x21")?.decodedValue || "battery")
      .replace(/[^a-z0-9_-]+/gi, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 32) || "battery";
    const stamp = String(backup?.createdAt || new Date().toISOString()).replace(/[^0-9]/g, "").slice(0, 14);
    return `teknisihub_${device}_${stamp || Date.now()}.json`;
  }

  function isBq30Profile(profile) {
    return String(profile?.family || "").trim().toUpperCase() === "BQ30";
  }

  function isBq40Profile(profile) {
    return String(profile?.family || "").trim().toUpperCase() === "BQ40";
  }

  function isRenesas045A20Profile(profile, family = null) {
    const tokens = [
      profile?.id,
      profile?.name,
      profile?.family,
      ...(profile?.aliases || []),
      family?.id,
      family?.family,
      ...(family?.aliases || [])
    ].map((item) => String(item || "").toUpperCase());
    return tokens.some((token) =>
      token.includes("045A20") ||
      token.includes("RAJ240045") ||
      token.includes("RAJ240_045A20") ||
      token.includes("AS16A5K"));
  }

  function isReadOnlyRecoveryOperation(operation) {
    const kind = String(operation?.kind || "");
    return kind === "probe" ||
      kind === "universal-read-info" ||
      kind === "universal-read-status" ||
      kind === "universal-scan-commands" ||
      kind === "universal-check-cells" ||
      kind === "universal-protection-status" ||
      kind === "bq30-status" ||
      kind === "bq30-check-cell" ||
      kind === "bq40-status" ||
      kind === "renesas045-status" ||
      kind === "renesas045-identity" ||
      kind === "renesas045-manufacturer" ||
      kind === "renesas045-after-cell";
  }

  function isCellCheckRecoveryOperation(operation) {
    const kind = String(operation?.kind || "");
    return kind === "universal-check-cells" || kind === "bq30-check-cell";
  }

  function showRecoveryTargetInputs(operation) {
    const kind = String(operation?.kind || "");
    return kind === "universal-check-cells" ||
      kind === "universal-refresh-gauge" ||
      kind.startsWith("bq30");
  }

  function bq30OperationNote(operation) {
    switch (operation?.kind) {
      case "bq30-status":
        return "Baca SEC, PF, Safety, FET, dan status register BQ30 sebelum tindakan lain.";
      case "bq30-full-access":
        return "Buka Full Access memakai flow BQ30 yang sudah tervalidasi. Step ini belum clear PF atau enable FET.";
      case "bq30-clear-protection":
        return "Clear Protection setelah Full Access aktif. Status PF/Safety dibaca ulang sebelum lanjut.";
      case "bq30-unlock-fet":
        return "Enable CHG/DSG FET hanya setelah Full Access, PF clear, dan Safety clear.";
      case "bq30-check-cell":
        return "Continue baca cell, suhu, SOC, kapasitas, delta, target inject, dan hasil recheck sampai Stop ditekan.";
      case "bq30-calibration":
        return "Kirim trigger ManufacturerAccess untuk refresh/recalc gauge, tunggu settle, lalu baca ulang kapasitas, cell, PF/Safety, FET, level, dan health.";
      default:
        return "Flow BQ30 mengikuti urutan Read Info, Read Status, Scan Commands, Check Cells, Protection Status, Clear Protection, Full Access, Unlock FET, Refresh Gauge / Relearn.";
    }
  }

  function universalOperationNote(operation, profile, family) {
    const chipText = [profile?.family || family?.family || "", profile?.name || family?.id || ""].filter(Boolean).join(" / ") || "selected IC";
    switch (operation?.kind) {
      case "universal-read-info":
        return "Baca Manufacturer, Device Name, Serial, Chemistry, Design Capacity, dan Design Voltage.";
      case "universal-read-status":
        return "Baca Voltage, Current, Remaining Capacity, Full Charge Capacity, Temperature, Battery Status, dan RSoC.";
      case "universal-scan-commands":
        return "Scan read-word command 0x00 sampai 0xFF dan catat command yang ACK.";
      case "universal-check-cells":
        return "Continue baca cell voltage, delta, target inject/recheck, level, dan health sampai Stop ditekan.";
      case "universal-protection-status":
        return "Baca status proteksi. BQ30/BQ40 memakai decoder PF/Safety/FET; chip lain memakai SBS/protection read-only.";
      case "universal-clear-protection":
        return "Clear Protection hanya dikirim jika handler chip sudah tervalidasi dan Write enable aktif.";
      case "universal-full-access":
        return "Full Access diarahkan ke handler chip yang tersedia untuk seri/IC terpilih.";
      case "universal-unlock-fet":
        return "Unlock FET hanya dikirim jika Full Access/protection state mendukung dan handler chip tersedia.";
      case "universal-refresh-gauge":
        return "Refresh Gauge / Relearn mengirim trigger refresh/recalc hanya jika writer chip sudah tervalidasi.";
      default:
        return `Target operasi universal untuk ${chipText}.`;
    }
  }

  function renesas045A20OperationNote(operation) {
    switch (operation?.kind) {
      case "renesas045-status":
        return "Baca SBS status, kapasitas, cell voltage, dan BatteryStatus 0x16 untuk 045A20 tanpa write.";
      case "renesas045-identity":
        return "Baca Manufacturer Name, Device Name, Chemistry, ManufacturerData 0x23, dan optional 0x2F tanpa write.";
      case "renesas045-manufacturer":
        return "Probe area manufacturer 0x23/0x2F dan cell voltage 0x3C-0x3F tanpa selector BQ30.";
      case "renesas045-after-cell":
        return "Cek ulang kondisi setelah cell dipulihkan: voltage, SOC, FCC, design, cycle, dan balance.";
      case "renesas045-unlock-fet":
        return "Eksperimental 045A20: baca status 0x50-0x54, kirim kandidat PF/FET dengan izin write, lalu bandingkan status sebelum/sesudah. Sambungkan SP/yellow ke GND untuk test FET valid.";
      default:
        return "Operasi 045A20 read-only. Tidak memakai command BQ30.";
    }
  }

  function renderBq30RecoveryGuidance(state, operation) {
    const kind = String(operation?.kind || "");
    if (!kind.startsWith("bq30-")) {
      return "";
    }
    if (kind === "bq30-status" || kind === "bq30-full-access" || kind === "bq30-clear-protection" || kind === "bq30-unlock-fet") {
      return "";
    }

    const targetBalanceDeltaMv = Number(state.bq30TargetBalanceDeltaMv || 30);
    const targetLevelPercent = Number(state.bq30TargetLevelPercent || 100);
    const targetHealthPercent = Number(state.bq30TargetHealthPercent || 100);
    const rows = Array.isArray(state.monitorRows) ? state.monitorRows : [];
    const analysis = bq30CellBalanceAnalysis(rows, targetBalanceDeltaMv);
    const mode = kind === "bq30-calibration" ? "calibration" : "balance";
    const title = kind === "bq30-calibration" ? "Refresh Gauge / Relearn guidance" : "Check Cells guidance";
    const headline = kind === "bq30-calibration"
      ? "Refresh Gauge / Relearn kirim trigger lalu readback"
      : (analysis.needsBalance ? "Cell target siap disuntik" : "Cell sudah masuk target");
    const currentLevel = calculateChargePercent(rows);
    const currentHealth = calculateHealthPercent(rows);
    const currentLevelText = currentLevel === null ? "Unknown" : `${formatNumber(currentLevel, 0)}%`;
    const currentHealthText = currentHealth === null ? "Unknown" : `${formatNumber(currentHealth, 0)}%`;
    const instruction = bq30CellInstructionText(
      analysis,
      mode,
      `${formatNumber(targetBalanceDeltaMv, 0)} mV`
    );
    const detailText = kind === "bq30-calibration"
      ? `Target level ${formatNumber(targetLevelPercent, 0)}% dan target health ${formatNumber(targetHealthPercent, 0)}% dipakai sebagai goal. Current level ${currentLevelText}, health ${currentHealthText}.`
      : `Current delta ${analysis.deltaText}. Target balance ${formatNumber(targetBalanceDeltaMv, 0)} mV.`;
    return `
      <div class="battery-bq30-guidance">
        <div class="battery-bq30-guidance-head">
          <div class="battery-bq30-guidance-copy">
            <p class="label">${escapeHtml(title)}</p>
            <h4>${escapeHtml(headline)}</h4>
            <p>${escapeHtml(instruction)}</p>
          </div>
          <div class="battery-bq30-guidance-chips">
            <span class="battery-bq30-chip">${escapeHtml(analysis.packType === "-" ? "No pack" : analysis.packType)}</span>
            <span class="battery-bq30-chip">Delta ${escapeHtml(analysis.deltaText || "-")}</span>
            <span class="battery-bq30-chip">${escapeHtml(analysis.primaryCell ? `Primary Cell ${analysis.primaryCell.index}` : "No primary")}</span>
            <span class="battery-bq30-chip">Target ${escapeHtml(analysis.targetVoltageText || "-")}</span>
          </div>
        </div>
        <div class="battery-bq30-guidance-grid">
          <div class="battery-bq30-guidance-copy">
            <div class="battery-bq30-guidance-stats">
              <div class="battery-bq30-stat">
                <span>Pack</span>
                <strong>${escapeHtml(analysis.packType === "-" ? "-" : `${analysis.packType} detected`)}</strong>
              </div>
              <div class="battery-bq30-stat">
                <span>Primary inject</span>
                <strong>${escapeHtml(analysis.primaryCell ? `Cell ${analysis.primaryCell.index}` : "-")}</strong>
              </div>
              <div class="battery-bq30-stat">
                <span>Secondary</span>
                <strong>${escapeHtml(analysis.secondaryCells.length ? analysis.secondaryCells.map((cell) => `Cell ${cell.index}`).join(", ") : "-")}</strong>
              </div>
              <div class="battery-bq30-stat">
                <span>Current / Target</span>
                <strong>${escapeHtml(kind === "bq30-calibration"
                  ? `${currentLevelText} / ${formatNumber(targetLevelPercent, 0)}%`
                  : `${analysis.deltaText || "-"} / ${formatNumber(targetBalanceDeltaMv, 0)} mV`)}</strong>
              </div>
              <div class="battery-bq30-stat">
                <span>Health / Target</span>
                <strong>${escapeHtml(`${currentHealthText} / ${formatNumber(targetHealthPercent, 0)}%`)}</strong>
              </div>
            </div>
            <p class="spi-note battery-bq30-guidance-note">${escapeHtml(detailText)}</p>
          </div>
          ${renderBq30CellPackVisual(analysis, mode)}
        </div>
      </div>
    `;
  }

  function bq30CheckCellFieldValue(rows, key, fallback = "-") {
    const row = monitorRowByKey(rows, key);
    const value = rowValueForDisplay(row);
    if (!row || value === "-") {
      return fallback;
    }
    return `${value}${row.unit ? ` ${row.unit}` : ""}`;
  }

  function renderBq30CheckCellField(label, value, detail = "") {
    return `
      <div class="battery-bq30-check-field">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value || "-")}</strong>
        ${detail ? `<small>${escapeHtml(detail)}</small>` : ""}
      </div>
    `;
  }

  function renderBq30CheckCellPanel(state) {
    const rows = Array.isArray(state.monitorRows) ? state.monitorRows : [];
    const targetDeltaMv = Number(state.bq30TargetBalanceDeltaMv || 30);
    const analysis = bq30CellBalanceAnalysis(rows, targetDeltaMv);
    const health = calculateHealthPercent(rows);
    const charge = calculateChargePercent(rows);
    const instruction = bq30CellInstructionText(analysis, "balance", `${formatNumber(targetDeltaMv, 0)} mV`);
    const primaryInject = analysis.primaryCell ? `Cell ${analysis.primaryCell.index}` : "-";
    const secondaryInject = analysis.secondaryCells.length
      ? analysis.secondaryCells.map((cell) => `Cell ${cell.index}`).join(", ")
      : "-";
    const fields = [
      ["Action", instruction, `target delta ${formatNumber(targetDeltaMv, 0)} mV`],
      ["Primary Inject", primaryInject, analysis.needsBalance ? "suntik dulu" : "tidak perlu"],
      ["Secondary", secondaryInject, analysis.secondaryCells.length ? "cek setelah primary" : "tidak ada"],
      ["Target Voltage", analysis.targetVoltageText || "-", "batas aman recheck"],
      ["Temperature", bq30CheckCellFieldValue(rows, "temperature"), "0x08"],
      ["Pack Voltage", bq30CheckCellFieldValue(rows, "voltage"), "0x09"],
      ["Current", bq30CheckCellFieldValue(rows, "current"), "0x0A"],
      ["Average Current", bq30CheckCellFieldValue(rows, "averageCurrent"), "0x0B"],
      ["Level / RSoC", charge === null ? bq30CheckCellFieldValue(rows, "relativeSoc") : `${formatNumber(charge, 0)}%`, "0x0D"],
      ["Health / SOH", health === null ? "-" : `${formatNumber(health, 0)}%`, "FCC / Design"],
      ["Remaining Capacity", bq30CheckCellFieldValue(rows, "remainingCapacity"), "0x0F"],
      ["Full Charge Capacity", bq30CheckCellFieldValue(rows, "fullChargeCapacity"), "0x10"],
      ["Design Capacity", bq30CheckCellFieldValue(rows, "designCapacity"), "0x18"],
      ["Design Voltage", bq30CheckCellFieldValue(rows, "designVoltage"), "0x19"],
      ["Cycle Count", bq30CheckCellFieldValue(rows, "cycleCount"), "0x17"],
      ["Battery Status", bq30CheckCellFieldValue(rows, "batteryStatus"), "0x16"],
      ["Cell 1", bq30CheckCellFieldValue(rows, "cellVoltage1"), "0x3F"],
      ["Cell 2", bq30CheckCellFieldValue(rows, "cellVoltage2"), "0x3E"],
      ["Cell 3", bq30CheckCellFieldValue(rows, "cellVoltage3"), "0x3D"],
      ["Cell 4", bq30CheckCellFieldValue(rows, "cellVoltage4"), "0x3C"],
      ["Cell Delta", analysis.deltaText || "-", `target ${formatNumber(targetDeltaMv, 0)} mV`],
      ["Pack Type", analysis.packType === "-" ? "-" : analysis.packType, "active cells"],
      ["Security", bq30CheckCellFieldValue(rows, "bq30Security"), "MA status"],
      ["FET", bq30CheckCellFieldValue(rows, "bq30FetStatus"), "CHG / DSG"],
      ["PF Status", bq30CheckCellFieldValue(rows, "bq30PfStatus"), "Permanent failure"],
      ["Safety Status", bq30CheckCellFieldValue(rows, "bq30SafetyStatus"), "Safety flags"]
    ];
    return `
      <div class="battery-bq30-check-panel">
        <div class="battery-bq30-check-visual">
          ${renderBq30CellPackVisual(analysis, "balance")}
        </div>
        <div class="battery-bq30-check-fields">
          ${fields.map(([label, value, detail]) => renderBq30CheckCellField(label, value, detail)).join("")}
        </div>
      </div>
    `;
  }

  function visibleMonitorParameters(rows = []) {
    return monitorParameters.filter((parameter) => isSbsMonitorCommand(parameter));
  }

  function renderRecoveryResultPanel(state, operation) {
    const rows = Array.isArray(state.bq30RecoveryRows) ? state.bq30RecoveryRows : [];
    const isBq30CheckCell = isCellCheckRecoveryOperation(operation);
    return `
      <section class="spi-card battery-result-panel">
        <div class="spi-card-head">
          <div>
            <p class="label">Result</p>
            <h4>${isBq30CheckCell ? "Check Cells" : "Operation Log"}</h4>
          </div>
        </div>
        ${isBq30CheckCell ? renderBq30CheckCellPanel(state) : `
        ${renderBq30RecoveryGuidance(state, operation)}
        <div class="battery-table-wrap">
          <table class="battery-table">
            <thead>
              <tr><th>Item</th><th>Cmd</th><th>Write</th><th>Read</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${rows.map((row) => `
                <tr>
                  <td>${escapeHtml(row.label || "-")}</td>
                  <td>${escapeHtml(row.command || row.subCommand || "-")}</td>
                  <td>${escapeHtml(row.writeHex || "-")}</td>
                  <td>${escapeHtml(row.readHex || "-")}</td>
                  <td>${escapeHtml(row.status || "-")}</td>
                </tr>
              `).join("") || `<tr><td colspan="5">Belum ada hasil operasi.</td></tr>`}
            </tbody>
          </table>
        </div>
        `}
      </section>
    `;
  }

  function renderRecovery(state) {
    const cellCheckRunning = Boolean(state.bq30CellCheckRunning);
    const busy = state.busy || state.monitorRunning || cellCheckRunning;
    const busLocked = hasBatteryBusLock(state);
    const profiles = getProfiles(state);
    const profile = selectedProfile(state);
    const selectedFamily = selectedCatalogFamily(state);
    const operation = selectedRecoveryOperation(state, profile, selectedFamily);
    const action = operation?.action || selectedAction(state, profile);
    const seriesOptions = buildSeriesOptions(state);
    const selectedSeriesValue = selectedFamily && !findProfileForFamily(state, selectedFamily)
      ? `catalog:${selectedFamily.id}`
      : `profile:${profile?.id || ""}`;
    const selectedFamilyIsReferenceOnly = selectedSeriesValue.startsWith("catalog:");
    const operationRequiresWrite = !isReadOnlyRecoveryOperation(operation);
    const isCellCheckOperation = isCellCheckRecoveryOperation(operation);
    const showTargetInputs = showRecoveryTargetInputs(operation);
    const executeDisabled = isCellCheckOperation
      ? state.busy || state.monitorRunning || cellCheckRunning || !busLocked || !operation || !state.isolatedConfirmed
      : busy || !busLocked || !operation || !state.isolatedConfirmed || (operationRequiresWrite && !state.writeConfirmed);
    const previewDisabled = busy || !busLocked || operation?.kind !== "profile" || !profile || !action;
    const executeLabel = isCellCheckOperation
      ? (cellCheckRunning ? "Checking" : "Continue")
      : operation?.kind === "probe"
        ? "Set Probe"
        : "Run";
    const executeIcon = cellCheckRunning
      ? "progress_activity"
      : operation?.kind === "probe"
        ? "search"
        : isCellCheckOperation
          ? "play_circle"
          : "play_arrow";
    const steps = operation?.kind === "profile" ? state.recoveryPreview?.steps || action?.steps || [] : [];
    return `
      <section class="spi-card battery-panel-main">
        <div class="spi-card-head">
          <div>
            <p class="label">Profiles</p>
            <h4>Recovery / Unlock</h4>
          </div>
          <div class="battery-action-row">
            <button id="batteryRecoveryPreviewButton" type="button" class="ghost"${previewDisabled ? " disabled" : ""}>
              <span class="material-symbols-outlined">visibility</span>
              <span>Preview</span>
            </button>
            <button id="batteryRecoveryExecuteButton" type="button"${executeDisabled ? " disabled" : ""}>
              <span class="material-symbols-outlined${state.busy || cellCheckRunning ? " is-spinning" : ""}">${executeIcon}</span>
              <span>${executeLabel}</span>
            </button>
            ${isCellCheckOperation ? `
              <button id="batteryBq30StopCellCheckButton" type="button" class="ghost"${cellCheckRunning ? "" : " disabled"}>
                <span class="material-symbols-outlined">stop_circle</span>
                <span>Stop</span>
              </button>
            ` : ""}
          </div>
        </div>
        <div class="spi-form-grid">
          <label>
            Seri / IC
            <select id="batteryProfileSelect"${busy ? " disabled" : ""}>
              ${seriesOptions.map((item) => `<option value="${escapeHtml(item.value)}"${selectedSeriesValue === item.value ? " selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
            </select>
          </label>
          <label>
            Operasi
            <select id="batteryActionSelect"${busy || !operation ? " disabled" : ""}>
              ${recoveryOperations(state, profile, selectedFamily).map((item) => `<option value="${escapeHtml(item.id)}"${operation?.id === item.id ? " selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="battery-confirm-row">
          <label><input id="batteryRecoveryIsolatedConfirmed" type="checkbox"${state.isolatedConfirmed ? " checked" : ""}${busy ? " disabled" : ""}> <span>Battery isolated</span></label>
          <label><input id="batteryRecoveryWriteConfirmed" type="checkbox"${state.writeConfirmed ? " checked" : ""}${busy ? " disabled" : ""}> <span>Write enable</span></label>
        </div>
        ${showTargetInputs ? `
          <div class="spi-form-grid battery-bq30-params">
            <label>
              Target balance delta (mV)
              <input id="batteryBq30TargetBalanceDeltaMv" type="number" min="1" max="500" value="${Number(state.bq30TargetBalanceDeltaMv || 30)}"${busy ? " disabled" : ""}>
            </label>
            <label>
              Target level (%)
              <input id="batteryBq30TargetLevelPercent" type="number" min="0" max="100" value="${Number(state.bq30TargetLevelPercent || 100)}"${busy ? " disabled" : ""}>
            </label>
            <label>
              Target health (%)
              <input id="batteryBq30TargetHealthPercent" type="number" min="0" max="100" value="${Number(state.bq30TargetHealthPercent || 100)}"${busy ? " disabled" : ""}>
            </label>
          </div>
          <p class="spi-note battery-bq30-params-note">Check Cells memakai target delta untuk instruksi inject dan recheck. Refresh Gauge / Relearn mengirim trigger refresh/recalc lalu membaca ulang hasil gauge jika handler chip tersedia.</p>
        ` : ""}
      </section>
      <section class="spi-card battery-sequence-panel">
        <div class="spi-card-head">
          <div>
            <p class="label">Sequence</p>
            <h4>${escapeHtml(operation?.name || "No operation")}</h4>
          </div>
          <span class="spi-mini-badge">${operation?.kind === "profile" ? `${steps.length} step` : operation?.kind || "-"}</span>
        </div>
        <div class="battery-step-list">
          ${operation?.kind?.startsWith("universal") ? `
            <div class="battery-step">
              <strong>${Number(operation.order || 1)}</strong>
              <span>${operationRequiresWrite ? "guarded-write" : "read-only"}</span>
              <code>${escapeHtml(operation.target || operation.name || "-")}</code>
              <small>${escapeHtml(universalOperationNote(operation, profile, selectedFamily))}</small>
            </div>
          ` : operation?.kind === "probe" ? `
            <div class="battery-step">
              <strong>1</strong>
              <span>read-only</span>
              <code>${escapeHtml(probeCommandForFamily(selectedFamily).command)}</code>
              <small>Gunakan SMBus Set Probe untuk capture awal. Tidak ada write otomatis untuk seri reference-only.</small>
            </div>
          ` : operation?.kind?.startsWith("bq30") ? `
            <div class="battery-step">
              <strong>1</strong>
              <span>${operationRequiresWrite ? "guarded-write" : "read-only"}</span>
              <code>BQ30</code>
              <small>${escapeHtml(bq30OperationNote(operation))}</small>
            </div>
          ` : operation?.kind?.startsWith("bq40") ? `
            <div class="battery-step">
              <strong>1</strong>
              <span>read-only</span>
              <code>BQ40</code>
              <small>Baca status langsung 0x50-0x57 plus SBS dasar. Tidak ada write pada operasi ini.</small>
            </div>
          ` : operation?.kind?.startsWith("renesas045") ? `
            <div class="battery-step">
              <strong>1</strong>
              <span>read-only</span>
              <code>045A20</code>
              <small>${escapeHtml(renesas045A20OperationNote(operation))}</small>
            </div>
          ` : steps.map((step) => `
            <div class="battery-step">
              <strong>${step.order}</strong>
              <span>${escapeHtml(step.type)}</span>
              <code>${escapeHtml([step.command, step.subCommand].filter(Boolean).join(" / ") || "-")}</code>
              <small>${escapeHtml(step.detail)}</small>
            </div>
          `).join("") || `<div class="battery-step"><strong>-</strong><span>No step</span><code>-</code><small>-</small></div>`}
        </div>
      </section>
      ${renderRecoveryResultPanel(state, operation)}
    `;
  }

  function createWorkbenchMarkup(state) {
    const body = state.activeTab === "smbus"
      ? renderSmbus(state)
      : state.activeTab === "recovery"
        ? renderRecovery(state)
        : state.activeTab === "data"
          ? renderData(state)
          : renderMonitor(state);
    return `
      <div class="battery-unlock-workbench spi-scope-theme">
        ${renderGlobalControls(state)}
        <div class="battery-tab-shell">
          ${renderTabs(state)}
          <div class="battery-tab-body">
            ${body}
          </div>
        </div>
      </div>
    `;
  }

  function createApi() {
    let state = { ...defaultState, metrics: createInitialMetrics() };
    let mountedContainer = null;
    let monitorRunId = 0;
    let monitorAbortController = null;
    let batteryOperationAbortController = null;
    let batteryOperationId = 0;
    let bq30CellCheckAbortController = null;
    let bq30CellCheckRunId = 0;
    let notifyUser = () => {};
    let lastMonitorToastMessage = "";
    let lastMonitorToastAt = 0;

    function setState(patch) {
      state = { ...state, ...patch };
      render();
    }

    function notifyMonitorIssue(message, tone = "warning") {
      const text = String(message || "").trim();
      if (!text) {
        return;
      }
      const now = Date.now();
      if (text === lastMonitorToastMessage && now - lastMonitorToastAt < 8000) {
        return;
      }
      lastMonitorToastMessage = text;
      lastMonitorToastAt = now;
      notifyUser(text, tone);
    }

    function setTabMessage(tab, message) {
      if (tab === "monitor") {
        setState({ monitorMessage: message });
      } else if (tab === "smbus") {
        setState({ apiMessage: message });
      } else if (tab === "data") {
        setState({ dataMessage: message });
      } else {
        setState({ recoveryMessage: message });
      }
    }

    function requireBatteryBusLock(tab = state.activeTab) {
      if (hasBatteryBusLock(state)) {
        return true;
      }
      const message = "Jalankan Detek dulu. Operasi Battery Unlock dikunci sampai Device Name 0x21 valid dan SCL/SDA terkunci.";
      setTabMessage(tab, message);
      notifyUser(message, "warning");
      return false;
    }

    function abortActiveBatteryOperation() {
      if (batteryOperationAbortController) {
        batteryOperationAbortController.abort();
        batteryOperationAbortController = null;
      }
      activeBatteryOperationSignal = null;
      batteryOperationId += 1;
    }

    function stopBq30CellCheck(message = "Check Cells dihentikan.") {
      if (bq30CellCheckAbortController) {
        bq30CellCheckAbortController.abort();
        bq30CellCheckAbortController = null;
      }
      bq30CellCheckRunId += 1;
      if (state.bq30CellCheckRunning) {
        setState({
          bq30CellCheckRunning: false,
          recoveryMessage: message
        });
      }
    }

    async function withBusy(work, options = {}) {
      if (state.busy) {
        return;
      }
      if (state.bq30CellCheckRunning) {
        stopBq30CellCheck("Check Cells dihentikan karena operasi lain dimulai.");
      }
      if (state.monitorRunning) {
        stopMonitor("Monitoring dihentikan karena operasi Battery Unlock lain dimulai.");
      }
      abortActiveBatteryOperation();
      const operationController = new AbortController();
      batteryOperationAbortController = operationController;
      activeBatteryOperationSignal = operationController.signal;
      const operationId = batteryOperationId + 1;
      batteryOperationId = operationId;
      const tabAtStart = state.activeTab;
      setState({ busy: true });
      try {
        if (options.resetSession === true) {
          await resetBackendBatterySessionForStart(state.deviceType, operationController.signal);
        }
        if (batteryOperationId !== operationId || operationController.signal.aborted) {
          return;
        }
        await work(operationController.signal);
      } catch (error) {
        if (batteryOperationId !== operationId || operationController.signal.aborted || error?.name === "AbortError") {
          return;
        }
        const message = error?.message || "Operasi Battery Unlock gagal.";
        setTabMessage(tabAtStart, message);
        notifyUser(message, "warning");
      } finally {
        if (batteryOperationId === operationId) {
          batteryOperationAbortController = null;
          activeBatteryOperationSignal = null;
          setState({ busy: false });
        }
      }
    }

    function freshBatteryBusSessionPatch(extra = {}) {
      return {
        smbusPinMode: hasBatteryBusLock(state) ? state.busPinMode : "auto",
        smbusRequireIdle: false,
        smbusResult: null,
        smbusDiagnostic: null,
        smbusGaugeProbe: null,
        ...extra
      };
    }

  function clearBatteryBusLockPatch(message = "Detek SCL/SDA belum dijalankan.") {
      return {
        busDetected: false,
        busPinMode: "",
        busDeviceName: "",
        busDetectRawHex: "",
        busDetectedAt: "",
        busDetectMessage: message,
        busChip: "",
        busChipFamily: "",
        busChipManufacturer: "",
        busChipNotes: "",
        busChipUpdatedAt: "",
        busChipUpdatedBy: "",
        busChipDatabaseHash: "",
        busChipMessage: "Chip/IC belum diprobe.",
        smbusPinMode: "auto"
      };
    }

    async function detectDeviceNameWithPinMode(deviceType, pinMode, signal) {
      const plans = [
        { label: "ManufacturerName", command: "0x20", text: true },
        { label: "DeviceName", command: "0x21", text: true },
        { label: "DeviceChemistry", command: "0x22", text: true },
        { label: "ManufacturerData", command: "0x23", text: false }
      ];
      const attempts = [];
      let manufacturerName = "";
      let deviceName = "";
      let chemistry = "";
      let fallbackResult = null;

      for (const plan of plans) {
        try {
          const result = await fetchJson("/tools/battery-unlock/smbus/command", {
            method: "POST",
            timeoutMs: busDetectRequestTimeoutMs,
            signal,
            body: JSON.stringify({
              deviceType,
              operation: "read-block",
              address: "0x0B",
              command: plan.command,
              readLength: 33,
              requireBusIdle: false,
              pinMode,
              speedMode: state.smbusSpeedMode || "auto",
              isolatedBatteryConfirmed: true,
              writeEnableConfirmed: false,
              keepDeviceOpen: true
            })
          });
          fallbackResult = fallbackResult || result;
          const text = plan.text ? decodeBlockText(parseHexBytes(result.readHex)) : "";
          if (plan.command === "0x20" && isValidDeviceName(text)) {
            manufacturerName = text;
          }
          if (plan.command === "0x21" && isValidDeviceName(text)) {
            deviceName = text;
          }
          if (plan.command === "0x22" && isValidDeviceName(text)) {
            chemistry = text;
          }
          if (deviceName || manufacturerName || chemistry || (plan.command === "0x23" && result?.readHex)) {
            return {
              result,
              deviceName: deviceName || manufacturerName || chemistry || "SMBus battery",
              manufacturerName,
              chemistry
            };
          }
          attempts.push(`${plan.command}: data kosong`);
        } catch (error) {
          attempts.push(`${plan.command}: ${error?.message || "gagal"}`);
        }
      }

      try {
        const diagnostic = await fetchJson("/tools/battery-unlock/smbus/diagnostic", {
          method: "POST",
          timeoutMs: busDetectRequestTimeoutMs,
          signal,
          body: JSON.stringify({
            deviceType,
            address: "0x0B",
            command: "0x21",
            scanAddresses: true,
            quickProbe: false,
            pinMode,
            speedMode: state.smbusSpeedMode || "auto",
            isolatedBatteryConfirmed: true,
            keepDeviceOpen: false
          })
        });
        if (diagnostic?.batteryDetected) {
          throw new Error(`Address 0x0B ACK pada ${pinMode.toUpperCase()}, tetapi identity 0x20-0x23 belum bisa dibaca. ${attempts.join(" | ")}`);
        }
      } catch (error) {
        if (String(error?.message || "").includes("Address 0x0B ACK")) {
          throw error;
        }
      }

      throw new Error(`Universal identity 0x20-0x23 gagal pada ${pinMode.toUpperCase()}. ${attempts.join(" | ")}`);
    }

    function chipProbePatch(result) {
      const mapped = result?.mapped || decodeBatteryChipFromDeviceType(result?.deviceTypeHex);
      const chip = String(result?.chip || mapped?.chip || "").trim();
      const family = String(result?.family || mapped?.family || "").trim();
      const profilePatch = profileSelectionPatchForChip(chip, family);
      return {
        busChip: chip,
        busChipFamily: family,
        busChipManufacturer: result?.manufacturerName || "",
        busChipNotes: result?.notes || "",
        busChipUpdatedAt: "",
        busChipUpdatedBy: "",
        busChipCanEdit: false,
        busChipDatabaseHash: "",
        busChipMessage: chip
          ? `Chip/IC hardware terbaca ${chip}.`
          : result?.message || "Probe Chip/IC selesai.",
        ...profilePatch
      };
    }

    function wordHexFromPayload(payload) {
      if (!Array.isArray(payload) || payload.length < 2) {
        return "";
      }
      const word = payload[0] | (payload[1] << 8);
      return `0x${word.toString(16).toUpperCase().padStart(4, "0")}`;
    }

    function blockPayload(readHex) {
      const bytes = parseHexBytes(readHex);
      if ((bytes[0] || 0) > 32) {
        return [];
      }
      const count = Math.min(bytes[0] || 0, bytes.length - 1);
      return count > 0 ? bytes.slice(1, 1 + count) : [];
    }

    function isUsableDeviceTypeHex(deviceTypeHex, rejectedValues = []) {
      const normalized = String(deviceTypeHex || "").trim().toUpperCase();
      const value = normalized.replace(/^0X/, "");
      if (!value || value === "0000" || value === "FFFF" || value === "0001" || value.startsWith("FF") || value.endsWith("FF")) {
        return false;
      }
      return !rejectedValues.map((item) => String(item || "").trim().toUpperCase()).includes(normalized);
    }

    function findLikelyDeviceTypeHex(payload) {
      if (!Array.isArray(payload) || payload.length < 2) {
        return "";
      }

      const candidates = [];
      for (let index = 0; index + 1 < payload.length; index += 1) {
        const word = payload[index] | (payload[index + 1] << 8);
        if (word === 0x0000 || word === 0xFFFF) {
          continue;
        }

        const deviceTypeHex = `0x${word.toString(16).toUpperCase().padStart(4, "0")}`;
        if (!isUsableDeviceTypeHex(deviceTypeHex)) {
          continue;
        }
        candidates.push({
          deviceTypeHex,
          mapped: decodeBatteryChipFromDeviceType(deviceTypeHex),
          index
        });
      }

      const mappedCandidate = candidates.find((candidate) => candidate.mapped);
      return mappedCandidate?.deviceTypeHex || candidates[0]?.deviceTypeHex || "";
    }

    function decodeBatteryChipFromDeviceType(deviceTypeHex) {
      const key = String(deviceTypeHex || "").replace(/^0x/i, "").toUpperCase().padStart(4, "0");
      return batteryChipDecodeRules[key] || null;
    }

    function isKnownRenesas045A20Identity(deviceName, manufacturerName) {
      const normalizedDeviceName = String(deviceName || "").trim().toUpperCase();
      const normalizedManufacturerName = String(manufacturerName || "").trim().toUpperCase();
      return normalizedDeviceName.includes("AS16A5K") &&
        (normalizedManufacturerName === "PANASONIC" || normalizedManufacturerName === "SANYO");
    }

    function isValidRenesas045A20Challenge(readHex) {
      const payload = blockPayload(readHex);
      if (payload.length < 2) {
        return false;
      }
      const unique = uniqueNonEmpty(payload.map((value) => value.toString(16).padStart(2, "0")));
      return unique.length > 1 && !payload.every((value) => value === 0x00 || value === 0xFF);
    }

    function uniqueNonEmpty(values) {
      return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
    }

    async function sendBatteryDetectCommand({ deviceType, pinMode, signal, operation, command, dataHex = "", readLength = 2, write = false }) {
      return fetchJson("/tools/battery-unlock/smbus/command", {
        method: "POST",
        timeoutMs: busDetectRequestTimeoutMs,
        signal,
        body: JSON.stringify({
          deviceType,
          operation,
          address: "0x0B",
          command,
          dataHex,
          readLength,
          requireBusIdle: false,
          pinMode,
          speedMode: state.smbusSpeedMode || "auto",
          isolatedBatteryConfirmed: true,
          writeEnableConfirmed: write,
          keepDeviceOpen: true
        })
      });
    }

    async function tryReadBlockTextForDetect(deviceType, pinMode, command, signal) {
      try {
        const result = await sendBatteryDetectCommand({
          deviceType,
          pinMode,
          signal,
          operation: "read-block",
          command,
          readLength: 33
        });
        return decodeBlockText(parseHexBytes(result.readHex));
      } catch {
        return "";
      }
    }

    async function probeManufacturerDataDirectDeviceType(deviceType, pinMode, signal) {
      const read = await sendBatteryDetectCommand({
        deviceType,
        pinMode,
        signal,
        operation: "read-block",
        command: "0x23",
        readLength: 33
      });
      const deviceTypeHex = findLikelyDeviceTypeHex(blockPayload(read.readHex));
      if (!deviceTypeHex) {
        throw new Error("ManufacturerData 0x23 tidak memberi Device Type.");
      }
      return {
        method: "Direct read-block 0x23",
        deviceTypeHex,
        rawHex: read.readHex || ""
      };
    }

    async function probeTiManufacturerDataDeviceType(deviceType, pinMode, signal) {
      return probeTiManufacturerDataSubcommand(deviceType, pinMode, signal, {
        label: "MA 0x0001 -> 0x23",
        dataHex: "01 00",
        deviceTypeResult: true
      });
    }

    async function probeTiManufacturerDataSubcommand(deviceType, pinMode, signal, options) {
      await sendBatteryDetectCommand({
        deviceType,
        pinMode,
        signal,
        operation: "write-word",
        command: "0x00",
        dataHex: options.dataHex,
        readLength: 0,
        write: true
      });
      await delay(180);
      const read = await sendBatteryDetectCommand({
        deviceType,
        pinMode,
        signal,
        operation: "read-block",
        command: "0x23",
        readLength: 33
      });
      if (!options.deviceTypeResult) {
        return {
          method: options.label,
          rawHex: read.readHex || "",
          supportOnly: true
        };
      }
      const deviceTypeHex = findLikelyDeviceTypeHex(blockPayload(read.readHex));
      if (!isUsableDeviceTypeHex(deviceTypeHex, options.rejectHex ? [options.rejectHex] : [])) {
        throw new Error("ManufacturerData 0x23 tidak memberi Device Type.");
      }
      return {
        method: options.label,
        deviceTypeHex,
        rawHex: read.readHex || ""
      };
    }

    async function probeTiFirmwareVersion(deviceType, pinMode, signal) {
      return probeTiManufacturerDataSubcommand(deviceType, pinMode, signal, {
        label: "MA 0x0002 -> 0x23 FirmwareVersion",
        dataHex: "02 00"
      });
    }

    async function probeTiChemId(deviceType, pinMode, signal) {
      return probeTiManufacturerDataSubcommand(deviceType, pinMode, signal, {
        label: "MA 0x0006 -> 0x23 ChemID",
        dataHex: "06 00"
      });
    }

    async function probeTiLegacyManufacturerDataDeviceType(deviceType, pinMode, signal) {
      return probeTiManufacturerDataSubcommand(deviceType, pinMode, signal, {
        label: "MA 0x0100 -> 0x23 Legacy DeviceType",
        dataHex: "00 01",
        rejectHex: "0x0100",
        deviceTypeResult: true
      });
    }

    async function probeSanyoManufacturerAccessBlockDeviceType(deviceType, pinMode, signal) {
      const attempts = [
        { label: "Sanyo MA 0x0050 -> read-block 0x00", dataHex: "50 00", rejectHex: "0x0050" },
        { label: "Sanyo MA 0x0001 -> read-block 0x00", dataHex: "01 00", rejectHex: "0x0001" }
      ];
      const failures = [];
      for (const attempt of attempts) {
        try {
          await sendBatteryDetectCommand({
            deviceType,
            pinMode,
            signal,
            operation: "write-word",
            command: "0x00",
            dataHex: attempt.dataHex,
            readLength: 0,
            write: true
          });
          await delay(180);
          const read = await sendBatteryDetectCommand({
            deviceType,
            pinMode,
            signal,
            operation: "read-block",
            command: "0x00",
            readLength: 33
          });
          const payload = blockPayload(read.readHex);
          const commandBytes = parseHexBytes(attempt.dataHex);
          const candidate = payload.length >= 4 && payload[0] === commandBytes[0] && payload[1] === commandBytes[1]
            ? payload.slice(2, 4)
            : payload.slice(0, 2);
          const deviceTypeHex = wordHexFromPayload(candidate);
          if (!isUsableDeviceTypeHex(deviceTypeHex, [attempt.rejectHex])) {
            throw new Error(`${attempt.label} belum memberi Device Type valid.`);
          }
          return {
            method: attempt.label,
            deviceTypeHex,
            rawHex: read.readHex || ""
          };
        } catch (error) {
          failures.push(error?.message || `${attempt.label} gagal`);
        }
      }
      throw new Error(failures.join(" | "));
    }

    async function probeRenesas045A20Rwr1Gate(deviceType, pinMode, signal, context = {}) {
      if (!isKnownRenesas045A20Identity(context.deviceName, context.manufacturerName)) {
        throw new Error("Renesas 045A20 identity belum cocok.");
      }

      const gates = [
        { label: "0x1402", dataHex: "14 02" },
        { label: "0x1502", dataHex: "15 02" },
        { label: "0x1602", dataHex: "16 02" },
        { label: "0x1702", dataHex: "17 02" }
      ];
      const validReads = [];
      const failures = [];
      for (const gate of gates) {
        try {
          await sendBatteryDetectCommand({
            deviceType,
            pinMode,
            signal,
            operation: "write-word",
            command: "0x71",
            dataHex: gate.dataHex,
            readLength: 0,
            write: true
          });
          await delay(150);
          const read = await sendBatteryDetectCommand({
            deviceType,
            pinMode,
            signal,
            operation: "read-block",
            command: "0x73",
            readLength: 33
          });
          if (isValidRenesas045A20Challenge(read.readHex)) {
            validReads.push(`${gate.label}:${read.readHex || ""}`);
          } else {
            failures.push(`${gate.label}: challenge tidak valid`);
          }
        } catch (error) {
          failures.push(`${gate.label}: ${error?.message || "gagal"}`);
        }
      }
      if (!validReads.length) {
        throw new Error(`Renesas 045A20 gate 0x71/0x73 belum valid. ${failures.join(" | ")}`);
      }
      return {
        method: "Renesas 045A20 RWR1 gate 0x71/0x73",
        deviceTypeHex: "",
        rawHex: validReads.join(" | "),
        mapped: {
          chip: "045A20",
          family: "Renesas",
          catalogFamilyId: "renesas-045a20-raj240045"
        },
        chip: "045A20",
        family: "Renesas"
      };
    }

    async function probeManufacturerAccessWordDeviceType(deviceType, pinMode, signal) {
      return probeManufacturerAccessWordSubcommandDeviceType(deviceType, pinMode, signal, {
        label: "MA 0x0001 -> read-word 0x00",
        dataHex: "01 00"
      });
    }

    async function probeTiLegacyManufacturerAccessWordDeviceType(deviceType, pinMode, signal) {
      return probeManufacturerAccessWordSubcommandDeviceType(deviceType, pinMode, signal, {
        label: "MA 0x0100 -> read-word 0x00",
        dataHex: "00 01",
        rejectHex: "0x0100"
      });
    }

    async function probeManufacturerAccessWordSubcommandDeviceType(deviceType, pinMode, signal, options) {
      await sendBatteryDetectCommand({
        deviceType,
        pinMode,
        signal,
        operation: "write-word",
        command: "0x00",
        dataHex: options.dataHex,
        readLength: 0,
        write: true
      });
      await delay(120);
      const read = await sendBatteryDetectCommand({
        deviceType,
        pinMode,
        signal,
        operation: "read-word",
        command: "0x00",
        readLength: 2
      });
      const deviceTypeHex = wordHexFromPayload(parseHexBytes(read.readHex));
      if (!isUsableDeviceTypeHex(deviceTypeHex, options.rejectHex ? [options.rejectHex] : [])) {
        throw new Error("Read-word 0x00 belum memberi Device Type valid.");
      }
      return {
        method: options.label,
        deviceTypeHex,
        rawHex: read.readHex || ""
      };
    }

    async function probeManufacturerBlockDeviceType(deviceType, pinMode, signal) {
      return probeManufacturerBlockSubcommand(deviceType, pinMode, signal, {
        label: "MBA 0x44/0x0100",
        dataHex: "01 00",
        deviceTypeResult: true
      });
    }

    async function probeManufacturerBlockFirmwareVersion(deviceType, pinMode, signal) {
      return probeManufacturerBlockSubcommand(deviceType, pinMode, signal, {
        label: "MBA 0x44/0x0200 FirmwareVersion",
        dataHex: "02 00"
      });
    }

    async function probeManufacturerBlockChemId(deviceType, pinMode, signal) {
      return probeManufacturerBlockSubcommand(deviceType, pinMode, signal, {
        label: "MBA 0x44/0x0600 ChemID",
        dataHex: "06 00"
      });
    }

    async function probeManufacturerBlockSubcommand(deviceType, pinMode, signal, options) {
      await sendBatteryDetectCommand({
        deviceType,
        pinMode,
        signal,
        operation: "write-block",
        command: "0x44",
        dataHex: options.dataHex,
        readLength: 0,
        write: true
      });
      await delay(180);
      const read = await sendBatteryDetectCommand({
        deviceType,
        pinMode,
        signal,
        operation: "read-block",
        command: "0x44",
        readLength: 33
      });
      if (!options.deviceTypeResult) {
        return {
          method: options.label,
          rawHex: read.readHex || "",
          supportOnly: true
        };
      }
      const payload = blockPayload(read.readHex);
      const queryBytes = parseHexBytes(options.dataHex);
      const candidate = payload.length >= 4 && payload[0] === queryBytes[0] && payload[1] === queryBytes[1]
        ? payload.slice(2, 4)
        : payload.slice(0, 2);
      const deviceTypeHex = wordHexFromPayload(candidate);
      if (!isUsableDeviceTypeHex(deviceTypeHex, options.rejectHex ? [options.rejectHex] : [])) {
        throw new Error("ManufacturerBlockAccess 0x44 belum memberi Device Type valid.");
      }
      return {
        method: options.label,
        deviceTypeHex,
        rawHex: read.readHex || ""
      };
    }

    async function probeBatteryChipInfo(deviceType, pinMode, signal, deviceName = "") {
      const manufacturerName = await tryReadBlockTextForDetect(deviceType, pinMode, "0x20", signal);
      const detections = [];
      const failures = [];
      const supportNotes = [];
      const context = { deviceName, manufacturerName };
      for (const probe of [
        probeManufacturerDataDirectDeviceType,
        probeTiManufacturerDataDeviceType,
        probeTiFirmwareVersion,
        probeTiChemId,
        probeTiLegacyManufacturerDataDeviceType,
        probeTiLegacyManufacturerAccessWordDeviceType,
        probeRenesas045A20Rwr1Gate,
        probeSanyoManufacturerAccessBlockDeviceType,
        probeManufacturerAccessWordDeviceType,
        probeManufacturerBlockDeviceType,
        probeManufacturerBlockFirmwareVersion,
        probeManufacturerBlockChemId
      ]) {
        try {
          const result = await probe(deviceType, pinMode, signal, context);
          if (result.supportOnly) {
            supportNotes.push(`${result.method}: raw ${result.rawHex || "-"}`);
            continue;
          }
          const mapped = result.mapped || decodeBatteryChipFromDeviceType(result.deviceTypeHex);
          if (!mapped) {
            failures.push(`${result.method}: ${result.deviceTypeHex} bukan chip-id decode valid`);
            continue;
          }
          detections.push({
            ...result,
            mapped,
            chip: result.chip || mapped?.chip || "",
            family: result.family || mapped?.family || ""
          });
        } catch (error) {
          failures.push(error?.message || "probe gagal");
        }
      }

      if (detections.length > 0) {
        const chips = uniqueNonEmpty(detections.map((item) => item.chip));
        const families = uniqueNonEmpty(detections.map((item) => item.family));
        const deviceTypes = uniqueNonEmpty(detections.map((item) => item.deviceTypeHex));
        const decodedNotes = detections
          .map((item) => `${item.method}: ${item.deviceTypeHex} -> ${item.chip || "no chip decode"}; raw ${item.rawHex}`)
          .join(" | ");
        const supportSuffix = supportNotes.length > 0 ? ` | support: ${supportNotes.join(" | ")}` : "";
        const failureNotes = failures.length > 0 ? ` | failed: ${failures.join(" | ")}` : "";
        const chipText = chips.join("/");
        return {
          detections,
          mapped: detections.find((item) => item.mapped)?.mapped || null,
          chip: chipText,
          family: families.join("/"),
          deviceTypeHex: deviceTypes.join("/"),
          manufacturerName: manufacturerName === "-" ? "" : manufacturerName,
          notes: `${decodedNotes}${supportSuffix}${failureNotes}`,
          message: chipText
            ? `Chip/IC hardware terbaca ${chipText}.`
            : "Chip/IC belum valid dari detektor."
        };
      }

      const supportSuffix = supportNotes.length > 0 ? `Support raw: ${supportNotes.join(" | ")}. ` : "";
      return {
        manufacturerName: manufacturerName === "-" ? "" : manufacturerName,
        notes: `${supportSuffix}${failures.join(" | ")}`,
        message: "Chip/IC belum valid dari detektor."
      };
    }

    function deviceDatabasePatch(result) {
      const entry = result?.entry || null;
      const profilePatch = profileSelectionPatchForChip(entry?.chip, entry?.family);
      return {
        busChip: entry?.chip || "",
        busChipFamily: entry?.family || "",
        busChipManufacturer: entry?.manufacturerName || "",
        busChipNotes: entry?.notes || "",
        busChipUpdatedAt: entry?.updatedAt || "",
        busChipUpdatedBy: entry?.updatedBy || "",
        busChipCanEdit: Boolean(result?.canEdit),
        busChipDatabaseHash: result?.localHash || result?.remoteHash || "",
        busChipMessage: result?.message || "Database chip siap.",
        ...profilePatch
      };
    }

    function profileSelectionPatchForChip(chip, familyName) {
      const normalizedChip = String(chip || "").trim().toUpperCase();
      const normalizedFamily = String(familyName || "").trim().toUpperCase();
      if (!normalizedChip && !normalizedFamily) {
        return {};
      }

      const profile = getProfiles(state).find((item) => {
        const tokens = [
          item.id,
          item.name,
          item.family,
          ...(item.aliases || [])
        ].map((value) => String(value || "").toUpperCase());
        return tokens.some((token) =>
          (normalizedChip && token.includes(normalizedChip)) ||
          (normalizedFamily && normalizedFamily.length >= 4 && token.includes(normalizedFamily)));
      }) || null;
      if (!profile) {
        return {};
      }

      const catalogFamily = getSeriesFamilies(state).find((item) =>
        item.id === profile.id ||
        (item.aliases || []).some((alias) => (profile.aliases || []).includes(alias))) || null;
      const operations = recoveryOperations({
        ...state,
        selectedProfileId: profile.id,
        selectedCatalogFamilyId: catalogFamily?.id || state.selectedCatalogFamilyId
      }, profile, catalogFamily);
      return {
        selectedProfileId: profile.id,
        selectedCatalogFamilyId: catalogFamily?.id || state.selectedCatalogFamilyId,
        selectedActionId: operations[0]?.id || profile.recoveryActions?.[0]?.id || state.selectedActionId
      };
    }

    async function lookupBatteryDeviceInfo(deviceName, signal) {
      try {
        const result = await fetchJson("/tools/battery-unlock/device-database/lookup", {
          method: "POST",
          timeoutMs: 25000,
          signal,
          body: JSON.stringify({
            deviceName,
            syncOnline: true
          })
        });
        setState(deviceDatabasePatch(result));
        return result;
      } catch (error) {
        const message = `Database chip belum bisa dicek: ${error?.message || "sync gagal"}.`;
        setState({
          busChip: "",
          busChipFamily: "",
          busChipManufacturer: "",
          busChipNotes: "",
          busChipUpdatedAt: "",
          busChipUpdatedBy: "",
          busChipDatabaseHash: "",
          busChipMessage: message
        });
        return null;
      }
    }

    async function saveBatteryDeviceChip(signal) {
      if (!requireBatteryBusLock(state.activeTab)) {
        return;
      }
      const chip = String(state.busChip || "").trim();
      if (!chip) {
        const message = "Chip/IC wajib diisi sebelum save database.";
        setState({ busChipMessage: message });
        notifyUser(message, "warning");
        return;
      }

      const result = await fetchJson("/tools/battery-unlock/device-database/upsert", {
        method: "POST",
        timeoutMs: 45000,
        signal,
        body: JSON.stringify({
          deviceName: state.busDeviceName,
          manufacturerName: state.busChipManufacturer,
          chip,
          family: state.busChipFamily,
          notes: state.busChipNotes
        })
      });
      const patch = deviceDatabasePatch(result);
      setState(patch);
      notifyUser(result.message || "Mapping Device Name/Chip tersimpan.", "success");
    }

    async function detectBatteryBus(signal) {
      abortActiveMonitorRequest();
      monitorRunId += 1;
      const deviceType = state.deviceType;
      setState({
        busy: true,
        monitorRunning: false,
        ...freshBatteryBusSessionPatch(clearBatteryBusLockPatch("Detek SCL/SDA berjalan: mencoba NORMAL lalu SWAP.")),
        monitorMessage: "Detek SCL/SDA berjalan.",
        apiMessage: "Detek SCL/SDA berjalan.",
        dataMessage: "Detek SCL/SDA berjalan.",
        recoveryMessage: "Detek SCL/SDA berjalan."
      });

      await resetBackendBatterySessionForStart(deviceType, signal);
      const attempts = [];
      for (const pinMode of ["normal", "swap"]) {
        try {
          const detected = await detectDeviceNameWithPinMode(deviceType, pinMode, signal);
          const message = `Device terdeteksi: ${detected.deviceName}. SCL/SDA ${pinMode.toUpperCase()} dikunci.`;
          setState({
            busDetected: true,
            busPinMode: pinMode,
            busDeviceName: detected.deviceName,
            busDetectRawHex: detected.result.readHex || "",
            busDetectedAt: new Date().toISOString(),
            busDetectMessage: message,
            busChip: "",
            busChipFamily: "",
            busChipManufacturer: "",
            busChipNotes: "",
            busChipUpdatedAt: "",
            busChipUpdatedBy: "",
            busChipDatabaseHash: "",
            busChipMessage: "Probe Chip/IC dari hardware...",
            smbusPinMode: pinMode,
            smbusResult: detected.result,
            smbusDiagnostic: null,
            monitorMessage: message,
            apiMessage: message,
            dataMessage: message,
            recoveryMessage: message
          });
          notifyUser(message, "success");
          const chipProbe = await probeBatteryChipInfo(deviceType, pinMode, signal, detected.deviceName);
          setState(chipProbePatch(chipProbe));
          return;
        } catch (error) {
          attempts.push(`${pinMode.toUpperCase()}: ${error?.message || "gagal"}`);
          await resetBackendBatterySessionForStart(deviceType, signal);
        }
      }

      const message = `Device tidak terdeteksi dari 0x21. ${attempts.join(" | ")}`;
      setState({
        ...clearBatteryBusLockPatch(message),
        smbusResult: null,
        smbusDiagnostic: null,
        monitorMessage: message,
        apiMessage: message,
        dataMessage: message,
        recoveryMessage: message
      });
      notifyUser(message, "warning");
    }

    function monitorIdentityText(rows) {
      return (rows || [])
        .filter((row) => ["manufacturerName", "deviceName", "deviceChemistry"].includes(row?.key))
        .map((row) => `${row?.value || ""} ${row?.raw || ""}`)
        .join(" ")
        .trim();
    }

    function shouldReadBq30StatusForDirectMonitor(rows) {
      const identity = monitorIdentityText(rows).toUpperCase();
      if (/\b(PANASONIC|SANYO)\b/.test(identity)) {
        return false;
      }
      if (/\bBQ30|BQ30Z|BQ30Z5XX\b/.test(identity)) {
        return true;
      }
      const gauge = String(state.smbusGaugeProbe?.gauge || "");
      return /^BQ30-like (confirmed|probable)$/i.test(gauge);
    }

    function bq30OperationBlockedByCurrentIdentity() {
      const identity = monitorIdentityText(state.monitorRows).toUpperCase();
      const gauge = String(state.smbusGaugeProbe?.gauge || "");
      return /\b(PANASONIC|SANYO)\b/.test(identity) && !/^BQ30-like (confirmed|probable)$/i.test(gauge);
    }

    function abortActiveMonitorRequest() {
      if (monitorAbortController) {
        monitorAbortController.abort();
        monitorAbortController = null;
      }
    }

    function resetMonitorStatePatch(message) {
      return {
        monitorRunning: false,
        monitorMode: "idle",
        metrics: createInitialMetrics(),
        monitorRows: [],
        captureInfo: {},
        transactions: [],
        busFrames: [],
        rawRows: [],
        monitorMessage: message
      };
    }

    async function loadDatabase() {
      const database = await fetchJson("/tools/battery-unlock/database");
      const profiles = Array.isArray(database.profiles) ? database.profiles : [];
      const families = Array.isArray(database.catalog?.families) ? database.catalog.families : [];
      const profile = profiles.find((item) => item.id === state.selectedProfileId) || profiles[0] || null;
      const family = families.find((item) => item.id === state.selectedCatalogFamilyId)
        || families.find((item) => item.id === profile?.id || (item.aliases || []).some((alias) => (profile?.aliases || []).includes(alias)))
        || families[0]
        || null;
      const operations = recoveryOperations({
        ...state,
        database,
        selectedProfileId: profile?.id || state.selectedProfileId,
        selectedCatalogFamilyId: family?.id || state.selectedCatalogFamilyId
      }, profile, family);
      const action = operations.find((item) => item.id === state.selectedActionId) || operations[0] || null;
      state = {
        ...state,
        database,
            selectedCatalogFamilyId: family?.id || state.selectedCatalogFamilyId,
        selectedProfileId: profile?.id || state.selectedProfileId,
        selectedActionId: action?.id || state.selectedActionId,
        recoveryMessage: database.message || "Database Battery Unlock siap."
      };
    }

    function stopMonitor(message = "") {
      if (!state.monitorRunning && !message) {
        return;
      }
      abortActiveMonitorRequest();
      monitorRunId += 1;
      const summary = summarizeMetrics(state.metrics);
      const modeLabel = state.monitorMode === "direct" ? "Scan Direct" : "Scan Monitor";
      setState({
        monitorRunning: false,
        monitorMode: "idle",
        monitorMessage: message || (summary
          ? `${modeLabel} berhenti. ${formatMonitorParameterCount(state.monitorRows)}: ${summary}`
          : `${modeLabel} berhenti. ${formatMonitorParameterCount(state.monitorRows)}.`),
        ...freshBatteryBusSessionPatch(),
      });
    }

    function resetBackendBatterySessionForStart(deviceType, signal) {
      return fetchJson("/tools/battery-unlock/reset", {
        method: "POST",
        timeoutMs: 3000,
        signal,
        body: JSON.stringify({ deviceType })
      });
    }

    function resetBackendBatterySessionQuiet(deviceType) {
      void resetBackendBatterySessionForStart(deviceType).catch(() => {});
    }

    async function collectDirectMonitorRows(deviceType, isolatedConfirmed, shouldContinue = () => true, signal = null) {
      const rows = [];
      let diagnostic = null;
      let diagnosticMessage = "";
      try {
        diagnostic = await fetchJson("/tools/battery-unlock/smbus/diagnostic", {
          method: "POST",
          timeoutMs: directMonitorProbeTimeoutMs,
          signal,
          body: JSON.stringify({
            deviceType,
            address: "0x0B",
            command: "0x09",
            scanAddresses: false,
            quickProbe: true,
            pinMode: lockedBatteryPinMode(state),
            speedMode: state.smbusSpeedMode || "auto",
            isolatedBatteryConfirmed: isolatedConfirmed,
            keepDeviceOpen: true
          })
        });
      } catch (error) {
        diagnosticMessage = error?.message || "Diagnostic gagal.";
        return {
          rows: [],
          diagnostic,
          diagnosticMessage,
          noAckRetry: true
        };
      }

      if (diagnostic?.lineDiagnostic?.success === false) {
        diagnosticMessage = formatLineDiagnosticMessage(diagnostic);
      }

      const directMode = {
        pinMode: lockedBatteryPinMode(state),
        speedMode: state.smbusSpeedMode || "auto"
      };
      const readDefinition = async (definition, timeoutMs) => {
        const result = await fetchJson("/tools/battery-unlock/smbus/command", {
          method: "POST",
          timeoutMs,
          signal,
          body: JSON.stringify({
            deviceType,
            operation: definition.operation,
            address: "0x0B",
            command: definition.command,
            readLength: definition.readLength,
            requireBusIdle: false,
            pinMode: directMode.pinMode,
            speedMode: directMode.speedMode,
            isolatedBatteryConfirmed: isolatedConfirmed,
            writeEnableConfirmed: false,
            keepDeviceOpen: true
          })
        });
        const renesasManufacturerAccess = definition.command === "0x00"
          ? decodeRenesas045A20ManufacturerAccess(result.readHex)
          : null;
        const value = renesasManufacturerAccess?.text || decodeDirectMonitorValue(definition, result.readHex, result.decodedValue);
        const unavailable = value === "N/A" && String(result.readHex || "").trim().toUpperCase() === "FF FF";
        return {
          key: definition.key,
          source: "Direct",
          label: definition.label,
          command: definition.command,
          value,
          unit: definition.unit || "",
          numeric: decodeDirectMonitorNumber(definition, result.readHex),
          raw: result.readHex || "-",
          status: unavailable ? "No estimate (0xFFFF)" : "OK",
          meta: ""
        };
      };

      const probeDefinition = directMonitorCommands.find((definition) => definition.command === "0x09") || directMonitorCommands[0];
      const probeStartedAt = performance.now();
      try {
        rows.push(await readDefinition(probeDefinition, directMonitorRequestTimeoutMs));
      } catch (error) {
        return {
          rows: [],
          diagnostic,
          diagnosticMessage: diagnosticMessage || error?.message || diagnostic?.message || "Battery 0x0B belum ACK.",
          noAckRetry: true
        };
      }

      const probeElapsedMs = performance.now() - probeStartedAt;
      if (probeElapsedMs > directMonitorSlowReadMs) {
        return {
          rows: appendDerivedCellBalanceRows(rows),
          diagnostic,
          diagnosticMessage: `${diagnosticMessage || diagnostic?.message || "Battery ACK."} Read pertama lambat ${Math.round(probeElapsedMs / 1000)} detik; sweep penuh ditunda.`,
          slowBusRetry: true,
          slowReadMs: probeElapsedMs
        };
      }

      for (const definition of directMonitorCommands) {
        if (!shouldContinue()) {
          break;
        }
        if (rows.some((row) => row.key === definition.key && row.status === "OK")) {
          continue;
        }
        try {
          rows.push(await readDefinition(definition, directMonitorRequestTimeoutMs));
        } catch (error) {
          rows.push({
            key: definition.key,
            source: "Direct",
            label: definition.label,
            command: definition.command,
            value: "-",
            unit: definition.unit || "",
            raw: "-",
            status: error?.message || "ERR",
            meta: ""
          });
        }
      }

      if (shouldContinue() && rows.some((row) => row.status === "OK") && shouldReadBq30StatusForDirectMonitor(rows)) {
        try {
          const bq30Status = await fetchJson("/tools/battery-unlock/bq30/status", {
            method: "POST",
            timeoutMs: directMonitorRequestTimeoutMs,
            signal,
            body: JSON.stringify({
              deviceType,
              address: "0x0B",
              pinMode: lockedBatteryPinMode(state),
              speedMode: state.smbusSpeedMode || "auto",
              isolatedBatteryConfirmed: isolatedConfirmed
            })
          });
          rows.push(...bq30StatusToMonitorRows(bq30Status));
        } catch (error) {
          // BQ30 status is optional; standard SBS rows stay valid without it.
        }
      }

      return {
        rows: appendDerivedCellBalanceRows(rows),
        diagnostic,
        diagnosticMessage
      };
    }

    function startDirectMonitor() {
      if (state.monitorRunning) {
        return;
      }
      if (!requireBatteryBusLock("monitor")) {
        return;
      }
      if (state.busy) {
        abortActiveBatteryOperation();
      }
      const runId = monitorRunId + 1;
      monitorRunId = runId;
      abortActiveMonitorRequest();
      const controller = new AbortController();
      monitorAbortController = controller;
      const deviceType = state.deviceType;
      const isolatedConfirmed = true;
      setState({
        busy: false,
        isolatedConfirmed: true,
        monitorRunning: true,
        monitorMode: "direct",
        ...freshBatteryBusSessionPatch(),
        monitorMessage: "Scan Direct berjalan. Membaca data SBS dan status battery yang tersedia.",
        metrics: createInitialMetrics(),
        monitorRows: [],
        captureInfo: {
          deviceName: formatDeviceName(deviceType),
          pinOrder: "unknown",
          pinOrderLocked: false,
          rowCount: 0,
          sampleCount: 0,
          sampleRateHz: 0,
          attempt: 0
        },
        transactions: [],
        busFrames: [],
        rawRows: []
      });
      void runDirectMonitorLoop(runId, deviceType, isolatedConfirmed, controller.signal);
    }

    function toggleDirectMonitor() {
      if (state.monitorRunning && state.monitorMode === "direct") {
        stopMonitor();
        return;
      }
      startDirectMonitor();
    }

    async function runDirectMonitorLoop(runId, deviceType, isolatedConfirmed, signal) {
      let attempt = 0;
      try {
        while (monitorRunId === runId && !signal?.aborted) {
          attempt += 1;
          let snapshot;
          try {
            snapshot = await collectDirectMonitorRows(
              deviceType,
              isolatedConfirmed,
              () => monitorRunId === runId && !signal?.aborted,
              signal);
          } catch (error) {
            if (monitorRunId !== runId || signal?.aborted) {
              return;
            }
            const message = error?.message || "Scan Direct gagal. Periksa koneksi lalu coba lagi.";
            notifyMonitorIssue(message);
            setState({
              monitorMessage: message
            });
            await delay(800);
            continue;
          }

          if (monitorRunId !== runId || signal?.aborted) {
            return;
          }

          const rows = snapshot.rows;
          const directMetrics = rows.reduce((acc, row) => ({ ...acc, ...directRowToMetrics(row) }), {});
          const okCount = rows.filter((row) => row.status === "OK").length;
          const captureInfo = {
            deviceName: formatDeviceName(deviceType),
            identity: snapshot.diagnostic?.identity || state.captureInfo?.identity || "",
            pinOrder: directPinOrderFromDiagnostic(snapshot.diagnostic),
            pinOrderLocked: Boolean(snapshot.diagnostic?.batteryDetected),
            rowCount: okCount,
            sampleCount: 0,
            sampleRateHz: 0,
            attempt
          };
          const parameterCount = formatMonitorParameterCount(rows);
          const diagnosticNote = snapshot.diagnostic?.batteryDetected
            ? formatPinOrder(captureInfo)
            : snapshot.diagnosticMessage || "diagnostic belum ACK";
          if (snapshot.noAckRetry) {
            notifyMonitorIssue(`Scan Direct belum ACK. ${diagnosticNote}`);
            setState({
              monitorMode: "direct",
              monitorRunning: true,
              metrics: mergeMetrics(createInitialMetrics(), directMetrics),
              monitorRows: rows,
              captureInfo,
              transactions: [],
              busFrames: [],
              rawRows: [],
              monitorMessage: `D${attempt}: 0/${directMonitorCommands.length} command OK. ${diagnosticNote}. Menunggu ACK, retry ringan berjalan.`
            });
            await delay(900);
            continue;
          }
          if (snapshot.slowBusRetry) {
            notifyMonitorIssue(`Scan Direct lambat. ${diagnosticNote}`);
            setState({
              monitorMode: "direct",
              monitorRunning: true,
              metrics: mergeMetrics(createInitialMetrics(), directMetrics),
              monitorRows: rows,
              captureInfo,
              transactions: [],
              busFrames: [],
              rawRows: [],
              monitorMessage: `D${attempt}: ${parameterCount} terupdate. ${okCount}/${directMonitorCommands.length} command OK. ${diagnosticNote}. Sweep penuh ditunda karena read lambat.`
            });
            await delay(900);
            continue;
          }
          setState({
            monitorMode: "direct",
            monitorRunning: true,
            metrics: mergeMetrics(createInitialMetrics(), directMetrics),
            monitorRows: rows,
            captureInfo,
            transactions: [],
            busFrames: [],
            rawRows: [],
            monitorMessage: `D${attempt}: ${parameterCount} terupdate. ${okCount}/${directMonitorCommands.length} command OK. ${diagnosticNote}.`
          });

          await delay(650);
        }
      } finally {
        if (monitorAbortController?.signal === signal) {
          monitorAbortController = null;
        }
      }
    }

    async function resetBatterySession() {
      abortActiveMonitorRequest();
      abortActiveBatteryOperation();
      monitorRunId += 1;
      const deviceType = state.deviceType;
      const resetMessage = "Reset session Battery Unlock berjalan. Scan lama dibatalkan dan pin/speed kembali auto.";
      setState({
        ...freshBatteryBusSessionPatch(),
        ...clearBatteryBusLockPatch(resetMessage),
        smbusSpeedMode: "auto",
        ...resetMonitorStatePatch(resetMessage),
        apiMessage: resetMessage,
        recoveryMessage: resetMessage,
        dataMessage: resetMessage
      });

      try {
        const result = await fetchJson("/tools/battery-unlock/reset", {
          method: "POST",
          timeoutMs: 3000,
          body: JSON.stringify({ deviceType })
        });
        const message = result.message || "Session Battery Unlock di-reset. Mulai Scan Direct lagi.";
        setState({
          ...freshBatteryBusSessionPatch(),
          ...clearBatteryBusLockPatch(`${message} Jalankan Detek ulang sebelum operasi.`),
          smbusSpeedMode: "auto",
          ...resetMonitorStatePatch(message),
          apiMessage: message,
          recoveryMessage: message,
          dataMessage: message,
          deviceType: result.deviceType || deviceType
        });
      } catch (error) {
        const message = "Session UI di-reset. Endpoint reset LocalService belum aktif atau masih sibuk; tekan Stop/Reset lagi setelah request lama selesai.";
        setState({
          ...freshBatteryBusSessionPatch(),
          ...clearBatteryBusLockPatch(`${message} Jalankan Detek ulang sebelum operasi.`),
          smbusSpeedMode: "auto",
          ...resetMonitorStatePatch(message),
          apiMessage: message,
          recoveryMessage: message,
          dataMessage: message
        });
      }
    }

    async function sendSmbus() {
      if (!requireBatteryBusLock("smbus")) {
        return;
      }
      const result = await fetchJson("/tools/battery-unlock/smbus/command", {
        method: "POST",
        timeoutMs: directMonitorRequestTimeoutMs,
        body: JSON.stringify({
          deviceType: state.deviceType,
          operation: state.smbusOperation,
          address: state.smbusAddress,
          command: state.smbusCommand,
          dataHex: state.smbusDataHex,
          readLength: Number(state.smbusReadLength || 0),
          requireBusIdle: Boolean(state.smbusRequireIdle),
          pinMode: lockedBatteryPinMode(state),
          speedMode: state.smbusSpeedMode,
          isolatedBatteryConfirmed: state.isolatedConfirmed,
          writeEnableConfirmed: state.writeConfirmed,
          keepDeviceOpen: true
        })
      });
      setState({
        smbusResult: result,
        apiMessage: result.message || "SMBus command selesai."
      });
      notifyUser(result.message || "SMBus command selesai.", result.success === false ? "warning" : "success");
    }

    async function runSmbusDiagnostic() {
      if (!requireBatteryBusLock("smbus")) {
        return;
      }
      const result = await fetchJson("/tools/battery-unlock/smbus/diagnostic", {
        method: "POST",
        timeoutMs: directMonitorRequestTimeoutMs,
        body: JSON.stringify({
          deviceType: state.deviceType,
          address: state.smbusAddress,
          command: state.smbusCommand,
          scanAddresses: Boolean(state.smbusScanAddresses),
          pinMode: lockedBatteryPinMode(state),
          speedMode: state.smbusSpeedMode,
          isolatedBatteryConfirmed: state.isolatedConfirmed,
          keepDeviceOpen: true
        })
      });
      setState({
        smbusDiagnostic: result,
        apiMessage: result.message || "Diagnostic SMBus selesai."
      });
      notifyUser(result.message || "Diagnostic SMBus selesai.", result.success === false ? "warning" : "success");
    }

    function blockInfo(readHex) {
      const bytes = parseHexBytes(readHex);
      const count = bytes.length ? Math.min(bytes[0] || 0, bytes.length - 1) : null;
      const payloadBytes = count ? bytes.slice(1, 1 + count) : [];
      return {
        count,
        payload: payloadBytes.map((byte) => byte.toString(16).toUpperCase().padStart(2, "0")).join(" "),
        text: decodeBlockText(bytes)
      };
    }

    function manufacturerAccessDataHex(subCommand) {
      const word = Number.parseInt(String(subCommand || "0").replace(/^0x/i, ""), 16) || 0;
      return `${(word & 0xFF).toString(16).toUpperCase().padStart(2, "0")} ${((word >> 8) & 0xFF).toString(16).toUpperCase().padStart(2, "0")}`;
    }

    async function runGaugeProbeCommand({ label, command, operation = "read-block", readLength = 33, dataHex = "", write = false }) {
      try {
        const result = await fetchJson("/tools/battery-unlock/smbus/command", {
          method: "POST",
          body: JSON.stringify({
            deviceType: state.deviceType,
            operation,
            address: state.smbusAddress || "0x0B",
            command,
            dataHex,
            readLength,
            requireBusIdle: false,
            pinMode: lockedBatteryPinMode(state),
            speedMode: state.smbusSpeedMode,
            isolatedBatteryConfirmed: state.isolatedConfirmed,
            writeEnableConfirmed: write,
            keepDeviceOpen: true
          })
        });
        const info = operation === "read-block" ? blockInfo(result.readHex) : { count: "-", payload: result.writeHex || "", text: "" };
        return {
          label,
          command,
          count: info.count,
          payload: info.payload,
          value: info.text,
          raw: result.readHex || result.writeHex || "-",
          success: Boolean(result.success),
          status: result.message || "OK"
        };
      } catch (error) {
        return {
          label,
          command,
          count: "-",
          payload: "-",
          value: "-",
          raw: "-",
          success: false,
          status: error?.message || "ERR"
        };
      }
    }

    async function readManufacturerAccessBlock(subCommand, readCommand) {
      const write = await runGaugeProbeCommand({
        label: `MA ${subCommand}`,
        command: "0x00",
        operation: "write-word",
        readLength: 0,
        dataHex: manufacturerAccessDataHex(subCommand),
        write: true
      });
      await delay(180);
      const read = await runGaugeProbeCommand({
        label: `MA ${subCommand} -> ${readCommand}`,
        command: readCommand,
        operation: "read-block",
        readLength: 33
      });
      return {
        ...read,
        status: write.success ? read.status : `MA selector gagal: ${write.status}`
      };
    }

    function classifyGaugeProbe(rows) {
      const byLabel = new Map(rows.map((row) => [row.label, row]));
      const status51 = byLabel.get("MA 0x0051 -> 0x23");
      const status53 = byLabel.get("MA 0x0053 -> 0x23");
      const status54 = byLabel.get("MA 0x0054 -> 0x23");
      const status57 = byLabel.get("MA 0x0057 -> 0x23");
      const challenge40 = byLabel.get("MA 0x0040 -> 0x2F");
      const challenge32 = byLabel.get("MA 0x0032 -> 0x2F");
      const direct2f = byLabel.get("Direct 0x2F");
      const bq30StatusCount = [status51, status53, status54].filter((row) => row?.success && Number(row.count) === 4).length;
      const bq30ManufacturingOk = status57?.success && Number(status57.count) === 2;
      const bq30ChallengeCount = [challenge40, challenge32].filter((row) => row?.success && Number(row.count) === 20).length;
      const directChallengeOk = direct2f?.success && Number(direct2f.count) === 20;
      if (bq30StatusCount >= 3 && bq30ManufacturingOk && bq30ChallengeCount >= 1) {
        return { gauge: "BQ30-like confirmed", confidence: "HIGH" };
      }
      if ((bq30StatusCount >= 2 && bq30ManufacturingOk) || (bq30StatusCount >= 1 && directChallengeOk)) {
        return { gauge: "BQ30-like probable", confidence: "MED" };
      }
      return { gauge: "Unknown / SBS only", confidence: "LOW" };
    }

    async function runSmbusGaugeProbe() {
      if (!requireBatteryBusLock("smbus")) {
        return;
      }
      setState(freshBatteryBusSessionPatch({ apiMessage: "Probe IC mulai dari sesi SMBus baru." }));
      const rows = [];
      for (const item of [
        ["Manufacturer Name", "0x20"],
        ["Device Name", "0x21"],
        ["Device Chemistry", "0x22"],
        ["Direct 0x23", "0x23"],
        ["Direct 0x2F", "0x2F"]
      ]) {
        rows.push(await runGaugeProbeCommand({ label: item[0], command: item[1] }));
      }
      for (const item of [
        ["0x0051", "0x23"],
        ["0x0053", "0x23"],
        ["0x0054", "0x23"],
        ["0x0057", "0x23"],
        ["0x0040", "0x2F"],
        ["0x0032", "0x2F"]
      ]) {
        rows.push(await readManufacturerAccessBlock(item[0], item[1]));
      }

      const manufacturer = rows.find((row) => row.label === "Manufacturer Name")?.value || "";
      const deviceName = rows.find((row) => row.label === "Device Name")?.value || "";
      const packIdentity = [manufacturer, deviceName].filter((item) => item && item !== "-").join(" / ") || "Pack unknown";
      const classification = classifyGaugeProbe(rows);
      const probe = {
        ...classification,
        packIdentity,
        address: state.smbusAddress || "0x0B",
        pinMode: lockedBatteryPinMode(state),
        rows
      };
      setState({
        smbusGaugeProbe: probe,
        apiMessage: `Probe IC selesai: ${classification.gauge}.`
      });
      notifyUser(`Probe IC selesai: ${classification.gauge}.`, classification.confidence === "LOW" ? "warning" : "success");
    }

    async function executeDataCommand(plan, writeOptions = {}) {
      return fetchJson("/tools/battery-unlock/smbus/command", {
        method: "POST",
        body: JSON.stringify({
          deviceType: state.deviceType,
          address: state.smbusAddress || "0x0B",
          command: plan.command,
          operation: writeOptions.operation || plan.operation,
          dataHex: writeOptions.dataHex || "",
          readLength: writeOptions.readLength ?? plan.readLength ?? 2,
          requireBusIdle: false,
          pinMode: lockedBatteryPinMode(state),
          speedMode: state.smbusSpeedMode,
          isolatedBatteryConfirmed: state.isolatedConfirmed,
          writeEnableConfirmed: Boolean(writeOptions.write),
          keepDeviceOpen: true
        })
      });
    }

    async function readDataPlanItem(plan) {
      try {
        const result = await executeDataCommand(plan);
        return {
          label: plan.label,
          command: plan.command,
          operation: plan.operation,
          readLength: plan.readLength,
          readHex: result.readHex || "",
          decodedValue: result.decodedValue || "",
          restoreSupported: Boolean(plan.restoreSupported),
          identity: Boolean(plan.identity),
          success: Boolean(result.success),
          status: result.success ? "OK" : result.message || "failed"
        };
      } catch (error) {
        return {
          label: plan.label,
          command: plan.command,
          operation: plan.operation,
          readLength: plan.readLength,
          readHex: "",
          decodedValue: "",
          restoreSupported: false,
          identity: Boolean(plan.identity),
          success: false,
          status: error?.message || "ERR"
        };
      }
    }

    function buildDataBackup(items) {
      const profile = selectedProfile(state);
      const family = selectedCatalogFamily(state);
      return {
        format: "teknisihub-battery-data-backup-v1",
        createdAt: new Date().toISOString(),
        address: state.smbusAddress || "0x0B",
        deviceType: state.deviceType,
        profile: profile ? {
          id: profile.id,
          name: profile.name,
          family: profile.family,
          aliases: profile.aliases || []
        } : null,
        family: family ? {
          id: family.id,
          family: family.family,
          status: family.status,
          aliases: family.aliases || []
        } : null,
        items
      };
    }

    async function runDataIdentify() {
      if (!requireBatteryBusLock("data")) {
        return;
      }
      setState(freshBatteryBusSessionPatch({ dataRows: [], dataMessage: "Identify mulai dari sesi SMBus baru." }));
      const rows = [];
      for (const plan of dataBackupReadPlan.filter((item) => item.identity)) {
        rows.push(await readDataPlanItem(plan));
      }
      setState({
        dataRows: rows,
        dataMessage: rows.some((row) => row.success)
          ? "Identify selesai. Cocokkan Manufacturer/Device/Chemistry sebelum backup/restore."
          : "Identify belum berhasil. Periksa koneksi SMBus dan isolasi baterai."
      });
      notifyUser(
        rows.some((row) => row.success)
          ? "Identify selesai."
          : "Identify belum berhasil. Periksa koneksi SMBus dan isolasi baterai.",
        rows.some((row) => row.success) ? "success" : "warning"
      );
    }

    async function runDataBackup() {
      if (!requireBatteryBusLock("data")) {
        return;
      }
      setState(freshBatteryBusSessionPatch({ dataRows: [], dataMessage: "Backup mulai dari sesi SMBus baru." }));
      const rows = [];
      for (const plan of dataBackupReadPlan) {
        rows.push(await readDataPlanItem(plan));
        setState({ dataRows: rows, dataMessage: `Backup berjalan ${rows.length}/${dataBackupReadPlan.length}...` });
        await delay(40);
      }
      const backup = buildDataBackup(rows);
      setState({
        dataBackup: backup,
        dataImportedBackup: backup,
        dataImportVerified: true,
        dataFileName: formatBackupFileName(backup),
        dataRows: rows,
        dataMessage: `Backup selesai: ${rows.filter((row) => row.success).length}/${rows.length} item terbaca. Export JSON untuk arsip.`
      });
      notifyUser(`Backup selesai: ${rows.filter((row) => row.success).length}/${rows.length} item terbaca.`, "success");
    }

    function exportDataBackup() {
      if (!state.dataBackup) {
        setState({ dataMessage: "Belum ada backup untuk export." });
        notifyUser("Belum ada backup untuk export.", "warning");
        return;
      }
      const fileName = formatBackupFileName(state.dataBackup);
      const blob = new Blob([JSON.stringify(state.dataBackup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setState({ dataFileName: fileName, dataMessage: `Backup diexport: ${fileName}` });
      notifyUser(`Backup diexport: ${fileName}`, "success");
    }

    async function importDataBackupFile(file) {
      if (!file) {
        return;
      }
      const text = await file.text();
      const backup = JSON.parse(text);
      if (backup?.format !== "teknisihub-battery-data-backup-v1" || !Array.isArray(backup.items)) {
        throw new Error("File backup tidak valid untuk TeknisiHub Battery Data.");
      }
      setState({
        dataImportedBackup: backup,
        dataImportVerified: false,
        dataFileName: file.name || formatBackupFileName(backup),
        dataRows: getBackupItems(backup),
        dataMessage: `Backup diimport. Jalankan Verify sebelum restore. Restore items: ${getRestoreItems(backup).length}.`
      });
      notifyUser(`Backup diimport. Restore items: ${getRestoreItems(backup).length}.`, "success");
    }

    async function verifyDataBackup() {
      if (!requireBatteryBusLock("data")) {
        return;
      }
      const backup = state.dataImportedBackup;
      if (!backup) {
        setState({ dataMessage: "Import backup dulu sebelum verify." });
        notifyUser("Import backup dulu sebelum verify.", "warning");
        return;
      }
      setState(freshBatteryBusSessionPatch({ dataRows: [], dataMessage: "Verify mulai dari sesi SMBus baru." }));
      const rows = [];
      let checked = 0;
      let mismatch = 0;
      for (const plan of dataBackupReadPlan.filter((item) => item.identity)) {
        const current = await readDataPlanItem(plan);
        const saved = findBackupItem(backup, plan.command);
        const savedHex = normalizeHexText(saved?.readHex);
        const currentHex = normalizeHexText(current.readHex);
        const match = Boolean(savedHex && currentHex && savedHex === currentHex);
        checked += 1;
        if (!match) {
          mismatch += 1;
        }
        rows.push({
          label: plan.label,
          command: plan.command,
          operation: "verify",
          readHex: current.readHex,
          decodedValue: current.decodedValue,
          status: match ? "match" : `mismatch backup=${saved?.readHex || "-"}`
        });
      }
      const verified = checked > 0 && mismatch === 0;
      setState({
        dataRows: rows,
        dataImportVerified: verified,
        dataMessage: verified
          ? `Verify cocok. Restore guarded aktif untuk ${getRestoreItems(backup).length} item writable.`
          : "Verify gagal/cocok sebagian. Restore tetap terkunci agar tidak salah chip."
      });
      notifyUser(
        verified
          ? `Verify cocok. Restore guarded aktif untuk ${getRestoreItems(backup).length} item writable.`
          : "Verify gagal/cocok sebagian. Restore tetap terkunci.",
        verified ? "success" : "warning"
      );
    }

    async function restoreDataBackup() {
      if (!requireBatteryBusLock("data")) {
        return;
      }
      const backup = state.dataImportedBackup;
      const restoreItems = getRestoreItems(backup);
      if (!backup || !state.dataImportVerified || !restoreItems.length) {
        setState({ dataMessage: "Restore terkunci. Import backup, Verify cocok, dan pastikan ada item writable." });
        notifyUser("Restore terkunci. Import backup, Verify cocok, dan pastikan ada item writable.", "warning");
        return;
      }
      setState(freshBatteryBusSessionPatch({ dataRows: [], dataMessage: "Restore mulai dari sesi SMBus baru." }));
      const rows = [];
      for (const item of restoreItems) {
        try {
          const result = await executeDataCommand(item, {
            operation: "write-word",
            dataHex: item.readHex,
            readLength: 0,
            write: true
          });
          rows.push({
            label: item.label,
            command: item.command,
            operation: "write-word",
            writeHex: result.writeHex || item.readHex,
            decodedValue: item.decodedValue || "",
            status: result.message || "restored"
          });
        } catch (error) {
          rows.push({
            label: item.label,
            command: item.command,
            operation: "write-word",
            writeHex: item.readHex,
            decodedValue: item.decodedValue || "",
            status: error?.message || "ERR"
          });
        }
        setState({ dataRows: rows, dataMessage: `Restore berjalan ${rows.length}/${restoreItems.length}...` });
        await delay(80);
      }
      setState({
        dataRows: rows,
        dataMessage: `Restore selesai untuk ${rows.length} item writable. Jalankan Identify/Backup ulang untuk verifikasi.`
      });
      notifyUser(`Restore selesai untuk ${rows.length} item writable.`, "success");
    }

    async function previewRecovery() {
      if (!requireBatteryBusLock("recovery")) {
        return;
      }
      const result = await fetchJson("/tools/battery-unlock/recovery/preview", {
        method: "POST",
        body: JSON.stringify({
          deviceType: state.deviceType,
          profileId: state.selectedProfileId,
          actionId: state.selectedActionId
        })
      });
      setState({
        recoveryPreview: result,
        recoveryMessage: result.message || "Preview recovery siap."
      });
      notifyUser(result.message || "Preview recovery siap.", result.success === false ? "warning" : "success");
    }

    async function executeRecovery(actionIdOverride = "") {
      if (!requireBatteryBusLock("recovery")) {
        return;
      }
      const actionId = actionIdOverride || state.selectedActionId;
      const result = await fetchJson("/tools/battery-unlock/recovery/execute", {
        method: "POST",
        timeoutMs: recoveryLongOperationTimeoutMs,
        body: JSON.stringify({
          deviceType: state.deviceType,
          profileId: state.selectedProfileId,
          actionId,
          pinMode: lockedBatteryPinMode(state),
          speedMode: state.smbusSpeedMode || "auto",
          isolatedBatteryConfirmed: state.isolatedConfirmed,
          writeEnableConfirmed: state.writeConfirmed
        })
      });
      setState({
        recoveryPreview: result,
        recoveryMessage: result.message || "Recovery command selesai."
      });
      notifyUser(result.message || "Recovery command selesai.", result.success === false ? "warning" : "success");
    }

    async function runSelectedRecoveryOperation() {
      const profile = selectedProfile(state);
      const family = selectedCatalogFamily(state);
      const operation = selectedRecoveryOperation(state, profile, family);
      if (!operation) {
        setState({ recoveryMessage: "Operasi belum dipilih." });
        notifyUser("Operasi belum dipilih.", "warning");
        return;
      }
      const universalBq30Write = isBq30Profile(profile) && [
        "universal-clear-protection",
        "universal-full-access",
        "universal-unlock-fet",
        "universal-refresh-gauge"
      ].includes(String(operation.kind || ""));
      if ((String(operation.kind || "").startsWith("bq30") || universalBq30Write) && bq30OperationBlockedByCurrentIdentity()) {
        const message = "Operasi BQ30 diblokir: identity terakhir terbaca Panasonic/Sanyo, belum ada konfirmasi BQ30-like dari Probe IC. Pilih seri/IC yang sesuai atau jalankan SMBus Probe IC dulu.";
        setState({
          recoveryMessage: message
        });
        notifyUser(message, "warning");
        return;
      }
      if (operation.kind === "probe") {
        const probe = probeCommandForFamily(family);
        setState({
          ...freshBatteryBusSessionPatch(),
          activeTab: "smbus",
          smbusOperation: probe.operation,
          smbusAddress: state.database?.catalog?.baselineSbs?.defaultAddress || "0x0B",
          smbusCommand: probe.command,
          smbusReadLength: probe.readLength,
          smbusDataHex: "",
          smbusResult: null,
          smbusDiagnostic: null,
          apiMessage: probe.message
        });
        notifyUser(probe.message, "info");
        return;
      }
      setState(freshBatteryBusSessionPatch({
        bq30RecoveryRows: [],
        recoveryMessage: "Operasi Recovery mulai dari sesi SMBus baru."
      }));
      if (operation.kind === "universal-read-info") {
        await runUniversalReadInfo();
        return;
      }
      if (operation.kind === "universal-read-status") {
        await runUniversalReadStatus();
        return;
      }
      if (operation.kind === "universal-scan-commands") {
        await runUniversalScanCommands();
        return;
      }
      if (operation.kind === "universal-check-cells") {
        await runUniversalCheckCells();
        return;
      }
      if (operation.kind === "universal-protection-status") {
        await runUniversalProtectionStatus();
        return;
      }
      if (operation.kind === "universal-clear-protection") {
        if (isBq30Profile(profile)) {
          await runBq30ClearProtection();
          return;
        }
        unsupportedUniversalOperation(operation, profile, family);
        return;
      }
      if (operation.kind === "universal-full-access") {
        if (isBq30Profile(profile)) {
          await runBq30FullAccess();
          return;
        }
        if (isBq40Profile(profile) && profileActionById(profile, "bq40-full-access")) {
          await executeRecovery("bq40-full-access");
          return;
        }
        unsupportedUniversalOperation(operation, profile, family);
        return;
      }
      if (operation.kind === "universal-unlock-fet") {
        if (isBq30Profile(profile)) {
          await runBq30UnlockFet();
          return;
        }
        unsupportedUniversalOperation(operation, profile, family);
        return;
      }
      if (operation.kind === "universal-refresh-gauge") {
        if (isBq30Profile(profile)) {
          await runBq30Calibration();
          return;
        }
        unsupportedUniversalOperation(operation, profile, family);
        return;
      }
      if (operation.kind === "bq30-status") {
        await readBq30RecoveryStatus();
        return;
      }
      if (operation.kind === "bq40-status") {
        await readBq40RecoveryStatus();
        return;
      }
      if (operation.kind === "bq30-full-access") {
        await runBq30FullAccess();
        return;
      }
      if (operation.kind === "bq30-clear-protection") {
        await runBq30ClearProtection();
        return;
      }
      if (operation.kind === "bq30-unlock-fet") {
        await runBq30UnlockFet();
        return;
      }
      if (operation.kind === "bq30-check-cell") {
        await runBq30CheckCell();
        return;
      }
      if (operation.kind === "bq30-calibration") {
        await runBq30Calibration();
        return;
      }
      if (operation.kind === "bq30-full-flow") {
        await runBq30UnlockFetFlow();
        return;
      }
      if (operation.kind === "bq30-after-cell-replace") {
        await runBq30AfterCellReplaceRelearn();
        return;
      }
      if (operation.kind === "bq30-enable-fet") {
        await writeBq30ManufacturerAccessSequence(bq30FetRecoveryCommands, "BQ30 Enable FET");
        return;
      }
      if (operation.kind === "bq30-reset-pf") {
        await writeBq30ManufacturerAccessSequence(bq30PfRecoveryCommands, "BQ30 Reset PF");
        return;
      }
      if (operation.kind === "renesas045-status") {
        await runRenesas045A20ReadStatus();
        return;
      }
      if (operation.kind === "renesas045-identity") {
        await runRenesas045A20ProbeIdentity();
        return;
      }
      if (operation.kind === "renesas045-manufacturer") {
        await runRenesas045A20ProbeManufacturerArea();
        return;
      }
      if (operation.kind === "renesas045-after-cell") {
        await runRenesas045A20AfterCellRecoveryCheck();
        return;
      }
      if (operation.kind === "renesas045-unlock-fet") {
        await runRenesas045A20UnlockFetReferenceCheck();
        return;
      }
      await executeRecovery();
    }

    async function sendBatteryRecoverySmbusCommand(payload, timeoutMs = recoverySmbusCommandTimeoutMs, options = {}) {
      return fetchJson("/tools/battery-unlock/smbus/command", {
        method: "POST",
        timeoutMs,
        signal: options.signal || null,
        body: JSON.stringify({
          deviceType: state.deviceType,
          address: state.smbusAddress || "0x0B",
          requireBusIdle: false,
          pinMode: lockedBatteryPinMode(state),
          speedMode: state.smbusSpeedMode || "auto",
          isolatedBatteryConfirmed: state.isolatedConfirmed,
          writeEnableConfirmed: state.writeConfirmed,
          keepDeviceOpen: true,
          ...payload
        })
      });
    }

    async function sendBq30SmbusCommand(payload, timeoutMs = recoverySmbusCommandTimeoutMs, options = {}) {
      return sendBatteryRecoverySmbusCommand({
        address: "0x0B",
        ...payload
      }, timeoutMs, options);
    }

    async function readUniversalRecoveryPlanRow(plan, signal = null) {
      const definition = monitorParameters.find((item) => item.key === plan.key) ||
        monitorParameters.find((item) => item.command === plan.command) ||
        plan;
      try {
        const result = await sendBatteryRecoverySmbusCommand({
          operation: plan.operation,
          command: plan.command,
          readLength: plan.readLength,
          writeEnableConfirmed: false
        }, recoverySmbusCommandTimeoutMs, { signal });
        const renesasManufacturerAccess = plan.command === "0x00"
          ? decodeRenesas045A20ManufacturerAccess(result.readHex)
          : null;
        const value = renesasManufacturerAccess?.text || decodeDirectMonitorValue(definition, result.readHex, result.decodedValue);
        const unit = definition.unit || plan.unit || "";
        const statusValue = value && value !== "-" ? `${value}${unit ? ` ${unit}` : ""}` : result.message || "OK";
        return {
          resultRow: {
            label: plan.label,
            command: plan.command,
            writeHex: "-",
            readHex: result.readHex || "-",
            status: result.success ? statusValue : result.message || "ERR"
          },
          monitorRow: {
            key: plan.key || `universal-${plan.command}`,
            source: "Recovery",
            label: plan.label,
            command: plan.command,
            value,
            unit,
            numeric: decodeDirectMonitorNumber(definition, result.readHex),
            raw: result.readHex || "-",
            status: result.success ? "OK" : result.message || "ERR",
            meta: "universal read"
          }
        };
      } catch (error) {
        return {
          resultRow: {
            label: plan.label,
            command: plan.command,
            writeHex: "-",
            readHex: "-",
            status: error?.message || "ERR"
          },
          monitorRow: {
            key: plan.key || `universal-${plan.command}`,
            source: "Recovery",
            label: plan.label,
            command: plan.command,
            value: "-",
            unit: definition.unit || plan.unit || "",
            numeric: null,
            raw: "-",
            status: error?.message || "ERR",
            meta: "universal read"
          }
        };
      }
    }

    async function runUniversalReadPlan(plan, label, options = {}) {
      const signal = options.signal || null;
      if (!options.keepSession) {
        setState(freshBatteryBusSessionPatch({
          bq30RecoveryRows: [],
          recoveryMessage: `${label} mulai.`
        }));
      }
      const resultRows = [];
      const monitorRows = [];
      for (const item of plan) {
        if (signal?.aborted) {
          throw new DOMException(`${label} dihentikan.`, "AbortError");
        }
        const row = await readUniversalRecoveryPlanRow(item, signal);
        resultRows.push(row.resultRow);
        monitorRows.push(row.monitorRow);
        setState({
          bq30RecoveryRows: resultRows,
          recoveryMessage: `${label}: ${resultRows.length}/${plan.length} command dibaca.`
        });
        await delay(35);
      }
      const finalMonitorRows = appendDerivedCellBalanceRows(monitorRows);
      const directMetrics = finalMonitorRows.reduce((acc, row) => ({ ...acc, ...directRowToMetrics(row) }), {});
      setState({
        bq30RecoveryRows: resultRows,
        monitorRows: options.updateMonitor === false ? state.monitorRows : finalMonitorRows,
        metrics: options.updateMonitor === false ? state.metrics : mergeMetrics(createInitialMetrics(), directMetrics),
        recoveryMessage: options.message || `${label} selesai. ${resultRows.filter((row) => row.readHex !== "-").length}/${resultRows.length} command terbaca.`
      });
      if (!options.silent) {
        notifyUser(options.toast || `${label} selesai.`, options.tone || "success");
      }
      return { resultRows, monitorRows: finalMonitorRows };
    }

    async function runUniversalReadInfo() {
      const chipRow = state.busChip ? [{
        label: "Chip/IC",
        command: "Detector",
        writeHex: "-",
        readHex: state.busChipNotes || "-",
        status: [state.busChip, state.busChipFamily].filter(Boolean).join(" / ")
      }] : [];
      const result = await runUniversalReadPlan(universalReadInfoPlan, "Read Info");
      if (chipRow.length) {
        setState({
          bq30RecoveryRows: [...chipRow, ...result.resultRows],
          recoveryMessage: `Read Info selesai. Chip/IC ${state.busChip} dari detektor.`
        });
      }
      return result;
    }

    async function runUniversalReadStatus() {
      return runUniversalReadPlan(universalReadStatusPlan, "Read Status");
    }

    async function runUniversalProtectionStatus() {
      const profile = selectedProfile(state);
      const family = selectedCatalogFamily(state);
      if (isBq30Profile(profile)) {
        return readBq30RecoveryStatus();
      }
      if (isBq40Profile(profile)) {
        return readBq40RecoveryStatus();
      }
      if (isRenesas045A20Profile(profile, family)) {
        return runRenesas045A20ReadStatus();
      }
      return runUniversalReadPlan(universalProtectionReadPlan, "Protection Status");
    }

    async function runUniversalCheckCells(options = {}) {
      const profile = selectedProfile(state);
      if (isBq30Profile(profile)) {
        return runBq30ServiceCheck(options.label || "Check Cells", null, {
          ...options,
          message: options.message || "Check Cells selesai."
        });
      }
      return runUniversalReadPlan([
        ...universalReadStatusPlan,
        ...universalCellReadPlan
      ], options.label || "Check Cells", {
        ...options,
        message: options.message || "Check Cells selesai."
      });
    }

    async function runUniversalScanCommands() {
      const rows = [];
      const hits = [];
      setState(freshBatteryBusSessionPatch({
        bq30RecoveryRows: [],
        recoveryMessage: "Scan Commands mulai: read-word 0x00-0xFF."
      }));
      for (let command = 0; command <= 0xFF; command += 1) {
        const commandHex = `0x${command.toString(16).toUpperCase().padStart(2, "0")}`;
        try {
          const result = await sendBatteryRecoverySmbusCommand({
            operation: "read-word",
            command: commandHex,
            readLength: 2,
            writeEnableConfirmed: false
          }, 5000);
          if (result?.success !== false) {
            hits.push({
              label: commandLabels[command] || `Command ${commandHex}`,
              command: commandHex,
              writeHex: "-",
              readHex: result.readHex || "-",
              status: result.decodedValue || result.message || "ACK"
            });
          }
        } catch {
          // NACK/no response is expected during command scan.
        }
        if (command % 16 === 15 || command === 0xFF) {
          rows.splice(0, rows.length, ...hits);
          setState({
            bq30RecoveryRows: rows.length ? rows : [{
              label: "Scan Commands",
              command: "0x00-0xFF",
              writeHex: "-",
              readHex: "-",
              status: `Progress ${command + 1}/256, belum ada ACK read-word.`
            }],
            recoveryMessage: `Scan Commands berjalan ${command + 1}/256. Hit ${hits.length}.`
          });
          await delay(10);
        }
      }
      const finalRows = hits.length ? hits : [{
        label: "Scan Commands",
        command: "0x00-0xFF",
        writeHex: "-",
        readHex: "-",
        status: "Tidak ada ACK read-word."
      }];
      setState({
        bq30RecoveryRows: finalRows,
        recoveryMessage: `Scan Commands selesai. Hit ${hits.length}/256.`
      });
      notifyUser(`Scan Commands selesai. Hit ${hits.length}/256.`, hits.length ? "success" : "warning");
      return { rows: finalRows, hits };
    }

    function profileActionById(profile, actionId) {
      return (profile?.recoveryActions || []).find((action) => action.id === actionId) || null;
    }

    function unsupportedUniversalOperation(operation, profile, family) {
      const target = profile?.name || family?.family || "seri/IC ini";
      const message = `${operation?.name || "Operasi"} belum punya handler write tervalidasi untuk ${target}. Tidak ada command write dikirim.`;
      setState({
        bq30RecoveryRows: [{
          label: operation?.name || "Operasi",
          command: "-",
          writeHex: "-",
          readHex: "-",
          status: message
        }],
        recoveryMessage: message
      });
      notifyUser(message, "warning");
    }

    async function executeBq30WorkflowStep({ clearPermanentFailure, enableFets }) {
      return fetchJson("/tools/battery-unlock/bq30/dji-killer-unlock", {
        method: "POST",
        timeoutMs: recoveryLongOperationTimeoutMs,
        body: JSON.stringify({
          deviceType: state.deviceType,
          address: "0x0B",
          pinMode: lockedBatteryPinMode(state),
          speedMode: state.smbusSpeedMode || "auto",
          isolatedBatteryConfirmed: state.isolatedConfirmed,
          writeEnableConfirmed: state.writeConfirmed,
          clearPermanentFailure,
          enableFets
        })
      });
    }

    async function executeBq30FullAccessClearFaultEnableFet() {
      return executeBq30WorkflowStep({
        clearPermanentFailure: true,
        enableFets: true
      });
    }

    function bq30UnlockResultRows(result) {
      return Array.isArray(result?.steps)
        ? result.steps.map((step) => ({
          label: step.label || "-",
          command: step.command || "-",
          writeHex: step.writeHex || "-",
          readHex: step.readHex || "-",
          status: step.status || "-"
        }))
        : [];
    }

    function latestBq30StatusFromUnlockResult(result) {
      return result?.finalStatus ||
        result?.afterFetEnableStatus ||
        result?.afterPermanentFailureResetStatus ||
        result?.afterFullAccessStatus ||
        result?.beforeStatus ||
        null;
    }

    function setBq30UnlockOperationResult(result, fallbackMessage) {
      const rows = bq30UnlockResultRows(result);
      const finalStatus = latestBq30StatusFromUnlockResult(result);
      const monitorRows = finalStatus ? bq30StatusToMonitorRows(finalStatus) : [];
      const directMetrics = monitorRows.reduce((acc, row) => ({ ...acc, ...directRowToMetrics(row) }), {});
      setState({
        bq30RecoveryRows: rows,
        monitorRows,
        metrics: mergeMetrics(createInitialMetrics(), directMetrics),
        recoveryMessage: result.message || fallbackMessage
      });
      notifyUser(result.message || fallbackMessage, result.success === false ? "warning" : "success");
      return { result, rows, finalStatus };
    }

    async function readRenesas045A20PlanRow(plan) {
      const definition = monitorParameters.find((item) => item.command === plan.command) || plan;
      try {
        const result = await sendBatteryRecoverySmbusCommand({
          operation: plan.operation,
          command: plan.command,
          readLength: plan.readLength,
          writeEnableConfirmed: false
        }, recoverySmbusCommandTimeoutMs);
        const value = decodeDirectMonitorValue(definition, result.readHex, result.decodedValue);
        const unit = definition.unit || plan.unit || "";
        const statusValue = value && value !== "-" ? `${value}${unit ? ` ${unit}` : ""}` : result.message || "OK";
        return {
          resultRow: {
            label: plan.label,
            command: plan.command,
            writeHex: "-",
            readHex: result.readHex || "-",
            status: result.success ? statusValue : result.message || "ERR"
          },
          monitorRow: {
            key: plan.key || `renesas045-${plan.command}`,
            source: "Recovery",
            label: plan.label,
            command: plan.command,
            value,
            unit,
            numeric: decodeDirectMonitorNumber(definition, result.readHex),
            raw: result.readHex || "-",
            status: result.success ? "OK" : result.message || "ERR",
            meta: "045A20 read-only"
          }
        };
      } catch (error) {
        return {
          resultRow: {
            label: plan.label,
            command: plan.command,
            writeHex: "-",
            readHex: "-",
            status: error?.message || "ERR"
          },
          monitorRow: {
            key: plan.key || `renesas045-${plan.command}`,
            source: "Recovery",
            label: plan.label,
            command: plan.command,
            value: "-",
            unit: definition.unit || plan.unit || "",
            numeric: null,
            raw: "-",
            status: error?.message || "ERR",
            meta: "045A20 read-only"
          }
        };
      }
    }

    function summarizeRenesas045A20Rows(monitorRows) {
      const voltage = monitorRowByKey(monitorRows, "voltage")?.value || "-";
      const soc = monitorRowByKey(monitorRows, "relativeSoc")?.value || "-";
      const current = monitorRowByKey(monitorRows, "current")?.value || "-";
      const status = monitorRowByKey(monitorRows, "batteryStatus")?.value || "-";
      const fetStatus = monitorRowByKey(monitorRows, "renesas045ManufacturerAccess")?.value || "-";
      const balance = monitorRowByKey(monitorRows, "maxImbalance");
      const balanceText = balance?.value && balance.value !== "-"
        ? `Balance ${balance.value} mV`
        : "Balance belum lengkap";
      return `FET ${fetStatus}, Voltage ${voltage} mV, SOC ${soc}%, Current ${current} mA, BatteryStatus ${status}, ${balanceText}.`;
    }

    async function runRenesas045A20ReadPlan(plan, label, updateMonitor = true) {
      setState(freshBatteryBusSessionPatch({
        bq30RecoveryRows: [],
        recoveryMessage: `${label} mulai. Semua command 045A20 read-only.`
      }));
      const resultRows = [];
      const monitorRows = [];
      for (const item of plan) {
        const row = await readRenesas045A20PlanRow(item);
        resultRows.push(row.resultRow);
        monitorRows.push(row.monitorRow);
        setState({
          bq30RecoveryRows: resultRows,
          recoveryMessage: `${label}: ${resultRows.length}/${plan.length} command dibaca.`
        });
        await delay(40);
      }

      const derivedRows = appendDerivedCellBalanceRows(monitorRows);
      const okCount = resultRows.filter((row) => !/ERR|timeout|gagal|fail/i.test(String(row.status || ""))).length;
      const summary = summarizeRenesas045A20Rows(derivedRows);
      const patch = {
        bq30RecoveryRows: resultRows,
        recoveryMessage: `${label} selesai. ${okCount}/${plan.length} OK. ${summary}`
      };
      if (updateMonitor) {
        const directMetrics = derivedRows.reduce((acc, row) => ({ ...acc, ...directRowToMetrics(row) }), {});
        patch.monitorRows = derivedRows;
        patch.metrics = mergeMetrics(createInitialMetrics(), directMetrics);
      }
      setState(patch);
      notifyUser(`${label} selesai. ${okCount}/${plan.length} OK.`, okCount ? "success" : "warning");
      return { resultRows, monitorRows: derivedRows, okCount, summary };
    }

    async function runRenesas045A20ReadStatus() {
      return runRenesas045A20ReadPlan([
        ...renesas045A20StatusReadPlan,
        ...renesas045A20ExtendedStatusReadPlan
      ], "045A20 Read Status", true);
    }

    async function runRenesas045A20ProbeIdentity() {
      return runRenesas045A20ReadPlan(renesas045A20IdentityProbePlan, "045A20 Probe Identity", false);
    }

    async function runRenesas045A20ProbeManufacturerArea() {
      return runRenesas045A20ReadPlan(renesas045A20ManufacturerProbePlan, "045A20 Probe Manufacturer Area", true);
    }

    async function runRenesas045A20AfterCellRecoveryCheck() {
      const result = await runRenesas045A20ReadPlan(renesas045A20StatusReadPlan, "045A20 After Cell Recovery Check", true);
      const health = calculateHealthPercent(result.monitorRows);
      const healthText = health === null ? "Unknown" : `${formatNumber(health, 0)}%`;
      const balance = monitorRowByKey(result.monitorRows, "maxImbalance");
      setState({
        bq30RecoveryRows: [
          ...result.resultRows,
          {
            label: "Service Health / SOH",
            command: "0x10/0x18",
            writeHex: "-",
            readHex: "-",
            status: `${healthText} from FCC / Design Capacity`
          },
          {
            label: "Cell Balance",
            command: "0x3C-0x3F",
            writeHex: "-",
            readHex: balance?.raw || "-",
            status: balance?.status || "not enough cell data"
          }
        ],
        recoveryMessage: `045A20 after-cell check selesai. Health/SOH ${healthText}. ${result.summary}`
      });
      notifyUser(`045A20 after-cell check selesai. Health/SOH ${healthText}.`, "success");
    }

    function renesas045A20SnapshotPlan() {
      const seen = new Set();
      return [
        ...renesas045A20StatusReadPlan,
        ...renesas045A20ExtendedStatusReadPlan,
        ...renesas045A20ManufacturerProbePlan
      ].filter((item) => {
        const key = `${item.command}|${item.operation}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    }

    function smbusPecCrc8(bytes) {
      let crc = 0;
      for (const byte of bytes) {
        crc ^= byte & 0xFF;
        for (let bit = 0; bit < 8; bit += 1) {
          crc = (crc & 0x80) ? ((crc << 1) ^ 0x07) & 0xFF : (crc << 1) & 0xFF;
        }
      }
      return crc & 0xFF;
    }

    function renesas045A20PecRawTransferHex(subCommand) {
      const payload = parseHexBytes(manufacturerAccessDataHex(subCommand));
      const packet = [0x00, ...payload];
      const addressByte = ((Number.parseInt(String(state.smbusAddress || "0x0B").replace(/^0x/i, ""), 16) || 0x0B) << 1) & 0xFE;
      const pec = smbusPecCrc8([addressByte, ...packet]);
      return [...packet, pec].map((byte) => byte.toString(16).toUpperCase().padStart(2, "0")).join(" ");
    }

    function renesas045A20SnapshotRows(rows, phase) {
      return rows
        .filter((row) => ["0x00", "0x16", "0x50", "0x51", "0x52", "0x53", "0x54"].includes(row.command))
        .map((row) => ({
          label: `${phase} ${row.label}`,
          command: row.command,
          writeHex: "-",
          readHex: row.raw || "-",
          status: row.status === "OK" ? `${row.value}${row.unit ? ` ${row.unit}` : ""}` : row.status || "-"
        }));
    }

    function renesas045A20StatusMap(rows) {
      return rows.reduce((acc, row) => {
        if (["0x00", "0x16", "0x50", "0x51", "0x52", "0x53", "0x54"].includes(row.command)) {
          acc[row.command] = row.raw || row.value || "-";
        }
        return acc;
      }, {});
    }

    function renesas045A20StatusDiff(beforeRows, afterRows) {
      const before = renesas045A20StatusMap(beforeRows);
      const after = renesas045A20StatusMap(afterRows);
      const changed = Object.keys({ ...before, ...after })
        .filter((command) => String(before[command] || "-") !== String(after[command] || "-"))
        .map((command) => `${command}: ${before[command] || "-"} -> ${after[command] || "-"}`);
      return changed.length ? changed.join("; ") : "status unchanged";
    }

    async function readRenesas045A20Snapshot(label, rows) {
      const plan = renesas045A20SnapshotPlan();
      const monitorRows = [];
      for (const item of plan) {
        const row = await readRenesas045A20PlanRow(item);
        monitorRows.push(row.monitorRow);
        if (Array.isArray(rows)) {
          rows.push(row.resultRow);
          setState({
            bq30RecoveryRows: rows,
            recoveryMessage: `${label}: ${monitorRows.length}/${plan.length} command dibaca.`
          });
        }
        await delay(35);
      }
      return appendDerivedCellBalanceRows(monitorRows);
    }

    async function writeRenesas045A20CandidateCommand(item) {
      const dataHex = manufacturerAccessDataHex(item.subCommand);
      const payload = item.mode === "ma-word-pec"
        ? {
          operation: "raw-transfer",
          command: "",
          dataHex: renesas045A20PecRawTransferHex(item.subCommand),
          readLength: 0
        }
        : {
          operation: "write-word",
          command: "0x00",
          dataHex
        };
      const result = await sendBatteryRecoverySmbusCommand(payload, recoverySmbusCommandTimeoutMs);
      return {
        label: item.label,
        command: item.mode === "ma-word-pec" ? `RAW MA ${item.subCommand}` : `MA ${item.subCommand}`,
        writeHex: result.writeHex || payload.dataHex || dataHex,
        readHex: result.readHex || "-",
        status: result.message || "OK"
      };
    }

    async function runRenesas045A20UnlockFetReferenceCheck() {
      if (!state.writeConfirmed) {
        setState({ recoveryMessage: "045A20 unlock belum dikirim. Centang Write enable dulu." });
        notifyUser("045A20 unlock belum dikirim. Centang Write enable dulu.", "warning");
        return;
      }
      const rows = [{
        label: "System Present",
        command: "SP",
        writeHex: "-",
        readHex: "-",
        status: "Untuk test FET valid, sambungkan yellow/SP ke GND."
      }];
      setState({
        bq30RecoveryRows: rows,
        recoveryMessage: "045A20 unlock mulai: baca status awal 0x50-0x54."
      });
      const beforeRows = await readRenesas045A20Snapshot("045A20 status awal", rows);
      rows.push(...renesas045A20SnapshotRows(beforeRows, "Before"));
      setState({
        bq30RecoveryRows: rows,
        recoveryMessage: "045A20 status awal selesai. Kandidat PF/FET dikirim."
      });

      for (const item of renesas045A20UnlockCandidateCommands) {
        rows.push({
          label: item.label,
          command: item.mode === "ma-word-pec" ? `RAW MA ${item.subCommand}` : `MA ${item.subCommand}`,
          writeHex: item.mode === "ma-word-pec" ? renesas045A20PecRawTransferHex(item.subCommand) : manufacturerAccessDataHex(item.subCommand),
          readHex: "-",
          status: "sending"
        });
        setState({
          bq30RecoveryRows: rows,
          recoveryMessage: `${item.label} ${item.subCommand} sedang dikirim...`
        });
        try {
          rows[rows.length - 1] = await writeRenesas045A20CandidateCommand(item);
        } catch (error) {
          rows[rows.length - 1] = {
            label: item.label,
            command: item.mode === "ma-word-pec" ? `RAW MA ${item.subCommand}` : `MA ${item.subCommand}`,
            writeHex: item.mode === "ma-word-pec" ? renesas045A20PecRawTransferHex(item.subCommand) : manufacturerAccessDataHex(item.subCommand),
            readHex: "-",
            status: error?.message || "ERR"
          };
        }
        setState({ bq30RecoveryRows: rows });
        await delay(120);
      }

      const afterRows = await readRenesas045A20Snapshot("045A20 status akhir", rows);
      rows.push(...renesas045A20SnapshotRows(afterRows, "After"));
      const diff = renesas045A20StatusDiff(beforeRows, afterRows);
      const summary = summarizeRenesas045A20Rows(afterRows);
      const directMetrics = afterRows.reduce((acc, row) => ({ ...acc, ...directRowToMetrics(row) }), {});
      setState({
        bq30RecoveryRows: rows,
        monitorRows: afterRows,
        metrics: mergeMetrics(createInitialMetrics(), directMetrics),
        recoveryMessage: `045A20 unlock selesai. ${diff}. ${summary}`
      });
      notifyUser(`045A20 unlock selesai: ${diff}.`, diff === "status unchanged" ? "warning" : "success");
    }

    async function runBq30UnlockFetFlow() {
      if (!state.writeConfirmed) {
        setState({ recoveryMessage: "BQ30 FAS + PF/FET belum dikirim. Centang Write enable dulu." });
        notifyUser("BQ30 FAS + PF/FET belum dikirim. Centang Write enable dulu.", "warning");
        return;
      }
      const result = await executeBq30FullAccessClearFaultEnableFet();
      const rows = bq30UnlockResultRows(result);
      setState({
        bq30RecoveryRows: rows,
        recoveryMessage: result.message || "BQ30 FAS + PF/FET selesai dikirim. Ukur P+ / P- pack untuk konfirmasi output."
      });
      notifyUser(result.message || "BQ30 FAS + PF/FET selesai dikirim.", result.success === false ? "warning" : "success");
      return { result, rows };
    }

    async function runBq30FullAccess() {
      if (!state.writeConfirmed) {
        setState({ recoveryMessage: "Full Access belum dikirim. Centang Write enable dulu." });
        notifyUser("Full Access belum dikirim. Centang Write enable dulu.", "warning");
        return;
      }
      const result = await executeBq30WorkflowStep({
        clearPermanentFailure: false,
        enableFets: false
      });
      return setBq30UnlockOperationResult(result, "BQ30 Full Access selesai.");
    }

    async function runBq30ClearProtection() {
      if (!state.writeConfirmed) {
        setState({ recoveryMessage: "Clear Protection belum dikirim. Centang Write enable dulu." });
        notifyUser("Clear Protection belum dikirim. Centang Write enable dulu.", "warning");
        return;
      }
      const result = await executeBq30WorkflowStep({
        clearPermanentFailure: true,
        enableFets: false
      });
      return setBq30UnlockOperationResult(result, "BQ30 Clear Protection selesai.");
    }

    async function runBq30UnlockFet() {
      if (!state.writeConfirmed) {
        setState({ recoveryMessage: "Unlock FET belum dikirim. Centang Write enable dulu." });
        notifyUser("Unlock FET belum dikirim. Centang Write enable dulu.", "warning");
        return;
      }
      const result = await executeBq30WorkflowStep({
        clearPermanentFailure: false,
        enableFets: true
      });
      return setBq30UnlockOperationResult(result, "BQ30 Unlock FET selesai.");
    }

    async function readBq30ServiceMonitorRow(plan, signal = null) {
      const definition = monitorParameters.find((item) => item.command === plan.command) || plan;
      const result = await sendBq30SmbusCommand({
        operation: plan.operation,
        command: plan.command,
        readLength: plan.readLength,
        writeEnableConfirmed: false
      }, recoverySmbusCommandTimeoutMs, { signal });
      return {
        key: plan.key,
        source: "Service",
        label: plan.label,
        command: plan.command,
        value: decodeDirectMonitorValue(definition, result.readHex, result.decodedValue),
        unit: definition.unit || "",
        numeric: decodeDirectMonitorNumber(definition, result.readHex),
        raw: result.readHex || "-",
        status: result.success ? "OK" : result.message || "ERR",
        meta: "after cell replace"
      };
    }

    function bq30MonitorRowToResultRow(row) {
      const value = row?.value && row.value !== "-"
        ? `${row.value}${row.unit ? ` ${row.unit}` : ""}`
        : row?.status || "-";
      return {
        label: row?.label || "-",
        command: row?.command || "-",
        writeHex: "-",
        readHex: row?.raw || "-",
        status: row?.status === "OK" ? value : row?.status || value
      };
    }

    function bq30BalanceDecisionRow(rows, targetDeltaMv = 30, mode = "balance") {
      const analysis = bq30CellBalanceAnalysis(rows, targetDeltaMv);
      const title = mode === "repair" ? "Repair Decision" : "Balance Decision";
      const status = bq30CellInstructionText(analysis, mode, `${formatNumber(targetDeltaMv, 0)} mV`);
      return {
        label: title,
        command: "0x3C-0x3F",
        writeHex: "-",
        readHex: analysis.cellListText,
        status
      };
    }

    function bq30CalibrationDecisionRow(rows, status, options = {}) {
      const analysis = bq30CellBalanceAnalysis(rows, Number(options.targetBalanceDeltaMv || 30));
      const health = calculateHealthPercent(rows);
      const charge = calculateChargePercent(rows);
      const targetLevelPercent = Number(options.targetLevelPercent || 100);
      const targetHealthPercent = Number(options.targetHealthPercent || 100);
      const ready = status?.chargeFetOn &&
        status?.dischargeFetOn &&
        status?.pfStatusHex === "0x00000000" &&
        status?.safetyStatusHex === "0x00000000" &&
        (analysis.delta === null || analysis.delta <= analysis.targetDeltaMv) &&
        charge !== null &&
        charge >= targetLevelPercent &&
        health !== null &&
        health >= targetHealthPercent;
      const healthText = health === null ? "Unknown" : `${formatNumber(health, 0)}%`;
      const chargeText = charge === null ? "Unknown" : `${formatNumber(charge, 0)}%`;
      return {
        label: "Refresh Gauge Readiness",
        command: "Service",
        writeHex: "-",
        readHex: `${formatNumber(targetLevelPercent, 0)}% / ${formatNumber(targetHealthPercent, 0)}%`,
        status: ready
          ? `Ready for refresh/relearn cycle. Health ${healthText}, charge ${chargeText}.`
          : `Not ready. PF/Safety/FET/cell balance perlu dicek dulu. Health ${healthText}, charge ${chargeText}. Target ${formatNumber(targetLevelPercent, 0)}% / ${formatNumber(targetHealthPercent, 0)}%.`
      };
    }

    function bq30CalibrationReadbackRows(beforeRows, afterRows, status, options = {}) {
      const targetDeltaMv = Number(options.targetBalanceDeltaMv || 30);
      const targetLevelPercent = Number(options.targetLevelPercent || 100);
      const targetHealthPercent = Number(options.targetHealthPercent || 100);
      const beforeLevel = calculateChargePercent(beforeRows);
      const afterLevel = calculateChargePercent(afterRows);
      const beforeHealth = calculateHealthPercent(beforeRows);
      const afterHealth = calculateHealthPercent(afterRows);
      const beforeFcc = monitorNumericValue(beforeRows, "fullChargeCapacity");
      const afterFcc = monitorNumericValue(afterRows, "fullChargeCapacity");
      const beforeDelta = bq30CellBalanceAnalysis(beforeRows, targetDeltaMv);
      const afterDelta = bq30CellBalanceAnalysis(afterRows, targetDeltaMv);
      const textPercent = (value) => value === null ? "Unknown" : `${formatNumber(value, 0)}%`;
      const textMah = (value) => value === null ? "Unknown" : `${formatNumber(value, 0)} mAh`;
      const pfClear = !status?.permanentFailure && status?.pfStatusHex === "0x00000000";
      const safetyClear = status?.safetyStatusHex === "0x00000000";
      const fetOn = Boolean(status?.chargeFetOn && status?.dischargeFetOn);
      return [
        {
          label: "Level Readback",
          command: "0x0D/0x0F/0x10",
          writeHex: "-",
          readHex: `${textPercent(beforeLevel)} -> ${textPercent(afterLevel)}`,
          status: afterLevel !== null && afterLevel >= targetLevelPercent
            ? `Level masuk target ${formatNumber(targetLevelPercent, 0)}%.`
            : `Level belum masuk target ${formatNumber(targetLevelPercent, 0)}%.`
        },
        {
          label: "Health Readback",
          command: "0x10/0x18",
          writeHex: "-",
          readHex: `${textPercent(beforeHealth)} -> ${textPercent(afterHealth)}`,
          status: afterHealth !== null && afterHealth >= targetHealthPercent
            ? `Health masuk target ${formatNumber(targetHealthPercent, 0)}%.`
            : `Health masih hasil gauge: ${textPercent(afterHealth)}.`
        },
        {
          label: "FCC Readback",
          command: "0x10",
          writeHex: "-",
          readHex: `${textMah(beforeFcc)} -> ${textMah(afterFcc)}`,
          status: "FCC dibaca ulang setelah trigger refresh/relearn."
        },
        {
          label: "Cell Delta Readback",
          command: "0x3C-0x3F",
          writeHex: "-",
          readHex: `${beforeDelta.deltaText} -> ${afterDelta.deltaText}`,
          status: afterDelta.delta !== null && afterDelta.delta <= targetDeltaMv
            ? `Delta masuk target ${formatNumber(targetDeltaMv, 0)} mV.`
            : `Delta belum masuk target ${formatNumber(targetDeltaMv, 0)} mV.`
        },
        {
          label: "Gauge State",
          command: "0x53/0x51/0x54",
          writeHex: "-",
          readHex: `${status?.pfStatusHex || "-"} / ${status?.safetyStatusHex || "-"} / ${status?.operationStatusHex || "-"}`,
          status: `PF=${pfClear ? "clear" : "active"} Safety=${safetyClear ? "clear" : "active"} FET=${fetOn ? "ON" : "OFF"}`
        }
      ];
    }

    async function runBq30ServiceCheck(label, extraRowsBuilder = null, options = {}) {
      const signal = options.signal || null;
      if (!options.keepSession) {
        setState(freshBatteryBusSessionPatch({
          bq30RecoveryRows: [],
          recoveryMessage: `${label} mulai. Command service BQ30 membaca kondisi pack.`
        }));
      }
      const serviceRows = [];
      const resultRows = [];
      for (const plan of bq30AfterCellReplaceReadPlan) {
        if (signal?.aborted) {
          throw new DOMException("Check Cells dihentikan.", "AbortError");
        }
        try {
          const row = await readBq30ServiceMonitorRow(plan, signal);
          serviceRows.push(row);
          resultRows.push(bq30MonitorRowToResultRow(row));
        } catch (error) {
          if (signal?.aborted || error?.name === "AbortError") {
            throw error;
          }
          const failed = {
            key: plan.key,
            source: "Service",
            label: plan.label,
            command: plan.command,
            value: "-",
            unit: "",
            raw: "-",
            status: error?.message || "ERR",
            meta: label
          };
          serviceRows.push(failed);
          resultRows.push(bq30MonitorRowToResultRow(failed));
        }
        setState({
          bq30RecoveryRows: resultRows,
          recoveryMessage: `${label}: ${resultRows.length}/${bq30AfterCellReplaceReadPlan.length} command dibaca.`
        });
        await delay(40);
      }

      const status = await fetchJson("/tools/battery-unlock/bq30/status", {
        method: "POST",
        timeoutMs: recoveryStatusTimeoutMs,
        signal,
        body: JSON.stringify({
          deviceType: state.deviceType,
          address: "0x0B",
          pinMode: lockedBatteryPinMode(state),
          speedMode: state.smbusSpeedMode || "auto",
          isolatedBatteryConfirmed: state.isolatedConfirmed
        })
      });
      const monitorRows = appendDerivedCellBalanceRows([
        ...serviceRows,
        ...bq30StatusToMonitorRows(status)
      ]);
      const summaryRows = bq30ServiceSummaryRows(monitorRows, status);
      const extraRows = typeof extraRowsBuilder === "function" ? extraRowsBuilder(monitorRows, status) : [];
      const directMetrics = monitorRows.reduce((acc, row) => ({ ...acc, ...directRowToMetrics(row) }), {});
      setState({
        bq30RecoveryRows: [...resultRows, ...summaryRows, ...extraRows],
        monitorRows,
        metrics: mergeMetrics(createInitialMetrics(), directMetrics),
        recoveryMessage: options.message || `${label} selesai. ${status.message || ""}`.trim()
      });
      if (!options.silent) {
        notifyUser(options.toast || `${label} selesai.`, options.tone || "success");
      }
      return { monitorRows, status, resultRows, summaryRows, extraRows };
    }

    async function runBq30CheckCell() {
      return runBq30ServiceCheck("BQ30 Check Cells");
    }

    async function startUniversalContinuousCellCheck() {
      if (state.bq30CellCheckRunning) {
        return;
      }
      if (!requireBatteryBusLock("recovery")) {
        return;
      }
      if (!state.isolatedConfirmed) {
        const message = "Check Cells belum mulai. Centang Battery isolated dulu.";
        setState({ recoveryMessage: message });
        notifyUser(message, "warning");
        return;
      }
      if (state.busy) {
        notifyUser("Operasi lain masih berjalan.", "warning");
        return;
      }
      if (state.monitorRunning) {
        stopMonitor("Monitoring dihentikan karena Check Cells continue dimulai.");
      }
      abortActiveBatteryOperation();

      const controller = new AbortController();
      bq30CellCheckAbortController = controller;
      const runId = bq30CellCheckRunId + 1;
      bq30CellCheckRunId = runId;
      setState(freshBatteryBusSessionPatch({
        bq30CellCheckRunning: true,
        bq30CellCheckCycle: 0,
        bq30RecoveryRows: [],
        recoveryMessage: "Check Cells continue mulai."
      }));
      notifyUser("Check Cells continue mulai.", "info");

      let cycle = 0;
      let failed = false;
      try {
        while (!controller.signal.aborted && bq30CellCheckRunId === runId) {
          cycle += 1;
          setState({
            bq30CellCheckCycle: cycle,
            recoveryMessage: `Check Cells continue cycle ${cycle} berjalan.`
          });
          await runUniversalCheckCells({
            label: `Check Cells #${cycle}`,
            signal: controller.signal,
            keepSession: true,
            silent: true,
            message: `Check Cells continue aktif. Cycle ${cycle} selesai. Tekan Stop untuk berhenti.`
          });
          if (controller.signal.aborted || bq30CellCheckRunId !== runId) {
            break;
          }
          await abortableDelay(1200, controller.signal);
        }
      } catch (error) {
        if (!controller.signal.aborted && error?.name !== "AbortError") {
          failed = true;
          const message = error?.message || "Check Cells continue gagal.";
          setState({
            bq30CellCheckRunning: false,
            recoveryMessage: message
          });
          notifyUser(message, "warning");
          return;
        }
      } finally {
        if (bq30CellCheckRunId === runId) {
          bq30CellCheckAbortController = null;
          if (!failed) {
            setState({
              bq30CellCheckRunning: false,
              recoveryMessage: `Check Cells berhenti. Cycle terakhir ${cycle}.`
            });
          }
        }
      }
    }

    async function runBq30Calibration() {
      if (!state.writeConfirmed) {
        setState({ recoveryMessage: "Refresh Gauge / Relearn belum dikirim. Centang Write enable dulu." });
        notifyUser("Refresh Gauge / Relearn belum dikirim. Centang Write enable dulu.", "warning");
        return;
      }
      const targetBalanceDeltaMv = Number(state.bq30TargetBalanceDeltaMv || 30);
      const targetLevelPercent = Number(state.bq30TargetLevelPercent || 100);
      const targetHealthPercent = Number(state.bq30TargetHealthPercent || 100);
      const baseline = await runBq30ServiceCheck("BQ30 Refresh Gauge baseline", (rows, status) => [
        bq30BalanceDecisionRow(rows, targetBalanceDeltaMv, "balance"),
        bq30CalibrationDecisionRow(rows, status, {
          targetBalanceDeltaMv,
          targetLevelPercent,
          targetHealthPercent
        })
      ], {
        silent: true,
        message: "Baseline refresh/relearn terbaca. Mengirim trigger refresh/recalc gauge..."
      });
      const trigger = await sendBq30SmbusCommand({
        operation: "write-word",
        command: bq30CalibrationTrigger.command,
        dataHex: bq30CalibrationTrigger.dataHex,
        readLength: 0
      });
      const triggerRow = {
        label: bq30CalibrationTrigger.label,
        command: `${bq30CalibrationTrigger.command}/${bq30CalibrationTrigger.subCommand}`,
        writeHex: trigger.writeHex || `${bq30CalibrationTrigger.command} ${bq30CalibrationTrigger.dataHex}`,
        readHex: trigger.readHex || "-",
        status: trigger.success
          ? `Trigger terkirim. Settle ${formatNumber(bq30CalibrationTrigger.settleMs)} ms lalu readback.`
          : trigger.message || "Trigger gagal."
      };
      setState({
        bq30RecoveryRows: [
          ...baseline.resultRows,
          ...baseline.summaryRows,
          ...baseline.extraRows,
          triggerRow
        ],
        recoveryMessage: trigger.success
          ? "Trigger refresh/relearn terkirim. Menunggu gauge settle sebelum readback..."
          : triggerRow.status
      });
      if (!trigger.success) {
        notifyUser(trigger.message || "Refresh Gauge / Relearn trigger gagal.", "warning");
        return { baseline, trigger, triggerRow };
      }
      await delay(bq30CalibrationTrigger.settleMs);
      const result = await runBq30ServiceCheck("BQ30 Refresh Gauge readback", (rows, status) => [
        triggerRow,
        ...bq30CalibrationReadbackRows(baseline.monitorRows, rows, status, {
          targetBalanceDeltaMv,
          targetLevelPercent,
          targetHealthPercent
        }),
        ...bq30CalibrationGoalRows(rows, status, {
          targetBalanceDeltaMv,
          targetLevelPercent,
          targetHealthPercent
        })
      ], {
        silent: true,
        message: "Refresh Gauge / Relearn selesai. Trigger sudah dikirim dan hasil gauge sudah dibaca ulang."
      });
      notifyUser("Refresh Gauge / Relearn selesai. Trigger terkirim dan readback selesai.", "success");
      return result;
    }

    function bq30ServiceSummaryRows(rows, status) {
      const health = calculateHealthPercent(rows);
      const charge = calculateChargePercent(rows);
      const fullChargeCapacity = monitorNumericValue(rows, "fullChargeCapacity");
      const designCapacity = monitorNumericValue(rows, "designCapacity");
      const cycleCount = monitorNumericValue(rows, "cycleCount");
      const balance = monitorRowByKey(rows, "maxImbalance");
      const balanceAnalysis = bq30CellBalanceAnalysis(rows, 30);
      const balanceDelta = Number.isFinite(balance?.numeric) ? balance.numeric : null;
      const pfClear = !status?.permanentFailure && status?.pfStatusHex === "0x00000000";
      const safetyClear = status?.safetyStatusHex === "0x00000000";
      const fetOn = Boolean(status?.chargeFetOn && status?.dischargeFetOn);
      const healthText = health === null ? "Unknown" : `${formatNumber(health, 0)}%`;
      const chargeText = charge === null ? "Unknown" : `${formatNumber(charge, 0)}%`;
      const balanceText = balanceDelta === null ? "Unknown" : `${formatNumber(balanceDelta)} mV`;
      const capacityText = fullChargeCapacity === null || designCapacity === null
        ? "-"
        : `${formatNumber(fullChargeCapacity)} / ${formatNumber(designCapacity)}`;
      const serviceReady = pfClear && safetyClear && fetOn && health !== null && (balanceDelta === null || balanceDelta <= 30);
      return [
        {
          label: "Service Health / SOH",
          command: "0x10/0x18",
          writeHex: "-",
          readHex: capacityText,
          status: `${healthText} from FCC / Design Capacity`
        },
        {
          label: "Charge Check",
          command: "0x0D",
          writeHex: "-",
          readHex: monitorRowByKey(rows, "relativeSoc")?.raw || "-",
          status: `${chargeText} after full charge`
        },
        {
          label: "Cell Pack Type",
          command: "Cells",
          writeHex: "-",
          readHex: balanceAnalysis.cellListText,
          status: balanceAnalysis.packType === "-" ? "not enough cell data" : `${balanceAnalysis.packType} detected`
        },
        {
          label: "Cell Balance",
          command: "0x3C-0x3F",
          writeHex: "-",
          readHex: balance?.raw || "-",
          status: balanceDelta === null ? "not enough cell data" : `${balanceText} delta`
        },
        {
          label: "Cycle Count",
          command: "0x17",
          writeHex: "-",
          readHex: monitorRowByKey(rows, "cycleCount")?.raw || "-",
          status: cycleCount === null ? "unknown" : formatNumber(cycleCount)
        },
        {
          label: "Fault / FET State",
          command: "0x53/0x51/0x54",
          writeHex: "-",
          readHex: `${status?.pfStatusHex || "-"} / ${status?.safetyStatusHex || "-"}`,
          status: `PF=${pfClear ? "clear" : "active"} Safety=${safetyClear ? "clear" : "active"} FET=${fetOn ? "ON" : "OFF"}`
        },
        {
          label: "Relearn Result",
          command: "Service",
          writeHex: "-",
          readHex: "-",
          status: serviceReady
            ? "Ready. Health dihitung ulang dari data terbaru."
            : "Check required. Health hanya dihitung jika FCC/Design dan status pack valid."
        }
      ];
    }

    async function runBq30AfterCellReplaceRelearn() {
      if (!state.writeConfirmed) {
        setState({ recoveryMessage: "After Cell Replace / Relearn belum dikirim. Centang Write enable dulu." });
        notifyUser("After Cell Replace / Relearn belum dikirim. Centang Write enable dulu.", "warning");
        return;
      }

      const unlockResult = await executeBq30FullAccessClearFaultEnableFet();
      const unlockRows = bq30UnlockResultRows(unlockResult);
      setState({
        bq30RecoveryRows: unlockRows,
        recoveryMessage: "Clear fault/FET selesai dikirim. Membaca data baru untuk hitung Health/SOH..."
      });

      await delay(300);
      const serviceRows = [];
      for (const plan of bq30AfterCellReplaceReadPlan) {
        try {
          serviceRows.push(await readBq30ServiceMonitorRow(plan));
        } catch (error) {
          serviceRows.push({
            key: plan.key,
            source: "Service",
            label: plan.label,
            command: plan.command,
            value: "-",
            unit: "",
            raw: "-",
            status: error?.message || "ERR",
            meta: "after cell replace"
          });
        }
        await delay(40);
      }

      const status = await fetchJson("/tools/battery-unlock/bq30/status", {
        method: "POST",
        timeoutMs: recoveryStatusTimeoutMs,
        body: JSON.stringify({
          deviceType: state.deviceType,
          address: "0x0B",
          pinMode: lockedBatteryPinMode(state),
          speedMode: state.smbusSpeedMode || "auto",
          isolatedBatteryConfirmed: state.isolatedConfirmed
        })
      });
      const monitorRows = appendDerivedCellBalanceRows([
        ...serviceRows,
        ...bq30StatusToMonitorRows(status)
      ]);
      const summaryRows = bq30ServiceSummaryRows(monitorRows, status);
      const health = calculateHealthPercent(monitorRows);
      const healthText = health === null ? "Unknown" : `${formatNumber(health, 0)}%`;
      const directMetrics = monitorRows.reduce((acc, row) => ({ ...acc, ...directRowToMetrics(row) }), {});
      setState({
        bq30RecoveryRows: [...unlockRows, ...summaryRows],
        monitorRows,
        metrics: mergeMetrics(createInitialMetrics(), directMetrics),
        recoveryMessage: `After Cell Replace / Relearn selesai. Health/SOH sekarang ${healthText} berdasarkan FCC / Design Capacity terbaru.`
      });
      notifyUser(`After Cell Replace / Relearn selesai. Health/SOH ${healthText}.`, "success");
    }

    async function readBq30RecoveryStatus() {
      const result = await fetchJson("/tools/battery-unlock/bq30/status", {
        method: "POST",
        timeoutMs: recoveryStatusTimeoutMs,
        body: JSON.stringify({
          deviceType: state.deviceType,
          address: "0x0B",
          pinMode: lockedBatteryPinMode(state),
          speedMode: state.smbusSpeedMode || "auto",
          isolatedBatteryConfirmed: state.isolatedConfirmed
        })
      });
      const rows = [
        {
          label: "Security",
          command: "0x54",
          writeHex: "MA 54 00",
          readHex: result.operationStatusHex || "-",
          status: `${result.securityModeName || "Unknown"} (SEC=${result.securityMode ?? "-"})`
        },
        {
          label: "Operation Status",
          command: "0x54",
          writeHex: "MA 54 00",
          readHex: result.operationStatusHex || "-",
          status: `CHG=${result.chargeFetOn ? "ON" : "OFF"} DSG=${result.dischargeFetOn ? "ON" : "OFF"} PF=${result.permanentFailure ? "ON" : "OFF"}`
        },
        {
          label: "PF Status",
          command: "0x53",
          writeHex: "MA 53 00",
          readHex: result.pfStatusHex || "-",
          status: Array.isArray(result.activePermanentFailures) && result.activePermanentFailures.length
            ? result.activePermanentFailures.join(", ")
            : "clear"
        },
        {
          label: "Safety Status",
          command: "0x51",
          writeHex: "MA 51 00",
          readHex: result.safetyStatusHex || "-",
          status: result.safetyStatusHex === "0x00000000" ? "clear" : "active"
        },
        {
          label: "Manufacturing Status",
          command: "0x57",
          writeHex: "MA 57 00",
          readHex: result.manufacturingStatusHex || "-",
          status: "manufacturing flags"
        }
      ];
      setState({
        bq30RecoveryRows: rows,
        recoveryMessage: result.message || "BQ30 status terbaca."
      });
      notifyUser(result.message || "BQ30 status terbaca.", result.success === false ? "warning" : "success");
      return result;
    }

    async function readBq40RecoveryStatus() {
      const result = await fetchJson("/tools/battery-unlock/bq40/status", {
        method: "POST",
        timeoutMs: recoveryLongOperationTimeoutMs,
        body: JSON.stringify({
          deviceType: state.deviceType,
          address: "0x0B",
          pinMode: lockedBatteryPinMode(state),
          speedMode: state.smbusSpeedMode || "auto",
          isolatedBatteryConfirmed: state.isolatedConfirmed
        })
      });
      const activePf = Array.isArray(result.activePermanentFailures) ? result.activePermanentFailures : [];
      const activeSafety = Array.isArray(result.activeSafetyFlags) ? result.activeSafetyFlags : [];
      const decoded = Number.isFinite(Number(result.securityMode)) && Number(result.securityMode) >= 0;
      const backendRows = Array.isArray(result.rows) ? result.rows : [];
      const summaryRows = [
        {
          label: "Security",
          command: "0x54",
          writeHex: "-",
          readHex: result.operationStatusHex || "-",
          status: decoded
            ? `${result.securityModeName || "Unknown"} (SEC=${result.securityMode ?? "-"})`
            : "raw status only"
        },
        {
          label: "Operation Status",
          command: "0x54",
          writeHex: "-",
          readHex: result.operationStatusHex || "-",
          status: decoded
            ? `CHG=${result.chargeFetOn ? "ON" : "OFF"} DSG=${result.dischargeFetOn ? "ON" : "OFF"} PF=${result.permanentFailure ? "ON" : "OFF"}`
            : "not decoded"
        },
        {
          label: "PF Status",
          command: "0x53",
          writeHex: "-",
          readHex: result.pfStatusHex || "-",
          status: decoded ? activePf.length ? activePf.join(", ") : "clear" : "raw only"
        },
        {
          label: "Safety Status",
          command: "0x51",
          writeHex: "-",
          readHex: result.safetyStatusHex || "-",
          status: decoded ? activeSafety.length ? activeSafety.join(", ") : "clear" : "raw only"
        },
        {
          label: "Manufacturing Status",
          command: "0x57",
          writeHex: "-",
          readHex: result.manufacturingStatusHex || "-",
          status: "manufacturing flags"
        }
      ];
      const commandRows = backendRows.map((row) => ({
        label: row.label || "-",
        command: row.command || "-",
        writeHex: "-",
        readHex: row.readHex || "-",
        status: row.success
          ? `${row.value || "-"}${row.unit ? ` ${row.unit}` : ""}`
          : row.status || "ERR"
      }));
      const monitorRows = appendDerivedCellBalanceRows([
        ...backendRows.map(bq40BackendRowToMonitorRow),
        ...bq40StatusToMonitorRows(result)
      ]);
      const directMetrics = monitorRows.reduce((acc, row) => ({ ...acc, ...directRowToMetrics(row) }), {});
      setState({
        bq30RecoveryRows: [...summaryRows, ...commandRows],
        monitorRows,
        metrics: mergeMetrics(createInitialMetrics(), directMetrics),
        recoveryMessage: result.message || "BQ40 status terbaca."
      });
      notifyUser(result.message || "BQ40 status terbaca.", result.success === false ? "warning" : "success");
      return result;
    }

    async function runBq30ManufacturerAccessSequence(commands) {
      const rows = [];
      for (const item of commands) {
        const word = Number.parseInt(String(item.subCommand || "0").replace(/^0x/i, ""), 16) || 0;
        const dataHex = `${(word & 0xFF).toString(16).padStart(2, "0")} ${((word >> 8) & 0xFF).toString(16).padStart(2, "0")}`;
        rows.push({
          label: item.label,
          subCommand: item.subCommand,
          writeHex: `00 ${dataHex}`,
          readHex: "-",
          status: "sending"
        });
        setState({
          bq30RecoveryRows: rows,
          recoveryMessage: `${item.label} ${item.subCommand} sedang dikirim...`
        });
        try {
          const result = await sendBq30SmbusCommand({
            operation: "write-word",
            command: "0x00",
            dataHex
          });
          rows[rows.length - 1] = {
            label: item.label,
            subCommand: item.subCommand,
            writeHex: result.writeHex || "-",
            readHex: result.readHex || "-",
            status: result.message || "OK"
          };
        } catch (error) {
          rows[rows.length - 1] = {
            label: item.label,
            subCommand: item.subCommand,
            writeHex: "-",
            readHex: "-",
            status: error?.message || "ERR"
          };
        }
        setState({ bq30RecoveryRows: rows });
        await delay(80);
      }
      return rows;
    }

    async function writeBq30ManufacturerAccessSequence(commands, label) {
      if (!state.writeConfirmed) {
        setState({ recoveryMessage: `${label} belum dikirim. Centang Write enable dulu.` });
        notifyUser(`${label} belum dikirim. Centang Write enable dulu.`, "warning");
        return;
      }
      setState({
        bq30RecoveryRows: [],
        recoveryMessage: `${label} mulai. Command MA dikirim langsung; status dibaca setelah write supaya tombol tidak nyangkut di pre-check.`
      });
      const rows = await runBq30ManufacturerAccessSequence(commands);
      try {
        const status = await fetchJson("/tools/battery-unlock/bq30/status", {
          method: "POST",
          timeoutMs: recoveryStatusTimeoutMs,
          body: JSON.stringify({
            deviceType: state.deviceType,
            address: "0x0B",
            pinMode: lockedBatteryPinMode(state),
            speedMode: state.smbusSpeedMode || "auto",
            isolatedBatteryConfirmed: state.isolatedConfirmed
          })
        });
        rows.push({
          label: "Verify Status",
          command: "0x54/0x53/0x51",
          writeHex: "MA status",
          readHex: `${status.operationStatusHex || "-"} / ${status.pfStatusHex || "-"} / ${status.safetyStatusHex || "-"}`,
          status: `SEC=${status.securityMode ?? "-"} CHG=${status.chargeFetOn ? "ON" : "OFF"} DSG=${status.dischargeFetOn ? "ON" : "OFF"}`
        });
      } catch (error) {
        rows.push({
          label: "Verify Status",
          command: "0x54/0x53/0x51",
          writeHex: "MA status",
          readHex: "-",
          status: error?.message || "Status verify gagal"
        });
      }
      setState({
        bq30RecoveryRows: rows,
        recoveryMessage: `${label} selesai dikirim. Cek P+ / P- dan status pack untuk konfirmasi hasil nyata.`
      });
      notifyUser(`${label} selesai dikirim.`, "success");
    }

    function bindCommon(container) {
      container.querySelectorAll("[data-battery-tab]").forEach((button) => {
        button.addEventListener("click", () => {
          const nextTab = button.dataset.batteryTab || "monitor";
          if (state.monitorRunning && nextTab !== "monitor") {
            stopMonitor("Monitoring dihentikan saat pindah tab.");
          }
          if (state.busy && nextTab !== state.activeTab) {
            abortActiveBatteryOperation();
            resetBackendBatterySessionQuiet(state.deviceType);
            setState({
              activeTab: nextTab,
              busy: false,
              apiMessage: nextTab === "smbus" ? "Operasi tab sebelumnya dibatalkan. Session siap." : state.apiMessage,
              dataMessage: nextTab === "data" ? "Operasi tab sebelumnya dibatalkan. Session siap." : state.dataMessage,
              recoveryMessage: nextTab === "recovery" ? "Operasi tab sebelumnya dibatalkan. Session siap." : state.recoveryMessage,
              monitorMessage: nextTab === "monitor" ? "Operasi tab sebelumnya dibatalkan. Start akan mulai sesi baru." : state.monitorMessage
            });
            return;
          }
          setState({ activeTab: nextTab });
        });
      });
      container.querySelector("#batteryResetSessionButton")?.addEventListener("click", resetBatterySession);
      container.querySelector("#batteryDetectBusButton")?.addEventListener("click", () => withBusy(detectBatteryBus));

      container.querySelectorAll("#batteryDeviceType").forEach((select) => {
        select.addEventListener("change", () => {
          const nextDeviceType = select.value || usbDeviceType;
          setState({
            deviceType: nextDeviceType,
            ...clearBatteryBusLockPatch("Koneksi diganti. Jalankan Detek ulang sebelum operasi Battery Unlock.")
          });
        });
      });

      container.querySelector("#batteryGlobalSampleRate")?.addEventListener("change", (event) => {
        setState({ monitorSampleRateHz: normalizeMonitorSampleRateHz(event.target.value) });
      });

      container.querySelector("#batteryGlobalSmbusSpeed")?.addEventListener("change", (event) => {
        setState({ smbusSpeedMode: event.target.value || "auto" });
      });
    }

    function bindMonitor(container) {
      container.querySelector("#batteryMonitorDirectButton")?.addEventListener("click", toggleDirectMonitor);
    }

    function bindData(container) {
      const series = container.querySelector("#batteryDataSeriesSelect");
      const isolated = container.querySelector("#batteryDataIsolatedConfirmed");
      const write = container.querySelector("#batteryDataWriteConfirmed");
      const importFile = container.querySelector("#batteryDataImportFile");
      series?.addEventListener("change", () => {
        const [kind, id] = String(series.value || "").split(":");
        if (kind === "catalog") {
          const family = getSeriesFamilies(state).find((item) => item.id === id);
          setState({
            selectedCatalogFamilyId: family?.id || id,
            dataImportVerified: false,
            dataMessage: `${family?.family || "IC"} dipilih. Backup tetap read-only; restore perlu profile/plan yang cocok.`
          });
          return;
        }
        const profile = getProfiles(state).find((item) => item.id === id || item.id === series.value);
        const family = getSeriesFamilies(state).find((item) => item.id === profile?.id || (item.aliases || []).some((alias) => (profile?.aliases || []).includes(alias)));
        setState({
          selectedProfileId: profile?.id || id || series.value,
          selectedCatalogFamilyId: family?.id || state.selectedCatalogFamilyId,
          dataImportVerified: false,
          dataMessage: `${profile?.name || "Profile"} dipilih untuk data backup.`
        });
      });
      isolated?.addEventListener("change", () => setState({ isolatedConfirmed: isolated.checked }));
      write?.addEventListener("change", () => setState({ writeConfirmed: write.checked }));
      container.querySelector("#batteryDataIdentifyButton")?.addEventListener("click", () => withBusy(runDataIdentify));
      container.querySelector("#batteryDataBackupButton")?.addEventListener("click", () => withBusy(runDataBackup));
      container.querySelector("#batteryDataExportButton")?.addEventListener("click", exportDataBackup);
      container.querySelector("#batteryDataImportButton")?.addEventListener("click", () => importFile?.click());
      importFile?.addEventListener("change", () => {
        const file = importFile.files?.[0];
        if (file) {
          withBusy(() => importDataBackupFile(file));
        }
        importFile.value = "";
      });
      container.querySelector("#batteryDataVerifyButton")?.addEventListener("click", () => withBusy(verifyDataBackup));
      container.querySelector("#batteryDataRestoreButton")?.addEventListener("click", () => withBusy(restoreDataBackup));
    }

    function bindSmbus(container) {
      const operation = container.querySelector("#batterySmbusOperation");
      const address = container.querySelector("#batterySmbusAddress");
      const command = container.querySelector("#batterySmbusCommand");
      const dataHex = container.querySelector("#batterySmbusDataHex");
      const readLength = container.querySelector("#batterySmbusReadLength");
      const pinMode = container.querySelector("#batterySmbusPinMode");
      const speedMode = container.querySelector("#batterySmbusSpeedMode");
      const requireIdle = container.querySelector("#batterySmbusRequireIdle");
      const scanAddresses = container.querySelector("#batterySmbusScanAddresses");
      const isolated = container.querySelector("#batteryIsolatedConfirmed");
      const write = container.querySelector("#batteryWriteConfirmed");
      operation?.addEventListener("change", () => setState({ smbusOperation: operation.value, smbusDiagnostic: null }));
      address?.addEventListener("input", () => { state.smbusAddress = address.value; state.smbusDiagnostic = null; });
      command?.addEventListener("input", () => { state.smbusCommand = command.value; state.smbusDiagnostic = null; });
      dataHex?.addEventListener("input", () => { state.smbusDataHex = dataHex.value; });
      readLength?.addEventListener("input", () => { state.smbusReadLength = Number(readLength.value || 0); });
      pinMode?.addEventListener("change", () => setState({ smbusPinMode: pinMode.value || "auto", smbusDiagnostic: null }));
      speedMode?.addEventListener("change", () => setState({ smbusSpeedMode: speedMode.value || "auto", smbusDiagnostic: null }));
      requireIdle?.addEventListener("change", () => setState({ smbusRequireIdle: requireIdle.checked }));
      scanAddresses?.addEventListener("change", () => setState({ smbusScanAddresses: scanAddresses.checked, smbusDiagnostic: null }));
      isolated?.addEventListener("change", () => setState({ isolatedConfirmed: isolated.checked }));
      write?.addEventListener("change", () => setState({ writeConfirmed: write.checked }));
      container.querySelector("#batterySmbusGaugeProbeButton")?.addEventListener("click", () => withBusy(runSmbusGaugeProbe));
      container.querySelector("#batterySmbusSendButton")?.addEventListener("click", () => withBusy(sendSmbus));
    }

    function bindRecovery(container) {
      const profileSelect = container.querySelector("#batteryProfileSelect");
      const actionSelect = container.querySelector("#batteryActionSelect");
      const isolated = container.querySelector("#batteryRecoveryIsolatedConfirmed");
      const write = container.querySelector("#batteryRecoveryWriteConfirmed");
      profileSelect?.addEventListener("change", () => {
        if (state.bq30CellCheckRunning) {
          stopBq30CellCheck("Check Cells dihentikan karena seri/IC diganti.");
        }
        const [kind, id] = String(profileSelect.value || "").split(":");
        if (kind === "catalog") {
          const family = getSeriesFamilies(state).find((item) => item.id === id);
          setState({
            selectedCatalogFamilyId: family?.id || id,
            recoveryPreview: null,
            bq30RecoveryRows: [],
            recoveryMessage: `${family?.family || "IC"} reference-only. Gunakan Set Probe untuk capture awal.`
          });
          return;
        }
        const profile = getProfiles(state).find((item) => item.id === id || item.id === profileSelect.value);
        const family = getSeriesFamilies(state).find((item) => item.id === profile?.id || (item.aliases || []).some((alias) => (profile?.aliases || []).includes(alias)));
        setState({
          selectedProfileId: profile?.id || id || profileSelect.value,
          selectedCatalogFamilyId: family?.id || state.selectedCatalogFamilyId,
          selectedActionId: universalRecoveryOperations[0]?.id || "",
          recoveryPreview: null,
          bq30RecoveryRows: []
        });
      });
      actionSelect?.addEventListener("change", () => {
        if (state.bq30CellCheckRunning) {
          stopBq30CellCheck("Check Cells dihentikan karena operasi diganti.");
        }
        setState({
          selectedActionId: actionSelect.value,
          recoveryPreview: null,
          bq30RecoveryRows: []
        });
      });
      isolated?.addEventListener("change", () => setState({ isolatedConfirmed: isolated.checked }));
      write?.addEventListener("change", () => setState({ writeConfirmed: write.checked }));
      const balanceTarget = container.querySelector("#batteryBq30TargetBalanceDeltaMv");
      const levelTarget = container.querySelector("#batteryBq30TargetLevelPercent");
      const healthTarget = container.querySelector("#batteryBq30TargetHealthPercent");
      balanceTarget?.addEventListener("input", () => setState({
        bq30TargetBalanceDeltaMv: normalizeTargetNumber(balanceTarget.value, 30, 1, 500)
      }));
      levelTarget?.addEventListener("input", () => setState({
        bq30TargetLevelPercent: normalizeTargetNumber(levelTarget.value, 100, 0, 100)
      }));
      healthTarget?.addEventListener("input", () => setState({
        bq30TargetHealthPercent: normalizeTargetNumber(healthTarget.value, 100, 0, 100)
      }));
      container.querySelector("#batteryRecoveryPreviewButton")?.addEventListener("click", () => withBusy(previewRecovery));
      container.querySelector("#batteryRecoveryExecuteButton")?.addEventListener("click", () => {
        const profile = selectedProfile(state);
        const family = selectedCatalogFamily(state);
        const operation = selectedRecoveryOperation(state, profile, family);
        if (isCellCheckRecoveryOperation(operation)) {
          void startUniversalContinuousCellCheck();
          return;
        }
        void withBusy(runSelectedRecoveryOperation);
      });
      container.querySelector("#batteryBq30StopCellCheckButton")?.addEventListener("click", () => {
        stopBq30CellCheck("Check Cells dihentikan oleh user.");
      });
    }

    function captureMonitorScrollState() {
      if (!mountedContainer || state.activeTab !== "monitor") {
        return null;
      }
      const tableWrap = mountedContainer.querySelector(".battery-monitor-table-area .battery-table-wrap");
      const tableArea = mountedContainer.querySelector(".battery-monitor-table-area");
      return {
        tableWrapTop: tableWrap?.scrollTop || 0,
        tableWrapLeft: tableWrap?.scrollLeft || 0,
        tableAreaTop: tableArea?.scrollTop || 0,
        tableAreaLeft: tableArea?.scrollLeft || 0,
        windowTop: window.scrollY || document.documentElement?.scrollTop || 0,
        windowLeft: window.scrollX || document.documentElement?.scrollLeft || 0
      };
    }

    function restoreMonitorScrollState(scrollState) {
      if (!scrollState || !mountedContainer || state.activeTab !== "monitor") {
        return;
      }
      const tableWrap = mountedContainer.querySelector(".battery-monitor-table-area .battery-table-wrap");
      const tableArea = mountedContainer.querySelector(".battery-monitor-table-area");
      if (tableWrap) {
        tableWrap.scrollTop = scrollState.tableWrapTop;
        tableWrap.scrollLeft = scrollState.tableWrapLeft;
      }
      if (tableArea) {
        tableArea.scrollTop = scrollState.tableAreaTop;
        tableArea.scrollLeft = scrollState.tableAreaLeft;
      }
      if (Number.isFinite(scrollState.windowTop) && Number.isFinite(scrollState.windowLeft)) {
        window.scrollTo(scrollState.windowLeft, scrollState.windowTop);
      }
    }

    function render() {
      if (!mountedContainer) {
        return;
      }
      const monitorScrollState = captureMonitorScrollState();
      mountedContainer.innerHTML = createWorkbenchMarkup(state);
      bindCommon(mountedContainer);
      if (state.activeTab === "monitor") {
        bindMonitor(mountedContainer);
      } else if (state.activeTab === "data") {
        bindData(mountedContainer);
      } else if (state.activeTab === "smbus") {
        bindSmbus(mountedContainer);
      } else {
        bindRecovery(mountedContainer);
      }
      restoreMonitorScrollState(monitorScrollState);
      if (monitorScrollState) {
        window.requestAnimationFrame(() => restoreMonitorScrollState(monitorScrollState));
      }
    }

    return {
      viewKey: "tool_battery_unlock",
      eyebrow: "Battery Tools",
      title: "Battery Unlock",
      subtitle: "Monitor dan recovery baterai laptop via SMBus/I2C.",
      mount(options = {}) {
        mountedContainer = options.container || mountedContainer;
        notifyUser = typeof options.notify === "function" ? options.notify : (() => {});
        render();
        if (!state.database) {
          withBusy(loadDatabase);
        }
      },
      setVisible(visible) {
        if (!mountedContainer) {
          return;
        }
        if (!visible && state.monitorRunning) {
          stopMonitor("Monitoring dihentikan saat halaman ditutup.");
        }
        mountedContainer.classList.toggle("hidden", !visible);
      },
      refresh() {
        if (!state.database) {
          withBusy(loadDatabase);
        }
      }
    };
  }

  globalScope.teknisiHubPages = globalScope.teknisiHubPages || {};
  globalScope.teknisiHubPages.batteryUnlock = createApi();
})(window);
