import type { VercelRequest, VercelResponse } from '@vercel/node';
import { QueryExecutor } from '../../src/services/query-executor.service';
import { initDatabase } from '../../src/database/init';

let dbInitialized = false;
let initPromise: Promise<void> | null = null;

async function ensureDatabaseInitialized() {
  if (!dbInitialized) {
    if (!initPromise) {
      initPromise = initDatabase()
        .then(() => {
          dbInitialized = true;
          console.log('✅ Database initialized for serverless');
        })
        .catch(err => {
          console.error('❌ Database initialization failed:', err);
          initPromise = null;
          throw err;
        });
    }
    await initPromise;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure database is initialized
    await ensureDatabaseInitialized();

    const { query, schema } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const queryExecutor = new QueryExecutor();
    const result = await queryExecutor.execute(query, schema);

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Query execution error:', error);
    return res.status(400).json({ 
      error: error.message || 'Query execution failed',
      steps: [],
      finalResult: { name: 'error', rows: [] },
      executionTime: 0
    });
  }
}
