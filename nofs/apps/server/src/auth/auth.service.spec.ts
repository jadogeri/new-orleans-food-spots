import { BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';

// ---------------------------------------------------------------------------
// Module-level mocks — must come before any imports that use these modules
// ---------------------------------------------------------------------------


jest.mock('@repo/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
  },
  usersTable: { id: 'id', email: 'email', username: 'username' },
  sessionsTable: {},
  accountsTable: {},
  verificationsTable: { identifier: 'identifier', value: 'value', expiresAt: 'expiresAt' },
}));

jest.mock('../lib/auth', () => ({
  auth: {
    api: {
      signUpEmail: jest.fn(),
      signInEmail: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
    },
  },
  capturedResetTokens: new Map(),
}));

jest.mock('../common/http-utils', () => ({
  buildHeaders: jest.fn(() => ({})),
}));

jest.mock('../mail/mail.service', () => ({
  MailService: jest.fn().mockImplementation(() => ({
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendAccountLockedEmail: jest.fn().mockResolvedValue(undefined),
    sendForgotPasswordEmail: jest.fn().mockResolvedValue(undefined),
    sendEmail: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((_col, _val) => ({ col: _col, val: _val })),
  and: jest.fn((...args) => args),
  gt: jest.fn((_col, _val) => ({ col: _col, val: _val })),
  desc: jest.fn((col) => col),
}));

// ---------------------------------------------------------------------------

const mockMailService = {
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  sendAccountLockedEmail: jest.fn().mockResolvedValue(undefined),
  sendForgotPasswordEmail: jest.fn().mockResolvedValue(undefined),
  sendEmail: jest.fn().mockResolvedValue(undefined),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('throws BadRequestException when Better Auth returns no token', async () => {
      const { auth } = require('../lib/auth');
      auth.api.signUpEmail.mockResolvedValue(null);

      const { db } = require('@repo/db');
      db.where.mockResolvedValue([]);

      const fakeReq = { headers: {} } as any;

      await expect(
        service.register({ username: 'alice', email: 'alice@example.com', password: 'Secret1!' }, fakeReq),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when user is not found in db', async () => {
      const { db } = require('@repo/db');
      db.where.mockResolvedValue([]);

      const fakeReq = { headers: {} } as any;

      await expect(
        service.login({ email: 'nobody@example.com', password: 'pw' }, fakeReq),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException when account is deactivated', async () => {
      const { db } = require('@repo/db');
      db.where.mockResolvedValue([
        {
          id: 'u1',
          email: 'alice@example.com',
          username: 'alice',
          isActive: false,
          loginAttempts: 0,
          lockedUntil: null,
        },
      ]);

      const fakeReq = { headers: {} } as any;

      await expect(
        service.login({ email: 'alice@example.com', password: 'pw' }, fakeReq),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when account is locked', async () => {
      const { db } = require('@repo/db');
      const lockedUntil = new Date(Date.now() + 60_000);
      db.where.mockResolvedValue([
        {
          id: 'u1',
          email: 'alice@example.com',
          username: 'alice',
          isActive: true,
          loginAttempts: 3,
          lockedUntil,
        },
      ]);

      const fakeReq = { headers: {} } as any;

      await expect(
        service.login({ email: 'alice@example.com', password: 'pw' }, fakeReq),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('logout', () => {
    it('returns { ok: true } even when signOut throws', async () => {
      const { auth } = require('../lib/auth');
      auth.api.signOut.mockRejectedValue(new Error('session gone'));

      const fakeReq = { headers: { authorization: 'Bearer tok' } } as any;
      const result = await service.logout(fakeReq);

      expect(result).toEqual({ ok: true });
    });
  });
});
