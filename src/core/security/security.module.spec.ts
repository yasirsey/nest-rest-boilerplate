// src/core/security/security.module.spec.ts
import { Test } from '@nestjs/testing';
import { SecurityModule } from './security.module';
import { SecurityService } from './security.service';
import { ConfigModule } from '@nestjs/config';

describe('SecurityModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [
        SecurityModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
    }).compile();

    expect(module).toBeDefined();
    const securityService = module.get<SecurityService>(SecurityService);
    expect(securityService).toBeDefined();
  });
});
