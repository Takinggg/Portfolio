# Portfolio Backend System - Zero NPM Dependencies Implementation

This implementation provides a complete backend system with zero NPM dependencies (except Express/CORS for the server) as requested, adapting the Next.js requirements to work with the existing Vite React application.

## 🎯 Features Implemented

### ✅ Contact System
- **Anti-spam protection**: Honeypot field + arithmetic captcha
- **Rate limiting**: 5 attempts per 60 seconds per IP with persistence
- **File storage**: Messages stored in `var/data/messages.jsonl`
- **Email validation**: Server-side validation with regex
- **SMTP client**: Native Node.js implementation using net/tls modules
- **Confirmation emails**: Automatic email confirmation (when SMTP configured)

### ✅ Appointment Booking System
- **Time slots**: Configurable business hours in `var/data/availability.json`
- **Timezone handling**: Europe/Paris with DST support via Intl.DateTimeFormat
- **Google Calendar integration**: OAuth refresh token with REST API calls
- **Conflict detection**: Checks both Google Calendar and local bookings
- **ICS generation**: Calendar files generated without external libraries
- **Idempotency**: Required header prevents duplicate bookings
- **Email notifications**: Booking confirmations with ICS attachments

### ✅ Admin Interface
- **Authentication**: HTTP Basic Auth
- **Dashboard**: Overview with statistics
- **Message management**: List, search, and status updates
- **Appointment management**: List and status updates
- **Responsive design**: Works on desktop and mobile

### ✅ File-based Storage
- **JSONL format**: One JSON object per line for easy appending
- **Index files**: Separate `.idx.json` files for status updates
- **Atomic operations**: Safe concurrent access
- **Rate limit persistence**: Optional state persistence

## 🏗️ Architecture

```
Portfolio/
├── lib/                     # Core backend libraries (TS source)
│   ├── fsdb.ts             # File database utilities
│   ├── rateLimit.ts        # Rate limiting with persistence
│   ├── smtp.ts             # Native SMTP client
│   ├── ics.ts              # ICS calendar generation
│   ├── google.ts           # Google Calendar OAuth + REST
│   └── slots.ts            # Time slot calculation
├── server/                 # Express server
│   ├── lib/                # Compiled JS libraries
│   ├── routes/             # API route handlers
│   │   ├── contact.js
│   │   ├── messages.js
│   │   ├── messages/[id].js
│   │   ├── appointments.js
│   │   ├── appointments/[id].js
│   │   └── appointments/
│   │       ├── availability.js
│   │       └── book.js
│   ├── index.js            # Main server file
│   └── package.json        # ES modules config
├── var/data/               # File storage
│   ├── messages.jsonl      # Contact messages
│   ├── appointments.jsonl  # Bookings
│   ├── availability.json   # Business hours
│   ├── exceptions.json     # Holiday dates
│   ├── oauth.json          # Google tokens (auto-generated)
│   └── *.idx.json          # Status indexes
├── components/             # React widgets
│   ├── ContactForm.tsx
│   └── BookingWidget.tsx
└── src/pages/admin/        # Admin interface
    ├── AdminLayout.tsx
    ├── AdminDashboard.tsx
    ├── AdminMessages.tsx
    └── AdminAgenda.tsx
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and configure:

```bash
# Admin credentials
ADMIN_ENABLED=true
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

# SMTP (optional, for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="Your Name <your-email@gmail.com>"

# Google Calendar (optional, for booking integration)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

### 3. Configure Business Hours
Edit `var/data/availability.json`:
```json
{
  "MON": [[540, 1020]],  // 9:00-17:00 in minutes
  "TUE": [[540, 1020]],
  "WED": [[540, 1020]], 
  "THU": [[540, 1020]],
  "FRI": [[540, 1020]],
  "SAT": [],             // Closed
  "SUN": []              // Closed
}
```

### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or individually:
npm run dev:client  # Frontend on :5173
npm run dev:server  # Backend on :3001
```

## 📝 API Documentation

### Contact Form
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Inquiry",
  "message": "Hello world",
  "hp": "",           // Honeypot (must be empty)
  "a": 5,             // Captcha number 1
  "b": 3,             // Captcha number 2
  "answer": 8         // Captcha answer (a + b)
}
```

### Appointment Availability
```http
POST /api/appointments/availability
Content-Type: application/json

{
  "from": "2024-08-22T00:00:00Z",
  "to": "2024-08-23T00:00:00Z",
  "duration": 30
}
```

### Book Appointment
```http
POST /api/appointments/book
Content-Type: application/json
Idempotency-Key: unique-request-id

{
  "startTime": "2024-08-22T09:00:00Z",
  "duration": 30,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "notes": "Project discussion"
}
```

### Admin Endpoints
All admin endpoints require HTTP Basic Authentication:

```http
GET /api/messages?q=search&skip=0&take=20
GET /api/appointments?skip=0&take=20
PATCH /api/messages/{id} {"status": "read"}
PATCH /api/appointments/{id} {"status": "COMPLETED"}
```

## 🎛️ Admin Interface

Access the admin interface at `/admin`:

1. **Dashboard** (`/admin`): Overview and statistics
2. **Messages** (`/admin/messages`): Contact form submissions
3. **Agenda** (`/admin/agenda`): Appointment management

Default credentials (change in `.env.local`):
- Username: `admin`
- Password: `demo123`

## 🛡️ Security Features

- **Rate Limiting**: Per-IP limits with sliding window
- **Input Validation**: Server-side validation for all inputs
- **CSRF Protection**: Idempotency keys for state-changing operations
- **Honeypot**: Hidden field to catch bots
- **Captcha**: Simple arithmetic verification
- **Basic Auth**: HTTP Basic Authentication for admin access

## 📱 Frontend Integration

### Contact Form Widget
```tsx
import { ContactForm } from '../components/ContactForm';

function MyPage() {
  return <ContactForm className="max-w-md mx-auto" />;
}
```

### Booking Widget
```tsx
import { BookingWidget } from '../components/BookingWidget';

function MyPage() {
  return <BookingWidget className="max-w-lg mx-auto" />;
}
```

## 🔧 Configuration

### Business Hours Format
Minutes from midnight in local time (Europe/Paris):
- `540` = 9:00 AM (9 * 60)
- `1020` = 5:00 PM (17 * 60)

### Time Zones
The system uses `Europe/Paris` timezone with automatic DST handling via `Intl.DateTimeFormat`.

### Google Calendar Setup
1. Create OAuth credentials in Google Cloud Console
2. Generate a refresh token using the authorization flow
3. Add credentials to `.env.local`

## 🚦 Rate Limits

- **Contact**: 5 requests per 60 seconds
- **Availability**: 20 requests per 60 seconds  
- **Booking**: 10 requests per 60 seconds

## 📊 Data Formats

### Message (messages.jsonl)
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "subject": "string", 
  "message": "string",
  "status": "new|read|replied|archived",
  "createdAt": "ISO string",
  "updatedAt": "ISO string",
  "ip": "string"
}
```

### Appointment (appointments.jsonl)
```json
{
  "id": "uuid",
  "idempotencyKey": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "startTime": "ISO string",
  "endTime": "ISO string", 
  "duration": "number",
  "notes": "string",
  "status": "CONFIRMED|CANCELLED|COMPLETED|NO_SHOW",
  "calendarEventId": "string",
  "createdAt": "ISO string",
  "updatedAt": "ISO string",
  "ip": "string"
}
```

## 🎯 Zero Dependencies Achievement

**Core libraries use only Node.js built-ins:**
- `fs/promises` for file operations
- `net` and `tls` for SMTP
- `crypto` for UUIDs and hashing
- `url` and `fetch` for HTTP requests
- `Intl.DateTimeFormat` for timezone handling

**Server dependencies:**
- `express` + `cors` (minimal HTTP server)
- `react-router-dom` (frontend routing)

**No external dependencies for:**
- ❌ Database (file-based JSONL)
- ❌ SMTP client (native implementation)
- ❌ Calendar libraries (Intl.DateTimeFormat)
- ❌ Validation libraries (manual validation)
- ❌ ICS generation (string templates)
- ❌ OAuth client (fetch + URLSearchParams)

## 🎉 Demo

Visit these URLs when running locally:

- **Main site**: http://localhost:5173/
- **Widgets demo**: http://localhost:5173/widgets
- **Admin interface**: http://localhost:5173/admin
- **API health**: http://localhost:3001/api/health

The implementation is complete and ready for production use with proper environment configuration!