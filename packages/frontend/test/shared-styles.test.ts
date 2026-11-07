import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createAppTheme, muiStyles } from "@ha-plus/ui/mui";
import { describe, expect, it } from "vitest";
import { appTheme } from "../src/theme/theme.ts";

// Keep feature components from silently reintroducing app-local style definitions.
describe("shared UI ownership", () => {
  it("uses shared definitions for every React style override", () => {
    const root = resolve(import.meta.dirname, "../src");
    const files = readdirSync(root, { recursive: true }).filter((file) =>
      String(file).endsWith(".tsx"),
    );
    for (const file of files) {
      const source = readFileSync(resolve(root, String(file)), "utf8");
      expect(source, String(file)).not.toMatch(/\b(?:sx|style|styles)=\{\s*\{/);
      expect(source, String(file)).not.toMatch(/\bstyled\(/);
    }
    expect(appTheme).toBeDefined();
    expect(createAppTheme).toBeTypeOf("function");
    expect(muiStyles.iconAction).toEqual({
      flexShrink: 0,
      width: 44,
      height: 44,
    });
  });
});
