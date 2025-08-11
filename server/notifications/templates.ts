import { DateTime } from 'luxon';

/**
 * Template variables interface
 */
export interface TemplateVariables {
  attendeeName: string;
  eventTitle: string;
  start: DateTime;
  end: DateTime;
  timezone: string;
  location: string;
  manageLink?: string;
  rescheduleLink?: string;
  cancelLink?: string;
  googleCalendarUrl?: string;
  outlookCalendarUrl?: string;
  notes?: string;
  oldStart?: DateTime;
  oldEnd?: DateTime;
  reason?: string;
}

/**
 * Template rendering utility
 */
export class EmailTemplates {
  
  /**
   * Replace template variables in text
   */
  private static replaceVariables(template: string, variables: TemplateVariables): string {
    let result = template;
    
    // Replace all template variables
    result = result.replace(/\{\{attendeeName\}\}/g, variables.attendeeName);
    result = result.replace(/\{\{eventTitle\}\}/g, variables.eventTitle);
    result = result.replace(/\{\{start\}\}/g, variables.start.toFormat('EEEE, MMMM dd, yyyy \'at\' h:mm a'));
    result = result.replace(/\{\{end\}\}/g, variables.end.toFormat('h:mm a'));
    result = result.replace(/\{\{timezone\}\}/g, variables.timezone);
    result = result.replace(/\{\{location\}\}/g, variables.location);
    
    // Optional variables
    if (variables.manageLink) {
      result = result.replace(/\{\{manageLink\}\}/g, variables.manageLink);
    }
    if (variables.rescheduleLink) {
      result = result.replace(/\{\{rescheduleLink\}\}/g, variables.rescheduleLink);
    }
    if (variables.cancelLink) {
      result = result.replace(/\{\{cancelLink\}\}/g, variables.cancelLink);
    }
    if (variables.googleCalendarUrl) {
      result = result.replace(/\{\{googleCalendarUrl\}\}/g, variables.googleCalendarUrl);
    }
    if (variables.outlookCalendarUrl) {
      result = result.replace(/\{\{outlookCalendarUrl\}\}/g, variables.outlookCalendarUrl);
    }
    if (variables.notes) {
      result = result.replace(/\{\{notes\}\}/g, variables.notes);
    }
    if (variables.oldStart) {
      result = result.replace(/\{\{oldStart\}\}/g, variables.oldStart.toFormat('EEEE, MMMM dd, yyyy \'at\' h:mm a'));
    }
    if (variables.oldEnd) {
      result = result.replace(/\{\{oldEnd\}\}/g, variables.oldEnd.toFormat('h:mm a'));
    }
    if (variables.reason) {
      result = result.replace(/\{\{reason\}\}/g, variables.reason);
    }
    
    return result;
  }

  /**
   * Get location description based on type
   */
  private static getLocationDescription(locationType: string): string {
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
   * Booking Confirmation Templates
   */
  static getConfirmationSubject(variables: TemplateVariables): string {
    const template = process.env.CONFIRMATION_SUBJECT_TEMPLATE || 
      'Booking Confirmed: {{eventTitle}} on {{start}}';
    return this.replaceVariables(template, variables);
  }

  static getConfirmationTextTemplate(): string {
    return process.env.CONFIRMATION_TEXT_TEMPLATE || `
Hi {{attendeeName}},

Your booking has been confirmed! Here are the details:

📅 Event: {{eventTitle}}
🗓️ Date & Time: {{start}} - {{end}} ({{timezone}})
📍 Location: {{location}}{{#if notes}}
📝 Notes: {{notes}}{{/if}}

📅 Add to Calendar:
Google Calendar: {{googleCalendarUrl}}
Outlook: {{outlookCalendarUrl}}

Need to make changes?
Reschedule: {{rescheduleLink}}
Cancel: {{cancelLink}}

We look forward to meeting with you!

Best regards,
Maxence FOULON
`.trim();
  }

  static getConfirmationHtmlTemplate(): string {
    return process.env.CONFIRMATION_HTML_TEMPLATE || `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .event-details { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6; }
        .button { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white !important; text-decoration: none; border-radius: 6px; margin: 5px 10px 5px 0; }
        .button.secondary { background: #6B7280; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6B7280; }
        .emoji { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="emoji">🎉</span> Booking Confirmed!</h1>
            <p>Your appointment has been successfully scheduled</p>
        </div>
        <div class="content">
            <p>Hi {{attendeeName}},</p>
            <p>Your booking has been confirmed! Here are the details:</p>
            
            <div class="event-details">
                <h3>{{eventTitle}}</h3>
                <p><strong><span class="emoji">📅</span> Date:</strong> {{start}}</p>
                <p><strong><span class="emoji">🕐</span> Time:</strong> {{start}} - {{end}}</p>
                <p><strong><span class="emoji">🌍</span> Timezone:</strong> {{timezone}}</p>
                <p><strong><span class="emoji">📍</span> Location:</strong> {{location}}</p>{{#if notes}}
                <p><strong><span class="emoji">📝</span> Notes:</strong> {{notes}}</p>{{/if}}
            </div>

            <h3><span class="emoji">📅</span> Add to Calendar</h3>
            <p>
                <a href="{{googleCalendarUrl}}" class="button">Add to Google Calendar</a>
                <a href="{{outlookCalendarUrl}}" class="button">Add to Outlook</a>
            </p>
            <p><small>You can also use the attached .ics file to add this event to any calendar application.</small></p>

            <h3><span class="emoji">📝</span> Need to make changes?</h3>
            <p>
                <a href="{{rescheduleLink}}" class="button secondary">Reschedule</a>
                <a href="{{cancelLink}}" class="button secondary">Cancel</a>
            </p>

            <div class="footer">
                <p>We look forward to meeting with you!</p>
                <p><strong>Maxence FOULON</strong><br>
                Portfolio Scheduler</p>
                <p>Questions? Reply to this email or visit <a href="https://maxence.design">maxence.design</a></p>
            </div>
        </div>
    </div>
</body>
</html>`.trim();
  }

  /**
   * Reschedule Notification Templates
   */
  static getRescheduleSubject(variables: TemplateVariables): string {
    const template = process.env.RESCHEDULE_SUBJECT_TEMPLATE || 
      'Booking Rescheduled: {{eventTitle}} - New time {{start}}';
    return this.replaceVariables(template, variables);
  }

  static getRescheduleTextTemplate(): string {
    return process.env.RESCHEDULE_TEXT_TEMPLATE || `
Hi {{attendeeName}},

Your booking has been rescheduled to a new time:

📅 Event: {{eventTitle}}
🗓️ New Date & Time: {{start}} - {{end}} ({{timezone}})
📍 Location: {{location}}{{#if oldStart}}

Previous time: {{oldStart}} - {{oldEnd}}{{/if}}

📅 Add to Calendar:
Google Calendar: {{googleCalendarUrl}}
Outlook: {{outlookCalendarUrl}}

Need to make more changes?
Reschedule: {{rescheduleLink}}
Cancel: {{cancelLink}}

Best regards,
Maxence FOULON
`.trim();
  }

  static getRescheduleHtmlTemplate(): string {
    return process.env.RESCHEDULE_HTML_TEMPLATE || `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Rescheduled</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F59E0B; color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .event-details { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B; }
        .old-time { background: #FEF3C7; padding: 15px; border-radius: 6px; margin: 10px 0; font-style: italic; }
        .button { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white !important; text-decoration: none; border-radius: 6px; margin: 5px 10px 5px 0; }
        .button.secondary { background: #6B7280; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6B7280; }
        .emoji { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="emoji">📅</span> Booking Rescheduled</h1>
            <p>Your appointment time has been updated</p>
        </div>
        <div class="content">
            <p>Hi {{attendeeName}},</p>
            <p>Your booking has been rescheduled to a new time:</p>
            
            <div class="event-details">
                <h3>{{eventTitle}}</h3>
                <p><strong><span class="emoji">📅</span> New Date:</strong> {{start}}</p>
                <p><strong><span class="emoji">🕐</span> New Time:</strong> {{start}} - {{end}}</p>
                <p><strong><span class="emoji">🌍</span> Timezone:</strong> {{timezone}}</p>
                <p><strong><span class="emoji">📍</span> Location:</strong> {{location}}</p>{{#if oldStart}}
                
                <div class="old-time">
                    <strong>Previous time:</strong> {{oldStart}} - {{oldEnd}}
                </div>{{/if}}
            </div>

            <h3><span class="emoji">📅</span> Add to Calendar</h3>
            <p>
                <a href="{{googleCalendarUrl}}" class="button">Add to Google Calendar</a>
                <a href="{{outlookCalendarUrl}}" class="button">Add to Outlook</a>
            </p>

            <h3><span class="emoji">📝</span> Need to make more changes?</h3>
            <p>
                <a href="{{rescheduleLink}}" class="button secondary">Reschedule Again</a>
                <a href="{{cancelLink}}" class="button secondary">Cancel</a>
            </p>

            <div class="footer">
                <p><strong>Maxence FOULON</strong><br>
                Portfolio Scheduler</p>
                <p>Questions? Reply to this email or visit <a href="https://maxence.design">maxence.design</a></p>
            </div>
        </div>
    </div>
</body>
</html>`.trim();
  }

  /**
   * Cancellation Notification Templates
   */
  static getCancellationSubject(variables: TemplateVariables): string {
    const template = process.env.CANCELLATION_SUBJECT_TEMPLATE || 
      'Booking Cancelled: {{eventTitle}} on {{start}}';
    return this.replaceVariables(template, variables);
  }

  static getCancellationTextTemplate(): string {
    return process.env.CANCELLATION_TEXT_TEMPLATE || `
Hi {{attendeeName}},

Your booking has been cancelled:

📅 Event: {{eventTitle}}
🗓️ Was scheduled for: {{start}} - {{end}} ({{timezone}}){{#if reason}}
🔍 Reason: {{reason}}{{/if}}

If you'd like to schedule a new appointment, please visit our booking page.

Best regards,
Maxence FOULON
`.trim();
  }

  static getCancellationHtmlTemplate(): string {
    return process.env.CANCELLATION_HTML_TEMPLATE || `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Cancelled</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .event-details { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6B7280; }
        .emoji { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="emoji">❌</span> Booking Cancelled</h1>
            <p>Your appointment has been cancelled</p>
        </div>
        <div class="content">
            <p>Hi {{attendeeName}},</p>
            <p>Your booking has been cancelled:</p>
            
            <div class="event-details">
                <h3>{{eventTitle}}</h3>
                <p><strong><span class="emoji">📅</span> Was scheduled for:</strong> {{start}} - {{end}}</p>
                <p><strong><span class="emoji">🌍</span> Timezone:</strong> {{timezone}}</p>{{#if reason}}
                <p><strong><span class="emoji">🔍</span> Reason:</strong> {{reason}}</p>{{/if}}
            </div>

            <p>If you'd like to schedule a new appointment, please visit our booking page.</p>

            <div class="footer">
                <p><strong>Maxence FOULON</strong><br>
                Portfolio Scheduler</p>
                <p>Questions? Reply to this email or visit <a href="https://maxence.design">maxence.design</a></p>
            </div>
        </div>
    </div>
</body>
</html>`.trim();
  }

  /**
   * Reminder Templates
   */
  static getReminderSubject(variables: TemplateVariables, hoursUntil: number): string {
    const template = process.env.REMINDER_SUBJECT_TEMPLATE || 
      'Reminder: {{eventTitle}} in {{hoursUntil}} hours';
    return this.replaceVariables(template.replace('{{hoursUntil}}', hoursUntil.toString()), variables);
  }

  static getReminderTextTemplate(): string {
    return process.env.REMINDER_TEXT_TEMPLATE || `
Hi {{attendeeName}},

This is a reminder that you have an upcoming appointment:

📅 Event: {{eventTitle}}
🗓️ Date & Time: {{start}} - {{end}} ({{timezone}})
📍 Location: {{location}}{{#if notes}}
📝 Notes: {{notes}}{{/if}}

Need to make changes?
Reschedule: {{rescheduleLink}}
Cancel: {{cancelLink}}

We look forward to meeting with you!

Best regards,
Maxence FOULON
`.trim();
  }

  static getReminderHtmlTemplate(): string {
    return process.env.REMINDER_HTML_TEMPLATE || `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Reminder</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B5CF6; color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .event-details { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
        .button { display: inline-block; padding: 12px 24px; background: #6B7280; color: white !important; text-decoration: none; border-radius: 6px; margin: 5px 10px 5px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6B7280; }
        .emoji { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="emoji">⏰</span> Appointment Reminder</h1>
            <p>Don't forget about your upcoming appointment</p>
        </div>
        <div class="content">
            <p>Hi {{attendeeName}},</p>
            <p>This is a reminder that you have an upcoming appointment:</p>
            
            <div class="event-details">
                <h3>{{eventTitle}}</h3>
                <p><strong><span class="emoji">📅</span> Date:</strong> {{start}}</p>
                <p><strong><span class="emoji">🕐</span> Time:</strong> {{start}} - {{end}}</p>
                <p><strong><span class="emoji">🌍</span> Timezone:</strong> {{timezone}}</p>
                <p><strong><span class="emoji">📍</span> Location:</strong> {{location}}</p>{{#if notes}}
                <p><strong><span class="emoji">📝</span> Notes:</strong> {{notes}}</p>{{/if}}
            </div>

            <h3><span class="emoji">📝</span> Need to make changes?</h3>
            <p>
                <a href="{{rescheduleLink}}" class="button">Reschedule</a>
                <a href="{{cancelLink}}" class="button">Cancel</a>
            </p>

            <div class="footer">
                <p>We look forward to meeting with you!</p>
                <p><strong>Maxence FOULON</strong><br>
                Portfolio Scheduler</p>
            </div>
        </div>
    </div>
</body>
</html>`.trim();
  }

  /**
   * Render confirmation email
   */
  static renderConfirmation(variables: TemplateVariables): { subject: string; text: string; html: string } {
    // Handle conditional content in templates
    let text = this.getConfirmationTextTemplate();
    let html = this.getConfirmationHtmlTemplate();

    // Simple conditional handling for notes
    if (variables.notes) {
      text = text.replace('{{#if notes}}', '').replace('{{/if}}', '');
      html = html.replace('{{#if notes}}', '').replace('{{/if}}', '');
    } else {
      text = text.replace(/\{\{#if notes\}\}[\s\S]*?\{\{\/if\}\}/g, '');
      html = html.replace(/\{\{#if notes\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    return {
      subject: this.getConfirmationSubject(variables),
      text: this.replaceVariables(text, variables),
      html: this.replaceVariables(html, variables)
    };
  }

  /**
   * Render reschedule email
   */
  static renderReschedule(variables: TemplateVariables): { subject: string; text: string; html: string } {
    let text = this.getRescheduleTextTemplate();
    let html = this.getRescheduleHtmlTemplate();

    // Handle old time conditionals
    if (variables.oldStart) {
      text = text.replace('{{#if oldStart}}', '').replace('{{/if}}', '');
      html = html.replace('{{#if oldStart}}', '').replace('{{/if}}', '');
    } else {
      text = text.replace(/\{\{#if oldStart\}\}[\s\S]*?\{\{\/if\}\}/g, '');
      html = html.replace(/\{\{#if oldStart\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    return {
      subject: this.getRescheduleSubject(variables),
      text: this.replaceVariables(text, variables),
      html: this.replaceVariables(html, variables)
    };
  }

  /**
   * Render cancellation email
   */
  static renderCancellation(variables: TemplateVariables): { subject: string; text: string; html: string } {
    let text = this.getCancellationTextTemplate();
    let html = this.getCancellationHtmlTemplate();

    // Handle reason conditionals
    if (variables.reason) {
      text = text.replace('{{#if reason}}', '').replace('{{/if}}', '');
      html = html.replace('{{#if reason}}', '').replace('{{/if}}', '');
    } else {
      text = text.replace(/\{\{#if reason\}\}[\s\S]*?\{\{\/if\}\}/g, '');
      html = html.replace(/\{\{#if reason\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    return {
      subject: this.getCancellationSubject(variables),
      text: this.replaceVariables(text, variables),
      html: this.replaceVariables(html, variables)
    };
  }

  /**
   * Render reminder email
   */
  static renderReminder(variables: TemplateVariables, hoursUntil: number): { subject: string; text: string; html: string } {
    let text = this.getReminderTextTemplate();
    let html = this.getReminderHtmlTemplate();

    // Handle notes conditionals
    if (variables.notes) {
      text = text.replace('{{#if notes}}', '').replace('{{/if}}', '');
      html = html.replace('{{#if notes}}', '').replace('{{/if}}', '');
    } else {
      text = text.replace(/\{\{#if notes\}\}[\s\S]*?\{\{\/if\}\}/g, '');
      html = html.replace(/\{\{#if notes\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    return {
      subject: this.getReminderSubject(variables, hoursUntil),
      text: this.replaceVariables(text, variables),
      html: this.replaceVariables(html, variables)
    };
  }
}