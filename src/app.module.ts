// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { validate } from './config/env.validation';
import { CoreModule } from './core/core.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'tr',
      loaderOptions: {
        path: path.join(__dirname, 'i18n'),
        watch: true,
        includeSubfolders: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    CoreModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
