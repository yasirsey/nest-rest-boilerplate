// src/core/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Güvenlik için hata detaylarını production'da gizle
    const message =
      process.env.NODE_ENV === 'production' &&
      status === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal server error'
        : exception instanceof HttpException
          ? exception.message
          : 'An error occurred';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
