# AGENTS.md

Welcome, AI agents and developers. This file defines operating rules, agent configurations, and domain guidance for `template-p`, the Universal Fullstack Template and CLI Engine.

## Agent skills

### Issue tracker

Local Markdown files in `.scratch/` are the issue tracker. See [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md).

### Triage labels

The canonical five triage labels are `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See [docs/agents/triage-labels.md](docs/agents/triage-labels.md).

### Domain documentation

The repository uses a single-context documentation layout. See [docs/agents/domain.md](docs/agents/domain.md).

## Project overview

`template-p` is a CLI scaffolder and source repository for `@thienhn/create-template`.

1. It provides an interactive `npx` command, such as `npx @thienhn/create-template`, for creating full-stack projects.
2. Current v2 selections include .NET, Node.js, and FastAPI backends, plus Clean Architecture/DDD, MVC, and blank or modular architecture choices where supported.
3. It performs environment checks for `dotnet`, `node`, and `python`, and can provide runtime-installation guidance through an operating-system package manager when a runtime is missing.
4. It offers Vue 3, React, Next.js, and Nuxt 3 frontends with current v2 feature options such as dark/light themes, SCSS or Tailwind where applicable, and i18n.
5. It can include optional AI-agent skills and MCP configuration in a scaffolded project.

The [v3 capability architecture](docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md) is approved planned work, not currently shipped v2 behavior.
