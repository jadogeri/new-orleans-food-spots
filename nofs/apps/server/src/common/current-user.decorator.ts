import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AUTH_USER_ID_KEY } from './auth.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Record<string, unknown>>();
    return req[AUTH_USER_ID_KEY] as string;
  },
);
