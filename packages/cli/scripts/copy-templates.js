import fsp from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceTemplates = path.resolve(__dirname, '../../../templates');
const destTemplates = path.resolve(__dirname, '../templates');

async function syncTemplates() {
  if (fs.existsSync(sourceTemplates)) {
    await fsp.mkdir(destTemplates, { recursive: true });
    await fsp.cp(sourceTemplates, destTemplates, { recursive: true });
    console.log('✓ Synced templates into packages/cli/templates for npm packaging.');
  }
}

syncTemplates().catch((err) => {
  console.error('Failed to sync templates:', err);
  process.exit(1);
});
