// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BlacklistedToken,
  BlacklistedTokenSchema,
} from './schemas/blacklisted-token.schema';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { BlacklistedTokenRepository } from './repositories/blacklisted-token.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      { name: BlacklistedToken.name, schema: BlacklistedTokenSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', '24h'),
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TokenBlacklistService,
    BlacklistedTokenRepository,
  ],
  exports: [TokenBlacklistService],
})
export class AuthModule {}
