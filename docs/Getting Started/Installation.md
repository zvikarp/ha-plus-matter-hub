# Installation

HA+ Matter Hub installs through the **Home Assistant Marketplace** as a custom
integration. The integration installs a pinned Node.js runtime and starts,
supervises, and stops the Matter engine inside the Home Assistant environment.
No Home Assistant App or separately managed server is required.

## Requirements

- Home Assistant **2026.11 or newer** on a supported 64-bit system (Linux x86-64
  or ARM64; the Node runtime also supplies macOS and Windows builds).
- IPv6, UDP, and mDNS connectivity between Home Assistant and Matter controllers.
- A long-lived access token for this Home Assistant instance. It is stored on the
  server and passed to the managed engine; it is never sent to the sidebar UI.

Home Assistant OS already supplies the host networking used by Core. For Home
Assistant Container, the Core container must have the network connectivity needed
for Matter, including multicast and IPv6.

## Install from Marketplace

1. Open **Settings → Marketplace**.
2. Open **Custom repositories** and add
   `https://github.com/zvikarp/ha-plus-matter-hub` as an **Integration**.
3. Install **HA+ Matter Hub**, then restart Home Assistant if prompted.
4. Open **Settings → Devices & services → Add integration** and search for
   **HA+ Matter Hub**.
5. Enter a URL at which this Home Assistant instance is reachable from Core and
   a long-lived access token. For a local HTTP installation,
   `http://127.0.0.1:8123` is suitable. Use the configured HTTPS URL when Core
   serves HTTPS directly.
6. Open **HA+ Matter Hub** in the sidebar to configure bridges and pair your
   Matter controllers. The sidebar and management API are restricted to admins.

This is a **custom repository** installation; it does not claim inclusion in the
default Marketplace catalog. Marketplace still requires the compatibility
filename `hacs.json`, which this repository supplies. Releases attach
`ha_plus_matter_hub.zip`, containing the integration, UI, and locked JavaScript
dependencies. Nothing runs npm or downloads the hub engine during setup.

Create the access token from your Home Assistant profile's **Security →
Long-lived access tokens** section. Use an account with the permissions needed
for the entities you expose. To replace a revoked token, remove and add the
integration again; the engine's stored bridge identities are preserved.

## Migrate an existing App installation

The App/container distribution is retired in this branch. Do not run the old
App and the new integration at the same time with the same bridge identities.

1. Back up the old App's configuration and data before changing it.
2. Stop the old App and disable automatic startup. Keep it installed until the
   migration is verified.
3. Copy the **contents** of the old App's `/config/data` directory into
   `<Home Assistant config>/.storage/ha_plus_matter_hub/` **before** setting up the
   integration. The App's public configuration directory is normally under
   `/addon_configs/<repository>_ha-plus-matter-hub/data` on the host. Copy all files
   and subdirectories, including hidden files, with the engine stopped. The
   integration does not require or read the old Supervisor token.
4. Set up the integration with a Home Assistant access token, then verify that
   your existing bridges and pairings work before removing the old App.

The entire engine storage directory is needed to retain Matter identities,
fabrics, and pairings. Copying bridge filter settings alone is insufficient.
The integration never deletes engine storage when unloaded or removed. Restoring
the backup and restarting the old App (with the integration stopped) is the
rollback path. No migration is performed automatically.

## Development and testing

For a test package without publishing a release, run **Build Marketplace test
package** from GitHub Actions on your development branch. Download the
`marketplace-integration` artifact and extract `ha_plus_matter_hub.zip` from it.
With Home Assistant stopped, extract the contents of that inner ZIP into
`custom_components/ha_plus_matter_hub/`, then start Home Assistant and add the
integration. Use a separate test Home Assistant instance and independent bridge
storage when testing alongside production.

To build the same package locally:

```sh
pnpm install --frozen-lockfile
pnpm build
python3 scripts/package-marketplace.py
```

The generated ZIP can be installed with the same manual extraction procedure.
The build also populates `custom_components/ha_plus_matter_hub/runtime/` for local
integration development. These generated files are not committed. A raw source
checkout without the build output cannot start the hub.

Run integration checks with Python 3.14:

```sh
python3.14 -m venv .venv
.venv/bin/pip install -r requirements-test.txt
.venv/bin/python -m pytest
```

Updating the integration replaces its code and bundled engine; it preserves
storage under `.storage/ha_plus_matter_hub`. Restart Home Assistant after Python
or dependency changes. Reloading the integration restarts the managed engine but
does not reload Python modules; refresh the browser after frontend changes.

For Marketplace-managed beta testing, publish a pre-release from the `beta`
branch with the **Release** workflow and enable the repository's **Pre-release**
switch in Marketplace. The normal `main` release publishes the stable integration
ZIP. The branch test-package workflow above does not publish a release.
