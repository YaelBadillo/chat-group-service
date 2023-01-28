import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Server, Socket } from 'socket.io';

import { MembersService, UsersService } from '../../common/services';
import { Member, User } from '../../entities';
import { VerifyConnectionGateway } from '../../common/gateways';

@WebSocketGateway({ namespace: 'member' })
export class MemberGateway extends VerifyConnectionGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server: Server;

  protected readonly logger = new Logger(MemberGateway.name);

  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly usersService: UsersService,
    private readonly membersService: MembersService,
  ) {
    super();
  }

  public async handleConnection(client: Socket) {
    await super.handleConnection(client);

    const user: User = client.data.user;

    client.join(user.id);
  }

  public sendInvitationsToEachActiveUser(invitations: Member[]): void {
    invitations.forEach((invitation) => {
      const invitationString: string = JSON.stringify(invitation);
      this.server
        .to(invitation.userId)
        .emit('handleInvitation', invitationString);
    });
  }

  public async notifyNewMemberToEachActiveMembers(
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

  public async sendRequestToJoinToOwnerMembers(
    ownerId: string,
    requestToJoin: Member,
  ): Promise<void> {
    this.server.to(ownerId).emit('handleRequestToJoin', requestToJoin);
  }
}
