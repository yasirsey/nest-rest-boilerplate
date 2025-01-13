// src/database/interfaces/database-options.interface.ts
export interface MongoDbOptions {
  uri: string;
  dbName: string;
}

export interface MssqlOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface DatabaseOptions {
  mongodb?: Record<string, MongoDbOptions>;
  mssql?: Record<string, MssqlOptions>;
}
