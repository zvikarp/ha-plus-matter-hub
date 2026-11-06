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
before moving an existing paired bridge. For branch testing, the **Build
Marketplace test package** workflow produces a complete installable ZIP.

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
