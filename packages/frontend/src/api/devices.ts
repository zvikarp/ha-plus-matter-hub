import type { EndpointData } from "@ha-plus-matter-hub/common";
import { expectJson } from "./response.ts";

export async function fetchDevices(bridgeId: string) {
  const response = await fetch(`api/matter/bridges/${bridgeId}/devices`);
  return expectJson<EndpointData>(response);
}
