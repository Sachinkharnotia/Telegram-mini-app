import { Router } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { verifyTelegramData } from '../../utils/crypto';
import { dataStore } from '../../services/store';

const router = Router();

router.post('/telegram', async (req, res) => {
  try {
    const { telegramData, startParam } = req.body;
    
    if (!telegramData) {
      return res.status(400).json({ error: 'Missing Telegram data' });
    }
    
    const urlParams = new URLSearchParams(telegramData);
    const data: Record<string, string> = {};
    for (const [key, value] of urlParams.entries()) {
      data[key] = value;
    }
    
    const isValid = verifyTelegramData(data, process.env.TELEGRAM_BOT_TOKEN || '');
    let telegramUser: any = null;

    if (isValid && data.user) {
      telegramUser = JSON.parse(decodeURIComponent(data.user));
    } else {
      if (process.env.NODE_ENV === 'development' || !process.env.TELEGRAM_BOT_TOKEN) {
        if (data.user) {
          telegramUser = JSON.parse(decodeURIComponent(data.user));
        } else {
          telegramUser = { id: 98765432, first_name: 'Investor', username: 'CryptoDev' };
        }
      } else {
        return res.status(401).json({ error: 'Invalid Telegram WebApp signature' });
      }
    }
    
    let user = dataStore.findUserByTelegramId(telegramUser.id);
    let is_new = false;
    
    if (!user) {
      let referrerId: number | undefined = undefined;
      if (startParam && startParam.startsWith('ref_')) {
        const refTgId = parseInt(startParam.replace('ref_', ''), 10);
        if (!isNaN(refTgId)) {
          const refUser = dataStore.findUserByTelegramId(refTgId);
          if (refUser) referrerId = refUser.id;
        }
      }

      user = dataStore.createUser({
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        language_code: telegramUser.language_code,
        is_premium: telegramUser.is_premium || false,
        referred_by: referrerId
      });
      is_new = true;
    }

    if (!user.is_active) {
      return res.status(403).json({ error: `Account suspended. Reason: ${user.ban_reason || 'Banned by admin'}` });
    }
    
    const options: SignOptions = { expiresIn: '30d' };
    const access_token = jwt.sign(
      { id: user.id, telegram_id: user.telegram_id, is_admin: user.is_admin },
      process.env.JWT_SECRET || 'secret_jwt_key',
      options
    );

    const balance = dataStore.getUserBalance(user.id);
    const settings = dataStore.getSettings();
    const required_communities = dataStore.getRequiredCommunities();
    
    res.json({
      access_token,
      user,
      balance,
      settings,
      required_communities,
      is_new
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
