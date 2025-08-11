// Scheduling-related TypeScript types for the frontend
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

export interface AvailableSlot {
  start: string; // ISO string in user's timezone
  end: string; // ISO string in user's timezone
  startUTC: string; // ISO string in UTC
  endUTC: string; // ISO string in UTC
}

export interface GetAvailabilityResponse {
  eventType: EventType;
  availableSlots: AvailableSlot[];
  timezone: string;
}

export interface BookingRequest {
  eventTypeId: number;
  name: string;
  email: string;
  start: string; // ISO string in UTC
  end: string; // ISO string in UTC
  timezone?: string;
  notes?: string;
  answers?: Array<{
    questionId: number;
    answer: string;
  }>;
  consent?: boolean;
}

export interface BookingResponse {
  success: boolean;
  booking?: {
    uuid: string;
    eventType: EventType;
    start: string; // ISO string in user's timezone
    end: string; // ISO string in user's timezone
    invitee: {
      name: string;
      email: string;
      timezone?: string;
      notes?: string;
    };
    icsUrl: string;
    googleCalendarUrl: string;
    rescheduleToken: string;
    cancelToken: string;
  };
  error?: string;
}

export interface SchedulingWidgetProps {
  className?: string;
  triggerClassName?: string;
  triggerText?: string;
  defaultEventTypeId?: number;
  onBookingComplete?: (booking: BookingResponse['booking']) => void;
  onError?: (error: string) => void;
}

export interface EventTypeCardProps {
  eventType: EventType;
  isSelected: boolean;
  onClick: () => void;
}

export interface SlotSelectorProps {
  eventType: EventType;
  selectedDate: Date | null;
  selectedSlot: AvailableSlot | null;
  onDateSelect: (date: Date) => void;
  onSlotSelect: (slot: AvailableSlot) => void;
  userTimezone: string;
}

export interface BookingFormProps {
  eventType: EventType;
  selectedSlot: AvailableSlot;
  userTimezone: string;
  onSubmit: (data: BookingRequest) => void;
  onBack: () => void;
  isLoading: boolean;
}

export interface BookingConfirmationProps {
  booking: BookingResponse['booking'];
  onClose: () => void;
}

export type SchedulingStep = 'event-type' | 'slots' | 'form' | 'confirmation';

export interface SchedulingState {
  step: SchedulingStep;
  eventTypes: EventType[];
  selectedEventType: EventType | null;
  selectedDate: Date | null;
  selectedSlot: AvailableSlot | null;
  availableSlots: AvailableSlot[];
  booking: BookingResponse['booking'] | null;
  isLoading: boolean;
  error: string | null;
  userTimezone: string;
}