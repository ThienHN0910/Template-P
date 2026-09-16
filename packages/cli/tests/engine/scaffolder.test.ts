import { describe, expect, it } from 'vitest';
import path from 'path';
import fsp from 'fs/promises';
import { scaffoldStack } from '../../src/engine/scaffolder.js';
import { BUILTIN_PRESETS } from '../../src/engine/configuration/presets.js';

describe('V3 Stack Scaffolder', () => {
  it('scaffolds the dotnet-clean-react preset into physical files with manifest', async () => {
    const tmpDir = path.resolve('test-output/golden-slice-test');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    await scaffoldStack(BUILTIN_PRESETS['dotnet-clean-react'], tmpDir);

    const exists = async (p: string) => {
      try {
        await fsp.access(path.join(tmpDir, p));
        return true;
      } catch {
        return false;
      }
    };

    expect(await exists('.template-p/manifest.json')).toBe(true);
    expect(await exists('template-p.config.json')).toBe(true);
    expect(await exists('infra/compose.yaml')).toBe(true);
    expect(await exists('apps/backend/src/API/Program.cs')).toBe(true);
    expect(await exists('apps/frontend/src/App.tsx')).toBe(true);
    expect(await exists('packages/api-client/src/index.ts')).toBe(true);

    await fsp.rm(tmpDir, { recursive: true, force: true });
  });
});
