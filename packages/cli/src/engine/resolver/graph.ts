import type { CapabilityDefinition } from '../registry/types.js';

export function topologicalSortCapabilities(capabilities: CapabilityDefinition[]): CapabilityDefinition[] {
  const capMap = new Map<string, CapabilityDefinition>();
  for (const c of capabilities) capMap.set(c.id, c);

  const visited = new Set<string>();
  const visiting = new Set<string>();
  const result: CapabilityDefinition[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      throw new Error(`Circular dependency detected involving capability "${id}".`);
    }

    visiting.add(id);
    const cap = capMap.get(id);
    if (cap) {
      for (const dep of cap.dependencies) {
        if (capMap.has(dep.id)) {
          visit(dep.id);
        }
      }
    }
    visiting.delete(id);
    visited.add(id);
    if (cap) result.push(cap);
  }

  for (const cap of capabilities) {
    if (!visited.has(cap.id)) {
      visit(cap.id);
    }
  }

  return result;
}
