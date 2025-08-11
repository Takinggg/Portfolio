import { DateTime } from 'luxon';
import Database from 'better-sqlite3';
import { EmailService, EmailData } from './emailService.js';
import { EmailTemplates, TemplateVariables } from './templates.js';
import { ICSGenerator } from '../scheduling/ics-generator.js';
import { Booking, EventType, Invitee } from '../scheduling/types.js';

/**
 * Notification Service for handling booking lifecycle emails and reminders
 */
export class NotificationService {
  private db: Database.Database;
  private emailService: EmailService;
  private isRemindersEnabled: boolean;
  private reminderOffsets: number[]; // in hours
  private ownerNotify: boolean;
  private ownerEmail?: string;

  constructor(db: Database.Database) {
    this.db = db;
    this.emailService = new EmailService();
    this.isRemindersEnabled = process.env.ENABLE_REMINDERS === 'true';
    this.ownerNotify = process.env.OWNER_NOTIFY === 'true';
    this.ownerEmail = process.env.OWNER_EMAIL;
    
    // Parse reminder offsets (default: 24h,2h)
    const offsetsStr = process.env.REMINDER_OFFSETS || '24h,2h';
    this.reminderOffsets = this.parseReminderOffsets(offsetsStr);

    console.log(`📧 Notification service initialized:`);
    console.log(`  - Reminders enabled: ${this.isRemindersEnabled}`);
    console.log(`  - Reminder offsets: ${this.reminderOffsets.join(', ')} hours`);
    console.log(`  - Owner notifications: ${this.ownerNotify}`);
  }

  /**
   * Parse reminder offsets from string format (e.g., "24h,2h")
   */
  private parseReminderOffsets(offsetsStr: string): number[] {
    return offsetsStr
      .split(',')
      .map(offset => {
        const trimmed = offset.trim();
        if (trimmed.endsWith('h')) {
          return parseInt(trimmed.slice(0, -1));
        } else if (trimmed.endsWith('m')) {
          return Math.round(parseInt(trimmed.slice(0, -1)) / 60);
        } else {
          return parseInt(trimmed); // assume hours
        }
      })
      .filter(offset => !isNaN(offset) && offset > 0)
      .sort((a, b) => b - a); // Sort descending
  }

  /**
   * Get booking with related data
   */
  private getBookingWithDetails(bookingUuid: string): (Booking & { eventType: EventType; invitee: Invitee }) | null {
    const result = this.db.prepare(`
      SELECT 
        b.*,
        et.name as event_type_name,
        et.description as event_type_description,
        et.duration_minutes,
        et.location_type,
        et.color as event_type_color,
        i.name as invitee_name,
        i.email as invitee_email,
        i.timezone as invitee_timezone,
        i.notes as invitee_notes
      FROM bookings b
      JOIN event_types et ON b.event_type_id = et.id
      JOIN invitees i ON b.id = i.booking_id
      WHERE b.uuid = ?
    `).get(bookingUuid) as any;

    if (!result) return null;

    return {
      id: result.id,
      uuid: result.uuid,
      event_type_id: result.event_type_id,
      start_time: result.start_time,
      end_time: result.end_time,
      status: result.status,
      created_at: result.created_at,
      updated_at: result.updated_at,
      cancelled_at: result.cancelled_at,
      cancellation_reason: result.cancellation_reason,
      eventType: {
        id: result.event_type_id,
        name: result.event_type_name,
        description: result.event_type_description,
        duration_minutes: result.duration_minutes,
        location_type: result.location_type,
        color: result.event_type_color,
        is_active: true,
        buffer_before_minutes: 0,
        buffer_after_minutes: 0,
        min_lead_time_hours: 1,
        max_advance_days: 30,
        created_at: result.created_at,
        updated_at: result.updated_at
      } as EventType,
      invitee: {
        id: 0,
        booking_id: result.id,
        name: result.invitee_name,
        email: result.invitee_email,
        timezone: result.invitee_timezone || 'UTC',
        notes: result.invitee_notes,
        created_at: result.created_at
      } as Invitee
    };
  }

  /**
   * Generate manage links for booking
   */
  private generateManageLinks(bookingUuid: string, rescheduleToken: string, cancelToken: string) {
    const baseUrl = process.env.FRONTEND_URL || 'https://maxence.design';
    return {
      rescheduleLink: `${baseUrl}/schedule/reschedule?token=${rescheduleToken}`,
      cancelLink: `${baseUrl}/schedule/cancel?token=${cancelToken}`
    };
  }

  /**
   * Create template variables from booking data
   */
  private createTemplateVariables(
    booking: Booking & { eventType: EventType; invitee: Invitee },
    rescheduleToken?: string,
    cancelToken?: string,
    oldStartTime?: string
  ): TemplateVariables {
    const startTime = DateTime.fromISO(booking.start_time);
    const endTime = DateTime.fromISO(booking.end_time);
    const userTimezone = booking.invitee.timezone;
    
    const localStart = startTime.setZone(userTimezone);
    const localEnd = endTime.setZone(userTimezone);

    const googleCalendarUrl = ICSGenerator.generateGoogleCalendarUrl(booking, booking.eventType, booking.invitee);
    const outlookCalendarUrl = ICSGenerator.generateOutlookCalendarUrl(booking, booking.eventType, booking.invitee);

    const manageLinks = rescheduleToken && cancelToken 
      ? this.generateManageLinks(booking.uuid, rescheduleToken, cancelToken)
      : {};

    const variables: TemplateVariables = {
      attendeeName: booking.invitee.name,
      eventTitle: booking.eventType.name,
      start: localStart,
      end: localEnd,
      timezone: userTimezone,
      location: this.getLocationDescription(booking.eventType.location_type),
      googleCalendarUrl,
      outlookCalendarUrl,
      notes: booking.invitee.notes,
      ...manageLinks
    };

    if (oldStartTime) {
      const oldStart = DateTime.fromISO(oldStartTime).setZone(userTimezone);
      const oldEnd = oldStart.plus({ minutes: booking.eventType.duration_minutes });
      variables.oldStart = oldStart;
      variables.oldEnd = oldEnd;
    }

    return variables;
  }

  /**
   * Get location description
   */
  private getLocationDescription(locationType: string): string {
    switch (locationType) {
      case 'visio':
        return 'Video Conference (meeting link will be provided)';
      case 'physique':
        return 'In-Person Meeting (location will be confirmed)';
      case 'telephone':
        return 'Phone Call (number will be provided)';
      default:
        return 'Details will be provided';
    }
  }

  /**
   * Send booking confirmation notification
   */
  async sendBookingConfirmation(
    bookingUuid: string,
    rescheduleToken: string,
    cancelToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const booking = this.getBookingWithDetails(bookingUuid);
      if (!booking) {
        return { success: false, error: 'Booking not found' };
      }

      const variables = this.createTemplateVariables(booking, rescheduleToken, cancelToken);
      const templates = EmailTemplates.renderConfirmation(variables);

      // Generate ICS attachment
      const icsContent = ICSGenerator.generateICS(booking, booking.eventType, booking.invitee);
      const icsFilename = ICSGenerator.generateFilename(booking.eventType, variables.start);

      const emailData: EmailData = {
        to: booking.invitee.email,
        subject: templates.subject,
        text: templates.text,
        html: templates.html,
        icsAttachment: {
          filename: icsFilename,
          content: icsContent
        }
      };

      // Send to attendee
      const attendeeResult = await this.emailService.sendEmail(emailData);
      
      // Send to owner if enabled
      if (this.ownerNotify && this.ownerEmail) {
        const ownerEmailData: EmailData = {
          ...emailData,
          to: this.ownerEmail,
          subject: `New Booking: ${templates.subject}`
        };
        await this.emailService.sendEmail(ownerEmailData);
      }

      // Log notification
      this.logNotification(booking.id, 'confirmation', booking.invitee.email, attendeeResult.success);

      return attendeeResult;
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send reschedule notification
   */
  async sendRescheduleNotification(
    bookingUuid: string,
    oldStartTime: string,
    rescheduleToken: string,
    cancelToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const booking = this.getBookingWithDetails(bookingUuid);
      if (!booking) {
        return { success: false, error: 'Booking not found' };
      }

      const variables = this.createTemplateVariables(booking, rescheduleToken, cancelToken, oldStartTime);
      const templates = EmailTemplates.renderReschedule(variables);

      // Generate ICS attachment
      const icsContent = ICSGenerator.generateICS(booking, booking.eventType, booking.invitee);
      const icsFilename = ICSGenerator.generateFilename(booking.eventType, variables.start);

      const emailData: EmailData = {
        to: booking.invitee.email,
        subject: templates.subject,
        text: templates.text,
        html: templates.html,
        icsAttachment: {
          filename: icsFilename,
          content: icsContent
        }
      };

      const result = await this.emailService.sendEmail(emailData);

      // Log notification
      this.logNotification(booking.id, 'reschedule', booking.invitee.email, result.success);

      return result;
    } catch (error) {
      console.error('Error sending reschedule notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send cancellation notification
   */
  async sendCancellationNotification(
    bookingUuid: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const booking = this.getBookingWithDetails(bookingUuid);
      if (!booking) {
        return { success: false, error: 'Booking not found' };
      }

      const variables = this.createTemplateVariables(booking);
      if (reason) {
        variables.reason = reason;
      }

      const templates = EmailTemplates.renderCancellation(variables);

      const emailData: EmailData = {
        to: booking.invitee.email,
        subject: templates.subject,
        text: templates.text,
        html: templates.html
      };

      const result = await this.emailService.sendEmail(emailData);

      // Log notification
      this.logNotification(booking.id, 'cancellation', booking.invitee.email, result.success);

      return result;
    } catch (error) {
      console.error('Error sending cancellation notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send reminder notification
   */
  async sendReminderNotification(
    bookingUuid: string,
    hoursUntil: number,
    rescheduleToken: string,
    cancelToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const booking = this.getBookingWithDetails(bookingUuid);
      if (!booking) {
        return { success: false, error: 'Booking not found' };
      }

      const variables = this.createTemplateVariables(booking, rescheduleToken, cancelToken);
      const templates = EmailTemplates.renderReminder(variables, hoursUntil);

      const emailData: EmailData = {
        to: booking.invitee.email,
        subject: templates.subject,
        text: templates.text,
        html: templates.html
      };

      const result = await this.emailService.sendEmail(emailData);

      // Log notification
      this.logNotification(booking.id, 'reminder', booking.invitee.email, result.success);

      return result;
    } catch (error) {
      console.error('Error sending reminder notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Schedule reminders for a booking
   */
  scheduleReminders(bookingId: number): void {
    if (!this.isRemindersEnabled) {
      return;
    }

    try {
      // Delete existing reminders for this booking
      this.db.prepare('DELETE FROM reminders WHERE booking_id = ?').run(bookingId);

      // Schedule new reminders
      const stmt = this.db.prepare(`
        INSERT INTO reminders (booking_id, offset_hours, scheduled_for)
        VALUES (?, ?, ?)
      `);

      for (const offsetHours of this.reminderOffsets) {
        // Get booking start time to calculate when to send reminder
        const booking = this.db.prepare('SELECT start_time FROM bookings WHERE id = ?').get(bookingId) as any;
        if (booking) {
          const startTime = DateTime.fromISO(booking.start_time);
          const reminderTime = startTime.minus({ hours: offsetHours });
          
          // Only schedule if reminder time is in the future
          if (reminderTime > DateTime.now()) {
            stmt.run(bookingId, offsetHours, reminderTime.toISO());
          }
        }
      }

      console.log(`📅 Scheduled ${this.reminderOffsets.length} reminders for booking ${bookingId}`);
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  }

  /**
   * Process pending reminders
   */
  async processPendingReminders(): Promise<void> {
    if (!this.isRemindersEnabled) {
      return;
    }

    try {
      const pendingReminders = this.db.prepare(`
        SELECT 
          r.*,
          b.uuid as booking_uuid,
          b.start_time,
          b.status as booking_status
        FROM reminders r
        JOIN bookings b ON r.booking_id = b.id
        WHERE r.sent_at IS NULL 
          AND r.scheduled_for <= datetime('now')
          AND b.status = 'confirmed'
          AND b.start_time > datetime('now')
        ORDER BY r.scheduled_for ASC
        LIMIT 50
      `).all() as any[];

      console.log(`📅 Processing ${pendingReminders.length} pending reminders`);

      for (const reminder of pendingReminders) {
        try {
          // Generate tokens (simplified - in production you'd want proper token management)
          const rescheduleToken = `reminder-${reminder.booking_uuid}-reschedule`;
          const cancelToken = `reminder-${reminder.booking_uuid}-cancel`;

          const result = await this.sendReminderNotification(
            reminder.booking_uuid,
            reminder.offset_hours,
            rescheduleToken,
            cancelToken
          );

          // Mark reminder as sent/failed
          if (result.success) {
            this.db.prepare(`
              UPDATE reminders 
              SET sent_at = CURRENT_TIMESTAMP, attempts = attempts + 1
              WHERE id = ?
            `).run(reminder.id);
          } else {
            this.db.prepare(`
              UPDATE reminders 
              SET attempts = attempts + 1, last_error = ?
              WHERE id = ?
            `).run(result.error || 'Unknown error', reminder.id);

            // Stop retrying after 3 attempts
            if (reminder.attempts >= 2) {
              this.db.prepare(`
                UPDATE reminders 
                SET sent_at = CURRENT_TIMESTAMP
                WHERE id = ?
              `).run(reminder.id);
            }
          }
        } catch (error) {
          console.error(`Error processing reminder ${reminder.id}:`, error);
          
          // Update attempt count and error
          this.db.prepare(`
            UPDATE reminders 
            SET attempts = attempts + 1, last_error = ?
            WHERE id = ?
          `).run(error instanceof Error ? error.message : 'Unknown error', reminder.id);
        }
      }
    } catch (error) {
      console.error('Error processing pending reminders:', error);
    }
  }

  /**
   * Log notification attempt
   */
  private logNotification(
    bookingId: number,
    type: 'confirmation' | 'reschedule' | 'cancellation' | 'reminder',
    recipientEmail: string,
    success: boolean
  ): void {
    try {
      this.db.prepare(`
        INSERT INTO notifications (booking_id, notification_type, recipient_email, status)
        VALUES (?, ?, ?, ?)
      `).run(bookingId, type, recipientEmail, success ? 'sent' : 'failed');
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Test email service
   */
  async sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
    return this.emailService.sendTestEmail(to);
  }
}