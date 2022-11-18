import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from '../../entities';
import { UsersService } from '../../common/services';
import { PasswordService } from '../../shared/password';
import { LogInResponse } from '../interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  public async signUp(name: string, password: string): Promise<User> {
    const user: User = await this.usersService.findOneByName(name);
    if (user)
      throw new BadRequestException(
        `A user with the name ${name} already exists`,
      );

    const hashedPassword: string = await this.passwordService.encrypt(password);

    const userInstance: User = this.createUserInstance(name, hashedPassword);

    return this.usersService.create(userInstance);
  }

  public async logIn(name: string, password: string): Promise<LogInResponse> {
    const user: User = await this.usersService.findOneByName(name);
    if (!user) throw new BadRequestException('The user does not exists');

    const areEqual: boolean = await this.passwordService.compare(
      password,
      user.password,
    );
    if (!areEqual) throw new BadRequestException('Invalid password');

    const token: string = this.generateToken(user.name, user.updatedAt);

    return {
      user: user,
      accessToken: token,
    };
  }

  private createUserInstance(name: string, password: string) {
    const newUser = new User();
    newUser.name = name;
    newUser.password = password;

    return newUser;
  }

  private generateToken(name: string, updatedAt: Date) {
    return this.jwtService.sign({ name, updatedAt });
  }
}
