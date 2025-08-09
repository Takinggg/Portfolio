import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['hero', 'about', 'projects', 'contact'];
      const scrollPosition = window.scrollY + 100;
      
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
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'hero', label: 'Accueil' },
    { id: 'about', label: 'À propos' },
    { id: 'projects', label: 'Projets' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <>
      {/* Floating Navigation */}
      <nav className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-2xl border border-gray-200/50 shadow-2xl shadow-black/10' 
          : 'bg-white/60 backdrop-blur-xl border border-white/20'
      } rounded-full px-8 py-4`}>
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => scrollToSection('hero')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="text-white" size={16} />
            </div>
            <span className="font-bold text-gray-900 text-lg">MF</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeSection === item.id
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {activeSection === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-2xl shadow-2xl p-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gray-200/50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ 
            width: `${Math.min(100, (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)}%` 
          }}
        />
      </div>
    </>
  );
};

export default Navigation;