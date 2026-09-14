# Changelog

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and uses
semantic versioning for the published CLI.

## Unreleased

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
