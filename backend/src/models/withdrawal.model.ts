import { Pool } from 'pg';
import { Withdrawal } from '../../../shared/types/models';

export class WithdrawalModel {
  constructor(private db: Pool) {}
  
  async create(userId: number, amount: number, walletAddress: string): Promise<Withdrawal> {
    const query = `
      INSERT INTO withdrawals (user_id, amount, wallet_address, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *
    `;
    const result = await this.db.query(query, [userId, amount, walletAddress]);
    return result.rows[0];
  }
}
