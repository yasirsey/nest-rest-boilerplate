// src/database/database.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// import { TypeOrmModule } from '@nestjs/typeorm';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        ...this.createMongoConnections(),
        ...this.createMssqlConnections(),
      ],
      global: true,
    };
  }

  private static createMongoConnections() {
    return [
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const mongoConfig = configService.get('database.mongodb.default');
          if (!mongoConfig) {
            throw new Error('MongoDB config not found');
          }
          return {
            uri: mongoConfig.uri,
            dbName: mongoConfig.dbName,
          };
        },
        inject: [ConfigService],
      }),
    ];
  }

  private static createMssqlConnections() {
    return [
      // TypeOrmModule.forRootAsync({
      //   imports: [ConfigModule],
      //   name: 'MSSQL_CONNECTION_DEFAULT',
      //   useFactory: (configService: ConfigService) => {
      //     const mssqlEnabled = configService.get('MSSQL_ENABLED') === 'true';
      //     if (!mssqlEnabled) return null;
      //     const mssqlConfig = configService.get('database.mssql.default');
      //     if (!mssqlConfig) {
      //       throw new Error('MSSQL config not found');
      //     }
      //     return {
      //       type: 'mssql',
      //       host: mssqlConfig.host,
      //       port: mssqlConfig.port,
      //       username: mssqlConfig.username,
      //       password: mssqlConfig.password,
      //       database: mssqlConfig.database,
      //       entities: [],
      //       synchronize: configService.get('NODE_ENV') !== 'production',
      //     };
      //   },
      //   inject: [ConfigService],
      // }),
    ];
  }
}
