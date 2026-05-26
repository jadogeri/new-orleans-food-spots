// google.mail.ts
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'node:path';
import * as nodemailer from 'nodemailer';
import { logger } from '../lib/logger';
import { MailerOptions } from '@nestjs-modules/mailer';

// Change the return type here to remove "| undefined"
export async function getGoogleMailConfig(): Promise<MailerOptions> {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    logger.info(
      { user: process.env.GMAIL_USER },
      'Mail configured via Gmail SMTP (Development)',
    );
    return {
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      },
      defaults: {
        from: process.env.MAIL_FROM ?? `"NOLA Spots" <${process.env.GMAIL_USER}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: false },
      },
    };
  }

  const testAccount = await nodemailer.createTestAccount();
  logger.info('Mail: GMAIL_USER missing — loading fallback Ethereal credentials');

  return {
    transport: {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    },
    defaults: {
      from: `"NOLA Spots" <${testAccount.user}>`,
    },
    template: {
      dir: join(__dirname, 'templates'),
      adapter: new HandlebarsAdapter(),
      options: { strict: false },
    },
  };
}
