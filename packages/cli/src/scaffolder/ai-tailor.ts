import { ProjectConfig } from '../types.js';

export function generateAgentsMarkdown(config: ProjectConfig): string {
  return `# AGENTS.md

Welcome AI assistant to **${config.projectName}**.
This repository was scaffolded with **create-p-stack** as a high-performance Fullstack Monorepo.

## Project Architecture & Tech Stack
- **Backend**: \`${config.backend.type}\` (${config.backend.architecture}) running on port \`${config.backend.type === 'dotnet' ? 5050 : config.backend.type === 'fastapi' ? 8000 : 4000}\`.
- **Database**: \`${config.database}\`
- **Frontend**: \`${config.frontend.type}\` with Dark/Light theme and i18n support.
- **Root Orchestrator**: \`${config.packageManager}\` workspace running unified \`${config.packageManager} dev\`.

## Critical Engineering Rules
1. **Zero-Leakage Secrets Hygiene**:
   - Never write credentials, raw API keys, or connection strings into code. Always use \`.env\` and document in \`.env.example\`.
2. **Frontend 60fps Animation Rule**:
   - Animate strictly GPU-accelerated CSS properties (\`transform: translate3d(...)\`, \`opacity\`, \`scale\`). Never animate layout triggers.
3. **Architecture Respect**:
   - Keep business logic in Domain/Application layer. Do not pollute Controllers/Routers with domain rules.

## AI Skills Available
- Issue tracker & triage: see \`docs/agents/\`.
- Installed skills: located in \`.gemini/skills/\` or \`.claude/skills/\`.
`;
}

export function generateClaudeMarkdown(config: ProjectConfig): string {
  return `# CLAUDE.md

Guidelines for Claude Code operating on ${config.projectName}.

## Build & Dev Commands
- Start both Backend and Frontend: \`${config.packageManager} dev\`
- Build all packages: \`${config.packageManager} build\`

## Stack Specifics
- Backend: ${config.backend.type} (${config.backend.architecture})
- Frontend: ${config.frontend.type}
- Database: ${config.database}

## Zero-Leakage Security
Do not commit \`.env\` files. Verify modified files before pushing.
`;
}

export function generateCursorRules(config: ProjectConfig): string {
  return `You are an expert fullstack engineer working on ${config.projectName}.
Tech Stack:
- Backend: ${config.backend.type} (${config.backend.architecture})
- Frontend: ${config.frontend.type}
- Database: ${config.database}

Always write clean, type-safe, maintainable code.
Respect separation of concerns and never hardcode sensitive secrets.
`;
}
