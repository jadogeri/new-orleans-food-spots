import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { auth } from '../lib/auth';
import { buildHeaders } from './http-utils';

export const AUTH_USER_ID_KEY = 'nestUserId';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx
      .switchToHttp()
      .getRequest<Request & Record<string, unknown>>();
    const token = req.headers['authorization']?.replace('Bearer ', '').trim();

    if (!token) throw new UnauthorizedException();

    try {
      const session = await auth.api.getSession({
        headers: buildHeaders(req, token),
      });
      if (!session?.user?.id) throw new UnauthorizedException();
      req[AUTH_USER_ID_KEY] = session.user.id;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
