import { Injectable, BadRequestException } from '@nestjs/common';

import { UsersService } from '../../common/services';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly usersService: UsersService) {}

  public async updateUser(user: User, newName: string, newState: string): Promise<User> {
    const existingUser: User = await this.usersService.findOneByName(newName);
    if (existingUser)
      throw new BadRequestException(`${newName} name is already taken. Please choose another`);

    user.name = newName;
    user.state = newState;

    await this.usersService.create(user);

    delete user.password;

    return user;
  }

  public updatePassword() {}

  public deleteUser() {}
}
