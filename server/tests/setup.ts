import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes-only-64-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-testing-purposes-only-64-chars';

