import type { EndpointData } from "@ha-plus-matter-hub/common";
import { describe, expect, it } from "vitest";
import {
  filterDevices,
  friendlyArea,
  friendlyDeviceType,
  listDevices,
} from "./endpoint-list-utils.ts";

const endpoint = (
  name: string,
  type: string,
  number: number,
  parts: EndpointData[] = [],
  area?: string,
): EndpointData => ({
  id: { global: `global-${number}`, local: `local-${number}` },
  type: { name: type, id: String(number) },
  endpoint: number,
  state: {
    bridgedDeviceBasicInformation: { nodeLabel: name },
    ...(area
      ? {
          homeAssistantEntity: {
            entity: { registry: { area_id: area } },
          },
        }
      : {}),
  },
  parts,
});

describe("device list helpers", () => {
  const light = endpoint("Kitchen light", "OnOffLight", 2);
  const fan = endpoint("Bedroom fan", "Fan", 3, [], "upstairs");
  const root = endpoint("Root", "RootNode", 0, [
    endpoint("Bridge", "Aggregator", 1, [fan, light], "downstairs"),
  ]);

  it("flattens bridge structure into alphabetically sorted devices", () => {
    expect(listDevices(root)).toEqual([
      { endpoint: fan, area: "upstairs" },
      { endpoint: light, area: "downstairs" },
    ]);
  });

  it("searches names, types, ids, and endpoint numbers", () => {
    const devices = listDevices(root);
    expect(filterDevices(devices, "kitchen")).toEqual([
      { endpoint: light, area: "downstairs" },
    ]);
    expect(filterDevices(devices, "Fan")).toEqual([
      { endpoint: fan, area: "upstairs" },
    ]);
    expect(filterDevices(devices, "2")).toEqual([
      { endpoint: light, area: "downstairs" },
    ]);
    expect(filterDevices(devices, "upstairs")).toEqual([
      { endpoint: fan, area: "upstairs" },
    ]);
  });

  it("turns Matter type names into readable labels", () => {
    expect(friendlyDeviceType("ColorTemperatureLight")).toBe(
      "Color Temperature Light",
    );
  });

  it("turns Home Assistant area slugs into readable labels", () => {
    expect(friendlyArea("main_floor")).toBe("Main floor");
    expect(friendlyArea("Unassigned")).toBe("Unassigned");
  });
});
