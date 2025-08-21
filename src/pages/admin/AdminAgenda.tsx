import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Calendar, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';

interface Appointment {
  id: string;
  name: string;
  email: string;
  phone?: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  createdAt: string;
  updatedAt: string;
}

export const AdminAgenda: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [credentials] = useState(() => {
    // In a real app, you'd get these from secure storage or context
    return { username: 'admin', password: 'password' };
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: newStatus as any, updatedAt: new Date().toISOString() }
              : apt
          )
        );
        
        if (selectedAppointment?.id === appointmentId) {
          setSelectedAppointment(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
      } else {
        console.error('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'NO_SHOW': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const groupAppointmentsByDate = (appointments: Appointment[]) => {
    const groups: { [key: string]: Appointment[] } = {};
    
    appointments.forEach(apt => {
      const dateKey = formatDateTime(apt.startTime).date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(apt);
    });

    // Sort appointments within each group by time
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });

    return groups;
  };

  const groupedAppointments = groupAppointmentsByDate(appointments);
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => {
    const dateA = new Date(a.split('/').reverse().join('-'));
    const dateB = new Date(b.split('/').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
            <p className="text-gray-600">Gérez les rendez-vous</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Rendez-vous ({appointments.length})
                </h3>
              </div>
              
              {loading ? (
                <div className="p-6 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-gray-600">Chargement...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Aucun rendez-vous trouvé
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {sortedDates.map((date) => (
                    <div key={date}>
                      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <Calendar size={16} className="mr-2" />
                          {date}
                        </h4>
                      </div>
                      
                      {groupedAppointments[date].map((appointment) => {
                        const { time } = formatDateTime(appointment.startTime);
                        const endTime = formatDateTime(appointment.endTime).time;
                        
                        return (
                          <div
                            key={appointment.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedAppointment?.id === appointment.id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-gray-900">{appointment.name}</h5>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                                    {appointment.status}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                  <Clock size={14} className="mr-1" />
                                  {time} - {endTime} ({appointment.duration} min)
                                </div>
                                <p className="text-sm text-gray-600">{appointment.email}</p>
                                {appointment.notes && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{appointment.notes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Appointment Detail */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Détails du rendez-vous</h3>
              </div>
              
              {selectedAppointment ? (
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{selectedAppointment.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail size={16} className="mr-2" />
                        {selectedAppointment.email}
                      </div>
                      {selectedAppointment.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone size={16} className="mr-2" />
                          {selectedAppointment.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Date et heure</h5>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center mb-1">
                        <Calendar size={16} className="mr-2" />
                        {formatDateTime(selectedAppointment.startTime).date}
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2" />
                        {formatDateTime(selectedAppointment.startTime).time} - {formatDateTime(selectedAppointment.endTime).time}
                        <span className="ml-2 text-gray-500">({selectedAppointment.duration} min)</span>
                      </div>
                    </div>
                  </div>

                  {selectedAppointment.notes && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedAppointment.notes}</p>
                    </div>
                  )}

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Statut</h5>
                    <select
                      value={selectedAppointment.status}
                      onChange={(e) => updateAppointmentStatus(selectedAppointment.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CONFIRMED">Confirmé</option>
                      <option value="CANCELLED">Annulé</option>
                      <option value="COMPLETED">Terminé</option>
                      <option value="NO_SHOW">Absent</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <a
                      href={`mailto:${selectedAppointment.email}?subject=Concernant votre rendez-vous du ${formatDateTime(selectedAppointment.startTime).date}`}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Mail size={16} />
                      Envoyer un email
                    </a>
                    
                    {selectedAppointment.phone && (
                      <a
                        href={`tel:${selectedAppointment.phone}`}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <Phone size={16} />
                        Appeler
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Sélectionnez un rendez-vous pour voir les détails
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};