import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Calendar, Clock, User, BookOpen, Sparkles } from 'lucide-react';
import { getFeaturedPosts, BlogPost } from '../data/blogPosts';

const BlogSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

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

  const featuredPosts = getFeaturedPosts();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigateToBlog = () => {
    // Pour l'instant, on scroll vers le contact
    // Plus tard, on pourra implémenter le routing
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const readPost = (slug: string) => {
    // Pour l'instant, on affiche une alerte
    // Plus tard, on pourra implémenter le routing vers l'article
    alert(`Navigation vers l'article: ${slug}`);
  };

  return (
    <section ref={sectionRef} id="blog" className="py-32 bg-gradient-to-br from-purple-50/30 via-white to-pink-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-medium mb-6">
            <BookOpen className="text-purple-600" size={16} />
            <span className="text-gray-700">Derniers articles</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
              Blog &
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Insights
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Découvrez mes réflexions sur le design, les tendances UX/UI 
            et les meilleures pratiques du design digital
          </p>
        </div>

        {/* Featured Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {featuredPosts.map((post, index) => (
            <article 
              key={post.id}
              className={`group relative bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 ${
                index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 200}ms` }}
              onMouseEnter={() => setHoveredPost(post.id)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              {/* Featured Badge */}
              <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                ⭐ Featured
              </div>

              {/* Image Container */}
              <div className={`relative ${index === 0 ? 'h-80' : 'h-48'} overflow-hidden`}>
                <img 
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                {/* Read Time Badge */}
                <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                  <Clock size={12} className="inline mr-1" />
                  {post.readTime} min
                </div>

                {/* Hover Action */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <button 
                    onClick={() => readPost(post.slug)}
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold hover:bg-white/30 transition-all duration-200 transform hover:scale-105"
                  >
                    Lire l'article
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={`p-6 ${index === 0 ? 'lg:p-8' : ''}`}>
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </div>

                {/* Category */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className={`font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300 ${
                  index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'
                }`}>
                  {post.title}
                </h3>
                
                {/* Excerpt */}
                <p className={`text-gray-600 leading-relaxed mb-6 ${
                  index === 0 ? 'text-base' : 'text-sm'
                }`}>
                  {post.excerpt}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors duration-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Read More */}
                <button 
                  onClick={() => readPost(post.slug)}
                  className="group/btn flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors duration-200"
                >
                  <span>Lire la suite</span>
                  <ArrowRight 
                    size={16} 
                    className={`transition-transform duration-300 ${
                      hoveredPost === post.id ? 'translate-x-1' : ''
                    }`} 
                  />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Section */}
        <div className={`text-center transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="absolute top-8 right-8">
              <Sparkles className="text-white/30" size={48} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Envie de lire plus d'articles ?</h3>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Découvrez tous mes articles sur le design, l'UX et les tendances digitales
              </p>
              <button 
                onClick={navigateToBlog}
                className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-2 mx-auto"
              >
                Voir tous les articles
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;