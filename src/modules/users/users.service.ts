// src/modules/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from '../../core/dtos/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    
    const savedUser = await createdUser.save();
    return savedUser.toJSON();
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().exec();
    return users.map(user => user.toJSON());
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user.toJSON();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
      
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return updatedUser.toJSON();
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
