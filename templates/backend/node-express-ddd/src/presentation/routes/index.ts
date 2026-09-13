import { Router } from 'express';
import { ProductController } from '../controllers/ProductController.js';
import { ProductService } from '../../application/services/ProductService.js';

const router = Router();
const productService = new ProductService();
const productController = new ProductController(productService);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    service: 'Node.js Express Clean Architecture',
  });
});

// Products routes
router.get('/products', productController.getAll);
router.post('/products', productController.create);

export default router;
