// src/core/security/middlewares/cors.middleware.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CorsMiddleware } from './cors.middleware';
import { ConfigService } from '@nestjs/config';

// Mock cors package
jest.mock('cors', () => {
  return {
    __esModule: true,
    default: () => (req: any, res: any, next: any) => next(),
  };
});

describe('CorsMiddleware', () => {
  let middleware: CorsMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorsMiddleware,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'app.env') return 'test';
              if (key === 'security.cors.origin')
                return ['http://localhost:3000'];
              return null;
            }),
          },
        },
      ],
    }).compile();

    middleware = module.get<CorsMiddleware>(CorsMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next function', () => {
    const mockReq = { method: 'GET', headers: {} };
    const mockRes = { setHeader: jest.fn() };
    const next = jest.fn();

    middleware.handle(mockReq as any, mockRes as any, next);
    expect(next).toHaveBeenCalled();
  });
});
