import React from 'react';
import { EventType } from '../../types/scheduling';
import { Clock, Video, MapPin, Phone } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EventTypeCardProps {
  eventType: EventType;
  isSelected: boolean;
  onClick: () => void;
}

const EventTypeCard: React.FC<EventTypeCardProps> = ({ eventType, isSelected, onClick }) => {
  const getLocationIcon = (locationType: string) => {
    switch (locationType) {
      case 'visio':
        return <Video className="w-4 h-4" />;
      case 'physique':
        return <MapPin className="w-4 h-4" />;
      case 'telephone':
        return <Phone className="w-4 h-4" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const getLocationText = (locationType: string) => {
    switch (locationType) {
      case 'visio':
        return 'Video Conference';
      case 'physique':
        return 'In-Person Meeting';
      case 'telephone':
        return 'Phone Call';
      default:
        return 'Video Conference';
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md',
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{eventType.name}</h3>
          {eventType.description && (
            <p className="text-sm text-gray-600 mb-3">{eventType.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{eventType.duration_minutes} min</span>
            </div>
            
            <div className="flex items-center gap-1">
              {getLocationIcon(eventType.location_type)}
              <span>{getLocationText(eventType.location_type)}</span>
            </div>
          </div>
        </div>
        
        <div 
          className="w-4 h-4 rounded-full flex-shrink-0 ml-3"
          style={{ backgroundColor: eventType.color }}
        />
      </div>
    </button>
  );
};

export default EventTypeCard;