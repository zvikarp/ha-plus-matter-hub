import type { EndpointData } from "@ha-plus-matter-hub/common";
import { describe, expect, it } from "vitest";
import {
  filterDevices,
  friendlyDeviceType,
  listDevices,
} from "./endpoint-list-utils.ts";

const endpoint = (
  name: string,
  type: string,
  number: number,
  parts: EndpointData[] = [],
): EndpointData => ({
  id: { global: `global-${number}`, local: `local-${number}` },
  type: { name: type, id: String(number) },
  endpoint: number,
  state: { bridgedDeviceBasicInformation: { nodeLabel: name } },
  parts,
});

describe("device list helpers", () => {
  const light = endpoint("Kitchen light", "OnOffLight", 2);
  const fan = endpoint("Bedroom fan", "Fan", 3);
  const root = endpoint("Root", "RootNode", 0, [
    endpoint("Bridge", "Aggregator", 1, [fan, light]),
  ]);

  it("flattens bridge structure into alphabetically sorted devices", () => {
    expect(listDevices(root)).toEqual([fan, light]);
  });

  it("searches names, types, ids, and endpoint numbers", () => {
    const devices = listDevices(root);
    expect(filterDevices(devices, "kitchen")).toEqual([light]);
    expect(filterDevices(devices, "Fan")).toEqual([fan]);
    expect(filterDevices(devices, "2")).toEqual([light]);
  });

  it("turns Matter type names into readable labels", () => {
    expect(friendlyDeviceType("ColorTemperatureLight")).toBe(
      "Color Temperature Light",
    );
  });
});
