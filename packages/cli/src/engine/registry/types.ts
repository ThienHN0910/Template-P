export type CapabilityKind =
  | 'runtime'
  | 'framework'
  | 'architecture'
  | 'database'
  | 'data-access'
  | 'frontend'
  | 'feature';

export type SupportTier = 'verified' | 'experimental' | 'deprecated';

export interface CapabilityConstraint {
  target: string;
  kind?: CapabilityKind;
  reason?: string;
}

export interface RuntimeRequirement {
  name: 'dotnet' | 'node' | 'python';
  minVersion: string;
}

export interface HostRequirement {
  os?: ('win32' | 'darwin' | 'linux')[];
  arch?: ('x64' | 'arm64')[];
}

export interface CapabilityDependency {
  id: string;
  optional?: boolean;
}

export interface CapabilityDefinition {
  id: string;
  version: string;
  kind: CapabilityKind;
  support: SupportTier;
  provides: string[];
  requires: CapabilityConstraint[];
  conflicts: CapabilityConstraint[];
  runtimeRequirements: RuntimeRequirement[];
  hostRequirements?: HostRequirement[];
  dependencies: CapabilityDependency[];
}
