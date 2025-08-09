import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Briefcase, Users, Settings, Plus, Search, Filter, Eye, Edit, Trash2, Calendar, TrendingUp, MessageCircle } from 'lucide-react';
import { supabase, blogService, projectService, contactService } from '../../lib/supabase';
import BlogManager from './BlogManager';
import ProjectManager from './ProjectManager';
import MessagesManager from './MessagesManager';
import Analytics from './Analytics';
import FileManager from './FileManager';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalProjects: 0,
    totalViews: 0,
    totalMessages: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch real data from Supabase
      const [postsResult, projectsResult, messagesResult, unreadResult] = await Promise.all([
        blogService.getAllPosts(),
        projectService.getAllProjects(),
        contactService.getAllMessages(),
        contactService.getUnreadCount()
      ]);

      const totalPosts = postsResult.data?.length || 0;
      const totalProjects = projectsResult.data?.length || 0;
      const totalMessages = messagesResult.data?.length || 0;
      const unreadMessages = unreadResult.count || 0;
      
      // Calculate total views (mock for now, you can add a views column later)
      const totalViews = totalPosts * 150 + totalProjects * 200;
      
      setStats({
        totalPosts,
        totalProjects,
        totalViews,
        totalMessages,
        unreadMessages,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to mock data
      setStats({
        totalPosts: 0,
        totalProjects: 0,
        totalViews: 0,
        totalMessages: 0,
        unreadMessages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'blogs', label: 'Articles', icon: FileText },
    { id: 'projects', label: 'Projets', icon: Briefcase },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'files', label: 'Fichiers', icon: Users },
    { id: 'settings', label: 'Paramètres', icon: Settings }
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
      case 'settings':
        return <div>Paramètres</div>;
      default:
        return (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${loading ? 'animate-pulse' : ''}`}>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Articles</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? '...' : stats.totalPosts}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Projets</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? '...' : stats.totalProjects}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Briefcase className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Vues totales</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? '...' : stats.totalViews.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Eye className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Visiteurs uniques</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? '...' : Math.floor(stats.totalViews * 0.65).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Users className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Messages</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? '...' : stats.totalMessages}
                    </p>
                    {stats.unreadMessages > 0 && (
                      <p className="text-xs text-blue-600 font-medium">
                        {stats.unreadMessages} non lu(s)
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <MessageCircle className="text-green-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Activité récente</h3>
              <div className="space-y-4">
                {[
                  { action: 'Nouvel article publié', item: 'L\'avenir du Design UI/UX', time: '2h', type: 'blog' },
                  { action: 'Projet mis à jour', item: 'FinTech Mobile Revolution', time: '4h', type: 'project' },
                  { action: 'Commentaire reçu', item: 'Design System : Créer une Cohérence', time: '6h', type: 'comment' },
                  { action: 'Nouveau visiteur', item: 'Page projets consultée', time: '6h', type: 'visitor' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'blog' ? 'bg-blue-100' :
                      activity.type === 'project' ? 'bg-purple-100' : 
                      activity.type === 'visitor' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {activity.type === 'blog' ? <FileText size={16} className="text-blue-600" /> :
                       activity.type === 'project' ? <Briefcase size={16} className="text-purple-600" /> :
                       activity.type === 'visitor' ? <Eye size={16} className="text-green-600" /> :
                       <Users size={16} className="text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.item}</p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Administration</h2>
              <p className="text-sm text-gray-600">FOULON Maxence</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
              title="Déconnexion"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const hasNotification = item.id === 'messages' && stats.unreadMessages > 0;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    {item.label}
                  </div>
                  {hasNotification && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                      {stats.unreadMessages}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {sidebarItems.find(item => item.id === activeTab)?.label || 'Tableau de bord'}
            </h1>
            <p className="text-gray-600">
              Gérez votre contenu et suivez vos performances
            </p>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;