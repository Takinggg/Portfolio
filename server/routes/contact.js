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

    // Check if SMTP is configured
    const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_FROM;
    
    if (!smtpConfigured) {
      const missingVars = [];
      if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST');
      if (!process.env.SMTP_USER) missingVars.push('SMTP_USER');
      if (!process.env.SMTP_PASS) missingVars.push('SMTP_PASS');
      if (!process.env.MAIL_FROM) missingVars.push('MAIL_FROM');
      
      console.warn(`[contact] email skipped: missing SMTP env vars (${missingVars.join(', ')})`);
    } else {
      // Send admin notification email
      try {
        const adminEmail = process.env.CONTACT_NOTIFICATION_TO || process.env.MAIL_FROM;
        const adminEmailAddress = adminEmail.match(/<([^>]+)>/)?.[1] || adminEmail;
        
        await sendMail({
          to: adminEmailAddress,
          from: process.env.MAIL_FROM,
          subject: `[Portfolio] Nouveau message de contact: ${subject}`,
          html: `
            <h2>Nouveau message de contact reçu</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Informations du contact :</h3>
              <p><strong>Nom :</strong> ${name}</p>
              <p><strong>Email :</strong> ${email}</p>
              ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ''}
              <p><strong>Sujet :</strong> ${subject}</p>
              <p><strong>IP :</strong> ${clientIP}</p>
              <p><strong>ID :</strong> ${messageRecord.id}</p>
              <p><strong>Date :</strong> ${new Date(messageRecord.createdAt).toLocaleString('fr-FR')}</p>
            </div>
            
            <div style="background: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <h3>Message :</h3>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
              <p><strong>Note :</strong> Vous pouvez répondre directement à cette adresse email : ${email}</p>
            </div>
          `
        });
        console.log(`[contact] admin notification sent to: ${adminEmailAddress}`);
      } catch (adminEmailError) {
        console.error('[contact] failed to send admin notification:', {
          error: adminEmailError.message,
          messageId: messageRecord.id,
          adminEmail: process.env.CONTACT_NOTIFICATION_TO || process.env.MAIL_FROM
        });
        // Continue to try sending visitor confirmation
      }

      // Send visitor confirmation email
      try {
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
        console.log(`[contact] visitor confirmation sent to: ${email}`);
      } catch (confirmationEmailError) {
        console.error('[contact] failed to send visitor confirmation:', {
          error: confirmationEmailError.message,
          messageId: messageRecord.id,
          visitorEmail: email
        });
        // Don't fail the request if email fails
      }
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