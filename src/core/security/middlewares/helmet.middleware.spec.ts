// src/core/security/middlewares/helmet.middleware.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HelmetMiddleware } from './helmet.middleware';

// Mock helmet package
jest.mock('helmet', () => {
  return {
    __esModule: true,
    default: () => (req: any, res: any, next: any) => next(),
  };
});

describe('HelmetMiddleware', () => {
  let middleware: HelmetMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelmetMiddleware],
    }).compile();

    middleware = module.get<HelmetMiddleware>(HelmetMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next function', () => {
    const mockReq = {};
    const mockRes = { setHeader: jest.fn() };
    const next = jest.fn();

    middleware.handle(mockReq as any, mockRes as any, next);
    expect(next).toHaveBeenCalled();
  });
});
