import express from 'express';
import { readJSONL, readJSON } from '../lib/fsdb.js';

const router = express.Router();

// Simple authentication middleware (basic auth)
const authenticateAdmin = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const credentials = Buffer.from(auth.slice(6), 'base64').toString();
  const [username, password] = credentials.split(':');
  
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  next();
};

// GET /api/appointments - List appointments with pagination
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { skip = 0, take = 20 } = req.query;
    
    let appointments = await readJSONL('appointments.jsonl');
    
    // Sort by newest first
    appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const total = appointments.length;
    const skipNum = parseInt(skip);
    const takeNum = parseInt(take);
    const paginatedAppointments = appointments.slice(skipNum, skipNum + takeNum);

    // Load status index for current statuses
    const statusIndex = await readJSON('appointments.idx.json', {});
    const appointmentsWithStatus = paginatedAppointments.map(apt => ({
      ...apt,
      status: statusIndex[apt.id]?.status || apt.status || 'CONFIRMED'
    }));

    res.json({
      success: true,
      appointments: appointmentsWithStatus,
      total,
      skip: skipNum,
      take: takeNum
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;