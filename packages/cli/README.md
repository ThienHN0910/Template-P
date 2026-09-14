# @thienhn/create-template

> The Universal Fullstack CLI Scaffolder with Official Upstream Framework Generators & 52 Production AI Agent Skills.

`@thienhn/create-template` is an interactive CLI scaffolder that bootstraps production-grade fullstack monorepos in seconds.

Requires Node.js 22.13 or newer.

## 🚀 Quick Start

Run directly via `npx` (no installation required):

```bash
npx @thienhn/create-template my-app
```

Or run interactively:

```bash
npx @thienhn/create-template
```

## 🛠️ Supported Frameworks & Stacks

### 1. Backend Frameworks & Architectures
- **.NET 8 Web API:**
  - Clean Architecture / DDD (Domain, Application, Infrastructure, API layers)
  - MVC (Controllers, Models, Services)
  - Blank Minimal API
- **Node.js (TypeScript):**
  - Express Clean Architecture / DDD
  - Fastify Modular Architecture
  - Blank Minimal Server
- **FastAPI (Python):**
  - Modular Architecture (Routers, Schemas, Services, SQLModel)
  - Blank Minimal API

### 2. Database Engines & Containers
- **PostgreSQL 16 Alpine** + pgAdmin 4 + Healthchecks + Auto-generated `.env` & `docker-compose.yml`
- **MySQL 8.4** + phpMyAdmin + Healthchecks
- **SQLite**
- **None**

### 3. Frontend Frameworks & Official Ecosystem Features
- **Vue 3 + Vite:** Official `create-vue@latest` delegation + TypeScript, Vue Router, Pinia, ESLint, Prettier, Oxlint, Vitest.
- **Next.js:** Official `create-next-app@latest` delegation + TypeScript, Tailwind CSS, ESLint, App Router.
- **React + Vite:** React 19 + TypeScript + Vite.
- **Nuxt 3:** Nuxt 3 Fullstack.
- **Custom Built-in Layers:**
  - 60fps GPU-accelerated Dark/Light mode theme system (`data-theme="dark"` / `data-theme="light"`).
  - Multi-language i18n support (English & Vietnamese).
  - Typed API client and reverse proxy (`/api`) to backend.

### 4. AI Agent Super-powers (52 Skills & MCP Servers)
- **37 Matt Pocock Skills:** `ask-matt`, `to-tickets`, `to-spec`, `grill-me`, `domain-modeling`, `triage`, `tdd`, `code-review`, `wayfinder`, etc.
- **10 Design Taste Skills:** `design-taste-frontend`, `high-end-visual-design`, `industrial-brutalist-ui`, `minimalist-ui`, `image-to-code`, etc.
- **5 Ponytail Anti-Over-Engineering Skills:** `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-gain`, `ponytail-help`.
- **MCP Servers Pre-configured:** Chrome DevTools, Filesystem, Database connectors.

## ⚡ CLI Flags (Non-Interactive / CI Mode)

```bash
npx create-p-stack my-app \
  --backend dotnet \
  --arch webapi-ddd \
  --frontend vue3 \
  --db postgres \
  --pm pnpm \
  --yes
```

| Flag | Short | Options | Description |
|---|---|---|---|
| `--backend` | `-b` | `dotnet`, `node`, `fastapi` | Backend framework |
| `--arch` | `-a` | `webapi-ddd`, `webapi-mvc`, `express-ddd`, `fastify-clean`, `modular`, `blank` | Architecture pattern |
| `--frontend` | `-f` | `vue3`, `react`, `nextjs`, `nuxt3` | Frontend framework |
| `--db`, `--database` | `-d` | `postgres`, `mysql`, `sqlite`, `none` | Database engine |
| `--pm`, `--package-manager` | `-p` | `pnpm`, `npm`, `bun` | Package manager |
| `--offline` | | | Use vendored blueprints; skip upstream generator downloads |
| `--no-ai` | | | Skip AI skills, MCP configuration, and AI instruction files |
| `--yes` | `-y` | | Use defaults / skip questionnaire |

## 📄 License

MIT © Antigravity Team
