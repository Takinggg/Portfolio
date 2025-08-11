// Scheduling API client for frontend
import { EventType, GetAvailabilityResponse, BookingRequest, BookingResponse } from '../types/scheduling';

const API_BASE = '/api/scheduling';

class SchedulingAPI {
  /**
   * Get all available event types
   */
  async getEventTypes(): Promise<{ eventTypes: EventType[] }> {
    const response = await fetch(`${API_BASE}/event-types`);
    if (!response.ok) {
      throw new Error(`Failed to fetch event types: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get available slots for an event type
   */
  async getAvailability(
    eventTypeId: number,
    startDate: string,
    endDate: string,
    timezone: string = 'UTC'
  ): Promise<GetAvailabilityResponse> {
    const params = new URLSearchParams({
      eventTypeId: eventTypeId.toString(),
      start: startDate,
      end: endDate,
      timezone
    });

    const response = await fetch(`${API_BASE}/availability?${params}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Failed to fetch availability: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Create a new booking
   */
  async createBooking(request: BookingRequest): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE}/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `Failed to create booking: ${response.statusText}`);
    }

    return result;
  }

  /**
   * Get booking details by UUID
   */
  async getBooking(uuid: string): Promise<any> {
    const response = await fetch(`${API_BASE}/booking/${uuid}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Failed to fetch booking: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Download ICS calendar file
   */
  getICSDownloadUrl(uuid: string): string {
    return `${API_BASE}/booking/${uuid}/calendar.ics`;
  }

  /**
   * Reschedule a booking
   */
  async rescheduleBooking(
    bookingId: string,
    token: string,
    newStart: string,
    newEnd: string
  ): Promise<any> {
    const response = await fetch(`${API_BASE}/reschedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        token,
        newStart,
        newEnd,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `Failed to reschedule booking: ${response.statusText}`);
    }

    return result;
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    bookingId: string,
    token: string,
    reason?: string
  ): Promise<any> {
    const response = await fetch(`${API_BASE}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        token,
        reason,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `Failed to cancel booking: ${response.statusText}`);
    }

    return result;
  }
}

export const schedulingAPI = new SchedulingAPI();