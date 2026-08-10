import TelegramBot from 'node-telegram-bot-api';

export class TelegramBotService {
  private bot: TelegramBot | null = null;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      this.bot = new TelegramBot(token, { polling: false });
    }
  }

  async sendDepositNotification(chatId: string | number, amount: number, txHash: string): Promise<boolean> {
    if (!this.bot) return false;
    try {
      const message = `🎉 Deposit Confirmed!\n\nAmount: ${amount} USDT\nTx Hash: ${txHash.slice(0, 8)}...${txHash.slice(-8)}\n\nYour mining rate has been updated automatically.`;
      await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      return true;
    } catch {
      return false;
    }
  }

  async sendWithdrawalNotification(chatId: string | number, amount: number, txHash: string): Promise<boolean> {
    if (!this.bot) return false;
    try {
      const message = `💸 Withdrawal Processed!\n\nAmount: ${amount} USDT\nTx Hash: ${txHash.slice(0, 8)}...${txHash.slice(-8)}\n\nFunds have been broadcasted to your TRC20 wallet.`;
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

      if (text.startsWith('/start')) {
        const welcomeText = `🚀 <b>Welcome to Vault Yield Mining Bot</b>\n\nEarn up to 0.50% daily yield on USDT deposits.\n\nClick the Mini App button below to open your dashboard.`;
        const miniAppUrl = process.env.TELEGRAM_MINI_APP_URL || 'https://t.me/VaultYieldBot/app';
        await this.bot.sendMessage(chatId, welcomeText, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '⚡ Launch Mini App', web_app: { url: miniAppUrl } }]
            ]
          }
        });
      }
    }
  }
}

export const telegramBotService = new TelegramBotService();
