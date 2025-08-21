# Portfolio - FOULON Maxence | Development Instructions

Portfolio professionnel de Maxence FOULON - React + TypeScript portfolio with Express.js backend for contact and appointment booking functionality.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Prerequisites & Environment Setup
- **Node.js Version**: Use Node.js 20 (specified in `.nvmrc`)
- **Package Manager**: npm (verified working with v10.8.2)
- **Environment File**: Copy `.env.example` to `.env.local` before starting

### Bootstrap & Build Process
Execute these commands in order:

```bash
# 1. Install dependencies - takes ~21 seconds
npm install

# 2. Type checking (quick validation)
npm run type-check

# 3. Build production assets - takes ~6 seconds, NEVER CANCEL, set timeout to 120+ seconds
npm run build-only

# 4. Full build with validation - takes ~6 seconds, NEVER CANCEL, set timeout to 120+ seconds  
npm run build
```

### Development Servers
```bash
# Start both frontend and backend servers simultaneously
npm run dev

# Individual servers (if needed):
npm run dev:client    # Frontend only (port 5173)
npm run dev:server    # Backend only (port 3001)
```

**Server Details:**
- **Frontend**: http://localhost:5173 (React + Vite)
- **Backend API**: http://localhost:3001 (Express.js)
- **Admin Interface**: http://localhost:5173/admin
- **API Health Check**: http://localhost:3001/api/health

### Linting & Code Quality
```bash
# Run linting (allows up to 20 warnings)
npm run lint

# Auto-fix linting issues
npm run lint-fix
```

**Note**: The linting currently shows ~72 issues (51 errors, 21 warnings) but **does not block builds**. Focus only on linting issues related to your changes.

## Testing

### End-to-End Tests (Playwright)
```bash
# Full E2E test suite - requires dev servers to be stopped first
npm run test:e2e

# Run with browser UI for debugging
npm run test:e2e:ui

# Run specific browser only (recommended for faster validation)
npm run test:e2e -- --project=chromium --max-failures=1
```

**IMPORTANT**: 
- Stop development servers before running E2E tests
- Tests take ~2-5 minutes, NEVER CANCEL, set timeout to 600+ seconds
- Some tests may fail due to missing backend configuration (scheduling API endpoints) - this is expected
- Focus on testing UI functionality and core user scenarios

### Unit Tests
```bash
# Simple normalization test (works standalone)
node tests/normalization.test.js

# Other tests require additional dependencies (better-sqlite3, vitest)
# These are integration tests for backend booking functionality
```

## Validation Scenarios

**ALWAYS manually validate changes by running through these complete scenarios:**

### Primary User Scenarios
1. **Portfolio Viewing**:
   - Navigate to http://localhost:5173
   - Verify homepage loads with hero section, projects, blog, and contact form
   - Test navigation between sections
   - Verify responsive design on mobile viewport

2. **Contact Form Functionality**:
   - Fill out contact form at bottom of homepage
   - Test form validation (required fields)
   - Verify email integration works (uses mailto)

3. **Admin Interface**:
   - Navigate to http://localhost:5173/admin
   - Verify login form appears
   - Test with credentials from `.env.local` (if configured)

4. **API Endpoints**:
   - Check http://localhost:3001/api/health returns `{"status":"ok"}`
   - Verify contact API accepts POST requests

### Build Validation
After any changes:
```bash
# 1. Clean build
rm -rf dist
npm run build

# 2. Test production preview
npm run preview
```

## Project Structure & Key Locations

### Frontend (`/src`)
- **`/src/components`** - React components organized by feature
- **`/src/pages`** - Main page components and routing
- **`/src/lib`** - Utility functions and adapters  
- **`/src/styles`** - CSS and Tailwind configuration
- **`/src/data`** - Static data for projects and blog posts
- **`/src/i18n`** - Internationalization (French/English)

### Backend (`/server`)
- **`/server/index.js`** - Express.js main server file
- **`/server/routes`** - API routes for contact and appointments
- **`/server/lib`** - Server utilities and database functions

### Configuration Files
- **`package.json`** - Dependencies and npm scripts
- **`vite.config.ts`** - Build configuration and dev server proxy
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`eslint.config.js`** - Linting rules
- **`playwright.config.ts`** - E2E test configuration

### Documentation
- **`README.md`** - Project overview and features
- **`IMPLEMENTATION.md`** - Detailed backend API documentation
- **`/docs`** - Additional technical documentation

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design tokens
- **Animation**: Framer Motion
- **Backend**: Express.js with file-based storage (JSONL)
- **Testing**: Playwright (E2E), Node.js (unit tests)
- **Build**: Vite with ES modules
- **Languages**: French (primary) + English support

## Timing Expectations & Timeouts

**CRITICAL: NEVER CANCEL long-running commands. Use these timeout values:**

- **npm install**: ~9 seconds (set timeout: 300+ seconds)
- **npm run build**: ~6 seconds (set timeout: 120+ seconds)  
- **npm run type-check**: <1 second (set timeout: 60+ seconds)
- **npm run lint**: ~10 seconds (set timeout: 120+ seconds)
- **npm run test:e2e**: 2-5 minutes (set timeout: 600+ seconds)
- **Dev server startup**: ~2 seconds (set timeout: 60+ seconds)

## Development Workflow

### Making Changes
1. **Always run build and test validation steps before starting**
2. **Start development servers**: `npm run dev`  
3. **Make your changes**
4. **Test immediately**: Verify in browser and run affected tests
5. **Lint and type-check**: `npm run lint && npm run type-check`
6. **Build validation**: `npm run build`
7. **E2E test critical paths**: `npm run test:e2e -- --project=chromium`

### Before Committing
```bash
# Required validation steps
npm run type-check    # Must pass
npm run build         # Must succeed  
npm run lint         # Review issues (doesn't block)
```

## Common Issues & Troubleshooting

### Build Issues
- **"Error: Input elements should have autocomplete attributes"**: Console warning, does not block builds
- **Font loading errors**: External font blocking, application works correctly
- **Linting errors**: Many existing issues (~72 total), focus only on your changes

### Server Issues  
- **Port 5173 in use**: Stop existing dev servers with Ctrl+C
- **Admin authentication fails**: Check `.env.local` admin credentials
- **API 401 errors**: Normal for admin routes without authentication

### Environment Issues
- **Missing dependencies**: Run `npm install` if modules not found
- **Node version issues**: Use Node.js 20 as specified in `.nvmrc`
- **Environment variables**: Copy `.env.example` to `.env.local` and configure

### Test Issues
- **E2E test failures**: Some tests expect scheduling API configuration - focus on UI functionality tests
- **Unit test dependencies**: Some tests require better-sqlite3 which isn't in main package.json

## File-Based Data Storage

The backend uses JSONL (JSON Lines) files for data persistence:
- **`messages.jsonl`** - Contact form submissions
- **`appointments.jsonl`** - Appointment bookings  
- Index files (`.idx.json`) for status updates

No database setup required - file storage is automatic.

## Performance & Accessibility

- **Target Lighthouse Score**: ≥95 accessibility  
- **WCAG 2.1 AA Compliant**: Design system with proper contrast ratios
- **Performance Monitoring**: Built-in performance metrics logging
- **Internationalization**: French primary, English support
- **Mobile-First**: Responsive design with Tailwind breakpoints