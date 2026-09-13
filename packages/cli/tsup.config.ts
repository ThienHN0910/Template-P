import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  clean: true,
  noExternal: [/.*/],
  banner: {
    js: `#!/usr/bin/env node
import { createRequire as __createRequire } from 'node:module';
var require = __createRequire(import.meta.url);
`,
  },
});
