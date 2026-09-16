import type { Product, CreateProductRequest } from './models.js';

export * from './models.js';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${this.baseUrl}/api/v1/products`);
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
    return res.json();
  }

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${this.baseUrl}/api/v1/products/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch product ${id}: ${res.statusText}`);
    return res.json();
  }

  async createProduct(request: CreateProductRequest): Promise<Product> {
    const res = await fetch(`${this.baseUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(`Failed to create product: ${res.statusText}`);
    return res.json();
  }
}
