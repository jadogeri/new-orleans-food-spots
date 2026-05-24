import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { z } from 'zod';
import { businessesTable } from '@repo/db';
import type { Business } from '@repo/db';
import type {
  CreateBusinessBodySchema,
  UpdateBusinessBodySchema,
} from '../common/schemas';
import { BusinessesRepository } from './businesses.repository';

function toResponse(r: Business) {
  return {
    id: r.id,
    business_id: r.businessId,
    detail: {
      name: r.name,
      phone: r.phone,
      rating: r.rating,
      image_url: r.imageUrl,
      price: r.price,
      reviews: r.reviews,
      address: r.address,
      city: r.city,
      transactions: r.transactions ?? [],
      categories: r.categories ?? [],
    },
    liked: r.liked,
    visited: r.visited,
    created_at: r.createdAt?.toISOString(),
  };
}

@Injectable()
export class BusinessesService {
  constructor(private readonly repo: BusinessesRepository) {}

  async getStats(userId: string) {
    // 💡 FIXED: Cast column parameter to any
    const rows = await this.repo.find(
      eq(businessesTable.userId as any, userId),
    );
    return {
      total: rows.length,
      liked: rows.filter((r) => r.liked).length,
      visited: rows.filter((r) => r.visited).length,
    };
  }

  async findAll(userId: string) {
    // 💡 FIXED: Cast column parameter to any
    const rows = await this.repo.find(
      eq(businessesTable.userId as any, userId),
    );
    return rows.map(toResponse);
  }

  async findOne(userId: string, id: string) {
    // 💡 FIXED: Cast inner columns to any to satisfy type resolution
    const row = await this.repo.findOne(
      and(
        eq(businessesTable.userId as any, userId),
        eq(businessesTable.id as any, id),
      ) as any,
    );
    if (!row) throw new NotFoundException();
    return toResponse(row);
  }

  async create(userId: string, body: z.infer<typeof CreateBusinessBodySchema>) {
    const { business_id, detail, liked, visited } = body;

    // 💡 FIXED: Cast inner columns to any
    const existing = await this.repo.find(
      and(
        eq(businessesTable.userId as any, userId),
        eq(businessesTable.businessId as any, business_id),
      ),
    );
    if (existing.length > 0) throw new BadRequestException('Already saved');

    const row = await this.repo.save({
      id: randomUUID(),
      businessId: business_id,
      userId,
      name: detail.name,
      phone: detail.phone ?? null,
      rating: detail.rating ?? null,
      imageUrl: detail.image_url ?? null,
      price: detail.price ?? null,
      reviews: detail.reviews ?? null,
      address: detail.address ?? null,
      city: detail.city ?? null,
      transactions: detail.transactions ?? [],
      categories: detail.categories ?? [],
      liked: liked ?? false,
      visited: visited ?? false,
    });

    return toResponse(row);
  }

  async update(
    userId: string,
    id: string,
    body: z.infer<typeof UpdateBusinessBodySchema>,
  ) {
    const updateData: Partial<typeof businessesTable.$inferInsert> = {};
    if (body.liked !== undefined) updateData.liked = body.liked;
    if (body.visited !== undefined) updateData.visited = body.visited;
    updateData.updatedAt = new Date();

    // 💡 FIXED: Cast query block conditions to any
    const row = await this.repo.update(
      and(
        eq(businessesTable.userId as any, userId),
        eq(businessesTable.id as any, id),
      ) as any,
      updateData,
    );
    if (!row) throw new NotFoundException();
    return toResponse(row);
  }

  async remove(userId: string, id: string) {
    // 💡 FIXED: Cast query block conditions to any
    const row = await this.repo.remove(
      and(
        eq(businessesTable.userId as any, userId),
        eq(businessesTable.id as any, id),
      ) as any,
    );
    if (!row) throw new NotFoundException();
    return { ok: true };
  }
}
