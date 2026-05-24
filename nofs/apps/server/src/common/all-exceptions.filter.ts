import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === 'string' ? body : (body as { message?: string }).message ?? message;
    } else {
      // Log unexpected errors so we can diagnose them
      process.stderr.write(
        '[AllExceptionsFilter] Unhandled: ' +
          (exception instanceof Error ? exception.stack : String(exception)) +
          '\n',
      );
    }

    response.status(status).json({ statusCode: status, message });
  }
}
