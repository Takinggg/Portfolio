import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Eye, Heart, Star, ArrowRight } from 'lucide-react';
import { useProjects } from '../hooks/useSupabase';

const Projects = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Use the custom hook to fetch projects
  const { projects: allProjects, loading, error } = useProjects();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Generate categories dynamically from projects
  const categories = React.useMemo(() => {
    if (!allProjects.length) return [{ id: 'all', label: 'Tous les projets', count: 0 }];
    
    const categoryCount = allProjects.reduce((acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { id: 'all', label: 'Tous les projets', count: allProjects.length },
      ...Object.entries(categoryCount).map(([category, count]) => ({
        id: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
        count
      }))
    ];
  }, [allProjects]);

  // Helper functions
  const getProjectType = (category: string) => {
    const types = {
      mobile: 'Application Mobile',
      web: 'Interface Web',
      branding: 'Identité Visuelle',
      blockchain: 'Blockchain',
      iot: 'IoT'
    };
    return types[category as keyof typeof types] || 'Projet';
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
      category: project.category,
      type: getProjectType(project.category),
      description: project.long_description || project.description,
      image: project.images[0] || 'https://via.placeholder.com/400x300',
      tags: project.technologies.slice(0, 4),
      gradient: getGradientForCategory(project.category, index),
      likes: Math.floor(Math.random() * 300) + 50, // Mock data
      views: `${(Math.floor(Math.random() * 15) + 5).toFixed(1)}k`, // Mock data
      featured: project.featured
    }));
  }, [allProjects]);
  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  // Show loading state
  if (loading) {
    return (
      <section ref={sectionRef} id="projects" className="py-32 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des projets...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section ref={sectionRef} id="projects" className="py-32 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-red-600">Erreur lors du chargement des projets</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="projects" className="py-32 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-40 left-20 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-medium mb-6">
            <Star className="text-purple-600" size={16} />
            <span className="text-gray-700">Portfolio créatif</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
              Mes
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Créations
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Découvrez une sélection de mes projets les plus innovants, 
            alliant créativité, technologie et impact utilisateur
          </p>
        </div>

        {/* Category Filter */}
        <div className={`flex flex-wrap justify-center gap-4 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`group relative px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'text-white shadow-2xl'
                  : 'text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur-xl border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
              }`}
            >
              {selectedCategory === category.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {category.label}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedCategory === category.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.count}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <div 
              key={project.id}
              className={`group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 ${
                project.featured ? 'md:col-span-2 lg:col-span-1' : ''
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Featured Badge */}
              {project.featured && (
                <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  ⭐ Featured
                </div>
              )}

              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-90 transition-all duration-500`} />
                
                {/* Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <div className="flex gap-4">
                    <button className="p-4 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 transform hover:scale-110">
                      <Eye size={24} />
                    </button>
                    <button className="p-4 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 transform hover:scale-110">
                      <ExternalLink size={24} />
                    </button>
                  </div>
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <div className="flex items-center gap-4 text-white text-sm">
                    <div className="flex items-center gap-1">
                      <Heart size={16} />
                      <span>{project.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      <span>{project.views}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                    {project.type}
                  </span>
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                  {project.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors duration-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className={`text-center mt-20 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Prêt à créer quelque chose d'extraordinaire ?</h3>
              <p className="text-xl mb-8 opacity-90">Collaborons pour donner vie à votre vision</p>
              <button 
                onClick={() => {
                  const contactElement = document.getElementById('contact');
                  if (contactElement) {
                    contactElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Démarrer un projet
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;