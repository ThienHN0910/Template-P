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
