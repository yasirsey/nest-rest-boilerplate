// src/core/guards/throttler.guard.ts
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Cloudflare tarafından sağlanan benzersiz visitor ID'sini kullan
    const cfVisitorId = req.headers['cf-ray'] || 'unknown';

    // API key veya kullanıcı ID'si varsa onları da ekle
    const userId = req.user?.id || 'anonymous';
    const apiKey = req.headers['x-api-key'] || '';

    return `${cfVisitorId}-${userId}-${apiKey}`;
  }

  protected async shouldTrackRequest(
    req: Record<string, any>,
  ): Promise<boolean> {
    // Sağlık kontrolü gibi public endpoint'leri muaf tut
    if (req.path === '/health' || req.path === '/metrics') {
      return false;
    }

    return true;
  }
}
