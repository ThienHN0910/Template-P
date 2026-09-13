#!/usr/bin/env node

import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const cliEntry = path.resolve(currentDir, '../packages/cli/dist/index.js');

console.log('🚀 Launching Universal Template Scaffolder...');

try {
  await execa('node', [cliEntry, ...process.argv.slice(2)], {
    stdio: 'inherit',
  });
} catch (error) {
  process.exit(error.exitCode || 1);
}
