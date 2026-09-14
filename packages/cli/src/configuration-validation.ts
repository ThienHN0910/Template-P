import { BackendType, DatabaseChoice, FrontendType, PackageManager } from './types.js';

const architecturesByBackend: Record<BackendType, readonly string[]> = {
  dotnet: ['webapi-ddd', 'webapi-mvc', 'blank'],
  node: ['express-ddd', 'fastify-clean', 'blank'],
  fastapi: ['modular', 'blank'],
};

const backendTypes = new Set<BackendType>(['dotnet', 'node', 'fastapi']);
const frontendTypes = new Set<FrontendType>(['vue3', 'react', 'nextjs', 'nuxt3']);
const databaseChoices = new Set<DatabaseChoice>(['postgres', 'mysql', 'sqlite', 'none']);
const packageManagers = new Set<PackageManager>(['pnpm', 'npm', 'bun']);

export interface ProjectSelection {
  backend: string;
  architecture: string;
  frontend: string;
  database: string;
  packageManager: string;
}

export function assertSupportedProjectSelection(selection: ProjectSelection): void {
  if (!backendTypes.has(selection.backend as BackendType)) {
    throw new Error(`Unsupported backend: ${selection.backend}`);
  }

  const backend = selection.backend as BackendType;
  if (!architecturesByBackend[backend].includes(selection.architecture)) {
    throw new Error(`Unsupported architecture "${selection.architecture}" for backend "${backend}".`);
  }

  if (!frontendTypes.has(selection.frontend as FrontendType)) {
    throw new Error(`Unsupported frontend: ${selection.frontend}`);
  }

  if (!databaseChoices.has(selection.database as DatabaseChoice)) {
    throw new Error(`Unsupported database: ${selection.database}`);
  }

  if (!packageManagers.has(selection.packageManager as PackageManager)) {
    throw new Error(`Unsupported package manager: ${selection.packageManager}`);
  }
}
