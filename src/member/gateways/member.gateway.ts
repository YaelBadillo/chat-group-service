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

import { UsersService } from '../../common/services';
import { Member, User } from '../../entities';
import { AttachChannel, WsJwtAuth } from '../../common/decorators';
import { SocketWithUserAndChannel } from '../../common/types';

@WebSocketGateway({ namespace: 'member' })
export class MemberGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly usersService: UsersService) {}

  public async handleConnection(client: Socket) {
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

  public sendInvitationsToEachActiveUser(invitations: Member[]): void {
    invitations.forEach((invitation) => {
      const invitationString: string = JSON.stringify(invitation);
      this.server
        .to(invitation.userId)
        .emit('handleInvitation', invitationString);
    });
  }

  @SubscribeMessage('acceptInvitation')
  @AttachChannel()
  @WsJwtAuth()
  public async acceptInvitation(
    @ConnectedSocket() client: SocketWithUserAndChannel,
    @MessageBody() acceptInvitationDto,
  ): Promise<void> {}

  public async sendRequestToJoinToOwnerMember(
    ownerId: string,
    requestToJoin: Member,
  ): Promise<void> {
    this.server.to(ownerId).emit('handleRequestToJoin', requestToJoin);
  }
}
