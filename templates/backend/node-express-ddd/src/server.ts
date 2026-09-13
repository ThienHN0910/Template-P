import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './presentation/routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
);

app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Node.js Express Clean Architecture API', docs: '/api/health' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
