import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User, Mail } from 'lucide-react';

interface Booking {
  id: number;
  uuid: string;
  event_type_id: number;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'rescheduled';
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  event_type_name: string;
  duration_minutes: number;
  location_type: string;
  color: string;
  invitee_name: string;
  invitee_email: string;
  invitee_timezone?: string;
  invitee_notes?: string;
}

interface AgendaViewProps {
  isAuthenticated: boolean;
}

const AgendaView: React.FC<AgendaViewProps> = ({ isAuthenticated }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Get start of week (Monday)
  function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Get start of month
  function getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  // Format date for API
  function formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Get week days
  function getWeekDays(startDate: Date): Date[] {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  }

  // Get month days
  function getMonthDays(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }

  // Load bookings for the current period
  useEffect(() => {
    const loadBookings = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let startDate: Date;
        let endDate: Date;
        
        if (viewMode === 'week') {
          startDate = new Date(currentWeekStart);
          endDate = new Date(currentWeekStart);
          endDate.setDate(currentWeekStart.getDate() + 6);
        } else {
          startDate = getStartOfMonth(currentWeekStart);
          endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        }

        const queryParams = new URLSearchParams({
          start_date: formatDateForAPI(startDate),
          end_date: formatDateForAPI(endDate),
        });

        const response = await fetch(`/api/admin/scheduling/bookings?${queryParams}`, {
          headers: {
            'Authorization': `Basic ${btoa(`${import.meta.env.VITE_ADMIN_USERNAME}:${import.meta.env.VITE_ADMIN_PASSWORD}`)}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        let fetchedBookings = result.bookings || [];

        // Sort bookings by start time
        fetchedBookings.sort((a: Booking, b: Booking) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );

        setBookings(fetchedBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [currentWeekStart, viewMode, isAuthenticated]);

  // Navigate to previous period
  const goToPrevious = () => {
    const newDate = new Date(currentWeekStart);
    if (viewMode === 'week') {
      newDate.setDate(currentWeekStart.getDate() - 7);
    } else {
      newDate.setMonth(currentWeekStart.getMonth() - 1);
    }
    setCurrentWeekStart(newDate);
  };

  // Navigate to next period
  const goToNext = () => {
    const newDate = new Date(currentWeekStart);
    if (viewMode === 'week') {
      newDate.setDate(currentWeekStart.getDate() + 7);
    } else {
      newDate.setMonth(currentWeekStart.getMonth() + 1);
    }
    setCurrentWeekStart(newDate);
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date): Booking[] => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.start_time.startsWith(dateStr)
    );
  };

  // Format time for display
  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Authentication required to view agenda.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          
          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={goToPrevious}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
            aria-label={`Previous ${viewMode}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="font-semibold text-lg text-gray-900">
            {viewMode === 'week' ? (
              <>
                {currentWeekStart.toLocaleDateString([], { month: 'long', day: 'numeric' })} - {' '}
                {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString([], { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </>
            ) : (
              currentWeekStart.toLocaleDateString([], { 
                month: 'long', 
                year: 'numeric' 
              })
            )}
          </div>
          
          <button
            onClick={goToNext}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
            aria-label={`Next ${viewMode}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Calendar grid */}
      {!loading && (
        <div className={`grid gap-4 ${
          viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'
        }`}>
          {/* Day headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-b">
              {day}
            </div>
          ))}
          
          {/* Day cells */}
          {(viewMode === 'week' ? getWeekDays(currentWeekStart) : getMonthDays(currentWeekStart)).map(date => {
            const dayBookings = getBookingsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={date.toISOString()}
                className={`min-h-[120px] p-2 border rounded-lg bg-white ${
                  isToday ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                }`}
              >
                {/* Date header */}
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>
                
                {/* Bookings */}
                <div className="space-y-1">
                  {dayBookings.map(booking => (
                    <div
                      key={booking.id}
                      className="p-2 rounded text-xs bg-white border-l-4 shadow-sm hover:shadow-md transition-shadow"
                      style={{ borderLeftColor: booking.color }}
                    >
                      <div className="font-medium text-gray-900 truncate">
                        {booking.event_type_name}
                      </div>
                      <div className="text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(booking.start_time)}</span>
                      </div>
                      <div className="text-gray-600 flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" />
                        <span className="truncate">{booking.invitee_name}</span>
                      </div>
                      {booking.status !== 'confirmed' && (
                        <div className={`text-xs mt-1 px-1 py-0.5 rounded ${
                          booking.status === 'cancelled' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {dayBookings.length === 0 && viewMode === 'week' && (
                    <div className="text-xs text-gray-400 italic">
                      No bookings
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {!loading && bookings.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Period Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Bookings:</span>
              <span className="ml-2 font-medium">{bookings.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Confirmed:</span>
              <span className="ml-2 font-medium text-green-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Cancelled:</span>
              <span className="ml-2 font-medium text-red-600">
                {bookings.filter(b => b.status === 'cancelled').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaView;