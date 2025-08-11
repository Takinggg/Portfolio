import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  FileText,
  Briefcase,
  MessageCircle,
  Users,
  Settings,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Upload,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { authService } from '../../lib/auth';
import toast from 'react-hot-toast';

interface ModernAdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  stats?: {
    unreadMessages?: number;
    totalNotifications?: number;
  };
}

const ModernAdminLayout: React.FC<ModernAdminLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onLogout,
  stats = {},
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const user = authService.getUser();

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: BarChart3,
      description: 'Vue d\'ensemble et métriques',
    },
    {
      id: 'blogs',
      label: 'Articles',
      icon: FileText,
      description: 'Gestion des articles de blog',
    },
    {
      id: 'projects',
      label: 'Projets',
      icon: Briefcase,
      description: 'Portfolio et projets',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      description: 'Messagerie et contact',
      badge: stats.unreadMessages || 0,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Statistiques détaillées',
    },
    {
      id: 'files',
      label: 'Fichiers',
      icon: Upload,
      description: 'Gestionnaire de médias',
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: Users,
      description: 'Gestion des utilisateurs',
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      description: 'Configuration système',
    },
  ];

  // Mock notifications for demo
  useEffect(() => {
    setNotifications([
      {
        id: 1,
        type: 'message',
        title: 'Nouveau message reçu',
        description: 'John Doe vous a envoyé un message',
        time: '2 min',
        unread: true,
      },
      {
        id: 2,
        type: 'system',
        title: 'Mise à jour système',
        description: 'Une nouvelle version est disponible',
        time: '1h',
        unread: false,
      },
    ]);
  }, []);

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Recherche: ${searchQuery}`);
      // Implement search functionality
    }
  };

  const getActiveItem = () => {
    return sidebarItems.find(item => item.id === activeTab);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%',
        }}
        className="fixed left-0 top-0 z-50 h-full w-80 bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700 lg:translate-x-0 lg:static lg:z-auto transition-colors duration-300"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Admin Panel</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">FOULON Maxence</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const hasBadge = item.badge && item.badge > 0;

            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onTabChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <div className="relative">
                  <Icon size={20} className="transition-colors duration-200" />
                  {hasBadge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70 truncate">{item.description}</div>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-2 h-2 bg-purple-600 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.username || 'Admin'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'admin@example.com'}
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:ml-80">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Menu size={20} />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {getActiveItem()?.label || 'Administration'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getActiveItem()?.description || 'Gestion de votre portfolio'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="pl-10 pr-4 py-2 w-64 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
                  />
                </div>
              </form>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative"
                >
                  <Bell size={20} />
                  {stats.totalNotifications && stats.totalNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {stats.totalNotifications}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                              notification.unread ? 'bg-purple-50 dark:bg-purple-900/10' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.unread ? 'bg-purple-600' : 'bg-gray-300'
                              }`} />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                  {notification.title}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                                  {notification.description}
                                </p>
                                <span className="text-gray-500 dark:text-gray-500 text-xs">
                                  {notification.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.username?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <ChevronDown size={16} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {user?.username || 'Admin'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.email || 'admin@example.com'}
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        >
                          <LogOut size={16} />
                          Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ModernAdminLayout;