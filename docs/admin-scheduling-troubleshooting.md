# Admin Scheduling Troubleshooting Guide

This guide helps operators diagnose and fix common issues with the admin scheduling panel.

## New Login Flow

The admin panel now features an improved authentication experience:

### Login Button Functionality
- **"Se connecter (Basic Auth)"** button opens `/api/admin/scheduling/login` endpoint in a new tab
- This triggers the browser's HTTP Basic Authentication dialog
- Enter admin credentials when prompted
- Tab closes automatically after successful authentication
- Use **"Réessayer"** button to check if authentication succeeded

### Authentication Error Messages
The panel now provides specific error information:

- **401 with JSON response**: "Authentication required"
- **401 with HTML response**: "HTTP Basic Authentication required. The server is not accepting browser sessions."
- **HTML instead of JSON**: "Server returned HTML instead of JSON. This may indicate a proxy configuration issue."
- **Network errors**: "Unable to connect to admin API. Check your network connection."

### API Base URL Validation
The panel automatically validates the API configuration:
- Warns if using localhost URLs in production environments
- Shows current vs expected VITE_API_BASE_URL values
- Provides guidance on fixing configuration issues

## Health Endpoint

The admin scheduling system provides a health endpoint that can be used to diagnose configuration issues:

```bash
GET /api/admin/scheduling/health
```

This endpoint returns a JSON response with the current system status:

```json
{
  "ok": true,
  "adminEnabled": true,
  "hasCredentials": true,
  "hasActionTokenSecret": true,
  "db": {
    "connected": true,
    "tables": ["event_types", "bookings", "availability_rules", "availability_exceptions", "admin_audit_logs"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Login Endpoint

The system also provides a dedicated login endpoint to trigger Basic Authentication:

```bash
GET /api/admin/scheduling/login
```

**Unauthenticated response** (triggers browser auth prompt):
```
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic realm="Admin Panel"
Content-Type: application/json

{"error":"Authentication required"}
```

**Authenticated response**:
```
HTTP/1.1 204 No Content
```

This endpoint is used by the frontend login button to trigger the browser's Basic Auth dialog.

## Startup Configuration Logging

The server now logs admin configuration status on startup:

```
✅ Admin scheduling system initialized successfully
📋 Admin Configuration Status:
   • Admin Enabled: ✅
   • Credentials: ✅ Configured
   • Action Token: ✅ Configured
   • Login URL: http://localhost:3001/api/admin/scheduling/login
```

This logging helps operators quickly verify the admin configuration without exposing sensitive credentials.

## Required Environment Variables

The admin scheduling system requires the following environment variables to be configured:

### Essential Configuration

- **`ADMIN_ENABLED`**: Must be set to `"true"` to enable the admin panel
- **`ADMIN_USERNAME`**: Username for HTTP Basic Authentication
- **`ADMIN_PASSWORD`**: Password for HTTP Basic Authentication
- **`ACTION_TOKEN_SECRET`**: Secret key for securing booking action tokens

### Example Configuration

```bash
# Enable admin panel
ADMIN_ENABLED=true

# Basic Auth credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password_here

# Security token for booking actions
ACTION_TOKEN_SECRET=your_secret_key_here
```

## Common Error Codes and Solutions

### 503 Service Unavailable

#### `ADMIN_DISABLED`
**Cause**: Admin panel is disabled
**Solution**: Set `ADMIN_ENABLED=true` in environment variables and restart the server

#### `ADMIN_CREDENTIALS_MISSING`
**Cause**: Admin username or password not configured
**Solution**: Set both `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables

#### `ACTION_TOKEN_SECRET_MISSING`
**Cause**: Action token secret not configured
**Solution**: Set `ACTION_TOKEN_SECRET` environment variable to a secure random string

### 401 Unauthorized

**Cause**: Invalid or missing HTTP Basic Authentication credentials
**Solutions**:
1. Check that the username and password match the configured `ADMIN_USERNAME` and `ADMIN_PASSWORD`
2. Clear browser authentication cache and try again
3. Use a different browser or incognito mode

### 500 Internal Server Error

**Cause**: Database connection issues or server errors
**Solutions**:
1. Check the health endpoint to verify database connectivity
2. Review server logs for detailed error messages
3. Ensure the database file is accessible and not corrupted
4. Restart the server

### Network/Connection Errors

**Cause**: Cannot reach the admin API
**Solutions**:
1. Verify the server is running on the expected port
2. Check firewall settings
3. Verify the correct URL is being used
4. Check network connectivity

## Database Issues

### Missing Tables
If the health endpoint shows missing tables, the database schema may not be properly initialized.

**Solution**: Restart the server to trigger automatic schema initialization.

### Database Connection Failed
**Causes**:
- Database file permissions
- Disk space issues
- File system corruption

**Solutions**:
1. Check file permissions on the database file
2. Ensure sufficient disk space
3. Verify the database path in configuration

## Admin UI Diagnostics

When the admin panel fails to load, the UI will automatically:
1. Display the specific error message
2. Show the health check diagnostics
3. Provide guidance on configuration issues

The diagnostics panel shows:
- ✅ **Admin Panel**: Whether `ADMIN_ENABLED=true`
- ✅ **Credentials**: Whether `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set
- ✅ **Security Token**: Whether `ACTION_TOKEN_SECRET` is configured
- ✅ **Database**: Connection status and table count

## Validation Errors

### 400 Bad Request with `VALIDATION_ERROR`
**Cause**: Invalid input data sent to API endpoints
**Solution**: Check the request format and ensure all required fields are provided with correct data types

## Rate Limiting

The admin API has rate limiting (50 requests per 15 minutes). If you see:
```json
{
  "ok": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many admin requests, please try again later"
  }
}
```

**Solution**: Wait 15 minutes before making more requests.

## Troubleshooting Steps

1. **Check the health endpoint** first: `GET /api/admin/scheduling/health`
2. **Verify environment variables** are set correctly
3. **Check server logs** for detailed error messages
4. **Test basic connectivity** to the server
5. **Clear browser cache** and authentication data
6. **Try a different browser** or incognito mode
7. **Restart the server** if configuration changes were made

## Getting Help

If you continue to experience issues:
1. Collect the health endpoint response
2. Gather server logs from the time of the error
3. Note the specific error messages shown in the UI
4. Document the steps that led to the error

This information will help diagnose and resolve the issue quickly.