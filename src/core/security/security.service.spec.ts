// src/core/security/security.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SecurityService } from './security.service';
import { CorsMiddleware } from './middlewares/cors.middleware';
import { HelmetMiddleware } from './middlewares/helmet.middleware';
import { HppMiddleware } from './middlewares/hpp.middleware';
import { CsrfMiddleware } from './middlewares/csrf.middleware';
import { ConfigService } from '@nestjs/config';

// Mock the actual middleware methods
jest.mock('./middlewares/cors.middleware', () => ({
  CorsMiddleware: jest.fn().mockImplementation(() => ({
    handle: jest.fn((req, res, next) => next()),
  })),
}));

jest.mock('./middlewares/helmet.middleware', () => ({
  HelmetMiddleware: jest.fn().mockImplementation(() => ({
    handle: jest.fn((req, res, next) => next()),
  })),
}));

jest.mock('./middlewares/hpp.middleware', () => ({
  HppMiddleware: jest.fn().mockImplementation(() => ({
    handle: jest.fn((req, res, next) => next()),
  })),
}));

jest.mock('./middlewares/csrf.middleware', () => ({
  CsrfMiddleware: jest.fn().mockImplementation(() => ({
    handle: jest.fn((req, res, next) => next()),
  })),
}));

describe('SecurityService', () => {
  let securityService: SecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityService,
        CorsMiddleware,
        HelmetMiddleware,
        HppMiddleware,
        CsrfMiddleware,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                'app.env': 'test',
                'security.cors.origin': ['http://localhost:3000'],
                'security.csrfSecret': 'test-secret',
              };
              return config[key];
            }),
          },
        },
        {
          provide: 'SecurityMiddlewares',
          useFactory: (cors, helmet, hpp, csrf) => [cors, helmet, hpp, csrf],
          inject: [
            CorsMiddleware,
            HelmetMiddleware,
            HppMiddleware,
            CsrfMiddleware,
          ],
        },
      ],
    }).compile();

    securityService = module.get<SecurityService>(SecurityService);
  });

  it('should be defined', () => {
    expect(securityService).toBeDefined();
  });

  it('should execute all middlewares in sequence', async () => {
    const mockReq = { method: 'GET', headers: {} };
    const mockRes = { setHeader: jest.fn() };
    const next = jest.fn();

    await securityService.handle(mockReq as any, mockRes as any, next);

    expect(next).toHaveBeenCalled();
  });
});
