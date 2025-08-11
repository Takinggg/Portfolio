import express from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { basicAuthMiddleware, getClientIP, getUserAgent } from './middleware.js';
import { AdminAuditService } from './audit.js';
import { SlotEngine } from '../scheduling/slot-engine.js';
import { BookingService } from '../scheduling/booking-service.js';
import { DateTime } from 'luxon';
const router = express.Router();
// Admin-specific rate limiting - more restrictive than public API
const adminRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window
    message: { error: 'Too many admin requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply auth and rate limiting to all admin routes
router.use(adminRateLimit);
router.use(basicAuthMiddleware);
// Validation schemas
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
const availabilityExceptionSchema = z.object({
    event_type_id: z.number().positive(),
    exception_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    exception_type: z.enum(['unavailable', 'custom_hours']),
    start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    timezone: z.string().optional().default('UTC'),
    reason: z.string().max(200).optional()
});
const bookingFiltersSchema = z.object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    status: z.enum(['confirmed', 'cancelled', 'rescheduled']).optional(),
    event_type_id: z.number().positive().optional(),
    limit: z.number().min(1).max(100).optional().default(50),
    offset: z.number().min(0).optional().default(0)
});
/**
 * Initialize admin scheduling routes
 */
export function initializeAdminSchedulingRoutes(app, db) {
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
    router.get('/overview', (req, res) => {
        try {
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
        }
        catch (error) {
            console.error('Error getting admin overview:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * Event Types CRUD Operations
     */
    // GET /api/admin/scheduling/event-types
    router.get('/event-types', (req, res) => {
        try {
            const eventTypes = db.prepare(`
        SELECT et.*, 
               COUNT(ar.id) as availability_rules_count,
               COUNT(b.id) as total_bookings
        FROM event_types et
        LEFT JOIN availability_rules ar ON et.id = ar.event_type_id AND ar.is_active = 1
        LEFT JOIN bookings b ON et.id = b.event_type_id
        GROUP BY et.id
        ORDER BY et.created_at DESC
      `).all();
            res.json({ eventTypes });
            logAdminAction(req, 'list', 'event_types');
        }
        catch (error) {
            console.error('Error getting event types:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // POST /api/admin/scheduling/event-types
    router.post('/event-types', async (req, res) => {
        try {
            const validation = eventTypeSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Invalid event type data',
                    details: validation.error.errors
                });
            }
            const data = validation.data;
            const stmt = db.prepare(`
        INSERT INTO event_types (
          name, description, duration_minutes, location_type, color, 
          is_active, max_bookings_per_day, buffer_before_minutes, 
          buffer_after_minutes, min_lead_time_hours, max_advance_days
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
            const result = stmt.run(data.name, data.description, data.duration_minutes, data.location_type, data.color, data.is_active ? 1 : 0, data.max_bookings_per_day, data.buffer_before_minutes, data.buffer_after_minutes, data.min_lead_time_hours, data.max_advance_days);
            const newEventType = db.prepare('SELECT * FROM event_types WHERE id = ?').get(result.lastInsertRowid);
            res.status(201).json({ eventType: newEventType });
            logAdminAction(req, 'create', 'event_types', result.lastInsertRowid.toString(), null, newEventType);
        }
        catch (error) {
            console.error('Error creating event type:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // PATCH /api/admin/scheduling/event-types/:id
    router.patch('/event-types/:id', (req, res) => {
        try {
            const eventTypeId = parseInt(req.params.id);
            const updates = req.body;
            // Get current event type for audit log
            const currentEventType = db.prepare('SELECT * FROM event_types WHERE id = ?').get(eventTypeId);
            if (!currentEventType) {
                return res.status(404).json({ error: 'Event type not found' });
            }
            // Build update query dynamically
            const allowedFields = [
                'name', 'description', 'duration_minutes', 'location_type', 'color',
                'is_active', 'max_bookings_per_day', 'buffer_before_minutes',
                'buffer_after_minutes', 'min_lead_time_hours', 'max_advance_days'
            ];
            const setClause = [];
            const params = [];
            Object.entries(updates).forEach(([key, value]) => {
                if (allowedFields.includes(key) && value !== undefined) {
                    setClause.push(`${key} = ?`);
                    params.push(key === 'is_active' ? (value ? 1 : 0) : value);
                }
            });
            if (setClause.length === 0) {
                return res.status(400).json({ error: 'No valid fields to update' });
            }
            setClause.push('updated_at = CURRENT_TIMESTAMP');
            params.push(eventTypeId);
            const query = `UPDATE event_types SET ${setClause.join(', ')} WHERE id = ?`;
            const result = db.prepare(query).run(...params);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Event type not found' });
            }
            const updatedEventType = db.prepare('SELECT * FROM event_types WHERE id = ?').get(eventTypeId);
            res.json({ eventType: updatedEventType });
            logAdminAction(req, 'update', 'event_types', eventTypeId.toString(), currentEventType, updatedEventType);
        }
        catch (error) {
            console.error('Error updating event type:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // DELETE /api/admin/scheduling/event-types/:id
    router.delete('/event-types/:id', (req, res) => {
        try {
            const eventTypeId = parseInt(req.params.id);
            // Get current event type for audit log
            const currentEventType = db.prepare('SELECT * FROM event_types WHERE id = ?').get(eventTypeId);
            if (!currentEventType) {
                return res.status(404).json({ error: 'Event type not found' });
            }
            // Check if there are active bookings
            const activeBookings = db.prepare(`
        SELECT COUNT(*) as count FROM bookings 
        WHERE event_type_id = ? AND status = 'confirmed' AND start_time > datetime('now')
      `).get(eventTypeId);
            if (activeBookings.count > 0) {
                return res.status(400).json({
                    error: 'Cannot delete event type with active future bookings',
                    activeBookings: activeBookings.count
                });
            }
            const result = db.prepare('DELETE FROM event_types WHERE id = ?').run(eventTypeId);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Event type not found' });
            }
            res.json({ success: true });
            logAdminAction(req, 'delete', 'event_types', eventTypeId.toString(), currentEventType, null);
        }
        catch (error) {
            console.error('Error deleting event type:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * Availability Rules CRUD Operations
     */
    // GET /api/admin/scheduling/availability-rules
    router.get('/availability-rules', (req, res) => {
        try {
            const { event_type_id } = req.query;
            let query = `
        SELECT ar.*, et.name as event_type_name
        FROM availability_rules ar
        JOIN event_types et ON ar.event_type_id = et.id
      `;
            const params = [];
            if (event_type_id) {
                query += ' WHERE ar.event_type_id = ?';
                params.push(parseInt(event_type_id));
            }
            query += ' ORDER BY ar.event_type_id, ar.day_of_week, ar.start_time';
            const rules = db.prepare(query).all(...params);
            res.json({ availabilityRules: rules });
            logAdminAction(req, 'list', 'availability_rules');
        }
        catch (error) {
            console.error('Error getting availability rules:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // POST /api/admin/scheduling/availability-rules
    router.post('/availability-rules', (req, res) => {
        try {
            const validation = availabilityRuleSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Invalid availability rule data',
                    details: validation.error.errors
                });
            }
            const data = validation.data;
            // Validate time range
            if (data.start_time >= data.end_time) {
                return res.status(400).json({ error: 'End time must be after start time' });
            }
            // Check if event type exists
            const eventType = db.prepare('SELECT id FROM event_types WHERE id = ?').get(data.event_type_id);
            if (!eventType) {
                return res.status(400).json({ error: 'Event type not found' });
            }
            const stmt = db.prepare(`
        INSERT INTO availability_rules (
          event_type_id, day_of_week, start_time, end_time, timezone, is_active
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);
            const result = stmt.run(data.event_type_id, data.day_of_week, data.start_time, data.end_time, data.timezone, data.is_active ? 1 : 0);
            const newRule = db.prepare(`
        SELECT ar.*, et.name as event_type_name
        FROM availability_rules ar
        JOIN event_types et ON ar.event_type_id = et.id
        WHERE ar.id = ?
      `).get(result.lastInsertRowid);
            res.status(201).json({ availabilityRule: newRule });
            logAdminAction(req, 'create', 'availability_rules', result.lastInsertRowid.toString(), null, newRule);
        }
        catch (error) {
            console.error('Error creating availability rule:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // PATCH /api/admin/scheduling/availability-rules/:id
    router.patch('/availability-rules/:id', (req, res) => {
        try {
            const ruleId = parseInt(req.params.id);
            const updates = req.body;
            // Get current rule for audit log
            const currentRule = db.prepare('SELECT * FROM availability_rules WHERE id = ?').get(ruleId);
            if (!currentRule) {
                return res.status(404).json({ error: 'Availability rule not found' });
            }
            const allowedFields = ['day_of_week', 'start_time', 'end_time', 'timezone', 'is_active'];
            const setClause = [];
            const params = [];
            Object.entries(updates).forEach(([key, value]) => {
                if (allowedFields.includes(key) && value !== undefined) {
                    setClause.push(`${key} = ?`);
                    params.push(key === 'is_active' ? (value ? 1 : 0) : value);
                }
            });
            if (setClause.length === 0) {
                return res.status(400).json({ error: 'No valid fields to update' });
            }
            params.push(ruleId);
            const query = `UPDATE availability_rules SET ${setClause.join(', ')} WHERE id = ?`;
            const result = db.prepare(query).run(...params);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Availability rule not found' });
            }
            const updatedRule = db.prepare(`
        SELECT ar.*, et.name as event_type_name
        FROM availability_rules ar
        JOIN event_types et ON ar.event_type_id = et.id
        WHERE ar.id = ?
      `).get(ruleId);
            res.json({ availabilityRule: updatedRule });
            logAdminAction(req, 'update', 'availability_rules', ruleId.toString(), currentRule, updatedRule);
        }
        catch (error) {
            console.error('Error updating availability rule:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // DELETE /api/admin/scheduling/availability-rules/:id
    router.delete('/availability-rules/:id', (req, res) => {
        try {
            const ruleId = parseInt(req.params.id);
            // Get current rule for audit log
            const currentRule = db.prepare('SELECT * FROM availability_rules WHERE id = ?').get(ruleId);
            if (!currentRule) {
                return res.status(404).json({ error: 'Availability rule not found' });
            }
            const result = db.prepare('DELETE FROM availability_rules WHERE id = ?').run(ruleId);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Availability rule not found' });
            }
            res.json({ success: true });
            logAdminAction(req, 'delete', 'availability_rules', ruleId.toString(), currentRule, null);
        }
        catch (error) {
            console.error('Error deleting availability rule:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * Availability Exceptions CRUD Operations
     */
    // GET /api/admin/scheduling/exceptions
    router.get('/exceptions', (req, res) => {
        try {
            const { event_type_id, start_date, end_date } = req.query;
            let query = `
        SELECT ae.*, et.name as event_type_name
        FROM availability_exceptions ae
        JOIN event_types et ON ae.event_type_id = et.id
      `;
            const conditions = [];
            const params = [];
            if (event_type_id) {
                conditions.push('ae.event_type_id = ?');
                params.push(parseInt(event_type_id));
            }
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
            query += ' ORDER BY ae.exception_date DESC';
            const exceptions = db.prepare(query).all(...params);
            res.json({ availabilityExceptions: exceptions });
            logAdminAction(req, 'list', 'availability_exceptions');
        }
        catch (error) {
            console.error('Error getting availability exceptions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // POST /api/admin/scheduling/exceptions
    router.post('/exceptions', (req, res) => {
        try {
            const validation = availabilityExceptionSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Invalid availability exception data',
                    details: validation.error.errors
                });
            }
            const data = validation.data;
            // Validate custom hours if specified
            if (data.exception_type === 'custom_hours') {
                if (!data.start_time || !data.end_time) {
                    return res.status(400).json({
                        error: 'Start time and end time are required for custom hours'
                    });
                }
                if (data.start_time >= data.end_time) {
                    return res.status(400).json({ error: 'End time must be after start time' });
                }
            }
            // Check if event type exists
            const eventType = db.prepare('SELECT id FROM event_types WHERE id = ?').get(data.event_type_id);
            if (!eventType) {
                return res.status(400).json({ error: 'Event type not found' });
            }
            const stmt = db.prepare(`
        INSERT INTO availability_exceptions (
          event_type_id, exception_date, exception_type, start_time, end_time, timezone, reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
            const result = stmt.run(data.event_type_id, data.exception_date, data.exception_type, data.start_time, data.end_time, data.timezone, data.reason);
            const newException = db.prepare(`
        SELECT ae.*, et.name as event_type_name
        FROM availability_exceptions ae
        JOIN event_types et ON ae.event_type_id = et.id
        WHERE ae.id = ?
      `).get(result.lastInsertRowid);
            res.status(201).json({ availabilityException: newException });
            logAdminAction(req, 'create', 'availability_exceptions', result.lastInsertRowid.toString(), null, newException);
        }
        catch (error) {
            console.error('Error creating availability exception:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // DELETE /api/admin/scheduling/exceptions/:id
    router.delete('/exceptions/:id', (req, res) => {
        try {
            const exceptionId = parseInt(req.params.id);
            // Get current exception for audit log
            const currentException = db.prepare('SELECT * FROM availability_exceptions WHERE id = ?').get(exceptionId);
            if (!currentException) {
                return res.status(404).json({ error: 'Availability exception not found' });
            }
            const result = db.prepare('DELETE FROM availability_exceptions WHERE id = ?').run(exceptionId);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Availability exception not found' });
            }
            res.json({ success: true });
            logAdminAction(req, 'delete', 'availability_exceptions', exceptionId.toString(), currentException, null);
        }
        catch (error) {
            console.error('Error deleting availability exception:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    /**
     * Bookings Management
     */
    // GET /api/admin/scheduling/bookings
    router.get('/bookings', (req, res) => {
        try {
            const validation = bookingFiltersSchema.safeParse(req.query);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Invalid filters',
                    details: validation.error.errors
                });
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
        JOIN event_types et ON b.event_type_id = et.id
        JOIN invitees i ON b.id = i.booking_id
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
        }
        catch (error) {
            console.error('Error getting bookings:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // POST /api/admin/scheduling/bookings/:uuid/cancel
    router.post('/bookings/:uuid/cancel', async (req, res) => {
        try {
            const { uuid } = req.params;
            const { reason } = req.body;
            const result = await bookingService.cancelBookingAdmin(uuid, reason || 'Cancelled by admin');
            if (result.success) {
                res.json(result);
                logAdminAction(req, 'cancel', 'bookings', uuid, null, { reason });
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error('Error cancelling booking:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // POST /api/admin/scheduling/bookings/:uuid/reschedule
    router.post('/bookings/:uuid/reschedule', async (req, res) => {
        try {
            const { uuid } = req.params;
            const { newStart, newEnd } = req.body;
            if (!newStart || !newEnd) {
                return res.status(400).json({
                    error: 'New start and end times are required'
                });
            }
            const result = await bookingService.rescheduleBookingAdmin(uuid, newStart, newEnd);
            if (result.success) {
                res.json(result);
                logAdminAction(req, 'reschedule', 'bookings', uuid, null, { newStart, newEnd });
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error('Error rescheduling booking:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // GET /api/admin/scheduling/bookings.csv
    router.get('/bookings.csv', (req, res) => {
        try {
            const validation = bookingFiltersSchema.safeParse(req.query);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Invalid filters',
                    details: validation.error.errors
                });
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
        JOIN event_types et ON b.event_type_id = et.id
        JOIN invitees i ON b.id = i.booking_id
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
                    `"${booking.event_type}"`,
                    booking.duration_minutes,
                    booking.location_type,
                    `"${booking.invitee_name}"`,
                    booking.invitee_email,
                    booking.invitee_timezone || '',
                    `"${(booking.invitee_notes || '').replace(/"/g, '""')}"`,
                    booking.created_at,
                    booking.cancelled_at || '',
                    `"${(booking.cancellation_reason || '').replace(/"/g, '""')}"`
                ].join(','))
            ];
            const csvContent = csvRows.join('\n');
            const filename = `bookings-${DateTime.now().toFormat('yyyy-MM-dd-HHmm')}.csv`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csvContent);
            logAdminAction(req, 'export', 'bookings', null, filters, { filename, count: bookings.length });
        }
        catch (error) {
            console.error('Error exporting bookings:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // GET /api/admin/scheduling/audit-logs
    router.get('/audit-logs', (req, res) => {
        try {
            const { limit = 50, offset = 0, admin_user, resource_type, action, start_date, end_date } = req.query;
            const logs = auditService.getLogs({
                limit: parseInt(limit),
                offset: parseInt(offset),
                admin_user: admin_user,
                resource_type: resource_type,
                action: action,
                start_date: start_date,
                end_date: end_date
            });
            res.json({ auditLogs: logs });
            logAdminAction(req, 'view', 'audit_logs');
        }
        catch (error) {
            console.error('Error getting audit logs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // Mount the router
    app.use('/api/admin/scheduling', router);
}
