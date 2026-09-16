export interface Product {
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
