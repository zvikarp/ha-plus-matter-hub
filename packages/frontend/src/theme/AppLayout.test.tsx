import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AppLayout } from "./AppLayout.tsx";
import { AppLogo } from "./AppLogo.tsx";

vi.mock("../routes.tsx", () => ({
  navigation: {
    bridges: "/",
    githubRepository: "https://github.com/zvikarp/ha-plus-matter-hub",
    documentation: "/docs",
  },
}));

function renderLayout(embedded: boolean) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <AppLayout embedded={embedded} />
    </MemoryRouter>,
  );
}

describe("Matter Hub branding and embedded layout", () => {
  it("renders the display name with the plus symbol and colorful logo", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <AppLogo large />
      </MemoryRouter>,
    );
    expect(html).toContain("HA+ Matter Hub");
    expect(html).toContain("hamh-logo.png");
    expect(html).not.toContain("monochrome");
    expect(html).not.toContain("Ha-Plus-Matter-Hub");
  });

  it("renders one app header in standalone mode", () => {
    expect(renderLayout(false)).toContain("MuiAppBar-root");
  });

  it("leaves branding and navigation to the HA wrapper when embedded", () => {
    const html = renderLayout(true);
    expect(html).not.toContain("MuiAppBar-root");
    expect(html).not.toContain("MuiToolbar-root");
    expect(html).not.toContain("HA+ Matter Hub");
  });
});
