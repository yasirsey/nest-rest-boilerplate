// src/modules/auth/repositories/blacklisted-token.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BlacklistedToken,
  BlacklistedTokenDocument,
} from '../schemas/blacklisted-token.schema';

@Injectable()
export class BlacklistedTokenRepository {
  constructor(
    @InjectModel(BlacklistedToken.name)
    private readonly blacklistedTokenModel: Model<BlacklistedTokenDocument>,
  ) {}

  async create(token: string, expiresAt: Date): Promise<void> {
    await this.blacklistedTokenModel.create({
      token,
      expiresAt,
    });
  }

  async exists(token: string): Promise<boolean> {
    const exists = await this.blacklistedTokenModel.exists({ token });
    return !!exists;
  }
}
