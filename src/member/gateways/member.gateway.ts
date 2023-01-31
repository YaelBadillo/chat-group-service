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
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ServerToClientEvents } from '../interfaces';
import { SocketData } from '../../common/interfaces';

@WebSocketGateway({ namespace: 'member' })
export class MemberGateway
  extends VerifyConnectionGateway
  implements OnGatewayConnection
{
  @WebSocketServer()
  protected readonly server: Server<
    DefaultEventsMap,
    ServerToClientEvents,
    DefaultEventsMap,
    SocketData
  >;

  protected readonly logger = new Logger(MemberGateway.name);

  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly usersService: UsersService,
    private readonly membersService: MembersService,
  ) {
    super();
  }

  public async handleConnection(
    client: Socket<
      DefaultEventsMap,
      ServerToClientEvents,
      DefaultEventsMap,
      SocketData
    >,
  ) {
    await super.handleConnection(client);

    const user: User = client.data.user;

    client.join(user.id);
  }

  public sendInvitationsToEachActiveUser(invitations: Member[]): void {
    invitations.forEach((invitation) => {
      this.server.to(invitation.userId).emit('handleInvitation', invitation);
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

      this.server.to(member.userId).emit('handleNewMember', member);
    });
  }

  public async sendRequestToJoinToOwnerMembers(
    ownerId: string,
    requestToJoin: Member,
  ): Promise<void> {
    this.server.to(ownerId).emit('handleRequestToJoin', requestToJoin);
  }
}
