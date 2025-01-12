// src/modules/users/dto/update-user.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Role } from 'src/modules/auth/enums/role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'First name of the user' })
  @IsString({
    message: i18nValidationMessage('common.validations.FIELD.STRING'),
  })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name of the user' })
  @IsString({
    message: i18nValidationMessage('common.validations.FIELD.STRING'),
  })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Password for the user account',
    minLength: 6,
  })
  @IsString({
    message: i18nValidationMessage('common.validations.FIELD.STRING'),
  })
  @MinLength(6, {
    message: i18nValidationMessage(
      'modules.users.validations.PASSWORD.MIN_LENGTH',
    ),
  })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsEnum(Role, {
    message: i18nValidationMessage('modules.users.validations.ROLE.INVALID'),
  })
  @IsOptional()
  role?: Role;
}
