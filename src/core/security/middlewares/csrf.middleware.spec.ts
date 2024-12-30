// src/core/security/middlewares/csrf.middleware.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CsrfMiddleware } from './csrf.middleware';
import { ConfigService } from '@nestjs/config';

describe('CsrfMiddleware', () => {
  let middleware: CsrfMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsrfMiddleware,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    middleware = module.get<CsrfMiddleware>(CsrfMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should skip CSRF for whitelisted paths', () => {
    const mockReq = {
      path: '/api/auth/login',
      method: 'POST',
      headers: {},
    };
    const mockRes = { setHeader: jest.fn() };
    const next = jest.fn();

    middleware.handle(mockReq as any, mockRes as any, next);
    expect(next).toHaveBeenCalled();
  });
});
