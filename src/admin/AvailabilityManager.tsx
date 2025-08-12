import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import * as adminApi from '../utils/adminApi';
import ErrorBanner from '../components/admin/ErrorBanner';

interface AvailabilityRule {
  id: number;
  event_type_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  event_type_name?: string;
}

interface AvailabilityException {
  id: number;
  event_type_id: number;
  exception_date: string;
  exception_type: 'unavailable' | 'custom_hours';
  start_time?: string;
  end_time?: string;
  timezone: string;
  reason?: string;
  created_at: string;
  event_type_name?: string;
}

interface EventType {
  id: number;
  name: string;
}

interface AvailabilityManagerProps {
  isAuthenticated: boolean;
}

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ isAuthenticated }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'exceptions'>('rules');
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Form states
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    event_type_id: '',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    timezone: 'UTC',
    is_active: true
  });
  const [exceptionForm, setExceptionForm] = useState({
    event_type_id: '',
    exception_date: '',
    exception_type: 'unavailable' as 'unavailable' | 'custom_hours',
    start_time: '',
    end_time: '',
    timezone: 'UTC',
    reason: ''
  });

  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const fetchData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch event types
      const eventTypesData = await adminApi.fetchJSON('/api/admin/scheduling/event-types');
      setEventTypes((eventTypesData as any).eventTypes || []);

      // Fetch availability rules
      const rulesData = await adminApi.fetchJSON('/api/admin/scheduling/availability-rules');
      setRules((rulesData as any).availabilityRules || []);

      // Fetch exceptions
      const exceptionsData = await adminApi.fetchJSON('/api/admin/scheduling/exceptions');
      setExceptions((exceptionsData as any).availabilityExceptions || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const handleCreateRule = async () => {
    try {
      await adminApi.postJSON('/api/admin/scheduling/availability-rules', {
        ...ruleForm,
        event_type_id: parseInt(ruleForm.event_type_id)
      });

      setShowRuleForm(false);
      setRuleForm({
        event_type_id: '',
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'UTC',
        is_active: true
      });
      await fetchData();
    } catch (err) {
      console.error('Error creating rule:', err);
      const { message } = adminApi.formatErrorMessage(err);
      alert(message);
    }
  };

  const handleCreateException = async () => {
    try {
      await adminApi.postJSON('/api/admin/scheduling/exceptions', {
        ...exceptionForm,
        event_type_id: parseInt(exceptionForm.event_type_id),
        start_time: exceptionForm.exception_type === 'custom_hours' ? exceptionForm.start_time : undefined,
        end_time: exceptionForm.exception_type === 'custom_hours' ? exceptionForm.end_time : undefined
      });

      setShowExceptionForm(false);
      setExceptionForm({
        event_type_id: '',
        exception_date: '',
        exception_type: 'unavailable',
        start_time: '',
        end_time: '',
        timezone: 'UTC',
        reason: ''
      });
      await fetchData();
    } catch (err) {
      console.error('Error creating exception:', err);
      const { message } = adminApi.formatErrorMessage(err);
      alert(message);
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Are you sure you want to delete this availability rule?')) return;

    try {
      await adminApi.deleteJSON(`/api/admin/scheduling/availability-rules/${id}`);
      await fetchData();
    } catch (err) {
      console.error('Error deleting rule:', err);
      const { message } = adminApi.formatErrorMessage(err);
      alert(message);
    }
  };

  const handleDeleteException = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exception?')) return;

    try {
      await adminApi.deleteJSON(`/api/admin/scheduling/exceptions/${id}`);
      await fetchData();
    } catch (err) {
      console.error('Error deleting exception:', err);
      const { message } = adminApi.formatErrorMessage(err);
      alert(message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Please authenticate to access availability management.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading availability settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorBanner 
          error={error} 
          onRetry={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Availability Management</h1>
        <p className="text-gray-600 mt-2">Configure when meetings can be scheduled</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              Recurring Rules
            </button>
            <button
              onClick={() => setActiveTab('exceptions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'exceptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              Exceptions
            </button>
          </nav>
        </div>
      </div>

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Weekly Availability Rules</h2>
            <button
              onClick={() => setShowRuleForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </button>
          </div>

          {/* Rule Form */}
          {showRuleForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Create Availability Rule</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    value={ruleForm.event_type_id}
                    onChange={(e) => setRuleForm({ ...ruleForm, event_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Event Type</option>
                    {eventTypes.map((et) => (
                      <option key={et.id} value={et.id}>{et.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Week *
                  </label>
                  <select
                    value={ruleForm.day_of_week}
                    onChange={(e) => setRuleForm({ ...ruleForm, day_of_week: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    {dayNames.map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={ruleForm.start_time}
                    onChange={(e) => setRuleForm({ ...ruleForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={ruleForm.end_time}
                    onChange={(e) => setRuleForm({ ...ruleForm, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRuleForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleCreateRule}
                  disabled={!ruleForm.event_type_id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  Create Rule
                </button>
              </div>
            </div>
          )}

          {/* Rules List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Range
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
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.event_type_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dayNames[rule.day_of_week]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.start_time} - {rule.end_time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          rule.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rules.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No availability rules</h3>
                <p className="text-gray-600">Create rules to define when meetings can be scheduled.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exceptions Tab */}
      {activeTab === 'exceptions' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Availability Exceptions</h2>
            <button
              onClick={() => setShowExceptionForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add Exception
            </button>
          </div>

          {/* Exception Form */}
          {showExceptionForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Create Availability Exception</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    value={exceptionForm.event_type_id}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, event_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Event Type</option>
                    {eventTypes.map((et) => (
                      <option key={et.id} value={et.id}>{et.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={exceptionForm.exception_date}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, exception_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exception Type *
                  </label>
                  <select
                    value={exceptionForm.exception_type}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, exception_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="unavailable">Unavailable</option>
                    <option value="custom_hours">Custom Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={exceptionForm.reason}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Holiday, Vacation"/>
                </div>

                {exceptionForm.exception_type === 'custom_hours' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={exceptionForm.start_time}
                        onChange={(e) => setExceptionForm({ ...exceptionForm, start_time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={exceptionForm.end_time}
                        onChange={(e) => setExceptionForm({ ...exceptionForm, end_time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowExceptionForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleCreateException}
                  disabled={!exceptionForm.event_type_id || !exceptionForm.exception_date}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  Create Exception
                </button>
              </div>
            </div>
          )}

          {/* Exceptions List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exceptions.map((exception) => (
                    <tr key={exception.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exception.event_type_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(exception.exception_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          exception.exception_type === 'unavailable' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {exception.exception_type === 'unavailable' ? 'Unavailable' : 'Custom Hours'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exception.exception_type === 'custom_hours' && exception.start_time && exception.end_time
                          ? `${exception.start_time} - ${exception.end_time}`
                          : exception.reason || 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteException(exception.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {exceptions.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No exceptions</h3>
                <p className="text-gray-600">Create exceptions for holidays, vacations, or special hours.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager;