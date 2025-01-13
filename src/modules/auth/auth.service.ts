// src/modules/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LoggerService } from '../../core/services/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.validateUserCredentials(
      loginDto.email,
      loginDto.password,
    );

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
      message: 'Login successful',
    };
  }
}
