import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';

import {
  ChannelOwner,
  Public,
  UserFromRequest,
  ChannelFromRequest,
} from '../../common/decorators';
import { ChannelService } from '../services';
import { Channel, User } from '../../entities';
import { CreateChannelDto, UpdateChannelDto, DeleteChannelDto } from '../dto';
import { StatusResponse } from '../../common/interfaces';
import { CreateChannelResponse } from '../types';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  public createChannel(
    @UserFromRequest() user: User,
    @Body() createChannelDto: CreateChannelDto,
  ): Promise<CreateChannelResponse> {
    return this.channelService.create(user, createChannelDto);
  }

  @Get()
  @Public()
  public getAll(): Promise<Channel[]> {
    return this.channelService.getAll();
  }

  @Patch(':channelId')
  @ChannelOwner()
  public update(
    @ChannelFromRequest() channel: Channel,
    @Body() updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    return this.channelService.update(channel, updateChannelDto);
  }

  @Delete(':channelId')
  @ChannelOwner()
  public delete(
    @UserFromRequest() user: User,
    @ChannelFromRequest() channel: Channel,
    @Body() deleteChannelDto: DeleteChannelDto,
  ): Promise<StatusResponse> {
    return this.channelService.delete(user, channel, deleteChannelDto);
  }
}
