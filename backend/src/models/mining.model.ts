import { Pool } from 'pg';
import { MiningRecord } from '../../shared/types/models';

export class MiningModel {
  constructor(private db: Pool) {}
  
  async create(userId: number, depositId: number, amount: number, dailyRate: number): Promise<MiningRecord> {
    const query = `
      INSERT INTO mining_records (user_id, deposit_id, amount, daily_rate, is_active)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *
    `;
    const result = await this.db.query(query, [userId, depositId, amount, dailyRate]);
    return result.rows[0];
  }

  async findActiveByUserId(userId: number): Promise<MiningRecord[]> {
    const query = `
      SELECT * FROM mining_records 
      WHERE user_id = $1 AND is_active = true
    `;
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }
  
  async updateEarnings(id: number, earned: number): Promise<MiningRecord> {
    const query = `
      UPDATE mining_records
      SET earned_today = earned_today + $1,
          total_earned = total_earned + $1,
          last_calculated_at = NOW(),
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await this.db.query(query, [earned, id]);
    return result.rows[0];
  }

  async resetDailyEarnings(): Promise<void> {
    await this.db.query(`
      UPDATE mining_records
      SET earned_today = 0
      WHERE is_active = true
    `);
  }
}
