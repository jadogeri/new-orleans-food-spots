import { Injectable } from '@nestjs/common';
import { businessesTable } from '@workspace/db';
import type { Business, InsertBusiness } from '@workspace/db';
import { BaseRepository } from '../common/base.repository';

@Injectable()
export class BusinessesRepository extends BaseRepository<Business, InsertBusiness> {
  protected readonly table = businessesTable;
}
