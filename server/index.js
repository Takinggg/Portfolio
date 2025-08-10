import express from 'express';
import cors from 'cors';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'portfolio.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

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
    
    if (!post.slug && post.title) {
      post.slug = generateSlug(post.title);
    }
    
    if (post.content) {
      post.read_time = calculateReadingTime(post.content);
    }

    // Ensure required fields have defaults
    post.tags = post.tags || [];
    post.author = post.author || 'FOULON Maxence';
    post.featured = post.featured || false;
    post.read_time = post.read_time || 5;

    const result = db.prepare(`
      INSERT INTO blog_posts (
        title, slug, excerpt, content, author, published_at, updated_at,
        featured_image, tags, category, read_time, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      post.title, post.slug, post.excerpt, post.content, post.author,
      post.published_at, post.updated_at, post.featured_image,
      JSON.stringify(post.tags), post.category, post.read_time, post.featured ? 1 : 0
    );

    const newPost = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(result.lastInsertRowid);
    
    res.json({ 
      data: {
        ...newPost,
        tags: JSON.parse(newPost.tags || '[]'),
        featured: Boolean(newPost.featured)
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
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

app.post('/api/projects', authenticateToken, (req, res) => {
  try {
    const project = req.body;

    const result = db.prepare(`
      INSERT INTO projects (
        title, description, long_description, technologies, category, status,
        start_date, end_date, client, budget, images, featured, github_url, live_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      project.title, project.description, project.long_description,
      JSON.stringify(project.technologies), project.category, project.status,
      project.start_date, project.end_date, project.client, project.budget,
      JSON.stringify(project.images), project.featured ? 1 : 0,
      project.github_url, project.live_url
    );

    const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    
    res.json({ 
      data: {
        ...newProject,
        technologies: JSON.parse(newProject.technologies || '[]'),
        images: JSON.parse(newProject.images || '[]'),
        featured: Boolean(newProject.featured)
      }
    });
  } catch (error) {
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
app.post('/api/contact', (req, res) => {
  try {
    const messageData = req.body;

    const result = db.prepare(`
      INSERT INTO contact_messages (name, email, subject, message, budget, timeline)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      messageData.name, messageData.email, messageData.subject,
      messageData.message, messageData.budget, messageData.timeline
    );

    const newMessage = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(result.lastInsertRowid);
    
    res.json({ data: newMessage });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
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
    const { is_read } = req.body;

    db.prepare(`
      UPDATE contact_messages 
      SET is_read = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(is_read ? 1 : 0, id);

    const updatedMessage = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
    
    res.json({ 
      data: {
        ...updatedMessage,
        is_read: Boolean(updatedMessage.is_read)
      }
    });
  } catch (error) {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});