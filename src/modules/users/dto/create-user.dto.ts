// src/modules/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Role } from 'src/modules/auth/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'Email address of the user' })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('modules.users.validations.EMAIL.INVALID'),
    },
  )
  @IsNotEmpty({
    message: i18nValidationMessage('common.validations.FIELD.REQUIRED'),
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

  @ApiProperty({ description: 'First name of the user' })
  @IsString({
    message: i18nValidationMessage('common.validations.FIELD.STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('common.validations.FIELD.REQUIRED'),
  })
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsString({
    message: i18nValidationMessage('common.validations.FIELD.STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('common.validations.FIELD.REQUIRED'),
  })
  lastName: string;

  @ApiProperty({ enum: Role, required: false })
  @IsEnum(Role, {
    message: i18nValidationMessage('modules.users.validations.ROLE.INVALID'),
  })
  @IsOptional()
  role?: Role;
}
