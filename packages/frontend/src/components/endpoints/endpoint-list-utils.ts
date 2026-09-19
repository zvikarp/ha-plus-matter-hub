import type { EndpointData } from "@ha-plus-matter-hub/common";
import { getEndpointName } from "./EndpointName.tsx";

const structuralTypes = new Set(["RootNode", "Aggregator"]);

export interface DeviceListItem {
  endpoint: EndpointData;
  area: string;
}

export function listDevices(root: EndpointData): DeviceListItem[] {
  const devices: DeviceListItem[] = [];
  const queue = [
    { endpoint: root, inheritedArea: undefined as string | undefined },
  ];

  while (queue.length > 0) {
    const { endpoint, inheritedArea } = queue.shift()!;
    const area = getEndpointArea(endpoint) ?? inheritedArea;
    if (!structuralTypes.has(endpoint.type.name)) {
      devices.push({ endpoint, area: area ?? "Unassigned" });
    }
    queue.push(
      ...endpoint.parts.map((part) => ({
        endpoint: part,
        inheritedArea: area,
      })),
    );
  }

  return devices.sort((left, right) =>
    getEndpointName(left.endpoint).localeCompare(
      getEndpointName(right.endpoint),
    ),
  );
}

export function filterDevices(devices: DeviceListItem[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return devices;
  }

  return devices.filter(({ endpoint, area }) =>
    [
      getEndpointName(endpoint),
      endpoint.type.name,
      endpoint.id.local,
      String(endpoint.endpoint),
      area,
    ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)),
  );
}

export function friendlyDeviceType(type: string) {
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function friendlyArea(area: string) {
  if (area === "Unassigned") {
    return area;
  }
  const label = area.replace(/[_-]+/g, " ");
  return label.charAt(0).toLocaleUpperCase() + label.slice(1);
}

function getEndpointArea(endpoint: EndpointData): string | undefined {
  const state = endpoint.state as {
    homeAssistantEntity?: {
      entity?: {
        registry?: { area_id?: string };
        deviceRegistry?: { area_id?: unknown };
      };
    };
  };
  const entity = state.homeAssistantEntity?.entity;
  const area = entity?.registry?.area_id ?? entity?.deviceRegistry?.area_id;
  return typeof area === "string" && area.length > 0 ? area : undefined;
}
