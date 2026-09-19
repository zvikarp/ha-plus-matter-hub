import { describe, expect, it } from "vitest";
import { appTheme } from "./theme.ts";

describe("appTheme", () => {
  it("can be created without a Home Assistant parent document", () => {
    expect(appTheme.palette.primary.main).toBe("#03a9f4");
    expect(appTheme.palette.background.default).toBe("#fafafa");
  });
});
