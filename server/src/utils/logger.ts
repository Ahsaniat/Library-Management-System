import winston from 'winston';
import config from '../config';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const REDACTED_KEYS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'secret',
  'apiKey',
]);

const redactFormat = winston.format((info) => {
  for (const key of Object.keys(info)) {
    if (REDACTED_KEYS.has(key)) {
      delete (info as Record<string, unknown>)[key];
    }
  }
  return info;
});

const logFormat = printf(({ level, message, timestamp, requestId, ...metadata }) => {
  const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
  const reqId = requestId ? `[${requestId}]` : '';
  return `${timestamp} ${level} ${reqId} ${message} ${meta}`;
});

const jsonFormat = printf(({ level, message, timestamp, ...metadata }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...metadata,
  });
});

const logger = winston.createLogger({
  level: config.logLevel,
  format: combine(
    redactFormat(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true })
  ),
  defaultMeta: { service: 'library-api' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: jsonFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: jsonFormat,
    }),
  ],
});

if (config.nodeEnv !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    })
  );
}

export default logger;
