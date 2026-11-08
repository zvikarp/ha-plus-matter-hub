import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AppPage } from "./AppPage.tsx";

vi.mock("../hooks/data/bridges.ts", () => ({
  useBridges: () => ({
    content: [
      { id: "living", name: "Living room", deviceCount: 4 },
      { id: "bedroom", name: "Bedroom", deviceCount: 2 },
    ],
  }),
}));
vi.mock("../state/hooks.ts", () => ({ useAppDispatch: () => vi.fn() }));
vi.mock("../hooks/app-info.ts", () => ({
  useAppInfo: () => ({ version: "1.2.5" }),
}));
vi.mock("../routes.tsx", () => ({
  navigation: {
    bridge: (id: string) => `/bridges/${id}`,
    createBridge: "/bridges/create",
    githubRepository: "https://github.com/zvikarp/ha-plus-matter-hub",
    documentation: "https://example.com/docs",
  },
}));

function render(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppPage />}>
          <Route path="/bridges/:bridgeId" element={<p>Bridge view</p>} />
          <Route
            path="/bridges/:bridgeId/edit"
            element={<p>Bridge editor</p>}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("bridge collection layout", () => {
  it("lists bridges, selects the current route and places creation at the bottom of navigation", () => {
    const html = render("/bridges/bedroom");
    expect(html).toContain("Living room");
    expect(html).toMatch(/aria-current="page"[^>]*href="\/bridges\/bedroom"/);
    expect(html).toMatch(/ha-plus-collection-create[\s\S]*Create New Bridge/);
    expect(html).toContain("Bridge view");
  });
  it("retains bridge navigation while editing and puts the versioned footer in the content column", () => {
    const html = render("/bridges/bedroom/edit");
    expect(html).toMatch(/aria-current="page"[^>]*href="\/bridges\/bedroom"/);
    expect(html).toMatch(
      /ha-plus-collection-body[\s\S]*<main[^>]*>.*Bridge editor.*<\/main>[\s\S]*<footer/,
    );
    expect(html).toContain("v1.2.5");
    expect(html).not.toContain("MuiBreadcrumbs");
  });
});
