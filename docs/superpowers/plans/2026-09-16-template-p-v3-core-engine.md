# Template-P v3 Core Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver Increment 02 of the approved Template-P v3 architecture: normalized configuration model, capability registry, dependency resolver, execution planner, typed composition operations, and manifest serialization without template expansion.

**Architecture:** A deterministic, layered project-generation pipeline that separates configuration normalization, capability resolution, dependency graph ordering, execution planning, typed file composition, and project manifest tracking into testable, decoupled modules in `packages/cli/src/engine/`.

**Tech Stack:** TypeScript 7, Node.js 22.13+ / 24, Vitest 5, tsup, pnpm 11.15.1.

**Spec:** `docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md`

## Global Constraints

- Keep the repository name `ThienHN0910/Template-P` and npm package name `@thienhn/create-template`.
- Keep `create-template` as the canonical executable and `create-p-stack` as a compatibility alias.
- Use professional English for all code, comments, errors, log output, and documentation.
- Framework and architecture must remain separate values; composite identifiers like `express-ddd` are parsed and normalized into explicit fields.
- `architecture: "blank"` requires `database: "none"`.
- `frontend.framework: "none"` is a first-class API-only selection.
- Resolver support-tier precedence is `deprecated`, then `experimental`, then `verified`.
- `--dry-run` must produce the full execution plan without writing files to disk or running network operations.
- All file operations must be idempotent; applying the same plan twice must not duplicate declarations.
- Every commit must follow Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`).

---

### Task 1: Normalized Configuration Schema & Legacy Adapter

**Files:**
- Create: `packages/cli/src/engine/configuration/schema.ts`
- Create: `packages/cli/src/engine/configuration/normalizer.ts`
- Create: `packages/cli/src/engine/configuration/presets.ts`
- Test: `packages/cli/tests/engine/configuration.test.ts`

**Interfaces:**
- Produces:
  - `interface StackConfiguration`
  - `function normalizeConfiguration(input: unknown): StackConfiguration`
  - `function normalizeLegacyOptions(legacyOptions: Record<string, unknown>): StackConfiguration`
  - `const BUILTIN_PRESETS: Record<string, StackConfiguration>`

- [ ] **Step 1: Write the failing test for configuration normalization**

Create `packages/cli/tests/engine/configuration.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/configuration.test.ts`
Expected: FAIL due to missing files.

- [ ] **Step 3: Write schema and normalization implementation**

Create `packages/cli/src/engine/configuration/schema.ts`:
```ts
export interface StackConfiguration {
  schemaVersion: 1;
  project: {
    name: string;
    packageManager: 'pnpm' | 'npm' | 'bun';
  };
  backend: {
    runtime: 'dotnet' | 'node' | 'python';
    framework: string;
    architecture: 'clean' | 'modular' | 'mvc' | 'minimal' | 'blank';
  };
  persistence: {
    database:
      | 'postgresql'
      | 'sqlserver'
      | 'mysql'
      | 'sqlite'
      | 'mongodb'
      | 'none';
    adapter?: string;
  };
  frontend: {
    framework: 'vue' | 'react' | 'next' | 'nuxt' | 'none';
    rendering: 'spa' | 'ssr' | 'hybrid' | 'none';
    styling: string;
    features: string[];
  };
  capabilities: {
    auth?: string;
    cache?: string;
    jobs?: string;
    observability?: string;
    ai?: string[];
  };
}
```

Create `packages/cli/src/engine/configuration/presets.ts`:
```ts
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
```

Create `packages/cli/src/engine/configuration/normalizer.ts`:
```ts
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
      framework: frontend.framework || 'none',
      rendering: frontend.rendering || (frontend.framework === 'none' ? 'none' : 'spa'),
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
  else if (legacy.frontendChoice === 'nextjs') frontendFramework = 'next';
  else if (legacy.frontendChoice === 'nuxt3') frontendFramework = 'nuxt';

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
      rendering: frontendFramework === 'none' ? 'none' : 'spa',
      styling,
      features,
    },
    capabilities: {
      ai: legacy.aiSkills || [],
    },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/configuration.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/configuration packages/cli/tests/engine/configuration.test.ts
git commit -m "feat(engine): add normalized configuration schema, presets, and normalizer"
```

---

### Task 2: Capability Registry & Definition Contracts

**Files:**
- Create: `packages/cli/src/engine/registry/types.ts`
- Create: `packages/cli/src/engine/registry/definitions.ts`
- Create: `packages/cli/src/engine/registry/registry.ts`
- Test: `packages/cli/tests/engine/registry.test.ts`

**Interfaces:**
- Produces:
  - `interface CapabilityDefinition`
  - `class CapabilityRegistry`
  - `function getBuiltinRegistry(): CapabilityRegistry`

- [ ] **Step 1: Write the failing test for capability registry**

Create `packages/cli/tests/engine/registry.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/registry.test.ts`
Expected: FAIL due to missing registry.

- [ ] **Step 3: Implement capability types, definitions, and registry**

Create `packages/cli/src/engine/registry/types.ts`:
```ts
export type CapabilityKind =
  | 'runtime'
  | 'framework'
  | 'architecture'
  | 'database'
  | 'data-access'
  | 'frontend'
  | 'feature';

export type SupportTier = 'verified' | 'experimental' | 'deprecated';

export interface CapabilityConstraint {
  target: string;
  kind?: CapabilityKind;
  reason?: string;
}

export interface RuntimeRequirement {
  name: 'dotnet' | 'node' | 'python';
  minVersion: string;
}

export interface HostRequirement {
  os?: ('win32' | 'darwin' | 'linux')[];
  arch?: ('x64' | 'arm64')[];
}

export interface CapabilityDependency {
  id: string;
  optional?: boolean;
}

export interface CapabilityDefinition {
  id: string;
  version: string;
  kind: CapabilityKind;
  support: SupportTier;
  provides: string[];
  requires: CapabilityConstraint[];
  conflicts: CapabilityConstraint[];
  runtimeRequirements: RuntimeRequirement[];
  hostRequirements?: HostRequirement[];
  dependencies: CapabilityDependency[];
}
```

Create `packages/cli/src/engine/registry/definitions.ts`:
```ts
import type { CapabilityDefinition } from './types.js';

export const CORE_CAPABILITIES: CapabilityDefinition[] = [
  {
    id: 'runtime/dotnet',
    version: '1.0.0',
    kind: 'runtime',
    support: 'verified',
    provides: ['runtime:dotnet'],
    requires: [],
    conflicts: [],
    runtimeRequirements: [{ name: 'dotnet', minVersion: '10.0.0' }],
    dependencies: [],
  },
  {
    id: 'runtime/node',
    version: '1.0.0',
    kind: 'runtime',
    support: 'verified',
    provides: ['runtime:node'],
    requires: [],
    conflicts: [],
    runtimeRequirements: [{ name: 'node', minVersion: '22.13.0' }],
    dependencies: [],
  },
  {
    id: 'runtime/python',
    version: '1.0.0',
    kind: 'runtime',
    support: 'verified',
    provides: ['runtime:python'],
    requires: [],
    conflicts: [],
    runtimeRequirements: [{ name: 'python', minVersion: '3.13.0' }],
    dependencies: [],
  },
  {
    id: 'backend/aspnet-core',
    version: '1.0.0',
    kind: 'framework',
    support: 'verified',
    provides: ['backend:framework'],
    requires: [{ target: 'runtime:dotnet' }],
    conflicts: [],
    runtimeRequirements: [],
    dependencies: [{ id: 'runtime/dotnet' }],
  },
  {
    id: 'backend/fastify',
    version: '1.0.0',
    kind: 'framework',
    support: 'verified',
    provides: ['backend:framework'],
    requires: [{ target: 'runtime:node' }],
    conflicts: [],
    runtimeRequirements: [],
    dependencies: [{ id: 'runtime/node' }],
  },
  {
    id: 'backend/express',
    version: '1.0.0',
    kind: 'framework',
    support: 'verified',
    provides: ['backend:framework'],
    requires: [{ target: 'runtime:node' }],
    conflicts: [],
    runtimeRequirements: [],
    dependencies: [{ id: 'runtime/node' }],
  },
  {
    id: 'backend/fastapi',
    version: '1.0.0',
    kind: 'framework',
    support: 'verified',
    provides: ['backend:framework'],
    requires: [{ target: 'runtime:python' }],
    conflicts: [],
    runtimeRequirements: [],
    dependencies: [{ id: 'runtime/python' }],
  },
  {
    id: 'architecture/clean',
    version: '1.0.0',
    kind: 'architecture',
    support: 'verified',
    provides: ['backend:architecture'],
    requires: [{ target: 'backend:framework' }],
    conflicts: [],
    runtimeRequirements: [],
    dependencies: [],
  },
  {
    id: 'architecture/modular',
    version: '1.0.0',
    kind: 'architecture',
    support: 'verified',
    provides: ['backend:architecture'],
    requires: [{ target: 'backend:framework' }],
    conflicts: [],
    runtimeRequirements: [],
    dependencies: [],
  },
  {
    id: 'architecture/blank',
    version: '1.0.0',
    kind: 'architecture',
    support: 'verified',
    provides: ['backend:architecture'],
    requires: [{ target: 'backend:framework' }],
    conflicts: [{ target: 'database/postgresql' }, { target: 'database/mysql' }, { target: 'database/sqlserver' }, { target: 'database/mongodb' }],
    runtimeRequirements: [],
    dependencies: [],
  },
  {
    id: 'database/postgresql',
    version: '1.0.0',
    kind: 'database',
    support: 'verified',
    provides: ['persistence:database'],
    requires: [],
    conflicts: [{ target: 'architecture/blank' }],
    runtimeRequirements: [],
    dependencies: [],
  },
  {
    id: 'database/none',
    version: '1.0.0',
    kind: 'database',
    support: 'verified',
    provides: ['persistence:database'],
    requires: [],
    conflicts: [],
    runtimeRequirements: [],
    dependencies: [],
  },
  {
    id: 'frontend/react',
    version: '1.0.0',
    kind: 'frontend',
    support: 'verified',
    provides: ['frontend:ui'],
    requires: [{ target: 'runtime:node' }],
    conflicts: [],
    runtimeRequirements: [],
    dependencies: [{ id: 'runtime/node' }],
  },
  {
    id: 'frontend/vue',
    version: '1.0.0',
    kind: 'frontend',
    support: 'verified',
    provides: ['frontend:ui'],
    requires: [{ target: 'runtime:node' }],
    conflicts: [],
    runtimeRequirements: [],
    dependencies: [{ id: 'runtime/node' }],
  },
  {
    id: 'frontend/none',
    version: '1.0.0',
    kind: 'frontend',
    support: 'verified',
    provides: ['frontend:ui'],
    requires: [],
    conflicts: [],
    runtimeRequirements: [],
    dependencies: [],
  },
];
```

Create `packages/cli/src/engine/registry/registry.ts`:
```ts
import type { CapabilityDefinition } from './types.js';
import { CORE_CAPABILITIES } from './definitions.js';

export class CapabilityRegistry {
  private capabilities = new Map<string, CapabilityDefinition>();

  register(cap: CapabilityDefinition): void {
    if (this.capabilities.has(cap.id)) {
      throw new Error(`Capability "${cap.id}" is already registered.`);
    }
    this.capabilities.set(cap.id, cap);
  }

  get(id: string): CapabilityDefinition | undefined {
    return this.capabilities.get(id);
  }

  list(): CapabilityDefinition[] {
    return Array.from(this.capabilities.values());
  }

  findByProvided(contract: string): CapabilityDefinition[] {
    return this.list().filter((c) => c.provides.includes(contract));
  }
}

export function getBuiltinRegistry(): CapabilityRegistry {
  const registry = new CapabilityRegistry();
  for (const cap of CORE_CAPABILITIES) {
    registry.register(cap);
  }
  return registry;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/registry.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/registry packages/cli/tests/engine/registry.test.ts
git commit -m "feat(engine): add capability registry, types, and core definitions"
```

---

### Task 3: Capability Resolver & Dependency Graph

**Files:**
- Create: `packages/cli/src/engine/resolver/graph.ts`
- Create: `packages/cli/src/engine/resolver/resolver.ts`
- Test: `packages/cli/tests/engine/resolver.test.ts`

**Interfaces:**
- Produces:
  - `interface ResolutionResult`
  - `function resolveCapabilities(config: StackConfiguration, registry?: CapabilityRegistry): ResolutionResult`

- [ ] **Step 1: Write the failing test for capability resolution**

Create `packages/cli/tests/engine/resolver.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/resolver.test.ts`
Expected: FAIL due to missing resolver.

- [ ] **Step 3: Implement resolver and topological graph sort**

Create `packages/cli/src/engine/resolver/graph.ts`:
```ts
import type { CapabilityDefinition } from '../registry/types.js';

export function topologicalSortCapabilities(capabilities: CapabilityDefinition[]): CapabilityDefinition[] {
  const capMap = new Map<string, CapabilityDefinition>();
  for (const c of capabilities) capMap.set(c.id, c);

  const visited = new Set<string>();
  const visiting = new Set<string>();
  const result: CapabilityDefinition[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      throw new Error(`Circular dependency detected involving capability "${id}".`);
    }

    visiting.add(id);
    const cap = capMap.get(id);
    if (cap) {
      for (const dep of cap.dependencies) {
        if (capMap.has(dep.id)) {
          visit(dep.id);
        }
      }
    }
    visiting.delete(id);
    visited.add(id);
    if (cap) result.push(cap);
  }

  for (const cap of capabilities) {
    if (!visited.has(cap.id)) {
      visit(cap.id);
    }
  }

  return result;
}
```

Create `packages/cli/src/engine/resolver/resolver.ts`:
```ts
import type { StackConfiguration } from '../configuration/schema.js';
import type { CapabilityDefinition, SupportTier } from '../registry/types.js';
import { CapabilityRegistry, getBuiltinRegistry } from '../registry/registry.js';
import { topologicalSortCapabilities } from './graph.js';

export interface ResolutionResult {
  config: StackConfiguration;
  resolvedIds: string[];
  orderedCapabilities: CapabilityDefinition[];
  supportTier: SupportTier;
}

export function resolveCapabilities(
  config: StackConfiguration,
  registry: CapabilityRegistry = getBuiltinRegistry(),
): ResolutionResult {
  const selectedIds = new Set<string>();

  selectedIds.add(`runtime/${config.backend.runtime}`);
  selectedIds.add(`backend/${config.backend.framework}`);
  selectedIds.add(`architecture/${config.backend.architecture}`);
  selectedIds.add(`database/${config.persistence.database}`);
  selectedIds.add(`frontend/${config.frontend.framework}`);

  // Resolve dependencies transitively
  const queue = Array.from(selectedIds);
  while (queue.length > 0) {
    const id = queue.shift()!;
    const def = registry.get(id);
    if (!def) {
      throw new Error(`Unknown capability "${id}" required by configuration.`);
    }

    for (const dep of def.dependencies) {
      if (!selectedIds.has(dep.id)) {
        selectedIds.add(dep.id);
        queue.push(dep.id);
      }
    }
  }

  const selectedCapabilities = Array.from(selectedIds).map((id) => registry.get(id)!);

  // Check conflicts
  for (const cap of selectedCapabilities) {
    for (const conflict of cap.conflicts) {
      if (selectedIds.has(conflict.target)) {
        throw new Error(
          `Capability conflict: "${cap.id}" conflicts with "${conflict.target}".`,
        );
      }
    }
  }

  // Calculate support tier
  let supportTier: SupportTier = 'verified';
  if (selectedCapabilities.some((c) => c.support === 'deprecated')) {
    supportTier = 'deprecated';
  } else if (selectedCapabilities.some((c) => c.support === 'experimental')) {
    supportTier = 'experimental';
  }

  const orderedCapabilities = topologicalSortCapabilities(selectedCapabilities);

  return {
    config,
    resolvedIds: Array.from(selectedIds),
    orderedCapabilities,
    supportTier,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/resolver.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/resolver packages/cli/tests/engine/resolver.test.ts
git commit -m "feat(engine): add capability resolver, dependency graph, and conflict detection"
```

---

### Task 4: Execution Planner & Dry-Run Engine

**Files:**
- Create: `packages/cli/src/engine/planner/types.ts`
- Create: `packages/cli/src/engine/planner/planner.ts`
- Create: `packages/cli/src/engine/planner/formatter.ts`
- Test: `packages/cli/tests/engine/planner.test.ts`

**Interfaces:**
- Produces:
  - `interface ExecutionPlan`
  - `function buildExecutionPlan(resolution: ResolutionResult): ExecutionPlan`
  - `function formatPlanText(plan: ExecutionPlan): string`

- [ ] **Step 1: Write the failing test for execution planner**

Create `packages/cli/tests/engine/planner.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { resolveCapabilities } from '../../src/engine/resolver/resolver.js';
import { buildExecutionPlan } from '../../src/engine/planner/planner.js';
import { formatPlanText } from '../../src/engine/planner/formatter.js';
import type { StackConfiguration } from '../../src/engine/configuration/schema.js';

describe('Execution Planner', () => {
  it('creates an execution plan with files, commands, and support tier', () => {
    const config: StackConfiguration = {
      schemaVersion: 1,
      project: { name: 'plan-demo', packageManager: 'pnpm' },
      backend: { runtime: 'dotnet', framework: 'aspnet-core', architecture: 'clean' },
      persistence: { database: 'postgresql' },
      frontend: { framework: 'react', rendering: 'spa', styling: 'tailwind', features: [] },
      capabilities: {},
    };

    const resolution = resolveCapabilities(config);
    const plan = buildExecutionPlan(resolution);

    expect(plan.projectName).toBe('plan-demo');
    expect(plan.supportTier).toBe('verified');
    expect(plan.plannedCapabilities.length).toBeGreaterThan(0);
    expect(plan.filesToCreate).toContain('template-p.config.json');
    expect(plan.filesToCreate).toContain('.template-p/manifest.json');

    const formatted = formatPlanText(plan);
    expect(formatted).toContain('plan-demo');
    expect(formatted).toContain('Execution Plan');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/planner.test.ts`
Expected: FAIL due to missing planner.

- [ ] **Step 3: Implement execution planner and formatter**

Create `packages/cli/src/engine/planner/types.ts`:
```ts
import type { SupportTier } from '../registry/types.js';

export interface PlannedCommand {
  command: string;
  args: string[];
  purpose: string;
}

export interface ExecutionPlan {
  projectName: string;
  supportTier: SupportTier;
  plannedCapabilities: string[];
  filesToCreate: string[];
  commands: PlannedCommand[];
  warnings: string[];
}
```

Create `packages/cli/src/engine/planner/planner.ts`:
```ts
import type { ResolutionResult } from '../resolver/resolver.js';
import type { ExecutionPlan } from './types.js';

export function buildExecutionPlan(resolution: ResolutionResult): ExecutionPlan {
  const filesToCreate: string[] = [
    'template-p.config.json',
    '.template-p/manifest.json',
    '.gitignore',
    'README.md',
  ];

  if (resolution.config.frontend.framework !== 'none') {
    filesToCreate.push('package.json');
  }

  const commands = [
    {
      command: resolution.config.project.packageManager,
      args: ['install'],
      purpose: 'Install workspace dependencies',
    },
  ];

  return {
    projectName: resolution.config.project.name,
    supportTier: resolution.supportTier,
    plannedCapabilities: resolution.orderedCapabilities.map((c) => c.id),
    filesToCreate,
    commands,
    warnings: [],
  };
}
```

Create `packages/cli/src/engine/planner/formatter.ts`:
```ts
import type { ExecutionPlan } from './types.js';

export function formatPlanText(plan: ExecutionPlan): string {
  const lines = [
    `=== Execution Plan for "${plan.projectName}" ===`,
    `Support Tier: ${plan.supportTier}`,
    '',
    'Capabilities:',
    ...plan.plannedCapabilities.map((c) => `  - ${c}`),
    '',
    'Files to Create:',
    ...plan.filesToCreate.map((f) => `  + ${f}`),
    '',
    'Commands to Run:',
    ...plan.commands.map((cmd) => `  $ ${cmd.command} ${cmd.args.join(' ')} (${cmd.purpose})`),
  ];

  if (plan.warnings.length > 0) {
    lines.push('', 'Warnings:', ...plan.warnings.map((w) => `  ! ${w}`));
  }

  return lines.join('\n');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/planner.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/planner packages/cli/tests/engine/planner.test.ts
git commit -m "feat(engine): add execution planner, plan types, and human-readable formatter"
```

---

### Task 5: Typed Composition Operations & Virtual File System

**Files:**
- Create: `packages/cli/src/engine/composer/operations.ts`
- Create: `packages/cli/src/engine/composer/virtual-fs.ts`
- Test: `packages/cli/tests/engine/composer.test.ts`

**Interfaces:**
- Produces:
  - `type FileOperation`
  - `class VirtualFileSystem`
  - `function applyOperations(fs: VirtualFileSystem, operations: FileOperation[]): void`

- [ ] **Step 1: Write the failing test for composition operations**

Create `packages/cli/tests/engine/composer.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { VirtualFileSystem } from '../../src/engine/composer/virtual-fs.js';
import { applyOperations, type FileOperation } from '../../src/engine/composer/operations.js';

describe('Engine Composer & Virtual File System', () => {
  it('applies createFile and mergeJson operations idempotently', () => {
    const vfs = new VirtualFileSystem();
    const ops: FileOperation[] = [
      {
        kind: 'createFile',
        path: 'app.txt',
        content: 'Hello World',
      },
      {
        kind: 'mergeJson',
        path: 'package.json',
        data: { name: 'demo-package', scripts: { test: 'vitest' } },
      },
      {
        kind: 'mergeJson',
        path: 'package.json',
        data: { scripts: { build: 'tsup' } },
      },
    ];

    applyOperations(vfs, ops);

    expect(vfs.readText('app.txt')).toBe('Hello World');
    const pkg = JSON.parse(vfs.readText('package.json'));
    expect(pkg.name).toBe('demo-package');
    expect(pkg.scripts.test).toBe('vitest');
    expect(pkg.scripts.build).toBe('tsup');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/composer.test.ts`
Expected: FAIL due to missing composer.

- [ ] **Step 3: Implement typed operations and virtual file system**

Create `packages/cli/src/engine/composer/operations.ts`:
```ts
import type { VirtualFileSystem } from './virtual-fs.js';

export type FileOperation =
  | { kind: 'createFile'; path: string; content: string }
  | { kind: 'mergeJson'; path: string; data: Record<string, any> };

export function applyOperations(vfs: VirtualFileSystem, operations: FileOperation[]): void {
  for (const op of operations) {
    if (op.kind === 'createFile') {
      vfs.writeFile(op.path, op.content);
    } else if (op.kind === 'mergeJson') {
      let existing: Record<string, any> = {};
      if (vfs.exists(op.path)) {
        try {
          existing = JSON.parse(vfs.readText(op.path));
        } catch {
          existing = {};
        }
      }

      const merged = deepMerge(existing, op.data);
      vfs.writeFile(op.path, JSON.stringify(merged, null, 2) + '\n');
    }
  }
}

function deepMerge(target: any, source: any): any {
  if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
    return source;
  }
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (key in target && typeof target[key] === 'object' && typeof source[key] === 'object') {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}
```

Create `packages/cli/src/engine/composer/virtual-fs.ts`:
```ts
export class VirtualFileSystem {
  private files = new Map<string, string>();

  writeFile(path: string, content: string): void {
    this.files.set(path, content);
  }

  readText(path: string): string {
    const content = this.files.get(path);
    if (content === undefined) {
      throw new Error(`File not found in VirtualFileSystem: "${path}"`);
    }
    return content;
  }

  exists(path: string): boolean {
    return this.files.has(path);
  }

  entries(): [string, string][] {
    return Array.from(this.files.entries());
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/composer.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/composer packages/cli/tests/engine/composer.test.ts
git commit -m "feat(engine): add virtual file system and typed composition operations"
```

---

### Task 6: Project Manifest Contract & Serialization

**Files:**
- Create: `packages/cli/src/engine/manifest/types.ts`
- Create: `packages/cli/src/engine/manifest/manifest.ts`
- Test: `packages/cli/tests/engine/manifest.test.ts`

**Interfaces:**
- Produces:
  - `interface ProjectManifest`
  - `function generateManifest(resolution: ResolutionResult): ProjectManifest`
  - `function serializeManifest(manifest: ProjectManifest): string`

- [ ] **Step 1: Write the failing test for project manifest**

Create `packages/cli/tests/engine/manifest.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/manifest.test.ts`
Expected: FAIL due to missing manifest.

- [ ] **Step 3: Implement project manifest generator**

Create `packages/cli/src/engine/manifest/types.ts`:
```ts
import type { SupportTier } from '../registry/types.js';
import type { StackConfiguration } from '../configuration/schema.js';

export interface ProjectManifest {
  schemaVersion: 1;
  generatorVersion: string;
  projectName: string;
  supportTier: SupportTier;
  capabilities: string[];
  configuration: StackConfiguration;
}
```

Create `packages/cli/src/engine/manifest/manifest.ts`:
```ts
import type { ResolutionResult } from '../resolver/resolver.js';
import type { ProjectManifest } from './types.js';

export function generateManifest(resolution: ResolutionResult): ProjectManifest {
  return {
    schemaVersion: 1,
    generatorVersion: '3.0.0-alpha.1',
    projectName: resolution.config.project.name,
    supportTier: resolution.supportTier,
    capabilities: resolution.orderedCapabilities.map((c) => c.id),
    configuration: resolution.config,
  };
}

export function serializeManifest(manifest: ProjectManifest): string {
  return JSON.stringify(manifest, null, 2) + '\n';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/manifest.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/manifest packages/cli/tests/engine/manifest.test.ts
git commit -m "feat(engine): add project manifest generator and serializer"
```

---

### Task 7: CLI Integration & Dry-Run Support

**Files:**
- Create: `packages/cli/src/engine/index.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/tests/cli-dry-run.test.ts`

**Interfaces:**
- Consumes:
  - `normalizeConfiguration`, `resolveCapabilities`, `buildExecutionPlan`, `formatPlanText`
- Produces:
  - `--dry-run` flag support in CLI command line
  - `--preset` flag support in CLI

- [ ] **Step 1: Write failing test for CLI dry-run and preset flags**

Create `packages/cli/tests/cli-dry-run.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { executeDryRun } from '../src/engine/index.js';

describe('CLI Dry Run Integration', () => {
  it('executes a dry run from a preset name', () => {
    const plan = executeDryRun({ preset: 'dotnet-clean-react', name: 'preset-demo' });
    expect(plan.projectName).toBe('preset-demo');
    expect(plan.plannedCapabilities).toContain('backend/aspnet-core');
    expect(plan.supportTier).toBe('verified');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/cli-dry-run.test.ts`
Expected: FAIL due to missing engine entry.

- [ ] **Step 3: Implement engine facade and wire into CLI**

Create `packages/cli/src/engine/index.ts`:
```ts
import { BUILTIN_PRESETS } from './configuration/presets.js';
import { normalizeConfiguration } from './configuration/normalizer.js';
import { resolveCapabilities } from './resolver/resolver.js';
import { buildExecutionPlan, type ExecutionPlan } from './planner/planner.js';

export * from './configuration/schema.js';
export * from './configuration/normalizer.js';
export * from './configuration/presets.js';
export * from './registry/types.js';
export * from './registry/registry.js';
export * from './resolver/resolver.js';
export * from './planner/planner.js';
export * from './planner/formatter.js';
export * from './manifest/manifest.js';

export function executeDryRun(options: { preset?: string; name?: string }): ExecutionPlan {
  const presetConfig = options.preset ? BUILTIN_PRESETS[options.preset] : BUILTIN_PRESETS['dotnet-clean-react'];
  if (!presetConfig) {
    throw new Error(`Preset "${options.preset}" not found.`);
  }

  const config = normalizeConfiguration({
    ...presetConfig,
    project: {
      ...presetConfig.project,
      name: options.name || presetConfig.project.name,
    },
  });

  const resolution = resolveCapabilities(config);
  return buildExecutionPlan(resolution);
}
```

Update `packages/cli/src/index.ts` to add commander option `--dry-run` and `--preset <name>`:
```ts
program
  .option('--dry-run', 'Generate execution plan without writing files to disk')
  .option('--preset <presetName>', 'Use a built-in v3 stack preset');
```
When `--dry-run` is supplied, execute `executeDryRun({ preset: options.preset, name: projectName })` and print `formatPlanText(plan)`.

- [ ] **Step 4: Run all tests to verify everything passes**

Run: `pnpm verify`
Expected: All content checks, typecheck, tests, and build pass with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine packages/cli/src/index.ts packages/cli/tests/cli-dry-run.test.ts
git commit -m "feat(cli): wire v3 core engine into CLI with dry-run and preset flags"
```
