import { Router, Request, Response } from 'express';
import { QueryExecutor } from '../services/query-executor.service';
import { body, validationResult } from 'express-validator';

const router = Router();
const queryExecutor = new QueryExecutor();

router.post(
  '/execute',
  [
    body('query').isString().notEmpty(),
    body('schema').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { query, schema } = req.body;
    
    try {
      const result = await queryExecutor.execute(query, schema);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
