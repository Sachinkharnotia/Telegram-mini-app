import { Router } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../../models';
import { verifyTelegramData } from '../../utils/crypto';

const router = Router();

router.post('/telegram', async (req, res) => {
  try {
    const { telegramData } = req.body;
    
    if (!telegramData) {
      return res.status(400).json({ error: 'Missing Telegram data' });
    }
    
    const urlParams = new URLSearchParams(telegramData);
    const data: Record<string, string> = {};
    for (const [key, value] of urlParams.entries()) {
      data[key] = value;
    }
    
    const isValid = verifyTelegramData(data, process.env.TELEGRAM_BOT_TOKEN!);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const userDataStr = data.user;
    if (!userDataStr) {
      return res.status(400).json({ error: 'Missing user data' });
    }
    
    const telegramUser = JSON.parse(decodeURIComponent(userDataStr));
    
    let user = await User.findByTelegramId(telegramUser.id);
    let is_new = false;
    
    if (!user) {
      user = await User.create({
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        language_code: telegramUser.language_code,
        is_premium: telegramUser.is_premium || false
      });
      is_new = true;
    }
    
    const options: SignOptions = { expiresIn: '7d' };
    const access_token = jwt.sign(
      { id: user.id, telegram_id: user.telegram_id },
      process.env.JWT_SECRET || 'secret',
      options
    );
    
    res.json({ access_token, user, is_new });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

export default router;
