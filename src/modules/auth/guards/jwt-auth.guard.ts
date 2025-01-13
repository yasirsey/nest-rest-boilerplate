// src/modules/auth/guards/jwt-auth.guard.ts
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { I18nService } from 'nestjs-i18n';
import { TokenBlacklistService } from '../services/token-blacklist.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private i18n: I18nService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      const isBlacklisted =
        await this.tokenBlacklistService.isBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException(
          this.i18n.translate('auth.errors.TOKEN_REVOKED'),
        );
      }
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  private extractTokenFromHeader(request: any): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const lang = context.switchToHttp().getRequest().i18nLang || 'en';

    if (err || !user) {
      throw new UnauthorizedException(
        this.i18n.translate('modules.auth.messages.UNAUTHORIZED', {
          lang,
        }),
      );
    }
    return user;
  }
}
