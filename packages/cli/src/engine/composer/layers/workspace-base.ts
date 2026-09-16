import type { FileOperation } from '../operations.js';

export function getWorkspaceBaseOperations(projectName: string, packageManager: string): FileOperation[] {
  const pmRun = packageManager === 'npm' ? 'npm run' : packageManager;
  const pmFilter = packageManager === 'pnpm' ? 'pnpm --filter' : packageManager === 'yarn' ? 'yarn workspace' : 'npm --workspace';

  const rootPackageJson = {
    name: projectName,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: `${pmFilter} ./apps/* --parallel dev`,
      build: `${pmFilter} ./packages/* --filter ./apps/* build`,
      test: `${pmFilter} ./packages/* --filter ./apps/* test`,
      lint: `${pmFilter} ./packages/* --filter ./apps/* lint`,
      format: `${pmFilter} ./packages/* --filter ./apps/* format`,
      'api:sync': 'dotnet run --project apps/backend/src/API/API.csproj -- --export-openapi && pnpm --filter @project/api-client generate',
      'infra:up': 'docker compose -f infra/compose.yaml up -d',
      'infra:down': 'docker compose -f infra/compose.yaml down',
      'db:migrate': 'dotnet run --project apps/backend/src/API/API.csproj -- --migrate',
      'db:seed': 'dotnet run --project apps/backend/src/API/API.csproj -- --seed',
    },
    devDependencies: {
      typescript: '^7.0.2',
    },
  };

  const gitignoreContent = [
    'node_modules/',
    'dist/',
    'build/',
    'bin/',
    'obj/',
    '.env',
    '.env.*',
    '!.env.example',
    '*.user',
    '*.suo',
  ].join('\n') + '\n';

  const envExampleContent = [
    `PROJECT_NAME=${projectName}`,
    'DB_HOST=localhost',
    'DB_PORT=5432',
    'DB_NAME=appdb',
    'DB_USER=postgres',
    'DB_PASSWORD=<db_password>',
    'CONNECTION_STRING=Host=localhost;Port=5432;Database=appdb;Username=postgres;Password=<db_password>',
  ].join('\n') + '\n';

  const composeContent = [
    'services:',
    '  postgres:',
    '    image: postgres:17-alpine',
    `    container_name: ${projectName}-postgres`,
    '    environment:',
    '      POSTGRES_DB: ${DB_NAME:-appdb}',
    '      POSTGRES_USER: ${DB_USER:-postgres}',
    '      POSTGRES_PASSWORD: ${DB_PASSWORD}',
    '    ports:',
    '      - "${DB_PORT:-5432}:5432"',
    '    volumes:',
    '      - pgdata:/var/lib/postgresql/data',
    '    healthcheck:',
    '      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-appdb}"]',
    '      interval: 5s',
    '      timeout: 5s',
    '      retries: 5',
    '',
    'volumes:',
    '  pgdata:',
    '',
  ].join('\n');

  const readmeContent = [
    `# ${projectName}`,
    '',
    'Full-stack project generated with [Template-P](https://github.com/ThienHN0910/Template-P).',
    '',
    '## Getting Started',
    '',
    '```bash',
    '# 1. Start database container',
    `${pmRun} infra:up`,
    '',
    '# 2. Start development servers',
    `${pmRun} dev`,
    '```',
    '',
  ].join('\n');

  return [
    { kind: 'createFile', path: 'package.json', content: JSON.stringify(rootPackageJson, null, 2) + '\n' },
    { kind: 'createFile', path: '.gitignore', content: gitignoreContent },
    { kind: 'createFile', path: '.env.example', content: envExampleContent },
    { kind: 'createFile', path: 'infra/compose.yaml', content: composeContent },
    { kind: 'createFile', path: 'README.md', content: readmeContent },
  ];
}
