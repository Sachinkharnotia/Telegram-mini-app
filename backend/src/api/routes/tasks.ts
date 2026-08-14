import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

router.get('/list', (req: any, res) => {
  const userId = req.user?.id || 1001;
  const tasks = dataStore.getTasks();
  const completedIds = dataStore.getUserTaskIds(userId);

  const formattedTasks = tasks.map(t => ({
    ...t,
    completed: completedIds.includes(t.id)
  }));

  res.json({ tasks: formattedTasks });
});

router.post('/claim', (req: any, res) => {
  try {
    const userId = req.user?.id || 1001;
    const { task_id } = req.body;

    const result = dataStore.completeTask(userId, parseInt(task_id, 10));
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({
      success: true,
      reward_amount: result.rewardAmount,
      reward_currency: result.currency,
      message: 'Reward claimed successfully'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to claim task' });
  }
});

export default router;
