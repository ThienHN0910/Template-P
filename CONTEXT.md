# CONTEXT.md: Template-P CLI Engine

## Domain glossary

- **CLI Engine**: The interactive command-line coordinator in `packages/cli`. It gathers prompts, validates selections, performs environment checks, and copies or transforms templates.
- **Preflight Check**: The process that checks for the required command-line runtime and version on the host before scaffolding.
- **Runtime Installer**: The component that offers or invokes operating-system package-manager commands, such as `winget`, `brew`, or `apt`, with a fallback download link when a required runtime is missing.
- **Template Blueprint**: A static or dynamic project template in `templates/backend/*`, `templates/frontend/*`, or `templates/skills/*`.
- **Scaffolded Project**: The full-stack monorepo created for a user, typically containing `apps/backend`, `apps/frontend`, documentation, and optional AI-agent configuration.
- **Hybrid Scaffolder**: The current v2 approach that can invoke an official upstream generator for a frontend, then apply Template-P layers such as themes, styling, i18n, API-client, and proxy configuration. It uses bundled templates when offline or when an upstream invocation cannot be used.
- **Dynamic Skills Engine**: The current v2 integration that can invoke `skills.sh` through `npx skills@latest add <owner/repo>` to retrieve optional, current skills for a developer machine.
- **AI Agent Bundle**: Optional AI skills, agent instruction files, and MCP-server configuration included in a scaffolded project.

## Core invariants

1. The CLI handles a missing runtime without an unhandled crash and provides guidance or an installation option.
2. A project name must comply with npm package-name rules: lowercase, hyphenated where needed, and without unsupported special characters.
3. Frontend blueprints include the current v2 theme and i18n configuration selected by the CLI.
4. DDD backend blueprints keep Domain, Application, Infrastructure, and Presentation/API layers separate.

## Scope note

These terms describe current v2 behavior. The v3 capability registry, lifecycle commands, and expanded verification model are planned in the [approved design specification](docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md) and are not shipped behavior.
