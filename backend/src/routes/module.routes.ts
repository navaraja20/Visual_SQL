import { Router, Request, Response } from 'express';
import { modules } from '../data/modules';

const router = Router();

router.get('/', (req: Request, res: Response) => {
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
    
    res.json(moduleList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:moduleId', (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const module = modules.find(m => m.id === moduleId);
    
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    res.json(module);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
