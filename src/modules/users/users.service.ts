// src/modules/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
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
    const { email } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      this.logger.warn(
        `User creation failed: Email already exists: ${email}`,
        'UsersService',
      );
      throw new ConflictException(
        await this.i18n.translate('modules.users.messages.EMAIL.EXISTS', {
          lang,
        }),
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const user = await createdUser.save();
    this.logger.log(
      `User created successfully: ${user.email}`,
      'UsersService',
      { userId: user._id },
    );

    return user;
  }

  async findAll(lang: string): Promise<User[]> {
    const users = await this.userModel.find().select('-password').exec();
    if (!users.length) {
      this.logger.warn('No users found in the database', 'UsersService');
    }
    return users;
  }

  async findOne(id: string, lang: string): Promise<User> {
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
  }

  async findByEmail(email: string, lang: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`, 'UsersService');
      throw new NotFoundException(
        await this.i18n.translate('modules.users.messages.NOT_FOUND', {
          lang,
        }),
      );
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    lang: string,
  ): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      this.logger.warn(`User not found with id: ${id}`, 'UsersService');
      throw new NotFoundException(
        await this.i18n.translate('modules.users.messages.NOT_FOUND', {
          lang,
        }),
      );
    }

    this.logger.log(`User updated: ${id}`, 'UsersService');
    return updatedUser;
  }

  async remove(id: string, lang: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      this.logger.warn(`User not found with id: ${id}`, 'UsersService');
      throw new NotFoundException(
        await this.i18n.translate('modules.users.messages.NOT_FOUND', {
          lang,
        }),
      );
    }

    this.logger.log(`User deleted: ${id}`, 'UsersService');
  }
}
