import type { FileOperation } from '../operations.js';

export function getOpenApiClientOperations(): FileOperation[] {
  const pkgJson = {
    name: '@project/api-client',
    version: '1.0.0',
    private: true,
    type: 'module',
    main: './src/index.ts',
    scripts: {
      build: 'tsc',
    },
    devDependencies: {
      typescript: '^7.0.2',
    },
  };

  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      declaration: true,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    include: ['src'],
  };

  const models = `export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAtUtc: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
}
`;

  const indexTs = `import type { Product, CreateProductRequest } from './models.js';

export * from './models.js';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl.replace(/\\/$/, '');
  }

  async getProducts(): Promise<Product[]> {
    const res = await fetch(\`\${this.baseUrl}/api/v1/products\`);
    if (!res.ok) throw new Error(\`Failed to fetch products: \${res.statusText}\`);
    return res.json();
  }

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(\`\${this.baseUrl}/api/v1/products/\${id}\`);
    if (!res.ok) throw new Error(\`Failed to fetch product \${id}: \${res.statusText}\`);
    return res.json();
  }

  async createProduct(request: CreateProductRequest): Promise<Product> {
    const res = await fetch(\`\${this.baseUrl}/api/v1/products\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(\`Failed to create product: \${res.statusText}\`);
    return res.json();
  }
}
`;

  return [
    { kind: 'createFile', path: 'packages/api-client/package.json', content: JSON.stringify(pkgJson, null, 2) + '\n' },
    { kind: 'createFile', path: 'packages/api-client/tsconfig.json', content: JSON.stringify(tsconfig, null, 2) + '\n' },
    { kind: 'createFile', path: 'packages/api-client/src/models.ts', content: models },
    { kind: 'createFile', path: 'packages/api-client/src/index.ts', content: indexTs },
  ];
}
