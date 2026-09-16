import { describe, expect, it } from 'vitest';
import { executeDryRun } from '../src/engine/index.js';

describe('CLI Dry Run Integration', () => {
  it('executes a dry run from a preset name', () => {
    const plan = executeDryRun({ preset: 'dotnet-clean-react', name: 'preset-demo' });
    expect(plan.projectName).toBe('preset-demo');
    expect(plan.plannedCapabilities).toContain('backend/aspnet-core');
    expect(plan.supportTier).toBe('verified');
  });
});
