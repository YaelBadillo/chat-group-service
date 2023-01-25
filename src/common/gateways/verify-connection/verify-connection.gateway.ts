import {
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Socket } from 'socket.io';

import { UsersService } from '../../services';
import { User } from '../../../entities';

@WebSocketGateway()
export class VerifyConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  protected logger: Logger;

  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly usersService: UsersService,
  ) {}

  public async handleConnection(client: Socket) {
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
  }

  public handleDisconnect(client: Socket): void {
    const user: User = client.data.user;
    delete client.data.user;
  }
}
