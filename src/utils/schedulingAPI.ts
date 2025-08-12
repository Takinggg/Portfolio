// Scheduling API client for frontend
import { EventType, GetAvailabilityResponse, BookingRequest, BookingResponse } from '../types/scheduling';
import { API_CONFIG } from '../config';

const API_BASE = `${API_CONFIG.baseUrl.replace(/\/$/, '')}/scheduling`;

/**
 * Helper function to fetch JSON with content-type validation
 */
async function fetchJson(url: string, init?: RequestInit): Promise<any> {
  const response = await fetch(url, init);
  
  const contentType = response.headers.get('content-type') || '';
  
  if (!contentType.includes('application/json')) {
    const textContent = await response.text();
    const snippet = textContent.substring(0, 100);
    const errorMessage = `Scheduling API expected JSON but received: ${contentType}. First 100 chars: ${snippet}`;
    console.error('Scheduling API error:', { url, contentType, snippet, status: response.status });
    throw new Error(errorMessage);
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    console.error('Scheduling API error:', { url, status: response.status, error });
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

class SchedulingAPI {
  /**
   * Get all available event types
   */
  async getEventTypes(): Promise<{ eventTypes: EventType[] }> {
    const url = `${API_BASE}/event-types`;
    return fetchJson(url);
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

    const url = `${API_BASE}/availability?${params}`;
    return fetchJson(url);
  }

  /**
   * Create a new booking
   */
  async createBooking(request: BookingRequest): Promise<BookingResponse> {
    const url = `${API_BASE}/book`;

    // Defensive normalization to avoid backend VALIDATION_ERRORs
    const payload: any = {
      ...request,
      eventTypeId: Number((request as any).eventTypeId),
      start: new Date(request.start).toISOString(),
      end: new Date(request.end).toISOString(),
    };

    return fetchJson(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get booking details by UUID
   */
  async getBooking(uuid: string): Promise<any> {
    const url = `${API_BASE}/booking/${uuid}`;
    return fetchJson(url);
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
    const url = `${API_BASE}/reschedule`;
    return fetchJson(url, {
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
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    bookingId: string,
    token: string,
    reason?: string
  ): Promise<any> {
    const url = `${API_BASE}/cancel`;
    return fetchJson(url, {
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
  }
}

export const schedulingAPI = new SchedulingAPI();