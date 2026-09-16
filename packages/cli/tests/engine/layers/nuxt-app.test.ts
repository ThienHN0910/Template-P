import { describe, expect, it } from 'vitest';
import { getNuxtAppOperations } from '../../../src/engine/composer/layers/nuxt-app.js';

describe('Nuxt 3 Frontend Layer', () => {
  it('generates Nuxt 3 frontend files', () => {
    const ops = getNuxtAppOperations();

    const pkg = ops.find((o) => o.path === 'apps/frontend/package.json') as any;
    expect(pkg).toBeDefined();
    expect(pkg.kind).toBe('createFile');
    const pkgJson = JSON.parse(pkg.content);
    expect(pkgJson.name).toBe('@project/frontend');
    expect(pkgJson.version).toBe('1.0.0');
    expect(pkgJson.private).toBe(true);
    expect(pkgJson.type).toBe('module');
    expect(pkgJson.dependencies.nuxt).toBe('^3.15.4');
    expect(pkgJson.dependencies.vue).toBe('^3.5.13');
    expect(pkgJson.dependencies['@project/api-client']).toBe('workspace:*');
    expect(pkgJson.devDependencies['typescript']).toBe('^7.0.2');
    expect(pkgJson.scripts.dev).toBe('nuxt dev');
    expect(pkgJson.scripts.build).toBe('nuxt build');
    expect(pkgJson.scripts.generate).toBe('nuxt generate');
    expect(pkgJson.scripts.preview).toBe('nuxt preview');

    const nuxtConfig = ops.find((o) => o.path === 'apps/frontend/nuxt.config.ts') as any;
    expect(nuxtConfig).toBeDefined();
    expect(nuxtConfig.kind).toBe('createFile');
    expect(nuxtConfig.content).toContain('defineNuxtConfig');
    expect(nuxtConfig.content).toContain("compatibilityDate: '2024-11-01'");
    expect(nuxtConfig.content).toContain('devtools: { enabled: false }');
    expect(nuxtConfig.content).toContain("import { defineNuxtConfig } from 'nuxt/config';");

    const appVue = ops.find((o) => o.path === 'apps/frontend/app.vue') as any;
    expect(appVue).toBeDefined();
    expect(appVue.kind).toBe('createFile');
    expect(appVue.content).toContain('<script setup lang="ts">');
    expect(appVue.content).toContain('@project/api-client');
    expect(appVue.content).toContain('ApiClient');
    expect(appVue.content).toContain('Product');
    expect(appVue.content).toContain('Product Catalog');
    expect(appVue.content).toContain('p.name');
    expect(appVue.content).toContain('p.price');
    expect(appVue.content).toContain('p.description');
  });
});
