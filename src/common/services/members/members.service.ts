import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Member } from '../../../entities';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
  ) {}

  public async save(
    member: Partial<Member>,
  ): Promise<Partial<Member> & Member> {
    try {
      const newMember: Partial<Member> & Member =
        await this.membersRepository.save<Partial<Member>>(member);
      return newMember;
    } catch (error) {
      throw new InternalServerErrorException(
        'Member could not be created or updated',
      );
    }
  }
}
