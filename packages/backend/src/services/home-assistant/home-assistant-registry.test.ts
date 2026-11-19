import { afterEach, describe, expect, it, vi } from "vitest";
import type { LoggerService } from "../../core/app/logger.js";
import type { BridgeDataProvider } from "../bridges/bridge-data-provider.js";
import { BridgeRegistry } from "../bridges/bridge-registry.js";
import type {
  HomeAssistantClient,
  HomeAssistantClientProps,
} from "./home-assistant-client.js";
import { HomeAssistantRegistry } from "./home-assistant-registry.js";

const log = { warn: vi.fn() };
const logger = { get: () => log } as unknown as LoggerService;

async function fixture() {
  const sendMessagePromise = vi.fn(({ type }: { type: string }) => {
    switch (type) {
      case "config/entity_registry/list":
        return Promise.resolve([
          { entity_id: "light.kitchen", device_id: "device1" },
          {
            entity_id: "light.area_override",
            device_id: "device1",
            area_id: "garage",
          },
        ]);
      case "get_states":
        return Promise.resolve([
          { entity_id: "light.kitchen", state: "on" },
          { entity_id: "light.area_override", state: "on" },
          { entity_id: "switch.state_only", state: "on" },
        ]);
      case "config/device_registry/list":
        return Promise.resolve([{ id: "device1", area_id: "kitchen" }]);
      default:
        throw new Error(`Unexpected command: ${type}`);
    }
  });
  const client = {
    connection: { sendMessagePromise },
  } as unknown as HomeAssistantClient;
  const options: HomeAssistantClientProps = {
    url: "http://localhost",
    accessToken: "test-token",
    refreshInterval: 1,
  };
  // The registry uses the same logger service as the Home Assistant action dispatcher.
  const registry = new HomeAssistantRegistry(logger, client, options);
  await registry.construction;
  return { registry, sendMessagePromise };
}

describe("Home Assistant registry and bridge exposure", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("includes accessible states that have no matching registry entry", async () => {
    const { registry } = await fixture();
    const entity = registry.entities["switch.state_only"];
    expect(entity.entity_id).toBe("switch.state_only");
    expect(registry.devices[entity.device_id]).toEqual({
      id: entity.device_id,
    });
  });

  it("matches a device area and preserves a more specific entity area override", async () => {
    const { registry } = await fixture();
    const data = {
      featureFlags: {},
      filter: { include: [{ type: "area", value: "kitchen" }], exclude: [] },
    } as unknown as BridgeDataProvider;
    const bridge = new BridgeRegistry(registry, data);
    expect(bridge.entityIds).toEqual(["light.kitchen"]);
  });

  it("reports a failed poll and successfully refreshes on the following tick", async () => {
    const { registry, sendMessagePromise } = await fixture();
    const onRefresh = vi.fn();
    vi.useFakeTimers();
    sendMessagePromise.mockRejectedValueOnce(new Error("connection lost"));
    registry.enableAutoRefresh(onRefresh);
    try {
      await vi.advanceTimersByTimeAsync(1000);
      expect(log.warn).toHaveBeenCalledOnce();
      expect(onRefresh).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1000);
      expect(onRefresh).toHaveBeenCalledOnce();
    } finally {
      await registry.dispose();
    }
  });

  it("waits for dispatch and handles a failed asynchronous bridge refresh", async () => {
    const { registry } = await fixture();
    const onRefresh = vi
      .fn()
      .mockRejectedValueOnce(new Error("bridge refresh failed"));
    vi.useFakeTimers();
    registry.enableAutoRefresh(onRefresh);
    try {
      await vi.advanceTimersByTimeAsync(1000);
      expect(log.warn).toHaveBeenCalledOnce();
      await vi.advanceTimersByTimeAsync(1000);
      expect(onRefresh).toHaveBeenCalledTimes(2);
    } finally {
      await registry.dispose();
    }
  });
});
