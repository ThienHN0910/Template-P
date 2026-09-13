import { Request, Response } from 'express';
import { ProductService } from '../../application/services/ProductService.js';

export class ProductController {
  constructor(private productService: ProductService) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const items = await this.productService.getAll();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { name, description, price } = req.body;
      if (!name || price === undefined) {
        return res.status(400).json({ error: 'Name and price are required' });
      }
      const item = await this.productService.create({ name, description, price, isActive: true });
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
