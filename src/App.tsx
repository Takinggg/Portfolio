import React, { useState } from 'react';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import Navigation from './components/Navigation';
import RightSidebar from './components/RightSidebar';
import Hero from './components/Hero';
import About from './components/About';
import BlogSection from './components/BlogSection';
import BlogPage from './components/BlogPage';
import BlogPost from './components/BlogPost';
import ProjectDetail from './components/ProjectDetail';
import ProjectsPage from './components/ProjectsPage';
import Projects from './components/Projects';
import Footer from './components/Footer';
import Contact from './components/Contact';

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
    // Mock authentication - replace with real authentication
    if (credentials.username === 'admin' && credentials.password === 'password') {
      setIsLoggedIn(true);
    }
  };

  const handleAdminLogout = () => {
    setIsLoggedIn(false);
    setIsAdminMode(false);
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
      <BlogPage 
        onNavigateHome={navigateToHome}
        onNavigateToPost={navigateToPost}
        onNavigateToProjects={navigateToProjects}
      />
    );
  }

  if (currentPage === 'projects') {
    return (
      <ProjectsPage 
        onNavigateHome={navigateToHome}
        onNavigateToBlog={navigateToBlog}
        onNavigateToProject={navigateToProject}
      />
    );
  }

  if (currentPage === 'project' && currentProjectId) {
    return (
      <ProjectDetail 
        projectId={currentProjectId}
        onBack={navigateToProjects}
        onNavigateHome={navigateToHome}
        onNavigateToBlog={navigateToBlog}
      />
    );
  }

  if (currentPage === 'post' && currentPostSlug) {
    return (
      <BlogPost 
        slug={currentPostSlug}
        onBack={navigateToBlog}
        onNavigateHome={navigateToHome}
        onNavigateToProjects={navigateToProjects}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation 
        onNavigateToSection={navigateToSection}
        onNavigateToBlog={navigateToBlog}
        onNavigateToProjects={navigateToProjects}
        currentPage={currentPage}
      />
      {/* Right Sidebar - Only on landing page */}
      {currentPage === 'home' && (
        <RightSidebar onNavigateToSection={navigateToSection} />
      )}
      <Hero />
      <About />
      <Projects />
      <BlogSection onNavigateToBlog={navigateToBlog} />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;