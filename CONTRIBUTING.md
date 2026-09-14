# Contributing to Template-P & @thienhn/create-template

Welcome to the project! We are thrilled that you want to contribute to `@thienhn/create-template`. Whether you are fixing bugs, adding new blueprints (e.g., Go, Rust, Svelte), improving documentation, or proposing new features, your help is warmly appreciated.

---

## 🧭 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior via GitHub Issues or contact the repository owner.

---

## 🛠️ Local Development Setup

### Prerequisites

- **Node.js**: >= 22.13.0
- **Package Manager**: `pnpm` 11.15.1
- **Git**: Configured on your machine

### 1. Fork & Clone

```bash
git clone https://github.com/<your-username>/Template-P.git
cd Template-P
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Build & Watch

```bash
# Build all packages & CLI bundle
pnpm build

# Check types and the CLI compatibility contract
pnpm typecheck
pnpm test

# Watch mode for CLI development
pnpm dev
```

### 4. Test Scaffolding Locally

You can test running the CLI directly:

```bash
pnpm create my-test-app
```

Or test non-interactive CLI flags:

```bash
node ./packages/cli/bin/create-template.js my-test-app --backend dotnet --arch webapi-ddd --frontend vue3 --db postgres --yes
```

---

## 🌿 Branching & Commit Discipline

We follow **Conventional Commits**:

- `feat:` A new feature or template
- `fix:` A bug fix
- `docs:` Documentation only changes
- `refactor:` Code changes that neither fix a bug nor add a feature
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to build process, auxiliary tools, or dependencies

### Branch Naming Conventions

- `feat/<issue-id>-<slug>`
- `fix/<issue-id>-<slug>`
- `docs/<slug>`
- `refactor/<slug>`

---

## 🛡️ Zero-Leakage Security Rules (CRITICAL)

- **NEVER COMMIT CREDENTIALS:** Absolutely NO API keys, real database connection strings, JWT secrets, or private keys in code or commits.
- **ALL CREDENTIALS IN .env:** Keep sensitive parameters in local `.env` (ignored by git). Always maintain a sanitized `.env.example`.

---

## 🚀 Submitting a Pull Request (PR)

1. Create a branch from `main`.
2. Make your modifications cleanly.
3. Test locally: ensure `pnpm build` completes with 0 errors.
4. Push your branch to your fork.
5. Open a Pull Request against `main` on [ThienHN0910/Template-P](https://github.com/ThienHN0910/Template-P).
6. Fill in the Pull Request template describing the changes made and tests performed.

Thank you for helping build a better fullstack developer experience for everyone! ❤️
