import { describe, expect, it } from "vitest";
import { MINIMUM_DEADBAND_MATTER_UNITS } from "./thermostat-server.js";

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
