# Template-P v3 Increment 05: Frontends & Presets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver Template-P v3 Increment 05: complete Vue 3 + Vite, React 19 + Vite, Next.js 15, and Nuxt 3 frontend contracts, API-only omission mode, recommended full-stack presets, and Level 5 verification.

**Architecture:** Composable frontend layers emit into `apps/frontend/` and consume `@project/api-client` for typed backend communication. Recommended presets provide versioned configurations representing real-world full-stack architectures. Scaffolder orchestrates frontends and enforces the API-only omission contract (no `apps/frontend/`, no `packages/api-client/`).

**Tech Stack:** Vue 3.5, React 19, Next.js 15, Nuxt 3, Vite 6, Tailwind CSS 4, TypeScript 7, Node.js 24 LTS, Vitest 5, pnpm 11 workspaces.

**Spec:** `docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md`

## Global Constraints

- Keep repository name `ThienHN0910/Template-P` and package name `@thienhn/create-template`.
- All first-party code, comments, identifiers, documentation, and commit messages must be strictly in English.
- Strictly adhere to Zero-Leakage Secrets: no hardcoded credentials or fallback passwords.
- Strictly follow Conventional Commits (`feat:`, `test:`, `docs:`, `fix:`).
- Run typecheck and Vitest test suites at each step.

---

### Task 1: Frontend Capabilities & Registry Extension

**Files:**
- Modify: `packages/cli/src/engine/registry/definitions.ts`
- Modify: `packages/cli/src/engine/configuration/normalizer.ts`
- Create: `packages/cli/tests/engine/layers/frontend-registry.test.ts`

**Interfaces:**
- Consumes: `CapabilityRegistry`, `StackConfiguration`, `normalizeConfiguration`, `resolveCapabilities`
- Produces: `frontend/next` and `frontend/nuxt` capabilities in registry, normalized `frontend.framework` mapping.

- [ ] **Step 1: Write the failing test for frontend registry and normalizer**

Create `packages/cli/tests/engine/layers/frontend-registry.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getBuiltinRegistry } from '../../../src/engine/registry/registry.js';
import { normalizeConfiguration } from '../../../src/engine/configuration/normalizer.js';
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/frontend-registry.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement frontend/next and frontend/nuxt capabilities and normalizer updates**

In `packages/cli/src/engine/registry/definitions.ts`, add:
```ts
  {
    id: 'frontend/next',
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
    id: 'frontend/nuxt',
    version: '1.0.0',
    kind: 'frontend',
    support: 'verified',
    provides: ['frontend:ui'],
    requires: [{ target: 'runtime:node' }],
    conflicts: [],
    runtimeRequirements: [],
    dependencies: [{ id: 'runtime/node' }],
  },
```

In `packages/cli/src/engine/configuration/normalizer.ts`:
Ensure `legacy.frontendChoice === 'nextjs'` maps to `next` and `legacy.frontendChoice === 'nuxt3'` maps to `nuxt`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/frontend-registry.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/registry/definitions.ts packages/cli/src/engine/configuration/normalizer.ts packages/cli/tests/engine/layers/frontend-registry.test.ts
git commit -m "feat(engine): register Next.js and Nuxt frontend capabilities and normalizer mappings"
```

---

### Task 2: Vue 3 + Vite Frontend Layer

**Files:**
- Create: `packages/cli/src/engine/composer/layers/vue-vite.ts`
- Create: `packages/cli/tests/engine/layers/vue-vite.test.ts`

**Interfaces:**
- Consumes: `FileOperation` from `../operations.js`
- Produces: `getVueViteOperations(): FileOperation[]` emitting Vue 3 + Vite 6 + TypeScript + `@project/api-client` integration in `apps/frontend/`.

- [ ] **Step 1: Write the failing test for Vue 3 + Vite layer**

Create `packages/cli/tests/engine/layers/vue-vite.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getVueViteOperations } from '../../../src/engine/composer/layers/vue-vite.js';

describe('Vue 3 + Vite Layer', () => {
  it('generates Vue 3 + Vite 6 SPA frontend files', () => {
    const ops = getVueViteOperations();

    const pkg = ops.find((o) => o.path === 'apps/frontend/package.json') as any;
    expect(pkg).toBeDefined();
    const pkgJson = JSON.parse(pkg.content);
    expect(pkgJson.dependencies.vue).toBeDefined();
    expect(pkgJson.dependencies['@project/api-client']).toBe('workspace:*');
    expect(pkgJson.devDependencies['@vitejs/plugin-vue']).toBeDefined();

    const viteConfig = ops.find((o) => o.path === 'apps/frontend/vite.config.ts') as any;
    expect(viteConfig).toBeDefined();
    expect(viteConfig.content).toContain('@vitejs/plugin-vue');

    const appVue = ops.find((o) => o.path === 'apps/frontend/src/App.vue') as any;
    expect(appVue).toBeDefined();
    expect(appVue.content).toContain('@project/api-client');
    expect(appVue.content).toContain('ApiClient');
    expect(appVue.content).toContain('Product Catalog');

    const mainTs = ops.find((o) => o.path === 'apps/frontend/src/main.ts') as any;
    expect(mainTs).toBeDefined();
    expect(mainTs.content).toContain('createApp');

    const indexHtml = ops.find((o) => o.path === 'apps/frontend/index.html') as any;
    expect(indexHtml).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/vue-vite.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement getVueViteOperations**

Create `packages/cli/src/engine/composer/layers/vue-vite.ts`:
- Emits:
  - `apps/frontend/package.json`: Vue 3.5, `@vitejs/plugin-vue`, `@project/api-client: workspace:*`, TypeScript ^7.0.2, Vite 6.
  - `apps/frontend/vite.config.ts`: Vite config with vue plugin.
  - `apps/frontend/index.html`: HTML entrypoint referencing `/src/main.ts`.
  - `apps/frontend/src/main.ts`: `createApp(App).mount('#app')`.
  - `apps/frontend/src/App.vue`: Composition API `<script setup lang="ts">` consuming `ApiClient` to fetch `Product[]` and render catalog.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/vue-vite.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/composer/layers/vue-vite.ts packages/cli/tests/engine/layers/vue-vite.test.ts
git commit -m "feat(engine): add Vue 3 and Vite frontend layer"
```

---

### Task 3: Next.js 15 Frontend Layer

**Files:**
- Create: `packages/cli/src/engine/composer/layers/next-app.ts`
- Create: `packages/cli/tests/engine/layers/next-app.test.ts`

**Interfaces:**
- Consumes: `FileOperation` from `../operations.js`
- Produces: `getNextAppOperations(): FileOperation[]` emitting Next.js 15 App Router + TypeScript + `@project/api-client` in `apps/frontend/`.

- [ ] **Step 1: Write the failing test for Next.js layer**

Create `packages/cli/tests/engine/layers/next-app.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getNextAppOperations } from '../../../src/engine/composer/layers/next-app.js';

describe('Next.js 15 App Router Layer', () => {
  it('generates Next.js 15 hybrid frontend files', () => {
    const ops = getNextAppOperations();

    const pkg = ops.find((o) => o.path === 'apps/frontend/package.json') as any;
    expect(pkg).toBeDefined();
    const pkgJson = JSON.parse(pkg.content);
    expect(pkgJson.dependencies.next).toBeDefined();
    expect(pkgJson.dependencies.react).toBeDefined();
    expect(pkgJson.dependencies['@project/api-client']).toBe('workspace:*');

    const nextConfig = ops.find((o) => o.path === 'apps/frontend/next.config.mjs') as any;
    expect(nextConfig).toBeDefined();

    const layout = ops.find((o) => o.path === 'apps/frontend/app/layout.tsx') as any;
    expect(layout).toBeDefined();
    expect(layout.content).toContain('RootLayout');

    const page = ops.find((o) => o.path === 'apps/frontend/app/page.tsx') as any;
    expect(page).toBeDefined();
    expect(page.content).toContain('@project/api-client');
    expect(page.content).toContain('ApiClient');
    expect(page.content).toContain('Product Catalog');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/next-app.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement getNextAppOperations**

Create `packages/cli/src/engine/composer/layers/next-app.ts`:
- Emits:
  - `apps/frontend/package.json`: Next.js 15, React 19, `@project/api-client: workspace:*`, TypeScript ^7.0.2.
  - `apps/frontend/next.config.mjs`: ESM config.
  - `apps/frontend/app/layout.tsx`: HTML `<html><body>{children}</body></html>`.
  - `apps/frontend/app/page.tsx`: Client Component (`'use client';`) consuming `ApiClient` to fetch products and render catalog.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/next-app.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/composer/layers/next-app.ts packages/cli/tests/engine/layers/next-app.test.ts
git commit -m "feat(engine): add Next.js 15 frontend layer"
```

---

### Task 4: Nuxt 3 Frontend Layer

**Files:**
- Create: `packages/cli/src/engine/composer/layers/nuxt-app.ts`
- Create: `packages/cli/tests/engine/layers/nuxt-app.test.ts`

**Interfaces:**
- Consumes: `FileOperation` from `../operations.js`
- Produces: `getNuxtAppOperations(): FileOperation[]` emitting Nuxt 3 + Vue 3 + TypeScript + `@project/api-client` in `apps/frontend/`.

- [ ] **Step 1: Write the failing test for Nuxt 3 layer**

Create `packages/cli/tests/engine/layers/nuxt-app.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getNuxtAppOperations } from '../../../src/engine/composer/layers/nuxt-app.js';

describe('Nuxt 3 Frontend Layer', () => {
  it('generates Nuxt 3 frontend files', () => {
    const ops = getNuxtAppOperations();

    const pkg = ops.find((o) => o.path === 'apps/frontend/package.json') as any;
    expect(pkg).toBeDefined();
    const pkgJson = JSON.parse(pkg.content);
    expect(pkgJson.dependencies.nuxt).toBeDefined();
    expect(pkgJson.dependencies.vue).toBeDefined();
    expect(pkgJson.dependencies['@project/api-client']).toBe('workspace:*');

    const nuxtConfig = ops.find((o) => o.path === 'apps/frontend/nuxt.config.ts') as any;
    expect(nuxtConfig).toBeDefined();
    expect(nuxtConfig.content).toContain('defineNuxtConfig');

    const appVue = ops.find((o) => o.path === 'apps/frontend/app.vue') as any;
    expect(appVue).toBeDefined();
    expect(appVue.content).toContain('@project/api-client');
    expect(appVue.content).toContain('ApiClient');
    expect(appVue.content).toContain('Product Catalog');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/nuxt-app.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement getNuxtAppOperations**

Create `packages/cli/src/engine/composer/layers/nuxt-app.ts`:
- Emits:
  - `apps/frontend/package.json`: Nuxt 3, Vue 3, `@project/api-client: workspace:*`, TypeScript ^7.0.2.
  - `apps/frontend/nuxt.config.ts`: `defineNuxtConfig({ ... })`.
  - `apps/frontend/app.vue`: Composition API script consuming `ApiClient` to fetch products and render catalog.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/nuxt-app.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/composer/layers/nuxt-app.ts packages/cli/tests/engine/layers/nuxt-app.test.ts
git commit -m "feat(engine): add Nuxt 3 frontend layer"
```

---

### Task 5: Presets & Scaffolder Frontend Dispatch with API-Only Omission

**Files:**
- Modify: `packages/cli/src/engine/configuration/presets.ts`
- Modify: `packages/cli/src/engine/composer/layers/workspace-base.ts`
- Modify: `packages/cli/src/engine/scaffolder.ts`
- Create: `packages/cli/tests/engine/presets-and-scaffolder.test.ts`

**Interfaces:**
- Consumes: `getVueViteOperations`, `getNextAppOperations`, `getNuxtAppOperations`, `getReactViteOperations`, `getOpenApiClientOperations`
- Produces: Complete frontend dispatch across React, Vue, Next, Nuxt, and API-only omission.

- [ ] **Step 1: Write the failing test for presets and frontend scaffolder dispatch**

Create `packages/cli/tests/engine/presets-and-scaffolder.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import path from 'node:path';
import fsp from 'node:fs/promises';
import { scaffoldStack } from '../../src/engine/scaffolder.js';
import { BUILTIN_PRESETS } from '../../src/engine/configuration/presets.js';

describe('Presets and Frontend Scaffolder Dispatch', () => {
  it('scaffolds Vue 3 with node-fastify-clean-vue preset', async () => {
    const tmpDir = path.resolve('test-output/test-preset-vue');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    try {
      await scaffoldStack(BUILTIN_PRESETS['node-fastify-clean-vue'], tmpDir);

      const appVue = await fsp.readFile(path.join(tmpDir, 'apps/frontend/src/App.vue'), 'utf8');
      expect(appVue).toContain('@project/api-client');

      const apiClient = await fsp.readFile(path.join(tmpDir, 'packages/api-client/package.json'), 'utf8');
      expect(apiClient).toContain('@project/api-client');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('scaffolds Next.js with node-express-clean-next preset', async () => {
    const tmpDir = path.resolve('test-output/test-preset-next');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    try {
      await scaffoldStack(BUILTIN_PRESETS['node-express-clean-next'], tmpDir);

      const page = await fsp.readFile(path.join(tmpDir, 'apps/frontend/app/page.tsx'), 'utf8');
      expect(page).toContain('@project/api-client');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('scaffolds Nuxt 3 with fastapi-modular-nuxt preset', async () => {
    const tmpDir = path.resolve('test-output/test-preset-nuxt');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    try {
      await scaffoldStack(BUILTIN_PRESETS['fastapi-modular-nuxt'], tmpDir);

      const appVue = await fsp.readFile(path.join(tmpDir, 'apps/frontend/app.vue'), 'utf8');
      expect(appVue).toContain('@project/api-client');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('verifies strict API-only omission contract (dotnet-clean-api)', async () => {
    const tmpDir = path.resolve('test-output/test-preset-api-only');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    try {
      await scaffoldStack(BUILTIN_PRESETS['dotnet-clean-api'], tmpDir);

      const frontendExists = await fsp.access(path.join(tmpDir, 'apps/frontend')).then(() => true).catch(() => false);
      const clientExists = await fsp.access(path.join(tmpDir, 'packages/api-client')).then(() => true).catch(() => false);

      expect(frontendExists).toBe(false);
      expect(clientExists).toBe(false);

      const rootPkg = await fsp.readFile(path.join(tmpDir, 'package.json'), 'utf8');
      expect(rootPkg).not.toContain('@project/api-client generate');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/presets-and-scaffolder.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement presets, workspace-base adjustments, and scaffolder dispatch**

1. In `packages/cli/src/engine/configuration/presets.ts`:
   Define all 6 standard presets:
   - `dotnet-clean-react`
   - `node-fastify-clean-vue`
   - `fastapi-modular-react`
   - `dotnet-clean-api`: backend `dotnet`, clean, postgresql, frontend `none`
   - `node-express-clean-next`: backend `node`, framework `express`, clean, mongodb, frontend `next`
   - `fastapi-modular-nuxt`: backend `python`, framework `fastapi`, modular, sqlite, frontend `nuxt`

2. In `packages/cli/src/engine/composer/layers/workspace-base.ts`:
   Accept optional 4th param `frontend = 'react'`. If `frontend === 'none'`, omit `api:sync` and adjust root scripts accordingly.

3. In `packages/cli/src/engine/scaffolder.ts`:
   Wire `workspace-base` with frontend value.
   Dispatch:
   - If `resolution.resolvedIds.includes('frontend/react')`: `getOpenApiClientOperations()`, `getReactViteOperations()`
   - If `resolution.resolvedIds.includes('frontend/vue')`: `getOpenApiClientOperations()`, `getVueViteOperations()`
   - If `resolution.resolvedIds.includes('frontend/next')`: `getOpenApiClientOperations()`, `getNextAppOperations()`
   - If `resolution.resolvedIds.includes('frontend/nuxt')`: `getOpenApiClientOperations()`, `getNuxtAppOperations()`
   - If `frontend/none`: no client or frontend operations pushed.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/presets-and-scaffolder.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/configuration/presets.ts packages/cli/src/engine/composer/layers/workspace-base.ts packages/cli/src/engine/scaffolder.ts packages/cli/tests/engine/presets-and-scaffolder.test.ts
git commit -m "feat(engine): add normative presets and full frontend layer dispatch with API-only omission"
```

---

### Task 6: Level 5 End-to-End Presets & Repository Smoke Verification

**Files:**
- Create: `packages/cli/tests/engine/presets-e2e.test.ts`

**Interfaces:**
- Produces: Automated verification testing representative full-stack presets across all runtime and frontend families, running full repository verification `pnpm verify`.

- [ ] **Step 1: Write representative end-to-end presets test**

Create `packages/cli/tests/engine/presets-e2e.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import path from 'node:path';
import fsp from 'node:fs/promises';
import { scaffoldStack } from '../../src/engine/scaffolder.js';
import { BUILTIN_PRESETS } from '../../src/engine/configuration/presets.js';

describe('Level 5 Representative Presets End-to-End', () => {
  it('scaffolds and verifies manifest for every built-in preset', async () => {
    for (const [presetName, presetConfig] of Object.entries(BUILTIN_PRESETS)) {
      const tmpDir = path.resolve(`test-output/e2e-preset-${presetName}`);
      await fsp.rm(tmpDir, { recursive: true, force: true });

      try {
        await scaffoldStack(presetConfig, tmpDir);

        const manifestRaw = await fsp.readFile(path.join(tmpDir, '.template-p/manifest.json'), 'utf8');
        const manifest = JSON.parse(manifestRaw);
        expect(manifest.version).toBe('3.0.0');
        expect(manifest.supportTier).toBe('verified');
        expect(manifest.capabilities.length).toBeGreaterThan(0);

        const configRaw = await fsp.readFile(path.join(tmpDir, 'template-p.config.json'), 'utf8');
        expect(configRaw).toContain(presetConfig.project.name);
      } finally {
        await fsp.rm(tmpDir, { recursive: true, force: true });
      }
    }
  }, 120000);
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/presets-e2e.test.ts`
Expected: PASS.

- [ ] **Step 3: Run full repository verification**

Run: `pnpm verify`
Expected: PASS across all checks (content policy, typecheck, tests, build).

- [ ] **Step 4: Commit**

```bash
git add packages/cli/tests/engine/presets-e2e.test.ts
git commit -m "test(engine): add Level 5 representative presets end-to-end verification"
```
