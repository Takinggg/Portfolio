# Frontend-Backend Connectivity Fix

**NOTE:** This documentation has been updated to use the custom domain `back.maxence.design` instead of the old Render default domain. The old domain may still work as a fallback during DNS propagation if still active.

## Issue Resolved
The "Serveur injoignable. Réessayez plus tard." (Server unreachable. Try again later.) error has been successfully fixed.

## Root Causes Identified

1. **Missing Environment Configuration**: No `.env` file existed, causing the frontend to use inconsistent default URLs
2. **Inconsistent Environment Variable Names**: Different API clients were looking for different environment variables:
   - `VITE_API_URL` vs `VITE_API_BASE_URL`
   - Mixed usage across multiple API client files
3. **Incorrect Default Backend URLs**: Some files defaulted to port 3000 instead of 3001
4. **Generic Error Messages**: No specific diagnostic information for connectivity issues

## Fixes Applied

### 1. Created .env File
- Added proper environment configuration for local development
- Standardized `VITE_API_BASE_URL=http://localhost:3001/api`
- Included all necessary environment variables

### 2. Standardized Environment Variables
- Fixed `src/ApiClient.ts` to use `VITE_API_BASE_URL` instead of `VITE_API_URL`
- Updated `src/api.ts` to prioritize `VITE_API_BASE_URL`
- Ensured consistent backend URL across all API clients

### 3. Enhanced Error Handling
- Improved error messages in `src/lib/api.ts` to include specific backend URL information
- Added diagnostic information in admin login component
- Enhanced error messages to help users troubleshoot connectivity issues

### 4. Improved Admin Login Error Display
- Added detailed diagnostic information when connectivity fails
- Included instructions for starting the backend server
- Show current backend URL configuration

## Verification

✅ **Backend Health Check**: `curl http://localhost:3001/api/health` returns `{"ok":true,"ts":...}`  
✅ **Admin Authentication**: Successfully logged in with `admin/password`  
✅ **Articles Management**: Retrieved 5 articles from backend database  
✅ **Data Persistence**: Articles are correctly stored and retrieved from SQLite database  
✅ **CORS Configuration**: Backend accepts requests from frontend on localhost:5173  
✅ **JWT Authentication**: Token-based authentication working correctly  

## Setup Instructions

### 1. Environment Configuration
Ensure `.env` file exists with:
```
VITE_API_BASE_URL=http://localhost:3001/api
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 2. Start Backend Server
```bash
npm run server
```
Backend runs on: http://localhost:3001

### 3. Start Frontend Development Server
```bash
npm run dev
```
Frontend runs on: http://localhost:5173

### 4. Test Connectivity
- Navigate to http://localhost:5173/admin
- Login with credentials: `admin` / `password`
- Verify articles are loaded from backend

## Backend Configuration

### CORS Settings
The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (alternative dev port)
- `http://127.0.0.1:5173` and `http://127.0.0.1:3000`
- Production domains when `NODE_ENV=production`

### Database
- SQLite database: `server/portfolio.db`
- Auto-initialized with sample data
- Default admin user: `admin/password`

## Network Diagnostics

If connectivity issues persist, check:

1. **Backend Status**: Verify backend is running on port 3001
2. **Environment Variables**: Ensure `.env` file exists and contains `VITE_API_BASE_URL`
3. **Port Conflicts**: Ensure no other services are using port 3001
4. **Firewall/Proxy**: Check for any network blocking between frontend and backend

## Error Messages

### Before Fix
- Generic: "Serveur injoignable. Réessayez plus tard."

### After Fix
- Specific: "Serveur injoignable à l'adresse http://localhost:3001/api. Vérifiez que le backend est démarré sur le port 3001."
- Includes diagnostic information and troubleshooting steps

## Production Deployment

### Frontend (Netlify)
Environment variable automatically set in `netlify.toml`:
```toml
VITE_API_BASE_URL = "https://back.maxence.design/api"
```

### Backend (Render)
Environment variables automatically configured:
- `NODE_ENV=production`
- `PORT=10000`
- `JWT_SECRET` (auto-generated)

The application now successfully handles both development and production environments with proper fallbacks and clear error messaging.