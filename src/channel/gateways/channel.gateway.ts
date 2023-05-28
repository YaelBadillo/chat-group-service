import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

import { MembersService, UsersService } from '../../common/services';
import { VerifyChannelConnectionGateway } from '../../common/gateways';
import { ServerToClientEvents } from '../interfaces';
import { SocketData } from '../../common/interfaces';

@WebSocketGateway({
  namespace: 'channel',
  cors: {
    origin: 'http://localhost:5173',
    allowedHeaders: ['access_token'],
    credentials: true,
  },
})
export class ChannelGateway extends VerifyChannelConnectionGateway {
  @WebSocketServer()
  protected readonly server: Server<
    DefaultEventsMap,
    ServerToClientEvents,
    DefaultEventsMap,
    SocketData
  >;
  protected readonly logger = new Logger(ChannelGateway.name);

  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly usersService: UsersService,
    protected readonly membersService: MembersService,
  ) {
    super();
  }
}
