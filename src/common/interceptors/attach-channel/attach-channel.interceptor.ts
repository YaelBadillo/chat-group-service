import {
  CallHandler,
  ContextType,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common';

import { Observable } from 'rxjs';

import { SocketWithChannel, DataWithChannelId } from '../../types';
import { ChannelsService } from '../../services';
import { Channel } from '../../../entities';

@Injectable()
export class AttachChannelInterceptor implements NestInterceptor {
  constructor(private readonly channelsService: ChannelsService) {}

  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const contextType: ContextType = context.getType();
    if (contextType === 'ws') await this.wsIntercept(context);

    return next.handle();
  }

  private async wsIntercept(context: ExecutionContext): Promise<void> {
    const client: SocketWithChannel = context
      .switchToWs()
      .getClient<SocketWithChannel>();
    const { channelId }: DataWithChannelId = context
      .switchToWs()
      .getData<DataWithChannelId>();

    const channel: Channel = await this.channelsService.findOneById(channelId);
    if (!channel)
      throw new BadRequestException(
        'There is no channel with the given channel id',
      );

    client.channel = channel;
  }
}
