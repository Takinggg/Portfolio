import React, { useState } from 'react';
import AdminLogin from './components/admin/SimpleAdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import NewNavbar from './components/NewNavbar';
import Hero from './components/Hero';
import AboutSection from './components/sections/AboutSection';
import BlogSection from './components/BlogSection';
import BlogPage from './components/BlogPage';
import BlogPost from './components/BlogPost';
import ProjectDetail from './components/ProjectDetail';
import ProjectsPage from './components/ProjectsPage';
import Projects from './components/Projects';
import Footer from './components/Footer';
import Contact from './components/Contact';
import { SEOHead } from './components/seo';
// CustomCursor removed - keeping magnetic effects only
// import { CustomCursor } from './components/ui/CustomCursor';
import { ScrollProgress } from './components/ui/ScrollProgress';
import { EnhancedParticleSystem } from './components/ui/liquid-glass';
import { MobileFabMenu } from './components/navigation/MobileFabMenu';
import { ADMIN_CONFIG } from './config';

type PageType = 'home' | 'blog' | 'post' | 'projects' | 'project';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [currentPostSlug, setCurrentPostSlug] = useState<string>('');
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if we're on admin route
  React.useEffect(() => {
    const checkAdminRoute = () => {
      if (window.location.pathname === '/admin') {
        setIsAdminMode(true);
        // Check if already logged in
        if (localStorage.getItem('admin_logged_in') === 'true') {
          setIsLoggedIn(true);
        }
      }
    };
    
    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    
    return () => window.removeEventListener('popstate', checkAdminRoute);
  }, []);

  const navigateToHome = () => {
    setCurrentPage('home');
    setCurrentPostSlug('');
    setCurrentProjectId('');
  };

  const navigateToBlog = () => {
    setCurrentPage('blog');
    setCurrentPostSlug('');
    setCurrentProjectId('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProjects = () => {
    setCurrentPage('projects');
    setCurrentPostSlug('');
    setCurrentProjectId('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPost = (slug: string) => {
    setCurrentPostSlug(slug);
    setCurrentProjectId('');
    setCurrentPage('post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    setCurrentPostSlug('');
    setCurrentPage('project');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSection = (sectionId: string) => {
    if (sectionId === 'projects') {
      navigateToProjects();
    } else if (sectionId === 'blog') {
      navigateToBlog();
    } else if (currentPage !== 'home') {
      setCurrentPage('home');
      // Attendre que la page home soit rendue avant de scroller
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleAdminLogin = (credentials: { username: string; password: string }) => {
    // Use environment variables for admin authentication
    // TODO: Replace with secure JWT-based authentication
    if (credentials.username === ADMIN_CONFIG.username && 
        credentials.password === ADMIN_CONFIG.password) {
      setIsLoggedIn(true);
      localStorage.setItem('admin_logged_in', 'true');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsLoggedIn(false);
    setIsAdminMode(false);
    localStorage.removeItem('admin_logged_in');
    window.history.pushState({}, '', '/');
    setCurrentPage('home');
  };

  // Admin routes
  if (isAdminMode) {
    if (!isLoggedIn) {
      return <AdminLogin onLogin={handleAdminLogin} />;
    }
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  if (currentPage === 'blog') {
    return (
      <>
        <SEOHead 
          title="Articles" 
          description="Articles sur le développement web, design et technologies"
          url="/blog"
        />
        <BlogPage 
          onNavigateHome={navigateToHome}
          onNavigateToPost={navigateToPost}
          onNavigateToProjects={navigateToProjects}
        />
      </>
    );
  }

  if (currentPage === 'projects') {
    return (
      <>
        <SEOHead 
          title="Projets" 
          description="Portfolio de projets web et applications développées"
          url="/projects"
        />
        <ProjectsPage 
          onNavigateHome={navigateToHome}
          onNavigateToBlog={navigateToBlog}
          onNavigateToProject={navigateToProject}
        />
      </>
    );
  }

  if (currentPage === 'project' && currentProjectId) {
    return (
      <>
        <SEOHead 
          title={`Projet ${currentProjectId}`}
          description="Détail du projet - technologies, objectifs et réalisations"
          url={`/project/${currentProjectId}`}
        />
        <ProjectDetail 
          projectId={currentProjectId}
          onBack={navigateToProjects}
          onNavigateHome={navigateToHome}
          onNavigateToBlog={navigateToBlog}
        />
      </>
    );
  }

  if (currentPage === 'post' && currentPostSlug) {
    return (
      <>
        <SEOHead 
          title={`Article: ${currentPostSlug}`}
          description="Article de blog sur le développement web et les technologies"
          type="article"
          url={`/blog/${currentPostSlug}`}
        />
        <BlogPost 
          slug={currentPostSlug}
          onBack={navigateToBlog}
          onNavigateHome={navigateToHome}
          onNavigateToProjects={navigateToProjects}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen relative bg-white text-gray-900 transition-colors">
      {/* Premium UI Components */}
      {/* CustomCursor removed - keeping only magnetic effects */}
      <ScrollProgress />
      <EnhancedParticleSystem variant="premium" particleCount={60} />
      
      <SEOHead 
        title="Accueil"
        description="Portfolio professionnel - Développeur web fullstack et designer"
      />
      
      {/* Navigation with semantic header */}
      <header role="banner">
        <NewNavbar 
          onNavigateToSection={navigateToSection}
          onNavigateToBlog={navigateToBlog}
          onNavigateToProjects={navigateToProjects}
          currentPage={currentPage}
          isAuthenticated={isLoggedIn}
        />
      </header>

      {/* Right Sidebar - Disabled for WHITE theme */}
      {/* Mobile FAB Menu - Only on landing page */}
      {currentPage === 'home' && (
        <MobileFabMenu
          onNavigateToSection={navigateToSection}
          onNavigateToBlog={navigateToBlog}
          onNavigateToProjects={navigateToProjects}
          activeSection={
            // Determine active section based on scroll position or current context
            (() => {
              if (currentProjectId) return 'projects';
              if (currentPostSlug) return 'blog';
              return 'hero'; // Default to hero for home page
            })()
          }
        />
      )}

      {/* Main content area */}
      <main role="main">
        <Hero />
        <AboutSection onNavigateToSection={navigateToSection} />
        <Projects onNavigateToProject={navigateToProject} />
        <BlogSection onNavigateToBlog={navigateToBlog} onNavigateToPost={navigateToPost} />
        <Contact />
      </main>

      {/* Footer */}
      <footer role="contentinfo">
        <Footer />
      </footer>
    </div>
  );
}

export default App;