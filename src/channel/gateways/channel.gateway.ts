import {
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Server, Socket } from 'socket.io';

import { MembersService, UsersService } from '../../common/services';
import { Channel, Member, User } from '../../entities';

@WebSocketGateway({ namespace: 'channel' })
export class ChannelGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChannelGateway.name);

  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly membersService: MembersService,
  ) {}

  public async handleConnection(client: Socket): Promise<void> {
    const token: string =
      client.handshake.auth?.token || client.handshake.headers?.token;
    if (!token) throw new UnauthorizedException('No token provided');

    let name: string;
    try {
      name = this.jwtService.verify<{ name: string }>(token, {
        ...this.configService.get<JwtModuleOptions>('jwt'),
      }).name;
    } catch (error) {
      this.logger.error('Invalid token');
      client.emit('validation', 'Invalid token');
      client.disconnect();
      return;
    }

    const user: User = await this.usersService.findOneByName(name);
    if (!user)
      throw new BadRequestException(
        'User does not exists, please authenticate',
      );

    client.data.user = user;

    const userMembers: Member[] = await this.membersService.getAllByUserId(
      user.id,
    );

    userMembers.forEach((userMember) => client.join(userMember.channelId));
  }

  public async handleDisconnect(client: Socket): Promise<void> {
    const user: User = client.data.user;

    delete client.data.user;

    const userMembers: Member[] = await this.membersService.getAllByUserId(
      user.id,
    );
    userMembers.forEach((userMember) => client.leave(userMember.channelId));
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
