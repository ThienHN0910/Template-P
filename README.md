# Template-P

Template-P is the source repository for `@thienhn/create-template`, an interactive CLI that scaffolds full-stack monorepos from bundled blueprints and optional upstream integrations.

## Quick start

Template-P v2 requires Node.js 22.13 or later.

```bash
npx @thienhn/create-template my-app
```

Run the command without a project name to choose the name interactively. The npm CLI is the primary installation path; this engine repository is not a project to copy through GitHub's **Use this template** button.

## What the current v2 CLI offers

The v2 CLI offers these selectable families:

- Backends: .NET 8, Node.js, and FastAPI.
- Frontends: Vue, React, Next.js, and Nuxt.
- Databases: PostgreSQL, MySQL, SQLite, or no database.
- Package managers: pnpm, npm, and Bun.

It can scaffold from bundled blueprints and, when network access is allowed, use optional upstream frontend generators and dynamic AI-skill integrations. Offered combinations are not automatically production-verified; see the compatibility contract for the evidence boundary.

## Verified compatibility

The current full scaffold, install, and build CI matrix verifies only these blank-backend combinations from a packed CLI artifact with `--offline --no-ai`:

- Node.js / blank architecture / npm
- .NET 8 / blank architecture / pnpm
- FastAPI / blank architecture / npm

Other selectable v2 combinations are offered, but are not described as production-verified until they have equivalent evidence. See the [current v2 compatibility contract](docs/reference/compatibility.md).

## Interactive usage

```bash
npx @thienhn/create-template
```

The interactive flow asks for a project name, package manager, backend and architecture, database, frontend, IDE settings, and optional AI tooling. It performs a preflight check for the selected backend runtime and presents installation guidance when a required runtime is unavailable.

## Non-interactive usage

```bash
npx @thienhn/create-template my-app \
  --backend dotnet \
  --arch webapi-ddd \
  --frontend vue3 \
  --database postgres \
  --package-manager pnpm \
  --yes
```

See the [command reference](docs/reference/commands.md) and [automation guide](docs/getting-started/automation.md) for every current v2 option and default.

## Trust and network boundaries

Use `--offline --no-ai` to use bundled blueprints while avoiding upstream-generator and dynamic-skill downloads:

```bash
npx @thienhn/create-template my-app --offline --no-ai --yes
```

Remote `@latest` generators and dynamic skills are integration points whose output may change. Review third-party output, credentials, and deployment settings before production use. Template-P does not add telemetry to generated projects.

## Documentation

Start with the [documentation index](docs/README.md), then consult the installation, command, compatibility, and automation guides.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Report vulnerabilities according to [SECURITY.md](SECURITY.md), not through public issues. Community support options are in [SUPPORT.md](SUPPORT.md).

## v3 roadmap

The v3 capability architecture is [approved as a design specification](docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md). Its capability registry, lifecycle commands, expanded persistence contract, and support tiers are planned work; they are not shipped v2 behavior.

## License

[MIT](LICENSE) © 2026 ThienHN0910.
