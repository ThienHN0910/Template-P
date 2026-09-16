import type { ResolutionResult } from '../resolver/resolver.js';
import type { ProjectManifest } from './types.js';

export function generateManifest(resolution: ResolutionResult): ProjectManifest {
  return {
    schemaVersion: 1,
    generatorVersion: '3.0.0',
    projectName: resolution.config.project.name,
    supportTier: resolution.supportTier,
    capabilities: resolution.orderedCapabilities.map((c) => c.id),
    configuration: resolution.config,
  };
}

export function serializeManifest(manifest: ProjectManifest): string {
  return JSON.stringify(manifest, null, 2) + '\n';
}
