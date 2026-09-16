import { describe, expect, it } from 'vitest';
import path from 'path';
import fsp from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { scaffoldStack } from '../../src/engine/scaffolder.js';
import { BUILTIN_PRESETS } from '../../src/engine/configuration/presets.js';

const exec = promisify(execFile);

describe('Golden Slice Integration Build', () => {
  it('scaffolds and compiles the .NET 10 Clean Architecture backend', async () => {
    const tmpDir = path.resolve('test-output/golden-slice-e2e');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    await scaffoldStack(BUILTIN_PRESETS['dotnet-clean-react'], tmpDir);

    const apiCsproj = path.join(tmpDir, 'apps/backend/src/API/API.csproj');

    // Run dotnet build
    const { stdout } = await exec('dotnet', ['build', apiCsproj, '-c', 'Release']);
    expect(stdout).toContain('Build succeeded');

    await fsp.rm(tmpDir, { recursive: true, force: true });
  }, 60000);
});
