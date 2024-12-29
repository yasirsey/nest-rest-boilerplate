// src/core/middleware/security.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { doubleCsrf } from 'csrf-csrf';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly helmetMiddleware: ReturnType<typeof helmet>;
  private readonly hppMiddleware: ReturnType<typeof hpp>;
  private readonly doubleCsrfProtection: ReturnType<
    typeof doubleCsrf
  >['doubleCsrfProtection'];

  constructor() {
    this.helmetMiddleware = helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'https:'],
          scriptSrc: [`'self'`],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    });

    this.hppMiddleware = hpp();

    const { doubleCsrfProtection } = doubleCsrf({
      getSecret: () => process.env.CSRF_SECRET || 'your-secret-key',
      cookieName: 'x-csrf-token',
      cookieOptions: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      },
      size: 64,
      getTokenFromRequest: (req) => req.headers['x-csrf-token'],
    });

    this.doubleCsrfProtection = doubleCsrfProtection;
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.helmetMiddleware(req, res, (err: any) => {
      if (err) return next(err);

      this.hppMiddleware(req, res, (err: any) => {
        if (err) return next(err);

        // CSRF korumasını API dışındaki route'lar için uygula
        if (!req.path.startsWith('/api/')) {
          this.doubleCsrfProtection(req, res, next);
        } else {
          next();
        }
      });
    });
  }
}
