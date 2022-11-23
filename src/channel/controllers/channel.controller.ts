import { Body, Controller, Get, Post } from '@nestjs/common';

import { Public, UserFromRequest } from '../../common/decorators';
import { ChannelService } from '../services';
import { Channel, User } from '../../entities';
import { CreateChannelDto } from '../dto';

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
}
