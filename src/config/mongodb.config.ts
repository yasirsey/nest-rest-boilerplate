// src/config/mongodb.config.ts
import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  uri: string;
}

export default registerAs(
  'mongodb',
  (): DatabaseConfig => ({
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/user-auth',
  }),
);
