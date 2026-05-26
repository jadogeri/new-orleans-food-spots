import { MailerOptions } from '@nestjs-modules/mailer'; 
import { join } from 'node:path';
import * as fs from 'node:fs/promises';
import * as handlebars from 'handlebars';
import { logger } from '../lib/logger';

export async function getBrevoMailConfig(): Promise<MailerOptions> {
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
          const senderEmail = process.env.BREVO_SENDER_EMAIL || 'hello@josephadogeridev.com'; // Default fallback to your new domain
          
          logger.info({ to: envelope.to }, 'Preparing to send email via Brevo API');

          let htmlContent = '';

          // 1. Render the Handlebars template if specified
          if (envelope.template) {
            const templatePath = join(__dirname, 'templates', `${envelope.template}.hbs`);
            const templateSource = await fs.readFile(templatePath, 'utf8');
            const compiledTemplate = handlebars.compile(templateSource);
            htmlContent = compiledTemplate(envelope.context || {});
          } else {
            htmlContent = envelope.html || envelope.text || '';
          }

          // 2. Format recipients to match Brevo's exact array JSON schema
          // 🚀 FIXED: Conditionally builds object so an empty 'name' string is never sent to Brevo
          const toField = Array.isArray(envelope.to)
            ? envelope.to.map((r: any) => {
                const emailStr = r.address || r;
                return r.name ? { email: emailStr, name: r.name } : { email: emailStr };
              })
            : (() => {
                const emailStr = envelope.to?.address || envelope.to;
                return envelope.to?.name ? [{ email: emailStr, name: envelope.to.name }] : [{ email: emailStr }];
              })();

          // 3. Send over Port 443 (Safe from Render's firewall blocks)
          const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': apiKey,
              'content-type': 'application/json',
            }, 
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
    template: undefined, 
  };
}
