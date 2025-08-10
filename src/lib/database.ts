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
  status?: string;
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
          featured_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InV4IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMzY3M2RjIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzZkMjhlZCIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3V4KSIgLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNPTkNFUFRJT04gVVg8L3RleHQ+PC9zdmc+",
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
          featured_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InVpIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMTBiOTgxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzA2YjZkNCIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3VpKSIgLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRFTkRBTkNFUyBVSTwvdGV4dD48L3N2Zz4=",
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
          featured_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImExMXkiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4YjVjZjYiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZWM0ODk5IiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYTExeSkiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BQ0NFU1NJQklMSVQ8L3RleHQ+PC9zdmc+",
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
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImRhc2giIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzNjczZGMiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM2NmYxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZGFzaCkiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EQVNIQk9BUkQ8L3RleHQ+PC9zdmc+",
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImRhc2gyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM2NmYxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM2NzNkYyIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2Rhc2gyKSIgLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFOQUxZVElDUzwvdGV4dD48L3N2Zz4="
          ],
          technologies: ["React", "TypeScript", "Tailwind", "D3.js"],
          featured: true,
          status: "completed",
          createdAt: now
        },
        {
          id: 2,
          title: "App Mobile Fitness",
          category: "mobile",
          description: "Application de suivi d'entraînement et nutrition.",
          images: ["data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Im1vYmlsZWZpdCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzEwYjk4MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNmI2ZDQiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNtb2JpbGVmaXQpIiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RklUTkVTUyBBUFA8L3RleHQ+PC9zdmc+"],
          technologies: ["React Native", "Expo", "Zustand"],
          status: "in-progress",
          createdAt: now
        },
        {
          id: 3,
          title: "Identité Visuelle Startup",
          category: "branding",
          description: "Création logo, palette, guidelines.",
          images: ["data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJyYW5kaW5nc3R1cCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzhiNWNmNiIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlYzQ4OTkiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNicmFuZGluZ3N0dXApIiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QlJBTkRJTkc8L3RleHQ+PC9zdmc+"],
          technologies: ["Figma", "Illustrator"],
          status: "completed",
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