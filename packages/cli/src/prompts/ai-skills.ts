import * as p from '@clack/prompts';
import pc from 'picocolors';
import { AiSkillsChoice } from '../types.js';

export async function promptAiSkills(): Promise<AiSkillsChoice> {
  const selectedSkills = await p.multiselect({
    message: 'Select AI Agent Skills & Tooling (Press <Space> to toggle, <Enter> to confirm):',
    options: [
      {
        value: 'mattpocock/skills',
        label: 'mattpocock/skills (Official Suite)',
        hint: '37+ skills: to-tickets, grill-me, tdd, triage, wayfinder, domain-modeling...',
      },
      {
        value: 'taste',
        label: 'Frontend Taste Skills (Taste Suite)',
        hint: '10 skills: design-taste-frontend, minimalist-ui, 60fps animations...',
      },
      {
        value: 'ponytail',
        label: 'Ponytail Engine (Code Simplification)',
        hint: '5 skills: strict anti-over-engineering rules & code auditor',
      },
      {
        value: 'vercel-labs/agent-skills',
        label: 'vercel-labs/agent-skills (Web Optimization)',
        hint: 'Vercel official agent skills for performance & React architecture',
      },
      {
        value: 'custom',
        label: 'Add Custom Skill Package',
        hint: 'Install any GitHub repository via npx skills add <owner/repo>',
      },
      {
        value: 'mcp',
        label: 'MCP Servers Configuration',
        hint: 'Pre-configured mcp.json (Chrome DevTools, Filesystem, Database)',
      },
    ],
    initialValues: ['mattpocock/skills', 'taste', 'ponytail', 'mcp'],
    required: false,
  });

  if (p.isCancel(selectedSkills)) {
    p.cancel(pc.yellow('Operation cancelled.'));
    process.exit(0);
  }

  const list = selectedSkills as string[];
  const packages: string[] = [];

  for (const item of list) {
    if (item === 'mcp') continue;
    if (item === 'custom') {
      const customRepo = await p.text({
        message: 'Enter custom skill repository (GitHub owner/repo):',
        placeholder: 'e.g. vercel-labs/agent-skills or anthropics/skills',
        validate: (val) => {
          if (!val || !val.includes('/')) return 'Please enter a valid format: owner/repo';
        },
      });
      if (!p.isCancel(customRepo) && customRepo) {
        packages.push((customRepo as string).trim());
      }
    } else {
      packages.push(item);
    }
  }

  return {
    packages,
    mcp: list.includes('mcp'),
  };
}
