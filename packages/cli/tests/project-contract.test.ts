import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { assertSupportedProjectSelection } from '../src/configuration-validation.js';
import { assertTargetDirectoryIsAvailable, resolveProjectTarget, validateProjectName } from '../src/project-target.js';
import { generateEnvPair } from '../src/scaffolder/env-generator.js';
import { installDynamicSkills } from '../src/scaffolder/dynamic-skills.js';
import { createNodeBackendCommand, createRootWorkspaceManifest } from '../src/scaffolder/workspace-manifest.js';
import { scaffoldProject } from '../src/scaffolder/orchestrator.js';
import { shouldUseUpstreamGenerator } from '../src/scaffolder/hybrid-frontend.js';
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
    offline: false,
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

  it('writes the portable workspace contract into a representative Scaffolded Project', async () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'template-p-scaffold-'));
    temporaryDirectories.push(parent);
    const targetDir = path.join(parent, 'sample-app');
    const projectConfig = config('pnpm');
    projectConfig.targetDir = targetDir;
    projectConfig.backend = { type: 'node', architecture: 'blank' };
    projectConfig.offline = true;
    projectConfig.database = 'none';
    projectConfig.ai = { agents: [], packages: [], mcp: false };

    await scaffoldProject(projectConfig);

    const manifest = JSON.parse(fs.readFileSync(path.join(targetDir, 'package.json'), 'utf-8'));
    expect(manifest.workspaces).toEqual(['apps/*']);
    expect(manifest.scripts.dev).toContain('cd apps/backend && pnpm run dev');
    expect(manifest.scripts.dev).toContain('cd apps/frontend && pnpm run dev');
    expect(fs.readFileSync(path.join(targetDir, 'pnpm-workspace.yaml'), 'utf-8')).toContain('esbuild: true');
  });
});

describe('offline scaffolding', () => {
  it('uses vendored frontend blueprints instead of upstream generators', () => {
    const projectConfig = config('pnpm');
    projectConfig.offline = true;

    expect(shouldUseUpstreamGenerator(projectConfig)).toBe(false);
  });

  it('does not create AI assets or instructions when AI setup is disabled', async () => {
    const targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'template-p-no-ai-'));
    temporaryDirectories.push(targetDir);
    const projectConfig = config('pnpm');
    projectConfig.targetDir = targetDir;
    projectConfig.backend = { type: 'node', architecture: 'blank' };
    projectConfig.database = 'none';
    projectConfig.offline = true;
    projectConfig.ai = { enabled: false, agents: ['gemini'], packages: ['mattpocock/skills'], mcp: true };

    await installDynamicSkills(projectConfig, path.join(process.cwd(), 'templates'));

    expect(fs.existsSync(path.join(targetDir, '.gemini'))).toBe(false);
    expect(fs.existsSync(path.join(targetDir, 'mcp.json'))).toBe(false);

    await scaffoldProject(projectConfig);

    expect(fs.existsSync(path.join(targetDir, 'AGENTS.md'))).toBe(false);
    expect(fs.existsSync(path.join(targetDir, 'CLAUDE.md'))).toBe(false);
    expect(fs.existsSync(path.join(targetDir, '.cursorrules'))).toBe(false);
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

describe('published product identity', () => {
  it('retains the approved repository package and executable names', () => {
    const packageManifest = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));

    expect(packageManifest.name).toBe('@thienhn/create-template');
    expect(packageManifest.bin).toEqual({
      'create-template': './bin/create-template.js',
      'create-p-stack': './bin/create-template.js',
    });
    expect(packageManifest.repository.url).toContain('ThienHN0910/Template-P.git');
  });
});

describe('v2 selection surface', () => {
  it.each([
    ['dotnet', 'webapi-ddd'],
    ['dotnet', 'webapi-mvc'],
    ['dotnet', 'blank'],
    ['node', 'express-ddd'],
    ['node', 'fastify-clean'],
    ['node', 'blank'],
    ['fastapi', 'modular'],
    ['fastapi', 'blank'],
  ])('accepts %s with %s', (backend, architecture) => {
    expect(() =>
      assertSupportedProjectSelection({
        backend,
        architecture,
        frontend: 'react',
        database: 'none',
        packageManager: 'pnpm',
      })
    ).not.toThrow();
  });
});
