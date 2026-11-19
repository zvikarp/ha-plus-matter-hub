import { createHash } from "node:crypto";
import type {
  HomeAssistantDeviceRegistry,
  HomeAssistantEntityRegistry,
  HomeAssistantEntityState,
} from "@ha-plus-matter-hub/common";
import type { Logger } from "@matter/general";
import { getStates } from "home-assistant-js-websocket";
import { fromPairs, keyBy, keys, uniq, values } from "lodash-es";
import type { LoggerService } from "../../core/app/logger.js";
import { Service } from "../../core/ioc/service.js";
import { getDeviceRegistry, getRegistry } from "./api/get-registry.js";
import type {
  HomeAssistantClient,
  HomeAssistantClientProps,
} from "./home-assistant-client.js";

export type HomeAssistantDevices = Record<string, HomeAssistantDeviceRegistry>;
export type HomeAssistantEntities = Record<string, HomeAssistantEntityRegistry>;
export type HomeAssistantStates = Record<string, HomeAssistantEntityState>;

export class HomeAssistantRegistry extends Service {
  private autoRefresh?: NodeJS.Timeout;
  private refreshing = false;
  private readonly log: Logger;

  private _devices: HomeAssistantDevices = {};
  get devices() {
    return this._devices;
  }

  private _entities: HomeAssistantEntities = {};
  get entities() {
    return this._entities;
  }

  private _states: HomeAssistantStates = {};
  get states() {
    return this._states;
  }

  constructor(
    logger: LoggerService,
    private readonly client: HomeAssistantClient,
    private readonly options: HomeAssistantClientProps,
  ) {
    super("HomeAssistantRegistry");
    this.log = logger.get(this);
  }

  protected override async initialize(): Promise<void> {
    await this.reload();
  }

  override async dispose(): Promise<void> {
    this.disableAutoRefresh();
  }

  enableAutoRefresh(onRefresh: () => void | Promise<void>) {
    this.disableAutoRefresh();

    const timer = setInterval(async () => {
      if (this.refreshing || this.autoRefresh !== timer) {
        return;
      }
      this.refreshing = true;
      try {
        await this.reload();
        if (this.autoRefresh === timer) {
          await onRefresh();
        }
      } catch (error) {
        this.log.warn("Could not refresh Home Assistant devices", error);
      } finally {
        this.refreshing = false;
      }
    }, this.options.refreshInterval * 1000);
    this.autoRefresh = timer;
  }

  disableAutoRefresh() {
    if (this.autoRefresh != null) {
      clearInterval(this.autoRefresh);
    }
    this.autoRefresh = undefined;
  }

  private async reload() {
    const connection = this.client.connection;
    const entityRegistry = await getRegistry(connection);
    entityRegistry.forEach((e) => {
      e.device_id = e.device_id ?? mockDeviceId(e.entity_id);
    });
    const entities = keyBy(entityRegistry, "entity_id");
    const states: HomeAssistantStates = keyBy(
      await getStates(connection),
      "entity_id",
    );

    const entityIds = uniq(keys(entities).concat(keys(states)));
    const allEntities = keyBy(
      entityIds.map(
        (id) =>
          entities[id] ?? {
            entity_id: id,
            device_id: mockDeviceId(id),
          },
      ),
      "entity_id",
    );
    const deviceIds = values(allEntities).map(
      (e) => e.device_id ?? e.entity_id,
    );

    const realDevices = keyBy(await getDeviceRegistry(connection), "id");
    const missingDeviceIds = uniq(deviceIds.filter((d) => !realDevices[d]));
    const missingDevices: Record<string, HomeAssistantDeviceRegistry> =
      fromPairs(missingDeviceIds.map((d) => [d, { id: d }]));

    this._devices = { ...missingDevices, ...realDevices };
    this._entities = allEntities;
    this._states = states;
  }
}

function mockDeviceId(entityId: string) {
  const hash = createHash("sha256")
    .update(entityId)
    .digest("hex")
    .substring(0, 29);
  return `e__${hash}`;
}
