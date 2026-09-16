# Migrating from Template-P v2 to v3

This guide explains the architectural changes introduced in Template-P v3.0.0 and how to transition configuration, commands, and project scaffolding workflows.

## Key Changes in v3.0.0

Template-P v3 replaces hardcoded template folder combinations with a deterministic **Capability Engine**:

1. **Orthogonal Dimensions**:
   In v2, framework and architecture were often combined into compound options (for example, `webapi-ddd`). In v3, backend runtime, architecture, database adapter, and frontend are independent:
   - Backend runtimes: `.NET 10`, `Node.js 24 LTS`, `Python 3.13`
   - Architectures: Clean Architecture / DDD, Modular Monolith, Blank
   - Persistence: PostgreSQL, SQL Server, MySQL, SQLite, MongoDB
   - Frontends: React 19 + Vite, Vue 3 + Vite, Next.js 15 App Router, Nuxt 3, or API-only (`none`)

2. **Standard Presets**:
   v3 introduces six normative built-in presets for streamlined initialization:
   - `dotnet-clean-react`: .NET 10 Clean Architecture with PostgreSQL and React 19
   - `node-fastify-clean-vue`: Node.js Fastify Clean Architecture with PostgreSQL and Vue 3
   - `fastapi-modular-react`: Python FastAPI Modular Architecture with PostgreSQL and React 19
   - `dotnet-clean-api`: .NET 10 Clean Architecture API-only (no frontend)
   - `node-express-clean-next`: Node.js Express Clean Architecture with MongoDB and Next.js 15
   - `fastapi-modular-nuxt`: Python FastAPI Modular Architecture with SQLite and Nuxt 3

3. **Strict API-Only Mode**:
   When configuring a project without a frontend (`frontend: 'none'` or preset `dotnet-clean-api`), Template-P v3 strictly omits `apps/frontend`, `packages/api-client`, and frontend-specific root scripts (`api:sync`), leaving a lightweight, pure backend repository.

4. **Project Manifest (`.template-p/manifest.json`)**:
   Every generated workspace includes a credential-free project manifest detailing:
   - Generator version (`3.0.0`)
   - Schema version (`1`)
   - Verified support tier (`verified`)
   - Resolved capability IDs

## Command Compatibility

v3 CLI maintains backward compatibility with v2 command-line flags while normalizing arguments into the v3 capability model:

```bash
# v2-style invocation continues to be normalized transparently:
npx @thienhn/create-template my-app \
  --backend dotnet \
  --arch webapi-ddd \
  --frontend react \
  --database postgres \
  --yes
```

To scaffold using a v3 preset:

```bash
npx @thienhn/create-template my-app --preset dotnet-clean-react
```

## Security & Secrets Policy

Template-P v3 strictly enforces zero hardcoded secrets:
- Docker Compose files and database connection strings reference environment variables exclusively.
- All projects generate a clean `.env.example` with placeholders (for example, `POSTGRES_PASSWORD=<replace-with-secure-password>`).
- Live passwords or connection strings are never baked into generated templates.
