import { Pool } from 'pg';
import { Transaction } from '../../../shared/types/models';

export class TransactionModel {
  constructor(private db: Pool) {}
  
  async findByUserId(userId: number, limit = 20, offset = 0): Promise<Transaction[]> {
    const query = `
      SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3
    `;
    const result = await this.db.query(query, [userId, limit, offset]);
    return result.rows;
  }
}
