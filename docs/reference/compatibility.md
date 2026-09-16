# Current v2 compatibility contract

The interactive CLI offers the combinations listed below. The automated contract is intentionally narrower than every upstream latest release: it verifies safe CLI input and generated root-workspace metadata. Full scaffold -> install -> build verification is required before a combination is described as production-verified.

## Current baseline

| Concern | Current v2 baseline |
| --- | --- |
| Node.js running the published CLI | 22.13 or later |
| Node.js running repository checks | 22.13 or later |
| CLI package manager in repository CI | pnpm 11.15.1 |
| Generated JavaScript workspace managers | pnpm, npm, Bun |
| Offered backend families | .NET 8, Node.js, FastAPI |
| Offered frontend families | Vue, React, Next.js, Nuxt |
| Offered databases | PostgreSQL, MySQL, SQLite, none |

The CLI contract tests validate input rules and generated workspace metadata without network access. Upstream generators and dynamic-skill installation are integrations whose output can change; use them only with network access you trust.

## Full scaffold, install, and build evidence

[`scaffold-matrix.yml`](../../.github/workflows/scaffold-matrix.yml) runs a packed-artifact smoke workflow with `--offline --no-ai` for these combinations:

| Backend | Architecture | Package manager |
| --- | --- | --- |
| Node.js | `blank` | npm |
| .NET 8 | `blank` | pnpm |
| FastAPI | `blank` | npm |

These are the only current combinations with the repository's full scaffold, install, and build CI evidence. All other selectable combinations are offered v2 behavior, but are not production-verified by this matrix.

## Stability channels

- **Current and bundled:** the published CLI and vendored fallback blueprints.
- **Verified by the full matrix:** only the combinations listed above.
- **Experimental integration points:** remote `@latest` upstream generators and dynamically fetched skills.
- **Planned:** the v3 support-tier and capability model in the [approved design specification](../superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md); it is not shipped v2 behavior.

Generated projects record no telemetry. Consumers remain responsible for reviewing third-party code, credentials, and deployment settings before production use.
