import type { VercelRequest, VercelResponse } from '@vercel/node';
import initSqlJs from 'sql.js';

let SQL: any = null;

async function initDB() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
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
    const { query, schema } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const sql = await initDB();
    const db = new sql.Database();

    // Execute schema setup if provided
    if (schema) {
      db.exec(schema);
    }

    // Execute the query
    const result = db.exec(query);
    
    db.close();

    if (result.length === 0) {
      return res.status(200).json({
        columns: [],
        values: [],
        rowCount: 0
      });
    }

    return res.status(200).json({
      columns: result[0].columns,
      values: result[0].values,
      rowCount: result[0].values.length
    });

  } catch (error: any) {
    return res.status(400).json({ 
      error: error.message || 'Query execution failed' 
    });
  }
}
