import { afterEach, describe, expect, it, vi } from "vitest";
import { request } from "./request.ts";

afterEach(() => vi.unstubAllGlobals());

describe("Marketplace transport", () => {
  it("keeps ordinary standalone requests working", async () => {
    const self = {};
    vi.stubGlobal("window", { parent: self });
    // Parent differs from this object, but the Marketplace query flag is absent.
    vi.stubGlobal("window", { parent: self, location: { search: "" } });
    const fetch = vi.fn().mockResolvedValue(new Response("[]"));
    vi.stubGlobal("fetch", fetch);
    await request("api/matter/bridges");
    expect(fetch).toHaveBeenCalledWith("api/matter/bridges", {});
  });

  it("relays through a transferred channel without sending an access token", async () => {
    const postMessage = vi.fn((payload, origin, ports) => {
      expect(origin).toBe("http://ha.test");
      expect(payload).toEqual({
        type: "ha-plus-matter-hub-request",
        method: "POST",
        path: "api/matter/bridges",
        body: { name: "Test" },
      });
      ports[0].postMessage({ status: 200, body: '{"id":"bridge"}' });
      ports[0].close();
    });
    vi.stubGlobal("window", {
      parent: { postMessage },
      location: { search: "?ha_plus_panel=1", origin: "http://ha.test" },
      setTimeout,
      clearTimeout,
    });
    const response = await request("api/matter/bridges", {
      method: "POST",
      body: '{"name":"Test"}',
    });
    expect(await response.json()).toEqual({ id: "bridge" });
  });
});
