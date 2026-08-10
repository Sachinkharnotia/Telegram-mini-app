import { Pool } from 'pg';
import { User } from '../../../shared/types/models';

export class UserModel {
  constructor(private db: Pool) {}
  
  async findById(id: number): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByTelegramId(telegramId: number): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegramId]
    );
    return result.rows[0] || null;
  }
  
  async create(userData: Partial<User>): Promise<User> {
    const query = `
      INSERT INTO users (telegram_id, username, first_name, last_name, language_code, is_premium)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await this.db.query(query, [
      userData.telegram_id,
      userData.username,
      userData.first_name,
      userData.last_name,
      userData.language_code,
      userData.is_premium || false
    ]);
    
    return result.rows[0];
  }
  
  async updateWallet(userId: number, walletAddress: string): Promise<User> {
    const query = `
      UPDATE users
      SET wallet_address = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await this.db.query(query, [walletAddress, userId]);
    return result.rows[0];
  }
}
