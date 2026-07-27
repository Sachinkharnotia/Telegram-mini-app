export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  is_premium: boolean;
  wallet_address?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  banned_at?: Date;
  ban_reason?: string;
}

export interface UserBalance {
  id: number;
  user_id: number;
  total_invested: number;
  available_balance: number;
  mining_balance: number;
  withdrawn_total: number;
  referral_earnings: number;
  task_earnings: number;
  last_claim_at?: Date;
  updated_at: Date;
}

export interface Deposit {
  id: number;
  user_id: number;
  amount: number;
  tx_hash?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  confirmed_at?: Date;
  created_at: Date;
  updated_at: Date;
  metadata?: any;
}

export interface MiningRecord {
  id: number;
  user_id: number;
  deposit_id?: number;
  amount: number;
  daily_rate: number;
  earned_today: number;
  total_earned: number;
  is_active: boolean;
  started_at: Date;
  ended_at?: Date;
  last_calculated_at: Date;
  updated_at: Date;
}

export interface Withdrawal {
  id: number;
  user_id: number;
  amount: number;
  wallet_address: string;
  tx_hash?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  created_at: Date;
  processed_at?: Date;
  failed_reason?: string;
}

export interface Referral {
  id: number;
  referrer_id: number;
  referred_id: number;
  tier: number;
  commission_rate: number;
  total_earned: number;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: number;
  type: 'daily_checkin' | 'gift_box' | 'spin_wheel' | 'social' | 'custom';
  title: string;
  description?: string;
  reward: number;
  metadata?: any;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserTask {
  id: number;
  user_id: number;
  task_id: number;
  completed_at?: Date;
  reward_claimed: boolean;
  claimed_at?: Date;
  metadata?: any;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'withdrawal' | 'claim' | 'referral' | 'task' | 'mining';
  amount: number;
  description?: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: Date;
  metadata?: any;
}
