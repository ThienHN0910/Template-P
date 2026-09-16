import { describe, expect, it } from 'vitest';
import { normalizeConfiguration, normalizeLegacyOptions } from '../../src/engine/configuration/normalizer.js';
import { BUILTIN_PRESETS } from '../../src/engine/configuration/presets.js';

describe('Engine Configuration Normalizer', () => {
  it('normalizes a valid v3 stack configuration', () => {
    const raw = {
      schemaVersion: 1,
      project: { name: 'my-app', packageManager: 'pnpm' },
      backend: { runtime: 'dotnet', framework: 'aspnet-core', architecture: 'clean' },
      persistence: { database: 'postgresql' },
      frontend: { framework: 'react', rendering: 'spa', styling: 'tailwind', features: ['theme'] },
      capabilities: { ai: ['matt-pocock-skills'] },
    };

    const config = normalizeConfiguration(raw);
    expect(config.schemaVersion).toBe(1);
    expect(config.project.name).toBe('my-app');
    expect(config.backend.runtime).toBe('dotnet');
    expect(config.persistence.database).toBe('postgresql');
    expect(config.frontend.framework).toBe('react');
  });

  it('translates legacy v2 CLI options into normalized v3 configuration', () => {
    const legacy = {
      projectName: 'legacy-demo',
      packageManager: 'npm',
      backendChoice: 'dotnet',
      backendArch: 'clean',
      databaseChoice: 'postgresql',
      frontendChoice: 'vue',
      vueStyle: 'tailwind',
      vueFeatures: ['theme', 'i18n'],
      aiSkills: ['matt-pocock-skills'],
    };

    const config = normalizeLegacyOptions(legacy);
    expect(config.schemaVersion).toBe(1);
    expect(config.project.name).toBe('legacy-demo');
    expect(config.project.packageManager).toBe('npm');
    expect(config.backend.runtime).toBe('dotnet');
    expect(config.backend.architecture).toBe('clean');
    expect(config.persistence.database).toBe('postgresql');
    expect(config.frontend.framework).toBe('vue');
  });

  it('rejects blank architecture with an active database', () => {
    const invalid = {
      schemaVersion: 1,
      project: { name: 'invalid-app', packageManager: 'pnpm' },
      backend: { runtime: 'node', framework: 'express', architecture: 'blank' },
      persistence: { database: 'postgresql' },
      frontend: { framework: 'none', rendering: 'none', styling: 'none', features: [] },
      capabilities: {},
    };

    expect(() => normalizeConfiguration(invalid)).toThrowError(
      /blank architecture requires database "none"/i,
    );
  });

  it('contains verified built-in presets', () => {
    expect(BUILTIN_PRESETS['dotnet-clean-react']).toBeDefined();
    expect(BUILTIN_PRESETS['dotnet-clean-react'].backend.runtime).toBe('dotnet');
  });
});
