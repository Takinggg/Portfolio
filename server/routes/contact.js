import express from 'express';
import { rateLimit } from '../lib/rateLimit.js';
import { appendJSONL } from '../lib/fsdb.js';
import { sendMail } from '../lib/smtp.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    
    // Rate limiting
    const allowed = await rateLimit('contact', clientIP);
    if (!allowed) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const { name, email, phone, subject, message, hp, a, b, answer } = req.body;

    // Honeypot check
    if (hp && hp.trim() !== '') {
      return res.status(400).json({ error: 'Invalid submission' });
    }

    // Simple captcha check
    const expectedAnswer = parseInt(a) + parseInt(b);
    if (parseInt(answer) !== expectedAnswer) {
      return res.status(400).json({ error: 'Incorrect captcha answer' });
    }

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Create message record
    const messageRecord = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ip: clientIP
    };

    // Store in file
    await appendJSONL('messages.jsonl', messageRecord);

    // Send confirmation email
    try {
      if (process.env.SMTP_HOST && process.env.MAIL_FROM) {
        await sendMail({
          to: email,
          from: process.env.MAIL_FROM,
          subject: `Confirmation: ${subject}`,
          html: `
            <h2>Message reçu</h2>
            <p>Bonjour ${name},</p>
            <p>Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.</p>
            <p><strong>Sujet:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p>Merci de votre confiance.</p>
          `
        });
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      id: messageRecord.id 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;