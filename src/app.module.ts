// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { validate } from './config/env.validation';
import { CoreModule } from './core/core.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { LoggerService } from './core/services/logger.service';
import { RequestLoggerInterceptor } from './core/interceptors/request-logger.interceptor';
import { SecurityModule } from './config/security.module';
import rateLimitConfig from './config/rate-limit.config';
import corsConfig from './config/cors.config';
import { databaseConfig } from './config/database.config';
import { DatabaseModule } from './core/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [rateLimitConfig, corsConfig, databaseConfig],
    }),
    SecurityModule,
    I18nModule.forRoot({
      fallbackLanguage: 'tr',
      loaderOptions: {
        path: path.join(__dirname, 'i18n'),
        watch: true,
        includeSubfolders: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    DatabaseModule.forRoot(),
    CoreModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    LoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
