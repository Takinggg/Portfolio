import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

interface TestimonialData {
  quote: string;
  author: {
    name: string;
    role: string;
    company: string;
    avatar?: string;
  };
  rating?: number;
  project?: string;
}

interface TestimonialProps {
  testimonial: TestimonialData;
  className?: string;
  variant?: 'card' | 'centered';
}

export const Testimonial: React.FC<TestimonialProps> = ({
  testimonial,
  className = '',
  variant = 'card',
}) => {
  const { quote, author, rating = 5, project } = testimonial;

  if (variant === 'centered') {
    return (
      <motion.div
        className={`text-center max-w-4xl mx-auto ${className}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {/* Quote Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-full mb-6 transition-colors"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Quote className="text-primary-600 dark:text-primary-400" size={28} />
        </motion.div>

        {/* Quote */}
        <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-gray-100 mb-8 leading-relaxed transition-colors">
          "{quote}"
        </blockquote>

        {/* Rating */}
        {rating && (
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: 5 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                viewport={{ once: true }}
              >
                <Star
                  size={20}
                  className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600 transition-colors'}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Author */}
        <motion.div
          className="flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {author.avatar && (
            <img
              src={author.avatar}
              alt={`Portrait de ${author.name}`}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100 transition-colors">{author.name}</div>
            <div className="text-gray-600 dark:text-gray-400 transition-colors">{author.role}</div>
            <div className="text-sm text-gray-500 dark:text-gray-500 transition-colors">{author.company}</div>
          </div>
        </motion.div>

        {project && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-500 transition-colors">
            Projet: <span className="font-medium">{project}</span>
          </div>
        )}
      </motion.div>
    );
  }

  // Card variant
  return (
    <motion.div
      className={`bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 relative transition-colors ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
    >
      {/* Quote Icon */}
      <div className="absolute -top-4 left-8">
        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
          <Quote className="text-white" size={16} />
        </div>
      </div>

      {/* Rating */}
      {rating && (
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={16}
              className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600 transition-colors'}
            />
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic transition-colors">
        "{quote}"
      </blockquote>

      {/* Author Info */}
      <div className="flex items-center gap-4">
        {author.avatar && (
          <img
            src={author.avatar}
            alt={`Portrait de ${author.name}`}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <div className="font-semibold text-gray-900 dark:text-gray-100 transition-colors">{author.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">{author.role}</div>
          <div className="text-sm text-gray-500 dark:text-gray-500 transition-colors">{author.company}</div>
        </div>
      </div>

      {project && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 transition-colors">
          <div className="text-sm text-gray-500 dark:text-gray-500 transition-colors">
            Projet: <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors">{project}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};