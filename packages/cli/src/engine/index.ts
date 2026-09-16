import { BUILTIN_PRESETS } from './configuration/presets.js';
import { normalizeConfiguration } from './configuration/normalizer.js';
import { resolveCapabilities } from './resolver/resolver.js';
import { buildExecutionPlan } from './planner/planner.js';
import type { ExecutionPlan } from './planner/types.js';

export * from './configuration/schema.js';
export * from './configuration/normalizer.js';
export * from './configuration/presets.js';
export * from './registry/types.js';
export * from './registry/registry.js';
export * from './resolver/resolver.js';
export * from './planner/types.js';
export * from './planner/planner.js';
export * from './planner/formatter.js';
export * from './manifest/manifest.js';

export function executeDryRun(options: { preset?: string; name?: string }): ExecutionPlan {
  const presetConfig = options.preset ? BUILTIN_PRESETS[options.preset] : BUILTIN_PRESETS['dotnet-clean-react'];
  if (!presetConfig) {
    throw new Error(`Preset "${options.preset}" not found.`);
  }

  const config = normalizeConfiguration({
    ...presetConfig,
    project: {
      ...presetConfig.project,
      name: options.name || presetConfig.project.name,
    },
  });

  const resolution = resolveCapabilities(config);
  return buildExecutionPlan(resolution);
}
