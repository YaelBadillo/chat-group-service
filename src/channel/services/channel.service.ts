import { Injectable, BadRequestException } from '@nestjs/common';

import { User, Channel } from '../../entities';
import { ChannelsService } from '../../common/services';
import { CreateChannelDto, UpdateChannelDto } from '../dto';

@Injectable()
export class ChannelService {
  constructor(private readonly channelsService: ChannelsService) {}

  public async create(
    user: User,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    const channel: Channel = await this.channelsService.findOneByName(
      createChannelDto.name,
    );
    if (channel)
      throw new BadRequestException(
        `${createChannelDto.name} name is already taken. Please choose another`,
      );

    const channelInstance: Channel = this.createChannelInstance(
      user,
      createChannelDto,
    );

    return this.channelsService.save(channelInstance);
  }

  public getAll(): Promise<Channel[]> {
    return this.channelsService.findAll();
  }

  public update(
    channel: Channel,
    updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    this.updateChannelInstance(channel, updateChannelDto);

    return this.channelsService.save(channel);
  }

  private createChannelInstance(
    user: User,
    { name, space, description }: CreateChannelDto,
  ): Channel {
    const channelInstance = new Channel();
    channelInstance.name = name;
    channelInstance.space = space;
    channelInstance.description = description;
    channelInstance.ownerId = user.id;
    channelInstance.createdBy = user.id;
    channelInstance.updatedBy = user.id;

    return channelInstance;
  }

  private updateChannelInstance(
    channel: Channel,
    updateChannelDto: UpdateChannelDto,
  ): Channel {
    channel.name = updateChannelDto.name;
    channel.space = updateChannelDto.space;
    channel.description = updateChannelDto.description;

    return channel;
  }
}
