# Release Notes

## 15.0.2 — 2026-10-30

### Added

- Added safe operation debug records through `@eliware/log`.

### Changed

- Updated runtime dependencies to `@eliware/log` 15.0.1 and `jose` 6.2.14.

### Fixed

- Reject ID Tokens when `exp` is at or before the current time. Ignore clock tolerance for expiration.

## 15.0.1 — 2026-10-28

### Added

Initial baseline for the EliD server-side OAuth and OpenID Connect client package.
