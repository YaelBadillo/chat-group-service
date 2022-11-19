import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '../../../entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  public create(user: Partial<User>): Promise<User> {
    try {
      return this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('User could not be created');
    }
  }

  public findOneByName(name: string): Promise<User> {
    try {
      return this.usersRepository.findOneBy({ name });
    } catch (error) {
      throw new InternalServerErrorException('User could not be found');
    }
  }

  public async delete(user: User) {
    try {
      await this.usersRepository.delete(user)
      return user;
    } catch (error) {
      throw new InternalServerErrorException('User could not be deleted');
    }
  }
}
