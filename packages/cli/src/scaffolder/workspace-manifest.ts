import { PackageManager, ProjectConfig } from '../types.js';

function runPackageScript(packageManager: PackageManager, directory: string, script: string): string {
  return `cd ${directory} && ${packageManager} run ${script}`;
}

function wrapConcurrentCommands(...commands: string[]): string {
  return `concurrently -n "${commands.map((_, index) => (index === 0 ? 'BE' : 'FE')).join(',')}" -c "cyan,magenta" ${commands
    .map((command) => `"${command}"`)
    .join(' ')}`;
}

export function createRootWorkspaceManifest(
  config: ProjectConfig,
  backendDevCommand: string,
  backendBuildCommand?: string
): Record<string, unknown> {
  const frontendDevCommand = runPackageScript(config.packageManager, 'apps/frontend', 'dev');
  const frontendBuildCommand = runPackageScript(config.packageManager, 'apps/frontend', 'build');

  return {
    name: config.projectName,
    version: '1.0.0',
    private: true,
    type: 'module',
    workspaces: ['apps/*'],
    scripts: {
      dev: wrapConcurrentCommands(backendDevCommand, frontendDevCommand),
      build: backendBuildCommand
        ? wrapConcurrentCommands(backendBuildCommand, frontendBuildCommand)
        : frontendBuildCommand,
    },
    devDependencies: {
      concurrently: '^9.1.2',
    },
  };
}

export function createNodeBackendCommand(packageManager: PackageManager, script: 'dev' | 'build'): string {
  return runPackageScript(packageManager, 'apps/backend', script);
}
