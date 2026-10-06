import { AuditLog } from '../models';
import logger from '../utils/logger';

export interface AuditEntry {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export class AuditService {
  /** Records a sensitive action. Auditing must never break the request. */
  async record(entry: AuditEntry): Promise<void> {
    try {
      await AuditLog.create(entry);
    } catch (error) {
      logger.error({ action: 'audit_log_failed', auditAction: entry.action, error });
    }
  }
}

export const auditService = new AuditService();
