import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { BadRequestException } from '@nestjs/common';

import { Server, Socket } from 'socket.io';

import { MemberService } from '../services';
import { CreateInvitationsDto } from '../dto';
import { UsersService } from '../../common/services';
import { Member, User } from '../../entities';
import { WsJwtAuth } from '../../common/decorators';

@WebSocketGateway({ namespace: 'member' })
export class MemberGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly memberService: MemberService,
    private readonly usersService: UsersService,
  ) {}

  public async handleConnection(client: Socket) {
    console.log('aaa');
    const userId: string | string[] = client.handshake.query?.userId;
    if (!userId) throw new BadRequestException('Please provide a user id');

    if (userId instanceof Array<string>)
      throw new BadRequestException(
        'The userId query parameter should be a string',
      );

    const user: User = await this.usersService.findOneById(userId);
    if (!user)
      throw new BadRequestException(
        `There is no user with the user id ${userId}`,
      );

    client.join(userId);
  }

  @SubscribeMessage('createInvitations')
  @WsJwtAuth()
  public async createInvitations(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    createInvitationsDto: CreateInvitationsDto,
  ): Promise<void> {
    const { id: userId }: User = client.data.user;

    const invitations: Member[] = await this.memberService.createInvitations(
      userId,
      createInvitationsDto,
    );

    invitations.forEach((invitation) => {
      const invitationString: string = JSON.stringify(invitation);
      client.to(invitation.userId).emit('invitation', invitationString);
    });
  }
}
