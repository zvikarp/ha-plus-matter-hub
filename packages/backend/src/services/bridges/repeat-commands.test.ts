import type {
  BridgeData,
  UpdateBridgeRequest,
} from "@ha-plus-matter-hub/common";
import { BridgeStatus, bridgeConfigSchema } from "@ha-plus-matter-hub/common";
import type { ServerNode } from "@matter/main/node";
import { Ajv } from "ajv";
import { describe, expect, it } from "vitest";
import { BridgeDataProvider } from "./bridge-data-provider.js";

const bridge = {
  id: "home",
  name: "Home",
  port: 5540,
  filter: { include: [], exclude: [] },
} as unknown as BridgeData;

describe("repeat command configuration persistence", () => {
  it("returns saved overrides in the bridge response and accepts subsequent changes", () => {
    const provider = new BridgeDataProvider({
      ...bridge,
      repeatCommands: { shades: true, onOff: false },
    });
    const node = {
      state: { commissioning: undefined },
    } as unknown as ServerNode;
    expect(
      provider.withMetadata({ code: BridgeStatus.Running }, node, 3)
        .repeatCommands,
    ).toEqual({ shades: true, onOff: false });
    provider.update({
      ...bridge,
      repeatCommands: { shades: false, onOff: true },
    } as UpdateBridgeRequest);
    expect(provider.repeatCommands).toEqual({ shades: false, onOff: true });
  });

  it("validates category values and rejects unknown categories without requiring migration", () => {
    const validate = new Ajv().compile(bridgeConfigSchema);
    const config = {
      name: "Home",
      port: 5540,
      filter: { include: [], exclude: [] },
    };
    expect(validate(config)).toBe(true);
    expect(
      validate({ ...config, repeatCommands: { shades: true, onOff: false } }),
    ).toBe(true);
    expect(validate({ ...config, repeatCommands: { shades: "true" } })).toBe(
      false,
    );
    expect(validate({ ...config, repeatCommands: { nonexistent: true } })).toBe(
      false,
    );
  });
});
