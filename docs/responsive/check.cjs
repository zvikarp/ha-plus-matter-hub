const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(90000);
  const phase = process.argv[2];
  const bridge = {
    id: "fixture",
    name: "VeryLongBridgeNameWithoutSpaces".repeat(3),
    port: 5540,
    status: "running",
    deviceCount: 0,
    filter: {
      include: [
        { type: "entity", value: `sensor.${"long_entity_name".repeat(10)}` },
      ],
      exclude: [],
    },
    basicInformation: {},
    commissioning: {
      isCommissioned: false,
      passcode: 20202021,
      discriminator: 3840,
      manualPairingCode: "12345678901",
      qrPairingCode: `MT:${"ABCDEFGHIJKLMNOP".repeat(10)}`,
      fabrics: [],
    },
  };
  await page.route("**/api/matter/**", (r) =>
    r.fulfill({
      json: r.request().url().includes("/devices")
        ? {
            id: { local: "root", global: "root" },
            endpoint: 0,
            type: { name: "Root", id: 22 },
            state: {
              basicInformation: {
                nodeLabel: "LongDeviceName".repeat(10),
                uniqueId: "fixture_unique_identifier".repeat(10),
              },
            },
            parts: [],
          }
        : [bridge],
    }),
  );
  const results = [];
  for (const width of JSON.parse(
    process.env.VIEWPORTS || "[320,375,390,768,1440]",
  )) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/bridges", "/bridges/fixture", "/bridges/create"]) {
      await page.goto(
        (process.env.PREVIEW_URL || "http://127.0.0.1:5198") + route,
        { waitUntil: "commit", timeout: 90000 },
      );
      await page
        .getByRole(route.endsWith("bridges") ? "link" : "button", {
          name: route.endsWith("create")
            ? "Cancel"
            : route.endsWith("fixture")
              ? "Refresh now"
              : "Create new bridge",
          exact: true,
        })
        .waitFor();
      await page.waitForTimeout(100);
      results.push({
        width,
        route,
        ...(await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          viewport: innerWidth,
        }))),
      });
      await page.screenshot({
        path: `/tmp/matter-hub-responsive-matter-${phase}-${width}-${route.split("/").pop()}.png`,
        fullPage: true,
      });
    }
  }
  if (phase === "after") {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(
      `${process.env.PREVIEW_URL || "http://127.0.0.1:5198"}/bridges/fixture`,
      { waitUntil: "commit" },
    );
    await page.getByRole("button", { name: /More actions/ }).click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await page.getByRole("dialog").waitFor();
    await page.screenshot({
      path: "/tmp/matter-hub-responsive-matter-after-dialog-320.png",
    });
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.getByRole("button", { name: /More actions/ }).click();
    await page.keyboard.press("Escape");
    await page.goto(
      `${process.env.PREVIEW_URL || "http://127.0.0.1:5198"}/bridges/create`,
      { waitUntil: "commit" },
    );
    await page.getByRole("button", { name: "JSON editor" }).click();
    await page.locator(".cm-content").waitFor();
    await page.keyboard.press("Tab");
    await page.screenshot({
      path: "/tmp/matter-hub-responsive-matter-after-json-320.png",
    });
    await page.getByRole("button", { name: "Form editor" }).click();
    await page.getByRole("button", { name: "JSON editor" }).click();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    if ((await page.evaluate(() => document.documentElement.scrollWidth)) > 320)
      throw Error("zoom overflow");
    await page.screenshot({
      path: "/tmp/matter-hub-responsive-matter-after-zoom-320.png",
    });
  }
  if (phase === "after" && results.some((r) => r.scroll > r.viewport))
    throw Error("viewport overflow");
  fs.writeFileSync(
    `/tmp/matter-hub-responsive-matter-${phase}.json`,
    JSON.stringify(results, null, 2),
  );
  console.log(results);
  await browser.close();
})();
