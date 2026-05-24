import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lt } from 'drizzle-orm';
import { db, sessionsTable } from '@workspace/db';

@Injectable()
export class SessionCleanupTask {
  private readonly logger = new Logger(SessionCleanupTask.name);

  @Cron('0 1 * * *', { name: 'session-cleanup', timeZone: 'America/Chicago' })
  async cleanupExpiredSessions(): Promise<void> {
    this.logger.log('Running nightly session cleanup…');
    try {
      const result = await db
        .delete(sessionsTable)
        .where(lt(sessionsTable.expiresAt, new Date()));
      this.logger.log(`Session cleanup complete — rows removed: ${(result as { rowCount?: number }).rowCount ?? 'unknown'}`);
    } catch (err: unknown) {
      this.logger.error(`Session cleanup failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
