// src/modules/users/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PaginatedResult } from 'src/core/interfaces/base-api-response.interface';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: CreateUserDto): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async findOne(
    filter: FilterQuery<UserDocument>,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne(filter).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateOne(
    filter: FilterQuery<UserDocument>,
    update: UpdateQuery<UserDocument>,
  ): Promise<any> {
    return this.userModel.updateOne(filter, update).exec();
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<UserDocument>> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.userModel.find().select('-password').skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdateUserDto): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .select('-password')
      .exec();
  }

  async delete(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findByResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      })
      .exec();
  }

  async updateResetToken(
    userId: string,
    data: { token: string; expires: Date },
  ): Promise<void> {
    await this.userModel
      .updateOne(
        { _id: userId },
        {
          passwordResetToken: data.token,
          passwordResetExpires: data.expires,
        },
      )
      .exec();
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel
      .updateOne(
        { _id: userId },
        {
          $set: { password: hashedPassword },
          $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
        },
      )
      .exec();
  }
}
