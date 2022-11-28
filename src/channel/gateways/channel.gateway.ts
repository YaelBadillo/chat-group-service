import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { BadRequestException } from '@nestjs/common';

import { Socket } from 'socket.io';

import { MembersService } from '../../common/services';
import { Member } from '../../entities';
import { WsJwtAuth } from '../../common/decorators';
import { HandleMessageDto } from '../dto';
import { ChannelService } from '../services';

@WebSocketGateway({ namespace: 'channel' })
export class ChannelGateway
  implements OnGatewayConnection
{
  constructor(
    private readonly membersService: MembersService) {}

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

  @SubscribeMessage('message')
  @WsJwtAuth()
  public async handleMessage(
    @MessageBody() handleMessageDto: HandleMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = { 
      content: handleMessageDto.content, 
      userName: client.data.user.name 
    };

    client.to(handleMessageDto.channelId).emit(JSON.stringify(message));
  }
}
