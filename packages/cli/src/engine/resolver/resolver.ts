import type { StackConfiguration } from '../configuration/schema.js';
import type { CapabilityDefinition, SupportTier } from '../registry/types.js';
import { CapabilityRegistry, getBuiltinRegistry } from '../registry/registry.js';
import { topologicalSortCapabilities } from './graph.js';

export interface ResolutionResult {
  config: StackConfiguration;
  resolvedIds: string[];
  orderedCapabilities: CapabilityDefinition[];
  supportTier: SupportTier;
}

export function resolveCapabilities(
  config: StackConfiguration,
  registry: CapabilityRegistry = getBuiltinRegistry(),
): ResolutionResult {
  const selectedIds = new Set<string>();

  selectedIds.add(`runtime/${config.backend.runtime}`);
  selectedIds.add(`backend/${config.backend.framework}`);
  selectedIds.add(`architecture/${config.backend.architecture}`);
  selectedIds.add(`database/${config.persistence.database}`);
  selectedIds.add(`frontend/${config.frontend.framework}`);

  // Resolve dependencies transitively
  const queue = Array.from(selectedIds);
  while (queue.length > 0) {
    const id = queue.shift()!;
    const def = registry.get(id);
    if (!def) {
      throw new Error(`Unknown capability "${id}" required by configuration.`);
    }

    for (const dep of def.dependencies) {
      if (!selectedIds.has(dep.id)) {
        selectedIds.add(dep.id);
        queue.push(dep.id);
      }
    }
  }

  const selectedCapabilities = Array.from(selectedIds).map((id) => registry.get(id)!);

  // Check conflicts
  for (const cap of selectedCapabilities) {
    for (const conflict of cap.conflicts) {
      if (selectedIds.has(conflict.target)) {
        throw new Error(
          `Capability conflict: "${cap.id}" conflicts with "${conflict.target}".`,
        );
      }
    }
  }

  // Calculate support tier
  let supportTier: SupportTier = 'verified';
  if (selectedCapabilities.some((c) => c.support === 'deprecated')) {
    supportTier = 'deprecated';
  } else if (selectedCapabilities.some((c) => c.support === 'experimental')) {
    supportTier = 'experimental';
  }

  const orderedCapabilities = topologicalSortCapabilities(selectedCapabilities);

  return {
    config,
    resolvedIds: Array.from(selectedIds),
    orderedCapabilities,
    supportTier,
  };
}
