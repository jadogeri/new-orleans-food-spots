import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BusinessesService } from './businesses.service';
import { BusinessesRepository } from './businesses.repository';

jest.mock('@repo/db', () => ({
  businessesTable: {
    userId: 'userId',
    id: 'id',
    businessId: 'businessId',
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((_col, _val) => ({ type: 'eq', col: _col, val: _val })),
  and: jest.fn((...args) => ({ type: 'and', args })),
}));

const mockRepo: jest.Mocked<BusinessesRepository> = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
} as any;

const makeBusiness = (overrides = {}) => ({
  id: 'row-1',
  businessId: 'yelp-abc',
  userId: 'user-1',
  name: 'Cafe Du Monde',
  phone: '555-0100',
  rating: 4.5,
  imageUrl: 'https://example.com/img.jpg',
  price: '$$',
  reviews: 1200,
  address: '800 Decatur St',
  city: 'New Orleans',
  transactions: ['pickup'],
  categories: [{ alias: 'coffee', title: 'Coffee' }],
  liked: false,
  visited: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
  ...overrides,
});

describe('BusinessesService', () => {
  let service: BusinessesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessesService,
        { provide: BusinessesRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<BusinessesService>(BusinessesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // -------------------------------------------------------------------------
  describe('getStats', () => {
    it('returns total, liked and visited counts', async () => {
      mockRepo.find.mockResolvedValue([
        makeBusiness({ liked: true, visited: false }),
        makeBusiness({ liked: false, visited: true }),
        makeBusiness({ liked: true, visited: true }),
      ]);

      const stats = await service.getStats('user-1');

      expect(stats).toEqual({ total: 3, liked: 2, visited: 2 });
    });

    it('returns zeros when user has no saved businesses', async () => {
      mockRepo.find.mockResolvedValue([]);

      const stats = await service.getStats('user-1');

      expect(stats).toEqual({ total: 0, liked: 0, visited: 0 });
    });
  });

  // -------------------------------------------------------------------------
  describe('findAll', () => {
    it('returns mapped response objects', async () => {
      mockRepo.find.mockResolvedValue([makeBusiness()]);

      const result = await service.findAll('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'row-1',
        business_id: 'yelp-abc',
        liked: false,
        visited: true,
        detail: expect.objectContaining({ name: 'Cafe Du Monde' }),
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('findOne', () => {
    it('returns the business when found', async () => {
      mockRepo.findOne.mockResolvedValue(makeBusiness());

      const result = await service.findOne('user-1', 'row-1');

      expect(result.id).toBe('row-1');
    });

    it('throws NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(undefined);

      await expect(service.findOne('user-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  // -------------------------------------------------------------------------
  describe('create', () => {
    const body = {
      business_id: 'yelp-new',
      detail: { name: 'Dooky Chase', phone: '555-0200', rating: 4.8 },
      liked: false,
      visited: false,
    } as any;

    it('saves and returns a new business', async () => {
      mockRepo.find.mockResolvedValue([]);
      mockRepo.save.mockResolvedValue(makeBusiness({ businessId: 'yelp-new', name: 'Dooky Chase' }));

      const result = await service.create('user-1', body);

      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.detail.name).toBe('Dooky Chase');
    });

    it('throws BadRequestException when business is already saved', async () => {
      mockRepo.find.mockResolvedValue([makeBusiness()]);

      await expect(service.create('user-1', body)).rejects.toThrow(BadRequestException);
    });
  });

  // -------------------------------------------------------------------------
  describe('update', () => {
    it('returns updated business', async () => {
      mockRepo.update.mockResolvedValue(makeBusiness({ liked: true }));

      const result = await service.update('user-1', 'row-1', { liked: true } as any);

      expect(result.liked).toBe(true);
    });

    it('throws NotFoundException when row does not exist', async () => {
      mockRepo.update.mockResolvedValue(undefined);

      await expect(service.update('user-1', 'missing', { liked: true } as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // -------------------------------------------------------------------------
  describe('remove', () => {
    it('returns { ok: true } on success', async () => {
      mockRepo.remove.mockResolvedValue(makeBusiness());

      const result = await service.remove('user-1', 'row-1');

      expect(result).toEqual({ ok: true });
    });

    it('throws NotFoundException when row does not exist', async () => {
      mockRepo.remove.mockResolvedValue(undefined);

      await expect(service.remove('user-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
