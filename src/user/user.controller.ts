import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';

import { CreateUserDto } from './dto';
import { UserService } from './services';
import { User } from '../entities';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const user: User = await this.userService.findUserByName(
      createUserDto.name,
    );
    if (user) {
      throw new BadRequestException(
        `A user with the name ${createUserDto.name} already exists`,
      );
    }

    return this.userService.create(createUserDto);
  }
}
