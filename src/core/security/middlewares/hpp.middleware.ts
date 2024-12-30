// src/core/security/middlewares/hpp.middleware.ts
import { Injectable, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import hpp from 'hpp';
import { ISecurityMiddleware } from '../interfaces/security.interface';

@Injectable()
export class HppMiddleware implements ISecurityMiddleware {
  private readonly logger = new Logger(HppMiddleware.name);
  private readonly hppMiddleware: ReturnType<typeof hpp>;

  constructor() {
    this.hppMiddleware = hpp();
  }

  handle(req: Request, res: Response, next: NextFunction): void {
    this.hppMiddleware(req, res, (error: any) => {
      if (error) {
        this.logger.error('HPP error:', error);
        return next(error);
      }
      next();
    });
  }
}
