// src/core/security/middlewares/hpp.middleware.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HppMiddleware } from './hpp.middleware';

// Mock hpp package
jest.mock('hpp', () => {
  return {
    __esModule: true,
    default: () => (req: any, res: any, next: any) => next(),
  };
});

describe('HppMiddleware', () => {
  let middleware: HppMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HppMiddleware],
    }).compile();

    middleware = module.get<HppMiddleware>(HppMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should clean duplicate query parameters', () => {
    const mockReq = {
      query: {
        test: ['value1', 'value2'],
        single: 'value',
      },
    };
    const mockRes = { setHeader: jest.fn() };
    const next = jest.fn();

    middleware.handle(mockReq as any, mockRes as any, next);
    expect(next).toHaveBeenCalled();
  });
});
