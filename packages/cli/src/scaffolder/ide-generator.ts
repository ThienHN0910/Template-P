import fsp from 'node:fs/promises';
import path from 'node:path';
import { ProjectConfig } from '../types.js';

export async function generateIdeConfigs(config: ProjectConfig): Promise<void> {
  const { targetDir, ide, backend, frontend, database } = config;

  if (!ide || ide.includes('none') || ide.length === 0) {
    return;
  }

  if (ide.includes('vscode')) {
    const vscodeDir = path.join(targetDir, '.vscode');
    await fsp.mkdir(vscodeDir, { recursive: true });

    // 1. Extensions Recommendations
    const recommendations: string[] = [
      'editorconfig.editorconfig',
      'dbaeumer.vscode-eslint',
      'esbenp.prettier-vscode',
    ];

    if (backend.type === 'dotnet') {
      recommendations.push('ms-dotnettools.csdevkit', 'ms-dotnettools.csharp');
    } else if (backend.type === 'fastapi') {
      recommendations.push('ms-python.python', 'ms-python.vscode-pylance');
    }

    if (frontend.type === 'vue3' || frontend.type === 'nuxt3') {
      recommendations.push('Vue.volar');
    }

    if (frontend.features?.styling === 'tailwind') {
      recommendations.push('bradlc.vscode-tailwindcss');
    }

    if (database === 'postgres') {
      recommendations.push('ckolkman.vscode-postgres');
    } else if (database === 'sqlite') {
      recommendations.push('qwtel.sqlite-viewer');
    }

    const extensionsJson = {
      recommendations,
    };

    await fsp.writeFile(
      path.join(vscodeDir, 'extensions.json'),
      JSON.stringify(extensionsJson, null, 2),
      'utf-8'
    );

    // 2. Settings
    const settingsJson: Record<string, any> = {
      'editor.formatOnSave': true,
      'editor.defaultFormatter': 'esbenp.prettier-vscode',
      'files.trimTrailingWhitespace': true,
    };

    if (backend.type === 'dotnet') {
      settingsJson['dotnet.defaultSolution'] = 'apps/backend/Backend.sln';
    }

    if (frontend.type === 'vue3') {
      settingsJson['[vue]'] = {
        'editor.defaultFormatter': 'esbenp.prettier-vscode',
      };
    }

    await fsp.writeFile(
      path.join(vscodeDir, 'settings.json'),
      JSON.stringify(settingsJson, null, 2),
      'utf-8'
    );
  }
}
