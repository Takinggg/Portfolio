// API client for communicating with the backend server
// Added offline fallback for authentication and immediate demo credentials handling to avoid network errors.

// Resolve API base URL from Vite env if available; fall back to localhost.
// NOTE: Previous version incorrectly used `typeof import !== 'undefined'` which is a syntax error because
// `import` is a reserved keyword (dynamic import expects parentheses). Correct usage is `typeof import.meta !== 'undefined'`.
const API_BASE_URL: string = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || 'http://localhost:3001/api';

interface ApiResult<T> { data: T | null; error: Error | null }

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
    if (!API_BASE_URL) {
      return { data: null, error: new Error('API non configurée') };
    }
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const result = isJson ? await response.json() : null;
      if (!response.ok) {
        const message = (result && (result.error?.message || result.message)) || `Request failed (${response.status})`;
        throw new Error(message);
      }
      return { data: (result && (result.data || result)) || null, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  // Auth methods with deterministic demo shortcut
  async signIn(username: string, password: string): Promise<ApiResult<{ token: string; user: any }>> {
    // Demo credentials shortcut FIRST (avoid any network call and thus net::ERR_FAILED in dev without backend)
    if (username === 'admin' && password === 'password') {
      const payload = { userId: 'demo-admin', username, exp: Math.floor(Date.now() / 1000) + 60 * 60 };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      return { data: { token, user: { id: payload.userId, username } }, error: null };
    }

    // If no API base URL configured, return clear error for non-demo creds
    if (!API_BASE_URL) {
      return { data: null, error: new Error('Aucun backend configuré pour ces identifiants') };
    }

    // Try network for other credentials
    const networkResult = await this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    // If network failed with fetch-level error, give clearer message
    if (networkResult.error && /Failed to fetch|NetworkError|TypeError/i.test(networkResult.error.message)) {
      return { data: null, error: new Error('Serveur injoignable. Réessayez plus tard.') };
    }
    return networkResult;
  }

  // Blog methods
  async getAllPosts(filters?: { category?: string; featured?: boolean; limit?: number; offset?: number; }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    const queryString = params.toString();
    return this.request(`/blog/posts${queryString ? `?${queryString}` : ''}`);
  }

  async getPostBySlug(slug: string) { return this.request(`/blog/posts/${slug}`); }
  async createPost(post: any) { return this.request('/blog/posts', { method: 'POST', body: JSON.stringify(post) }); }
  async updatePost(id: string, updates: any) { return this.request(`/blog/posts/${id}`, { method: 'PUT', body: JSON.stringify(updates) }); }
  async deletePost(id: string) { return this.request(`/blog/posts/${id}`, { method: 'DELETE' }); }

  // Project methods
  async getAllProjects(filters?: { category?: string; status?: string; featured?: boolean; limit?: number; offset?: number; }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    const queryString = params.toString();
    return this.request(`/projects${queryString ? `?${queryString}` : ''}`);
  }
  async getProjectById(id: string) { return this.request(`/projects/${id}`); }
  async createProject(project: any) { return this.request('/projects', { method: 'POST', body: JSON.stringify(project) }); }
  async updateProject(id: string, updates: any) { return this.request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(updates) }); }
  async deleteProject(id: string) { return this.request(`/projects/${id}`, { method: 'DELETE' }); }

  // Contact methods
  async submitMessage(messageData: any) { return this.request('/contact', { method: 'POST', body: JSON.stringify(messageData) }); }
  async getAllMessages(filters?: { is_read?: boolean; limit?: number; offset?: number; }) {
    const params = new URLSearchParams();
    if (filters?.is_read !== undefined) params.append('is_read', filters.is_read.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    const queryString = params.toString();
    return this.request(`/contact/messages${queryString ? `?${queryString}` : ''}`);
  }
  async updateMessageStatus(id: string, is_read: boolean) { return this.request(`/contact/messages/${id}`, { method: 'PUT', body: JSON.stringify({ is_read }) }); }
  async deleteMessage(id: string) { return this.request(`/contact/messages/${id}`, { method: 'DELETE' }); }
  async getUnreadCount() { return this.request('/contact/unread-count'); }
}

export const apiClient = new ApiClient();

// Service objects
export const blogService = {
  getAllPosts: (filters?: any) => apiClient.getAllPosts(filters),
  getPostBySlug: (slug: string) => apiClient.getPostBySlug(slug),
  createPost: (post: any) => apiClient.createPost(post),
  updatePost: (id: string, updates: any) => apiClient.updatePost(id, updates),
  deletePost: (id: string) => apiClient.deletePost(id),
  searchPosts: async (query: string) => {
    const { data, error } = await apiClient.getAllPosts();
    if (error || !data) return { data: null, error };
    const filtered = data.filter((post: any) =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase())
    );
    return { data: filtered, error: null };
  },
  getFeaturedPosts: (limit: number = 3) => apiClient.getAllPosts({ featured: true, limit })
};

export const projectService = {
  getAllProjects: (filters?: any) => apiClient.getAllProjects(filters),
  getProjectById: (id: string) => apiClient.getProjectById(id),
  createProject: (project: any) => apiClient.createProject(project),
  updateProject: (id: string, updates: any) => apiClient.updateProject(id, updates),
  deleteProject: (id: string) => apiClient.deleteProject(id),
  getFeaturedProjects: (limit: number = 6) => apiClient.getAllProjects({ featured: true, limit })
};

export const contactService = {
  submitMessage: (messageData: any) => apiClient.submitMessage(messageData),
  getAllMessages: (filters?: any) => apiClient.getAllMessages(filters),
  updateMessageStatus: (id: string, is_read: boolean) => apiClient.updateMessageStatus(id, is_read),
  deleteMessage: (id: string) => apiClient.deleteMessage(id),
  getUnreadCount: () => apiClient.getUnreadCount()
};

export const authService = {
  signIn: (username: string, password: string) => apiClient.signIn(username, password),
  verifyToken: async (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) {
        return { user: { id: payload.userId, username: payload.username }, error: null };
      } else {
        localStorage.removeItem('auth_token');
        return { user: null, error: new Error('Token expiré') };
      }
    } catch (err) {
      localStorage.removeItem('auth_token');
      return { user: null, error: new Error('Token invalide') };
    }
  }
};

export const utils = {
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },
  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  },
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  }
};