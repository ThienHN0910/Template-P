# Compatibility contract

`@thienhn/create-template` supports the combinations presented by its interactive CLI.
The contract is intentionally narrower than “every upstream latest release”: a supported
combination must scaffold into a contained new directory and expose working root scripts
for its selected package manager.

## Current baseline

| Concern | Supported baseline |
| --- | --- |
| Node.js running the CLI | 18 or newer |
| CLI package manager | pnpm 11.15.1 in repository CI |
| Generated JavaScript workspace managers | pnpm, npm, Bun |
| Backend families | .NET, Node.js, FastAPI |
| Frontend families | Vue, React, Next.js, Nuxt |

The CI contract tests validate CLI input rules and generated workspace metadata without
network access. Upstream generators and dynamic skill installation are integration points
whose output can change; use them only with network access you trust. A wider scaffold →
install → build matrix is tracked in GitHub issue #2 before any new blueprint is advertised
as supported.

## Stability channels

- **Stable:** the published CLI, vendored fallback blueprints, and versions verified by CI.
- **Experimental:** remote `@latest` upstream generators and dynamically fetched skills.

Generated projects record no telemetry. Consumers remain responsible for reviewing
third-party code, credentials, and deployment settings before production use.
