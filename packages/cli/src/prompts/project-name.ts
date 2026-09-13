import * as p from '@clack/prompts';
import pc from 'picocolors';

export async function promptProjectName(defaultName: string = 'my-p-app'): Promise<string> {
  const name = await p.text({
    message: 'What is your project name?',
    placeholder: defaultName,
    defaultValue: defaultName,
    validate: (value) => {
      if (!value) return;
      const trimmed = value.trim();
      if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        return 'Project name can only contain letters, numbers, hyphens (-) and underscores (_)';
      }
    },
  });

  if (p.isCancel(name)) {
    p.cancel(pc.yellow('Operation cancelled.'));
    process.exit(0);
  }

  return (name as string).trim() || defaultName;
}
