import { ApiClient } from "../api";

const api = new ApiClient();

export async function fetchPosts() {
  try {
    return await api.getAllPosts();
  } catch (err) {
    alert("Impossible de récupérer les posts. Vérifie la connexion à l’API.");
    return [];
  }
}
