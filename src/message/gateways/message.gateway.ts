import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets';
import { BadRequestException } from '@nestjs/common';

import { Socket } from 'socket.io';

import { MessageService } from '../services';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MembersService } from '../../common/services';
import { Member, Message } from '../../entities';
import { WsJwtAuth } from '../../common/decorators';

@WebSocketGateway({ namespace: 'message' })
export class MessageGateway implements OnGatewayConnection {
  constructor(
    private readonly messageService: MessageService,
    private readonly membersService: MembersService,
  ) {}

  public async handleConnection(client: Socket): Promise<void> {
    const userId: string | string[] = client.handshake.query?.userId;
    if (!userId) throw new BadRequestException('Please provide a user id');

    if (userId instanceof Array<string>)
      throw new BadRequestException(
        'The userId query parameter should be a string',
      );

    const userMembers: Member[] = await this.membersService.getAllByUserId(
      userId,
    );

    userMembers.forEach((userMember) => client.join(userMember.channelId));
  }

  @SubscribeMessage('createMessage')
  @WsJwtAuth()
  public async create(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const message: Message = await this.messageService.create(createMessageDto);
    const messageString: string = JSON.stringify(message);

    client.to(createMessageDto.channelId).emit(messageString);
  }

  @SubscribeMessage('findAllMessage')
  findAll() {
    return this.messageService.findAll();
  }

  @SubscribeMessage('findOneMessage')
  findOne(@MessageBody() id: number) {
    return this.messageService.findOne(id);
  }

  @SubscribeMessage('updateMessage')
  update(@MessageBody() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(updateMessageDto.id, updateMessageDto);
  }

  @SubscribeMessage('removeMessage')
  remove(@MessageBody() id: number) {
    return this.messageService.remove(id);
  }
}
