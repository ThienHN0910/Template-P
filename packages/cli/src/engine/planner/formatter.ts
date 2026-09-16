import type { ExecutionPlan } from './types.js';

export function formatPlanText(plan: ExecutionPlan): string {
  const lines = [
    `=== Execution Plan for "${plan.projectName}" ===`,
    `Support Tier: ${plan.supportTier}`,
    '',
    'Capabilities:',
    ...plan.plannedCapabilities.map((c) => `  - ${c}`),
    '',
    'Files to Create:',
    ...plan.filesToCreate.map((f) => `  + ${f}`),
    '',
    'Commands to Run:',
    ...plan.commands.map((cmd) => `  $ ${cmd.command} ${cmd.args.join(' ')} (${cmd.purpose})`),
  ];

  if (plan.warnings.length > 0) {
    lines.push('', 'Warnings:', ...plan.warnings.map((w) => `  ! ${w}`));
  }

  return lines.join('\n');
}
