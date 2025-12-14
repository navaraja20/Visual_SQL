import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { exercises } from '../data/exercises';
import { QueryExecutor } from '../services/query-executor.service';

const router = Router();
const queryExecutor = new QueryExecutor();

router.get('/', (req: Request, res: Response) => {
  try {
    const { moduleId } = req.query;
    
    let filteredExercises = exercises;
    if (moduleId) {
      filteredExercises = exercises.filter(e => e.moduleId === moduleId);
    }
    
    // Return without answers
    const exercisesWithoutAnswers = filteredExercises.map(e => ({
      ...e,
      answer: undefined,
      expectedResult: undefined,
    }));
    
    res.json(exercisesWithoutAnswers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:exerciseId', (req: Request, res: Response) => {
  try {
    const { exerciseId } = req.params;
    const exercise = exercises.find(e => e.id === exerciseId);
    
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    
    // Return without answer
    const { answer, expectedResult, ...exerciseWithoutAnswer } = exercise;
    
    res.json(exerciseWithoutAnswer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  '/:exerciseId/submit',
  [
    body('answer').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { exerciseId } = req.params;
    const { answer } = req.body;
    
    try {
      const exercise = exercises.find(e => e.id === exerciseId);
      
      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' });
      }
      
      let isCorrect = false;
      let feedback = '';
      let userResult: any = null;
      let expectedResult: any = null;
      
      if (exercise.type === 'write-query') {
        // Execute user's query
        const userExecution = await queryExecutor.execute(answer, exercise.schema);
        userResult = userExecution.finalResult;
        
        // Execute expected query
        const expectedExecution = await queryExecutor.execute(exercise.answer as string, exercise.schema);
        expectedResult = expectedExecution.finalResult;
        
        // Compare results
        isCorrect = JSON.stringify(userResult.rows) === JSON.stringify(expectedResult.rows);
        
        if (isCorrect) {
          feedback = 'Perfect! Your query produces the correct result.';
        } else {
          feedback = 'Your query does not produce the expected result. Check the differences below.';
        }
      } else if (exercise.type === 'multiple-choice') {
        isCorrect = answer === exercise.answer;
        feedback = isCorrect 
          ? 'Correct! Well done.' 
          : `Incorrect. The correct answer is: ${exercise.options?.find(o => o.id === exercise.answer)?.text}`;
      } else if (exercise.type === 'predict-result') {
        isCorrect = answer === exercise.answer;
        feedback = isCorrect 
          ? 'Correct! You predicted the result accurately.' 
          : 'Incorrect. Try running the query to see the actual result.';
      }
      
      res.json({
        isCorrect,
        feedback,
        userResult,
        expectedResult,
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: error.message,
        isCorrect: false,
        feedback: `Error executing query: ${error.message}`,
      });
    }
  }
);

export default router;
