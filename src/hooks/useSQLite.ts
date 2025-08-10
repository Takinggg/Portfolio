import { useEffect, useState } from "react";
import { blogService, projectService } from "../lib/database";

// Récupère tous les posts du blog
export function useBlogPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const result = await blogService.getAllPosts();
        setPosts(result.data || []);
        setError(null);
      } catch (err) {
        setError(err);
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
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setPost(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await blogService.getPostById(id);
        setPost(result.data || null);
        setError(null);
      } catch (err) {
        setError(err);
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
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const result = await projectService.getAllProjects();
        setProjects(result.data || []);
        setError(null);
      } catch (err) {
        setError(err);
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
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setProject(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await projectService.getProjectById(id);
        setProject(result.data || null);
        setError(null);
      } catch (err) {
        setError(err);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return { project, loading, error };
}