import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';

import { UserService } from '../services';
import { User } from '../../entities';
import { UserFromRequest } from '../../common/decorators';
import { DeleteUserDto, UpdatePasswordDto, UpdateUserDto } from '../dto';
import { StatusResponse } from '../../common/interfaces';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  public getUser(
    @UserFromRequest() user: User,
  ): Promise<Partial<User>> {
    return this.userService.removePassword(user);
  }

  @Patch('update')
  public updateUser(
    @Body() { newName, newState }: UpdateUserDto,
    @UserFromRequest() user: User,
  ): Promise<Partial<User>> {
    return this.userService.updateUser(user, newName, newState);
  }

  @Patch('password')
  public updatePassword(
    @Body() { oldPassword, newPassword }: UpdatePasswordDto,
    @UserFromRequest() user: User,
  ): Promise<StatusResponse> {
    return this.userService.updatePassword(user, oldPassword, newPassword);
  }

  @Delete()
  public deleteUser(
    @Body() { password }: DeleteUserDto,
    @UserFromRequest() user: User,
  ): Promise<StatusResponse> {
    return this.userService.deleteUser(user, password);
  }
}
