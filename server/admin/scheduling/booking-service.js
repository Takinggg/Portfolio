import { DateTime } from 'luxon';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { SlotEngine } from './slot-engine.js';
/**
 * Booking Service for managing scheduling operations
 * Handles booking creation, rescheduling, cancellation with anti-conflict logic
 */
export class BookingService {
    db;
    slotEngine;
    actionTokenSecret;
    actionTokenTTL;
    constructor(db, actionTokenSecret, actionTokenTTLHours = 168 // 7 days default
    ) {
        this.db = db;
        this.slotEngine = new SlotEngine(db);
        this.actionTokenSecret = actionTokenSecret;
        this.actionTokenTTL = actionTokenTTLHours;
    }
    /**
     * Create a new booking with anti-conflict validation
     */
    async createBooking(request) {
        try {
            // Validate the booking request
            const validation = this.validateBookingRequest(request);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }
            // Get event type
            const eventType = this.getEventType(request.eventTypeId);
            if (!eventType) {
                return { success: false, error: 'Event type not found' };
            }
            // Parse and validate times
            const startTime = DateTime.fromISO(request.start);
            const endTime = DateTime.fromISO(request.end);
            if (!startTime.isValid || !endTime.isValid) {
                return { success: false, error: 'Invalid start or end time' };
            }
            // Validate duration matches event type
            const duration = endTime.diff(startTime, 'minutes').minutes;
            if (duration !== eventType.duration_minutes) {
                return { success: false, error: 'Duration does not match event type' };
            }
            // Check if slot is still available (anti-double-booking)
            const isAvailable = await this.isSlotAvailable(request.eventTypeId, startTime.toJSDate(), endTime.toJSDate());
            if (!isAvailable) {
                return { success: false, error: 'Selected time slot is no longer available' };
            }
            // Generate booking UUID
            const bookingUuid = crypto.randomUUID();
            // Start transaction
            const transaction = this.db.transaction(() => {
                // Insert booking
                const bookingResult = this.db.prepare(`
          INSERT INTO bookings (uuid, event_type_id, start_time, end_time, status)
          VALUES (?, ?, ?, ?, 'confirmed')
        `).run(bookingUuid, request.eventTypeId, startTime.toISO(), endTime.toISO());
                const bookingId = bookingResult.lastInsertRowid;
                // Insert invitee
                this.db.prepare(`
          INSERT INTO invitees (booking_id, name, email, timezone, notes)
          VALUES (?, ?, ?, ?, ?)
        `).run(bookingId, request.name, request.email, request.timezone || 'UTC', request.notes || null);
                // Insert question answers if provided
                if (request.answers && request.answers.length > 0) {
                    const answerStmt = this.db.prepare(`
            INSERT INTO question_answers (booking_id, question_id, answer_text)
            VALUES (?, ?, ?)
          `);
                    for (const answer of request.answers) {
                        answerStmt.run(bookingId, answer.questionId, answer.answer);
                    }
                }
                return bookingId;
            });
            const bookingId = transaction();
            // Generate action tokens
            const rescheduleToken = this.generateActionToken(bookingUuid, 'reschedule');
            const cancelToken = this.generateActionToken(bookingUuid, 'cancel');
            // Get booking details for response
            const booking = this.getBookingDetails(bookingUuid);
            if (!booking) {
                return { success: false, error: 'Failed to retrieve booking details' };
            }
            // Convert times to user timezone for response
            const userTimezone = request.timezone || 'UTC';
            const startInUserTz = startTime.setZone(userTimezone);
            const endInUserTz = endTime.setZone(userTimezone);
            return {
                success: true,
                booking: {
                    uuid: bookingUuid,
                    eventType,
                    start: startInUserTz.toISO(),
                    end: endInUserTz.toISO(),
                    invitee: {
                        name: request.name,
                        email: request.email,
                        timezone: userTimezone,
                        notes: request.notes
                    },
                    icsUrl: this.generateICSUrl(bookingUuid),
                    googleCalendarUrl: this.generateGoogleCalendarUrl(booking, eventType),
                    rescheduleToken,
                    cancelToken
                }
            };
        }
        catch (error) {
            console.error('Error creating booking:', error);
            return { success: false, error: 'Internal server error' };
        }
    }
    /**
     * Reschedule an existing booking
     */
    async rescheduleBooking(request) {
        try {
            // Verify token
            const tokenPayload = this.verifyActionToken(request.token, 'reschedule');
            if (!tokenPayload) {
                return { success: false, message: 'Invalid or expired reschedule token' };
            }
            // Get existing booking
            const booking = this.getBooking(request.bookingId);
            if (!booking || booking.uuid !== tokenPayload.bookingUuid) {
                return { success: false, message: 'Booking not found' };
            }
            if (booking.status !== 'confirmed') {
                return { success: false, message: 'Cannot reschedule a cancelled booking' };
            }
            // Validate new times
            const newStart = DateTime.fromISO(request.newStart);
            const newEnd = DateTime.fromISO(request.newEnd);
            if (!newStart.isValid || !newEnd.isValid) {
                return { success: false, message: 'Invalid new start or end time' };
            }
            // Check if new slot is available (excluding current booking)
            const isAvailable = await this.isSlotAvailable(booking.event_type_id, newStart.toJSDate(), newEnd.toJSDate(), booking.id);
            if (!isAvailable) {
                return { success: false, message: 'Selected time slot is not available' };
            }
            // Update booking
            this.db.prepare(`
        UPDATE bookings 
        SET start_time = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newStart.toISO(), newEnd.toISO(), booking.id);
            return {
                success: true,
                message: 'Booking rescheduled successfully',
                booking: { ...booking, start_time: newStart.toISO(), end_time: newEnd.toISO() }
            };
        }
        catch (error) {
            console.error('Error rescheduling booking:', error);
            return { success: false, message: 'Internal server error' };
        }
    }
    /**
     * Cancel an existing booking
     */
    async cancelBooking(request) {
        try {
            // Verify token
            const tokenPayload = this.verifyActionToken(request.token, 'cancel');
            if (!tokenPayload) {
                return { success: false, message: 'Invalid or expired cancellation token' };
            }
            // Get existing booking
            const booking = this.getBooking(request.bookingId);
            if (!booking || booking.uuid !== tokenPayload.bookingUuid) {
                return { success: false, message: 'Booking not found' };
            }
            if (booking.status === 'cancelled') {
                return { success: false, message: 'Booking is already cancelled' };
            }
            // Update booking status
            this.db.prepare(`
        UPDATE bookings 
        SET status = 'cancelled', 
            cancelled_at = CURRENT_TIMESTAMP,
            cancellation_reason = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(request.reason || null, booking.id);
            return {
                success: true,
                message: 'Booking cancelled successfully',
                booking: { ...booking, status: 'cancelled', cancelled_at: new Date().toISOString() }
            };
        }
        catch (error) {
            console.error('Error cancelling booking:', error);
            return { success: false, message: 'Internal server error' };
        }
    }
    /**
     * Check if a time slot is available for booking
     */
    async isSlotAvailable(eventTypeId, startTime, endTime, excludeBookingId) {
        // Get available slots for the date range
        const startDate = DateTime.fromJSDate(startTime).toISODate();
        const endDate = DateTime.fromJSDate(endTime).toISODate();
        const availableSlots = await this.slotEngine.getAvailableSlots(eventTypeId, startDate, endDate, 'UTC');
        // Check if requested time matches any available slot
        const requestedStart = DateTime.fromJSDate(startTime);
        const requestedEnd = DateTime.fromJSDate(endTime);
        const hasMatchingSlot = availableSlots.some(slot => {
            const slotStart = DateTime.fromISO(slot.startUTC);
            const slotEnd = DateTime.fromISO(slot.endUTC);
            return slotStart.equals(requestedStart) && slotEnd.equals(requestedEnd);
        });
        if (!hasMatchingSlot)
            return false;
        // Additional check for existing bookings (excluding the specified booking)
        let query = `
      SELECT COUNT(*) as count FROM bookings 
      WHERE event_type_id = ? 
        AND status = 'confirmed'
        AND (
          (start_time < ? AND end_time > ?) OR  -- Overlap check
          (start_time < ? AND end_time > ?)
        )
    `;
        const params = [
            eventTypeId,
            endTime.toISOString(), startTime.toISOString(),
            endTime.toISOString(), startTime.toISOString()
        ];
        if (excludeBookingId) {
            query += ' AND id != ?';
            params.push(excludeBookingId);
        }
        const result = this.db.prepare(query).get(...params);
        return result.count === 0;
    }
    /**
     * Validation helpers
     */
    validateBookingRequest(request) {
        if (!request.name?.trim()) {
            return { valid: false, error: 'Name is required' };
        }
        if (!request.email?.trim() || !this.isValidEmail(request.email)) {
            return { valid: false, error: 'Valid email is required' };
        }
        if (!request.start || !request.end) {
            return { valid: false, error: 'Start and end times are required' };
        }
        if (request.eventTypeId <= 0) {
            return { valid: false, error: 'Valid event type ID is required' };
        }
        return { valid: true };
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Token management
     */
    generateActionToken(bookingUuid, action) {
        const payload = {
            bookingUuid,
            action,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (this.actionTokenTTL * 3600)
        };
        return jwt.sign(payload, this.actionTokenSecret);
    }
    verifyActionToken(token, expectedAction) {
        try {
            const payload = jwt.verify(token, this.actionTokenSecret);
            if (payload.action !== expectedAction) {
                return null;
            }
            return payload;
        }
        catch {
            return null;
        }
    }
    /**
     * URL generation
     */
    generateICSUrl(bookingUuid) {
        return `/api/scheduling/booking/${bookingUuid}/calendar.ics`;
    }
    generateGoogleCalendarUrl(booking, eventType) {
        const startTime = DateTime.fromISO(booking.start_time);
        const endTime = DateTime.fromISO(booking.end_time);
        const googleStart = startTime.toFormat('yyyyMMdd\'T\'HHmmss\'Z\'');
        const googleEnd = endTime.toFormat('yyyyMMdd\'T\'HHmmss\'Z\'');
        const title = encodeURIComponent(eventType.name);
        const details = encodeURIComponent(`Scheduled ${eventType.name} meeting`);
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${googleStart}/${googleEnd}&details=${details}`;
    }
    /**
     * Database queries
     */
    getEventType(id) {
        return this.db.prepare('SELECT * FROM event_types WHERE id = ? AND is_active = 1').get(id) || null;
    }
    getBooking(bookingId) {
        return this.db.prepare('SELECT * FROM bookings WHERE uuid = ?').get(bookingId) || null;
    }
    getBookingDetails(bookingUuid) {
        const result = this.db.prepare(`
      SELECT 
        b.*,
        i.name as invitee_name,
        i.email as invitee_email,
        i.timezone as invitee_timezone,
        i.notes as invitee_notes
      FROM bookings b
      JOIN invitees i ON b.id = i.booking_id
      WHERE b.uuid = ?
    `).get(bookingUuid);
        if (!result)
            return null;
        return {
            ...result,
            invitee: {
                id: 0,
                booking_id: result.id,
                name: result.invitee_name,
                email: result.invitee_email,
                timezone: result.invitee_timezone,
                notes: result.invitee_notes,
                created_at: result.created_at
            }
        };
    }
    /**
     * Admin-only booking cancellation without token validation
     * Returns structured result with success boolean and message
     */
    async cancelBooking(bookingUuid, reason = null) {
        try {
            // Validate input 
            if (!bookingUuid || typeof bookingUuid !== 'string') {
                return { success: false, message: 'Valid booking UUID is required' };
            }

            const booking = this.getBooking(bookingUuid);
            if (!booking) {
                return { success: false, message: 'Booking not found' };
            }
            if (booking.status === 'cancelled') {
                return { success: false, message: 'Booking is already cancelled' };
            }
            
            // Update booking status
            const stmt = this.db.prepare(`
        UPDATE bookings 
        SET status = 'cancelled', 
            cancelled_at = CURRENT_TIMESTAMP,
            cancellation_reason = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE uuid = ?
      `);
            stmt.run(reason || 'Cancelled by admin', bookingUuid);
            
            return {
                success: true,
                message: 'Booking cancelled successfully',
                booking: { uuid: bookingUuid, status: 'cancelled' }
            };
        }
        catch (error) {
            console.error('Error cancelling booking (admin):', error);
            return { success: false, message: 'Failed to cancel booking' };
        }
    }
    /**
     * Admin-only booking rescheduling without token validation  
     * Returns structured result with success boolean and message
     */
    async rescheduleBooking(bookingUuid, newStart, newEnd, reason = null) {
        try {
            // Validate input parameters
            if (!bookingUuid || typeof bookingUuid !== 'string') {
                return { success: false, message: 'Valid booking UUID is required' };
            }
            
            if (!newStart || !newEnd) {
                return { success: false, message: 'New start and end times are required' };
            }

            const booking = this.getBooking(bookingUuid);
            if (!booking) {
                return { success: false, message: 'Booking not found' };
            }
            if (booking.status !== 'confirmed') {
                return { success: false, message: 'Only confirmed bookings can be rescheduled' };
            }
            
            // Validate new time slot with safe date parsing
            const startTime = DateTime.fromISO(newStart);
            const endTime = DateTime.fromISO(newEnd);
            if (!startTime.isValid || !endTime.isValid) {
                return { success: false, message: 'Invalid date format. Please use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)' };
            }
            if (endTime <= startTime) {
                return { success: false, message: 'End time must be after start time' };
            }
            
            // Get event type to validate duration
            const eventType = this.getEventType(booking.event_type_id);
            if (!eventType) {
                console.warn(`❌ Event type ${booking.event_type_id} not found or is inactive`);
                return { success: false, message: `Event type with ID ${booking.event_type_id} not found or is inactive` };
            }
            
            // Validate duration matches event type
            const duration = endTime.diff(startTime, 'minutes').minutes;
            if (duration !== eventType.duration_minutes) {
                return { 
                    success: false, 
                    message: `Duration mismatch: expected ${eventType.duration_minutes} minutes, got ${duration} minutes` 
                };
            }
            
            // Check if new slot is available (excluding current booking)
            const isSlotAvailable = await this.slotEngine.isSlotAvailable(
                booking.event_type_id, 
                newStart, 
                newEnd, 
                bookingUuid // Exclude current booking from overlap check
            );
            if (!isSlotAvailable) {
                return { success: false, message: 'Selected time slot is not available' };
            }
            
            // Update booking
            const stmt = this.db.prepare(`
        UPDATE bookings 
        SET start_time = ?, 
            end_time = ?,
            status = 'rescheduled',
            updated_at = CURRENT_TIMESTAMP
        WHERE uuid = ?
      `);
            stmt.run(newStart, newEnd, bookingUuid);
            
            return {
                success: true,
                message: 'Booking rescheduled successfully',
                booking: {
                    uuid: bookingUuid,
                    start_time: newStart,
                    end_time: newEnd,
                    status: 'rescheduled'
                }
            };
        }
        catch (error) {
            console.error('Error rescheduling booking (admin):', error);
            return { success: false, message: 'Failed to reschedule booking' };
        }
    }
}
