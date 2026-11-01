import {
  type RepeatCommandCategory,
  repeatCommandDefaults,
} from "@ha-plus-matter-hub/common";
import type { Agent } from "@matter/main";
import { BridgeDataProvider } from "../../../services/bridges/bridge-data-provider.js";

export function repeatsCommands(
  agent: Agent,
  category: RepeatCommandCategory,
): boolean {
  return (
    agent.env.get(BridgeDataProvider).repeatCommands?.[category] ??
    repeatCommandDefaults[category]
  );
}
