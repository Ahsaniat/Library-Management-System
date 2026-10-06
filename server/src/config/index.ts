import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  poolMin: number;
  poolMax: number;
}

interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

interface Config {
  nodeEnv: string;
  port: number;
  database: DatabaseConfig;
  jwt: JwtConfig;
  smtp: SmtpConfig;
  upload: {
    dir: string;
    maxFileSize: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cors: {
    origin: string;
  };
  logLevel: string;
  openLibraryApiUrl: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvVarAsNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
}

function getEnvVarAsBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

const PLACEHOLDER_SECRETS = new Set([
  'dev-secret-change-in-production',
  'dev-refresh-secret-change-in-production',
  'your_jwt_secret_here_min_64_chars',
  'your_refresh_secret_here_min_64_chars',
]);

/**
 * JWT secrets must be present, unique and long enough to resist brute force.
 * Failing fast at boot is deliberate: a server silently signing tokens with a
 * public default is an authentication bypass waiting to happen.
 */
function getJwtSecret(key: string): string {
  const value = process.env[key];
  if (!value || value.length < 64 || PLACEHOLDER_SECRETS.has(value)) {
    throw new Error(
      `${key} must be set to a unique secret of at least 64 characters. ` +
        `Generate one with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
    );
  }
  return value;
}

export const config: Config = {
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  port: getEnvVarAsNumber('PORT', 3001),
  database: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: getEnvVarAsNumber('DB_PORT', 5432),
    name: getEnvVar('DB_NAME', 'library_db'),
    user: getEnvVar('DB_USER', 'postgres'),
    password: getEnvVar('DB_PASSWORD'),
    poolMin: getEnvVarAsNumber('DB_POOL_MIN', 2),
    poolMax: getEnvVarAsNumber('DB_POOL_MAX', 10),
  },
  jwt: {
    secret: getJwtSecret('JWT_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '15m'),
    refreshSecret: getJwtSecret('JWT_REFRESH_SECRET'),
    refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
  smtp: {
    host: getEnvVar('SMTP_HOST', 'localhost'),
    port: getEnvVarAsNumber('SMTP_PORT', 587),
    secure: getEnvVarAsBoolean('SMTP_SECURE', false),
    user: getEnvVar('SMTP_USER', ''),
    pass: getEnvVar('SMTP_PASS', ''),
    from: getEnvVar('EMAIL_FROM', 'Library System <noreply@library.local>'),
  },
  upload: {
    dir: getEnvVar('UPLOAD_DIR', './uploads'),
    maxFileSize: getEnvVarAsNumber('MAX_FILE_SIZE', 5242880),
  },
  rateLimit: {
    windowMs: getEnvVarAsNumber('RATE_LIMIT_WINDOW_MS', 900000),
    maxRequests: getEnvVarAsNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },
  cors: {
    origin: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
  },
  logLevel: getEnvVar('LOG_LEVEL', 'info'),
  openLibraryApiUrl: getEnvVar('OPEN_LIBRARY_API_URL', 'https://openlibrary.org'),
};

export default config;
