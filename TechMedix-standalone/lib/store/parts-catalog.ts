/**
 * Aftermarket parts catalog — single source of truth for the BlackCat store.
 */

export type PartTier = "oem" | "direct" | "bundle";

export interface StorePart {
  sku: string;
  name: string;
  platformId: string;
  manufacturer: string;
  description: string;
  unitAmount: number;
  currency: string;
  stripePriceId?: string;
  image: string;
  leadTime: string;
  warranty: string;
  tier: PartTier;
  sourceUrl?: string;
}

export interface PartBundle {
  sku: string;
  name: string;
  platformId: string;
  manufacturer: string;
  description: string;
  tier: "bundle";
  unitAmount: number;
  currency: string;
  savingsPct: number;
  savingsDollars: number;
  parts: string[];
  image: string;
  leadTime: string;
  warranty: string;
}

// Image fallbacks
const PLATFORM_FALLBACK: Record<string, string> = {
  "unitree-h1-2": "/images/parts/unitree_h1.jpg",
  "unitree-g1": "/images/parts/unitree_g1.jpg",
  "boston-dynamics-spot": "/images/parts/bostondynamics_spot.jpg",
  "dji-agras-t50": "/images/parts/dji_agras_t50.jpg",
  "figure-02": "/images/parts/figure02.jpg",
  "digit-v5": "/images/parts/digit.jpg",
  "optimus-gen3": "/images/parts/optimus.jpg",
  "apollo": "/images/parts/apollo.jpg",
  "neo": "/images/parts/neo.jpg",
  "skydio-x10": "/images/parts/skydio.jpg",
  "starship-gen3": "/images/parts/starship.jpg",
  "lime-gen4": "/images/parts/lime.jpg",
  "agility-digit": "/images/parts/agility_digit.jpg",
  "asimov-1": "/images/parts/asimov.jpg",
  "franka-panda": "/images/parts/franka.jpg",
  "kinova-gen3": "/images/parts/kinova.jpg",
  "universal-robots-ur5e": "/images/parts/ur5e.jpg",
  "ufactory-xarm6": "/images/parts/ufactory.jpg",
};

export function getPartImage(sku: string, platformId: string): string {
  return PLATFORM_FALLBACK[platformId] || "/images/parts/unitree_h1.jpg";
}

// Unitree H1 OEM
const H1_OEM: StorePart[] = [
  { sku: "H1-KNEE-ACT", name: "Unitree H1 Knee Actuator", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Genuine replacement knee actuator module. Direct-fit, factory-calibrated.", unitAmount: 118000, currency: "usd", image: "/images/parts/variable_impedance_actuator.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-HIP-ACT", name: "Unitree H1 Hip Actuator", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Heavy-duty H1 hip torque actuator. Factory-torque-matched.", unitAmount: 132000, currency: "usd", image: "/images/parts/variable_impedance_actuator.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-SHOULDER-ACT", name: "Unitree H1 Shoulder Actuator", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Genuine shoulder actuator assembly. CubeMars drive unit.", unitAmount: 95000, currency: "usd", image: "/images/parts/variable_impedance_actuator.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-ANKLE-FOOT", name: "Unitree H1 Ankle & Foot Module", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Articulated ankle joint with textured foot sole.", unitAmount: 88000, currency: "usd", image: "/images/parts/variable_impedance_actuator.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-WAIST-ACT", name: "Unitree H1 Waist Actuator", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Central yaw waist actuator for torso rotation.", unitAmount: 102000, currency: "usd", image: "/images/parts/variable_impedance_actuator.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-BATTERY", name: "Unitree H1 Battery Pack (864Wh)", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "864Wh main power pack. CATL cells, factory-matched BMS.", unitAmount: 158000, currency: "usd", image: "/images/parts/h1_battery.jpg", leadTime: "3–5 days", warranty: "12 months", tier: "oem", sourceUrl: "https://robostore.com/products/unitree-h1-humanoid-high-performance-battery" },
  { sku: "H1-DEX-HAND", name: "Unitree H1-2 Dexterous Hand", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Replacement dexterous end-effector with integrated tactile sensing.", unitAmount: 970000, currency: "usd", image: "/images/parts/shadow_hand.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-CONTROLLER", name: "Unitree H1 Main Controller", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Main compute / motion controller module.", unitAmount: 165000, currency: "usd", image: "/images/parts/go2_controller.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-CHARGER", name: "Unitree H1 Fast Charger", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Official H1 fast charger. 67.2V output, active cooling.", unitAmount: 100000, currency: "usd", image: "/images/parts/go2_charger.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-COMPUTE", name: "Unitree H1 AGX-H1-550 Compute Module", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "100 TOPS AI compute module. Orin NX-class.", unitAmount: 1499900, currency: "usd", image: "/images/parts/unitree_h1.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-M8010-MOTOR", name: "Unitree GO-M8010-6 Motor", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "High-torque BLDC motor. Direct replacement for H1 joint motors.", unitAmount: 36900, currency: "usd", image: "/images/parts/bldc_motor.jpg", leadTime: "3–5 days", warranty: "12 months", tier: "oem", sourceUrl: "https://shop.unitree.com/collections/accessories" },
];

// Unitree G1 OEM
const G1_OEM: StorePart[] = [
  { sku: "G1-ARM-ACT", name: "Unitree G1 Arm Actuator", platformId: "unitree-g1", manufacturer: "Unitree Robotics", description: "Genuine G1 7-DOF arm actuator module.", unitAmount: 89000, currency: "usd", image: "/images/parts/variable_impedance_actuator.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "G1-HAND", name: "Unitree G1 Dexterous Hand (Dex1)", platformId: "unitree-g1", manufacturer: "Unitree Robotics", description: "Genuine G1 Dex1 hand. 12 DOF, tactile sensing.", unitAmount: 120000, currency: "usd", image: "/images/parts/shadow_hand.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "G1-BATTERY", name: "Unitree G1 High-Performance Battery", platformId: "unitree-g1", manufacturer: "Unitree Robotics", description: "Genuine G1 battery pack. CATL cells, hot-swap capable.", unitAmount: 75000, currency: "usd", image: "/images/parts/g1_battery.jpg", leadTime: "3–5 days", warranty: "12 months", tier: "oem" },
  { sku: "G1-CHARGER", name: "Unitree G1 Charger", platformId: "unitree-g1", manufacturer: "Unitree Robotics", description: "Official G1 charger.", unitAmount: 100000, currency: "usd", image: "/images/parts/go2_charger.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "G1-GANTRY", name: "Unitree G1 Gantry System", platformId: "unitree-g1", manufacturer: "Unitree Robotics", description: "G1 gantry for stationary manipulation.", unitAmount: 320000, currency: "usd", image: "/images/parts/unitree_g1.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
];

// Boston Dynamics Spot OEM
const SPOT_OEM: StorePart[] = [
  { sku: "SPOT-LEG-ACT", name: "Spot Leg Actuator", platformId: "boston-dynamics-spot", manufacturer: "Boston Dynamics", description: "Genuine Spot leg actuator assembly. 12 DOF per leg.", unitAmount: 320000, currency: "usd", image: "/images/parts/bostondynamics_spot.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "SPOT-ARM", name: "Spot Arm Assembly", platformId: "boston-dynamics-spot", manufacturer: "Boston Dynamics", description: "Genuine Spot arm with 6 DOF + gripper. Payload 5kg.", unitAmount: 450000, currency: "usd", image: "/images/parts/bostondynamics_spot.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "SPOT-BATTERY", name: "Spot Battery Pack", platformId: "boston-dynamics-spot", manufacturer: "Boston Dynamics", description: "Genuine Spot battery. Hot-swap capable, 90 min runtime.", unitAmount: 180000, currency: "usd", image: "/images/parts/bostondynamics_spot.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "SPOT-CHARGER", name: "Spot Charger", platformId: "boston-dynamics-spot", manufacturer: "Boston Dynamics", description: "Official Spot charging dock.", unitAmount: 220000, currency: "usd", image: "/images/parts/bostondynamics_spot.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "SPOT-PAYLOAD", name: "Spot Payload Mount", platformId: "boston-dynamics-spot", manufacturer: "Boston Dynamics", description: "Official Spot payload mounting bracket.", unitAmount: 85000, currency: "usd", image: "/images/parts/bostondynamics_spot.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

// DJI Agras OEM
const AGRAS_OEM: StorePart[] = [
  { sku: "AGRAS-PROP", name: "DJI Agras Propeller Set (4pcs)", platformId: "dji-agras-t50", manufacturer: "DJI", description: "Genuine DJI Agras propeller set. T50/T60 compatible.", unitAmount: 18000, currency: "usd", image: "/images/parts/dji_agras_t50.jpg", leadTime: "3–5 days", warranty: "6 months", tier: "oem" },
  { sku: "AGRAS-MOTOR", name: "DJI Agras Brushless Motor", platformId: "dji-agras-t50", manufacturer: "DJI", description: "Genuine DJI Agras brushless motor. T50/T60 compatible.", unitAmount: 26900, currency: "usd", image: "/images/parts/dji_agras_t50.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "AGRAS-PUMP", name: "DJI Agras Spray Pump", platformId: "dji-agras-t50", manufacturer: "DJI", description: "Genuine DJI Agras spray pump assembly.", unitAmount: 42000, currency: "usd", image: "/images/parts/dji_agras_t50.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "AGRAS-BATTERY", name: "DJI Agras Intelligent Battery", platformId: "dji-agras-t50", manufacturer: "DJI", description: "Genuine DJI Agras intelligent battery. 30,000mAh.", unitAmount: 380000, currency: "usd", image: "/images/parts/dji_agras_t50.jpg", leadTime: "5–7 days", warranty: "6 months", tier: "oem" },
  { sku: "AGRAS-RADAR", name: "DJI Agras Radar Module", platformId: "dji-agras-t50", manufacturer: "DJI", description: "Genuine DJI Agras radar module. Obstacle avoidance.", unitAmount: 125000, currency: "usd", image: "/images/parts/dji_agras_t50.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

// Inspire Robots OEM
const INSPIRE_OEM: StorePart[] = [
  { sku: "INSPIRE-RH56DFQ", name: "Inspire Robots RH56DFQ Dexterous Hand", platformId: "unitree-h1-2", manufacturer: "Inspire Robots", description: "5-finger dexterous hand. 3kg payload, integrated force sensor.", unitAmount: 450000, currency: "usd", image: "/images/parts/shadow_hand.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

// Figure 02 OEM
const FIGURE02_OEM: StorePart[] = [
  { sku: "FIG2-HAND", name: "Figure 02 Dexterous Hand", platformId: "figure-02", manufacturer: "Figure AI", description: "Genuine Figure 02 16-DOF dexterous hand. 20kg payload.", unitAmount: 4500000, currency: "usd", image: "/images/parts/figure02.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "FIG2-ARM-ACT", name: "Figure 02 Arm Actuator", platformId: "figure-02", manufacturer: "Figure AI", description: "Genuine Figure 02 7-DOF arm actuator module.", unitAmount: 850000, currency: "usd", image: "/images/parts/figure02.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "FIG2-BATTERY", name: "Figure 02 Battery Pack", platformId: "figure-02", manufacturer: "Figure AI", description: "Genuine Figure 02 battery pack. ~5h runtime.", unitAmount: 2500000, currency: "usd", image: "/images/parts/figure02.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "FIG2-CONTROLLER", name: "Figure 02 Main Controller", platformId: "figure-02", manufacturer: "Figure AI", description: "Genuine Figure 02 main compute/motion controller.", unitAmount: 3200000, currency: "usd", image: "/images/parts/figure02.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "FIG2-LEG-ACT", name: "Figure 02 Leg Actuator", platformId: "figure-02", manufacturer: "Figure AI", description: "Genuine Figure 02 6-DOF leg actuator module.", unitAmount: 950000, currency: "usd", image: "/images/parts/figure02.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
];

// Tesla Optimus OEM
const OPTIMUS_OEM: StorePart[] = [
  { sku: "OPTIMUS-HAND", name: "Optimus Gen 3 Dexterous Hand", platformId: "optimus-gen3", manufacturer: "Tesla", description: "Genuine Optimus Gen 3 22-DOF dexterous hand.", unitAmount: 5200000, currency: "usd", image: "/images/parts/optimus.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "OPTIMUS-ARM-ACT", name: "Optimus Gen 3 Arm Actuator", platformId: "optimus-gen3", manufacturer: "Tesla", description: "Genuine Optimus Gen 3 7-DOF arm actuator.", unitAmount: 950000, currency: "usd", image: "/images/parts/optimus.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "OPTIMUS-BATTERY", name: "Optimus Gen 3 Battery Pack", platformId: "optimus-gen3", manufacturer: "Tesla", description: "Genuine Optimus Gen 3 battery pack. 2.3 kWh.", unitAmount: 2800000, currency: "usd", image: "/images/parts/optimus.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "OPTIMUS-CONTROLLER", name: "Optimus Gen 3 FSD Controller", platformId: "optimus-gen3", manufacturer: "Tesla", description: "Genuine Optimus Gen 3 FSD computer.", unitAmount: 4500000, currency: "usd", image: "/images/parts/optimus.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "OPTIMUS-LEG-ACT", name: "Optimus Gen 3 Leg Actuator", platformId: "optimus-gen3", manufacturer: "Tesla", description: "Genuine Optimus Gen 3 6-DOF leg actuator.", unitAmount: 1100000, currency: "usd", image: "/images/parts/optimus.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
];

// Apptronik Apollo OEM
const APOLLO_OEM: StorePart[] = [
  { sku: "APOLLO-HAND", name: "Apollo Dexterous Hand", platformId: "apollo", manufacturer: "Apptronik", description: "Genuine Apollo hand with 16 DOF.", unitAmount: 4200000, currency: "usd", image: "/images/parts/apollo.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "APOLLO-ARM-ACT", name: "Apollo Arm Actuator", platformId: "apollo", manufacturer: "Apptronik", description: "Genuine Apollo 7-DOF arm actuator module.", unitAmount: 820000, currency: "usd", image: "/images/parts/apollo.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "APOLLO-BATTERY", name: "Apollo Battery Pack", platformId: "apollo", manufacturer: "Apptronik", description: "Genuine Apollo battery pack. Hot-swap compatible.", unitAmount: 2200000, currency: "usd", image: "/images/parts/apollo.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "APOLLO-CONTROLLER", name: "Apollo Main Controller", platformId: "apollo", manufacturer: "Apptronik", description: "Genuine Apollo main compute/motion controller.", unitAmount: 3500000, currency: "usd", image: "/images/parts/apollo.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
];

// 1X Neo OEM
const NEO_OEM: StorePart[] = [
  { sku: "NEO-HAND", name: "Neo Dexterous Hand", platformId: "neo", manufacturer: "1X", description: "Genuine Neo hand with 20 DOF.", unitAmount: 3800000, currency: "usd", image: "/images/parts/neo.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "NEO-ARM-ACT", name: "Neo Arm Actuator", platformId: "neo", manufacturer: "1X", description: "Genuine Neo 7-DOF arm actuator module.", unitAmount: 720000, currency: "usd", image: "/images/parts/neo.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "NEO-BATTERY", name: "Neo Battery Pack", platformId: "neo", manufacturer: "1X", description: "Genuine Neo battery pack. Hot-swap compatible.", unitAmount: 1900000, currency: "usd", image: "/images/parts/neo.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "NEO-CONTROLLER", name: "Neo Main Controller", platformId: "neo", manufacturer: "1X", description: "Genuine Neo main compute/motion controller.", unitAmount: 3200000, currency: "usd", image: "/images/parts/neo.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
];

// Skydio X10 OEM
const SKYDIO_OEM: StorePart[] = [
  { sku: "SKYDIO-PROP", name: "Skydio X10 Propeller Set (4pcs)", platformId: "skydio-x10", manufacturer: "Skydio", description: "Genuine Skydio X10 propeller set.", unitAmount: 45000, currency: "usd", image: "/images/parts/skydio.jpg", leadTime: "3–5 days", warranty: "6 months", tier: "oem" },
  { sku: "SKYDIO-MOTOR", name: "Skydio X10 Brushless Motor", platformId: "skydio-x10", manufacturer: "Skydio", description: "Genuine Skydio X10 brushless motor.", unitAmount: 380000, currency: "usd", image: "/images/parts/skydio.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "SKYDIO-BATTERY", name: "Skydio X10 Battery Pack", platformId: "skydio-x10", manufacturer: "Skydio", description: "Genuine Skydio X10 intelligent battery.", unitAmount: 520000, currency: "usd", image: "/images/parts/skydio.jpg", leadTime: "5–7 days", warranty: "6 months", tier: "oem" },
  { sku: "SKYDIO-CAMERA", name: "Skydio X10 Camera Gimbal", platformId: "skydio-x10", manufacturer: "Skydio", description: "Genuine Skydio X10 camera gimbal. 4K/60fps.", unitAmount: 1800000, currency: "usd", image: "/images/parts/skydio.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

// Starship Gen3 OEM
const STARSHIP_OEM: StorePart[] = [
  { sku: "STARSHIP-WHEEL", name: "Starship Gen3 Wheel Motor", platformId: "starship-gen3", manufacturer: "Starship Technologies", description: "Genuine Starship Gen3 wheel motor.", unitAmount: 180000, currency: "usd", image: "/images/parts/starship.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "STARSHIP-BATTERY", name: "Starship Gen3 Battery Pack", platformId: "starship-gen3", manufacturer: "Starship Technologies", description: "Genuine Starship Gen3 battery pack. ~18h runtime.", unitAmount: 220000, currency: "usd", image: "/images/parts/starship.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "STARSHIP-SENSOR", name: "Starship Gen3 Sensor Array", platformId: "starship-gen3", manufacturer: "Starship Technologies", description: "Genuine Starship Gen3 sensor array. LiDAR, cameras.", unitAmount: 450000, currency: "usd", image: "/images/parts/starship.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "STARSHIP-CONTROLLER", name: "Starship Gen3 Main Controller", platformId: "starship-gen3", manufacturer: "Starship Technologies", description: "Genuine Starship Gen3 main controller.", unitAmount: 680000, currency: "usd", image: "/images/parts/starship.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

// Lime Gen4 OEM
const LIME_OEM: StorePart[] = [
  { sku: "LIME-BATTERY", name: "Lime Gen4 Battery Pack", platformId: "lime-gen4", manufacturer: "Lime", description: "Genuine Lime Gen4 swappable battery pack. 551 Wh.", unitAmount: 180000, currency: "usd", image: "/images/parts/lime.jpg", leadTime: "3–5 days", warranty: "6 months", tier: "oem" },
  { sku: "LIME-HUB-MOTOR", name: "Lime Gen4 Hub Motor", platformId: "lime-gen4", manufacturer: "Lime", description: "Genuine Lime Gen4 hub motor. 350W, regenerative braking.", unitAmount: 120000, currency: "usd", image: "/images/parts/lime.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "LIME-BRAKE", name: "Lime Gen4 Brake Assembly", platformId: "lime-gen4", manufacturer: "Lime", description: "Genuine Lime Gen4 brake assembly.", unitAmount: 65000, currency: "usd", image: "/images/parts/lime.jpg", leadTime: "3–5 days", warranty: "12 months", tier: "oem" },
  { sku: "LIME-TIRE", name: "Lime Gen4 Tire", platformId: "lime-gen4", manufacturer: "Lime", description: "Genuine Lime Gen4 10-inch pneumatic tire.", unitAmount: 35000, currency: "usd", image: "/images/parts/lime.jpg", leadTime: "2–3 days", warranty: "6 months", tier: "oem" },
];

// Digit v5 OEM
const DIGIT_OEM: StorePart[] = [
  { sku: "DIGIT-HAND", name: "Digit v5 Dexterous Hand", platformId: "digit-v5", manufacturer: "Agility Robotics", description: "Genuine Digit v5 hand with 16 DOF.", unitAmount: 3800000, currency: "usd", image: "/images/parts/digit.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "DIGIT-ARM-ACT", name: "Digit v5 Arm Actuator", platformId: "digit-v5", manufacturer: "Agility Robotics", description: "Genuine Digit v5 7-DOF arm actuator module.", unitAmount: 750000, currency: "usd", image: "/images/parts/digit.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "DIGIT-BATTERY", name: "Digit v5 Battery Pack", platformId: "digit-v5", manufacturer: "Agility Robotics", description: "Genuine Digit v5 battery pack. Hot-swap compatible.", unitAmount: 1800000, currency: "usd", image: "/images/parts/digit.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
];


export const STORE_PARTS: StorePart[] = [
  ...H1_OEM,
  ...G1_OEM,
  ...SPOT_OEM,
  ...AGRAS_OEM,
  ...INSPIRE_OEM,
  ...FIGURE02_OEM,
  ...OPTIMUS_OEM,
  ...APOLLO_OEM,
  ...NEO_OEM,
  ...SKYDIO_OEM,
  ...STARSHIP_OEM,
  ...LIME_OEM,
  ...DIGIT_OEM,
];

export const STORE_BUNDLES: PartBundle[] = [];

export const STORE_CATALOG: (StorePart | PartBundle)[] = [
  ...STORE_BUNDLES,
  ...STORE_PARTS,
];

const PART_MAP = new Map<string, StorePart | PartBundle>();
[...STORE_PARTS, ...STORE_BUNDLES].forEach((p) => PART_MAP.set(p.sku, p));

export function getPartBySku(sku: string): StorePart | PartBundle | undefined {
  return PART_MAP.get(sku);
}

export function stripePriceIdFor(part: StorePart | PartBundle): string | undefined {
  const envKey = `STRIPE_PRICE_${part.sku}`;
  const id = 'stripePriceId' in part ? part.stripePriceId : undefined;
  return process.env[envKey] || id;
}

export const TIER_META: Record<PartTier, { label: string; badge: string; description: string; color: string }> = {
  oem: { label: "OEM", badge: "Genuine", description: "Factory-original parts with full manufacturer warranty", color: "#1db87a" },
  direct: { label: "Direct", badge: "Tested Compatible", description: "Tested Chinese-compatible alternatives, ships fast from US/EU", color: "#cc3d17" },
  bundle: { label: "Bundle", badge: "Save up to 36%", description: "Curated repair kits, save 15-35% vs individual parts", color: "#f59e0b" },
};

export const PLATFORM_META: Record<string, { name: string; manufacturer: string }> = {
  "unitree-h1-2": { name: "Unitree H1", manufacturer: "Unitree Robotics" },
  "unitree-g1": { name: "Unitree G1", manufacturer: "Unitree Robotics" },
  "boston-dynamics-spot": { name: "Boston Dynamics Spot", manufacturer: "Boston Dynamics" },
  "dji-agras-t50": { name: "DJI Agras T50", manufacturer: "DJI" },
  "figure-02": { name: "Figure 02", manufacturer: "Figure AI" },
  "digit-v5": { name: "Digit v5", manufacturer: "Agility Robotics" },
  "optimus-gen3": { name: "Tesla Optimus", manufacturer: "Tesla" },
  "apollo": { name: "Apptronik Apollo", manufacturer: "Apptronik" },
  "neo": { name: "1X Neo", manufacturer: "1X" },
  "skydio-x10": { name: "Skydio X10", manufacturer: "Skydio" },
  "starship-gen3": { name: "Starship Gen3", manufacturer: "Starship Technologies" },
  "lime-gen4": { name: "Lime Gen4", manufacturer: "Lime" },
};

export const PRICE_MATCH_GUARANTEE = {
  enabled: true,
  terms: "Find a lower price from a verified seller? We'll beat it by 10%.",
  excludes: ["AliExpress", "unverified marketplace sellers"],
};
