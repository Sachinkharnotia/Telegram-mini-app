import { pool } from '../config/database';
import { UserModel } from './user.model';
import { DepositModel } from './deposit.model';
import { MiningModel } from './mining.model';
import { WithdrawalModel } from './withdrawal.model';
import { ReferralModel } from './referral.model';
import { TaskModel } from './task.model';
import { TransactionModel } from './transaction.model';

export const User = new UserModel(pool);
export const Deposit = new DepositModel(pool);
export const Mining = new MiningModel(pool);
export const Withdrawal = new WithdrawalModel(pool);
export const Referral = new ReferralModel(pool);
export const Task = new TaskModel(pool);
export const Transaction = new TransactionModel(pool);
