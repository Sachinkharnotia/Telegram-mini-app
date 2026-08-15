import { User, UserBalance, AppSettings, RequiredCommunity, VXPurchase, Deposit, Withdrawal, Referral, Task, UserTask, Transaction, SpinSector } from '../types/models';

class DataStoreService {
  private users: Map<number, User> = new Map();
  private balances: Map<number, UserBalance> = new Map();
  private deposits: Deposit[] = [];
  private withdrawals: Withdrawal[] = [];
  private vxPurchases: VXPurchase[] = [];
  private referrals: Referral[] = [];
  private tasks: Task[] = [];
  private userTasks: UserTask[] = [];
  private transactions: Transaction[] = [];
  private requiredCommunities: RequiredCommunity[] = [];
  private spinSectors: SpinSector[] = [];

  private settings: AppSettings = {
    vx_price_usdt: 0.10,
    min_vx_purchase: 100,
    min_vx_mining: 100,
    daily_yield_rate: 0.015,
    mining_enabled: true,
    bep20_wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    ton_wallet: 'EQBvW8Z5huBkMJY78A29P0nLw84920kLzW190kLs920pL',
    min_deposit: 10,
    min_withdrawal: 3,
    max_withdrawal: 10000,
    withdrawal_fee: 1,
    auto_withdrawal: false,
    referral_commission_tier1: 0.10,
    referral_commission_tier2: 0.05,
    referral_fixed_reward: 0.50,
    referral_enabled: true,
    daily_free_spins: 1,
    spin_cost_usdt: 1,
    mandatory_join_enabled: true,
    app_name: 'VX Token Mining Vault',
    announcement_text: 'Welcome to VX Token Quantitative Mining! Buy 100+ VX to start earning continuous daily USDT yield.',
    support_username: 'VaultSupportAdmin',
    maintenance_mode: false
  };

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    this.requiredCommunities = [
      { id: 1, name: 'Main Telegram Group', link: 'https://t.me/telegram', type: 'group', is_active: true, sort_order: 1 },
      { id: 2, name: 'Official Announcement Channel', link: 'https://t.me/telegram', type: 'channel', is_active: true, sort_order: 2 }
    ];

    this.tasks = [
      { id: 1, type: 'daily_checkin', title: 'Daily Check-in Bonus', description: 'Log in daily to claim free USDT rewards', reward_amount: 0.25, reward_currency: 'USDT', action_url: '', is_active: true, max_claims: 1, sort_order: 1, created_at: new Date() },
      { id: 2, type: 'telegram_join', title: 'Join Official Channel', description: 'Join our announcement channel for instant updates', reward_amount: 1.00, reward_currency: 'USDT', action_url: 'https://t.me/telegram', is_active: true, max_claims: 1, sort_order: 2, created_at: new Date() },
      { id: 3, type: 'social_follow', title: 'Follow Announcement Channel', description: 'Stay connected with official platform updates', reward_amount: 50, reward_currency: 'VX', action_url: 'https://t.me/telegram', is_active: true, max_claims: 1, sort_order: 3, created_at: new Date() }
    ];

    this.spinSectors = [
      { id: 1, label: '0.25 USDT', reward_type: 'USDT', reward_amount: 0.25, color: '#C18DB4', probability_percent: 30 },
      { id: 2, label: '1.00 USDT', reward_type: 'USDT', reward_amount: 1.00, color: '#87A7D0', probability_percent: 20 },
      { id: 3, label: '50 VX', reward_type: 'VX', reward_amount: 50, color: '#E2CAD8', probability_percent: 25 },
      { id: 4, label: '2.50 USDT', reward_type: 'USDT', reward_amount: 2.50, color: '#27425D', probability_percent: 15 },
      { id: 5, label: '100 VX', reward_type: 'VX', reward_amount: 100, color: '#0E1B48', probability_percent: 8 },
      { id: 6, label: '10.00 USDT', reward_type: 'USDT', reward_amount: 10.00, color: '#C18DB4', probability_percent: 2 }
    ];

    const demoAdminUser: User = {
      id: 1001,
      telegram_id: 98765432,
      username: 'VaultAdmin',
      first_name: 'Investor',
      last_name: 'Pro',
      language_code: 'en',
      is_premium: true,
      is_admin: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const demoAdminBalance: UserBalance = {
      id: 1,
      user_id: 1001,
      usdt_balance: 50.00,
      vx_balance: 500,
      unclaimed_yield: 1.25,
      claimed_yield_total: 12.50,
      total_invested: 100,
      withdrawn_total: 0,
      referral_earnings: 5.00,
      task_earnings: 1.25,
      spin_earnings: 0.50,
      updated_at: new Date()
    };

    this.users.set(demoAdminUser.telegram_id, demoAdminUser);
    this.balances.set(demoAdminUser.id, demoAdminBalance);
  }

  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    this.settings = { ...this.settings, ...newSettings };
    return this.getSettings();
  }

  public findUserByTelegramId(telegramId: number): User | undefined {
    return this.users.get(telegramId);
  }

  public findUserById(id: number): User | undefined {
    for (const u of this.users.values()) {
      if (u.id === id) return u;
    }
    return undefined;
  }

  public createUser(userData: { telegram_id: number; username?: string; first_name?: string; last_name?: string; language_code?: string; is_premium?: boolean; referred_by?: number }): User {
    const id = Math.floor(100000 + Math.random() * 900000);
    const isFirstUser = this.users.size === 0;

    const newUser: User = {
      id,
      telegram_id: userData.telegram_id,
      username: userData.username,
      first_name: userData.first_name || 'Member',
      last_name: userData.last_name,
      language_code: userData.language_code || 'en',
      is_premium: !!userData.is_premium,
      is_admin: isFirstUser || userData.telegram_id === 98765432,
      is_active: true,
      referred_by: userData.referred_by,
      created_at: new Date(),
      updated_at: new Date()
    };

    const newBalance: UserBalance = {
      id: Math.floor(100000 + Math.random() * 900000),
      user_id: id,
      usdt_balance: 0,
      vx_balance: 0,
      unclaimed_yield: 0,
      claimed_yield_total: 0,
      total_invested: 0,
      withdrawn_total: 0,
      referral_earnings: 0,
      task_earnings: 0,
      spin_earnings: 0,
      updated_at: new Date()
    };

    this.users.set(userData.telegram_id, newUser);
    this.balances.set(id, newBalance);

    if (userData.referred_by && userData.referred_by !== id) {
      const referrer = this.findUserById(userData.referred_by);
      if (referrer) {
        const refRecord: Referral = {
          id: Date.now(),
          referrer_id: referrer.id,
          referred_id: id,
          tier: 1,
          commission_earned: 0,
          created_at: new Date()
        };
        this.referrals.push(refRecord);

        if (this.settings.referral_fixed_reward > 0) {
          this.creditBalance(referrer.id, this.settings.referral_fixed_reward, 'referral_earnings');
          this.addTransaction({
            id: Date.now(),
            user_id: referrer.id,
            type: 'referral_commission',
            amount: this.settings.referral_fixed_reward,
            currency: 'USDT',
            description: `Referral bonus for inviting ${newUser.first_name}`,
            status: 'completed',
            created_at: new Date()
          });
        }
      }
    }

    return newUser;
  }

  public getUserBalance(userId: number): UserBalance {
    let bal = this.balances.get(userId);
    if (!bal) {
      bal = {
        id: Date.now(),
        user_id: userId,
        usdt_balance: 0,
        vx_balance: 0,
        unclaimed_yield: 0,
        claimed_yield_total: 0,
        total_invested: 0,
        withdrawn_total: 0,
        referral_earnings: 0,
        task_earnings: 0,
        spin_earnings: 0,
        updated_at: new Date()
      };
      this.balances.set(userId, bal);
    }
    return bal;
  }

  public creditBalance(userId: number, usdtAmount: number, field: 'usdt_balance' | 'vx_balance' | 'referral_earnings' | 'task_earnings' | 'spin_earnings' = 'usdt_balance'): UserBalance {
    const bal = this.getUserBalance(userId);
    if (field === 'usdt_balance') {
      bal.usdt_balance += usdtAmount;
    } else if (field === 'vx_balance') {
      bal.vx_balance += usdtAmount;
    } else if (field === 'referral_earnings') {
      bal.referral_earnings += usdtAmount;
      bal.usdt_balance += usdtAmount;
    } else if (field === 'task_earnings') {
      bal.task_earnings += usdtAmount;
      bal.usdt_balance += usdtAmount;
    } else if (field === 'spin_earnings') {
      bal.spin_earnings += usdtAmount;
      bal.usdt_balance += usdtAmount;
    }
    bal.updated_at = new Date();
    return bal;
  }

  public deductUSDTBalance(userId: number, usdtAmount: number): boolean {
    const bal = this.getUserBalance(userId);
    if (bal.usdt_balance < usdtAmount) return false;
    bal.usdt_balance -= usdtAmount;
    bal.updated_at = new Date();
    return true;
  }

  public buyVXTokens(userId: number, vxAmount: number): { success: boolean; usdtCost: number; message: string } {
    if (vxAmount < this.settings.min_vx_purchase) {
      return { success: false, usdtCost: 0, message: `Minimum purchase is ${this.settings.min_vx_purchase} VX` };
    }

    const usdtCost = vxAmount * this.settings.vx_price_usdt;
    const success = this.deductUSDTBalance(userId, usdtCost);
    if (!success) {
      return { success: false, usdtCost, message: 'Insufficient USDT balance' };
    }

    const bal = this.getUserBalance(userId);
    bal.vx_balance += vxAmount;
    bal.updated_at = new Date();

    const purchase: VXPurchase = {
      id: Date.now(),
      user_id: userId,
      vx_amount: vxAmount,
      usdt_cost: usdtCost,
      price_per_vx: this.settings.vx_price_usdt,
      created_at: new Date()
    };
    this.vxPurchases.push(purchase);

    this.addTransaction({
      id: Date.now(),
      user_id: userId,
      type: 'vx_purchase',
      amount: vxAmount,
      currency: 'VX',
      description: `Purchased ${vxAmount} VX for $${usdtCost.toFixed(2)} USDT`,
      status: 'completed',
      created_at: new Date()
    });

    return { success: true, usdtCost, message: 'VX Tokens purchased successfully' };
  }

  public claimYield(userId: number): { success: boolean; claimedUsdt: number } {
    const bal = this.getUserBalance(userId);
    const claimed = bal.unclaimed_yield;
    if (claimed <= 0) {
      return { success: false, claimedUsdt: 0 };
    }

    bal.usdt_balance += claimed;
    bal.claimed_yield_total += claimed;
    bal.unclaimed_yield = 0;
    bal.last_claim_at = new Date();
    bal.updated_at = new Date();

    this.addTransaction({
      id: Date.now(),
      user_id: userId,
      type: 'mining_yield',
      amount: claimed,
      currency: 'USDT',
      description: `Claimed $${claimed.toFixed(4)} USDT mining yield`,
      status: 'completed',
      created_at: new Date()
    });

    return { success: true, claimedUsdt: claimed };
  }

  public accumulateYieldForAllUsers() {
    if (!this.settings.mining_enabled) return;

    for (const bal of this.balances.values()) {
      if (bal.vx_balance >= this.settings.min_vx_mining) {
        const dailyUsdt = bal.vx_balance * this.settings.vx_price_usdt * this.settings.daily_yield_rate;
        const secondUsdt = dailyUsdt / 86400;
        bal.unclaimed_yield += secondUsdt;
      }
    }
  }

  public addTransaction(tx: Transaction) {
    this.transactions.unshift(tx);
  }

  public getTransactions(userId?: number): Transaction[] {
    if (userId) {
      return this.transactions.filter(t => t.user_id === userId);
    }
    return this.transactions;
  }

  public getRequiredCommunities(): RequiredCommunity[] {
    return this.requiredCommunities.filter(c => c.is_active).sort((a, b) => a.sort_order - b.sort_order);
  }

  public getAllRequiredCommunities(): RequiredCommunity[] {
    return [...this.requiredCommunities];
  }

  public setRequiredCommunities(communities: RequiredCommunity[]) {
    this.requiredCommunities = communities;
  }

  public getTasks(): Task[] {
    return this.tasks.filter(t => t.is_active).sort((a, b) => a.sort_order - b.sort_order);
  }

  public getAllTasks(): Task[] {
    return [...this.tasks];
  }

  public saveTask(taskData: Partial<Task>): Task {
    if (taskData.id) {
      const idx = this.tasks.findIndex(t => t.id === taskData.id);
      if (idx !== -1) {
        this.tasks[idx] = { ...this.tasks[idx], ...taskData, updated_at: new Date() };
        return this.tasks[idx];
      }
    }
    const newTask: Task = {
      id: Date.now(),
      type: taskData.type || 'social_follow',
      title: taskData.title || 'New Task',
      description: taskData.description,
      reward_amount: taskData.reward_amount || 1,
      reward_currency: taskData.reward_currency || 'USDT',
      action_url: taskData.action_url || '',
      is_active: taskData.is_active !== undefined ? taskData.is_active : true,
      max_claims: taskData.max_claims || 1,
      sort_order: this.tasks.length + 1,
      created_at: new Date()
    };
    this.tasks.push(newTask);
    return newTask;
  }

  public deleteTask(taskId: number): boolean {
    const lenBefore = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    return this.tasks.length < lenBefore;
  }

  public completeTask(userId: number, taskId: number): { success: boolean; rewardAmount: number; currency: string; message: string } {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || !task.is_active) {
      return { success: false, rewardAmount: 0, currency: 'USDT', message: 'Task not found or inactive' };
    }

    const existing = this.userTasks.find(ut => ut.user_id === userId && ut.task_id === taskId);
    if (existing) {
      return { success: false, rewardAmount: 0, currency: 'USDT', message: 'Task already completed' };
    }

    this.userTasks.push({
      id: Date.now(),
      user_id: userId,
      task_id: taskId,
      completed_at: new Date(),
      reward_claimed: true
    });

    const bal = this.getUserBalance(userId);
    if (task.reward_currency === 'VX') {
      bal.vx_balance += task.reward_amount;
    } else {
      bal.usdt_balance += task.reward_amount;
      bal.task_earnings += task.reward_amount;
    }
    bal.updated_at = new Date();

    this.addTransaction({
      id: Date.now(),
      user_id: userId,
      type: 'task_reward',
      amount: task.reward_amount,
      currency: task.reward_currency,
      description: `Task reward for "${task.title}"`,
      status: 'completed',
      created_at: new Date()
    });

    return { success: true, rewardAmount: task.reward_amount, currency: task.reward_currency, message: 'Reward claimed' };
  }

  public getUserTaskIds(userId: number): number[] {
    return this.userTasks.filter(ut => ut.user_id === userId).map(ut => ut.task_id);
  }

  public getSpinSectors(): SpinSector[] {
    return [...this.spinSectors];
  }

  public spinWheel(userId: number): { success: boolean; sectorIndex: number; sector: SpinSector } {
    const idx = Math.floor(Math.random() * this.spinSectors.length);
    const sector = this.spinSectors[idx];

    const bal = this.getUserBalance(userId);
    if (sector.reward_type === 'VX') {
      bal.vx_balance += sector.reward_amount;
    } else if (sector.reward_type === 'USDT') {
      bal.usdt_balance += sector.reward_amount;
      bal.spin_earnings += sector.reward_amount;
    }

    this.addTransaction({
      id: Date.now(),
      user_id: userId,
      type: 'spin_reward',
      amount: sector.reward_amount,
      currency: sector.reward_type === 'VX' ? 'VX' : 'USDT',
      description: `Spin wheel reward: ${sector.label}`,
      status: 'completed',
      created_at: new Date()
    });

    return { success: true, sectorIndex: idx, sector };
  }

  public createDeposit(userId: number, amount: number, network: 'BEP20' | 'TON'): Deposit {
    const dep: Deposit = {
      id: Date.now(),
      user_id: userId,
      amount,
      network,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };
    this.deposits.unshift(dep);
    return dep;
  }

  public getDeposits(userId?: number): Deposit[] {
    if (userId) return this.deposits.filter(d => d.user_id === userId);
    return this.deposits;
  }

  public confirmDeposit(depositId: number, txHash?: string): Deposit | null {
    const dep = this.deposits.find(d => d.id === depositId);
    if (!dep || dep.status !== 'pending') return null;

    dep.status = 'confirmed';
    dep.tx_hash = txHash || '0x' + Math.random().toString(16).substr(2, 40);
    dep.confirmed_at = new Date();
    dep.updated_at = new Date();

    const bal = this.getUserBalance(dep.user_id);
    bal.usdt_balance += dep.amount;
    bal.total_invested += dep.amount;

    this.addTransaction({
      id: Date.now(),
      user_id: dep.user_id,
      type: 'deposit',
      amount: dep.amount,
      currency: 'USDT',
      description: `Deposit confirmed (${dep.network})`,
      status: 'completed',
      created_at: new Date()
    });

    return dep;
  }

  public createWithdrawal(userId: number, amount: number, network: 'BEP20' | 'TON', walletAddress: string): Withdrawal {
    const fee = this.settings.withdrawal_fee;
    const netAmount = Math.max(0, amount - fee);

    const success = this.deductUSDTBalance(userId, amount);
    if (!success) {
      throw new Error('Insufficient USDT balance');
    }

    const wd: Withdrawal = {
      id: Date.now(),
      user_id: userId,
      amount,
      network,
      wallet_address: walletAddress,
      fee,
      net_amount: netAmount,
      status: 'pending',
      created_at: new Date()
    };

    this.withdrawals.unshift(wd);

    this.addTransaction({
      id: Date.now(),
      user_id: userId,
      type: 'withdrawal',
      amount,
      currency: 'USDT',
      description: `Withdrawal requested (${network} to ${walletAddress.substring(0, 8)}...)`,
      status: 'pending',
      created_at: new Date()
    });

    return wd;
  }

  public getWithdrawals(userId?: number): Withdrawal[] {
    if (userId) return this.withdrawals.filter(w => w.user_id === userId);
    return this.withdrawals;
  }

  public updateWithdrawalStatus(withdrawalId: number, status: 'approved' | 'completed' | 'rejected', txHash?: string, reason?: string): Withdrawal | null {
    const wd = this.withdrawals.find(w => w.id === withdrawalId);
    if (!wd) return null;

    wd.status = status;
    if (txHash) wd.tx_hash = txHash;
    if (reason) wd.failed_reason = reason;
    wd.processed_at = new Date();

    if (status === 'rejected') {
      this.creditBalance(wd.user_id, wd.amount, 'usdt_balance');
    } else if (status === 'completed' || status === 'approved') {
      const bal = this.getUserBalance(wd.user_id);
      bal.withdrawn_total += wd.net_amount;
    }

    return wd;
  }

  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  public updateUserAdmin(userId: number, isAdmin: boolean): User | null {
    const user = this.findUserById(userId);
    if (!user) return null;
    user.is_admin = isAdmin;
    return user;
  }

  public updateUserStatus(userId: number, isActive: boolean, banReason?: string): User | null {
    const user = this.findUserById(userId);
    if (!user) return null;
    user.is_active = isActive;
    if (!isActive) {
      user.banned_at = new Date();
      user.ban_reason = banReason || 'Admin action';
    } else {
      user.banned_at = undefined;
      user.ban_reason = undefined;
    }
    return user;
  }

  public getAdminStats() {
    const allUsers = this.getAllUsers();
    let totalUsdtBalance = 0;
    let totalVxPurchased = 0;
    let totalMiningYieldPaid = 0;
    let totalReferralCommissions = 0;

    for (const bal of this.balances.values()) {
      totalUsdtBalance += bal.usdt_balance;
      totalVxPurchased += bal.vx_balance;
      totalMiningYieldPaid += bal.claimed_yield_total;
      totalReferralCommissions += bal.referral_earnings;
    }

    const totalDepositsUsdt = this.deposits
      .filter(d => d.status === 'confirmed')
      .reduce((sum, d) => sum + d.amount, 0);

    const totalWithdrawalsUsdt = this.withdrawals
      .filter(w => w.status === 'completed' || w.status === 'approved')
      .reduce((sum, w) => sum + w.net_amount, 0);

    return {
      total_users: allUsers.length,
      active_users: allUsers.filter(u => u.is_active).length,
      total_deposits_usdt: totalDepositsUsdt,
      total_withdrawals_usdt: totalWithdrawalsUsdt,
      total_usdt_balance: totalUsdtBalance,
      total_vx_purchased: totalVxPurchased,
      total_mining_yield_paid: totalMiningYieldPaid,
      total_referral_commissions: totalReferralCommissions,
      pending_withdrawals_count: this.withdrawals.filter(w => w.status === 'pending').length,
      pending_deposits_count: this.deposits.filter(d => d.status === 'pending').length
    };
  }
}

export const dataStore = new DataStoreService();
