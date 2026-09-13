import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
});

// Health check endpoint
fastify.get('/api/health', async () => {
  return { status: 'Healthy', timestamp: new Date().toISOString(), framework: 'Fastify Clean Modular' };
});

// Products sample endpoint
const products = [
  { id: '1', name: 'Fastify High-Speed Item', price: 149.99, createdAt: new Date() },
];

fastify.get('/api/products', async () => {
  return products;
});

fastify.post('/api/products', async (request, reply) => {
  const body = request.body as { name: string; price: number };
  if (!body || !body.name) {
    return reply.status(400).send({ error: 'Name is required' });
  }
  const item = { id: String(products.length + 1), name: body.name, price: body.price || 0, createdAt: new Date() };
  products.push(item);
  return reply.status(201).send(item);
});

const PORT = Number(process.env.PORT) || 4000;

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
