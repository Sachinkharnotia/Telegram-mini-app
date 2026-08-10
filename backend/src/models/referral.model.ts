import { Pool } from 'pg';
import { Referral } from '../../../shared/types/models';

export class ReferralModel {
  constructor(private db: Pool) {}
  
  async findByReferrerId(referrerId: number): Promise<Referral[]> {
    const query = `
      SELECT * FROM referrals WHERE referrer_id = $1
    `;
    const result = await this.db.query(query, [referrerId]);
    return result.rows;
  }
}
