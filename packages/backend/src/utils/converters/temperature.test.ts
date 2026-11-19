import { describe, expect, it } from "vitest";
import { Temperature } from "./temperature.js";

describe("temperature adjustments", () => {
  it.each([
    [Temperature.fahrenheit(68), 1, "°C", "°F", 69.8],
    [Temperature.celsius(20), -9, "°F", "°C", 15],
    [Temperature.kelvin(293.15), 2, "°C", "K", 295.15],
  ])("adds differences without converting them as absolute temperatures", (start, amount, unit, resultUnit, expected) => {
    expect(start?.plus(amount, unit).toUnit(resultUnit)).toBeCloseTo(expected);
  });
});
