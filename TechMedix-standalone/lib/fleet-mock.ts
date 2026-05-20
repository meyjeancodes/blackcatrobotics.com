// Mock unified fleet data — shape matches RobotState canonical interface.
// Replace with real vendor API calls when onboarding live robots.
import type { RobotState, VendorConnection } from "@/types/robot-state";

export const mockFleetRobots: RobotState[] = [
  {
    robot_id: "robot_atlas_7f4a",
    vendor: "Boston Dynamics",
    model: "Atlas Gen 2",
    status: "active",
    battery_pct: 81,
    location: { x: 12, y: 8, zone: "Assembly Line A" },
    current_task: "pick-and-place",
    last_seen: new Date(Date.now() - 45000).toISOString(),
  },
  {
    robot_id: "robot_unitree_g1_11",
    vendor: "Unitree",
    model: "G1 EDU",
    status: "idle",
    battery_pct: 76,
    location: { x: 28, y: 14, zone: "Test Lab" },
    current_task: null,
    last_seen: new Date(Date.now() - 90000).toISOString(),
  },
  {
    robot_id: "robot_figure_02_09",
    vendor: "Figure",
    model: "Figure 02",
    status: "charging",
    battery_pct: 34,
    location: { x: 5, y: 32, zone: "Charging Bay" },
    current_task: null,
    last_seen: new Date(Date.now() - 20000).toISOString(),
  },
  {
    robot_id: "robot_optimus_03",
    vendor: "Tesla",
    model: "Optimus Gen 2",
    status: "active",
    battery_pct: 58,
    location: { x: 40, y: 10, zone: "Warehouse Zone B" },
    current_task: "tote-transport",
    last_seen: new Date(Date.now() - 15000).toISOString(),
  },
];

export const mockVendorConnections: VendorConnection[] = [
  {
    id: "vc_boston",
    vendor: "Boston Dynamics",
    adapter: "ros2_bridge",
    endpoint: "https://api.bostondynamics.internal/v2",
    label: "BD Atlas Fleet",
    healthy: true,
    last_checked: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: "vc_unitree",
    vendor: "Unitree",
    adapter: "generic_rest",
    endpoint: "https://unitree-cloud.internal/api",
    label: "Unitree G-Series",
    healthy: true,
    last_checked: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: "vc_figure",
    vendor: "Figure",
    adapter: "openrmf",
    endpoint: "https://fleet.figure.ai/rmf",
    label: "Figure 02 Fleet",
    healthy: false,
    last_checked: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "vc_tesla",
    vendor: "Tesla",
    adapter: "vda5050",
    endpoint: "https://optimus.tesla.internal/vda",
    label: "Tesla Optimus",
    healthy: true,
    last_checked: new Date(Date.now() - 45000).toISOString(),
  },
];
