import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { yelpClient } from '../lib/yelp';

@Injectable()
export class YelpService {
  async search(params: { term?: string; category?: string; limit?: number }) {
    try {
      const response = await yelpClient.get('/search', {
        params: {
          term: params.term || 'restaurants',
          location: 'New Orleans, LA',
          categories: params.category || undefined,
          limit: params.limit ?? 20,
          sort_by: 'rating',
        },
      });
      return {
        businesses: response.data.businesses ?? [],
        total: response.data.total ?? 0,
      };
    } catch (err: unknown) {
      throw new InternalServerErrorException('Failed to fetch from Yelp');
    }
  }

  async getById(id: string) {
    try {
      const response = await yelpClient.get(`/${id}`);
      return response.data;
    } catch (err: unknown) {
      throw new InternalServerErrorException('Failed to fetch business from Yelp');
    }
  }
}
