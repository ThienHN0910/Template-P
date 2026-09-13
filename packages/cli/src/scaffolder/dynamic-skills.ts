import fsp from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { execa } from 'execa';
import { ProjectConfig } from '../types.js';

export async function installDynamicSkills(config: ProjectConfig, templatesDir: string): Promise<void> {
  const { targetDir, ai } = config;
  const geminiSkillsDir = path.join(targetDir, '.gemini', 'skills');
  const claudeSkillsDir = path.join(targetDir, '.claude', 'skills');
  await fsp.mkdir(geminiSkillsDir, { recursive: true });
  await fsp.mkdir(claudeSkillsDir, { recursive: true });

  const packages = Array.isArray(ai?.packages) ? ai.packages : [];
  for (const pkg of packages) {
    if (pkg.includes('/')) {
      // It's a GitHub repo package like mattpocock/skills or vercel-labs/agent-skills
      let onlineSuccess = false;
      try {
        await execa('npx', ['skills@latest', 'add', pkg, '--agent', '*', '--all', '--copy', '-y'], {
          cwd: targetDir,
          timeout: 25000,
          stdio: 'pipe',
        });
        onlineSuccess = true;

        // Mirror skills from .claude/skills to .gemini/skills if needed
        if (fs.existsSync(claudeSkillsDir)) {
          const skills = await fsp.readdir(claudeSkillsDir);
          for (const s of skills) {
            const src = path.join(claudeSkillsDir, s);
            const dst = path.join(geminiSkillsDir, s);
            if (!fs.existsSync(dst)) {
              await fsp.cp(src, dst, { recursive: true });
            }
          }
        }
      } catch {
        onlineSuccess = false;
      }

      // Offline Fallback / Ensure all 37 Pocock skills are present
      if ((!onlineSuccess || pkg === 'mattpocock/skills') && pkg === 'mattpocock/skills') {
        const fallbackSource = path.join(templatesDir, 'skills', 'pocock');
        if (fs.existsSync(fallbackSource)) {
          const items = await fsp.readdir(fallbackSource);
          for (const item of items) {
            const src = path.join(fallbackSource, item);
            const dstGemini = path.join(geminiSkillsDir, item);
            const dstClaude = path.join(claudeSkillsDir, item);
            if (!fs.existsSync(dstGemini)) {
              await fsp.cp(src, dstGemini, { recursive: true });
            }
            if (!fs.existsSync(dstClaude)) {
              await fsp.cp(src, dstClaude, { recursive: true });
            }
          }
        }
      }
    } else if (pkg === 'taste') {
      const tasteSource = path.join(templatesDir, 'skills', 'taste');
      if (fs.existsSync(tasteSource)) {
        await fsp.cp(tasteSource, geminiSkillsDir, { recursive: true });
        await fsp.cp(tasteSource, claudeSkillsDir, { recursive: true });
      }
    } else if (pkg === 'ponytail') {
      const ptSource = path.join(templatesDir, 'skills', 'ponytail');
      if (fs.existsSync(ptSource)) {
        await fsp.cp(ptSource, geminiSkillsDir, { recursive: true });
        await fsp.cp(ptSource, claudeSkillsDir, { recursive: true });
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
      await fsp.writeFile(path.join(targetDir, '.gemini', 'mcp.json'), mcpContent, 'utf-8');
      await fsp.writeFile(path.join(targetDir, 'mcp.json'), mcpContent, 'utf-8');
    }
  }
}
