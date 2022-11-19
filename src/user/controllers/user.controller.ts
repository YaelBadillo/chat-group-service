import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';

import { UserService } from '../services';
import { User } from '../../entities';
import { UserFromRequest } from '../../common/decorators';
import { DeleteUserDto, UpdatePasswordDto, UpdateUserDto } from '../dto';
import { UpdatePasswordResponse } from '../interfaces';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  public getUser(
    @UserFromRequest() user: User,
  ): User {
    delete user.password;

    return user;
  }

  @Patch('update')
  public updateUser(
    @Body() { newName, newState }: UpdateUserDto,
    @UserFromRequest() user: User,
  ): Promise<User> {
    return this.userService.updateUser(user, newName, newState);
  }

  @Patch('password')
  public updatePassword(
    @Body() { oldPassword, newPassword }: UpdatePasswordDto,
    @UserFromRequest() user: User,
  ): Promise<UpdatePasswordResponse> {
    return this.userService.updatePassword(user, oldPassword, newPassword);
  }

  @Delete()
  public deleteUser(
    @Body() { password }: DeleteUserDto,
    @UserFromRequest() user: User,
  ) {
    return this.userService.deleteUser(user, password);
  }
}
