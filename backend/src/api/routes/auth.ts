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
    
    let referrerId: number | undefined = undefined;
    if (startParam) {
      const numMatch = String(startParam).match(/\d+/);
      if (numMatch) {
        const refRaw = parseInt(numMatch[0], 10);
        if (!isNaN(refRaw)) {
          const refUser = dataStore.findUserByTelegramId(refRaw) || dataStore.findUserById(refRaw);
          referrerId = refUser ? refUser.id : refRaw;
        }
      }
    }

    if (!user) {
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
    } else {
      if (telegramUser.first_name) user.first_name = telegramUser.first_name;
      if (telegramUser.username) user.username = telegramUser.username;
      if (telegramUser.last_name) user.last_name = telegramUser.last_name;
      if (telegramUser.is_premium !== undefined) user.is_premium = telegramUser.is_premium;
      if (!user.referred_by && referrerId && user.id !== referrerId && user.telegram_id !== referrerId) {
        dataStore.linkReferral(referrerId, user.id);
      }
      dataStore.saveToDisk();
    }

    if (user && !user.is_active) {
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
    
    const userWithBalance = {
      ...user,
      balance_usdt: balance.usdt_balance,
      balance_vx: balance.vx_balance,
      mining_active: balance.vx_balance >= settings.min_vx_mining
    };

    res.json({
      access_token,
      token: access_token,
      user: userWithBalance,
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
    const rawUserData = req.body.user_data || req.body.user || req.body;
    const balance_usdt = req.body.balance_usdt !== undefined ? req.body.balance_usdt : rawUserData.balance_usdt;
    const balance_vx = req.body.balance_vx !== undefined ? req.body.balance_vx : rawUserData.balance_vx;

    const telegramId = rawUserData.telegram_id || rawUserData.id;
    if (!telegramId) {
      return res.status(400).json({ error: 'Missing user id or telegram_id' });
    }

    const existingUser = dataStore.findUserByTelegramId(Number(telegramId)) || dataStore.findUserById(Number(telegramId));
    if (existingUser && !existingUser.is_active) {
      return res.status(403).json({ error: `Account suspended. Reason: ${existingUser.ban_reason || 'Banned by admin'}` });
    }

    const { user, balance } = dataStore.syncUserFromClient({
      telegram_id: Number(telegramId),
      username: rawUserData.username,
      first_name: rawUserData.first_name,
      last_name: rawUserData.last_name,
      language_code: rawUserData.language_code,
      is_premium: rawUserData.is_premium,
      balance_usdt: balance_usdt !== undefined ? Number(balance_usdt) : undefined,
      balance_vx: balance_vx !== undefined ? Number(balance_vx) : undefined
    });

    if (user && !user.is_active) {
      return res.status(403).json({ error: `Account suspended. Reason: ${user.ban_reason || 'Banned by admin'}` });
    }

    res.json({ success: true, user, balance });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
