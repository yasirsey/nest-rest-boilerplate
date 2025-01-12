// src/core/filters/validation.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { I18nValidationException } from 'nestjs-i18n';
import { Response } from 'express';

@Catch(I18nValidationException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: I18nValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const validationErrors = exception.errors.reduce((acc, error) => {
      const constraints = Object.values(error.constraints || {});
      if (constraints.length > 0) {
        acc[error.property] = constraints;
      }
      return acc;
    }, {});

    response.status(400).json({
      statusCode: 400,
      errors: validationErrors,
      timestamp: new Date().toISOString(),
    });
  }
}
