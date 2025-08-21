import express from 'express';
import { rateLimit } from '../../lib/rateLimit.js';
import { computeSlots } from '../../lib/slots.js';
import { calendarFreeBusy } from '../../lib/google.js';
import { readJSONL } from '../../lib/fsdb.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    
    // Rate limiting
    const allowed = await rateLimit('availability', clientIP);
    if (!allowed) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const { from, to, duration = 30 } = req.body;

    // Validation
    if (!from || !to) {
      return res.status(400).json({ error: 'Missing from or to date' });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (fromDate >= toDate) {
      return res.status(400).json({ error: 'From date must be before to date' });
    }

    // Generate slots based on availability
    let slots = await computeSlots({
      fromISO: from,
      toISO: to,
      durationMin: duration
    });

    // Filter against Google Calendar if configured
    try {
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN) {
        const busySlots = await calendarFreeBusy({ fromISO: from, toISO: to });
        
        // Filter out busy slots
        slots = slots.filter(slot => {
          const slotStart = new Date(slot);
          const slotEnd = new Date(slotStart.getTime() + duration * 60000);
          
          return !busySlots.some(busy => {
            const busyStart = new Date(busy.start);
            const busyEnd = new Date(busy.end);
            
            // Check for overlap
            return slotStart < busyEnd && slotEnd > busyStart;
          });
        });
      }
    } catch (googleError) {
      console.warn('Google Calendar check failed:', googleError);
      // Continue without Google filtering
    }

    // Filter against existing appointments
    const existingAppointments = await readJSONL('appointments.jsonl');
    const confirmedAppointments = existingAppointments.filter(apt => 
      apt.status === 'CONFIRMED' || apt.status === 'confirmed'
    );

    slots = slots.filter(slot => {
      const slotStart = new Date(slot);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);
      
      return !confirmedAppointments.some(apt => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);
        
        // Check for overlap
        return slotStart < aptEnd && slotEnd > aptStart;
      });
    });

    res.json({ 
      success: true, 
      slots: slots.slice(0, 50), // Limit to 50 slots
      total: slots.length 
    });

  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;