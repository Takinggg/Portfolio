import React from 'react';
import { AdminLayout } from './AdminLayout';
import { MessageSquare, Calendar, TrendingUp, Users } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const stats = [
    {
      name: 'Messages non lus',
      value: '12',
      icon: MessageSquare,
      color: 'bg-blue-500',
      change: '+2.5%'
    },
    {
      name: 'RDV cette semaine',
      value: '8',
      icon: Calendar,
      color: 'bg-green-500',
      change: '+12%'
    },
    {
      name: 'Taux de conversion',
      value: '24%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+4.3%'
    },
    {
      name: 'Nouveaux contacts',
      value: '45',
      icon: Users,
      color: 'bg-orange-500',
      change: '+18%'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Aperçu de votre activité</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <span className="ml-2 text-sm text-green-600">{stat.change}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Messages récents</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-3 bg-gray-50 rounded">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="text-white" size={16} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Nouveau message de client {i}</p>
                    <p className="text-xs text-gray-500">Il y a {i} heure{i > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Prochains rendez-vous</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-3 bg-gray-50 rounded">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Calendar className="text-white" size={16} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">RDV avec Client {i}</p>
                    <p className="text-xs text-gray-500">Demain à {14 + i}h00</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};