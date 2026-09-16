import type { FileOperation } from '../operations.js';

export function getWorkspaceBaseOperations(
  projectName: string,
  packageManager: string,
  database = 'postgresql',
): FileOperation[] {
  const pmRun = packageManager === 'npm' ? 'npm run' : packageManager;
  const pmFilter = packageManager === 'pnpm' ? 'pnpm --filter' : packageManager === 'yarn' ? 'yarn workspace' : 'npm --workspace';

  const db = database.replace(/^database\//, '').toLowerCase();

  let envExampleContent = '';
  let composeContent: string | null = null;

  switch (db) {
    case 'mysql':
      envExampleContent = [
        `PROJECT_NAME=${projectName}`,
        'DB_HOST=localhost',
        'DB_PORT=3306',
        'DB_NAME=appdb',
        'DB_USER=root',
        'DB_PASSWORD=<db_password>',
        'CONNECTION_STRING=Server=localhost;Port=3306;Database=appdb;User=root;Password=<db_password>;',
      ].join('\n') + '\n';

      composeContent = [
        'services:',
        '  mysql:',
        '    image: mysql:8.4',
        `    container_name: ${projectName}-mysql`,
        '    environment:',
        '      MYSQL_DATABASE: ${DB_NAME:-appdb}',
        '      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}',
        '    ports:',
        '      - "3306:3306"',
        '    volumes:',
        '      - mysqldata:/var/lib/mysql',
        '    healthcheck:',
        '      test: ["CMD-SHELL", "mysqladmin ping -h localhost"]',
        '      interval: 5s',
        '      timeout: 5s',
        '      retries: 5',
        '',
        'volumes:',
        '  mysqldata:',
        '',
      ].join('\n');
      break;

    case 'sqlserver':
      envExampleContent = [
        `PROJECT_NAME=${projectName}`,
        'DB_HOST=localhost',
        'DB_PORT=1433',
        'DB_NAME=appdb',
        'DB_USER=sa',
        'DB_PASSWORD=<db_password>',
        'CONNECTION_STRING=Server=localhost,1433;Database=appdb;User Id=sa;Password=<db_password>;TrustServerCertificate=True;',
      ].join('\n') + '\n';

      composeContent = [
        'services:',
        '  sqlserver:',
        '    image: mcr.microsoft.com/mssql/server:2022-latest',
        `    container_name: ${projectName}-sqlserver`,
        '    environment:',
        '      - ACCEPT_EULA=Y',
        '      - MSSQL_SA_PASSWORD=${DB_PASSWORD}',
        '    ports:',
        '      - "1433:1433"',
        '    volumes:',
        '      - mssqldata:/var/opt/mssql',
        '    healthcheck:',
        '      test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P \\"$MSSQL_SA_PASSWORD\\" -C -Q \\"SELECT 1\\" || /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P \\"$MSSQL_SA_PASSWORD\\" -Q \\"SELECT 1\\""]',
        '      interval: 10s',
        '      timeout: 5s',
        '      retries: 5',
        '',
        'volumes:',
        '  mssqldata:',
        '',
      ].join('\n');
      break;

    case 'mongodb':
      envExampleContent = [
        `PROJECT_NAME=${projectName}`,
        'DB_HOST=localhost',
        'DB_PORT=27017',
        'DB_NAME=appdb',
        'DB_USER=root',
        'DB_PASSWORD=<db_password>',
        'CONNECTION_STRING=mongodb://root:<db_password>@localhost:27017/appdb?authSource=admin',
      ].join('\n') + '\n';

      composeContent = [
        'services:',
        '  mongodb:',
        '    image: mongo:7',
        `    container_name: ${projectName}-mongodb`,
        '    environment:',
        '      MONGO_INITDB_ROOT_USERNAME: ${DB_USER:-root}',
        '      MONGO_INITDB_ROOT_PASSWORD: ${DB_PASSWORD}',
        '      MONGO_INITDB_DATABASE: ${DB_NAME:-appdb}',
        '    ports:',
        '      - "27017:27017"',
        '    volumes:',
        '      - mongodata:/data/db',
        '    healthcheck:',
        '      test: ["CMD-SHELL", "mongosh --eval \'db.runCommand({ ping: 1 })\' || mongo --eval \'db.runCommand({ ping: 1 })\'"]',
        '      interval: 5s',
        '      timeout: 5s',
        '      retries: 5',
        '',
        'volumes:',
        '  mongodata:',
        '',
      ].join('\n');
      break;

    case 'sqlite':
      envExampleContent = [
        `PROJECT_NAME=${projectName}`,
        'CONNECTION_STRING=Data Source=app.db',
      ].join('\n') + '\n';
      composeContent = null;
      break;

    case 'none':
      envExampleContent = [
        `PROJECT_NAME=${projectName}`,
      ].join('\n') + '\n';
      composeContent = null;
      break;

    case 'postgresql':
    default:
      envExampleContent = [
        `PROJECT_NAME=${projectName}`,
        'DB_HOST=localhost',
        'DB_PORT=5432',
        'DB_NAME=appdb',
        'DB_USER=postgres',
        'DB_PASSWORD=<db_password>',
        'CONNECTION_STRING=Host=localhost;Port=5432;Database=appdb;Username=postgres;Password=<db_password>',
      ].join('\n') + '\n';

      composeContent = [
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
      break;
  }

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

  const readmeLines = [
    `# ${projectName}`,
    '',
    'Full-stack project generated with [Template-P](https://github.com/ThienHN0910/Template-P).',
    '',
    '## Getting Started',
    '',
    '```bash',
  ];

  if (composeContent !== null) {
    readmeLines.push(
      '# 1. Start database container',
      `${pmRun} infra:up`,
      '',
      '# 2. Start development servers',
      `${pmRun} dev`,
    );
  } else {
    readmeLines.push(
      '# Start development servers',
      `${pmRun} dev`,
    );
  }

  readmeLines.push('```', '');
  const readmeContent = readmeLines.join('\n');

  const operations: FileOperation[] = [
    { kind: 'createFile', path: 'package.json', content: JSON.stringify(rootPackageJson, null, 2) + '\n' },
    { kind: 'createFile', path: '.gitignore', content: gitignoreContent },
    { kind: 'createFile', path: '.env.example', content: envExampleContent },
  ];

  if (composeContent !== null) {
    operations.push({ kind: 'createFile', path: 'infra/compose.yaml', content: composeContent });
  }

  operations.push({ kind: 'createFile', path: 'README.md', content: readmeContent });

  return operations;
}
