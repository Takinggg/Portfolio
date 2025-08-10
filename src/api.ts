// Unified API client (legacy replacement) with offline fallback for posts & projects
// Auto-detects environment and configures API URL accordingly

// NOTE: This file coexiste avec src/lib/api.ts. Idéalement fusionner plus tard.

type BaseEntity = {
  id: string;
  createdAt: string;
  [k: string]: unknown;
};

export type Project = BaseEntity & {
  title: string;
  description?: string;
};

export type Post = BaseEntity & {
  title: string;
  content?: string;
  excerpt?: string;
};

const getApiBaseUrl = (): string => {
  // Check if we're in development (localhost)
  const isDevelopment = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.startsWith('192.168.'));
  
  // Environment variable takes priority (standardized to VITE_API_BASE_URL)
  const envApiUrl = (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.VITE_API_BASE_URL) ||
                   (typeof process !== 'undefined' && (process as { env?: Record<string, string> }).env?.REACT_APP_API_BASE_URL);
  
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Auto-detect based on environment
  return isDevelopment 
    ? 'http://localhost:3001/api'
    : 'https://portfolio-backend-latest.onrender.com/api';
};

const BASE_URL: string = getApiBaseUrl();

const LS_PROJECTS = 'offline_projects';
const LS_POSTS = 'offline_posts';

function loadLocal<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export class ApiClient {
  private async rawFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {})
      }
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const body = isJson ? await res.json() : null;

    if (!res.ok) {
      const message =
        (body && (body.error?.message || body.message)) ||
        `Request failed (${res.status})`;
      throw new Error(message);
    }
    return (body?.data ?? body) as T;
  }

  // -------- Projects --------
  async getAllProjects(): Promise<Project[]> {
    try {
      const data = await this.rawFetch<Project[]>('/projects');
      saveLocal(LS_PROJECTS, data);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error && /Failed to fetch|NetworkError|TypeError/.test(err.message)) {
        return loadLocal<Project>(LS_PROJECTS);
      }
      throw err;
    }
  }

  async createProject(partial: Partial<Project>): Promise<Project> {
    const payload = { ...partial };
    try {
      const data = await this.rawFetch<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const list = loadLocal<Project>(LS_PROJECTS);
      if (!list.find(p => p.id === data.id)) {
        saveLocal(LS_PROJECTS, [...list, data]);
      }
      return data;
    } catch (err: unknown) {
      if (err instanceof Error && /Failed to fetch|NetworkError|TypeError/.test(err.message)) {
        const list = loadLocal<Project>(LS_PROJECTS);
        const offline: Project = {
          id: genId('proj'),
          title: partial.title || 'Sans titre',
          description: partial.description || '',
          createdAt: new Date().toISOString(),
          ...partial
        } as Project;
        saveLocal(LS_PROJECTS, [...list, offline]);
        return offline;
      }
      throw err;
    }
  }

  // -------- Posts --------
  async getAllPosts(): Promise<Post[]> {
    try {
      const data = await this.rawFetch<Post[]>('/posts');
      saveLocal(LS_POSTS, data);
      return data;
    } catch (err: any) {
      if (/Failed to fetch|NetworkError|TypeError/.test(err?.message)) {
        return loadLocal<Post>(LS_POSTS);
      }
      throw err;
    }
  }

  async createPost(partial: Partial<Post>): Promise<Post> {
    const payload = { ...partial };
    try {
      const data = await this.rawFetch<Post>('/posts', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const list = loadLocal<Post>(LS_POSTS);
      if (!list.find(p => p.id === data.id)) {
        saveLocal(LS_POSTS, [...list, data]);
      }
      return data;
    } catch (err: any) {
      if (/Failed to fetch|NetworkError|TypeError/.test(err?.message)) {
        const list = loadLocal<Post>(LS_POSTS);
        const offline: Post = {
          id: genId('post'),
          title: partial.title || 'Nouvel article',
          content: partial.content || '',
          excerpt: partial.excerpt || '',
          createdAt: new Date().toISOString(),
          ...partial
        } as Post;
        saveLocal(LS_POSTS, [...list, offline]);
        return offline;
      }
      throw err;
    }
  }
}

// Export instance (legacy style)
export const legacyApiClient = new ApiClient();