import { describe, expect, it } from 'vitest';
import { getNextAppOperations } from '../../../src/engine/composer/layers/next-app.js';

describe('Next.js 15 App Router Layer', () => {
  it('generates Next.js 15 hybrid frontend files', () => {
    const ops = getNextAppOperations();

    const pkg = ops.find((o) => o.path === 'apps/frontend/package.json') as any;
    expect(pkg).toBeDefined();
    const pkgJson = JSON.parse(pkg.content);
    expect(pkgJson.name).toBe('@project/frontend');
    expect(pkgJson.version).toBe('1.0.0');
    expect(pkgJson.private).toBe(true);
    expect(pkgJson.type).toBe('module');
    expect(pkgJson.dependencies.next).toBe('^15.1.7');
    expect(pkgJson.dependencies.react).toBe('^19.0.0');
    expect(pkgJson.dependencies['react-dom']).toBe('^19.0.0');
    expect(pkgJson.dependencies['@project/api-client']).toBe('workspace:*');
    expect(pkgJson.devDependencies['@types/node']).toBe('^22.13.1');
    expect(pkgJson.devDependencies['@types/react']).toBe('^19.0.8');
    expect(pkgJson.devDependencies['@types/react-dom']).toBe('^19.0.3');
    expect(pkgJson.devDependencies['typescript']).toBe('^7.0.2');
    expect(pkgJson.scripts.dev).toBe('next dev');
    expect(pkgJson.scripts.build).toBe('next build');
    expect(pkgJson.scripts.start).toBe('next start');

    const nextConfig = ops.find((o) => o.path === 'apps/frontend/next.config.mjs') as any;
    expect(nextConfig).toBeDefined();
    expect(nextConfig.content).toContain('const nextConfig = {};');
    expect(nextConfig.content).toContain('export default nextConfig;');

    const layout = ops.find((o) => o.path === 'apps/frontend/app/layout.tsx') as any;
    expect(layout).toBeDefined();
    expect(layout.content).toContain('RootLayout');
    expect(layout.content).toContain('children: React.ReactNode');
    expect(layout.content).toContain('<body>{children}</body>');

    const page = ops.find((o) => o.path === 'apps/frontend/app/page.tsx') as any;
    expect(page).toBeDefined();
    expect(page.content).toContain("'use client';");
    expect(page.content).toContain('@project/api-client');
    expect(page.content).toContain('ApiClient');
    expect(page.content).toContain('Product');
    expect(page.content).toContain('Product Catalog');
    expect(page.content).toContain('p.name');
    expect(page.content).toContain('p.price');
    expect(page.content).toContain('p.description');
  });
});
