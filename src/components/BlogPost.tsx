import React from 'react';
import { ArrowLeft, Calendar, Clock, User, Share2, Twitter, Linkedin, Facebook, Tag } from 'lucide-react';
import { BlogPost as BlogPostType } from '../data/blogPosts';

interface BlogPostProps {
  post: BlogPostType;
  onBack: () => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ post, onBack }) => {
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
    alert('Lien copié dans le presse-papiers !');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Retour au blog
          </button>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        {/* Featured Image */}
        <div className="relative h-96 rounded-3xl overflow-hidden mb-12 shadow-2xl">
          <img 
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
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
              <span>{formatDate(post.publishedAt)}</span>
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
          <div className="flex items-center gap-4 p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Share2 size={18} />
              <span>Partager :</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => sharePost('twitter')}
                className="p-3 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors duration-200 transform hover:scale-110"
                title="Partager sur Twitter"
              >
                <Twitter size={16} />
              </button>
              
              <button
                onClick={() => sharePost('linkedin')}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 transform hover:scale-110"
                title="Partager sur LinkedIn"
              >
                <Linkedin size={16} />
              </button>
              
              <button
                onClick={() => sharePost('facebook')}
                className="p-3 bg-blue-800 text-white rounded-full hover:bg-blue-900 transition-colors duration-200 transform hover:scale-110"
                title="Partager sur Facebook"
              >
                <Facebook size={16} />
              </button>
              
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
              >
                Copier le lien
              </button>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              fontSize: '1.125rem',
              lineHeight: '1.75'
            }}
          />
        </div>

        {/* Article Footer */}
        <footer className="mt-16 pt-12 border-t border-gray-200">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Vous avez aimé cet article ?</h3>
            <p className="text-lg opacity-90 mb-6">
              Découvrez d'autres articles sur le design et l'UX
            </p>
            <button 
              onClick={onBack}
              className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Voir plus d'articles
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default BlogPost;