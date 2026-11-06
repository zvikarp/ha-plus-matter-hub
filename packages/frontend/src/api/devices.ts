import type { EndpointData } from "@ha-plus-matter-hub/common";
import { request } from "./request.ts";
import { expectJson } from "./response.ts";

export async function fetchDevices(bridgeId: string) {
  const response = await request(`api/matter/bridges/${bridgeId}/devices`);
  return expectJson<EndpointData>(response);
}
