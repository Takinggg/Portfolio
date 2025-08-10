import { useEffect, useState } from "react";
import { ApiClient } from "../api";

const api = new ApiClient();

// Récupère tous les posts du blog
export function useBlogPosts() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    api.getAllPosts().then(setPosts);
  }, []);
  return posts;
}

// Récupère un post du blog par son id
export function useBlogPost(id: number | string) {
  const [post, setPost] = useState(null);
  useEffect(() => {
    if (id) {
      api.request(`/posts/${id}`).then(setPost);
    }
  }, [id]);
  return post;
}

// Récupère tous les projets
export function useProjects() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    api.request("/projects").then(setProjects);
  }, []);
  return projects;
}

// Récupère un projet par son id
export function useProject(id: number | string) {
  const [project, setProject] = useState(null);
  useEffect(() => {
    if (id) {
      api.request(`/projects/${id}`).then(setProject);
    }
  }, [id]);
  return project;
}