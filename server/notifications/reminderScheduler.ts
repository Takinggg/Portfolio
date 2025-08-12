import cron from 'node-cron';
import Database from 'better-sqlite3';
import { NotificationService } from './notifier.js';

/**
 * Reminder Scheduler Service
 * Runs periodic jobs to send booking reminders
 */
export class ReminderScheduler {
  private db: Database.Database;
  private notificationService: NotificationService;
  private isRunning: boolean = false;
  private cronJob?: cron.ScheduledTask;

  constructor(db: Database.Database, notificationService: NotificationService) {
    this.db = db;
    this.notificationService = notificationService;
  }

  /**
   * Start the reminder scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log('⏰ Reminder scheduler is already running');
      return;
    }

    const reminderEnabled = process.env.ENABLE_REMINDERS === 'true';
    if (!reminderEnabled) {
      console.log('⏰ Reminder scheduler disabled via ENABLE_REMINDERS');
      return;
    }

    // Run every 5 minutes
    this.cronJob = cron.schedule('*/5 * * * *', async () => {
      try {
        await this.processReminders();
      } catch (error) {
        console.error('Error in reminder scheduler:', error);
      }
    }, {
      scheduled: false // Don't start immediately
    });

    this.cronJob.start();
    this.isRunning = true;
    
    console.log('⏰ Reminder scheduler started (runs every 5 minutes)');
  }

  /**
   * Stop the reminder scheduler
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = undefined;
    }
    this.isRunning = false;
    console.log('⏰ Reminder scheduler stopped');
  }

  /**
   * Process pending reminders
   */
  private async processReminders(): Promise<void> {
    try {
      console.log('⏰ Processing pending reminders...');
      await this.notificationService.processPendingReminders();
    } catch (error) {
      console.error('Error processing reminders:', error);
    }
  }

  /**
   * Check if scheduler is running
   */
  isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get reminder statistics
   */
  getReminderStats(): any {
    try {
      const stats = {
        total: this.db.prepare('SELECT COUNT(*) as count FROM reminders').get(),
        pending: this.db.prepare('SELECT COUNT(*) as count FROM reminders WHERE sent_at IS NULL AND scheduled_for <= datetime("now")').get(),
        sent: this.db.prepare('SELECT COUNT(*) as count FROM reminders WHERE sent_at IS NOT NULL').get(),
        failed: this.db.prepare('SELECT COUNT(*) as count FROM reminders WHERE attempts > 0 AND sent_at IS NULL').get(),
        upcomingToday: this.db.prepare(`
          SELECT COUNT(*) as count FROM reminders 
          WHERE sent_at IS NULL 
            AND DATE(scheduled_for) = DATE('now')
        `).get(),
        isRunning: this.isRunning
      };

      return stats;
    } catch (error) {
      console.error('Error getting reminder stats:', error);
      return {
        total: { count: 0 },
        pending: { count: 0 },
        sent: { count: 0 },
        failed: { count: 0 },
        upcomingToday: { count: 0 },
        isRunning: this.isRunning
      };
    }
  }

  /**
   * Manual trigger for testing
   */
  async triggerReminderCheck(): Promise<{ success: boolean; processed: number; errors: string[] }> {
    const errors: string[] = [];
    let processed = 0;

    try {
      const beforeCount = this.db.prepare('SELECT COUNT(*) as count FROM reminders WHERE sent_at IS NULL').get() as any;
      
      await this.processReminders();
      
      const afterCount = this.db.prepare('SELECT COUNT(*) as count FROM reminders WHERE sent_at IS NULL').get() as any;
      processed = beforeCount.count - afterCount.count;

      return { success: true, processed, errors };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { success: false, processed, errors };
    }
  }

  /**
   * Clean up old processed reminders (older than 30 days)
   */
  cleanupOldReminders(): number {
    try {
      const result = this.db.prepare(`
        DELETE FROM reminders 
        WHERE sent_at IS NOT NULL 
          AND sent_at < datetime('now', '-30 days')
      `).run();

      console.log(`🧹 Cleaned up ${result.changes} old reminders`);
      return result.changes;
    } catch (error) {
      console.error('Error cleaning up old reminders:', error);
      return 0;
    }
  }
}