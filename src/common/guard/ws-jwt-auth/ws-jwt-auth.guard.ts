import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../../services';
import { User } from '../../../entities';
import { SocketWithUser } from '../../types';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket: SocketWithUser = context.switchToWs().getClient();

    const token: string =
      socket.handshake.auth?.token || socket.handshake.headers?.token;
    if (!token) throw new UnauthorizedException('No token provided');

    let name: string;
    try {
      name = this.jwtService.verify<{ name: string }>(token, {
        ...this.configService.get<JwtModuleOptions>('jwt'),
      }).name;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    const user: User = await this.usersService.findOneByName(name);
    if (!user)
      throw new UnauthorizedException(
        'User does not exists, please authenticate',
      );

    socket.user = user;

    return true;
  }
}
