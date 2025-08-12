import nodemailer from 'nodemailer';
import { z } from 'zod';

/**
 * Email provider configuration schemas
 */
const SMTPConfigSchema = z.object({
  host: z.string(),
  port: z.number(),
  secure: z.boolean(),
  user: z.string(),
  pass: z.string()
});

const ResendConfigSchema = z.object({
  apiKey: z.string()
});

const PostmarkConfigSchema = z.object({
  token: z.string()
});

/**
 * Email data interface
 */
export interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
  icsAttachment?: {
    filename: string;
    content: string;
  };
  headers?: Record<string, string>;
}

/**
 * Email provider interface
 */
export interface EmailProvider {
  sendEmail(data: EmailData): Promise<void>;
}

/**
 * SMTP Email Provider using Nodemailer
 */
class SMTPProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private fromName: string;

  constructor(config: z.infer<typeof SMTPConfigSchema>, fromEmail: string, fromName: string) {
    this.fromEmail = fromEmail;
    this.fromName = fromName;
    
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });
  }

  async sendEmail(data: EmailData): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
      headers: data.headers
    };

    // Add ICS attachment if provided
    if (data.icsAttachment) {
      mailOptions.attachments = [{
        filename: data.icsAttachment.filename,
        content: data.icsAttachment.content,
        contentType: 'text/calendar; method=REQUEST'
      }];
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent via SMTP:', info.messageId);
    } catch (error) {
      console.error('❌ SMTP send error:', error);
      throw error;
    }
  }
}

/**
 * Resend Email Provider
 */
class ResendProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor(config: z.infer<typeof ResendConfigSchema>, fromEmail: string, fromName: string) {
    this.apiKey = config.apiKey;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  async sendEmail(data: EmailData): Promise<void> {
    const payload: any = {
      from: `${this.fromName} <${this.fromEmail}>`,
      to: [data.to],
      subject: data.subject,
      text: data.text,
      html: data.html,
      headers: data.headers
    };

    // Add ICS attachment if provided
    if (data.icsAttachment) {
      payload.attachments = [{
        filename: data.icsAttachment.filename,
        content: Buffer.from(data.icsAttachment.content).toString('base64'),
        content_type: 'text/calendar'
      }];
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('✅ Email sent via Resend:', result.id);
    } catch (error) {
      console.error('❌ Resend send error:', error);
      throw error;
    }
  }
}

/**
 * Postmark Email Provider
 */
class PostmarkProvider implements EmailProvider {
  private token: string;
  private fromEmail: string;
  private fromName: string;

  constructor(config: z.infer<typeof PostmarkConfigSchema>, fromEmail: string, fromName: string) {
    this.token = config.token;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  async sendEmail(data: EmailData): Promise<void> {
    const payload: any = {
      From: `${this.fromName} <${this.fromEmail}>`,
      To: data.to,
      Subject: data.subject,
      TextBody: data.text,
      HtmlBody: data.html,
      Headers: data.headers ? Object.entries(data.headers).map(([Name, Value]) => ({ Name, Value })) : []
    };

    // Add ICS attachment if provided
    if (data.icsAttachment) {
      payload.Attachments = [{
        Name: data.icsAttachment.filename,
        Content: Buffer.from(data.icsAttachment.content).toString('base64'),
        ContentType: 'text/calendar'
      }];
    }

    try {
      const response = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': this.token
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Postmark API error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('✅ Email sent via Postmark:', result.MessageID);
    } catch (error) {
      console.error('❌ Postmark send error:', error);
      throw error;
    }
  }
}

/**
 * Development/Log-only Email Provider
 */
class LogProvider implements EmailProvider {
  async sendEmail(data: EmailData): Promise<void> {
    console.log('\n📧 EMAIL NOTIFICATION (DEV MODE)');
    console.log('=====================================');
    console.log(`To: ${data.to}`);
    console.log(`Subject: ${data.subject}`);
    console.log('\n--- TEXT CONTENT ---');
    console.log(data.text);
    console.log('\n--- HTML CONTENT ---');
    console.log(data.html);
    if (data.icsAttachment) {
      console.log(`\n--- ICS ATTACHMENT ---`);
      console.log(`Filename: ${data.icsAttachment.filename}`);
      console.log('ICS Content:');
      console.log(data.icsAttachment.content);
    }
    if (data.headers) {
      console.log('\n--- HEADERS ---');
      console.log(JSON.stringify(data.headers, null, 2));
    }
    console.log('=====================================\n');
  }
}

/**
 * Email Service Factory
 */
export class EmailService {
  private provider: EmailProvider;
  private isEnabled: boolean;

  constructor() {
    const emailProvider = process.env.EMAIL_PROVIDER;
    const fromEmail = process.env.FROM_EMAIL || 'noreply@maxence.design';
    const fromName = process.env.FROM_NAME || 'Maxence FOULON';
    this.isEnabled = process.env.ENABLE_NOTIFICATIONS === 'true';

    // Create provider based on configuration
    switch (emailProvider) {
      case 'smtp':
        this.provider = this.createSMTPProvider(fromEmail, fromName);
        break;
      case 'resend':
        this.provider = this.createResendProvider(fromEmail, fromName);
        break;
      case 'postmark':
        this.provider = this.createPostmarkProvider(fromEmail, fromName);
        break;
      default:
        // Development mode or no provider configured
        this.provider = new LogProvider();
        console.log('📧 Email service initialized in LOG-ONLY mode');
        break;
    }

    if (emailProvider && this.isEnabled) {
      console.log(`📧 Email service initialized with provider: ${emailProvider}`);
    } else if (!this.isEnabled) {
      console.log('📧 Email notifications are DISABLED');
    }
  }

  private createSMTPProvider(fromEmail: string, fromName: string): EmailProvider {
    const config = {
      host: process.env.SMTP_HOST!,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!
    };

    const validation = SMTPConfigSchema.safeParse(config);
    if (!validation.success) {
      console.error('❌ Invalid SMTP configuration:', validation.error.issues);
      throw new Error('Invalid SMTP configuration');
    }

    return new SMTPProvider(validation.data, fromEmail, fromName);
  }

  private createResendProvider(fromEmail: string, fromName: string): EmailProvider {
    const config = {
      apiKey: process.env.RESEND_API_KEY!
    };

    const validation = ResendConfigSchema.safeParse(config);
    if (!validation.success) {
      console.error('❌ Invalid Resend configuration:', validation.error.issues);
      throw new Error('Invalid Resend configuration');
    }

    return new ResendProvider(validation.data, fromEmail, fromName);
  }

  private createPostmarkProvider(fromEmail: string, fromName: string): EmailProvider {
    const config = {
      token: process.env.POSTMARK_TOKEN!
    };

    const validation = PostmarkConfigSchema.safeParse(config);
    if (!validation.success) {
      console.error('❌ Invalid Postmark configuration:', validation.error.issues);
      throw new Error('Invalid Postmark configuration');
    }

    return new PostmarkProvider(validation.data, fromEmail, fromName);
  }

  /**
   * Send an email using the configured provider
   */
  async sendEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
    if (!this.isEnabled) {
      console.log('📧 Email notifications disabled - would have sent:', data.subject);
      return { success: true };
    }

    try {
      await this.provider.sendEmail(data);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Email send failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Test email sending with the current configuration
   */
  async sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
    const testData: EmailData = {
      to,
      subject: 'Test Email from Portfolio Scheduler',
      text: `This is a test email from your Portfolio Scheduler notification system.

Configuration Test:
- Provider: ${process.env.EMAIL_PROVIDER || 'log-only'}
- From: ${process.env.FROM_NAME || 'Maxence FOULON'} <${process.env.FROM_EMAIL || 'noreply@maxence.design'}>
- Timestamp: ${new Date().toISOString()}

If you received this email, your notification system is working correctly!`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Test Email</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .success { color: #10B981; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Test Email</h1>
            <p>Portfolio Scheduler Notification System</p>
        </div>
        <div class="content">
            <p class="success">✅ Configuration Test Successful!</p>
            <p>This is a test email from your Portfolio Scheduler notification system.</p>
            
            <h3>Configuration Details:</h3>
            <ul>
                <li><strong>Provider:</strong> ${process.env.EMAIL_PROVIDER || 'log-only'}</li>
                <li><strong>From:</strong> ${process.env.FROM_NAME || 'Maxence FOULON'} &lt;${process.env.FROM_EMAIL || 'noreply@maxence.design'}&gt;</li>
                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
            
            <p>If you received this email, your notification system is working correctly!</p>
        </div>
    </div>
</body>
</html>`
    };

    return this.sendEmail(testData);
  }
}