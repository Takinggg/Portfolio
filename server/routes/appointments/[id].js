import express from 'express';
import { readJSON, writeJSON } from '../../lib/fsdb.js';

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

// PATCH /api/appointments/:id - Update appointment status
router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Appointment ID required' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    // Validate status
    const validStatuses = ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }

    // Load and update status index
    const statusIndex = await readJSON('appointments.idx.json', {});
    statusIndex[id] = {
      status,
      updatedAt: new Date().toISOString()
    };

    await writeJSON('appointments.idx.json', statusIndex);

    res.json({
      success: true,
      message: 'Status updated successfully',
      id,
      status
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;