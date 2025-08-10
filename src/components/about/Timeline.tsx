import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Award, Briefcase } from 'lucide-react';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  type: 'education' | 'work' | 'certification' | 'milestone';
  location?: string;
  company?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const eventTypeConfig = {
  education: {
    icon: Award,
    color: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  work: {
    icon: Briefcase,
    color: 'bg-green-500', 
    bgLight: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  certification: {
    icon: Award,
    color: 'bg-purple-500',
    bgLight: 'bg-purple-50', 
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  milestone: {
    icon: Calendar,
    color: 'bg-orange-500',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200'
  }
};

export const Timeline: React.FC<TimelineProps> = ({
  events,
  className = '',
}) => {
  return (
    <div className={`${className}`}>
      <div className="text-center mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Parcours Professionnel
        </h3>
        <p className="text-gray-600">
          Mon évolution de 2019 à aujourd'hui
        </p>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-secondary-200 to-primary-200 transform md:-translate-x-0.5" />

        <div className="space-y-12">
          {events.map((event, index) => {
            const config = eventTypeConfig[event.type];
            const Icon = config.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={index}
                className={`relative flex items-center ${
                  isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Timeline Node */}
                <motion.div
                  className={`absolute left-8 md:left-1/2 w-4 h-4 ${config.color} rounded-full transform -translate-x-2 md:-translate-x-2 z-10`}
                  whileHover={{ scale: 1.5 }}
                  transition={{ duration: 0.2 }}
                />

                {/* Year Badge */}
                <motion.div
                  className={`hidden md:block absolute left-1/2 top-12 transform -translate-x-1/2 px-3 py-1 ${config.bgLight} ${config.borderColor} border rounded-full`}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                >
                  <span className={`text-sm font-semibold ${config.textColor}`}>
                    {event.year}
                  </span>
                </motion.div>

                {/* Content Card */}
                <motion.div
                  className={`ml-16 md:ml-0 md:w-5/12 ${
                    isEven ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`bg-white rounded-xl p-6 shadow-md border ${config.borderColor} hover:shadow-lg transition-all duration-300`}>
                    {/* Mobile Year */}
                    <div className="md:hidden mb-3">
                      <span className={`inline-flex items-center px-3 py-1 ${config.bgLight} ${config.textColor} rounded-full text-sm font-semibold`}>
                        {event.year}
                      </span>
                    </div>

                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 ${config.bgLight} rounded-lg`}>
                        <Icon size={20} className={config.color.replace('bg-', 'text-')} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {event.title}
                        </h4>
                        {event.company && (
                          <div className="text-sm text-gray-600 mb-1">
                            {event.company}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin size={12} />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};