# Verification

Run the repository checks from a clean checkout before submitting a change:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

Changes to the CLI or bundled blueprints also require the packed-artifact scaffold matrix. The GitHub workflow builds the package, packs the CLI artifact, and verifies scaffold, install, build, and health for its named Node.js, .NET, and FastAPI blank-backend combinations. See [`scaffold-matrix.yml`](../../.github/workflows/scaffold-matrix.yml) and `scripts/verify-scaffold-matrix.mjs`.

When validating the matrix locally, use the same backend, architecture, and package-manager selections as a matrix row, and use `--offline --no-ai` so the verification remains independent of upstream generators and dynamic-skill downloads.

Documentation changes must also pass:

```bash
node --test scripts/content-policy.test.mjs
```

The policy test enforces English-only first-party public documentation and detects known mojibake patterns.
