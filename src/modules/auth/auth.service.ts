// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../../core/schemas/refresh-token.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user.toJSON();
    return result;
  }

  async generateTokens(user: any, req?: any) {
    const payload = { email: user.email, sub: user.id };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('security.jwtSecret'),
      expiresIn: '15m', // Access token - kısa ömürlü
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('security.refreshTokenSecret'),
      expiresIn: '7d', // Refresh token - uzun ömürlü
    });

    // Refresh token'ı database'e kaydet
    await this.saveRefreshToken(user.id, refreshToken, req);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  private async saveRefreshToken(userId: string, token: string, req?: any) {
    // Eski refresh token'ları revoke et
    await this.refreshTokenModel.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true },
    );

    // Yeni refresh token oluştur
    const refreshToken = new this.refreshTokenModel({
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün
      userAgent: req?.headers?.['user-agent'],
      ipAddress: req?.ip,
    });

    await refreshToken.save();
  }

  async refreshAccessToken(refreshTokenString: string) {
    try {
      // Refresh token'ı verify et
      const payload = this.jwtService.verify(refreshTokenString, {
        secret: this.configService.get('security.refreshTokenSecret'),
      });

      // Database'den refresh token'ı kontrol et
      const storedToken = await this.refreshTokenModel.findOne({
        userId: payload.sub,
        token: refreshTokenString,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findOne(payload.sub);

      // Yeni access token oluştur
      const newAccessToken = this.jwtService.sign(
        { email: user.email, sub: user.id },
        {
          secret: this.configService.get('security.jwtSecret'),
          expiresIn: '15m',
        },
      );

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(userId: string, refreshToken: string) {
    await this.refreshTokenModel.updateOne(
      { userId, token: refreshToken },
      { isRevoked: true },
    );
  }

  async revokeAllRefreshTokens(userId: string) {
    await this.refreshTokenModel.updateMany({ userId }, { isRevoked: true });
  }
}
