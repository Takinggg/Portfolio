import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Create Supabase client only if configured
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check if Supabase is available
export const isSupabaseAvailable = () => isSupabaseConfigured && supabase !== null;

// Database Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
  updated_at?: string;
  featured_image: string;
  tags: string[];
  category: string;
  read_time: number;
  featured: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  long_description: string;
  technologies: string[];
  category: string;
  status: 'in-progress' | 'completed' | 'archived';
  start_date: string;
  end_date?: string;
  client?: string;
  budget?: string;
  images: string[];
  featured: boolean;
  github_url?: string;
  live_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  budget?: string;
  timeline?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Blog Post Operations
export const blogService = {
  // Get all blog posts with optional filtering
  async getAllPosts(filters?: {
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    console.log('=== blogService.getAllPosts called ===');
    console.log('Filters:', filters);
    console.log('Supabase available:', isSupabaseAvailable());
    
    if (!isSupabaseAvailable()) {
      console.log('Supabase not available, returning error');
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      console.log('Creating Supabase query...');
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });
      
      console.log('Base query created');

      if (filters?.category) {
        query = query.eq('category', filters.category);
        console.log('Added category filter');
      }

      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured);
        console.log('Added featured filter');
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
        console.log('Added limit');
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
        console.log('Added offset range');
      }

      console.log('Executing query...');
      const { data, error } = await query;
      
      console.log('blogService query result:');
      console.log('- Data:', data);
      console.log('- Error:', error);
      console.log('- Data length:', data?.length || 0);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return { data: null, error };
    }
  },

  // Get a single blog post by slug
  async getPostBySlug(slug: string) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return { data: null, error };
    }
  },

  // Create a new blog post
  async createPost(post: Omit<BlogPost, 'id' | 'created_at'>) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([post])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating blog post:', error);
      return { data: null, error };
    }
  },

  // Update a blog post
  async updatePost(id: string, updates: Partial<BlogPost>) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating blog post:', error);
      return { data: null, error };
    }
  },

  // Delete a blog post
  async deletePost(id: string) {
    if (!isSupabaseAvailable()) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return { error };
    }
  },

  // Search blog posts
  async searchPosts(query: string) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error searching blog posts:', error);
      return { data: null, error };
    }
  },

  // Get featured posts
  async getFeaturedPosts(limit: number = 3) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      return { data: null, error };
    }
  }
};

// Project Operations
export const projectService = {
  // Get all projects with optional filtering
  async getAllProjects(filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { data: null, error };
    }
  },

  // Get a single project by ID
  async getProjectById(id: string) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching project:', error);
      return { data: null, error };
    }
  },

  // Create a new project
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating project:', error);
      return { data: null, error };
    }
  },

  // Update a project
  async updateProject(id: string, updates: Partial<Project>) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating project:', error);
      return { data: null, error };
    }
  },

  // Delete a project
  async deleteProject(id: string) {
    if (!isSupabaseAvailable()) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { error };
    }
  },

  // Get featured projects
  async getFeaturedProjects(limit: number = 6) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      return { data: null, error };
    }
  }
};

// Contact Message Operations
export const contactService = {
  // Submit a new contact message
  async submitMessage(messageData: Omit<ContactMessage, 'id' | 'is_read' | 'created_at' | 'updated_at'>) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      // Insert message into database
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      // Send email notification
      try {
        const emailResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });

        if (!emailResponse.ok) {
          console.warn('Email notification failed, but message was saved');
        }
      } catch (emailError) {
        console.warn('Email notification error:', emailError);
        // Don't fail the entire operation if email fails
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error submitting contact message:', error);
      return { data: null, error };
    }
  },

  // Get all contact messages (admin only)
  async getAllMessages(filters?: {
    is_read?: boolean;
    limit?: number;
    offset?: number;
  }) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      return { data: null, error };
    }
  },

  // Mark message as read/unread
  async updateMessageStatus(id: string, is_read: boolean) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .update({ is_read, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating message status:', error);
      return { data: null, error };
    }
  },

  // Delete a contact message
  async deleteMessage(id: string) {
    if (!isSupabaseAvailable()) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting contact message:', error);
      return { error };
    }
  },

  // Get unread messages count
  async getUnreadCount() {
    if (!isSupabaseAvailable()) {
      return { count: 0, error: new Error('Supabase is not configured.') };
    }

    try {
      const { count, error } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error('Error getting unread count:', error);
      return { count: 0, error };
    }
  }
};

// Authentication helpers (if needed)
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    if (!isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  },

  // Sign out
  async signOut() {
    if (!isSupabaseAvailable()) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  },

  // Get current user
  async getCurrentUser() {
    if (!isSupabaseAvailable()) {
      return { user: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { user: null, error };
    }
  }
};

// Utility functions
export const utils = {
  // Generate a slug from a title
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },

  // Calculate reading time
  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  },

  // Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};