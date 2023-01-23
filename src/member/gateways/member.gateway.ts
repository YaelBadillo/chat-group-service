import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import {
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Server, Socket } from 'socket.io';

import { MembersService, UsersService } from '../../common/services';
import { Member, User } from '../../entities';

@WebSocketGateway({ namespace: 'member' })
export class MemberGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MemberGateway.name);

  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly membersService: MembersService,
  ) {}

  public async handleConnection(client: Socket) {
    const token: string =
      client.handshake.auth?.token || client.handshake.headers?.token;
    if (!token) throw new UnauthorizedException('No token provided');

    let name: string;
    try {
      name = this.jwtService.verify<{ name: string }>(token, {
        ...this.configService.get<JwtModuleOptions>('jwt'),
      }).name;
    } catch (error) {
      this.logger.error('Invalid token');
      client.emit('validation', 'Invalid token');
      client.disconnect();
      return;
    }

    const user: User = await this.usersService.findOneByName(name);
    if (!user)
      throw new BadRequestException(
        'User does not exists, please authenticate',
      );

    client.data.user = user;

    client.join(user.id);
  }

  public handleDisconnect(client: Socket): void {
    const user: User = client.data.user;

    delete client.data.user;

    client.leave(user.id);
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
