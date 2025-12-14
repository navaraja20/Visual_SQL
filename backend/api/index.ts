import express, { Request, Response } from 'express';
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

// Initialize database - with timeout
let dbInitialized = false;
const dbInitPromise = initDatabase()
  .then(() => {
    console.log('Database initialization complete');
    dbInitialized = true;
  })
  .catch(err => {
    console.error('Database initialization failed:', err);
    dbInitialized = false;
  });

// Wait up to 5 seconds for DB, then proceed anyway
setTimeout(() => {
  if (!dbInitialized) {
    console.warn('Database initialization timed out, starting anyway...');
    dbInitialized = true;
  }
}, 5000);

// Routes - no blocking middleware
app.use('/api/query', queryRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/schemas', schemaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dbInitialized 
  });
});

// Root handler
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'VisualSQL Backend API',
    endpoints: ['/api/health', '/api/modules', '/api/query', '/api/exercises', '/api/schemas'],
    dbInitialized
  });
});

// Export for Vercel serverless
export default app;


