/** Aftermarket and replacement parts registry.
 *
 * These are individual sellable components (actuators, batteries, hands) that
 * appear in /store and the parts advisor — NOT full robot platforms.
 *
 * They are intentionally excluded from the knowledge-platform grid so the
 * platform catalog stays about whole robots, not individual spare parts.
 */

import type { PlatformProfile } from "./index";

/** Parts that render the real H1 URDF as their 3D preview (no public part-level URDF exists). */
export const H1_PARTS: PlatformProfile[] = [
  {
    id: "h1-knee-act",
    name: "H1 Knee Actuator",
    manufacturer: "Unitree Robotics",
    category: "industrial",
    description:
      "Genuine replacement knee actuator module for the Unitree H1. Direct-fit, factory-calibrated. Replace at 73% wear before failure.",
    specs: [
      { label: "Fit", value: "H1 / H1-2" },
      { label: "Joint", value: "Knee" },
      { label: "Warranty", value: "12 mo" },
      { label: "Lead", value: "5–7 days" },
      { label: "Price", value: "$1,180" },
    ],
    tlmRanges: {
      healthScoreMin: 80,
      healthScoreMax: 99,
      batteryPctMin: 100,
      batteryPctMax: 100,
      motorTempMin: 30,
      motorTempMax: 60,
    },
    failureSignatures: [
      {
        id: "knee-actuator-wear",
        name: "Knee Actuator Wear",
        severity: "warning",
        description: "Knee position error > 4mm indicates reducer wear — replace at 73% wear",
      },
    ],
    maintenanceCta: "Order part",
    manualUrl: "https://unitree.com",
    diagramUrl: "https://unitree.com",
    badge: "Aftermarket",
  },
  {
    id: "h1-battery",
    name: "H1 Battery Pack (864Wh)",
    manufacturer: "Unitree Robotics",
    category: "industrial",
    description:
      "864Wh main power pack for the Unitree H1. CATL cells, factory-matched BMS. Swap at 800 cycles or on TechMedix health alert.",
    specs: [
      { label: "Capacity", value: "864 Wh" },
      { label: "Cells", value: "CATL" },
      { label: "Fit", value: "H1 series" },
      { label: "Lead", value: "3–5 days" },
      { label: "Price", value: "$1,200" },
    ],
    tlmRanges: {
      healthScoreMin: 80,
      healthScoreMax: 99,
      batteryPctMin: 100,
      batteryPctMax: 100,
      motorTempMin: 30,
      motorTempMax: 60,
    },
    failureSignatures: [
      {
        id: "battery-cell-drift",
        name: "Battery Cell Drift",
        severity: "warning",
        description: "±50mV cell delta — pack imbalance, swap recommended",
      },
      {
        id: "battery-critical",
        name: "Battery Critical",
        severity: "critical",
        description: "SOC < 15% during active task",
      },
    ],
    maintenanceCta: "Order part",
    manualUrl: "https://unitree.com",
    diagramUrl: "https://unitree.com",
    badge: "Aftermarket",
  },
  {
    id: "h1-shoulder-act",
    name: "H1 Shoulder Actuator",
    manufacturer: "Unitree Robotics",
    category: "industrial",
    description:
      "Genuine shoulder actuator assembly. CubeMars drive unit, factory-torque-matched. Replace on TechMedix shoulder-R wear alert.",
    specs: [
      { label: "Fit", value: "H1 / H1-2" },
      { label: "Joint", value: "Shoulder" },
      { label: "Drive", value: "CubeMars" },
      { label: "Lead", value: "5–7 days" },
      { label: "Price", value: "$950" },
    ],
    tlmRanges: {
      healthScoreMin: 80,
      healthScoreMax: 99,
      batteryPctMin: 100,
      batteryPctMax: 100,
      motorTempMin: 30,
      motorTempMax: 60,
    },
    failureSignatures: [
      {
        id: "shoulder-actuator-wear",
        name: "Shoulder Actuator Wear",
        severity: "warning",
        description: "Shoulder position error > 3mm — replace on wear alert",
      },
    ],
    maintenanceCta: "Order part",
    manualUrl: "https://unitree.com",
    diagramUrl: "https://unitree.com",
    badge: "Aftermarket",
  },
  {
    id: "h1-dex-hand",
    name: "H1 Dexterous Hand",
    manufacturer: "Unitree Robotics",
    category: "industrial",
    description:
      "Replacement dexterous end-effector with integrated tactile sensing. Sharpa module, multi-DOF. Calibrate via TechMedix after install.",
    specs: [
      { label: "Fit", value: "H1 EDU" },
      { label: "Type", value: "Hand" },
      { label: "Sense", value: "Tactile" },
      { label: "Lead", value: "7–10 days" },
      { label: "Price", value: "$2,400" },
    ],
    tlmRanges: {
      healthScoreMin: 80,
      healthScoreMax: 99,
      batteryPctMin: 100,
      batteryPctMax: 100,
      motorTempMin: 30,
      motorTempMax: 60,
    },
    failureSignatures: [
      {
        id: "hand-calibration-drift",
        name: "Hand Calibration Drift",
        severity: "warning",
        description: "Finger position error > 2mm — recalibrate after install",
      },
    ],
    maintenanceCta: "Order part",
    manualUrl: "https://unitree.com",
    diagramUrl: "https://unitree.com",
    badge: "Aftermarket",
  },
];
