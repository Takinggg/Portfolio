import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, AlertCircle } from 'lucide-react';

interface BookingWidgetProps {
  className?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookingData {
  startTime: string;
  duration: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({ className = '' }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState<'date' | 'slot' | 'form'>('date');
  
  const [bookingData, setBookingData] = useState<BookingData>({
    startTime: '',
    duration: 30,
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Get available slots when date/duration changes
  useEffect(() => {
    if (selectedDate && selectedDuration) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedDuration]);

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const fromDate = new Date(selectedDate);
      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + 1); // Next day

      const response = await fetch('/api/appointments/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
          duration: selectedDuration
        })
      });

      const result = await response.json();
      if (response.ok) {
        setAvailableSlots(result.slots || []);
        if (result.slots?.length > 0) {
          setStep('slot');
        }
      } else {
        setErrorMessage(result.error || 'Erreur lors du chargement des créneaux');
      }
    } catch (error) {
      setErrorMessage('Erreur de connexion');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setBookingData(prev => ({
      ...prev,
      startTime: slot,
      duration: selectedDuration
    }));
    setStep('form');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'idempotency-key': crypto.randomUUID()
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setSelectedDate('');
        setSelectedSlot('');
        setStep('date');
        setBookingData({
          startTime: '',
          duration: 30,
          name: '',
          email: '',
          phone: '',
          notes: ''
        });
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Une erreur est survenue');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeSlot = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Paris'
    });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from now
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-lg ${className}`}>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Réserver un rendez-vous</h3>
      
      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Votre rendez-vous a été confirmé ! Vous recevrez un email de confirmation.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {errorMessage}
        </div>
      )}

      {/* Step 1: Select Date and Duration */}
      {step === 'date' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline mr-2" size={16} />
              Choisir une date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getTomorrowDate()}
              max={getMaxDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline mr-2" size={16} />
              Durée du rendez-vous
            </label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 heure</option>
            </select>
          </div>

          {loadingSlots && (
            <div className="text-center py-4">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Chargement des créneaux disponibles...</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Time Slot */}
      {step === 'slot' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium">
              Créneaux disponibles le {new Date(selectedDate).toLocaleDateString('fr-FR')}
            </h4>
            <button
              onClick={() => setStep('date')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Changer de date
            </button>
          </div>

          {availableSlots.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              Aucun créneau disponible pour cette date. Veuillez choisir une autre date.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => handleSlotSelect(slot)}
                  className="p-3 text-center border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {formatTimeSlot(slot)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Contact Form */}
      {step === 'form' && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium text-blue-900">Rendez-vous sélectionné :</h4>
            <p className="text-blue-800">
              {new Date(selectedSlot).toLocaleDateString('fr-FR')} à {formatTimeSlot(selectedSlot)} 
              ({selectedDuration} minutes)
            </p>
            <button
              onClick={() => setStep('slot')}
              className="text-blue-600 hover:text-blue-800 text-sm mt-1"
            >
              Modifier le créneau
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="booking-name" className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="inline mr-1" size={16} />
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="booking-name"
                  name="name"
                  value={bookingData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="booking-email" className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline mr-1" size={16} />
                  Email *
                </label>
                <input
                  type="email"
                  id="booking-email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="booking-phone" className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="inline mr-1" size={16} />
                Téléphone *
              </label>
              <input
                type="tel"
                id="booking-phone"
                name="phone"
                value={bookingData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="booking-notes" className="block text-sm font-medium text-gray-700 mb-1">
                <MessageSquare className="inline mr-1" size={16} />
                Notes (optionnel)
              </label>
              <textarea
                id="booking-notes"
                name="notes"
                value={bookingData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Décrivez brièvement l'objet de votre appel..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Confirmation...
                </>
              ) : (
                <>
                  <Calendar size={20} />
                  Confirmer le rendez-vous
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};