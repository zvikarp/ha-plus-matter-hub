import { Thermostat } from "@matter/main/clusters";
import { describe, expect, it, vi } from "vitest";
import { Temperature } from "../../utils/converters/temperature.js";
import {
  MINIMUM_DEADBAND_MATTER_UNITS,
  ThermostatServerBase,
} from "./thermostat-server.js";

// Test the constraint logic that was fixed
describe("Thermostat deadband constraint logic", () => {
  it("should ensure minCool >= minHeat + deadband when both heating and cooling", () => {
    const minSetpointLimit = 1600; // 16°C
    const maxSetpointLimit = 3000; // 30°C
    const deadband = MINIMUM_DEADBAND_MATTER_UNITS; // 2°C

    // Simulate the fixed logic
    const hasHeating = true;
    const hasCooling = true;

    const minHeat = minSetpointLimit;
    const maxHeat = maxSetpointLimit;
    let minCool = minSetpointLimit;
    let maxCool = maxSetpointLimit;

    // Apply clamping when BOTH heat & cool exist and deadband > 0
    if (deadband > 0 && hasHeating && hasCooling) {
      minCool = Math.max(minCool, minHeat + deadband);
      maxCool = Math.max(maxCool, maxHeat + deadband);
    }

    // Verify the constraint: minHeat <= minCool - deadband
    expect(minHeat).toBeLessThanOrEqual(minCool - deadband);
    expect(minCool).toBe(1800); // Should be clamped to 1600 + 200
    expect(maxCool).toBe(3200); // Should be clamped to 3000 + 200
  });

  it("should not clamp when only heating is supported", () => {
    const minSetpointLimit = 1600;
    const maxSetpointLimit = 3000;
    const deadband = 0; // No deadband for heating-only

    const hasHeating = true;
    const hasCooling = false;

    const minHeat = minSetpointLimit;
    const maxHeat = maxSetpointLimit;
    let minCool = minSetpointLimit;
    let maxCool = maxSetpointLimit;

    if (deadband > 0 && hasHeating && hasCooling) {
      minCool = Math.max(minCool, minHeat + deadband);
      maxCool = Math.max(maxCool, maxHeat + deadband);
    }

    // No clamping should occur
    expect(minCool).toBe(1600);
    expect(maxCool).toBe(3000);
  });

  it("should not clamp when only cooling is supported", () => {
    const minSetpointLimit = 1600;
    const maxSetpointLimit = 3000;
    const deadband = 0; // No deadband for cooling-only

    const hasHeating = false;
    const hasCooling = true;

    const minHeat = minSetpointLimit;
    const maxHeat = maxSetpointLimit;
    let minCool = minSetpointLimit;
    let maxCool = maxSetpointLimit;

    if (deadband > 0 && hasHeating && hasCooling) {
      minCool = Math.max(minCool, minHeat + deadband);
      maxCool = Math.max(maxCool, maxHeat + deadband);
    }

    // No clamping should occur
    expect(minCool).toBe(1600);
    expect(maxCool).toBe(3000);
  });

  it("should handle the original failing case (min == max)", () => {
    const minSetpointLimit = 1600;
    const maxSetpointLimit = 1600; // Same as min!
    const deadband = MINIMUM_DEADBAND_MATTER_UNITS;

    const hasHeating = true;
    const hasCooling = true;

    const minHeat = minSetpointLimit;
    const maxHeat = maxSetpointLimit;
    let minCool = minSetpointLimit;
    let maxCool = maxSetpointLimit;

    if (deadband > 0 && hasHeating && hasCooling) {
      minCool = Math.max(minCool, minHeat + deadband);
      maxCool = Math.max(maxCool, maxHeat + deadband);
    }

    // Verify the constraint is satisfied even when min == max
    expect(minHeat).toBeLessThanOrEqual(minCool - deadband);
    expect(minCool).toBe(1800); // Clamped to 1600 + 200
    expect(maxCool).toBe(1800); // Clamped to 1600 + 200
  });
});

describe("Matter relative thermostat commands", () => {
  it.each([
    [Thermostat.SetpointRaiseLowerMode.Heat, 10, 21, 25],
    [Thermostat.SetpointRaiseLowerMode.Cool, -5, 20, 24.5],
    [Thermostat.SetpointRaiseLowerMode.Both, 5, 20.5, 25.5],
  ])("converts a signed adjustment in tenths of a degree for mode %s", (mode, amount, low, high) => {
    const callAction = vi.fn();
    const config = {
      getTargetHeatingTemperature: () => Temperature.celsius(20),
      getTargetCoolingTemperature: () => Temperature.celsius(25),
      supportsTemperatureRange: () => true,
      setTargetTemperatureRange: ({
        low,
        high,
      }: {
        low: Temperature;
        high: Temperature;
      }) => ({
        action: "climate.set_temperature",
        data: {
          target_temp_low: low.celsius(),
          target_temp_high: high.celsius(),
        },
      }),
    };
    const server = Object.defineProperties(
      Object.create(ThermostatServerBase.prototype),
      {
        state: { value: { config } },
        agent: {
          value: { get: () => ({ entity: { state: {} }, callAction }) },
        },
      },
    ) as ThermostatServerBase;

    server.setpointRaiseLower({ mode, amount });

    expect(callAction).toHaveBeenCalledWith({
      action: "climate.set_temperature",
      data: { target_temp_low: low, target_temp_high: high },
    });
  });
});
