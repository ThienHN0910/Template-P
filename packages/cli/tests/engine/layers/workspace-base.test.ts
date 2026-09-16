import { describe, expect, it } from 'vitest';
import { getWorkspaceBaseOperations } from '../../../src/engine/composer/layers/workspace-base.js';

describe('Workspace Base Layer', () => {
  it('generates root package.json, compose.yaml, .env.example, and .gitignore', () => {
    const ops = getWorkspaceBaseOperations('golden-app', 'pnpm');
    expect(ops.length).toBeGreaterThan(0);

    const paths = ops.map((op) => op.path);
    expect(paths).toContain('package.json');
    expect(paths).toContain('infra/compose.yaml');
    expect(paths).toContain('.env.example');
    expect(paths).toContain('.gitignore');
    expect(paths).toContain('README.md');
  });
});
