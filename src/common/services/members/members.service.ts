import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Member } from '../../../entities';
import { InvitationStatus, RequestStatus } from '../../enums';

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

  public async getAllByUserId(userId: string): Promise<Member[]> {
    try {
      const members: Member[] = await this.membersRepository.findBy({ userId });
      return members;
    } catch (error) {
      throw new InternalServerErrorException('Members could not be found');
    }
  }

  public async findAllByChannelIdAndAcceptedStatus(
    channelId: string,
  ): Promise<Member[]> {
    try {
      const members: Member[] = await this.membersRepository.findBy({
        channelId,
        invitationStatus: InvitationStatus.ACCEPTED,
        requestStatus: RequestStatus.ACCEPTED,
      });
      return members;
    } catch (error) {
      throw new InternalServerErrorException('Members could not be found');
    }
  }

  public async findOneByUserIdAndChannelId(
    userId: string,
    channelId: string,
  ): Promise<Member> {
    try {
      const member: Member = await this.membersRepository.findOneBy({
        userId,
        channelId,
      });
      return member;
    } catch (error) {
      throw new InternalServerErrorException('Member could not be found');
    }
  }

  public async findByChannelId(channelId: string): Promise<Member[]> {
    try {
      const members: Member[] = await this.membersRepository.findBy({
        channelId,
      });
      return members;
    } catch (error) {
      throw new InternalServerErrorException(
        `Members of the channel ${channelId} could not found`,
      );
    }
  }

  public async findOneById(id: string): Promise<Member> {
    try {
      const member: Member = await this.membersRepository.findOneBy({ id });
      return member;
    } catch (error) {
      throw new InternalServerErrorException('Member could not be found');
    }
  }
}
