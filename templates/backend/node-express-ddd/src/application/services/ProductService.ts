import { Product, CreateProductInput } from '../../domain/entities/Product.js';
import crypto from 'crypto';

export class ProductService {
  // In-memory store with DB adapter hook
  private products: Product[] = [
    {
      id: crypto.randomUUID(),
      name: 'Sample Starter Item',
      description: 'Clean Architecture Product Entity',
      price: 99.99,
      isActive: true,
      createdAt: new Date(),
    },
  ];

  async getAll(): Promise<Product[]> {
    return this.products;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const item: Product = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
    };
    this.products.push(item);
    return item;
  }
}
