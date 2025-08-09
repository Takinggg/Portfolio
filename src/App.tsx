import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import BlogSection from './components/BlogSection';
import BlogPage from './components/BlogPage';
import BlogPost from './components/BlogPost';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { getPostBySlug, BlogPost as BlogPostType } from './data/blogPosts';

type PageType = 'home' | 'blog' | 'post';

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
  };

  const navigateToPost = (slug: string) => {
    const post = getPostBySlug(slug);
    if (post) {
      setCurrentPost(post);
      setCurrentPage('post');
    }
  };

  const navigateToSection = (sectionId: string) => {
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
      />
    );
  }

  if (currentPage === 'post' && currentPost) {
    return (
      <BlogPost 
        post={currentPost}
        onBack={navigateToBlog}
        onNavigateHome={navigateToHome}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation 
        onNavigateToSection={navigateToSection}
        onNavigateToBlog={navigateToBlog}
      />
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