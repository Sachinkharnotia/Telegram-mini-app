import fs from 'fs';
import path from 'path';
import { User, UserBalance, AppSettings, RequiredCommunity, VXPurchase, Deposit, Withdrawal, Referral, Task, UserTask, Transaction, SpinSector } from '../types/models';
import { pool } from '../config/database';

const DB_FILE_PATH = process.env.VERCEL
  ? path.join('/tmp', 'vextoral_db.json')
  : path.join(__dirname, '../../data/vextoral_db.json');

export class DataStoreService {
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
  private notifications: Array<{ id: number; title: string; message: string; date: string; sent_telegram: boolean; created_at: Date }> = [];

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
    withdrawal_fee: 0,
    auto_withdrawal: false,
    referral_commission_tier1: 0.10,
    referral_commission_tier2: 0.05,
    referral_commission_tier3: 0.02,
    referral_fixed_reward: 0.50,
    referral_enabled: true,
    daily_free_spins: 1,
    daily_spins_limit: 3,
    daily_giftbox_limit: 1,
    spin_cost_usdt: 1,
    mandatory_join_enabled: true,
    app_name: 'VextoralMining',
    announcement_text: 'Welcome to VX Token Quantitative Mining! Buy 100+ VX to start earning continuous daily USDT yield.',
    support_username: 'VaultSupportAdmin',
    maintenance_mode: false
  };

  constructor() {
    this.seedDefaultData();
    this.loadFromDisk();
    this.initPostgres();
  }

  private async initPostgres() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS app_state (
          key VARCHAR(255) PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await this.syncWithPostgres();
    } catch (e: any) {
      console.warn('PostgreSQL initialization skipped / error:', e.message);
    }
  }

  public async syncWithPostgres() {
    try {
      const res = await pool.query(`SELECT value FROM app_state WHERE key = 'main_store'`);
      if (res.rows.length > 0 && res.rows[0].value) {
        const data = res.rows[0].value;
        if (data.users && Array.isArray(data.users)) {
          this.users = new Map(data.users);
        }
        if (data.balances && Array.isArray(data.balances)) {
          this.balances = new Map(data.balances);
        }
        if (data.deposits) this.deposits = data.deposits;
        if (data.withdrawals) this.withdrawals = data.withdrawals;
        if (data.referrals) this.referrals = data.referrals;
        if (data.tasks) this.tasks = data.tasks;
        if (data.userTasks) this.userTasks = data.userTasks;
        if (data.transactions) this.transactions = data.transactions;
        if (data.settings) this.settings = { ...this.settings, ...data.settings };
        if (data.requiredCommunities) this.requiredCommunities = data.requiredCommunities;
        if (data.spinSectors) this.spinSectors = data.spinSectors;
        if (data.notifications) this.notifications = data.notifications;
      }
    } catch (e: any) {
      console.warn('PostgreSQL sync error:', e.message);
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const data = JSON.parse(raw);
        if (data.users) {
          this.users = new Map(data.users);
        }
        if (data.balances) {
          this.balances = new Map(data.balances);
        }
        if (data.deposits) this.deposits = data.deposits;
        if (data.withdrawals) this.withdrawals = data.withdrawals;
        if (data.referrals) this.referrals = data.referrals;
        if (data.tasks) this.tasks = data.tasks;
        if (data.userTasks) this.userTasks = data.userTasks;
        if (data.transactions) this.transactions = data.transactions;
        if (data.settings) this.settings = { ...this.settings, ...data.settings };
        if (data.requiredCommunities) this.requiredCommunities = data.requiredCommunities;
        if (data.spinSectors) this.spinSectors = data.spinSectors;
        if (data.notifications) this.notifications = data.notifications;
      }
    } catch (e) {
      console.warn('Could not load persistent database:', e);
    }
  }

  public saveToDisk() {
    const data = {
      users: Array.from(this.users.entries()),
      balances: Array.from(this.balances.entries()),
      deposits: this.deposits,
      withdrawals: this.withdrawals,
      referrals: this.referrals,
      tasks: this.tasks,
      userTasks: this.userTasks,
      transactions: this.transactions,
      settings: this.settings,
      requiredCommunities: this.requiredCommunities,
      spinSectors: this.spinSectors,
      notifications: this.notifications
    };

    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not save persistent database:', e);
    }

    try {
      pool.query(`
        INSERT INTO app_state (key, value, updated_at) 
        VALUES ('main_store', $1, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `, [JSON.stringify(data)]).catch((err: any) => console.warn('PG background save warn:', err.message));
    } catch {}
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
      created_at: new Date('2026-08-18T10:00:00Z'),
      updated_at: new Date('2026-08-18T10:00:00Z')
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
      last_claim_at: new Date(),
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
    this.saveToDisk();
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

  public syncUserFromClient(userData: {
    telegram_id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    language_code?: string;
    is_premium?: boolean;
    referred_by?: number;
    balance_usdt?: number;
    balance_vx?: number;
  }): { user: User; balance: UserBalance } {
    let user = this.findUserByTelegramId(userData.telegram_id);
    if (!user) {
      user = this.createUser({
        telegram_id: userData.telegram_id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        language_code: userData.language_code,
        is_premium: userData.is_premium,
        referred_by: userData.referred_by
      });
    } else {
      if (userData.username) user.username = userData.username;
      if (userData.first_name) user.first_name = userData.first_name;
      user.updated_at = new Date();
    }

    const bal = this.getUserBalance(user.id);
    if (userData.balance_usdt !== undefined && userData.balance_usdt > bal.usdt_balance) {
      bal.usdt_balance = userData.balance_usdt;
    }
    if (userData.balance_vx !== undefined && userData.balance_vx > bal.vx_balance) {
      bal.vx_balance = userData.balance_vx;
    }
    this.saveToDisk();
    return { user, balance: bal };
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
      last_claim_at: new Date(),
      updated_at: new Date()
    };

    this.users.set(userData.telegram_id, newUser);
    this.balances.set(id, newBalance);

    if (userData.referred_by && userData.referred_by !== id) {
      const referrer = this.findUserById(userData.referred_by) || this.findUserByTelegramId(userData.referred_by);
      if (referrer && referrer.id !== id) {
        newUser.referred_by = referrer.id;
        const refRecord: Referral = {
          id: Date.now(),
          referrer_id: referrer.id,
          referred_id: id,
          tier: 1,
          commission_earned: 0,
          created_at: new Date()
        };
        this.referrals.push(refRecord);

        const bonus = (this.settings as any).referral_fixed_reward || (this.settings as any).referral_signup_bonus_usdt || 0.50;
        if (bonus > 0) {
          this.creditBalance(referrer.id, bonus, 'referral_earnings');
          this.addTransaction({
            id: Date.now(),
            user_id: referrer.id,
            type: 'referral_commission',
            amount: bonus,
            currency: 'USDT',
            description: `Referral bonus for inviting ${newUser.first_name}`,
            status: 'completed',
            created_at: new Date()
          });
        }
      }
    }

    this.saveToDisk();
    return newUser;
  }

  public calculateDynamicYield(bal: UserBalance) {
    if (!this.settings.mining_enabled || bal.vx_balance < this.settings.min_vx_mining) return;
    const now = Date.now();
    const lastTime = bal.last_claim_at ? new Date(bal.last_claim_at).getTime() : now;
    const elapsedSeconds = Math.max(0, (now - lastTime) / 1000);
    if (elapsedSeconds > 0) {
      const dailyRate = this.settings.daily_yield_rate; 
      const dailyUsdt = bal.vx_balance * this.settings.vx_price_usdt * dailyRate;
      const perSecond = dailyUsdt / 86400;
      bal.unclaimed_yield = parseFloat((bal.unclaimed_yield + elapsedSeconds * perSecond).toFixed(6));
      bal.last_claim_at = new Date(now);
    }
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
        last_claim_at: new Date(),
        updated_at: new Date()
      };
      this.balances.set(userId, bal);
    } else {
      this.calculateDynamicYield(bal);
    }
    return bal;
  }

  public creditBalance(userId: number, usdtAmount: number, field: 'usdt_balance' | 'vx_balance' | 'referral_earnings' | 'task_earnings' | 'spin_earnings' = 'usdt_balance'): UserBalance {
    const bal = this.getUserBalance(userId);
    if (field === 'usdt_balance') {
      bal.usdt_balance = parseFloat((bal.usdt_balance + usdtAmount).toFixed(4));
    } else if (field === 'vx_balance') {
      bal.vx_balance = parseFloat((bal.vx_balance + usdtAmount).toFixed(2));
    } else if (field === 'referral_earnings') {
      bal.referral_earnings = parseFloat((bal.referral_earnings + usdtAmount).toFixed(4));
      bal.usdt_balance = parseFloat((bal.usdt_balance + usdtAmount).toFixed(4));
    } else if (field === 'task_earnings') {
      bal.task_earnings = parseFloat((bal.task_earnings + usdtAmount).toFixed(4));
      bal.usdt_balance = parseFloat((bal.usdt_balance + usdtAmount).toFixed(4));
    } else if (field === 'spin_earnings') {
      bal.spin_earnings = parseFloat((bal.spin_earnings + usdtAmount).toFixed(4));
      bal.usdt_balance = parseFloat((bal.usdt_balance + usdtAmount).toFixed(4));
    }
    bal.updated_at = new Date();
    this.saveToDisk();
    return bal;
  }

  public deductUSDTBalance(userId: number, usdtAmount: number): boolean {
    const bal = this.getUserBalance(userId);
    if (bal.usdt_balance < usdtAmount) return false;
    bal.usdt_balance = parseFloat((bal.usdt_balance - usdtAmount).toFixed(4));
    bal.updated_at = new Date();
    this.saveToDisk();
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
    bal.vx_balance = parseFloat((bal.vx_balance + vxAmount).toFixed(2));
    bal.total_invested = parseFloat((bal.total_invested + usdtCost).toFixed(2));
    bal.updated_at = new Date();

    this.addTransaction({
      id: Date.now(),
      user_id: userId,
      type: 'mining_yield',
      amount: vxAmount,
      currency: 'VX',
      description: `Purchased ${vxAmount} VX Tokens for $${usdtCost.toFixed(2)} USDT`,
      status: 'completed',
      created_at: new Date()
    });

    this.saveToDisk();
    return { success: true, usdtCost, message: 'VX Tokens purchased successfully' };
  }

  public claimYield(userId: number): { success: boolean; claimedUsdt: number } {
    const bal = this.getUserBalance(userId);
    const claimed = bal.unclaimed_yield;
    if (claimed <= 0) {
      return { success: false, claimedUsdt: 0 };
    }

    bal.usdt_balance = parseFloat((bal.usdt_balance + claimed).toFixed(4));
    bal.claimed_yield_total = parseFloat((bal.claimed_yield_total + claimed).toFixed(4));
    bal.unclaimed_yield = 0;
    bal.last_claim_at = new Date();
    bal.updated_at = new Date();

    this.addTransaction({
      id: Date.now(),
      user_id: userId,
      type: 'mining_yield',
      amount: claimed,
      currency: 'USDT',
      description: `Claimed daily mining yield: $${claimed.toFixed(4)} USDT`,
      status: 'completed',
      created_at: new Date()
    });

    this.saveToDisk();
    return { success: true, claimedUsdt: claimed };
  }

  public addTransaction(tx: Transaction) {
    this.transactions.unshift(tx);
    this.saveToDisk();
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
    this.saveToDisk();
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
        this.saveToDisk();
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
    this.saveToDisk();
    return newTask;
  }

  public deleteTask(taskId: number): boolean {
    const lenBefore = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveToDisk();
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
      bal.vx_balance = parseFloat((bal.vx_balance + task.reward_amount).toFixed(2));
    } else {
      bal.usdt_balance = parseFloat((bal.usdt_balance + task.reward_amount).toFixed(4));
      bal.task_earnings = parseFloat((bal.task_earnings + task.reward_amount).toFixed(4));
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

    this.saveToDisk();
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
      bal.vx_balance = parseFloat((bal.vx_balance + sector.reward_amount).toFixed(2));
    } else if (sector.reward_type === 'USDT') {
      bal.usdt_balance = parseFloat((bal.usdt_balance + sector.reward_amount).toFixed(4));
      bal.spin_earnings = parseFloat((bal.spin_earnings + sector.reward_amount).toFixed(4));
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

    this.saveToDisk();
    return { success: true, sectorIndex: idx, sector };
  }

  public createDeposit(userId: number, amount: number, network: 'BEP20' | 'TON', walletAddress?: string, customId?: number | string, orderId?: string): Deposit {
    const numericId = typeof customId === 'number' ? customId : (customId ? parseInt(String(customId).replace(/\D/g, ''), 10) || Date.now() : Date.now());
    const now = Date.now();

    const existing = this.deposits.find(d => 
      d.id === numericId || 
      (d.order_id && (d.order_id === orderId || d.order_id === String(customId))) ||
      (d.user_id === userId && Math.abs(d.amount - amount) < 0.01 && d.network === network && Math.abs(now - new Date(d.created_at).getTime()) < 60000)
    );

    if (existing) {
      return existing;
    }

    const dep: Deposit = {
      id: numericId,
      order_id: orderId || `DEP-${numericId}`,
      user_id: userId,
      amount,
      network,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };
    this.deposits.unshift(dep);
    this.saveToDisk();
    return dep;
  }

  public getDeposits(userId?: number): Deposit[] {
    const list = userId ? this.deposits.filter(d => d.user_id === userId) : this.deposits;
    
    const finalizedMap = new Map<string, Deposit>();
    const seenFuzzy = new Set<string>();
    const pendingMap = new Map<string, Deposit>();

    for (const d of list) {
      if (!d) continue;
      const dTime = new Date(d.created_at).getTime();
      const bucket = Math.floor(dTime / 120000);
      const fuzzyKey = `${d.user_id}_${Number(d.amount).toFixed(2)}_${d.network}_${bucket}`;

      if (d.status === 'confirmed' || d.status === 'rejected') {
        finalizedMap.set(fuzzyKey, d);
        finalizedMap.set(String(d.id), d);
        seenFuzzy.add(fuzzyKey);
      }
    }

    for (const d of list) {
      if (!d) continue;
      if (d.status !== 'confirmed' && d.status !== 'rejected') {
        const dTime = new Date(d.created_at).getTime();
        const bucket = Math.floor(dTime / 120000);
        const fuzzyKey = `${d.user_id}_${Number(d.amount).toFixed(2)}_${d.network}_${bucket}`;

        if (!seenFuzzy.has(fuzzyKey)) {
          seenFuzzy.add(fuzzyKey);
          pendingMap.set(String(d.id), d);
        }
      }
    }

    const finalMap = new Map<string, Deposit>();
    for (const v of finalizedMap.values()) {
      finalMap.set(String(v.id), v);
    }
    for (const [k, v] of pendingMap.entries()) {
      if (!finalMap.has(k)) finalMap.set(k, v);
    }

    const res = Array.from(finalMap.values());
    res.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return res;
  }

  public confirmDeposit(depositId: number, txHash?: string): Deposit | null {
    const dep = this.deposits.find(d => d.id === depositId || (d.order_id && d.order_id === `DEP-${depositId}`));
    if (!dep) return null;

    dep.status = 'confirmed';
    dep.tx_hash = txHash || '0x' + Math.random().toString(16).substr(2, 40);
    dep.confirmed_at = new Date();
    dep.updated_at = new Date();

    const dTime = new Date(dep.created_at).getTime();
    const bucket = Math.floor(dTime / 120000);

    // Purge any ghost duplicates matching the same user, amount, network, and time window
    this.deposits = this.deposits.filter(d => {
      if (d.id === dep.id || d.status === 'confirmed' || d.status === 'rejected') return true;
      const otherTime = new Date(d.created_at).getTime();
      const otherBucket = Math.floor(otherTime / 120000);
      const isGhost = d.user_id === dep.user_id && Math.abs(d.amount - dep.amount) < 0.01 && d.network === dep.network && Math.abs(otherBucket - bucket) <= 1;
      return !isGhost;
    });

    const bal = this.getUserBalance(dep.user_id);
    bal.usdt_balance = parseFloat((bal.usdt_balance + dep.amount).toFixed(4));
    bal.total_invested = parseFloat((bal.total_invested + dep.amount).toFixed(2));

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

    this.saveToDisk();
    return dep;
  }

  public rejectDeposit(depositId: number, reason?: string): Deposit | null {
    const dep = this.deposits.find(d => d.id === depositId || (d.order_id && d.order_id === `DEP-${depositId}`));
    if (!dep) return null;

    dep.status = 'rejected';
    dep.updated_at = new Date();

    const dTime = new Date(dep.created_at).getTime();
    const bucket = Math.floor(dTime / 120000);

    // Purge or update any matching pending ghost duplicates
    for (const d of this.deposits) {
      if (d.status === 'pending') {
        const otherTime = new Date(d.created_at).getTime();
        const otherBucket = Math.floor(otherTime / 120000);
        if (d.user_id === dep.user_id && Math.abs(d.amount - dep.amount) < 0.01 && d.network === dep.network && Math.abs(otherBucket - bucket) <= 1) {
          d.status = 'rejected';
          d.updated_at = new Date();
        }
      }
    }

    this.saveToDisk();
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

    this.saveToDisk();
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
      bal.withdrawn_total = parseFloat((bal.withdrawn_total + wd.net_amount).toFixed(2));
    }

    this.saveToDisk();
    return wd;
  }

  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  public updateUserAdmin(userId: number, isAdmin: boolean): User | null {
    const user = this.findUserById(userId);
    if (!user) return null;
    user.is_admin = isAdmin;
    this.saveToDisk();
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
    this.saveToDisk();
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
      total_usdt_balance: parseFloat(totalUsdtBalance.toFixed(2)),
      total_vx_purchased: parseFloat(totalVxPurchased.toFixed(2)),
      total_mining_yield_paid: parseFloat(totalMiningYieldPaid.toFixed(2)),
      total_referral_commissions: parseFloat(totalReferralCommissions.toFixed(2)),
      pending_withdrawals_count: this.withdrawals.filter(w => w.status === 'pending').length,
      pending_deposits_count: this.deposits.filter(d => d.status === 'pending').length
    };
  }

  public addNotification(title: string, message: string, sentTelegram: boolean = false) {
    const notif = {
      id: Date.now(),
      title,
      message,
      date: new Date().toLocaleDateString(),
      sent_telegram: sentTelegram,
      created_at: new Date()
    };
    this.notifications.unshift(notif);
    this.saveToDisk();
    return notif;
  }

  public getNotifications() {
    return [...this.notifications];
  }

  public linkReferral(referrerId: number, referredId: number) {
    if (referrerId === referredId) return;
    const referrer = this.findUserById(referrerId) || this.findUserByTelegramId(referrerId);
    const referred = this.findUserById(referredId) || this.findUserByTelegramId(referredId);
    if (!referrer || !referred || referrer.id === referred.id) return;

    referred.referred_by = referrer.id;

    const exists = this.referrals.some(r => 
      (r.referrer_id === referrer.id || r.referrer_id === referrer.telegram_id) && 
      (r.referred_id === referred.id || r.referred_id === referred.telegram_id)
    );

    if (!exists) {
      this.referrals.push({
        id: Date.now(),
        referrer_id: referrer.id,
        referred_id: referred.id,
        tier: 1,
        commission_earned: 0,
        created_at: new Date()
      });

      const bonus = (this.settings as any).referral_fixed_reward || (this.settings as any).referral_signup_bonus_usdt || 0.50;
      if (bonus > 0) {
        this.creditBalance(referrer.id, bonus, 'referral_earnings');
        this.addTransaction({
          id: Date.now(),
          user_id: referrer.id,
          type: 'referral_commission',
          amount: bonus,
          currency: 'USDT',
          description: `Referral bonus for inviting ${referred.first_name || 'Member'}`,
          status: 'completed',
          created_at: new Date()
        });
      }
    }
    this.saveToDisk();
  }

  public getReferralStats(userId: number) {
    const user = this.findUserById(userId) || this.findUserByTelegramId(userId);
    const targetUserId = user?.id || userId;
    const targetTgId = user?.telegram_id;

    const refUserIds = new Set<number>();
    const directRefs: User[] = [];

    for (const u of this.users.values()) {
      if (u.id === targetUserId || (targetTgId && u.telegram_id === targetTgId)) continue;
      const isReferred = u.referred_by === targetUserId || (targetTgId && u.referred_by === targetTgId);
      if (isReferred && !refUserIds.has(u.id)) {
        refUserIds.add(u.id);
        directRefs.push(u);
      }
    }

    for (const r of this.referrals) {
      const isMatch = r.referrer_id === targetUserId || (targetTgId && r.referrer_id === targetTgId);
      if (isMatch) {
        const u = this.findUserById(r.referred_id) || this.findUserByTelegramId(r.referred_id);
        if (u && u.id !== targetUserId && !refUserIds.has(u.id)) {
          refUserIds.add(u.id);
          directRefs.push(u);
        }
      }
    }

    const bal = this.getUserBalance(targetUserId);

    return {
      direct_referrals: directRefs.length,
      total_referrals: directRefs.length,
      total_earned: bal.referral_earnings,
      list: directRefs.map(u => ({
        id: u.id,
        telegram_id: u.telegram_id,
        first_name: u.first_name,
        username: u.username,
        joined: u.created_at
      }))
    };
  }
}

export const dataStore = new DataStoreService();
