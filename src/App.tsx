import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import BlogSection from './components/BlogSection';
import BlogPage from './components/BlogPage';
import BlogPost from './components/BlogPost';
import ProjectsPage from './components/ProjectsPage';
import Footer from './components/Footer';
import Contact from './components/Contact';
import { getPostBySlug, BlogPost as BlogPostType } from './data/blogPosts';

type PageType = 'home' | 'blog' | 'post' | 'projects';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [currentPost, setCurrentPost] = useState<BlogPostType | null>(null);

  const navigateToHome = () => {
    setCurrentPage('home');
    setCurrentPost(null);
  };

  const navigateToBlog = () => {
    setCurrentPage('blog');
    setCurrentPost(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProjects = () => {
    setCurrentPage('projects');
    setCurrentPost(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPost = (slug: string) => {
    const post = getPostBySlug(slug);
    if (post) {
      setCurrentPost(post);
      setCurrentPage('post');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToSection = (sectionId: string) => {
    if (sectionId === 'projects') {
      navigateToProjects();
      return;
    }
    
    if (currentPage !== 'home') {
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
      />
    );
  }

  if (currentPage === 'post' && currentPost) {
    return (
      <BlogPost 
        post={currentPost}
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
      <Hero />
      <About />
      <BlogSection onNavigateToBlog={navigateToBlog} />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;