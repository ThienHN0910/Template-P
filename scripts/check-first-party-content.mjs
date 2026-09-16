import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanPolicy } from './content-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const violations = await scanPolicy({
  root,
  roots: [
    '.github', 'AGENTS.md', 'CHANGELOG.md', 'CODE_OF_CONDUCT.md', 'CONTEXT.md',
    'CONTRIBUTING.md', 'LICENSE', 'package.json', 'README.md', 'SECURITY.md', 'SUPPORT.md', 'docs',
    'packages/cli/README.md', 'packages/cli/package.json', 'packages/cli/scripts',
    'packages/cli/src', 'packages/cli/tests', 'scripts', 'templates/backend', 'templates/frontend',
    'templates/mcp',
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
});

if (violations.length > 0) {
  for (const violation of violations) {
    console.error(`${violation.rule}: ${violation.file}`);
  }
  process.exitCode = 1;
} else {
  console.log('First-party content policy passed.');
}
