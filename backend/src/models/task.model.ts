import { Pool } from 'pg';
import { Task, UserTask } from '../../shared/types/models';

export class TaskModel {
  constructor(private db: Pool) {}
  
  async getActiveTasks(): Promise<Task[]> {
    const query = `SELECT * FROM tasks WHERE is_active = true`;
    const result = await this.db.query(query);
    return result.rows;
  }

  async getUserTasks(userId: number): Promise<UserTask[]> {
    const query = `SELECT * FROM user_tasks WHERE user_id = $1`;
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }

  async completeTask(userId: number, taskId: number): Promise<UserTask> {
    const query = `
      INSERT INTO user_tasks (user_id, task_id, completed_at, reward_claimed)
      VALUES ($1, $2, NOW(), false)
      ON CONFLICT (user_id, task_id) DO NOTHING
      RETURNING *
    `;
    const result = await this.db.query(query, [userId, taskId]);
    return result.rows[0];
  }
}
