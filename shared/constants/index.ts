export const MINING_TIERS = {
  BASIC: { name: 'Basic', min_deposit: 10, daily_rate: 0.5 },
  SILVER: { name: 'Silver', min_deposit: 100, daily_rate: 1.0 },
  GOLD: { name: 'Gold', min_deposit: 1000, daily_rate: 2.0 },
  PLATINUM: { name: 'Platinum', min_deposit: 10000, daily_rate: 3.5 }
};

export const REFERRAL_TIERS = {
  1: 10.0,
  2: 5.0,
  3: 2.5
};

export const TASKS_REWARDS = {
  daily_checkin: 0.1,
  gift_box: 1.0,
  spin_wheel_max: 50.0
};

export const NETWORK_INFO = {
  USDT_DECIMALS: 6,
  MIN_DEPOSIT: 10,
  MIN_WITHDRAWAL: 20,
  WITHDRAWAL_FEE: 1
};
