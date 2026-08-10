import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { pool } from '../config/database';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

export const redisConnection = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export const YIELD_QUEUE_NAME = 'yield-accrual-queue';

export const yieldQueue = new Queue(YIELD_QUEUE_NAME, {
  connection: redisConnection
});

export class YieldWorkerService {
  private worker: Worker | null = null;

  initWorker(): void {
    if (this.worker) return;

    this.worker = new Worker(
      YIELD_QUEUE_NAME,
      async (job: Job) => {
        const { userId } = job.data;
        await this.processUserYield(userId);
      },
      {
        connection: redisConnection,
        concurrency: 10
      }
    );
  }

  private async processUserYield(userId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const recordsRes = await client.query(
        `SELECT id, amount, daily_rate, last_calculated_at FROM mining_records WHERE user_id = $1 AND is_active = true FOR UPDATE`,
        [userId]
      );

      if (recordsRes.rows.length === 0) {
        await client.query('COMMIT');
        return;
      }

      let totalNewYield = 0;
      const now = new Date();

      for (const record of recordsRes.rows) {
        const lastCalc = new Date(record.last_calculated_at || now);
        const diffSeconds = Math.max(0, (now.getTime() - lastCalc.getTime()) / 1000);
        const dailyRateDecimal = parseFloat(record.daily_rate) / 100;
        const secondRate = dailyRateDecimal / 86400;
        const earned = parseFloat(record.amount) * secondRate * diffSeconds;

        if (earned > 0) {
          totalNewYield += earned;
          await client.query(
            `UPDATE mining_records SET last_calculated_at = NOW() WHERE id = $1`,
            [record.id]
          );
        }
      }

      if (totalNewYield > 0) {
        await client.query(
          `UPDATE user_balances SET mining_balance = mining_balance + $1, total_earned = total_earned + $1, updated_at = NOW() WHERE user_id = $2`,
          [totalNewYield, userId]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async scheduleYieldCalculationForAllActiveUsers(): Promise<void> {
    try {
      const activeUsersRes = await pool.query(
        `SELECT DISTINCT user_id FROM mining_records WHERE is_active = true`
      );

      for (const row of activeUsersRes.rows) {
        await yieldQueue.add(
          'accrue-yield',
          { userId: row.user_id },
          { jobId: `yield-user-${row.user_id}-${Math.floor(Date.now() / 60000)}`, removeOnComplete: true }
        );
      }
    } catch {
    }
  }

  startYieldCron(intervalMs = 60000): NodeJS.Timeout {
    this.initWorker();
    return setInterval(() => {
      this.scheduleYieldCalculationForAllActiveUsers();
    }, intervalMs);
  }
}

export const yieldWorkerService = new YieldWorkerService();
