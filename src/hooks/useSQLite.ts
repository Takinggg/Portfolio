import { useState, useEffect, useMemo } from 'react';
import { blogService, projectService, contactService, BlogPost, Project, ContactMessage } from '../lib/database';

// Custom hook for blog posts
export const useBlogPosts = (filters?: {
  category?: string;
  featured?: boolean;
  limit?: number;
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await blogService.getAllPosts(filters);
      
      if (error) throw error;
      
      setPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des articles');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchPosts();

  return { posts, loading, error, refetch };
};

// Custom hook for projects
export const useProjects = (filters?: {
  category?: string;
  status?: string;
  featured?: boolean;
  limit?: number;
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await projectService.getAllProjects(filters);
      
      if (error) throw error;
      
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchProjects();

  return { projects, loading, error, refetch };
};

// Custom hook for single blog post
export const useBlogPost = (slug: string) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await blogService.getPostBySlug(slug);
      
      if (error) throw error;
      
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Article non trouvé');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  return { post, loading, error, refetch: fetchPost };
};

// Custom hook for single project
export const useProject = (id: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await projectService.getProjectById(id);
      
      if (error) throw error;
      
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Projet non trouvé');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  return { project, loading, error, refetch: fetchProject };
};

// Custom hook for contact messages (admin only)
export const useContactMessages = (filters?: {
  is_read?: boolean;
  limit?: number;
}) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [filters]);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await contactService.getAllMessages(filters);
      
      if (error) throw error;
      
      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchMessages();

  return { messages, loading, error, refetch };
};

// Authentication hook
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored token
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token with backend
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      // This would typically be an API call to verify the token
      // For now, we'll decode it client-side (not secure for production)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      if (payload.exp * 1000 > Date.now()) {
        setUser({ id: payload.userId, username: payload.username });
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (err) {
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // This would be an API call in a real app
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      localStorage.setItem('auth_token', result.data.token);
      setUser(result.data.user);
      
      return { data: result.data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(error);
      return { data: null, error: new Error(error) };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return { user, loading, error, signIn, signOut };
};