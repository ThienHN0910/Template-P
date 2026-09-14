import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { ProjectConfig } from '../types.js';
import { generateCompositeGitignore } from './composite-gitignore.js';
import { generateDockerCompose } from './docker-compose-generator.js';
import { generateEnvPair } from './env-generator.js';
import { generateAgentsMarkdown, generateClaudeMarkdown, generateCursorRules } from './ai-tailor.js';
import { scaffoldHybridFrontend } from './hybrid-frontend.js';
import { installDynamicSkills } from './dynamic-skills.js';
import { generateIdeConfigs } from './ide-generator.js';
import { createNodeBackendCommand, createRootWorkspaceManifest } from './workspace-manifest.js';

export function getTemplatesDir(): string {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidatePaths = [
    path.resolve(currentDir, '../../../../templates'),
    path.resolve(currentDir, '../../templates'),
    path.resolve(currentDir, '../../../templates'),
    path.resolve(currentDir, '../templates'),
    path.resolve(process.cwd(), 'templates'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'backend'))) {
      return p;
    }
  }

  throw new Error(`Templates directory could not be located. Checked: ${candidatePaths.join(', ')}`);
}

export async function scaffoldProject(config: ProjectConfig): Promise<void> {
  const { targetDir } = config;
  const templatesDir = getTemplatesDir();

  // 1. Ensure target directory exists
  await fsp.mkdir(targetDir, { recursive: true });

  // 2. Map & Copy Backend Template
  let beTemplateSlug = '';
  let bePort = '5050';

  if (config.backend.type === 'dotnet') {
    bePort = '5050';
    if (config.backend.architecture === 'webapi-mvc') {
      beTemplateSlug = 'dotnet-8-webapi-mvc';
    } else if (config.backend.architecture === 'blank') {
      beTemplateSlug = 'dotnet-blank';
    } else {
      beTemplateSlug = 'dotnet-8-webapi-ddd';
    }
  } else if (config.backend.type === 'node') {
    bePort = '4000';
    if (config.backend.architecture === 'fastify-clean') {
      beTemplateSlug = 'node-fastify-clean';
    } else if (config.backend.architecture === 'blank') {
      beTemplateSlug = 'node-blank';
    } else {
      beTemplateSlug = 'node-express-ddd';
    }
  } else if (config.backend.type === 'fastapi') {
    bePort = '8000';
    beTemplateSlug = config.backend.architecture === 'blank' ? 'fastapi-blank' : 'fastapi-modular';
  }

  const backendSource = path.join(templatesDir, 'backend', beTemplateSlug);
  const backendDest = path.join(targetDir, 'apps', 'backend');
  if (fs.existsSync(backendSource)) {
    await fsp.cp(backendSource, backendDest, { recursive: true });
  }

  // 3. Hybrid Upstream Frontend Scaffolding (create-vue@latest / create-next-app@latest + Custom Layering)
  const fePort = config.frontend.type === 'nextjs' ? '3000' : config.frontend.type === 'nuxt3' ? '3001' : '5173';
  await scaffoldHybridFrontend(config, templatesDir, bePort);

  // 4. Token Replacements in Backend
  const dbName = `${config.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_db`;
  let connectionString = '';
  if (config.database === 'postgres') {
    connectionString = `Host=localhost;Port=5432;Database=${dbName};Username=postgres;Password=postgres`;
  } else if (config.database === 'mysql') {
    connectionString = `Server=localhost;Port=3306;Database=${dbName};User=root;Password=root;`;
  } else if (config.database === 'sqlite') {
    connectionString = `Data Source=app.db`;
  }

  async function replaceTokensInDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) return;
    const items = await fsp.readdir(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = await fsp.stat(fullPath);
      if (stat.isDirectory()) {
        await replaceTokensInDir(fullPath);
      } else if (stat.isFile() && !item.endsWith('.png') && !item.endsWith('.ico')) {
        let content = await fsp.readFile(fullPath, 'utf-8');
        content = content
          .replaceAll('__PROJECT_NAME__', config.projectName)
          .replaceAll('__BE_PORT__', bePort)
          .replaceAll('__FE_PORT__', fePort)
          .replaceAll('__DB_PROVIDER__', config.database)
          .replaceAll('__DB_NAME__', dbName)
          .replaceAll('__DB_CONNECTION__', connectionString);
        await fsp.writeFile(fullPath, content, 'utf-8');
      }
    }
  }

  await replaceTokensInDir(backendDest);

  // 5. Generate Root package.json (Unified monorepo script)
  let devBackendCmd = '';
  let buildBackendCmd = '';
  if (config.backend.type === 'dotnet') {
    if (beTemplateSlug === 'dotnet-8-webapi-ddd') {
      devBackendCmd = `dotnet run --project apps/backend/src/API/API.csproj --urls http://localhost:${bePort}`;
      buildBackendCmd = 'dotnet build apps/backend/src/API/API.csproj';
    } else if (beTemplateSlug === 'dotnet-8-webapi-mvc') {
      devBackendCmd = `dotnet run --project apps/backend/WebApiMvc.csproj --urls http://localhost:${bePort}`;
      buildBackendCmd = 'dotnet build apps/backend/WebApiMvc.csproj';
    } else {
      devBackendCmd = `dotnet run --project apps/backend/BlankApi.csproj --urls http://localhost:${bePort}`;
      buildBackendCmd = 'dotnet build apps/backend/BlankApi.csproj';
    }
  } else if (config.backend.type === 'fastapi') {
    devBackendCmd =
      beTemplateSlug === 'fastapi-modular'
        ? 'cd apps/backend && uvicorn app.main:app --reload --port 8000'
        : 'cd apps/backend && uvicorn main:app --reload --port 8000';
  } else {
    devBackendCmd = createNodeBackendCommand(config.packageManager, 'dev');
    buildBackendCmd = createNodeBackendCommand(config.packageManager, 'build');
  }

  const rootPackageJson = createRootWorkspaceManifest(config, devBackendCmd, buildBackendCmd || undefined);

  await fsp.writeFile(path.join(targetDir, 'package.json'), JSON.stringify(rootPackageJson, null, 2), 'utf-8');

  // 6. Generate Workspace file
  if (config.packageManager === 'pnpm') {
    await fsp.writeFile(
      path.join(targetDir, 'pnpm-workspace.yaml'),
      "packages:\n  - 'apps/*'\nallowBuilds:\n  esbuild: true\n",
      'utf-8'
    );
  }

  // 7. Generate Composite .gitignore
  const gitignoreContent = generateCompositeGitignore(config);
  await fsp.writeFile(path.join(targetDir, '.gitignore'), gitignoreContent, 'utf-8');

  // 8. Generate .env and .env.example
  const { envContent, envExampleContent } = generateEnvPair(config);
  await fsp.writeFile(path.join(targetDir, '.env'), envContent, 'utf-8');
  await fsp.writeFile(path.join(targetDir, '.env.example'), envExampleContent, 'utf-8');

  // 9. Generate docker-compose.yml if database is postgres or mysql
  const dockerCompose = generateDockerCompose(config);
  if (dockerCompose) {
    await fsp.writeFile(path.join(targetDir, 'docker-compose.yml'), dockerCompose, 'utf-8');
  }

  // 10. Generate Tailored IDE Configurations (.vscode, extensions.json, settings.json)
  await generateIdeConfigs(config);

  // 11. Install AI Agent Skills via skills.sh (npx skills add) + Offline Fallback
  await installDynamicSkills(config, templatesDir);

  // 12. Generate tailored AI context files only when AI setup is requested.
  if (config.ai.enabled !== false) {
    await fsp.writeFile(path.join(targetDir, 'AGENTS.md'), generateAgentsMarkdown(config), 'utf-8');

    const selectedAgents = Array.isArray(config.ai?.agents) ? config.ai.agents : ['gemini', 'claude', 'cursor'];
    if (selectedAgents.includes('claude') || selectedAgents.includes('all')) {
      await fsp.writeFile(path.join(targetDir, 'CLAUDE.md'), generateClaudeMarkdown(config), 'utf-8');
    }
    if (selectedAgents.includes('cursor') || selectedAgents.includes('all')) {
      await fsp.writeFile(path.join(targetDir, '.cursorrules'), generateCursorRules(config), 'utf-8');
    }
  }

  // 12. Create docs directory
  const docsDir = path.join(targetDir, 'docs', 'adr');
  await fsp.mkdir(docsDir, { recursive: true });

  // 13. Initialize Git Repository
  try {
    await execa('git', ['init', '-b', 'main'], { cwd: targetDir });
  } catch {
    try {
      await execa('git', ['init'], { cwd: targetDir });
    } catch {}
  }
}
