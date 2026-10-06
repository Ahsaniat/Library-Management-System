import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
process.env.DB_PORT = process.env.DB_PORT ?? '5432';
process.env.DB_NAME = process.env.DB_NAME ?? 'library_test';
process.env.DB_USER = process.env.DB_USER ?? 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'postgres';
process.env.JWT_SECRET =
  'test-jwt-secret-for-testing-purposes-only-0123456789abcdef0123456789abcdef';
process.env.JWT_REFRESH_SECRET =
  'test-refresh-secret-for-testing-purposes-only-0123456789abcdef0123456789ab';

