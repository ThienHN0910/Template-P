# Changelog

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and uses
semantic versioning for the published CLI.

## Unreleased

### Added

- Added automated first-party language and encoding checks.
- Added an English documentation index, current v2 command reference, verification guide, and GitHub maintenance guide.

### Changed

- Standardized first-party repository, CLI, generated default-locale, and GitHub contribution text in professional English.
- Repositioned the repository as the source for the CLI-first `@thienhn/create-template` package and documented the approved v3 architecture separately from shipped v2 behavior.
- Disabled the engine repository's GitHub Template and Wiki features, enabled merged-branch cleanup, and added v3 delivery milestones.

### Fixed

- Removed mojibake from terminal messages, documentation, issue forms, and generated Vue localization while preserving valid optional Vietnamese translations.

## 2.0.1 - 2026-09-15

### Fixed

- Pinned the patched esbuild 0.28.2 across the development toolchain to address GHSA-g7r4-m6w7-qqqr.

### Changed

- Updated the release workflow to Node.js 24 and npm 11 for OIDC trusted publishing.

## 2.0.0 - 2026-09-14

### Changed

- **Breaking:** the published CLI now requires Node.js 22.13 or newer (previously 20.19).
- Updated CLI dependencies, including Clack 1.8, Commander 15, and execa 10, and refreshed the TypeScript 7 and Vitest 5 development toolchain.
- Added a verified CLI input and generated-workspace compatibility contract.
- Added OSS security, support, dependency-review, and release-provenance guidance.
- Added CI smoke tests that install and build generated Node/npm, .NET/pnpm, and FastAPI/npm projects from the packed CLI.

## 1.0.0 - 2026-09-13

### Added

- Initial public release of `@thienhn/create-template`.
