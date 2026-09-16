import fsp from 'node:fs/promises';
import path from 'node:path';
import type { StackConfiguration } from './configuration/schema.js';
import { normalizeConfiguration } from './configuration/normalizer.js';
import { resolveCapabilities } from './resolver/resolver.js';
import { generateManifest, serializeManifest } from './manifest/manifest.js';
import { getWorkspaceBaseOperations } from './composer/layers/workspace-base.js';
import { getDotnetCleanOperations } from './composer/layers/dotnet-clean.js';
import { getDotnetEfPostgresqlOperations } from './composer/layers/dotnet-ef-postgresql.js';
import { getDotnetEfSqlServerOperations } from './composer/layers/dotnet-ef-sqlserver.js';
import { getDotnetEfMySqlOperations } from './composer/layers/dotnet-ef-mysql.js';
import { getDotnetEfSqliteOperations } from './composer/layers/dotnet-ef-sqlite.js';
import { getDotnetMongoDbOperations } from './composer/layers/dotnet-mongodb.js';
import { getNodePrismaOperations } from './composer/layers/node-prisma.js';
import { getNodeMongoOperations } from './composer/layers/node-mongodb.js';
import { getPythonSqlAlchemyOperations } from './composer/layers/python-sqlalchemy.js';
import { getPythonMongoOperations } from './composer/layers/python-mongodb.js';
import { getOpenApiClientOperations } from './composer/layers/openapi-client.js';
import { getReactViteOperations } from './composer/layers/react-vite.js';
import { getVueViteOperations } from './composer/layers/vue-vite.js';
import { getNextAppOperations } from './composer/layers/next-app.js';
import { getNuxtAppOperations } from './composer/layers/nuxt-app.js';
import type { FileOperation } from './composer/operations.js';
import { applyOperations } from './composer/operations.js';
import { VirtualFileSystem } from './composer/virtual-fs.js';

export async function scaffoldStack(config: StackConfiguration, targetDir: string): Promise<void> {
  const normalizedConfig = normalizeConfiguration(config);
  const normalizedConfigWithDb = normalizedConfig as typeof normalizedConfig & { database?: string };
  normalizedConfigWithDb.database = normalizedConfigWithDb.database ?? normalizedConfig.persistence?.database;

  const resolution = resolveCapabilities(normalizedConfig);
  const manifest = generateManifest(resolution);

  const operations: FileOperation[] = [];

  // Workspace Base
  operations.push(
    ...getWorkspaceBaseOperations(
      normalizedConfig.project.name,
      normalizedConfig.project.packageManager,
      normalizedConfigWithDb.database,
      normalizedConfig.frontend.framework,
    ),
  );

  // Backend
  if (resolution.resolvedIds.includes('backend/aspnet-core') && resolution.resolvedIds.includes('architecture/clean')) {
    operations.push(...getDotnetCleanOperations(normalizedConfig.project.name));
  }

  // Database / Data Access Layer Dispatch
  if (resolution.resolvedIds.includes('runtime/dotnet')) {
    if (resolution.resolvedIds.includes('database/postgresql')) {
      operations.push(...getDotnetEfPostgresqlOperations());
    } else if (resolution.resolvedIds.includes('database/sqlserver')) {
      operations.push(...getDotnetEfSqlServerOperations());
    } else if (resolution.resolvedIds.includes('database/mysql')) {
      operations.push(...getDotnetEfMySqlOperations());
    } else if (resolution.resolvedIds.includes('database/sqlite')) {
      operations.push(...getDotnetEfSqliteOperations());
    } else if (resolution.resolvedIds.includes('database/mongodb')) {
      operations.push(...getDotnetMongoDbOperations());
    }
  } else if (resolution.resolvedIds.includes('runtime/node')) {
    if (resolution.resolvedIds.includes('database/postgresql')) {
      operations.push(...getNodePrismaOperations('postgresql'));
    } else if (resolution.resolvedIds.includes('database/sqlserver')) {
      operations.push(...getNodePrismaOperations('sqlserver'));
    } else if (resolution.resolvedIds.includes('database/mysql')) {
      operations.push(...getNodePrismaOperations('mysql'));
    } else if (resolution.resolvedIds.includes('database/sqlite')) {
      operations.push(...getNodePrismaOperations('sqlite'));
    } else if (resolution.resolvedIds.includes('database/mongodb')) {
      operations.push(...getNodeMongoOperations());
    }
  } else if (resolution.resolvedIds.includes('runtime/python')) {
    if (resolution.resolvedIds.includes('database/postgresql')) {
      operations.push(...getPythonSqlAlchemyOperations('postgresql'));
    } else if (resolution.resolvedIds.includes('database/sqlserver')) {
      operations.push(...getPythonSqlAlchemyOperations('sqlserver'));
    } else if (resolution.resolvedIds.includes('database/mysql')) {
      operations.push(...getPythonSqlAlchemyOperations('mysql'));
    } else if (resolution.resolvedIds.includes('database/sqlite')) {
      operations.push(...getPythonSqlAlchemyOperations('sqlite'));
    } else if (resolution.resolvedIds.includes('database/mongodb')) {
      operations.push(...getPythonMongoOperations());
    }
  }

  // Client & Frontend
  if (resolution.resolvedIds.includes('frontend/react')) {
    operations.push(...getOpenApiClientOperations());
    operations.push(...getReactViteOperations());
  } else if (resolution.resolvedIds.includes('frontend/vue')) {
    operations.push(...getOpenApiClientOperations());
    operations.push(...getVueViteOperations());
  } else if (resolution.resolvedIds.includes('frontend/next')) {
    operations.push(...getOpenApiClientOperations());
    operations.push(...getNextAppOperations());
  } else if (resolution.resolvedIds.includes('frontend/nuxt')) {
    operations.push(...getOpenApiClientOperations());
    operations.push(...getNuxtAppOperations());
  }

  // Manifest & Config
  operations.push({
    kind: 'createFile',
    path: '.template-p/manifest.json',
    content: serializeManifest(manifest),
  });
  operations.push({
    kind: 'createFile',
    path: 'template-p.config.json',
    content: JSON.stringify(normalizedConfig, null, 2) + '\n',
  });

  // Apply operations in virtual file system
  const vfs = new VirtualFileSystem();
  applyOperations(vfs, operations);

  // Write to disk
  for (const [relPath, content] of vfs.entries()) {
    const fullPath = path.join(targetDir, relPath);
    await fsp.mkdir(path.dirname(fullPath), { recursive: true });
    await fsp.writeFile(fullPath, content, 'utf8');
  }
}
