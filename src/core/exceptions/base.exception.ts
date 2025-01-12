// src/core/exceptions/base.exception.ts
import { HttpException } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    message: string,
    statusCode: number,
    public readonly errorCode?: string,
    public readonly details?: Record<string, any>,
  ) {
    super(
      {
        message,
        errorCode,
        statusCode,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}
