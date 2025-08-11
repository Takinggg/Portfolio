import React from 'react';
import { FileText, Users, Eye, MessageCircle } from 'lucide-react';

const SimpleDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Simple Dashboard Test
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Articles</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">12</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Visiteurs</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">1,234</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Eye className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vues</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">5,678</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Messages</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">23</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Test Dashboard
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This is a simplified dashboard to test if the admin panel loads correctly.
        </p>
      </div>
    </div>
  );
};

export default SimpleDashboard;