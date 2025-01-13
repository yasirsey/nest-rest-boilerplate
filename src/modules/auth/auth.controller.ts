// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { BaseApiResponse } from 'src/core/interfaces/base-api-response.interface';
import { User } from '../users/schemas/user.schema';

// src/modules/auth/auth.controller.ts
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18nService: I18nService,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<BaseApiResponse<{ user: User; access_token: string }>> {
    return this.authService.login(loginDto);
  }
}
