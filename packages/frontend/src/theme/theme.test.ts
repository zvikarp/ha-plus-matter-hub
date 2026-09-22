import { describe, expect, it } from "vitest";
import { defaultHaTheme } from "./ha-theme.ts";
import { appTheme, createAppTheme } from "./theme.ts";

describe("appTheme", () => {
  it("can be created without a Home Assistant parent document", () => {
    expect(appTheme.palette.primary.main).toBe(defaultHaTheme.primary);
    expect(appTheme.palette.background.default).toBe(
      defaultHaTheme.backgroundDefault,
    );
  });

  it("uses the resolved Home Assistant colors and mode", () => {
    const theme = createAppTheme({
      ...defaultHaTheme,
      mode: "dark",
      textPrimary: "rgb(238, 238, 238)",
      backgroundDefault: "rgb(17, 17, 17)",
      backgroundPaper: "rgb(30, 30, 30)",
    });

    expect(theme.palette.mode).toBe("dark");
    expect(theme.palette.text.primary).toBe("rgb(238, 238, 238)");
    expect(theme.palette.background.default).toBe("rgb(17, 17, 17)");
    expect(theme.palette.background.paper).toBe("rgb(30, 30, 30)");
    expect(theme.shape.borderRadius).toBe(4);
    expect(theme.components?.MuiButton?.defaultProps?.disableElevation).toBe(
      true,
    );
  });
});
