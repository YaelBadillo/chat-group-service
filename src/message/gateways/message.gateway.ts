import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection } from '@nestjs/websockets';
import { BadRequestException } from '@nestjs/common';

import { Socket } from 'socket.io';

import { MessageService } from '../services';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MembersService } from '../../common/services';
import { Member } from '../../entities';

@WebSocketGateway()
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
  create(@MessageBody() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
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
