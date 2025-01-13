// src/core/decorators/language.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Language = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.i18nLang || 'en';
  },
);
