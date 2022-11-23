import { CanActivate, ExecutionContext, Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';

import { ChannelsService } from '../../services';

import { ParamsWithChannelId, ChannelOwnerRequest } from '../../interfaces';
import { Channel } from '../../../entities';

@Injectable()
export class ChannelOwnerGuard implements CanActivate {
  constructor(private readonly channelsService: ChannelsService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request: ChannelOwnerRequest = context.switchToHttp().getRequest();

    const { channelId }: ParamsWithChannelId = request.params;
    const channel: Channel = await this.channelsService.findOneById(channelId);
    if (!channel) 
      throw new BadRequestException('Channel does not exists');

    const { user }: ChannelOwnerRequest = request;
    if (user.id !== channel.ownerId) 
      throw new UnauthorizedException('You are not the owner of this channel')
    
    request.channel = channel;

    return true;
  }
}
