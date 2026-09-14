import { ProjectConfig } from '../types.js';

export interface EnvPair {
  envContent: string;
  envExampleContent: string;
}

export function generateEnvPair(config: ProjectConfig): EnvPair {
  const dbName = `${config.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_db`;

  let localDbUrl = '';
  let exampleDbUrl = '';

  if (config.database === 'postgres') {
    localDbUrl = `postgresql://postgres:postgres@localhost:5432/${dbName}`;
    exampleDbUrl = `postgresql://<username>:<password>@<host>:5432/<database_name>`;
  } else if (config.database === 'mysql') {
    localDbUrl = `mysql://root:root@localhost:3306/${dbName}`;
    exampleDbUrl = `mysql://<username>:<password>@<host>:3306/<database_name>`;
  } else if (config.database === 'sqlite') {
    localDbUrl = `sqlite:///./app.db`;
    exampleDbUrl = `sqlite:///./app.db`;
  }

  const bePort = config.backend.type === 'dotnet' ? '5050' : config.backend.type === 'fastapi' ? '8000' : '4000';
  const fePort = config.frontend.type === 'nextjs' ? '3000' : config.frontend.type === 'nuxt3' ? '3001' : '5173';

  const envContent = `# ==============================================================================
# LOCAL DEVELOPMENT ENVIRONMENT VARIABLES (.env)
# ==============================================================================
NODE_ENV=development
PROJECT_NAME=${config.projectName}

# Network Ports
PORT=${bePort}
BACKEND_PORT=${bePort}
FRONTEND_PORT=${fePort}

# Database
DATABASE_PROVIDER=${config.database}
DATABASE_URL=${localDbUrl}
`;

  const envExampleContent = `# ==============================================================================
# SANITIZED ENVIRONMENT VARIABLES TEMPLATE (.env.example)
# RULE: NEVER COMMIT REAL SECRETS, PRIVATE KEYS OR API KEYS TO GIT REPOSITORY
# ==============================================================================
NODE_ENV=development
PROJECT_NAME=${config.projectName}

# Network Ports
PORT=${bePort}
BACKEND_PORT=${bePort}
FRONTEND_PORT=${fePort}

# Database
DATABASE_PROVIDER=${config.database}
DATABASE_URL=${exampleDbUrl}
`;

  return { envContent, envExampleContent };
}
