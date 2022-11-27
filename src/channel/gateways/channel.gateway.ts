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

@WebSocketGateway({ namespace: 'channel' })
export class ChannelGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly membersService: MembersService) {}

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

  public handleDisconnect(client: Socket) {}

  @SubscribeMessage('message')
  public handleMessage(
    @MessageBody() data: { channelId: string, content: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.channelId).emit(data.content)
  }
}
