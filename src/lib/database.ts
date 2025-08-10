
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';

// Database connection
const dbPath = path.join(process.cwd(), 'portfolio.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
  tags: string; // JSON string
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
  technologies: string; // JSON string
  category: string;
  status: 'in-progress' | 'completed' | 'archived';
  start_date: string;
  end_date?: string;
  client?: string;
  budget?: string;
  images: string; // JSON string
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

export interface User {
  id: string;
  username: string;
  password_hash: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

// Initialize database schema
export const initializeDatabase = () => {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create blog_posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'FOULON Maxence',
      published_at DATETIME NOT NULL,
      updated_at DATETIME,
      featured_image TEXT,
      tags TEXT DEFAULT '[]',
      category TEXT NOT NULL,
      read_time INTEGER DEFAULT 5,
      featured BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      long_description TEXT,
      technologies TEXT DEFAULT '[]',
      category TEXT NOT NULL,
      status TEXT CHECK(status IN ('in-progress', 'completed', 'archived')) DEFAULT 'in-progress',
      start_date DATE NOT NULL,
      end_date DATE,
      client TEXT,
      budget TEXT,
      images TEXT DEFAULT '[]',
      featured BOOLEAN DEFAULT FALSE,
      github_url TEXT,
      live_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create contact_messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      budget TEXT,
      timeline TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
    CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
    CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
    CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
    
    CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
    
    CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON contact_messages(is_read);
    CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
    
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);

  // Create default admin user if not exists
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('admin') as { count: number };
  
  if (adminExists.count === 0) {
    const hashedPassword = bcrypt.hashSync('password', 10);
    db.prepare(`
      INSERT INTO users (username, password_hash, email)
      VALUES (?, ?, ?)
    `).run('admin', hashedPassword, 'admin@example.com');
  }

  console.log('Database initialized successfully');
};

// Authentication functions
export const authService = {
  async signIn(username: string, password: string) {
    try {
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
      
      if (!user) {
        return { data: null, error: new Error('Invalid credentials') };
      }

      const isValidPassword = bcrypt.compareSync(password, user.password_hash);
      
      if (!isValidPassword) {
        return { data: null, error: new Error('Invalid credentials') };
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        data: {
          user: { id: user.id, username: user.username, email: user.email },
          token
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
      const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(decoded.userId) as Omit<User, 'password_hash'> | undefined;
      
      if (!user) {
        return { user: null, error: new Error('User not found') };
      }

      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  async createUser(username: string, password: string, email?: string) {
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare(`
        INSERT INTO users (username, password_hash, email)
        VALUES (?, ?, ?)
      `).run(username, hashedPassword, email);

      const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(result.lastInsertRowid) as Omit<User, 'password_hash'>;
      
      return { data: user, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Blog service
export const blogService = {
  async getAllPosts(filters?: {
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = 'SELECT * FROM blog_posts';
      const conditions: string[] = [];
      const params: any[] = [];

      if (filters?.category) {
        conditions.push('category = ?');
        params.push(filters.category);
      }

      if (filters?.featured !== undefined) {
        conditions.push('featured = ?');
        params.push(filters.featured ? 1 : 0);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY published_at DESC';

      if (filters?.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      if (filters?.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }

      const posts = db.prepare(query).all(...params) as BlogPost[];
      
      // Parse JSON fields
      const processedPosts = posts.map(post => ({
        ...post,
        tags: JSON.parse(post.tags || '[]'),
        featured: Boolean(post.featured)
      }));

      return { data: processedPosts, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getPostBySlug(slug: string) {
    try {
      const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(slug) as BlogPost | undefined;
      
      if (!post) {
        return { data: null, error: new Error('Post not found') };
      }

      const processedPost = {
        ...post,
        tags: JSON.parse(post.tags || '[]'),
        featured: Boolean(post.featured)
      };

      return { data: processedPost, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async createPost(post: Omit<BlogPost, 'id' | 'created_at'>) {
    try {
      const result = db.prepare(`
        INSERT INTO blog_posts (
          title, slug, excerpt, content, author, published_at, updated_at,
          featured_image, tags, category, read_time, featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        post.title,
        post.slug,
        post.excerpt,
        post.content,
        post.author,
        post.published_at,
        post.updated_at,
        post.featured_image,
        JSON.stringify(post.tags),
        post.category,
        post.read_time,
        post.featured ? 1 : 0
      );

      const newPost = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(result.lastInsertRowid) as BlogPost;
      
      return { 
        data: {
          ...newPost,
          tags: JSON.parse(newPost.tags || '[]'),
          featured: Boolean(newPost.featured)
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updatePost(id: string, updates: Partial<BlogPost>) {
    try {
      const setClause: string[] = [];
      const params: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && value !== undefined) {
          setClause.push(`${key} = ?`);
          if (key === 'tags') {
            params.push(JSON.stringify(value));
          } else if (key === 'featured') {
            params.push(value ? 1 : 0);
          } else {
            params.push(value);
          }
        }
      });

      setClause.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      const query = `UPDATE blog_posts SET ${setClause.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...params);

      const updatedPost = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id) as BlogPost;
      
      return { 
        data: {
          ...updatedPost,
          tags: JSON.parse(updatedPost.tags || '[]'),
          featured: Boolean(updatedPost.featured)
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  async deletePost(id: string) {
    try {
      db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id);
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async searchPosts(query: string) {
    try {
      const posts = db.prepare(`
        SELECT * FROM blog_posts 
        WHERE title LIKE ? OR excerpt LIKE ? OR content LIKE ?
        ORDER BY published_at DESC
      `).all(`%${query}%`, `%${query}%`, `%${query}%`) as BlogPost[];

      const processedPosts = posts.map(post => ({
        ...post,
        tags: JSON.parse(post.tags || '[]'),
        featured: Boolean(post.featured)
      }));

      return { data: processedPosts, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getFeaturedPosts(limit: number = 3) {
    try {
      const posts = db.prepare(`
        SELECT * FROM blog_posts 
        WHERE featured = 1 
        ORDER BY published_at DESC 
        LIMIT ?
      `).all(limit) as BlogPost[];

      const processedPosts = posts.map(post => ({
        ...post,
        tags: JSON.parse(post.tags || '[]'),
        featured: Boolean(post.featured)
      }));

      return { data: processedPosts, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Project service
export const projectService = {
  async getAllProjects(filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = 'SELECT * FROM projects';
      const conditions: string[] = [];
      const params: any[] = [];

      if (filters?.category) {
        conditions.push('category = ?');
        params.push(filters.category);
      }

      if (filters?.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }

      if (filters?.featured !== undefined) {
        conditions.push('featured = ?');
        params.push(filters.featured ? 1 : 0);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';

      if (filters?.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      if (filters?.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }

      const projects = db.prepare(query).all(...params) as Project[];
      
      // Parse JSON fields
      const processedProjects = projects.map(project => ({
        ...project,
        technologies: JSON.parse(project.technologies || '[]'),
        images: JSON.parse(project.images || '[]'),
        featured: Boolean(project.featured)
      }));

      return { data: processedProjects, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getProjectById(id: string) {
    try {
      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;
      
      if (!project) {
        return { data: null, error: new Error('Project not found') };
      }

      const processedProject = {
        ...project,
        technologies: JSON.parse(project.technologies || '[]'),
        images: JSON.parse(project.images || '[]'),
        featured: Boolean(project.featured)
      };

      return { data: processedProject, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const result = db.prepare(`
        INSERT INTO projects (
          title, description, long_description, technologies, category, status,
          start_date, end_date, client, budget, images, featured, github_url, live_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        project.title,
        project.description,
        project.long_description,
        JSON.stringify(project.technologies),
        project.category,
        project.status,
        project.start_date,
        project.end_date,
        project.client,
        project.budget,
        JSON.stringify(project.images),
        project.featured ? 1 : 0,
        project.github_url,
        project.live_url
      );

      const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid) as Project;
      
      return { 
        data: {
          ...newProject,
          technologies: JSON.parse(newProject.technologies || '[]'),
          images: JSON.parse(newProject.images || '[]'),
          featured: Boolean(newProject.featured)
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateProject(id: string, updates: Partial<Project>) {
    try {
      const setClause: string[] = [];
      const params: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && value !== undefined) {
          setClause.push(`${key} = ?`);
          if (key === 'technologies' || key === 'images') {
            params.push(JSON.stringify(value));
          } else if (key === 'featured') {
            params.push(value ? 1 : 0);
          } else {
            params.push(value);
          }
        }
      });

      setClause.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      const query = `UPDATE projects SET ${setClause.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...params);

      const updatedProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project;
      
      return { 
        data: {
          ...updatedProject,
          technologies: JSON.parse(updatedProject.technologies || '[]'),
          images: JSON.parse(updatedProject.images || '[]'),
          featured: Boolean(updatedProject.featured)
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  async deleteProject(id: string) {
    try {
      db.prepare('DELETE FROM projects WHERE id = ?').run(id);
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async getFeaturedProjects(limit: number = 6) {
    try {
      const projects = db.prepare(`
        SELECT * FROM projects 
        WHERE featured = 1 
        ORDER BY created_at DESC 
        LIMIT ?
      `).all(limit) as Project[];

      const processedProjects = projects.map(project => ({
        ...project,
        technologies: JSON.parse(project.technologies || '[]'),
        images: JSON.parse(project.images || '[]'),
        featured: Boolean(project.featured)
      }));

      return { data: processedProjects, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Contact service
export const contactService = {
  async submitMessage(messageData: Omit<ContactMessage, 'id' | 'is_read' | 'created_at' | 'updated_at'>) {
    try {
      const result = db.prepare(`
        INSERT INTO contact_messages (name, email, subject, message, budget, timeline)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        messageData.name,
        messageData.email,
        messageData.subject,
        messageData.message,
        messageData.budget,
        messageData.timeline
      );

      const newMessage = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(result.lastInsertRowid) as ContactMessage;
      
      return { data: newMessage, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getAllMessages(filters?: {
    is_read?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = 'SELECT * FROM contact_messages';
      const conditions: string[] = [];
      const params: any[] = [];

      if (filters?.is_read !== undefined) {
        conditions.push('is_read = ?');
        params.push(filters.is_read ? 1 : 0);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';

      if (filters?.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      if (filters?.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }

      const messages = db.prepare(query).all(...params) as ContactMessage[];
      
      // Convert boolean fields
      const processedMessages = messages.map(message => ({
        ...message,
        is_read: Boolean(message.is_read)
      }));

      return { data: processedMessages, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateMessageStatus(id: string, is_read: boolean) {
    try {
      db.prepare(`
        UPDATE contact_messages 
        SET is_read = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(is_read ? 1 : 0, id);

      const updatedMessage = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id) as ContactMessage;
      
      return { 
        data: {
          ...updatedMessage,
          is_read: Boolean(updatedMessage.is_read)
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  async deleteMessage(id: string) {
    try {
      db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async getUnreadCount() {
    try {
      const result = db.prepare('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0').get() as { count: number };
      return { count: result.count, error: null };
    } catch (error) {
      return { count: 0, error };
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

// Initialize database on import
initializeDatabase();

