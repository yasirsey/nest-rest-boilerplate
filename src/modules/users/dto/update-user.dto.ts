// src/modules/users/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

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
