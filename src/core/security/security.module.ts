// src/core/security/security.module.ts
import { Module } from '@nestjs/common';
import { CorsMiddleware } from './middlewares/cors.middleware';
import { HelmetMiddleware } from './middlewares/helmet.middleware';
import { HppMiddleware } from './middlewares/hpp.middleware';
import { CsrfMiddleware } from './middlewares/csrf.middleware';
import { SecurityService } from './security.service';

@Module({
  imports: [],
  providers: [
    CorsMiddleware,
    HelmetMiddleware,
    HppMiddleware,
    CsrfMiddleware,
    SecurityService,
    {
      provide: 'SecurityMiddlewares',
      useFactory: (
        corsMiddleware: CorsMiddleware,
        helmetMiddleware: HelmetMiddleware,
        hppMiddleware: HppMiddleware,
        csrfMiddleware: CsrfMiddleware,
      ) => [corsMiddleware, helmetMiddleware, hppMiddleware, csrfMiddleware],
      inject: [CorsMiddleware, HelmetMiddleware, HppMiddleware, CsrfMiddleware],
    },
  ],
  exports: [SecurityService],
})
export class SecurityModule {}
