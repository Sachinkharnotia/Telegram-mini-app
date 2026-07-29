import { Pool } from 'pg';
import { Deposit } from '../../shared/types/models';

export class DepositModel {
  constructor(private db: Pool) {}
  
  async create(userId: number, amount: number, txHash?: string): Promise<Deposit> {
    const query = `
      INSERT INTO deposits (user_id, amount, tx_hash, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *
    `;
    const result = await this.db.query(query, [userId, amount, txHash || null]);
    return result.rows[0];
  }

  async findByUserId(userId: number, limit = 20, offset = 0): Promise<Deposit[]> {
    const query = `
      SELECT * FROM deposits 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await this.db.query(query, [userId, limit, offset]);
    return result.rows;
  }
  
  async updateStatus(id: number, status: 'confirmed' | 'failed' | 'cancelled'): Promise<Deposit> {
    const query = `
      UPDATE deposits
      SET status = $1, confirmed_at = CASE WHEN $1 = 'confirmed' THEN NOW() ELSE confirmed_at END, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await this.db.query(query, [status, id]);
    return result.rows[0];
  }
}
