import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import route handlers - note: using relative paths with .js extension for ES modules
import contactRoute from './routes/contact.js';
import appointmentAvailabilityRoute from './routes/appointments/availability.js';
import appointmentBookRoute from './routes/appointments/book.js';
import messagesRoute from './routes/messages.js';
import messageByIdRoute from './routes/messages/[id].js';
import appointmentsRoute from './routes/appointments.js';
import appointmentByIdRoute from './routes/appointments/[id].js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.VITE_FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/contact', contactRoute);
app.use('/api/appointments/availability', appointmentAvailabilityRoute);
app.use('/api/appointments/book', appointmentBookRoute);
app.use('/api/messages', messagesRoute);
app.use('/api/messages', messageByIdRoute);
app.use('/api/appointments', appointmentsRoute);
app.use('/api/appointments', appointmentByIdRoute);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Admin Configuration Status:`);
  console.log(`   • Admin Enabled: ${process.env.ADMIN_ENABLED === 'true' ? '✅' : '❌'}`);
  console.log(`   • Credentials: ${process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   • SMTP: ${process.env.SMTP_HOST ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   • Google Calendar: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Missing'}`);
});