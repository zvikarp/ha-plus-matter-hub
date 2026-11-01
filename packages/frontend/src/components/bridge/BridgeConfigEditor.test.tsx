import {
  bridgeConfigSchema,
  repeatCommandDefaults,
} from "@ha-plus-matter-hub/common";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FormEditor } from "../misc/editors/FormEditor.tsx";

function render(repeatCommands?: object) {
  return renderToStaticMarkup(
    <FormEditor
      schema={bridgeConfigSchema}
      value={{
        name: "Home",
        port: 5540,
        filter: { include: [], exclude: [] },
        ...(repeatCommands ? { repeatCommands } : {}),
      }}
      onChange={() => {}}
    />,
  );
}

describe("bridge repeat command configuration", () => {
  it("renders every category with the existing default for older bridges", () => {
    const html = render();
    expect(html).toContain("Repeat matching commands");
    for (const [category, enabled] of Object.entries(repeatCommandDefaults)) {
      const input = html.match(
        new RegExp(`<input[^>]*id="root_repeatCommands_${category}"[^>]*>`),
      )?.[0];
      expect(input, category).toBeDefined();
      expect(input?.includes('checked=""'), category).toBe(enabled);
    }
  });

  it("renders saved overrides rather than resetting them to defaults", () => {
    const html = render({ shades: true, onOff: false });
    expect(
      html.match(/<input[^>]*id="root_repeatCommands_shades"[^>]*>/)?.[0],
    ).toContain('checked=""');
    expect(
      html.match(/<input[^>]*id="root_repeatCommands_onOff"[^>]*>/)?.[0],
    ).not.toContain('checked=""');
  });
});
