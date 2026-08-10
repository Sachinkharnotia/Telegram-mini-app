import { Pool } from 'pg';
import { MiningRecord } from '../../../shared/types/models';

export class MiningModel {
  constructor(private db: Pool) {}
  
  async findActiveByUserId(userId: number): Promise<MiningRecord[]> {
    const query = `
      SELECT * FROM mining_records 
      WHERE user_id = $1 AND is_active = true
    `;
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }
}
