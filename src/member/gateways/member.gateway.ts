import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

import { MembersService, UsersService } from '../../common/services';
import { Member, User } from '../../entities';
import { VerifyConnectionGateway } from '../../common/gateways';
import { ServerToClientEvents } from '../interfaces';
import { SocketData } from '../../common/interfaces';

@WebSocketGateway({
  namespace: 'member',
  cors: {
    origin: 'http://localhost:5173',
    allowedHeaders: ['access_token'],
    credentials: true,
  },
})
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
      this.notifyEachActiveClientOfARoom(
        invitation.userId,
        'handleInvitation',
        invitation,
      );
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

      this.notifyEachActiveClientOfARoom(
        member.userId,
        'handleNewMember',
        member,
      );
    });
  }
}
