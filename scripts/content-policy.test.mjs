import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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

test('CLI source is English-only outside explicit locale resources', async () => {
  const root = path.resolve(import.meta.dirname, '..');
  const violations = await scanPolicy({
    root,
    roots: ['packages/cli/src', 'templates/frontend'],
    excludePrefixes: [],
    vietnameseLocaleFiles: [
      'packages/cli/src/scaffolder/locales/vue.ts',
      'templates/frontend/vue3-vite/src/i18n.ts',
    ],
  });
  assert.deepEqual(violations, []);
});

test('public documentation is English-only and free of mojibake', async () => {
  const root = path.resolve(import.meta.dirname, '..');
  const violations = await scanPolicy({
    root,
    roots: [
      'README.md', 'AGENTS.md', 'CONTEXT.md', 'CHANGELOG.md', 'CODE_OF_CONDUCT.md',
      'CONTRIBUTING.md', 'SECURITY.md', 'SUPPORT.md', 'docs', 'packages/cli/README.md',
    ],
    excludePrefixes: ['docs/superpowers/plans'],
    vietnameseLocaleFiles: [],
  });
  assert.deepEqual(violations, []);
});

test('GitHub contribution surfaces are English and UTF-8 clean', async () => {
  const root = path.resolve(import.meta.dirname, '..');
  const violations = await scanPolicy({
    root,
    roots: ['.github'],
    excludePrefixes: [],
    vietnameseLocaleFiles: [],
  });
  assert.deepEqual(violations, []);
});

test('GitHub issue and pull-request titles use plain English without emoji', async () => {
  const root = path.resolve(import.meta.dirname, '..');
  const contributionFiles = [
    '.github/ISSUE_TEMPLATE/bug_report.yml',
    '.github/ISSUE_TEMPLATE/feature_request.yml',
    '.github/PULL_REQUEST_TEMPLATE.md',
  ];
  const contents = await Promise.all(
    contributionFiles.map((file) => readFile(path.join(root, file), 'utf8')),
  );

  for (const content of contents) assert.doesNotMatch(content, /\p{Extended_Pictographic}/u);
});

test('repository scripts enforce the first-party content policy before verification', async () => {
  const root = path.resolve(import.meta.dirname, '..');
  const packageManifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));

  assert.equal(packageManifest.scripts['check:content'], 'node ./scripts/check-first-party-content.mjs');
  assert.equal(packageManifest.scripts['test:content'], 'node --test ./scripts/content-policy.test.mjs');
  assert.equal(packageManifest.scripts.test, 'pnpm test:content && pnpm --filter ./packages/cli test');
  assert.equal(packageManifest.scripts.verify, 'pnpm check:content && pnpm typecheck && pnpm test && pnpm build');
});
