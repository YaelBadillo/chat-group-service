import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Server } from 'socket.io';

import { MembersService, UsersService } from '../../common/services';
import { Channel } from '../../entities';
import { VerifyChannelConnectionGateway } from '../../common/gateways';

@WebSocketGateway({ namespace: 'channel' })
export class ChannelGateway
  extends VerifyChannelConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  protected readonly server: Server;

  constructor(
    readonly jwtService: JwtService,
    readonly configService: ConfigService,
    readonly usersService: UsersService,
    readonly membersService: MembersService,
  ) {
    super(jwtService, configService, usersService, membersService);
    this.logger = new Logger(ChannelGateway.name);
  }

  public notifyUpdateToEachActiveMembers(updatedChannel: Channel): void {
    const updatedChannelString: string = JSON.stringify(updatedChannel);
    this.server
      .to(updatedChannel.id)
      .emit('handleUpdate', updatedChannelString);
  }

  public notifyDeleteToEachActiveMembers(deletedChannel: Channel): void {
    const message: string = `The channel ${deletedChannel.name} was deleted`;
    this.server.to(deletedChannel.id).emit('handleDelete', message);
  }
}
