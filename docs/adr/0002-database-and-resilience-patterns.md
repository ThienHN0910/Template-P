# 2. Database handling, resilience, and failure scenarios

Date: 2026-09-13

**Status:** Superseded by the approved v3 capability architecture on 2026-09-16.

This ADR records the historical v1/v2 decision. New implementation work follows the v3 design specification.

## Context and risk research

A cross-platform full-stack CLI scaffolder that combines multiple runtimes (.NET, Node.js, Python, and databases) must account for the following risks and edge cases.

### Runtime installation failure and administrator or sudo permissions

**Problem:** A command that installs `dotnet`, `node`, or `python` with `winget` on Windows or `brew`/`apt` elsewhere can fail because:

- The terminal is not running with administrator or sudo privileges.
- The current terminal session's `PATH` has not refreshed after installation.

**Historical approach:**

- Wrap child-process calls in `try`/`catch` with a timeout.
- Do not allow the CLI to crash on failure. Catch the error and show a friendly message with an official download link.
- Provide a fallback retry prompt: press Enter after completing installation to continue.

### Database selection and blueprint configuration

**Problem:** Frameworks have different ORM ecosystems and connection-string formats:

- .NET: PostgreSQL (`Npgsql`), MySQL (`Pomelo`), and SQLite (`Microsoft.EntityFrameworkCore.Sqlite`).
- Node.js: Prisma or Drizzle ORM.
- FastAPI: SQLModel/SQLAlchemy with Alembic.

**Historical approach:**

- Offer PostgreSQL, MySQL, SQLite, and no database through an interactive prompt.
- Generate connection examples such as a DbContext, database client, or health-check entity.
- Generate `docker-compose.yml` only for PostgreSQL or MySQL, including health checks, volumes, and a management service such as pgAdmin or Adminer.
- Generate a local `.env` with a Docker development connection string and a safe-placeholder `.env.example`.

### Composite `.gitignore` generation

**Problem:** A monorepo combining .NET, frontend Node.js, and Python can accidentally commit `bin/`, `obj/`, `.venv/`, `__pycache__/`, `node_modules/`, or sensitive `.env` files.

**Historical approach:** Build `generateGitignore({ be, fe, db })` to combine standard ignore rules from GitHub templates for the selected frameworks and preserve zero-leakage handling.

### Port collisions

**Problem:** Default ports can collide with other applications: .NET commonly uses 5000/5001, Next.js uses 3000, and Vite uses 5173.

**Historical approach:** Allocate these defaults and configure frontend proxies accordingly:

- .NET API: `5050`
- Node API: `4000`
- FastAPI: `8000`
- Frontend: `5173` for Vite, `3000` for Next.js, and `3001` for Nuxt

### Concurrent backend and frontend development

**Problem:** Developers otherwise need two terminals to run the backend and frontend.

**Historical approach:** Use `concurrently` in the generated root `package.json` to offer one `pnpm dev` command. The command runs the appropriate backend command alongside the selected frontend command.

## Consequences

These v1/v2 approaches aimed to make local project setup more resilient and predictable across supported stacks. The v3 design replaces the historical breadth-first model with explicit, evidence-backed capabilities; it does not claim that the historical proposals were the original v3 architecture.

See the [approved v3 capability architecture](../superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md).
