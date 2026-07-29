import { Router } from 'express';
import { taskService } from '../../services/task.service';
import { authMiddleware } from '../../middleware/auth';
import { Task } from '../../models';

const router = Router();

router.use(authMiddleware);

router.get('/available', async (req: any, res) => {
  try {
    const tasks = await Task.getActiveTasks();
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
    const completedTasks = await Task.getUserTasks(req.user.id);
    res.json({ completed_tasks: completedTasks });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
