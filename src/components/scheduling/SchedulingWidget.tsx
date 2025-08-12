import React, { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { SchedulingWidgetProps, SchedulingState, SchedulingStep } from '../../types/scheduling';
import { schedulingAPI } from '../../utils/schedulingAPI';
import { cn } from '../../lib/utils';
import { useI18n } from '../../hooks/useI18n';
import { Portal } from '../../lib/portal';
import EventTypeCard from './EventTypeCard';
import SlotSelector from './SlotSelector';
import BookingForm from './BookingForm';
import BookingConfirmation from './BookingConfirmation';

const SchedulingWidget: React.FC<SchedulingWidgetProps> = ({
  className = '',
  triggerClassName = '',
  triggerText,
  defaultEventTypeId,
  autoOpen = false,
  onBookingComplete,
  onError
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<SchedulingState>({
    step: 'event-type',
    eventTypes: [],
    selectedEventType: null,
    selectedDate: null,
    selectedSlot: null,
    availableSlots: [],
    booking: null,
    isLoading: false,
    error: null,
    userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  });

  // Auto-open if autoOpen prop is true
  useEffect(() => {
    if (autoOpen) {
      setIsOpen(true);
    }
  }, [autoOpen]);

  // Load event types when widget opens
  useEffect(() => {
    if (isOpen && state.eventTypes.length === 0) {
      loadEventTypes();
    }
  }, [isOpen]);

  // Auto-select default event type
  useEffect(() => {
    if (defaultEventTypeId && state.eventTypes.length > 0 && !state.selectedEventType) {
      const defaultEventType = state.eventTypes.find(et => et.id === defaultEventTypeId);
      if (defaultEventType) {
        setState(prev => ({ 
          ...prev, 
          selectedEventType: defaultEventType,
          step: 'slots'
        }));
      }
    }
  }, [defaultEventTypeId, state.eventTypes]);

  const loadEventTypes = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { eventTypes } = await schedulingAPI.getEventTypes();
      setState(prev => ({ 
        ...prev, 
        eventTypes,
        isLoading: false 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load event types';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      onError?.(errorMessage);
    }
  };

  const handleEventTypeSelect = (eventType: typeof state.selectedEventType) => {
    setState(prev => ({
      ...prev,
      selectedEventType: eventType,
      step: 'slots',
      selectedDate: null,
      selectedSlot: null
    }));
  };

  const handleDateSelect = (date: Date) => {
    setState(prev => ({
      ...prev,
      selectedDate: date,
      selectedSlot: null
    }));
  };

  const handleSlotSelect = (slot: typeof state.selectedSlot) => {
    setState(prev => ({
      ...prev,
      selectedSlot: slot,
      step: 'form'
    }));
  };

  const handleBookingSubmit = async (bookingData: Parameters<typeof schedulingAPI.createBooking>[0]) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('Creating booking with data:', bookingData); // Debug log
      const response = await schedulingAPI.createBooking(bookingData);
      
      if (response.success && response.booking) {
        console.log('Booking created successfully, transitioning to confirmation'); // Debug log
        setState(prev => ({
          ...prev,
          booking: response.booking,
          step: 'confirmation',
          isLoading: false
        }));
        onBookingComplete?.(response.booking);
      } else {
        throw new Error(response.error || 'Failed to create booking');
      }
    } catch (error) {
      let errorMessage = 'Failed to create booking';
      
      // Extract more specific error information
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Log detailed error for debugging
        console.error('Booking creation failed:', {
          error: error.message,
          bookingData,
          stack: error.stack
        });
        
        // Convert backend validation errors to user-friendly messages
        if (error.message.includes('Invalid booking request')) {
          errorMessage = t('scheduling.errors.invalid_request');
        } else if (error.message.includes('eventTypeId')) {
          errorMessage = t('scheduling.errors.invalid_event_type');
        } else if (error.message.includes('email')) {
          errorMessage = t('scheduling.errors.invalid_email');
        } else if (error.message.includes('datetime')) {
          errorMessage = t('scheduling.errors.invalid_time');
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      onError?.(errorMessage);
    }
  };

  const handleBack = () => {
    switch (state.step) {
      case 'slots':
        setState(prev => ({ 
          ...prev, 
          step: 'event-type',
          selectedEventType: null,
          selectedDate: null,
          selectedSlot: null
        }));
        break;
      case 'form':
        setState(prev => ({ 
          ...prev, 
          step: 'slots',
          selectedSlot: null
        }));
        break;
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state when closing
    setState(prev => ({
      ...prev,
      step: 'event-type',
      selectedEventType: null,
      selectedDate: null,
      selectedSlot: null,
      booking: null,
      error: null
    }));
  };

  const getStepTitle = (): string => {
    switch (state.step) {
      case 'event-type':
        return t('scheduling.steps.event_type');
      case 'slots':
        return t('scheduling.steps.slots');
      case 'form':
        return t('scheduling.steps.form');
      case 'confirmation':
        return t('scheduling.steps.confirmation');
      default:
        return t('scheduling.trigger.schedule_meeting');
    }
  };

  const canProceedToSlots = state.selectedEventType !== null;
  const canProceedToForm = state.selectedSlot !== null;

  return (
    <>
      {/* Trigger button - hidden when autoOpen is true */}
      {!autoOpen && (
        <button
          type="button" // Explicitly set button type
          onClick={(e) => {
            e.preventDefault(); // Prevent any default behavior
            e.stopPropagation(); // Prevent event bubbling
            setIsOpen(true);
          }}
          className={cn(
            'inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg',
            'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'transition-colors duration-200',
            triggerClassName
          )}
        >
          <Calendar className="w-5 h-5" />
          <span>{triggerText || t('scheduling.trigger.schedule_meeting')}</span>
        </button>
      )}

      {/* Modal rendered in Portal */}
      {isOpen && (
        <Portal>
          <div 
            className="fixed inset-0 z-50 overflow-y-auto"
            style={{ overflowAnchor: 'none' }} // Prevent scroll anchoring
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
              />

              {/* Modal content */}
              <div 
                className={cn(
                  'inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform',
                  'bg-white shadow-xl rounded-lg',
                  className
                )}
                onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to backdrop
                onMouseDown={(e) => e.stopPropagation()} // Stop propagation on mouse down as well
              >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {getStepTitle()}
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Error message */}
                {state.error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{state.error}</p>
                  </div>
                )}

                {/* Loading state */}
                {state.isLoading && state.step === 'event-type' && (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}

                {/* Step content */}
                {!state.isLoading && (
                  <>
                    {state.step === 'event-type' && (
                      <div className="space-y-4">
                        {state.eventTypes.map(eventType => (
                          <EventTypeCard
                            key={eventType.id}
                            eventType={eventType}
                            isSelected={state.selectedEventType?.id === eventType.id}
                            onClick={() => handleEventTypeSelect(eventType)}
                          />
                        ))}
                        
                        {state.eventTypes.length === 0 && !state.isLoading && (
                          <p className="text-center text-gray-500 py-8">
                            {t('scheduling.messages.no_event_types')}
                          </p>
                        )}
                      </div>
                    )}

                    {state.step === 'slots' && state.selectedEventType && (
                      <SlotSelector
                        eventType={state.selectedEventType}
                        selectedDate={state.selectedDate}
                        selectedSlot={state.selectedSlot}
                        onDateSelect={handleDateSelect}
                        onSlotSelect={handleSlotSelect}
                        userTimezone={state.userTimezone}
                      />
                    )}

                    {state.step === 'form' && state.selectedEventType && state.selectedSlot && (
                      <BookingForm
                        eventType={state.selectedEventType}
                        selectedSlot={state.selectedSlot}
                        userTimezone={state.userTimezone}
                        onSubmit={handleBookingSubmit}
                        onBack={handleBack}
                        isLoading={state.isLoading}
                      />
                    )}

                    {state.step === 'confirmation' && state.booking && (
                      <BookingConfirmation
                        booking={state.booking}
                        onClose={handleClose}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Footer with navigation */}
              {!state.isLoading && state.step !== 'confirmation' && (
                <div className="flex items-center justify-between p-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                      {['event-type', 'slots', 'form'].map((step, index) => (
                        <div
                          key={step}
                          className={cn(
                            'w-2 h-2 rounded-full transition-colors',
                            state.step === step
                              ? 'bg-blue-500'
                              : index < ['event-type', 'slots', 'form'].indexOf(state.step)
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {(state.step === 'slots' || state.step === 'form') && (
                      <button
                        onClick={handleBack}
                        disabled={state.isLoading}
                        className={cn(
                          'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg',
                          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        )}
                      >
                        {t('scheduling.common.back')}
                      </button>
                    )}

                    {state.step === 'event-type' && canProceedToSlots && (
                      <button
                        onClick={() => setState(prev => ({ ...prev, step: 'slots' }))}
                        className={cn(
                          'px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg',
                          'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                          'transition-colors'
                        )}
                      >
                        {t('scheduling.common.continue')}
                      </button>
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default SchedulingWidget;