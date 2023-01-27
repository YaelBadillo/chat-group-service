import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Socket } from 'socket.io';

import { VerifyConnectionGateway } from '../verify-connection/verify-connection.gateway';
import { Member, User } from '../../../entities';
import { UsersService, MembersService } from '../../services';

@WebSocketGateway()
export class VerifyChannelConnectionGateway
  extends VerifyConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly usersService: UsersService,
    protected readonly membersService: MembersService,
  ) {
    super(jwtService, configService, usersService);
  }

  public async handleConnection(client: Socket): Promise<void> {
    await super.handleConnection(client);

    const user: User = client.data.user;
    const userMembers: Member[] = await this.membersService.getAllByUserId(
      user.id,
    );

    userMembers.forEach(({ channelId }) => client.join(channelId));
  }
}
