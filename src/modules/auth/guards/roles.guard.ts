// src/modules/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user, i18nLang } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new UnauthorizedException(
        await this.i18n.translate('modules.auth.messages.UNAUTHORIZED', {
          lang: i18nLang,
        }),
      );
    }

    return true;
  }
}
