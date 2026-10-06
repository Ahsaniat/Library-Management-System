import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import './types/express';
import config from './config';
import routes from './routes';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  generalLimiter,
} from './middleware';
import { testConnection } from './config/database';
import sequelize from './config/database';
import { startScheduler, stopScheduler } from './jobs';
import logger from './utils/logger';

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

app.use(requestLogger);
app.use('/api/v1', routes);
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    await testConnection();

    // The schema is owned by versioned migrations (`npm run db:migrate`) and
    // is deliberately never synced from models at startup.
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      startScheduler();
    });

    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}; shutting down`);
      stopScheduler();
      server.close();
      await sequelize.close();
      process.exit(0);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export default app;
