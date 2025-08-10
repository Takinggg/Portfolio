// Types adaptés aux composants enrichis (blog + projets)
export interface BlogPost {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  read_time: number;
  tags: string[];
  category: string;
  published_at: string;
  author: string;
  featured?: boolean;
}

export interface Project {
  id: number | string;
  title: string;
  category: string;
  description: string;
  long_description?: string;
  images: string[];
  technologies: string[];
  featured?: boolean;
  createdAt: string;
}

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
          title: "Concevoir une expérience utilisateur mémorable",
          slug: "concevoir-experience-utilisateur-memorable",
          excerpt: "Principes clés pour créer une UX qui engage et fidélise.",
          content: "Contenu de démonstration (remplacer par du markdown réel).",
          featured_image: "https://via.placeholder.com/800x400?text=UX",
          read_time: 5,
          tags: ["ux", "design", "research"],
          category: "Design",
          published_at: now,
          author: "Takinggg",
          featured: true
        },
        {
          id: 2,
          title: "Tendances UI 2025",
          slug: "tendances-ui-2025",
          excerpt: "Un tour d'horizon des styles et interactions dominants en 2025.",
          content: "Texte de démonstration sur les tendances UI...",
          featured_image: "https://via.placeholder.com/800x400?text=UI+2025",
          read_time: 4,
          tags: ["ui", "tendances", "animation"],
          category: "UI",
          published_at: now,
          author: "Takinggg",
          featured: true
        },
        {
          id: 3,
          title: "Accessibilité: quick wins",
          slug: "accessibilite-quick-wins",
          excerpt: "Améliorations rapides pour rendre une interface plus inclusive.",
          content: "Contenu accessibilité...",
          featured_image: "https://via.placeholder.com/800x400?text=A11Y",
          read_time: 6,
          tags: ["a11y", "frontend"],
          category: "Accessibilité",
          published_at: now,
          author: "Takinggg",
          featured: true
        }
      ],
      projects: [
        {
          id: 1,
          title: "Dashboard Analytics",
          category: "web",
          description: "Un tableau de bord interactif pour visualiser des KPIs.",
          long_description: "Filtres dynamiques, export PDF, mode sombre...",
          images: [
            "https://via.placeholder.com/600x400?text=Dashboard+1",
            "https://via.placeholder.com/600x400?text=Dashboard+2"
          ],
          technologies: ["React", "TypeScript", "Tailwind", "D3.js"],
          featured: true,
          createdAt: now
        },
        {
          id: 2,
          title: "App Mobile Fitness",
          category: "mobile",
          description: "Application de suivi d'entraînement et nutrition.",
          images: ["https://via.placeholder.com/600x400?text=Fitness+App"],
          technologies: ["React Native", "Expo", "Zustand"],
          createdAt: now
        },
        {
          id: 3,
          title: "Identité Visuelle Startup",
          category: "branding",
          description: "Création logo, palette, guidelines.",
          images: ["https://via.placeholder.com/600x400?text=Branding"],
          technologies: ["Figma", "Illustrator"],
          createdAt: now
        }
      ]
    };
  }
  return db;
}

initializeDatabase();

export function getDatabase() {
  return db;
}

function wrap<T>(data: T) {
  return { data };
}

export const blogService = {
  async getAllPosts() {
    return wrap(getDatabase()!.blogPosts);
  },
  async getPostById(id: number | string) {
    const post = getDatabase()!.blogPosts.find(p => String(p.id) === String(id)) || null;
    return wrap(post);
  }
};

export const projectService = {
  async getAllProjects() {
    return wrap(getDatabase()!.projects);
  },
  async getProjectById(id: number | string) {
    const project = getDatabase()!.projects.find(p => String(p.id) === String(id)) || null;
    return wrap(project);
  }
};

export { db };