# 02: Verify the CLI workspace contract

**What to build:** Maintainers can run fast tests and typechecking that prove the CLI's public validation and generated workspace contract.

**Blocked by:** 01: Enforce a safe CLI workspace contract.

**Status:** resolved

- [x] The package has typecheck and test commands.
- [x] Tests cover valid and invalid output paths, package-manager workspace output, and runtime port output.
- [x] CI fails when typechecking, tests, build, or package artifact verification fails.

## Answer

Vitest provides fourteen behavior-focused contract tests. CI now performs frozen
installation, typechecking, tests, build, and npm package dry-run verification.
