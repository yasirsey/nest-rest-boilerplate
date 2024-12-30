// src/core/security/security.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { ISecurityMiddleware } from './interfaces/security.interface';

@Injectable()
export class SecurityService implements ISecurityMiddleware {
  constructor(
    @Inject('SecurityMiddlewares')
    private readonly middlewares: ISecurityMiddleware[],
  ) {}

  handle(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
    next: NextFunction,
  ): void {
    const applyMiddleware = (index: number): void => {
      if (index >= this.middlewares.length) {
        return next();
      }

      this.middlewares[index].handle(req, res, (error?: any) => {
        if (error) {
          return next(error);
        }
        applyMiddleware(index + 1);
      });
    };

    applyMiddleware(0);
  }
}
