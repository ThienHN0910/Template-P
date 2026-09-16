import { describe, expect, it } from 'vitest';
import { getReactViteOperations } from '../../../src/engine/composer/layers/react-vite.js';

describe('React Vite Layer', () => {
  it('generates apps/frontend with React 19, Vite, and Product catalog component', () => {
    const ops = getReactViteOperations();
    const paths = ops.map((o) => o.path);

    expect(paths).toContain('apps/frontend/package.json');
    expect(paths).toContain('apps/frontend/vite.config.ts');
    expect(paths).toContain('apps/frontend/src/App.tsx');
    expect(paths).toContain('apps/frontend/src/main.tsx');
    expect(paths).toContain('apps/frontend/index.html');

    const pkgJsonOp = ops.find((o) => o.path === 'apps/frontend/package.json');
    expect((pkgJsonOp as any)?.content).toContain('"@project/frontend"');
    expect((pkgJsonOp as any)?.content).toContain('"@project/api-client": "workspace:*"');
    expect((pkgJsonOp as any)?.content).toContain('"react": "^19.0.0"');
    expect((pkgJsonOp as any)?.content).toContain('"react-dom": "^19.0.0"');
    expect((pkgJsonOp as any)?.content).toContain('"vite": "^6.0.0"');
    expect((pkgJsonOp as any)?.content).toContain('"tailwindcss": "^4.0.0"');
    expect((pkgJsonOp as any)?.content).toContain('"typescript": "^7.0.2"');

    const viteConfigOp = ops.find((o) => o.path === 'apps/frontend/vite.config.ts');
    expect((viteConfigOp as any)?.content).toContain("defineConfig");
    expect((viteConfigOp as any)?.content).toContain("react()");

    const indexHtmlOp = ops.find((o) => o.path === 'apps/frontend/index.html');
    expect((indexHtmlOp as any)?.content).toContain('<div id="root"></div>');
    expect((indexHtmlOp as any)?.content).toContain('<script type="module" src="/src/main.tsx"></script>');

    const mainTsxOp = ops.find((o) => o.path === 'apps/frontend/src/main.tsx');
    expect((mainTsxOp as any)?.content).toContain('ReactDOM.createRoot');

    const appTsxOp = ops.find((o) => o.path === 'apps/frontend/src/App.tsx');
    expect((appTsxOp as any)?.content).toContain('ApiClient');
    expect((appTsxOp as any)?.content).toContain('Product');
    expect((appTsxOp as any)?.content).toContain('getProducts()');
  });
});
