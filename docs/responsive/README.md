Matter Hub responsive evidence
==============================

Long bridge names expanded a 320px detail page to 1733px. Heading/card/breadcrumb
flex sizing, metadata/pairing codes, filter chips, device names/group headings,
state tables and confirmation text now wrap within the available width. Mobile
buttons and icon buttons have 44px targets; the JSON editor toggle has an explicit
accessible name. Desktop theme sizes and existing responsive grids remain intact.

Screenshots: [before at 320px](before-320.png), [after](after-320.png),
[cancelable confirmation dialog](dialog-320.png). Fixtures use artificial long
unbroken bridge/filter/device values; QR codes and bridge data are synthetic.

The [results](results.json) cover /bridges, /bridges/fixture and /bridges/create
at 320/375/390/768/1440px, with page width equal to viewport width in all 15 cases.
Menus open repeatedly and close with Escape, deleting is canceled, and JSON/form
modes toggle repeatedly. The supplemental 320px check doubles root font size.
All API responses are local fixtures; real authenticated HA ingress, device
control, saving/reset/deleting bridges and controller pairing remain unvalidated.

Reproduce with an installed Playwright and Chromium:

```sh
npm run build --workspace=@ha-plus-matter-hub/common
npm run dev --workspace=@ha-plus-matter-hub/frontend -- --host 127.0.0.1 --port 5198
node docs/responsive/check.cjs after
```

PLAYWRIGHT_MODULE, CHROMIUM_PATH and PREVIEW_URL can override local paths;
VIEWPORTS can be a JSON array to restrict a focused rerun. Outputs go to /tmp.

Validation: root Biome lint, frontend TypeScript build/check, 6 frontend tests,
70 common tests (35 source plus 35 compiled), and 58 backend tests pass. The Vite
production frontend build was killed twice by the OS (exit 137), including a
1024MB heap cap, during multiple concurrent product builds in this cloud
workspace. Production bundling and the full docs/app/package build remain blocked
by environment resources; this draft does not claim they passed. No dependency,
workflow, coverage, budget or release configuration changes are included. Release
workflow is manually dispatched; no merge-trigger deployment found in workflows.
