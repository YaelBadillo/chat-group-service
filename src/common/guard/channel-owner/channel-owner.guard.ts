import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ContextType,
} from '@nestjs/common';

import { ChannelsService } from '../../services';
import { ParamsWithChannelId, ChannelOwnerRequest } from '../../interfaces';
import { Channel } from '../../../entities';
import { ChannelOwnerData, DataWithUser, SocketWithUser } from '../../types';

@Injectable()
export class ChannelOwnerGuard implements CanActivate {
  constructor(private readonly channelsService: ChannelsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const executionContextType: ContextType = context.getType<ContextType>();
    if (executionContextType === 'http') await this.httpVerify(context);

    if (executionContextType === 'ws') await this.wsVerify(context);

    return true;
  }

  private async httpVerify(context: ExecutionContext) {
    const request: ChannelOwnerRequest = context.switchToHttp().getRequest();

    const { channelId }: ParamsWithChannelId = request.params;
    const channel: Channel = await this.channelsService.findOneById(channelId);
    if (!channel) throw new BadRequestException('Channel does not exists');

    const { user }: ChannelOwnerRequest = request;
    if (user.id !== channel.ownerId)
      throw new UnauthorizedException('You are not the owner of this channel');

    request.channel = channel;
  }

  private async wsVerify(context: ExecutionContext) {
    const client: SocketWithUser = context.switchToWs().getClient();
    const data: ChannelOwnerData = context
      .switchToWs()
      .getData<ChannelOwnerData>();

    const channelId: string | string[] =
      data.channelId || client.handshake.query?.channelId;
    if (!channelId)
      throw new BadRequestException('Please provide a channel id');

    if (channelId instanceof Array<string>)
      throw new BadRequestException(
        'The userId query parameter should be a string',
      );

    const channel: Channel = await this.channelsService.findOneById(channelId);
    if (!channel) throw new BadRequestException('Channel does not exists');

    const { user }: DataWithUser = client.data;
    if (user.id !== channel.ownerId)
      throw new UnauthorizedException('You are not the owner of this channel');

    client.data.channel = channel;
  }
}
