# Template-P v3 Delivery Program

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved Template-P v3 architecture through independently reviewable, working increments without combining documentation migration, engine replacement, framework adapters, and release operations in one change set.

**Architecture:** The program follows the dependency direction in the approved specification: protect current behavior first, normalize the public repository, introduce the registry/resolver/planner/composer core, prove one golden vertical slice, expand adapters and frontends, then stabilize and release. Each increment must leave `main` in a usable and testable state and receives its own implementation plan after the preceding interface checkpoint is accepted.

**Tech Stack:** TypeScript 7, Node.js 24.11+ for v3, Vitest 5, tsup, pnpm 11.15.1, .NET 10, Python 3.13, Docker Compose, GitHub Actions, GitHub CLI.

**Spec:** `docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md`

## Global Constraints

- Keep the repository name `ThienHN0910/Template-P` and npm package name `@thienhn/create-template`.
- Keep `create-template` as the canonical executable and `create-p-stack` as a compatibility alias.
- Use professional English for first-party repository, CLI, GitHub, and generated-project surfaces; Vietnamese is allowed only as an optional generated locale.
- Treat `templates/skills/**` as vendored content and preserve upstream text and attribution.
- Use .NET 10 LTS, Node.js 24.11+ LTS, and Python 3.13 as v3 generated-runtime baselines.
- Keep verified templates bundled and versioned; remote generators and community plugins cannot be part of the verified path.
- Keep authentication, OpenTelemetry, caching, and background jobs out of v3.0; they belong to v3.1.
- Never overwrite user-modified generated files silently.
- Use npm Trusted Publisher/OIDC with provenance; do not introduce a long-lived npm token.
- Apply GitHub repository mutations with `gh` only after their corresponding committed documentation and checks exist.

---

## Delivery increments

| Increment | Independent deliverable | Entry gate | Exit gate |
| --- | --- | --- | --- |
| 01. Safety and English OSS surface | Characterization coverage, English first-party content, encoding policy, accurate CLI-first docs, and approved GitHub settings | Approved v3 design | Current v2 build/test/package behavior remains green |
| 02. v3 core engine | Normalized config, capability registry, resolver, planner, dry-run, typed composition operations, and manifest | Increment 01 merged | Legacy and v3 configurations resolve deterministically without template expansion |
| 03. Golden vertical slice | .NET 10 + ASP.NET Core Clean + PostgreSQL/EF Core + React/Vite + OpenAPI client | Core interfaces accepted | Packed CLI generates and verifies the complete stack against PostgreSQL |
| 04. Persistence matrix | Remaining .NET, Node, and FastAPI default adapters for PostgreSQL, SQL Server, MySQL, SQLite, and MongoDB | Golden slice proves adapter contract | Every normative backend/database row passes Levels 1-4 |
| 05. Frontends and presets | Vue, React, Next.js, Nuxt, API-only mode, recommended presets, and representative Level 5 tests | Stable OpenAPI/client contract | Every normative frontend contract passes and named presets run end to end |
| 06. Stabilization and release | Cross-platform evidence, migration docs, package audit, release candidate, npm publication, and post-publish smoke test | Normative v3.0 matrix green | `@thienhn/create-template@3.0.0` is published with provenance |

## Plan ownership

The detailed executable plan for Increment 01 is:

- `docs/superpowers/plans/2026-09-16-template-p-v3-foundation.md`

Later increments receive separate detailed plans only after their entry gate is met. This prevents a pre-registry plan from inventing file paths or interfaces that the tested v3 core does not actually expose. The approved design specification remains normative for scope and acceptance across every increment.

## Integration policy

- Use one feature branch or isolated worktree per increment.
- Review and merge tasks in dependency order; do not cherry-pick adapter work ahead of its registry contract.
- Rebase or merge from `main` only at review checkpoints, not in the middle of a task's red-green-refactor cycle.
- Tag no v3 prerelease until the golden vertical slice passes from a packed npm artifact.
- Do not change GitHub repository settings in a code-only task; perform and verify them in the explicit repository-administration task.
- Record any approved deviation from this program in the design specification or a numbered ADR before implementation diverges.
