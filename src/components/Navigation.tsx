import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Home, User, Briefcase, Mail, ArrowRight, BookOpen, ArrowLeft } from 'lucide-react';

interface NavigationProps {
  onNavigateToSection: (sectionId: string) => void;
  onNavigateToBlog: () => void;
  onNavigateToProjects: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  backLabel?: string;
  currentPage?: 'home' | 'blog' | 'post' | 'projects';
}

const Navigation: React.FC<NavigationProps> = ({ 
  onNavigateToSection, 
  onNavigateToBlog,
  onNavigateToProjects,
  showBackButton = false,
  onBack,
  backLabel = "Retour",
  currentPage = 'home'
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      
      // Only update active section based on scroll position if we're on home page
      if (currentPage === 'home') {
        const sections = ['hero', 'about', 'contact'];
        const scrollPosition = window.scrollY + 200;
        
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentPage]);

  // Set active section based on current page
  useEffect(() => {
    if (currentPage === 'blog' || currentPage === 'post') {
      setActiveSection('blog');
    } else if (currentPage === 'projects') {
      setActiveSection('projects');
    } else if (currentPage === 'home') {
      setActiveSection('hero');
    }
  }, [currentPage]);

  const handleNavigation = (id: string) => {
    if (id === 'blog') {
      onNavigateToBlog();
    } else if (id === 'projects') {
      onNavigateToProjects();
    } else {
      // For home page sections (hero, about, contact)
      onNavigateToSection(id);
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'hero', label: 'Accueil', icon: Home, type: 'anchor' },
    { id: 'about', label: 'À propos', icon: User, type: 'anchor' },
    { id: 'projects', label: 'Projets', icon: Briefcase, type: 'section' },
    { id: 'blog', label: 'Blog', icon: BookOpen, type: 'section' },
    { id: 'contact', label: 'Contact', icon: Mail, type: 'anchor' }
  ];

  const scrollProgress = Math.min(100, (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);

  return (
    <>
      {/* Main Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-3xl border-b border-gray-200/50 shadow-2xl shadow-black/5' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Back Button */}
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-full text-gray-700 hover:text-gray-900 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">{backLabel}</span>
              </button>
            )}

            {/* Logo */}
            {/* Logo - Only show on home page */}
            {currentPage === 'home' && (
              <div 
                className={`flex items-center gap-4 cursor-pointer group ${showBackButton ? 'mx-auto sm:mx-0' : ''}`}
                onClick={() => handleNavigation('hero')}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    FOULON
                  </div>
                  <div className="text-sm text-gray-500 font-medium -mt-1">
                    UI/UX Designer
                  </div>
                </div>
              </div>
            )}
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="flex items-center bg-white/80 backdrop-blur-2xl border border-gray-200/50 rounded-full p-1 shadow-2xl">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-500 group ${
                        isActive
                          ? 'text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {isActive && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-full animate-pulse" />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      )}
                      <Icon size={16} className={`relative z-10 ${isActive ? 'animate-bounce' : 'group-hover:scale-110'} transition-transform duration-300`} />
                      <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                      {isActive && (
                        <ArrowRight size={12} className="relative z-10 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-3">
              <button 
                onClick={() => {
                  window.history.pushState({}, '', '/admin');
                  window.location.href = '/admin';
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Admin
              </button>
              <button 
                onClick={() => handleNavigation('contact')}
                className="group relative px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-sm overflow-hidden shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Collaborer
                  <div className="w-2 h-2 bg-white rounded-full group-hover:animate-ping" />
                </span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden relative p-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="relative w-6 h-6">
                <Menu 
                  size={24} 
                  className={`absolute inset-0 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'
                  }`} 
                />
                <X 
                  size={24} 
                  className={`absolute inset-0 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                  }`} 
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden absolute top-full left-0 right-0 transition-all duration-500 ${
          isMobileMenuOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="mx-6 mt-4 bg-white/95 backdrop-blur-3xl border border-gray-200/50 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 gap-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`group relative flex items-center gap-4 p-4 rounded-2xl text-left font-semibold transition-all duration-300 ${
                        isActive
                          ? 'text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-2xl" />
                      )}
                      <Icon size={20} className={`relative z-10 ${isActive ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform duration-300`} />
                      <span className="relative z-10">{item.label}</span>
                      {isActive && (
                        <ArrowRight size={16} className="relative z-10 ml-auto animate-bounce" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => handleNavigation('contact')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Démarrer un projet
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

    </>
  );
};

export default Navigation;