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

      const sessionPy = await fsp.readFile(path.join(tmpDir, 'apps/backend/app/db/session.py'), 'utf8');
      expect(sessionPy).toContain('sqlite+aiosqlite');

      const prismaExists = await fsp.access(path.join(tmpDir, 'apps/backend/prisma')).then(() => true).catch(() => false);
      expect(prismaExists).toBe(false);
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('scaffolds React with fastapi-modular-react preset', async () => {
    const tmpDir = path.resolve('test-output/test-preset-python-react');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    try {
      await scaffoldStack(BUILTIN_PRESETS['fastapi-modular-react'], tmpDir);

      const appTsx = await fsp.readFile(path.join(tmpDir, 'apps/frontend/src/App.tsx'), 'utf8');
      expect(appTsx).toContain('@project/api-client');

      const sessionPy = await fsp.readFile(path.join(tmpDir, 'apps/backend/app/db/session.py'), 'utf8');
      expect(sessionPy).toContain('postgresql+psycopg');

      const prismaExists = await fsp.access(path.join(tmpDir, 'apps/backend/prisma')).then(() => true).catch(() => false);
      expect(prismaExists).toBe(false);
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
