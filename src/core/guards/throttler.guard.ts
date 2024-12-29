// src/core/guards/throttler.guard.ts
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // X-Forwarded-For header'ı kontrol ediyoruz, proxy arkasında çalışması için
    const ip = req.ips.length ? req.ips[0] : req.ip;

    // API key veya kullanıcı ID'si varsa onları da ekleyebiliriz
    const userId = req.user?.id || 'anonymous';
    const apiKey = req.headers['x-api-key'] || '';

    // Benzersiz bir tracker oluştur
    return `${ip}-${userId}-${apiKey}`;
  }

  // İsteğe bağlı olarak bazı route'ları throttling'den muaf tutabiliriz
  protected async shouldTrackRequest(
    req: Record<string, any>,
  ): Promise<boolean> {
    // Sağlık kontrolü gibi public endpoint'leri muaf tut
    if (req.path === '/health' || req.path === '/metrics') {
      return false;
    }

    // Whitelist'teki IP'leri muaf tut
    const whitelistedIps = ['127.0.0.1', 'localhost'];
    if (whitelistedIps.includes(req.ip)) {
      return false;
    }

    return true;
  }
}
