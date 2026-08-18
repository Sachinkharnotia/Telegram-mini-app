import { Router } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { verifyTelegramData } from '../../utils/crypto';
import { dataStore } from '../../services/store';

const router = Router();

router.post('/telegram', async (req, res) => {
  try {
    const rawData = req.body.initData || req.body.telegramData || '';
    const startParam = req.body.startParam || req.body.start_param;
    
    let telegramUser: any = null;

    if (rawData) {
      const urlParams = new URLSearchParams(rawData);
      const data: Record<string, string> = {};
      for (const [key, value] of urlParams.entries()) {
        data[key] = value;
      }
      
      const isValid = verifyTelegramData(data, process.env.TELEGRAM_BOT_TOKEN || '');

      if (isValid && data.user) {
        telegramUser = JSON.parse(decodeURIComponent(data.user));
      } else if (data.user) {
        telegramUser = JSON.parse(decodeURIComponent(data.user));
      }
    }

    if (!telegramUser && req.body.user) {
      telegramUser = req.body.user;
    }

    if (!telegramUser) {
      telegramUser = {
        id: 98765432,
        first_name: 'Investor',
        username: 'CryptoDev'
      };
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
      token: access_token,
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

router.post('/register-sync', (req, res) => {
  try {
    const { user_data, balance_usdt, balance_vx } = req.body;
    if (!user_data || !user_data.id) {
      return res.status(400).json({ error: 'Missing user_data' });
    }

    const { user, balance } = dataStore.syncUserFromClient({
      telegram_id: user_data.telegram_id || user_data.id,
      username: user_data.username,
      first_name: user_data.first_name,
      last_name: user_data.last_name,
      language_code: user_data.language_code,
      is_premium: user_data.is_premium,
      balance_usdt,
      balance_vx
    });

    res.json({ success: true, user, balance });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
