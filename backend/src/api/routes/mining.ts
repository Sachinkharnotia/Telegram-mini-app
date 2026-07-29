import { Router } from 'express';
import { miningService } from '../../services/mining.service';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/stats', async (req: any, res) => {
  try {
    const stats = await miningService.calculateUserMining(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
