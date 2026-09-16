import fsp from 'node:fs/promises';
import path from 'node:path';
import type { StackConfiguration } from './configuration/schema.js';
import { normalizeConfiguration } from './configuration/normalizer.js';
import { resolveCapabilities } from './resolver/resolver.js';
import { generateManifest, serializeManifest } from './manifest/manifest.js';
import { getWorkspaceBaseOperations } from './composer/layers/workspace-base.js';
import { getDotnetCleanOperations } from './composer/layers/dotnet-clean.js';
import { getDotnetEfPostgresqlOperations } from './composer/layers/dotnet-ef-postgresql.js';
import { getOpenApiClientOperations } from './composer/layers/openapi-client.js';
import { getReactViteOperations } from './composer/layers/react-vite.js';
import type { FileOperation } from './composer/operations.js';
import { applyOperations } from './composer/operations.js';
import { VirtualFileSystem } from './composer/virtual-fs.js';

export async function scaffoldStack(config: StackConfiguration, targetDir: string): Promise<void> {
  const normalizedConfig = normalizeConfiguration(config);
  const resolution = resolveCapabilities(normalizedConfig);
  const manifest = generateManifest(resolution);

  const operations: FileOperation[] = [];

  // Workspace Base
  operations.push(...getWorkspaceBaseOperations(normalizedConfig.project.name, normalizedConfig.project.packageManager));

  // Backend
  if (resolution.resolvedIds.includes('backend/aspnet-core') && resolution.resolvedIds.includes('architecture/clean')) {
    operations.push(...getDotnetCleanOperations(normalizedConfig.project.name));
  }

  // Database / Data Access
  if (resolution.resolvedIds.includes('database/postgresql') && resolution.resolvedIds.includes('runtime/dotnet')) {
    operations.push(...getDotnetEfPostgresqlOperations());
  }

  // Client
  if (resolution.resolvedIds.includes('frontend/react')) {
    operations.push(...getOpenApiClientOperations());
    operations.push(...getReactViteOperations());
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
