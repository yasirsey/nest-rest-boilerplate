// src/app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './core/core.module';
import { SecurityModule } from './core/security/security.module';
import { SecurityService } from './core/security/security.service';
import mongodbConfig from './config/mongodb.config';
import securityConfig from './config/security.config';
import appConfig from './config/app.config';
import { CustomThrottlerGuard } from './core/guards/throttler.guard';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { TimeoutInterceptor } from './core/interceptors/timeout.interceptor';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongodbConfig, securityConfig, appConfig],
    }),
    SecurityModule,
    CoreModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'global',
          ttl: config.get('security.throttle.global.ttl'),
          limit: config.get('security.throttle.global.limit'),
        },
        {
          name: 'auth',
          ttl: config.get('security.throttle.auth.ttl'),
          limit: config.get('security.throttle.auth.limit'),
          ignoreUserAgents: [/^health-check/, /^monitoring/],
        },
        {
          name: 'signup',
          ttl: config.get('security.throttle.signup.ttl'),
          limit: config.get('security.throttle.signup.limit'),
        },
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly securityService: SecurityService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => this.securityService.handle(req, res, next))
      .forRoutes('*');
  }
}
