import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase } from './database/init';
import queryRoutes from './routes/query.routes';
import moduleRoutes from './routes/module.routes';
import exerciseRoutes from './routes/exercise.routes';
import schemaRoutes from './routes/schema.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase().then(() => {
  console.log('Database initialization complete');
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

// Routes
app.use('/api/query', queryRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/schemas', schemaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ VisualSQL Backend running on http://localhost:${PORT}`);
});

export default app;
