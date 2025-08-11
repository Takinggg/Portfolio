import React, { useState, useEffect } from 'react';
import { contactService } from '../../lib/api';
import BlogManager from './BlogManager';
import ProjectManager from './ProjectManager';
import MessagesManager from './MessagesManager';
import Analytics from './Analytics';
import FileManager from './FileManager';
import RealDashboard from './RealDashboard';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    unreadMessages: 0,
    totalNotifications: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const unreadResult = await contactService.getUnreadCount();
      const unreadMessages = unreadResult.count || 0;
      
      setStats({
        unreadMessages,
        totalNotifications: unreadMessages,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'blogs', label: 'Articles', icon: '📝' },
    { id: 'projects', label: 'Projets', icon: '💼' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'files', label: 'Fichiers', icon: '📁' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'blogs':
        return <BlogManager />;
      case 'projects':
        return <ProjectManager />;
      case 'messages':
        return <MessagesManager />;
      case 'analytics':
        return <Analytics />;
      case 'files':
        return <FileManager />;
      default:
        return <RealDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Enhanced Sidebar with better contrast and flex layout */}
      <div className="w-64 bg-white shadow-xl border-r-2 border-gray-200 flex flex-col">
        <div className="p-6 border-b-2 border-gray-200 bg-blue-50">
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-sm text-gray-700 font-medium">FOULON Maxence</p>
        </div>
        
        <nav className="p-4 flex-1">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all font-medium ${
                  activeTab === item.id
                    ? 'bg-blue-100 text-blue-900 border-2 border-blue-300 shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-2 border-transparent'
                }`}
                aria-label={`Naviguer vers ${item.label}`}
                aria-current={activeTab === item.id ? 'page' : undefined}
              >
                <span className="text-lg" role="img" aria-hidden="true">{item.icon}</span>
                {item.label}
                {item.id === 'messages' && stats.unreadMessages > 0 && (
                  <span 
                    className="bg-red-600 text-white text-xs px-2 py-1 rounded-full ml-auto font-bold"
                    aria-label={`${stats.unreadMessages} messages non lus`}
                  >
                    {stats.unreadMessages}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={onLogout}
            className="w-full px-4 py-3 bg-red-100 text-red-900 rounded-xl hover:bg-red-200 border-2 border-red-300 hover:border-red-400 transition-all font-semibold focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Se déconnecter de l'administration"
          >
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-gray-700 font-medium">
              Interface d'administration modernisée et accessible
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;