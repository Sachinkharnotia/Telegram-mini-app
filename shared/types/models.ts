export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  is_premium: boolean;
  photo_url?: string;
  wallet_address?: string;
  is_admin: boolean;
  is_active: boolean;
  banned_at?: Date | string;
  ban_reason?: string;
  referred_by?: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface UserBalance {
  id: number;
  user_id: number;
  usdt_balance: number;
  vx_balance: number;
  unclaimed_yield: number;
  claimed_yield_total: number;
  total_invested: number;
  withdrawn_total: number;
  referral_earnings: number;
  task_earnings: number;
  spin_earnings: number;
  last_claim_at?: Date | string;
  updated_at: Date | string;
}

export interface AppSettings {
  vx_price_usdt: number;
  min_vx_purchase: number;
  min_vx_mining: number;
  daily_yield_rate: number;
  mining_enabled: boolean;
  bep20_wallet: string;
  ton_wallet: string;
  min_deposit: number;
  min_withdrawal: number;
  max_withdrawal: number;
  withdrawal_fee: number;
  auto_withdrawal: boolean;
  referral_commission_tier1: number;
  referral_commission_tier2: number;
  referral_fixed_reward: number;
  referral_enabled: boolean;
  daily_free_spins: number;
  spin_cost_usdt: number;
  mandatory_join_enabled: boolean;
  app_name: string;
  announcement_text: string;
  support_username: string;
  maintenance_mode: boolean;
}

export interface RequiredCommunity {
  id: number;
  name: string;
  link: string;
  chat_id?: string;
  type: 'channel' | 'group';
  is_active: boolean;
  sort_order: number;
}

export interface VXPurchase {
  id: number;
  user_id: number;
  vx_amount: number;
  usdt_cost: number;
  price_per_vx: number;
  created_at: Date | string;
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
  started_at: Date | string;
  ended_at?: Date | string;
  last_calculated_at: Date | string;
  updated_at: Date | string;
}

export interface Deposit {
  id: number;
  user_id: number;
  amount: number;
  network: 'BEP20' | 'TON' | 'TRC20';
  tx_hash?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'failed';
  confirmed_at?: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Withdrawal {
  id: number;
  user_id: number;
  amount: number;
  network: 'BEP20' | 'TON';
  wallet_address: string;
  fee: number;
  net_amount: number;
  tx_hash?: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'failed';
  created_at: Date | string;
  processed_at?: Date | string;
  failed_reason?: string;
}

export interface Referral {
  id: number;
  referrer_id: number;
  referred_id: number;
  tier: number;
  commission_earned: number;
  total_earned?: number;
  created_at: Date | string;
}

export interface Task {
  id: number;
  type: 'telegram_join' | 'social_follow' | 'custom_visit' | 'daily_checkin';
  title: string;
  description?: string;
  reward_amount: number;
  reward_currency: 'USDT' | 'VX';
  action_url?: string;
  is_active: boolean;
  max_claims: number;
  sort_order: number;
  created_at: Date | string;
  updated_at?: Date | string;
}

export interface UserTask {
  id: number;
  user_id: number;
  task_id: number;
  completed_at: Date | string;
  reward_claimed: boolean;
}

export interface SpinSector {
  id: number;
  label: string;
  reward_type: 'USDT' | 'VX' | 'SPIN';
  reward_amount: number;
  color: string;
  probability_percent: number;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'withdrawal' | 'vx_purchase' | 'mining_yield' | 'referral_commission' | 'task_reward' | 'spin_reward' | 'admin_adjustment';
  amount: number;
  currency: 'USDT' | 'VX';
  description?: string;
  status: 'completed' | 'pending' | 'failed';
  reference_id?: string;
  created_at: Date | string;
}
