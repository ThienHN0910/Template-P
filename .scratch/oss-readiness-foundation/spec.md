# OSS readiness and scaffold compatibility contract

**Status:** ready-for-agent
**Public tracking:** [GitHub issue #2](https://github.com/ThienHN0910/Template-P/issues/2)

## Problem Statement

The CLI Engine promises reusable Scaffolded Projects across several runtimes, frontends,
databases, and package managers. Its generated workspace scripts, non-interactive input
handling, verification loop, and release safeguards do not yet provide a reliable contract
for that promise.

## Solution

Define and enforce a small compatibility contract at the CLI Engine's public seam. A valid
invocation must create a contained, empty Scaffolded Project; its root workspace commands
must address the generated application directories independently of package names; and
the contract must be covered by fast automated tests and CI gates.

## User Stories

1. As a CLI user, I can pass a valid project name in interactive or non-interactive mode and know the output remains beneath my current directory.
2. As a CLI user, I receive a clear failure before any files are written for an invalid name or an occupied target directory.
3. As a Scaffolded Project owner, I can use the selected package manager to run the generated frontend and Node backend without depending on arbitrary package names.
4. As a maintainer, I can change a Template Blueprint and receive a deterministic signal when the generated workspace contract regresses.
5. As an OSS consumer, I can find security reporting, support, compatibility, and release expectations in the repository.

## Implementation Decisions

- The public seam is CLI invocation plus the generated root workspace manifest; tests observe these artifacts rather than private prompt implementation.
- `pnpm`, `npm`, and Bun projects declare an `apps/*` workspace contract. Root scripts run within application directories rather than filtering guessed package names.
- The CLI Engine validates project names and target containment once, before the Scaffolder writes any output. A non-empty target is an error.
- The first verification matrix is representative rather than a Cartesian product. It protects the supported contract while keeping CI fast.
- A release may only publish after immutable dependency installation, typecheck, tests, build, and package-artifact verification.

## Testing Decisions

- Unit tests cover the public input and generated-manifest seams with known-good inputs and rejection cases.
- Contract tests construct representative ProjectConfig values and inspect generated workspace metadata without network access.
- CI runs typecheck, tests, build, and `npm pack --dry-run`; a later ticket adds isolated packed-artifact execution and wider scaffold smoke tests.

## Out of Scope

- Adding frameworks, authentication, cloud deployment, telemetry, payment, or business-domain templates.
- Changing the default architecture of an existing Template Blueprint beyond the workspace contract.
- Publishing a new npm version or changing GitHub branch protection settings.
