// src/core/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { MongoError } from 'mongodb';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetail = null;

    // CSRF hatası kontrolü
    if (exception && (exception as any).code === 'EBADCSRFTOKEN') {
      status = HttpStatus.FORBIDDEN;
      message = 'Invalid CSRF token';
      errorDetail = {
        type: 'CSRFError',
        code: 'EBADCSRFTOKEN',
      };
    }
    // MongoDB duplicate key hatası
    else if (exception instanceof MongoError && exception.code === 11000) {
      status = HttpStatus.CONFLICT;
      message = 'Duplicate key error';
      errorDetail = {
        type: 'MongoError',
        code: 11000,
        keyPattern: (exception as any).keyPattern,
      };
    }
    // HTTP Exception kontrolü
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      errorDetail = exception.getResponse();
    }
    // Diğer hatalar
    else if (exception instanceof Error) {
      errorDetail = {
        type: exception.name,
        message: exception.message,
        stack:
          process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    // Hata loglaması
    this.logger.error({
      path: request.url,
      method: request.method,
      status,
      message,
      errorDetail,
      timestamp: new Date().toISOString(),
      body: request.body,
      query: request.query,
      params: request.params,
      headers: this.sanitizeHeaders(request.headers),
    });

    // Response
    response.status(status).json({
      statusCode: status,
      message,
      error: process.env.NODE_ENV === 'development' ? errorDetail : undefined,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    // Hassas bilgileri temizle
    ['authorization', 'cookie', 'x-csrf-token'].forEach((key) => {
      if (sanitized[key]) {
        sanitized[key] = '[FILTERED]';
      }
    });
    return sanitized;
  }
}
