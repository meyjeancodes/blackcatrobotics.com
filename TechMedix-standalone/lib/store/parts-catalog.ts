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
  "zipline-p2": "/images/parts/zipline.jpg",
  "proteus-amr": "/images/parts/proteus.jpg",
  "serve-rs2": "/images/parts/serve.jpg",
  "uworld-u1-pro": "/images/parts/uworld.jpg",
  "unitree-b2": "/images/parts/unitree_b2.jpg",
  "dji-matrice-350": "/images/parts/matrice.jpg",
  "aigen-element-gen2": "/images/parts/aigen.jpg",
  "bird-three": "/images/parts/bird.jpg",
  "dji-agras-t60": "/images/parts/agras_t60.jpg",
  "unitree-r1": "/images/parts/unitree_r1.jpg",
  "uworld-u1-lite": "/images/parts/uworld.jpg",
  "uworld-u1-ultra": "/images/parts/uworld.jpg",
  "phantom-mk1": "/images/parts/phantom.jpg",
  "radcommercial": "/images/parts/rad.jpg",
  "rebot-devarm": "/images/parts/rebot.jpg",
  "robo-1": "/images/parts/robo1.jpg",
  "nvidia-jetson-agx-thor": "/images/parts/thor.jpg",
};

export function getPartImage(sku: string, platformId: string): string {
  return PLATFORM_FALLBACK[platformId] || "/images/parts/unitree_h1.jpg";
}

const H1_OEM: StorePart[] = [
  { sku: "H1-KNEE-ACT", name: "Unitree H1 Knee Actuator", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Genuine replacement knee actuator module.", unitAmount: 118000, currency: "usd", image: "/images/parts/variable_impedance_actuator.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-HIP-ACT", name: "Unitree H1 Hip Actuator", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Heavy-duty H1 hip torque actuator.", unitAmount: 132000, currency: "usd", image: "/images/parts/variable_impedance_actuator.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-SHOULDER-ACT", name: "Unitree H1 Shoulder Actuator", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Genuine shoulder actuator assembly.", unitAmount: 95000, currency: "usd", image: "/images/parts/variable_impedance_actuator.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-ANKLE-FOOT", name: "Unitree H1 Ankle & Foot Module", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Articulated ankle joint with textured foot sole.", unitAmount: 88000, currency: "usd", image: "/images/parts/variable_impedance_actuator.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-WAIST-ACT", name: "Unitree H1 Waist Actuator", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Central yaw waist actuator for torso rotation.", unitAmount: 102000, currency: "usd", image: "/images/parts/variable_impedance_actuator.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-BATTERY", name: "Unitree H1 Battery Pack (864Wh)", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "864Wh main power pack. CATL cells, factory-matched BMS.", unitAmount: 158000, currency: "usd", image: "/images/parts/h1_battery.jpg", leadTime: "3–5 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-DEX-HAND", name: "Unitree H1-2 Dexterous Hand", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Replacement dexterous end-effector with integrated tactile sensing.", unitAmount: 970000, currency: "usd", image: "/images/parts/shadow_hand.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-CONTROLLER", name: "Unitree H1 Main Controller", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Main compute / motion controller module.", unitAmount: 165000, currency: "usd", image: "/images/parts/go2_controller.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-CHARGER", name: "Unitree H1 Fast Charger", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "Official H1 fast charger. 67.2V output.", unitAmount: 100000, currency: "usd", image: "/images/parts/go2_charger.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "H1-M8010-MOTOR", name: "Unitree GO-M8010-6 Motor", platformId: "unitree-h1-2", manufacturer: "Unitree Robotics", description: "High-torque BLDC motor.", unitAmount: 36900, currency: "usd", image: "/images/parts/bldc_motor.jpg", leadTime: "3–5 days", warranty: "12 months", tier: "oem" },
];

const G1_OEM: StorePart[] = [
  { sku: "G1-ARM-ACT", name: "Unitree G1 Arm Actuator", platformId: "unitree-g1", manufacturer: "Unitree Robotics", description: "Genuine G1 7-DOF arm actuator module.", unitAmount: 89000, currency: "usd", image: "/images/parts/variable_impedance_actuator.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "G1-HAND", name: "Unitree G1 Dexterous Hand (Dex1)", platformId: "unitree-g1", manufacturer: "Unitree Robotics", description: "Genuine G1 Dex1 hand. 12 DOF, tactile sensing.", unitAmount: 120000, currency: "usd", image: "/images/parts/shadow_hand.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "G1-BATTERY", name: "Unitree G1 High-Performance Battery", platformId: "unitree-g1", manufacturer: "Unitree Robotics", description: "Genuine G1 battery pack. CATL cells, hot-swap capable.", unitAmount: 75000, currency: "usd", image: "/images/parts/g1_battery.jpg", leadTime: "3–5 days", warranty: "12 months", tier: "oem" },
  { sku: "G1-CHARGER", name: "Unitree G1 Charger", platformId: "unitree-g1", manufacturer: "Unitree Robotics", description: "Official G1 charger.", unitAmount: 100000, currency: "usd", image: "/images/parts/go2_charger.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
];

const SPOT_OEM: StorePart[] = [
  { sku: "SPOT-LEG-ACT", name: "Spot Leg Actuator", platformId: "boston-dynamics-spot", manufacturer: "Boston Dynamics", description: "Genuine Spot leg actuator assembly.", unitAmount: 320000, currency: "usd", image: "/images/parts/bostondynamics_spot.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "SPOT-ARM", name: "Spot Arm Assembly", platformId: "boston-dynamics-spot", manufacturer: "Boston Dynamics", description: "Genuine Spot arm with 6 DOF + gripper.", unitAmount: 450000, currency: "usd", image: "/images/parts/bostondynamics_spot.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "SPOT-BATTERY", name: "Spot Battery Pack", platformId: "boston-dynamics-spot", manufacturer: "Boston Dynamics", description: "Genuine Spot battery. Hot-swap capable.", unitAmount: 180000, currency: "usd", image: "/images/parts/bostondynamics_spot.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "SPOT-CHARGER", name: "Spot Charger", platformId: "boston-dynamics-spot", manufacturer: "Boston Dynamics", description: "Official Spot charging dock.", unitAmount: 220000, currency: "usd", image: "/images/parts/bostondynamics_spot.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
];

const AGRAS_OEM: StorePart[] = [
  { sku: "AGRAS-PROP", name: "DJI Agras Propeller Set (4pcs)", platformId: "dji-agras-t50", manufacturer: "DJI", description: "Genuine DJI Agras propeller set.", unitAmount: 18000, currency: "usd", image: "/images/parts/dji_agras_t50.jpg", leadTime: "3–5 days", warranty: "6 months", tier: "oem" },
  { sku: "AGRAS-MOTOR", name: "DJI Agras Brushless Motor", platformId: "dji-agras-t50", manufacturer: "DJI", description: "Genuine DJI Agras brushless motor.", unitAmount: 26900, currency: "usd", image: "/images/parts/dji_agras_t50.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "AGRAS-PUMP", name: "DJI Agras Spray Pump", platformId: "dji-agras-t50", manufacturer: "DJI", description: "Genuine DJI Agras spray pump assembly.", unitAmount: 42000, currency: "usd", image: "/images/parts/dji_agras_t50.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "AGRAS-BATTERY", name: "DJI Agras Intelligent Battery", platformId: "dji-agras-t50", manufacturer: "DJI", description: "Genuine DJI Agras intelligent battery.", unitAmount: 380000, currency: "usd", image: "/images/parts/dji_agras_t50.jpg", leadTime: "5–7 days", warranty: "6 months", tier: "oem" },
];

const INSPIRE_OEM: StorePart[] = [
  { sku: "INSPIRE-RH56DFQ", name: "Inspire Robots RH56DFQ Dexterous Hand", platformId: "unitree-h1-2", manufacturer: "Inspire Robots", description: "5-finger dexterous hand. 3kg payload, integrated force sensor.", unitAmount: 450000, currency: "usd", image: "/images/parts/shadow_hand.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

const FIGURE02_OEM: StorePart[] = [
  { sku: "FIG2-HAND", name: "Figure 02 Dexterous Hand", platformId: "figure-02", manufacturer: "Figure AI", description: "Genuine Figure 02 16-DOF dexterous hand.", unitAmount: 4500000, currency: "usd", image: "/images/parts/figure02.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "FIG2-ARM-ACT", name: "Figure 02 Arm Actuator", platformId: "figure-02", manufacturer: "Figure AI", description: "Genuine Figure 02 7-DOF arm actuator module.", unitAmount: 850000, currency: "usd", image: "/images/parts/figure02.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "FIG2-BATTERY", name: "Figure 02 Battery Pack", platformId: "figure-02", manufacturer: "Figure AI", description: "Genuine Figure 02 battery pack. ~5h runtime.", unitAmount: 2500000, currency: "usd", image: "/images/parts/figure02.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "FIG2-CONTROLLER", name: "Figure 02 Main Controller", platformId: "figure-02", manufacturer: "Figure AI", description: "Genuine Figure 02 main compute/motion controller.", unitAmount: 3200000, currency: "usd", image: "/images/parts/figure02.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
];

const OPTIMUS_OEM: StorePart[] = [
  { sku: "OPTIMUS-HAND", name: "Optimus Gen 3 Dexterous Hand", platformId: "optimus-gen3", manufacturer: "Tesla", description: "Genuine Optimus Gen 3 22-DOF dexterous hand.", unitAmount: 5200000, currency: "usd", image: "/images/parts/optimus.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "OPTIMUS-ARM-ACT", name: "Optimus Gen 3 Arm Actuator", platformId: "optimus-gen3", manufacturer: "Tesla", description: "Genuine Optimus Gen 3 7-DOF arm actuator.", unitAmount: 950000, currency: "usd", image: "/images/parts/optimus.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "OPTIMUS-BATTERY", name: "Optimus Gen 3 Battery Pack", platformId: "optimus-gen3", manufacturer: "Tesla", description: "Genuine Optimus Gen 3 battery pack. 2.3 kWh.", unitAmount: 2800000, currency: "usd", image: "/images/parts/optimus.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
];

const APOLLO_OEM: StorePart[] = [
  { sku: "APOLLO-HAND", name: "Apollo Dexterous Hand", platformId: "apollo", manufacturer: "Apptronik", description: "Genuine Apollo hand with 16 DOF.", unitAmount: 4200000, currency: "usd", image: "/images/parts/apollo.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "APOLLO-ARM-ACT", name: "Apollo Arm Actuator", platformId: "apollo", manufacturer: "Apptronik", description: "Genuine Apollo 7-DOF arm actuator module.", unitAmount: 820000, currency: "usd", image: "/images/parts/apollo.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "APOLLO-BATTERY", name: "Apollo Battery Pack", platformId: "apollo", manufacturer: "Apptronik", description: "Genuine Apollo battery pack. Hot-swap compatible.", unitAmount: 2200000, currency: "usd", image: "/images/parts/apollo.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
];

const NEO_OEM: StorePart[] = [
  { sku: "NEO-HAND", name: "Neo Dexterous Hand", platformId: "neo", manufacturer: "1X", description: "Genuine Neo hand with 20 DOF.", unitAmount: 3800000, currency: "usd", image: "/images/parts/neo.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "NEO-ARM-ACT", name: "Neo Arm Actuator", platformId: "neo", manufacturer: "1X", description: "Genuine Neo 7-DOF arm actuator module.", unitAmount: 720000, currency: "usd", image: "/images/parts/neo.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "NEO-BATTERY", name: "Neo Battery Pack", platformId: "neo", manufacturer: "1X", description: "Genuine Neo battery pack. Hot-swap compatible.", unitAmount: 1900000, currency: "usd", image: "/images/parts/neo.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
];

const SKYDIO_OEM: StorePart[] = [
  { sku: "SKYDIO-PROP", name: "Skydio X10 Propeller Set (4pcs)", platformId: "skydio-x10", manufacturer: "Skydio", description: "Genuine Skydio X10 propeller set.", unitAmount: 45000, currency: "usd", image: "/images/parts/skydio.jpg", leadTime: "3–5 days", warranty: "6 months", tier: "oem" },
  { sku: "SKYDIO-MOTOR", name: "Skydio X10 Brushless Motor", platformId: "skydio-x10", manufacturer: "Skydio", description: "Genuine Skydio X10 brushless motor.", unitAmount: 380000, currency: "usd", image: "/images/parts/skydio.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "SKYDIO-BATTERY", name: "Skydio X10 Battery Pack", platformId: "skydio-x10", manufacturer: "Skydio", description: "Genuine Skydio X10 intelligent battery.", unitAmount: 520000, currency: "usd", image: "/images/parts/skydio.jpg", leadTime: "5–7 days", warranty: "6 months", tier: "oem" },
];

const STARSHIP_OEM: StorePart[] = [
  { sku: "STARSHIP-WHEEL", name: "Starship Gen3 Wheel Motor", platformId: "starship-gen3", manufacturer: "Starship Technologies", description: "Genuine Starship Gen3 wheel motor.", unitAmount: 180000, currency: "usd", image: "/images/parts/starship.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "STARSHIP-BATTERY", name: "Starship Gen3 Battery Pack", platformId: "starship-gen3", manufacturer: "Starship Technologies", description: "Genuine Starship Gen3 battery pack. ~18h runtime.", unitAmount: 220000, currency: "usd", image: "/images/parts/starship.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "STARSHIP-SENSOR", name: "Starship Gen3 Sensor Array", platformId: "starship-gen3", manufacturer: "Starship Technologies", description: "Genuine Starship Gen3 sensor array.", unitAmount: 450000, currency: "usd", image: "/images/parts/starship.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

const LIME_OEM: StorePart[] = [
  { sku: "LIME-BATTERY", name: "Lime Gen4 Battery Pack", platformId: "lime-gen4", manufacturer: "Lime", description: "Genuine Lime Gen4 swappable battery pack. 551 Wh.", unitAmount: 180000, currency: "usd", image: "/images/parts/lime.jpg", leadTime: "3–5 days", warranty: "6 months", tier: "oem" },
  { sku: "LIME-HUB-MOTOR", name: "Lime Gen4 Hub Motor", platformId: "lime-gen4", manufacturer: "Lime", description: "Genuine Lime Gen4 hub motor. 350W.", unitAmount: 120000, currency: "usd", image: "/images/parts/lime.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "LIME-BRAKE", name: "Lime Gen4 Brake Assembly", platformId: "lime-gen4", manufacturer: "Lime", description: "Genuine Lime Gen4 brake assembly.", unitAmount: 65000, currency: "usd", image: "/images/parts/lime.jpg", leadTime: "3–5 days", warranty: "12 months", tier: "oem" },
];

const DIGIT_OEM: StorePart[] = [
  { sku: "DIGIT-HAND", name: "Digit v5 Dexterous Hand", platformId: "digit-v5", manufacturer: "Agility Robotics", description: "Genuine Digit v5 hand with 16 DOF.", unitAmount: 3800000, currency: "usd", image: "/images/parts/digit.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "DIGIT-ARM-ACT", name: "Digit v5 Arm Actuator", platformId: "digit-v5", manufacturer: "Agility Robotics", description: "Genuine Digit v5 7-DOF arm actuator module.", unitAmount: 750000, currency: "usd", image: "/images/parts/digit.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "DIGIT-BATTERY", name: "Digit v5 Battery Pack", platformId: "digit-v5", manufacturer: "Agility Robotics", description: "Genuine Digit v5 battery pack. Hot-swap compatible.", unitAmount: 1800000, currency: "usd", image: "/images/parts/digit.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
];

const AGILITY_OEM: StorePart[] = [
  { sku: "AGILITY-HAND", name: "Digit Dexterous Hand", platformId: "agility-digit", manufacturer: "Agility Robotics", description: "Genuine Digit hand with 16 DOF.", unitAmount: 3800000, currency: "usd", image: "/images/parts/agility_digit.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "AGILITY-ARM-ACT", name: "Digit Arm Actuator", platformId: "agility-digit", manufacturer: "Agility Robotics", description: "Genuine Digit 7-DOF arm actuator module.", unitAmount: 750000, currency: "usd", image: "/images/parts/agility_digit.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "AGILITY-BATTERY", name: "Digit Battery Pack", platformId: "agility-digit", manufacturer: "Agility Robotics", description: "Genuine Digit battery pack. Hot-swap compatible.", unitAmount: 1800000, currency: "usd", image: "/images/parts/agility_digit.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
];

const ASIMOV_OEM: StorePart[] = [
  { sku: "ASIMOV-HAND", name: "Asimov Dexterous Hand", platformId: "asimov-1", manufacturer: "1X", description: "Genuine Asimov hand with 20 DOF.", unitAmount: 4200000, currency: "usd", image: "/images/parts/asimov.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "ASIMOV-ARM-ACT", name: "Asimov Arm Actuator", platformId: "asimov-1", manufacturer: "1X", description: "Genuine Asimov 7-DOF arm actuator module.", unitAmount: 820000, currency: "usd", image: "/images/parts/asimov.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "ASIMOV-BATTERY", name: "Asimov Battery Pack", platformId: "asimov-1", manufacturer: "1X", description: "Genuine Asimov battery pack. Hot-swap compatible.", unitAmount: 2200000, currency: "usd", image: "/images/parts/asimov.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
];

const FRANKA_OEM: StorePart[] = [
  { sku: "FRANKA-ARM", name: "Franka Panda 7-DOF Arm", platformId: "franka-panda", manufacturer: "Franka Emika", description: "Genuine Franka Panda 7-DOF torque-controlled arm.", unitAmount: 12500000, currency: "usd", image: "/images/parts/franka.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "FRANKA-GRIPPER", name: "Franka Panda Gripper", platformId: "franka-panda", manufacturer: "Franka Emika", description: "Genuine Franka Panda gripper. Parallel-jaw, force-sensitive.", unitAmount: 1800000, currency: "usd", image: "/images/parts/franka.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "FRANKA-CONTROLLER", name: "Franka Panda Controller", platformId: "franka-panda", manufacturer: "Franka Emika", description: "Genuine Franka Panda controller. Real-time torque control at 1kHz.", unitAmount: 4500000, currency: "usd", image: "/images/parts/franka.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
];

const KINOVA_OEM: StorePart[] = [
  { sku: "KINOVA-ARM", name: "Kinova Gen3 7-DOF Arm", platformId: "kinova-gen3", manufacturer: "Kinova", description: "Genuine Kinova Gen3 7-DOF lightweight arm.", unitAmount: 9800000, currency: "usd", image: "/images/parts/kinova.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "KINOVA-GRIPPER", name: "Kinova Gen3 Gripper", platformId: "kinova-gen3", manufacturer: "Kinova", description: "Genuine Kinova Gen3 3-finger gripper.", unitAmount: 2200000, currency: "usd", image: "/images/parts/kinova.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "KINOVA-CONTROLLER", name: "Kinova Gen3 Controller", platformId: "kinova-gen3", manufacturer: "Kinova", description: "Genuine Kinova Gen3 controller. ROS-compatible.", unitAmount: 3800000, currency: "usd", image: "/images/parts/kinova.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
];

const UR5E_OEM: StorePart[] = [
  { sku: "UR5E-ARM", name: "UR5e 6-DOF Arm", platformId: "universal-robots-ur5e", manufacturer: "Universal Robots", description: "Genuine UR5e 6-DOF collaborative arm. 5kg payload.", unitAmount: 18500000, currency: "usd", image: "/images/parts/ur5e.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "UR5E-GRIPPER", name: "UR5e Gripper", platformId: "universal-robots-ur5e", manufacturer: "Universal Robots", description: "Genuine UR5e gripper. Parallel-jaw, force-sensitive.", unitAmount: 2800000, currency: "usd", image: "/images/parts/ur5e.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "UR5E-CONTROLLER", name: "UR5e Controller", platformId: "universal-robots-ur5e", manufacturer: "Universal Robots", description: "Genuine UR5e controller. PolyScope interface.", unitAmount: 6500000, currency: "usd", image: "/images/parts/ur5e.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
];

const UFACTORY_OEM: StorePart[] = [
  { sku: "UFACTORY-ARM", name: "xArm6 6-DOF Arm", platformId: "ufactory-xarm6", manufacturer: "UFactory", description: "Genuine xArm6 6-DOF arm. 5kg payload, 700mm reach.", unitAmount: 8500000, currency: "usd", image: "/images/parts/ufactory.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "UFACTORY-GRIPPER", name: "xArm6 Gripper", platformId: "ufactory-xarm6", manufacturer: "UFactory", description: "Genuine xArm6 gripper. Parallel-jaw, force-sensitive.", unitAmount: 1800000, currency: "usd", image: "/images/parts/ufactory.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "UFACTORY-CONTROLLER", name: "xArm6 Controller", platformId: "ufactory-xarm6", manufacturer: "UFactory", description: "Genuine xArm6 controller. ROS-compatible.", unitAmount: 3200000, currency: "usd", image: "/images/parts/ufactory.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
];

const ZIPLINE_OEM: StorePart[] = [
  { sku: "ZIPLINE-PROP", name: "Zipline P2 Propeller Set", platformId: "zipline-p2", manufacturer: "Zipline", description: "Genuine Zipline P2 propeller set.", unitAmount: 85000, currency: "usd", image: "/images/parts/zipline.jpg", leadTime: "3–5 days", warranty: "6 months", tier: "oem" },
  { sku: "ZIPLINE-BATTERY", name: "Zipline P2 Battery Pack", platformId: "zipline-p2", manufacturer: "Zipline", description: "Genuine Zipline P2 battery pack. Hot-swap compatible.", unitAmount: 450000, currency: "usd", image: "/images/parts/zipline.jpg", leadTime: "5–7 days", warranty: "6 months", tier: "oem" },
  { sku: "ZIPLINE-CONTROLLER", name: "Zipline P2 Flight Controller", platformId: "zipline-p2", manufacturer: "Zipline", description: "Genuine Zipline P2 flight controller.", unitAmount: 1200000, currency: "usd", image: "/images/parts/zipline.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

const PROTEUS_OEM: StorePart[] = [
  { sku: "PROTEUS-WHEEL", name: "Proteus Wheel Motor", platformId: "proteus-amr", manufacturer: "Proteus", description: "Genuine Proteus wheel motor.", unitAmount: 220000, currency: "usd", image: "/images/parts/proteus.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "PROTEUS-BATTERY", name: "Proteus Battery Pack", platformId: "proteus-amr", manufacturer: "Proteus", description: "Genuine Proteus battery pack. ~12h runtime.", unitAmount: 280000, currency: "usd", image: "/images/parts/proteus.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "PROTEUS-SENSOR", name: "Proteus Sensor Array", platformId: "proteus-amr", manufacturer: "Proteus", description: "Genuine Proteus sensor array.", unitAmount: 520000, currency: "usd", image: "/images/parts/proteus.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

const SERVE_OEM: StorePart[] = [
  { sku: "SERVE-WHEEL", name: "Serve RS2 Wheel Motor", platformId: "serve-rs2", manufacturer: "Serve Robotics", description: "Genuine Serve RS2 wheel motor.", unitAmount: 195000, currency: "usd", image: "/images/parts/serve.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "SERVE-BATTERY", name: "Serve RS2 Battery Pack", platformId: "serve-rs2", manufacturer: "Serve Robotics", description: "Genuine Serve RS2 battery pack. ~12h runtime.", unitAmount: 245000, currency: "usd", image: "/images/parts/serve.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "SERVE-SENSOR", name: "Serve RS2 Sensor Array", platformId: "serve-rs2", manufacturer: "Serve Robotics", description: "Genuine Serve RS2 sensor array.", unitAmount: 480000, currency: "usd", image: "/images/parts/serve.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

const UWORLD_OEM: StorePart[] = [
  { sku: "UWORLD-HAND", name: "U1 Pro Dexterous Hand", platformId: "uworld-u1-pro", manufacturer: "UWorld", description: "Genuine U1 Pro hand with 16 DOF.", unitAmount: 3200000, currency: "usd", image: "/images/parts/uworld.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "UWORLD-ARM-ACT", name: "U1 Pro Arm Actuator", platformId: "uworld-u1-pro", manufacturer: "UWorld", description: "Genuine U1 Pro 7-DOF arm actuator module.", unitAmount: 680000, currency: "usd", image: "/images/parts/uworld.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "UWORLD-BATTERY", name: "U1 Pro Battery Pack", platformId: "uworld-u1-pro", manufacturer: "UWorld", description: "Genuine U1 Pro battery pack. Hot-swap compatible.", unitAmount: 1600000, currency: "usd", image: "/images/parts/uworld.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
];

const B2_OEM: StorePart[] = [
  { sku: "B2-LEG-ACT", name: "Unitree B2 Leg Actuator", platformId: "unitree-b2", manufacturer: "Unitree Robotics", description: "Genuine B2 leg actuator. High-torque for quadruped locomotion.", unitAmount: 145000, currency: "usd", image: "/images/parts/unitree_b2.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "B2-BATTERY", name: "Unitree B2 Battery Pack", platformId: "unitree-b2", manufacturer: "Unitree Robotics", description: "Genuine B2 battery pack. ~4h runtime, hot-swap compatible.", unitAmount: 185000, currency: "usd", image: "/images/parts/unitree_b2.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "B2-CONTROLLER", name: "Unitree B2 Main Controller", platformId: "unitree-b2", manufacturer: "Unitree Robotics", description: "Genuine B2 main controller. Quadruped gait control.", unitAmount: 280000, currency: "usd", image: "/images/parts/unitree_b2.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

const MATRICE_OEM: StorePart[] = [
  { sku: "MATRICE-PROP", name: "Matrice 350 Propeller Set", platformId: "dji-matrice-350", manufacturer: "DJI", description: "Genuine Matrice 350 propeller set.", unitAmount: 65000, currency: "usd", image: "/images/parts/matrice.jpg", leadTime: "3–5 days", warranty: "6 months", tier: "oem" },
  { sku: "MATRICE-MOTOR", name: "Matrice 350 Brushless Motor", platformId: "dji-matrice-350", manufacturer: "DJI", description: "Genuine Matrice 350 brushless motor.", unitAmount: 420000, currency: "usd", image: "/images/parts/matrice.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "MATRICE-BATTERY", name: "Matrice 350 Battery Pack", platformId: "dji-matrice-350", manufacturer: "DJI", description: "Genuine Matrice 350 intelligent battery.", unitAmount: 680000, currency: "usd", image: "/images/parts/matrice.jpg", leadTime: "5–7 days", warranty: "6 months", tier: "oem" },
  { sku: "MATRICE-CAMERA", name: "Matrice 350 Camera Gimbal", platformId: "dji-matrice-350", manufacturer: "DJI", description: "Genuine Matrice 350 camera gimbal. 4K/60fps.", unitAmount: 2200000, currency: "usd", image: "/images/parts/matrice.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];


const AIGEN_OEM: StorePart[] = [
  { sku: "AIGEN-ARM", name: "Aigen Element Gen2 Arm", platformId: "aigen-element-gen2", manufacturer: "Aigen", description: "Genuine Aigen Element Gen2 7-DOF arm.", unitAmount: 7800000, currency: "usd", image: "/images/parts/aigen.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "AIGEN-GRIPPER", name: "Aigen Element Gen2 Gripper", platformId: "aigen-element-gen2", manufacturer: "Aigen", description: "Genuine Aigen Element Gen2 gripper.", unitAmount: 1600000, currency: "usd", image: "/images/parts/aigen.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "AIGEN-CONTROLLER", name: "Aigen Element Gen2 Controller", platformId: "aigen-element-gen2", manufacturer: "Aigen", description: "Genuine Aigen Element Gen2 controller.", unitAmount: 3200000, currency: "usd", image: "/images/parts/aigen.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
];

const BIRD_OEM: StorePart[] = [
  { sku: "BIRD-LEG-ACT", name: "Bird Three Leg Actuator", platformId: "bird-three", manufacturer: "Bird Three", description: "Genuine Bird Three leg actuator.", unitAmount: 95000, currency: "usd", image: "/images/parts/bird.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "BIRD-BATTERY", name: "Bird Three Battery Pack", platformId: "bird-three", manufacturer: "Bird Three", description: "Genuine Bird Three battery pack.", unitAmount: 125000, currency: "usd", image: "/images/parts/bird.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "BIRD-CONTROLLER", name: "Bird Three Main Controller", platformId: "bird-three", manufacturer: "Bird Three", description: "Genuine Bird Three main controller.", unitAmount: 220000, currency: "usd", image: "/images/parts/bird.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

const AGRAS_T60_OEM: StorePart[] = [
  { sku: "T60-PROP", name: "DJI Agras T60 Propeller Set", platformId: "dji-agras-t60", manufacturer: "DJI", description: "Genuine DJI Agras T60 propeller set.", unitAmount: 22000, currency: "usd", image: "/images/parts/agras_t60.jpg", leadTime: "3–5 days", warranty: "6 months", tier: "oem" },
  { sku: "T60-MOTOR", name: "DJI Agras T60 Brushless Motor", platformId: "dji-agras-t60", manufacturer: "DJI", description: "Genuine DJI Agras T60 brushless motor.", unitAmount: 32000, currency: "usd", image: "/images/parts/agras_t60.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "T60-BATTERY", name: "DJI Agras T60 Battery Pack", platformId: "dji-agras-t60", manufacturer: "DJI", description: "Genuine DJI Agras T60 intelligent battery.", unitAmount: 420000, currency: "usd", image: "/images/parts/agras_t60.jpg", leadTime: "5–7 days", warranty: "6 months", tier: "oem" },
  { sku: "T60-PUMP", name: "DJI Agras T60 Spray Pump", platformId: "dji-agras-t60", manufacturer: "DJI", description: "Genuine DJI Agras T60 spray pump assembly.", unitAmount: 55000, currency: "usd", image: "/images/parts/agras_t60.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
];

const R1_OEM: StorePart[] = [
  { sku: "R1-LEG-ACT", name: "Unitree R1 Leg Actuator", platformId: "unitree-r1", manufacturer: "Unitree Robotics", description: "Genuine R1 leg actuator.", unitAmount: 78000, currency: "usd", image: "/images/parts/unitree_r1.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "R1-BATTERY", name: "Unitree R1 Battery Pack", platformId: "unitree-r1", manufacturer: "Unitree Robotics", description: "Genuine R1 battery pack.", unitAmount: 95000, currency: "usd", image: "/images/parts/unitree_r1.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "R1-CONTROLLER", name: "Unitree R1 Main Controller", platformId: "unitree-r1", manufacturer: "Unitree Robotics", description: "Genuine R1 main controller.", unitAmount: 185000, currency: "usd", image: "/images/parts/unitree_r1.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

const UWORLD_LITE_OEM: StorePart[] = [
  { sku: "UWORLD-LITE-HAND", name: "U1 Lite Dexterous Hand", platformId: "uworld-u1-lite", manufacturer: "UWorld", description: "Genuine U1 Lite hand with 16 DOF.", unitAmount: 2800000, currency: "usd", image: "/images/parts/uworld.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "UWORLD-LITE-ARM-ACT", name: "U1 Lite Arm Actuator", platformId: "uworld-u1-lite", manufacturer: "UWorld", description: "Genuine U1 Lite 7-DOF arm actuator module.", unitAmount: 580000, currency: "usd", image: "/images/parts/uworld.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "UWORLD-LITE-BATTERY", name: "U1 Lite Battery Pack", platformId: "uworld-u1-lite", manufacturer: "UWorld", description: "Genuine U1 Lite battery pack.", unitAmount: 1400000, currency: "usd", image: "/images/parts/uworld.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
];

const UWORLD_ULTRA_OEM: StorePart[] = [
  { sku: "UWORLD-ULTRA-HAND", name: "U1 Ultra Dexterous Hand", platformId: "uworld-u1-ultra", manufacturer: "UWorld", description: "Genuine U1 Ultra hand with 20 DOF.", unitAmount: 4200000, currency: "usd", image: "/images/parts/uworld.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "UWORLD-ULTRA-ARM-ACT", name: "U1 Ultra Arm Actuator", platformId: "uworld-u1-ultra", manufacturer: "UWorld", description: "Genuine U1 Ultra 7-DOF arm actuator module.", unitAmount: 850000, currency: "usd", image: "/images/parts/uworld.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "UWORLD-ULTRA-BATTERY", name: "U1 Ultra Battery Pack", platformId: "uworld-u1-ultra", manufacturer: "UWorld", description: "Genuine U1 Ultra battery pack.", unitAmount: 1800000, currency: "usd", image: "/images/parts/uworld.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
];

const PHANTOM_OEM: StorePart[] = [
  { sku: "PHANTOM-ARM", name: "Phantom MK1 Arm", platformId: "phantom-mk1", manufacturer: "Phantom", description: "Genuine Phantom MK1 7-DOF arm.", unitAmount: 9200000, currency: "usd", image: "/images/parts/phantom.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "PHANTOM-GRIPPER", name: "Phantom MK1 Gripper", platformId: "phantom-mk1", manufacturer: "Phantom", description: "Genuine Phantom MK1 gripper.", unitAmount: 1900000, currency: "usd", image: "/images/parts/phantom.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "PHANTOM-CONTROLLER", name: "Phantom MK1 Controller", platformId: "phantom-mk1", manufacturer: "Phantom", description: "Genuine Phantom MK1 controller.", unitAmount: 3800000, currency: "usd", image: "/images/parts/phantom.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
];

const RAD_OEM: StorePart[] = [
  { sku: "RAD-WHEEL", name: "RadCommercial Wheel Motor", platformId: "radcommercial", manufacturer: "RadCommercial", description: "Genuine RadCommercial wheel motor.", unitAmount: 165000, currency: "usd", image: "/images/parts/rad.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
  { sku: "RAD-BATTERY", name: "RadCommercial Battery Pack", platformId: "radcommercial", manufacturer: "RadCommercial", description: "Genuine RadCommercial battery pack.", unitAmount: 195000, currency: "usd", image: "/images/parts/rad.jpg", leadTime: "5–7 days", warranty: "12 months", tier: "oem" },
  { sku: "RAD-SENSOR", name: "RadCommercial Sensor Array", platformId: "radcommercial", manufacturer: "RadCommercial", description: "Genuine RadCommercial sensor array.", unitAmount: 380000, currency: "usd", image: "/images/parts/rad.jpg", leadTime: "7–10 days", warranty: "12 months", tier: "oem" },
];

const REBOT_OEM: StorePart[] = [
  { sku: "REBOT-ARM", name: "Rebot DevArm 6-DOF Arm", platformId: "rebot-devarm", manufacturer: "Rebot", description: "Genuine Rebot DevArm 6-DOF arm.", unitAmount: 6800000, currency: "usd", image: "/images/parts/rebot.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "REBOT-GRIPPER", name: "Rebot DevArm Gripper", platformId: "rebot-devarm", manufacturer: "Rebot", description: "Genuine Rebot DevArm gripper.", unitAmount: 1400000, currency: "usd", image: "/images/parts/rebot.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "REBOT-CONTROLLER", name: "Rebot DevArm Controller", platformId: "rebot-devarm", manufacturer: "Rebot", description: "Genuine Rebot DevArm controller.", unitAmount: 2800000, currency: "usd", image: "/images/parts/rebot.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
];

const ROBO1_OEM: StorePart[] = [
  { sku: "ROBO1-ARM", name: "Robo-1 7-DOF Arm", platformId: "robo-1", manufacturer: "Robo", description: "Genuine Robo-1 7-DOF arm.", unitAmount: 8500000, currency: "usd", image: "/images/parts/robo1.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
  { sku: "ROBO1-GRIPPER", name: "Robo-1 Gripper", platformId: "robo-1", manufacturer: "Robo", description: "Genuine Robo-1 gripper.", unitAmount: 1700000, currency: "usd", image: "/images/parts/robo1.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "ROBO1-CONTROLLER", name: "Robo-1 Controller", platformId: "robo-1", manufacturer: "Robo", description: "Genuine Robo-1 controller.", unitAmount: 3200000, currency: "usd", image: "/images/parts/robo1.jpg", leadTime: "14–21 days", warranty: "12 months", tier: "oem" },
];

const THOR_OEM: StorePart[] = [
  { sku: "THOR-MODULE", name: "Jetson AGX Thor Module", platformId: "nvidia-jetson-agx-thor", manufacturer: "Nvidia", description: "Genuine Jetson AGX Thor module. 1000 TOPS AI.", unitAmount: 3500000, currency: "usd", image: "/images/parts/thor.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
  { sku: "THOR-CARRIER", name: "Jetson AGX Thor Carrier Board", platformId: "nvidia-jetson-agx-thor", manufacturer: "Nvidia", description: "Genuine Jetson AGX Thor carrier board.", unitAmount: 850000, currency: "usd", image: "/images/parts/thor.jpg", leadTime: "10–14 days", warranty: "12 months", tier: "oem" },
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
  ...AGILITY_OEM,
  ...ASIMOV_OEM,
  ...FRANKA_OEM,
  ...KINOVA_OEM,
  ...UR5E_OEM,
  ...UFACTORY_OEM,
  ...ZIPLINE_OEM,
  ...PROTEUS_OEM,
  ...SERVE_OEM,
  ...UWORLD_OEM,
  ...B2_OEM,
  ...MATRICE_OEM,
  ...AIGEN_OEM,
  ...BIRD_OEM,
  ...AGRAS_T60_OEM,
  ...R1_OEM,
  ...UWORLD_LITE_OEM,
  ...UWORLD_ULTRA_OEM,
  ...PHANTOM_OEM,
  ...RAD_OEM,
  ...REBOT_OEM,
  ...ROBO1_OEM,
  ...THOR_OEM,
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
  "agility-digit": { name: "Digit v5", manufacturer: "Agility Robotics" },
  "asimov-1": { name: "Asimov", manufacturer: "1X" },
  "franka-panda": { name: "Franka Panda", manufacturer: "Franka Emika" },
  "kinova-gen3": { name: "Kinova Gen3", manufacturer: "Kinova" },
  "universal-robots-ur5e": { name: "UR5e", manufacturer: "Universal Robots" },
  "ufactory-xarm6": { name: "xArm6", manufacturer: "UFactory" },
  "zipline-p2": { name: "Zipline P2", manufacturer: "Zipline" },
  "proteus-amr": { name: "Proteus AMR", manufacturer: "Proteus" },
  "serve-rs2": { name: "Serve RS2", manufacturer: "Serve Robotics" },
  "uworld-u1-pro": { name: "U1 Pro", manufacturer: "UWorld" },
  "unitree-b2": { name: "Unitree B2", manufacturer: "Unitree Robotics" },
  "dji-matrice-350": { name: "Matrice 350", manufacturer: "DJI" },
  "aigen-element-gen2": { name: "Aigen Element Gen2", manufacturer: "Aigen" },
  "bird-three": { name: "Bird Three", manufacturer: "Bird Three" },
  "dji-agras-t60": { name: "DJI Agras T60", manufacturer: "DJI" },
  "unitree-r1": { name: "Unitree R1", manufacturer: "Unitree Robotics" },
  "uworld-u1-lite": { name: "U1 Lite", manufacturer: "UWorld" },
  "uworld-u1-ultra": { name: "U1 Ultra", manufacturer: "UWorld" },
  "phantom-mk1": { name: "Phantom MK1", manufacturer: "Phantom" },
  "radcommercial": { name: "RadCommercial", manufacturer: "RadCommercial" },
  "rebot-devarm": { name: "Rebot DevArm", manufacturer: "Rebot" },
  "robo-1": { name: "Robo-1", manufacturer: "Robo" },
  "nvidia-jetson-agx-thor": { name: "Jetson AGX Thor", manufacturer: "Nvidia" },
};

export const PRICE_MATCH_GUARANTEE = {
  enabled: true,
  terms: "Find a lower price from a verified seller? We'll beat it by 10%.",
  excludes: ["AliExpress", "unverified marketplace sellers"],
};






















