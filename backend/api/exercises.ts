import type { VercelRequest, VercelResponse } from '@vercel/node';
import { exercises } from '../src/data/exercises';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { moduleId } = req.query;

  if (moduleId && typeof moduleId === 'string') {
    const moduleExercises = exercises.filter(ex => ex.moduleId === moduleId);
    return res.status(200).json(moduleExercises);
  }

  // Return all exercises
  return res.status(200).json(exercises);
}
