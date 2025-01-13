import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const createMssqlProviders = async (
  connections: string[],
): Promise<DynamicModule[]> => {
  return connections.map((connectionName) =>
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: `MSSQL_CONNECTION_${connectionName.toUpperCase()}`,
      useFactory: (configService: ConfigService) => {
        const mssqlConfig = configService.get(
          `database.mssql.${connectionName}`,
        );
        if (!mssqlConfig) {
          throw new Error(
            `MSSQL config not found for connection: ${connectionName}`,
          );
        }

        return {
          type: 'mssql',
          host: mssqlConfig.host,
          port: mssqlConfig.port,
          username: mssqlConfig.username,
          password: mssqlConfig.password,
          database: mssqlConfig.database,
          entities: [],
          synchronize: process.env.NODE_ENV !== 'production',
        };
      },
      inject: [ConfigService],
    }),
  );
};
