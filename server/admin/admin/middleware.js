/**
 * Basic Auth middleware for admin routes
 * Checks ADMIN_USERNAME and ADMIN_PASSWORD environment variables
 */
export function basicAuthMiddleware(req, res, next) {
    // Check if admin panel is enabled
    const adminEnabled = process.env.ADMIN_ENABLED === 'true';
    if (!adminEnabled) {
        res.status(404).json({ error: 'Admin panel is disabled' });
        return;
    }
    // Get credentials from environment
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminUsername || !adminPassword) {
        console.error('Admin credentials not configured in environment variables');
        res.status(500).json({ error: 'Admin authentication not configured' });
        return;
    }
    // Parse Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    // Decode credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    // Validate credentials
    if (username !== adminUsername || password !== adminPassword) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    // Store authenticated admin user
    req.adminUser = username;
    next();
}
/**
 * Extract client IP address from request
 */
export function getClientIP(req) {
    return (req.headers['x-forwarded-for']?.split(',')[0] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        'unknown');
}
/**
 * Extract User-Agent from request
 */
export function getUserAgent(req) {
    return req.headers['user-agent'] || 'unknown';
}
