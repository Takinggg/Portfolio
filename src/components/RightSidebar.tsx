import React, { useState, useEffect } from 'react';
import { Home, User, Mail, ChevronRight, Briefcase, BookOpen } from 'lucide-react';

interface RightSidebarProps {
  onNavigateToSection: (sectionId: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ onNavigateToSection }) => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sidebar after scrolling a bit
      setIsVisible(window.scrollY > 100);
      
      // Update active section based on scroll position
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
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sidebarItems = [
    { id: 'hero', label: 'Accueil', icon: Home },
    { id: 'about', label: 'À propos', icon: User },
    { id: 'projects', label: 'Projets', icon: Briefcase },
    { id: 'blog', label: 'Blog', icon: BookOpen },
    { id: 'contact', label: 'Contact', icon: Mail }
  ];

  return (
    <div className={`fixed right-6 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-700 ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
    }`}>
      <div className="bg-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-2xl shadow-2xl p-2">
        <div className="flex flex-col gap-2">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigateToSection(item.id)}
                className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={item.label}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-xl" />
                )}
                
                <Icon 
                  size={20} 
                  className={`relative z-10 ${
                    isActive ? 'animate-pulse' : 'group-hover:scale-110'
                  } transition-transform duration-300`} 
                />
                
                {/* Tooltip */}
                <div className={`absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 whitespace-nowrap ${
                  isActive ? 'opacity-0' : ''
                }`}>
                  {item.label}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
                </div>
                
                {isActive && (
                  <ChevronRight size={16} className="relative z-10 animate-bounce" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;