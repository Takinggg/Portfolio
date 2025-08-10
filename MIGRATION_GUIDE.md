# Supabase to SQLite Migration Guide

This document outlines the complete migration from Supabase to SQLite for the portfolio application.

## Overview

The migration involves:
- ✅ **Schema Migration**: All Supabase tables converted to SQLite
- ✅ **Data Migration**: Mock data and sample content migrated
- ✅ **Code Updates**: All Supabase client code replaced with SQLite
- ✅ **Authentication**: Custom JWT-based auth system implemented
- ✅ **Real-time Features**: Removed (SQLite doesn't support real-time)

## What Changed

### 1. Database Layer
- **Before**: Supabase PostgreSQL with cloud hosting
- **After**: Local SQLite database (`portfolio.db`)
- **New Files**:
  - `src/lib/database.ts` - Main database operations
  - `src/lib/sqlite.ts` - SQLite utilities
  - `src/lib/migration.ts` - Migration utilities

### 2. Authentication
- **Before**: Supabase Auth with built-in user management
- **After**: Custom JWT-based authentication with bcrypt password hashing
- **Changes**:
  - Local user table with hashed passwords
  - JWT tokens for session management
  - Admin login: `admin` / `password`

### 3. Data Structure
All tables maintained with equivalent SQLite schema:

#### Blog Posts
```sql
CREATE TABLE blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'FOULON Maxence',
  published_at DATETIME NOT NULL,
  updated_at DATETIME,
  featured_image TEXT,
  tags TEXT DEFAULT '[]', -- JSON string
  category TEXT NOT NULL,
  read_time INTEGER DEFAULT 5,
  featured BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Projects
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  technologies TEXT DEFAULT '[]', -- JSON string
  category TEXT NOT NULL,
  status TEXT CHECK(status IN ('in-progress', 'completed', 'archived')),
  start_date DATE NOT NULL,
  end_date DATE,
  client TEXT,
  budget TEXT,
  images TEXT DEFAULT '[]', -- JSON string
  featured BOOLEAN DEFAULT FALSE,
  github_url TEXT,
  live_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Contact Messages
```sql
CREATE TABLE contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  budget TEXT,
  timeline TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Users (New)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Code Changes

#### Hooks
- **Before**: `src/hooks/useSupabase.ts`
- **After**: `src/hooks/useSQLite.ts`
- **Changes**: Same API, different backend

#### Services
- **Before**: `src/lib/supabase.ts` with Supabase client
- **After**: `src/lib/database.ts` with better-sqlite3
- **API**: Maintained same function signatures for compatibility

#### Components
All components updated to use new hooks:
- `BlogSection.tsx`
- `BlogPage.tsx`
- `BlogPost.tsx`
- `Projects.tsx`
- `ProjectsPage.tsx`
- `ProjectDetail.tsx`
- `Contact.tsx`
- Admin components

## Migration Steps

### 1. Install Dependencies
```bash
npm install sqlite3 @types/sqlite3 better-sqlite3 bcryptjs @types/bcryptjs jsonwebtoken @types/jsonwebtoken
```

### 2. Initialize Database
```bash
npm run db:init
```

### 3. Run Migration
```bash
npm run migrate
```

### 4. Start Application
```bash
npm run dev
```

## Key Differences

### Advantages of SQLite
- ✅ **No external dependencies**: Database is local
- ✅ **Faster queries**: No network latency
- ✅ **Simpler deployment**: Single file database
- ✅ **No costs**: No cloud database fees
- ✅ **Better privacy**: Data stays local

### Limitations
- ❌ **No real-time subscriptions**: SQLite doesn't support real-time
- ❌ **Single writer**: SQLite has limited concurrent write support
- ❌ **No built-in auth**: Custom authentication required
- ❌ **No cloud sync**: Manual backup/sync needed
- ❌ **Local only**: Database not accessible remotely

### Performance Considerations
- **Read performance**: Excellent for read-heavy workloads
- **Write performance**: Good for single-user applications
- **Scalability**: Limited to single-server deployments
- **Backup**: Manual file-based backups required

## Production Deployment

### Database Location
- **Development**: `./portfolio.db`
- **Production**: Configure path via environment variable

### Backup Strategy
```bash
# Manual backup
cp portfolio.db portfolio_backup_$(date +%Y%m%d).db

# Automated backup (add to cron)
0 2 * * * cp /path/to/portfolio.db /backups/portfolio_$(date +\%Y\%m\%d).db
```

### Security
- Change default admin password
- Use strong JWT secret in production
- Implement rate limiting for auth endpoints
- Regular security updates

## Environment Variables

Create `.env` file:
```env
# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database path (optional)
DATABASE_PATH=./portfolio.db

# Admin credentials (optional, for initial setup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

## Troubleshooting

### Common Issues

1. **Database locked error**
   - Ensure no other processes are using the database
   - Check file permissions

2. **Migration fails**
   - Delete `portfolio.db` and run migration again
   - Check console for specific error messages

3. **Authentication not working**
   - Verify JWT_SECRET is set
   - Check browser localStorage for tokens

4. **Performance issues**
   - Run `VACUUM` and `ANALYZE` on database
   - Check for missing indexes

### Debug Commands
```bash
# Check database status
sqlite3 portfolio.db ".tables"
sqlite3 portfolio.db ".schema"

# Count records
sqlite3 portfolio.db "SELECT COUNT(*) FROM blog_posts;"
sqlite3 portfolio.db "SELECT COUNT(*) FROM projects;"
sqlite3 portfolio.db "SELECT COUNT(*) FROM contact_messages;"
```

## Future Considerations

### Scaling Options
1. **PostgreSQL**: Migrate to PostgreSQL for better concurrency
2. **Cloud SQLite**: Use services like Turso or LiteFS
3. **Hybrid approach**: SQLite for reads, PostgreSQL for writes

### Feature Additions
1. **Full-text search**: SQLite FTS5 extension
2. **Analytics**: Built-in analytics tables
3. **Caching**: Redis for frequently accessed data
4. **API**: REST API for external integrations

## Conclusion

The migration from Supabase to SQLite provides:
- Complete data ownership
- Reduced complexity
- Lower costs
- Better performance for single-user scenarios

The application maintains all existing functionality while gaining the benefits of a local database solution.