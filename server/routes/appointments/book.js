import express from 'express';
import { rateLimit } from '../../lib/rateLimit.js';
import { appendJSONL, readJSONL } from '../../lib/fsdb.js';
import { calendarFreeBusy, calendarInsertEvent } from '../../lib/google.js';
import { sendMail } from '../../lib/smtp.js';
import { buildICS } from '../../lib/ics.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    
    // Rate limiting
    const allowed = await rateLimit('book', clientIP);
    if (!allowed) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    // Idempotency key check
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
      return res.status(400).json({ error: 'Idempotency-key header required' });
    }

    // Check if this idempotency key was already used
    const existingAppointments = await readJSONL('appointments.jsonl');
    const existingAppointment = existingAppointments.find(apt => apt.idempotencyKey === idempotencyKey);
    if (existingAppointment) {
      return res.json({
        success: true,
        appointment: existingAppointment,
        message: 'Appointment already exists'
      });
    }

    const { startTime, duration = 30, name, email, phone, notes } = req.body;

    // Validation
    if (!startTime || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields: startTime, name, email' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const appointmentStart = new Date(startTime);
    const appointmentEnd = new Date(appointmentStart.getTime() + duration * 60000);

    if (isNaN(appointmentStart.getTime())) {
      return res.status(400).json({ error: 'Invalid start time format' });
    }

    // Check if the slot is still available
    // 1. Check against Google Calendar
    try {
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN) {
        const busySlots = await calendarFreeBusy({
          fromISO: appointmentStart.toISOString(),
          toISO: appointmentEnd.toISOString()
        });

        const hasConflict = busySlots.some(busy => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          return appointmentStart < busyEnd && appointmentEnd > busyStart;
        });

        if (hasConflict) {
          return res.status(409).json({ error: 'Time slot no longer available' });
        }
      }
    } catch (googleError) {
      console.warn('Google Calendar conflict check failed:', googleError);
    }

    // 2. Check against existing appointments
    const confirmedAppointments = existingAppointments.filter(apt => 
      apt.status === 'CONFIRMED' || apt.status === 'confirmed'
    );

    const hasLocalConflict = confirmedAppointments.some(apt => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      return appointmentStart < aptEnd && appointmentEnd > aptStart;
    });

    if (hasLocalConflict) {
      return res.status(409).json({ error: 'Time slot no longer available' });
    }

    // Create appointment record
    const appointmentRecord = {
      id: crypto.randomUUID(),
      idempotencyKey,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      startTime: appointmentStart.toISOString(),
      endTime: appointmentEnd.toISOString(),
      duration,
      notes: notes?.trim(),
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ip: clientIP
    };

    // Create Google Calendar event
    let calendarEventId = null;
    try {
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN) {
        calendarEventId = await calendarInsertEvent({
          summary: `RDV avec ${name}`,
          startISO: appointmentStart.toISOString(),
          endISO: appointmentEnd.toISOString(),
          attendees: [{ email }]
        });
        appointmentRecord.calendarEventId = calendarEventId;
      }
    } catch (googleError) {
      console.error('Failed to create Google Calendar event:', googleError);
      // Continue without Google Calendar event
    }

    // Store appointment
    await appendJSONL('appointments.jsonl', appointmentRecord);

    // Send confirmation email with ICS attachment
    try {
      if (process.env.SMTP_HOST && process.env.MAIL_FROM) {
        const icsContent = buildICS({
          title: `RDV téléphonique avec Maxence`,
          start: appointmentStart,
          end: appointmentEnd
        });

        await sendMail({
          to: email,
          from: process.env.MAIL_FROM,
          subject: `Confirmation de rendez-vous - ${appointmentStart.toLocaleDateString('fr-FR')}`,
          html: `
            <h2>Rendez-vous confirmé</h2>
            <p>Bonjour ${name},</p>
            <p>Votre rendez-vous téléphonique a été confirmé pour :</p>
            <ul>
              <li><strong>Date :</strong> ${appointmentStart.toLocaleDateString('fr-FR')}</li>
              <li><strong>Heure :</strong> ${appointmentStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</li>
              <li><strong>Durée :</strong> ${duration} minutes</li>
            </ul>
            ${notes ? `<p><strong>Notes :</strong> ${notes}</p>` : ''}
            <p>Vous recevrez un appel au numéro : ${phone || 'numéro à confirmer'}</p>
            <p>En pièce jointe, vous trouverez un fichier ICS à ajouter à votre calendrier.</p>
            <hr>
            <p>À bientôt !</p>
          `,
          attachments: [{
            filename: 'rdv.ics',
            content: icsContent,
            contentType: 'text/calendar'
          }]
        });
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      appointment: appointmentRecord,
      message: 'Appointment booked successfully'
    });

  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;