import { Controller, Get, Param, Query } from '@nestjs/common';
import { YelpService } from './yelp.service';

@Controller('yelp')
export class YelpController {
  constructor(private readonly yelpService: YelpService) {}

  @Get('search')
  search(
    @Query('term') term?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
  ) {
    return this.yelpService.search({
      term,
      category,
      limit: limit !== undefined ? Number(limit) : undefined,
    });
  }

  @Get('businesses/:id')
  getById(@Param('id') id: string) {
    return this.yelpService.getById(id);
  }
}
