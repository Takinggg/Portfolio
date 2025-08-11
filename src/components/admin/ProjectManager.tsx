import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, Tag, Briefcase, Save, X, Upload } from 'lucide-react';
import { projectService } from '../../lib/api';

interface Project {
  id: string;
  title: string;
  description: string;
  long_description: string;
  technologies: string[];
  category: string;
  status: 'in-progress' | 'completed' | 'archived';
  start_date: string;
  end_date?: string;
  client?: string;
  budget?: string;
  images: string[];
  featured: boolean;
  github_url?: string;
  live_url?: string;
  created_at: string;
  updated_at: string;
}

const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['mobile', 'web', 'branding', 'blockchain', 'iot'];
  const statuses = ['in-progress', 'completed', 'archived'];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, selectedCategory, selectedStatus]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await projectService.getAllProjects();
      
      if (error) {
        throw error;
      }
      
      // Ensure data is an array and validate/sanitize project objects
      const rawProjects = Array.isArray(data) ? data : [];
      const validProjects = rawProjects
        .filter(Boolean) // Remove null/undefined
        .map(project => ({
          ...project,
          // Ensure required properties have safe defaults
          id: project.id || '',
          title: project.title || '',
          description: project.description || '',
          long_description: project.long_description || '',
          technologies: Array.isArray(project.technologies) ? project.technologies : [],
          images: Array.isArray(project.images) ? project.images : [],
          category: project.category || 'web',
          status: project.status || 'in-progress',
          start_date: project.start_date || new Date().toISOString().split('T')[0],
          featured: Boolean(project.featured),
          created_at: project.created_at || new Date().toISOString(),
          updated_at: project.updated_at || new Date().toISOString()
        }));
      
      setProjects(validProjects);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des projets';
      setError(errorMessage);
      console.error('Error fetching projects:', err);
      
      // Show a more user-friendly error message for network issues
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    // Filter out any null/undefined projects first
    let filtered = projects.filter(Boolean);

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    setFilteredProjects(filtered);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingProject({
      title: '',
      description: '',
      long_description: '',
      technologies: [],
      category: 'web',
      status: 'in-progress',
      start_date: new Date().toISOString().split('T')[0],
      images: [],
      featured: false
    });
    setIsEditing(true);
  };

  const handleSave = async (projectData: Partial<Project>) => {
    try {
      setLoading(true);

      // Final safeguard: ensure technologies and images are always arrays
      const safeProjectData = {
        ...projectData,
        technologies: Array.isArray(projectData.technologies) ? projectData.technologies : [],
        images: Array.isArray(projectData.images) ? projectData.images : []
      };

      let result;
      if (safeProjectData.id) {
        // Update existing project
        console.log('Updating project with data:', safeProjectData);
        result = await projectService.updateProject(safeProjectData.id, safeProjectData);
      } else {
        // Create new project
        console.log('Creating project with data:', safeProjectData);
        result = await projectService.createProject(safeProjectData as Omit<Project, 'id' | 'created_at' | 'updated_at'>);
      }

      if (result.error) {
        console.error('API returned error:', result.error);
        throw result.error;
      }

      console.log('Project saved successfully:', result.data);
      setIsEditing(false);
      setEditingProject(null);
      
      // Refresh the list to show the new/updated project
      await fetchProjects();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setError(errorMessage);
      console.error('Error saving project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        setLoading(true);
        const { error } = await projectService.deleteProject(projectId);
        
        if (error) throw error;
        
        await fetchProjects(); // Refresh the list
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
        console.error('Error deleting project:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-200 text-green-900 border border-green-300';
      case 'in-progress':
        return 'bg-blue-200 text-blue-900 border border-blue-300';
      case 'archived':
        return 'bg-gray-200 text-gray-900 border border-gray-300';
      default:
        return 'bg-gray-200 text-gray-900 border border-gray-300';
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

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="bg-red-50 border-2 border-red-200 text-red-900 px-6 py-4 rounded-xl shadow-md"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-shrink-0 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <p className="font-semibold text-red-900">Erreur</p>
        </div>
        <p className="text-sm text-red-800 mb-3">{error}</p>
        <button 
          onClick={fetchProjects}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-900 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 hover:border-red-400 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
          aria-label="Réessayer le chargement des projets"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Réessayer
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <ProjectEditor
        project={editingProject}
        onSave={handleSave}
        onCancel={() => {
          setIsEditing(false);
          setEditingProject(null);
        }}
        loading={loading}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Projets</h2>
          <p className="text-gray-700 mt-1">{filteredProjects.length} projet(s) trouvé(s)</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          aria-label="Créer un nouveau projet"
        >
          <Plus size={20} />
          Nouveau Projet
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search-projects" className="sr-only">Rechercher un projet</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                id="search-projects"
                type="text"
                placeholder="Rechercher un projet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div>
              <label htmlFor="category-filter" className="sr-only">Filtrer par catégorie</label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status-filter" className="sr-only">Filtrer par statut</label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="all">Tous les statuts</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre premier projet'
            }
          </p>
          {!searchQuery && selectedCategory === 'all' && selectedStatus === 'all' && (
            <button
              onClick={handleCreate}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200"
            >
              Créer un projet
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300">
              <div className="relative h-48">
                <img
                  src={project.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImFkbWluIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNGY0NjU2IiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzZiNzI4MCIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2FkbWluKSIgLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JTUFHRSBOT04gRElTUE9OSUJMRTwvdGV4dD48L3N2Zz4='}
                  alt={project.title || 'Image du projet'}
                  className="w-full h-full object-cover"
                />
                {project.featured && (
                  <div className="absolute top-3 left-3 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    ⭐ Featured
                  </div>
                )}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1 flex-1 mr-2">{project.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-900 px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                    {(project.category || 'web').toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-700 text-sm line-clamp-2 mb-4 leading-relaxed">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies?.slice(0, 3).map((tech, index) => (
                    <span key={`${project.id}-tech-${index}`} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">
                      {tech}
                    </span>
                  ))}
                  {(project.technologies?.length || 0) > 3 && (
                    <span className="text-xs text-gray-600 font-medium">+{(project.technologies?.length || 0) - 3}</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-600">
                    {project.client && <div className="font-medium">Client: {project.client}</div>}
                    <div>Début: {project.start_date ? new Date(project.start_date).toLocaleDateString('fr-FR') : 'N/A'}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 text-gray-700 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors duration-200 border border-gray-300 hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      title="Modifier"
                      aria-label={`Modifier le projet ${project.title}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-2 text-gray-700 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-gray-300 hover:border-green-300 focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                      title="Voir"
                      aria-label={`Voir le projet ${project.title}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-gray-700 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors duration-200 border border-gray-300 hover:border-red-300 focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      title="Supprimer"
                      aria-label={`Supprimer le projet ${project.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Project Editor Component
interface ProjectEditorProps {
  project: Partial<Project> | null;
  onSave: (project: Partial<Project>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, onSave, onCancel, loading = false }) => {
  // Safely initialize form data with proper defaults
  const getInitialFormData = (): Partial<Project> => {
    if (!project) {
      return {
        title: '',
        description: '',
        long_description: '',
        technologies: [],
        images: [],
        category: 'web',
        status: 'in-progress',
        start_date: new Date().toISOString().split('T')[0],
        featured: false
      };
    }
    
    return {
      ...project,
      // Ensure arrays are properly initialized
      technologies: Array.isArray(project.technologies) ? project.technologies : [],
      images: Array.isArray(project.images) ? project.images : [],
      // Ensure required fields have defaults
      title: project.title || '',
      description: project.description || '',
      long_description: project.long_description || '',
      category: project.category || 'web',
      status: project.status || 'in-progress',
      start_date: project.start_date || new Date().toISOString().split('T')[0],
      featured: Boolean(project.featured)
    };
  };

  const [formData, setFormData] = useState<Partial<Project>>(getInitialFormData());
  const [technologies, setTechnologies] = useState<string>(() => {
    const techs = Array.isArray(project?.technologies) ? project.technologies : [];
    return techs.join(', ');
  });
  const [imageUrls, setImageUrls] = useState<string>(() => {
    const images = Array.isArray(project?.images) ? project.images : [];
    return images.join('\n');
  });

  // Update form data when project prop changes
  React.useEffect(() => {
    const newFormData = getInitialFormData();
    setFormData(newFormData);
    
    const techs = Array.isArray(newFormData.technologies) ? newFormData.technologies : [];
    setTechnologies(techs.join(', '));
    
    const images = Array.isArray(newFormData.images) ? newFormData.images : [];
    setImageUrls(images.join('\n'));
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure all required fields have proper defaults with null/undefined checks
    const processedData = {
      ...formData,
      technologies: technologies ? technologies.split(',').map(tech => tech.trim()).filter(Boolean) : [],
      images: imageUrls ? imageUrls.split('\n').map(url => url.trim()).filter(Boolean) : [],
      // Ensure all fields have proper defaults
      title: formData.title || '',
      description: formData.description || '',
      long_description: formData.long_description || '',
      category: formData.category || 'web',
      status: formData.status || 'in-progress',
      start_date: formData.start_date || new Date().toISOString().split('T')[0],
      end_date: formData.end_date || null,
      client: formData.client || null,
      budget: formData.budget || null,
      featured: formData.featured || false,
      github_url: formData.github_url || null,
      live_url: formData.live_url || null
    };
    
    onSave(processedData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {project?.id ? 'Modifier le projet' : 'Nouveau projet'}
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 border-2 border-gray-400 text-gray-800 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-500 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Annuler l'édition du projet"
          >
            <X size={20} />
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            aria-label={loading ? 'Sauvegarde en cours...' : 'Enregistrer le projet'}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {loading ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="project-title" className="block text-sm font-semibold text-gray-800 mb-2">
                  Titre du projet *
                </label>
                <input
                  id="project-title"
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                  placeholder="Nom de votre projet"
                  required
                />
              </div>

              <div>
                <label htmlFor="project-description" className="block text-sm font-semibold text-gray-800 mb-2">
                  Description courte *
                </label>
                <textarea
                  id="project-description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-600"
                  placeholder="Description courte du projet"
                  required
                />
              </div>

              <div>
                <label htmlFor="project-long-description" className="block text-sm font-semibold text-gray-800 mb-2">
                  Description détaillée
                </label>
                <textarea
                  id="project-long-description"
                  value={formData.long_description || ''}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-600"
                  placeholder="Description détaillée du projet"
                />
              </div>

              <div>
                <label htmlFor="project-technologies" className="block text-sm font-semibold text-gray-800 mb-2">
                  Technologies utilisées (séparées par des virgules)
                </label>
                <input
                  id="project-technologies"
                  type="text"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Images du projet</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URLs des images (une par ligne)
                </label>
                <textarea
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                />
              </div>
              
              {imageUrls && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageUrls.split('\n').filter(Boolean).map((url, index) => (
                    <img
                      key={index}
                      src={url.trim()}
                      alt={`Aperçu ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut du projet</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="web">Web</option>
                  <option value="mobile">Mobile</option>
                  <option value="branding">Branding</option>
                  <option value="blockchain">Blockchain</option>
                  <option value="iot">IoT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="in-progress">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Projet mis en avant
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dates</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations client</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Client
                </label>
                <input
                  type="text"
                  value={formData.client || ''}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nom du client"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget
                </label>
                <select
                  value={formData.budget || ''}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un budget</option>
                  <option value="&lt; 5k &euro;">&lt; 5k &euro;</option>
                  <option value="5k-15k &euro;">5k-15k &euro;</option>
                  <option value="15k-30k &euro;">15k-30k &euro;</option>
                  <option value="30k-50k &euro;">30k-50k &euro;</option>
                  <option value="50k+ &euro;">50k+ &euro;</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Liens</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL GitHub
                </label>
                <input
                  type="url"
                  value={formData.github_url || ''}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL Live
                </label>
                <input
                  type="url"
                  value={formData.live_url || ''}
                  onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectManager;