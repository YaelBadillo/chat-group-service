import { Injectable, BadRequestException } from '@nestjs/common';

import { User } from '../entities';
import { UsersService } from '../common/services';
import { PasswordService } from '../shared/password/password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
  ) {}

  public async signUp(name: string, password: string) {
    const user: User = await this.usersService.findOneByName(name);
    if (user) {
      throw new BadRequestException(`A user with the name ${name} already exists`);
    }

    const hashedPassword: string = await this.passwordService.encrypt(password);

    const newUser: User = this.createUserInstance(name, hashedPassword)

    return await this.usersService.create(newUser);
  }

  private createUserInstance(name: string, password: string) {
    const newUser = new User();
    newUser.name = name;
    newUser.password = password;

    return newUser;
  }
}
