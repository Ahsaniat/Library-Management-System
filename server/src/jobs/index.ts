import cron, { ScheduledTask } from 'node-cron';
import { Op } from 'sequelize';
import config from '../config';
import logger from '../utils/logger';
import { notificationService } from '../services/notificationService';
import { reservationService } from '../services/reservationService';
import { RefreshToken } from '../models';

const tasks: ScheduledTask[] = [];
let started = false;

async function runSafely(name: string, task: () => Promise<unknown>): Promise<void> {
  const startedAt = Date.now();

  try {
    const result = await task();
    logger.info({
      action: 'job_completed',
      job: name,
      durationMs: Date.now() - startedAt,
      result,
    });
  } catch (error) {
    logger.error({ action: 'job_failed', job: name, error });
  }
}

/**
 * Scheduled circulation maintenance. Runs in-process; for multi-instance
 * deployments enable exactly one worker (JOBS_ENABLED=true) or move these
 * tasks to a queue with distributed locking.
 */
export function startScheduler(): void {
  if (started) return;

  if (!config.jobsEnabled || config.nodeEnv === 'test') {
    logger.info('Scheduler disabled');
    return;
  }

  started = true;

  tasks.push(
    cron.schedule('0 7 * * *', () => {
      void runSafely('due-reminders', () => notificationService.sendDueReminders());
    })
  );

  tasks.push(
    cron.schedule('0 8 * * *', () => {
      void runSafely('overdue-notices', () => notificationService.sendOverdueNotices());
    })
  );

  tasks.push(
    cron.schedule('15 * * * *', () => {
      void runSafely('reservation-expiry', () =>
        reservationService.processExpiredReservations()
      );
    })
  );

  tasks.push(
    cron.schedule('30 3 * * *', () => {
      void runSafely('refresh-token-cleanup', async () => {
        const deleted = await RefreshToken.destroy({
          where: {
            [Op.or]: [
              { expiresAt: { [Op.lt]: new Date() } },
              { revokedAt: { [Op.ne]: null } },
            ],
          },
        });
        return { deleted };
      });
    })
  );

  logger.info({ action: 'scheduler_started', jobs: tasks.length });
}

export function stopScheduler(): void {
  for (const task of tasks) {
    task.stop();
  }
  tasks.length = 0;
  started = false;
}
