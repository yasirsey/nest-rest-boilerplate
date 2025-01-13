// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '../../core/services/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly logger: LoggerService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    lang: string,
  ): Promise<any> {
    const user = await this.usersService.findByEmail(email, lang);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { ...result } = user.toJSON();
      return result;
    }

    this.logger.warn(`Failed login attempt for email: ${email}`, 'AuthService');
    return null;
  }

  async login(loginDto: LoginDto, lang: string) {
    const user = await this.validateUser(
      loginDto.email,
      loginDto.password,
      lang,
    );

    if (!user) {
      throw new UnauthorizedException(
        await this.i18n.translate('modules.auth.messages.INVALID_CREDENTIALS', {
          lang,
        }),
      );
    }

    const payload = { email: user.email, sub: user._id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    this.logger.log(
      `User logged in successfully: ${user.email}`,
      'AuthService',
      { userId: user._id },
    );

    return {
      data: {
        user,
        access_token,
      },
      message: await this.i18n.translate(
        'modules.auth.messages.LOGIN_SUCCESS',
        { lang },
      ),
    };
  }
}
