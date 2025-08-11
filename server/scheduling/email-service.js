import { DateTime } from 'luxon';
import { ICSGenerator } from './ics-generator.js';

/**
 * Email notification service with development logging and SMTP scaffolding
 * In development: logs email content to console
 * In production: can be configured with SMTP provider
 */
export class EmailNotificationService {
  constructor(db, fromEmail = 'noreply@maxence.design') {
    this.db = db;
    this.fromEmail = fromEmail;
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Initialize SMTP configuration if provided
    if (process.env.SMTP_HOST) {
      this.smtpConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        } : undefined
      };
    }
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(booking, eventType, invitee, rescheduleToken, cancelToken) {
    const startTime = DateTime.fromISO(booking.start_time);
    const endTime = DateTime.fromISO(booking.end_time);
    const userTimezone = invitee.timezone || 'UTC';
    
    const localStart = startTime.setZone(userTimezone);
    const localEnd = endTime.setZone(userTimezone);

    const subject = `Booking Confirmed: ${eventType.name} on ${localStart.toFormat('MMM dd, yyyy')}`;
    
    const icsContent = ICSGenerator.generateICS(booking, eventType, invitee);
    const googleCalendarUrl = ICSGenerator.generateGoogleCalendarUrl(booking, eventType, invitee);
    
    const baseUrl = process.env.FRONTEND_URL || 'https://maxence.design';
    const rescheduleUrl = `${baseUrl}/schedule/reschedule?token=${rescheduleToken}`;
    const cancelUrl = `${baseUrl}/schedule/cancel?token=${cancelToken}`;

    const textContent = this.generateBookingConfirmationText({
      eventType,
      invitee,
      localStart,
      localEnd,
      rescheduleUrl,
      cancelUrl,
      booking
    });

    const emailData = {
      to: invitee.email,
      subject,
      text: textContent,
      attachments: [{
        filename: ICSGenerator.generateFilename(eventType, startTime),
        content: icsContent,
        contentType: 'text/calendar'
      }]
    };

    await this.sendEmail(emailData, 'booking_confirmation', booking.id);
  }

  /**
   * Send booking cancellation email
   */
  async sendCancellationNotification(booking, eventType, invitee, reason) {
    const startTime = DateTime.fromISO(booking.start_time);
    const userTimezone = invitee.timezone || 'UTC';
    const localStart = startTime.setZone(userTimezone);

    const subject = `Booking Cancelled: ${eventType.name} on ${localStart.toFormat('MMM dd, yyyy')}`;
    
    const textContent = this.generateCancellationText({
      eventType,
      invitee,
      localStart,
      reason,
      booking
    });

    const emailData = {
      to: invitee.email,
      subject,
      text: textContent
    };

    await this.sendEmail(emailData, 'cancellation', booking.id);
  }

  /**
   * Send booking reschedule email
   */
  async sendRescheduleNotification(booking, eventType, invitee, oldStartTime, rescheduleToken, cancelToken) {
    const newStartTime = DateTime.fromISO(booking.start_time);
    const newEndTime = DateTime.fromISO(booking.end_time);
    const oldStart = DateTime.fromISO(oldStartTime);
    const userTimezone = invitee.timezone || 'UTC';
    
    const localNewStart = newStartTime.setZone(userTimezone);
    const localNewEnd = newEndTime.setZone(userTimezone);
    const localOldStart = oldStart.setZone(userTimezone);

    const subject = `Booking Rescheduled: ${eventType.name} - New time ${localNewStart.toFormat('MMM dd, yyyy')}`;
    
    const icsContent = ICSGenerator.generateICS(booking, eventType, invitee);
    
    const baseUrl = process.env.FRONTEND_URL || 'https://maxence.design';
    const rescheduleUrl = `${baseUrl}/schedule/reschedule?token=${rescheduleToken}`;
    const cancelUrl = `${baseUrl}/schedule/cancel?token=${cancelToken}`;

    const textContent = this.generateRescheduleText({
      eventType,
      invitee,
      localNewStart,
      localNewEnd,
      localOldStart,
      rescheduleUrl,
      cancelUrl,
      booking
    });

    const emailData = {
      to: invitee.email,
      subject,
      text: textContent,
      attachments: [{
        filename: ICSGenerator.generateFilename(eventType, newStartTime),
        content: icsContent,
        contentType: 'text/calendar'
      }]
    };

    await this.sendEmail(emailData, 'reschedule', booking.id);
  }

  /**
   * Core email sending method
   */
  async sendEmail(emailData, notificationType, bookingId) {
    // Log notification attempt
    const notificationId = this.logNotification(bookingId, notificationType, emailData.to);

    try {
      if (this.isDevelopment || !this.smtpConfig) {
        // Development: Log email to console
        console.log('\n📧 EMAIL NOTIFICATION (DEV MODE)');
        console.log('=====================================');
        console.log(`To: ${emailData.to}`);
        console.log(`Subject: ${emailData.subject}`);
        console.log(`Type: ${notificationType}`);
        console.log('\n--- TEXT CONTENT ---');
        console.log(emailData.text);
        if (emailData.attachments) {
          console.log(`\n--- ATTACHMENTS ---`);
          emailData.attachments.forEach((att, i) => {
            console.log(`${i + 1}. ${att.filename} (${att.contentType})`);
          });
        }
        console.log('=====================================\n');

        // Mark as sent in dev mode
        this.markNotificationSent(notificationId);
      } else {
        // Production: Send via SMTP (scaffolded for future implementation)
        await this.sendViaSMTP(emailData);
        this.markNotificationSent(notificationId);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      this.markNotificationFailed(notificationId, error.message);
      throw error;
    }
  }

  /**
   * SMTP sending (scaffolded for production use)
   */
  async sendViaSMTP(emailData) {
    // TODO: Implement actual SMTP sending when needed
    console.log('📧 SMTP sending not implemented yet. Email data:', {
      to: emailData.to,
      subject: emailData.subject,
      hasText: !!emailData.text,
      attachmentCount: emailData.attachments?.length || 0
    });
    
    // For now, simulate successful sending
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Notification logging
   */
  logNotification(bookingId, notificationType, recipientEmail) {
    const result = this.db.prepare(`
      INSERT INTO notifications (booking_id, notification_type, recipient_email, status)
      VALUES (?, ?, ?, 'pending')
    `).run(bookingId, notificationType, recipientEmail);

    return result.lastInsertRowid;
  }

  markNotificationSent(notificationId) {
    this.db.prepare(`
      UPDATE notifications 
      SET status = 'sent', sent_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(notificationId);
  }

  markNotificationFailed(notificationId, errorMessage) {
    this.db.prepare(`
      UPDATE notifications 
      SET status = 'failed', error_message = ? 
      WHERE id = ?
    `).run(errorMessage, notificationId);
  }

  /**
   * Text email templates
   */
  generateBookingConfirmationText(data) {
    return `
Booking Confirmed!

Hi ${data.invitee.name},

Your booking has been confirmed! Here are the details:

${data.eventType.name}
📅 Date: ${data.localStart.toFormat('EEEE, MMMM dd, yyyy')}
🕐 Time: ${data.localStart.toFormat('h:mm a')} - ${data.localEnd.toFormat('h:mm a')} ${data.localStart.toFormat('ZZZZ')}
⏱️ Duration: ${data.eventType.duration_minutes} minutes
📍 Location: ${this.getLocationDescription(data.eventType.location_type)}
${data.invitee.notes ? `📝 Notes: ${data.invitee.notes}` : ''}

Need to make changes?
Reschedule: ${data.rescheduleUrl}
Cancel: ${data.cancelUrl}

Questions? Reply to this email or contact us at contact@maxence.design

This event was scheduled through Portfolio Scheduler
`;
  }

  generateCancellationText(data) {
    return `
Booking Cancelled

Hi ${data.invitee.name},

Your booking has been cancelled:

${data.eventType.name}
📅 Was scheduled for: ${data.localStart.toFormat('EEEE, MMMM dd, yyyy')} at ${data.localStart.toFormat('h:mm a')}
${data.reason ? `🔍 Reason: ${data.reason}` : ''}

If you'd like to schedule a new appointment, please visit our booking page.

Questions? Reply to this email or contact us at contact@maxence.design
`;
  }

  generateRescheduleText(data) {
    return `
Booking Rescheduled

Hi ${data.invitee.name},

Your booking has been rescheduled to a new time:

${data.eventType.name}
📅 New Date: ${data.localNewStart.toFormat('EEEE, MMMM dd, yyyy')}
🕐 New Time: ${data.localNewStart.toFormat('h:mm a')} - ${data.localNewEnd.toFormat('h:mm a')} ${data.localNewStart.toFormat('ZZZZ')}
⏱️ Duration: ${data.eventType.duration_minutes} minutes
📍 Location: ${this.getLocationDescription(data.eventType.location_type)}

Previously scheduled for: ${data.localOldStart.toFormat('EEEE, MMMM dd, yyyy')} at ${data.localOldStart.toFormat('h:mm a')}

Need to make more changes?
Reschedule: ${data.rescheduleUrl}
Cancel: ${data.cancelUrl}

Questions? Reply to this email or contact us at contact@maxence.design
`;
  }

  getLocationDescription(locationType) {
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
}