import { Injectable } from '@nestjs/common';
import { businessesTable } from '@repo/db';
import type { Business, InsertBusiness } from '@repo/db';
import { BaseRepository } from '../common/base.repository';

@Injectable()
export class BusinessesRepository extends BaseRepository<Business, InsertBusiness> {
  // 💡 FIXED: Cast assignment to any to bypass abstract signature cross-module conflicts
  protected readonly table = businessesTable as any;
}
