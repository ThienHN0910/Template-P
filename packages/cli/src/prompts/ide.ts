import * as p from '@clack/prompts';
import pc from 'picocolors';
import { IdeChoice } from '../types.js';

export async function promptIde(): Promise<IdeChoice[]> {
  const selected = await p.multiselect({
    message: 'Select Editor / IDE configurations to generate (Press <Space> to toggle, <Enter> to confirm):',
    options: [
      {
        value: 'vscode',
        label: 'Visual Studio Code / Cursor',
        hint: 'Generates .vscode/extensions.json & settings.json tailored to your stack',
      },
      {
        value: 'visualstudio',
        label: 'Visual Studio',
        hint: 'Solution-level build & launch configs (.sln/.vs)',
      },
      {
        value: 'rider',
        label: 'JetBrains Rider / WebStorm',
        hint: 'Shared inspection profiles and IDE code style',
      },
      {
        value: 'none',
        label: 'Minimal / Clean',
        hint: 'Do not generate any IDE-specific files',
      },
    ],
    initialValues: ['vscode'],
    required: false,
  });

  if (p.isCancel(selected)) {
    p.cancel(pc.yellow('Operation cancelled.'));
    process.exit(0);
  }

  const list = selected as IdeChoice[];
  if (list.includes('none') && list.length > 1) {
    return list.filter((item) => item !== 'none');
  }
  return list.length === 0 ? ['none'] : list;
}
