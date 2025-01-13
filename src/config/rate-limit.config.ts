// src/config/rate-limit.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('rateLimit', () => ({
  general: {
    ttl: parseInt(process.env.RATE_LIMIT_GENERAL_TTL) || 60000,
    limit: parseInt(process.env.RATE_LIMIT_GENERAL_LIMIT) || 100,
  },
  auth: {
    login: {
      success: {
        ttl: 60000,
        limit: 5,
      },
      failure: {
        ttl: 900000, // 15 minutes
        limit: 3,
      },
    },
  },
}));
