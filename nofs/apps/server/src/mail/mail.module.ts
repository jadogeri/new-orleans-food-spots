import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'node:path';
import * as nodemailer from 'nodemailer';
import { logger } from '../lib/logger';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => {
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
          logger.info(
            { user: process.env.GMAIL_USER },
            'Mail configured via Gmail',
          );
          return {
            transport: {
              service: 'gmail',
              auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
              },
            },
            defaults: {
              from:
                process.env.MAIL_FROM ??
                `"NOLA Spots" <${process.env.GMAIL_USER}>`,
            },
            template: {
              dir: join(__dirname, 'templates'), //  Correct
              adapter: new HandlebarsAdapter(),
              options: { strict: false },
            },
          };
        }

        const testAccount = await nodemailer.createTestAccount();
        logger.info('Mail: GMAIL_USER not set — using Ethereal test account');
        logger.info(
          { user: testAccount.user, pass: testAccount.pass },
          'Ethereal credentials',
        );
        logger.info('View sent emails at https://ethereal.email/messages');

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
            dir: join(__dirname, 'templates'), // 💡 FIXED: Changed from 'mail', 'templates' to just 'templates'
            adapter: new HandlebarsAdapter(),
            options: { strict: false },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
