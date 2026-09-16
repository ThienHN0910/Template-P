# 3. Hybrid upstream delegation and dynamic skills

Date: 2026-09-13

**Status:** Superseded by the approved v3 capability architecture on 2026-09-16.

This ADR records the historical v1/v2 decision. New implementation work follows the v3 design specification.

## Context

The initial CLI copied static frontend templates for Vue 3, React, Next.js, and AI skills. That approach exposed several limitations:

1. **Missing ecosystem-standard choices:** Developers accustomed to `create-vue@latest` expect options such as TypeScript, Vue Router, Pinia, ESLint, Prettier, Vitest, and Cypress or Playwright.
2. **Version staleness risk:** When Vue, Vite, or Next.js releases a new version, static templates can fall behind current community conventions.
3. **Incomplete AI-skill sets:** `mattpocock/skills` contains more than 37 skills and changes on GitHub; copying only a small fixed set loses much of that ecosystem.

## Decision

1. Adopt a hybrid upstream scaffolder:
   - The CLI asks for standard ecosystem choices similar to official tools such as `create-vue` and `create-next-app`.
   - The CLI calls an official generator with matching flags, for example `npm create vue@latest apps/frontend -- --ts --router --pinia --eslint --prettier`.
   - It then layers Template-P customization onto the result:
     - A dark/light theme switcher.
     - SCSS preprocessing or Tailwind CSS.
     - English and Vietnamese i18n.
     - API proxy configuration and a typed API client for the selected backend.
   - When offline or when the official command fails, the CLI falls back to bundled static templates.
2. Integrate the `skills.sh` management tool:
   - Use `npx skills@latest add <owner/repo> --agent * --all --copy -y` to retrieve current skills from GitHub, including `mattpocock/skills`.
   - Load skills into selected agent directories such as `.gemini/skills/`, `.claude/skills/`, and `.cursor/skills/`.
   - Keep an offline fallback under `templates/skills/`.

## Consequences

- Generated projects are intended to receive current framework versions without maintaining every static template manually.
- The AI-skill set is intended to remain complete and current through its upstream source.
- The developer experience is intended to follow modern web-ecosystem conventions.

These are historical v1/v2 decisions. Remote generators and dynamic skills remain mutable integration points, and the [approved v3 capability architecture](../superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md) defines the planned replacement direction.
