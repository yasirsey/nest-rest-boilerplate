// src/core/security/middlewares/cors.middleware.ts
import { Injectable, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ConfigService } from '@nestjs/config';
import { ISecurityMiddleware } from '../interfaces/security.interface';

@Injectable()
export class CorsMiddleware implements ISecurityMiddleware {
  private readonly logger = new Logger(CorsMiddleware.name);
  private readonly corsMiddleware: ReturnType<typeof cors>;

  constructor(private readonly configService: ConfigService) {
    this.corsMiddleware = cors({
      origin: this.configService.get<string[]>('security.cors.origin', ['*']),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
      exposedHeaders: ['x-csrf-token'],
      credentials: true,
      maxAge: 86400,
    });
  }

  handle(req: Request, res: Response, next: NextFunction): void {
    this.corsMiddleware(req, res, (error: any) => {
      if (error) {
        this.logger.error('CORS error:', error);
        return next(error);
      }
      next();
    });
  }
}
