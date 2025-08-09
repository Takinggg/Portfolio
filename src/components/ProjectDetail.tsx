import React from 'react';
import { Calendar, Clock, User, Share2, Twitter, Linkedin, Facebook, Tag, Home, ExternalLink, Github, ArrowLeft, Star, Code, Layers } from 'lucide-react';
import { useProject } from '../hooks/useSupabase';
import { Project as SupabaseProject } from '../lib/supabase';
import Navigation from './Navigation';

// Convert Supabase project to display format
const convertSupabaseProject = (project: SupabaseProject) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  longDescription: project.long_description,
  technologies: project.technologies,
  category: project.category,
  status: project.status,
  startDate: project.start_date,
  endDate: project.end_date,
  client: project.client,
  budget: project.budget,
  images: project.images,
  featured: project.featured,
  githubUrl: project.github_url,
  liveUrl: project.live_url,
  createdAt: project.created_at,
  updatedAt: project.updated_at
});

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateToBlog: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack, onNavigateHome, onNavigateToBlog }) => {
  // Fetch project from Supabase
  const { project: supabaseProject, loading, error } = useProject(projectId);
  
  // Convert to display format
  const project = supabaseProject ? convertSupabaseProject(supabaseProject) : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in-progress':
        return 'En cours';
      case 'archived':
        return 'Archivé';
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      mobile: 'Application Mobile',
      web: 'Interface Web',
      branding: 'Identité Visuelle',
      blockchain: 'Blockchain',
      iot: 'IoT'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const shareProject = (platform: string) => {
    const url = window.location.href;
    const title = project?.title || '';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Lien copié dans le presse-papiers !');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <Navigation 
          onNavigateToSection={onNavigateHome}
          onNavigateToBlog={onNavigateToBlog}
          onNavigateToProjects={onBack}
          showBackButton={true}
          onBack={onBack}
          backLabel="Retour aux projets"
          currentPage="projects"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du projet...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <Navigation 
          onNavigateToSection={onNavigateHome}
          onNavigateToBlog={onNavigateToBlog}
          onNavigateToProjects={onBack}
          showBackButton={true}
          onBack={onBack}
          backLabel="Retour aux projets"
          currentPage="projects"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Projet non trouvé</p>
            <button 
              onClick={onBack}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retour aux projets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Navigation with Back Button */}
      <Navigation 
        onNavigateToSection={onNavigateHome}
        onNavigateToBlog={onNavigateToBlog}
        onNavigateToProjects={onBack}
        showBackButton={true}
        onBack={onBack}
        backLabel="Retour aux projets"
        currentPage="projects"
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12 pt-32 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
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
            <button 
              onClick={onBack}
              className="hover:text-white transition-colors duration-200"
            >
              Projets
            </button>
            <span>/</span>
            <span className="text-white font-medium truncate">{project.title}</span>
          </nav>
        </div>
      </header>

      {/* Project Detail */}
      <article className="max-w-6xl mx-auto px-6 py-16">
        {/* Project Header */}
        <header className="mb-12">
          {/* Status and Category */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold">
              {getCategoryLabel(project.category)}
            </span>
            {project.featured && (
              <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            {project.title}
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-4xl">
            {project.description}
          </p>

          {/* Project Images */}
          {project.images && project.images.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-8">
                <Layers className="text-purple-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">Aperçu du projet</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {project.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <a
                      href={image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block cursor-pointer"
                    >
                      <img 
                        src={image}
                        alt={`${project.title} - Image ${index + 1}`}
                        className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </a>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-purple-600" size={20} />
                <span className="font-semibold text-gray-900">Début</span>
              </div>
              <p className="text-gray-600">{formatDate(project.startDate)}</p>
            </div>

            {project.endDate && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-green-600" size={20} />
                  <span className="font-semibold text-gray-900">Fin</span>
                </div>
                <p className="text-gray-600">{formatDate(project.endDate)}</p>
              </div>
            )}

            {project.client && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <User className="text-blue-600" size={20} />
                  <span className="font-semibold text-gray-900">Client</span>
                </div>
                <p className="text-gray-600">{project.client}</p>
              </div>
            )}

            {project.budget && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="text-yellow-600" size={20} />
                  <span className="font-semibold text-gray-900">Budget</span>
                </div>
                <p className="text-gray-600">{project.budget}</p>
              </div>
            )}
          </div>

          {/* Technologies */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Code className="text-purple-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Technologies utilisées</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {project.technologies.map((tech, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200 hover:from-purple-200 hover:to-pink-200 transition-colors duration-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            {project.liveUrl && project.liveUrl !== '#' && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ExternalLink size={18} />
                Voir le projet live
              </a>
            )}
          </div>

          {/* Share Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Share2 size={18} />
              <span>Partager ce projet :</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => shareProject('twitter')}
                className="p-3 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors duration-200 transform hover:scale-110 shadow-lg"
                title="Partager sur Twitter"
              >
                <Twitter size={16} />
              </button>
              
              <button
                onClick={() => shareProject('linkedin')}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 transform hover:scale-110 shadow-lg"
                title="Partager sur LinkedIn"
              >
                <Linkedin size={16} />
              </button>
              
              <button
                onClick={() => shareProject('facebook')}
                className="p-3 bg-blue-800 text-white rounded-full hover:bg-blue-900 transition-colors duration-200 transform hover:scale-110 shadow-lg"
                title="Partager sur Facebook"
              >
                <Facebook size={16} />
              </button>
              
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200 text-sm font-medium shadow-lg"
              >
                Copier le lien
              </button>
            </div>
          </div>
        </header>

        {/* Project Description */}
        {project.longDescription && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Description détaillée</h2>
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: project.longDescription }}
              />
            </div>
          </section>
        )}

        {/* Project Footer */}
        <footer className="mt-16 pt-12 border-t border-gray-200">
          {/* CTA */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Vous avez aimé ce projet ?</h3>
            <p className="text-lg opacity-90 mb-6">
              Découvrez d'autres projets ou contactez-moi pour discuter de votre prochain projet
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onBack}
                className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Voir plus de projets
              </button>
              <button 
                onClick={onNavigateHome}
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105 border border-white/30"
              >
                Me contacter
              </button>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default ProjectDetail;