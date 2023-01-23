import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { BadRequestException } from '@nestjs/common';

import { Server, Socket } from 'socket.io';

import { MembersService, UsersService } from '../../common/services';
import { Member, User } from '../../entities';

@WebSocketGateway({ namespace: 'member' })
export class MemberGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly membersService: MembersService,
  ) {}

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

  public async notifyNewMemberToEachActiveMember(
    newMember: Member,
  ): Promise<void> {
    const members: Member[] = await this.membersService.findByChannelId(
      newMember.channelId,
    );
    members.forEach((member) => {
      if (member.id === newMember.id) return;

      const newMemberString: string = JSON.stringify(newMember);
      this.server.to(member.userId).emit('handleNewMember', newMemberString);
    });
  }

  public async sendRequestToJoinToOwnerMember(
    ownerId: string,
    requestToJoin: Member,
  ): Promise<void> {
    this.server.to(ownerId).emit('handleRequestToJoin', requestToJoin);
  }
}
