/**
 * Data Center Infrastructure platform configs.
 * Category: "datacenter" — security rovers, cleaning robots, inventory AMRs.
 */

import type { PlatformProfile } from "./index";

export const DATACENTER_PLATFORMS: PlatformProfile[] = [
  {
    id: "knightscope-k5",
    name: "Knightscope K5",
    manufacturer: "Knightscope",
    category: "datacenter",
    description: "Autonomous security rover. 360° sensor coverage, 24-hr continuous patrol, deployed in data centers and corporate campuses.",
    specs: [
      { label: "Height",    value: "1.5m" },
      { label: "Weight",    value: "136 kg" },
      { label: "Runtime",   value: "24hr continuous" },
      { label: "Cameras",   value: "360° optical" },
      { label: "LiDAR",     value: "Yes" },
      { label: "Thermal",   value: "Yes" },
      { label: "Acoustic",  value: "Anomaly detection" },
    ],
    tlmRanges: {
      healthScoreMin: 78,
      healthScoreMax: 98,
      batteryPctMin: 20,
      batteryPctMax: 100,
      motorTempMin: 25,
      motorTempMax: 52,
    },
    failureSignatures: [
      { id: "camera-degradation", name: "Camera Degradation",   severity: "warning",  description: "Image clarity <85% — lens foul or sensor noise floor elevated" },
      { id: "battery-thermal",    name: "Battery Thermal",      severity: "critical", description: "Cell temp >52°C — thermal runaway risk in sealed chassis" },
      { id: "wheel-motor-draw",   name: "Wheel Motor Draw",     severity: "warning",  description: "Current >20% above baseline — bearing wear or debris ingestion" },
      { id: "lidar-dropout",      name: "LiDAR Dropout",        severity: "critical", description: ">3 sectors blind — collision avoidance compromised" },
      { id: "connectivity-loss",  name: "Connectivity Loss",    severity: "critical", description: ">5min offline — active security gap in patrol route" },
    ],
    maintenanceCta: "Schedule K5 service",
    maintenanceIntervals: {
      batteryCheck:       { interval: "30 days",  signal: "battery-thermal"    },
      sensorCalibration:  { interval: "90 days",  signal: "camera-degradation" },
      wheelInspect:       { interval: "60 days",  signal: "wheel-motor-draw"   },
      lidarCleaning:      { interval: "30 days",  signal: "lidar-dropout"      },
      connectivityAudit:  { interval: "Monthly",  signal: "connectivity-loss"  },
      fullServiceVisit:   { interval: "6 months", signal: null                 },
    },
  },
  {
    id: "avidbots-neo",
    name: "Avidbots Neo",
    manufacturer: "Avidbots",
    category: "datacenter",
    description: "Autonomous floor-scrubbing robot. 5,000 sqm/hr coverage, 45L tank. Standard fit for large data center raised-floor environments.",
    specs: [
      { label: "Cleaning Width", value: "85 cm" },
      { label: "Tank",           value: "45 L" },
      { label: "Runtime",        value: "4hr" },
      { label: "Coverage",       value: "5,000 sqm/hr" },
      { label: "Navigation",     value: "Autonomous LiDAR" },
    ],
    tlmRanges: {
      healthScoreMin: 75,
      healthScoreMax: 97,
      batteryPctMin: 15,
      batteryPctMax: 95,
      motorTempMin: 28,
      motorTempMax: 50,
    },
    failureSignatures: [
      { id: "brush-motor-wear",   name: "Brush Motor Wear",    severity: "warning",  description: "Current >15% above baseline — brush pad degradation or debris jam" },
      { id: "water-pump-failure", name: "Water Pump Failure",  severity: "warning",  description: "Flow rate drop >20% — pump wear or filter clog" },
      { id: "tank-seal-leak",     name: "Tank Seal Leak",      severity: "critical", description: "Moisture sensor triggered on chassis — floor safety risk" },
      { id: "nav-lidar-drift",    name: "Nav LiDAR Drift",     severity: "warning",  description: "Position error >10cm — map drift, route deviation likely" },
      { id: "battery-degraded",   name: "Battery Degraded",    severity: "warning",  description: "<75% original capacity — coverage area shrinking" },
    ],
    maintenanceCta: "Schedule Neo service",
    maintenanceIntervals: {
      brushReplacement:   { interval: "150hr operation",  signal: "brush-motor-wear"   },
      filterClean:        { interval: "Weekly",           signal: "water-pump-failure" },
      tankSealInspect:    { interval: "30 days",          signal: "tank-seal-leak"     },
      lidarCalibration:   { interval: "90 days",          signal: "nav-lidar-drift"    },
      batteryCheck:       { interval: "6 months",         signal: "battery-degraded"   },
      fullServiceVisit:   { interval: "Annual",           signal: null                 },
    },
  },
  {
    id: "locus-origin-amr",
    name: "Locus Origin AMR",
    manufacturer: "Locus Robotics",
    category: "datacenter",
    description: "Inventory AMR for high-density warehouse and data center supply rooms. 68kg payload, 8hr runtime, autonomous navigation.",
    specs: [
      { label: "Payload",     value: "68 kg" },
      { label: "Speed",       value: "1.8 m/s" },
      { label: "Runtime",     value: "8hr" },
      { label: "Navigation",  value: "Autonomous SLAM" },
      { label: "Scanner",     value: "1D/2D barcode" },
    ],
    tlmRanges: {
      healthScoreMin: 80,
      healthScoreMax: 99,
      batteryPctMin: 10,
      batteryPctMax: 100,
      motorTempMin: 30,
      motorTempMax: 56,
    },
    failureSignatures: [
      { id: "drive-motor-bearing",  name: "Drive Motor Bearing",   severity: "warning",  description: "Vibration >0.6g RMS — bearing wear onset" },
      { id: "barcode-scanner-drift",name: "Barcode Scanner Drift", severity: "warning",  description: "Read failure rate >2% — lens dirty or scanner calibration drift" },
      { id: "estop-response",       name: "E-Stop Response",       severity: "critical", description: "Response time >100ms — safety system degradation" },
      { id: "battery-cell-drift",   name: "Battery Cell Drift",    severity: "warning",  description: "±60mV cell delta — pack imbalance, capacity loss imminent" },
    ],
    maintenanceCta: "Schedule AMR service",
    maintenanceIntervals: {
      bearingInspect:    { interval: "6 months",   signal: "drive-motor-bearing"   },
      scannerClean:      { interval: "30 days",    signal: "barcode-scanner-drift" },
      estopTest:         { interval: "Monthly",    signal: "estop-response"        },
      batteryBalance:    { interval: "90 days",    signal: "battery-cell-drift"    },
      fullServiceVisit:  { interval: "Annual",     signal: null                    },
    },
  },
];
