import { describe, expect, it } from 'vitest';
import { resolveCapabilities } from '../../src/engine/resolver/resolver.js';
import type { StackConfiguration } from '../../src/engine/configuration/schema.js';

describe('Capability Resolver', () => {
  it('resolves a valid dotnet clean react configuration into ordered dependencies', () => {
    const config: StackConfiguration = {
      schemaVersion: 1,
      project: { name: 'test-app', packageManager: 'pnpm' },
      backend: { runtime: 'dotnet', framework: 'aspnet-core', architecture: 'clean' },
      persistence: { database: 'postgresql' },
      frontend: { framework: 'react', rendering: 'spa', styling: 'tailwind', features: [] },
      capabilities: {},
    };

    const result = resolveCapabilities(config);
    expect(result.resolvedIds).toContain('runtime/dotnet');
    expect(result.resolvedIds).toContain('backend/aspnet-core');
    expect(result.resolvedIds).toContain('architecture/clean');
    expect(result.resolvedIds).toContain('database/postgresql');
    expect(result.resolvedIds).toContain('frontend/react');
    expect(result.supportTier).toBe('verified');

    const dotnetIndex = result.orderedCapabilities.findIndex((c) => c.id === 'runtime/dotnet');
    const aspnetIndex = result.orderedCapabilities.findIndex((c) => c.id === 'backend/aspnet-core');
    expect(dotnetIndex).toBeLessThan(aspnetIndex);
  });

  it('detects conflicts and throws a descriptive error', () => {
    const invalidConfig: StackConfiguration = {
      schemaVersion: 1,
      project: { name: 'conflict-app', packageManager: 'pnpm' },
      backend: { runtime: 'dotnet', framework: 'aspnet-core', architecture: 'blank' },
      persistence: { database: 'postgresql' },
      frontend: { framework: 'none', rendering: 'none', styling: 'none', features: [] },
      capabilities: {},
    };

    expect(() => resolveCapabilities(invalidConfig)).toThrowError(/conflict/i);
  });
});
