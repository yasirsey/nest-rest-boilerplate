// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { BaseApiResponse } from 'src/core/interfaces/base-api-response.interface';
import { User } from '../users/schemas/user.schema';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginRateLimitGuard } from './guards/login-rate-limit.guard';

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
  @UseGuards(LoginRateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<BaseApiResponse<{ user: User; access_token: string }>> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<
    BaseApiResponse<{ user: User; access_token: string; refresh_token: string }>
  > {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req,
    @Body() { refresh_token }: RefreshTokenDto,
  ): Promise<BaseApiResponse<void>> {
    return this.authService.logout(req.user._id, refresh_token);
  }
}
