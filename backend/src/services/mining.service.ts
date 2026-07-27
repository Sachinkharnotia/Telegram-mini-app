import { Mining } from '../models';
import { MINING_TIERS } from '../../../shared/constants';
import { MiningStatsResponse } from '../../../shared/types/api';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

export class MiningService {
  async calculateUserMining(userId: number): Promise<MiningStatsResponse> {
    const activeDeposits = await Mining.findActiveByUserId(userId);
    let totalEarnedToday = 0;
    let totalEarned = 0;
    
    for (const deposit of activeDeposits) {
      totalEarnedToday += deposit.earned_today;
      totalEarned += deposit.total_earned;
    }
    
    const currentRate = await this.getCurrentRate();
    const nextUpdate = new Date().getTime() + 15 * 60 * 1000;
    
    return {
      currentRate,
      total_mining: totalEarned,
      earned_today: totalEarnedToday,
      next_update: nextUpdate,
      active_deposits: activeDeposits.length
    };
  }
  
  calculateEarnings(amount: number, dailyRate: number, startedAt: Date): number {
    const hoursPassed = (Date.now() - startedAt.getTime()) / (1000 * 60 * 60);
    return amount * (dailyRate / 100) * (hoursPassed / 24);
  }
  
  async getCurrentRate(): Promise<number> {
    const cachedRate = await redisClient.get('current_mining_rate');
    return cachedRate ? parseFloat(cachedRate) : MINING_TIERS.BASIC.daily_rate;
  }
}

export const miningService = new MiningService();
