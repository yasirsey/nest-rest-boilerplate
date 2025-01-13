// src/modules/auth/schemas/blacklisted-token.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlacklistedTokenDocument = BlacklistedToken & Document;

@Schema({ timestamps: true })
export class BlacklistedToken {
  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const BlacklistedTokenSchema =
  SchemaFactory.createForClass(BlacklistedToken);

// TTL index
BlacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
