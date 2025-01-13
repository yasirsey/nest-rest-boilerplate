// src/core/services/logger.service.ts
import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { Request } from 'express';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    // Winston formatı
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      winston.format.json(),
    );

    // Transport tanımlamaları
    const transports: winston.transport[] = [
      // Konsol transport
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
      // Günlük dosya rotasyonu (error seviyesi için)
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
      }),
      // Tüm loglar için dosya rotasyonu
      new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      }),
    ];

    this.logger = winston.createLogger({
      format: logFormat,
      transports,
    });
  }

  // Hassas verileri maskeleme
  private maskSensitiveData(data: any): any {
    if (!data) return data;

    const maskedFields = ['password', 'token', 'authorization', 'cookie'];
    const masked = { ...data };

    Object.keys(masked).forEach((key) => {
      if (maskedFields.includes(key.toLowerCase())) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object') {
        masked[key] = this.maskSensitiveData(masked[key]);
      }
    });

    return masked;
  }

  // Request bilgilerini formatlama
  private formatRequestDetails(request: Request): any {
    return {
      requestId: request['id'],
      method: request.method,
      url: request.url,
      ip: request.ip,
      userId: request['user']?.id || 'anonymous',
      userAgent: request.get('user-agent'),
      headers: this.maskSensitiveData(request.headers),
      body: this.maskSensitiveData(request.body),
    };
  }

  // Log metodları
  log(message: string, context?: string, meta?: any) {
    this.logger.info(message, { context, meta });
  }

  error(message: string, trace?: string, context?: string, meta?: any) {
    this.logger.error(message, { trace, context, meta });
  }

  warn(message: string, context?: string, meta?: any) {
    this.logger.warn(message, { context, meta });
  }

  debug(message: string, context?: string, meta?: any) {
    this.logger.debug(message, { context, meta });
  }

  // HTTP Request logging
  logRequest(request: Request, responseTime?: number, statusCode?: number) {
    const requestDetails = this.formatRequestDetails(request);

    this.logger.info('HTTP Request', {
      ...requestDetails,
      responseTime,
      statusCode,
    });
  }
}
