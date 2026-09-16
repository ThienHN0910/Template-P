import type { StackConfiguration } from './schema.js';

export const BUILTIN_PRESETS: Record<string, StackConfiguration> = {
  'dotnet-clean-react': {
    schemaVersion: 1,
    project: { name: 'dotnet-clean-react', packageManager: 'pnpm' },
    backend: { runtime: 'dotnet', framework: 'aspnet-core', architecture: 'clean' },
    persistence: { database: 'postgresql', adapter: 'data-access/dotnet/ef-core/postgresql' },
    frontend: { framework: 'react', rendering: 'spa', styling: 'tailwind', features: ['theme'] },
    capabilities: {},
  },
  'node-fastify-clean-vue': {
    schemaVersion: 1,
    project: { name: 'node-fastify-clean-vue', packageManager: 'pnpm' },
    backend: { runtime: 'node', framework: 'fastify', architecture: 'clean' },
    persistence: { database: 'postgresql', adapter: 'data-access/node/prisma/postgresql' },
    frontend: { framework: 'vue', rendering: 'spa', styling: 'tailwind', features: ['theme', 'i18n'] },
    capabilities: {},
  },
  'fastapi-modular-react': {
    schemaVersion: 1,
    project: { name: 'fastapi-modular-react', packageManager: 'npm' },
    backend: { runtime: 'python', framework: 'fastapi', architecture: 'modular' },
    persistence: { database: 'postgresql', adapter: 'data-access/python/sqlalchemy/postgresql' },
    frontend: { framework: 'react', rendering: 'spa', styling: 'tailwind', features: ['theme'] },
    capabilities: {},
  },
};
