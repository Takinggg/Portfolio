import { useEffect, useState } from "react";
import { blogPosts } from "../data/blogPosts";
import { caseStudies } from "../data/caseStudies";

// Define local types for normalized data
export interface NormalizedBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  featuredImage: string;
  tags: string[];
  category: string;
  readTime: number;
  featured: boolean;
}

export interface NormalizedProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  client: string;
  year: number;
  duration: string;
  role: string;
  team: string[];
  subtitle: string;
  description: string;
  challenge: string;
  solution: string;
  featuredImage: string;
  heroImage: string;
  images: string[];
}

// Convert case studies to normalized projects
const convertCaseStudyToProject = (caseStudy: any): NormalizedProject => ({
  id: caseStudy.id,
  title: caseStudy.title,
  slug: caseStudy.slug,
  category: caseStudy.category,
  client: caseStudy.client,
  year: caseStudy.year,
  duration: caseStudy.duration,
  role: caseStudy.role,
  team: caseStudy.team,
  subtitle: caseStudy.subtitle,
  description: caseStudy.description,
  challenge: caseStudy.challenge,
  solution: caseStudy.solution,
  featuredImage: caseStudy.featuredImage,
  heroImage: caseStudy.heroImage,
  images: caseStudy.images
});

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
        
        // Use local blog posts data
        setPosts(blogPosts);
      } catch (err) {
        console.error('Error loading posts:', err);
        setError(err instanceof Error ? err.message : 'Error loading posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return { posts, loading, error };
}

// Récupère un post du blog par son id ou slug
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
        
        // Find post by id or slug in local data
        const foundPost = blogPosts.find(p => p.id === String(id) || p.slug === String(id));
        
        if (!foundPost) {
          throw new Error('Post not found');
        }
        
        setPost(foundPost);
      } catch (err) {
        console.error('Error loading post:', err);
        setError(err instanceof Error ? err.message : 'Error loading post');
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
        
        // Convert case studies to normalized projects
        const normalizedProjects = caseStudies.map(convertCaseStudyToProject);
        setProjects(normalizedProjects);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError(err instanceof Error ? err.message : 'Error loading projects');
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
        
        // Find project by id in case studies
        const foundCaseStudy = caseStudies.find(cs => cs.id === String(id) || cs.slug === String(id));
        
        if (!foundCaseStudy) {
          throw new Error('Project not found');
        }
        
        const normalizedProject = convertCaseStudyToProject(foundCaseStudy);
        setProject(normalizedProject);
      } catch (err) {
        console.error('Error loading project:', err);
        setError(err instanceof Error ? err.message : 'Error loading project');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return { project, loading, error };
}