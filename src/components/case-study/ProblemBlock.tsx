import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Target, Users, Clock } from 'lucide-react';

interface ProblemBlockProps {
  title: string;
  description: string;
  challenges: string[];
  userPain?: string;
  businessGoal?: string;
  timeConstraint?: string;
  className?: string;
}

export const ProblemBlock: React.FC<ProblemBlockProps> = ({
  title,
  description,
  challenges,
  userPain,
  businessGoal,
  timeConstraint,
  className = '',
}) => {
  return (
    <motion.section
      className={`py-16 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-4">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700 font-medium">Problème</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Key Problems Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {userPain && (
            <motion.div
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Users className="text-red-500 mb-4" size={24} />
              <h3 className="font-semibold text-gray-900 mb-2">Point de douleur utilisateur</h3>
              <p className="text-gray-600 text-sm">{userPain}</p>
            </motion.div>
          )}

          {businessGoal && (
            <motion.div
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Target className="text-blue-500 mb-4" size={24} />
              <h3 className="font-semibold text-gray-900 mb-2">Objectif business</h3>
              <p className="text-gray-600 text-sm">{businessGoal}</p>
            </motion.div>
          )}

          {timeConstraint && (
            <motion.div
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Clock className="text-orange-500 mb-4" size={24} />
              <h3 className="font-semibold text-gray-900 mb-2">Contrainte temporelle</h3>
              <p className="text-gray-600 text-sm">{timeConstraint}</p>
            </motion.div>
          )}
        </div>

        {/* Challenges List */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Défis identifiés</h3>
          <div className="space-y-4">
            {challenges.map((challenge, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 font-semibold text-sm">{index + 1}</span>
                </div>
                <p className="text-gray-700">{challenge}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};