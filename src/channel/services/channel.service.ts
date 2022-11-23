import { Injectable, BadRequestException } from '@nestjs/common';

import { User, Channel } from '../../entities';
import { ChannelsService } from '../../common/services';
import { CreateChannelDto } from '../dto';

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
}
