// src/modules/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/modules/auth/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ token: String, expires: Date }] })
  refreshTokens: { token: string; expires: Date }[];

  @ApiProperty()
  @Prop({ required: true })
  firstName: string;

  @ApiProperty()
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({ enum: Role })
  @Prop({ enum: Role, default: Role.USER })
  role: Role;

  @ApiProperty()
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, sparse: true })
  passwordResetToken?: string;

  @Prop({ type: Date })
  passwordResetExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
