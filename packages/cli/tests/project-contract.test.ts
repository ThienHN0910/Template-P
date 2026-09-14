import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { assertSupportedProjectSelection } from '../src/configuration-validation.js';
import { assertTargetDirectoryIsAvailable, resolveProjectTarget, validateProjectName } from '../src/project-target.js';
import { generateEnvPair } from '../src/scaffolder/env-generator.js';
import { createNodeBackendCommand, createRootWorkspaceManifest } from '../src/scaffolder/workspace-manifest.js';
import { ProjectConfig } from '../src/types.js';

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

function config(packageManager: ProjectConfig['packageManager']): ProjectConfig {
  return {
    projectName: 'sample-app',
    packageManager,
    backend: { type: 'node', architecture: 'express-ddd' },
    database: 'postgres',
    frontend: {
      type: 'vue3',
      features: {
        typescript: true,
        router: true,
        stateManagement: 'pinia',
        linter: 'eslint',
        prettier: true,
        vitest: true,
        darkMode: true,
        styling: 'scss',
        i18n: true,
      },
    },
    ide: ['vscode'],
    ai: { agents: [], packages: [], mcp: false },
    targetDir: '',
  };
}

describe('CLI project targets', () => {
  it('accepts a lowercase npm-compatible project name', () => {
    expect(validateProjectName('my-stack-2')).toBeUndefined();
  });

  it.each(['MyApp', 'my_app', '../escape', 'my app', '-prefix', 'suffix-'])('rejects unsafe name %s', (name) => {
    expect(validateProjectName(name)).toBeDefined();
  });

  it('resolves a valid project directly below the requested parent', () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'template-p-parent-'));
    temporaryDirectories.push(parent);

    expect(resolveProjectTarget(parent, 'safe-app')).toBe(path.join(parent, 'safe-app'));
  });

  it('rejects a non-empty existing target before scaffolding', () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'template-p-parent-'));
    temporaryDirectories.push(parent);
    const target = path.join(parent, 'existing-app');
    fs.mkdirSync(target);
    fs.writeFileSync(path.join(target, 'keep.txt'), 'keep');

    expect(() => assertTargetDirectoryIsAvailable(target)).toThrow('already exists and is not empty');
  });
});

describe('generated workspace manifest', () => {
  it.each(['pnpm', 'npm', 'bun'] as const)('runs Node and frontend scripts from app directories for %s', (packageManager) => {
    const manifest = createRootWorkspaceManifest(
      config(packageManager),
      createNodeBackendCommand(packageManager, 'dev'),
      createNodeBackendCommand(packageManager, 'build')
    );
    const scripts = manifest.scripts as Record<string, string>;

    expect(manifest.workspaces).toEqual(['apps/*']);
    expect(scripts.dev).toContain(`cd apps/backend && ${packageManager} run dev`);
    expect(scripts.dev).toContain(`cd apps/frontend && ${packageManager} run dev`);
    expect(scripts.build).toContain(`cd apps/backend && ${packageManager} run build`);
    expect(scripts.build).not.toContain('--filter');
  });

  it('publishes the backend runtime port in generated environment files', () => {
    const { envContent, envExampleContent } = generateEnvPair(config('pnpm'));

    expect(envContent).toContain('PORT=4000');
    expect(envExampleContent).toContain('PORT=4000');
  });
});

describe('non-interactive selection validation', () => {
  it('rejects an architecture that does not belong to the selected backend', () => {
    expect(() =>
      assertSupportedProjectSelection({
        backend: 'fastapi',
        architecture: 'express-ddd',
        frontend: 'vue3',
        database: 'postgres',
        packageManager: 'pnpm',
      })
    ).toThrow('Unsupported architecture');
  });
});
