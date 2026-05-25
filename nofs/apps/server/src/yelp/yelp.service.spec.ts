import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { YelpService } from './yelp.service';

const mockGet = jest.fn();

jest.mock('../lib/yelp', () => ({
  yelpClient: { get: (...args: unknown[]) => mockGet(...args) },
}));

describe('YelpService', () => {
  let service: YelpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YelpService],
    }).compile();

    service = module.get<YelpService>(YelpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('returns businesses and total from Yelp response', async () => {
      const fakeBusiness = { id: 'abc', name: 'Cafe Du Monde' };
      mockGet.mockResolvedValue({
        data: { businesses: [fakeBusiness], total: 1 },
      });

      const result = await service.search({ term: 'coffee' });

      expect(result).toEqual({ businesses: [fakeBusiness], total: 1 });
      expect(mockGet).toHaveBeenCalledWith('/search', expect.objectContaining({
        params: expect.objectContaining({
          term: 'coffee',
          location: 'New Orleans, LA',
        }),
      }));
    });

    it('defaults term to "restaurants" when not provided', async () => {
      mockGet.mockResolvedValue({ data: { businesses: [], total: 0 } });

      await service.search({});

      expect(mockGet).toHaveBeenCalledWith('/search', expect.objectContaining({
        params: expect.objectContaining({ term: 'restaurants' }),
      }));
    });

    it('defaults limit to 20', async () => {
      mockGet.mockResolvedValue({ data: { businesses: [], total: 0 } });

      await service.search({});

      expect(mockGet).toHaveBeenCalledWith('/search', expect.objectContaining({
        params: expect.objectContaining({ limit: 20 }),
      }));
    });

    it('returns empty arrays when Yelp response has no data', async () => {
      mockGet.mockResolvedValue({ data: {} });

      const result = await service.search({});

      expect(result).toEqual({ businesses: [], total: 0 });
    });

    it('throws InternalServerErrorException when Yelp API fails', async () => {
      mockGet.mockRejectedValue(new Error('network error'));

      await expect(service.search({ term: 'pizza' })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getById', () => {
    it('returns business data from Yelp', async () => {
      const fakeBusiness = { id: 'xyz', name: 'Dooky Chase' };
      mockGet.mockResolvedValue({ data: fakeBusiness });

      const result = await service.getById('xyz');

      expect(result).toEqual(fakeBusiness);
      expect(mockGet).toHaveBeenCalledWith('/xyz');
    });

    it('throws InternalServerErrorException when Yelp API fails', async () => {
      mockGet.mockRejectedValue(new Error('not found'));

      await expect(service.getById('bad-id')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
