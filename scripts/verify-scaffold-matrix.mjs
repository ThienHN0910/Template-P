import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageDirectory = path.join(repositoryRoot, 'packages', 'cli');
const backend = process.env.MATRIX_BACKEND;
const architecture = process.env.MATRIX_ARCHITECTURE;
const packageManager = process.env.MATRIX_PACKAGE_MANAGER;

if (!backend || !architecture || !packageManager) {
  throw new Error('MATRIX_BACKEND, MATRIX_ARCHITECTURE, and MATRIX_PACKAGE_MANAGER are required.');
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const processHandle = spawn(command, args, { shell: process.platform === 'win32', stdio: 'inherit', ...options });
    processHandle.on('error', reject);
    processHandle.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}.`));
      }
    });
  });
}

function runAndCapture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const processHandle = spawn(command, args, {
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'inherit'],
      ...options,
    });
    let output = '';
    processHandle.stdout.on('data', (chunk) => {
      output += chunk;
    });
    processHandle.on('error', reject);
    processHandle.on('exit', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}.`));
      }
    });
  });
}

async function waitForHealthyServer(url) {
  const deadline = Date.now() + 20_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
      lastError = new Error(`Health endpoint returned ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw lastError ?? new Error(`Timed out waiting for ${url}.`);
}

function start(command, args, cwd) {
  const processHandle = spawn(command, args, { cwd, stdio: 'inherit' });
  return processHandle;
}

function stop(processHandle) {
  return new Promise((resolve, reject) => {
    if (processHandle.exitCode !== null) {
      resolve();
      return;
    }

    processHandle.once('error', reject);
    processHandle.once('exit', () => resolve());
    processHandle.kill();
  });
}

async function verifyHealth(projectDirectory) {
  let server;

  try {
    if (backend === 'node') {
      server = start(process.execPath, ['apps/backend/src/server.js'], projectDirectory);
      await waitForHealthyServer('http://127.0.0.1:4000/api/health');
    } else if (backend === 'dotnet') {
      server = start(
        'dotnet',
        ['run', '--project', 'apps/backend/BlankApi.csproj', '--urls', 'http://127.0.0.1:5050'],
        projectDirectory
      );
      await waitForHealthyServer('http://127.0.0.1:5050/api/health');
    } else {
      await run('python', ['-m', 'pip', 'install', '-r', 'requirements.txt'], {
        cwd: path.join(projectDirectory, 'apps', 'backend'),
      });
      server = start('python', ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'], path.join(projectDirectory, 'apps', 'backend'));
      await waitForHealthyServer('http://127.0.0.1:8000/api/health');
    }
  } finally {
    if (server) {
      await stop(server);
    }
  }
}

async function verifyMatrixEntry() {
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'template-p-matrix-'));
  let packedArtifact;

  try {
    const packageResult = JSON.parse(await runAndCapture('npm', ['pack', '--json'], { cwd: packageDirectory }));
    packedArtifact = path.join(packageDirectory, packageResult[0].filename);
    const harnessDirectory = path.join(temporaryDirectory, 'harness');

    await mkdir(harnessDirectory, { recursive: true });
    await run('npm', ['install', '--no-save', packedArtifact], { cwd: harnessDirectory });

    const cliPath = path.join(
      harnessDirectory,
      'node_modules',
      '@thienhn',
      'create-template',
      'bin',
      'create-template.js'
    );
    const projectName = `matrix-${backend}-${packageManager}`;
    await run(
      process.execPath,
      [
        cliPath,
        projectName,
        '--backend',
        backend,
        '--arch',
        architecture,
        '--frontend',
        'react',
        '--db',
        'none',
        '--pm',
        packageManager,
        '--yes',
        '--offline',
        '--no-ai',
      ],
      { cwd: harnessDirectory }
    );

    const projectDirectory = path.join(harnessDirectory, projectName);
    const manifest = JSON.parse(await readFile(path.join(projectDirectory, 'package.json'), 'utf-8'));
    if (!Array.isArray(manifest.workspaces) || !manifest.workspaces.includes('apps/*')) {
      throw new Error('Scaffolded Project did not declare the expected apps workspace.');
    }

    await run(packageManager, ['install'], { cwd: projectDirectory });
    await run(packageManager, ['run', 'build'], { cwd: projectDirectory });
    await verifyHealth(projectDirectory);
  } finally {
    if (packedArtifact) {
      await rm(packedArtifact, { force: true });
    }
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

await verifyMatrixEntry();
