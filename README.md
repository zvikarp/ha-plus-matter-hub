# HA+ Matter Hub

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/hamh-logo-small-dark.png">
  <img src="./docs/assets/hamh-logo-small.png" alt="HA+ Matter Hub" width="140">
</picture>

---

> [!NOTE]
> 💙 **Special Thanks to the Original Developers**
>
> This project is a community fork of [home-assistant-matter-hub](https://github.com/t0bst4r/home-assistant-matter-hub) 
> originally created and maintained by **[t0bst4r](https://github.com/t0bst4r)**.
>
> All credit for the original development, architecture, and vision goes to t0bst4r and the original contributors. 
> Their outstanding work made this Matter bridge possible, and we are deeply grateful for their contribution to the 
> Home Assistant community.
>
> The original repository was archived in January 2026. This fork aims to continue the project with community 
> maintenance and support.
>
> **Thank you, t0bst4r! 🙏**

---

## About

This project simulates bridges to publish your entities from Home Assistant to any Matter-compatible controller like
Alexa, Apple Home or Google Home. Using Matter, those can be connected easily using local communication without the need
of port forwarding etc.

---

## Installation

Install **HA+ Matter Hub** through **Settings → Marketplace** in Home Assistant
2026.11 or newer. Add this repository as a custom **Integration** repository,
install it, and add HA+ Matter Hub under **Devices & services**. The integration
manages the Matter engine and provides an admin sidebar panel; no HA App is needed.

See the [installation and App migration guide](./docs/Getting%20Started/Installation.md)
before moving an existing paired bridge. **CI** produces a complete installable
ZIP for branch testing.

## Releases

Like HA+ Modes, this repository has only **CI** and **Release** workflows.
Run **Actions → Release** from `main` and choose **patch**, **minor**, or **major**.
Release runs CI, prepares a stable version, commits the integration/engine/runtime
version updates, builds the complete `ha_plus_matter_hub.zip`, and publishes a
GitHub Release with generated notes for Marketplace/HACS updates. A source
version already ahead of the latest stable release is released first; otherwise
the selected bump applies to the latest stable release. Drafts and prereleases
are excluded from stable version selection.

Publishing a release manually runs CI and attaches the archive built from its tag;
the tag must match the integration version. Merging code never publishes a
release automatically. There is no separate test-package, semantic-release, or
Pages publishing workflow.

## Documentation

Please see the [documentation](https://zvikarp.github.io/ha-plus-matter-hub) for installation instructions,
known issues, limitations and guides.

---

## Contributing

We welcome contributions from the community! Here's how you can help:

### Reporting Issues
- Check existing [issues](https://github.com/zvikarp/ha-plus-matter-hub/issues) before creating a new one
- Provide detailed information about your environment and steps to reproduce
- Include relevant logs and error messages

### Contributing Code
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Run tests and linting: `pnpm lint` and `pnpm test`
5. Commit your changes with clear, descriptive messages
6. Push to your fork and submit a pull request

### Development Setup
```bash
# Clone the repository
git clone https://github.com/zvikarp/ha-plus-matter-hub.git
cd ha-plus-matter-hub

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run in development mode
pnpm serve
```

For more detailed development information, see the [Developer Documentation](./docs/Developer%20Documentation/README.md).

---

## Shared UI development

The frontend consumes `@ha-plus/ui/mui` for HA theme overrides and shared
presentation styles, and `@ha-plus/ui/ha-theme` for iframe theme synchronization.
Keep presentation definitions in the shared package. React components compose
its exported styles while retaining application data, layout components and
behavior. The sidebar wrapper source is `src/panel.js` and uses the shared
`iframePanelStyles`. Run `pnpm run build:panel` after changing it and commit the
generated integration file. `pnpm run check:panel` verifies reproducibility.

The versioned package is bundled into the HACS release, including the engine
frontend. Users do not need a separate shared integration or browser CDN.
