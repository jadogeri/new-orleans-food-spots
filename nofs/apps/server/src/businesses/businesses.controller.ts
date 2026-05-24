import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import type { z } from 'zod';
import { CreateBusinessBodySchema, UpdateBusinessBodySchema } from '../common/schemas';
import { AuthGuard } from '../common/auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { lazyZodPipe } from '../common/zod-validation.pipe';
import { BusinessesService } from './businesses.service';

@Controller('businesses')
@UseGuards(AuthGuard)
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get('stats')
  getStats(@CurrentUser() userId: string) {
    return this.businessesService.getStats(userId);
  }

  @Get()
  findAll(@CurrentUser() userId: string) {
    return this.businessesService.findAll(userId);
  }

  @Get(':id')
  findOne(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.businessesService.findOne(userId, id);
  }

  @Post()
  @HttpCode(201)
  create(
    @CurrentUser() userId: string,
    @Body(lazyZodPipe(() => CreateBusinessBodySchema)) body: z.infer<typeof CreateBusinessBodySchema>,
  ) {
    return this.businessesService.create(userId, body);
  }

  @Put(':id')
  update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body(lazyZodPipe(() => UpdateBusinessBodySchema)) body: z.infer<typeof UpdateBusinessBodySchema>,
  ) {
    return this.businessesService.update(userId, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.businessesService.remove(userId, id);
  }
}
