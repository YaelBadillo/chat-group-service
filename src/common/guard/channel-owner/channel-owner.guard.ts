import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ContextType,
  UnauthorizedException,
} from '@nestjs/common';

import { ChannelOwnerRequest } from '../../interfaces';
import { ChannelOwnerSocket } from '../../types';
import { User, Channel } from '../../../entities';

@Injectable()
export class ChannelOwnerGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const executionContextType: ContextType = context.getType<ContextType>();

    let user: User;
    let channel: Channel;

    if (executionContextType === 'http') {
      const request: ChannelOwnerRequest = context.switchToHttp().getRequest();
      user = request.user;
      channel = request.channel;
    }

    if (executionContextType === 'ws') {
      const client: ChannelOwnerSocket = context.switchToWs().getClient();
      user = client.user;
      channel = client.channel;
    }

    if (user.id !== channel.ownerId)
      throw new UnauthorizedException('You are not the owner of this channel');

    return true;
  }
}
