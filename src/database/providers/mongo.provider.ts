// src/database/providers/mongo.provider.ts
import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const createMongooseModules = async (
  connections: string[],
): Promise<DynamicModule[]> => {
  return connections.map((connectionName) =>
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      connectionName,
      useFactory: (configService: ConfigService) => {
        const mongoConfig = configService.get(
          `database.mongodb.${connectionName}`,
        );
        if (!mongoConfig) {
          throw new Error(
            `MongoDB config not found for connection: ${connectionName}`,
          );
        }

        return {
          uri: mongoConfig.uri,
          dbName: mongoConfig.dbName,
        };
      },
      inject: [ConfigService],
    }),
  );
};
