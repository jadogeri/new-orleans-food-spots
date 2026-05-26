import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { BusinessesModule } from './businesses/businesses.module';
import { YelpModule } from './yelp/yelp.module';
import { MailModule } from './mail/mail.module';
import { TasksModule } from './tasks/tasks.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    MailModule,
    HealthModule,
    AuthModule,
    BusinessesModule,
    YelpModule,
    TasksModule,
  ],
  controllers: [AppController],

})
export class AppModule {}
  