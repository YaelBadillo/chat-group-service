import { Body, Controller, Post } from '@nestjs/common';

import { UserFromRequest } from '../../common/decorators';
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
}
