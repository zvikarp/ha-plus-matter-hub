# Changelog

## Unreleased

### Added

- Searchable exposed-device management grouped by Home Assistant area and readable Matter device type, with immediate device details and manual refresh.
- Friendly loading, empty, error, retry, and not-found states throughout the bridge experience.
- Confirmation dialogs explaining the consequences of factory-resetting or deleting a bridge.
- A recovery screen for unexpected interface rendering failures.

### Fixed

- Restored frontend startup after Home Assistant theme synchronization introduced unsupported palette color values.
- API failures now surface as actionable errors instead of being treated as successful responses.
- Documentation and source links now point to the maintained HA Plus Matter Hub fork.
- Releases now publish versioned GitHub and GHCR artifacts without depending on npm publishing.
- Release jobs verify that Home Assistant can pull published GHCR images without credentials.
- Light and dark documentation branding now use the same finalized Matter Hub icon.
