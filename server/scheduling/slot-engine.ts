import { DateTime } from 'luxon';
import Database from 'better-sqlite3';
import { 
  EventType, 
  AvailabilityRule, 
  AvailabilityException, 
  Booking, 
  AvailableSlot, 
  TimeSlot, 
  DayAvailability 
} from './types.js';

/**
 * Slot Engine for calculating available booking slots
 * Handles timezone conversion, DST, recurring rules, exceptions, and conflicts
 */
export class SlotEngine {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Get available slots for an event type within a date range
   */
  async getAvailableSlots(
    eventTypeId: number,
    startDate: string, // ISO date string
    endDate: string, // ISO date string
    userTimezone: string = 'UTC'
  ): Promise<AvailableSlot[]> {
    // Validate timezone
    if (!this.isValidTimezone(userTimezone)) {
      throw new Error(`Invalid timezone: ${userTimezone}`);
    }

    // Get event type
    const eventType = this.getEventType(eventTypeId);
    if (!eventType || !eventType.is_active) {
      throw new Error('Event type not found or not active');
    }

    // Parse date range
    const start = DateTime.fromISO(startDate).startOf('day');
    const end = DateTime.fromISO(endDate).endOf('day');
    
    if (!start.isValid || !end.isValid) {
      throw new Error('Invalid date range');
    }

    if (start > end) {
      throw new Error('Start date must be before end date');
    }

    // Check lead time and max advance constraints
    const now = DateTime.now();
    const minBookingTime = now.plus({ hours: eventType.min_lead_time_hours });
    const maxBookingTime = now.plus({ days: eventType.max_advance_days });

    if (end < minBookingTime) {
      return []; // Entire range is too soon
    }

    const effectiveStart = DateTime.max(start, minBookingTime);
    const effectiveEnd = DateTime.min(end, maxBookingTime);

    if (effectiveStart > effectiveEnd) {
      return []; // No valid time range
    }

    // Get availability rules and exceptions
    const rules = this.getAvailabilityRules(eventTypeId);
    const exceptions = this.getAvailabilityExceptions(eventTypeId, effectiveStart, effectiveEnd);
    const existingBookings = this.getExistingBookings(eventTypeId, effectiveStart, effectiveEnd);

    // Generate slots for each day
    const allSlots: AvailableSlot[] = [];
    let currentDate = effectiveStart.startOf('day');

    while (currentDate <= effectiveEnd) {
      const daySlots = this.generateDaySlots(
        currentDate,
        eventType,
        rules,
        exceptions,
        existingBookings,
        userTimezone
      );
      allSlots.push(...daySlots);
      currentDate = currentDate.plus({ days: 1 });
    }

    return allSlots.sort((a, b) => a.startUTC.localeCompare(b.startUTC));
  }

  /**
   * Generate available slots for a specific day
   */
  private generateDaySlots(
    date: DateTime,
    eventType: EventType,
    rules: AvailabilityRule[],
    exceptions: AvailabilityException[],
    existingBookings: Booking[],
    userTimezone: string
  ): AvailableSlot[] {
    const dayOfWeek = date.weekday % 7; // Convert to 0=Sunday format
    
    // Check for availability exceptions on this date
    const dateStr = date.toISODate();
    const dayException = exceptions.find(exc => exc.exception_date === dateStr);
    
    if (dayException?.exception_type === 'unavailable') {
      return []; // Entire day is unavailable
    }

    // Get applicable rules for this day
    let dayRules = rules.filter(rule => 
      rule.day_of_week === dayOfWeek && rule.is_active
    );

    // Override with custom hours if exception exists
    if (dayException?.exception_type === 'custom_hours' && dayException.start_time && dayException.end_time) {
      dayRules = [{
        id: -1,
        event_type_id: eventType.id,
        day_of_week: dayOfWeek,
        start_time: dayException.start_time,
        end_time: dayException.end_time,
        timezone: dayException.timezone || 'UTC',
        is_active: true,
        created_at: ''
      }];
    }

    if (dayRules.length === 0) {
      return []; // No availability rules for this day
    }

    // Generate time slots from rules
    const availableSlots: TimeSlot[] = [];
    
    for (const rule of dayRules) {
      const [startHour, startMin] = rule.start_time.split(':').map(Number);
      const [endHour, endMin] = rule.end_time.split(':').map(Number);
      
      // Create DateTime objects in the rule's timezone
      const ruleTimezone = rule.timezone || 'UTC';
      const startTime = date.setZone(ruleTimezone).set({ 
        hour: startHour, 
        minute: startMin, 
        second: 0, 
        millisecond: 0 
      });
      const endTime = date.setZone(ruleTimezone).set({ 
        hour: endHour, 
        minute: endMin, 
        second: 0, 
        millisecond: 0 
      });

      if (startTime.isValid && endTime.isValid && startTime < endTime) {
        availableSlots.push({
          start: startTime.toUTC().toJSDate(),
          end: endTime.toUTC().toJSDate()
        });
      }
    }

    // Merge overlapping slots
    const mergedSlots = this.mergeTimeSlots(availableSlots);

    // Generate bookable slots based on event duration
    const bookableSlots: AvailableSlot[] = [];
    
    for (const slot of mergedSlots) {
      const slotStart = DateTime.fromJSDate(slot.start);
      const slotEnd = DateTime.fromJSDate(slot.end);
      
      let currentSlotTime = slotStart;
      
      while (currentSlotTime.plus({ minutes: eventType.duration_minutes }) <= slotEnd) {
        const slotEndTime = currentSlotTime.plus({ minutes: eventType.duration_minutes });
        
        // Check for conflicts with existing bookings
        const hasConflict = this.hasBookingConflict(
          currentSlotTime.toJSDate(),
          slotEndTime.toJSDate(),
          existingBookings,
          eventType
        );

        if (!hasConflict) {
          // Check daily quota
          if (this.isWithinDailyQuota(date, eventType, existingBookings)) {
            bookableSlots.push({
              start: currentSlotTime.setZone(userTimezone).toISO(),
              end: slotEndTime.setZone(userTimezone).toISO(),
              startUTC: currentSlotTime.toISO(),
              endUTC: slotEndTime.toISO()
            });
          }
        }

        // Move to next possible slot (15-minute intervals)
        currentSlotTime = currentSlotTime.plus({ minutes: 15 });
      }
    }

    return bookableSlots;
  }

  /**
   * Check if there's a booking conflict considering buffers
   */
  private hasBookingConflict(
    newStart: Date,
    newEnd: Date,
    existingBookings: Booking[],
    eventType: EventType
  ): boolean {
    const bufferStart = DateTime.fromJSDate(newStart).minus({ minutes: eventType.buffer_before_minutes });
    const bufferEnd = DateTime.fromJSDate(newEnd).plus({ minutes: eventType.buffer_after_minutes });

    return existingBookings.some(booking => {
      if (booking.status !== 'confirmed') return false;
      
      const bookingStart = DateTime.fromISO(booking.start_time);
      const bookingEnd = DateTime.fromISO(booking.end_time);
      
      // Check for overlap with buffer
      return bufferStart < bookingEnd && bufferEnd > bookingStart;
    });
  }

  /**
   * Check if booking is within daily quota
   */
  private isWithinDailyQuota(
    date: DateTime,
    eventType: EventType,
    existingBookings: Booking[]
  ): boolean {
    if (!eventType.max_bookings_per_day) return true;

    const dayStart = date.startOf('day');
    const dayEnd = date.endOf('day');

    const dayBookings = existingBookings.filter(booking => {
      if (booking.status !== 'confirmed') return false;
      const bookingTime = DateTime.fromISO(booking.start_time);
      return bookingTime >= dayStart && bookingTime <= dayEnd;
    });

    return dayBookings.length < eventType.max_bookings_per_day;
  }

  /**
   * Merge overlapping time slots
   */
  private mergeTimeSlots(slots: TimeSlot[]): TimeSlot[] {
    if (slots.length === 0) return [];

    const sorted = slots.sort((a, b) => a.start.getTime() - b.start.getTime());
    const merged: TimeSlot[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const last = merged[merged.length - 1];

      if (current.start <= last.end) {
        // Overlapping, merge them
        last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()));
      } else {
        // No overlap, add as new slot
        merged.push(current);
      }
    }

    return merged;
  }

  /**
   * Validate timezone string
   */
  private isValidTimezone(timezone: string): boolean {
    try {
      DateTime.now().setZone(timezone);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Database queries
   */
  private getEventType(id: number): EventType | null {
    return this.db.prepare('SELECT * FROM event_types WHERE id = ? AND is_active = 1').get(id) as EventType || null;
  }

  private getAvailabilityRules(eventTypeId: number): AvailabilityRule[] {
    return this.db.prepare(`
      SELECT * FROM availability_rules 
      WHERE event_type_id = ? AND is_active = 1
      ORDER BY day_of_week, start_time
    `).all(eventTypeId) as AvailabilityRule[];
  }

  private getAvailabilityExceptions(
    eventTypeId: number, 
    startDate: DateTime, 
    endDate: DateTime
  ): AvailabilityException[] {
    return this.db.prepare(`
      SELECT * FROM availability_exceptions 
      WHERE event_type_id = ? 
        AND exception_date >= ? 
        AND exception_date <= ?
      ORDER BY exception_date
    `).all(
      eventTypeId, 
      startDate.toISODate(), 
      endDate.toISODate()
    ) as AvailabilityException[];
  }

  private getExistingBookings(
    eventTypeId: number,
    startDate: DateTime,
    endDate: DateTime,
    excludeBookingUuid?: string
  ): Booking[] {
    let query = `
      SELECT * FROM bookings 
      WHERE event_type_id = ? 
        AND status IN ('confirmed', 'rescheduled')
        AND start_time < ? 
        AND end_time > ?
    `;
    
    const params: any[] = [eventTypeId, endDate.toISO(), startDate.toISO()];
    
    if (excludeBookingUuid) {
      query += ' AND uuid != ?';
      params.push(excludeBookingUuid);
    }
    
    query += ' ORDER BY start_time';
    
    return this.db.prepare(query).all(...params) as Booking[];
  }

  /**
   * Check if a specific time slot is available for booking
   * Useful for admin rescheduling operations
   */
  async isSlotAvailable(
    eventTypeId: number,
    startTime: string,
    endTime: string,
    excludeBookingUuid?: string
  ): Promise<boolean> {
    try {
      const eventType = this.getEventType(eventTypeId);
      if (!eventType) return false;

      const start = DateTime.fromISO(startTime);
      const end = DateTime.fromISO(endTime);

      if (!start.isValid || !end.isValid) return false;
      if (end <= start) return false;

      // Check if slot duration matches event type
      const slotDuration = end.diff(start, 'minutes').minutes;
      if (slotDuration !== eventType.duration_minutes) return false;

      // Get available slots for the day
      const availableSlots = await this.getAvailableSlots(
        eventTypeId,
        start.startOf('day').toISO(),
        start.endOf('day').toISO(),
        'UTC'
      );

      // Check if the requested slot is in the available slots
      return availableSlots.some(slot => 
        slot.startUTC === startTime && slot.endUTC === endTime
      );
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }
  }
}