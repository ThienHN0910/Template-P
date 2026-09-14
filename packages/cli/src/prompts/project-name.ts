import * as p from '@clack/prompts';
import pc from 'picocolors';
import { validateProjectName } from '../project-target.js';

export async function promptProjectName(defaultName: string = 'my-p-app'): Promise<string> {
  const name = await p.text({
    message: 'What is your project name?',
    placeholder: defaultName,
    defaultValue: defaultName,
    validate: (value) => {
      return validateProjectName(value.trim());
    },
  });

  if (p.isCancel(name)) {
    p.cancel(pc.yellow('Operation cancelled.'));
    process.exit(0);
  }

  return (name as string).trim() || defaultName;
}
