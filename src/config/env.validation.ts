// src/config/env.validation.ts
import { IsString, IsNumberString, IsNotEmpty, IsEnum } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsNumberString()
  @IsNotEmpty()
  PORT: string;

  @IsString()
  @IsNotEmpty()
  MONGODB_URI: string;

  @IsString()
  @IsEnum(['development', 'production', 'test'])
  @IsNotEmpty()
  NODE_ENV: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig);

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
