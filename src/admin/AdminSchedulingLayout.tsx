import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Settings, LogOut, BarChart3, Mail, CalendarDays } from 'lucide-react';
import * as adminApi from '../utils/adminApi';
import AdminOverview from './AdminOverview';
import EventTypesManager from './EventTypesManager';
import AvailabilityManager from './AvailabilityManager';
import BookingsManager from './BookingsManager';
import { NotificationsManager } from './NotificationsManager';
import AgendaView from './AgendaView';

type AdminPage = 'overview' | 'event-types' | 'availability' | 'bookings' | 'agenda' | 'notifications';

interface AdminSchedulingLayoutProps {
  onLogout: () => void;
}

const AdminSchedulingLayout: React.FC<AdminSchedulingLayoutProps> = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState<AdminPage>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use cookie-based session; no frontend secrets
        await adminApi.fetchJSON('/admin/scheduling/overview');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const navigation = [
    {
      id: 'overview' as AdminPage,
      name: 'Overview',
      icon: BarChart3,
      description: 'Dashboard and statistics'
    },
    {
      id: 'agenda' as AdminPage,
      name: 'Agenda',
      icon: CalendarDays,
      description: 'Calendar view'
    },
    {
      id: 'event-types' as AdminPage,
      name: 'Event Types',
      icon: Calendar,
      description: 'Manage meeting types'
    },
    {
      id: 'availability' as AdminPage,
      name: 'Availability',
      icon: Clock,
      description: 'Configure schedules'
    },
    {
      id: 'bookings' as AdminPage,
      name: 'Bookings',
      icon: Users,
      description: 'Manage appointments'
    },
    {
      id: 'notifications' as AdminPage,
      name: 'Notifications',
      icon: Mail,
      description: 'Email & reminders'
    }
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <AdminOverview isAuthenticated={isAuthenticated} />;
      case 'agenda':
        return <AgendaView isAuthenticated={isAuthenticated} />;
      case 'event-types':
        return <EventTypesManager isAuthenticated={isAuthenticated} />;
      case 'availability':
        return <AvailabilityManager isAuthenticated={isAuthenticated} />;
      case 'bookings':
        return <BookingsManager isAuthenticated={isAuthenticated} />;
      case 'notifications':
        return <NotificationsManager />;
      default:
        return <AdminOverview isAuthenticated={isAuthenticated} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600 mb-6">
              This admin panel requires HTTP Basic Authentication.
              Please use your browser's authentication dialog.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Authentication
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Scheduling Admin</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your calendar system</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default AdminSchedulingLayout;