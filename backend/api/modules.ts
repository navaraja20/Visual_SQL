import type { VercelRequest, VercelResponse } from '@vercel/node';
import { modules } from '../src/data/modules';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Return module list with basic info
    const moduleList = modules.map(m => ({
      id: m.id,
      title: m.title,
      category: m.category,
      difficulty: m.difficulty,
      order: m.order,
      description: m.description.substring(0, 150) + '...',
    }));
    
    return res.status(200).json(moduleList);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
