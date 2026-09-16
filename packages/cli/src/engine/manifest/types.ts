import type { SupportTier } from '../registry/types.js';
import type { StackConfiguration } from '../configuration/schema.js';

export interface ProjectManifest {
  schemaVersion: 1;
  generatorVersion: string;
  projectName: string;
  supportTier: SupportTier;
  capabilities: string[];
  configuration: StackConfiguration;
}
