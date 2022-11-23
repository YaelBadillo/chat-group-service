import { Body, Controller, Get, Patch, Post } from '@nestjs/common';

import { ChannelOwner, Public, UserFromRequest, ChannelFromRequest } from '../../common/decorators';
import { ChannelService } from '../services';
import { Channel, User } from '../../entities';
import { CreateChannelDto, UpdateChannelDto } from '../dto';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  public createChannel(
    @UserFromRequest() user: User,
    @Body() createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    return this.channelService.create(user, createChannelDto);
  }

  @Get()
  @Public()
  public getAll(): Promise<Channel[]> {
    return this.channelService.getAll();
  }

  @Patch()
  @ChannelOwner()
  public update(
    @ChannelFromRequest() channel: Channel,
    @Body() updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    return this.channelService.update(channel, updateChannelDto);
  }
}
