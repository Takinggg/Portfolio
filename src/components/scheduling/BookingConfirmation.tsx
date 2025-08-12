import React from 'react';
import { CheckCircle, Calendar, Clock, Download, ExternalLink, X } from 'lucide-react';
import { BookingResponse } from '../../types/scheduling';
import { schedulingAPI } from '../../utils/schedulingAPI';
import { cn } from '../../lib/utils';
import { useI18n } from '../../hooks/useI18n';

interface BookingConfirmationProps {
  booking: BookingResponse['booking'];
  onClose: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ booking, onClose }) => {
  const { t, language } = useI18n();
  
  if (!booking) return null;

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

  // Handle ICS download
  const handleICSDownload = () => {
    const url = schedulingAPI.getICSDownloadUrl(booking.uuid);
    window.open(url, '_blank');
  };

  // Handle Google Calendar
  const handleGoogleCalendar = () => {
    window.open(booking.googleCalendarUrl, '_blank');
  };

  // Copy booking link
  const copyBookingLink = async () => {
    const bookingUrl = `${window.location.origin}/booking/${booking.uuid}`;
    try {
      await navigator.clipboard.writeText(bookingUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t('scheduling.confirmation.title')}
        </h3>
        <p className="text-gray-600">
          {t('scheduling.confirmation.subtitle')}
        </p>
      </div>

      {/* Booking details */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <div className="flex items-start gap-4">
          <div 
            className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
            style={{ backgroundColor: booking.eventType.color }}
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">{booking.eventType.name}</h4>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatTimeForDisplay(booking.start)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{booking.eventType.duration_minutes} {t('scheduling.time.minutes')}</span>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                  👤
                </div>
                <div>
                  <div className="font-medium text-gray-900">{booking.invitee.name}</div>
                  <div className="text-gray-500">{booking.invitee.email}</div>
                </div>
              </div>
              
              {booking.invitee.notes && (
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                    📝
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium">{t('scheduling.confirmation.notes_label')} </span>
                    {booking.invitee.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-900 mb-3">
          {t('scheduling.confirmation.add_to_calendar')}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleGoogleCalendar}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors',
              'bg-white border-gray-300 hover:bg-gray-50 text-gray-700 hover:border-gray-400'
            )}
          >
            <ExternalLink className="w-4 h-4" />
            <span>{t('scheduling.confirmation.google_calendar')}</span>
          </button>
          
          <button
            onClick={handleICSDownload}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors',
              'bg-white border-gray-300 hover:bg-gray-50 text-gray-700 hover:border-gray-400'
            )}
          >
            <Download className="w-4 h-4" />
            <span>{t('scheduling.confirmation.download_ics')}</span>
          </button>
        </div>
      </div>

      {/* Additional info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h5 className="font-medium text-blue-900 mb-2">{t('scheduling.confirmation.whats_next')}</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          {(() => {
            const nextStepsRaw = t('scheduling.confirmation.next_steps');
            const nextSteps = Array.isArray(nextStepsRaw) 
              ? nextStepsRaw 
              : typeof nextStepsRaw === 'string' 
                ? [nextStepsRaw] 
                : [];
                
            return nextSteps.map((step: string, index: number) => (
              <li key={index}>• {step}</li>
            ));
          })()}
        </ul>
      </div>

      {/* Close button */}
      <div className="pt-4">
        <button
          onClick={onClose}
          className={cn(
            'w-full py-3 px-4 rounded-lg font-medium transition-colors',
            'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
          )}
        >
          {t('scheduling.common.close')}
        </button>
      </div>

      {/* Booking reference */}
      <div className="text-center pt-4 border-t">
        <p className="text-xs text-gray-500">
          {t('scheduling.confirmation.booking_reference')}: <span className="font-mono">{booking.uuid.split('-')[0].toUpperCase()}</span>
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;