import type { VercelRequest, VercelResponse } from '@vercel/node';
import { modules } from '../../src/data/modules';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { moduleId } = req.query;
    
    if (!moduleId || typeof moduleId !== 'string') {
      return res.status(400).json({ error: 'Module ID is required' });
    }
    
    const module = modules.find(m => m.id === moduleId);
    
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    return res.status(200).json(module);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
