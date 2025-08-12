import express from 'express';
import Database from 'better-sqlite3';
import { z } from 'zod';
import { SlotEngine } from './slot-engine.js';
import { BookingService } from './booking-service.js';
import { EmailNotificationService } from './email-service.js';
import { ICSGenerator } from './ics-generator.js';
import { DateTime } from 'luxon';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Rate limiting configuration
const createRateLimiter = (windowMs: number, max: number, message: string) => 
  rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Different rate limits for different endpoints
const generalRateLimit = createRateLimiter(15 * 60 * 1000, 100, 'Too many requests, please try again later');
const bookingRateLimit = createRateLimiter(60 * 60 * 1000, 10, 'Too many booking attempts, please try again later');
const actionRateLimit = createRateLimiter(15 * 60 * 1000, 20, 'Too many action requests, please try again later');

// Validation schemas
const getAvailabilitySchema = z.object({
  eventTypeId: z.string().regex(/^\d+$/).transform(Number),
  start: z.string().datetime(),
  end: z.string().datetime(),
  timezone: z.string().optional().default('UTC')
});

const bookingRequestSchema = z.object({
  eventTypeId: z.coerce.number().positive(),
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  start: z.string().datetime(),
  end: z.string().datetime(),
  timezone: z.string().optional(),
  notes: z.string().max(1000).optional(),
  answers: z.array(z.object({
    questionId: z.number().positive(),
    answer: z.string().max(1000)
  })).optional(),
  consent: z.boolean().optional()
});

const rescheduleRequestSchema = z.object({
  bookingId: z.string().uuid(),
  token: z.string().min(1),
  newStart: z.string().datetime(),
  newEnd: z.string().datetime()
});

const cancelRequestSchema = z.object({
  bookingId: z.string().uuid(),
  token: z.string().min(1),
  reason: z.string().max(500).optional()
});

/**
 * Initialize scheduling routes
 */
export function initializeSchedulingRoutes(
  app: express.Application, 
  db: Database.Database
): void {
  // Initialize services
  const slotEngine = new SlotEngine(db);
  const actionTokenSecret = process.env.ACTION_TOKEN_SECRET || 'default-secret-change-in-production';
  const bookingService = new BookingService(db, actionTokenSecret);
  const emailService = new EmailNotificationService(db);

  // Initialize new notification service
  const initializeNotificationService = async () => {
    try {
      const { NotificationService } = await import('../notifications/notifier.js');
      const notificationService = new NotificationService(db);
      
      // Connect notification service to booking service
      bookingService.setNotificationService(notificationService);
      
      console.log('✅ Notification service connected to booking service');
    } catch (error) {
      console.error('❌ Failed to initialize notification service in routes:', error);
    }
  };
  
  // Initialize notifications asynchronously
  initializeNotificationService();

  // Apply rate limiting to all scheduling routes
  router.use(generalRateLimit);

  /**
   * GET /api/scheduling/health
   * Health check for scheduling service
   */
  router.get('/health', (req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  /**
   * GET /api/scheduling/availability
   * Get available time slots for an event type
   */
  router.get('/availability', async (req, res) => {
    try {
      const validation = getAvailabilitySchema.safeParse(req.query);
      
      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request parameters',
          details: validation.error.errors
        });
      }

      const { eventTypeId, start, end, timezone } = validation.data;

      // Validate date range
      const startDate = DateTime.fromISO(start);
      const endDate = DateTime.fromISO(end);
      
      if (endDate <= startDate) {
        return res.status(400).json({
          error: 'End date must be after start date'
        });
      }

      const daysDiff = endDate.diff(startDate, 'days').days;
      if (daysDiff > 90) {
        return res.status(400).json({
          error: 'Date range cannot exceed 90 days'
        });
      }

      // Get event type
      const eventType = db.prepare('SELECT * FROM event_types WHERE id = ? AND is_active = 1').get(eventTypeId);
      if (!eventType) {
        return res.status(404).json({
          error: 'Event type not found'
        });
      }

      // Get available slots
      const availableSlots = await slotEngine.getAvailableSlots(eventTypeId, start, end, timezone);

      res.json({
        eventType,
        availableSlots,
        timezone
      });

    } catch (error) {
      console.error(`Scheduling API error: GET ${req.path} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /api/scheduling/event-types
   * Get list of available event types
   */
  router.get('/event-types', (req, res) => {
    try {
      const eventTypes = db.prepare(`
        SELECT * FROM event_types 
        WHERE is_active = 1 
        ORDER BY duration_minutes ASC
      `).all();

      res.json({ eventTypes });

    } catch (error) {
      console.error(`Scheduling API error: GET ${req.path} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  /**
   * POST /api/scheduling/book
   * Create a new booking
   */
  router.post('/book', bookingRateLimit, async (req, res) => {
    try {
      const validation = bookingRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid booking request',
          details: validation.error.errors
        });
      }

      const bookingRequest = validation.data;
      const result = await bookingService.createBooking(bookingRequest);

      if (result.success) {
        // Send confirmation email asynchronously
        if (result.booking) {
          const booking = await getBookingWithDetails(db, result.booking.uuid);
          if (booking) {
            emailService.sendBookingConfirmation(
              booking.booking,
              booking.eventType,
              booking.invitee,
              result.booking.rescheduleToken,
              result.booking.cancelToken
            ).catch(error => {
              console.error('Error sending booking confirmation email:', error);
            });
          }
        }

        res.status(201).json(result);
      } else {
        // Determine appropriate status code based on error
        let statusCode = 400;
        if (result.error?.includes('no longer available')) {
          statusCode = 409; // Conflict
        } else if (result.error?.includes('not found')) {
          statusCode = 404;
        }

        res.status(statusCode).json(result);
      }

    } catch (error) {
      console.error(`Scheduling API error: POST ${req.path} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  /**
   * POST /api/scheduling/reschedule
   * Reschedule an existing booking
   */
  router.post('/reschedule', actionRateLimit, async (req, res) => {
    try {
      const validation = rescheduleRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid reschedule request',
          details: validation.error.errors
        });
      }

      const rescheduleRequest = validation.data;
      const result = await bookingService.rescheduleBooking(rescheduleRequest);

      if (result.success && result.booking) {
        // Send reschedule notification email asynchronously
        const booking = await getBookingWithDetails(db, rescheduleRequest.bookingId);
        if (booking) {
          // Generate new tokens
          const newRescheduleToken = generateActionToken(actionTokenSecret, booking.booking.uuid, 'reschedule');
          const newCancelToken = generateActionToken(actionTokenSecret, booking.booking.uuid, 'cancel');
          
          emailService.sendRescheduleNotification(
            booking.booking,
            booking.eventType,
            booking.invitee,
            booking.booking.start_time, // This will be the old time before update
            newRescheduleToken,
            newCancelToken
          ).catch(error => {
            console.error('Error sending reschedule notification email:', error);
          });
        }
      }

      res.json(result);

    } catch (error) {
      console.error(`Scheduling API error: POST ${req.path} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  /**
   * POST /api/scheduling/cancel
   * Cancel an existing booking
   */
  router.post('/cancel', actionRateLimit, async (req, res) => {
    try {
      const validation = cancelRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid cancel request',
          details: validation.error.errors
        });
      }

      const cancelRequest = validation.data;
      const result = await bookingService.cancelBooking(cancelRequest);

      if (result.success) {
        // Send cancellation notification email asynchronously
        const booking = await getBookingWithDetails(db, cancelRequest.bookingId);
        if (booking) {
          emailService.sendCancellationNotification(
            booking.booking,
            booking.eventType,
            booking.invitee,
            cancelRequest.reason
          ).catch(error => {
            console.error('Error sending cancellation notification email:', error);
          });
        }
      }

      res.json(result);

    } catch (error) {
      console.error(`Scheduling API error: POST ${req.path} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /api/scheduling/booking/:uuid/calendar.ics
   * Download ICS calendar file for a booking
   */
  router.get('/booking/:uuid/calendar.ics', (req, res) => {
    try {
      const bookingUuid = req.params.uuid;
      
      if (!bookingUuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return res.status(400).json({
          error: 'Invalid booking UUID'
        });
      }

      const booking = getBookingWithDetails(db, bookingUuid);
      if (!booking) {
        return res.status(404).json({
          error: 'Booking not found'
        });
      }

      const icsContent = ICSGenerator.generateICS(booking.booking, booking.eventType, booking.invitee);
      const filename = ICSGenerator.generateFilename(booking.eventType, DateTime.fromISO(booking.booking.start_time));
      const headers = ICSGenerator.getICSHeaders(filename);

      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      res.send(icsContent);

    } catch (error) {
      console.error(`Scheduling API error: GET ${req.path} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /api/scheduling/booking/:uuid
   * Get booking details (public, limited info)
   */
  router.get('/booking/:uuid', (req, res) => {
    try {
      const bookingUuid = req.params.uuid;
      
      if (!bookingUuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return res.status(400).json({
          error: 'Invalid booking UUID'
        });
      }

      const booking = getBookingWithDetails(db, bookingUuid);
      if (!booking) {
        return res.status(404).json({
          error: 'Booking not found'
        });
      }

      // Return limited public information
      const { booking: bookingData, eventType, invitee } = booking;
      res.json({
        uuid: bookingData.uuid,
        eventType: {
          name: eventType.name,
          duration_minutes: eventType.duration_minutes,
          location_type: eventType.location_type,
          color: eventType.color
        },
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        status: bookingData.status,
        invitee: {
          name: invitee.name
          // Don't expose email for privacy
        }
      });

    } catch (error) {
      console.error(`Scheduling API error: GET ${req.path} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  // Mount the router
  app.use('/api/scheduling', router);
}

/**
 * Helper function to get booking with all related details
 */
function getBookingWithDetails(db: Database.Database, bookingUuid: string) {
  const result = db.prepare(`
    SELECT 
      b.*,
      et.*,
      i.name as invitee_name,
      i.email as invitee_email,
      i.timezone as invitee_timezone,
      i.notes as invitee_notes,
      i.created_at as invitee_created_at
    FROM bookings b
    JOIN event_types et ON b.event_type_id = et.id
    JOIN invitees i ON b.id = i.booking_id
    WHERE b.uuid = ?
  `).get(bookingUuid) as any;

  if (!result) return null;

  return {
    booking: {
      id: result.id,
      uuid: result.uuid,
      event_type_id: result.event_type_id,
      start_time: result.start_time,
      end_time: result.end_time,
      status: result.status,
      created_at: result.created_at,
      updated_at: result.updated_at,
      cancelled_at: result.cancelled_at,
      cancellation_reason: result.cancellation_reason
    },
    eventType: {
      id: result.event_type_id,
      name: result.name,
      description: result.description,
      duration_minutes: result.duration_minutes,
      location_type: result.location_type,
      color: result.color,
      is_active: result.is_active,
      max_bookings_per_day: result.max_bookings_per_day,
      buffer_before_minutes: result.buffer_before_minutes,
      buffer_after_minutes: result.buffer_after_minutes,
      min_lead_time_hours: result.min_lead_time_hours,
      max_advance_days: result.max_advance_days,
      created_at: result.created_at,
      updated_at: result.updated_at
    },
    invitee: {
      id: 0,
      booking_id: result.id,
      name: result.invitee_name,
      email: result.invitee_email,
      timezone: result.invitee_timezone,
      notes: result.invitee_notes,
      created_at: result.invitee_created_at
    }
  };
}

/**
 * Helper function to generate action tokens
 */
function generateActionToken(secret: string, bookingUuid: string, action: string): string {
  const payload = {
    bookingUuid,
    action,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (168 * 3600) // 7 days
  };

  return jwt.sign(payload, secret);
}