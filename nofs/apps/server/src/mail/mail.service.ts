import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as handlebars from 'handlebars';
import { logger } from '../lib/logger';
import type {
  MailContext,
  WelcomeEmailContext,
  ForgotPasswordEmailContext,
  PasswordResetEmailContext,
  AccountLockedEmailContext,
  DeactivationEmailContext,
} from './interfaces/mail-context.interface';

@Injectable()
export class MailService {
  private readonly isEthereal = !process.env.GMAIL_USER;

  constructor(private readonly mailerService: MailerService) {}

  private getBaseContext() {
    return {
      company: 'NOLA Spots',
      year: new Date().getFullYear(),
      logoUrl: process.env.FRONTEND_URL ?? 'https://nolaspot.app',
    };
  }

  async sendEmail(
    to: string,
    folder: string,
    context: MailContext,
  ): Promise<void> {
    const subjectPath = path.join(
      __dirname,
      'templates',
      folder,
      'subject.hbs',
    );
    let subject = 'NOLA Spots';
    try {
      const subjectTemplate = fs.readFileSync(subjectPath, 'utf8');
      subject = handlebars.compile(subjectTemplate)(context);
    } catch {
      logger.warn({ subjectPath }, 'Mail: subject template not found');
    }

    try {
      const info = await this.mailerService.sendMail({
        to,
        subject,
        template: `${folder}/html`,
        context,
      });
      logger.info({ to, folder }, 'Mail: sent');

      if (this.isEthereal) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          logger.info({ previewUrl }, 'Mail: Ethereal preview');
        }
      }
    } catch (err: unknown) {
      logger.error(
        { to, folder, err: err instanceof Error ? err.message : String(err) },
        'Mail: send failed',
      );
    }
  }

  async sendWelcomeEmail(
    to: string,
    context: WelcomeEmailContext,
  ): Promise<void> {
    await this.sendEmail(to, 'welcome', {
      ...this.getBaseContext(),
      ...context,
    });
  }

  async sendForgotPasswordEmail(
    to: string,
    context: ForgotPasswordEmailContext,
  ): Promise<void> {
    await this.sendEmail(to, 'forgot-password', {
      ...this.getBaseContext(),
      ...context,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    context: PasswordResetEmailContext,
  ): Promise<void> {
    await this.sendEmail(to, 'reset-password', {
      ...this.getBaseContext(),
      ...context,
    });
  }

  async sendAccountLockedEmail(
    to: string,
    context: AccountLockedEmailContext,
  ): Promise<void> {
    await this.sendEmail(to, 'account-locked', {
      ...this.getBaseContext(),
      ...context,
    });
  }

  async sendDeactivationEmail(
    to: string,
    context: DeactivationEmailContext,
  ): Promise<void> {
    await this.sendEmail(to, 'account-deactivation', {
      ...this.getBaseContext(),
      ...context,
    });
  }
}
