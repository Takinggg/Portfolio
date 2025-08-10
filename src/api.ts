export class ApiClient {
  baseUrl: string;

  constructor() {
    // Utilise une variable d’environnement pour la prod, sinon localhost
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';
  }

  async request(path: string, options?: RequestInit) {
    const url = `${this.baseUrl}${path}`;
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return await res.json();
    } catch (err) {
      // Log explicite pour debug
      console.error('Error fetching:', err);
      throw err;
    }
  }

  async getAllPosts() {
    return this.request('/posts');
  }
}
