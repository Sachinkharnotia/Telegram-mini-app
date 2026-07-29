import { Withdrawal, User } from '../models';
import { WithdrawResponse, ClaimResponse } from '../../../shared/types/api';
import { pool } from '../config/database';
import { NETWORK_INFO } from '../../../shared/constants';

export class WithdrawalService {
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
      
      const claimAmount = amount || balance.mining_balance;
      
      if (claimAmount <= 0 || claimAmount > balance.mining_balance) {
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
}

export const withdrawalService = new WithdrawalService();
