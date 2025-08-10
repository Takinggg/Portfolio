export class ApiClient {
  baseUrl: string;

  constructor() {
    // Compatible Vite et React (fallback sur localhost si non défini)
    this.baseUrl =
      typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
        ? import.meta.env.VITE_API_URL
        : (process.env?.REACT_APP_API_URL || "http://localhost:3000");
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