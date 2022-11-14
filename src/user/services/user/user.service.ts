import { Injectable } from '@nestjs/common';

import { CreateUserDto, UpdateUserDto } from '../../dto';
import { User } from '../../../entities';
import { UsersService } from '../../../common/repositories';
import { PasswordEncrypterService } from '../password-encrypter/password-encrypter.service';

@Injectable()
export class UserService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordEncrypterService: PasswordEncrypterService,
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.createUserInstance(createUserDto);
    user.password = await this.passwordEncrypterService.encrypt(user.password);

    return this.usersService.create(user);
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  private createUserInstance(createUserDto: CreateUserDto) {
    const user = new User();
    user.name = createUserDto.name;
    user.state = createUserDto.state;
    user.password = createUserDto.password;

    return user;
  }
}
