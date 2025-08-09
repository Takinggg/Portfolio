import React, { useState, useEffect } from 'react';
import { ExternalLink, Github, Eye, Calendar, Code, Layers, Zap, Star, Filter, Search, ArrowRight, Home } from 'lucide-react';
import { useProjects } from '../hooks/useSupabase';
import { Project as SupabaseProject } from '../lib/supabase';
import Navigation from './Navigation';

// Convert Supabase project to display format
const convertSupabaseProject = (project: SupabaseProject, index: number) => {
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

  const bgGradients = [
    'from-blue-50 to-purple-50',
    'from-emerald-50 to-teal-50',
    'from-orange-50 to-red-50',
    'from-purple-50 to-indigo-50',
    'from-cyan-50 to-blue-50',
    'from-amber-50 to-orange-50',
    'from-green-50 to-emerald-50',
    'from-lime-50 to-green-50'
  ];

  const typeLabels = {
    mobile: 'Application Mobile',
    web: 'Interface Web',
    branding: 'Identité Visuelle',
    blockchain: 'Blockchain',
    iot: 'IoT'
  };

  return {
    id: project.id,
    title: project.title,
    category: project.category,
    type: typeLabels[project.category as keyof typeof typeLabels] || 'Projet',
    description: project.long_description || project.description,
    image: project.images[0] || 'https://via.placeholder.com/400x300',
    tags: project.technologies.slice(0, 4),
    gradient: gradients[index % gradients.length],
    bgGradient: bgGradients[index % bgGradients.length],
    likes: Math.floor(Math.random() * 300) + 50, // Mock data
    views: `${(Math.floor(Math.random() * 15) + 5).toFixed(1)}k`, // Mock data
    featured: project.featured,
    status: project.status,
    year: new Date(project.start_date).getFullYear().toString(),
    client: project.client,
    githubUrl: project.github_url,
    liveUrl: project.live_url
  };
};

interface ProjectsPageProps {
  onNavigateHome: () => void;
  onNavigateToBlog: () => void;
  onNavigateToProject?: (projectId: string) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigateHome, onNavigateToBlog, onNavigateToProject }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch projects from Supabase
  const { projects: supabaseProjects, loading, error } = useProjects();
  
  // Convert Supabase projects to display format
  const projects = React.useMemo(() => {
    return supabaseProjects.map(convertSupabaseProject);
  }, [supabaseProjects]);

  // Generate categories dynamically from projects
  const categories = [
    { id: 'all', label: 'Tous les projets', count: projects.length },
    ...Array.from(new Set(projects.map(p => p.category))).map(category => ({
      id: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
      count: projects.filter(p => p.category === category).length
    }))
  ];

  const statusLabels = {
    completed: { label: 'Terminé', color: 'bg-green-100 text-green-800' },
    'in-progress': { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
    archived: { label: 'Archivé', color: 'bg-gray-100 text-gray-800' }
  };

  // Filter projects based on search and category
  const filteredProjects = React.useMemo(() => {
    if (loading || !projects.length) return [];
    
    let filtered = [...projects];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    return filtered;
  }, [projects, searchQuery, selectedCategory, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <Navigation 
          onNavigateToSection={onNavigateHome}
          onNavigateToBlog={onNavigateToBlog}
          onNavigateToProjects={() => {}}
          showBackButton={true}
          onBack={onNavigateHome}
          backLabel="Retour au portfolio"
          currentPage="projects"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des projets...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <Navigation 
          onNavigateToSection={onNavigateHome}
          onNavigateToBlog={onNavigateToBlog}
          onNavigateToProjects={() => {}}
          showBackButton={true}
          onBack={onNavigateHome}
          backLabel="Retour au portfolio"
          currentPage="projects"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erreur lors du chargement des projets</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Navigation */}
      <Navigation 
        onNavigateToSection={onNavigateHome}
        onNavigateToBlog={onNavigateToBlog}
        onNavigateToProjects={() => {}}
        showBackButton={true}
        onBack={onNavigateHome}
        backLabel="Retour au portfolio"
        currentPage="projects"
      />

      {/* Header */}
      <header className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20 pt-32 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/80 mb-8">
            <button 
              onClick={onNavigateHome}
              className="flex items-center gap-2 hover:text-white transition-colors duration-200"
            >
              <Home size={16} />
              Accueil
            </button>
            <span>/</span>
            <span className="text-white font-medium">Projets</span>
          </nav>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Code className="text-white/80" size={18} />
              <span>Portfolio Créatif</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="block text-white">Mes</span>
              <span className="block text-white/90">Projets</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              Découvrez une sélection de mes créations les plus innovantes, 
              alliant design moderne, technologies avancées et expérience utilisateur exceptionnelle
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">{supabaseProjects.length}</div>
                <div className="text-sm text-white/80">Projets</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">{categories.length - 1}</div>
                <div className="text-sm text-white/80">Catégories</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">{supabaseProjects.filter(p => p.featured).length}</div>
                <div className="text-sm text-white/80">Featured</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Search and Filters */}
        <section className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-6 py-4 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl hover:border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Filter size={20} />
              <span className="font-medium">Catégories</span>
            </button>
          </div>

          {/* Category Filters */}
          <div className={`mt-6 transition-all duration-500 ${isFilterOpen ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <div className="flex flex-wrap justify-center gap-4">
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
          </div>
        </section>

        {/* Projects Grid */}
        <section>
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <article 
                  key={project.id}
                  className={`group relative bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 border border-gray-100 ${
                    project.featured ? 'ring-2 ring-purple-200' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Featured Badge */}
                  {project.featured && (
                    <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ⭐ Featured
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-medium ${statusLabels[project.status].color}`}>
                    {statusLabels[project.status].label}
                  </div>

                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-90 transition-all duration-500`} />
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      <div className="flex gap-3">
                        {project.liveUrl && (
                          <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 transform hover:scale-110">
                            <Eye size={20} />
                          </button>
                        )}
                        {project.githubUrl && (
                          <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 transform hover:scale-110">
                            <Github size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Meta */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>{project.year}</span>
                      </div>
                      <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        {project.category.toUpperCase()}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                      {project.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tags.slice(0, 4).map((tech, techIndex) => (
                        <span 
                          key={techIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors duration-200"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.tags.length > 4 && (
                        <span className="text-xs text-gray-400">+{project.tags.length - 4}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button 
                        onClick={() => onNavigateToProject && onNavigateToProject(project.id.toString())}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <span>Voir le projet</span>
                        <ArrowRight size={16} />
                      </button>
                      
                      {project.githubUrl && project.githubUrl !== '#' && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 inline-flex items-center justify-center"
                        >
                          <Github size={18} />
                        </a>
                      )}
                      
                      {project.liveUrl && project.liveUrl !== '#' && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 inline-flex items-center justify-center"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun projet trouvé</h3>
              <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Voir tous les projets
              </button>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="mt-20">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="absolute top-8 right-8">
              <Zap className="text-white/30" size={48} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Prêt à créer quelque chose d'extraordinaire ?</h3>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Collaborons pour donner vie à votre vision et créer des expériences digitales mémorables
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={onNavigateHome}
                  className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  Démarrer un projet
                </button>
                <button 
                  onClick={onNavigateHome}
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105 border border-white/30"
                >
                  Retour au portfolio
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectsPage;