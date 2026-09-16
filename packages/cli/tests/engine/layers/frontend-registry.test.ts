import { describe, expect, it } from 'vitest';
import { getBuiltinRegistry } from '../../../src/engine/registry/registry.js';
import { normalizeConfiguration, normalizeLegacyOptions } from '../../../src/engine/configuration/normalizer.js';
import { resolveCapabilities } from '../../../src/engine/resolver/resolver.js';

describe('Frontend Registry & Normalizer', () => {
  it('registers frontend/next and frontend/nuxt capabilities', () => {
    const registry = getBuiltinRegistry();
    const nextCap = registry.get('frontend/next');
    const nuxtCap = registry.get('frontend/nuxt');

    expect(nextCap).toBeDefined();
    expect(nextCap?.kind).toBe('frontend');
    expect(nextCap?.support).toBe('verified');

    expect(nuxtCap).toBeDefined();
    expect(nuxtCap?.kind).toBe('frontend');
    expect(nuxtCap?.support).toBe('verified');
  });

  it('normalizes legacy frontend choices nextjs and nuxt3', () => {
    const nextConfig = normalizeConfiguration({
      schemaVersion: 1,
      project: { name: 'my-next-app', packageManager: 'pnpm' },
      backend: { runtime: 'node', framework: 'express', architecture: 'clean' },
      persistence: { database: 'none' },
      frontend: { framework: 'next', rendering: 'hybrid', styling: 'tailwind', features: [] },
      capabilities: {},
    });
    expect(nextConfig.frontend.framework).toBe('next');

    const nuxtConfig = normalizeConfiguration({
      schemaVersion: 1,
      project: { name: 'my-nuxt-app', packageManager: 'pnpm' },
      backend: { runtime: 'python', framework: 'fastapi', architecture: 'modular' },
      persistence: { database: 'none' },
      frontend: { framework: 'nuxt', rendering: 'hybrid', styling: 'tailwind', features: [] },
      capabilities: {},
    });
    expect(nuxtConfig.frontend.framework).toBe('nuxt');

    const legacyNext = normalizeLegacyOptions({
      frontendChoice: 'nextjs',
    });
    expect(legacyNext.frontend.framework).toBe('next');

    const legacyNuxt = normalizeLegacyOptions({
      frontendChoice: 'nuxt3',
    });
    expect(legacyNuxt.frontend.framework).toBe('nuxt');

    const legacyNextRaw = normalizeConfiguration({
      schemaVersion: 1,
      project: { name: 'legacy-next-raw', packageManager: 'pnpm' },
      backend: { runtime: 'node', framework: 'express', architecture: 'clean' },
      persistence: { database: 'none' },
      frontend: { framework: 'nextjs' as any, rendering: 'hybrid', styling: 'tailwind', features: [] },
      capabilities: {},
    });
    expect(legacyNextRaw.frontend.framework).toBe('next');

    const legacyNuxtRaw = normalizeConfiguration({
      schemaVersion: 1,
      project: { name: 'legacy-nuxt-raw', packageManager: 'pnpm' },
      backend: { runtime: 'node', framework: 'express', architecture: 'clean' },
      persistence: { database: 'none' },
      frontend: { framework: 'nuxt3' as any, rendering: 'hybrid', styling: 'tailwind', features: [] },
      capabilities: {},
    });
    expect(legacyNuxtRaw.frontend.framework).toBe('nuxt');
  });

  it('resolves frontend capabilities properly', () => {
    const registry = getBuiltinRegistry();
    const config = normalizeConfiguration({
      schemaVersion: 1,
      project: { name: 'test-app', packageManager: 'pnpm' },
      backend: { runtime: 'python', framework: 'fastapi', architecture: 'modular' },
      persistence: { database: 'sqlite' },
      frontend: { framework: 'nuxt', rendering: 'hybrid', styling: 'tailwind', features: [] },
      capabilities: {},
    });
    const resolution = resolveCapabilities(config, registry);
    expect(resolution.resolvedIds).toContain('frontend/nuxt');
    expect(resolution.resolvedIds).toContain('runtime/node');
  });
});
