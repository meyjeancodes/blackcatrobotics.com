/**
 * Platform registry — all TechMedix-monitored platforms.
 * Each entry is the minimum profile needed to render the /nodes/[platformId] route.
 */

import { DATACENTER_PLATFORMS } from "./datacenter-platforms";

export interface PlatformProfile {
  id: string;
  name: string;
  manufacturer: string;
  category: "humanoid" | "drone" | "industrial" | "delivery" | "micromobility" | "datacenter";
  description: string;
  specs: { label: string; value: string }[];
  /** Simulated live telemetry ranges for mock data */
  tlmRanges: {
    healthScoreMin: number;
    healthScoreMax: number;
    batteryPctMin: number;
    batteryPctMax: number;
    motorTempMin: number;
    motorTempMax: number;
  };
  failureSignatures: {
    id: string;
    name: string;
    severity: "critical" | "warning" | "info";
    description: string;
  }[];
  maintenanceCta: string;
  badge?: string;
  /** Optional maintenance interval schedule — used by MaintenanceSchedule component */
  maintenanceIntervals?: Record<string, { interval: string; signal: string | null }>;
  /** Official service manual or technical documentation URL */
  manualUrl?: string;
  /** Technical diagram, exploded view, or datasheet URL */
  diagramUrl?: string;
}

const PLATFORMS: PlatformProfile[] = [
  // ── Humanoids ───────────────────────────────────────────────────────────────
  {
    id: "unitree-g1",
    name: "Unitree G1",
    manufacturer: "Unitree Robotics",
    category: "humanoid",
    description: "43-DOF bimanual humanoid with Dex1 hands. VLA-capable via UnifoLM-VLA-0. Official TechMedix partner platform.",
    badge: "TechMedix Compatible",
    specs: [
      { label: "Total DOF", value: "43" },
      { label: "Arm DOF", value: "7 per arm" },
      { label: "F/T Sensors", value: "13" },
      { label: "Control Freq", value: "20 Hz" },
      { label: "VLA Chunk", value: "25 steps" },
      { label: "Cameras", value: "Overhead + 2× Wrist" },
      { label: "Battery", value: "~2h operation" },
      { label: "Height", value: "127 cm" },
    ],
    tlmRanges: { healthScoreMin: 72, healthScoreMax: 97, batteryPctMin: 18, batteryPctMax: 94, motorTempMin: 38, motorTempMax: 71 },
    failureSignatures: [
      { id: "actuator-overheat", name: "Actuator Overheat", severity: "critical", description: "Joint temp > 75°C sustained > 30s" },
      { id: "joint-backlash", name: "Joint Backlash", severity: "warning", description: "EEF tracking error > 15mm" },
      { id: "ft-sensor-drift", name: "F/T Sensor Drift", severity: "warning", description: "Static FT reading > ±2N / ±0.5Nm" },
      { id: "gripper-encoder-drift", name: "Gripper Encoder Drift", severity: "warning", description: "Gripper state flip > 3× per chunk" },
      { id: "spine-instability", name: "Spine Instability", severity: "warning", description: "Waist RPY variance > 0.05 rad² (static)" },
    ],
    maintenanceCta: "Dispatch G1 technician",
    manualUrl: "https://support.unitree.com/home/en/G1_developer",
    diagramUrl: "https://github.com/unitreerobotics/unitree_ros/tree/master/robots/g1_description",
  },
  {
    id: "unitree-h1-2",
    name: "Unitree H1-2",
    manufacturer: "Unitree Robotics",
    category: "humanoid",
    description: "Full-size humanoid at 180cm. 40-DOF, extended battery for long-shift warehouse and logistics deployment.",
    specs: [
      { label: "Total DOF", value: "40" },
      { label: "Height", value: "180 cm" },
      { label: "Payload", value: "30 kg" },
      { label: "Battery", value: "~4h operation" },
      { label: "Speed", value: "3.3 m/s" },
    ],
    tlmRanges: { healthScoreMin: 68, healthScoreMax: 95, batteryPctMin: 12, batteryPctMax: 91, motorTempMin: 40, motorTempMax: 78 },
    failureSignatures: [
      { id: "actuator-overheat", name: "Actuator Overheat", severity: "critical", description: "Leg actuator temp > 80°C during sustained gait" },
      { id: "joint-backlash", name: "Joint Backlash", severity: "warning", description: "Leg joint position error > 20mm" },
      { id: "battery-critical", name: "Battery Critical", severity: "critical", description: "SOC < 15% during active task" },
    ],
    maintenanceCta: "Schedule H1-2 service",
    manualUrl: "https://support.unitree.com/home/en/H1_developer",
    diagramUrl: "https://github.com/unitreerobotics/unitree_ros/tree/master/robots/h1_description",
  },
  {
    id: "unitree-b2",
    name: "Unitree B2",
    manufacturer: "Unitree Robotics",
    category: "industrial",
    description: "Industrial quadruped. 23 kg payload, IP67, outdoor-capable. Common in construction survey and infrastructure inspection.",
    specs: [
      { label: "Payload", value: "23 kg" },
      { label: "Protection", value: "IP67" },
      { label: "Battery", value: "~4h" },
      { label: "Speed", value: "6 m/s" },
      { label: "Terrain", value: "All-terrain" },
    ],
    tlmRanges: { healthScoreMin: 75, healthScoreMax: 98, batteryPctMin: 20, batteryPctMax: 96, motorTempMin: 35, motorTempMax: 65 },
    failureSignatures: [
      { id: "actuator-overheat", name: "Leg Actuator Overheat", severity: "critical", description: "Leg joint > 72°C on rough terrain" },
      { id: "ft-sensor-drift", name: "Foot F/T Drift", severity: "warning", description: "Contact detection false positive rate > 5%" },
    ],
    maintenanceCta: "Schedule B2 inspection",
    manualUrl: "https://support.unitree.com/home/en/B2_developer",
    diagramUrl: "https://github.com/unitreerobotics/unitree_ros/tree/master/robots/b2_description",
  },
  {
    id: "figure-02",
    name: "Figure 02",
    manufacturer: "Figure AI",
    category: "humanoid",
    description: "Commercial humanoid for automotive assembly. 16 DOF hands, OpenAI-trained reasoning. BMW Group deployment.",
    specs: [
      { label: "Height", value: "168 cm" },
      { label: "Weight", value: "70 kg" },
      { label: "Battery", value: "~5h" },
      { label: "Hand DOF", value: "16 per hand" },
      { label: "Speed", value: "1.2 m/s" },
    ],
    tlmRanges: { healthScoreMin: 70, healthScoreMax: 94, batteryPctMin: 15, batteryPctMax: 89, motorTempMin: 42, motorTempMax: 74 },
    failureSignatures: [
      { id: "joint-backlash", name: "Hand Gear Wear", severity: "warning", description: "Finger position error > 2mm on precision grip" },
      { id: "camera-offline", name: "Head Camera Drop", severity: "critical", description: "Primary vision system offline > 100ms" },
    ],
    maintenanceCta: "Request Figure technician",
    manualUrl: "https://www.figure.ai/news/figure-02",
    diagramUrl: "https://www.figure.ai/news/figure-02",
  },
  {
    id: "optimus-gen3",
    name: "Tesla Optimus Gen 3",
    manufacturer: "Tesla",
    category: "humanoid",
    description: "Tesla's 3rd-gen humanoid. 22 DOF hands, FSD-derived perception stack, designed for Tesla factory operations.",
    specs: [
      { label: "DOF", value: "35+" },
      { label: "Weight", value: "57 kg" },
      { label: "Battery", value: "~8h" },
      { label: "Hand DOF", value: "22 per hand" },
    ],
    tlmRanges: { healthScoreMin: 78, healthScoreMax: 96, batteryPctMin: 22, batteryPctMax: 93, motorTempMin: 36, motorTempMax: 68 },
    failureSignatures: [
      { id: "vla-inference-stall", name: "FSD Stack Latency", severity: "warning", description: "Perception inference > 50ms" },
      { id: "battery-critical", name: "Battery Critical", severity: "critical", description: "SOC < 20% during active sequence" },
    ],
    maintenanceCta: "Open Optimus support ticket",
    manualUrl: "https://www.tesla.com/en_us/AI",
    diagramUrl: "https://www.tesla.com/en_us/AI",
  },
  {
    id: "digit-v5",
    name: "Digit V5",
    manufacturer: "Agility Robotics",
    category: "humanoid",
    description: "Warehouse-specialized bipedal. Deployed at Amazon. Optimized for tote handling in dynamic logistics environments.",
    specs: [
      { label: "Payload", value: "16 kg" },
      { label: "Height", value: "175 cm" },
      { label: "Battery", value: "~16h (hot-swap)" },
      { label: "Speed", value: "1.5 m/s" },
    ],
    tlmRanges: { healthScoreMin: 74, healthScoreMax: 96, batteryPctMin: 8, batteryPctMax: 98, motorTempMin: 38, motorTempMax: 70 },
    failureSignatures: [
      { id: "joint-backlash", name: "Ankle Backlash", severity: "warning", description: "Ankle dorsiflexion error > 1.5°" },
      { id: "actuator-overheat", name: "Knee Actuator Overheat", severity: "critical", description: "Knee joint > 76°C during incline traversal" },
    ],
    maintenanceCta: "Schedule Digit field service",
    manualUrl: "https://agilityrobotics.com/resources",
    diagramUrl: "https://github.com/AgilityRobotics/digit-interface",
  },
  {
    id: "phantom-mk1",
    name: "Phantom Mk1",
    manufacturer: "Physical Intelligence",
    category: "humanoid",
    description: "π0-powered general-purpose humanoid. Diffusion policy control. Research-to-production platform.",
    specs: [
      { label: "Policy", value: "π0 Diffusion" },
      { label: "DOF", value: "38" },
      { label: "Battery", value: "~3h" },
    ],
    tlmRanges: { healthScoreMin: 65, healthScoreMax: 92, batteryPctMin: 20, batteryPctMax: 88, motorTempMin: 40, motorTempMax: 72 },
    failureSignatures: [
      { id: "vla-inference-stall", name: "Diffusion Stall", severity: "warning", description: "Policy inference > 100ms per step" },
      { id: "gripper-encoder-drift", name: "Gripper Drift", severity: "warning", description: "End-effector grip force variance > 15N" },
    ],
    maintenanceCta: "Open Phantom support ticket",
    manualUrl: "https://www.physicalintelligence.company/research",
    diagramUrl: "https://www.physicalintelligence.company/research",
  },

  // ── Drones ──────────────────────────────────────────────────────────────────
  {
    id: "dji-agras-t50",
    name: "DJI Agras T50",
    manufacturer: "DJI",
    category: "drone",
    description: "50L agricultural spray drone. Dual atomized + broadcast spreading. Active phased-array radar obstacle avoidance.",
    specs: [
      { label: "Payload", value: "50 L / 40 kg" },
      { label: "Spread Width", value: "9 m" },
      { label: "Flight Time", value: "~17 min (full load)" },
      { label: "Radar", value: "Active phased-array" },
    ],
    tlmRanges: { healthScoreMin: 80, healthScoreMax: 99, batteryPctMin: 10, batteryPctMax: 100, motorTempMin: 28, motorTempMax: 58 },
    failureSignatures: [
      { id: "actuator-overheat", name: "Motor Overheat", severity: "critical", description: "Prop motor > 85°C (full payload)" },
      { id: "battery-critical", name: "Battery Critical", severity: "critical", description: "SOC < 15% mid-mission" },
    ],
    maintenanceCta: "Schedule drone maintenance",
    manualUrl: "https://dl.djicdn.com/downloads/agras_t50/20231113/AGRAS_T50_User_Manual_v1.0_en.pdf",
    diagramUrl: "https://dl.djicdn.com/downloads/agras_t50/20231113/AGRAS_T50_User_Manual_v1.0_en.pdf",
  },
  {
    id: "skydio-x10",
    name: "Skydio X10",
    manufacturer: "Skydio",
    category: "drone",
    description: "Enterprise inspection drone with NVIDIA Jetson-based autonomy and 4K/thermal dual sensor. Used in infrastructure inspection.",
    specs: [
      { label: "Camera", value: "4K + thermal" },
      { label: "Flight Time", value: "35 min" },
      { label: "Wind Resistance", value: "15 m/s" },
      { label: "Autonomy", value: "NVIDIA Jetson" },
    ],
    tlmRanges: { healthScoreMin: 82, healthScoreMax: 99, batteryPctMin: 15, batteryPctMax: 100, motorTempMin: 25, motorTempMax: 55 },
    failureSignatures: [
      { id: "camera-offline", name: "Thermal Sensor Drop", severity: "warning", description: "Thermal feed missing > 500ms" },
      { id: "vla-inference-stall", name: "Autonomy Stack Stall", severity: "critical", description: "Obstacle avoidance latency > 200ms" },
    ],
    maintenanceCta: "Request Skydio service",
    manualUrl: "https://support.skydio.com/hc/en-us/categories/360002011492",
    diagramUrl: "https://support.skydio.com/hc/en-us/categories/360002011492",
  },
  {
    id: "zipline-p2",
    name: "Zipline Platform 2",
    manufacturer: "Zipline",
    category: "drone",
    description: "Fixed-wing VTOL delivery drone. 160km range, autonomous dock-to-dock. Medical and commercial delivery.",
    specs: [
      { label: "Range", value: "160 km" },
      { label: "Payload", value: "3.6 kg" },
      { label: "Speed", value: "128 km/h" },
      { label: "Type", value: "Fixed-wing VTOL" },
    ],
    tlmRanges: { healthScoreMin: 85, healthScoreMax: 99, batteryPctMin: 20, batteryPctMax: 100, motorTempMin: 22, motorTempMax: 52 },
    failureSignatures: [
      { id: "actuator-overheat", name: "Tilt Motor Overheat", severity: "critical", description: "VTOL tilt motor > 90°C during transition" },
      { id: "battery-critical", name: "Range Battery Low", severity: "critical", description: "SOC < 25% beyond return threshold" },
    ],
    maintenanceCta: "Schedule Zipline dock service",
    manualUrl: "https://www.zipline.com/technology",
    diagramUrl: "https://www.zipline.com/technology",
  },

  // ── Delivery ────────────────────────────────────────────────────────────────
  {
    id: "serve-rs2",
    name: "Serve RS2",
    manufacturer: "Serve Robotics",
    category: "delivery",
    description: "Sidewalk delivery robot. LiDAR + camera fusion, 4-wheel drive. Deployed in LA and Dallas for food delivery.",
    specs: [
      { label: "Speed", value: "1.5 m/s" },
      { label: "Payload", value: "18 kg" },
      { label: "Battery", value: "~12h" },
      { label: "Sensors", value: "LiDAR + 8× camera" },
    ],
    tlmRanges: { healthScoreMin: 76, healthScoreMax: 97, batteryPctMin: 12, batteryPctMax: 96, motorTempMin: 30, motorTempMax: 55 },
    failureSignatures: [
      { id: "camera-offline", name: "Perimeter Camera Drop", severity: "critical", description: "Any of 8 cameras offline > 200ms" },
      { id: "joint-backlash", name: "Wheel Encoder Drift", severity: "warning", description: "Odometry error > 5cm/m traveled" },
    ],
    maintenanceCta: "Dispatch field technician",
    manualUrl: "https://www.serverobotics.com/technology",
    diagramUrl: "https://www.serverobotics.com/technology",
  },
  {
    id: "starship-gen3",
    name: "Starship Gen 3",
    manufacturer: "Starship Technologies",
    category: "delivery",
    description: "Campus delivery robot. 6-wheel drive, 40+ cm obstacle clearance. Operates in 50+ cities.",
    specs: [
      { label: "Speed", value: "1.8 m/s" },
      { label: "Payload", value: "10 kg" },
      { label: "Battery", value: "~6h" },
      { label: "Cameras", value: "12× wide-angle" },
    ],
    tlmRanges: { healthScoreMin: 78, healthScoreMax: 98, batteryPctMin: 10, batteryPctMax: 95, motorTempMin: 28, motorTempMax: 52 },
    failureSignatures: [
      { id: "battery-critical", name: "Battery Critical", severity: "critical", description: "SOC < 12% away from dock" },
      { id: "actuator-overheat", name: "Drive Motor Overheat", severity: "warning", description: "Wheel motor > 65°C on incline" },
    ],
    maintenanceCta: "Dispatch Starship technician",
    manualUrl: "https://www.starship.xyz/press/",
    diagramUrl: "https://www.starship.xyz/press/",
  },

  // ── Industrial ──────────────────────────────────────────────────────────────
  {
    id: "spot",
    name: "Boston Dynamics Spot",
    manufacturer: "Boston Dynamics",
    category: "industrial",
    description: "Industry-standard inspection quadruped. Arm-optional, API-first, payload-extensible. Deployed in 50+ industries.",
    specs: [
      { label: "Payload", value: "14 kg" },
      { label: "Battery", value: "~90 min" },
      { label: "Protection", value: "IP54" },
      { label: "Speed", value: "1.6 m/s" },
      { label: "Arm", value: "Optional 6-DOF" },
    ],
    tlmRanges: { healthScoreMin: 80, healthScoreMax: 99, batteryPctMin: 15, batteryPctMax: 100, motorTempMin: 32, motorTempMax: 62 },
    failureSignatures: [
      { id: "joint-backlash", name: "Hip Actuator Wear", severity: "warning", description: "Hip position error > 0.8° during gait" },
      { id: "ft-sensor-drift", name: "Foot Sensor Drift", severity: "info", description: "Ground contact confidence < 85%" },
    ],
    maintenanceCta: "Schedule Spot service",
    manualUrl: "https://support.bostondynamics.com/s/",
    diagramUrl: "https://github.com/boston-dynamics/spot-sdk",
  },
  {
    id: "proteus-amr",
    name: "Amazon Proteus AMR",
    manufacturer: "Amazon Robotics",
    category: "industrial",
    description: "Autonomous mobile robot for warehouse pod movement. LiDAR-only navigation, no camera dependence for safety.",
    specs: [
      { label: "Payload", value: "750 kg (pod)" },
      { label: "Speed", value: "1.1 m/s" },
      { label: "Battery", value: "~8h (hot-swap)" },
      { label: "Nav", value: "LiDAR SLAM" },
    ],
    tlmRanges: { healthScoreMin: 82, healthScoreMax: 99, batteryPctMin: 10, batteryPctMax: 100, motorTempMin: 30, motorTempMax: 58 },
    failureSignatures: [
      { id: "actuator-overheat", name: "Drive Motor Overheat", severity: "critical", description: "Drive motor > 70°C under heavy pod" },
      { id: "camera-offline", name: "LiDAR Dropout", severity: "critical", description: "LiDAR scan rate < 5 Hz" },
    ],
    maintenanceCta: "Open AMR maintenance ticket",
    manualUrl: "https://www.aboutamazon.com/news/operations/amazon-introduces-new-robotics-solutions",
    diagramUrl: "https://www.aboutamazon.com/news/operations/amazon-introduces-new-robotics-solutions",
  },

  // ── Watch List — Pre-Integration ────────────────────────────────────────────
  {
    id: "rebot-devarm",
    name: "reBot-DevArm",
    manufacturer: "Seeed Studio",
    category: "industrial",
    description: "True open-source 6-DOF robot arm — hardware blueprints, full BOM, and 3D print files published on GitHub. Python SDK, ROS1, ROS2, Isaac Sim, and LeRobot compatible. Same simulation stack as ROBO-1. Pre-integration: monitoring adoption curve for full TechMedix onboarding.",
    badge: "Watch List",
    specs: [
      { label: "DOF",        value: "6" },
      { label: "SDK",        value: "Python, ROS1, ROS2, Isaac Sim, LeRobot" },
      { label: "Source",     value: "Open — hardware blueprints, full BOM, 3D print files" },
      { label: "GitHub",     value: "Seeed-Projects/reBot-DevArm" },
      { label: "TechMedix",  value: "Pre-Integration — Watch List" },
    ],
    tlmRanges: { healthScoreMin: 72, healthScoreMax: 96, batteryPctMin: 95, batteryPctMax: 100, motorTempMin: 28, motorTempMax: 65 },
    failureSignatures: [
      { id: "joint-backlash",    name: "Joint Backlash",  severity: "warning", description: "EEF position error > 2mm on repetitive trajectory" },
      { id: "actuator-overheat", name: "Servo Overheat",  severity: "warning", description: "Joint servo > 70°C during sustained high-torque moves" },
    ],
    maintenanceCta: "Flag for integration review",
    manualUrl: "https://github.com/Seeed-Projects/reBot-DevArm",
    diagramUrl: "https://github.com/Seeed-Projects/reBot-DevArm",
  },

  // ── Micromobility ───────────────────────────────────────────────────────────
  {
    id: "lime-gen4",
    name: "Lime Gen 4 E-Bike",
    manufacturer: "Lime",
    category: "micromobility",
    description: "4th-gen shared e-bike. Swappable battery, IoT-connected, deployed in 200+ cities.",
    specs: [
      { label: "Motor",        value: "250W rear hub" },
      { label: "Battery",      value: "36V swappable" },
      { label: "Range",        value: "40+ miles" },
      { label: "Connectivity", value: "Proprietary cellular" },
    ],
    tlmRanges: { healthScoreMin: 65, healthScoreMax: 97, batteryPctMin: 5, batteryPctMax: 100, motorTempMin: 20, motorTempMax: 48 },
    failureSignatures: [
      { id: "battery-cell-drift", name: "Battery Cell Drift",   severity: "warning",  description: "±50mV cell delta — pack imbalance, swap recommended" },
      { id: "battery-thermal",    name: "Battery Thermal",      severity: "critical", description: ">45°C at rest — thermal event risk" },
      { id: "hub-motor-bearing",  name: "Hub Motor Bearing",    severity: "warning",  description: "Vibration >0.8g RMS — bearing wear onset" },
      { id: "hub-motor-draw",     name: "Hub Motor Draw",       severity: "warning",  description: "Current >7A sustained — debris or winding fault" },
      { id: "stem-fold-wear",     name: "Stem Fold Wear",       severity: "critical", description: "Torque <8Nm — safety-critical structural failure risk" },
      { id: "brake-pad-thin",     name: "Brake Pad Thin",       severity: "warning",  description: "<2mm estimated — stopping distance increasing" },
      { id: "connectivity-loss",  name: "Connectivity Loss",    severity: "info",     description: ">15min offline — bike invisible to fleet ops" },
      { id: "tire-pressure-drop", name: "Tire Pressure Drop",   severity: "warning",  description: ">8 PSI/day loss — slow puncture or valve issue" },
      { id: "firmware-drift",     name: "Firmware Drift",       severity: "info",     description: "Version delta >2 builds — OTA update overdue" },
    ],
    maintenanceCta: "Schedule field swap",
    manualUrl: "https://www.li.me/safety",
    diagramUrl: "https://www.li.me/safety",
    maintenanceIntervals: {
      batterySwap:      { interval: "500 cycles or 6 months",  signal: "battery-cell-drift"  },
      brakeInspect:     { interval: "30 days or 500 rides",    signal: "brake-pad-thin"      },
      tirePressure:     { interval: "14 days",                 signal: "tire-pressure-drop"  },
      stemTorque:       { interval: "90 days",                 signal: "stem-fold-wear"      },
      motorCurrentBase: { interval: "1,000 rides",             signal: "hub-motor-draw"      },
      bearingVibration: { interval: "6 months",                signal: "hub-motor-bearing"   },
      frameCrack:       { interval: "12 months",               signal: null                  },
      firmwareAudit:    { interval: "Monthly",                 signal: "firmware-drift"      },
      fullBenchTest:    { interval: "Annual",                  signal: null                  },
      wheelTruing:      { interval: "3 months or 300 rides",   signal: null                  },
    },
  },
  {
    id: "bird-three",
    name: "Bird Three E-Scooter",
    manufacturer: "Bird",
    category: "micromobility",
    description: "3rd-gen shared scooter. Reinforced frame, 40km range, GPS geofencing. 350W motor with integrated non-swappable battery.",
    specs: [
      { label: "Motor",        value: "350W rear hub" },
      { label: "Battery",      value: "36V 10.5Ah integrated" },
      { label: "Range",        value: "25+ miles" },
      { label: "Connectivity", value: "Cellular + BLE" },
    ],
    tlmRanges: { healthScoreMin: 60, healthScoreMax: 96, batteryPctMin: 5, batteryPctMax: 100, motorTempMin: 18, motorTempMax: 45 },
    failureSignatures: [
      { id: "battery-cell-drift",    name: "Battery Cell Drift",       severity: "warning",  description: "±50mV cell delta — pack imbalance" },
      { id: "battery-thermal",       name: "Battery Thermal",          severity: "critical", description: ">60°C BMS cutoff — non-swappable pack at risk" },
      { id: "hub-motor-bearing",     name: "Hub Motor Bearing",        severity: "warning",  description: "Vibration >0.8g RMS — bearing wear onset" },
      { id: "hub-motor-draw",        name: "Hub Motor Draw",           severity: "warning",  description: "Current >10A sustained — winding fault or load fault" },
      { id: "stem-fold-wear",        name: "Stem Fold Wear",           severity: "critical", description: "Torque <8Nm — structural failure risk" },
      { id: "brake-pad-thin",        name: "Brake Pad Thin",           severity: "warning",  description: "<2mm estimated — stopping distance elevated" },
      { id: "connectivity-loss",     name: "Connectivity Loss",        severity: "info",     description: ">15min offline" },
      { id: "tire-pressure-drop",    name: "Tire Pressure Drop",       severity: "warning",  description: ">8 PSI/day loss" },
      { id: "alarm-drain",           name: "Alarm Battery Drain",      severity: "warning",  description: "Overnight SOC drop >15% — parasitic drain from alarm" },
      { id: "brake-lever-corrosion", name: "Brake Lever Corrosion",    severity: "warning",  description: "Lever force delta >25% — corrosion on pivot" },
    ],
    maintenanceCta: "Schedule rebalance",
    manualUrl: "https://www.bird.co/safety/",
    diagramUrl: "https://www.bird.co/safety/",
    maintenanceIntervals: {
      batteryInspect:   { interval: "6 months or 2,000 rides", signal: "battery-cell-drift"    },
      brakeInspect:     { interval: "30 days or 500 rides",    signal: "brake-pad-thin"        },
      tirePressure:     { interval: "14 days",                 signal: "tire-pressure-drop"    },
      stemTorque:       { interval: "90 days",                 signal: "stem-fold-wear"        },
      motorCurrentBase: { interval: "1,000 rides",             signal: "hub-motor-draw"        },
      bearingVibration: { interval: "6 months",                signal: "hub-motor-bearing"     },
      alarmSystemCheck: { interval: "Monthly",                 signal: "alarm-drain"           },
      brakeCorrosion:   { interval: "60 days or wet season",   signal: "brake-lever-corrosion" },
      frameCrack:       { interval: "12 months",               signal: null                    },
      firmwareAudit:    { interval: "Monthly",                 signal: "firmware-drift"        },
      fullBenchTest:    { interval: "Annual or 8,000 miles",   signal: null                    },
    },
  },
  {
    id: "radcommercial",
    name: "Rad Power RadCommercial",
    manufacturer: "Rad Power Bikes",
    category: "micromobility",
    description: "Commercial cargo e-bike. 150kg total load capacity, 750W motor, used for last-mile delivery fleets.",
    specs: [
      { label: "Motor",   value: "750W rear hub" },
      { label: "Battery", value: "48V 14Ah 672Wh" },
      { label: "Range",   value: "45+ miles" },
      { label: "Payload", value: "120 lbs" },
    ],
    tlmRanges: { healthScoreMin: 70, healthScoreMax: 97, batteryPctMin: 8, batteryPctMax: 100, motorTempMin: 22, motorTempMax: 52 },
    failureSignatures: [
      { id: "battery-cell-drift",  name: "Battery Cell Drift",    severity: "warning",  description: "±60mV cell delta — large 48V pack imbalance" },
      { id: "battery-thermal",     name: "Battery Thermal",       severity: "critical", description: ">50°C at rest — 672Wh pack thermal event risk" },
      { id: "hub-motor-bearing",   name: "Hub Motor Bearing",     severity: "warning",  description: "Vibration >0.8g RMS under cargo load" },
      { id: "hub-motor-draw",      name: "Hub Motor Draw",        severity: "warning",  description: "Current >13A sustained — 750W overload indicator" },
      { id: "stem-fold-wear",      name: "Stem Fold Wear",        severity: "critical", description: "Torque <8Nm — structural failure risk at cargo weight" },
      { id: "brake-pad-thin",      name: "Brake Pad Thin",        severity: "warning",  description: "<2mm — stopping distance elevated with full cargo" },
      { id: "rack-mount-stress",   name: "Rack Mount Stress",     severity: "warning",  description: "Mounting bolt torque <12Nm — rack detachment risk" },
      { id: "range-degraded",      name: "Range Degraded",        severity: "warning",  description: "<35mi reported per charge — cell aging or calibration drift" },
      { id: "tire-pressure-drop",  name: "Tire Pressure Drop",    severity: "warning",  description: ">8 PSI/day loss — elevated risk at cargo weight" },
      { id: "firmware-drift",      name: "Firmware Drift",        severity: "info",     description: "Version delta >2 builds" },
    ],
    maintenanceCta: "Schedule depot maintenance",
    manualUrl: "https://www.radpowerbikes.com/pages/user-manual",
    diagramUrl: "https://www.radpowerbikes.com/pages/user-manual",
    maintenanceIntervals: {
      batterySwap:      { interval: "500 cycles or 6 months",    signal: "battery-cell-drift"  },
      brakeInspect:     { interval: "30 days or 500 rides",      signal: "brake-pad-thin"      },
      tirePressure:     { interval: "14 days",                   signal: "tire-pressure-drop"  },
      stemTorque:       { interval: "90 days",                   signal: "stem-fold-wear"      },
      motorCurrentBase: { interval: "1,000 rides",               signal: "hub-motor-draw"      },
      bearingVibration: { interval: "6 months",                  signal: "hub-motor-bearing"   },
      rackInspect:      { interval: "60 days or 200 deliveries", signal: "rack-mount-stress"   },
      rangeCalibration: { interval: "90 days",                   signal: "range-degraded"      },
      frameCrack:       { interval: "12 months",                 signal: null                  },
      firmwareAudit:    { interval: "Monthly",                   signal: "firmware-drift"      },
      fullBenchTest:    { interval: "Annual",                    signal: null                  },
    },
  },
];

// ── AI + Edge Compute Platforms ─────────────────────────────────────────────
const AI_PLATFORMS: PlatformProfile[] = [
  {
    id: "nvidia-jetson-agx-thor",
    name: "NVIDIA Jetson AGX Thor",
    manufacturer: "NVIDIA",
    category: "industrial",
    description: "Flagship edge AI compute module for humanoid robots, surgical systems, and industrial AI. Blackwell GPU, 128GB LPDDR5X, 40-130W. Ships with JetPack 7 / Ubuntu 24.04 / CUDA 13.0. Developer kit $3,499, GA August 2025.",
    badge: "AI Platform",
    specs: [
      { label: "AI Compute", value: "2,070 TFLOPS FP4" },
      { label: "Memory",     value: "128GB LPDDR5X" },
      { label: "GPU",        value: "Blackwell" },
      { label: "Power",      value: "40-130W" },
      { label: "vs Orin",    value: "7.5x higher compute" },
      { label: "Dev Kit",    value: "$3,499" },
    ],
    tlmRanges: { healthScoreMin: 80, healthScoreMax: 99, batteryPctMin: 0, batteryPctMax: 100, motorTempMin: 25, motorTempMax: 88 },
    failureSignatures: [
      { id: "driver-conflict",   name: "JetPack/CUDA Driver Conflict",   severity: "critical", description: "CUDA 13.0 driver mismatch after Orin-to-Thor migration breaks inference stack -- verify JetPack 7 compatibility before migration" },
      { id: "nim-cold-start",    name: "NIM Microservice Cold Start",     severity: "warning",  description: "Cosmos Reason NIM container latency >5s on first inference call at edge -- pre-warm containers on boot" },
      { id: "thermal-throttle",  name: "Thermal Throttle",               severity: "warning",  description: "Sustained load >100W triggers clock throttling -- verify thermal paste application and enclosure airflow" },
      { id: "urdf-import-fail",  name: "Isaac Sim URDF Import Failure",  severity: "info",     description: "Joint limit parsing breaks after Isaac Sim version upgrades -- check joint_type fields match expected schema" },
      { id: "cumotion-timeout",  name: "cuMotion Trajectory Timeout",    severity: "warning",  description: "Trajectory optimization fails under high joint-count (>7 DOF) scenarios with default timeout settings" },
      { id: "sim-to-real-gap",   name: "GR00T Sim-to-Real Transfer Gap", severity: "warning",  description: "GR00T N models trained on non-standard morphologies show degraded transfer -- run domain randomization with Newton physics before deployment" },
    ],
    maintenanceCta: "Open NVIDIA support ticket",
    manualUrl: "https://developer.nvidia.com/embedded/jetson-agx-thor",
    diagramUrl: "https://developer.nvidia.com/embedded/jetson-agx-thor",
  },
];

// ── Agtech Platforms ──────────────────────────────────────────────────────────
const AGTECH_PLATFORMS: PlatformProfile[] = [
  {
    id: "aigen-element-gen2",
    name: "Aigen Element gen2",
    manufacturer: "Aigen",
    category: "industrial",
    description: "100% solar-powered agricultural robot for chemical-free weed control at plant level. 350W panel, all-wheel drive, stereo depth vision (gen2), intelligent mesh fleet coordination. Featured by NVIDIA Robotics (April 2026). Deployed in California Central Valley.",
    badge: "Agtech",
    specs: [
      { label: "Power",     value: "Solar + battery (350W)" },
      { label: "Drive",     value: "All-wheel drive" },
      { label: "Field Hrs", value: "Up to 14h/day" },
      { label: "Fleet Cov", value: "200 acres/season" },
      { label: "Price",     value: "$50K/unit" },
      { label: "AI Boost",  value: "4x faster (gen2)" },
    ],
    tlmRanges: { healthScoreMin: 60, healthScoreMax: 95, batteryPctMin: 10, batteryPctMax: 100, motorTempMin: 18, motorTempMax: 55 },
    failureSignatures: [
      { id: "weed-misclass",   name: "Weed Misclassification",      severity: "warning",  description: "Dense cotton canopy (late season) causes false negative rate >15% -- retrain vision model with seasonal field data" },
      { id: "mesh-dropout",    name: "Mesh Network Dropout",        severity: "critical", description: "Fleet communication loss in hilly terrain -- robot becomes unreachable, manual retrieval required" },
      { id: "solar-shortfall", name: "Solar Charging Shortfall",    severity: "warning",  description: "Multi-day overcast reduces daily operational range by 40-60% -- pre-charge backup batteries before extended cloudy periods" },
      { id: "striker-wear",    name: "Mechanical Striker Wear",     severity: "warning",  description: "High-density weed passes accelerate striker contact wear -- inspect every 200 operating hours, replace at 1.5mm wear" },
    ],
    maintenanceCta: "Schedule Aigen field service",
    manualUrl: "https://www.aigen.io/technology",
    diagramUrl: "https://www.aigen.io/technology",
  },
];

// Merge in datacenter platforms
const ALL_PLATFORMS: PlatformProfile[] = [...PLATFORMS, ...AI_PLATFORMS, ...AGTECH_PLATFORMS, ...DATACENTER_PLATFORMS];

export function getPlatformById(id: string): PlatformProfile | undefined {
  return ALL_PLATFORMS.find((p) => p.id === id);
}

export function getPlatformsByCategory(category: PlatformProfile["category"]): PlatformProfile[] {
  return ALL_PLATFORMS.filter((p) => p.category === category);
}

export function getAllPlatforms(): PlatformProfile[] {
  return ALL_PLATFORMS;
}

export default ALL_PLATFORMS;
