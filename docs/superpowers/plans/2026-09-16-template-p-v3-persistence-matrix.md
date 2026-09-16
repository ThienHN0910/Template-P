# V3 Persistence Matrix Implementation Plan (Increment 04)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete normative persistence matrix for Template-P v3 across .NET 10, Node.js 24, and Python 3.13 backends with PostgreSQL, SQL Server, MySQL, SQLite, and MongoDB.

**Architecture:** Layer-based composition engine where backend runtime and architecture layers emit domain/application contracts, while database-specific persistence layers inject concrete data-access implementations (EF Core, Prisma 7, SQLAlchemy 2.0 async, native MongoDB drivers) and Docker Compose services.

**Tech Stack:** TypeScript 7, .NET 10 (`Microsoft.EntityFrameworkCore.SqlServer`, `MySql.EntityFrameworkCore`, `Microsoft.EntityFrameworkCore.Sqlite`, `MongoDB.Driver`), Node.js 24 (`@prisma/client` 7, `mongodb`), Python 3.13 (`SQLAlchemy` 2.0, `asyncpg`, `asyncmy`, `aioodbc`, `aiosqlite`, `pymongo`), Docker Compose, Vitest.

**Spec:** [`docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md`](docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md) and [`docs/superpowers/plans/2026-09-16-template-p-v3-program.md`](docs/superpowers/plans/2026-09-16-template-p-v3-program.md).

## Global Constraints

- Runtime version baselines: .NET 10 LTS (`net10.0`), Node.js 24 LTS, Python 3.13.
- Strict compiler options for .NET: `<Nullable>enable</Nullable>`, `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`.
- Pin `Microsoft.OpenApi` to `2.12.2` to eliminate GHSA-v5pm-xwqc-g5wc (NU1903) vulnerability warnings.
- Zero-leakage security: No hardcoded credentials. Use `<db_password>` placeholders in `.env.example` and `${DB_PASSWORD}` without fallback passwords in `compose.yaml`.
- Standard scripts vocabulary: `dev`, `build`, `test`, `lint`, `format`, `api:sync`, `db:migrate`, `db:seed`, `infra:up`, `infra:down`.
- SQLite requires no Docker container; `compose.yaml` is omitted or empty when SQLite is selected with no external services.
- All first-party text files must be English-only and UTF-8 clean.

---

### Task 1: Capability Registry & Multi-Database Docker Compose Layer

**Files:**
- Modify: `packages/cli/src/engine/registry/definitions.ts`
- Modify: `packages/cli/src/engine/composer/layers/workspace-base.ts`
- Modify: `templates/v3/base/workspace/.env.example`
- Modify: `templates/v3/base/workspace/infra/compose.yaml`
- Test: `packages/cli/tests/engine/layers/database-registry-compose.test.ts`

**Interfaces:**
- Consumes: `CORE_CAPABILITIES` from `packages/cli/src/engine/registry/definitions.ts`
- Produces:
  - Updated `CORE_CAPABILITIES` containing `database/postgresql`, `database/sqlserver`, `database/mysql`, `database/sqlite`, `database/mongodb`, `database/none`.
  - `getWorkspaceBaseOperations(projectName: string, packageManager: string, database?: string): FileOperation[]`

- [ ] **Step 1: Write the failing test for database capabilities and dynamic compose**

Create `packages/cli/tests/engine/layers/database-registry-compose.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getBuiltinRegistry } from '../../../src/engine/registry/registry.js';
import { getWorkspaceBaseOperations } from '../../../src/engine/composer/layers/workspace-base.js';

describe('Database Registry & Dynamic Compose', () => {
  it('registers all 5 normative database capabilities', () => {
    const registry = getBuiltinRegistry();
    expect(registry.get('database/postgresql')).toBeDefined();
    expect(registry.get('database/sqlserver')).toBeDefined();
    expect(registry.get('database/mysql')).toBeDefined();
    expect(registry.get('database/sqlite')).toBeDefined();
    expect(registry.get('database/mongodb')).toBeDefined();
    expect(registry.get('database/none')).toBeDefined();
  });

  it('generates MySQL compose service when database is mysql', () => {
    const ops = getWorkspaceBaseOperations('test-app', 'pnpm', 'mysql');
    const compose = ops.find((o) => o.path === 'infra/compose.yaml') as any;
    expect(compose).toBeDefined();
    expect(compose.content).toContain('image: mysql:8.4');
    expect(compose.content).toContain('3306:3306');
  });

  it('generates SQL Server compose service when database is sqlserver', () => {
    const ops = getWorkspaceBaseOperations('test-app', 'pnpm', 'sqlserver');
    const compose = ops.find((o) => o.path === 'infra/compose.yaml') as any;
    expect(compose).toBeDefined();
    expect(compose.content).toContain('mcr.microsoft.com/mssql/server:2022-latest');
    expect(compose.content).toContain('1433:1433');
  });

  it('generates MongoDB compose service when database is mongodb', () => {
    const ops = getWorkspaceBaseOperations('test-app', 'pnpm', 'mongodb');
    const compose = ops.find((o) => o.path === 'infra/compose.yaml') as any;
    expect(compose).toBeDefined();
    expect(compose.content).toContain('image: mongo:7');
    expect(compose.content).toContain('27017:27017');
  });

  it('omits compose service for sqlite', () => {
    const ops = getWorkspaceBaseOperations('test-app', 'pnpm', 'sqlite');
    const compose = ops.find((o) => o.path === 'infra/compose.yaml') as any;
    expect(compose).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/database-registry-compose.test.ts`
Expected: FAIL due to missing capabilities and compose configurations.

- [ ] **Step 3: Implement database capabilities and dynamic compose generation**

In `packages/cli/src/engine/registry/definitions.ts`, add:
```ts
  {
    id: 'database/sqlserver',
    version: '1.0.0',
    kind: 'database',
    support: 'verified',
    provides: ['persistence:database'],
    requires: [],
    conflicts: [{ target: 'architecture/blank' }],
    runtimeRequirements: [],
    dependencies: [],
  },
  {
    id: 'database/mysql',
    version: '1.0.0',
    kind: 'database',
    support: 'verified',
    provides: ['persistence:database'],
    requires: [],
    conflicts: [{ target: 'architecture/blank' }],
    runtimeRequirements: [],
    dependencies: [],
  },
  {
    id: 'database/sqlite',
    version: '1.0.0',
    kind: 'database',
    support: 'verified',
    provides: ['persistence:database'],
    requires: [],
    conflicts: [{ target: 'architecture/blank' }],
    runtimeRequirements: [],
    dependencies: [],
  },
  {
    id: 'database/mongodb',
    version: '1.0.0',
    kind: 'database',
    support: 'verified',
    provides: ['persistence:database'],
    requires: [],
    conflicts: [{ target: 'architecture/blank' }],
    runtimeRequirements: [],
    dependencies: [],
  },
```

In `packages/cli/src/engine/composer/layers/workspace-base.ts`, update `getWorkspaceBaseOperations` to accept optional `database = 'postgresql'` parameter and generate the appropriate compose definition and connection string in `.env.example`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/database-registry-compose.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/registry/definitions.ts packages/cli/src/engine/composer/layers/workspace-base.ts templates/v3/base/workspace packages/cli/tests/engine/layers/database-registry-compose.test.ts
git commit -m "feat(engine): add database capabilities and dynamic multi-database compose generator"
```

---

### Task 2: .NET 10 EF Core & MongoDB Persistence Adapters

**Files:**
- Create: `packages/cli/src/engine/composer/layers/dotnet-ef-sqlserver.ts`
- Create: `packages/cli/src/engine/composer/layers/dotnet-ef-mysql.ts`
- Create: `packages/cli/src/engine/composer/layers/dotnet-ef-sqlite.ts`
- Create: `packages/cli/src/engine/composer/layers/dotnet-mongodb.ts`
- Test: `packages/cli/tests/engine/layers/dotnet-persistence-adapters.test.ts`

**Interfaces:**
- Consumes: `IApplicationDbContext` contract from `dotnet-clean.ts`
- Produces:
  - `function getDotnetEfSqlServerOperations(): FileOperation[]`
  - `function getDotnetEfMySqlOperations(): FileOperation[]`
  - `function getDotnetEfSqliteOperations(): FileOperation[]`
  - `function getDotnetMongoDbOperations(): FileOperation[]`

- [ ] **Step 1: Write the failing test for .NET persistence adapters**

Create `packages/cli/tests/engine/layers/dotnet-persistence-adapters.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getDotnetEfSqlServerOperations } from '../../../src/engine/composer/layers/dotnet-ef-sqlserver.js';
import { getDotnetEfMySqlOperations } from '../../../src/engine/composer/layers/dotnet-ef-mysql.js';
import { getDotnetEfSqliteOperations } from '../../../src/engine/composer/layers/dotnet-ef-sqlite.js';
import { getDotnetMongoDbOperations } from '../../../src/engine/composer/layers/dotnet-mongodb.js';

describe('.NET 10 Persistence Adapters', () => {
  it('generates SQL Server EF Core adapter with Microsoft.EntityFrameworkCore.SqlServer', () => {
    const ops = getDotnetEfSqlServerOperations();
    const csproj = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Infrastructure.csproj') as any;
    expect(csproj.content).toContain('Microsoft.EntityFrameworkCore.SqlServer');
    expect(csproj.content).toContain('<TargetFramework>net10.0</TargetFramework>');
  });

  it('generates MySQL EF Core adapter with MySql.EntityFrameworkCore', () => {
    const ops = getDotnetEfMySqlOperations();
    const csproj = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Infrastructure.csproj') as any;
    expect(csproj.content).toContain('MySql.EntityFrameworkCore');
  });

  it('generates SQLite EF Core adapter with Microsoft.EntityFrameworkCore.Sqlite', () => {
    const ops = getDotnetEfSqliteOperations();
    const csproj = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Infrastructure.csproj') as any;
    expect(csproj.content).toContain('Microsoft.EntityFrameworkCore.Sqlite');
  });

  it('generates MongoDB C# adapter with MongoDB.Driver', () => {
    const ops = getDotnetMongoDbOperations();
    const csproj = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Infrastructure.csproj') as any;
    expect(csproj.content).toContain('MongoDB.Driver');
    const dbContext = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Persistence/ApplicationDbContext.cs') as any;
    expect(dbContext.content).toContain('IMongoDatabase');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/dotnet-persistence-adapters.test.ts`
Expected: FAIL due to missing modules.

- [ ] **Step 3: Implement the 4 .NET persistence adapter layers**

1. `dotnet-ef-sqlserver.ts`: Uses `Microsoft.EntityFrameworkCore.SqlServer` 10.0.0.
2. `dotnet-ef-mysql.ts`: Uses `MySql.EntityFrameworkCore` 10.0.0.
3. `dotnet-ef-sqlite.ts`: Uses `Microsoft.EntityFrameworkCore.Sqlite` 10.0.0.
4. `dotnet-mongodb.ts`: Uses `MongoDB.Driver` 3.2.1, implements `IApplicationDbContext` using `IMongoCollection<Product>`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/dotnet-persistence-adapters.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/composer/layers/dotnet-ef-sqlserver.ts packages/cli/src/engine/composer/layers/dotnet-ef-mysql.ts packages/cli/src/engine/composer/layers/dotnet-ef-sqlite.ts packages/cli/src/engine/composer/layers/dotnet-mongodb.ts packages/cli/tests/engine/layers/dotnet-persistence-adapters.test.ts
git commit -m "feat(engine): add .NET 10 persistence adapters for SQL Server, MySQL, SQLite, and MongoDB"
```

---

### Task 3: Node.js 24 Persistence Adapters (Prisma 7 & MongoDB)

**Files:**
- Create: `packages/cli/src/engine/composer/layers/node-prisma.ts`
- Create: `packages/cli/src/engine/composer/layers/node-mongodb.ts`
- Test: `packages/cli/tests/engine/layers/node-persistence-adapters.test.ts`

**Interfaces:**
- Produces:
  - `function getNodePrismaOperations(provider: 'postgresql' | 'sqlserver' | 'mysql' | 'sqlite'): FileOperation[]`
  - `function getNodeMongoOperations(): FileOperation[]`

- [ ] **Step 1: Write the failing test for Node.js persistence adapters**

Create `packages/cli/tests/engine/layers/node-persistence-adapters.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getNodePrismaOperations } from '../../../src/engine/composer/layers/node-prisma.js';
import { getNodeMongoOperations } from '../../../src/engine/composer/layers/node-mongodb.js';

describe('Node.js 24 Persistence Adapters', () => {
  it('generates Prisma 7 schema and client for PostgreSQL', () => {
    const ops = getNodePrismaOperations('postgresql');
    const schema = ops.find((o) => o.path === 'apps/backend/prisma/schema.prisma') as any;
    expect(schema).toBeDefined();
    expect(schema.content).toContain('provider = "postgresql"');
    expect(schema.content).toContain('model Product');
  });

  it('generates Prisma 7 schema and client for SQLite', () => {
    const ops = getNodePrismaOperations('sqlite');
    const schema = ops.find((o) => o.path === 'apps/backend/prisma/schema.prisma') as any;
    expect(schema.content).toContain('provider = "sqlite"');
  });

  it('generates official MongoDB adapter for Node.js', () => {
    const ops = getNodeMongoOperations();
    const pkg = ops.find((o) => o.path === 'apps/backend/package.json') as any;
    expect(pkg).toBeDefined();
    const db = ops.find((o) => o.path === 'apps/backend/src/db.ts') as any;
    expect(db.content).toContain('MongoClient');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/node-persistence-adapters.test.ts`
Expected: FAIL due to missing modules.

- [ ] **Step 3: Implement Node.js Prisma 7 and MongoDB adapter layers**

1. `node-prisma.ts`: Emits `prisma/schema.prisma` with `Product` model, `src/db.ts` exporting Prisma client singleton.
2. `node-mongodb.ts`: Emits `src/db.ts` with typed `MongoClient` connection and collection accessors.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/node-persistence-adapters.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/composer/layers/node-prisma.ts packages/cli/src/engine/composer/layers/node-mongodb.ts packages/cli/tests/engine/layers/node-persistence-adapters.test.ts
git commit -m "feat(engine): add Node.js 24 persistence adapters for Prisma 7 and MongoDB"
```

---

### Task 4: Python 3.13 FastAPI Persistence Adapters (SQLAlchemy 2.0 Async & PyMongo)

**Files:**
- Create: `packages/cli/src/engine/composer/layers/python-sqlalchemy.ts`
- Create: `packages/cli/src/engine/composer/layers/python-mongodb.ts`
- Test: `packages/cli/tests/engine/layers/python-persistence-adapters.test.ts`

**Interfaces:**
- Produces:
  - `function getPythonSqlAlchemyOperations(dialect: 'postgresql' | 'sqlserver' | 'mysql' | 'sqlite'): FileOperation[]`
  - `function getPythonMongoOperations(): FileOperation[]`

- [ ] **Step 1: Write the failing test for Python persistence adapters**

Create `packages/cli/tests/engine/layers/python-persistence-adapters.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getPythonSqlAlchemyOperations } from '../../../src/engine/composer/layers/python-sqlalchemy.js';
import { getPythonMongoOperations } from '../../../src/engine/composer/layers/python-mongodb.js';

describe('Python 3.13 FastAPI Persistence Adapters', () => {
  it('generates SQLAlchemy async session for PostgreSQL with psycopg', () => {
    const ops = getPythonSqlAlchemyOperations('postgresql');
    const db = ops.find((o) => o.path === 'apps/backend/app/db/session.py') as any;
    expect(db).toBeDefined();
    expect(db.content).toContain('create_async_engine');
    expect(db.content).toContain('postgresql+psycopg');
  });

  it('generates SQLAlchemy async session for SQLite with aiosqlite', () => {
    const ops = getPythonSqlAlchemyOperations('sqlite');
    const db = ops.find((o) => o.path === 'apps/backend/app/db/session.py') as any;
    expect(db).toBeDefined();
    expect(db.content).toContain('sqlite+aiosqlite');
  });

  it('generates PyMongo AsyncMongoClient adapter for MongoDB', () => {
    const ops = getPythonMongoOperations();
    const db = ops.find((o) => o.path === 'apps/backend/app/db/mongo.py') as any;
    expect(db).toBeDefined();
    expect(db.content).toContain('AsyncMongoClient');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/python-persistence-adapters.test.ts`
Expected: FAIL due to missing modules.

- [ ] **Step 3: Implement Python FastAPI SQLAlchemy 2.0 and PyMongo adapter layers**

1. `python-sqlalchemy.ts`: Async engine setup, `AsyncSession` dependency for FastAPI, and `Product` declarative table model.
2. `python-mongodb.ts`: Async client setup using `pymongo.AsyncMongoClient` and collection accessors.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/python-persistence-adapters.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/composer/layers/python-sqlalchemy.ts packages/cli/src/engine/composer/layers/python-mongodb.ts packages/cli/tests/engine/layers/python-persistence-adapters.test.ts
git commit -m "feat(engine): add Python 3.13 FastAPI persistence adapters for SQLAlchemy and PyMongo"
```

---

### Task 5: Scaffolder Matrix Wiring & Layer Dispatch

**Files:**
- Modify: `packages/cli/src/engine/scaffolder.ts`
- Test: `packages/cli/tests/engine/matrix-scaffolder.test.ts`

**Interfaces:**
- Consumes: All adapter layer functions from Tasks 1–4
- Produces: Dynamic resolution and composition in `scaffoldStack` based on `config.database` and `config.backend.type`

- [ ] **Step 1: Write the failing test for complete database matrix scaffolding**

Create `packages/cli/tests/engine/matrix-scaffolder.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import path from 'path';
import fsp from 'fs/promises';
import { scaffoldStack } from '../../src/engine/scaffolder.js';
import type { StackConfiguration } from '../../src/engine/configuration/schema.js';

describe('Matrix Scaffolder Dispatch', () => {
  it('scaffolds .NET 10 with SQLite without compose.yaml', async () => {
    const tmpDir = path.resolve('test-output/dotnet-sqlite-test');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    const config: StackConfiguration = {
      project: { name: 'dotnet-sqlite-app', packageManager: 'pnpm' },
      runtime: 'dotnet',
      backend: { type: 'dotnet', architecture: 'clean' },
      database: 'sqlite',
      frontend: { type: 'react' },
    };

    await scaffoldStack(config, tmpDir);

    const csproj = await fsp.readFile(path.join(tmpDir, 'apps/backend/src/Infrastructure/Infrastructure.csproj'), 'utf8');
    expect(csproj).toContain('Microsoft.EntityFrameworkCore.Sqlite');

    const composeExists = await fsp.access(path.join(tmpDir, 'infra/compose.yaml')).then(() => true).catch(() => false);
    expect(composeExists).toBe(false);

    await fsp.rm(tmpDir, { recursive: true, force: true });
  });

  it('scaffolds .NET 10 with SQL Server and compose service', async () => {
    const tmpDir = path.resolve('test-output/dotnet-sqlserver-test');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    const config: StackConfiguration = {
      project: { name: 'dotnet-mssql-app', packageManager: 'pnpm' },
      runtime: 'dotnet',
      backend: { type: 'dotnet', architecture: 'clean' },
      database: 'sqlserver',
      frontend: { type: 'none' },
    };

    await scaffoldStack(config, tmpDir);

    const compose = await fsp.readFile(path.join(tmpDir, 'infra/compose.yaml'), 'utf8');
    expect(compose).toContain('mcr.microsoft.com/mssql/server:2022-latest');

    await fsp.rm(tmpDir, { recursive: true, force: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/matrix-scaffolder.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement matrix layer dispatch in scaffolder.ts**

Update `packages/cli/src/engine/scaffolder.ts` to dispatch the proper persistence layer depending on `resolution.resolvedIds`:
- .NET + Postgres / SqlServer / MySql / Sqlite / Mongo
- Node + Postgres / SqlServer / MySql / Sqlite / Mongo
- Python + Postgres / SqlServer / MySql / Sqlite / Mongo

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/matrix-scaffolder.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/scaffolder.ts packages/cli/tests/engine/matrix-scaffolder.test.ts
git commit -m "feat(engine): wire complete persistence matrix layer dispatch into scaffolder"
```

---

### Task 6: Matrix Compilation Verification & Full Repo Smoke Test

**Files:**
- Create: `packages/cli/tests/engine/matrix-build.test.ts`

**Interfaces:**
- Produces: Automated verification compiling .NET 10 Clean Architecture backend across SQLite, MySQL, and SQL Server adapters.

- [ ] **Step 1: Write matrix compilation test**

Create `packages/cli/tests/engine/matrix-build.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import path from 'path';
import fsp from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { scaffoldStack } from '../../src/engine/scaffolder.js';
import type { StackConfiguration } from '../../src/engine/configuration/schema.js';

const exec = promisify(execFile);

describe('Matrix Compilation Verification', () => {
  it('scaffolds and compiles .NET 10 backend with SQLite adapter', async () => {
    const tmpDir = path.resolve('test-output/build-dotnet-sqlite');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    const config: StackConfiguration = {
      project: { name: 'test-sqlite', packageManager: 'pnpm' },
      runtime: 'dotnet',
      backend: { type: 'dotnet', architecture: 'clean' },
      database: 'sqlite',
      frontend: { type: 'none' },
    };

    await scaffoldStack(config, tmpDir);

    const apiCsproj = path.join(tmpDir, 'apps/backend/src/API/API.csproj');
    const { stdout } = await exec('dotnet', ['build', apiCsproj, '-c', 'Release']);
    expect(stdout).toContain('Build succeeded');

    await fsp.rm(tmpDir, { recursive: true, force: true });
  }, 60000);

  it('scaffolds and compiles .NET 10 backend with SQL Server adapter', async () => {
    const tmpDir = path.resolve('test-output/build-dotnet-sqlserver');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    const config: StackConfiguration = {
      project: { name: 'test-sqlserver', packageManager: 'pnpm' },
      runtime: 'dotnet',
      backend: { type: 'dotnet', architecture: 'clean' },
      database: 'sqlserver',
      frontend: { type: 'none' },
    };

    await scaffoldStack(config, tmpDir);

    const apiCsproj = path.join(tmpDir, 'apps/backend/src/API/API.csproj');
    const { stdout } = await exec('dotnet', ['build', apiCsproj, '-c', 'Release']);
    expect(stdout).toContain('Build succeeded');

    await fsp.rm(tmpDir, { recursive: true, force: true });
  }, 60000);
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/matrix-build.test.ts`
Expected: PASS (2 tests with .NET build succeeded).

- [ ] **Step 3: Run full repo verification**

Run: `pnpm verify`
Expected: 100% PASS (check:content, typecheck, test:content, vitest suites, build).

- [ ] **Step 4: Commit**

```bash
git add packages/cli/tests/engine/matrix-build.test.ts
git commit -m "test(engine): add persistence matrix .NET build verification"
```
