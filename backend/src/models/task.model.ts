import { Pool } from 'pg';
import { Task } from '../../../shared/types/models';

export class TaskModel {
  constructor(private db: Pool) {}
  
  async findAllActive(): Promise<Task[]> {
    const query = `
      SELECT * FROM tasks WHERE is_active = true
    `;
    const result = await this.db.query(query);
    return result.rows;
  }
}
