import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

import { MessageService } from '../services';
import { CreateMessageDto } from '../dto';
import { MembersService, UsersService } from '../../common/services';
import { Message } from '../../entities';
import { WsJwtAuth } from '../../common/decorators';
import { VerifyChannelConnectionGateway } from '../../common/gateways';
import { ClientToServerEvents, ServerToClientEvents } from '../interfaces';
import { SocketData } from '../../common/interfaces';

@WebSocketGateway({
  namespace: 'message',
  cors: {
    origin: 'http://localhost:5173',
    allowedHeaders: ['access_token'],
    credentials: true,
  },
})
export class MessageGateway extends VerifyChannelConnectionGateway {
  @WebSocketServer()
  protected readonly server: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    SocketData
  >;

  protected readonly logger = new Logger(MessageGateway.name);

  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly usersService: UsersService,
    protected readonly membersService: MembersService,
    private readonly messageService: MessageService,
  ) {
    super();
  }

  @SubscribeMessage('createMessage')
  @WsJwtAuth()
  public async create(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const message: Message = await this.messageService.create(createMessageDto);

    client.to(createMessageDto.channelId).emit('handleMessage', message);
  }
}
