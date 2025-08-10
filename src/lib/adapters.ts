// Data adapters to normalize objects between different data sources
// Ensures consistent data structure regardless of source (API, mock, etc.)

// Normalized Project interface (combines all possible fields from different sources)
export interface NormalizedProject {
  id: number | string;
  title: string;
  category: string;
  description: string;
  long_description?: string;
  images: string[];
  technologies: string[];
  featured?: boolean;
  createdAt: string;
  // Extended fields from API/admin
  status?: 'in-progress' | 'completed' | 'archived';
  start_date?: string;
  end_date?: string;
  client?: string;
  budget?: string;
  github_url?: string;
  live_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Normalized BlogPost interface
export interface NormalizedBlogPost {
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

/**
 * Adapts a project object from any source to a normalized format
 * Ensures all arrays are properly initialized and handles missing fields
 */
export function adaptProject(project: any): NormalizedProject | null {
  if (!project || typeof project !== 'object') {
    return null;
  }

  // Ensure required fields exist
  if (!project.title || !project.category || !project.description) {
    console.warn('adaptProject: Missing required fields', project);
    return null;
  }

  const adapted: NormalizedProject = {
    id: project.id || String(Date.now()),
    title: String(project.title || ''),
    category: String(project.category || 'web'),
    description: String(project.description || ''),
    long_description: project.long_description || project.longDescription || '',
    
    // Ensure arrays are always arrays
    images: Array.isArray(project.images) ? project.images : [],
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    
    // Boolean with fallback
    featured: Boolean(project.featured),
    
    // Handle date fields - normalize to createdAt format
    createdAt: project.createdAt || project.created_at || new Date().toISOString(),
    
    // Extended fields (optional)
    status: project.status || undefined,
    start_date: project.start_date || project.startDate || undefined,
    end_date: project.end_date || project.endDate || undefined,
    client: project.client || undefined,
    budget: project.budget || undefined,
    github_url: project.github_url || project.githubUrl || undefined,
    live_url: project.live_url || project.liveUrl || undefined,
    created_at: project.created_at || undefined,
    updated_at: project.updated_at || undefined,
  };

  return adapted;
}

/**
 * Adapts a blog post object from any source to a normalized format
 * Ensures all arrays are properly initialized and handles missing fields
 */
export function adaptPost(post: any): NormalizedBlogPost | null {
  if (!post || typeof post !== 'object') {
    return null;
  }

  // Ensure required fields exist
  if (!post.title || !post.slug || !post.content) {
    console.warn('adaptPost: Missing required fields', post);
    return null;
  }

  const adapted: NormalizedBlogPost = {
    id: post.id || String(Date.now()),
    title: String(post.title || ''),
    slug: String(post.slug || ''),
    excerpt: String(post.excerpt || ''),
    content: String(post.content || ''),
    featured_image: String(post.featured_image || post.featuredImage || ''),
    read_time: Number(post.read_time || post.readTime || 5),
    
    // Ensure arrays are always arrays
    tags: Array.isArray(post.tags) ? post.tags : [],
    
    category: String(post.category || ''),
    published_at: post.published_at || post.publishedAt || new Date().toISOString(),
    author: String(post.author || 'Anonymous'),
    
    // Boolean with fallback
    featured: Boolean(post.featured),
  };

  return adapted;
}

/**
 * Filters out null/undefined items from an array and applies adapter
 * Useful for cleaning up arrays from API responses
 */
export function adaptProjectArray(projects: any[]): NormalizedProject[] {
  if (!Array.isArray(projects)) {
    return [];
  }
  
  return projects
    .map(adaptProject)
    .filter((project): project is NormalizedProject => project !== null);
}

/**
 * Filters out null/undefined items from an array and applies adapter
 * Useful for cleaning up arrays from API responses
 */
export function adaptPostArray(posts: any[]): NormalizedBlogPost[] {
  if (!Array.isArray(posts)) {
    return [];
  }
  
  return posts
    .map(adaptPost)
    .filter((post): post is NormalizedBlogPost => post !== null);
}