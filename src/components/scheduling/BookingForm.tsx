import React, { useState } from 'react';
import { ArrowLeft, User, Mail, MessageSquare, Calendar, Clock } from 'lucide-react';
import { EventType, AvailableSlot, BookingRequest } from '../../types/scheduling';
import { cn } from '../../lib/utils';
import { useI18n } from '../../hooks/useI18n';

interface BookingFormProps {
  eventType: EventType;
  selectedSlot: AvailableSlot;
  userTimezone: string;
  onSubmit: (data: BookingRequest) => void;
  onBack: () => void;
  isLoading: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({
  eventType,
  selectedSlot,
  userTimezone,
  onSubmit,
  onBack,
  isLoading
}) => {
  const { t, language } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: '',
    consent: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Format time for display with localization
  const formatTimeForDisplay = (isoString: string) => {
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(isoString).toLocaleString(locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('scheduling.validation.name_required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('scheduling.validation.email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('scheduling.validation.email_invalid');
    }

    if (!formData.consent) {
      newErrors.consent = t('scheduling.validation.consent_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const bookingRequest: BookingRequest = {
      eventTypeId: eventType.id,
      name: formData.name.trim(),
      email: formData.email.trim(),
      start: selectedSlot.startUTC,
      end: selectedSlot.endUTC,
      timezone: userTimezone,
      notes: formData.notes.trim() || undefined,
      consent: formData.consent
    };

    onSubmit(bookingRequest);
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">{t('scheduling.form.title')}</h3>
      </div>

      {/* Booking summary */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-start gap-3">
          <div 
            className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
            style={{ backgroundColor: eventType.color }}
          />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{eventType.name}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatTimeForDisplay(selectedSlot.start)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{eventType.duration_minutes} {t('scheduling.time.minutes')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{t('scheduling.form.name')} *</span>
            </div>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={cn(
              'w-full px-3 py-2 rounded-lg shadow-sm transition-colors',
              'bg-white text-gray-900 placeholder-gray-400 border border-gray-300',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              'dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:placeholder-gray-500',
              errors.name ? 'border-red-300 dark:border-red-700' : ''
            )}
            placeholder={t('scheduling.form.name')}
            disabled={isLoading}
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{t('scheduling.form.email')} *</span>
            </div>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={cn(
              'w-full px-3 py-2 rounded-lg shadow-sm transition-colors',
              'bg-white text-gray-900 placeholder-gray-400 border border-gray-300',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              'dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:placeholder-gray-500',
              errors.email ? 'border-red-300 dark:border-red-700' : ''
            )}
            placeholder={t('scheduling.form.email')}
            disabled={isLoading}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Notes field */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>{t('scheduling.form.notes_optional')}</span>
            </div>
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className={cn(
              'w-full px-3 py-2 rounded-lg shadow-sm transition-colors',
              'bg-white text-gray-900 placeholder-gray-400 border border-gray-300',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              'dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:placeholder-gray-500'
            )}
            placeholder={t('scheduling.form.notes_optional')}
            disabled={isLoading}
          />
        </div>

        {/* Consent checkbox */}
        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.consent}
              onChange={(e) => handleInputChange('consent', e.target.checked)}
              className={cn(
                'mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500',
                errors.consent ? 'border-red-300' : ''
              )}
              disabled={isLoading}
            />
            <span className="text-sm text-gray-700">
              {t('scheduling.form.consent_label')} *
            </span>
          </label>
          {errors.consent && (
            <p className="mt-1 text-sm text-red-600">{errors.consent}</p>
          )}
        </div>

        {/* Submit button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-medium transition-all duration-200',
              'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('scheduling.form.booking')}</span>
              </div>
            ) : (
              t('scheduling.form.submit')
            )}
          </button>
        </div>
      </form>

      {/* Footer info */}
      <div className="text-xs text-gray-500 text-center pt-4 border-t">
        <p>By scheduling this meeting, you agree to our terms of service and privacy policy.</p>
      </div>
    </div>
  );
};

export default BookingForm;