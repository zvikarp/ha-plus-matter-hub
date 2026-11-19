import type {
  CoverDeviceAttributes,
  HomeAssistantEntityState,
} from "@ha-plus-matter-hub/common";
import type { Agent } from "@matter/main";
import { describe, expect, it } from "vitest";
import type { WindowCoveringConfig } from "../../../../behaviors/window-covering-server.js";
import { CoverWindowCoveringServer } from "./cover-window-covering-server.js";

describe("Home Assistant cover positions", () => {
  // Matter's cluster declarations omit the custom configuration state.
  const { config } = CoverWindowCoveringServer.defaults as unknown as {
    config: WindowCoveringConfig;
  };
  const makeAgent = (coverDoNotInvertPercentage: boolean) =>
    ({
      env: { get: () => ({ featureFlags: { coverDoNotInvertPercentage } }) },
    }) as unknown as Agent;

  const makeState = (
    state: string,
    attributes: CoverDeviceAttributes = {},
  ): HomeAssistantEntityState<CoverDeviceAttributes> => ({
    entity_id: "cover.shade",
    state,
    attributes,
    last_changed: "2026-01-01T00:00:00Z",
    last_updated: "2026-01-01T00:00:00Z",
    context: { id: "test" },
  });

  it.each([
    false,
    true,
  ])("uses the Matter endpoints for state-only covers (%s)", (doNotInvert) => {
    const agent = makeAgent(doNotInvert);
    const open = makeState("open");
    const closed = makeState("closed");
    const opening = makeState("opening");
    expect(config.getCurrentLiftPosition(open, agent)).toBe(0);
    expect(config.getCurrentLiftPosition(closed, agent)).toBe(100);
    expect(config.getCurrentTiltPosition(open, agent)).toBe(0);
    expect(config.getCurrentTiltPosition(closed, agent)).toBe(100);
    expect(config.getCurrentLiftPosition(opening, agent)).toBeNull();
  });

  it("still applies the inversion setting to reported positions", () => {
    const entity = makeState("open", {
      current_position: 25,
      current_tilt_position: 75,
    });
    expect(config.getCurrentLiftPosition(entity, makeAgent(false))).toBe(75);
    expect(config.getCurrentTiltPosition(entity, makeAgent(false))).toBe(25);
    expect(config.getCurrentLiftPosition(entity, makeAgent(true))).toBe(25);
    expect(config.getCurrentTiltPosition(entity, makeAgent(true))).toBe(75);
  });
});
