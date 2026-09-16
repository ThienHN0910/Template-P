# Template-P

Template-P is the source repository for `@thienhn/create-template`, an interactive CLI and capability engine that scaffolds full-stack monorepos from verified blueprints and modular adapters.

## Quick start

Template-P requires Node.js 22.13 or later (Node.js 24 recommended).

```bash
npx @thienhn/create-template my-app
```

Run the command without a project name to choose the name interactively. The npm CLI is the primary installation path; this engine repository is not a project to copy through GitHub's **Use this template** button.

## What the v3 CLI offers

The v3 CLI offers orthogonal full-stack capabilities:

- Backends: .NET 10 LTS, Node.js 24 LTS (Fastify/Express), and Python 3.13 FastAPI.
- Frontends: React 19 + Vite, Vue 3 + Vite, Next.js 15 App Router, Nuxt 3, or API-only mode (`none`).
- Persistence: PostgreSQL, Microsoft SQL Server, MySQL, SQLite, MongoDB, or none.
- Architectures: Clean Architecture / DDD, Modular Monolith, or Blank.
- Package managers: pnpm, npm, and Bun.

### Built-in Presets

Template-P provides normative presets for rapid scaffolding:

- `dotnet-clean-react`: .NET 10 Clean Architecture with PostgreSQL and React 19
- `node-fastify-clean-vue`: Node.js Fastify Clean Architecture with PostgreSQL and Vue 3
- `fastapi-modular-react`: Python FastAPI Modular Architecture with PostgreSQL and React 19
- `dotnet-clean-api`: .NET 10 Clean Architecture API-only mode
- `node-express-clean-next`: Node.js Express Clean Architecture with MongoDB and Next.js 15
- `fastapi-modular-nuxt`: Python FastAPI Modular Architecture with SQLite and Nuxt 3

For migration from v2, see the [v2 to v3 migration guide](docs/guides/v2-to-v3-migration.md).

## Interactive usage

```bash
npx @thienhn/create-template
```

The interactive flow asks for a project name, package manager, backend runtime, architecture, database, frontend framework, and optional AI tooling.

## Non-interactive usage

```bash
npx @thienhn/create-template my-app \
  --backend dotnet \
  --arch webapi-ddd \
  --frontend react \
  --database postgres \
  --package-manager pnpm \
  --yes
```

See the [command reference](docs/reference/commands.md) and [automation guide](docs/getting-started/automation.md) for every option and default.

## Trust and network boundaries

Use `--offline --no-ai` to use bundled blueprints while avoiding upstream-generator and dynamic-skill downloads:

```bash
npx @thienhn/create-template my-app --offline --no-ai --yes
```

Remote integrations and dynamic skills are optional. Template-P does not add telemetry to generated projects.

## Documentation

Start with the [documentation index](docs/README.md), then consult the installation, command, compatibility, and migration guides.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Report vulnerabilities according to [SECURITY.md](SECURITY.md), not through public issues. Community support options are in [SUPPORT.md](SUPPORT.md).

## v3 architecture

The v3 capability architecture is detailed in the [design specification](docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md).

## License

[MIT](LICENSE) © 2026 ThienHN0910.
