// src/core/dtos/user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    minimum: 8,
    example: 'password123',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsString()
  lastName: string;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'password123',
  })
  @IsString()
  password: string;
}
