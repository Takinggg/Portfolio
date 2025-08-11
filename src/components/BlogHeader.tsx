import React from 'react';
import { BookOpen, Home } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface BlogHeaderProps {
  onNavigateHome: () => void;
  totalPosts: number;
  totalCategories: number;
  totalTags: number;
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({
  onNavigateHome,
  totalPosts,
  totalCategories,
  totalTags
}) => {
  const { t } = useI18n();

  const stats = [
    { value: totalPosts.toString(), label: 'Articles' },
    { value: totalCategories.toString(), label: 'Catégories' },
    { value: totalTags.toString(), label: 'Tags' }
  ];

  return (
    <header className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20 pt-24 relative overflow-hidden [background:linear-gradient(135deg,#7c3aed_0%,#ec4899_100%)]" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)' }}>
      {/* Background Elements with reduced intensity */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/3 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-white/80 mb-8">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2 hover:text-white transition-colors duration-200"
          >
            <Home size={16} />
            Accueil
          </button>
          <span>/</span>
          <span className="text-white font-medium">Blog</span>
        </nav>
        
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <BookOpen className="text-white/80" size={18} />
            <span>{t('blog.insights')}</span>
          </div>

          {/* Use SectionHeader for consistent styling */}
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight relative z-10">
              <span className="block text-white mb-2">
                {t('blog.section.blog_and')}
              </span>
              <span 
                className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
                style={{ 
                  background: 'linear-gradient(90deg, #a78bfa 0%, #f0abfc 50%, #a5b4fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {t('blog.title')}
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              {t('blog.section.description')}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
            
            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onNavigateHome}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
              >
                <Home size={18} />
                Retour au Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};