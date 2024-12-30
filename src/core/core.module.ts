// src/core/core.module.ts
import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
  exports: [],
})
export class CoreModule {}
