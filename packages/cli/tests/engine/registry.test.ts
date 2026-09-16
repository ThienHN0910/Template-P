import { describe, expect, it } from 'vitest';
import { getBuiltinRegistry } from '../../src/engine/registry/registry.js';

describe('Capability Registry', () => {
  it('registers and retrieves built-in capabilities', () => {
    const registry = getBuiltinRegistry();
    const dotnetRuntime = registry.get('runtime/dotnet');
    expect(dotnetRuntime).toBeDefined();
    expect(dotnetRuntime?.kind).toBe('runtime');
    expect(dotnetRuntime?.support).toBe('verified');
  });

  it('finds capabilities providing a specific contract', () => {
    const registry = getBuiltinRegistry();
    const dbProviders = registry.findByProvided('persistence:database');
    expect(dbProviders.length).toBeGreaterThan(0);
    expect(dbProviders.some((c) => c.id === 'database/postgresql')).toBe(true);
  });

  it('rejects duplicate capability registration', () => {
    const registry = getBuiltinRegistry();
    const cap = registry.get('runtime/dotnet')!;
    expect(() => registry.register(cap)).toThrowError(/already registered/i);
  });
});
