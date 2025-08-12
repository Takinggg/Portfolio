import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { EventType, AvailableSlot } from '../../types/scheduling';
import { schedulingAPI } from '../../utils/schedulingAPI';
import { cn } from '../../lib/utils';
import { useI18n } from '../../hooks/useI18n';

interface SlotSelectorProps {
  eventType: EventType;
  selectedDate: Date | null;
  selectedSlot: AvailableSlot | null;
  onDateSelect: (date: Date) => void;
  onSlotSelect: (slot: AvailableSlot) => void;
  userTimezone: string;
}

const SlotSelector: React.FC<SlotSelectorProps> = ({
  eventType,
  selectedDate,
  selectedSlot,
  onDateSelect,
  onSlotSelect,
  userTimezone
}) => {
  const { t, language } = useI18n();
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [error, setError] = useState<string | null>(null);

  // Get start of week (Monday)
  function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  // Format date for API
  function formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0] + 'T00:00:00.000Z';
  }

  // Format time for display with localization
  function formatTimeForDisplay(isoString: string): string {
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(isoString).toLocaleTimeString(locale, { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }

  // Get days of the current week
  function getWeekDays(startDate: Date): Date[] {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  }

  // Load available slots for the current week
  useEffect(() => {
    const loadSlots = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);
        
        const response = await schedulingAPI.getAvailability(
          eventType.id,
          formatDateForAPI(currentWeekStart),
          formatDateForAPI(weekEnd),
          userTimezone
        );
        
        setAvailableSlots(response.availableSlots);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load available slots');
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSlots();
  }, [eventType.id, currentWeekStart, userTimezone]);

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  // Get slots for a specific date
  const getSlotsForDate = (date: Date): AvailableSlot[] => {
    const dateStr = date.toISOString().split('T')[0];
    return availableSlots.filter(slot => 
      slot.start.startsWith(dateStr)
    );
  };

  // Check if date is in the past
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const weekDays = getWeekDays(currentWeekStart);
  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t('scheduling.messages.select_time')}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{t('scheduling.messages.times_shown_in')} {userTimezone}</span>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <button
          onClick={goToPreviousWeek}
          disabled={isLoading}
          className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
          aria-label={t('scheduling.calendar.previous_week')}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="font-medium text-gray-900">
          {currentWeekStart.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </div>
        
        <button
          onClick={goToNextWeek}
          disabled={isLoading}
          className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
          aria-label={t('scheduling.calendar.next_week')}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {(language === 'fr' 
          ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        ).map((day, index) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Day cells */}
        {weekDays.map(date => {
          const daySlots = getSlotsForDate(date);
          const isToday = date.toDateString() === today.toDateString();
          const isPast = isPastDate(new Date(date));
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const hasSlots = daySlots.length > 0;

          return (
            <button
              key={date.toISOString()}
              onClick={() => hasSlots && !isPast && onDateSelect(date)}
              disabled={!hasSlots || isPast || isLoading}
              className={cn(
                'p-2 text-center rounded-lg border transition-all duration-200 min-h-[60px] flex flex-col justify-center',
                isSelected
                  ? 'bg-blue-500 text-white border-blue-500'
                  : hasSlots && !isPast
                  ? 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed',
                isToday && !isSelected && 'ring-2 ring-blue-200'
              )}
            >
              <div className={cn(
                'text-sm font-medium',
                isToday && !isSelected && 'text-blue-600'
              )}>
                {date.getDate()}
              </div>
              {hasSlots && !isPast && (
                <div className="text-xs mt-1">
                  {daySlots.length} {daySlots.length === 1 ? t('scheduling.calendar.slot_available') : t('scheduling.calendar.slots_available')}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-4">
            {t('scheduling.messages.select_time')} {selectedDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {getSlotsForDate(selectedDate).map(slot => (
                <button
                  key={slot.startUTC}
                  onClick={() => onSlotSelect(slot)}
                  className={cn(
                    'p-3 text-sm font-medium rounded-lg border transition-all duration-200',
                    selectedSlot?.startUTC === slot.startUTC
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900'
                  )}
                >
                  {formatTimeForDisplay(slot.start)}
                </button>
              ))}
            </div>
          )}
          
          {!isLoading && getSlotsForDate(selectedDate).length === 0 && (
            <p className="text-center text-gray-500 py-8">
              {t('scheduling.messages.no_slots_available')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SlotSelector;