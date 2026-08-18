import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_G0J2hcgQayIB@ep-withered-voice-ay22a2d8.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
