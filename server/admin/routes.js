import express from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { basicAuthMiddleware, getClientIP, getUserAgent } from './middleware.js';
import { AdminAuditService } from './audit.js';
import { SlotEngine } from '../scheduling/slot-engine.js';
import { BookingService } from '../scheduling/booking-service.js';
import { DateTime } from 'luxon';
import {
  paginationSchema,
  idParamSchema,
  dateRangeQuerySchema,
  availabilityExceptionSchema as validatorAvailabilityExceptionSchema,
  bookingFiltersSchema as validatorBookingFiltersSchema,
  uuidParamSchema,
  rescheduleRequestSchema,
  cancelRequestSchema
} from './scheduling/validators.js';

const router = express.Router();

// Keep original schemas for backward compatibility (until we migrate fully)
const eventTypeSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    duration_minutes: z.number().positive().max(480), // max 8 hours
    location_type: z.enum(['visio', 'physique', 'telephone']),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#3B82F6'),
    is_active: z.boolean().optional().default(true),
    max_bookings_per_day: z.number().positive().optional(),
    buffer_before_minutes: z.number().min(0).max(120).optional().default(0),
    buffer_after_minutes: z.number().min(0).max(120).optional().default(0),
    min_lead_time_hours: z.number().min(0).max(168).optional().default(1), // max 1 week
    max_advance_days: z.number().min(1).max(365).optional().default(30) // max 1 year
});

const availabilityRuleSchema = z.object({
    event_type_id: z.number().positive(),
    day_of_week: z.number().min(0).max(6), // 0=Sunday, 6=Saturday
    start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
    end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    timezone: z.string().optional().default('UTC'),
    is_active: z.boolean().optional().default(true)
});

// Use new validators, fallback to old for compatibility
const availabilityExceptionSchema = validatorAvailabilityExceptionSchema;
const bookingFiltersSchema = validatorBookingFiltersSchema;

/**
 * Initialize admin scheduling routes
 */
export function initializeAdminSchedulingRoutes(app, db) {
    /**
     * Helper function to create consistent error responses
     */
    const createErrorResponse = (code, message, details = null) => ({
      ok: false,
      error: { code, message },
      ...(details && { details })
    });

    /**
     * Helper function to check database health and table existence
     */
    const checkDatabaseHealth = (database) => {
      try {
        // Test basic connectivity
        database.prepare('SELECT 1').get();
        
        // Get all table names
        const tables = database.prepare(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `).all().map(t => t.name);
        
        // Check for critical scheduling tables
        const schedulingTables = tables.filter(name => 
          ['event_types', 'bookings', 'availability_rules', 'availability_exceptions', 'admin_audit_logs'].includes(name)
        );
        
        return {
          connected: true,
          tables: schedulingTables
        };
      } catch (error) {
        return {
          connected: false,
          error: error.message
        };
      }
    };

    /**
     * Helper function to wrap route handlers with consistent error handling
     */
    const wrapAsyncHandler = (handler) => {
      return async (req, res, next) => {
        try {
          await handler(req, res, next);
        } catch (error) {
          console.error(`Error in ${req.method} ${req.path}:`, error);
          res.status(500).json(createErrorResponse(
            'INTERNAL_SERVER_ERROR',
            'An internal server error occurred',
            process.env.NODE_ENV === 'development' ? error.message : undefined
          ));
        }
      };
    };

    /**
     * GET /api/admin/scheduling/health - Health check endpoint
     * This endpoint should never throw and always return a response
     */
    router.get('/health', (req, res) => {
      try {
        const adminEnabled = process.env.ADMIN_ENABLED === 'true';
        const hasCredentials = !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
        const hasActionTokenSecret = !!process.env.ACTION_TOKEN_SECRET;
        
        const dbHealth = checkDatabaseHealth(db);
        
        const health = {
          ok: true,
          adminEnabled,
          hasCredentials,
          hasActionTokenSecret,
          db: dbHealth,
          timestamp: new Date().toISOString()
        };
        
        res.json(health);
      } catch (error) {
        // Even if there's an error, return a valid response
        res.json({
          ok: false,
          error: 'Health check failed',
          timestamp: new Date().toISOString()
        });
      }
    });

    /**
     * GET /api/admin/scheduling/login - Login endpoint to trigger Basic Auth
     * Uses same Basic Auth middleware as other admin endpoints
     * Returns 401 with WWW-Authenticate if unauthenticated, 204 if authenticated
     */
    router.get('/login', (req, res, next) => {
      // Apply admin configuration checks and basic auth middleware
      checkAdminConfiguration(req, res, (err) => {
        if (err) return next(err);
        basicAuthMiddleware(req, res, (err) => {
          if (err) return next(err);
          // If we reach here, authentication was successful
          res.status(204).end(); // No Content - authentication successful
        });
      });
    });

    /**
     * Defensive configuration check middleware
     */
    const checkAdminConfiguration = (req, res, next) => {
      // Check if admin is enabled
      if (process.env.ADMIN_ENABLED !== 'true') {
        return res.status(503).json(createErrorResponse(
          'ADMIN_DISABLED',
          'Admin panel is disabled. Set ADMIN_ENABLED=true in environment variables.',
          { hint: 'Contact your system administrator to enable the admin panel.' }
        ));
      }
      
      // Check credentials
      if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
        return res.status(503).json(createErrorResponse(
          'ADMIN_CREDENTIALS_MISSING',
          'Admin credentials not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in environment variables.',
          { hint: 'Configure admin credentials to access the admin panel.' }
        ));
      }
      
      // Check action token secret
      if (!process.env.ACTION_TOKEN_SECRET) {
        return res.status(503).json(createErrorResponse(
          'ACTION_TOKEN_SECRET_MISSING',
          'Action token secret not configured. Set ACTION_TOKEN_SECRET in environment variables.',
          { hint: 'This is required for booking actions to work securely.' }
        ));
      }
      
      next();
    };

    // Admin-specific rate limiting - more restrictive than public API
    const adminRateLimit = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50, // 50 requests per window
        message: createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many admin requests, please try again later'),
        standardHeaders: true,
        legacyHeaders: false,
    });

    // Apply middleware selectively - health and login endpoints have special handling
    router.use((req, res, next) => {
      if (req.path === '/health' || req.path === '/login') {
        return next();
      }
      adminRateLimit(req, res, (err) => {
        if (err) return next(err);
        checkAdminConfiguration(req, res, (err) => {
          if (err) return next(err);
          basicAuthMiddleware(req, res, next);
        });
      });
    });

    const auditService = new AdminAuditService(db);
    const slotEngine = new SlotEngine(db);
    const actionTokenSecret = process.env.ACTION_TOKEN_SECRET || 'default-secret-change-in-production';
    const bookingService = new BookingService(db, actionTokenSecret);

    // Helper function to log admin actions
    const logAdminAction = (req, action, resourceType, resourceId, oldValues, newValues) => {
        auditService.logAction({
            admin_user: req.adminUser,
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            old_values: oldValues,
            new_values: newValues,
            ip_address: getClientIP(req),
            user_agent: getUserAgent(req)
        });
    };

    /**
     * GET /api/admin/scheduling/overview
     * Get admin dashboard overview
     */
    router.get('/overview', wrapAsyncHandler((req, res) => {
        const stats = {
            eventTypes: db.prepare('SELECT COUNT(*) as count FROM event_types WHERE is_active = 1').get(),
            availabilityRules: db.prepare('SELECT COUNT(*) as count FROM availability_rules WHERE is_active = 1').get(),
            totalBookings: db.prepare('SELECT COUNT(*) as count FROM bookings').get(),
            activeBookings: db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'").get(),
            todayBookings: db.prepare(`
              SELECT COUNT(*) as count FROM bookings 
              WHERE DATE(start_time) = DATE('now') AND status = 'confirmed'
            `).get(),
            upcomingBookings: db.prepare(`
              SELECT COUNT(*) as count FROM bookings 
              WHERE start_time > datetime('now') AND status = 'confirmed'
            `).get(),
            recentCancellations: db.prepare(`
              SELECT COUNT(*) as count FROM bookings 
              WHERE status = 'cancelled' AND cancelled_at > datetime('now', '-7 days')
            `).get()
        };
        const auditStats = auditService.getStats();
        res.json({
            stats,
            auditStats,
            timestamp: new Date().toISOString()
        });
        logAdminAction(req, 'view', 'overview');
    }));

    /**
     * Event Types CRUD Operations
     */

    // GET /api/admin/scheduling/event-types
    router.get('/event-types', wrapAsyncHandler((req, res) => {
        const validation = paginationSchema.safeParse(req.query);
        if (!validation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid pagination parameters',
                validation.error.issues
            ));
        }

        const { limit, offset } = validation.data;
        const eventTypes = db.prepare(`
            SELECT * FROM event_types 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `).all(limit, offset);

        res.json({ eventTypes });
        logAdminAction(req, 'list', 'event_types');
    }));

    // POST /api/admin/scheduling/event-types
    router.post('/event-types', wrapAsyncHandler((req, res) => {
        const validation = eventTypeSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid event type data',
                validation.error.issues
            ));
        }

        const data = validation.data;
        const result = db.prepare(`
            INSERT INTO event_types (
                name, description, duration_minutes, location_type, color,
                is_active, max_bookings_per_day, buffer_before_minutes,
                buffer_after_minutes, min_lead_time_hours, max_advance_days
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            data.name, data.description, data.duration_minutes, data.location_type,
            data.color, data.is_active ? 1 : 0, data.max_bookings_per_day,
            data.buffer_before_minutes, data.buffer_after_minutes,
            data.min_lead_time_hours, data.max_advance_days
        );

        const newEventType = db.prepare('SELECT * FROM event_types WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ eventType: newEventType });
        logAdminAction(req, 'create', 'event_types', result.lastInsertRowid.toString(), null, data);
    }));

    // PUT /api/admin/scheduling/event-types/:id
    router.put('/event-types/:id', wrapAsyncHandler((req, res) => {
        const idValidation = idParamSchema.safeParse(req.params);
        if (!idValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid ID parameter',
                idValidation.error.errors
            ));
        }

        const validation = eventTypeSchema.partial().safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid event type data',
                validation.error.issues
            ));
        }

        const eventTypeId = idValidation.data.id;
        const currentEventType = db.prepare('SELECT * FROM event_types WHERE id = ?').get(eventTypeId);
        if (!currentEventType) {
            return res.status(404).json(createErrorResponse(
                'NOT_FOUND',
                'Event type not found'
            ));
        }

        const data = validation.data;
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data).map(value => 
            typeof value === 'boolean' ? (value ? 1 : 0) : value
        );

        db.prepare(`UPDATE event_types SET ${setClause} WHERE id = ?`).run(...values, eventTypeId);
        const updatedEventType = db.prepare('SELECT * FROM event_types WHERE id = ?').get(eventTypeId);

        res.json({ eventType: updatedEventType });
        logAdminAction(req, 'update', 'event_types', eventTypeId.toString(), currentEventType, data);
    }));

    // DELETE /api/admin/scheduling/event-types/:id
    router.delete('/event-types/:id', wrapAsyncHandler((req, res) => {
        const idValidation = idParamSchema.safeParse(req.params);
        if (!idValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid ID parameter',
                idValidation.error.errors
            ));
        }

        const eventTypeId = idValidation.data.id;
        const currentEventType = db.prepare('SELECT * FROM event_types WHERE id = ?').get(eventTypeId);
        if (!currentEventType) {
            return res.status(404).json(createErrorResponse(
                'NOT_FOUND',
                'Event type not found'
            ));
        }

        const result = db.prepare('DELETE FROM event_types WHERE id = ?').run(eventTypeId);
        if (result.changes === 0) {
            return res.status(404).json(createErrorResponse(
                'NOT_FOUND',
                'Event type not found'
            ));
        }

        res.json({ success: true });
        logAdminAction(req, 'delete', 'event_types', eventTypeId.toString(), currentEventType, null);
    }));

    /**
     * Availability Rules Management
     */

    // GET /api/admin/scheduling/availability-rules
    router.get('/availability-rules', wrapAsyncHandler((req, res) => {
        const paginationValidation = paginationSchema.safeParse(req.query);
        if (!paginationValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid pagination parameters',
                paginationValidation.error.errors
            ));
        }

        const { limit, offset } = paginationValidation.data;
        const { event_type_id } = req.query;

        let query = `
            SELECT ar.*, et.name as event_type_name 
            FROM availability_rules ar
            LEFT JOIN event_types et ON ar.event_type_id = et.id
        `;
        const params = [];

        if (event_type_id) {
            const eventTypeIdNum = parseInt(event_type_id);
            if (isNaN(eventTypeIdNum) || eventTypeIdNum <= 0) {
                return res.status(400).json(createErrorResponse(
                    'VALIDATION_ERROR',
                    'Invalid event_type_id parameter'
                ));
            }
            query += ' WHERE ar.event_type_id = ?';
            params.push(eventTypeIdNum);
        }

        query += ' ORDER BY ar.event_type_id, ar.day_of_week, ar.start_time LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const rules = db.prepare(query).all(...params);
        res.json({ availabilityRules: rules });
        logAdminAction(req, 'list', 'availability_rules');
    }));

    // POST /api/admin/scheduling/availability-rules
    router.post('/availability-rules', wrapAsyncHandler((req, res) => {
        const validation = availabilityRuleSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid availability rule data',
                validation.error.issues
            ));
        }

        const data = validation.data;
        const result = db.prepare(`
            INSERT INTO availability_rules (
                event_type_id, day_of_week, start_time, end_time, timezone, is_active
            ) VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            data.event_type_id, data.day_of_week, data.start_time,
            data.end_time, data.timezone, data.is_active ? 1 : 0
        );

        const newRule = db.prepare('SELECT * FROM availability_rules WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ availabilityRule: newRule });
        logAdminAction(req, 'create', 'availability_rules', result.lastInsertRowid.toString(), null, data);
    }));

    // PUT /api/admin/scheduling/availability-rules/:id
    router.put('/availability-rules/:id', wrapAsyncHandler((req, res) => {
        const idValidation = idParamSchema.safeParse(req.params);
        if (!idValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid ID parameter',
                idValidation.error.errors
            ));
        }

        const validation = availabilityRuleSchema.partial().safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid availability rule data',
                validation.error.issues
            ));
        }

        const ruleId = idValidation.data.id;
        const currentRule = db.prepare('SELECT * FROM availability_rules WHERE id = ?').get(ruleId);
        if (!currentRule) {
            return res.status(404).json(createErrorResponse(
                'NOT_FOUND',
                'Availability rule not found'
            ));
        }

        const data = validation.data;
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data).map(value => 
            typeof value === 'boolean' ? (value ? 1 : 0) : value
        );

        db.prepare(`UPDATE availability_rules SET ${setClause} WHERE id = ?`).run(...values, ruleId);
        const updatedRule = db.prepare('SELECT * FROM availability_rules WHERE id = ?').get(ruleId);

        res.json({ availabilityRule: updatedRule });
        logAdminAction(req, 'update', 'availability_rules', ruleId.toString(), currentRule, data);
    }));

    // DELETE /api/admin/scheduling/availability-rules/:id
    router.delete('/availability-rules/:id', wrapAsyncHandler((req, res) => {
        const idValidation = idParamSchema.safeParse(req.params);
        if (!idValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid ID parameter',
                idValidation.error.errors
            ));
        }

        const ruleId = idValidation.data.id;
        const currentRule = db.prepare('SELECT * FROM availability_rules WHERE id = ?').get(ruleId);
        if (!currentRule) {
            return res.status(404).json(createErrorResponse(
                'NOT_FOUND',
                'Availability rule not found'
            ));
        }

        const result = db.prepare('DELETE FROM availability_rules WHERE id = ?').run(ruleId);
        if (result.changes === 0) {
            return res.status(404).json(createErrorResponse(
                'NOT_FOUND',
                'Availability rule not found'
            ));
        }

        res.json({ success: true });
        logAdminAction(req, 'delete', 'availability_rules', ruleId.toString(), currentRule, null);
    }));

    /**
     * Availability Exceptions Management  
     */

    // GET /api/admin/scheduling/exceptions
    router.get('/exceptions', wrapAsyncHandler((req, res) => {
        const paginationValidation = paginationSchema.safeParse(req.query);
        const dateRangeValidation = dateRangeQuerySchema.safeParse(req.query);
        
        if (!paginationValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid pagination parameters',
                paginationValidation.error.errors
            ));
        }
        
        if (!dateRangeValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid date range parameters',
                dateRangeValidation.error.errors
            ));
        }

        const { limit, offset } = paginationValidation.data;
        const { start_date, end_date } = dateRangeValidation.data;

        let query = `
            SELECT ae.*, et.name as event_type_name 
            FROM availability_exceptions ae
            LEFT JOIN event_types et ON ae.event_type_id = et.id
        `;
        const conditions = [];
        const params = [];

        if (start_date) {
            conditions.push('ae.exception_date >= ?');
            params.push(start_date);
        }

        if (end_date) {
            conditions.push('ae.exception_date <= ?');
            params.push(end_date);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY ae.exception_date DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const exceptions = db.prepare(query).all(...params);
        res.json({ availabilityExceptions: exceptions });
        logAdminAction(req, 'list', 'availability_exceptions');
    }));

    // POST /api/admin/scheduling/exceptions
    router.post('/exceptions', wrapAsyncHandler((req, res) => {
        const validation = availabilityExceptionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid availability exception data',
                validation.error.issues
            ));
        }

        const data = validation.data;

        // Validate custom hours if specified
        if (data.exception_type === 'custom_hours') {
            if (!data.start_time || !data.end_time) {
                return res.status(400).json(createErrorResponse(
                    'VALIDATION_ERROR',
                    'Start time and end time are required for custom hours',
                    { field: 'start_time, end_time' }
                ));
            }
        }

        const result = db.prepare(`
            INSERT INTO availability_exceptions (
                event_type_id, exception_date, exception_type, start_time, end_time, timezone, reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            data.event_type_id, data.exception_date, data.exception_type,
            data.start_time, data.end_time, data.timezone, data.reason
        );

        const newException = db.prepare('SELECT * FROM availability_exceptions WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ availabilityException: newException });
        logAdminAction(req, 'create', 'availability_exceptions', result.lastInsertRowid.toString(), null, data);
    }));

    // PUT /api/admin/scheduling/exceptions/:id
    router.put('/exceptions/:id', wrapAsyncHandler((req, res) => {
        const idValidation = idParamSchema.safeParse(req.params);
        if (!idValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid ID parameter',
                idValidation.error.errors
            ));
        }

        const validation = availabilityExceptionSchema.partial().safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid availability exception data',
                validation.error.issues
            ));
        }

        const exceptionId = idValidation.data.id;
        const currentException = db.prepare('SELECT * FROM availability_exceptions WHERE id = ?').get(exceptionId);
        if (!currentException) {
            return res.status(404).json(createErrorResponse(
                'NOT_FOUND',
                'Availability exception not found'
            ));
        }

        const data = validation.data;

        // Validate custom hours if being updated
        if (data.exception_type === 'custom_hours' || 
            (currentException.exception_type === 'custom_hours' && !data.exception_type)) {
            const finalStartTime = data.start_time || currentException.start_time;
            const finalEndTime = data.end_time || currentException.end_time;
            if (!finalStartTime || !finalEndTime) {
                return res.status(400).json(createErrorResponse(
                    'VALIDATION_ERROR',
                    'Start time and end time are required for custom hours',
                    { field: 'start_time, end_time' }
                ));
            }
        }

        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        db.prepare(`UPDATE availability_exceptions SET ${setClause} WHERE id = ?`).run(...values, exceptionId);
        const updatedException = db.prepare('SELECT * FROM availability_exceptions WHERE id = ?').get(exceptionId);

        res.json({ availabilityException: updatedException });
        logAdminAction(req, 'update', 'availability_exceptions', exceptionId.toString(), currentException, data);
    }));

    // DELETE /api/admin/scheduling/exceptions/:id
    router.delete('/exceptions/:id', wrapAsyncHandler((req, res) => {
        const idValidation = idParamSchema.safeParse(req.params);
        if (!idValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid ID parameter',
                idValidation.error.errors
            ));
        }

        const exceptionId = idValidation.data.id;
        const currentException = db.prepare('SELECT * FROM availability_exceptions WHERE id = ?').get(exceptionId);
        if (!currentException) {
            return res.status(404).json(createErrorResponse(
                'NOT_FOUND',
                'Availability exception not found'
            ));
        }

        const result = db.prepare('DELETE FROM availability_exceptions WHERE id = ?').run(exceptionId);
        if (result.changes === 0) {
            return res.status(404).json(createErrorResponse(
                'NOT_FOUND',
                'Availability exception not found'
            ));
        }

        res.json({ success: true });
        logAdminAction(req, 'delete', 'availability_exceptions', exceptionId.toString(), currentException, null);
    }));

    /**
     * Bookings Management
     */

    // GET /api/admin/scheduling/bookings
    router.get('/bookings', wrapAsyncHandler((req, res) => {
        const validation = bookingFiltersSchema.safeParse(req.query);
        if (!validation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid booking filters',
                validation.error.issues
            ));
        }

        const filters = validation.data;
        let query = `
            SELECT 
                b.*, 
                et.name as event_type_name, 
                et.duration_minutes,
                et.location_type,
                et.color,
                i.name as invitee_name,
                i.email as invitee_email,
                i.timezone as invitee_timezone,
                i.notes as invitee_notes
            FROM bookings b
            LEFT JOIN event_types et ON b.event_type_id = et.id
            LEFT JOIN invitees i ON b.invitee_id = i.id
        `;

        const conditions = [];
        const params = [];

        if (filters.start_date) {
            conditions.push('DATE(b.start_time) >= ?');
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            conditions.push('DATE(b.start_time) <= ?');
            params.push(filters.end_date);
        }

        if (filters.status) {
            conditions.push('b.status = ?');
            params.push(filters.status);
        }

        if (filters.event_type_id) {
            conditions.push('b.event_type_id = ?');
            params.push(filters.event_type_id);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY b.start_time DESC LIMIT ? OFFSET ?';
        params.push(filters.limit, filters.offset);

        const bookings = db.prepare(query).all(...params);
        res.json({ bookings });
        logAdminAction(req, 'list', 'bookings');
    }));

    // POST /api/admin/scheduling/bookings/:uuid/cancel
    router.post('/bookings/:uuid/cancel', wrapAsyncHandler(async (req, res) => {
        const uuidValidation = uuidParamSchema.safeParse(req.params);
        if (!uuidValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid UUID parameter',
                uuidValidation.error.errors
            ));
        }

        const cancelValidation = cancelRequestSchema.safeParse(req.body);
        if (!cancelValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid cancel request data',
                cancelValidation.error.errors
            ));
        }

        const { uuid } = uuidValidation.data;
        const { reason } = cancelValidation.data;

        const result = await bookingService.cancelBooking(uuid, reason);
        if (!result.success) {
            return res.status(400).json(createErrorResponse(
                'CANCEL_FAILED',
                result.error || 'Failed to cancel booking'
            ));
        }

        res.json(result);
        logAdminAction(req, 'cancel', 'bookings', uuid, null, { reason });
    }));

    // POST /api/admin/scheduling/bookings/:uuid/reschedule
    router.post('/bookings/:uuid/reschedule', wrapAsyncHandler(async (req, res) => {
        const uuidValidation = uuidParamSchema.safeParse(req.params);
        if (!uuidValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid UUID parameter',
                uuidValidation.error.errors
            ));
        }

        const rescheduleValidation = rescheduleRequestSchema.safeParse(req.body);
        if (!rescheduleValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid reschedule request data',
                rescheduleValidation.error.errors
            ));
        }

        const { uuid } = uuidValidation.data;
        const { new_start_time, new_end_time, reason } = rescheduleValidation.data;

        const result = await bookingService.rescheduleBooking(
            uuid, 
            new_start_time, 
            new_end_time, 
            reason
        );
        
        if (!result.success) {
            return res.status(400).json(createErrorResponse(
                'RESCHEDULE_FAILED',
                result.error || 'Failed to reschedule booking'
            ));
        }

        res.json(result);
        logAdminAction(req, 'reschedule', 'bookings', uuid, null, { 
            new_start_time, 
            new_end_time, 
            reason 
        });
    }));

    // GET /api/admin/scheduling/bookings.csv  
    router.get('/bookings.csv', wrapAsyncHandler((req, res) => {
        const validation = bookingFiltersSchema.safeParse(req.query);
        if (!validation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid booking filters',
                validation.error.issues
            ));
        }

        const filters = validation.data;
        let query = `
            SELECT 
                b.uuid,
                b.status,
                b.start_time,
                b.end_time,
                b.created_at,
                b.cancelled_at,
                b.cancellation_reason,
                et.name as event_type,
                et.duration_minutes,
                et.location_type,
                i.name as invitee_name,
                i.email as invitee_email,
                i.timezone as invitee_timezone,
                i.notes as invitee_notes
            FROM bookings b
            LEFT JOIN event_types et ON b.event_type_id = et.id
            LEFT JOIN invitees i ON b.invitee_id = i.id
        `;

        const conditions = [];
        const params = [];

        if (filters.start_date) {
            conditions.push('DATE(b.start_time) >= ?');
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            conditions.push('DATE(b.start_time) <= ?');
            params.push(filters.end_date);
        }

        if (filters.status) {
            conditions.push('b.status = ?');
            params.push(filters.status);
        }

        if (filters.event_type_id) {
            conditions.push('b.event_type_id = ?');
            params.push(filters.event_type_id);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY b.start_time DESC';
        const bookings = db.prepare(query).all(...params);

        // Generate CSV
        const headers = [
            'UUID', 'Status', 'Start Time', 'End Time', 'Event Type', 'Duration (min)',
            'Location Type', 'Invitee Name', 'Invitee Email', 'Invitee Timezone',
            'Notes', 'Created At', 'Cancelled At', 'Cancellation Reason'
        ];

        const csvRows = [
            headers.join(','),
            ...bookings.map((booking) => [
                booking.uuid,
                booking.status,
                booking.start_time,
                booking.end_time,
                booking.event_type,
                booking.duration_minutes,
                booking.location_type,
                booking.invitee_name || '',
                booking.invitee_email || '',
                booking.invitee_timezone || '',
                (booking.invitee_notes || '').replace(/"/g, '""'),
                booking.created_at,
                booking.cancelled_at || '',
                (booking.cancellation_reason || '').replace(/"/g, '""')
            ].map(field => `"${field}"`).join(','))
        ];

        const csv = csvRows.join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
        res.send(csv);
        logAdminAction(req, 'export', 'bookings');
    }));

    /**
     * Audit Logs
     */

    // GET /api/admin/scheduling/audit-logs
    router.get('/audit-logs', wrapAsyncHandler((req, res) => {
        const paginationValidation = paginationSchema.safeParse(req.query);
        if (!paginationValidation.success) {
            return res.status(400).json(createErrorResponse(
                'VALIDATION_ERROR',
                'Invalid pagination parameters',
                paginationValidation.error.errors
            ));
        }

        const { limit, offset } = paginationValidation.data;
        const { admin_user, resource_type, action, start_date, end_date } = req.query;

        const logs = auditService.getLogs({
            limit,
            offset,
            admin_user,
            resource_type,
            action,
            start_date,
            end_date
        });

        res.json({ auditLogs: logs });
        logAdminAction(req, 'view', 'audit_logs');
    }));

    // Mount the router
    app.use('/api/admin/scheduling', router);
}