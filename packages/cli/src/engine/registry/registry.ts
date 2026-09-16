import type { CapabilityDefinition } from './types.js';
import { CORE_CAPABILITIES } from './definitions.js';

export class CapabilityRegistry {
  private capabilities = new Map<string, CapabilityDefinition>();

  register(cap: CapabilityDefinition): void {
    if (this.capabilities.has(cap.id)) {
      throw new Error(`Capability "${cap.id}" is already registered.`);
    }
    this.capabilities.set(cap.id, cap);
  }

  get(id: string): CapabilityDefinition | undefined {
    return this.capabilities.get(id);
  }

  list(): CapabilityDefinition[] {
    return Array.from(this.capabilities.values());
  }

  findByProvided(contract: string): CapabilityDefinition[] {
    return this.list().filter((c) => c.provides.includes(contract));
  }
}

export function getBuiltinRegistry(): CapabilityRegistry {
  const registry = new CapabilityRegistry();
  for (const cap of CORE_CAPABILITIES) {
    registry.register(cap);
  }
  return registry;
}
