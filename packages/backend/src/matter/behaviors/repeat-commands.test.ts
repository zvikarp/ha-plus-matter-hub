import { repeatCommandDefaults } from "@ha-plus-matter-hub/common";
import type {
  ActionContext,
  Agent,
  Endpoint,
  ValueSupervisor,
} from "@matter/main";
import { MovementDirection, MovementType } from "@matter/main/behaviors";
import { DataModelPath } from "@matter/main/model";
import { Val } from "@matter/main/protocol";
import { describe, expect, it, vi } from "vitest";
import { ColorControlServerBase } from "./color-control-server.js";
import { FanControlServerBase } from "./fan-control-server.js";
import { LevelControlServerBase } from "./level-control-server.js";
import { LockServer } from "./lock-server.js";
import { MediaInputServer } from "./media-input-server.js";
import { OnOffServer } from "./on-off-server.js";
import { ThermostatServerBase } from "./thermostat-server.js";
import { repeatsCommands } from "./utils/repeat-commands.js";
import { WindowCoveringServerBase } from "./window-covering-server.js";

function fixture(repeatCommands: object = {}) {
  const callAction = vi.fn();
  const homeAssistant = { entity: { state: {} }, callAction };
  const agent = {
    get: () => homeAssistant,
    env: { get: () => ({ repeatCommands }) },
  } as unknown as Agent;
  return { agent, callAction };
}

function behavior<T extends object>(
  prototype: T,
  state: object,
  agent: Agent,
  features: object = {},
): T {
  return Object.defineProperties(Object.create(prototype), {
    state: { value: state },
    agent: { value: agent },
    features: { value: features },
    minLevel: { value: 1 },
    maxLevel: { value: 254 },
  });
}

describe("repeat command settings", () => {
  it("preserves defaults for older bridge configurations", () => {
    const { agent } = fixture();
    for (const category of Object.keys(
      repeatCommandDefaults,
    ) as (keyof typeof repeatCommandDefaults)[]) {
      expect(repeatsCommands(agent, category)).toBe(
        repeatCommandDefaults[category],
      );
    }
  });

  it.each([
    false,
    true,
  ])("forwards matching shade close and tilt requests only when enabled (%s)", async (repeat) => {
    const { agent, callAction } = fixture({ shades: repeat });
    const config = {
      getCurrentLiftPosition: () => 100,
      getCurrentTiltPosition: () => 100,
      closeCoverLift: () => ({ action: "cover.close_cover" }),
      closeCoverTilt: () => ({ action: "cover.close_cover_tilt" }),
      setLiftPosition: (position: number) => ({
        action: "cover.set_cover_position",
        data: { position },
      }),
      setTiltPosition: (position: number) => ({
        action: "cover.set_cover_tilt_position",
        data: { position },
      }),
    };
    const server = behavior(
      WindowCoveringServerBase.prototype,
      { config },
      agent,
      { absolutePosition: true },
    );
    await server.handleMovement(
      MovementType.Lift,
      false,
      MovementDirection.Close,
      10000,
    );
    await server.handleMovement(
      MovementType.Tilt,
      false,
      MovementDirection.Close,
      10000,
    );
    expect(callAction.mock.calls.map(([action]) => action.action)).toEqual(
      repeat ? ["cover.close_cover", "cover.close_cover_tilt"] : [],
    );
  });

  it.each([
    false,
    true,
  ])("keeps matching brightness conditional (%s)", (repeat) => {
    const { agent, callAction } = fixture({ brightness: repeat });
    const config = {
      getValuePercent: () => 0.5,
      moveToLevelPercent: (value: number) => ({
        action: "light.turn_on",
        data: { brightness: value },
      }),
    };
    const server = behavior(
      LevelControlServerBase.prototype,
      { config },
      agent,
    );
    server.moveToLevelLogic(127.5);
    expect(callAction).toHaveBeenCalledTimes(repeat ? 1 : 0);
    server.moveToLevelLogic(254);
    expect(callAction).toHaveBeenCalledTimes(repeat ? 2 : 1);
  });

  it.each([
    false,
    true,
  ])("keeps matching color temperature conditional (%s)", (repeat) => {
    const { agent, callAction } = fixture({ color: repeat });
    const config = {
      getCurrentKelvin: () => 4000,
      setTemperature: (kelvin: number) => ({
        action: "light.turn_on",
        data: { color_temp_kelvin: kelvin },
      }),
    };
    const server = behavior(
      ColorControlServerBase.prototype,
      { config },
      agent,
    );
    server.moveToColorTemperatureLogic(250);
    expect(callAction).toHaveBeenCalledTimes(repeat ? 1 : 0);
    server.moveToColorTemperatureLogic(200);
    expect(callAction).toHaveBeenCalledTimes(repeat ? 2 : 1);
  });
});

describe("repeated writable attributes", () => {
  // These are raw Matter states. Their dynamic properties are used by Matter's
  // managed state layer; commands dispatch through $Changed only after commit.
  it.each([
    false,
    true,
  ])("records matching remote climate writes only when enabled (%s)", (repeat) => {
    const state = new ThermostatServerBase.State();
    const endpoint = {
      env: { get: () => ({ repeatCommands: { climate: repeat } }) },
      behaviors: { optionsFor: () => ({}), defaultsFor: () => ({}) },
    } as unknown as Endpoint;
    const remote = { subject: {} } as unknown as ValueSupervisor.Session;
    const props = state[Val.properties](
      endpoint,
      remote,
    ) as Partial<ThermostatServerBase.State>;
    props.systemMode = state.systemMode;
    props.occupiedHeatingSetpoint = state.occupiedHeatingSetpoint;
    expect(Object.keys(state.repeatedCommands ?? {})).toEqual(
      repeat ? ["systemMode", "occupiedHeatingSetpoint"] : [],
    );
    props.systemMode = 4;
    expect(state.systemMode).toBe(4);
  });

  it("does not record local status updates and preserves fan state across raw clones", () => {
    const state = new FanControlServerBase.State();
    const endpoint = {
      env: { get: () => ({ repeatCommands: { fans: true } }) },
    } as unknown as Endpoint;
    const local = {} as unknown as ValueSupervisor.Session;
    const props = state[Val.properties](endpoint, local) as Record<
      string,
      number
    >;
    props.percentSetting = 50;
    props.percentSetting = 50;
    expect(state.percentSetting).toBe(50);
    expect(state.repeatedCommands).toBeUndefined();
    const clone = new FanControlServerBase.State();
    clone.commandAttributeValues = state.commandAttributeValues;
    expect(clone.percentSetting).toBe(50);
    const remote = { subject: {} } as unknown as ValueSupervisor.Session;
    const remoteProps = clone[Val.properties](endpoint, remote) as Record<
      string,
      number
    >;
    remoteProps.percentSetting = 50;
    expect(clone.repeatedCommands?.percentSetting.value).toBe(50);
    expect(state.repeatedCommands).toBeUndefined();
    remoteProps.percentSetting = 60;
    expect(clone.percentSetting).toBe(60);
    expect(state.percentSetting).toBe(50);
  });
});

describe("native Matter attribute supervision", () => {
  it("preserves attribute validation, raw reads, and matching remote writes", () => {
    const state = new ThermostatServerBase.State();
    state.systemMode = 0;
    state.occupiedHeatingSetpoint = 2000;
    state.occupiedCoolingSetpoint = 2600;
    const endpoint = {
      env: { get: () => ({ repeatCommands: { climate: true } }) },
      behaviors: { optionsFor: () => ({}), defaultsFor: () => ({}) },
    } as unknown as Endpoint;
    const reference = {
      value: state,
      original: state,
      expired: false,
      primaryKey: "name",
      location: { path: DataModelPath("test.thermostat") },
      rootOwner: endpoint,
      change: (mutator: () => void) => mutator(),
      refresh: () => {},
    } as unknown as Val.Reference;
    const session = {
      subject: {},
      command: true,
    } as unknown as ValueSupervisor.Session;
    const managed = ThermostatServerBase.supervisor.manage(
      reference,
      session,
    ) as unknown as ThermostatServerBase.State;
    managed.occupiedHeatingSetpoint = 2000;
    expect(state.repeatedCommands?.occupiedHeatingSetpoint.value).toBe(2000);
    managed.occupiedHeatingSetpoint = 2100;
    expect(state.occupiedHeatingSetpoint).toBe(2100);
    expect(managed.occupiedHeatingSetpoint).toBe(2100);
    expect(() => {
      managed.occupiedHeatingSetpoint = 100000;
    }).toThrow();
    expect(state.occupiedHeatingSetpoint).toBe(2100);
  });
});

describe("categories that repeat by default", () => {
  it.each([
    undefined,
    false,
    true,
  ])("supports opting out of on/off, locks, and media input repeats (%s)", (enabled) => {
    const { agent, callAction } = fixture(
      enabled === undefined
        ? {}
        : { onOff: enabled, locks: enabled, mediaInputs: enabled },
    );
    const onOffConfig = { isOn: () => true };
    const onOff = behavior(
      OnOffServer(onOffConfig).prototype,
      { config: onOffConfig },
      agent,
    );
    onOff.on();
    expect(callAction).toHaveBeenCalledTimes(enabled === false ? 0 : 1);
    callAction.mockClear();
    const lockConfig = {
      getLockState: () => 1,
      lock: () => ({ action: "lock.lock" }),
      unlock: () => ({ action: "lock.unlock" }),
    };
    const lock = behavior(
      LockServer(lockConfig).prototype,
      { config: lockConfig },
      agent,
    );
    lock.lockDoor();
    expect(callAction).toHaveBeenCalledTimes(enabled === false ? 0 : 1);
    callAction.mockClear();
    const mediaConfig = {
      getCurrentSource: () => "TV",
      getSourceList: () => ["TV"],
      selectSource: () => ({ action: "media_player.select_source" }),
    };
    const media = behavior(
      MediaInputServer(mediaConfig).prototype,
      { config: mediaConfig, inputList: [{ name: "TV" }] },
      agent,
    );
    media.selectInput({ index: 0 });
    expect(callAction).toHaveBeenCalledTimes(enabled === false ? 0 : 1);
  });
});

describe("post-commit repeated attribute dispatch", () => {
  it("dispatches each new climate request once and ignores local synchronization", () => {
    const { agent, callAction } = fixture({ climate: true });
    const config = {
      setSystemMode: () => ({ action: "climate.set_hvac_mode" }),
      supportsTemperatureRange: () => false,
      setTargetTemperature: () => ({ action: "climate.set_temperature" }),
    };
    const server = behavior(
      ThermostatServerBase.prototype,
      { config, occupiedCoolingSetpoint: 2600 },
      agent,
    );
    const dispatcher = server as unknown as {
      repeatCommand: (
        requests: object,
        old: object | undefined,
        context: ActionContext,
      ) => void;
    };
    const requests = {
      systemMode: { attribute: "systemMode", value: 4, sequence: 1 },
      occupiedHeatingSetpoint: {
        attribute: "occupiedHeatingSetpoint",
        value: 2000,
        sequence: 1,
      },
    };
    const remote = { subject: {} } as ActionContext;
    dispatcher.repeatCommand(requests, undefined, remote);
    expect(callAction.mock.calls.map(([action]) => action.action)).toEqual([
      "climate.set_hvac_mode",
      "climate.set_temperature",
    ]);
    dispatcher.repeatCommand(requests, requests, remote);
    expect(callAction).toHaveBeenCalledTimes(2);
    dispatcher.repeatCommand(requests, undefined, {} as ActionContext);
    expect(callAction).toHaveBeenCalledTimes(2);
  });
});
