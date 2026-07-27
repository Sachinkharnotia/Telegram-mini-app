import { Deposit, Mining, User } from '../models';
import { MINING_TIERS } from '../../../shared/constants';
import { DepositCreateResponse } from '../../../shared/types/api';
import { pool } from '../config/database';

export class DepositService {
  async createDeposit(userId: number, amount: number): Promise<DepositCreateResponse> {
    const user = await User.findById(userId);
    if (!user || !user.wallet_address) {
      throw new Error('User or wallet address not found');
    }
    
    const deposit = await Deposit.create(userId, amount);
    
    return {
      deposit_id: deposit.id,
      wallet_address: user.wallet_address,
      amount,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).getTime(),
      network: 'TRC20'
    };
  }
  
  async getUserDeposits(userId: number, limit: number, offset: number) {
    return await Deposit.findByUserId(userId, limit, offset);
  }

  async confirmDeposit(depositId: number, txHash: string) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const updateResult = await client.query(
        `UPDATE deposits SET status = 'confirmed', tx_hash = $1, confirmed_at = NOW() WHERE id = $2 AND status = 'pending' RETURNING *`,
        [txHash, depositId]
      );
      
      const deposit = updateResult.rows[0];
      if (!deposit) throw new Error('Deposit not found or already processed');
      
      const rate = this.getRateForAmount(deposit.amount);
      
      await client.query(
        `INSERT INTO mining_records (user_id, deposit_id, amount, daily_rate, is_active) VALUES ($1, $2, $3, $4, true)`,
        [deposit.user_id, deposit.id, deposit.amount, rate]
      );
      
      await client.query(
        `UPDATE user_balances SET total_invested = total_invested + $1, updated_at = NOW() WHERE user_id = $2`,
        [deposit.amount, deposit.user_id]
      );
      
      await client.query('COMMIT');
      return deposit;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private getRateForAmount(amount: number): number {
    if (amount >= MINING_TIERS.PLATINUM.min_deposit) return MINING_TIERS.PLATINUM.daily_rate;
    if (amount >= MINING_TIERS.GOLD.min_deposit) return MINING_TIERS.GOLD.daily_rate;
    if (amount >= MINING_TIERS.SILVER.min_deposit) return MINING_TIERS.SILVER.daily_rate;
    return MINING_TIERS.BASIC.daily_rate;
  }
}

export const depositService = new DepositService();
