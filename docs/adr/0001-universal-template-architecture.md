# 1. Universal Fullstack Template and CLI Engine architecture

Date: 2026-09-13

**Status:** Superseded by the approved v3 capability architecture on 2026-09-16.

This ADR records the historical v1/v2 decision. New implementation work follows the v3 design specification.

## Context and problem

Developers regularly spend considerable time starting a new project:

- Choosing a backend framework (.NET, Node.js, or FastAPI) and establishing architecture layers such as DDD/Clean Architecture or MVC.
- Installing runtimes and checking development-machine tools.
- Configuring a frontend (Vue 3, React, Next.js, or Nuxt 3) with common needs including dark/light themes, SCSS, and i18n.
- Integrating AI coding assistants, including Matt Pocock skills, Taste skills, Ponytail, and MCP servers.

## Decision

1. Build `template-p` as a hybrid, dual-mode monorepo:
   - An independent CLI package in `packages/cli` that can be published to npm and invoked as `npx create-p-stack`.
   - A template repository in `templates/` containing backend, frontend, AI-skill, and MCP-configuration blueprints.
   - Support for a GitHub Template Repository flow in which a user selects **Use this template** and runs an internal wizard.
2. Provide an interactive CLI experience:
   - Use `@clack/prompts` for arrow-key navigation, space-bar multi-selection, enter-to-confirm behavior, and a default when the user skips a value.
3. Provide preflight checks and an installer:
   - Run runtime checks for `dotnet`, `node`, and `python`.
   - Offer installation through the appropriate operating-system package manager (`winget` on Windows, `brew` on macOS, or `apt` on Linux), with a fallback link.
4. Be AI-native from the start:
   - Create `.gemini/skills/` or `.claude/skills/` and MCP-server configuration for the target project.

## Consequences

- New templates can be added by adding directories under `templates/`.
- Initial project setup is intended to shrink from hours to less than a minute.
- The generated structure is intended to support coding standards, a sanitized `.env.example`, and a clean layout.

This historical decision is retained for context. See the [approved v3 capability architecture](../superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md) for planned implementation direction.
