import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inspectText, scanPolicy } from './content-policy.mjs';

test('reports mojibake in every first-party text file', () => {
  const mojibake = `Ready ${'\u00e2\u0153\u201c'}`;
  const violations = inspectText('README.md', mojibake, { allowVietnamese: false });
  assert.deepEqual(violations.map(({ rule }) => rule), ['mojibake']);
});

test('allows Vietnamese only in an explicit locale resource', () => {
  const vietnamese = '\u0110ang t\u1ea3i d\u1eef li\u1ec7u';
  assert.equal(inspectText('src/locales/vi.ts', vietnamese, { allowVietnamese: true }).length, 0);
  assert.deepEqual(
    inspectText('README.md', vietnamese, { allowVietnamese: false }).map(({ rule }) => rule),
    ['english-only']
  );
});

test('scans selected roots while excluding vendored directories', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'template-p-content-'));
  try {
    await mkdir(path.join(root, 'docs'), { recursive: true });
    await mkdir(path.join(root, 'templates', 'skills'), { recursive: true });
    const vietnamese = 'Tr\u1ea1ng th\u00e1i';
    await writeFile(path.join(root, 'docs', 'guide.md'), vietnamese, 'utf8');
    await writeFile(path.join(root, 'templates', 'skills', 'upstream.md'), vietnamese, 'utf8');

    const violations = await scanPolicy({
      root,
      roots: ['docs', 'templates'],
      excludePrefixes: ['templates/skills'],
      vietnameseLocaleFiles: [],
    });

    assert.deepEqual(violations.map(({ file }) => file), ['docs/guide.md']);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
