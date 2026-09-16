import type { StackConfiguration } from './schema.js';

export function normalizeConfiguration(input: unknown): StackConfiguration {
  if (!input || typeof input !== 'object') {
    throw new Error('Configuration must be a non-null object.');
  }

  const raw = input as Record<string, any>;
  if (raw.schemaVersion !== 1) {
    throw new Error('Unsupported schemaVersion. Expected schemaVersion: 1.');
  }

  const backend = raw.backend ?? {};
  const persistence = raw.persistence ?? { database: 'none' };
  const frontend = raw.frontend ?? { framework: 'none', rendering: 'none', styling: 'none', features: [] };
  const project = raw.project ?? { name: 'app', packageManager: 'pnpm' };

  if (backend.architecture === 'blank' && persistence.database !== 'none') {
    throw new Error('Blank architecture requires database "none".');
  }

  let framework = frontend.framework || 'none';
  if (framework === 'nextjs') framework = 'next';
  if (framework === 'nuxt3') framework = 'nuxt';

  return {
    schemaVersion: 1,
    project: {
      name: String(project.name || 'template-p-app'),
      packageManager: project.packageManager || 'pnpm',
    },
    backend: {
      runtime: backend.runtime,
      framework: backend.framework,
      architecture: backend.architecture,
    },
    persistence: {
      database: persistence.database || 'none',
      adapter: persistence.adapter,
    },
    frontend: {
      framework,
      rendering: frontend.rendering || (framework === 'none' ? 'none' : (framework === 'next' || framework === 'nuxt' ? 'hybrid' : 'spa')),
      styling: frontend.styling || 'none',
      features: Array.isArray(frontend.features) ? frontend.features : [],
    },
    capabilities: raw.capabilities || {},
  };
}

export function normalizeLegacyOptions(legacy: Record<string, any>): StackConfiguration {
  let runtime: 'dotnet' | 'node' | 'python' = 'node';
  let framework = 'express';
  let architecture: 'clean' | 'modular' | 'mvc' | 'minimal' | 'blank' = 'clean';

  if (legacy.backendChoice === 'dotnet') {
    runtime = 'dotnet';
    framework = 'aspnet-core';
    architecture = legacy.backendArch === 'mvc' ? 'mvc' : legacy.backendArch === 'blank' ? 'blank' : 'clean';
  } else if (legacy.backendChoice === 'python' || legacy.backendChoice === 'fastapi') {
    runtime = 'python';
    framework = 'fastapi';
    architecture = legacy.backendArch === 'blank' ? 'blank' : 'modular';
  } else {
    runtime = 'node';
    if (legacy.backendArch === 'fastify-clean') {
      framework = 'fastify';
      architecture = 'clean';
    } else if (legacy.backendArch === 'blank') {
      framework = 'node';
      architecture = 'blank';
    } else {
      framework = 'express';
      architecture = 'clean';
    }
  }

  let frontendFramework: 'vue' | 'react' | 'next' | 'nuxt' | 'none' = 'none';
  if (legacy.frontendChoice === 'vue') frontendFramework = 'vue';
  else if (legacy.frontendChoice === 'react') frontendFramework = 'react';
  else if (legacy.frontendChoice === 'nextjs' || legacy.frontendChoice === 'next') frontendFramework = 'next';
  else if (legacy.frontendChoice === 'nuxt3' || legacy.frontendChoice === 'nuxt') frontendFramework = 'nuxt';

  const styling = legacy.vueStyle || legacy.reactStyle || 'tailwind';
  const features = legacy.vueFeatures || legacy.reactFeatures || [];

  return normalizeConfiguration({
    schemaVersion: 1,
    project: {
      name: legacy.projectName || 'my-app',
      packageManager: legacy.packageManager || 'pnpm',
    },
    backend: {
      runtime,
      framework,
      architecture,
    },
    persistence: {
      database: architecture === 'blank' ? 'none' : (legacy.databaseChoice || 'postgresql'),
    },
    frontend: {
      framework: frontendFramework,
      rendering: frontendFramework === 'none' ? 'none' : (frontendFramework === 'next' || frontendFramework === 'nuxt' ? 'hybrid' : 'spa'),
      styling,
      features,
    },
    capabilities: {
      ai: legacy.aiSkills || [],
    },
  });
}
