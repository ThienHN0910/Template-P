import type { FileOperation } from '../operations.js';

export function getReactViteOperations(): FileOperation[] {
  const pkgJson = {
    name: '@project/frontend',
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
    },
    dependencies: {
      '@project/api-client': 'workspace:*',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    devDependencies: {
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      '@vitejs/plugin-react': '^4.3.4',
      tailwindcss: '^4.0.0',
      typescript: '^7.0.2',
      vite: '^6.0.0',
    },
  };

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
`;

  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Template-P Fullstack App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

  const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  const appTsx = `import React, { useEffect, useState } from 'react';
import { ApiClient, type Product } from '@project/api-client';

const client = new ApiClient();

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Product Catalog (Golden Slice)</h1>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong> - \${p.price} ({p.description})
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
`;

  return [
    { kind: 'createFile', path: 'apps/frontend/package.json', content: JSON.stringify(pkgJson, null, 2) + '\n' },
    { kind: 'createFile', path: 'apps/frontend/vite.config.ts', content: viteConfig },
    { kind: 'createFile', path: 'apps/frontend/index.html', content: indexHtml },
    { kind: 'createFile', path: 'apps/frontend/src/main.tsx', content: mainTsx },
    { kind: 'createFile', path: 'apps/frontend/src/App.tsx', content: appTsx },
  ];
}
