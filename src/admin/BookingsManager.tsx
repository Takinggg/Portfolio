import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, Mail, Phone, X, Check, Edit, MapPin } from 'lucide-react';

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

interface EventType {
  id: number;
  name: string;
}

interface BookingsManagerProps {
  isAuthenticated: boolean;
}

const BookingsManager: React.FC<BookingsManagerProps> = ({ isAuthenticated }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: '',
    event_type_id: '',
    search: ''
  });

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleData, setRescheduleData] = useState({
    newStart: '',
    newEnd: ''
  });

  const fetchBookings = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.event_type_id) queryParams.append('event_type_id', filters.event_type_id);

      const response = await fetch(`/api/admin/scheduling/bookings?${queryParams}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_ADMIN_USERNAME}:${import.meta.env.VITE_ADMIN_PASSWORD}`)}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      let fetchedBookings = result.bookings || [];

      // Client-side search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        fetchedBookings = fetchedBookings.filter((booking: Booking) =>
          booking.invitee_name.toLowerCase().includes(searchLower) ||
          booking.invitee_email.toLowerCase().includes(searchLower) ||
          booking.event_type_name.toLowerCase().includes(searchLower)
        );
      }

      setBookings(fetchedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTypes = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch('/api/admin/scheduling/event-types', {
        headers: {
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_ADMIN_USERNAME}:${import.meta.env.VITE_ADMIN_PASSWORD}`)}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event types');
      }

      const result = await response.json();
      setEventTypes(result.eventTypes || []);
    } catch (err) {
      console.error('Error fetching event types:', err);
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated, filters.start_date, filters.end_date, filters.status, filters.event_type_id]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(`/api/admin/scheduling/bookings/${selectedBooking.uuid}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_ADMIN_USERNAME}:${import.meta.env.VITE_ADMIN_PASSWORD}`)}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }

      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
      await fetchBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  const handleRescheduleBooking = async () => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(`/api/admin/scheduling/bookings/${selectedBooking.uuid}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_ADMIN_USERNAME}:${import.meta.env.VITE_ADMIN_PASSWORD}`)}`
        },
        body: JSON.stringify(rescheduleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reschedule booking');
      }

      setShowRescheduleModal(false);
      setSelectedBooking(null);
      setRescheduleData({ newStart: '', newEnd: '' });
      await fetchBookings();
    } catch (err) {
      console.error('Error rescheduling booking:', err);
      alert(err instanceof Error ? err.message : 'Failed to reschedule booking');
    }
  };

  const handleExportCSV = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.event_type_id) queryParams.append('event_type_id', filters.event_type_id);

      const response = await fetch(`/api/admin/scheduling/bookings.csv?${queryParams}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_ADMIN_USERNAME}:${import.meta.env.VITE_ADMIN_PASSWORD}`)}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export bookings');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert(err instanceof Error ? err.message : 'Failed to export bookings');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'visio': return '🖥️';
      case 'physique': return '🏢';
      case 'telephone': return '📞';
      default: return '📅';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Please authenticate to access bookings management.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-2">View and manage all appointments</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Name, email, event..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
            <select
              value={filters.event_type_id}
              onChange={(e) => setFilters({ ...filters, event_type_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {eventTypes.map((et) => (
                <option key={et.id} value={et.id}>{et.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading bookings...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">Error loading bookings</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invitee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.invitee_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {booking.invitee_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: booking.color }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.event_type_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {getLocationIcon(booking.location_type)} {booking.location_type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.start_time).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(booking.start_time).toLocaleTimeString()} - {new Date(booking.end_time).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {booking.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowRescheduleModal(true);
                                setRescheduleData({
                                  newStart: booking.start_time.slice(0, 16),
                                  newEnd: booking.end_time.slice(0, 16)
                                });
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Reschedule"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowCancelModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            const mailtoLink = `mailto:${booking.invitee_email}?subject=Regarding your ${booking.event_type_name} appointment`;
                            window.location.href = mailtoLink;
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">Try adjusting your filters or date range.</p>
            </div>
          )}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Cancel Booking</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel the booking for {selectedBooking.invitee_name}?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Optional reason for cancellation..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancelReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Reschedule Booking</h2>
            <p className="text-gray-600 mb-4">
              Reschedule the booking for {selectedBooking.invitee_name}
            </p>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Start Time
                </label>
                <input
                  type="datetime-local"
                  value={rescheduleData.newStart}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newStart: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New End Time
                </label>
                <input
                  type="datetime-local"
                  value={rescheduleData.newEnd}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newEnd: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedBooking(null);
                  setRescheduleData({ newStart: '', newEnd: '' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleBooking}
                disabled={!rescheduleData.newStart || !rescheduleData.newEnd}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManager;