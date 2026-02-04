import type { BridgeDataWithMetadata } from "@ha-plus-matter-hub/common";
import type { AsyncState } from "../utils/async.ts";

export interface BridgeState {
  items: AsyncState<BridgeDataWithMetadata[]>;
}
