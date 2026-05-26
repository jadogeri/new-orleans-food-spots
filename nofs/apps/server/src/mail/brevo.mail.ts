// brevo.mail.ts
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'node:path';
import * as nodemailer from 'nodemailer';
import { logger } from '../lib/logger';

// Converted to an async function to keep consistency with getGoogleMailConfig
export async function getBrevoMailConfig(): Promise<MailerOptions> {
  logger.info(
    { from: process.env.BREVO_SENDER_EMAIL },
    'Mail configured via Brevo HTTPS API on Port 443 (Production)',
  );

  const customTransport = nodemailer.createTransport({
    name: 'brevo-api',
    version: '1.0.0',
    send: async (mail: any, callback: (err: Error | null, info: any) => void) => {
      try {
        const envelope = mail.data;
        const apiKey = process.env.BREVO_API_KEY || '';
        const senderEmail = process.env.BREVO_SENDER_EMAIL || '';
        const htmlContent = envelope.html as string;

        const recipients = Array.isArray(envelope.to)
          ? envelope.to.map((recipient: any) => ({ email: recipient.address || recipient }))
          : [{ email: envelope.to }];

        // Fixed endpoint: pointing to Brevo's formal API endpoint route
        const response = await fetch('https://brevo.com', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'NOLA Spots', email: senderEmail },
            to: recipients,
            subject: envelope.subject,
            htmlContent: htmlContent,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          return callback(new Error(`Brevo API Error: ${JSON.stringify(errorData)}`), null);
        }

        callback(null, { messageId: 'brevo-api-success' });
      } catch (error) {
        callback(error as Error, null);
      }
    },
  } as any);

  return {
    transport: customTransport,
    defaults: {
      from: process.env.MAIL_FROM ?? `"NOLA Spots" <${process.env.BREVO_SENDER_EMAIL}>`,
    },
    template: {
      dir: join(__dirname, 'templates'),
      adapter: new HandlebarsAdapter(),
      options: { strict: false },
    },
  };
}
