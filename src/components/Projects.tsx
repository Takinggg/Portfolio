import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../hooks/useSQLite';
import { useI18n } from '../hooks/useI18n';
import { GlassCard } from './ui/GlassCard';
import { ProjectCard } from './projects/ProjectCard';
import { ProjectFilter } from './projects/ProjectFilter';
import { SectionHeader } from './SectionHeader';

// Placeholder images as data URLs
const getPlaceholderImage = (category: string) => {
  const placeholders = {
    web: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9IndlYiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM2NzNkYyIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2MzY2ZjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN3ZWIpIiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+V0VCIEJST0pFQ1Q8L3RleHQ+PC9zdmc+',
    mobile: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Im1vYmlsZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzEwYjk4MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNmI2ZDQiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNtb2JpbGUpIiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TU9CSUxFIEFQUDwvdGV4dD48L3N2Zz4=',
    branding: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJyYW5kaW5nIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOGI1Y2Y2IiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2VjNDg5OSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2JyYW5kaW5nKSIgLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJSQU5ESU5HPC90ZXh0Pjwvc3ZnPg==',
    blockchain: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJsb2NrY2hhaW4iIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmNTllMGIiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZWY0NDQ0IiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYmxvY2tjaGFpbikiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CTE9DS0NIQVNORK48L3RleHQ+PC9zdmc+',
    iot: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImlvdCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY1OWVkZiIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzYjgyZjYiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNpb3QpIiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW9UIFBST0pFQ1Q8L3RleHQ+PC9zdmc+',
    default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImRlZmF1bHQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2YjcyODAiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOWNhM2FmIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZGVmYXVsdCkiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QUk9KRUNUPC90ZXh0Pjwvc3ZnPg=='
  };
  return placeholders[category as keyof typeof placeholders] || placeholders.default;
};

interface ProjectsProps {
  onNavigateToProject?: (id: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({ onNavigateToProject }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useI18n();
  
  // Use the custom hook to fetch projects
  const { projects: allProjects, loading, error } = useProjects();

  // Generate categories dynamically from projects
  const categories = React.useMemo(() => {
    if (!allProjects.length) return [{ id: 'all', label: t('projects.categories.all'), count: 0 }];
    
    const categoryCount = allProjects.reduce((acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { id: 'all', label: t('projects.categories.all'), count: allProjects.length },
      ...Object.entries(categoryCount).map(([category, count]) => ({
        id: category,
        label: t(`projects.categories.${category}`) || category.charAt(0).toUpperCase() + category.slice(1),
        count
      }))
    ];
  }, [allProjects, t]);

  // Helper functions
  const getProjectType = (category: string) => {
    const typeKeys = {
      mobile: 'projects.categories.mobile',
      web: 'projects.categories.web',
      branding: 'projects.categories.branding',
      blockchain: 'projects.categories.blockchain',
      iot: 'projects.categories.iot'
    };
    const key = typeKeys[category as keyof typeof typeKeys];
    return key ? t(key) : t('projects.categories.all');
  };

  const getGradientForCategory = (category: string, index: number) => {
    const gradients = [
      'from-blue-600 via-purple-600 to-pink-600',
      'from-emerald-500 via-teal-500 to-cyan-600',
      'from-orange-500 via-red-500 to-pink-600',
      'from-purple-600 via-indigo-600 to-blue-600',
      'from-cyan-500 via-blue-500 to-indigo-600',
      'from-amber-500 via-orange-500 to-red-600',
      'from-green-500 via-emerald-500 to-teal-600',
      'from-lime-500 via-green-500 to-emerald-600'
    ];
    return gradients[index % gradients.length];
  };

  // Transform projects for display
  const projects = React.useMemo(() => {
    return allProjects.map((project, index) => ({
      id: project.id,
      title: project.title,
      subtitle: project.impact || project.short_description || '', // Add subtitle/impact field
      category: project.category,
      type: getProjectType(project.category),
      description: project.long_description || project.description || '',
      image: (project.images && project.images[0]) || getPlaceholderImage(project.category),
      tags: (project.technologies && Array.isArray(project.technologies) ? project.technologies : []).slice(0, 4),
      gradient: getGradientForCategory(project.category, index),
      likes: Math.floor(Math.random() * 300) + 50, // Mock data
      views: `${(Math.floor(Math.random() * 15) + 5).toFixed(1)}k`, // Mock data
      featured: project.featured || false
    }));
  }, [allProjects, getProjectType]);
  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  // Show loading state
  if (loading) {
    return (
      <section ref={sectionRef} id="projects" className="py-32 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/30 relative overflow-hidden transition-colors">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 transition-colors">{t('projects.section.loading')}</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section ref={sectionRef} id="projects" className="py-32 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/30 relative overflow-hidden transition-colors">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 transition-colors">{t('projects.section.error')}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            >
              {t('projects.section.retry')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="projects" className="py-32 bg-surface-subtle relative overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <SectionHeader 
          eyebrow={t('projects.section.creative_portfolio')}
          titleFirst={t('projects.section.my_title')}
          titleSecond={t('projects.section.my_subtitle')}
          description={t('projects.section.description')}
        />

        {/* Category Filter */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <ProjectFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </motion.div>

        {/* Projects Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${project.featured ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                <ProjectCard
                  id={project.id}
                  title={project.title}
                  subtitle={project.subtitle}
                  category={project.category}
                  type={project.type}
                  description={project.description}
                  image={project.image}
                  tags={project.tags}
                  gradient={project.gradient}
                  likes={project.likes}
                  views={project.views}
                  featured={project.featured}
                  onClick={onNavigateToProject}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <GlassCard className="p-12 relative overflow-hidden" variant="subtle">
            <div className="relative z-10">
              <motion.h3 
                className="text-3xl font-bold mb-4 text-text-DEFAULT"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
              >
                {t('projects.ready_to_create')}
              </motion.h3>
              <motion.p 
                className="text-xl mb-8 text-text-soft"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
              >
                {t('projects.collaborate_vision')}
              </motion.p>
              <motion.button 
                onClick={() => {
                  const contactElement = document.getElementById('contact');
                  if (contactElement) {
                    contactElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-card hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.8, type: "spring", stiffness: 500 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('projects.start_project')}
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;