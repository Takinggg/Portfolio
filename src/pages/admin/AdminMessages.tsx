import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Search, Eye, Mail, Phone, Calendar, Filter } from 'lucide-react';
import { useAuthorizedFetch } from '../../context/AdminAuthContext';

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const authorizedFetch = useAuthorizedFetch();

  useEffect(() => {
    fetchMessages();
  }, [searchQuery]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      
      const response = await authorizedFetch(`/api/messages?${params}`);

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Error handling is done by the context (401 auto-logout)
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      const response = await authorizedFetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: newStatus as any, updatedAt: new Date().toISOString() }
              : msg
          )
        );
        
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
      } else {
        console.error('Failed to update message status');
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMessages = messages.filter(message => {
    if (selectedStatus !== 'all' && message.status !== selectedStatus) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Gérez les messages de contact</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, sujet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="new">Nouveau</option>
                <option value="read">Lu</option>
                <option value="replied">Répondu</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Messages ({filteredMessages.length})
                </h3>
              </div>
              
              {loading ? (
                <div className="p-6 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-gray-600">Chargement...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Aucun message trouvé
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{message.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(message.status)}`}>
                              {message.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{message.email}</p>
                          <p className="text-sm font-medium text-gray-800 mb-1">{message.subject}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          {new Date(message.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Détails du message</h3>
              </div>
              
              {selectedMessage ? (
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{selectedMessage.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail size={16} className="mr-2" />
                        {selectedMessage.email}
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone size={16} className="mr-2" />
                          {selectedMessage.phone}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        {new Date(selectedMessage.createdAt).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Sujet</h5>
                    <p className="text-sm text-gray-600">{selectedMessage.subject}</p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Message</h5>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Statut</h5>
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => updateMessageStatus(selectedMessage.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">Nouveau</option>
                      <option value="read">Lu</option>
                      <option value="replied">Répondu</option>
                      <option value="archived">Archivé</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Mail size={16} />
                      Répondre par email
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Sélectionnez un message pour voir les détails
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};