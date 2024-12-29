// src/config/app.config.ts
import { registerAs } from '@nestjs/config';

export interface AppConfig {
  name: string;
  env: string;
  port: number;
  apiPrefix: string;
  fallbackLanguage: string;
  headerLanguage: string;
}

export default registerAs(
  'app',
  (): AppConfig => ({
    name: process.env.APP_NAME || 'NestJS API',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api',
    fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || 'en',
    headerLanguage: 'x-custom-lang',
  }),
);

// Environment validation schema
export const appConfigValidationSchema = {
  APP_NAME: {
    type: 'string',
    default: 'NestJS API',
  },
  NODE_ENV: {
    type: 'string',
    enum: ['development', 'production', 'test', 'staging'],
    default: 'development',
  },
  PORT: {
    type: 'number',
    default: 3000,
  },
  API_PREFIX: {
    type: 'string',
    default: 'api',
  },
  APP_FALLBACK_LANGUAGE: {
    type: 'string',
    default: 'en',
  },
};
