// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  app.setGlobalPrefix(apiPrefix);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Security
  app.use(helmet());

  // CORS
  const environment = configService.get<string>('app.env', 'development');
  if (environment !== 'production') {
    app.enableCors();
  }

  // Swagger Setup
  if (environment !== 'production') {
    const config = new DocumentBuilder()
      .setTitle(configService.get<string>('app.name', 'NestJS API'))
      .setDescription('API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  // Start the server
  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation is available at: http://localhost:${port}/docs`,
  );
}

bootstrap();
