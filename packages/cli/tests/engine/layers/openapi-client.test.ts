import { describe, expect, it } from 'vitest';
import { getOpenApiClientOperations } from '../../../src/engine/composer/layers/openapi-client.js';

describe('OpenAPI Client Layer', () => {
  it('generates packages/api-client package with types and typed api client', () => {
    const ops = getOpenApiClientOperations();
    const paths = ops.map((o) => o.path);

    expect(paths).toContain('packages/api-client/package.json');
    expect(paths).toContain('packages/api-client/tsconfig.json');
    expect(paths).toContain('packages/api-client/src/index.ts');
    expect(paths).toContain('packages/api-client/src/models.ts');

    const pkgJsonOp = ops.find((o) => o.path === 'packages/api-client/package.json');
    expect((pkgJsonOp as any)?.content).toContain('"@project/api-client"');
    expect((pkgJsonOp as any)?.content).toContain('"typescript": "^7.0.2"');

    const tsconfigOp = ops.find((o) => o.path === 'packages/api-client/tsconfig.json');
    expect((tsconfigOp as any)?.content).toContain('"moduleResolution": "NodeNext"');

    const modelsOp = ops.find((o) => o.path === 'packages/api-client/src/models.ts');
    expect((modelsOp as any)?.content).toContain('export interface Product');
    expect((modelsOp as any)?.content).toContain('export interface CreateProductRequest');

    const indexOp = ops.find((o) => o.path === 'packages/api-client/src/index.ts');
    expect((indexOp as any)?.content).toContain('export class ApiClient');
    expect((indexOp as any)?.content).toContain('getProducts(): Promise<Product[]>');
    expect((indexOp as any)?.content).toContain('getProduct(id: string): Promise<Product>');
    expect((indexOp as any)?.content).toContain('createProduct(request: CreateProductRequest): Promise<Product>');
  });
});
