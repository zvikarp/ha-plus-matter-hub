import { afterEach, expect, it, vi } from "vitest";
import type { LoggerService } from "../../core/app/logger.js";
import { HomeAssistantActions } from "./home-assistant-actions.js";
import type { HomeAssistantClient } from "./home-assistant-client.js";

afterEach(() => vi.useRealTimers());

it("logs a rejected background command while allowing later actions", async () => {
  const log = { debug: vi.fn(), warn: vi.fn() };
  const logger = { get: () => log } as unknown as LoggerService;
  const sendMessagePromise = vi
    .fn()
    .mockRejectedValueOnce(new Error("offline"));
  const client = {
    connection: { sendMessagePromise },
  } as unknown as HomeAssistantClient;
  const actions = new HomeAssistantActions(logger, client);
  await actions.construction;
  vi.useFakeTimers();
  try {
    actions.call({ action: "light.turn_on" }, "light.kitchen");
    await vi.advanceTimersByTimeAsync(100);
    expect(log.warn).toHaveBeenCalledOnce();
    actions.call({ action: "light.turn_off" }, "light.kitchen");
    await vi.advanceTimersByTimeAsync(100);
    expect(sendMessagePromise).toHaveBeenCalledTimes(2);
  } finally {
    await actions.dispose();
  }
});
