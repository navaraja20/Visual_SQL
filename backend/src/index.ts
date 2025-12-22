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

// Initialize database asynchronously (don't block startup)
let dbInitialized = false;
initDatabase().then(() => {
  console.log('Database initialization complete');
  dbInitialized = true;
}).catch(err => {
  console.error('Database initialization failed:', err);
});

// Middleware to ensure DB is ready
app.use((req, res, next) => {
  if (!dbInitialized && !req.path.includes('/health')) {
    return res.status(503).json({ error: 'Database initializing, please retry' });
  }
  next();
});

// Routes
app.use('/api/query', queryRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/schemas', schemaRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'VisualSQL API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      query: '/api/query',
      modules: '/api/modules',
      exercises: '/api/exercises',
      schemas: '/api/schemas'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Only listen when not on Vercel (for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ VisualSQL Backend running on http://localhost:${PORT}`);
  });
}

export default app;
