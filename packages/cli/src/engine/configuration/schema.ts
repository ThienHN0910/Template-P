export interface StackConfiguration {
  schemaVersion: 1;
  project: {
    name: string;
    packageManager: 'pnpm' | 'npm' | 'bun';
  };
  backend: {
    runtime: 'dotnet' | 'node' | 'python';
    framework: string;
    architecture: 'clean' | 'modular' | 'mvc' | 'minimal' | 'blank';
  };
  persistence: {
    database:
      | 'postgresql'
      | 'sqlserver'
      | 'mysql'
      | 'sqlite'
      | 'mongodb'
      | 'none';
    adapter?: string;
  };
  frontend: {
    framework: 'vue' | 'react' | 'next' | 'nuxt' | 'none';
    rendering: 'spa' | 'ssr' | 'hybrid' | 'none';
    styling: string;
    features: string[];
  };
  capabilities: {
    auth?: string;
    cache?: string;
    jobs?: string;
    observability?: string;
    ai?: string[];
  };
}
