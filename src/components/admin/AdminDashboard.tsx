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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Simplified Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">FOULON Maxence</p>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === item.id
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
                {item.id === 'messages' && stats.unreadMessages > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-auto">
                    {stats.unreadMessages}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Interface d'administration modernisée
            </p>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;