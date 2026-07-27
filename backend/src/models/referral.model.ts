import { Pool } from 'pg';
import { Referral } from '../../shared/types/models';

export class ReferralModel {
  constructor(private db: Pool) {}
  
  async create(referrerId: number, referredId: number, tier: number, commissionRate: number): Promise<Referral> {
    const query = `
      INSERT INTO referrals (referrer_id, referred_id, tier, commission_rate)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (referrer_id, referred_id) DO NOTHING
      RETURNING *
    `;
    const result = await this.db.query(query, [referrerId, referredId, tier, commissionRate]);
    return result.rows[0];
  }

  async findByReferrerId(referrerId: number): Promise<Referral[]> {
    const query = `
      SELECT r.*, u.username, u.first_name 
      FROM referrals r
      JOIN users u ON r.referred_id = u.id
      WHERE r.referrer_id = $1
    `;
    const result = await this.db.query(query, [referrerId]);
    return result.rows;
  }
}
