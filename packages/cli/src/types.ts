export type PackageManager = 'pnpm' | 'npm' | 'bun';

export type BackendType = 'dotnet' | 'node' | 'fastapi';
export type DotNetArch = 'webapi-ddd' | 'webapi-mvc' | 'blank';
export type NodeArch = 'express-ddd' | 'fastify-clean' | 'blank';
export type FastAPIArch = 'modular' | 'blank';

export type DatabaseChoice = 'postgres' | 'mysql' | 'sqlite' | 'none';

export type FrontendType = 'vue3' | 'react' | 'nextjs' | 'nuxt3';

export interface FrontendFeatures {
  typescript: boolean;
  router: boolean;
  stateManagement: 'pinia' | 'zustand' | 'none';
  linter: 'eslint' | 'none';
  prettier: boolean;
  vitest: boolean;
  darkMode: boolean;
  styling: 'scss' | 'tailwind' | 'css';
  i18n: boolean;
}

export interface AiSkillsChoice {
  packages: string[];
  mcp: boolean;
}

export interface ProjectConfig {
  projectName: string;
  packageManager: PackageManager;
  backend: {
    type: BackendType;
    architecture: string;
    version?: string;
  };
  database: DatabaseChoice;
  frontend: {
    type: FrontendType;
    features: FrontendFeatures;
  };
  ai: AiSkillsChoice;
  targetDir: string;
}

export interface CliOptions {
  name?: string;
  backend?: string;
  frontend?: string;
  db?: string;
  pm?: string;
  yes?: boolean;
}
