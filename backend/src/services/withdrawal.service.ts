import { Withdrawal } from '../models';
import { WithdrawResponse, ClaimResponse } from '../../../shared/types/api';
import { pool } from '../config/database';
import { NETWORK_INFO } from '../../../shared/constants';
import { TronWeb } from 'tronweb';
import { telegramBotService } from './telegramBot';

export class WithdrawalService {
  private tronWeb: any;
  private usdtContractAddress: string;

  constructor() {
    const fullNode = process.env.TRON_FULL_NODE || 'https://api.trongrid.io';
    const privateKey = process.env.HOT_WALLET_PRIVATE_KEY;
    const apiKey = process.env.TRONGRID_API_KEY;

    this.tronWeb = new TronWeb({
      fullHost: fullNode,
      privateKey: privateKey || '0000000000000000000000000000000000000000000000000000000000000001',
      headers: apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {}
    });

    this.usdtContractAddress = process.env.USDT_TRC20_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
  }

  async claimEarnings(userId: number, amount?: number): Promise<ClaimResponse> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const balanceResult = await client.query('SELECT mining_balance, available_balance FROM user_balances WHERE user_id = $1 FOR UPDATE', [userId]);
      let balance = balanceResult.rows[0];
      
      if (!balance) {
        await client.query(
          'INSERT INTO user_balances (user_id, mining_balance, available_balance) VALUES ($1, 0, 0)',
          [userId]
        );
        balance = { mining_balance: 0, available_balance: 0 };
      }
      
      const claimAmount = amount || parseFloat(balance.mining_balance);
      
      if (claimAmount <= 0 || claimAmount > parseFloat(balance.mining_balance)) {
        throw new Error('Invalid claim amount');
      }
      
      await client.query(
        'UPDATE user_balances SET mining_balance = mining_balance - $1, available_balance = available_balance + $1, last_claim_at = NOW() WHERE user_id = $2',
        [claimAmount, userId]
      );
      
      const txResult = await client.query(
        'INSERT INTO transactions (user_id, type, amount, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [userId, 'claim', claimAmount, 'completed']
      );
      
      await client.query('COMMIT');
      
      return {
        claimed_amount: claimAmount,
        new_balance: parseFloat(balance.available_balance) + claimAmount,
        transaction_id: txResult.rows[0].id
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async createWithdrawal(userId: number, amount: number, walletAddress: string): Promise<WithdrawResponse> {
    if (amount < NETWORK_INFO.MIN_WITHDRAWAL) {
      throw new Error(`Minimum withdrawal is ${NETWORK_INFO.MIN_WITHDRAWAL}`);
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const balanceResult = await client.query('SELECT available_balance FROM user_balances WHERE user_id = $1 FOR UPDATE', [userId]);
      const balance = balanceResult.rows[0];
      
      if (!balance || parseFloat(balance.available_balance) < amount) {
        throw new Error('Insufficient balance');
      }
      
      await client.query(
        'UPDATE user_balances SET available_balance = available_balance - $1, withdrawn_total = withdrawn_total + $1 WHERE user_id = $2',
        [amount, userId]
      );
      
      const withdrawal = await Withdrawal.create(userId, amount, walletAddress);
      
      await client.query('COMMIT');
      
      return {
        withdrawal_id: withdrawal.id,
        amount,
        status: withdrawal.status,
        estimated_time: new Date(Date.now() + 24 * 60 * 60 * 1000).getTime()
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async processApprovedWithdrawal(withdrawalId: number): Promise<{ success: boolean; txHash?: string }> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT w.*, u.telegram_id FROM withdrawals w JOIN users u ON w.user_id = u.id WHERE w.id = $1 AND w.status = 'pending'`,
        [withdrawalId]
      );
      const withdrawal = res.rows[0];
      if (!withdrawal) throw new Error('Withdrawal not found or already processed');

      const amountSun = Math.floor(parseFloat(withdrawal.amount) * 1e6);
      const contract = await this.tronWeb.contract().at(this.usdtContractAddress);
      const txHash = await contract.transfer(withdrawal.wallet_address, amountSun).send();

      await client.query(
        `UPDATE withdrawals SET status = 'completed', tx_hash = $1, processed_at = NOW() WHERE id = $2`,
        [txHash, withdrawalId]
      );

      if (withdrawal.telegram_id) {
        await telegramBotService.sendWithdrawalNotification(
          withdrawal.telegram_id,
          parseFloat(withdrawal.amount),
          txHash
        );
      }

      return { success: true, txHash };
    } catch (error: any) {
      await client.query(
        `UPDATE withdrawals SET status = 'failed' WHERE id = $1`,
        [withdrawalId]
      );
      throw error;
    } finally {
      client.release();
    }
  }
}

export const withdrawalService = new WithdrawalService();
