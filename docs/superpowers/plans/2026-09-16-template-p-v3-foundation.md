# Template-P v3 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect the current v2 CLI contract, convert all first-party repository and generated public surfaces to clean professional English, enforce encoding/language policy in CI, and align GitHub metadata with the approved CLI-first direction.

**Architecture:** This increment adds a small repository-content policy module and characterization coverage before changing copy or documentation. It then fixes CLI/generated text, reorganizes public documentation without advertising unimplemented v3 features, normalizes GitHub contribution surfaces, and applies approved repository settings through `gh`. The v3 registry and template engine are explicitly outside this increment.

**Tech Stack:** Node.js ESM, Node test runner, TypeScript, Vitest, pnpm, GitHub Actions, GitHub CLI.

**Spec:** `docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md`

## Global Constraints

- Keep `ThienHN0910/Template-P`, `@thienhn/create-template`, `create-template`, and the `create-p-stack` alias unchanged.
- Describe shipped v2 behavior accurately; link to the approved v3 design instead of presenting planned v3 features as available.
- Keep the current v2 runtime floor at Node.js 22.13 until the v3 core increment changes it to Node.js 24.11+.
- Keep Vietnamese only in explicit generated locale resources; English is the generated default locale.
- Exclude `templates/skills/**` and `.scratch/**` from first-party English checks, but continue checking first-party files for mojibake and invalid UTF-8.
- Do not rewrite Git history, historical releases, vendored skills, or third-party attribution.
- Do not change database, runtime-installation, AI-default, or scaffolding behavior except for English/default-locale corrections covered by tests.
- Disable the engine repository's GitHub Template flag, keep Issues and Discussions enabled, disable Wiki, and enable branch deletion after merge.
- Do not configure a branch ruleset in this increment; v3 workflow names and release checks are not stable yet.

---

## File structure for this increment

### New policy and test files

- `scripts/content-policy.mjs`: pure text-policy detection and repository scanning functions.
- `scripts/content-policy.test.mjs`: Node test-runner coverage for mojibake, Vietnamese allowlists, vendored exclusions, and UTF-8 text handling.
- `scripts/check-first-party-content.mjs`: CI entry point with the repository's exact first-party roots and locale exceptions.
- `packages/cli/src/scaffolder/locales/vue.ts`: English and Vietnamese Vue message catalogs plus deterministic module rendering.
- `docs/README.md`: documentation index separating current v2 references from the approved v3 design.
- `docs/getting-started/installation.md`: current package installation and runtime requirements.
- `docs/getting-started/automation.md`: current non-interactive v2 CLI usage and trust boundaries.
- `docs/reference/commands.md`: current v2 command and flag reference.
- `docs/reference/compatibility.md`: relocated current compatibility contract.
- `docs/contributing/verification.md`: repository and scaffold verification commands.
- `docs/contributing/release.md`: relocated release process.
- `docs/contributing/github-maintenance.md`: desired repository metadata and reproducible `gh` administration commands.

### Existing files changed together

- `packages/cli/tests/project-contract.test.ts`: identity, v2 matrix, and generated-locale characterization.
- `packages/cli/src/index.ts`: terminal copy and mojibake removal only.
- `packages/cli/src/installer/auto-installer.ts`: English ASCII-safe status messages only.
- `packages/cli/src/prompts/frontend.ts`: use “English and Vietnamese” in public prompts.
- `packages/cli/src/scaffolder/hybrid-frontend.ts`: delegate locale output to the isolated locale module.
- `templates/frontend/vue3-vite/src/i18n.ts`: correct UTF-8 Vietnamese and make English the default.
- `README.md`, `packages/cli/README.md`: accurate CLI-first adoption pages for shipped v2.
- `AGENTS.md`, `CONTEXT.md`, `docs/adr/0001-*.md`, `docs/adr/0002-*.md`, `docs/adr/0003-*.md`, `docs/agents/domain.md`: English domain and historical decision documentation.
- `CONTRIBUTING.md`, `SUPPORT.md`, `SECURITY.md`, `CHANGELOG.md`: English community and release guidance without mojibake.
- `.github/ISSUE_TEMPLATE/bug_report.yml`, `.github/ISSUE_TEMPLATE/feature_request.yml`, `.github/PULL_REQUEST_TEMPLATE.md`: professional English issue and review inputs.
- `package.json`, `.github/workflows/ci.yml`: content-policy commands and CI enforcement.
- Delete after relocation: `docs/compatibility.md`, `docs/release.md`.

---

### Task 1: Add the reusable first-party text policy

**Files:**
- Create: `scripts/content-policy.mjs`
- Create: `scripts/content-policy.test.mjs`

**Interfaces:**
- Consumes: Node.js `fs/promises` and `path` only.
- Produces: `inspectText(relativePath, text, options): ContentViolation[]` and `scanPolicy(options): Promise<ContentViolation[]>`.

- [ ] **Step 1: Write failing unit tests for text detection and path policy**

```js
// scripts/content-policy.test.mjs
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
```

- [ ] **Step 2: Run the focused test and verify the missing-module failure**

Run: `node --test scripts/content-policy.test.mjs`
Expected: FAIL because `scripts/content-policy.mjs` does not exist.

- [ ] **Step 3: Implement the policy detector and recursive scanner**

```js
// scripts/content-policy.mjs
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const MOJIBAKE_MARKERS = [
  '\u00e2\u0153', '\u00e2\u0161', '\u00e2\u2020', '\u00f0\u0178',
  'Ti\u00e1\u00ba', 'D\u00e1\u00bb', '\u00c4\u2018', '\u00c6\u00b0',
  '\u00c3', '\u00c2\u00a9', '\uFFFD',
];
const VIETNAMESE_PATTERN = /[\u0102\u0103\u0110\u0111\u0128\u0129\u0168\u0169\u01A0-\u01B0\u1EA0-\u1EF9]/u;
const TEXT_EXTENSIONS = new Set([
  '.cjs', '.cs', '.csproj', '.css', '.html', '.js', '.json', '.jsx', '.md', '.mjs',
  '.py', '.scss', '.sln', '.toml', '.ts', '.tsx', '.txt', '.vue', '.xml', '.yaml', '.yml',
]);
const TEXT_FILENAMES = new Set(['.env.example', '.gitignore', 'Dockerfile', 'LICENSE']);

export function inspectText(file, text, { allowVietnamese = false } = {}) {
  const violations = [];
  if (MOJIBAKE_MARKERS.some((marker) => text.includes(marker))) violations.push({ file, rule: 'mojibake' });
  if (!allowVietnamese && VIETNAMESE_PATTERN.test(text)) violations.push({ file, rule: 'english-only' });
  return violations;
}

function normalize(relativePath) {
  return relativePath.split(path.sep).join('/');
}

async function collect(root, relativePath, excludePrefixes, output) {
  const normalized = normalize(relativePath);
  if (excludePrefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) return;

  const absolutePath = path.join(root, relativePath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  for (const entry of entries) {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      await collect(root, child, excludePrefixes, output);
    } else if (
      entry.isFile() &&
      (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) || TEXT_FILENAMES.has(entry.name))
    ) {
      output.push(normalize(child));
    }
  }
}

export async function scanPolicy({ root, roots, excludePrefixes = [], vietnameseLocaleFiles = [] }) {
  const files = [];
  for (const rootPath of roots) {
    const absolutePath = path.join(root, rootPath);
    const parent = path.dirname(rootPath);
    const name = path.basename(rootPath);
    const entries = await readdir(path.join(root, parent), { withFileTypes: true });
    const entry = entries.find((candidate) => candidate.name === name);
    if (!entry) throw new Error(`Policy root does not exist: ${rootPath}`);
    if (entry.isDirectory()) await collect(root, rootPath, excludePrefixes, files);
    else files.push(normalize(rootPath));
  }

  const localeSet = new Set(vietnameseLocaleFiles);
  const violations = [];
  for (const file of [...new Set(files)].sort()) {
    const text = await readFile(path.join(root, file), 'utf8');
    violations.push(...inspectText(file, text, { allowVietnamese: localeSet.has(file) }));
  }
  return violations;
}
```

- [ ] **Step 4: Run the policy tests**

Run: `node --test scripts/content-policy.test.mjs`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit the reusable policy module**

```bash
git add scripts/content-policy.mjs scripts/content-policy.test.mjs
git commit -m "test: add first-party content policy"
```

---

### Task 2: Characterize repository identity and the supported v2 selection surface

**Files:**
- Modify: `packages/cli/tests/project-contract.test.ts`

**Interfaces:**
- Consumes: `assertSupportedProjectSelection()` and existing package manifests.
- Produces: regression evidence that Phase 1 does not rename the product or remove a v2 backend/architecture selection.

- [ ] **Step 1: Add identity and selection characterization tests**

```ts
describe('published product identity', () => {
  it('retains the approved repository package and executable names', () => {
    const packageManifest = JSON.parse(fs.readFileSync('packages/cli/package.json', 'utf8'));
    expect(packageManifest.name).toBe('@thienhn/create-template');
    expect(packageManifest.bin).toEqual({
      'create-template': './bin/create-template.js',
      'create-p-stack': './bin/create-template.js',
    });
    expect(packageManifest.repository.url).toContain('ThienHN0910/Template-P.git');
  });
});

describe('v2 selection surface', () => {
  it.each([
    ['dotnet', 'webapi-ddd'],
    ['dotnet', 'webapi-mvc'],
    ['dotnet', 'blank'],
    ['node', 'express-ddd'],
    ['node', 'fastify-clean'],
    ['node', 'blank'],
    ['fastapi', 'modular'],
    ['fastapi', 'blank'],
  ])('accepts %s with %s', (backend, architecture) => {
    expect(() =>
      assertSupportedProjectSelection({
        backend,
        architecture,
        frontend: 'react',
        database: 'none',
        packageManager: 'pnpm',
      })
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the characterization tests against the unchanged v2 implementation**

Run: `pnpm --filter ./packages/cli test -- project-contract.test.ts`
Expected: PASS; the tests capture existing supported identifiers and approved identity.

- [ ] **Step 3: Commit the characterization coverage**

```bash
git add packages/cli/tests/project-contract.test.ts
git commit -m "test: characterize v2 identity and selections"
```

---

### Task 3: Make CLI and generated locale output English-first and UTF-8 clean

**Files:**
- Create: `packages/cli/src/scaffolder/locales/vue.ts`
- Modify: `scripts/content-policy.test.mjs`
- Modify: `packages/cli/src/index.ts:45-151`
- Modify: `packages/cli/src/installer/auto-installer.ts:1-60`
- Modify: `packages/cli/src/prompts/frontend.ts:1-92`
- Modify: `packages/cli/src/scaffolder/hybrid-frontend.ts:1-235`
- Modify: `packages/cli/tests/project-contract.test.ts`
- Modify: `templates/frontend/vue3-vite/src/i18n.ts`

**Interfaces:**
- Consumes: `scanPolicy()` from Task 1 and `ProjectConfig` from the current CLI.
- Produces: `renderVueI18nModule(): string`; generated Vue locale defaults to English and preserves valid Vietnamese under `vi`.

- [ ] **Step 1: Add failing repository-policy and generated-locale tests**

Add this test to `scripts/content-policy.test.mjs`:

```js
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
```

Extend the representative scaffold test in `project-contract.test.ts`:

```ts
const i18n = fs.readFileSync(path.join(targetDir, 'apps/frontend/src/i18n.ts'), 'utf8');
expect(i18n).toContain("locale: 'en'");
expect(i18n).toContain('"welcome": "Full-stack starter project"');
expect(i18n).toContain('"welcome": "D\u1ef1 \u00e1n full-stack kh\u1edfi t\u1ea1o"');
for (const marker of ['\u00e2\u0153', '\u00f0\u0178', 'D\u00e1\u00bb', '\u00c4\u2018', '\u00c6\u00b0', '\u00c3']) {
  expect(i18n).not.toContain(marker);
}
```

- [ ] **Step 2: Run both focused tests and observe current mojibake/default-locale failures**

Run: `node --test scripts/content-policy.test.mjs`
Expected: FAIL with violations in `index.ts`, `auto-installer.ts`, and `hybrid-frontend.ts`.

Run: `pnpm --filter ./packages/cli test -- project-contract.test.ts`
Expected: FAIL because the generated Vue locale currently defaults to `vi` and contains mojibake.

- [ ] **Step 3: Add deterministic English and Vietnamese Vue locale catalogs**

```ts
// packages/cli/src/scaffolder/locales/vue.ts
export const vueMessages = {
  en: {
    welcome: 'Full-stack starter project',
    subtitle: 'Built with Template-P',
    backendStatus: 'Backend status',
    items: 'Database items',
    addItem: 'Add item',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    loading: 'Loading data...',
    healthy: 'Connected and healthy',
  },
  vi: {
    welcome: 'Dự án full-stack khởi tạo',
    subtitle: 'Được tạo bằng Template-P',
    backendStatus: 'Trạng thái backend',
    items: 'Dữ liệu từ cơ sở dữ liệu',
    addItem: 'Thêm mục',
    darkMode: 'Chế độ tối',
    lightMode: 'Chế độ sáng',
    loading: 'Đang tải dữ liệu...',
    healthy: 'Đã kết nối và hoạt động ổn định',
  },
} as const;

export function renderVueI18nModule(): string {
  return `import { createI18n } from 'vue-i18n';\n\nconst messages = ${JSON.stringify(vueMessages, null, 2)};\n\nexport const i18n = createI18n({\n  legacy: false,\n  locale: 'en',\n  fallbackLocale: 'en',\n  messages,\n});\n`;
}
```

- [ ] **Step 4: Use the renderer and replace broken terminal copy**

In `hybrid-frontend.ts`, import `renderVueI18nModule`, remove the inline message template, and write `renderVueI18nModule()` when i18n is selected. In `index.ts` and `auto-installer.ts`, replace broken emoji sequences with ASCII-safe labels:

```ts
s.stop(pc.green('All required runtimes are available.'));
s.stop(pc.yellow('One or more required runtimes are missing.'));
s.stop(pc.green('Project assembled successfully.'));
s.stop(pc.red('Scaffolding failed.'));
```

Use `English and Vietnamese` in frontend prompt hints. Update the static Vue template to the same message values and set `locale: 'en'`.

- [ ] **Step 5: Run focused tests until both contracts pass**

Run: `node --test scripts/content-policy.test.mjs`
Expected: PASS.

Run: `pnpm --filter ./packages/cli test -- project-contract.test.ts`
Expected: PASS with valid English-default and Vietnamese locale assertions.

- [ ] **Step 6: Run type checking and commit**

Run: `pnpm typecheck`
Expected: PASS.

```bash
git add scripts/content-policy.test.mjs packages/cli/src packages/cli/tests/project-contract.test.ts templates/frontend/vue3-vite/src/i18n.ts
git commit -m "fix: make CLI and locale output UTF-8 clean"
```

---

### Task 4: Replace public documentation with accurate English v2 documentation

**Files:**
- Create: `docs/README.md`
- Create: `docs/getting-started/installation.md`
- Create: `docs/getting-started/automation.md`
- Create: `docs/reference/commands.md`
- Create: `docs/reference/compatibility.md`
- Create: `docs/contributing/verification.md`
- Create: `docs/contributing/release.md`
- Modify: `scripts/content-policy.test.mjs`
- Modify: `README.md`
- Modify: `packages/cli/README.md`
- Modify: `AGENTS.md`
- Modify: `CONTEXT.md`
- Modify: `CONTRIBUTING.md`
- Modify: `SUPPORT.md`
- Modify: `SECURITY.md`
- Modify: `docs/adr/0001-universal-template-architecture.md`
- Modify: `docs/adr/0002-database-and-resilience-patterns.md`
- Modify: `docs/adr/0003-hybrid-cli-delegation-and-dynamic-skills.md`
- Modify: `docs/agents/domain.md`
- Delete: `docs/compatibility.md`
- Delete: `docs/release.md`

**Interfaces:**
- Consumes: current v2 CLI flags, current CI evidence, and the approved v3 specification.
- Produces: a navigable English documentation set that distinguishes shipped, offered, verified, experimental, and planned behavior.

- [ ] **Step 1: Expand the policy test to all public first-party documentation**

```js
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
```

- [ ] **Step 2: Run the policy test and verify the documentation failure list**

Run: `node --test scripts/content-policy.test.mjs`
Expected: FAIL for the Vietnamese root README, AGENTS/CONTEXT, three ADRs, and existing mojibake in public docs.

- [ ] **Step 3: Rewrite the root and package README files around shipped v2 behavior**

Use this exact information architecture in both documents, with the package README omitting contributor-only material:

```markdown
# Template-P

Template-P is the source repository for `@thienhn/create-template`, an interactive CLI that scaffolds full-stack monorepos from bundled blueprints and optional upstream integrations.

## Quick start
## What the current v2 CLI offers
## Verified compatibility
## Interactive usage
## Non-interactive usage
## Trust and network boundaries
## Documentation
## Contributing and security
## v3 roadmap
## License
```

The current-support section must state all of these facts:

- Node.js 22.13+ is required to run v2.
- The CLI offers .NET 8, Node.js, and FastAPI backends; Vue, React, Next.js, and Nuxt frontends; PostgreSQL, MySQL, SQLite, and no database.
- Current full scaffold/install/build CI evidence is limited to the combinations named in `scaffold-matrix.yml`; offered combinations without that evidence are not described as production-verified.
- `--offline --no-ai` avoids upstream generator and dynamic-skill downloads.
- v3 capabilities are planned in the approved design specification and are not shipped v2 behavior.
- The primary installation command is `npx @thienhn/create-template`; do not instruct users to copy the engine through GitHub's “Use this template” button.

- [ ] **Step 4: Translate domain and historical decision documents without changing their meaning**

`AGENTS.md` must retain the issue-tracker, triage-label, and domain-doc links and express the project overview in English. `CONTEXT.md` must define these current terms in English: CLI Engine, Preflight Check, Runtime Installer, Template Blueprint, Scaffolded Project, Hybrid Scaffolder, Dynamic Skills Engine, and AI Agent Bundle.

Each existing ADR must contain:

```markdown
**Status:** Superseded by the approved v3 capability architecture on 2026-09-16.

This ADR records the historical v1/v2 decision. New implementation work follows the v3 design specification.
```

Translate Context, Decision, and Consequences faithfully. Do not rewrite the ADRs to pretend v3 was the original decision.

- [ ] **Step 5: Create the public documentation index and relocate current references**

`docs/README.md` links to:

```text
getting-started/installation.md
getting-started/automation.md
reference/commands.md
reference/compatibility.md
contributing/verification.md
contributing/release.md
adr/
agents/
superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md
```

Move the meaning of `docs/compatibility.md` to `docs/reference/compatibility.md`, fix `“every upstream latest release”` and `scaffold -> install -> build` encoding, and label it `Current v2 compatibility contract`. Move `docs/release.md` to `docs/contributing/release.md` without weakening the Trusted Publisher/OIDC requirements. Update all incoming links in README, SUPPORT, CONTRIBUTING, and issue/PR content.

`docs/reference/commands.md` documents the exact v2 flags from `packages/cli/src/index.ts`. `docs/getting-started/automation.md` includes a complete `--offline --no-ai --yes` example and explains that `--yes` currently selects v2 defaults. `docs/contributing/verification.md` lists `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and the packed-artifact matrix workflow.

- [ ] **Step 6: Run content, link-target, and repository tests**

Run: `node --test scripts/content-policy.test.mjs`
Expected: PASS.

Run: `rg -n "docs/(compatibility|release)\.md" README.md SUPPORT.md CONTRIBUTING.md packages/cli/README.md docs .github`
Expected: no matches referring to the deleted paths.

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 7: Commit the English documentation migration**

```bash
git add README.md AGENTS.md CONTEXT.md CONTRIBUTING.md SUPPORT.md SECURITY.md packages/cli/README.md docs scripts/content-policy.test.mjs
git commit -m "docs: standardize first-party documentation in English"
```

---

### Task 5: Normalize GitHub contribution surfaces and repository metadata

**Files:**
- Create: `docs/contributing/github-maintenance.md`
- Modify: `scripts/content-policy.test.mjs`
- Modify: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Modify: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Modify: `.github/PULL_REQUEST_TEMPLATE.md`

**Interfaces:**
- Consumes: approved GitHub policy from the design specification and the canonical five triage labels.
- Produces: English issue/PR forms, documented desired settings, v3 milestones, and verified GitHub repository metadata.

- [ ] **Step 1: Add a failing policy assertion for `.github` first-party text**

```js
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
```

- [ ] **Step 2: Run the policy test and verify issue/PR mojibake failures**

Run: `node --test scripts/content-policy.test.mjs`
Expected: FAIL for broken emoji bytes in both issue forms and the pull-request template.

- [ ] **Step 3: Replace issue forms with reproducible, secret-safe inputs**

The bug form must require:

```text
Description
CLI version
Exact command
Normalized configuration or sanitized manifest
Steps to reproduce
Expected behavior
Actual behavior
Operating system and CPU architecture
Node/package-manager/backend runtime versions
Sanitized terminal output
Confirmation that secrets were removed
```

The feature form must require:

```text
Problem and target user
Proposed user-visible behavior
Affected runtime/framework/database/frontend capability
Alternatives considered
Verification evidence needed for a verified support claim
Willingness to contribute or maintain the capability
```

Use plain English names (`Bug report`, `Feature request`) without emoji prefixes. Preserve `needs-triage` plus the relevant type label.

- [ ] **Step 4: Replace the pull-request template with evidence-oriented review fields**

Use these exact sections:

```markdown
## Summary
## Linked issue or decision
## Generated-output impact
## Verification evidence
## Security and compatibility review
## Checklist
```

The checklist must require typecheck/tests/build, packed-artifact testing when CLI output changes, documentation updates, no secrets, and explicit identification of verified/experimental support changes.

- [ ] **Step 5: Document the desired GitHub state and administration commands**

`docs/contributing/github-maintenance.md` records:

```text
Repository name: Template-P
Description: CLI-first full-stack scaffolder for verified .NET, Node.js, FastAPI, Vue, React, Next.js, and Nuxt project stacks.
Homepage: https://www.npmjs.com/package/@thienhn/create-template
Issues: enabled
Discussions: enabled
Wiki: disabled
Template repository: disabled
Delete merged branches: enabled
```

It also records the exact topic set:

```text
cli, scaffolder, fullstack, dotnet, nodejs, fastapi, react, vue, nextjs, nuxt,
postgresql, sql-server, mysql, mongodb, openapi, typescript, template, developer-tools
```

- [ ] **Step 6: Run policy validation and commit repository-owned files before external mutation**

Run: `node --test scripts/content-policy.test.mjs`
Expected: PASS.

```bash
git add .github/ISSUE_TEMPLATE .github/PULL_REQUEST_TEMPLATE.md docs/contributing/github-maintenance.md scripts/content-policy.test.mjs
git commit -m "docs: standardize GitHub contribution surfaces"
```

- [ ] **Step 7: Inspect current GitHub state with `gh`**

Run:

```bash
gh repo view --json nameWithOwner,description,homepageUrl,isTemplate,hasIssuesEnabled,hasDiscussionsEnabled,hasWikiEnabled,deleteBranchOnMerge,repositoryTopics
gh label list --limit 100
gh api "repos/ThienHN0910/Template-P/milestones?state=all"
```

Expected: repository remains `ThienHN0910/Template-P`; the five canonical triage labels exist; no v3 milestones exist before creation.

- [ ] **Step 8: Apply approved repository metadata and topics with `gh`**

Run:

```bash
gh api --method PATCH repos/ThienHN0910/Template-P -f description='CLI-first full-stack scaffolder for verified .NET, Node.js, FastAPI, Vue, React, Next.js, and Nuxt project stacks.' -f homepage='https://www.npmjs.com/package/@thienhn/create-template' -F has_issues=true -F has_discussions=true -F has_wiki=false -F is_template=false -F delete_branch_on_merge=true
gh api --method PUT repos/ThienHN0910/Template-P/topics -f 'names[]=cli' -f 'names[]=scaffolder' -f 'names[]=fullstack' -f 'names[]=dotnet' -f 'names[]=nodejs' -f 'names[]=fastapi' -f 'names[]=react' -f 'names[]=vue' -f 'names[]=nextjs' -f 'names[]=nuxt' -f 'names[]=postgresql' -f 'names[]=sql-server' -f 'names[]=mysql' -f 'names[]=mongodb' -f 'names[]=openapi' -f 'names[]=typescript' -f 'names[]=template' -f 'names[]=developer-tools'
```

Expected: both calls return the updated repository/topic representations.

- [ ] **Step 9: Create only missing v3 milestones with `gh`**

After checking the response from Step 7, run each command only when that exact title is absent:

```bash
gh api --method POST repos/ThienHN0910/Template-P/milestones -f title='v3.0' -f description='Capability registry, verified database adapters, production baseline, OpenAPI contract, manifest, and core CLI lifecycle.'
gh api --method POST repos/ThienHN0910/Template-P/milestones -f title='v3.1' -f description='Add command plus OIDC, Redis, OpenTelemetry, caching, and background-job capabilities.'
gh api --method POST repos/ThienHN0910/Template-P/milestones -f title='v3.2' -f description='Managed diffs, conservative upgrades, codemods, and project migrations.'
gh api --method POST repos/ThienHN0910/Template-P/milestones -f title='v3.3' -f description='Preview plugin SDK and explicit community capability trust model.'
```

- [ ] **Step 10: Verify external state exactly**

Run:

```bash
gh repo view --json nameWithOwner,description,homepageUrl,isTemplate,hasIssuesEnabled,hasDiscussionsEnabled,hasWikiEnabled,deleteBranchOnMerge,repositoryTopics
gh api "repos/ThienHN0910/Template-P/milestones?state=open"
```

Expected: name unchanged; npm homepage set; template and Wiki false; Issues, Discussions, and delete-after-merge true; exact topics present; v3.0-v3.3 milestones open.

---

### Task 6: Enforce the full first-party content policy in local verification and CI

**Files:**
- Create: `scripts/check-first-party-content.mjs`
- Modify: `package.json:7-15`
- Modify: `.github/workflows/ci.yml:20-36`

**Interfaces:**
- Consumes: `scanPolicy()` from Task 1 and the explicit locale paths created in Task 3.
- Produces: `pnpm check:content`, `pnpm test:content`, and CI failure on mojibake or unapproved Vietnamese first-party text.

- [ ] **Step 1: Add package scripts that initially fail because the CI entry point is absent**

```json
{
  "scripts": {
    "check:content": "node ./scripts/check-first-party-content.mjs",
    "test:content": "node --test ./scripts/content-policy.test.mjs",
    "test": "pnpm test:content && pnpm --filter ./packages/cli test",
    "verify": "pnpm check:content && pnpm typecheck && pnpm test && pnpm build"
  }
}
```

Preserve the existing `build`, `typecheck`, `dev`, `create`, and `publish-cli` scripts.

- [ ] **Step 2: Run the new command and verify the missing-entry-point failure**

Run: `pnpm check:content`
Expected: FAIL because `scripts/check-first-party-content.mjs` does not exist.

- [ ] **Step 3: Implement the repository policy entry point**

```js
// scripts/check-first-party-content.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanPolicy } from './content-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const violations = await scanPolicy({
  root,
  roots: [
    '.github', 'AGENTS.md', 'CHANGELOG.md', 'CODE_OF_CONDUCT.md', 'CONTEXT.md',
    'CONTRIBUTING.md', 'LICENSE', 'package.json', 'README.md', 'SECURITY.md', 'SUPPORT.md', 'docs',
    'packages/cli/README.md', 'packages/cli/package.json', 'packages/cli/scripts',
    'packages/cli/src', 'packages/cli/tests', 'scripts', 'templates/backend', 'templates/frontend',
    'templates/mcp',
  ],
  excludePrefixes: [
    '.scratch',
    'docs/superpowers/plans',
    'templates/skills',
  ],
  vietnameseLocaleFiles: [
    'packages/cli/src/scaffolder/locales/vue.ts',
    'templates/frontend/vue3-vite/src/i18n.ts',
  ],
});

if (violations.length > 0) {
  for (const violation of violations) {
    console.error(`${violation.rule}: ${violation.file}`);
  }
  process.exitCode = 1;
} else {
  console.log('First-party content policy passed.');
}
```

The plan directory is excluded because implementation plans may contain user-provided examples or historical text. The approved design specification remains scanned through `docs`.

- [ ] **Step 4: Add content enforcement to CI before compilation**

Insert after dependency installation in `.github/workflows/ci.yml`:

```yaml
      - name: Check first-party language and encoding
        run: pnpm check:content
```

- [ ] **Step 5: Run the complete local verification sequence**

Run: `pnpm verify`
Expected: content policy, typecheck, Node policy tests, Vitest suite, and CLI build all PASS.

- [ ] **Step 6: Commit CI enforcement**

```bash
git add scripts/check-first-party-content.mjs package.json .github/workflows/ci.yml
git commit -m "ci: enforce first-party language and encoding policy"
```

---

### Task 7: Record the foundation change and perform release-proportional verification

**Files:**
- Modify: `CHANGELOG.md:5-6`

**Interfaces:**
- Consumes: every deliverable from Tasks 1-6.
- Produces: an auditable Unreleased entry and final evidence that Phase 0-1 changed copy/governance without breaking the published package contract.

- [ ] **Step 1: Add the exact Unreleased changelog entries**

```markdown
## Unreleased

### Added

- Added automated first-party language and encoding checks.
- Added an English documentation index, current v2 command reference, verification guide, and GitHub maintenance guide.

### Changed

- Standardized first-party repository, CLI, generated default-locale, and GitHub contribution text in professional English.
- Repositioned the repository as the source for the CLI-first `@thienhn/create-template` package and documented the approved v3 architecture separately from shipped v2 behavior.
- Disabled the engine repository's GitHub Template and Wiki features, enabled merged-branch cleanup, and added v3 delivery milestones.

### Fixed

- Removed mojibake from terminal messages, documentation, issue forms, and generated Vue localization while preserving valid optional Vietnamese translations.
```

- [ ] **Step 2: Commit the changelog**

```bash
git add CHANGELOG.md
git commit -m "docs: record English OSS foundation changes"
```

- [ ] **Step 3: Verify repository and package behavior**

Run:

```bash
pnpm install --frozen-lockfile
pnpm check:content
pnpm typecheck
pnpm test
pnpm build
```

Expected: every command exits 0.

- [ ] **Step 4: Inspect the publish artifact without publishing**

Run: `npm pack --dry-run` from `packages/cli`
Expected: exits 0; package name remains `@thienhn/create-template`; bundled templates and README are included; repository-only plans and specs are absent.

- [ ] **Step 5: Re-run read-only GitHub verification**

Run:

```bash
gh repo view --json nameWithOwner,description,homepageUrl,isTemplate,hasIssuesEnabled,hasDiscussionsEnabled,hasWikiEnabled,deleteBranchOnMerge,repositoryTopics
gh api "repos/ThienHN0910/Template-P/milestones?state=open"
```

Expected: matches the desired state documented in `docs/contributing/github-maintenance.md`.

- [ ] **Step 6: Confirm a clean worktree and review the increment diff**

Run:

```bash
git status --short
git log --oneline --decorate -10
git diff origin/main...HEAD --stat
```

Expected: clean worktree; only approved design commits and foundation-task commits are present; no product/repository renaming appears in the diff.
