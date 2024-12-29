// src/core/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap((response) => {
        const endTime = Date.now();
        this.logger.log(
          `[${method}] ${url} - Status: ${context.switchToHttp().getResponse().statusCode} - ${endTime - startTime}ms`,
          {
            method,
            url,
            userAgent,
            body,
            response,
            duration: endTime - startTime,
          },
        );
      }),
      catchError((error) => {
        const endTime = Date.now();
        this.logger.error(`[${method}] ${url} - Error: ${error.message}`, {
          method,
          url,
          userAgent,
          body,
          error: {
            message: error.message,
            stack: error.stack,
            ...error,
          },
          duration: endTime - startTime,
        });
        throw error;
      }),
    );
  }
}
