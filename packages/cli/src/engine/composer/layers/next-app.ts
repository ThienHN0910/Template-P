import type { FileOperation } from '../operations.js';

export function getNextAppOperations(): FileOperation[] {
  const pkgJson = {
    name: '@project/frontend',
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
    },
    dependencies: {
      '@project/api-client': 'workspace:*',
      next: '^15.1.7',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    devDependencies: {
      '@types/node': '^22.13.1',
      '@types/react': '^19.0.8',
      '@types/react-dom': '^19.0.3',
      typescript: '^7.0.2',
    },
  };

  const nextConfig = `const nextConfig = {};

export default nextConfig;
`;

  const layoutTsx = `import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

  const pageTsx = `'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient, type Product } from '@project/api-client';

const client = new ApiClient();

export default function HomePage() {
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
    { kind: 'createFile', path: 'apps/frontend/next.config.mjs', content: nextConfig },
    { kind: 'createFile', path: 'apps/frontend/app/layout.tsx', content: layoutTsx },
    { kind: 'createFile', path: 'apps/frontend/app/page.tsx', content: pageTsx },
  ];
}
