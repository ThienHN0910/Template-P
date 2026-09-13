import * as p from '@clack/prompts';
import pc from 'picocolors';
import { PackageManager } from '../types.js';

export async function promptPackageManager(): Promise<PackageManager> {
  const pm = await p.select({
    message: 'Select package manager for frontend & monorepo orchestration:',
    options: [
      { value: 'pnpm', label: 'pnpm', hint: 'recommended: fast, disk-efficient workspace management' },
      { value: 'npm', label: 'npm', hint: 'standard Node.js package manager' },
      { value: 'bun', label: 'bun', hint: 'blazing fast all-in-one JavaScript runtime & package manager' },
    ],
    initialValue: 'pnpm',
  });

  if (p.isCancel(pm)) {
    p.cancel(pc.yellow('Operation cancelled.'));
    process.exit(0);
  }

  return pm as PackageManager;
}
