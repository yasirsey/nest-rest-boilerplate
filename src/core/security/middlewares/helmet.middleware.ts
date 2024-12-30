// src/core/security/middlewares/helmet.middleware.ts
import { Injectable, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { ISecurityMiddleware } from '../interfaces/security.interface';

@Injectable()
export class HelmetMiddleware implements ISecurityMiddleware {
  private readonly logger = new Logger(HelmetMiddleware.name);
  private readonly helmetMiddleware: ReturnType<typeof helmet>;

  constructor() {
    // Helmet'ın default ayarlarını kullan, sadece gerekli olanları özelleştir
    this.helmetMiddleware = helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          // Swagger UI için gerekli CSP ayarları
          'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          'img-src': ["'self'", 'data:', 'https:'],
        },
      },
    });
  }

  handle(req: Request, res: Response, next: NextFunction): void {
    this.helmetMiddleware(req, res, (error: any) => {
      if (error) {
        this.logger.error('Helmet error:', error);
        return next(error);
      }
      next();
    });
  }
}
