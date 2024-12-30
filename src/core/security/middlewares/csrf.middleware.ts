// src/core/security/middlewares/csrf.middleware.ts
import { Injectable, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { doubleCsrf } from 'csrf-csrf';
import { ISecurityMiddleware } from '../interfaces/security.interface';

@Injectable()
export class CsrfMiddleware implements ISecurityMiddleware {
  private readonly logger = new Logger(CsrfMiddleware.name);
  private readonly doubleCsrfProtection: ReturnType<
    typeof doubleCsrf
  >['doubleCsrfProtection'];
  private readonly generateToken: ReturnType<
    typeof doubleCsrf
  >['generateToken'];

  // Whitelist'i ConfigService'ten al
  private readonly publicPaths: string[];

  constructor(private readonly configService: ConfigService) {
    const { doubleCsrfProtection, generateToken } = doubleCsrf({
      getSecret: () =>
        this.configService.get('security.csrfSecret', 'your-secret-key'),
      cookieName: 'x-csrf-token',
      cookieOptions: {
        httpOnly: true,
        sameSite:
          this.configService.get('app.env') === 'production' ? 'strict' : 'lax',
        secure: this.configService.get('app.env') === 'production',
      },
      size: 64,
      getTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
      ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    });

    this.doubleCsrfProtection = doubleCsrfProtection;
    this.generateToken = generateToken;
    this.publicPaths = this.configService.get('security.csrf.publicPaths', [
      '/api/auth/login',
      '/api/auth/register',
      '/health',
      '/metrics',
    ]);
  }

  private isPublicPath(path: string): boolean {
    return this.publicPaths.some((publicPath) => path.startsWith(publicPath));
  }

  handle(req: Request, res: Response, next: NextFunction): void {
    try {
      // Public path kontrolü
      if (this.isPublicPath(req.path)) {
        return next();
      }

      // GET request'lerinde token generate et
      if (req.method === 'GET' && !req.headers['x-csrf-token']) {
        const token = this.generateToken(req, res);
        res.setHeader('x-csrf-token', token);
      }

      // CSRF koruması uygula
      this.doubleCsrfProtection(req, res, (error: any) => {
        if (error) {
          this.logger.error('CSRF error:', error);
          return next(error);
        }
        next();
      });
    } catch (error) {
      this.logger.error('CSRF middleware error:', error);
      next(error);
    }
  }
}
