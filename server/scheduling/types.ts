// Scheduling System Types
// Comprehensive TypeScript types for the scheduling system

export interface EventType {
  id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  location_type: 'visio' | 'physique' | 'telephone';
  color: string;
  is_active: boolean;
  max_bookings_per_day?: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  min_lead_time_hours: number;
  max_advance_days: number;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityRule {
  id: number;
  event_type_id: number;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  timezone: string;
  is_active: boolean;
  created_at: string;
}

export interface AvailabilityException {
  id: number;
  event_type_id: number;
  exception_date: string; // YYYY-MM-DD format
  exception_type: 'unavailable' | 'custom_hours';
  start_time?: string; // HH:MM format if custom_hours
  end_time?: string; // HH:MM format if custom_hours
  timezone: string;
  reason?: string;
  created_at: string;
}

export interface Booking {
  id: number;
  uuid: string;
  event_type_id: number;
  start_time: string; // ISO string in UTC
  end_time: string; // ISO string in UTC
  status: 'confirmed' | 'cancelled' | 'rescheduled';
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export interface Invitee {
  id: number;
  booking_id: number;
  name: string;
  email: string;
  timezone?: string;
  notes?: string;
  created_at: string;
}

export interface EventTypeQuestion {
  id: number;
  event_type_id: number;
  question_text: string;
  question_type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  options?: string; // JSON array for select/radio/checkbox types
  is_required: boolean;
  display_order: number;
  created_at: string;
}

export interface QuestionAnswer {
  id: number;
  booking_id: number;
  question_id: number;
  answer_text?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  booking_id: number;
  notification_type: 'booking_confirmation' | 'cancellation' | 'reschedule' | 'reminder';
  recipient_email: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

// API Request/Response Types
export interface GetAvailabilityQuery {
  eventTypeId: string;
  start: string; // ISO date string
  end: string; // ISO date string
  timezone?: string; // User's timezone for display
}

export interface AvailableSlot {
  start: string; // ISO string in user's timezone
  end: string; // ISO string in user's timezone
  startUTC: string; // ISO string in UTC
  endUTC: string; // ISO string in UTC
}

export interface GetAvailabilityResponse {
  eventType: EventType;
  availableSlots: AvailableSlot[];
  timezone: string; // Timezone used for display
}

export interface BookingRequest {
  eventTypeId: number;
  name: string;
  email: string;
  start: string; // ISO string in UTC
  end: string; // ISO string in UTC
  timezone?: string; // User's timezone
  notes?: string;
  answers?: Array<{
    questionId: number;
    answer: string;
  }>;
  consent?: boolean; // GDPR consent
}

export interface BookingResponse {
  success: boolean;
  booking?: {
    uuid: string;
    eventType: EventType;
    start: string; // ISO string in user's timezone
    end: string; // ISO string in user's timezone
    invitee: Omit<Invitee, 'id' | 'booking_id' | 'created_at'>;
    icsUrl: string;
    googleCalendarUrl: string;
    rescheduleToken: string;
    cancelToken: string;
  };
  error?: string;
}

export interface RescheduleRequest {
  bookingId: string;
  token: string;
  newStart: string; // ISO string in UTC
  newEnd: string; // ISO string in UTC
}

export interface CancelRequest {
  bookingId: string;
  token: string;
  reason?: string;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  booking?: Partial<Booking>;
}

// Utility types for slot calculation
export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
}

export interface SchedulingConfig {
  ACTION_TOKEN_SECRET: string;
  ACTION_TOKEN_TTL_HOURS: number;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  EMAIL_FROM: string;
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_SECURE?: boolean;
}

// Validation schemas (to be used with Zod)
export interface ValidationSchemas {
  getAvailability: any;
  bookingRequest: any;
  rescheduleRequest: any;
  cancelRequest: any;
}