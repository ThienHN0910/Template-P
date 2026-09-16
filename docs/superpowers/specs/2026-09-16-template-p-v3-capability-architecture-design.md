# Template-P v3 Capability Architecture Design

| Field | Value |
| --- | --- |
| Status | Approved |
| Date | 2026-09-16 |
| Product | Template-P |
| Repository | `ThienHN0910/Template-P` |
| npm package | `@thienhn/create-template` |
| Canonical executable | `create-template` |
| Compatibility alias | `create-p-stack` |

## Summary

Template-P v3 will evolve from a collection of mostly static full-stack templates into a CLI-first scaffolding and project-lifecycle engine. It will generate production-oriented projects from versioned, composable capabilities whose compatibility and support tier are backed by automated verification.

The design prioritizes depth over an unbounded framework catalog. The initial v3 release will harden the existing backend and frontend families, add complete database-specific persistence adapters, establish a shared generated-project contract, and introduce the configuration, registry, planning, composition, manifest, and verification foundations needed for later lifecycle commands and community extensions.

The repository and npm package names remain unchanged. First-party repository, CLI, GitHub, and generated-project content will use professional English. Vietnamese remains available only as an optional generated locale.

## Goals

- Make the npm CLI the primary product and distribution path.
- Generate complete, working persistence integrations instead of connection-string placeholders.
- Support PostgreSQL, SQL Server, MySQL, SQLite, MongoDB, and no-database projects.
- Use ecosystem-native data-access choices rather than forcing one ORM across all runtimes and database types.
- Separate runtime, framework, architecture, database, data access, frontend, and optional features into composable capabilities.
- Provide recommended presets while retaining a fully deterministic custom and non-interactive mode.
- Define an evidence-backed `verified`, `experimental`, and `deprecated` support model.
- Generate a consistent API, testing, configuration, Docker, documentation, and operational baseline.
- Record enough machine-readable project state to support `doctor`, `add`, `diff`, and conservative upgrades over time.
- Preserve user ownership of generated source and never overwrite modified code silently.
- Make repository and GitHub surfaces meet professional open-source expectations.

## Non-goals

- Supporting every Cartesian product of backend, architecture, database, frontend, and feature.
- Treating a database change as a connection-string-only operation.
- Automatically migrating production data between database engines.
- Building a deployment platform, cloud account manager, or secret manager.
- Shipping Kubernetes, Terraform, or cloud-specific infrastructure by default.
- Building a plugin marketplace in v3.0.
- Automatically downloading or executing community code without explicit user intent.
- Rewriting Git history or historical GitHub releases as part of the English migration.
- Guaranteeing automatic upgrades for arbitrary user-modified source files.

## Product boundary

Template-P is a CLI-first scaffolding and project-lifecycle engine. The engine repository contains the CLI source, bundled capabilities, tests, and versioned documentation. It is not itself a generated application template.

The primary public message is:

> Template-P creates production-oriented full-stack projects from verified, composable stack capabilities.

The product layers are:

| Layer | Responsibility |
| --- | --- |
| CLI shell | Commands, prompts, flags, JSON output, and error presentation |
| Capability registry | Metadata, compatibility, support tier, and runtime requirements |
| Resolver | Convert preset or custom configuration into a valid dependency graph |
| Planner | Describe files, dependencies, commands, warnings, and licenses before mutation |
| Composer | Apply versioned template layers and structured file operations |
| Verifier | Enforce capability and generated-project contracts |
| Lifecycle | Manifest, diagnostics, capability additions, diffs, and upgrades |
| Distribution | npm package, bundled templates, releases, and provenance |

AI agent skills and MCP configuration are optional capabilities, not core requirements. A project generated without AI tooling must be complete and fully supported.

## Architecture decision

### Selected: capability registry with composable layers

The selected architecture represents stack choices as small, versioned capabilities that are resolved into a dependency graph and applied in a deterministic order.

```text
Preset or custom configuration
             |
             v
     Capability resolver
             |
             v
 Compatibility and dependency graph
             |
             v
       Execution plan
             |
             v
 Base + framework + adapter + feature layers
             |
             v
    Generated project + manifest
```

This approach avoids duplicating complete templates for every combination and provides the ownership metadata needed for lifecycle operations.

### Rejected: one complete template per combination

This is initially simple but produces an unsustainable number of nearly duplicated templates. Fixes, security updates, and documentation changes drift across combinations, and safe lifecycle operations become impractical.

### Deferred: plugin-first generator

A plugin-first system would freeze an extension API before the domain model is proven and would make supply-chain and compatibility guarantees harder. A limited plugin SDK may expose stable parts of the capability contract in v3.3, after first-party capabilities validate the architecture.

## Configuration model

Interactive answers, CLI flags, presets, and configuration files normalize into a single configuration model before resolution.

```ts
interface StackConfiguration {
  schemaVersion: 1;
  project: {
    name: string;
    packageManager: "pnpm" | "npm" | "bun";
  };
  backend: {
    runtime: "dotnet" | "node" | "python";
    framework: string;
    architecture: "clean" | "modular" | "mvc" | "minimal";
  };
  persistence: {
    database:
      | "postgresql"
      | "sqlserver"
      | "mysql"
      | "sqlite"
      | "mongodb"
      | "none";
    adapter?: string;
  };
  frontend: {
    framework: "vue" | "react" | "next" | "nuxt";
    rendering: "spa" | "ssr" | "hybrid";
    styling: string;
    features: string[];
  };
  capabilities: {
    auth?: string;
    cache?: string;
    jobs?: string;
    observability?: string;
    ai?: string[];
  };
}
```

Framework and architecture are separate values. Composite identifiers such as `express-ddd` are deprecated in favor of explicit configuration.

Configuration precedence is:

```text
explicit CLI flags
-> configuration file
-> selected preset
-> documented defaults
```

Interactive mode asks only for unresolved decisions. Non-interactive mode never opens a prompt.

## Capability registry

Each capability has a stable identifier and a versioned implementation contract.

```ts
interface CapabilityDefinition {
  id: string;
  version: string;
  kind:
    | "runtime"
    | "framework"
    | "architecture"
    | "database"
    | "data-access"
    | "frontend"
    | "feature";
  support: "verified" | "experimental" | "deprecated";
  provides: string[];
  requires: Constraint[];
  conflicts: Constraint[];
  runtimeRequirements: RuntimeRequirement[];
  dependencies: DependencyDeclaration[];
  layers: TemplateLayer[];
  operations: LifecycleOperation[];
  verification: VerificationContract;
}
```

Example stable identifiers include:

```text
runtime/dotnet
backend/aspnet-core
architecture/clean
database/postgresql
data-access/dotnet/ef-core/postgresql
frontend/react/vite
feature/observability/opentelemetry
```

Dependency patch versions are not encoded in capability IDs. They belong to versioned capability metadata, allowing a provider patch update without renaming the public capability.

Presets contain configuration only. They do not own separate source templates. A manifest records the exact preset version used so existing projects do not silently inherit future preset changes.

## Resolution and planning

The resolver performs these steps without writing files:

1. Parse and validate the input schema.
2. Expand the selected preset.
3. Select documented default adapters for unspecified choices.
4. Collect `requires`, `provides`, and `conflicts` constraints.
5. Validate runtime and dependency version requirements.
6. Determine the lowest support tier in the resolved stack.
7. Build a topologically ordered dependency graph.
8. Detect cycles and file-ownership conflicts.
9. Produce an execution plan.

The resolver must not silently replace an explicitly selected adapter. It should report why a combination is unavailable and list verified alternatives.

The execution plan includes:

- Resolved capabilities and support tiers
- Files to create or modify
- Dependency and runtime requirements
- External commands and network access
- License notices and compatibility warnings
- Verification steps

`--dry-run` prints the plan without writing files or installing dependencies.

## Composition engine

Layers are applied in this order, subject to declared dependencies:

```text
workspace base
-> runtime
-> backend framework
-> architecture
-> database
-> data-access adapter
-> frontend
-> optional capabilities
-> documentation
-> finalization
```

The engine supports typed operations rather than relying only on folder copying:

```ts
type FileOperation =
  | CreateFile
  | RenderTemplate
  | MergeJson
  | MergeYaml
  | TransformXml
  | TransformTypeScript
  | TransformCSharp
  | RegisterEnvironmentVariable
  | RegisterPackageDependency
  | RegisterDockerService
  | RegisterWorkspaceScript;
```

Strict template placeholders may be used for simple content. Arbitrary regex replacement is not a safe source-code transformation strategy.

All operations must be idempotent. Applying the same resolved capability graph twice must not duplicate dependencies, scripts, services, middleware, or environment variables.

## File ownership

The manifest distinguishes three ownership modes.

### Exclusive ownership

A capability owns the complete generated file. An untouched file may be replaced during an upgrade. A modified file produces a diff or conflict instead of being overwritten.

### Structured shared ownership

Multiple capabilities may claim individual fields in structured files such as `package.json`, `compose.yaml`, `.env.example`, `appsettings.json`, project files, or Python metadata. Two incompatible claims on the same field are a planning-time conflict.

### User ownership

Business code, custom routes, and user-created files are not managed merely because they live in a generated directory. Managed files changed by the user become `modified-managed` and cannot be silently reclaimed by the CLI.

## Transaction behavior

New projects are generated in a staging directory, structurally validated, and then moved to the target directory. Installation and build verification may run afterward. If those external steps fail, the generated source remains available with a failure report.

Lifecycle changes to existing projects require a clean Git working tree by default, generate a dry-run diff, and record a transaction journal. Internal file changes may be rolled back when validation fails. External package-manager or database side effects are not represented as safely reversible when the underlying tool cannot guarantee rollback.

The engine rejects path traversal, symlinks escaping the project root, unresolved placeholders, conflicting ownership claims, incompatible dependency ranges, and attempts to delete user-owned files.

External commands are declared data with an argument array, working directory, purpose, network behavior, system-mutation behavior, and CI policy. Built-in and community capabilities may not hide arbitrary shell commands in template hooks.

## Project manifest and lifecycle

Generated projects contain two distinct files:

- `template-p.config.json` records reusable user intent.
- `.template-p/manifest.json` records the resolved project state managed by the CLI.

The manifest records:

- Manifest schema and generator versions
- Preset ID and version
- Resolved capabilities and layer versions
- Runtime requirements
- Normalized non-secret configuration
- Managed-file ownership and hashes
- Applied lifecycle migrations

It must not contain credentials, telemetry identifiers, or absolute local paths.

The lifecycle command model is:

```text
create-template create <directory>
create-template list
create-template explain <capability>
create-template doctor
create-template add <capability>
create-template diff
create-template upgrade
```

Running without an explicit subcommand remains compatible with `create`. The v3.0 scope includes `create`, `list`, `explain`, `doctor`, and `--dry-run`. Later v3 releases add mutation and upgrade commands after the ownership model has production evidence.

`doctor` is read-only. `diff` previews managed changes. `add` and `upgrade` use versioned lifecycle migrations and never silently overwrite modified files. Database engine changes produce a migration plan and guidance, not automatic production data transfer.

## CLI experience

Interactive mode starts with recommended presets and offers a custom mode. A preset is a versioned configuration, not a separate template tree.

The CLI supports:

- `--config` for reusable recipes
- `--from-manifest` for recreating the resolved template structure
- `--json` for machine-readable events and errors
- `--no-input` for automation
- `--dry-run` for planning
- `--experimental` for explicitly exposing experimental choices
- `--install-missing` for explicit runtime installation

`--yes` skips confirmation but does not hide invalid or missing configuration. The CLI does not clear the screen when output is redirected or running non-interactively.

Runtime installation is opt-in. Preflight checks otherwise report missing tools and installation guidance. AI skills, MCP, and dynamically fetched integrations are also opt-in. Dynamic sources must show their package, source, and version before execution.

Errors have stable identifiers, a human-readable cause, and a suggested remediation. Representative identifiers include:

```text
TP_COMPOSE_FIELD_CONFLICT
TP_PATH_OUTSIDE_PROJECT
TP_CAPABILITY_CYCLE
TP_MANAGED_FILE_MODIFIED
```

## Generated-project contract

Verified projects share this high-level structure:

```text
project/
|- apps/
|  |- backend/
|  `- frontend/
|- packages/
|  `- api-client/
|- infra/
|  `- compose.yaml
|- docs/
|- .template-p/
|  `- manifest.json
|- .env.example
|- template-p.config.json
|- package.json
`- README.md
```

Root scripts provide a consistent vocabulary while delegating to native backend tools:

```text
dev
build
test
lint
format
api:sync
db:migrate
db:status
db:seed
db:reset
infra:up
infra:down
```

Non-blank backends separate HTTP/API, application use cases, domain logic, and persistence adapters in an ecosystem-appropriate way. They are not forced into identical folder structures. Controllers and routes do not access the database directly.

Blank templates retain safe configuration, error, health, and shutdown behavior but omit the reference domain.

## Reference vertical slice

Verified non-blank projects include a removable `Catalog/Product` example with create, retrieve, list, update, and delete endpoints under `/api/v1/products`.

The slice includes:

- Request and response DTOs
- Validation
- Portable identifier and timestamp contracts
- Pagination
- Consistent HTTP semantics and Problem Details errors
- A persistence port and selected adapter
- Seed data
- Integration tests
- OpenAPI output

The persistence port protects application logic from direct ORM or driver coupling without pretending database-specific capabilities do not exist. Applications may use native database features inside the selected adapter.

## Database and adapter model

Each project selects one primary database. Redis, search, object storage, and similar infrastructure are independent optional capabilities.

The initial database catalog is:

- PostgreSQL
- SQL Server
- MySQL
- SQLite
- MongoDB
- None

MariaDB is not treated as automatically identical to MySQL. It may become a separate verified option after dedicated compatibility testing.

The initial adapter policy is:

| Runtime | Database | Default adapter | Optional adapter |
| --- | --- | --- | --- |
| .NET 10 | PostgreSQL | EF Core 10 + Npgsql | None initially |
| .NET 10 | SQL Server | EF Core 10 + Microsoft provider | None initially |
| .NET 10 | SQLite | EF Core 10 + Microsoft provider | None initially |
| .NET 10 | MySQL | EF Core + Oracle provider | Pomelo after stable EF Core 10 support |
| .NET 10 | MongoDB | Official MongoDB driver | None initially |
| Node.js | PostgreSQL, MySQL, SQL Server, SQLite | Prisma 7 | TypeORM 1; stable Drizzle where supported |
| Node.js | MongoDB | Official MongoDB driver | Mongoose 9 |
| FastAPI | Relational databases | SQLAlchemy 2.0 + Alembic | Database-specific driver choice |
| FastAPI | MongoDB | Async PyMongo | Beanie 2 |

Research-informed constraints as of the design date include:

- Prisma 8 is not a stable universal default for the requested database matrix; verified Node SQL templates pin Prisma 7 until the relevant Prisma 8 connectors are stable.
- Drizzle SQL Server support remains experimental while it requires the release-candidate line.
- TypeORM is not the default MongoDB abstraction because its MongoDB support is intentionally limited compared with native drivers.
- FastAPI MongoDB templates do not use Motor; async PyMongo is the supported direction.
- The Oracle EF Core MySQL provider's license and Universal FOSS Exception must be disclosed. Pomelo becomes eligible when its EF Core 10 line is stable and verified.

Relevant primary references:

- [EF Core providers and releases](https://learn.microsoft.com/en-us/ef/core/what-is-new/)
- [EF Core multiple-provider migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/providers)
- [Prisma release status](https://www.prisma.io/docs/orm/release-status)
- [Prisma migration limitations](https://docs.prisma.io/docs/orm/v7/prisma-migrate/understanding-prisma-migrate/limitations-and-known-issues)
- [Drizzle SQL Server guide](https://orm.drizzle.team/docs/mssql/get-started-mssql)
- [TypeORM MongoDB documentation](https://typeorm.io/docs/drivers/mongodb/)
- [SQLAlchemy 2.0 documentation](https://docs.sqlalchemy.org/en/20/)
- [MongoDB Python async migration guidance](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/reference/migration/)

The default runtime baseline is .NET 10 LTS, Node.js 24.11+ LTS, and Python 3.13. Runtime versions and exact dependency patches remain registry data and must be reviewed during implementation.

## Migration policy

Relational adapters generate provider-specific migrations and expose explicit development and production commands. Production applications do not migrate the database automatically on startup.

- EF Core uses provider-specific migration histories and reviewed scripts or migration bundles for production.
- Prisma uses development migration workflows locally and `migrate deploy` for production.
- SQLAlchemy uses Alembic, with generated revisions reviewed before application.
- SQLite uses the selected migration tool rather than implicit schema creation.

MongoDB official-driver templates include an application-owned, versioned, idempotent migration runner, a `schema_migrations` collection, explicit index initialization, migration locking, status reporting, and seed commands. ODM-specific migration mechanisms may replace this runner when they satisfy the same verification contract.

## Production baseline and optional capabilities

Every non-blank verified backend includes:

- Typed configuration and startup validation
- Structured logging
- Global RFC Problem Details error handling
- Request or correlation identifiers
- Liveness and readiness checks
- Graceful shutdown
- Environment-aware CORS allowlists
- Secret-safe configuration
- OpenAPI
- Sensible request limits and security headers

Authentication is opt-in. The first supported model is provider-neutral OIDC/OAuth 2.0 with JWT validation, role or claim authorization, a protected route, and a frontend PKCE flow. Template-P does not invent a cross-runtime password storage system.

Structured logging and health checks are baseline features. OpenTelemetry is an opt-in, vendor-neutral capability with development console export, environment-configured OTLP export, and an optional collector Compose profile.

Caching and background jobs are independent capabilities. Memory and Redis caching have distinct operational expectations. Redis selection adds configuration, health checks, Docker infrastructure, and integration testing. Job providers are selected according to runtime compatibility rather than being coupled to the primary database.

Docker and GitHub Actions CI are baseline generated-project capabilities. Kubernetes, Terraform, and cloud-provider manifests remain opt-in future work.

## OpenAPI and frontend integration

The backend is the source of truth for the API contract. It generates an OpenAPI document, and `api:sync` updates a checked-in, framework-neutral TypeScript client under `packages/api-client`.

CI fails when the backend contract and checked-in client drift. The client handles typed requests and responses, Problem Details, cancellation, environment-aware base URLs, and an optional authentication token callback. It does not own React, Vue, or other state management.

Frontend reference flows provide product list, detail, create, and edit states with loading, empty, and error handling. Next.js and Nuxt distinguish server and browser configuration so secrets cannot be bundled into client code.

English is the default locale. Vietnamese is generated only when internationalization and the `vi` locale are explicitly selected.

## Verification model

`verified` is an evidence-backed state. The CI model avoids the full Cartesian product by testing boundaries independently and running representative full-stack presets.

### Level 1: registry validation

- Validate registry schemas and stable IDs.
- Reject cycles and unresolved references.
- Ensure verified capabilities do not depend on experimental capabilities.
- Resolve every preset.
- Generate documentation tables from the same registry.

### Level 2: composition contract

- Generate capability fixtures.
- Validate expected files and structured ownership claims.
- Apply operations twice to prove idempotency.
- Reject unresolved tokens, path escapes, and ownership conflicts.

### Level 3: scaffold and build

- Pack and invoke the npm artifact rather than the source tree.
- Scaffold each verified selection path.
- Install or restore dependencies.
- Lint, typecheck, test, and production-build generated code.
- Validate manifests and ensure a second composition pass produces no unexpected changes.

### Level 4: persistence integration

- Start the real selected database.
- Apply migrations or index initialization.
- Seed and execute Product CRUD, pagination, constraint, health, and idempotency tests.
- Use a temporary SQLite file rather than relying only on an in-memory database.

### Level 5: representative full-stack presets

Representative .NET, Node, and FastAPI presets run the complete backend, frontend, and infrastructure path. They verify health, typed-client Product operations, OpenAPI synchronization, frontend production builds, and graceful shutdown.

Ubuntu runs the full integration matrix. Windows and macOS run path, process, scaffold, and representative build tests. Package managers have independent support tiers and are advertised as verified only with matching CI evidence.

## Support tiers

The public tiers are:

- `verified`: complete documented contract and current CI evidence
- `experimental`: available only through explicit opt-in and not covered by the full contract
- `deprecated`: still recognized for a documented transition period with replacement guidance

Promotion requires stable schema and API behavior, documentation, license and dependency review, and all required verification levels. Capabilities may be demoted when upstream software reaches end of life, unresolved vulnerabilities remain, scheduled verification repeatedly fails, or runtime compatibility is lost.

## Security model

The repository uses dependency review, static analysis, secret scanning where available, least-privilege GitHub Actions permissions, and immutable action pins for security-sensitive workflows.

The scaffolder validates names and paths, refuses writes outside the target, rejects escaping symlinks, avoids logging secrets, uses argument arrays instead of shell-string construction, and does not silently execute remote code.

Generated projects use secure configuration defaults, separate development credentials, avoid wildcard credentialed CORS, hide production stack traces, bound database retries and timeouts, and use non-root production containers when a production Dockerfile is selected.

Community plugins are explicit dependencies. Their manifests may be inspected without execution. Community capabilities are not labeled `verified` unless they enter a separately defined trusted verification program.

## Release model

Semantic versioning applies to CLI commands and flags, configuration and manifest schemas, capability IDs, lifecycle behavior, and the future public plugin contract.

The release pipeline:

1. Completes repository and generated-project verification.
2. Builds from a clean checkout.
3. Inspects packed npm contents.
4. Publishes through npm Trusted Publisher and OIDC.
5. Attaches provenance.
6. Creates an English changelog and GitHub release.
7. Runs a post-publish smoke test through the npm registry.

Long-lived npm tokens are not used. Template changes that materially alter newly generated projects may require a minor release even when the CLI programming interface is unchanged.

## English and documentation policy

All first-party repository, CLI, generated-project, and GitHub content uses professional English. This includes root community files, agent and domain documentation, ADRs, prompts, errors, help, examples, code comments, workflow names, issue forms, and release notes.

Exceptions are limited to optional locale fixtures, proper names, technical identifiers, historical Git data, historical releases, and vendored third-party content with its original attribution.

All first-party text uses UTF-8. CI detects known mojibake patterns, unresolved template tokens, accidental Vietnamese in English-only paths, and relevant line-ending or encoding errors using path-aware allowlists rather than banning Unicode globally.

The README remains concise and adoption-oriented. Detailed documentation is organized under `docs/getting-started`, `docs/concepts`, `docs/reference`, `docs/guides`, `docs/contributing`, `docs/architecture`, `docs/adr`, and `docs/agents`.

Command reference, compatibility tables, capability catalogs, and stable error-code documentation are generated from code or registry metadata and checked for drift.

## GitHub repository policy

The repository name remains `Template-P`. The repository becomes the source repository for the CLI engine rather than a GitHub application template.

Planned GitHub configuration changes include:

- Update description, topics, and homepage for CLI-first positioning.
- Disable the GitHub Template flag for the engine repository.
- Keep Issues and Discussions enabled.
- Disable Wiki so versioned repository documentation remains authoritative.
- Enable automatic branch deletion after merge.
- Keep canonical English triage labels and add v3 milestones.
- Require reproducible configuration and sanitized manifests in relevant issue forms.
- Request generated-output and verification evidence in pull requests.

Branch rules should prevent force-push and deletion of `main`, require relevant checks and resolved conversations, and avoid configurations that lock out a single maintainer. Settings are applied with `gh` or the GitHub API only after current permissions and workflow check names are verified.

## Implementation roadmap

### Phase 0: design and safety baseline

- Commit this design specification.
- Inventory first-party and vendored content.
- Add characterization tests for v2 behavior.
- Record representative generated fixtures without changing public behavior.

### Phase 1: English and open-source surface

- Translate first-party content.
- Remove mojibake.
- Reorganize documentation and community templates.
- Apply approved GitHub metadata and setting changes with `gh`.
- Keep this work separate from the architectural rewrite where practical.

### Phase 2: v3 core engine

- Implement the normalized configuration schema and compatibility layer for v2 flags.
- Implement the capability registry, resolver, planner, and dry-run mode.
- Implement typed composition operations, manifests, and ownership.
- Implement `create`, `list`, `explain`, and `doctor`.

### Phase 3: golden vertical slice

Prove the complete architecture with:

```text
.NET 10
+ ASP.NET Core Clean Architecture
+ PostgreSQL and EF Core
+ React and Vite
+ Product vertical slice
+ OpenAPI typed client
+ Docker
+ full integration verification
```

### Phase 4: persistence expansion

Complete .NET adapters, then Node default adapters, then FastAPI default adapters. Alternative adapters follow only after default paths meet the verification contract.

### Phase 5: frontend and presets

Complete Vue, React, Next.js, and Nuxt contracts, SSR and browser configuration, typed client integration, recommended presets, and representative full-stack tests.

### Phase 6: v3 stabilization and release

- Complete cross-platform verification.
- Document compatibility and deprecation behavior.
- Audit package contents.
- Publish a release candidate.
- Run registry smoke tests.
- Release `@thienhn/create-template@3.0.0`.

Later releases add `add` and optional production capabilities in v3.1, conservative `diff` and `upgrade` workflows in v3.2, and a plugin SDK preview in v3.3.

## Acceptance criteria for v3.0

- Repository and npm identity remain unchanged.
- All first-party public content is professional English and UTF-8 clean.
- Configuration no longer encodes framework and architecture in one identifier.
- Prompts, validation, documentation, and CI consume one capability registry.
- Presets resolve through the same registry as custom configurations.
- Planning completes before filesystem mutation and supports `--dry-run`.
- Generated projects contain a safe manifest without secrets or absolute paths.
- The five initial database engines have complete default adapters for each advertised verified backend path.
- Every verified adapter includes configuration, migration or schema evolution, seed, health, Docker where appropriate, CRUD, integration tests, and documentation.
- Generated non-blank projects expose the shared Product/OpenAPI contract and a synchronized typed frontend client.
- Verified combinations pass the required scaffold, build, integration, and representative end-to-end checks.
- Experimental choices are hidden by default and require explicit opt-in.
- Runtime installation, AI skills, MCP, and remote code execution are opt-in.
- npm publication continues through Trusted Publisher/OIDC with provenance and a post-publish smoke test.

## Approved decisions

This specification records the approved decisions from the design review:

- One primary database plus independent optional infrastructure capabilities
- Full vertical integration as the minimum contract for database support
- Ecosystem-native data-access choices
- Database-first selection with advanced adapter selection
- Compatibility-filtered prompts and fail-fast flags
- `Catalog/Product` as the reference vertical slice
- Explicit migrations with development-only optional bootstrap
- Capability model separated by runtime, framework, architecture, and adapter
- Depth before breadth and a later extension architecture
- OpenAPI as the frontend/backend boundary
- Three support tiers
- Opt-in OIDC, OpenTelemetry, caching, jobs, AI, MCP, and runtime installation
- Docker and CI as generated-project baselines
- Versioned project manifest and conservative lifecycle behavior
- Explicit plugin trust model
- .NET 10, Node.js 24.11+, and Python 3.13 runtime baselines
- Provider-specific migration histories and explicit MongoDB schema evolution
- Deterministic interactive and automation modes
- Transactional generation and reproducible bundled verified templates
- Professional English first-party content with optional Vietnamese localization
- A staged v3 roadmap rather than one monolithic release
- Retention of the existing repository and npm package names
