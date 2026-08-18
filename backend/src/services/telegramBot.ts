import TelegramBot from 'node-telegram-bot-api';

const DEFAULT_BOT_TOKEN = '8921722561:AAGbrA4p6acTznLKZV5Ad1M1j8G5eq4psGw';
const DEFAULT_WEB_APP_URL = 'https://vextoral.com';

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
      const text = update.message.text;
      const firstName = update.message.from?.first_name || 'Member';

      if (text.startsWith('/start')) {
        const welcomeText = `🚀 <b>Welcome to Vextoral Mining Engine, ${firstName}!</b>\n\n💎 Complete tasks, mine VX tokens, spin the lucky wheel, and earn continuous daily USDT yield.\n\n👇 Click the button below to launch the Mini App:`;
        const miniAppUrl = process.env.TELEGRAM_MINI_APP_URL || DEFAULT_WEB_APP_URL;

        await this.bot.sendMessage(chatId, welcomeText, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '⚡ Launch Vextoral App', web_app: { url: miniAppUrl } }],
              [{ text: '📢 Official Channel', url: 'https://t.me/Vextoral' }, { text: '💬 Support', url: 'https://t.me/VextoralSupport' }]
            ]
          }
        });
      }
    }
  }
}

export const telegramBotService = new TelegramBotService();
