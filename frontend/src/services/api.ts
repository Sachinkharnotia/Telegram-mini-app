import Decimal from 'decimal.js';
import { 
  ApiResponse, 
  User, 
  DepositRecord, 
  MiningRecord, 
  ClaimRecord, 
  WithdrawalRecord, 
  ReferralInfo, 
  TaskItem, 
  TransactionItem 
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '';

class ApiService {
  private token: string | null = localStorage.getItem('access_token');

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.clearToken();
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch {
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to platform API services',
        },
      };
    }
  }

  async authenticateTelegram(initData: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>> {
    return this.request<{ accessToken: string; refreshToken: string; user: User }>('/api/auth/telegram', {
      method: 'POST',
      body: JSON.stringify({ initData }),
    });
  }

  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/api/users/profile');
  }

  async getUserBalance(): Promise<ApiResponse<{
    totalDeposited: string;
    claimedEarnings: string;
    unclaimedEarnings: string;
    availableBalance: string;
    referralCommissionsEarned: string;
  }>> {
    return this.request<{
      totalDeposited: string;
      claimedEarnings: string;
      unclaimedEarnings: string;
      availableBalance: string;
      referralCommissionsEarned: string;
    }>('/api/users/balance');
  }

  async createDeposit(amount: string): Promise<ApiResponse<{ depositId: string; walletAddress: string; amount: string; expiresAt: string }>> {
    const amountDec = new Decimal(amount);
    return this.request<{ depositId: string; walletAddress: string; amount: string; expiresAt: string }>('/api/deposits/create', {
      method: 'POST',
      body: JSON.stringify({ amount: amountDec.toFixed(8) }),
    });
  }

  async getMiningStatus(): Promise<ApiResponse<{
    accumulatedProfit: string;
    dailyEarnings: string;
    miningRate: string;
    activeDeposits: number;
    nextCalculationAt: string;
  }>> {
    return this.request<{
      accumulatedProfit: string;
      dailyEarnings: string;
      miningRate: string;
      activeDeposits: number;
      nextCalculationAt: string;
    }>('/api/mining/status');
  }

  async createClaim(miningRecordId: string, amount: string): Promise<ApiResponse<{ claimId: string; status: string; transactionHash: string }>> {
    const amountDec = new Decimal(amount);
    return this.request<{ claimId: string; status: string; transactionHash: string }>('/api/claims/create', {
      method: 'POST',
      body: JSON.stringify({ miningRecordId, amount: amountDec.toFixed(8) }),
    });
  }

  async createWithdrawal(amount: string, walletAddress: string): Promise<ApiResponse<{ withdrawalId: string; status: string; fee: string; netAmount: string }>> {
    const amountDec = new Decimal(amount);
    return this.request<{ withdrawalId: string; status: string; fee: string; netAmount: string }>('/api/withdrawals/create', {
      method: 'POST',
      body: JSON.stringify({ amount: amountDec.toFixed(8), walletAddress }),
    });
  }

  async getReferralInfo(): Promise<ApiResponse<ReferralInfo>> {
    return this.request<ReferralInfo>('/api/referrals/me');
  }

  async getAvailableTasks(): Promise<ApiResponse<{ tasks: TaskItem[] }>> {
    return this.request<{ tasks: TaskItem[] }>('/api/tasks/available');
  }

  async completeTask(taskId: string, verificationData: object = {}): Promise<ApiResponse<{ completionId: string; status: string }>> {
    return this.request<{ completionId: string; status: string }>(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ verificationData }),
    });
  }

  async calculateEstimate(depositAmount: string, days: number): Promise<ApiResponse<{
    estimatedEarnings: string;
    dailyRate: string;
    breakdown: { perDay: string; perWeek: string; perMonth: string; perYear: string };
  }>> {
    const amountDec = new Decimal(depositAmount);
    return this.request<{
      estimatedEarnings: string;
      dailyRate: string;
      breakdown: { perDay: string; perWeek: string; perMonth: string; perYear: string };
    }>('/api/calculator/estimate', {
      method: 'POST',
      body: JSON.stringify({ depositAmount: amountDec.toFixed(8), days }),
    });
  }
}

export const apiService = new ApiService();
