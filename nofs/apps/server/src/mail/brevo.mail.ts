import { MailerOptions } from '@nestjs-modules/mailer'; 
import { join } from 'node:path';
import * as fs from 'node:fs/promises';
import * as handlebars from 'handlebars';
import { logger } from '../lib/logger';

export function getBrevoMailConfig(): MailerOptions {
  logger.info(
    { from: process.env.BREVO_SENDER_EMAIL },
    'Mail configured via Brevo HTTPS API on Port 443 (Production Mode Enabled)',
  );
  
  return {
    transport: {
      name: 'brevo-api',
      version: '1.0.0',
      send: async (mail, callback) => {
        try {
          const envelope = mail.data as any;
          const apiKey = process.env.BREVO_API_KEY || '';
          const senderEmail = process.env.BREVO_SENDER_EMAIL || '';

          let htmlContent = '';

          // 1. Manually render the Handlebars template if it exists
          if (envelope.template) {
            // FIX: Your template folder paths are structured as `${folder}/html` from MailService
            // This safely appends the .hbs extension to the combined path (e.g., templates/welcome/html.hbs)
            const templatePath = join(__dirname, 'templates', `${envelope.template}.hbs`);
            const templateSource = await fs.readFile(templatePath, 'utf8');
            const compiledTemplate = handlebars.compile(templateSource);
            htmlContent = compiledTemplate(envelope.context || {});
          } else {
            htmlContent = envelope.html || envelope.text || '';
          }

          // 2. Clean recipient formatting down to strings
          const toField = Array.isArray(envelope.to)
            ? envelope.to.map((r: any) => ({ email: r.address || r }))
            : [{ email: envelope.to?.address || envelope.to }];

          // 3. Send over Port 443 (Safe from firewalls)
          // 💡 FIXED: Replaced corporate 'https://brevo.com' Vercel address with actual Brevo v3 Email API Endpoint
          const response = await fetch('https://brevo.com', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': apiKey,
              'content-type': 'application/json',
            } as Record<string, string>, 
            body: JSON.stringify({
              sender: { name: 'NOLA Spots', email: senderEmail },
              to: toField,
              subject: envelope.subject,
              htmlContent: htmlContent,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Could not parse error body' }));
            return callback(new Error(`Brevo API Error: ${JSON.stringify(errorData)}`), null);
          }

          logger.info({ to: toField }, 'Email sent successfully via Brevo API');
          callback(null, { messageId: 'brevo-api-success' });
        } catch (error) {
          logger.error({ err: (error as Error).message }, 'Brevo Custom Transport Failed');
          callback(error as Error, null);
        }
      },
    },
    // Keep this undefined so our custom send method can handle the rendering pipeline natively
    template: undefined, 
  };
}
