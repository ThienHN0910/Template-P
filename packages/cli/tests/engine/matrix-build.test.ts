import { describe, expect, it } from 'vitest';
import path from 'node:path';
import fsp from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { scaffoldStack } from '../../src/engine/scaffolder.js';
import type { StackConfiguration } from '../../src/engine/configuration/schema.js';

const exec = promisify(execFile);

describe('Matrix Compilation Verification', () => {
  it('scaffolds and compiles .NET 10 backend with SQLite adapter', async () => {
    const tmpDir = path.resolve('test-output/build-dotnet-sqlite');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    const config: StackConfiguration = {
      schemaVersion: 1,
      project: { name: 'test-sqlite', packageManager: 'pnpm' },
      backend: { runtime: 'dotnet', framework: 'aspnet-core', architecture: 'clean' },
      persistence: { database: 'sqlite' },
      frontend: { framework: 'none', rendering: 'none', styling: 'none', features: [] },
      capabilities: {},
    };

    try {
      await scaffoldStack(config, tmpDir);

      const apiCsproj = path.join(tmpDir, 'apps/backend/src/API/API.csproj');
      const { stdout } = await exec('dotnet', ['build', apiCsproj, '-c', 'Release']);
      expect(stdout).toContain('Build succeeded');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  }, 90000);

  it('scaffolds and compiles .NET 10 backend with SQL Server adapter', async () => {
    const tmpDir = path.resolve('test-output/build-dotnet-sqlserver');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    const config: StackConfiguration = {
      schemaVersion: 1,
      project: { name: 'test-sqlserver', packageManager: 'pnpm' },
      backend: { runtime: 'dotnet', framework: 'aspnet-core', architecture: 'clean' },
      persistence: { database: 'sqlserver' },
      frontend: { framework: 'none', rendering: 'none', styling: 'none', features: [] },
      capabilities: {},
    };

    try {
      await scaffoldStack(config, tmpDir);

      const apiCsproj = path.join(tmpDir, 'apps/backend/src/API/API.csproj');
      const { stdout } = await exec('dotnet', ['build', apiCsproj, '-c', 'Release']);
      expect(stdout).toContain('Build succeeded');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  }, 90000);
});
