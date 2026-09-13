export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
}

export type CreateProductInput = Omit<Product, 'id' | 'createdAt'>;
