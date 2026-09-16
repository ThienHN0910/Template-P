# Template-P

Template-P is the source repository for `@thienhn/create-template`, an interactive CLI and capability engine that scaffolds full-stack monorepos from verified blueprints and modular adapters.

## Quick start

Node.js 22.13 or later is required (Node.js 24 recommended).

```bash
npx @thienhn/create-template my-app
```

Run without a project name to choose it interactively.

## What the v3 CLI offers

The v3 CLI offers orthogonal full-stack capabilities:

- Backends: .NET 10 LTS, Node.js 24 LTS (Fastify/Express), and Python 3.13 FastAPI.
- Frontends: React 19 + Vite, Vue 3 + Vite, Next.js 15 App Router, Nuxt 3, or API-only mode (`none`).
- Persistence: PostgreSQL, Microsoft SQL Server, MySQL, SQLite, MongoDB, or none.
- Architectures: Clean Architecture / DDD, Modular Monolith, or Blank.
- Package managers: pnpm, npm, and Bun.

### Built-in Presets

- `dotnet-clean-react`: .NET 10 Clean Architecture with PostgreSQL and React 19
- `node-fastify-clean-vue`: Node.js Fastify Clean Architecture with PostgreSQL and Vue 3
- `fastapi-modular-react`: Python FastAPI Modular Architecture with PostgreSQL and React 19
- `dotnet-clean-api`: .NET 10 Clean Architecture API-only mode
- `node-express-clean-next`: Node.js Express Clean Architecture with MongoDB and Next.js 15
- `fastapi-modular-nuxt`: Python FastAPI Modular Architecture with SQLite and Nuxt 3

## Verified compatibility

Scaffold, install, and build CI evidence covers the combinations named in [`scaffold-matrix.yml`](https://github.com/ThienHN0910/Template-P/blob/main/.github/workflows/scaffold-matrix.yml) and the representative v3 preset matrix.

Read the [compatibility contract](https://github.com/ThienHN0910/Template-P/blob/main/docs/reference/compatibility.md) for the complete evidence and stability boundary.

## Interactive usage

```bash
npx @thienhn/create-template
```

The terminal flow collects project name, package manager, backend runtime, architecture, database, frontend framework, and optional AI-tooling choices.

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

The [command reference](https://github.com/ThienHN0910/Template-P/blob/main/docs/reference/commands.md) documents every flag and preset option.

## Trust and network boundaries

To avoid upstream-generator and dynamic-skill downloads, use bundled blueprints with:

```bash
npx @thienhn/create-template my-app --offline --no-ai --yes
```

Remote integrations can change independently of this package. Review generated third-party output and configuration before production use.

## Documentation

The [repository documentation index](https://github.com/ThienHN0910/Template-P/blob/main/docs/README.md) includes installation, automation, command, and migration guides.

## v3 architecture

The [approved v3 capability architecture](https://github.com/ThienHN0910/Template-P/blob/main/docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md) describes the verified capability engine and roadmap.

## License

[MIT](https://github.com/ThienHN0910/Template-P/blob/main/LICENSE) © 2026 ThienHN0910.
