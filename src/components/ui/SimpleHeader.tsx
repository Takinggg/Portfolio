import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface SimpleHeaderProps {
  onBack: () => void;
  backLabel?: string;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({ 
  onBack, 
  backLabel = "Retour" 
}) => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors">
    <div className="max-w-6xl mx-auto px-6 py-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
        aria-label={backLabel}
      >
        <ArrowLeft size={20} />
        <span className="font-medium">{backLabel}</span>
      </button>
    </div>
  </header>
);