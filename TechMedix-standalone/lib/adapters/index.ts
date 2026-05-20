import { genericRestAdapter } from "./generic-rest";
import { vda5050Adapter } from "./vda5050";
import { openrmfAdapter } from "./openrmf";
import { ros2BridgeAdapter } from "./ros2-bridge";
import type { AdapterNormalizer, VendorAdapter } from "@/types/robot-state";

export const adapterRegistry: Record<VendorAdapter, AdapterNormalizer> = {
  generic_rest: genericRestAdapter,
  vda5050: vda5050Adapter,
  openrmf: openrmfAdapter,
  ros2_bridge: ros2BridgeAdapter,
};

export function getAdapter(type: VendorAdapter): AdapterNormalizer {
  return adapterRegistry[type] ?? genericRestAdapter;
}

export { genericRestAdapter, vda5050Adapter, openrmfAdapter, ros2BridgeAdapter };
