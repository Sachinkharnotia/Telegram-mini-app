import { TronWeb } from 'tronweb';
import { pool } from '../config/database';
import { depositService } from '../services/deposit.service';
import { telegramBotService } from '../services/telegramBot';

export class TronIndexer {
  private tronWeb: any;
  private usdtContractAddress: string;
  private isScanning = false;

  constructor() {
    const fullNode = process.env.TRON_FULL_NODE || 'https://api.trongrid.io';
    const apiKey = process.env.TRONGRID_API_KEY;
    
    this.tronWeb = new TronWeb({
      fullHost: fullNode,
      headers: apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {}
    });
    
    this.usdtContractAddress = process.env.USDT_TRC20_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
  }

  async scanPendingDeposits(): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;

    try {
      const pendingResult = await pool.query(
        `SELECT d.id, d.user_id, d.amount, u.wallet_address, u.telegram_id 
         FROM deposits d 
         JOIN users u ON d.user_id = u.id 
         WHERE d.status = 'pending' AND d.created_at > NOW() - INTERVAL '2 hours'`
      );

      for (const row of pendingResult.rows) {
        await this.verifyDepositTransaction(row);
      }
    } catch {
    } finally {
      this.isScanning = false;
    }
  }

  private async verifyDepositTransaction(depositRow: any): Promise<void> {
    try {
      const address = depositRow.wallet_address;
      const url = `https://api.trongrid.io/v1/accounts/${address}/transactions/trc20?limit=20&contract_address=${this.usdtContractAddress}`;
      
      const response = await fetch(url, {
        headers: process.env.TRONGRID_API_KEY ? { 'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY } : {}
      });

      if (!response.ok) return;
      const data = await response.json();
      if (!data || !data.data) return;

      for (const tx of data.data) {
        if (tx.to === address && tx.type === 'Transfer') {
          const rawAmount = parseFloat(tx.value) / 1e6;
          if (Math.abs(rawAmount - parseFloat(depositRow.amount)) < 0.01) {
            const blockNum = tx.block_number;
            const currentBlock = await this.tronWeb.trx.getCurrentBlock();
            const confirmations = currentBlock.block_header.raw_data.number - blockNum;

            if (confirmations >= 12) {
              await depositService.confirmDeposit(depositRow.id, tx.transaction_id);
              if (depositRow.telegram_id) {
                await telegramBotService.sendDepositNotification(
                  depositRow.telegram_id,
                  depositRow.amount,
                  tx.transaction_id
                );
              }
              break;
            }
          }
        }
      }
    } catch {
    }
  }

  startPeriodicIndexer(intervalMs = 30000): NodeJS.Timeout {
    return setInterval(() => {
      this.scanPendingDeposits();
    }, intervalMs);
  }
}

export const tronIndexer = new TronIndexer();
