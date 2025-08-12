import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { handleApiError, safeJsonParse } from '../lib/api-utils';

interface DashboardStats {
  eventTypes: { count: number };
  availabilityRules: { count: number };
  totalBookings: { count: number };
  activeBookings: { count: number };
  todayBookings: { count: number };
  upcomingBookings: { count: number };
  recentCancellations: { count: number };
}

interface AuditStats {
  total_logs: number;
  recent_actions: number;
  unique_admins: number;
}

interface OverviewData {
  stats: DashboardStats;
  auditStats: AuditStats;
  timestamp: string;
}

interface AdminOverviewProps {
  isAuthenticated: boolean;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ isAuthenticated }) => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/scheduling/overview', {
        headers: {
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_ADMIN_USERNAME}:${import.meta.env.VITE_ADMIN_PASSWORD}`)}`
        }
      });

      if (!response.ok) {
        await handleApiError(response, 'Failed to fetch overview');
      }

      const result = await safeJsonParse(response);
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching overview:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchOverview, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Please authenticate to access the admin panel.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading overview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading overview</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={fetchOverview}
            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  const { stats, auditStats } = data;

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  }> = ({ title, value, icon, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      green: 'bg-green-50 border-green-200 text-green-600',
      orange: 'bg-orange-50 border-orange-200 text-orange-600',
      red: 'bg-red-50 border-red-200 text-red-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
    };

    return (
      <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
          </div>
          <div className="flex items-center space-x-2">
            {icon}
            {trend && (
              <div className="text-xs">
                {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Scheduling Overview</h1>
        <p className="text-gray-600 mt-2">Monitor your scheduling system performance and activity</p>
        <p className="text-xs text-gray-500 mt-1">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Event Types"
          value={stats.eventTypes.count}
          icon={<Calendar className="w-8 h-8" />}
          color="blue"
        />
        
        <StatCard
          title="Availability Rules"
          value={stats.availabilityRules.count}
          icon={<Clock className="w-8 h-8" />}
          color="green"
        />
        
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings.count}
          icon={<Users className="w-8 h-8" />}
          color="purple"
        />
        
        <StatCard
          title="Active Bookings"
          value={stats.activeBookings.count}
          icon={<Activity className="w-8 h-8" />}
          color="orange"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Today's Bookings"
          value={stats.todayBookings.count}
          icon={<Calendar className="w-6 h-6" />}
          color="green"
        />
        
        <StatCard
          title="Upcoming Bookings"
          value={stats.upcomingBookings.count}
          icon={<Clock className="w-6 h-6" />}
          color="blue"
        />
        
        <StatCard
          title="Recent Cancellations"
          value={stats.recentCancellations.count}
          icon={<TrendingDown className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Audit Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{auditStats.total_logs}</p>
            <p className="text-sm text-gray-600">Total Actions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{auditStats.recent_actions}</p>
            <p className="text-sm text-gray-600">Last 24 Hours</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{auditStats.unique_admins}</p>
            <p className="text-sm text-gray-600">Active Admins</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left">
            <Calendar className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">New Event Type</p>
            <p className="text-sm text-gray-600">Create a new event type</p>
          </button>
          
          <button className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left">
            <Clock className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">Set Availability</p>
            <p className="text-sm text-gray-600">Configure availability rules</p>
          </button>
          
          <button className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left">
            <Users className="w-6 h-6 text-purple-600 mb-2" />
            <p className="font-medium text-gray-900">View Bookings</p>
            <p className="text-sm text-gray-600">Manage all bookings</p>
          </button>
          
          <button className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left">
            <Activity className="w-6 h-6 text-orange-600 mb-2" />
            <p className="font-medium text-gray-900">Export Data</p>
            <p className="text-sm text-gray-600">Download CSV reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;