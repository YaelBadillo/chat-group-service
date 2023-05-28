import {
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

import { UsersService } from '../../services';
import { User } from '../../../entities';
import { NotifyEachClient } from './interfaces';
import { SocketData } from '../../interfaces';

export abstract class VerifyConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect, NotifyEachClient
{
  protected abstract readonly server: Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    SocketData
  >;
  protected abstract readonly logger: Logger;
  protected abstract readonly jwtService: JwtService;
  protected abstract readonly configService: ConfigService;
  protected abstract readonly usersService: UsersService;

  public async handleConnection(
    client: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      SocketData
    >,
  ) {
    const token: string =
      client.handshake.auth?.token ||
      (client.handshake.headers?.cookie &&
        client.handshake.headers.cookie.split('=')[1]);
    //client.handshake.auth?.token || client.handshake.headers?.token;
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

    this.logger.log(`User ${user.id} connected`);
  }

  public handleDisconnect(
    client: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      SocketData
    >,
  ): void {
    delete client.data.user;
  }

  public async notifyEachActiveClientOfARoom(
    room: string,
    eventName: string,
    ...args: unknown[]
  ): Promise<void> {
    this.server.to(room).emit(eventName, ...args);
  }
}
