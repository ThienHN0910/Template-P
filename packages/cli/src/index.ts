import * as p from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import fs from 'fs-extra';
import { Command } from 'commander';
import {
  promptProjectName,
  promptPackageManager,
  promptBackend,
  promptDatabase,
  promptFrontend,
  promptAiSkills,
} from './prompts/index.js';
import { inspectEnvironment, handleMissingTools } from './installer/index.js';
import { scaffoldProject } from './scaffolder/index.js';
import { ProjectConfig, BackendType, FrontendType, DatabaseChoice, PackageManager } from './types.js';

export async function run() {
  // Handle graceful Ctrl+C
  process.on('SIGINT', () => {
    p.cancel(pc.yellow('Operation cancelled by user.'));
    process.exit(0);
  });

  const program = new Command();
  program
    .name('create-p-stack')
    .description('Universal Fullstack CLI Scaffolder & GitHub Template Engine')
    .argument('[project-name]', 'Name of the project directory')
    .option('-b, --backend <type>', 'Backend framework (dotnet, node, fastapi)')
    .option('-a, --arch <architecture>', 'Backend architecture (webapi-ddd, webapi-mvc, express-ddd, fastify-clean, modular, blank)')
    .option('-f, --frontend <type>', 'Frontend framework (vue3, react, nextjs, nuxt3)')
    .option('-d, --database <type>', 'Database (postgres, mysql, sqlite, none)')
    .option('--db <type>', 'Database alias (postgres, mysql, sqlite, none)')
    .option('-p, --package-manager <pm>', 'Package manager (pnpm, npm, bun)')
    .option('--pm <pm>', 'Package manager shorthand')
    .option('-y, --yes', 'Use defaults and skip interactive questionnaire', false)
    .parse(process.argv);

  const options = program.opts();
  const rawArgName = program.args[0];

  console.clear();
  p.intro(pc.bgCyan(pc.black(' CREATE-P-STACK ')) + pc.bold(' Universal Fullstack & AI Agent Scaffolder'));

  let projectName = rawArgName || 'my-p-app';
  let packageManager: PackageManager = (options.packageManager as PackageManager) || (options.pm as PackageManager) || 'pnpm';
  let backend = {
    type: (options.backend as BackendType) || 'dotnet',
    architecture: options.arch || 'webapi-ddd',
    version: '8.0',
  };
  let database: DatabaseChoice = (options.database as DatabaseChoice) || (options.db as DatabaseChoice) || 'postgres';
  let frontend: { type: FrontendType; features: { darkMode: boolean; styling: 'scss' | 'tailwind' | 'css'; i18n: boolean } } = {
    type: (options.frontend as FrontendType) || 'vue3',
    features: {
      darkMode: true,
      styling: 'scss',
      i18n: true,
    },
  };
  let ai = {
    pocock: true,
    taste: true,
    ponytail: true,
    mcp: true,
  };

  const isInteractive = !options.yes && process.stdin.isTTY;

  if (isInteractive) {
    // 1. Project Name
    projectName = await promptProjectName(rawArgName || 'my-p-app');

    // Check directory collision
    const checkTarget = path.resolve(process.cwd(), projectName);
    if (fs.existsSync(checkTarget) && fs.readdirSync(checkTarget).length > 0) {
      const shouldOverwrite = await p.confirm({
        message: `Directory ${pc.bold(projectName)} already exists and is not empty. Do you want to proceed and overwrite?`,
        initialValue: false,
      });
      if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
        p.cancel(pc.yellow('Scaffolding aborted to protect existing directory.'));
        process.exit(0);
      }
    }

    // 2. Package Manager
    packageManager = await promptPackageManager();

    // 3. Backend & Architecture
    backend = await promptBackend();

    // 4. Database Selection
    database = await promptDatabase();

    // 5. Pre-flight Check for Backend Runtime
    const s = p.spinner();
    s.start(`Checking system runtime environment for ${pc.bold(backend.type)}...`);
    const checkResults = await inspectEnvironment(backend.type);
    const missing = checkResults.filter((r) => !r.installed);

    if (missing.length === 0) {
      s.stop(pc.green(`✓ All required runtimes (.NET / Node / Python) are verified & ready.`));
    } else {
      s.stop(pc.yellow(`⚠️ Some runtimes are missing on your machine.`));
      await handleMissingTools(missing);
    }

    // 6. Frontend & Features
    frontend = await promptFrontend();

    // 7. AI Skills & MCP Bundle
    ai = await promptAiSkills();
  } else {
    p.log.info(pc.dim('Non-interactive mode: Using configured flags or sensible defaults.'));
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  const config: ProjectConfig = {
    projectName,
    packageManager,
    backend,
    database,
    frontend,
    ai,
    targetDir,
  };

  // 8. Execute Scaffolding
  const scaffoldSpinner = p.spinner();
  scaffoldSpinner.start(`Scaffolding fullstack monorepo into ${pc.bold(pc.cyan(projectName))}...`);

  try {
    await scaffoldProject(config);
    scaffoldSpinner.stop(pc.green(`✓ Successfully assembled project!`));
  } catch (err: any) {
    scaffoldSpinner.stop(pc.red(`✗ Scaffolding failed.`));
    p.log.error(err.message || String(err));
    process.exit(1);
  }

  // 9. Summary & Next steps
  const dbInstruction =
    config.database === 'postgres' || config.database === 'mysql'
      ? `\n  2. ${pc.yellow('docker compose up -d')}     (Start local database)`
      : '';

  p.note(
    `Next steps to get started:\n\n` +
      `  1. ${pc.cyan(`cd ${config.projectName}`)}\n` +
      `  2. ${pc.cyan(`${config.packageManager} install`)}${dbInstruction}\n` +
      `  3. ${pc.cyan(`${config.packageManager} dev`)}         (Runs Backend & Frontend simultaneously!)\n\n` +
      `AI Agent super-powers loaded:\n` +
      `  • Agent instructions in ${pc.bold('AGENTS.md')}, ${pc.bold('CLAUDE.md')}, ${pc.bold('.cursorrules')}\n` +
      `  • Agent skills in ${pc.bold('.gemini/skills/')}\n` +
      `  • MCP servers in ${pc.bold('mcp.json')}`,
    pc.bold(pc.green('Project Ready! 🚀'))
  );

  p.outro(pc.bold(pc.cyan(`Happy coding with ${config.projectName}! ✨`)));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
