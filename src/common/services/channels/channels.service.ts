import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Channel } from '../../../entities';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
  ) {}

  public async save(channel: Partial<Channel>): Promise<Channel> {
    try {
      const newChannel: Channel = await this.channelRepository.save<
        Partial<Channel>
      >(channel);
      return newChannel;
    } catch (error) {
      throw new InternalServerErrorException(
        'Channel could not be created or updated',
      );
    }
  }

  public async findOneByName(name: string): Promise<Channel> {
    try {
      const channel: Channel = await this.channelRepository.findOneBy({ name });
      return channel;
    } catch (error) {
      throw new InternalServerErrorException('Channel could not be found');
    }
  }

  public async findAll(): Promise<Channel[]> {
    try {
      const channels: Channel[] = await this.channelRepository.find();
      return channels;
    } catch (error) {
      throw new InternalServerErrorException('Channels could not be found');
    }
  }

  public async findOneById(id: string): Promise<Channel> {
    try {
      const channel: Channel = await this.channelRepository.findOneBy({ id });
      return channel;
    } catch (error) {
      throw new InternalServerErrorException('Channel could not be found');
    }
  }

  public async remove(channel: Channel): Promise<Channel> {
    try {
      await this.channelRepository.remove(channel);
      return channel;
    } catch (error) {
      throw new InternalServerErrorException('Channel could not be removed');
    }
  }
}
