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
        expect(manifest.schemaVersion).toBe(1);
        expect(manifest.generatorVersion).toMatch(/^3\.0\.0/);
        expect(manifest.supportTier).toBe('verified');
        expect(manifest.capabilities.length).toBeGreaterThan(0);

        const configRaw = await fsp.readFile(path.join(tmpDir, 'template-p.config.json'), 'utf8');
        expect(configRaw).toContain(presetConfig.project.name);

        if (presetName === 'dotnet-clean-api') {
          const frontendExists = await fsp
            .access(path.join(tmpDir, 'apps/frontend'))
            .then(() => true)
            .catch(() => false);
          const clientExists = await fsp
            .access(path.join(tmpDir, 'packages/api-client'))
            .then(() => true)
            .catch(() => false);

          expect(frontendExists).toBe(false);
          expect(clientExists).toBe(false);
        } else {
          const frontendExists = await fsp
            .access(path.join(tmpDir, 'apps/frontend'))
            .then(() => true)
            .catch(() => false);
          const clientExists = await fsp
            .access(path.join(tmpDir, 'packages/api-client'))
            .then(() => true)
            .catch(() => false);

          expect(frontendExists).toBe(true);
          expect(clientExists).toBe(true);
        }
      } finally {
        await fsp.rm(tmpDir, { recursive: true, force: true });
      }
    }
  }, 120000);
});
