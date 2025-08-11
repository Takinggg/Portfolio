import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, User, Briefcase, BookOpen, Mail, ArrowRight } from 'lucide-react';

interface NewNavbarProps {
  onNavigateToSection: (sectionId: string) => void;
  onNavigateToBlog: () => void;
  onNavigateToProjects: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  backLabel?: string;
  currentPage?: 'home' | 'blog' | 'post' | 'projects';
  isAuthenticated?: boolean;
}

const NewNavbar: React.FC<NewNavbarProps> = ({ 
  onNavigateToSection, 
  onNavigateToBlog,
  onNavigateToProjects,
  showBackButton = false,
  onBack,
  backLabel = "Retour",
  currentPage = 'home',
  isAuthenticated = false
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      // Only update active section based on scroll position if we're on home page
      if (currentPage === 'home') {
        const sections = ['hero', 'about', 'projects', 'blog', 'contact'];
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
    { id: 'hero', label: 'Accueil', icon: Home },
    { id: 'about', label: 'A propos', icon: User },
    { id: 'projects', label: 'Projets', icon: Briefcase },
    { id: 'blog', label: 'Articles', icon: BookOpen },
    { id: 'contact', label: 'Me contacter', icon: Mail }
  ];

  return (
    <>
      {/* Sticky Header Container */}
      <header className="fixed top-4 left-0 right-0 z-40 flex justify-center px-4">
        <nav className="flex items-center gap-8 w-full max-w-6xl bg-neutral-900 text-white rounded-full h-14 px-6 shadow-xl"
             style={{
               boxShadow: '0 8px 28px -10px rgba(0,0,0,0.35), 0 4px 12px -6px rgba(0,0,0,0.25)'
             }}>
          
          {/* Left: Logo Button */}
          <motion.button
            onClick={() => handleNavigation('hero')}
            className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center text-neutral-900 hover:shadow-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Accueil"
          >
            <Home size={18} />
          </motion.button>

          {/* Middle: Navigation Links (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-neutral-50 hover:text-white hover:underline'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-violet-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: 32 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Admin Link */}
            <motion.a
              href="/admin"
              className="text-sm text-neutral-300 hover:text-white transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 rounded"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              admin
            </motion.a>

            {/* Collaborer CTA */}
            <motion.button
              onClick={() => handleNavigation('contact')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-neutral-900 rounded-full font-medium text-sm hover:shadow-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Collaborer</span>
              <ArrowRight size={14} />
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 rounded"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? 'close' : 'menu'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu Content */}
            <motion.div
              className="fixed top-20 left-4 right-4 z-40 md:hidden"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.3 }}
            >
              <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-xl">
                <div className="space-y-3">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 ${
                          isActive
                            ? 'bg-white/10 text-white'
                            : 'text-neutral-200 hover:bg-white/5'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                        {isActive && <ArrowRight size={16} className="ml-auto" />}
                      </motion.button>
                    );
                  })}
                  
                  {/* Mobile CTA */}
                  <motion.button
                    onClick={() => {
                      handleNavigation('contact');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-neutral-900 rounded-xl font-medium mt-4 hover:shadow-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Collaborer</span>
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NewNavbar;