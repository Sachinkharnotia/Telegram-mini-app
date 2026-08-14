import { User, UserBalance, AppSettings, RequiredCommunity, SpinSector } from './models';

export interface AuthResponse {
  access_token: string;
  user: User;
  balance: UserBalance;
  settings: AppSettings;
  required_communities: RequiredCommunity[];
  is_new: boolean;
}

export interface MiningStatsResponse {
  current_rate: number;
  total_mining: number;
  earned_today: number;
  next_update: number;
  active_deposits: number;
}

export interface BalanceResponse {
  total_invested: number;
  available_balance: number;
  mining_balance: number;
  withdrawn_total: number;
  referral_earnings: number;
  task_earnings: number;
}

export interface DepositCreateResponse {
  deposit_id: number;
  wallet_address: string;
  amount: number;
  expires_at: number;
  network: string;
}

export interface ClaimResponse {
  claimed_amount: number;
  new_balance: number;
  transaction_id: number;
}

export interface WithdrawResponse {
  withdrawal_id: number;
  amount: number;
  status: string;
  estimated_time: number;
}

export interface ReferralStatsResponse {
  total_referrals: number;
  total_earned: number;
  active_referrals: number;
  tier_structure: Record<number, number>;
}

export interface BuyVXRequest {
  vx_amount: number;
}

export interface BuyVXResponse {
  success: boolean;
  vx_amount: number;
  usdt_cost: number;
  new_usdt_balance: number;
  new_vx_balance: number;
  transaction_id: number;
}

export interface SpinWheelResponse {
  success: boolean;
  sector_index: number;
  reward_type: 'USDT' | 'VX' | 'SPIN';
  reward_amount: number;
  prize_label: string;
  new_usdt_balance: number;
  new_vx_balance: number;
}

export interface AdminStatsResponse {
  total_users: number;
  active_users: number;
  total_deposits_usdt: number;
  total_withdrawals_usdt: number;
  total_usdt_balance: number;
  total_vx_purchased: number;
  total_mining_yield_paid: number;
  total_referral_commissions: number;
  pending_withdrawals_count: number;
  pending_deposits_count: number;
}
