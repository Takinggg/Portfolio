import { useEffect, useState } from "react";
import { blogService as apiService, projectService as apiProjectService } from "../lib/api";
import { adaptPost, adaptProject, adaptPostArray, adaptProjectArray, NormalizedProject, NormalizedBlogPost } from "../lib/adapters";

// Récupère tous les posts du blog
export function useBlogPosts() {
  const [posts, setPosts] = useState<NormalizedBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try API first
        const result = await apiService.getAllPosts();
        
        if (result.error) {
          console.warn('API failed, falling back to mock data:', result.error.message);
          
          // Fallback to mock data
          const { blogService: mockService } = await import("../lib/database");
          const mockResult = await mockService.getAllPosts();
          const adaptedPosts = adaptPostArray(mockResult.data || []);
          setPosts(adaptedPosts);
        } else {
          // Use API data
          const adaptedPosts = adaptPostArray(result.data || []);
          setPosts(adaptedPosts);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err instanceof Error ? err.message : 'Error fetching posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return { posts, loading, error };
}

// Récupère un post du blog par son id
export function useBlogPost(id: number | string) {
  const [post, setPost] = useState<NormalizedBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setPost(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Try API first - note: API uses slug, mock uses id
        let result;
        try {
          result = await apiService.getPostBySlug(String(id));
        } catch (apiErr) {
          console.warn('API failed, falling back to mock data:', apiErr);
          
          // Fallback to mock data
          const { blogService: mockService } = await import("../lib/database");
          result = await mockService.getPostById(id);
        }
        
        if (result.error) {
          throw result.error;
        }
        
        const adaptedPost = adaptPost(result.data);
        setPost(adaptedPost);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err instanceof Error ? err.message : 'Error fetching post');
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  return { post, loading, error };
}

// Récupère tous les projets
export function useProjects() {
  const [projects, setProjects] = useState<NormalizedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try API first
        const result = await apiProjectService.getAllProjects();
        
        if (result.error) {
          console.warn('API failed, falling back to mock data:', result.error.message);
          
          // Fallback to mock data
          const { projectService: mockService } = await import("../lib/database");
          const mockResult = await mockService.getAllProjects();
          const adaptedProjects = adaptProjectArray(mockResult.data || []);
          setProjects(adaptedProjects);
        } else {
          // Use API data
          const adaptedProjects = adaptProjectArray(result.data || []);
          setProjects(adaptedProjects);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err.message : 'Error fetching projects');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, loading, error };
}

// Récupère un projet par son id
export function useProject(id: number | string) {
  const [project, setProject] = useState<NormalizedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setProject(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Try API first
        let result;
        try {
          result = await apiProjectService.getProjectById(String(id));
        } catch (apiErr) {
          console.warn('API failed, falling back to mock data:', apiErr);
          
          // Fallback to mock data
          const { projectService: mockService } = await import("../lib/database");
          result = await mockService.getProjectById(id);
        }
        
        if (result.error) {
          throw result.error;
        }
        
        const adaptedProject = adaptProject(result.data);
        setProject(adaptedProject);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Error fetching project');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return { project, loading, error };
}