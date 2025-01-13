// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { UserDocument } from '../users/schemas/user.schema';
import { LoggerService } from 'src/core/services/logger.service';
import { BaseApiResponse } from 'src/core/interfaces/base-api-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.validateUserCredentials(
      loginDto.email,
      loginDto.password,
    );

    const tokens = await this.generateTokens(user);

    // Refresh token'ı kullanıcıya kaydet
    await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);

    this.logger.log(
      `User logged in successfully: ${user.email}`,
      'AuthService',
      { userId: user._id },
    );

    return {
      data: {
        user,
        ...tokens,
      },
      message: 'Login successful',
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refresh_token } = refreshTokenDto;

    // Refresh token'ı doğrula
    const user = await this.usersService.findByRefreshToken(refresh_token);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Refresh token'ın süresini kontrol et
    const isValid = user.refreshTokens.some(
      (t) => t.token === refresh_token && t.expires > new Date(),
    );
    if (!isValid) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Yeni tokenları oluştur
    const tokens = await this.generateTokens(user);

    // Eski refresh token'ı sil ve yenisini kaydet
    await this.rotateRefreshToken(
      user._id.toString(),
      refresh_token,
      tokens.refresh_token,
    );

    return {
      data: {
        user,
        ...tokens,
      },
      message: 'Tokens refreshed successfully',
    };
  }

  async logout(
    userId: string,
    refreshToken: string,
  ): Promise<BaseApiResponse<void>> {
    await this.usersService.removeRefreshToken(userId, refreshToken);

    return {
      data: null,
      message: 'Logged out successfully',
    };
  }

  private async generateTokens(user: UserDocument) {
    const payload = {
      email: user.email,
      sub: user._id.toString(),
      role: user.role,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      uuidv4(), // UUID kullanarak güvenli refresh token oluştur
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 günlük süre

    await this.usersService.addRefreshToken(userId, {
      token: refreshToken,
      expires,
    });
  }

  private async rotateRefreshToken(
    userId: string,
    oldToken: string,
    newToken: string,
  ) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    await this.usersService.rotateRefreshToken(userId, oldToken, {
      token: newToken,
      expires,
    });
  }
}
