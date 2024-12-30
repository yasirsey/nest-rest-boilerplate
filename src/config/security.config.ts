// src/core/config/security.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
  refreshTokenSecret:
    process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
  accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION || '15m',
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',

  // Password Hashing
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),

  // Rate Limiting
  throttle: {
    global: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10), // 60 seconds
      limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests
    },
    auth: {
      ttl: 60 * 15, // 15 minutes
      limit: 5, // 5 login attempts
    },
    signup: {
      ttl: 60 * 60, // 1 hour
      limit: 3, // 3 accounts per hour
    },
  },

  // Security Headers
  cors: {
    enabled: process.env.CORS_ENABLED === 'true',
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
  csrf: {
    publicPaths: [
      '/api/auth/login',
      '/api/auth/register',
      '/health',
      '/metrics',
    ],
    secret: process.env.CSRF_SECRET || 'your-csrf-secret',
  },

  // IP Whitelist
  ipWhitelist: process.env.IP_WHITELIST?.split(',') || [],

  // API Rate Limits by Endpoint
  endpointLimits: {
    '/api/auth/login': { ttl: 900, limit: 5 },
    '/api/auth/register': { ttl: 3600, limit: 3 },
    '/api/users': { ttl: 60, limit: 100 },
  },
}));
