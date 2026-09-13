export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  createdAt: string;
}

export interface HealthResponse {
  status: string;
  timestamp?: string;
}

export const apiClient = {
  async getHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'Offline / Connecting...' };
    }
  },

  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Fetch products failed');
      return await res.json();
    } catch {
      return [];
    }
  },

  async createProduct(name: string, price: number): Promise<Product | null> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price }),
      });
      if (!res.ok) throw new Error('Create failed');
      return await res.json();
    } catch {
      return null;
    }
  },
};
