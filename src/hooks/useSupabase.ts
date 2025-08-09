import { useState, useEffect, useMemo } from 'react';
import { supabase, BlogPost, Project, isSupabaseAvailable } from '../lib/supabase';
import { blogPosts as mockBlogPosts } from '../data/blogPosts';

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

    // Use mock data if Supabase is not available
    if (!isSupabaseAvailable()) {
      try {
        let filteredData = mockBlogPosts.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          published_at: post.publishedAt,
          updated_at: post.updatedAt,
          featured_image: post.featuredImage,
          tags: post.tags,
          category: post.category,
          read_time: post.readTime,
          featured: post.featured,
          created_at: post.publishedAt
        }));

        if (filters?.category) {
          filteredData = filteredData.filter(post => post.category === filters.category);
        }

        if (filters?.featured !== undefined) {
          filteredData = filteredData.filter(post => post.featured === filters.featured);
        }

        if (filters?.limit) {
          filteredData = filteredData.slice(0, filters.limit);
        }

        setPosts(filteredData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;

      let filteredData = data || [];

      if (filters?.category) {
        filteredData = filteredData.filter(post => post.category === filters.category);
      }

      if (filters?.featured !== undefined) {
        filteredData = filteredData.filter(post => post.featured === filters.featured);
      }

      if (filters?.limit) {
        filteredData = filteredData.slice(0, filters.limit);
      }

      setPosts(filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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

    // Use empty array if Supabase is not available
    if (!isSupabaseAvailable()) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let filteredData = data || [];

      if (filters?.category) {
        filteredData = filteredData.filter(project => project.category === filters.category);
      }

      if (filters?.status) {
        filteredData = filteredData.filter(project => project.status === filters.status);
      }

      if (filters?.featured !== undefined) {
        filteredData = filteredData.filter(project => project.featured === filters.featured);
      }

      if (filters?.limit) {
        filteredData = filteredData.slice(0, filters.limit);
      }

      setProjects(filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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

    // Use mock data if Supabase is not available
    if (!isSupabaseAvailable()) {
      try {
        const mockPost = mockBlogPosts.find(p => p.slug === slug);
        if (mockPost) {
          setPost({
            id: mockPost.id,
            title: mockPost.title,
            slug: mockPost.slug,
            excerpt: mockPost.excerpt,
            content: mockPost.content,
            author: mockPost.author,
            published_at: mockPost.publishedAt,
            updated_at: mockPost.updatedAt,
            featured_image: mockPost.featuredImage,
            tags: mockPost.tags,
            category: mockPost.category,
            read_time: mockPost.readTime,
            featured: mockPost.featured,
            created_at: mockPost.publishedAt
          });
        } else {
          setError('Article non trouvé');
        }
      } catch (err) {
        setError('Erreur lors du chargement de l\'article');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Post not found');
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

    // Return error if Supabase is not available
    if (!isSupabaseAvailable()) {
      setError('Projet non trouvé');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Project not found');
    } finally {
      setLoading(false);
    }
  };

  return { project, loading, error, refetch: fetchProject };
};