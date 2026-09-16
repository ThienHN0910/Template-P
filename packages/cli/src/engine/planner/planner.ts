import type { ResolutionResult } from '../resolver/resolver.js';
import type { ExecutionPlan } from './types.js';

export function buildExecutionPlan(resolution: ResolutionResult): ExecutionPlan {
  const filesToCreate: string[] = [
    'template-p.config.json',
    '.template-p/manifest.json',
    '.gitignore',
    'README.md',
  ];

  if (resolution.config.frontend.framework !== 'none') {
    filesToCreate.push('package.json');
  }

  const commands = [
    {
      command: resolution.config.project.packageManager,
      args: ['install'],
      purpose: 'Install workspace dependencies',
    },
  ];

  return {
    projectName: resolution.config.project.name,
    supportTier: resolution.supportTier,
    plannedCapabilities: resolution.orderedCapabilities.map((c) => c.id),
    filesToCreate,
    commands,
    warnings: [],
  };
}
