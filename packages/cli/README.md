# Template-P

Template-P is the source repository for `@thienhn/create-template`, an interactive CLI that scaffolds full-stack monorepos from bundled blueprints and optional upstream integrations.

## Quick start

Node.js 22.13 or later is required.

```bash
npx @thienhn/create-template my-app
```

Run without a project name to choose it interactively.

## What the current v2 CLI offers

The v2 CLI offers .NET 8, Node.js, and FastAPI backends; Vue, React, Next.js, and Nuxt frontends; and PostgreSQL, MySQL, SQLite, or no database. It also supports pnpm, npm, and Bun for generated JavaScript workspaces.

Bundled blueprints are always available. Upstream frontend generators and dynamic AI-skill integrations are optional network integrations.

## Verified compatibility

Full scaffold, install, and build CI evidence is limited to the combinations named in [`scaffold-matrix.yml`](https://github.com/ThienHN0910/Template-P/blob/main/.github/workflows/scaffold-matrix.yml): Node.js blank with npm, .NET blank with pnpm, and FastAPI blank with npm. Other selectable combinations are offered but are not production-verified by that matrix.

Read the [current v2 compatibility contract](https://github.com/ThienHN0910/Template-P/blob/main/docs/reference/compatibility.md) for the complete evidence and stability boundary.

## Interactive usage

```bash
npx @thienhn/create-template
```

The terminal flow collects the project, package manager, backend, architecture, database, frontend, IDE, and optional AI-tooling choices. It checks the selected backend runtime before scaffolding.

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

The [command reference](https://github.com/ThienHN0910/Template-P/blob/main/docs/reference/commands.md) documents the exact current v2 flags.

## Trust and network boundaries

To avoid upstream-generator and dynamic-skill downloads, use bundled blueprints with:

```bash
npx @thienhn/create-template my-app --offline --no-ai --yes
```

Remote integrations can change independently of this package. Review generated third-party output and configuration before production use.

## Documentation

The [repository documentation index](https://github.com/ThienHN0910/Template-P/blob/main/docs/README.md) includes installation, automation, command, and compatibility guides.

## v3 roadmap

The [approved v3 capability architecture](https://github.com/ThienHN0910/Template-P/blob/main/docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md) describes planned work. It is not shipped v2 behavior.

## License

[MIT](https://github.com/ThienHN0910/Template-P/blob/main/LICENSE) © 2026 ThienHN0910.
