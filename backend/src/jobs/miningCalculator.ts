import cron from 'node-cron';
import { pool } from '../config/database';

export class MiningCalculator {
  private task: cron.ScheduledTask | null = null;
  
  start() {
    this.task = cron.schedule('*/15 * * * *', async () => {
      await this.updateAllActiveMining();
    });
    
    cron.schedule('0 0 * * *', async () => {
      try {
        await pool.query('UPDATE mining_records SET earned_today = 0');
      } catch {
      }
    });
  }
  
  private async updateAllActiveMining() {
    try {
      const result = await pool.query('SELECT * FROM mining_records WHERE is_active = true');
      const activeRecords = result.rows;
      
      for (const record of activeRecords) {
        const hourlyRate = parseFloat(record.amount) * (parseFloat(record.daily_rate) / 100) / 24;
        const earned = hourlyRate * 0.25;
        
        await pool.query(
          'UPDATE mining_records SET earned_today = earned_today + $1, total_earned = total_earned + $1, last_calculated_at = NOW() WHERE id = $2',
          [earned, record.id]
        );
      }
    } catch {
    }
  }
  
  stop() {
    if (this.task) {
      this.task.stop();
    }
  }
}
