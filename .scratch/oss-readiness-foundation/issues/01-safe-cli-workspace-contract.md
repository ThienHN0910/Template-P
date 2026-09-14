# 01: Enforce a safe CLI workspace contract

**What to build:** A CLI invocation validates and contains its Scaffolded Project output, and the generated workspace uses the selected package manager from application directories.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Invalid, traversal, absolute, and occupied targets fail before scaffolding.
- [x] Generated manifests declare a portable workspace and do not filter invented package names.
- [x] The generated environment exposes the backend port in the runtime-compatible form.

## Answer

The CLI Engine now accepts only lowercase npm-compatible names, validates backend-specific
architectures and package-manager choices, rejects non-empty output targets, and constructs
root scripts from application directories. The generated environment now includes `PORT`.
