// src/core/filters/global-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';
import { I18nService } from 'nestjs-i18n';
import { MongoError } from 'mongodb';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly i18n: I18nService,
  ) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const lang = request.headers['accept-language'] || 'en';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let details = null;

    // MongoDB specific errors
    if (exception instanceof MongoError) {
      switch (exception.code) {
        case 11000:
          status = HttpStatus.CONFLICT;
          message = await this.i18n.translate('errors.DUPLICATE_ENTRY', {
            lang,
          });
          errorCode = 'DUPLICATE_ENTRY';
          break;
        case 121:
          status = HttpStatus.BAD_REQUEST;
          message = await this.i18n.translate('errors.VALIDATION_ERROR', {
            lang,
          });
          errorCode = 'DOCUMENT_VALIDATION_ERROR';
          details = exception.errmsg;
          break;
        case 51:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = await this.i18n.translate('errors.FAIL_POINT_ERROR', {
            lang,
          });
          errorCode = 'FAIL_POINT_ERROR';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = await this.i18n.translate('errors.DATABASE_ERROR', {
            lang,
          });
          errorCode = 'DATABASE_ERROR';
      }
    }
    // NestJS HTTP exceptions
    else if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse() as any;
      status = exception.getStatus();
      message = errorResponse.message || exception.message;
      errorCode = errorResponse.error || 'HTTP_ERROR';
      details = errorResponse.details;
    }

    // Log the error with context
    const logContext = {
      statusCode: status,
      path: request.url,
      method: request.method,
      userId: request['user']?.id,
      errorCode,
    };

    if (status >= 500) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
        'GlobalExceptionFilter',
        logContext,
      );
    } else {
      this.logger.warn(
        `Application exception: ${exception.message}`,
        'GlobalExceptionFilter',
        logContext,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      errorCode,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
