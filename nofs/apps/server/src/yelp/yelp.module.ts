import { Module } from '@nestjs/common';
import { YelpController } from './yelp.controller';
import { YelpService } from './yelp.service';

@Module({
  controllers: [YelpController],
  providers: [YelpService],
})
export class YelpModule {}
