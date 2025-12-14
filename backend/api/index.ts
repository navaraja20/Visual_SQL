import express from 'express';
import cors from 'cors';
import { initDatabase } from '../src/database/init';
import queryRoutes from '../src/routes/query.routes';
import moduleRoutes from '../src/routes/module.routes';
import exerciseRoutes from '../src/routes/exercise.routes';
import schemaRoutes from '../src/routes/schema.routes';

const app = express();

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;

