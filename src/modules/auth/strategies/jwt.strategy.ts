// src/modules/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private i18n: I18nService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any, lang: string) {
    const user = await this.usersService.findOne(payload.sub, lang);
    if (!user) {
      throw new UnauthorizedException(
        await this.i18n.translate('modules.auth.messages.UNAUTHORIZED', {
          lang,
        }),
      );
    }
    return user;
  }
}
