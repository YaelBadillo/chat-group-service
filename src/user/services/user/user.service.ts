import { Injectable } from '@nestjs/common';

import { CreateUserDto } from '../../dto';
import { User } from '../../../entities';
import { UsersService } from '../../../common/repositories';
import { PasswordEncrypterService } from '../password-encrypter/password-encrypter.service';

@Injectable()
export class UserService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordEncrypterService: PasswordEncrypterService,
  ) {}

  public findUserByName(name: string): Promise<User> {
    return this.usersService.findOneByName(name);
  }

  public async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.createUserInstance(createUserDto);
    user.password = await this.passwordEncrypterService.encrypt(user.password);

    return this.usersService.create(user);
  }

  private createUserInstance(createUserDto: CreateUserDto): User {
    const user = new User();
    user.name = createUserDto.name;
    user.state = createUserDto.state;
    user.password = createUserDto.password;

    return user;
  }
}
