// src/modules/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('validation.INVALID_EMAIL'),
    },
  )
  @IsNotEmpty({
    message: i18nValidationMessage('validation.REQUIRED'),
  })
  email: string;

  @ApiProperty({ description: 'Password for the user account', minLength: 6 })
  @IsString({
    message: i18nValidationMessage('common.validations.FIELD.STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('common.validations.FIELD.REQUIRED'),
  })
  @MinLength(6, {
    message: i18nValidationMessage(
      'modules.users.validations.PASSWORD.MIN_LENGTH',
    ),
  })
  @MaxLength(100, {
    message: i18nValidationMessage(
      'modules.users.validations.PASSWORD.MAX_LENGTH',
    ),
  })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.REQUIRED'),
  })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.REQUIRED'),
  })
  lastName: string;
}
