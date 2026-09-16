import { describe, expect, it } from 'vitest';
import { resolveCapabilities } from '../../src/engine/resolver/resolver.js';
import { generateManifest, serializeManifest } from '../../src/engine/manifest/manifest.js';
import type { StackConfiguration } from '../../src/engine/configuration/schema.js';

describe('Project Manifest Generator', () => {
  it('generates a clean, credential-free manifest', () => {
    const config: StackConfiguration = {
      schemaVersion: 1,
      project: { name: 'manifest-test', packageManager: 'pnpm' },
      backend: { runtime: 'dotnet', framework: 'aspnet-core', architecture: 'clean' },
      persistence: { database: 'postgresql' },
      frontend: { framework: 'react', rendering: 'spa', styling: 'tailwind', features: [] },
      capabilities: {},
    };

    const resolution = resolveCapabilities(config);
    const manifest = generateManifest(resolution);

    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.projectName).toBe('manifest-test');
    expect(manifest.capabilities).toContain('runtime/dotnet');
    expect(manifest.supportTier).toBe('verified');

    const json = serializeManifest(manifest);
    expect(json).not.toContain('password');
    expect(json).not.toContain('secret');
  });
});
