import { describe, expect, it } from 'vitest';
import { getVueViteOperations } from '../../../src/engine/composer/layers/vue-vite.js';

describe('Vue 3 + Vite Layer', () => {
  it('generates Vue 3 + Vite 6 SPA frontend files', () => {
    const ops = getVueViteOperations();

    const pkg = ops.find((o) => o.path === 'apps/frontend/package.json') as any;
    expect(pkg).toBeDefined();
    const pkgJson = JSON.parse(pkg.content);
    expect(pkgJson.name).toBe('@project/frontend');
    expect(pkgJson.version).toBe('1.0.0');
    expect(pkgJson.private).toBe(true);
    expect(pkgJson.type).toBe('module');
    expect(pkgJson.dependencies.vue).toBe('^3.5.13');
    expect(pkgJson.dependencies['@project/api-client']).toBe('workspace:*');
    expect(pkgJson.devDependencies['@vitejs/plugin-vue']).toBe('^5.2.1');
    expect(pkgJson.devDependencies['vite']).toBe('^6.1.0');
    expect(pkgJson.devDependencies['typescript']).toBe('^7.0.2');
    expect(pkgJson.scripts.dev).toBe('vite');
    expect(pkgJson.scripts.build).toBe('vite build');
    expect(pkgJson.scripts.preview).toBe('vite preview');

    const viteConfig = ops.find((o) => o.path === 'apps/frontend/vite.config.ts') as any;
    expect(viteConfig).toBeDefined();
    expect(viteConfig.content).toContain('@vitejs/plugin-vue');
    expect(viteConfig.content).toContain('port: 3000');

    const appVue = ops.find((o) => o.path === 'apps/frontend/src/App.vue') as any;
    expect(appVue).toBeDefined();
    expect(appVue.content).toContain('@project/api-client');
    expect(appVue.content).toContain('ApiClient');
    expect(appVue.content).toContain('Product Catalog');
    expect(appVue.content).toContain('p.name');
    expect(appVue.content).toContain('p.price');
    expect(appVue.content).toContain('p.description');

    const mainTs = ops.find((o) => o.path === 'apps/frontend/src/main.ts') as any;
    expect(mainTs).toBeDefined();
    expect(mainTs.content).toContain('createApp');
    expect(mainTs.content).toContain('#app');

    const indexHtml = ops.find((o) => o.path === 'apps/frontend/index.html') as any;
    expect(indexHtml).toBeDefined();
    expect(indexHtml.content).toContain('<div id="app"></div>');
    expect(indexHtml.content).toContain('<script type="module" src="/src/main.ts"></script>');
  });
});
