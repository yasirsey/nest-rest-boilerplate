// src/config/env.validation.ts
import {
  IsString,
  IsNumberString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  Matches,
  ValidateIf,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';
import { validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsNumberString()
  @IsNotEmpty()
  PORT: string;

  @IsString()
  @IsEnum(['development', 'production', 'test'])
  @IsNotEmpty()
  NODE_ENV: string;

  @IsString()
  @IsNotEmpty()
  MONGODB_URI: string;

  @IsString()
  @IsNotEmpty()
  MONGODB_DB_NAME: string;

  @IsOptional()
  @IsString()
  MSSQL_ENABLED?: string;

  @ValidateIf((o) => o.MSSQL_ENABLED === 'true')
  @IsString()
  @IsNotEmpty()
  MSSQL_HOST: string;

  @ValidateIf((o) => o.MSSQL_ENABLED === 'true')
  @IsString()
  @IsNotEmpty()
  MSSQL_PORT: string;

  @ValidateIf((o) => o.MSSQL_ENABLED === 'true')
  @IsString()
  @IsNotEmpty()
  MSSQL_USERNAME: string;

  @ValidateIf((o) => o.MSSQL_ENABLED === 'true')
  @IsString()
  @IsNotEmpty()
  MSSQL_PASSWORD: string;

  @ValidateIf((o) => o.MSSQL_ENABLED === 'true')
  @IsString()
  @IsNotEmpty()
  MSSQL_DATABASE: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+[smhd]$/, {
    message:
      'JWT_EXPIRES_IN must be in format: number + s|m|h|d (e.g., 24h, 60m)',
  })
  JWT_EXPIRES_IN: string;

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  CORS_CREDENTIALS?: boolean;

  @IsNumberString()
  @IsOptional()
  RATE_LIMIT_GENERAL_TTL?: string;

  @IsNumberString()
  @IsOptional()
  RATE_LIMIT_GENERAL_LIMIT?: string;

  @IsNumberString()
  @IsOptional()
  RATE_LIMIT_AUTH_SUCCESS_TTL?: string;

  @IsNumberString()
  @IsOptional()
  RATE_LIMIT_AUTH_SUCCESS_LIMIT?: string;

  @IsNumberString()
  @IsOptional()
  RATE_LIMIT_AUTH_FAILURE_TTL?: string;

  @IsNumberString()
  @IsOptional()
  RATE_LIMIT_AUTH_FAILURE_LIMIT?: string;
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
