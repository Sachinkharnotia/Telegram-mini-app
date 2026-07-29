import { Referral, User } from '../models';
import { ReferralStatsResponse } from '../../../shared/types/api';
import { REFERRAL_TIERS } from '../../../shared/constants';
import { pool } from '../config/database';

export class ReferralService {
  async processReferralCommission(referredUserId: number, depositAmount: number) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      let currentUserId = referredUserId;
      let currentTier = 1;
      
      while (currentTier <= 3) {
        const result = await client.query('SELECT referrer_id FROM referrals WHERE referred_id = $1', [currentUserId]);
        if (result.rows.length === 0) break;
        
        const referrerId = result.rows[0].referrer_id;
        const rate = REFERRAL_TIERS[currentTier as keyof typeof REFERRAL_TIERS];
        const commission = depositAmount * (rate / 100);
        
        await client.query(
          'UPDATE user_balances SET referral_earnings = referral_earnings + $1, available_balance = available_balance + $1 WHERE user_id = $2',
          [commission, referrerId]
        );
        
        await client.query(
          'UPDATE referrals SET total_earned = total_earned + $1 WHERE referrer_id = $2 AND referred_id = $3',
          [commission, referrerId, currentUserId]
        );
        
        await client.query(
          'INSERT INTO transactions (user_id, type, amount, status, description) VALUES ($1, $2, $3, $4, $5)',
          [referrerId, 'referral', commission, 'completed', `Tier ${currentTier} commission`]
        );
        
        currentUserId = referrerId;
        currentTier++;
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing referral commission', error);
    } finally {
      client.release();
    }
  }

  async getReferralStats(userId: number): Promise<ReferralStatsResponse> {
    const referrals = await Referral.findByReferrerId(userId);
    
    const stats = {
      total_referrals: referrals.length,
      total_earned: referrals.reduce((sum, ref) => sum + parseFloat(ref.total_earned.toString()), 0),
      active_referrals: referrals.filter(r => parseFloat(r.total_earned.toString()) > 0).length,
      tier_structure: REFERRAL_TIERS
    };
    
    return stats;
  }
}

export const referralService = new ReferralService();
