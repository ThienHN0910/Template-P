import fsp from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { execa } from 'execa';
import { ProjectConfig } from '../types.js';

export async function installDynamicSkills(config: ProjectConfig, templatesDir: string): Promise<void> {
  const { targetDir, ai } = config;
  const agents = Array.isArray(ai?.agents) && ai.agents.length > 0 ? ai.agents : ['gemini', 'claude', 'cursor'];
  const isAll = agents.includes('all');

  // Determine which target directories to create
  const agentDirs: string[] = [];
  if (isAll || agents.includes('gemini')) agentDirs.push(path.join(targetDir, '.gemini', 'skills'));
  if (isAll || agents.includes('claude')) agentDirs.push(path.join(targetDir, '.claude', 'skills'));
  if (isAll || agents.includes('cursor')) agentDirs.push(path.join(targetDir, '.cursor', 'skills'));
  if (isAll || agents.includes('windsurf')) agentDirs.push(path.join(targetDir, '.windsurf', 'skills'));
  if (isAll || agents.includes('roo')) agentDirs.push(path.join(targetDir, '.roo', 'skills'));

  for (const d of agentDirs) {
    await fsp.mkdir(d, { recursive: true });
  }

  const packages = Array.isArray(ai?.packages) ? ai.packages : [];
  const agentParam = isAll ? '*' : agents.join(',');

  for (const pkg of packages) {
    if (pkg.includes('/')) {
      // GitHub repo package (e.g. mattpocock/skills)
      let onlineSuccess = false;
      try {
        await execa('npx', ['skills@latest', 'add', pkg, '--agent', agentParam, '--all', '--copy', '-y'], {
          cwd: targetDir,
          timeout: 25000,
          stdio: 'pipe',
        });
        onlineSuccess = true;
      } catch {
        onlineSuccess = false;
      }

      // Offline Fallback / Ensure all Pocock skills are present in selected agent dirs
      if ((!onlineSuccess || pkg === 'mattpocock/skills') && pkg === 'mattpocock/skills') {
        const fallbackSource = path.join(templatesDir, 'skills', 'pocock');
        if (fs.existsSync(fallbackSource)) {
          const items = await fsp.readdir(fallbackSource);
          for (const item of items) {
            const src = path.join(fallbackSource, item);
            for (const d of agentDirs) {
              const dst = path.join(d, item);
              if (!fs.existsSync(dst)) {
                await fsp.cp(src, dst, { recursive: true });
              }
            }
          }
        }
      }
    } else if (pkg === 'taste') {
      const tasteSource = path.join(templatesDir, 'skills', 'taste');
      if (fs.existsSync(tasteSource)) {
        for (const d of agentDirs) {
          await fsp.cp(tasteSource, d, { recursive: true });
        }
      }
    } else if (pkg === 'ponytail') {
      const ptSource = path.join(templatesDir, 'skills', 'ponytail');
      if (fs.existsSync(ptSource)) {
        for (const d of agentDirs) {
          await fsp.cp(ptSource, d, { recursive: true });
        }
      }
    }
  }

  // Clean up any unrequested agent dot-directories if --agent wasn't 'all'
  if (!isAll) {
    const rogueAgents = [
      '.adal', '.aider-desk', '.augment', '.autohand', '.bob', '.codeartsdoer',
      '.codebuddy', '.codemaker', '.codestudio', '.commandcode', '.continue',
      '.cortex', '.crush', '.devin', '.forge', '.fx', '.goose', '.grok',
      '.hermes', '.iflow', '.inferencesh', '.jazz', '.junie', '.kimchi',
      '.kiro', '.kode', '.lingma', '.mcpjam', '.minimax', '.moxby', '.mux',
      '.neovate', '.ona', '.openhands', '.pi', '.pochi', '.posit', '.qoder',
      '.qwen', '.reasonix', '.rovodev', '.tabnine', '.terramind', '.tinycloud',
      '.trae', '.vibe', '.zcode', '.zencoder', 'agent'
    ];

    for (const rogue of rogueAgents) {
      const roguePath = path.join(targetDir, rogue);
      if (fs.existsSync(roguePath)) {
        await fsp.rm(roguePath, { recursive: true, force: true }).catch(() => {});
      }
    }
  }

  // MCP Configuration
  if (ai.mcp) {
    const dbName = `${config.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_db`;
    const mcpSource = path.join(templatesDir, 'mcp', 'mcp.json');
    if (fs.existsSync(mcpSource)) {
      let mcpContent = await fsp.readFile(mcpSource, 'utf-8');
      mcpContent = mcpContent.replaceAll('__DB_NAME__', dbName);
      await fsp.writeFile(path.join(targetDir, 'mcp.json'), mcpContent, 'utf-8');
      if (agents.includes('gemini') || isAll) {
        await fsp.mkdir(path.join(targetDir, '.gemini'), { recursive: true });
        await fsp.writeFile(path.join(targetDir, '.gemini', 'mcp.json'), mcpContent, 'utf-8');
      }
    }
  }
}
