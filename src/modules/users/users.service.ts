// src/modules/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repositories/user.repository';
import { LoggerService } from '../../core/services/logger.service';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from 'src/core/dto/pagination.dto';
import { PaginatedResult } from 'src/core/interfaces/base-api-response.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService,
    private readonly i18nService: I18nService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      this.logger.warn(
        `User creation failed: Email already exists: ${createUserDto.email}`,
        'UsersService',
      );
      throw new ConflictException(
        await this.i18nService.translate('modules.users.messages.EMAIL.EXISTS'),
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    this.logger.log(
      `User created successfully: ${user.email}`,
      'UsersService',
      { userId: user._id },
    );

    return user;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<User>> {
    return this.userRepository.findAllPaginated(
      paginationDto.page,
      paginationDto.limit,
    );
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      this.logger.warn(`User not found with id: ${id}`, 'UsersService');
      throw new NotFoundException(
        await this.i18nService.translate('modules.users.messages.NOT_FOUND'),
      );
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`, 'UsersService');
      throw new NotFoundException(
        await this.i18nService.translate('modules.users.messages.NOT_FOUND'),
      );
    }
    return user;
  }

  async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<UserDocument> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(
        await this.i18nService.translate(
          'modules.auth.messages.INVALID_CREDENTIALS',
        ),
      );
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.userRepository.update(id, updateUserDto);
    if (!user) {
      this.logger.warn(`User not found with id: ${id}`, 'UsersService');
      throw new NotFoundException(
        await this.i18nService.translate('modules.users.messages.NOT_FOUND'),
      );
    }

    this.logger.log(`User updated: ${id}`, 'UsersService');
    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.delete(id);
    if (!user) {
      this.logger.warn(`User not found with id: ${id}`, 'UsersService');
      throw new NotFoundException(
        await this.i18nService.translate('modules.users.messages.NOT_FOUND'),
      );
    }

    this.logger.log(`User deleted: ${id}`, 'UsersService');
  }

  async findByRefreshToken(refreshToken: string): Promise<UserDocument | null> {
    return this.userRepository.findOne({
      'refreshTokens.token': refreshToken,
    });
  }

  async addRefreshToken(
    userId: string,
    refreshToken: { token: string; expires: Date },
  ): Promise<void> {
    await this.userRepository.updateOne(
      { _id: userId },
      { $push: { refreshTokens: refreshToken } },
    );
  }

  async removeRefreshToken(userId: string, token: string): Promise<void> {
    await this.userRepository.updateOne(
      { _id: userId },
      { $pull: { refreshTokens: { token } } },
    );
  }

  async rotateRefreshToken(
    userId: string,
    oldToken: string,
    newToken: { token: string; expires: Date },
  ): Promise<void> {
    await this.userRepository.updateOne(
      { _id: userId, 'refreshTokens.token': oldToken },
      {
        $set: { 'refreshTokens.$': newToken },
      },
    );
  }
}
