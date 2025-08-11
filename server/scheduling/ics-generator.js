import { DateTime } from 'luxon';

/**
 * ICS (iCalendar) file generator for booking events
 * Generates RFC 5545 compliant calendar files
 */
export class ICSGenerator {
  
  /**
   * Generate ICS content for a booking
   */
  static generateICS(booking, eventType, invitee) {
    const startTime = DateTime.fromISO(booking.start_time);
    const endTime = DateTime.fromISO(booking.end_time);
    const now = DateTime.now();

    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    const formatForICS = (dt) => dt.toFormat('yyyyMMdd\'T\'HHmmss\'Z\'');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Portfolio Scheduler//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:booking-${booking.uuid}@maxence.design`,
      `DTSTAMP:${formatForICS(now)}`,
      `DTSTART:${formatForICS(startTime)}`,
      `DTEND:${formatForICS(endTime)}`,
      `SUMMARY:${this.escapeICSText(eventType.name)}`,
      `DESCRIPTION:${this.escapeICSText(this.generateDescription(eventType, invitee))}`,
      `ORGANIZER;CN=Maxence:MAILTO:contact@maxence.design`,
      `ATTENDEE;CN=${this.escapeICSText(invitee.name)};RSVP=TRUE:MAILTO:${invitee.email}`,
      `LOCATION:${this.escapeICSText(this.getLocationText(eventType.location_type))}`,
      `STATUS:CONFIRMED`,
      `SEQUENCE:0`,
      `PRIORITY:5`,
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${this.escapeICSText(eventType.name)} in 15 minutes`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  }

  /**
   * Generate booking description for calendar
   */
  static generateDescription(eventType, invitee) {
    const lines = [
      `Scheduled ${eventType.name}`,
      '',
      `Duration: ${eventType.duration_minutes} minutes`,
      `Location: ${this.getLocationText(eventType.location_type)}`,
      '',
      `Attendee: ${invitee.name} (${invitee.email})`
    ];

    if (invitee.notes?.trim()) {
      lines.push('', 'Notes:', invitee.notes.trim());
    }

    if (eventType.description?.trim()) {
      lines.push('', 'About this meeting:', eventType.description.trim());
    }

    lines.push(
      '',
      'Need to reschedule or cancel?',
      'Check your confirmation email for links.',
      '',
      'Powered by Portfolio Scheduler'
    );

    return lines.join('\\n');
  }

  /**
   * Get human-readable location text
   */
  static getLocationText(locationType) {
    switch (locationType) {
      case 'visio':
        return 'Video Conference (details will be provided)';
      case 'physique':
        return 'In-Person Meeting (location will be confirmed)';
      case 'telephone':
        return 'Phone Call (number will be provided)';
      default:
        return 'Details will be provided';
    }
  }

  /**
   * Escape special characters for ICS format
   */
  static escapeICSText(text) {
    return text
      .replace(/\\/g, '\\\\')  // Backslash
      .replace(/;/g, '\\;')    // Semicolon
      .replace(/,/g, '\\,')    // Comma
      .replace(/\n/g, '\\n')   // Newline
      .replace(/\r/g, '')      // Remove carriage return
      .trim();
  }

  /**
   * Generate MIME headers for ICS download
   */
  static getICSHeaders(filename) {
    const actualFilename = filename || 'calendar-event.ics';
    
    return {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${actualFilename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }

  /**
   * Generate filename for ICS download
   */
  static generateFilename(eventType, startTime) {
    const dateStr = startTime.toFormat('yyyy-MM-dd');
    const eventName = eventType.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `${eventName}-${dateStr}.ics`;
  }

  /**
   * Generate Google Calendar URL
   */
  static generateGoogleCalendarUrl(booking, eventType, invitee) {
    const startTime = DateTime.fromISO(booking.start_time);
    const endTime = DateTime.fromISO(booking.end_time);
    
    const googleStart = startTime.toFormat('yyyyMMdd\'T\'HHmmss\'Z\'');
    const googleEnd = endTime.toFormat('yyyyMMdd\'T\'HHmmss\'Z\'');
    
    const title = encodeURIComponent(eventType.name);
    const details = encodeURIComponent([
      `Scheduled ${eventType.name}`,
      `Duration: ${eventType.duration_minutes} minutes`,
      `Location: ${this.getLocationText(eventType.location_type)}`,
      `Attendee: ${invitee.name} (${invitee.email})`,
      invitee.notes ? `Notes: ${invitee.notes}` : '',
      eventType.description ? `About: ${eventType.description}` : ''
    ].filter(Boolean).join('\\n'));
    
    const location = encodeURIComponent(this.getLocationText(eventType.location_type));
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${googleStart}/${googleEnd}`,
      details: details,
      location: location,
      trp: 'false'
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }
}