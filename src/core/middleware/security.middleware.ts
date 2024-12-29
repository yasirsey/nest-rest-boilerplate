// src/core/middleware/security.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { doubleCsrf, DoubleCsrfConfigOptions } from 'csrf-csrf';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private readonly helmetMiddleware: ReturnType<typeof helmet>;
  private readonly hppMiddleware: ReturnType<typeof hpp>;
  private readonly doubleCsrfProtection: ReturnType<
    typeof doubleCsrf
  >['doubleCsrfProtection'];
  private readonly generateToken: ReturnType<
    typeof doubleCsrf
  >['generateToken'];

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

    const csrfOptions: DoubleCsrfConfigOptions = {
      getSecret: () => process.env.CSRF_SECRET || 'your-secret-key',
      cookieName: 'x-csrf-token',
      cookieOptions: {
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
      },
      size: 64,
      getTokenFromRequest: (req) => {
        return (
          (req.headers['x-csrf-token'] as string) ||
          (req.body?._csrf as string) ||
          (req.query?._csrf as string)
        );
      },
      ignoredMethods: ['GET', 'HEAD', 'OPTIONS', 'POST'], // POST'u geçici olarak ekledik
    };

    const { doubleCsrfProtection, generateToken } = doubleCsrf(csrfOptions);
    this.doubleCsrfProtection = doubleCsrfProtection;
    this.generateToken = generateToken;
  }

  use(req: Request, res: Response, next: NextFunction) {
    try {
      this.helmetMiddleware(req, res, (err: any) => {
        if (err) {
          this.logger.error('Helmet error:', err);
          return next(err);
        }

        this.hppMiddleware(req, res, (err: any) => {
          if (err) {
            this.logger.error('HPP error:', err);
            return next(err);
          }

          const shouldSkipCsrf =
            req.path.startsWith('/api/') ||
            ['GET', 'HEAD', 'OPTIONS', 'POST'].includes(req.method);

          if (shouldSkipCsrf) {
            return next();
          }

          try {
            if (req.method === 'GET') {
              const token = this.generateToken(req, res);
              res.setHeader('x-csrf-token', token);
            }

            this.doubleCsrfProtection(req, res, (err: any) => {
              if (err) {
                this.logger.error('CSRF error:', err);
                return next(err);
              }
              next();
            });
          } catch (csrfError) {
            this.logger.error('CSRF processing error:', csrfError);
            next(csrfError);
          }
        });
      });
    } catch (error) {
      this.logger.error('Security middleware error:', error);
      next(error);
    }
  }
}
