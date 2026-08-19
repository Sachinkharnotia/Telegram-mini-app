import TelegramBot from 'node-telegram-bot-api';
import { dataStore } from './store';

const DEFAULT_BOT_TOKEN = '8921722561:AAGbrA4p6acTznLKZV5Ad1M1j8G5eq4psGw';
const DEFAULT_WEB_APP_URL = 'https://frontend-sooty-theta-89.vercel.app';

export class TelegramBotService {
  private bot: TelegramBot | null = null;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
    if (token) {
      try {
        this.bot = new TelegramBot(token, { polling: false });
      } catch (err) {
        console.error('Failed to initialize TelegramBot:', err);
      }
    }
  }

  async sendDepositNotification(chatId: string | number, amount: number, txHash: string): Promise<boolean> {
    if (!this.bot) return false;
    try {
      const message = `🎉 <b>Deposit Confirmed!</b>\n\nAmount: <b>${amount} USDT</b>\nTx: <code>${txHash.slice(0, 10)}...${txHash.slice(-8)}</code>\n\nYour quantitative mining balance has been credited.`;
      await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      return true;
    } catch {
      return false;
    }
  }

  async sendWithdrawalNotification(chatId: string | number, amount: number, txHash: string): Promise<boolean> {
    if (!this.bot) return false;
    try {
      const message = `💸 <b>Withdrawal Processed!</b>\n\nAmount: <b>${amount} USDT</b>\nTx: <code>${txHash.slice(0, 10)}...${txHash.slice(-8)}</code>\n\nFunds have been broadcasted to your wallet.`;
      await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      return true;
    } catch {
      return false;
    }
  }

  async handleWebhookUpdate(update: any): Promise<void> {
    if (!this.bot) return;
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();
      const fromUser = update.message.from;
      const firstName = fromUser?.first_name || 'Member';

      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        const startParam = parts.length > 1 ? parts[1].trim() : '';
        
        let referrerId: number | undefined = undefined;
        if (startParam && startParam.startsWith('ref_')) {
          const rawId = parseInt(startParam.replace('ref_', ''), 10);
          if (!isNaN(rawId)) {
            const refUser = dataStore.findUserByTelegramId(rawId) || dataStore.findUserById(rawId);
            referrerId = refUser ? refUser.id : rawId;
          }
        }

        if (fromUser) {
          let u = dataStore.findUserByTelegramId(fromUser.id);
          if (!u) {
            u = dataStore.createUser({
              telegram_id: fromUser.id,
              username: fromUser.username,
              first_name: fromUser.first_name,
              last_name: fromUser.last_name,
              language_code: fromUser.language_code,
              is_premium: fromUser.is_premium || false,
              referred_by: referrerId
            });
          } else if (!u.referred_by && referrerId && u.id !== referrerId && u.telegram_id !== referrerId) {
            dataStore.linkReferral(referrerId, u.id);
          }
        }

        const welcomeText = `🚀 <b>Welcome to Vextoral Mining Engine, ${firstName}!</b>\n\n💎 Complete tasks, mine VX tokens, spin the lucky wheel, and earn continuous daily USDT yield.\n\n👇 Click the button below to launch the Mini App:`;
        const miniAppUrl = process.env.TELEGRAM_MINI_APP_URL || DEFAULT_WEB_APP_URL;
        const launchUrl = startParam ? `${miniAppUrl}?start=${startParam}#tgWebAppStartParam=${startParam}` : miniAppUrl;

        try {
          await this.bot.sendMessage(chatId, welcomeText, {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '⚡ Launch Vextoral App', web_app: { url: launchUrl } }],
                [{ text: '📢 Official Channel', url: 'https://t.me/Vextoral' }, { text: '💬 Support & Community', url: 'https://t.me/vextoralcomunity' }]
              ]
            }
          });
        } catch (err: any) {
          console.error('Telegram bot sendMessage error:', err.message);
        }
      }
    }
  }

  async broadcastMessage(chatIds: (string | number)[], title: string, body: string): Promise<{ sent: number; failed: number }> {
    if (!this.bot) return { sent: 0, failed: 0 };
    let sent = 0;
    let failed = 0;
    const formatted = `📢 <b>${title}</b>\n\n${body}\n\n👉 <a href="https://frontend-sooty-theta-89.vercel.app">Open Vextoral Mining App</a>`;

    for (const chatId of chatIds) {
      if (!chatId) continue;
      try {
        await this.bot.sendMessage(chatId, formatted, { 
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Open App', web_app: { url: 'https://frontend-sooty-theta-89.vercel.app' } }]
            ]
          }
        });
        sent++;
      } catch (err) {
        failed++;
      }
    }
    return { sent, failed };
  }
}

export const telegramBotService = new TelegramBotService();
