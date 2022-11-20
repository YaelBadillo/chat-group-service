import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Channel } from '../../../entities';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
  ) {};

  public save(channel: Partial<Channel>): Promise<Channel> {
    try {
      return this.channelRepository.save<Partial<Channel>>(channel);
    } catch (error) {
      throw new InternalServerErrorException('Channel could not be created or updated');
    }
  }
}
