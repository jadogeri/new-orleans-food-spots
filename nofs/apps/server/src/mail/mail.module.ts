// mail.module.ts
import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { getGoogleMailConfig } from './google.mail';
import { getBrevoMailConfig } from './brevo.mail';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => {
        // If production uses Google and other environments use Ethereal, 
        // your getGoogleMailConfig function already handles this fallback logic.
        if (process.env.NODE_ENV === 'development') {
          return await getGoogleMailConfig();
        }
        return await getBrevoMailConfig();
      }
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
