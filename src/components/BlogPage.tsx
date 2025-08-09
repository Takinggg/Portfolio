import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, User, Tag, Home, BookOpen } from 'lucide-react';
import { useBlogPosts } from '../hooks/useSupabase';
import { BlogPost as SupabaseBlogPost } from '../lib/supabase';
import { isSupabaseAvailable } from '../lib/supabase';
import Navigation from './Navigation';

// Convert Supabase blog post to display format
const convertSupabaseBlogPost = (post: SupabaseBlogPost) => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt || '',
  content: post.content,
  author: post.author,
  publishedAt: post.published_at,
  updatedAt: post.updated_at || undefined,
  featuredImage: post.featured_image || '',
  tags: post.tags || [],
  category: post.category,
  readTime: post.read_time || 5,
  featured: post.featured || false
});

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  featuredImage: string;
  tags: string[];
  category: string;
  readTime: number;
  featured: boolean;
}

interface BlogPageProps {
  onNavigateHome: () => void;
  onNavigateToPost: (slug: string) => void;
  onNavigateToProjects: () => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onNavigateHome, onNavigateToPost, onNavigateToProjects }) => {
  // Fetch posts from Supabase
  const { posts: supabasePosts, loading, error } = useBlogPosts();
  
  // Debug logging
  useEffect(() => {
    console.log('BlogPage - Posts:', supabasePosts);
    console.log('BlogPage - Loading:', loading);
    console.log('BlogPage - Error:', error);
    console.log('BlogPage - Supabase available:', isSupabaseAvailable());
    console.log('BlogPage - Total posts from Supabase:', supabasePosts.length);
    if (supabasePosts.length > 0) {
      console.log('BlogPage - First few posts:', supabasePosts.slice(0, 3).map(p => ({
        title: p.title,
        slug: p.slug,
        featured: p.featured
      })));
    }
  }, [supabasePosts, loading, error]);

  // Convert Supabase posts to display format
  const blogPosts = supabasePosts.map(convertSupabaseBlogPost);
  
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(blogPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const postsPerPage = 6;
  
  // Generate categories and tags from fetched posts
  const categories = React.useMemo(() => {
    return [...new Set(blogPosts.map(post => post.category))];
  }, [blogPosts]);
  
  const tags = React.useMemo(() => {
    return [...new Set(blogPosts.flatMap(post => post.tags))];
  }, [blogPosts]);
  
  const searchPosts = (query: string): BlogPost[] => {
    const lowercaseQuery = query.toLowerCase();
    return blogPosts.filter(post => 
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.excerpt.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  useEffect(() => {
    if (!loading && blogPosts.length > 0) {
      filterPosts();
    }
  }, [blogPosts, searchQuery, selectedCategory, selectedTag, loading]);

  const filterPosts = () => {
    let filtered = blogPosts;

    // Search filter
    if (searchQuery) {
      filtered = searchPosts(searchQuery);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Tag filter
    if (selectedTag !== 'all') {
      filtered = filtered.filter(post => post.tags.includes(selectedTag));
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <Navigation 
          onNavigateToSection={onNavigateHome}
          onNavigateToBlog={() => {}}
          onNavigateToProjects={onNavigateToProjects}
          showBackButton={true}
          onBack={onNavigateHome}
          backLabel="Retour au portfolio"
          currentPage="blog"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des articles...</p>
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
          onNavigateToBlog={() => {}}
          onNavigateToProjects={onNavigateToProjects}
          showBackButton={true}
          onBack={onNavigateHome}
          backLabel="Retour au portfolio"
          currentPage="blog"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erreur lors du chargement des articles</p>
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
      {/* Navigation with Back Button */}
      <Navigation 
        onNavigateToSection={onNavigateHome}
        onNavigateToBlog={() => {}}
        onNavigateToProjects={onNavigateToProjects}
        showBackButton={true}
        onBack={onNavigateHome}
        backLabel="Retour au portfolio"
        currentPage="blog"
      />

      {/* Header */}
      <header className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20 pt-32 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
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
              <span>Articles & Insights Design</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="block text-white">Blog &</span>
              <span className="block text-white/90">Insights</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              Découvrez mes réflexions sur le design UI/UX, les tendances digitales et les meilleures pratiques du design moderne
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">
                  {supabasePosts.length}
                </div>
                <div className="text-sm text-white/80">Articles</div>
              </div>
              
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">
                  {categories.length}
                </div>
                <div className="text-sm text-white/80">Catégories</div>
              </div>
              
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">
                  {tags.length}
                </div>
                <div className="text-sm text-white/80">Tags</div>
              </div>
            </div>
            
            {/* CTA Buttons */}
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
                placeholder="Rechercher un article..."
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
              <span className="font-medium">Filtres</span>
              <div className={`w-2 h-2 bg-purple-500 rounded-full transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters Panel */}
          <div className={`mt-6 transition-all duration-500 ${isFilterOpen ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <div className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Catégorie
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50"
                  >
                    <option value="all">Toutes les catégories ({blogPosts.length})</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category} ({blogPosts.filter(p => p.category === category).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tag Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tag
                  </label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50"
                  >
                    <option value="all">Tous les tags</option>
                    {tags.map(tag => (
                      <option key={tag} value={tag}>#{tag}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {filteredPosts.length} article{filteredPosts.length > 1 ? 's' : ''} trouvé{filteredPosts.length > 1 ? 's' : ''}
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedTag('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 hover:bg-purple-50 rounded-lg"
                >
                  Effacer les filtres
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section>
          {currentPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {currentPosts.map((post, index) => (
                  <article 
                    key={post.id}
                    className="group bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      
                      {/* Featured Badge */}
                      {post.featured && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ⭐ Featured
                        </div>
                      )}

                      {/* Read Time */}
                      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                        <Clock size={12} className="inline mr-1" />
                        {post.readTime} min
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <time dateTime={post.publishedAt}>
                            {formatDate(post.publishedAt)}
                          </time>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
                        <button 
                          onClick={() => onNavigateToPost(post.slug)}
                          className="text-left hover:underline"
                        >
                          {post.title}
                        </button>
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors duration-200"
                          >
                            <Tag size={10} />
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-gray-400">+{post.tags.length - 3}</span>
                        )}
                      </div>

                      {/* Read More */}
                      <button 
                        onClick={() => onNavigateToPost(post.slug)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Lire l'article
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-2" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 font-medium"
                    aria-label="Page précédente"
                  >
                    Précédent
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                        currentPage === page
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                      aria-label={`Page ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 font-medium"
                    aria-label="Page suivante"
                  >
                    Suivant
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun article trouvé</h3>
              <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche ou explorez d'autres catégories</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTag('all');
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Voir tous les articles
              </button>
            </div>
          )}
        </section>

        {/* Newsletter CTA */}
        <section className="mt-20">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="absolute top-8 right-8">
              <Tag className="text-white/30" size={48} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Restez informé des dernières tendances</h3>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Recevez mes derniers articles sur le design UI/UX directement dans votre boîte mail
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300 shadow-lg">
                  S'abonner
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BlogPage;