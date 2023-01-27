import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

import { RemoteSocket, Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

import { VerifyConnectionGateway } from '../verify-connection/verify-connection.gateway';
import { Member, User } from '../../../entities';
import { MembersService } from '../../services';
import { AddRoom } from './interfaces';

export abstract class VerifyChannelConnectionGateway
  extends VerifyConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect, AddRoom
{
  protected abstract readonly server: Server;
  protected abstract readonly membersService: MembersService;

  public async handleConnection(client: Socket): Promise<void> {
    await super.handleConnection(client);

    const user: User = client.data.user;
    const userMembers: Member[] = await this.membersService.getAllByUserId(
      user.id,
    );

    userMembers.forEach(({ channelId }) => client.join(channelId));
  }

  public async handleAddRoom(userId: string, channelId: string): Promise<void> {
    const socket: RemoteSocket<DefaultEventsMap, any> = await this.fetchUser(
      userId,
    );

    socket.join(channelId);
  }

  private async fetchUser(
    userId: string,
  ): Promise<RemoteSocket<DefaultEventsMap, any>> {
    const sockets: RemoteSocket<DefaultEventsMap, any>[] =
      await this.server.fetchSockets();

    return sockets.filter((socket) => socket.data.user.id === userId)[0];
  }
}
