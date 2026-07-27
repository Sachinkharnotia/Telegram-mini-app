import cron from 'node-cron';
import { pool } from '../config/database';
import { miningService } from '../services/mining.service';
import { Mining } from '../models';

export class MiningCalculator {
  private task: cron.ScheduledTask | null = null;
  
  start() {
    this.task = cron.schedule('*/15 * * * *', async () => {
      await this.updateAllActiveMining();
    });
    
    cron.schedule('0 0 * * *', async () => {
      await Mining.resetDailyEarnings();
    });
  }
  
  private async updateAllActiveMining() {
    try {
      const result = await pool.query('SELECT * FROM mining_records WHERE is_active = true');
      const activeRecords = result.rows;
      
      for (const record of activeRecords) {
        const hourlyRate = record.amount * (record.daily_rate / 100) / 24;
        const earned = hourlyRate * 0.25;
        
        await Mining.updateEarnings(record.id, earned);
      }
    } catch (error) {
      console.error('Error updating mining records', error);
    }
  }
  
  stop() {
    if (this.task) {
      this.task.stop();
    }
  }
}
