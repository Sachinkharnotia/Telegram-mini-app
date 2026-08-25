import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

const getTasksList = async (req: any, res: any) => {
  await dataStore.syncWithPostgres();
  const rawId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : undefined) || (req.query.telegram_id ? parseInt(req.query.telegram_id as string, 10) : undefined);
  const user = rawId ? (dataStore.findUserByTelegramId(rawId) || dataStore.findUserById(rawId)) : null;
  const userId = user ? user.id : (rawId || 1001);
  const tasks = dataStore.getTasks();
  const completedIds = dataStore.getUserTaskIds(userId);

  const formattedTasks = tasks.map(t => ({
    ...t,
    completed: completedIds.includes(t.id)
  }));

  res.json({ tasks: formattedTasks });
};

router.get('/', getTasksList);
router.get('/user', getTasksList);
router.get('/list', getTasksList);
router.get('/available', getTasksList);

const handleClaimTask = async (req: any, res: any) => {
  await dataStore.syncWithPostgres();
  try {
    const rawId = req.body.user_id || req.body.telegram_id || req.user?.id || 1001;
    const user = dataStore.findUserByTelegramId(rawId) || dataStore.findUserById(rawId);
    const userId = user ? user.id : (rawId || 1001);
    const taskIdRaw = req.params.taskId || req.body.task_id || req.body.taskId;
    const taskId = parseInt(taskIdRaw, 10);

    const result = dataStore.completeTask(userId, taskId);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    await dataStore.saveToDiskAsync();

    res.json({
      success: true,
      completionId: `TSK-${Date.now()}`,
      status: 'completed',
      reward_amount: result.rewardAmount,
      reward_currency: result.currency,
      message: 'Reward claimed successfully'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to claim task' });
  }
};

router.post('/claim', handleClaimTask);
router.post('/:taskId/complete', handleClaimTask);

export default router;
