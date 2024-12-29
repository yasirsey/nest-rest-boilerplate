// src/core/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        this.logger.log(
          `${method} ${url} ${ip} ${userAgent} ${endTime - startTime}ms`,
        );
      }),
    );
  }
}
