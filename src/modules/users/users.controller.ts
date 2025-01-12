// src/modules/users/users.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User has been successfully created.',
    type: User,
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @I18n() i18n: I18nContext,
  ) {
    const user = await this.usersService.create(createUserDto, i18n.lang);
    return {
      data: user,
      message: await i18n.translate('modules.users.messages.CREATED'),
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all users',
    type: [User],
  })
  async findAll(@I18n() i18n: I18nContext) {
    const users = await this.usersService.findAll(i18n.lang);
    return {
      data: users,
      message: await i18n.translate('modules.users.messages.FETCHED_ALL'),
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the user',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async findOne(@Param('id') id: string, @I18n() i18n: I18nContext) {
    const user = await this.usersService.findOne(id, i18n.lang);
    return {
      data: user,
      message: await i18n.translate('modules.users.messages.FETCHED'),
    };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User has been successfully updated.',
    type: User,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @I18n() i18n: I18nContext,
  ) {
    const user = await this.usersService.update(id, updateUserDto, i18n.lang);
    return {
      data: user,
      message: await i18n.translate('modules.users.messages.UPDATED'),
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User has been successfully deleted.',
  })
  async remove(@Param('id') id: string, @I18n() i18n: I18nContext) {
    await this.usersService.remove(id, i18n.lang);
    return {
      message: await i18n.translate('modules.users.messages.DELETED'),
    };
  }
}
