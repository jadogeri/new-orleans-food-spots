import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown): unknown {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      const issues = parsed.error.issues
        ?.map((i: { message: string }) => i.message)
        .join('; ');
      throw new BadRequestException(issues ?? 'Validation failed');
    }
    return parsed.data;
  }
}

/**
 * Creates a pipe that resolves the schema lazily at request-time.
 * Use this when the schema is defined in the same bundle and may not
 * be initialized at class-decoration time (esbuild module ordering).
 */
export function lazyZodPipe(getSchema: () => ZodType): PipeTransform {
  return {
    transform(value: unknown): unknown {
      const schema = getSchema();
      const parsed = schema.safeParse(value);
      if (!parsed.success) {
        const issues = parsed.error.issues
          ?.map((i: { message: string }) => i.message)
          .join('; ');
        throw new BadRequestException(issues ?? 'Validation failed');
      }
      return parsed.data;
    },
  };
}
