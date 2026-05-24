import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { z } from 'zod';
import {
  RegisterBodySchema,
  LoginBodySchema,
  ForgotPasswordBodySchema,
  ResetPasswordBodySchema,
} from '../common/schemas';
import { lazyZodPipe } from '../common/zod-validation.pipe';
import { AuthGuard } from '../common/auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  register(
    @Body(lazyZodPipe(() => RegisterBodySchema))
    body: z.infer<typeof RegisterBodySchema>,
    @Req() req: Request,
  ) {
    return this.authService.register(body, req);
  }

  @Post('login')
  @HttpCode(200)
  login(
    @Body(lazyZodPipe(() => LoginBodySchema))
    body: z.infer<typeof LoginBodySchema>,
    @Req() req: Request,
  ) {
    return this.authService.login(body, req);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Req() req: Request) {
    return this.authService.logout(req);
  }

  @Get('me')
  getMe(@Req() req: Request) {
    return this.authService.getMe(req);
  }

  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(
    @Body(lazyZodPipe(() => ForgotPasswordBodySchema))
    body: z.infer<typeof ForgotPasswordBodySchema>,
  ) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  resetPassword(
    @Body(lazyZodPipe(() => ResetPasswordBodySchema))
    body: z.infer<typeof ResetPasswordBodySchema>,
  ) {
    return this.authService.resetPassword(
      body.email,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Post('deactivate')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  deactivate(@CurrentUser() userId: string) {
    return this.authService.deactivate(userId);
  }
}
