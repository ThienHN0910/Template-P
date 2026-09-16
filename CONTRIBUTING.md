# Contributing to Template-P and @thienhn/create-template

Thank you for contributing to `@thienhn/create-template`. Bug fixes, documentation improvements, blueprint proposals, and focused feature work are welcome.

## Code of Conduct

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). Report unacceptable behavior through GitHub Issues or the repository owner.

## Local development

Prerequisites:

- Node.js 22.13 or later
- pnpm 11.15.1
- Git

```bash
git clone https://github.com/<your-username>/Template-P.git
cd Template-P
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

Use `pnpm dev` to watch the CLI during development. To exercise the local CLI, run:

```bash
pnpm create my-test-app
```

For a non-interactive local invocation:

```bash
node ./packages/cli/bin/create-template.js my-test-app --backend dotnet --arch webapi-ddd --frontend vue3 --database postgres --yes
```

Read the [verification guide](docs/contributing/verification.md) before submitting a change. The [current v2 compatibility contract](docs/reference/compatibility.md) defines the difference between offered and full-matrix-verified combinations.

## Branches and commits

Use Conventional Commits:

- `feat:` — a feature or template
- `fix:` — a bug fix
- `docs:` — documentation-only work
- `refactor:` — code changes that neither fix a bug nor add a feature
- `test:` — tests or test corrections
- `chore:` — build, tooling, or dependency changes

Suggested branch names include `feat/<issue-id>-<slug>`, `fix/<issue-id>-<slug>`, `docs/<slug>`, and `refactor/<slug>`.

## Security rules

- Never commit credentials, real database connection strings, JWT secrets, or private keys.
- Keep sensitive values in ignored local `.env` files and maintain sanitized `.env.example` files.

## Pull requests

1. Branch from `main` and keep the change focused.
2. Run the applicable verification commands, including the packed-artifact matrix for CLI or blueprint changes.
3. Push the branch to your fork and open a pull request against `main`.
4. Complete the pull-request template with the change and verification evidence.

See [SECURITY.md](SECURITY.md) for private vulnerability reporting and [SUPPORT.md](SUPPORT.md) for community support.
