import { z } from 'zod';

/**
 * Centralized Zod validation schemas for admin scheduling API
 * Provides consistent input validation across all routes
 */

// Pagination schema with sensible limits
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(200).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0)
});

// ID parameter validation for route params
export const idParamSchema = z.object({
  id: z.coerce.number().positive()
});

// Date range validation for filtering
export const dateRangeQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // YYYY-MM-DD
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

// Availability exception validation
export const availabilityExceptionSchema = z.object({
  event_type_id: z.coerce.number().positive(),
  exception_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  exception_type: z.enum(['unavailable', 'custom_hours']),
  start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM
  end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  timezone: z.string().optional().default('UTC'),
  reason: z.string().max(200).optional()
});

// Booking filters validation
export const bookingFiltersSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'rescheduled']).optional(),
  event_type_id: z.coerce.number().positive().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().min(1).max(200).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0)
});

// UUID parameter validation
export const uuidParamSchema = z.object({
  uuid: z.string().uuid()
});

// Reschedule request validation
export const rescheduleRequestSchema = z.object({
  new_start_time: z.string().datetime(),
  new_end_time: z.string().datetime(),
  reason: z.string().max(500).optional()
});

// Cancel request validation  
export const cancelRequestSchema = z.object({
  reason: z.string().max(500).optional()
});