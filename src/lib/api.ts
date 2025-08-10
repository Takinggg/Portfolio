// API client for communicating with the backend server
const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T | null; error: Error | null }> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Request failed');
      }

      return { data: result.data || result, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  // Auth methods
  async signIn(username: string, password: string) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  // Blog methods
  async getAllPosts(filters?: {
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    return this.request(`/blog/posts${queryString ? `?${queryString}` : ''}`);
  }

  async getPostBySlug(slug: string) {
    return this.request(`/blog/posts/${slug}`);
  }

  async createPost(post: any) {
    return this.request('/blog/posts', {
      method: 'POST',
      body: JSON.stringify(post)
    });
  }

  async updatePost(id: string, updates: any) {
    return this.request(`/blog/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deletePost(id: string) {
    return this.request(`/blog/posts/${id}`, {
      method: 'DELETE'
    });
  }

  // Project methods
  async getAllProjects(filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    return this.request(`/projects${queryString ? `?${queryString}` : ''}`);
  }

  async getProjectById(id: string) {
    return this.request(`/projects/${id}`);
  }

  async createProject(project: any) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
  }

  async updateProject(id: string, updates: any) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // Contact methods
  async submitMessage(messageData: any) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  async getAllMessages(filters?: {
    is_read?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.is_read !== undefined) params.append('is_read', filters.is_read.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    return this.request(`/contact/messages${queryString ? `?${queryString}` : ''}`);
  }

  async updateMessageStatus(id: string, is_read: boolean) {
    return this.request(`/contact/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_read })
    });
  }

  async deleteMessage(id: string) {
    return this.request(`/contact/messages/${id}`, {
      method: 'DELETE'
    });
  }

  async getUnreadCount() {
    return this.request('/contact/unread-count');
  }
}

export const apiClient = new ApiClient();

// Service objects that match the original database interface
export const blogService = {
  getAllPosts: (filters?: any) => apiClient.getAllPosts(filters),
  getPostBySlug: (slug: string) => apiClient.getPostBySlug(slug),
  createPost: (post: any) => apiClient.createPost(post),
  updatePost: (id: string, updates: any) => apiClient.updatePost(id, updates),
  deletePost: (id: string) => apiClient.deletePost(id),
  searchPosts: async (query: string) => {
    // For now, we'll get all posts and filter client-side
    // In a real app, you'd implement server-side search
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
        return { user: null, error: new Error('Token expired') };
      }
    } catch (err) {
      localStorage.removeItem('auth_token');
      return { user: null, error: new Error('Invalid token') };
    }
  }
};

// Utility functions
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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};