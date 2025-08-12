import express from 'express';
import cors from 'cors';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { initializeSchedulingSchema } from './scheduling/database.js';
import { initializeSchedulingRoutes } from './scheduling/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Environment configuration validation
const validateEnvironment = () => {
  const warnings = [];
  const errors = [];
  
  // Critical environment variables
  if (!process.env.ACTION_TOKEN_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      errors.push('ACTION_TOKEN_SECRET is required in production');
    } else {
      warnings.push('ACTION_TOKEN_SECRET not set, using default (not secure for production)');
    }
  }
  
  if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-in-production') {
    errors.push('JWT_SECRET must be changed in production');
  }
  
  // Optional but recommended environment variables
  if (!process.env.SMTP_HOST && process.env.NODE_ENV === 'production') {
    warnings.push('SMTP_HOST not configured, emails will be logged only');
  }
  
  if (!process.env.FRONTEND_URL) {
    warnings.push('FRONTEND_URL not set, using default for email links');
  }
  
  // Log warnings
  warnings.forEach(warning => {
    console.warn(`⚠️  ${warning}`);
  });
  
  // Handle errors
  if (errors.length > 0) {
    console.error('❌ Environment configuration errors:');
    errors.forEach(error => {
      console.error(`   - ${error}`);
    });
    if (process.env.NODE_ENV === 'production') {
      console.error('Refusing to start in production with configuration errors');
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing in development mode with configuration errors');
    }
  }
  
  return { warnings, errors };
};

// Validate environment on startup
const envValidation = validateEnvironment();

// Helper function to read package.json version
const getVersion = () => {
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    return packageJson.version || 'unknown';
  } catch (error) {
    console.warn('Could not read package.json version:', error.message);
    return 'unknown';
  }
};

// Auto-configure CORS based on environment
const getAllowedOrigins = () => {
  const localOrigins = [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://127.0.0.1:5173', 
    'http://127.0.0.1:3000'
  ];
  
  const productionOrigins = [
    'https://maxence.design',
    'https://www.maxence.design',
    'https://back.maxence.design',
    'https://takinggg-portfolio.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  // Parse ALLOWED_ORIGINS if present (comma-separated)
  const envAllowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
    : [];
  
  const allOrigins = process.env.NODE_ENV === 'production' 
    ? [...localOrigins, ...productionOrigins, ...envAllowedOrigins] 
    : localOrigins;
  
  // Remove duplicates
  return [...new Set(allOrigins)];
};

// Middleware
app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  // Log detailed error information
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  
  // Determine appropriate error message
  let errorMessage = 'Internal server error';
  let statusCode = err.status || 500;
  
  // Provide more specific error messages based on error type
  if (err.code === 'SQLITE_CONSTRAINT') {
    errorMessage = 'Database constraint violation';
    statusCode = 400;
  } else if (err.code === 'SQLITE_BUSY') {
    errorMessage = 'Database is temporarily busy, please try again';
    statusCode = 503;
  } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    errorMessage = 'External service unavailable';
    statusCode = 503;
  } else if (err.message && process.env.NODE_ENV === 'development') {
    errorMessage = err.message;
  }
  
  res.status(statusCode).json({
    error: { 
      message: errorMessage,
      code: err.code,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        originalMessage: err.message 
      })
    }
  });
});

// Database setup
const getDatabasePath = () => {
  if (process.env.DATABASE_PATH) {
    // If it's an absolute path, use it as-is
    if (path.isAbsolute(process.env.DATABASE_PATH)) {
      return process.env.DATABASE_PATH;
    }
    // If it's a relative path, resolve it from the project root
    return path.resolve(__dirname, '..', process.env.DATABASE_PATH);
  }
  // Default to ./portfolio.db in the server directory
  return path.join(__dirname, 'portfolio.db');
};

// Database health check function
const checkDatabaseHealth = (db) => {
  try {
    // Test basic database connectivity
    const result = db.prepare('SELECT 1 as test').get();
    if (result.test !== 1) {
      throw new Error('Database connectivity test failed');
    }
    
    // Check if critical tables exist
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('users', 'contact_messages', 'bookings', 'event_types')
    `).all();
    
    const expectedTables = ['users', 'contact_messages'];
    const missingTables = expectedTables.filter(table => 
      !tables.some(t => t.name === table)
    );
    
    if (missingTables.length > 0) {
      console.warn(`⚠️  Missing tables: ${missingTables.join(', ')}`);
    }
    
    console.log('✅ Database health check passed');
    return { healthy: true, tables: tables.length };
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    return { healthy: false, error: error.message };
  }
};

const dbPath = getDatabasePath();
console.log(`Using database path: ${dbPath}`);
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Perform database health check
const dbHealth = checkDatabaseHealth(db);

// Initialize database schema
const initializeDatabase = () => {
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
      booking_uuid TEXT,
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
    CREATE INDEX IF NOT EXISTS idx_contact_messages_booking_uuid ON contact_messages(booking_uuid);
    
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);

  // Create default admin user if not exists
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('admin');
  
  if (adminExists.count === 0) {
    const hashedPassword = bcrypt.hashSync('password', 10);
    db.prepare(`
      INSERT INTO users (username, password_hash, email)
      VALUES (?, ?, ?)
    `).run('admin', hashedPassword, 'admin@example.com');
  }

  // Insert sample data if tables are empty
  const postsCount = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get();
  if (postsCount.count === 0) {
    insertSampleData();
  }

  console.log('Database initialized successfully');
  
  // Migration: Add booking_uuid column if it doesn't exist
  try {
    const tableInfo = db.prepare("PRAGMA table_info(contact_messages)").all();
    const hasBookingUuid = tableInfo.some(column => column.name === 'booking_uuid');
    
    if (!hasBookingUuid) {
      console.log('Adding booking_uuid column to contact_messages table...');
      db.prepare('ALTER TABLE contact_messages ADD COLUMN booking_uuid TEXT').run();
      db.prepare('CREATE INDEX IF NOT EXISTS idx_contact_messages_booking_uuid ON contact_messages(booking_uuid)').run();
      console.log('Migration completed: booking_uuid column added');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
};

const insertSampleData = () => {
  // Sample blog posts
  const samplePosts = [
    {
      title: "L'avenir du Design UI/UX",
      slug: "avenir-design-ui-ux",
      excerpt: "Découvrez les tendances émergentes qui façonnent l'avenir du design d'interface utilisateur et d'expérience utilisateur.",
      content: "Le design UI/UX évolue constamment...",
      published_at: "2024-01-15",
      featured_image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg",
      tags: JSON.stringify(["UI/UX", "Design", "Tendances"]),
      category: "Design",
      read_time: 8,
      featured: true
    },
    {
      title: "Design System : Créer une Cohérence",
      slug: "design-system-coherence",
      excerpt: "Comment créer et maintenir un design system efficace pour vos projets digitaux.",
      content: "Un design system est bien plus qu'une simple bibliothèque de composants...",
      published_at: "2024-01-10",
      featured_image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
      tags: JSON.stringify(["Design System", "Cohérence", "Méthodologie"]),
      category: "Méthodologie",
      read_time: 6,
      featured: false
    }
  ];

  const insertPost = db.prepare(`
    INSERT INTO blog_posts (title, slug, excerpt, content, published_at, featured_image, tags, category, read_time, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  samplePosts.forEach(post => {
    insertPost.run(
      post.title, post.slug, post.excerpt, post.content, post.published_at,
      post.featured_image, post.tags, post.category, post.read_time, post.featured ? 1 : 0
    );
  });

  // Sample projects
  const sampleProjects = [
    {
      title: "FinTech Mobile Revolution",
      description: "Application mobile révolutionnaire pour la gestion financière personnelle",
      long_description: "Une application complète qui transforme la façon dont les utilisateurs gèrent leurs finances...",
      technologies: JSON.stringify(["React Native", "Node.js", "PostgreSQL", "Stripe"]),
      category: "mobile",
      status: "completed",
      start_date: "2023-06-01",
      end_date: "2023-12-15",
      client: "FinTech Startup",
      budget: "30k-50k €",
      images: JSON.stringify([
        "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
        "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg"
      ]),
      featured: true,
      github_url: "https://github.com/example/fintech-app",
      live_url: "https://fintech-demo.com"
    }
  ];

  const insertProject = db.prepare(`
    INSERT INTO projects (title, description, long_description, technologies, category, status, start_date, end_date, client, budget, images, featured, github_url, live_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleProjects.forEach(project => {
    insertProject.run(
      project.title, project.description, project.long_description, project.technologies,
      project.category, project.status, project.start_date, project.end_date,
      project.client, project.budget, project.images, project.featured ? 1 : 0,
      project.github_url, project.live_url
    );
  });
};

// Utility functions
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const normalizeSlug = (input) => {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Collapse multiple dashes
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
};

const ensureUniqueSlug = (baseSlug) => {
  // Normalize the base slug first
  const normalizedBase = normalizeSlug(baseSlug);
  
  // Check if the base slug is available
  const existingPost = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(normalizedBase);
  
  if (!existingPost) {
    return normalizedBase;
  }
  
  // If not available, try with suffixes
  let counter = 2;
  let candidateSlug;
  
  do {
    candidateSlug = `${normalizedBase}-${counter}`;
    const existingWithSuffix = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(candidateSlug);
    
    if (!existingWithSuffix) {
      return candidateSlug;
    }
    
    counter++;
  } while (counter < 1000); // Safety limit
  
  // Fallback to timestamp if we somehow exceed the limit
  return `${normalizedBase}-${Date.now()}`;
};

const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Portfolio API',
    status: 'running',
    ts: Date.now(),
    uptime: process.uptime(),
    health: '/api/health',
    version: getVersion(),
    frontend: 'https://maxence.design'
  });
});

// Health endpoint with comprehensive status
app.get('/api/health', (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: getVersion(),
      environment: process.env.NODE_ENV || 'development',
      services: {}
    };
    
    // Database health
    const dbStatus = checkDatabaseHealth(db);
    health.services.database = {
      status: dbStatus.healthy ? 'healthy' : 'unhealthy',
      details: dbStatus.healthy ? 
        { tables: dbStatus.tables } : 
        { error: dbStatus.error }
    };
    
    // Scheduling service health
    try {
      const eventTypes = db.prepare('SELECT COUNT(*) as count FROM event_types WHERE is_active = 1').get();
      health.services.scheduling = {
        status: 'healthy',
        details: { active_event_types: eventTypes.count }
      };
    } catch (error) {
      health.services.scheduling = {
        status: 'unhealthy',
        details: { error: error.message }
      };
    }
    
    // Email service health
    const smtpConfigured = !!process.env.SMTP_HOST;
    health.services.email = {
      status: smtpConfigured ? 'configured' : 'development_only',
      details: { 
        smtp_configured: smtpConfigured,
        mode: smtpConfigured ? 'production' : 'logging_only'
      }
    };
    
    // Environment configuration status
    health.services.configuration = {
      status: envValidation.errors.length === 0 ? 'healthy' : 'warnings',
      details: {
        warnings: envValidation.warnings.length,
        errors: envValidation.errors.length
      }
    };
    
    // Overall status
    const hasUnhealthyServices = Object.values(health.services).some(
      service => service.status === 'unhealthy'
    );
    
    if (hasUnhealthyServices) {
      health.status = 'degraded';
      res.status(503);
    }
    
    res.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Auth routes
app.post('/api/auth/signin', (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      data: {
        user: { id: user.id, username: user.username, email: user.email },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Blog routes
app.get('/api/blog/posts', (req, res) => {
  try {
    const { category, featured, limit, offset } = req.query;
    
    let query = 'SELECT * FROM blog_posts';
    const conditions = [];
    const params = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (featured !== undefined) {
      conditions.push('featured = ?');
      params.push(featured === 'true' ? 1 : 0);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY published_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    if (offset) {
      query += ' OFFSET ?';
      params.push(parseInt(offset));
    }

    const posts = db.prepare(query).all(...params);
    
    const processedPosts = posts.map(post => ({
      ...post,
      tags: JSON.parse(post.tags || '[]'),
      featured: Boolean(post.featured)
    }));

    res.json({ data: processedPosts });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

app.get('/api/blog/posts/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(slug);
    
    if (!post) {
      return res.status(404).json({ error: { message: 'Post not found' } });
    }

    const processedPost = {
      ...post,
      tags: JSON.parse(post.tags || '[]'),
      featured: Boolean(post.featured)
    };

    res.json({ data: processedPost });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

app.post('/api/blog/posts', authenticateToken, (req, res) => {
  try {
    const post = req.body;
    
    // Validate required fields
    if (!post.title || !post.content) {
      return res.status(400).json({ 
        error: { message: 'Title and content are required' } 
      });
    }
    
    // Generate a UUID for the post
    const postId = randomUUID();
    
    // Generate or normalize slug
    let baseSlug;
    if (post.slug) {
      baseSlug = post.slug;
    } else {
      baseSlug = generateSlug(post.title);
    }
    
    // Ensure slug is unique
    const finalSlug = ensureUniqueSlug(baseSlug);
    
    // Always recalculate read_time server-side (ignore client-sent read_time)
    const calculatedReadTime = calculateReadingTime(post.content);

    // Prepare data for insertion
    const postData = {
      id: postId,
      title: post.title,
      slug: finalSlug,
      excerpt: post.excerpt || '',
      content: post.content,
      author: post.author || 'FOULON Maxence',
      published_at: post.published_at || new Date().toISOString(),
      updated_at: post.updated_at || new Date().toISOString(),
      featured_image: post.featured_image || null,
      tags: Array.isArray(post.tags) ? post.tags : [],
      category: post.category || 'Design',
      read_time: calculatedReadTime,
      featured: Boolean(post.featured)
    };

    // Insert the new post
    const result = db.prepare(`
      INSERT INTO blog_posts (
        id, title, slug, excerpt, content, author, published_at, updated_at,
        featured_image, tags, category, read_time, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      postData.id, postData.title, postData.slug, postData.excerpt, postData.content, postData.author,
      postData.published_at, postData.updated_at, postData.featured_image,
      JSON.stringify(postData.tags), postData.category, postData.read_time, postData.featured ? 1 : 0
    );

    // Get the newly created post by its ID (not rowid)
    const newPost = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(postId);
    
    if (!newPost) {
      console.error('Failed to retrieve created post with id:', postId);
      return res.status(500).json({ 
        error: { message: 'Failed to retrieve created post' } 
      });
    }
    
    // Return 201 status code with the created post
    res.status(201).json({ 
      data: {
        ...newPost,
        tags: JSON.parse(newPost.tags || '[]'),
        featured: Boolean(newPost.featured)
      }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    
    // Don't expose raw SQLite errors to clients
    if (error.code && error.code.startsWith('SQLITE')) {
      res.status(500).json({ error: { message: 'Internal server error' } });
    } else {
      res.status(500).json({ error: { message: 'Internal server error' } });
    }
  }
});

app.put('/api/blog/posts/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = [];
    const params = [];

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

    const updatedPost = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id);
    
    res.json({ 
      data: {
        ...updatedPost,
        tags: JSON.parse(updatedPost.tags || '[]'),
        featured: Boolean(updatedPost.featured)
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

app.delete('/api/blog/posts/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Slug availability endpoint
app.get('/api/blog/slug-availability', (req, res) => {
  try {
    const { slug } = req.query;
    
    if (!slug) {
      return res.status(400).json({ 
        error: { message: 'Slug parameter is required' } 
      });
    }
    
    // Normalize the provided slug
    const normalizedSlug = normalizeSlug(slug);
    
    // Check if the normalized slug is available
    const existingPost = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(normalizedSlug);
    const isAvailable = !existingPost;
    
    // Get the suggested unique slug (what would actually be assigned)
    const suggestedSlug = ensureUniqueSlug(slug);
    
    res.json({
      base: normalizedSlug,
      available: isAvailable,
      suggested: suggestedSlug
    });
  } catch (error) {
    console.error('Error checking slug availability:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

// Project routes
app.get('/api/projects', (req, res) => {
  try {
    const { category, status, featured, limit, offset } = req.query;
    
    let query = 'SELECT * FROM projects';
    const conditions = [];
    const params = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (featured !== undefined) {
      conditions.push('featured = ?');
      params.push(featured === 'true' ? 1 : 0);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    if (offset) {
      query += ' OFFSET ?';
      params.push(parseInt(offset));
    }

    const projects = db.prepare(query).all(...params);
    
    const processedProjects = projects.map(project => ({
      ...project,
      technologies: JSON.parse(project.technologies || '[]'),
      images: JSON.parse(project.images || '[]'),
      featured: Boolean(project.featured)
    }));

    res.json({ data: processedProjects });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    
    if (!project) {
      return res.status(404).json({ error: { message: 'Project not found' } });
    }

    const processedProject = {
      ...project,
      technologies: JSON.parse(project.technologies || '[]'),
      images: JSON.parse(project.images || '[]'),
      featured: Boolean(project.featured)
    };

    res.json({ data: processedProject });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Helper function to normalize array inputs
const normalizeToArray = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map(item => String(item).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
};

app.post('/api/projects', authenticateToken, (req, res) => {
  try {
    const project = req.body;

    // Validate required fields
    if (!project.title || !project.description) {
      return res.status(400).json({ 
        error: { message: 'Title and description are required' } 
      });
    }

    // Generate a UUID for the project
    const projectId = randomUUID();

    // Input normalization: ensure technologies and images are arrays of strings
    const normalizedTechnologies = normalizeToArray(project.technologies);
    const normalizedImages = normalizeToArray(project.images);

    // Ensure all fields have proper defaults with proper null/undefined checks
    const projectData = {
      id: projectId,
      title: project.title,
      description: project.description,
      long_description: project.long_description || '',
      technologies: normalizedTechnologies,
      category: project.category || 'web',
      status: project.status || 'in-progress',
      start_date: project.start_date || new Date().toISOString().split('T')[0],
      end_date: project.end_date || null,
      client: project.client || null,
      budget: project.budget || null,
      images: normalizedImages,
      featured: Boolean(project.featured),
      github_url: project.github_url || null,
      live_url: project.live_url || null
    };

    const result = db.prepare(`
      INSERT INTO projects (
        id, title, description, long_description, technologies, category, status,
        start_date, end_date, client, budget, images, featured, github_url, live_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectData.id, projectData.title, projectData.description, projectData.long_description,
      JSON.stringify(projectData.technologies), projectData.category, projectData.status,
      projectData.start_date, projectData.end_date, projectData.client, projectData.budget,
      JSON.stringify(projectData.images), projectData.featured ? 1 : 0,
      projectData.github_url, projectData.live_url
    );

    // Get the newly created project by its ID (not rowid)
    const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    
    if (!newProject) {
      console.error('Failed to retrieve created project with id:', projectId);
      return res.status(500).json({ 
        error: { message: 'Failed to retrieve created project' } 
      });
    }
    
    res.status(201).json({ 
      data: {
        ...newProject,
        technologies: JSON.parse(newProject.technologies || '[]'),
        images: JSON.parse(newProject.images || '[]'),
        featured: Boolean(newProject.featured)
      }
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.put('/api/projects/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = [];
    const params = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        setClause.push(`${key} = ?`);
        if (key === 'technologies' || key === 'images') {
          // Normalize and ensure arrays are properly handled
          const normalizedValue = normalizeToArray(value);
          params.push(JSON.stringify(normalizedValue));
        } else if (key === 'featured') {
          params.push(value ? 1 : 0);
        } else {
          params.push(value);
        }
      }
    });

    if (setClause.length === 0) {
      return res.status(400).json({ error: { message: 'No valid fields to update' } });
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `UPDATE projects SET ${setClause.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: { message: 'Project not found' } });
    }

    const updatedProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    
    res.json({ 
      data: {
        ...updatedProject,
        technologies: JSON.parse(updatedProject.technologies || '[]'),
        images: JSON.parse(updatedProject.images || '[]'),
        featured: Boolean(updatedProject.featured)
      }
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Contact routes
app.post('/api/contact', async (req, res) => {
  try {
    const messageData = req.body;
    
    // Validate required fields
    if (!messageData.name || !messageData.email || !messageData.subject || !messageData.message) {
      return res.status(400).json({
        error: { 
          message: 'Name, email, subject, and message are required',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      });
    }

    // Generate a UUID for the message
    const messageId = randomUUID();
    
    // Log contact attempt
    console.log(`📝 Contact form submission from ${messageData.email} (${messageData.name})`);

    try {
      const result = db.prepare(`
        INSERT INTO contact_messages (id, name, email, subject, message, budget, timeline)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        messageId, messageData.name, messageData.email, messageData.subject,
        messageData.message, messageData.budget, messageData.timeline
      );

      // Get the newly created message by its ID (not rowid)
      const newMessage = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(messageId);
      
      if (!newMessage) {
        console.error('Failed to retrieve created contact message with id:', messageId);
        return res.status(500).json({ 
          error: { 
            message: 'Message was saved but could not be retrieved',
            code: 'RETRIEVAL_ERROR'
          }
        });
      }
      
      console.log(`✅ Contact message saved successfully: ${messageId}`);
      res.json({ data: newMessage });
      
    } catch (dbError) {
      console.error('Database error saving contact message:', dbError);
      
      // Provide specific error messages for common database issues
      let errorMessage = 'Failed to save contact message';
      let errorCode = 'DATABASE_ERROR';
      
      if (dbError.code === 'SQLITE_CONSTRAINT') {
        errorMessage = 'Invalid data provided';
        errorCode = 'CONSTRAINT_VIOLATION';
      } else if (dbError.code === 'SQLITE_BUSY') {
        errorMessage = 'System is temporarily busy, please try again';
        errorCode = 'SYSTEM_BUSY';
      }
      
      return res.status(500).json({
        error: { 
          message: errorMessage,
          code: errorCode,
          ...(process.env.NODE_ENV === 'development' && { details: dbError.message })
        }
      });
    }
    
  } catch (error) {
    console.error('Unexpected error in contact form:', error);
    res.status(500).json({ 
      error: { 
        message: 'An unexpected error occurred while processing your message',
        code: 'UNEXPECTED_ERROR',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      }
    });
  }
});

app.get('/api/contact/messages', authenticateToken, (req, res) => {
  try {
    const { is_read, limit, offset } = req.query;
    
    let query = 'SELECT * FROM contact_messages';
    const conditions = [];
    const params = [];

    if (is_read !== undefined) {
      conditions.push('is_read = ?');
      params.push(is_read === 'true' ? 1 : 0);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    if (offset) {
      query += ' OFFSET ?';
      params.push(parseInt(offset));
    }

    const messages = db.prepare(query).all(...params);
    
    const processedMessages = messages.map(message => ({
      ...message,
      is_read: Boolean(message.is_read)
    }));

    res.json({ data: processedMessages });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

app.put('/api/contact/messages/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { is_read, booking_uuid } = req.body;

    // Build update query dynamically based on provided fields
    const updates = [];
    const params = [];
    
    if (is_read !== undefined) {
      updates.push('is_read = ?');
      params.push(is_read ? 1 : 0);
    }
    
    if (booking_uuid !== undefined) {
      updates.push('booking_uuid = ?');
      params.push(booking_uuid);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: { message: 'No fields to update' } });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `UPDATE contact_messages SET ${updates.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: { message: 'Message not found' } });
    }

    const updatedMessage = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
    
    // Log booking liaison for audit trail
    if (booking_uuid !== undefined) {
      console.log(`Contact message ${id} ${booking_uuid ? 'linked to' : 'unlinked from'} booking ${booking_uuid || 'null'}`);
    }
    
    res.json({ 
      data: {
        ...updatedMessage,
        is_read: Boolean(updatedMessage.is_read)
      }
    });
  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.delete('/api/contact/messages/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

app.get('/api/contact/unread-count', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0').get();
    res.json({ count: result.count });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Initialize database and start server
initializeDatabase();

// Initialize scheduling system
let schedulingHealthy = false;
try {
  initializeSchedulingSchema(db);
  initializeSchedulingRoutes(app, db);
  schedulingHealthy = true;
  console.log('✅ Scheduling system initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize scheduling system:', error);
  console.error('This is a critical error, scheduling features will be unavailable');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Initialize admin scheduling system (optional)
let adminSchedulingHealthy = false;
try {
  const { initializeAdminSchedulingRoutes } = await import('./admin/routes.js');
  initializeAdminSchedulingRoutes(app, db);
  adminSchedulingHealthy = true;
  console.log('✅ Admin scheduling system initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize admin scheduling system:', error);
  console.warn('Admin scheduling panel will not be available');
  // Don't exit - admin panel is optional
}

// Initialize notification system (optional)
let notificationServiceHealthy = false;
try {
  const { NotificationService } = await import('./notifications/notifier.js');
  const { ReminderScheduler } = await import('./notifications/reminderScheduler.js');
  
  // Create notification service
  const notificationService = new NotificationService(db);
  
  // Create reminder scheduler
  const reminderScheduler = new ReminderScheduler(db, notificationService);
  
  // Start reminder scheduler
  reminderScheduler.start();
  
  notificationServiceHealthy = true;
  console.log('✅ Notification system initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize notification system:', error);
  console.warn('Notification services will not be available, but booking will still work');
  // Don't exit - notifications are optional, bookings should still work
}

// Add service status to global scope for health checks
global.serviceStatus = {
  scheduling: schedulingHealthy,
  adminScheduling: adminSchedulingHealthy,
  notifications: notificationServiceHealthy,
  database: dbHealth.healthy
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  const allowedOrigins = getAllowedOrigins();
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});