// Types de base (ajuste selon tes besoins réels)
export interface BlogPost {
  id: number | string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Project {
  id: number | string;
  name: string;
  description: string;
  url?: string;
  createdAt: string;
}

// Stockage en mémoire (remplacer plus tard par une vraie DB / SQLite)
interface InternalDB {
  blogPosts: BlogPost[];
  projects: Project[];
}

let db: InternalDB | null = null;

export function initializeDatabase() {
  if (!db) {
    const now = new Date().toISOString();
    db = {
      blogPosts: [
        {
          id: 1,
          title: "Article de démonstration",
          content: "Ceci est un contenu de test.",
          createdAt: now
        }
      ],
      projects: [
        {
          id: 1,
          name: "Projet Démo",
          description: "Projet d'exemple (remplace par de vraies données).",
          url: "https://example.com",
          createdAt: now
        }
      ]
    };
  }
  return db;
}

// Initialise immédiatement (facilite l'accès direct sans appel explicite)
initializeDatabase();

export function getDatabase() {
  return db;
}

// Helper pour homogénéiser les retours
function wrap<T>(data: T) {
  return { data };
}

// Service blog attendu par les hooks
export const blogService = {
  async getAllPosts() {
    const database = getDatabase();
    return wrap(database ? database.blogPosts : []);
  },
  async getPostById(id: number | string) {
    const database = getDatabase();
    const post =
      database?.blogPosts.find(p => String(p.id) === String(id)) || null;
    return wrap(post);
  }
};

// Service projet attendu par les hooks
export const projectService = {
  async getAllProjects() {
    const database = getDatabase();
    return wrap(database ? database.projects : []);
  },
  async getProjectById(id: number | string) {
    const database = getDatabase();
    const project =
      database?.projects.find(p => String(p.id) === String(id)) || null;
    return wrap(project);
  }
};

// Export brut si d'autres modules y accèdent directement
export { db };