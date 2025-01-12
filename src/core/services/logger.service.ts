// src/core/services/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(message: any, context?: string): string {
    return `[${context || 'Application'}] ${message}`;
  }

  log(message: any, context?: string): void {
    console.log(
      `${this.getTimestamp()} [INFO] ${this.formatMessage(message, context)}`,
    );
  }

  error(message: any, trace?: string, context?: string): void {
    console.error(
      `${this.getTimestamp()} [ERROR] ${this.formatMessage(message, context)}`,
    );
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: any, context?: string): void {
    console.warn(
      `${this.getTimestamp()} [WARN] ${this.formatMessage(message, context)}`,
    );
  }

  debug(message: any, context?: string): void {
    console.debug(
      `${this.getTimestamp()} [DEBUG] ${this.formatMessage(message, context)}`,
    );
  }

  verbose(message: any, context?: string): void {
    console.log(
      `${this.getTimestamp()} [VERBOSE] ${this.formatMessage(message, context)}`,
    );
  }
}
