import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Server, Socket } from 'socket.io';

import { MessageService } from '../services';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MembersService, UsersService } from '../../common/services';
import { Message } from '../../entities';
import { WsJwtAuth } from '../../common/decorators';
import { VerifyChannelConnectionGateway } from '../../common/gateways';

@WebSocketGateway({ namespace: 'message' })
export class MessageGateway
  extends VerifyChannelConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  protected readonly server: Server;

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
    const messageString: string = JSON.stringify(message);

    client.to(createMessageDto.channelId).emit('handleMessage', messageString);
  }

  public notifyDeleteToEachActiveMember(
    channelId: string,
    messageId: string,
  ): void {
    this.server.to(channelId).emit('handleDeletedChannel', messageId);
  }
}
