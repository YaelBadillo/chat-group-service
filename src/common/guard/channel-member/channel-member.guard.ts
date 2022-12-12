import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ContextType,
} from '@nestjs/common';

import { ChannelsService } from '../../services';
import { ParamsWithChannelId, ChannelOwnerRequest } from '../../interfaces';
import { Channel } from '../../../entities';
import { ChannelOwnerData, ChannelOwnerSocket } from '../../types';

@Injectable()
export class ChannelMemberGuard implements CanActivate {
  constructor(private readonly channelsService: ChannelsService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
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

    request.channel = channel;
  }

  private async wsVerify(context: ExecutionContext) {
    const client: ChannelOwnerSocket = context.switchToWs().getClient();
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

    client.channel = channel;
  }
}
