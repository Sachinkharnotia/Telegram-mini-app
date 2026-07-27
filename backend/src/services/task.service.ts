import { Task, User } from '../models';
import { pool } from '../config/database';

export class TaskService {
  async completeTask(userId: number, taskId: number) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const taskResult = await client.query('SELECT reward FROM tasks WHERE id = $1 AND is_active = true', [taskId]);
      if (taskResult.rows.length === 0) {
        throw new Error('Task not found or inactive');
      }
      
      const reward = parseFloat(taskResult.rows[0].reward);
      
      const userTaskResult = await client.query(
        'INSERT INTO user_tasks (user_id, task_id, completed_at, reward_claimed, claimed_at) VALUES ($1, $2, NOW(), true, NOW()) ON CONFLICT (user_id, task_id) DO NOTHING RETURNING *',
        [userId, taskId]
      );
      
      if (userTaskResult.rows.length === 0) {
        throw new Error('Task already completed');
      }
      
      await client.query(
        'UPDATE user_balances SET task_earnings = task_earnings + $1, available_balance = available_balance + $1 WHERE user_id = $2',
        [reward, userId]
      );
      
      await client.query(
        'INSERT INTO transactions (user_id, type, amount, status, description) VALUES ($1, $2, $3, $4, $5)',
        [userId, 'task', reward, 'completed', 'Task reward']
      );
      
      await client.query('COMMIT');
      
      return { success: true, reward };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const taskService = new TaskService();
