import type { VirtualFileSystem } from './virtual-fs.js';

export type FileOperation =
  | { kind: 'createFile'; path: string; content: string }
  | { kind: 'mergeJson'; path: string; data: Record<string, any> };

export function applyOperations(vfs: VirtualFileSystem, operations: FileOperation[]): void {
  for (const op of operations) {
    if (op.kind === 'createFile') {
      vfs.writeFile(op.path, op.content);
    } else if (op.kind === 'mergeJson') {
      let existing: Record<string, any> = {};
      if (vfs.exists(op.path)) {
        try {
          existing = JSON.parse(vfs.readText(op.path));
        } catch {
          existing = {};
        }
      }

      const merged = deepMerge(existing, op.data);
      vfs.writeFile(op.path, JSON.stringify(merged, null, 2) + '\n');
    }
  }
}

function deepMerge(target: any, source: any): any {
  if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
    return source;
  }
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (key in target && typeof target[key] === 'object' && typeof source[key] === 'object') {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}
