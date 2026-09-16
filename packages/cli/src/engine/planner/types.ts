import type { SupportTier } from '../registry/types.js';

export interface PlannedCommand {
  command: string;
  args: string[];
  purpose: string;
}

export interface ExecutionPlan {
  projectName: string;
  supportTier: SupportTier;
  plannedCapabilities: string[];
  filesToCreate: string[];
  commands: PlannedCommand[];
  warnings: string[];
}
