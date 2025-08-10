import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  image?: string;
  deliverables?: string[];
  duration?: string;
  tools?: string[];
  className?: string;
}

export const ProcessStep: React.FC<ProcessStepProps> = ({
  number,
  title,
  description,
  image,
  deliverables = [],
  duration,
  tools = [],
  className = '',
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {/* Step Connector Line (for all but last step) */}
      <div className="hidden md:block absolute left-8 top-20 w-0.5 h-full bg-gradient-to-b from-primary-200 to-transparent -z-10" />

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Step Number & Title */}
        <div className="flex-shrink-0 md:w-80">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
              {number}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
              {duration && (
                <span className="text-sm text-gray-500 font-medium">{duration}</span>
              )}
            </div>
          </div>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            {description}
          </p>

          {/* Tools Used */}
          {tools.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Outils utilisés</h4>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {deliverables.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Livrables</h4>
              <div className="space-y-2">
                {deliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span className="text-sm text-gray-700">{deliverable}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Visual Content */}
        {image && (
          <motion.div
            className="flex-1 min-h-[300px]"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <img
                src={image}
                alt={`Illustration pour ${title}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};