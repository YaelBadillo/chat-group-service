import { Controller, Delete, Get, Patch } from '@nestjs/common';

import { UserService } from '../services';
import { User } from '../../entities';
import { UserFromRequest } from '../../common/decorators';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  public getUser(
    @UserFromRequest() user: User,
  ): User {
    return user;
  }

  @Patch('update')
  public updateUser() {}

  @Patch('password')
  public updatePassword() {}

  @Delete()
  public deleteUser() {}
}
