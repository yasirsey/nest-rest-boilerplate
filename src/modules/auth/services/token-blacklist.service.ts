// src/modules/auth/services/token-blacklist.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BlacklistedTokenRepository } from '../repositories/blacklisted-token.repository';
import { LoggerService } from 'src/core/services/logger.service';

@Injectable()
export class TokenBlacklistService {
  constructor(
    private readonly blacklistedTokenRepository: BlacklistedTokenRepository,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  async blacklistToken(token: string): Promise<void> {
    try {
      const decoded = this.jwtService.decode(token) as { exp: number };
      const expiresAt = new Date(decoded.exp * 1000);

      await this.blacklistedTokenRepository.create(token, expiresAt);

      this.logger.log(
        'Token has been blacklisted successfully',
        'TokenBlacklistService',
        { tokenExp: expiresAt },
      );
    } catch (error) {
      this.logger.error(
        'Failed to blacklist token',
        error.stack,
        'TokenBlacklistService',
      );
      throw error;
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    try {
      return await this.blacklistedTokenRepository.exists(token);
    } catch (error) {
      this.logger.error(
        'Failed to check token blacklist status',
        error.stack,
        'TokenBlacklistService',
      );
      throw error;
    }
  }
}
