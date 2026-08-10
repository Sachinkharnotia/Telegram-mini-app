import { Router } from 'express';
import { taskService } from '../../services/task.service';
import { authMiddleware } from '../../middleware/auth';
import { Task } from '../../models';
import { pool } from '../../config/database';

const router = Router();

router.use(authMiddleware);

router.get('/available', async (req: any, res) => {
  try {
    const tasks = await Task.findAllActive();
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/complete', async (req: any, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const result = await taskService.completeTask(req.user.id, taskId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/completed', async (req: any, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_tasks WHERE user_id = $1 AND reward_claimed = true',
      [req.user.id]
    );
    res.json({ completed_tasks: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
