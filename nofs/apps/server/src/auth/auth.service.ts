import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { and, desc, eq, gt } from 'drizzle-orm';
import { createHash, randomUUID } from 'node:crypto';
import type { Request } from 'express';
import type { z } from 'zod';
import { db, usersTable, sessionsTable, verificationsTable } from '@workspace/db';
import type { RegisterBodySchema, LoginBodySchema } from '../common/schemas';
import { auth, capturedResetTokens } from '../lib/auth';
import { buildHeaders } from '../common/http-utils';
import { MailService } from '../mail/mail.service';

const LOCK_AFTER_ATTEMPTS = 3;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const TEMP_PASSWORD_TTL_MS = 60 * 60 * 1000; // 1 hour
const NOLA_RESET_PREFIX = 'nola-reset:';

const UPPER = 'ABCDEFGHJKMNPQRSTUVWXYZ';
const LOWER = 'abcdefghjkmnpqrstuvwxyz';
const DIGITS = '23456789';
const SPECIAL = '!@#$%^&*';
const ALL = UPPER + LOWER + DIGITS + SPECIAL;

function generateNoLookalikesPassword(length = 12): string {
  const rand = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
  const parts: string[] = [
    rand(UPPER), rand(UPPER),
    rand(LOWER), rand(LOWER),
    rand(DIGITS), rand(DIGITS),
    rand(SPECIAL),
  ];
  while (parts.length < length) parts.push(rand(ALL));
  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }
  return parts.join('');
}

function hashTempPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex');
}

type AnyFn = (...args: unknown[]) => unknown;

async function callRequestPasswordReset(email: string): Promise<string | null> {
  try {
    await (auth.api as Record<string, AnyFn>)['requestPasswordReset']({
      body: { email, redirectTo: process.env.APP_URL ?? 'http://localhost' },
      headers: {},
    });
  } catch (_) {}
  const token = capturedResetTokens.get(email) ?? null;
  capturedResetTokens.delete(email);
  return token;
}

async function callResetPassword(token: string, newPassword: string): Promise<void> {
  await (auth.api as Record<string, AnyFn>)['resetPassword']({
    query: { token },
    body: { newPassword },
    headers: {},
  });
}

@Injectable()
export class AuthService {
  constructor(private readonly mailService: MailService) {}

  async register(body: z.infer<typeof RegisterBodySchema>, req: Request) {
    const { username, email, password } = body;
    try {
      const result = await auth.api.signUpEmail({
        body: { name: username, email, password },
        headers: buildHeaders(req),
      });

      if (!result?.token || !result?.user) {
        throw new BadRequestException('Registration failed');
      }

      await db.update(usersTable).set({ username }).where(eq(usersTable.id, result.user.id));

      this.mailService
        .sendWelcomeEmail(email, { firstName: username, email })
        .catch(() => {});

      return {
        token: result.token,
        user: { id: result.user.id, username, email: result.user.email },
      };
    } catch (err: unknown) {
      if (err instanceof BadRequestException) throw err;
      const msg = err instanceof Error ? err.message : 'Registration failed';
      throw new BadRequestException(msg);
    }
  }

  async login(body: z.infer<typeof LoginBodySchema>, req: Request) {
    const { email, password } = body;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(
        'Account locked after too many failed attempts. Use Forgot Password to regain access.',
      );
    }

    try {
      const result = await auth.api.signInEmail({
        body: { email, password },
        headers: buildHeaders(req),
      });

      if (!result?.token || !result?.user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      await db
        .update(usersTable)
        .set({ loginAttempts: 0, lockedUntil: null })
        .where(eq(usersTable.id, user.id));

      const username = user.username ?? result.user.name ?? email.split('@')[0];
      return {
        token: result.token,
        user: { id: result.user.id, username, email: result.user.email },
      };
    } catch (err: unknown) {
      if (err instanceof ForbiddenException) throw err;

      const newAttempts = (user.loginAttempts ?? 0) + 1;

      if (newAttempts >= LOCK_AFTER_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        await db
          .update(usersTable)
          .set({ loginAttempts: newAttempts, lockedUntil })
          .where(eq(usersTable.id, user.id));
        this.mailService
          .sendAccountLockedEmail(email, { firstName: user.name ?? undefined, email })
          .catch(() => {});
      } else {
        await db
          .update(usersTable)
          .set({ loginAttempts: newAttempts })
          .where(eq(usersTable.id, user.id));
      }

      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async logout(req: Request) {
    try {
      await auth.api.signOut({ headers: buildHeaders(req) });
    } catch (_) {}
    return { ok: true };
  }

  async getMe(req: Request) {
    const token = req.headers['authorization']?.replace('Bearer ', '').trim();
    if (!token) throw new UnauthorizedException();

    try {
      const session = await auth.api.getSession({ headers: buildHeaders(req, token) });
      if (!session?.user) throw new UnauthorizedException();

      const [dbUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, session.user.id));

      if (dbUser && !dbUser.isActive) throw new ForbiddenException('Account is deactivated');

      const username = dbUser?.username ?? session.user.name ?? '';
      return { id: session.user.id, username, email: session.user.email };
    } catch (err: unknown) {
      if (err instanceof UnauthorizedException || err instanceof ForbiddenException) throw err;
      throw new UnauthorizedException();
    }
  }

  async forgotPassword(email: string): Promise<{ ok: boolean }> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) return { ok: true }; // Prevent email enumeration

    const tempPassword = generateNoLookalikesPassword();
    const tempHash = hashTempPassword(tempPassword, user.id);
    const expiresAt = new Date(Date.now() + TEMP_PASSWORD_TTL_MS);

    // Store our own verification hash (used in resetPassword to verify the temp password)
    await db
      .delete(verificationsTable)
      .where(eq(verificationsTable.identifier, `${NOLA_RESET_PREFIX}${user.id}`));

    await db.insert(verificationsTable).values({
      id: randomUUID(),
      identifier: `${NOLA_RESET_PREFIX}${user.id}`,
      value: tempHash,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Ask Better Auth to issue a reset token (captured via sendResetPassword callback)
    const resetToken = await callRequestPasswordReset(email);
    if (resetToken) {
      try {
        await callResetPassword(resetToken, tempPassword);
      } catch (_) {}
    }

    await this.mailService.sendForgotPasswordEmail(email, {
      firstName: user.name ?? undefined,
      email,
      temporaryPassword: tempPassword,
      supportEmail: process.env.GMAIL_USER ?? 'support@nolaspot.app',
    });

    return { ok: true };
  }

  async resetPassword(
    email: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ ok: boolean }> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) throw new NotFoundException('User not found');

    const tempHash = hashTempPassword(currentPassword, user.id);

    const [verification] = await db
      .select()
      .from(verificationsTable)
      .where(
        and(
          eq(verificationsTable.identifier, `${NOLA_RESET_PREFIX}${user.id}`),
          gt(verificationsTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!verification || verification.value !== tempHash) {
      throw new UnauthorizedException('Invalid or expired temporary password');
    }

    // Issue a fresh Better Auth reset token to set the new permanent password
    const resetToken = await callRequestPasswordReset(email);
    if (!resetToken) throw new BadRequestException('Could not complete password reset');

    await callResetPassword(resetToken, newPassword);

    // Clean up
    await db
      .delete(verificationsTable)
      .where(eq(verificationsTable.identifier, `${NOLA_RESET_PREFIX}${user.id}`));

    await db
      .update(usersTable)
      .set({ loginAttempts: 0, lockedUntil: null, updatedAt: new Date() })
      .where(eq(usersTable.id, user.id));

    await this.mailService.sendPasswordResetEmail(email, {
      firstName: user.name ?? undefined,
      email,
    });

    return { ok: true };
  }

  async deactivate(userId: string): Promise<{ ok: boolean }> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) throw new NotFoundException('User not found');

    await db
      .update(usersTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));

    await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));

    await this.mailService.sendDeactivationEmail(user.email, {
      firstName: user.name ?? undefined,
      email: user.email,
      confirmationDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });

    return { ok: true };
  }
}
