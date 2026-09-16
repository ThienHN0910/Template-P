import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanPolicy } from './content-policy.mjs';
import { FIRST_PARTY_CONTENT_POLICY } from './first-party-content-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const violations = await scanPolicy({
  root,
  ...FIRST_PARTY_CONTENT_POLICY,
});

if (violations.length > 0) {
  for (const violation of violations) {
    console.error(`${violation.rule}: ${violation.file}`);
  }
  process.exitCode = 1;
} else {
  console.log('First-party content policy passed.');
}
