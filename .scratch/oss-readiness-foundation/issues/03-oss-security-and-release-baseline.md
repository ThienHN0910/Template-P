# 03: Publish an OSS security and release baseline

**What to build:** Contributors and consumers have clear reporting/support/release guidance, and repository automation detects common dependency and code-security regressions.

**Blocked by:** 02: Verify the CLI workspace contract.

**Status:** resolved

- [x] Security and support policies give a clear public route for users and reporters.
- [x] Dependency update and review automation covers the CLI and GitHub Actions.
- [x] Workflows use immutable dependencies, minimal permissions, and a documented provenance migration path.

## Answer

The repository now has security, support, release, compatibility, and changelog documents;
Dependabot and dependency review; SHA-pinned actions with least privileges; and a documented
npm OIDC/provenance migration. GitHub Dependabot security updates and CodeQL default setup
were enabled through `gh`.
