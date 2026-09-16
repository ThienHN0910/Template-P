# Template-P v3 Increment 06: Stabilization and Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalize v3 stabilization, audit npm package contents, update migration and user-facing documentation, bump package version to `3.0.0`, integrate via PR, publish GitHub Release `v3.0.0` to trigger automated npm publication with OIDC provenance, and run post-publish verification.

**Architecture:** Increment 06 concludes the Template-P v3 program by packaging the verified capability engine, documentation, and presets. Following the repository's Trusted Publisher configuration in `.github/workflows/publish.yml`, publication is triggered by creating an official GitHub Release for tag `v3.0.0`.

**Tech Stack:** TypeScript 7, Node.js 24.11+ LTS, pnpm, tsup, Vitest 5, GitHub Actions (OIDC Trusted Publishing), GitHub CLI (`gh`).

**Spec:** `docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md`

## Global Constraints

- Keep repository name `ThienHN0910/Template-P` and package name `@thienhn/create-template`.
- Target release version: `3.0.0`.
- All first-party repository and documentation text MUST strictly adhere to the English-only and UTF-8 content policy (`pnpm check:content` and `pnpm test:content`).
- Zero hardcoded credentials or fallback passwords.
- Conventional commits for all changes.
- Ensure all 27+ Vitest test suites and typechecking pass locally before opening PR and tagging release.

---

### Task 1: Package Audit & Version Bump to 3.0.0

**Files:**
- Modify: `packages/cli/package.json`
- Modify: `packages/cli/src/engine/manifest/manifest.ts`
- Test: `packages/cli/tests/engine/manifest.test.ts`
- Test: `packages/cli/tests/engine/presets-e2e.test.ts`

**Interfaces:**
- Produces: `@thienhn/create-template@3.0.0` package metadata, `generatorVersion: '3.0.0'` in manifests.

- [ ] **Step 1: Write test or update existing assertions for version 3.0.0**

Update `packages/cli/tests/engine/manifest.test.ts` to assert `generatorVersion` is `'3.0.0'`.

- [ ] **Step 2: Update package version and manifest generatorVersion**

1. In `packages/cli/package.json`:
   Update `"version": "3.0.0"`.
   Ensure `"engines": { "node": ">=22.13.0" }`.
2. In `packages/cli/src/engine/manifest/manifest.ts`:
   Update `generatorVersion: '3.0.0'`.

- [ ] **Step 3: Run tests and verify package pack dry-run**

Run:
```bash
pnpm --filter ./packages/cli test tests/engine/manifest.test.ts
pnpm --filter ./packages/cli build
cd packages/cli && npm pack --dry-run
```
Expected: PASS and clean tarball preview.

- [ ] **Step 4: Commit**

```bash
git add packages/cli/package.json packages/cli/src/engine/manifest/manifest.ts packages/cli/tests/engine/manifest.test.ts
git commit -m "chore(release): bump package version and generatorVersion to 3.0.0"
```

---

### Task 2: Migration Guide & User Documentation

**Files:**
- Create: `docs/guides/v2-to-v3-migration.md`
- Modify: `README.md`
- Modify: `packages/cli/README.md`

**Interfaces:**
- Produces: Comprehensive user-facing documentation for v3 capability engine, presets, multi-database support, and migration path from v2.

- [ ] **Step 1: Create v2 to v3 migration guide**

Create `docs/guides/v2-to-v3-migration.md` detailing:
- Decoupled runtime, architecture, database, and frontend choices.
- Built-in presets (`dotnet-clean-react`, `node-fastify-clean-vue`, `fastapi-modular-react`, `dotnet-clean-api`, `node-express-clean-next`, `fastapi-modular-nuxt`).
- Manifest schema version 1 and `.template-p/manifest.json`.
- Strict API-only omission mode.

- [ ] **Step 2: Update root and CLI README.md**

Update `README.md` and `packages/cli/README.md`:
- Highlight v3 architecture and presets.
- Document verified database adapters (.NET EF Core, Node Prisma/MongoDB, Python SQLAlchemy/PyMongo).
- Document verified frontend layers (React 19 Vite, Vue 3 Vite, Next.js 15, Nuxt 3).

- [ ] **Step 3: Verify first-party content policy**

Run:
```bash
pnpm check:content && pnpm test:content
```
Expected: All 12 content policy tests PASS.

- [ ] **Step 4: Commit**

```bash
git add docs/guides/v2-to-v3-migration.md README.md packages/cli/README.md
git commit -m "docs: add v2 to v3 migration guide and update public documentation for v3.0.0"
```

---

### Task 3: Full Repository Verification & Plan Tracking

**Files:**
- Modify: `docs/superpowers/plans/2026-09-17-template-p-v3-stabilization-and-release.md`

- [ ] **Step 1: Run full verification suite**

Run:
```bash
pnpm verify
```
Expected: 100% pass across content policy, typecheck, all 27+ Vitest suites, and CLI build.

- [ ] **Step 2: Stage and commit implementation plan**

```bash
git add docs/superpowers/plans/2026-09-17-template-p-v3-stabilization-and-release.md
git commit -m "docs: add v3 stabilization and release implementation plan"
```

---

### Task 4: PR Integration & GitHub Actions CI Gate

- [ ] **Step 1: Push release branch and open PR**

```bash
git push -u origin feat/v3-stabilization-and-release
gh pr create --title "feat: prepare v3.0.0 stabilization and release" --body "..."
```

- [ ] **Step 2: Watch CI checks until green**

```bash
gh pr checks <pr-number> --watch
```

- [ ] **Step 3: Merge PR into main**

```bash
gh pr merge <pr-number> --merge
```

- [ ] **Step 4: Sync local main and clean up branch**

```bash
git checkout main
git pull origin main
git branch -d feat/v3-stabilization-and-release
```

---

### Task 5: Tag Release & Publish to NPM via GitHub Actions OIDC

- [ ] **Step 1: Create GitHub Release v3.0.0**

```bash
gh release create v3.0.0 --title "v3.0.0: Capability Architecture & Universal Fullstack Matrix" --notes "..."
```

- [ ] **Step 2: Monitor Publish Package GitHub Actions workflow**

```bash
gh run list --workflow=publish.yml
gh run watch <run-id>
```
Expected: The `publish.yml` workflow runs, verifies the package bundle, and executes `npm publish --access public --provenance` with npm OIDC.

- [ ] **Step 3: Post-publish smoke verification**

Verify publication on npm:
```bash
npm view @thienhn/create-template version
```
Expected: `3.0.0`.
