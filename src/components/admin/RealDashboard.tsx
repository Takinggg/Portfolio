import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Briefcase,
  MessageCircle,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  Database,
} from 'lucide-react';
import StatsCard from './StatsCard';
import { blogService, projectService, contactService } from '../../lib/api';

interface RealDashboardStats {
  totalPosts: number;
  totalProjects: number;
  totalMessages: number;
  unreadMessages: number;
  recentPostsCount: number;
  recentProjectsCount: number;
}

const RealDashboard: React.FC = () => {
  const [stats, setStats] = useState<RealDashboardStats>({
    totalPosts: 0,
    totalProjects: 0,
    totalMessages: 0,
    unreadMessages: 0,
    recentPostsCount: 0,
    recentProjectsCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    setLoading(true);
    try {
      // Fetch all real data from APIs
      const [postsResult, projectsResult, messagesResult, unreadResult] = await Promise.all([
        blogService.getAllPosts(),
        projectService.getAllProjects(),
        contactService.getAllMessages(),
        contactService.getUnreadCount(),
      ]);

      const posts = postsResult.data || [];
      const projects = projectsResult.data || [];
      const messages = messagesResult.data || [];
      const unreadCount = unreadResult.count || 0;

      // Calculate recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentPosts = posts.filter(post => 
        post.created_at && new Date(post.created_at) > thirtyDaysAgo
      );
      const recentProjects = projects.filter(project => 
        project.created_at && new Date(project.created_at) > thirtyDaysAgo
      );

      setStats({
        totalPosts: posts.length,
        totalProjects: projects.length,
        totalMessages: messages.length,
        unreadMessages: unreadCount,
        recentPostsCount: recentPosts.length,
        recentProjectsCount: recentProjects.length,
      });

      // Generate real recent activity
      const activity = [];
      
      // Add recent posts
      recentPosts.slice(0, 3).forEach(post => {
        activity.push({
          action: 'Article publié',
          item: post.title,
          time: getTimeAgo(post.created_at),
          type: 'blog',
          color: 'blue',
        });
      });

      // Add recent projects
      recentProjects.slice(0, 2).forEach(project => {
        activity.push({
          action: 'Projet créé',
          item: project.title,
          time: getTimeAgo(project.created_at),
          type: 'project',
          color: 'purple',
        });
      });

      // Add recent messages if any
      const recentMessages = messages.filter(msg => 
        msg.created_at && new Date(msg.created_at) > thirtyDaysAgo
      ).slice(0, 2);
      
      recentMessages.forEach(message => {
        activity.push({
          action: 'Message reçu',
          item: `De ${message.name}`,
          time: getTimeAgo(message.created_at),
          type: 'message',
          color: 'green',
        });
      });

      // Sort by most recent
      activity.sort((a, b) => {
        const timeA = parseTimeAgo(a.time);
        const timeB = parseTimeAgo(b.time);
        return timeA - timeB;
      });

      setRecentActivity(activity.slice(0, 4));
    } catch (error) {
      console.error('Error fetching real dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string): string => {
    if (!dateString) return 'Récemment';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}j`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMinutes > 0) return `${diffMinutes}m`;
    return 'Maintenant';
  };

  const parseTimeAgo = (timeStr: string): number => {
    if (timeStr === 'Maintenant' || timeStr === 'Récemment') return 0;
    const match = timeStr.match(/(\d+)([jhm])/);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'j': return value * 24 * 60;
      case 'h': return value * 60;
      case 'm': return value;
      default: return 0;
    }
  };

  const getGrowthPercentage = (recent: number, total: number): string => {
    if (total === 0) return '+0%';
    const percentage = ((recent / total) * 100).toFixed(1);
    return `+${percentage}%`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Tableau de bord authentique
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Données réelles de votre portfolio
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <Database size={16} className="text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            Données réelles
          </span>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Articles publiés"
          value={stats.totalPosts}
          icon={FileText}
          color="blue"
          change={{
            value: stats.recentPostsCount > 0 ? `${stats.recentPostsCount} ce mois` : 'Aucun récent',
            trend: stats.recentPostsCount > 0 ? 'up' : 'neutral',
          }}
          description="Total dans la base de données"
          loading={loading}
        />
        
        <StatsCard
          title="Projets"
          value={stats.totalProjects}
          icon={Briefcase}
          color="purple"
          change={{
            value: stats.recentProjectsCount > 0 ? `${stats.recentProjectsCount} ce mois` : 'Aucun récent',
            trend: stats.recentProjectsCount > 0 ? 'up' : 'neutral',
          }}
          description="Portfolio complet"
          loading={loading}
        />
        
        <StatsCard
          title="Messages de contact"
          value={stats.totalMessages}
          icon={MessageCircle}
          color="green"
          change={{
            value: stats.unreadMessages > 0 ? `${stats.unreadMessages} non lus` : 'Tous lus',
            trend: stats.unreadMessages > 0 ? 'neutral' : 'up',
          }}
          description="Demandes reçues"
          loading={loading}
        />

        <StatsCard
          title="Contenu total"
          value={stats.totalPosts + stats.totalProjects}
          icon={Users}
          color="orange"
          change={{
            value: getGrowthPercentage(stats.recentPostsCount + stats.recentProjectsCount, stats.totalPosts + stats.totalProjects),
            trend: (stats.recentPostsCount + stats.recentProjectsCount) > 0 ? 'up' : 'neutral',
          }}
          description="Articles + Projets"
          loading={loading}
        />
      </div>

      {/* Content Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Distribution du contenu
            </h3>
            <TrendingUp className="text-gray-400" size={20} />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" size={20} />
                <span className="font-medium text-gray-900 dark:text-gray-100">Articles de blog</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{stats.totalPosts}</div>
                <div className="text-sm text-gray-500">
                  {stats.totalPosts > 0 ? `${((stats.totalPosts / (stats.totalPosts + stats.totalProjects)) * 100).toFixed(1)}%` : '0%'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Briefcase className="text-purple-600" size={20} />
                <span className="font-medium text-gray-900 dark:text-gray-100">Projets portfolio</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{stats.totalProjects}</div>
                <div className="text-sm text-gray-500">
                  {stats.totalProjects > 0 ? `${((stats.totalProjects / (stats.totalPosts + stats.totalProjects)) * 100).toFixed(1)}%` : '0%'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Activité récente (30 derniers jours)
          </h3>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className={`w-10 h-10 bg-${activity.color}-100 dark:bg-${activity.color}-900/20 rounded-full flex items-center justify-center`}>
                    {activity.type === 'blog' && <FileText size={16} className={`text-${activity.color}-600`} />}
                    {activity.type === 'project' && <Briefcase size={16} className={`text-${activity.color}-600`} />}
                    {activity.type === 'message' && <MessageCircle size={16} className={`text-${activity.color}-600`} />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{activity.action}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{activity.item}</div>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Calendar size={48} className="mb-4 opacity-50" />
              <p className="text-center">Aucune activité récente</p>
              <p className="text-sm text-center">Les nouvelles publications apparaîtront ici</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Status Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Informations sur les données
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Source des données</div>
            <div className="text-gray-900 dark:text-gray-100">Base de données SQLite</div>
            <div className="text-xs text-gray-500 mt-1">Données authentiques uniquement</div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Prêt pour analytics</div>
            <div className="text-gray-900 dark:text-gray-100">Google Analytics</div>
            <div className="text-xs text-gray-500 mt-1">Intégration future disponible</div>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">Dernière mise à jour</div>
            <div className="text-gray-900 dark:text-gray-100">Temps réel</div>
            <div className="text-xs text-gray-500 mt-1">Rafraîchi automatiquement</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RealDashboard;