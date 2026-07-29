import { Pool } from 'pg';
import { Withdrawal } from '../../shared/types/models';

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

  async findByUserId(userId: number, limit = 20, offset = 0): Promise<Withdrawal[]> {
    const query = `
      SELECT * FROM withdrawals 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await this.db.query(query, [userId, limit, offset]);
    return result.rows;
  }
}
