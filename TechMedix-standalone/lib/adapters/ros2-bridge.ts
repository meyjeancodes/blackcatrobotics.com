// ROS 2 bridge — normalizes /robot_state topic message shape
import type { AdapterNormalizer, RobotState, RobotStateStatus } from "@/types/robot-state";

function mapRosStatus(s: string): RobotStateStatus {
  switch ((s ?? "").toLowerCase()) {
    case "active":
    case "executing": return "active";
    case "idle":
    case "standby": return "idle";
    case "charging": return "charging";
    case "fault":
    case "error": return "error";
    default: return "offline";
  }
}

export const ros2BridgeAdapter: AdapterNormalizer = {
  vendor: "ROS 2",
  adapter: "ros2_bridge",
  normalize(raw): RobotState {
    const odom = raw.odom ?? raw.odometry ?? {};
    const pose = odom.pose?.pose?.position ?? {};
    return {
      robot_id: String(raw.robot_id ?? raw.namespace ?? "ros2-unknown"),
      vendor: raw.vendor ?? "ROS 2",
      model: raw.robot_type ?? raw.model ?? "ROS Robot",
      status: mapRosStatus(raw.status ?? raw.state ?? ""),
      battery_pct: Number(raw.battery_state?.percentage != null
        ? raw.battery_state.percentage * 100
        : raw.battery_pct ?? 0),
      location: {
        x: Number(pose.x ?? 0),
        y: Number(pose.y ?? 0),
        zone: String(raw.map_frame ?? raw.zone ?? "map"),
      },
      current_task: raw.current_goal ?? raw.task_id ?? null,
      last_seen: raw.header?.stamp
        ? new Date(raw.header.stamp.sec * 1000).toISOString()
        : new Date().toISOString(),
    };
  },
};
