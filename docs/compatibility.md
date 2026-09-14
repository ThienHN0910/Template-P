# Compatibility contract

The interactive CLI offers the combinations listed below. The current automated contract is
intentionally narrower than “every upstream latest release”: it verifies safe CLI input and
the generated root workspace metadata. Full scaffold → install → build verification is
tracked separately before a combination is promoted as production-supported.

## Current baseline

| Concern | Supported baseline |
| --- | --- |
| Node.js running the published CLI | 22.13 or newer |
| Node.js running repository checks | 22.13 or newer |
| CLI package manager | pnpm 11.15.1 in repository CI |
| Generated JavaScript workspace managers | pnpm, npm, Bun |
| Offered backend families | .NET, Node.js, FastAPI |
| Offered frontend families | Vue, React, Next.js, Nuxt |

The CI contract tests validate CLI input rules and generated workspace metadata without
network access. Upstream generators and dynamic skill installation are integration points
whose output can change; use them only with network access you trust. The wider scaffold →
install → build matrix is tracked in GitHub issue #3. It verifies Node/npm, .NET/pnpm, and
FastAPI/npm blank-backend combinations from a packed npm artifact with `--offline --no-ai`.

## Stability channels

- **Stable:** the published CLI, vendored fallback blueprints, and versions verified by CI.
- **Experimental:** remote `@latest` upstream generators and dynamically fetched skills.

Generated projects record no telemetry. Consumers remain responsible for reviewing
third-party code, credentials, and deployment settings before production use.
