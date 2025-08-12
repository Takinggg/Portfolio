import * as cron from 'node-cron';
export class ReminderScheduler {
    db;
    notificationService;
    isRunning = false;
    cronJob;
    constructor(db, notificationService) {
        this.db = db;
        this.notificationService = notificationService;
    }
    start() {
        if (this.isRunning) {
            console.log('⏰ Reminder scheduler is already running');
            return;
        }
        const reminderEnabled = process.env.ENABLE_REMINDERS === 'true';
        if (!reminderEnabled) {
            console.log('⏰ Reminder scheduler disabled via ENABLE_REMINDERS');
            return;
        }
        this.cronJob = cron.schedule('*/5 * * * *', async () => {
            try {
                await this.processReminders();
            }
            catch (error) {
                console.error('Error in reminder scheduler:', error);
            }
        }, {
            scheduled: false
        });
        this.cronJob.start();
        this.isRunning = true;
        console.log('⏰ Reminder scheduler started (runs every 5 minutes)');
    }
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = undefined;
        }
        this.isRunning = false;
        console.log('⏰ Reminder scheduler stopped');
    }
    async processReminders() {
        try {
            console.log('⏰ Processing pending reminders...');
            await this.notificationService.processPendingReminders();
        }
        catch (error) {
            console.error('Error processing reminders:', error);
        }
    }
    isSchedulerRunning() {
        return this.isRunning;
    }
    getReminderStats() {
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
        }
        catch (error) {
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
    async triggerReminderCheck() {
        const errors = [];
        let processed = 0;
        try {
            const beforeCount = this.db.prepare('SELECT COUNT(*) as count FROM reminders WHERE sent_at IS NULL').get();
            await this.processReminders();
            const afterCount = this.db.prepare('SELECT COUNT(*) as count FROM reminders WHERE sent_at IS NULL').get();
            processed = beforeCount.count - afterCount.count;
            return { success: true, processed, errors };
        }
        catch (error) {
            errors.push(error instanceof Error ? error.message : 'Unknown error');
            return { success: false, processed, errors };
        }
    }
    cleanupOldReminders() {
        try {
            const result = this.db.prepare(`
        DELETE FROM reminders 
        WHERE sent_at IS NOT NULL 
          AND sent_at < datetime('now', '-30 days')
      `).run();
            console.log(`🧹 Cleaned up ${result.changes} old reminders`);
            return result.changes;
        }
        catch (error) {
            console.error('Error cleaning up old reminders:', error);
            return 0;
        }
    }
}
