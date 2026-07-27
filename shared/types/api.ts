import { User, UserBalance, Deposit, Withdrawal, Referral, Transaction, MiningRecord, Task, UserTask } from './models';

export interface AuthResponse {
  access_token: string;
  user: User;
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
