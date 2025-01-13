// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { LoggerService } from 'src/core/services/logger.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { BaseApiResponse } from 'src/core/interfaces/base-api-response.interface';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly i18n: I18nService,
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
      message: await this.i18n.translate('modules.auth.messages.LOGIN_SUCCESS'),
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
    accessToken: string,
    refreshToken: string,
  ): Promise<BaseApiResponse<void>> {
    try {
      await Promise.all([
        this.tokenBlacklistService.blacklistToken(accessToken),
        this.usersService.removeRefreshToken(userId, refreshToken),
      ]);

      this.logger.log('User logged out successfully', 'AuthService', {
        userId,
      });

      return {
        data: null,
        message: 'Logged out successfully',
      };
    } catch (error) {
      this.logger.error('Logout operation failed', error.stack, 'AuthService', {
        userId,
      });
      throw error;
    }
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  private async generateTokens(user: UserDocument) {
    const payload = {
      email: user.email,
      sub: user._id.toString(),
      role: user.role,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.generateSecureToken(),
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

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Silent fail for security
      return;
    }

    const resetToken = this.generateSecureToken();
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await this.usersService.updateResetToken(user._id.toString(), {
      token: hashedToken,
      expires: new Date(Date.now() + 3600000), // 1 hour
    });

    // Email sending logic here
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.usersService.findByResetToken(hashedToken);
    if (!user || user.passwordResetExpires < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user._id.toString(), hashedPassword);
  }
}
