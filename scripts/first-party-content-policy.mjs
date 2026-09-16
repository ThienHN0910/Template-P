export const FIRST_PARTY_CONTENT_POLICY = {
  roots: [
    '.github', '.gitignore', 'AGENTS.md', 'CHANGELOG.md', 'CODE_OF_CONDUCT.md', 'CONTEXT.md',
    'CONTRIBUTING.md', 'LICENSE', 'package.json', 'README.md', 'SECURITY.md', 'SUPPORT.md', 'docs',
    'packages/cli/README.md', 'packages/cli/bin', 'packages/cli/package.json', 'packages/cli/scripts',
    'packages/cli/src', 'packages/cli/tests', 'packages/cli/tsconfig.json', 'packages/cli/tsup.config.ts',
    'pnpm-workspace.yaml', 'scripts', 'templates/backend', 'templates/frontend', 'templates/mcp',
    'templates/v3',
  ],
  excludePrefixes: [
    '.scratch',
    'docs/superpowers/plans',
    'templates/skills',
  ],
  vietnameseLocaleFiles: [
    'packages/cli/src/scaffolder/locales/vue.ts',
    'templates/frontend/vue3-vite/src/i18n.ts',
  ],
};
