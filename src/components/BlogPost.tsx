import React from 'react';
import { Calendar, Clock, User, Share2, Twitter, Linkedin, Facebook, Tag, Home } from 'lucide-react';
import { useBlogPost } from '../hooks/useSupabase';
import { BlogPost as SupabaseBlogPost } from '../lib/supabase';
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

interface BlogPostProps {
  slug: string;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateToProjects: () => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ slug, onBack, onNavigateHome, onNavigateToProjects }) => {
  // Fetch post from Supabase
  const { post: supabasePost, loading, error } = useBlogPost(slug);
  
  // Convert to display format
  const post = supabasePost ? convertSupabaseBlogPost(supabasePost) : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sharePost = (platform: string) => {
    const url = window.location.href;
    const title = post.title;
    
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
    // Vous pourriez ajouter une notification toast ici
    alert('Lien copié dans le presse-papiers !');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <Navigation 
          onNavigateToSection={onNavigateHome}
          onNavigateToBlog={onBack}
          onNavigateToProjects={onNavigateToProjects}
          showBackButton={true}
          onBack={onBack}
          backLabel="Retour au blog"
          currentPage="post"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de l'article...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <Navigation 
          onNavigateToSection={onNavigateHome}
          onNavigateToBlog={onBack}
          onNavigateToProjects={onNavigateToProjects}
          showBackButton={true}
          onBack={onBack}
          backLabel="Retour au blog"
          currentPage="post"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Article non trouvé</p>
            <button 
              onClick={onBack}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retour au blog
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
        onNavigateToBlog={onBack}
        onNavigateToProjects={onNavigateToProjects}
        showBackButton={true}
        onBack={onBack}
        backLabel="Retour au blog"
        currentPage="post"
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12 pt-32 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
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
              Blog
            </button>
            <span>/</span>
            <span className="text-white font-medium truncate">{post.title}</span>
          </nav>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        {/* Featured Image */}
        <div className="relative h-96 rounded-3xl overflow-hidden mb-12 shadow-2xl">
          <img 
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          
          {/* Featured Badge */}
          {post.featured && (
            <div className="absolute top-6 left-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              ⭐ Article Featured
            </div>
          )}
        </div>

        {/* Article Header */}
        <header className="mb-12">
          {/* Category */}
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span className="font-medium">{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>{post.readTime} min de lecture</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>

          {/* Share Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Share2 size={18} />
              <span>Partager cet article :</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => sharePost('twitter')}
                className="p-3 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors duration-200 transform hover:scale-110 shadow-lg"
                title="Partager sur Twitter"
                aria-label="Partager sur Twitter"
              >
                <Twitter size={16} />
              </button>
              
              <button
                onClick={() => sharePost('linkedin')}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 transform hover:scale-110 shadow-lg"
                title="Partager sur LinkedIn"
                aria-label="Partager sur LinkedIn"
              >
                <Linkedin size={16} />
              </button>
              
              <button
                onClick={() => sharePost('facebook')}
                className="p-3 bg-blue-800 text-white rounded-full hover:bg-blue-900 transition-colors duration-200 transform hover:scale-110 shadow-lg"
                title="Partager sur Facebook"
                aria-label="Partager sur Facebook"
              >
                <Facebook size={16} />
              </button>
              
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200 text-sm font-medium shadow-lg"
                title="Copier le lien"
              >
                Copier le lien
              </button>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-16">
          <div 
            className="text-gray-700 leading-relaxed prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:mb-6 prose-p:text-lg prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Article Footer */}
        <footer className="mt-16 pt-12 border-t border-gray-200">
          {/* Author Bio */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 mb-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                MF
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.author}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Designer UI/UX passionné par la création d'expériences digitales exceptionnelles. 
                  Spécialisé dans le design d'interfaces modernes et l'optimisation de l'expérience utilisateur.
                </p>
                <div className="flex items-center gap-3">
                  <button className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors duration-200">
                    <Twitter size={16} />
                  </button>
                  <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200">
                    <Linkedin size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Vous avez aimé cet article ?</h3>
            <p className="text-lg opacity-90 mb-6">
              Découvrez d'autres articles sur le design UI/UX et les tendances digitales
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onBack}
                className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Voir plus d'articles
              </button>
              <button 
                onClick={onNavigateHome}
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105 border border-white/30"
              >
                Retour au portfolio
              </button>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default BlogPost;