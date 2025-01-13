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
            name: 'short',
            ttl: rateLimit.short.ttl,
            limit: rateLimit.short.limit,
          },
          {
            name: 'medium',
            ttl: rateLimit.medium.ttl,
            limit: rateLimit.medium.limit,
          },
          {
            name: 'long',
            ttl: rateLimit.long.ttl,
            limit: rateLimit.long.limit,
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
