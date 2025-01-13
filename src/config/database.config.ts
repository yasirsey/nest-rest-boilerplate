// src/config/database.config.ts
import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  mongodb: {
    default: {
      uri: process.env.MONGODB_URI,
      dbName: process.env.MONGODB_DB_NAME,
    },
  },
  mssql:
    process.env.MSSQL_ENABLED === 'true'
      ? {
          default: {
            host: process.env.MSSQL_HOST,
            port: parseInt(process.env.MSSQL_PORT, 10),
            username: process.env.MSSQL_USERNAME,
            password: process.env.MSSQL_PASSWORD,
            database: process.env.MSSQL_DATABASE,
          },
        }
      : undefined,
}));
