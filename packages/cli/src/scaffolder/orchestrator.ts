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

export function getTemplatesDir(): string {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidatePaths = [
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

  // 1. Ensure target directory exists and is clean
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

  // 3. Map & Copy Frontend Template
  let feTemplateSlug = '';
  let fePort = '5173';

  if (config.frontend.type === 'vue3') {
    feTemplateSlug = 'vue3-vite';
    fePort = '5173';
  } else if (config.frontend.type === 'react') {
    feTemplateSlug = 'react-vite';
    fePort = '5173';
  } else if (config.frontend.type === 'nextjs') {
    feTemplateSlug = 'nextjs-app';
    fePort = '3000';
  } else if (config.frontend.type === 'nuxt3') {
    feTemplateSlug = 'nuxt3-app';
    fePort = '3001';
  }

  const frontendSource = path.join(templatesDir, 'frontend', feTemplateSlug);
  const frontendDest = path.join(targetDir, 'apps', 'frontend');
  if (fs.existsSync(frontendSource)) {
    await fsp.cp(frontendSource, frontendDest, { recursive: true });
  }

  // 4. Token Replacements in all copied files
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
  await replaceTokensInDir(frontendDest);

  // 5. Generate Root package.json (Unified monorepo script)
  let devBackendCmd = '';
  if (config.backend.type === 'dotnet') {
    if (beTemplateSlug === 'dotnet-8-webapi-ddd') {
      devBackendCmd = 'dotnet run --project apps/backend/src/API/API.csproj';
    } else if (beTemplateSlug === 'dotnet-8-webapi-mvc') {
      devBackendCmd = 'dotnet run --project apps/backend/WebApiMvc.csproj';
    } else {
      devBackendCmd = 'dotnet run --project apps/backend/BlankApi.csproj';
    }
  } else if (config.backend.type === 'fastapi') {
    devBackendCmd =
      beTemplateSlug === 'fastapi-modular'
        ? 'cd apps/backend && uvicorn app.main:app --reload --port 8000'
        : 'cd apps/backend && uvicorn main:app --reload --port 8000';
  } else {
    devBackendCmd = `${config.packageManager} --filter backend dev`;
  }

  const devFrontendCmd = `${config.packageManager} --filter frontend dev`;

  const rootPackageJson = {
    name: config.projectName,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: `concurrently -n "BE,FE" -c "cyan,magenta" "${devBackendCmd}" "${devFrontendCmd}"`,
      build: `${config.packageManager} --filter frontend build`,
    },
    devDependencies: {
      concurrently: '^9.1.2',
    },
  };

  await fsp.writeFile(path.join(targetDir, 'package.json'), JSON.stringify(rootPackageJson, null, 2), 'utf-8');

  // 6. Generate Workspace file
  if (config.packageManager === 'pnpm') {
    await fsp.writeFile(path.join(targetDir, 'pnpm-workspace.yaml'), "packages:\n  - 'apps/*'\n", 'utf-8');
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

  // 10. Copy AI Agent Skills & MCP Servers
  const geminiSkillsDir = path.join(targetDir, '.gemini', 'skills');
  await fsp.mkdir(geminiSkillsDir, { recursive: true });

  if (config.ai.pocock) {
    const pocockSource = path.join(templatesDir, 'skills', 'pocock');
    if (fs.existsSync(pocockSource)) {
      await fsp.cp(pocockSource, geminiSkillsDir, { recursive: true });
    }
  }

  if (config.ai.taste) {
    const tasteSource = path.join(templatesDir, 'skills', 'taste');
    if (fs.existsSync(tasteSource)) {
      await fsp.cp(tasteSource, geminiSkillsDir, { recursive: true });
    }
  }

  if (config.ai.ponytail) {
    const ptSource = path.join(templatesDir, 'skills', 'ponytail');
    if (fs.existsSync(ptSource)) {
      await fsp.cp(ptSource, geminiSkillsDir, { recursive: true });
    }
  }

  if (config.ai.mcp) {
    const mcpSource = path.join(templatesDir, 'mcp', 'mcp.json');
    if (fs.existsSync(mcpSource)) {
      let mcpContent = await fsp.readFile(mcpSource, 'utf-8');
      mcpContent = mcpContent.replaceAll('__DB_NAME__', dbName);
      await fsp.writeFile(path.join(targetDir, '.gemini', 'mcp.json'), mcpContent, 'utf-8');
      await fsp.writeFile(path.join(targetDir, 'mcp.json'), mcpContent, 'utf-8');
    }
  }

  // 11. Generate Tailored AI Context Files (AGENTS.md, CLAUDE.md, .cursorrules)
  await fsp.writeFile(path.join(targetDir, 'AGENTS.md'), generateAgentsMarkdown(config), 'utf-8');
  await fsp.writeFile(path.join(targetDir, 'CLAUDE.md'), generateClaudeMarkdown(config), 'utf-8');
  await fsp.writeFile(path.join(targetDir, '.cursorrules'), generateCursorRules(config), 'utf-8');

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
