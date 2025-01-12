// src/core/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let details = null;

    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse() as any;
      status = exception.getStatus();
      message = errorResponse.message || exception.message;
      errorCode = errorResponse.errorCode;
      details = errorResponse.details;
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
