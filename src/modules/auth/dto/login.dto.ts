// src/modules/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail(
    {},
    { message: i18nValidationMessage('common.validations.FIELD.EMAIL') },
  )
  @IsNotEmpty({
    message: i18nValidationMessage('common.validations.FIELD.REQUIRED'),
  })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString({
    message: i18nValidationMessage('common.validations.FIELD.STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('common.validations.FIELD.REQUIRED'),
  })
  password: string;
}
