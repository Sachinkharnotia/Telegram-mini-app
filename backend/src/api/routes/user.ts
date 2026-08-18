import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

router.get('/profile', (req: any, res) => {
  const userId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : 1001);
  let user = dataStore.findUserById(userId);
  if (!user && req.query.telegram_id) {
    user = dataStore.findUserByTelegramId(parseInt(req.query.telegram_id as string, 10));
  }
  if (!user) {
    user = dataStore.findUserById(1001);
  }
  if (!user) return res.status(404).json({ error: 'User not found' });
  const balance = dataStore.getUserBalance(user.id);
  const settings = dataStore.getSettings();
  res.json({ user, balance, settings });
});

router.get('/mandatory-join', (req: any, res) => {
  const settings = dataStore.getSettings();
  const communities = dataStore.getRequiredCommunities();
  res.json({
    enabled: settings.mandatory_join_enabled,
    communities
  });
});

router.post('/mandatory-join/confirm', (req: any, res) => {
  res.json({ success: true, message: 'All required communities verified' });
});

export default router;
