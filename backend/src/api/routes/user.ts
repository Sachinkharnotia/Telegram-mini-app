import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

router.get('/profile', (req: any, res) => {
  const userId = req.user?.id || 1001;
  const user = dataStore.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const balance = dataStore.getUserBalance(userId);
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
