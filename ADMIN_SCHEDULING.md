# Admin Scheduling Panel

This document explains how to set up and use the Admin Scheduling Panel for managing the scheduling system.

## Overview

The Admin Scheduling Panel provides a web-based interface for administrators to manage:
- Event types (meeting types with duration, location, settings)
- Availability rules (weekly recurring schedules)
- Availability exceptions (holidays, special hours)
- Bookings (view, cancel, reschedule, export)

## Setup

### Environment Variables

Add the following environment variables to enable the admin panel:

```bash
# Required - Enable admin panel
ADMIN_ENABLED=true

# Required - Admin credentials
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password

# Required - Token secret for booking actions
ACTION_TOKEN_SECRET=your-secure-token-secret-change-in-production

# Optional - SMTP configuration for email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
```

### For Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set the admin credentials:
   ```bash
   ADMIN_ENABLED=true
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   ACTION_TOKEN_SECRET=your-secret-key
   ```

3. Start the development servers:
   ```bash
   # Start backend (Terminal 1)
   npm run server
   
   # Start frontend (Terminal 2)
   npm run dev
   ```

### For Production

1. Set environment variables in your hosting platform:
   - **Render.com**: Go to Environment tab in your service settings
   - **Railway**: Use the Variables tab
   - **Heroku**: Use Config Vars in settings

2. **Security Note**: Never use default credentials in production!

## Accessing the Admin Panel

1. **URL**: Navigate to `/admin/scheduling` on your domain
   - Development: `http://localhost:5173/admin/scheduling`
   - Production: `https://your-domain.com/admin/scheduling`

2. **Authentication**: The panel uses HTTP Basic Authentication
   - Your browser will prompt for username/password
   - Use the credentials from your environment variables
   - Authentication is handled server-side for security

## Features

### Overview Dashboard
- Real-time statistics (bookings, event types, availability)
- Recent admin activity logs
- Quick action buttons

### Event Types Management
- Create, edit, delete meeting types
- Configure duration, location type, colors
- Set booking limits and lead times
- Buffer time settings

### Availability Management
- **Rules**: Set weekly recurring availability
  - Define hours for each day of the week
  - Multiple time slots per day supported
  - Timezone configuration
- **Exceptions**: Override rules for specific dates
  - Mark days as unavailable (holidays)
  - Set custom hours for special days

### Bookings Management
- View all bookings with filters:
  - Date range, status, event type
  - Search by name or email
- Actions:
  - Cancel bookings with reason
  - Reschedule to new times
  - Email invitees directly
- Export bookings to CSV

## API Security

- All admin endpoints require Basic Authentication
- Rate limiting: 50 requests per 15 minutes
- Audit logging of all admin actions
- No admin access without proper environment setup

## Troubleshooting

### "Admin panel is disabled" error
- Ensure `ADMIN_ENABLED=true` in environment
- Restart the server after changing environment variables

### Authentication not working
- Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set
- Verify credentials are correct (case-sensitive)
- Try refreshing the page or clearing browser cache

### Database errors
- Ensure database is accessible and has correct schema
- Check server logs for specific database errors
- Verify scheduling tables exist

### Frontend not loading
- Check if frontend dev server is running (`npm run dev`)
- Verify backend API is accessible
- Check browser console for JavaScript errors

## Development

### File Structure
```
server/admin/           # Backend admin routes
├── middleware.ts       # Basic Auth middleware
├── routes.ts          # Admin API endpoints
└── audit.ts           # Audit logging

src/admin/             # Frontend admin components
├── AdminOverview.tsx          # Dashboard
├── AdminSchedulingLayout.tsx  # Main layout
├── EventTypesManager.tsx      # Event types CRUD
├── AvailabilityManager.tsx    # Rules & exceptions
└── BookingsManager.tsx        # Bookings management
```

### Adding New Features

1. **Backend**: Add routes in `server/admin/routes.ts`
2. **Frontend**: Create components in `src/admin/`
3. **Navigation**: Update `AdminSchedulingLayout.tsx`
4. **Types**: Update interfaces as needed

### Testing

- API endpoints: Use curl or Postman with Basic Auth
- Frontend: Access `/admin/scheduling` in browser
- Database: Check audit logs in `admin_audit_logs` table

## Security Best Practices

1. **Strong Credentials**: Use complex admin passwords
2. **HTTPS**: Always use HTTPS in production
3. **Environment Security**: Never commit secrets to git
4. **Regular Updates**: Monitor for security updates
5. **Access Logging**: Review audit logs regularly

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify environment configuration
3. Test API endpoints directly with curl
4. Review browser console for frontend errors