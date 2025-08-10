export class ApiClient {
  baseUrl: string;

  constructor() {
    // Compatible Vite (import.meta.env) uniquement côté navigateur
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) {
      this.baseUrl = import.meta.env.VITE_API_URL;
    } else {
      // process.env n'existe pas dans le navigateur, donc fallback direct
      this.baseUrl = "http://localhost:3000";
    }
  }

  async request(path: string, options?: RequestInit) {
    const res = await fetch(`${this.baseUrl}${path}`, options);
    return await res.json();
  }

  async getAllPosts() {
    return this.request("/posts");
  }

  async getAllProjects() {
    return this.request("/projects");
  }
}