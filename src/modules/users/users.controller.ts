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
  Query,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { I18nService } from 'nestjs-i18n';
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
import { Language } from 'src/core/decorators/language.decorator';
import {
  BaseApiResponse,
  PaginatedResult,
} from 'src/core/interfaces/base-api-response.interface';
import { PaginationDto } from 'src/core/dto/pagination.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18nService: I18nService,
  ) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User has been successfully created.',
    type: User,
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Language() lang: string,
  ): Promise<BaseApiResponse<User>> {
    const user = await this.usersService.create(createUserDto);
    return {
      data: user,
      message: await this.i18nService.translate(
        'modules.users.messages.CREATED',
        {
          lang,
        },
      ),
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Language() lang: string,
  ): Promise<BaseApiResponse<PaginatedResult<User>>> {
    const result = await this.usersService.findAll(paginationDto);
    return {
      data: result,
      message: await this.i18nService.translate(
        'modules.users.messages.FETCHED_ALL',
        {
          lang,
        },
      ),
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a user by id' })
  async findOne(
    @Param('id') id: string,
    @Language() lang: string,
  ): Promise<BaseApiResponse<User>> {
    const user = await this.usersService.findOne(id);
    return {
      data: user,
      message: await this.i18nService.translate(
        'modules.users.messages.FETCHED',
        {
          lang,
        },
      ),
    };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Language() lang: string,
  ): Promise<BaseApiResponse<User>> {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      data: user,
      message: await this.i18nService.translate(
        'modules.users.messages.UPDATED',
        {
          lang,
        },
      ),
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user' })
  async remove(
    @Param('id') id: string,
    @Language() lang: string,
  ): Promise<BaseApiResponse<void>> {
    await this.usersService.remove(id);
    return {
      data: null,
      message: await this.i18nService.translate(
        'modules.users.messages.DELETED',
        {
          lang,
        },
      ),
    };
  }
}
