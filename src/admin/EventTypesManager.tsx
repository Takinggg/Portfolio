import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Clock, Users, MapPin } from 'lucide-react';
import * as adminApi from '../utils/adminApi';
import { ApiError } from '../utils/adminApi';
import ErrorBanner from '../components/admin/ErrorBanner';

interface EventType {
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
  availability_rules_count?: number;
  total_bookings?: number;
}

interface EventTypesManagerProps {
  isAuthenticated: boolean;
}

const EventTypesManager: React.FC<EventTypesManagerProps> = ({ isAuthenticated }) => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<EventType>>({
    name: '',
    description: '',
    duration_minutes: 30,
    location_type: 'visio',
    color: '#3B82F6',
    is_active: true,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    min_lead_time_hours: 1,
    max_advance_days: 30
  });

  const fetchEventTypes = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await adminApi.fetchJSON('/admin/scheduling/event-types');
      setEventTypes((result as { eventTypes: EventType[] }).eventTypes || []);
    } catch (err) {
      console.error('Error fetching event types:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, [isAuthenticated]);

  const handleSave = async () => {
    try {
      if (editingId) {
        await adminApi.patchJSON(`/admin/scheduling/event-types/${editingId}`, formData);
      } else {
        await adminApi.postJSON('/admin/scheduling/event-types', formData);
      }

      await fetchEventTypes();
      setEditingId(null);
      setIsCreating(false);
      setFormData({
        name: '',
        description: '',
        duration_minutes: 30,
        location_type: 'visio',
        color: '#3B82F6',
        is_active: true,
        buffer_before_minutes: 0,
        buffer_after_minutes: 0,
        min_lead_time_hours: 1,
        max_advance_days: 30
      });
    } catch (err) {
      console.error('Error saving event type:', err);
      const { message } = adminApi.formatErrorMessage(err);
      alert(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event type?')) return;

    try {
      await adminApi.deleteJSON(`/admin/scheduling/event-types/${id}`);
      await fetchEventTypes();
    } catch (err) {
      console.error('Error deleting event type:', err);
      const { message } = adminApi.formatErrorMessage(err);
      alert(message);
    }
  };

  const startEdit = (eventType: EventType) => {
    setEditingId(eventType.id);
    setFormData(eventType);
    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      duration_minutes: 30,
      location_type: 'visio',
      color: '#3B82F6',
      is_active: true,
      buffer_before_minutes: 0,
      buffer_after_minutes: 0,
      min_lead_time_hours: 1,
      max_advance_days: 30
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      name: '',
      description: '',
      duration_minutes: 30,
      location_type: 'visio',
      color: '#3B82F6',
      is_active: true,
      buffer_before_minutes: 0,
      buffer_after_minutes: 0,
      min_lead_time_hours: 1,
      max_advance_days: 30
    });
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
        <p className="text-gray-600">Please authenticate to access event types management.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading event types...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorBanner 
          error={error} 
          onRetry={fetchEventTypes}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Types</h1>
          <p className="text-gray-600 mt-2">Manage your meeting types and configurations</p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event Type
        </button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {isCreating ? 'Create New Event Type' : 'Edit Event Type'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Quick Chat"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.duration_minutes || ''}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="5"
                max="480"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Type *
              </label>
              <select
                value={formData.location_type || 'visio'}
                onChange={(e) => setFormData({ ...formData, location_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="visio">Video Call</option>
                <option value="physique">In Person</option>
                <option value="telephone">Phone Call</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="color"
                value={formData.color || '#3B82F6'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Brief description of this event type"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Lead Time (hours)
              </label>
              <input
                type="number"
                value={formData.min_lead_time_hours || ''}
                onChange={(e) => setFormData({ ...formData, min_lead_time_hours: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="168"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Advance Days
              </label>
              <input
                type="number"
                value={formData.max_advance_days || ''}
                onChange={(e) => setFormData({ ...formData, max_advance_days: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="365"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 inline mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Event Types List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventTypes.map((eventType) => (
          <div
            key={eventType.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: eventType.color }}
                />
                <h3 className="font-semibold text-gray-900">{eventType.name}</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => startEdit(eventType)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(eventType.id)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {eventType.description && (
              <p className="text-gray-600 text-sm mb-4">{eventType.description}</p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <span>{eventType.duration_minutes} minutes</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                <span>
                  {getLocationIcon(eventType.location_type)} {eventType.location_type}
                </span>
              </div>

              <div className="flex items-center">
                <Users className="w-4 h-4 text-gray-400 mr-2" />
                <span>{eventType.total_bookings || 0} bookings</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs ${
                eventType.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {eventType.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-500">
                {eventType.availability_rules_count || 0} rules
              </span>
            </div>
          </div>
        ))}
      </div>

      {eventTypes.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No event types</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first event type.</p>
          <button
            onClick={startCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Event Type
          </button>
        </div>
      )}
    </div>
  );
};

export default EventTypesManager;