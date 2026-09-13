import * as p from '@clack/prompts';
import pc from 'picocolors';
import { BackendType } from '../types.js';

export interface BackendResult {
  type: BackendType;
  architecture: string;
  version: string;
}

export async function promptBackend(): Promise<BackendResult> {
  const backendType = await p.select({
    message: 'Select your Backend Framework:',
    options: [
      { value: 'dotnet', label: '.NET 8 (C#)', hint: 'Enterprise grade, ultra-fast LTS runtime' },
      { value: 'node', label: 'Node.js (TypeScript)', hint: 'Express / Fastify with strict typing' },
      { value: 'fastapi', label: 'FastAPI (Python)', hint: 'Modern, high-performance async Python API' },
    ],
    initialValue: 'dotnet',
  });

  if (p.isCancel(backendType)) {
    p.cancel(pc.yellow('Operation cancelled.'));
    process.exit(0);
  }

  let architecture = 'clean-ddd';
  let version = '8.0';

  if (backendType === 'dotnet') {
    const arch = await p.select({
      message: 'Select .NET 8 Architecture & Project Type:',
      options: [
        {
          value: 'webapi-ddd',
          label: 'Clean Architecture / DDD (Domain-Driven Design)',
          hint: 'Domain, Application, Infrastructure, API (Recommended)',
        },
        {
          value: 'webapi-mvc',
          label: 'Web API (Classic MVC pattern)',
          hint: 'Controllers, Services, Models, Data',
        },
        {
          value: 'blank',
          label: 'Minimal Blank API',
          hint: 'Single Program.cs minimal skeleton',
        },
      ],
      initialValue: 'webapi-ddd',
    });

    if (p.isCancel(arch)) {
      p.cancel(pc.yellow('Operation cancelled.'));
      process.exit(0);
    }
    architecture = arch as string;
  } else if (backendType === 'node') {
    const arch = await p.select({
      message: 'Select Node.js Framework & Architecture:',
      options: [
        {
          value: 'express-ddd',
          label: 'Express + Clean Architecture / DDD',
          hint: 'Domain, Application, Infrastructure, Presentation',
        },
        {
          value: 'fastify-clean',
          label: 'Fastify + Modular Clean Architecture',
          hint: 'High-throughput plugins, schemas, services',
        },
        {
          value: 'blank',
          label: 'Blank TypeScript Server',
          hint: 'Minimal modern TS server',
        },
      ],
      initialValue: 'express-ddd',
    });

    if (p.isCancel(arch)) {
      p.cancel(pc.yellow('Operation cancelled.'));
      process.exit(0);
    }
    architecture = arch as string;
    version = '20+';
  } else if (backendType === 'fastapi') {
    const arch = await p.select({
      message: 'Select FastAPI Project Architecture:',
      options: [
        {
          value: 'modular',
          label: 'Modular Architecture (Clean/DDD style)',
          hint: 'Routers, Schemas, Services, Core config (Recommended)',
        },
        {
          value: 'blank',
          label: 'Flat Blank FastAPI',
          hint: 'Minimal main.py application',
        },
      ],
      initialValue: 'modular',
    });

    if (p.isCancel(arch)) {
      p.cancel(pc.yellow('Operation cancelled.'));
      process.exit(0);
    }
    architecture = arch as string;
    version = '3.11+';
  }

  return {
    type: backendType as BackendType,
    architecture,
    version,
  };
}
