import * as p from '@clack/prompts';
import pc from 'picocolors';
import { AiSkillsChoice } from '../types.js';

export async function promptAiSkills(): Promise<AiSkillsChoice> {
  const selectedSkills = await p.multiselect({
    message: 'Select AI Agent Skills & Tooling to bundle (Press <Space> to toggle, <Enter> to confirm):',
    options: [
      {
        value: 'pocock',
        label: "Matt Pocock's Engineering Skills",
        hint: 'to-tickets, to-spec, grill-me, domain-modeling, triage',
      },
      {
        value: 'taste',
        label: 'Frontend Taste Skills',
        hint: 'design-taste-frontend, minimalist-ui, 60fps animations',
      },
      {
        value: 'ponytail',
        label: 'Ponytail Engine',
        hint: 'Strict anti-over-engineering rules & code reviewer',
      },
      {
        value: 'mcp',
        label: 'MCP Servers Configuration',
        hint: 'Pre-configured mcp.json (Chrome DevTools, Filesystem, Database)',
      },
    ],
    initialValues: ['pocock', 'taste', 'ponytail', 'mcp'],
    required: false,
  });

  if (p.isCancel(selectedSkills)) {
    p.cancel(pc.yellow('Operation cancelled.'));
    process.exit(0);
  }

  const list = selectedSkills as string[];

  return {
    pocock: list.includes('pocock'),
    taste: list.includes('taste'),
    ponytail: list.includes('ponytail'),
    mcp: list.includes('mcp'),
  };
}
