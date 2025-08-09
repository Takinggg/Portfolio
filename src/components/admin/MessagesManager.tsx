import React, { useState, useEffect } from 'react';
import { Mail, MailOpen, Search, Filter, Trash2, Eye, Calendar, User, MessageCircle, AlertCircle } from 'lucide-react';
import { contactService, ContactMessage } from '../../lib/supabase';

const MessagesManager: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchQuery, selectedStatus]);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await contactService.getAllMessages();
      
      if (error) throw error;
      
      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    if (searchQuery) {
      filtered = filtered.filter(message =>
        message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(message => 
        selectedStatus === 'read' ? message.is_read : !message.is_read
      );
    }

    setFilteredMessages(filtered);
  };

  const handleMarkAsRead = async (messageId: string, isRead: boolean) => {
    try {
      const { error } = await contactService.updateMessageStatus(messageId, isRead);
      
      if (error) throw error;
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: isRead } : msg
      ));
    } catch (err) {
      console.error('Error updating message status:', err);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      try {
        const { error } = await contactService.deleteMessage(messageId);
        
        if (error) throw error;
        
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        setSelectedMessages(prev => prev.filter(id => id !== messageId));
      } catch (err) {
        console.error('Error deleting message:', err);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedMessages.length} message(s) ?`)) {
      try {
        await Promise.all(selectedMessages.map(id => contactService.deleteMessage(id)));
        setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg.id)));
        setSelectedMessages([]);
      } catch (err) {
        console.error('Error bulk deleting messages:', err);
      }
    }
  };

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        <p className="font-medium">Erreur</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchMessages}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Message Detail Modal
  if (viewingMessage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Détail du message</h2>
          <button
            onClick={() => setViewingMessage(null)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Retour à la liste
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{viewingMessage.subject}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  viewingMessage.is_read 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {viewingMessage.is_read ? 'Lu' : 'Non lu'}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{viewingMessage.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail size={14} />
                  <a href={`mailto:${viewingMessage.email}`} className="text-purple-600 hover:underline">
                    {viewingMessage.email}
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{formatDate(viewingMessage.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMarkAsRead(viewingMessage.id, !viewingMessage.is_read)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewingMessage.is_read
                    ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
                title={viewingMessage.is_read ? 'Marquer comme non lu' : 'Marquer comme lu'}
              >
                {viewingMessage.is_read ? <Mail size={20} /> : <MailOpen size={20} />}
              </button>
              
              <button
                onClick={() => handleDelete(viewingMessage.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Supprimer"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* Project Details */}
          {(viewingMessage.budget || viewingMessage.timeline) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              {viewingMessage.budget && (
                <div>
                  <span className="text-sm font-semibold text-gray-700">Budget estimé :</span>
                  <p className="text-gray-900">{viewingMessage.budget}</p>
                </div>
              )}
              {viewingMessage.timeline && (
                <div>
                  <span className="text-sm font-semibold text-gray-700">Timeline :</span>
                  <p className="text-gray-900">{viewingMessage.timeline}</p>
                </div>
              )}
            </div>
          )}

          {/* Message Content */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Message :</h4>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {viewingMessage.message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
            <a
              href={`mailto:${viewingMessage.email}?subject=Re: ${viewingMessage.subject}`}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Mail size={18} />
              Répondre par email
            </a>
            
            <button
              onClick={() => setViewingMessage(null)}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages de contact</h2>
          <p className="text-gray-600">
            {filteredMessages.length} message(s) trouvé(s)
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {unreadCount} non lu(s)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher dans les messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'read' | 'unread')}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tous les messages</option>
            <option value="unread">Non lus</option>
            <option value="read">Lus</option>
          </select>
        </div>

        {selectedMessages.length > 0 && (
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedMessages.length} message(s) sélectionné(s)
            </span>
            <button
              onClick={handleBulkDelete}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors duration-200 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message trouvé</h3>
            <p className="text-gray-600">
              {searchQuery || selectedStatus !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Aucun message de contact pour le moment'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <div 
                key={message.id} 
                className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${
                  !message.is_read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedMessages.includes(message.id)}
                    onChange={() => toggleMessageSelection(message.id)}
                    className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-lg font-semibold ${
                          !message.is_read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {message.subject}
                        </h3>
                        {!message.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setViewingMessage(message);
                            if (!message.is_read) {
                              handleMarkAsRead(message.id, true);
                            }
                          }}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                          title="Voir le message"
                        >
                          <Eye size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleMarkAsRead(message.id, !message.is_read)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            message.is_read
                              ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                              : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                          title={message.is_read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                        >
                          {message.is_read ? <Mail size={16} /> : <MailOpen size={16} />}
                        </button>
                        
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span className="font-medium">{message.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail size={14} />
                        <span>{message.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(message.created_at)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {message.message}
                    </p>
                    
                    {(message.budget || message.timeline) && (
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {message.budget && (
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            Budget: {message.budget}
                          </span>
                        )}
                        {message.timeline && (
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            Timeline: {message.timeline}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesManager;