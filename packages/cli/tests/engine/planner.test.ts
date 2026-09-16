import { describe, expect, it } from 'vitest';
import { resolveCapabilities } from '../../src/engine/resolver/resolver.js';
import { buildExecutionPlan } from '../../src/engine/planner/planner.js';
import { formatPlanText } from '../../src/engine/planner/formatter.js';
import type { StackConfiguration } from '../../src/engine/configuration/schema.js';

describe('Execution Planner', () => {
  it('creates an execution plan with files, commands, and support tier', () => {
    const config: StackConfiguration = {
      schemaVersion: 1,
      project: { name: 'plan-demo', packageManager: 'pnpm' },
      backend: { runtime: 'dotnet', framework: 'aspnet-core', architecture: 'clean' },
      persistence: { database: 'postgresql' },
      frontend: { framework: 'react', rendering: 'spa', styling: 'tailwind', features: [] },
      capabilities: {},
    };

    const resolution = resolveCapabilities(config);
    const plan = buildExecutionPlan(resolution);

    expect(plan.projectName).toBe('plan-demo');
    expect(plan.supportTier).toBe('verified');
    expect(plan.plannedCapabilities.length).toBeGreaterThan(0);
    expect(plan.filesToCreate).toContain('template-p.config.json');
    expect(plan.filesToCreate).toContain('.template-p/manifest.json');

    const formatted = formatPlanText(plan);
    expect(formatted).toContain('plan-demo');
    expect(formatted).toContain('Execution Plan');
  });
});
