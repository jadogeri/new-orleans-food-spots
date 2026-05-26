import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { getBrevoMailConfig } from './brevo.mail';
import { getGoogleMailConfig } from './google.mail';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => {
        // Enforce Brevo in production if keys are defined
        if (process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL) {
          return await getBrevoMailConfig();
        }

        // Safe developer fallback wrapper in case env variables are missing locally
        logger.warn('Brevo keys missing. Falling back to gmail configuration.');
        return await getGoogleMailConfig();
      }
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
