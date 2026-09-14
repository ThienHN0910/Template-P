# 04: Verify the supported scaffold matrix

**What to build:** A release candidate proves representative advertised Template Blueprint
combinations through scaffold, dependency installation, build, and a backend health smoke
path.

**Blocked by:** 01: Enforce a safe CLI workspace contract; 02: Verify the CLI workspace contract.

**Status:** resolved

- [x] The matrix documents representative .NET, Node.js, and FastAPI combinations.
- [x] Each selected Scaffolded Project installs and builds with its selected package manager.
- [x] The packed npm artifact is installed in an empty directory and its executable is smoke-tested.

## Notes

Public tracking: GitHub issue #3.

## Answer

`.github/workflows/scaffold-matrix.yml` validates packed-artifact scaffolding with
`--offline --no-ai` for Node/blank/npm, .NET/blank/pnpm, and FastAPI/blank/npm. Every
entry installs the generated workspace, builds it, and calls its backend health endpoint.
The GitHub Actions run for PR #4 passed all three entries on 2026-09-14.
