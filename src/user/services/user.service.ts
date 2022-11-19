import { Injectable, BadRequestException } from '@nestjs/common';

import { UsersService } from '../../common/services';
import { User } from '../../entities';
import { PasswordService } from '../../shared/password';

@Injectable()
export class UserService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService
  ) {}

  public async updateUser(user: User, newName: string, newState: string): Promise<User> {
    const namesAreEqual: boolean = user.name === newName;

    const existingUser: User = await this.usersService.findOneByName(newName);
    if (existingUser && !namesAreEqual)
      throw new BadRequestException(`${newName} name is already taken. Please choose another`);

    user.name = newName;
    user.state = newState;

    await this.usersService.create(user);

    delete user.password;

    return user;
  }

  public async updatePassword(
    user: User,
    oldPassword: string, 
    newPassword: string,
  ) {
    const areEqual: boolean = await this.passwordService.compare(
      oldPassword,
      user.password,
    );
    if (!areEqual)
      throw new BadRequestException('Incorrect password');

    const newHashedPassword: string = await this.passwordService.encrypt(
      newPassword,
    );

    user.password = newHashedPassword;
    await this.usersService.create(user);
    
    return { status: 'ok', message: 'Password has been changed' };
  }

  public async deleteUser(user: User, password: string) {
    const areEqual: boolean = await this.passwordService.compare(
      password,
      user.password,
    );
    if(!areEqual)
      throw new BadRequestException('Incorrect password');

    await this.usersService.remove(user);

    return { status: 'ok', message: 'User has been successfully deleted' };
  }
}
