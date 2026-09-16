import { describe, expect, it } from 'vitest';
import path from 'node:path';
import fsp from 'node:fs/promises';
import { scaffoldStack } from '../../src/engine/scaffolder.js';
import type { StackConfiguration } from '../../src/engine/configuration/schema.js';

describe('Matrix Scaffolder Dispatch', () => {
  it('scaffolds .NET 10 with SQLite without compose.yaml', async () => {
    const tmpDir = path.resolve('test-output/dotnet-sqlite-test');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    const config: StackConfiguration = {
      schemaVersion: 1,
      project: { name: 'dotnet-sqlite-app', packageManager: 'pnpm' },
      backend: { runtime: 'dotnet', framework: 'aspnet-core', architecture: 'clean' },
      persistence: { database: 'sqlite' },
      frontend: { framework: 'react', rendering: 'spa', styling: 'tailwind', features: [] },
      capabilities: {},
    };

    try {
      await scaffoldStack(config, tmpDir);

      const csproj = await fsp.readFile(
        path.join(tmpDir, 'apps/backend/src/Infrastructure/Infrastructure.csproj'),
        'utf8',
      );
      expect(csproj).toContain('Microsoft.EntityFrameworkCore.Sqlite');

      const dbContext = await fsp.readFile(
        path.join(tmpDir, 'apps/backend/src/Infrastructure/Persistence/ApplicationDbContext.cs'),
        'utf8',
      );
      expect(dbContext).toContain('ApplicationDbContext');

      const composeExists = await fsp
        .access(path.join(tmpDir, 'infra/compose.yaml'))
        .then(() => true)
        .catch(() => false);
      expect(composeExists).toBe(false);

      const envExample = await fsp.readFile(path.join(tmpDir, '.env.example'), 'utf8');
      expect(envExample).toContain('Data Source=app.db');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('scaffolds .NET 10 with SQL Server and compose service', async () => {
    const tmpDir = path.resolve('test-output/dotnet-sqlserver-test');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    const config: StackConfiguration = {
      schemaVersion: 1,
      project: { name: 'dotnet-mssql-app', packageManager: 'pnpm' },
      backend: { runtime: 'dotnet', framework: 'aspnet-core', architecture: 'clean' },
      persistence: { database: 'sqlserver' },
      frontend: { framework: 'none', rendering: 'none', styling: 'none', features: [] },
      capabilities: {},
    };

    try {
      await scaffoldStack(config, tmpDir);

      const csproj = await fsp.readFile(
        path.join(tmpDir, 'apps/backend/src/Infrastructure/Infrastructure.csproj'),
        'utf8',
      );
      expect(csproj).toContain('Microsoft.EntityFrameworkCore.SqlServer');

      const compose = await fsp.readFile(path.join(tmpDir, 'infra/compose.yaml'), 'utf8');
      expect(compose).toContain('mcr.microsoft.com/mssql/server:2022-latest');
      expect(compose).toContain('1433:1433');
      expect(compose).toContain('MSSQL_SA_PASSWORD=${DB_PASSWORD}');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('scaffolds Node with PostgreSQL and Prisma schema', async () => {
    const tmpDir = path.resolve('test-output/node-postgres-test');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    const config: StackConfiguration = {
      schemaVersion: 1,
      project: { name: 'node-postgres-app', packageManager: 'pnpm' },
      backend: { runtime: 'node', framework: 'fastify', architecture: 'clean' },
      persistence: { database: 'postgresql' },
      frontend: { framework: 'none', rendering: 'none', styling: 'none', features: [] },
      capabilities: {},
    };

    try {
      await scaffoldStack(config, tmpDir);

      const prismaSchema = await fsp.readFile(
        path.join(tmpDir, 'apps/backend/prisma/schema.prisma'),
        'utf8',
      );
      expect(prismaSchema).toContain('provider = "postgresql"');
      expect(prismaSchema).toContain('model Product');

      const dbTs = await fsp.readFile(
        path.join(tmpDir, 'apps/backend/src/db.ts'),
        'utf8',
      );
      expect(dbTs).toContain('PrismaClient');

      const compose = await fsp.readFile(path.join(tmpDir, 'infra/compose.yaml'), 'utf8');
      expect(compose).toContain('postgres:17-alpine');
      expect(compose).toContain('5432');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('scaffolds Python with MongoDB and AsyncMongoClient', async () => {
    const tmpDir = path.resolve('test-output/python-mongo-test');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    const config: StackConfiguration = {
      schemaVersion: 1,
      project: { name: 'python-mongo-app', packageManager: 'pnpm' },
      backend: { runtime: 'python', framework: 'fastapi', architecture: 'modular' },
      persistence: { database: 'mongodb' },
      frontend: { framework: 'none', rendering: 'none', styling: 'none', features: [] },
      capabilities: {},
    };

    try {
      await scaffoldStack(config, tmpDir);

      const mongoPy = await fsp.readFile(
        path.join(tmpDir, 'apps/backend/app/db/mongo.py'),
        'utf8',
      );
      expect(mongoPy).toContain('AsyncMongoClient');
      expect(mongoPy).toContain('def get_mongo_client()');

      const compose = await fsp.readFile(path.join(tmpDir, 'infra/compose.yaml'), 'utf8');
      expect(compose).toContain('image: mongo:7');
      expect(compose).toContain('27017:27017');

      const envExample = await fsp.readFile(path.join(tmpDir, '.env.example'), 'utf8');
      expect(envExample).toContain('mongodb://');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
