import type { RepeatCommandCategory } from "@ha-plus-matter-hub/common";
import type { Endpoint, ValueSupervisor } from "@matter/main";
import { hasLocalActor } from "@matter/main/protocol";
import { BridgeDataProvider } from "../../../services/bridges/bridge-data-provider.js";

export interface RepeatedAttributeRequest {
  attribute: string;
  value: number | null;
  sequence: number;
}

export interface RepeatedAttributeState {
  commandAttributeValues: Record<string, number | null>;
  repeatedCommands?: Record<string, RepeatedAttributeRequest>;
}

/**
 * Matter attribute writes do not emit $Changed for matching values. Dynamic
 * properties retain normal attribute validation and transactions, while recording
 * matching remote writes for dispatch only after the transaction commits.
 */
export function repeatedAttributeProperties(
  state: RepeatedAttributeState,
  endpoint: Endpoint,
  session: ValueSupervisor.Session,
  category: RepeatCommandCategory,
  attributes: readonly string[],
): object {
  const properties = {};
  for (const attribute of attributes) {
    const raw = state as unknown as Record<string, number | null>;
    const read = () => raw[attribute];
    Object.defineProperty(properties, attribute, {
      enumerable: true,
      get: read,
      set(value: number | null) {
        const previous = read();
        raw[attribute] = value;
        if (
          previous === value &&
          !hasLocalActor(session) &&
          endpoint.env.get(BridgeDataProvider).repeatCommands?.[category] ===
            true
        ) {
          state.repeatedCommands = {
            ...state.repeatedCommands,
            [attribute]: {
              attribute,
              value,
              sequence:
                (state.repeatedCommands?.[attribute]?.sequence ?? 0) + 1,
            },
          };
        }
      },
    });
  }
  return properties;
}

/** Keep raw attribute reads and native change/validation events in sync with dynamic writes. */
export function initializeRepeatedAttributes(
  state: RepeatedAttributeState,
  attributes: readonly string[],
) {
  const raw = state as unknown as Record<string, number | null>;
  for (const attribute of attributes) {
    state.commandAttributeValues[attribute] = raw[attribute];
    Object.defineProperty(state, attribute, {
      enumerable: true,
      configurable: true,
      get: () => state.commandAttributeValues[attribute],
      set: (value: number | null) => {
        state.commandAttributeValues = {
          ...state.commandAttributeValues,
          [attribute]: value,
        };
      },
    });
  }
}
