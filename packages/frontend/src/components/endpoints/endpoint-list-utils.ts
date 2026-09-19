import type { EndpointData } from "@ha-plus-matter-hub/common";
import { getEndpointName } from "./EndpointName.tsx";

const structuralTypes = new Set(["RootNode", "Aggregator"]);

export function listDevices(root: EndpointData): EndpointData[] {
  const endpoints: EndpointData[] = [];
  const queue = [root];

  while (queue.length > 0) {
    const endpoint = queue.shift()!;
    if (!structuralTypes.has(endpoint.type.name)) {
      endpoints.push(endpoint);
    }
    queue.push(...endpoint.parts);
  }

  return endpoints.sort((left, right) =>
    getEndpointName(left).localeCompare(getEndpointName(right)),
  );
}

export function filterDevices(devices: EndpointData[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return devices;
  }

  return devices.filter((device) =>
    [
      getEndpointName(device),
      device.type.name,
      device.id.local,
      String(device.endpoint),
    ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)),
  );
}

export function friendlyDeviceType(type: string) {
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
}
