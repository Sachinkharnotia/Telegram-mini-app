export type UserStatus = 'active' | 'suspended' | 'banned';
export type KYCLevel = 'none' | 'basic' | 'full';

export interface KYCInfo {
  verified: boolean;
  level: KYCLevel;
  submittedAt?: string;
}

export interface User {
  id: string | number;
  telegramId?: string | number;
  telegram_id?: string | number;
  username?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  photoUrl?: string;
  walletAddress?: string;
  wallet_address?: string;
  status?: UserStatus;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  referredBy?: string;
  referrer_name?: string;
  isAdmin?: boolean;
  is_premium?: boolean;
  lastLoginAt?: string;
  kyc?: KYCInfo;
  token_balance?: number;
  unclaimed_profit?: number;
  balance?: number;
  referral_count?: number;
  referral_earnings?: number;
}

export type DepositStatus = 'pending' | 'confirmed' | 'failed';

export interface DepositRecord {
  id: string;
  userId: string;
  amount: string;
  transactionHash?: string;
  walletAddress: string;
  status: DepositStatus;
  confirmations: number;
  createdAt: string;
  confirmedAt?: string;
  miningStartDate?: string;
}

export type MiningRecordStatus = 'active' | 'paused' | 'claimed';

export interface MiningRecord {
  id: string;
  userId: string;
  depositId: string;
  accumulatedProfit: string;
  claimedProfit: string;
  unclaimedProfit: string;
  miningRate: string;
  lastCalculatedAt: string;
  status: MiningRecordStatus;
  createdAt: string;
}

export type ClaimStatus = 'pending' | 'processed' | 'failed';

export interface ClaimRecord {
  id: string;
  userId: string;
  amount: string;
  miningRecordId: string;
  transactionHash?: string;
  status: ClaimStatus;
  processedAt?: string;
  createdAt: string;
}

export type WithdrawalStatus = 'pending' | 'processing' | 'confirmed' | 'failed';

export interface WithdrawalRecord {
  id: string;
  userId: string;
  amount: string;
  walletAddress: string;
  transactionHash?: string;
  status: WithdrawalStatus;
  fee: string;
  netAmount: string;
  createdAt: string;
  processedAt?: string;
  confirmedAt?: string;
}

export interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  totalEarnings: string;
  activeReferrals: number;
  tierBreakdown: {
    level1: number;
    level2: number;
  };
}

export type TaskType = 'daily_checkin' | 'social_follow' | 'task_channel' | 'video_watch' | 'invite_friends';
export type RewardCurrency = 'USDT' | 'VA_Token';
export type TaskStatus = 'active' | 'inactive' | 'archived';

export interface TaskItem {
  id: string;
  taskType: TaskType;
  title: string;
  description: string;
  rewardAmount: string;
  rewardCurrency: RewardCurrency;
  maxClaimsPerDay: number;
  maxClaimsPerUser: number;
  status: TaskStatus;
  completed?: boolean;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'claim' | 'referral_commission' | 'task_reward';

export interface TransactionItem {
  id: string;
  userId: string;
  transactionType: TransactionType;
  amount: string;
  referencedId?: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}
