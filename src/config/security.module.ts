// src/config/security.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerBehindProxyGuard } from '../core/guards/throttler-behind-proxy.guard';
import rateLimitConfig from './rate-limit.config';
import corsConfig from './cors.config';

@Module({
  imports: [
    ConfigModule.forFeature(rateLimitConfig),
    ConfigModule.forFeature(corsConfig),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const rateLimit = config.get('rateLimit');
        return [
          {
            name: 'general',
            ttl: rateLimit.general.ttl,
            limit: rateLimit.general.limit,
          },
          {
            name: 'auth-success',
            ttl: rateLimit.auth.login.success.ttl,
            limit: rateLimit.auth.login.success.limit,
          },
          {
            name: 'auth-failure',
            ttl: rateLimit.auth.login.failure.ttl,
            limit: rateLimit.auth.login.failure.limit,
          },
        ];
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class SecurityModule {}
