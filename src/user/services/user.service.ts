import { Injectable, BadRequestException } from '@nestjs/common';

import { UsersService } from '../../common/services';
import { User } from '../../entities';
import { PasswordService } from '../../shared/password';
import { SerializerService } from '../../shared/serializer';
import { StatusResponse } from '../../common/interfaces';

@Injectable()
export class UserService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly serializerService: SerializerService,
  ) {}

  public async removePassword(user: User): Promise<Partial<User>> {
    const properties: string[] = ['password'];

    return this.serializerService.deleteProperties<User>(user, properties);
  }

  public async updateUser(
    user: User,
    newName: string,
    newState: string,
  ): Promise<Partial<User>> {
    const namesAreEqual: boolean = user.name === newName;

    const existingUser: User = await this.usersService.findOneByName(newName);
    if (existingUser && !namesAreEqual)
      throw new BadRequestException(
        `${newName} name is already taken. Please choose another`,
      );

    user.name = newName;
    user.state = newState;

    await this.usersService.create(user);

    return this.removePassword(user);
  }

  public async updatePassword(
    user: User,
    oldPassword: string,
    newPassword: string,
  ): Promise<StatusResponse> {
    const areEqual: boolean = await this.passwordService.compare(
      oldPassword,
      user.password,
    );
    if (!areEqual) throw new BadRequestException('Incorrect password');

    const newHashedPassword: string = await this.passwordService.encrypt(
      newPassword,
    );

    user.password = newHashedPassword;
    await this.usersService.create(user);

    return { status: 'ok', message: 'Password has been changed' };
  }

  public async deleteUser(
    user: User,
    password: string,
  ): Promise<StatusResponse> {
    const areEqual: boolean = await this.passwordService.compare(
      password,
      user.password,
    );
    if (!areEqual) throw new BadRequestException('Incorrect password');

    await this.usersService.remove(user);

    return { status: 'ok', message: 'User has been successfully deleted' };
  }
}
