import { execa } from 'execa';
import { BackendType } from '../types.js';

export interface ToolCheckResult {
  tool: string;
  installed: boolean;
  version?: string;
  requiredFor: string;
  downloadUrl: string;
  installerCommand: {
    win32: string;
    darwin: string;
    linux: string;
  };
}

export async function checkCommand(cmd: string, args: string[] = ['--version']): Promise<{ installed: boolean; version?: string }> {
  try {
    const { stdout } = await execa(cmd, args, { timeout: 4000 });
    const version = stdout.trim().split('\n')[0];
    return { installed: true, version };
  } catch {
    return { installed: false };
  }
}

export async function inspectEnvironment(backend: BackendType): Promise<ToolCheckResult[]> {
  const results: ToolCheckResult[] = [];

  // Node is always required for the CLI and frontend
  const nodeCheck = await checkCommand('node', ['-v']);
  if (!nodeCheck.installed) {
    results.push({
      tool: 'node',
      installed: false,
      requiredFor: 'CLI orchestrator and Frontend builds',
      downloadUrl: 'https://nodejs.org/en/download/',
      installerCommand: {
        win32: 'winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements',
        darwin: 'brew install node',
        linux: 'sudo apt update && sudo apt install -y nodejs npm',
      },
    });
  }

  if (backend === 'dotnet') {
    const dotnetCheck = await checkCommand('dotnet', ['--version']);
    results.push({
      tool: 'dotnet',
      installed: dotnetCheck.installed,
      version: dotnetCheck.version,
      requiredFor: '.NET 8 C# Backend compilation & running',
      downloadUrl: 'https://dotnet.microsoft.com/en-us/download/dotnet/8.0',
      installerCommand: {
        win32: 'winget install Microsoft.DotNet.SDK.8 --accept-package-agreements --accept-source-agreements',
        darwin: 'brew install dotnet-sdk',
        linux: 'sudo apt update && sudo apt install -y dotnet-sdk-8.0',
      },
    });
  } else if (backend === 'fastapi') {
    let pythonCheck = await checkCommand('python', ['--version']);
    if (!pythonCheck.installed) {
      pythonCheck = await checkCommand('python3', ['--version']);
    }
    results.push({
      tool: 'python',
      installed: pythonCheck.installed,
      version: pythonCheck.version,
      requiredFor: 'FastAPI Python Backend execution & dependencies',
      downloadUrl: 'https://www.python.org/downloads/',
      installerCommand: {
        win32: 'winget install Python.Python.3.11 --accept-package-agreements --accept-source-agreements',
        darwin: 'brew install python@3.11',
        linux: 'sudo apt update && sudo apt install -y python3 python3-pip python3-venv',
      },
    });
  }

  return results;
}
