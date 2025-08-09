import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, Users, MessageCircle, Calendar, BarChart3, PieChart, Activity } from 'lucide-react';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    totalComments: 0,
    avgTimeOnSite: 0,
    bounceRate: 0,
    topPosts: [],
    topProjects: [],
    trafficSources: [],
    viewsOverTime: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    // Mock data - replace with actual API call
    setAnalytics({
      totalViews: 15420,
      uniqueVisitors: 8930,
      totalComments: 234,
      avgTimeOnSite: 245, // seconds
      bounceRate: 32.5, // percentage
      topPosts: [
        { title: 'L\'avenir du Design UI/UX', views: 2340, comments: 45 },
        { title: 'Design System : Créer une Cohérence', views: 1890, comments: 32 },
        { title: 'UX Research : Comprendre ses Utilisateurs', views: 1650, comments: 28 }
      ],
      topProjects: [
        { title: 'FinTech Mobile Revolution', views: 3200, likes: 156 },
        { title: 'Neural Analytics Dashboard', views: 2800, likes: 134 },
        { title: 'Quantum Banking Experience', views: 2400, likes: 98 }
      ],
      trafficSources: [
        { source: 'Direct', percentage: 45.2, visitors: 4034 },
        { source: 'Google', percentage: 32.1, visitors: 2866 },
        { source: 'LinkedIn', percentage: 12.8, visitors: 1143 },
        { source: 'Twitter', percentage: 6.4, visitors: 571 },
        { source: 'Autres', percentage: 3.5, visitors: 316 }
      ],
      viewsOverTime: [
        { date: '2024-01-01', views: 450 },
        { date: '2024-01-02', views: 520 },
        { date: '2024-01-03', views: 380 },
        { date: '2024-01-04', views: 680 },
        { date: '2024-01-05', views: 720 },
        { date: '2024-01-06', views: 590 },
        { date: '2024-01-07', views: 810 }
      ]
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const statCards = [
    {
      title: 'Vues totales',
      value: analytics.totalViews.toLocaleString(),
      icon: Eye,
      color: 'blue',
      change: '+12.5%'
    },
    {
      title: 'Visiteurs uniques',
      value: analytics.uniqueVisitors.toLocaleString(),
      icon: Users,
      color: 'green',
      change: '+8.2%'
    },
    {
      title: 'Commentaires',
      value: analytics.totalComments.toString(),
      icon: MessageCircle,
      color: 'purple',
      change: '+15.3%'
    },
    {
      title: 'Temps moyen',
      value: formatTime(analytics.avgTimeOnSite),
      icon: Activity,
      color: 'orange',
      change: '+5.7%'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Suivez les performances de votre contenu</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="7d">7 derniers jours</option>
          <option value="30d">30 derniers jours</option>
          <option value="90d">90 derniers jours</option>
          <option value="1y">1 an</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
                <span className="text-green-600 text-sm font-medium bg-green-100 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Views Over Time */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Vues dans le temps</h3>
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.viewsOverTime.map((data, index) => {
              const maxViews = Math.max(...analytics.viewsOverTime.map(d => d.views));
              const height = (data.views / maxViews) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg transition-all duration-300 hover:from-purple-600 hover:to-purple-400"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                    title={`${data.views} vues`}
                  />
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(data.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sources de trafic</h3>
            <PieChart className="text-gray-400" size={20} />
          </div>
          
          <div className="space-y-4">
            {analytics.trafficSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ 
                      backgroundColor: [
                        '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'
                      ][index] 
                    }}
                  />
                  <span className="font-medium text-gray-900">{source.source}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{source.percentage}%</div>
                  <div className="text-sm text-gray-500">{source.visitors.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Posts */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Articles les plus vus</h3>
          <div className="space-y-4">
            {analytics.topPosts.map((post, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-1">{post.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      {post.comments}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Projects */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Projets les plus vus</h3>
          <div className="space-y-4">
            {analytics.topProjects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-1">{project.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {project.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp size={14} />
                      {project.likes}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Métriques détaillées</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-gray-900 mb-2">{analytics.bounceRate}%</div>
            <div className="text-sm text-gray-600">Taux de rebond</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {(analytics.totalViews / analytics.uniqueVisitors).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Pages par session</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {((analytics.totalComments / analytics.totalViews) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Taux d'engagement</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;