// src/modules/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoggerService } from '../../core/services/logger.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly logger: LoggerService,
    private readonly i18n: I18nService,
  ) {}

  async create(createUserDto: CreateUserDto, lang: string): Promise<User> {
    const { email, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException(
        await this.i18n.translate('modules.users.validations.EMAIL.EXISTS', {
          lang,
        }),
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const createdUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });
      const user = await createdUser.save();
      this.logger.log(`User created: ${user.email}`, 'UsersService');
      return user;
    } catch (error) {
      this.logger.error(
        `Error creating user: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw new InternalServerErrorException(
        await this.i18n.translate('common.errors.INTERNAL_ERROR', { lang }),
      );
    }
  }

  async findAll(lang: string): Promise<User[]> {
    try {
      const users = await this.userModel.find().select('-password').exec();
      if (!users.length) {
        this.logger.warn('No users found in the database', 'UsersService');
      }
      return users;
    } catch (error) {
      this.logger.error(
        `Error fetching users: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw new InternalServerErrorException(
        await this.i18n.translate('common.errors.INTERNAL_ERROR', { lang }),
      );
    }
  }

  async findOne(id: string, lang: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).select('-password').exec();
      if (!user) {
        this.logger.warn(`User not found with id: ${id}`, 'UsersService');
        throw new NotFoundException(
          await this.i18n.translate('modules.users.messages.NOT_FOUND', {
            lang,
          }),
        );
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Error fetching user: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw new InternalServerErrorException(
        await this.i18n.translate('common.errors.INTERNAL_ERROR', { lang }),
      );
    }
  }

  async findByEmail(email: string, lang: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        throw new NotFoundException(
          await this.i18n.translate('modules.users.messages.NOT_FOUND', {
            lang,
          }),
        );
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Error fetching user by email: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw new InternalServerErrorException(
        await this.i18n.translate('common.errors.INTERNAL_ERROR', { lang }),
      );
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    lang: string,
  ): Promise<User> {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .select('-password')
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(
          await this.i18n.translate('modules.users.messages.NOT_FOUND', {
            lang,
          }),
        );
      }

      this.logger.log(`User updated: ${id}`, 'UsersService');
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Error updating user: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw new InternalServerErrorException(
        await this.i18n.translate('common.errors.INTERNAL_ERROR', { lang }),
      );
    }
  }

  async remove(id: string, lang: string): Promise<void> {
    try {
      const result = await this.userModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(
          await this.i18n.translate('modules.users.messages.NOT_FOUND', {
            lang,
          }),
        );
      }
      this.logger.log(`User deleted: ${id}`, 'UsersService');
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Error deleting user: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw new InternalServerErrorException(
        await this.i18n.translate('common.errors.INTERNAL_ERROR', { lang }),
      );
    }
  }
}
