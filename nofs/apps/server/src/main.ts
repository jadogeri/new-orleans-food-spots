// 💡 STEP 1: Put environment setup imports at the ABSOLUTE top of the file
import * as dotenv from 'dotenv';
import path from 'path';

// 💡 STEP 2: Execute config mapping BEFORE loading any app frameworks or module structures
dotenv.config();

// 💡 STEP 3: Now it is safe to declare application framework imports
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import pinoHttp from 'pino-http';
import { logger } from './lib/logger';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  const rawPort = process.env['SERVER_PORT'];
  if (!rawPort) throw new Error('SERVER_PORT environment variable is required');
  const port = Number(rawPort);
  if (Number.isNaN(port) || port <= 0)
    throw new Error(`Invalid SERVER_PORT value: "${rawPort}"`);

  const app = await NestFactory.create(AppModule, {
    logger: false,
    abortOnError: false,
  });

  app.use(
    pinoHttp({
      logger,
      serializers: {
        req(req) {
          return {
            id: req.id,
            method: req.method,
            url: req.url?.split('?')[0],
          };
        },
        res(res) {
          return { statusCode: res.statusCode };
        },
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({ origin: '*', credentials: true });
  app.setGlobalPrefix('api');

  await app.listen(port);
  logger.info({ port }, 'NestJS server listening');
}

bootstrap().catch((err) => {
  process.stderr.write(
    '[bootstrap error] ' +
      (err instanceof Error ? err.stack : String(err)) +
      '\n',
  );
  process.exit(1);
});
